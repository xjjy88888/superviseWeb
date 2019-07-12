import React, { PureComponent } from "react";
import { Form, Icon, Input, Button, Table, message, Modal } from "antd";
import { createForm } from "rc-form";
import Systems from "../../../../components/Systems";
import emitter from "../../../../utils/event";
import Register from "../../../../components/Register";
import Highlighter from "react-highlight-words";

const data = [
  {
    key: "1",
    nickname: "花都区办事员",
    name: "花都区办事员",
    phone: 13555479658,
    time: "2019-12-31",
    surplus: 10
  },
  {
    key: "2",
    nickname: "天河区办事员",
    name: "天河区办事员",
    phone: 16555479658,
    time: "2020-12-31",
    surplus: 20
  },
  {
    key: "3",
    nickname: "海珠区办事员",
    name: "海珠区办事员",
    phone: 17555479658,
    time: "2091-12-31",
    surplus: 30
  }
];

@createForm()
export default class review extends PureComponent {
  state = {
    state: 0,
    visible: false,
    selectedRows: []
  };

  componentDidMount() {
    sessionStorage.setItem("key", "/user/review");
  }

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
    },
    render: text => (
      <Highlighter
        highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
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
    this.setState({ searchText: "" });
  };

  render() {
    const { visible, selectedRows } = this.state;
    const { getFieldDecorator, getFieldsError } = this.props.form;

    const columns = [
      {
        title: "账号",
        dataIndex: "nickname",
        sorter: (a, b) => a.nickname.length - b.nickname.length,
        ...this.getColumnSearchProps("nickname")
      },
      {
        title: "姓名",
        dataIndex: "name",
        sorter: (a, b) => a.name.length - b.name.length,
        ...this.getColumnSearchProps("name")
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
              修改
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
        <Register />
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
          dataSource={data}
          rowSelection={rowSelection}
        />
      </Systems>
    );
  }
}
