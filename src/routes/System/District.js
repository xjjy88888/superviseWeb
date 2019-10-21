import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { createForm } from 'rc-form';
import Systems from '../../components/Systems';
import {
  Form,
  Icon,
  Input,
  Button,
  Table,
  Select,
  message,
  Tree,
  Typography,
  Layout,
  Modal,
  notification
} from 'antd';
import Highlighter from 'react-highlight-words';

const { Sider, Content } = Layout;
const { Title } = Typography;

let self;

@connect(({ district }) => ({ district }))
@createForm()
export default class area extends PureComponent {
  state = {
    visible: false,
    selectedRows: [],
    id: null,
    districtList: [],
    ParentId: null,
    loading: false
  };

  componentDidMount() {
    self = this;
    this.districtTreeFilter();
  }

  districtTreeFilter = () => {
    const { dispatch } = this.props;
    const { ParentId } = this.state;
    self.setState({ loading: true });
    dispatch({
      type: 'district/districtTree',
      payload: {
        IsFilter: true
      },
      callback: (success, error, result) => {
        self.setState({ loading: false });
        if (success) {
          this.getDistrictList(ParentId, [result]);
        }
      }
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

  getDistrictList = (v, list) => {
    const {
      district: { districtTreeFilter }
    } = this.props;
    const items = this.find(v, list || districtTreeFilter);
    this.setState({
      districtList: (items || []).map(i => {
        return { ...i, children: null };
      })
    });
  };

  find = (v, list) => {
    let data;
    (list || []).map(i => {
      if (i.value === v) {
        data = i.children;
      } else {
        const child = this.find(v, i.children);
        if (child) {
          data = child;
        }
      }
    });
    return data;
  };

  render() {
    const {
      dispatch,
      form: { getFieldDecorator, resetFields },
      district: { districtTreeFilter }
    } = this.props;

    const {
      visible,
      selectedRows,
      id,
      districtList,
      ParentId,
      loading
    } = this.state;

    const dataSource = districtList.map(item => {
      return { ...item, key: item.id };
    });

    const columns = [
      {
        title: '行政区名称',
        dataIndex: 'label',
        sorter: (a, b) => a.label.length - b.label.length,
        ...this.getColumnSearchProps('label')
      },
      {
        title: '行政区编码',
        dataIndex: 'code',
        sorter: (a, b) => a.code - b.code,
        ...this.getColumnSearchProps('code')
      },
      {
        title: '备注',
        dataIndex: 'description',
        sorter: (a, b) => a.description.length - b.description.length,
        ...this.getColumnSearchProps('description')
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
                  parentId: ParentId,
                  name: record.label,
                  code: record.code,
                  description: record.description
                });
                this.setState({
                  visible: true,
                  id: record.value
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
                    self.setState({ loading: true });
                    dispatch({
                      type: 'district/districtDelete',
                      payload: record.value,
                      callback: (success, error, result) => {
                        self.setState({ loading: false });
                        if (success) {
                          self.setState({
                            visible: false
                          });
                          self.districtTreeFilter();
                        }
                        notification[success ? 'success' : 'error']({
                          message: `删除1条行政区划数据${
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
            width={300}
            theme="light"
          >
            <Tree.DirectoryTree
              multiple
              onSelect={(keys, event) => {
                console.log(keys);
                this.setState({ ParentId: keys[0] });
                this.getDistrictList(keys[0]);
              }}
            >
              {districtTreeFilter.map(item => (
                <Tree.TreeNode title={item.label} key={item.value}>
                  {(item.children || []).map(ite => (
                    <Tree.TreeNode title={ite.label} key={ite.value}>
                      {(ite.children || []).map(it => (
                        <Tree.TreeNode title={it.label} key={it.value}>
                          {(it.children || []).map(i => (
                            <Tree.TreeNode
                              title={i.label}
                              key={i.value}
                              isLeaf={!i.children}
                            >
                              {(i.children || []).map(j => (
                                <Tree.TreeNode
                                  title={j.label}
                                  key={j.value}
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
                      message.warning('请选择需要删除的行政区');
                      return;
                    }
                    console.log(selectedRows);
                    Modal.confirm({
                      title: '删除',
                      content: '是否确定要删除',
                      okText: '是',
                      cancelText: '否',
                      okType: 'danger',
                      onOk() {
                        self.setState({ loading: true });
                        dispatch({
                          type: 'district/districtDeleteMul',
                          payload: { id: selectedRows.map(item => item.value) },
                          callback: (success, error, result) => {
                            self.setState({ loading: false });
                            if (success) {
                              self.setState({
                                visible: false
                              });
                              self.districtTreeFilter();
                            }
                            notification[success ? 'success' : 'error']({
                              message: `删除${l}条行政区划数据${
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
              dataSource={dataSource}
              rowSelection={rowSelection}
              loading={loading}
            />
            <Modal
              title="新建行政区"
              visible={visible}
              onOk={() => {
                this.props.form.validateFields((err, v) => {
                  console.log('新建行政区', v);
                  if (!v.name) {
                    message.warning('请填写行政区名称');
                    return;
                  }
                  if (!v.code) {
                    message.warning('请填写行政区编码');
                    return;
                  }
                  self.setState({ loading: true });
                  dispatch({
                    type: 'district/districtCreateUpdate',
                    payload: { ...v, id: id, parentId: ParentId },
                    callback: (success, error, result) => {
                      self.setState({ loading: false });
                      if (success) {
                        this.setState({
                          visible: false
                        });
                        notification['success']({
                          message: `${id ? '编辑' : '新建'}行政区划成功`
                        });
                        this.districtTreeFilter();
                      } else {
                        notification['error']({
                          message: `${id ? '编辑' : '新建'}行政区划失败：${
                            error.message
                          }`
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
                layout="inline"
                style={{ textAlign: 'center' }}
              >
                <Form.Item
                  label={
                    <span>
                      <b style={{ color: 'red' }}>*</b>行政区名称
                    </span>
                  }
                  hasFeedback
                >
                  {getFieldDecorator('name', {})(<Input />)}
                </Form.Item>
                <Form.Item
                  label={
                    <span>
                      <b style={{ color: 'red' }}>*</b>行政区编码
                    </span>
                  }
                  hasFeedback
                >
                  {getFieldDecorator('code', {})(<Input />)}
                </Form.Item>
                <Form.Item
                  label={
                    <span>
                      <b style={{ color: '#fff' }}>*</b>行政区备注
                    </span>
                  }
                  hasFeedback
                >
                  {getFieldDecorator('description', {})(
                    <Input.TextArea autosize style={{ width: 180 }} />
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
