import React, { PureComponent } from "react";
import {
  Form,
  Icon,
  Input,
  Button,
  Table,
  message,
  Modal,
  Tabs,
  Select
} from "antd";
import { createForm } from "rc-form";
import Systems from "../../../components/Systems";
import Highlighter from "react-highlight-words";

@createForm()
export default class dict extends PureComponent {
  state = {
    state: 0,
    visible: false,
    selectedRowsType: [],
    selectedRowsData: []
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
    const { visible, selectedRowsType, selectedRowsData } = this.state;
    const { getFieldDecorator } = this.props.form;
    const columnsType = [
      {
        title: "分组名称",
        dataIndex: "name"
      },
      {
        title: "分组代码",
        dataIndex: "code"
      },
      {
        title: "描述",
        dataIndex: "desc"
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
              onClick={() => {
                message.success("删除成功");
              }}
            >
              删除
            </a>
          </span>
        )
      }
    ];
    const columnsData = [
      {
        title: "字典代码",
        dataIndex: "code"
      },
      {
        title: "字典值",
        dataIndex: "value"
      },
      {
        title: "描述",
        dataIndex: "desc"
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
              onClick={() => {
                message.success("删除成功");
              }}
            >
              删除
            </a>
          </span>
        )
      }
    ];

    const dataType = [
      {
        name: "审核状态",
        code: "审核状态",
        desc: "审核状态描述"
      },
      {
        name: "立项级别",
        code: "立项级别",
        desc: "立项级别描述"
      },
      {
        name: "项目类别",
        code: "项目类别",
        desc: "项目类别描述"
      }
    ];
    const data = [
      {
        code: "XMLX-22",
        value: "井采非金属矿",
        desc: "井采非金属矿描述"
      },
      {
        code: "XMLX-23",
        value: "油气开采工程",
        desc: "油气开采工程描述"
      },
      {
        code: "XMLX-24",
        value: "工业园区工程",
        desc: "工业园区工程描述"
      }
    ];

    const rowSelectionType = {
      onChange: (selectedRowKeys, selectedRows) => {
        console.log(selectedRows);
        this.setState({ selectedRowsType: selectedRows });
      }
    };
    const rowSelectionData = {
      onChange: (selectedRowKeys, selectedRows) => {
        console.log(selectedRows);
        this.setState({ selectedRowsData: selectedRows });
      }
    };

    const selectList = [
      {
        value: "1",
        text: "项目类型"
      },
      {
        value: "2",
        text: "防治标准"
      },
      {
        value: "3",
        text: "建设状态"
      }
    ];

    return (
      <Systems>
        <Tabs defaultActiveKey="1">
          <Tabs.TabPane tab="字典类型分组" key="1">
            <span>
              <Button
                icon="plus"
                style={{ margin: 10 }}
                onClick={() => {
                  this.setState({
                    visible: true
                  });
                }}
              >
                添加
              </Button>
              <Button
                icon="delete"
                style={{ margin: 10 }}
                onClick={() => {
                  const l = selectedRowsType.length;
                  if (l === 0) {
                    message.warning("请选择需要删除的单位");
                    return;
                  }
                  message.success(`删除${l}个单位成功`);
                }}
              >
                删除
              </Button>
            </span>
            <Table
              columns={columnsType}
              dataSource={dataType}
              rowSelection={rowSelectionType}
            />
            <Modal
              title="添加建设单位"
              visible={visible}
              onOk={() => {
                this.props.form.validateFields((err, v) => {
                  console.log("表单信息", v);
                  if (!v.name) {
                    message.warning("请填写单位名称");
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
                onSubmit={this.handleSubmit}
                layout="inline"
                style={{ textAlign: "center" }}
              >
                <Form.Item
                  label={
                    <span>
                      <b style={{ color: "red" }}>*</b>单位名称
                    </span>
                  }
                  hasFeedback
                >
                  {getFieldDecorator("name", {})(<Input />)}
                </Form.Item>
                <Form.Item
                  label={
                    <span>
                      <b style={{ color: "#fff" }}>*</b>单位描述
                    </span>
                  }
                  hasFeedback
                >
                  {getFieldDecorator("desc", {})(<Input />)}
                </Form.Item>
              </Form>
            </Modal>
          </Tabs.TabPane>
          <Tabs.TabPane tab="数组字典管理" key="2">
            <Select
              showSearch
              allowClear
              defaultValue="1"
              optionFilterProp="children"
              style={{ width: 200, margin: 10 }}
            >
              {selectList.map(item => (
                <Select.Option value={item.value}>{item.text}</Select.Option>
              ))}
            </Select>
            <span>
              <Button
                icon="plus"
                style={{ margin: 10 }}
                onClick={() => {
                  this.setState({
                    visible: true
                  });
                }}
              >
                添加
              </Button>
              <Button
                icon="delete"
                style={{ margin: 10 }}
                onClick={() => {
                  const l = selectedRowsData.length;
                  if (l === 0) {
                    message.warning("请选择需要删除的单位");
                    return;
                  }
                  message.success(`删除${l}个单位成功`);
                }}
              >
                删除
              </Button>
            </span>
            <Table
              columns={columnsData}
              dataSource={data}
              rowSelection={rowSelectionData}
            />
            <Modal
              title="添加建设单位"
              visible={visible}
              onOk={() => {
                this.props.form.validateFields((err, v) => {
                  console.log("表单信息", v);
                  if (!v.name) {
                    message.warning("请填写单位名称");
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
                onSubmit={this.handleSubmit}
                layout="inline"
                style={{ textAlign: "center" }}
              >
                <Form.Item
                  label={
                    <span>
                      <b style={{ color: "red" }}>*</b>单位名称
                    </span>
                  }
                  hasFeedback
                >
                  {getFieldDecorator("name", {})(<Input />)}
                </Form.Item>
                <Form.Item
                  label={
                    <span>
                      <b style={{ color: "#fff" }}>*</b>单位描述
                    </span>
                  }
                  hasFeedback
                >
                  {getFieldDecorator("desc", {})(<Input />)}
                </Form.Item>
              </Form>
            </Modal>
          </Tabs.TabPane>
        </Tabs>
      </Systems>
    );
  }
}
