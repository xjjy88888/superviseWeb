import React, { PureComponent } from "react";
import { connect } from "dva";
import { createForm } from "rc-form";
import Systems from "../../components/Systems";
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
} from "antd";
import Highlighter from "react-highlight-words";

const { Sider, Content } = Layout;
const { Title } = Typography;

let self;

@connect(({ departs }) => ({ departs }))
@createForm()
export default class area extends PureComponent {
  state = {
    visible: false,
    selectedRows: [],
    id: null,
    pagination: {},
    loading: false,
    dataSource: []
  };

  componentDidMount() {
    self = this;
    this.departsTree();
    this.departsList({ SkipCount: 0, MaxResultCount: 10 });
  }

  departsTree = () => {
    const { dispatch } = this.props;
    dispatch({
      type: "departs/departsTree"
    });
  };

  departsList = payload => {
    const { dispatch } = this.props;
    this.setState({ loading: true });
    dispatch({
      type: "departs/departsList",
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
    this.setState({
      pagination: pagination
    });
    this.departsList({
      SkipCount: (pagination.current - 1) * pagination.pageSize,
      MaxResultCount: pagination.pageSize,
      Name: filters.name
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
          style={{ width: 188, marginBottom: 8, display: "block" }}
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
      <Icon type="search" style={{ color: filtered ? "#1890ff" : undefined }} />
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
    }
    // render: text => (
    //   <Highlighter
    //     highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
    //     searchWords={[this.state.searchText]}
    //     autoEscape
    //     textToHighlight={text.toString()}
    //   />
    // )
  });

  handleSearch = (selectedKeys, confirm) => {
    confirm();
    this.setState({ searchText: selectedKeys[0] });
  };

  handleReset = clearFilters => {
    clearFilters();
    this.setState({ searchText: "" });
  };
  render() {
    const {
      dispatch,
      form: { getFieldDecorator, resetFields },
      departs: { departsTree, departsList }
    } = this.props;

    const {
      visible,
      selectedRows,
      id,
      dataSource,
      pagination,
      loading
    } = this.state;

    const columns = [
      {
        title: "单位名",
        dataIndex: "name",
        sorter: (a, b) => a.name.length - b.name.length,
        ...this.getColumnSearchProps("name")
      },
      {
        title: "单位编码",
        dataIndex: "districtCodeId"
      },
      {
        title: "上级单位",
        dataIndex: "parentId"
      },
      {
        title: "操作",
        key: "operation",
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
              }}
            >
              编辑
            </a>
            <a
              onClick={() => {
                Modal.confirm({
                  title: "删除",
                  content: "你是否确定要删除",
                  okText: "是",
                  cancelText: "否",
                  okType: "danger",
                  onOk() {
                    dispatch({
                      type: "departs/departsDelete",
                      payload: record.id,
                      callback: (success, error, result) => {
                        if (success) {
                          self.setState({
                            visible: false
                          });
                          self.departsTree();
                        }
                        notification[success ? "success" : "error"]({
                          message: `删除1条行政区划数据${
                            success ? "成功" : "失败"
                          }${success ? "" : `：${error.message}`}`
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
              borderRadius: "10px 0 0 0",
              height: window.innerHeight - 150,
              overflow: "auto"
            }}
            width={300}
            theme="light"
          >
            <Tree.DirectoryTree
              multiple
              // defaultExpandAll={true}
              onSelect={(keys, event) => {
                console.log("Trigger Select", keys, event);
              }}
            >
              {departsTree.map(item => (
                <Tree.TreeNode title={item.name} key={item.id}>
                  {(item.children || []).map(ite => (
                    <Tree.TreeNode title={ite.name} key={ite.id}>
                      {(ite.children || []).map(it => (
                        <Tree.TreeNode title={it.name} key={it.id} isLeaf />
                      ))}
                    </Tree.TreeNode>
                  ))}
                </Tree.TreeNode>
              ))}
            </Tree.DirectoryTree>
          </Sider>
          <Content
            style={{
              borderRadius: "0 10px 0 0",
              background: "#fff"
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
                      message.warning("请选择需要删除的行政区");
                      return;
                    }
                    Modal.confirm({
                      title: "删除",
                      content: "你是否确定要删除",
                      okText: "是",
                      cancelText: "否",
                      okType: "danger",
                      onOk() {
                        dispatch({
                          type: "departs/departsDeleteMul",
                          payload: { id: selectedRows.map(item => item.id) },
                          callback: (success, error, result) => {
                            if (success) {
                              self.setState({
                                visible: false
                              });
                              self.departsTree();
                            }
                            notification[success ? "success" : "error"]({
                              message: `删除${l}条行政区划数据${
                                success ? "成功" : "失败"
                              }${success ? "" : `：${error.message}`}`
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
              title="新建行政区"
              visible={visible}
              onOk={() => {
                this.props.form.validateFields((err, v) => {
                  console.log("新建行政区", v);
                  if (!v.parentId) {
                    message.warning("请选择上级行政区");
                    return;
                  }
                  if (!v.name) {
                    message.warning("请填写行政区名称");
                    return;
                  }
                  if (!v.code) {
                    message.warning("请填写行政区编码");
                    return;
                  }
                  dispatch({
                    type: "departs/departsCreateUpdate",
                    payload: { ...v, id: id },
                    callback: (success, error, result) => {
                      if (success) {
                        this.setState({
                          visible: false
                        });
                        notification["success"]({
                          message: `${id ? "编辑" : "新建"}字典类型成功`
                        });
                        this.departsTree();
                      } else {
                        notification["error"]({
                          message: `${id ? "编辑" : "新建"}字典类型失败：${
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
                style={{ textAlign: "center" }}
              >
                <Form.Item
                  label={
                    <span>
                      <b style={{ color: "red" }}>*</b>上级行政区
                    </span>
                  }
                  hasFeedback
                >
                  {getFieldDecorator("parentId", {})(
                    <Select
                      showSearch
                      allowClear
                      optionFilterProp="children"
                      style={{ width: 180 }}
                    >
                      {departsList.items.map((item, index) => (
                        <Select.Option value={item.id} key={index}>
                          {item.name}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
                <Form.Item
                  label={
                    <span>
                      <b style={{ color: "red" }}>*</b>行政区名称
                    </span>
                  }
                  hasFeedback
                >
                  {getFieldDecorator("name", {})(<Input />)}
                </Form.Item>
                <Form.Item
                  label={
                    <span>
                      <b style={{ color: "red" }}>*</b>行政区编码
                    </span>
                  }
                  hasFeedback
                >
                  {getFieldDecorator("code", {})(<Input />)}
                </Form.Item>
                <Form.Item
                  label={
                    <span>
                      <b style={{ color: "#fff" }}>*</b>行政区备注
                    </span>
                  }
                  hasFeedback
                >
                  {getFieldDecorator("description", {})(
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
