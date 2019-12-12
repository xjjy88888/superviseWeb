/* eslint-disable array-callback-return */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { createForm } from 'rc-form';
import Systems from '../../components/Systems';
import MustFill from '../../components/MustFill';
import Highlighter from 'react-highlight-words';
import {
  Form,
  Icon,
  Input,
  Button,
  Table,
  message,
  Tree,
  Typography,
  Layout,
  Modal,
  notification,
  Cascader
} from 'antd';

const { Sider, Content } = Layout;
const { Title } = Typography;

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 15 }
};

let self;

@connect(({ departs, district }) => ({ departs, district }))
@createForm()
export default class departs extends PureComponent {
  state = {
    visible: false,
    selectedRows: [],
    id: null,
    pagination: {},
    loading: false,
    dataSource: [],
    ParentId: null,
    ParentCodeId: null
  };

  componentDidMount() {
    self = this;
    this.departsTree();
    this.districtTree();
  }

  districtTree = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'district/districtTree',
      payload: {
        IsFilter: true
      }
    });
  };

  find = (v, list) => {
    let data;
    (list || []).map(i => {
      if (i.value === v) {
        data = [i];
      } else {
        const child = this.find(v, i.children);
        if (child) {
          data = child;
        }
      }
    });
    // console.log(v, list, data);
    return data;
  };

  refresh = () => {
    const { ParentId } = this.state;
    this.departsList({ SkipCount: 0, MaxResultCount: 10, ParentId });
    this.departsTree();
  };

  departsTree = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'departs/departsTree',
      payload: { IsFilter: true }
    });
  };

  departsList = payload => {
    const { dispatch } = this.props;
    this.setState({ loading: true });
    dispatch({
      type: 'departs/departsList',
      payload,
      callback: (success, error, result) => {
        const pagination = { ...this.state.pagination };
        pagination.total = result.totalCount;
        this.setState({
          pagination,
          loading: false,
          dataSource: result.items.map((item, index) => {
            return {
              ...item,
              key: index
            };
          })
        });
      }
    });
  };

  handleTableChange = (pagination, filters, sorter) => {
    const { ParentId } = this.state;
    this.setState({
      pagination: pagination
    });
    this.departsList({
      SkipCount: (pagination.current - 1) * pagination.pageSize,
      MaxResultCount: pagination.pageSize,
      Name: filters.name,
      ParentId: ParentId
    });
  };

  getColumnSearchProps = dataIndex => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters
    }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={node => {
            this.searchInput = node;
          }}
          value={selectedKeys[0]}
          onChange={e =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => this.handleSearch(selectedKeys, confirm)}
          style={{ width: 188, marginBottom: 8, display: 'block' }}
        />
        <Button
          type="primary"
          onClick={() => this.handleSearch(selectedKeys, confirm)}
          icon="search"
          size="small"
          style={{ width: 90, marginRight: 8 }}
        >
          查询
        </Button>
        <Button
          onClick={() => this.handleReset(clearFilters)}
          size="small"
          style={{ width: 90 }}
        >
          重置
        </Button>
      </div>
    ),
    filterIcon: filtered => (
      <Icon type="search" style={{ color: filtered ? '#1890ff' : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex]
        .toString()
        .toLowerCase()
        .includes(value.toLowerCase()),
    onFilterDropdownVisibleChange: visible => {
      if (visible) {
        setTimeout(() => this.searchInput.select());
      }
    },
    render: text => (
      <Highlighter
        highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
        searchWords={[this.state.searchText]}
        autoEscape
        textToHighlight={text.toString()}
      />
    )
  });

  handleSearch = (selectedKeys, confirm) => {
    confirm();
    this.setState({ searchText: selectedKeys[0] });
  };

  handleReset = clearFilters => {
    clearFilters();
    this.setState({ searchText: '' });
  };
  render() {
    const {
      dispatch,
      form: { getFieldDecorator, resetFields, setFieldsValue, validateFields },
      departs: { departsTreeFilter },
      district: { districtTree, districtTreeFilter }
    } = this.props;

    const {
      visible,
      selectedRows,
      id,
      dataSource,
      pagination,
      loading,
      ParentCodeId,
      ParentId
    } = this.state;

    const columns = [
      {
        title: '部门名',
        dataIndex: 'name',
        sorter: (a, b) => a.name.length - b.name.length,
        ...this.getColumnSearchProps('name')
      },
      {
        title: '上级部门',
        dataIndex: 'parentName',
        sorter: (a, b) => a.name.length - b.name.length,
        ...this.getColumnSearchProps('name')
      },
      {
        title: '操作',
        key: 'operation',
        render: (item, record) => (
          <span>
            <a
              style={{ marginRight: 20 }}
              onClick={() => {
                console.log(record);
                this.props.form.setFieldsValue({
                  parentId: record.parent_id,
                  name: record.name,
                  code: record.code,
                  description: record.description
                });
                this.setState({
                  visible: true,
                  id: record.id
                });
                setFieldsValue({
                  districtCodeId: [
                    this.find(ParentCodeId, districtTree)[0].value,
                    record.districtCodeId
                  ]
                });
              }}
            >
              编辑
            </a>
            <a
              onClick={() => {
                Modal.confirm({
                  title: '删除',
                  content: '是否确定要删除',
                  okText: '是',
                  cancelText: '否',
                  okType: 'danger',
                  onOk() {
                    dispatch({
                      type: 'departs/departsDelete',
                      payload: record.id,
                      callback: (success, error, result) => {
                        if (success) {
                          self.setState({
                            visible: false
                          });
                          self.refresh();
                        }
                        notification[success ? 'success' : 'error']({
                          message: `删除${success ? '成功' : '失败'}`
                        });
                      }
                    });
                  },
                  onCancel() {}
                });
              }}
            >
              删除
            </a>
          </span>
        )
      }
    ];

    const rowSelection = {
      onChange: (selectedRowKeys, selectedRows) => {
        console.log(selectedRows);
        this.setState({ selectedRows: selectedRows });
      }
    };

    return (
      <Systems>
        <Layout>
          <Sider
            style={{
              borderRadius: '10px 0 0 0',
              height: window.innerHeight - 150,
              overflow: 'auto'
            }}
            width={400}
            theme="light"
          >
            <Tree.DirectoryTree
              multiple
              onSelect={(v, e) => {
                // console.log(v[0], e.selectedNodes[0].props.districtCodeId);
                const d = e.selectedNodes[0].props.districtCodeId;
                console.log(`ParentCodeId`, d + '', districtTreeFilter);
                console.log(this.find(d + '', districtTreeFilter));
                this.setState({
                  ParentId: v[0],
                  ParentCodeId: d
                });
                this.departsList({
                  SkipCount: 0,
                  MaxResultCount: 10,
                  ParentId: v[0]
                });
              }}
            >
              {departsTreeFilter.map(item => (
                <Tree.TreeNode
                  title={item.label}
                  key={item.value}
                  districtCodeId={item.districtCodeId}
                >
                  {(item.children || []).map(ite => (
                    <Tree.TreeNode
                      title={ite.label}
                      key={ite.value}
                      districtCodeId={ite.districtCodeId}
                    >
                      {(ite.children || []).map(it => (
                        <Tree.TreeNode
                          title={it.label}
                          key={it.value}
                          districtCodeId={it.districtCodeId}
                        >
                          {(it.children || []).map(i => (
                            <Tree.TreeNode
                              title={i.label}
                              key={i.value}
                              districtCodeId={i.districtCodeId}
                            >
                              {(i.children || []).map(j => (
                                <Tree.TreeNode
                                  title={j.label}
                                  key={j.value}
                                  districtCodeId={j.districtCodeId}
                                  isLeaf
                                />
                              ))}
                            </Tree.TreeNode>
                          ))}
                        </Tree.TreeNode>
                      ))}
                    </Tree.TreeNode>
                  ))}
                </Tree.TreeNode>
              ))}
            </Tree.DirectoryTree>
          </Sider>
          <Content
            style={{
              borderRadius: '0 10px 0 0',
              background: '#fff'
            }}
          >
            <Title level={4}>
              <span>
                <Button
                  icon="plus"
                  disabled={!ParentId}
                  style={{ margin: 10 }}
                  onClick={() => {
                    resetFields();
                    this.setState({
                      visible: true,
                      id: null
                    });
                  }}
                >
                  新建
                </Button>
                <Button
                  icon="delete"
                  disabled={!selectedRows.length}
                  style={{ margin: 10 }}
                  onClick={() => {
                    const l = selectedRows.length;
                    if (l === 0) {
                      message.warning('请选择需要删除的部门');
                      return;
                    }
                    Modal.confirm({
                      title: '删除',
                      content: '是否确定要删除',
                      okText: '是',
                      cancelText: '否',
                      okType: 'danger',
                      onOk() {
                        dispatch({
                          type: 'departs/departsDeleteMul',
                          payload: { id: selectedRows.map(item => item.id) },
                          callback: (success, error, result) => {
                            if (success) {
                              self.setState({
                                visible: false,
                                selectedRows: []
                              });
                              self.refresh();
                            }
                            notification[success ? 'success' : 'error']({
                              message: `删除${l}条部门划数据${
                                success ? '成功' : '失败'
                              }${success ? '' : `：${error.message}`}`
                            });
                          }
                        });
                      },
                      onCancel() {}
                    });
                  }}
                >
                  删除
                </Button>
              </span>
            </Title>
            <Table
              columns={columns}
              rowSelection={rowSelection}
              rowKey={record => record.id}
              dataSource={dataSource}
              pagination={pagination}
              loading={loading}
              onChange={this.handleTableChange}
            />
            <Modal
              width={`50%`}
              height={`50%`}
              title={`${id ? `编辑` : `新建`}部门`}
              visible={visible}
              onOk={() => {
                // submit
                validateFields((err, v) => {
                  console.log('新建编辑部门', v);
                  const d = v.districtCodeId;
                  if (!v.name) {
                    message.warning('请填写部门名');
                    return;
                  }
                  if (!d) {
                    message.warning('请选择行政区划');
                    return;
                  }
                  dispatch({
                    type: 'departs/departsCreateUpdate',
                    payload: {
                      ...v,
                      id: id,
                      districtCodeId: d[d.length - 1],
                      ParentId
                    },
                    callback: success => {
                      if (success) {
                        this.refresh();
                        this.setState({
                          visible: false
                        });
                      }
                    }
                  });
                });
              }}
              onCancel={() => {
                this.setState({
                  visible: false
                });
              }}
            >
              <Form
                onSubmit={this.handleSubmit}
                style={{ textAlign: 'center', width: `100%`, height: `100%` }}
              >
                <Form.Item
                  {...formItemLayout}
                  label={
                    <span>
                      部门名
                      <MustFill />
                    </span>
                  }
                  hasFeedback
                >
                  {getFieldDecorator('name', {})(<Input />)}
                </Form.Item>
                <Form.Item
                  label={
                    <span>
                      行政区划
                      <MustFill />
                    </span>
                  }
                  {...formItemLayout}
                >
                  {getFieldDecorator('districtCodeId', {})(
                    <Cascader
                      showSearch
                      options={this.find(ParentCodeId + '', districtTreeFilter)}
                      changeOnSelect
                      placeholder="请选择所在地区"
                    />
                  )}
                </Form.Item>
              </Form>
            </Modal>
          </Content>
        </Layout>
      </Systems>
    );
  }
}
