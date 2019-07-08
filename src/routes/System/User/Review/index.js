import React, { PureComponent } from "react";
import { Form, Icon, Input, Button, Table, message, Modal } from "antd";
import { createForm } from "rc-form";
import Systems from "../../../../components/Systems";
import Highlighter from "react-highlight-words";

const data = [
  {
    key: "1",
    nickname: "花都区办事员",
    name: "花都区办事员",
    phone: 13555479658,
    address: "广州市花都区"
  },
  {
    key: "2",
    nickname: "天河区办事员",
    name: "天河区办事员",
    phone: 16555479658,
    address: "广州市天河区"
  },
  {
    key: "3",
    nickname: "海珠区办事员",
    name: "海珠区办事员",
    phone: 17555479658,
    address: "广州市海珠区"
  }
];

@createForm()
export default class review extends PureComponent {
  state = {
    state: 0,
    visible: false,
    selectedRows: []
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
        title: "用户名称",
        dataIndex: "nickname",
        sorter: (a, b) => a.nickname.length - b.nickname.length,
        ...this.getColumnSearchProps("nickname")
      },
      {
        title: "登录名称",
        dataIndex: "name",
        sorter: (a, b) => a.name.length - b.name.length,
        ...this.getColumnSearchProps("name")
      },
      {
        title: "联系电话",
        dataIndex: "phone",
        sorter: (a, b) => a.phone - b.phone,
        ...this.getColumnSearchProps("phone")
      },
      {
        title: "住址",
        dataIndex: "address",
        sorter: (a, b) => a.address.length - b.address.length,
        ...this.getColumnSearchProps("address")
      },
      {
        title: "操作",
        key: "operation",
        render: (item, record) => (
          <span>
            <a
              style={{ marginRight: 20 }}
              onClick={() => {
                this.setState({
                  visible: true
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
        <Modal
          title="添加账号"
          visible={visible}
          onOk={() => {
            this.props.form.validateFields((err, v) => {
              console.log("表单信息", v);
              if (!v.nickname) {
                message.warning("请填写用户名称");
                return;
              }
              if (!v.name) {
                message.warning("请填写登录名称");
                return;
              }
              if (!v.password) {
                message.warning("请填写登录密码");
                return;
              }
              if (!v.confirm_password) {
                message.warning("请填写确认密码");
                return;
              }
              if (v.password !== v.confirm_password) {
                message.warning("两次密码不一致");
                return;
              }
              this.setState({
                visible: false
              });
              message.success("保存成功");
            });
          }}
          onCancel={() => {
            this.setState({
              visible: false
            });
          }}
        >
          <Form
            // {...formItemLayout}
            onSubmit={this.handleSubmit}
            layout="inline"
            style={{ textAlign: "center" }}
          >
            <Form.Item
              label={
                <span>
                  <b style={{ color: "red" }}>*</b>用户名称
                </span>
              }
              hasFeedback
            >
              {getFieldDecorator("nickname", {})(<Input />)}
            </Form.Item>
            <Form.Item
              label={
                <span>
                  <b style={{ color: "red" }}>*</b>登录名称
                </span>
              }
              hasFeedback
            >
              {getFieldDecorator("name", {})(<Input />)}
            </Form.Item>
            <Form.Item
              label={
                <span>
                  <b style={{ color: "red" }}>*</b>登录密码
                </span>
              }
              hasFeedback
            >
              {getFieldDecorator("password", {})(
                <Input.Password style={{ width: 180 }} />
              )}
            </Form.Item>
            <Form.Item
              label={
                <span>
                  <b style={{ color: "red" }}>*</b>确认密码
                </span>
              }
              hasFeedback
            >
              {getFieldDecorator("confirm_password", {})(
                <Input.Password style={{ width: 180 }} />
              )}
            </Form.Item>
            <Form.Item
              label={
                <span>
                  <b style={{ color: "#fff" }}>*</b>联系电话
                </span>
              }
              hasFeedback
            >
              {getFieldDecorator("phone", {})(<Input />)}
            </Form.Item>
            <Form.Item
              label={
                <span>
                  <b style={{ color: "#fff" }}>*</b>电子邮箱
                </span>
              }
              hasFeedback
            >
              {getFieldDecorator("mail", {})(<Input />)}
            </Form.Item>
            <Form.Item
              label={
                <span>
                  <b style={{ color: "#fff" }}>*</b>所属职务
                </span>
              }
              hasFeedback
            >
              {getFieldDecorator("post", {})(<Input />)}
            </Form.Item>
            <Form.Item
              label={
                <span>
                  <b style={{ color: "#fff" }}>*</b>所在住址
                </span>
              }
              hasFeedback
            >
              {getFieldDecorator("address", {})(<Input />)}
            </Form.Item>
            <Form.Item
              label={
                <span>
                  <b style={{ color: "#fff" }}>*</b>账号描述
                </span>
              }
              hasFeedback
            >
              {getFieldDecorator("desc", {})(
                <Input.TextArea autosize style={{ width: 180 }} />
              )}
            </Form.Item>
          </Form>
        </Modal>
      </Systems>
    );
  }
}
