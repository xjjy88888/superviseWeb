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
  Typography,
  Layout
} from "antd";
import moment from "moment";
import Systems from "../../../../components/Systems";

const { Title } = Typography;
const { Header, Footer, Sider, Content } = Layout;

export default class account extends PureComponent {
  state = {
    state: 0,
    showAdd: false
  };

  next = v => {
    this.setState({ state: v });
  };

  showAdd = v => {
    this.setState({ showAdd: v });
  };

  render() {
    const { state, showAdd } = this.state;

    return (
      <Systems>
        <div
          style={{
            background: "#fff",
            position: "relative",
            height: "100%"
          }}
        >
          <div style={{ display: !showAdd ? "block" : "none" }}>
            <DomList
              showAdd={this.showAdd.bind(this)}
              next={this.next.bind(this)}
            />
          </div>
          <div
            style={{
              display: showAdd ? "block" : "none",
              padding: "10px 40px 0 0"
            }}
          >
            <Button
              type="primary"
              shape="circle"
              icon="close"
              style={{ position: "absolute", right: -10, top: -10 }}
              onClick={() => {
                this.showAdd(false);
              }}
            />
            <Steps current={state} style={{ margin: "0 0 30px 0" }}>
              <Steps.Step title="填写用户信息" />
              <Steps.Step title="权限分配" />
              <Steps.Step title="完成" />
            </Steps>
            <div style={{ display: state === 0 ? "block" : "none" }}>
              <DomWriteUser next={this.next.bind(this)} />
            </div>
            <div style={{ display: state === 1 ? "block" : "none" }}>
              <DomPower next={this.next.bind(this)} />
            </div>
            <div style={{ display: state === 2 ? "block" : "none" }}>
              <DomFinish
                showAdd={this.showAdd.bind(this)}
                next={this.next.bind(this)}
              />
            </div>
          </div>
        </div>
      </Systems>
    );
  }
}

