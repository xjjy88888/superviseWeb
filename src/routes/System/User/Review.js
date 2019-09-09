import React, { PureComponent } from "react";
import { Icon, Input, Button, Table, message, Modal } from "antd";
import { createForm } from "rc-form";
import { connect } from "dva";
import Systems from "../../../components/Systems";
import emitter from "../../../utils/event";
// import Register from "../../../../components/Register";
import Highlighter from "react-highlight-words";

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
    this.userList({ SkipCount: 0, MaxResultCount: 10 });
  }

  userList = params => {
    const { dispatch } = this.props;
    this.setState({ loading: true });
    dispatch({
      type: "user/userList",
      payload: { ...params, IsActive: false },
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
        dataIndex: "phone",
        sorter: (a, b) => a.phone - b.phone,
        ...this.getColumnSearchProps("phone")
      },
      {
        title: "有效期至",
        dataIndex: "time",
        sorter: (a, b) => a.time.length - b.time.length,
        ...this.getColumnSearchProps("time")
      },
      {
        title: "剩余天数",
        dataIndex: "surplus",
        sorter: (a, b) => a.surplus - b.surplus,
        ...this.getColumnSearchProps("surplus")
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
                  type: "review"
                });
              }}
            >
              编辑
            </a>
            <a
              style={{ marginRight: 20 }}
              onClick={() => {
                message.success(`通过1个账号成功`);
              }}
            >
              通过
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
                    message.success(`删除1个账号成功`);
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
        {/* <Register /> */}
        <span>
          <Button
            icon="delete"
            disabled={!selectedRows.length}
            style={{ margin: 10 }}
            onClick={() => {
              const l = selectedRows.length;
              if (l === 0) {
                message.warning("请选择需要通过的账号");
                return;
              }
              message.success(`通过${l}个账号成功`);
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
                content: "你是否确定要删除",
                okText: "是",
                cancelText: "否",
                okType: "danger",
                onOk() {
                  message.success(`删除${l}个账号成功`);
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
