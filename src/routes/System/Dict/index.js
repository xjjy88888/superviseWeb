import React, { PureComponent } from "react";
import { connect } from "dva";
import {
  Form,
  Icon,
  Input,
  Button,
  Table,
  message,
  Modal,
  Tabs,
  Select,
  notification
} from "antd";
import { createForm } from "rc-form";
import Systems from "../../../components/Systems";
import Highlighter from "react-highlight-words";
const data = [
  {
    key: "1",
    name: "井采非金属矿",
    code: "XMLX-22",
    desc: "井采非金属矿描述"
  },
  {
    key: "2",
    name: "油气开采工程",
    code: "XMLX-23",
    desc: "油气开采工程描述"
  }
];
let self;

@createForm()
@connect(({ dict }) => ({ dict }))
export default class dict extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      state: 0,
      visibleType: false,
      visibleData: false,
      selectedRowsType: [],
      selectedRowsData: [],
      id: null
    };
  }

  componentDidMount() {
    self = this;
    this.dictTypeList();
  }

  dictTypeList = () => {
    const { dispatch } = this.props;
    dispatch({ type: "dict/dictTypeList" });
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
    const {
      visibleType,
      visibleData,
      selectedRowsType,
      selectedRowsData,
      id
    } = this.state;

    const {
      dispatch,
      form: { getFieldDecorator, resetFields, setFieldsValue },
      dict: { dictTypeList }
    } = this.props;

    const dataSourceType = dictTypeList.items.map(item => {
      return { ...item, key: item.id };
    });

    const columnsType = [
      {
        title: "分组名称",
        dataIndex: "dictTypeName",
        ...this.getColumnSearchProps("dictTypeName")
      },
      {
        title: "分组编码",
        dataIndex: "dictTypeKey",
        ...this.getColumnSearchProps("dictTypeKey")
      },
      {
        title: "分组描述",
        dataIndex: "description"
      },
      {
        title: "操作",
        key: "operation",
        render: (item, record) => (
          <span>
            <a
              style={{ marginRight: 20 }}
              onClick={() => {
                this.props.form.setFieldsValue({
                  dictTypeName: record.dictTypeName,
                  dictTypeKey: record.dictTypeKey,
                  description: record.description
                });
                this.setState({
                  visibleType: true,
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
                      type: "dict/dictTypeDelete",
                      payload: record.id,
                      callback: (success, error, result) => {
                        if (success) {
                          self.setState({
                            visibleType: false
                          });
                          self.dictTypeList();
                        }
                        notification[success ? "success" : "error"]({
                          message: `删除字典类型${success ? "成功" : "失败"}${
                            success ? "" : `：${error.message}`
                          }`
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
    const columnsData = [
      {
        title: "字典名称",
        dataIndex: "name"
      },
      {
        title: "字典编码",
        dataIndex: "code"
      },
      {
        title: "字典描述",
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
                  visibleData: true
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
                    message.success(`删除1个数据字典成功`);
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
                  resetFields();
                  this.setState({
                    visibleType: true,
                    id: null
                  });
                }}
              >
                添加
              </Button>
              <Button
                icon="delete"
                disabled={!selectedRowsType.length}
                style={{ margin: 10 }}
                onClick={() => {
                  const l = selectedRowsType.length;
                  if (l === 0) {
                    message.warning("请选择需要删除的字典类型");
                    return;
                  }
                  Modal.confirm({
                    title: "删除",
                    content: "你是否确定要删除",
                    okText: "是",
                    cancelText: "否",
                    okType: "danger",
                    onOk() {
                      message.success(`删除${l}个字典类型成功`);
                    },
                    onCancel() {}
                  });
                }}
              >
                删除
              </Button>
            </span>
            <Table
              columns={columnsType}
              dataSource={dataSourceType}
              rowSelection={rowSelectionType}
            />
            <Modal
              title="添加字典类型"
              visible={visibleType}
              onOk={() => {
                this.props.form.validateFields((err, v) => {
                  console.log("添加字典类型", v);
                  if (!v.dictTypeName) {
                    message.warning("请填写分组名称");
                    return;
                  }
                  if (!v.dictTypeKey) {
                    message.warning("请填写分组编码");
                    return;
                  }
                  dispatch({
                    type: "dict/dictTypeCreateUpdate",
                    payload: { ...v, id: id },
                    callback: (success, error, result) => {
                      if (success) {
                        this.setState({
                          visibleType: false
                        });
                        notification["success"]({
                          message: `${id ? "编辑" : "新建"}字典类型成功`
                        });
                        this.dictTypeList();
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
                  visibleType: false
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
                      <b style={{ color: "red" }}>*</b>分组名称
                    </span>
                  }
                  hasFeedback
                >
                  {getFieldDecorator("dictTypeName", {})(<Input />)}
                </Form.Item>
                <Form.Item
                  label={
                    <span>
                      <b style={{ color: "red" }}>*</b>分组编码
                    </span>
                  }
                  hasFeedback
                >
                  {getFieldDecorator("dictTypeKey", {})(<Input />)}
                </Form.Item>
                <Form.Item
                  label={
                    <span>
                      <b style={{ color: "#fff" }}>*</b>分组描述
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
          </Tabs.TabPane>
          <Tabs.TabPane tab="数组字典管理" key="2">
            <Select
              showSearch
              allowClear
              defaultValue="1"
              optionFilterProp="children"
              style={{ width: 200, margin: 10 }}
            >
              {selectList.map((item, index) => (
                <Select.Option value={item.value} key={index}>
                  {item.text}
                </Select.Option>
              ))}
            </Select>
            <span>
              <Button
                icon="plus"
                style={{ margin: 10 }}
                onClick={() => {
                  this.setState({
                    visibleData: true
                  });
                }}
              >
                添加
              </Button>
              <Button
                icon="delete"
                disabled={!selectedRowsData.length}
                style={{ margin: 10 }}
                onClick={() => {
                  const l = selectedRowsData.length;
                  if (l === 0) {
                    message.warning("请选择需要删除的数组字典");
                    return;
                  }
                  Modal.confirm({
                    title: "删除",
                    content: "你是否确定要删除",
                    okText: "是",
                    cancelText: "否",
                    okType: "danger",
                    onOk() {
                      message.success(`删除${l}个数组字典成功`);
                    },
                    onCancel() {}
                  });
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
              title="添加数组字典"
              visible={visibleData}
              onOk={() => {
                this.props.form.validateFields((err, v) => {
                  console.log("添加数组字典", v);
                  if (!v.type) {
                    message.warning("请选择分组名称");
                    return;
                  }
                  if (!v.name) {
                    message.warning("请填写字典名称");
                    return;
                  }
                  if (!v.code) {
                    message.warning("请填写字典编码");
                    return;
                  }
                  this.setState({
                    visibleData: false
                  });
                  message.success("保存成功");
                });
              }}
              onCancel={() => {
                this.setState({
                  visibleData: false
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
                      <b style={{ color: "red" }}>*</b>分组名称
                    </span>
                  }
                  hasFeedback
                >
                  {getFieldDecorator("type", {})(
                    <Select
                      showSearch
                      allowClear
                      optionFilterProp="children"
                      style={{ width: 180 }}
                    >
                      {selectList.map((item, index) => (
                        <Select.Option value={item.value} key={index}>
                          {item.text}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
                <Form.Item
                  label={
                    <span>
                      <b style={{ color: "red" }}>*</b>字典名称
                    </span>
                  }
                  hasFeedback
                >
                  {getFieldDecorator("name", {})(<Input />)}
                </Form.Item>
                <Form.Item
                  label={
                    <span>
                      <b style={{ color: "red" }}>*</b>字典编码
                    </span>
                  }
                  hasFeedback
                >
                  {getFieldDecorator("code", {})(<Input />)}
                </Form.Item>
                <Form.Item
                  label={
                    <span>
                      <b style={{ color: "#fff" }}>*</b>字典描述
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
          </Tabs.TabPane>
        </Tabs>
      </Systems>
    );
  }
}
