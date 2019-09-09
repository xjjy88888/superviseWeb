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
  Col
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

@connect(({ user, district, role }) => ({
  user,
  district,
  role
}))
@createForm()
export default class register extends PureComponent {
  state = {
    show: false,
    state: 0,
    type: "role",
    user: {},
    finishData: [],
    id: null
    //all: 注册
    //review: 管理员
    //society: 社会用户
    //account: 行政用户
    //role: 行政角色
  };

  componentDidMount() {
    this.eventEmitter = emitter.addListener("showRegister", v => {
      console.log(v);
      this.props.form.resetFields();
      const h = window.location.hash;
      this.setState({
        state: 0,
        show: v.show,
        id: v.item.id,
        type: v.type,
        isLogin: h === "#/login" || h === "#/"
      });
    });
  }

  saveState = v => {
    this.setState(v);
  };

  finish = () => {
    const {
      form: { resetFields }
    } = this.props;
    resetFields();
  };

  submit = power => {
    const { dispatch } = this.props;
    const { user, type, id } = this.state;

    console.log("提交", type, user, power);

    if (type === "role") {
      dispatch({
        type: "role/roleCreateUpdate",
        payload: {
          ...user,
          id: id,
          permissions: power.permissions
        },
        callback: (success, error, result) => {
          if (success) {
            this.setState({
              state: 2,
              finishData: [
                { name: "角色标识", cont: result.name },
                { name: "角色名", cont: result.displayName },
                { name: "描述", cont: result.description }
              ]
            });
            this.props.refresh(true);
          }
        }
      });
    }
  };

  render() {
    const { show, state, type, isLogin, finishData } = this.state;

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
                  saveState={this.saveState}
                />
              </div>
              <div style={{ display: state === 1 ? "block" : "none" }}>
                <DomPower
                  type={type}
                  saveState={this.saveState}
                  submit={this.submit}
                />
              </div>
              <div style={{ display: state === 2 ? "block" : "none" }}>
                <DomFinish
                  type={type}
                  data={finishData}
                  saveState={this.saveState}
                  finish={this.finish}
                />
              </div>
            </Content>
          </Layout>
        </Layout>
      </LocaleProvider>
    );
  }
}

//填写用户信息1
@connect(({ user, district }) => ({
  user,
  district
}))
class FormWriteUser extends PureComponent {
  state = {
    confirmDirty: false,
    autoCompleteResult: [],
    showDistrict: false,
    id: null
  };

  componentDidMount() {
    const {
      form: { resetFields, setFieldsValue }
    } = this.props;
    this.eventEmitter = emitter.addListener("showRegister", v => {
      console.log(v);
      if (v.status === "add") {
        resetFields();
      } else {
        this.setState({ id: v.item.id });
        if (v.type === "role") {
          setFieldsValue({
            name: v.item.name,
            displayName: v.item.displayName,
            description: v.item.description
          });
        }
      }
    });
  }