//列表
class DomList extends PureComponent {
  state = {};
  render() {
    const columns = [
      {
        title: "序号",
        dataIndex: "key"
      },
      {
        title: "用户名称",
        dataIndex: "name"
      },
      {
        title: "登录名",
        dataIndex: "login"
      },
      {
        title: "联系电话",
        dataIndex: "phone"
      },
      {
        title: "住址",
        dataIndex: "address"
      }
    ];

    const data = [
      {
        key: "1",
        name: "水利部",
        login: "水利部办事员",
        phone: "135 6666 9999",
        address: "广东省广州市天河区"
      },
      {
        key: "2",
        name: "水利部",
        login: "水利部办事员",
        phone: "135 6666 9999",
        address: "广东省广州市天河区"
      },
      {
        key: "3",
        name: "水利部",
        login: "水利部办事员",
        phone: "135 6666 9999",
        address: "广东省广州市天河区"
      },
      {
        key: "4",
        name: "水利部",
        login: "水利部办事员",
        phone: "135 6666 9999",
        address: "广东省广州市天河区"
      },
      {
        key: "5",
        name: "水利部",
        login: "水利部办事员",
        phone: "135 6666 9999",
        address: "广东省广州市天河区"
      },
      {
        key: "6",
        name: "水利部",
        login: "水利部办事员",
        phone: "135 6666 9999",
        address: "广东省广州市天河区"
      },
      {
        key: "7",
        name: "水利部",
        login: "水利部办事员",
        phone: "135 6666 9999",
        address: "广东省广州市天河区"
      },
      {
        key: "8",
        name: "水利部",
        login: "水利部办事员",
        phone: "135 6666 9999",
        address: "广东省广州市天河区"
      },
      {
        key: "9",
        name: "水利部",
        login: "水利部办事员",
        phone: "135 6666 9999",
        address: "广东省广州市天河区"
      },
      {
        key: "10",
        name: "水利部",
        login: "水利部办事员",
        phone: "135 6666 9999",
        address: "广东省广州市天河区"
      },
      {
        key: "11",
        name: "水利部",
        login: "水利部办事员",
        phone: "135 6666 9999",
        address: "广东省广州市天河区"
      },
      {
        key: "12",
        name: "水利部",
        login: "水利部办事员",
        phone: "135 6666 9999",
        address: "广东省广州市天河区"
      },
      {
        key: "13",
        name: "水利部",
        login: "水利部办事员",
        phone: "135 6666 9999",
        address: "广东省广州市天河区"
      },
      {
        key: "14",
        name: "水利部",
        login: "水利部办事员",
        phone: "135 6666 9999",
        address: "广东省广州市天河区"
      },
      {
        key: "15",
        name: "水利部",
        login: "水利部办事员",
        phone: "135 6666 9999",
        address: "广东省广州市天河区"
      },
      {
        key: "16",
        name: "水利部",
        login: "水利部办事员",
        phone: "135 6666 9999",
        address: "广东省广州市天河区"
      },
      {
        key: "17",
        name: "水利部",
        login: "水利部办事员",
        phone: "135 6666 9999",
        address: "广东省广州市天河区"
      },
      {
        key: "18",
        name: "水利部",
        login: "水利部办事员",
        phone: "135 6666 9999",
        address: "广东省广州市天河区"
      },
      {
        key: "19",
        name: "水利部",
        login: "水利部办事员",
        phone: "135 6666 9999",
        address: "广东省广州市天河区"
      },
      {
        key: "20",
        name: "水利部",
        login: "水利部办事员",
        phone: "135 6666 9999",
        address: "广东省广州市天河区"
      },
      {
        key: "21",
        name: "水利部",
        login: "水利部办事员",
        phone: "135 6666 9999",
        address: "广东省广州市天河区"
      }
    ];

    const rowSelection = {
      onChange: (selectedRowKeys, selectedRows) => {
        console.log(selectedRows);
      }
    };
    return (
      <Layout>
        <Sider width={300} theme="light" style={{ borderRadius: "10px 0 0 0" }}>
          <Title level={4}>部门</Title>
          <Tree.DirectoryTree
            multiple
            defaultExpandAll
            onSelect={(keys, event) => {
              console.log("Trigger Select", keys, event);
            }}
          >
            <Tree.TreeNode title="中华人民共和国水利部" key="0-0">
              <Tree.TreeNode title="贵州省水利厅" key="0-0-0">
                <Tree.TreeNode title="贵阳市水务管理局" key="0-0-0-0" isLeaf />
                <Tree.TreeNode title="遵义市水务局" key="0-0-0-1" isLeaf />
                <Tree.TreeNode title="毕节市水务局" key="0-0-0-2" isLeaf />
              </Tree.TreeNode>
              <Tree.TreeNode title="广东省水利厅" key="0-0-1">
                <Tree.TreeNode title="广州市水务局" key="0-0-1-0" isLeaf />
              </Tree.TreeNode>
              <Tree.TreeNode title="广西壮族自治区水利厅" key="0-0-2">
                <Tree.TreeNode title="南宁市水务局" key="0-0-2-0" isLeaf />
                <Tree.TreeNode title="北海市水务局" key="0-0-2-1" isLeaf />
              </Tree.TreeNode>
            </Tree.TreeNode>
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
            用户
            <span style={{ float: "right" }}>
              <Button
                type="primary"
                shape="circle"
                icon="plus"
                style={{ marginLeft: 10 }}
                onClick={() => {
                  this.props.next(0);
                  this.props.showAdd(true);
                }}
              />
              <Button
                type="primary"
                shape="circle"
                icon="edit"
                style={{ marginLeft: 10 }}
                onClick={() => {
                  message.info("开始编辑");
                }}
              />
              <Button
                type="primary"
                shape="circle"
                icon="delete"
                style={{ marginLeft: 10 }}
                onClick={() => {
                  message.info("开始删除");
                }}
              />
            </span>
          </Title>
          <Table
            columns={columns}
            dataSource={data}
            rowSelection={rowSelection}
          />
        </Content>
      </Layout>
    );
  }
}

