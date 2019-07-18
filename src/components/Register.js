import React, { PureComponent } from "react";
import {
  Steps,
  Form,
  Input,
  Button,
  Table,
  TreeSelect,
  Select,
  DatePicker,
  Avatar,
  Layout,
  Checkbox,
  Row,
  Col,
  Cascader
} from "antd";
import { connect } from "dva";
import moment from "moment";
import emitter from "../utils/event";
import { LocaleProvider } from "antd";
import { createForm } from "rc-form";
import zh_CN from "antd/lib/locale-provider/zh_CN";

const { Header, Footer, Sider, Content } = Layout;
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

@connect(({ user, district }) => ({
  user,
  district
}))
@createForm()
export default class register extends PureComponent {
  state = {
    show: false,
    state: 0,
    type: "account"
    //all: 注册
    //review: 管理员
    //society: 社会用户
    //account: 行政用户
    //role: 行政角色
  };
  componentDidMount() {
    this.eventEmitter = emitter.addListener("showRegister", v => {
      this.props.form.resetFields();
      const h = window.location.hash;
      this.setState({
        state: 0,
        show: v.show,
        type: v.type,
        isLogin: h === "#/login" || h === "#/"
      });
    });
  }

  next = v => {
    this.setState({ state: v });
  };

  setType = v => {
    console.log(v);
    this.setState(v);
  };

  showAdd = v => {
    this.setState({ showAdd: v });
  };

  render() {
    const { show, state, type, isLogin } = this.state;

    return (
      <LocaleProvider locale={zh_CN}>
        <Layout
          style={{
            display: show ? "block" : "none",
            position: "absolute",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,.5)",
            zIndex: 2
          }}
        >
          <Layout
            style={{
              transform: " translate(-50%,-50%)",
              position: "absolute",
              top: "50%",
              left: "50%",
              background: "#fff",
              width: 1000,
              height: "85%",
              padding: 50,
              borderRadius: 10
            }}
          >
            <Button
              type="primary"
              shape="circle"
              icon="close"
              style={{ position: "absolute", right: 20, top: 20 }}
              onClick={() => {
                this.setState({ show: false });
              }}
            />
            <Header style={{ background: "#fff", margin: "0 0 30px 0" }}>
              <Steps
                current={state}
                style={{ background: "#fff", margin: "0 0 30px 0" }}
              >
                <Steps.Step title="填写用户信息" />
                <Steps.Step title="权限分配" />
                <Steps.Step title="完成" />
              </Steps>
            </Header>
            <Content style={{ position: "relative" }}>
              <div style={{ display: state === 0 ? "block" : "none" }}>
                <DomWriteUser
                  type={type}
                  isLogin={isLogin}
                  next={this.next.bind(this)}
                  setType={this.setType.bind(this)}
                />
              </div>
              <div style={{ display: state === 1 ? "block" : "none" }}>
                <DomPower type={type} next={this.next.bind(this)} />
              </div>
              <div style={{ display: state === 2 ? "block" : "none" }}>
                <DomFinish
                  type={type}
                  showAdd={this.showAdd.bind(this)}
                  next={this.next.bind(this)}
                />
              </div>
            </Content>
          </Layout>
        </Layout>
      </LocaleProvider>
    );
  }
}

//填写用户信息
@connect(({ user, district }) => ({
  user,
  district
}))
class FormWriteUser extends PureComponent {
  state = {
    confirmDirty: false,
    autoCompleteResult: [],
    showDistrict: false
  };

  componentDidMount() {
    const {
      form: { resetFields }
    } = this.props;
    this.eventEmitter = emitter.addListener("resetFields", v => {
      console.log(111111);
      resetFields();
      this.setState({ showDistrict: false });
    });
  }

