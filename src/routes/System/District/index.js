import React, { PureComponent } from "react";
import { connect } from "dva";
import { createForm } from "rc-form";
import Systems from "../../../components/Systems";
import {
  Form,
  Icon,
  Input,
  Button,
  Table,
  Select,
  message,
  DatePicker,
  Avatar,
  Tree,
  Typography,
  Layout,
  Modal
} from "antd";
import Highlighter from "react-highlight-words";

const { Header, Footer, Sider, Content } = Layout;
const { Title } = Typography;

const data = [
  {
    key: "1",
    name: "北京市",
    up_name: "中国",
    desc: "110033"
  },
  {
    key: "2",
    name: "广州市",
    up_name: "广东",
    desc: "110000"
  },
  {
    key: "3",
    name: "花都区",
    up_name: "广州市",
    desc: "110022"
  }
];

@connect(({ district }) => ({ district }))
@createForm()
export default class area extends PureComponent {
  state = { visible: false, selectedRows: [] };

  componentDidMount() {
    this.districtTree();
  }

  districtTree = () => {
    const { dispatch } = this.props;
    dispatch({ type: "district/districtTree" });
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
    const {
      form: { getFieldDecorator, getFieldsError },
      district: { districtTree, districtList }
    } = this.props;

    const dataSource = districtList.map((item, index) => {
      return { ...item, key: index };
    });

    const columns = [
      {
        title: "序号",
        dataIndex: "key",
        sorter: (a, b) => a.key - b.key,
        ...this.getColumnSearchProps("key")
      },
      {
        title: "行政区名称",
        dataIndex: "label",
        sorter: (a, b) => a.label.length - b.label.length,
        ...this.getColumnSearchProps("label")
      },
      {
        title: "行政区代码",
        dataIndex: "value",
        sorter: (a, b) => a.value - b.value,
        ...this.getColumnSearchProps("value")
      },
      {
        title: "上级行政区",
        dataIndex: "parent",
        sorter: (a, b) => a.parent.length - b.parent.length,
        ...this.getColumnSearchProps("parent")
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
                Modal.confirm({
                  title: "删除",
                  content: "你是否确定要删除",
                  okText: "是",
                  cancelText: "否",
                  okType: "danger",
                  onOk() {
                    message.success(`删除1个行政区成功`);
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
            {/* <Title level={4}>部门</Title> */}
            <Tree.DirectoryTree
              multiple
              autoExpandParent
              defaultExpandAll={true}
              onSelect={(keys, event) => {
                console.log("Trigger Select", keys, event);
              }}
            >
              {districtTree.map(item => (
                <Tree.TreeNode title={item.label} key={item.value}>
                  {(item.children || []).map(ite => (
                    <Tree.TreeNode title={ite.label} key={ite.value}>
                      {(ite.children || []).map(it => (
                        <Tree.TreeNode title={it.label} key={it.value} isLeaf />
                      ))}
                    </Tree.TreeNode>
                  ))}
                </Tree.TreeNode>
              ))}
            </Tree.DirectoryTree>
          </Sider>
          <Content
            style={{
              // padding: 20,
              borderRadius: "0 10px 0 0",
              background: "#fff"
            }}
          >
            <Title level={4}>
              {/* 用户 */}
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
                        message.success(`删除${l}个行政区成功`);
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
            />
            <Modal
              title="添加行政区"
              visible={visible}
              onOk={() => {
                this.props.form.validateFields((err, v) => {
                  console.log("添加行政区", v);
                  if (!v.up_name) {
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
                      <b style={{ color: "red" }}>*</b>上级行政区
                    </span>
                  }
                  hasFeedback
                >
                  {getFieldDecorator("up_name", {})(
                    <Select
                      showSearch
                      allowClear
                      optionFilterProp="children"
                      style={{ width: 180 }}
                    >
                      {[
                        { value: "111", text: "中国" },
                        { value: "222", text: "北京" },
                        { value: "333", text: "广东" }
                      ].map((item, index) => (
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
                  {getFieldDecorator("desc", {})(
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
