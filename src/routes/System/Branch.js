import React, { PureComponent } from "react";
import {
  Form,
  Icon,
  Input,
  Button,
  Table,
  message,
  Modal,
  notification,
  Select
} from "antd";
import { createForm } from "rc-form";
import Systems from "../../components/Systems";
import { connect } from "dva";
import Highlighter from "react-highlight-words";

let self;

@createForm()
@connect(({ company }) => ({ company }))
export default class company extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      state: 0,
      visible: false,
      selectedRows: [],
      dataSource: [],
      pagination: {},
      loading: false,
      id: null
    };
  }

  componentDidMount() {
    self = this;
    this.companyList();
  }

  companyList = (
    params = { isBuild: false, SkipCount: 0, MaxResultCount: 10 }
  ) => {
    const { dispatch } = this.props;
    this.setState({ loading: true });
    dispatch({
      type: "company/companyList",
      payload: params,
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
    this.companyList({
      isBuild: false,
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
      visible,
      selectedRows,
      loading,
      pagination,
      dataSource,
      id
    } = this.state;
    const {
      dispatch,
      form: { getFieldDecorator, resetFields }
    } = this.props;

    const columns = [
      {
        title: "单位名称",
        dataIndex: "name",
        ...this.getColumnSearchProps("name")
      },
      {
        title: "单位类型",
        dataIndex: "depType",
        render: item =>
          item === 2
            ? "方案编制单位"
            : item === 3
            ? "设计单位"
            : item === 4
            ? "施工单位"
            : item === 5
            ? "监测单位"
            : item === 6
            ? "监理单位"
            : item === 7
            ? "验收报告编制单位"
            : ""
      },
      {
        title: "单位描述",
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
                  name: record.name,
                  depType: record.depType,
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
                      type: "company/companyDelete",
                      payload: record.id,
                      callback: (success, error, result) => {
                        if (success) {
                          self.setState({
                            visible: false
                          });
                          self.companyList();
                        }
                        notification[success ? "success" : "error"]({
                          message: `删除1条单位数据${
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
                message.warning("请选择需要删除的单位");
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
                    type: "company/companyDeleteMul",
                    payload: { id: selectedRows.map(item => item.id) },
                    callback: (success, error, result) => {
                      if (success) {
                        self.setState({
                          visible: false
                        });
                        self.companyList();
                      }
                      notification[success ? "success" : "error"]({
                        message: `删除${l}条单位数据${
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
          rowSelection={rowSelection}
          rowKey={record => record.id}
          dataSource={dataSource}
          pagination={pagination}
          loading={loading}
          onChange={this.handleTableChange}
        />
        <Modal
          title="新建单位"
          visible={visible}
          onOk={() => {
            this.props.form.validateFields((err, v) => {
              console.log("表单信息", v);
              if (!v.name) {
                message.warning("请填写单位名称");
                return;
              }
              if (!v.depType) {
                message.warning("请选择单位类型");
                return;
              }
              dispatch({
                type: "company/companyCreateUpdate",
                payload: { ...v, id: id },
                callback: (success, error, result) => {
                  if (success) {
                    this.setState({
                      visible: false
                    });
                    notification["success"]({
                      message: `${id ? "编辑" : "新建"}单位成功`
                    });
                    this.companyList();
                  } else {
                    notification["error"]({
                      message: `${id ? "编辑" : "新建"}单位失败：${
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
                  <b style={{ color: "red" }}>*</b>单位类型
                </span>
              }
              hasFeedback
            >
              {getFieldDecorator("depType", {})(
                <Select
                  showSearch
                  allowClear
                  optionFilterProp="children"
                  style={{ width: 180 }}
                >
                  {[
                    { text: "方案编制单位", value: 2 },
                    { text: "设计单位", value: 3 },
                    { text: "施工单位", value: 4 },
                    { text: "监测单位", value: 5 },
                    { text: "监理单位", value: 6 },
                    { text: "验收报告编制单位", value: 7 }
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
                  <b style={{ color: "#fff" }}>*</b>单位描述
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
      </Systems>
    );
  }
}