  handleSubmit = e => {
    console.log(this.props);
    e.preventDefault();
    this.props.form.validateFields((err, v) => {
      if (!err) {
        console.log("填写用户信息", v);
        this.props.next(1);
        this.props.setType({ type: v.user_type || this.props.type });
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
  validateToNextPassword = (rule, value, callback) => {
    const { form } = this.props;
    if (value && this.state.confirmDirty) {
      form.validateFields(["confirm"], { force: true });
    }
    callback();
  };

  render() {
    const {
      type,
      isLogin,
      form: { getFieldDecorator },
      district: { districtTree }
    } = this.props;
    console.log(this.props);
    const { showDistrict } = this.state;

    return (
      <Layout style={{ backgroundColor: "#fff" }}>
        <Content>
          <Form
            onSubmit={this.handleSubmit}
            {...formItemLayout}
            style={{ width: 500, margin: "0 auto" }}
          >
            <Form.Item label="账号" hasFeedback>
              {getFieldDecorator("name", {
                initialValue: "",
                rules: [
                  {
                    required: true,
                    message: "请输入账号"
                  }
                ]
              })(<Input />)}
            </Form.Item>
            <Form.Item label="密码" hasFeedback>
              {getFieldDecorator("password", {
                initialValue: "",
                rules: [
                  {
                    required: true,
                    message: "请输入密码"
                  },
                  {
                    validator: this.validateToNextPassword
                  }
                ]
              })(<Input.Password />)}
            </Form.Item>
            <Form.Item label="确认密码" hasFeedback>
              {getFieldDecorator("confirm", {
                initialValue: "",
                rules: [
                  {
                    required: true,
                    message: "请输入确认密码"
                  },
                  {
                    validator: this.compareToFirstPassword
                  }
                ]
              })(<Input.Password onBlur={this.handleConfirmBlur} />)}
            </Form.Item>
            <Form.Item label="姓名" hasFeedback>
              {getFieldDecorator("full_name", {
                initialValue: "",
                rules: [
                  {
                    required: true,
                    message: "请输入姓名"
                  }
                ]
              })(<Input />)}
            </Form.Item>
            <Form.Item label="电话" hasFeedback>
              {getFieldDecorator("phone", {
                initialValue: "",
                rules: [
                  {
                    required: true,
                    message: "请输入电话"
                  }
                ]
              })(<Input />)}
            </Form.Item>
            <Form.Item
              label="用户类型"
              hasFeedback
              style={{ display: isLogin ? "block" : "none" }}
            >
              {getFieldDecorator("user_type", {
                rules: [
                  {
                    required: isLogin,
                    message: "请选择用户类型"
                  }
                ]
              })(
                <Select
                  showSearch
                  allowClear
                  optionFilterProp="children"
                  onChange={e => {
                    console.log(e);
                    this.setState({ showDistrict: e === "account" });
                  }}
                >
                  {[
                    { text: "社会用户", value: "society" },
                    { text: "行政用户", value: "account" }
                  ].map((item, index) => (
                    <Select.Option value={item.value} key={index}>
                      {item.text}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </Form.Item>
            <Form.Item label="有效期至" hasFeedback>
              {getFieldDecorator("time", {
                rules: [
                  { type: "object", required: true, message: "请选择有效期" }
                ]
              })(<DatePicker style={{ width: 330 }} />)}
            </Form.Item>
            {/* <Form.Item
              label="行政区划单位"
              hasFeedback
              style={{ display: showDistrict ? "block" : "none" }}
            >
              {getFieldDecorator("area", {
                initialValue: "",
                rules: [
                  {
                    required: showDistrict,
                    message: "请选择行政区划单位"
                  }
                ]
              })(
                <Cascader
                  options={districtTree}
                  changeOnSelect
                  placeholder="请选择所在地区"
                />
              )}
            </Form.Item> */}
            <Form.Item
              label="行政区划单位"
              hasFeedback
              style={{ display: showDistrict ? "block" : "none" }}
            >
              {getFieldDecorator("area", {
                initialValue: "",
                rules: [
                  {
                    required: showDistrict,
                    message: "请选择行政区划单位"
                  }
                ]
              })(
                <TreeSelect
                  showSearch
                  dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
                  allowClear
                  treeDefaultExpandAll
                >
                  <TreeSelect.TreeNode
                    value="parent 1"
                    title="珠江水利厅"
                    key="0-1"
                  >
                    <TreeSelect.TreeNode
                      value="parent 1-0"
                      title="珠江水利科学研究院"
                      key="0-1-1"
                    >
                      <TreeSelect.TreeNode
                        value="leaf1"
                        title="珠江水利科学研究院遥感所"
                        key="random"
                      />
                      <TreeSelect.TreeNode
                        value="leaf2"
                        title="珠江水利科学研究院中心站"
                        key="random1"
                      />
                    </TreeSelect.TreeNode>
                    <TreeSelect.TreeNode
                      value="parent 1-1"
                      title="珠江水利科学研究院监测站"
                      key="random2"
                    >
                      <TreeSelect.TreeNode
                        value="sss"
                        title="珠江水利科学研究院办公室"
                        key="random3"
                      />
                    </TreeSelect.TreeNode>
                  </TreeSelect.TreeNode>
                </TreeSelect>
              )}
            </Form.Item>
            <Footer
              style={{
                backgroundColor: "transparent",
                position: "absolute",
                bottom: 0,
                left: "50%",
                transform: "translateX(-50%)"
              }}
            >
              <Button type="primary" htmlType="submit">
                下一步
              </Button>
            </Footer>
          </Form>
        </Content>
      </Layout>
    );
  }
}
const DomWriteUser = Form.create({ name: "FormWriteUserName" })(FormWriteUser);

//权限分配
@connect(({ user }) => ({
  user
}))
class power extends PureComponent {
  state = {
    value: 1,
    powerList: [{}]
  };

  componentDidMount() {
    // this.powerList();
  }

  powerList = () => {
    const { dispatch } = this.props;
    dispatch({ type: "user/powerList" });
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
    const {
      type,
      user: { powerList }
    } = this.props;

    const dataSource = powerList.map(item => {
      return { ...item, key: item.name, time: "2019-08-08" };
    });

    const columns = [
      {
        title: "模块名",
        dataIndex: "displayName"
      },
      {
        title: "有效期",
        dataIndex: "time",
        render: (text, record) => (
          <span
            onClick={() => {
              console.log(record);
            }}
          >
            <DatePicker
              defaultValue={moment(
                new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1e3),
                "YYYY-MM-DD"
              )}
            />
          </span>
        )
      },
      {
        title: "描述",
        dataIndex: "description"
      }
    ];

    const rowSelection = {
      onChange: (selectedRowKeys, selectedRows) => {
        console.log(selectedRows);
      }
    };

    return (
      <Layout style={{ backgroundColor: "#fff" }}>
        <Sider
          theme="light"
          style={{
            display: type === "account" ? "block" : "none"
          }}
        >
          <Checkbox.Group>
            <Row>
              {[
                "Web端试用角色",
                "Web端付费角色",
                "移动端试用角色",
                "移动端付费角色",
                "管理员",
                "超级管理员"
              ].map((item, index) => (
                <Col span={24} key={index}>
                  <Checkbox value={item}>{item}</Checkbox>
                  <br />
                </Col>
              ))}
            </Row>
          </Checkbox.Group>
        </Sider>
        <Content>
          <Form
            onSubmit={this.handleSubmit}
            {...formItemLayout}
            style={{ width: 500, margin: "0 auto" }}
          >
            <Form.Item
              label="所属项目"
              hasFeedback
              style={{ display: type === "society" ? "block" : "none" }}
            >
              {getFieldDecorator("project", {
                rules: [
                  {
                    required: type === "society",
                    message: "请输入所属项目"
                  }
                ]
              })(<Input />)}
            </Form.Item>
            <Form.Item
              label="单位类型"
              hasFeedback
              style={{ display: type === "society" ? "block" : "none" }}
            >
              {getFieldDecorator("company_type", {
                rules: [
                  {
                    required: type === "society",
                    message: "请选择单位类型"
                  }
                ]
              })(
                <Select showSearch allowClear optionFilterProp="children">
                  {[
                    { text: "建设单位", value: 1 },
                    { text: "方案编制单位", value: 2 },
                    { text: "监测单位", value: 3 },
                    { text: "监理单位", value: 4 },
                    { text: "设计单位", value: 5 },
                    { text: "施工单位", value: 6 },
                    { text: "验收报告单位", value: 7 }
                  ].map((item, index) => (
                    <Select.Option value={item.value} key={index}>
                      {item.text}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </Form.Item>
            <Footer
              style={{
                backgroundColor: "transparent",
                position: "absolute",
                bottom: 0,
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
              <Button type="primary" htmlType="submit">
                下一步
              </Button>
            </Footer>
          </Form>

          <Table
            style={{
              display: type === "account" || type === "role" ? "block" : "none"
            }}
            rowSelection={rowSelection}
            columns={columns}
            dataSource={dataSource}
            size="small"
          />
        </Content>
      </Layout>
    );
  }
}
const DomPower = Form.create({ name: "PowerName" })(power);

//完成
class finish extends PureComponent {
  render() {
    return (
      <Layout style={{ backgroundColor: "#fff" }}>
        <Content style={{ textAlign: "center" }}>
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
        </Content>
        <Footer
          style={{
            backgroundColor: "transparent",
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
              emitter.emit("resetFields", {});
            }}
          >
            再建一个
          </Button>
        </Footer>
      </Layout>
    );
  }
}
const DomFinish = Form.create({ name: "finishName" })(finish);
