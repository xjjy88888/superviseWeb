import React, { PureComponent } from "react";
import { connect } from "dva";
import { createForm } from "rc-form";
import Systems from "../../../components/Systems";
import MustFill from "../../../components/MustFill";
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
  Modal
} from "antd";
import emitter from "../../../utils/event";

const { Sider, Content } = Layout;
const { Title } = Typography;

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 15 }
};

let self;

@connect(({ user, departs }) => ({ user, departs }))
@createForm()
export default class area extends PureComponent {
  state = {
    visible: false,
    selectedRows: [],
    id: null,
    pagination: {},
    loading: false,
    dataSource: [],
    GovDepartmentId: ""
  };

  componentDidMount() {
    self = this;
    this.departsTree();

    this.eventEmitter = emitter.addListener("refreshSystem", v => {
      this.refresh();
    });
  }

  refresh = () => {
    const { GovDepartmentId } = this.state;
    this.userList({ SkipCount: 0, MaxResultCount: 10, GovDepartmentId });
  };

  departsTree = () => {
    const { dispatch } = this.props;
    dispatch({
      type: "departs/departsTree"
    });
  };

  userDelete = v => {
    const { dispatch } = this.props;
    this.setState({ loading: true });
    dispatch({
      type: "user/userDelete",
      payload: { ids: v.map(i => i.id) },
      callback: success => {
        if (success) {
          this.setState({
            loading: false
          });
          this.refresh();
        }
      }
    });
  };

  userList = payload => {
    const { dispatch } = this.props;
    this.setState({ loading: true });
    dispatch({
      type: "user/userList",
      payload: { ...payload, IsActive: true, UserType: 0 },
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
    const { GovDepartmentId } = this.state;
    this.setState({
      pagination: pagination
    });
    this.userList({
      SkipCount: (pagination.current - 1) * pagination.pageSize,
      MaxResultCount: pagination.pageSize,
      Name: filters.name,
      GovDepartmentId: GovDepartmentId
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
      form: { getFieldDecorator, validateFields },
      departs: { departsTree }
    } = this.props;

    const {
      visible,
      selectedRows,
      id,
      dataSource,
      pagination,
      loading,
      GovDepartmentId
    } = this.state;

    const columns = [
      {
        title: "账号",
        dataIndex: "userName",
        sorter: (a, b) => a.userName.length - b.userName.length,
        ...this.getColumnSearchProps("userName")
      },
      {
        title: "姓名",
        dataIndex: "displayName",
        sorter: (a, b) => a.displayName.length - b.displayName.length,
        ...this.getColumnSearchProps("displayName")
      },
      {
        title: "电话",
        dataIndex: "phoneNumber",
        sorter: (a, b) => a.phoneNumber - b.phoneNumber,
        ...this.getColumnSearchProps("phoneNumber")
      },
      {
        title: "用户类型",
        render: item => <span>{item.userType === 1 ? `社会` : `行政`}用户</span>
      },
      {
        title: "创建时间",
        dataIndex: "creationTime"
      },
      {
        title: "操作",
        key: "operation",
        render: (item, record) => (
          <span>
            <a
              style={{ marginRight: 20 }}
              onClick={() => {
                emitter.emit("showRegister", {
                  show: true,
                  isActive: true,
                  type: `admin`,
                  status: "edit",
                  item
                });
              }}
            >
              编辑
            </a>
            <a
              onClick={() => {
                Modal.confirm({
                  title: "删除",
                  content: "是否确定要删除",
                  okText: "是",
                  cancelText: "否",
                  okType: "danger",
                  onOk() {
                    self.userDelete([{ id: item.id }]);
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
            width={400}
            theme="light"
          >
            <Tree.DirectoryTree
              multiple
              onSelect={(v, e) => {
                // console.log(v[0], e.selectedNodes[0].props.districtCodeId);
                const d = e.selectedNodes[0].props.districtCodeId;
                console.log(v[0], d);
                this.setState({
                  GovDepartmentId: v[0],
                  ParentCodeId: d
                });
                this.userList({
                  SkipCount: 0,
                  MaxResultCount: 10,
                  GovDepartmentId: v[0]
                });
              }}
            >
              {departsTree.map(item => (
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
              borderRadius: "0 10px 0 0",
              background: "#fff"
            }}
          >
            <Title level={4}>
              <span>
                <Button
                  icon="plus"
                  disabled={!GovDepartmentId}
                  style={{ margin: 10 }}
                  onClick={() => {
                    emitter.emit("showRegister", {
                      show: true,
                      isActive: true,
                      type: `admin`,
                      status: "add",
                      item: { govDepartmentId: GovDepartmentId }
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
                      message.warning("请选择需要删除的账号");
                      return;
                    }
                    Modal.confirm({
                      title: "删除",
                      content: "是否确定要删除",
                      okText: "是",
                      cancelText: "否",
                      okType: "danger",
                      onOk() {
                        self.userDelete(selectedRows);
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
                  console.log("新建编辑部门", v);
                  const d = v.districtCodeId;
                  if (!v.name) {
                    message.warning("请填写部门名");
                    return;
                  }
                  if (!d) {
                    message.warning("请选择行政区划");
                    return;
                  }
                  dispatch({
                    type: "departs/departsCreateUpdate",
                    payload: {
                      ...v,
                      id: id,
                      districtCodeId: d[d.length - 1],
                      GovDepartmentId
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
                style={{ textAlign: "center", width: `100%`, height: `100%` }}
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
                  {getFieldDecorator("name", {})(<Input />)}
                </Form.Item>
              </Form>
            </Modal>
          </Content>
        </Layout>
      </Systems>
    );
  }
}