//填写用户信息
class FormWriteUser extends PureComponent {
  state = {
    confirmDirty: false,
    autoCompleteResult: []
  };

  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        console.log("填写用户信息", values);
        this.props.next(1);
      }
    });
  };

  compareToFirstPassword = (rule, value, callback) => {
    const form = this.props.form;
    if (value && value !== form.getFieldValue("password")) {
      callback("您输入的两个密码不一致！");
    } else {
      callback();
    }
  };
  handleConfirmBlur = e => {
    const value = e.target.value;
    this.setState({ confirmDirty: this.state.confirmDirty || !!value });
  };

  render() {
    const { getFieldDecorator } = this.props.form;

    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 8 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 }
      }
    };

    return (
      <Form
        onSubmit={this.handleSubmit}
        {...formItemLayout}
        style={{ width: 500, margin: "0 auto" }}
      >
        <Form.Item label="用户名" hasFeedback>
          {getFieldDecorator("user", {
            rules: [
              {
                required: true,
                message: "请输入用户名"
              }
            ]
          })(
            <Input
              prefix={<Icon type="user" style={{ color: "rgba(0,0,0,.25)" }} />}
            />
          )}
        </Form.Item>
        <Form.Item label="用户密码" hasFeedback>
          {getFieldDecorator("password", {
            rules: [
              {
                required: true,
                message: "请输入用户密码"
              }
            ]
          })(
            <Input.Password
              prefix={<Icon type="lock" style={{ color: "rgba(0,0,0,.25)" }} />}
            />
          )}
        </Form.Item>
        <Form.Item label="确认密码" hasFeedback>
          {getFieldDecorator("confirm_password", {
            rules: [
              {
                required: true,
                message: "请输入确认密码"
              },
              {
                validator: this.compareToFirstPassword
              }
            ]
          })(
            <Input.Password
              prefix={<Icon type="lock" style={{ color: "rgba(0,0,0,.25)" }} />}
              onBlur={this.handleConfirmBlur}
            />
          )}
        </Form.Item>
        <Form.Item label="用户单位" hasFeedback>
          {getFieldDecorator("department", {
            rules: [
              {
                required: true,
                message: "请选择用户单位"
              }
            ]
          })(
            <TreeSelect
              showSearch
              dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
              allowClear
              treeDefaultExpandAll
              onChange={this.onChange}
            >
              <TreeSelect.TreeNode value="广东" title="广东" key="广东">
                <TreeSelect.TreeNode value="广州" title="广州" key="广州">
                  <TreeSelect.TreeNode value="天河" title="天河" key="天河" />
                  <TreeSelect.TreeNode value="越秀" title="越秀" key="越秀" />
                </TreeSelect.TreeNode>
                <TreeSelect.TreeNode value="佛山" title="佛山" key="佛山" />
              </TreeSelect.TreeNode>
              <TreeSelect.TreeNode value="北京" title="北京" key="北京" />
            </TreeSelect>
          )}
        </Form.Item>
        <span
          style={{
            position: "absolute",
            bottom: 20,
            left: "50%",
            transform: "translateX(-50%)"
          }}
        >
          <Button type="primary" htmlType="submit">
            下一步
          </Button>
        </span>
      </Form>
    );
  }
}
const DomWriteUser = Form.create({ name: "FormWriteUserName" })(FormWriteUser);

//权限分配
class Power extends PureComponent {
  state = {
    value: 1,
    powerList: [{}]
  };