  handleSubmit = e => {
    console.log(this.props);
    e.preventDefault();
    this.props.form.validateFields((err, v) => {
      console.log("填写用户信息", err, v);
      if (!err) {
        this.props.saveState({ user: v, state: 1 });
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
      form: { getFieldDecorator }
      // district: { districtTree }
    } = this.props;
    const { showDistrict } = this.state;
    // console.log(type);

    const showRole = { display: type === "role" ? "block" : "none" };
    const hideRole = { display: type === "role" ? "none" : "block" };

    return (
      <Layout style={{ backgroundColor: "#fff" }}>
        <Content>
          <Form
            onSubmit={this.handleSubmit}
            {...formItemLayout}
            style={{ width: 500, margin: "0 auto" }}
          >
            <Form.Item
              label={type === "role" ? "角色标识" : "账号"}
              hasFeedback
            >
              {getFieldDecorator("name", {
                initialValue: "",
                rules: [
                  {
                    required: true,
                    message: `请输入${type === "role" ? "角色标识" : "账号"}`
                  }
                ]
              })(<Input placeholder={type === "role" ? "请输入英文" : ""} />)}
            </Form.Item>
            <Form.Item label="密码" hasFeedback style={hideRole}>
              {getFieldDecorator("password", {
                initialValue: "",
                rules: [
                  {
                    required: type !== "role",
                    message: "请输入密码"
                  },
                  {
                    validator: this.validateToNextPassword
                  }
                ]
              })(<Input.Password />)}
            </Form.Item>
            <Form.Item label="确认密码" hasFeedback style={hideRole}>
              {getFieldDecorator("confirm", {
                initialValue: "",
                rules: [
                  {
                    required: type !== "role",
                    message: "请输入确认密码"
                  },
                  {
                    validator: this.compareToFirstPassword
                  }
                ]
              })(<Input.Password onBlur={this.handleConfirmBlur} />)}
            </Form.Item>
            <Form.Item label={type === "role" ? "角色名" : "姓名"} hasFeedback>
              {getFieldDecorator("displayName", {
                initialValue: "",
                rules: [
                  {
                    required: true,
                    message: `请输入${type === "role" ? "角色名" : "姓名"}`
                  }
                ]
              })(<Input />)}
            </Form.Item>
            <Form.Item label="电话" hasFeedback style={hideRole}>
              {getFieldDecorator("phone", {
                initialValue: "",
                rules: [
                  {
                    required: type !== "role",
                    message: `请输入电话`
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
            <Form.Item label="有效期至" hasFeedback style={hideRole}>
              {getFieldDecorator("time", {
                rules: [
                  {
                    type: "object",
                    required: type !== "role",
                    message: "请选择有效期"
                  }
                ]
              })(<DatePicker style={{ width: 330 }} />)}
            </Form.Item>
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
            <Form.Item label="描述" hasFeedback>
              {getFieldDecorator("description", {
                initialValue: ""
              })(<Input />)}
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
@connect(({ user, role }) => ({
  user,
  role
}))
class power extends PureComponent {
  state = {
    value: 1,
    permissions: []
  };

  componentDidMount() {
    this.powerList();
    this.eventEmitter = emitter.addListener("showRegister", v => {
      console.log(v);
      if (v.status === "add") {
        this.setState({
          permissions: []
        });
      } else {
        this.setState({ id: v.item.id });
        if (v.type === "role") {
          this.setState({
            permissions: v.item.permissions
          });
        }
      }
    });
  }

  powerList = () => {
    const { dispatch } = this.props;
    dispatch({ type: "role/powerList" });
  };

  onChange = e => {
    console.log("radio checked", e.target.value);
    this.setState({
      value: e.target.value
    });
  };

  handleSubmit = e => {
    const { permissions } = this.state;

    e.preventDefault();

    this.props.form.validateFields((err, v) => {
      if (!err) {
        console.log("权限分配", v, permissions);
        this.props.submit({ ...v, permissions });
      }
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const {
      type,
      role: { powerList }
    } = this.props;

    const { permissions } = this.state;

    const dataSource = powerList.items.map(item => {
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
      selectedRowKeys: permissions,
      onChange: permissions => {
        console.log(permissions);
        this.setState({
          permissions
        });
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
                  this.props.saveState({ state: 0 });
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
            selection={["SuperAdmin"]}
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
    const { data } = this.props;
    return (
      <Layout style={{ backgroundColor: "#fff" }}>
        <Content style={{ textAlign: "center" }}>
          <Avatar
            style={{ backgroundColor: "#87d068" }}
            icon="check"
            size={80}
          />
          <p style={{ margin: 30, fontSize: 30 }}>成功</p>
          <div>
            {data.map((item, index) => (
              <p key={index}>
                <b>{item.name}：</b>
                <span>{item.cont}</span>
              </p>
            ))}
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
              this.props.saveState({ show: false });
            }}
          >
            完成
          </Button>
        </Footer>
      </Layout>
    );
  }
}
const DomFinish = Form.create({ name: "finishName" })(finish);
