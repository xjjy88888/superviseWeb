import React, { PureComponent } from "react";
import {
  Steps,
  Form,
  Icon,
  Input,
  Button,
  Table,
  TreeSelect,
  Select,
  message,
  DatePicker,
  Radio,
  Avatar,
  Tree,
  Layout,
  Modal,
  Typography
} from "antd";
import { createForm } from "rc-form";
import moment from "moment";
import Systems from "../../../components/Systems";
import Highlighter from "react-highlight-words";

const { Title, Text } = Typography;
const { Header, Footer, Sider, Content } = Layout;

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
          // placeholder={`查询单位名称`}
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
        title: "序号",
        dataIndex: "index",
        sorter: (a, b) => a.index - b.index,
        ...this.getColumnSearchProps("index")
      },
      {
        title: "单位名称",
        dataIndex: "name",
        sorter: (a, b) => a.name.length - b.name.length,
        ...this.getColumnSearchProps("name")
      },
      {
        title: "单位描述",
        dataIndex: "desc",
        sorter: (a, b) => a.name.length - b.name.length,
        ...this.getColumnSearchProps("desc")
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

    const data = [
      {
        index: "1",
        name: "柳州柳狮建材有限公司",
        desc: "单位描述7"
      },
      {
        index: "2",
        name: "广西建工建筑安装技工学校",
        desc: "单位描述8"
      },
      {
        index: "3",
        name: "宁乡市国有资产经营有限公司",
        desc: "单位描述9"
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
            // type="primary"
            // shape="round"
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
              const l = selectedRows.length;
              if (l === 0) {
                message.warning("请选择需要删除的单位");
                return;
              }
              message.success(`删除${l}个单位成功`);
            }}
          >
            删除
          </Button>
          <Button
            icon="upload"
            style={{ margin: 10 }}
            onClick={() => {
              message.info("开始批量上传");
            }}
          >
            批量上传
          </Button>
          <Button
            icon="download"
            style={{ margin: 10 }}
            onClick={() => {
              message.info("开始模板下载");
            }}
          >
            模板下载
          </Button>
        </span>
        <Table
          columns={columns}
          dataSource={data}
          rowSelection={rowSelection}
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
      </Systems>
    );
  }
}