  onChange = e => {
    console.log("radio checked", e.target.value);
    this.setState({
      value: e.target.value
    });
  };

  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        console.log("权限分配", values);
        this.props.next(2);
      }
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { powerList } = this.state;

    const radioStyle = {
      display: "block",
      height: "30px",
      lineHeight: "30px"
    };

    const columns = [
      {
        title: "模块名",
        dataIndex: "name"
      },
      {
        title: "有效期",
        dataIndex: "timeStart",
        render: (text, record) => (
          <span
            onClick={() => {
              console.log(record);
            }}
          >
            <DatePicker.RangePicker
              defaultValue={[moment(record.timeStart), moment(record.timeEnd)]}
            />
            {/* {record.timeStart} 至 {record.timeEnd} */}
          </span>
        )
      }
    ];
    const data = [
      {
        key: "1",
        name: "区域监管",
        timeStart: "2018-01-01",
        timeEnd: "2018-04-01"
      },
      {
        key: "2",
        name: "项目监管",
        timeStart: "2019-01-01",
        timeEnd: "2019-04-01"
      },
      {
        key: "3",
        name: "责任追究",
        timeStart: "2020-01-01",
        timeEnd: "2020-04-01"
      },
      {
        key: "4",
        name: "责任追究",
        timeStart: "2021-01-01",
        timeEnd: "2021-04-01"
      },
      {
        key: "5",
        name: "责任追究",
        timeStart: "2022-01-01",
        timeEnd: "2022-04-01"
      },
      {
        key: "6",
        name: "责任追究",
        timeStart: "2020-01-01",
        timeEnd: "2020-04-01"
      },
      {
        key: "7",
        name: "责任追究",
        timeStart: "2020-01-01",
        timeEnd: "2020-04-01"
      },
      {
        key: "8",
        name: "责任追究",
        timeStart: "2020-01-01",
        timeEnd: "2020-04-01"
      },
      {
        key: "9",
        name: "责任追究",
        timeStart: "2020-01-01",
        timeEnd: "2020-04-01"
      },
      {
        key: "10",
        name: "责任追究",
        timeStart: "2020-01-01",
        timeEnd: "2020-04-01"
      },
      {
        key: "11",
        name: "责任追究",
        timeStart: "2020-01-01",
        timeEnd: "2020-04-01"
      },
      {
        key: "12",
        name: "责任追究",
        timeStart: "2020-01-01",
        timeEnd: "2020-04-01"
      }
    ];

    const rowSelection = {
      onChange: (selectedRowKeys, selectedRows) => {
        console.log(selectedRows);
      }
    };

    return (
      <div
        style={{
          overflow: "hidden"
        }}
      >
        <Radio.Group
          onChange={this.onChange}
          value={this.state.value}
          style={{ float: "left", width: 300 }}
        >
          <Radio style={radioStyle} value={1}>
            Web端试用角色
          </Radio>
          <Radio style={radioStyle} value={2}>
            Web端付费角色
          </Radio>
          <Radio style={radioStyle} value={3}>
            移动端试用角色
          </Radio>
          <Radio style={radioStyle} value={4}>
            移动端付费角色
          </Radio>
          <Radio style={radioStyle} value={5}>
            管理员
          </Radio>
        </Radio.Group>
        <div
          style={{
            overflow: "auto"
          }}
        >
          <Table
            rowSelection={rowSelection}
            columns={columns}
            dataSource={data}
            // pagination={{ pageSize: 9 }}
            size="small"
          />
          <span
            style={{
              position: "absolute",
              bottom: 20,
              left: "50%",
              transform: "translateX(-50%)"
            }}
          >
            <Button
              type="primary"
              style={{ marginRight: 20 }}
              onClick={() => {
                this.props.next(0);
              }}
            >
              上一步
            </Button>
            <Button
              type="primary"
              onClick={() => {
                this.props.next(2);
              }}
            >
              下一步
            </Button>
          </span>
        </div>
      </div>
    );
  }
}
const DomPower = Form.create({ name: "PowerName" })(Power);

//完成
class DomFinish extends PureComponent {
  render() {
    return (
      <div>
        <div style={{ textAlign: "center" }}>
          <Avatar
            style={{ backgroundColor: "#87d068" }}
            icon="check"
            size={80}
          />
          <p style={{ margin: 30, fontSize: 30 }}>创建成功</p>
          <div>
            <p>
              <b>用户名：</b>
              <span>描述内容详细内容</span>
            </p>
            <p>
              <b>用户名：</b>
              <span>描述内容详细内容</span>
            </p>
            <p>
              <b>用户名：</b>
              <span>描述内容详细内容</span>
            </p>
          </div>
        </div>
        <span
          style={{
            position: "absolute",
            bottom: 20,
            left: "50%",
            transform: "translateX(-50%)"
          }}
        >
          <Button
            type="primary"
            style={{ marginRight: 20 }}
            onClick={() => {
              this.props.next(0);
            }}
          >
            再建一个
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            onClick={() => {
              this.props.showAdd(false);
            }}
          >
            查看用户列表
          </Button>
        </span>
      </div>
    );
  }
}
