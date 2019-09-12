import React, { PureComponent } from "react";
import { Icon, Input, Button, Table, message, Modal } from "antd";
import { createForm } from "rc-form";
import { connect } from "dva";
import Systems from "../../../components/Systems";
import emitter from "../../../utils/event";
import Highlighter from "react-highlight-words";
import Spins from "../../../components/Spins";

let self;

@createForm()
@connect(({ user }) => ({ user }))
export default class review extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      state: 0,
      visible: false,
      selectedRows: [],
      pagination: {},
      loading: false,
      dataSource: []
    };
  }

  componentDidMount() {
    self = this;
    this.refresh();
  }

  refresh = () => {
    this.userList({ SkipCount: 0, MaxResultCount: 10 });
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

  userExamine = arr => {
    const { dispatch } = this.props;
    this.setState({ loading: true });
    dispatch({
      type: "user/userExamine",
      payload: {
        items: arr.map(item => {
          return {
            userId: item.id,
            isActive: true
          };
        })
      },
      callback: success => {
        this.setState({ loading: false });
        if (success) {
          this.refresh();
        }
      }
    });
  };

  userList = params => {
    const { dispatch } = this.props;
    this.setState({ loading: true });
    dispatch({
      type: "user/userList",
      payload: { ...params, IsActive: false, UserType: "" },
      callback: (success, error, result) => {
        const pagination = { ...this.state.pagination };
        pagination.total = result.totalCount;
        this.setState({
          loading: false,
          dataSource: result.items,
          pagination
        });
      }
    });
  };

  handleTableChange = (pagination, filters, sorter) => {
    console.log(pagination, filters);
    this.setState({
      pagination: pagination
    });
    this.userList({
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
    const { selectedRows, dataSource, pagination, loading } = this.state;

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
                  type: item.userType === 1 ? `society` : `admin`,
                  status: "edit",
                  item
                });
              }}
            >
              编辑
            </a>
            <a
              style={{ marginRight: 20 }}
              onClick={() => {
                Modal.confirm({
                  title: "通过",
                  content: "是否确定要审核通过",
                  okText: "是",
                  cancelText: "否",
                  okType: "danger",
                  onOk() {
                    self.userExamine([
                      {
                        id: item.id,
                        isActive: true
                      }
                    ]);
                  },
                  onCancel() {}
                });
              }}
            >
              通过
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
        <span>
          <Button
            icon="check"
            disabled={!selectedRows.length}
            style={{ margin: 10 }}
            onClick={() => {
              const l = selectedRows.length;
              if (l === 0) {
                message.warning("请选择需要通过的账号");
                return;
              }

              Modal.confirm({
                title: "通过",
                content: "是否确定要审核通过",
                okText: "是",
                cancelText: "否",
                okType: "danger",
                onOk() {
                  self.userExamine(selectedRows);
                },
                onCancel() {}
              });
            }}
          >
            通过
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
        <Table
          columns={columns}
          rowSelection={rowSelection}
          rowKey={record => record.id}
          dataSource={dataSource}
          pagination={pagination}
          loading={loading}
          onChange={this.handleTableChange}
        />
      </Systems>
    );
  }
}
