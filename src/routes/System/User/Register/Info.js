/* eslint-disable array-callback-return */
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
import emitter from "../../../../utils/event";
import { LocaleProvider } from "antd";
import { createForm } from "rc-form";
import zh_CN from "antd/lib/locale-provider/zh_CN";
import Spins from "../../../../components/Spins";

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

//填写用户信息
@createForm()
@connect(({ user, district, departs }) => ({
  user,
  district,
  departs
}))
class Info extends PureComponent {
  state = {
    confirmDirty: false,
    autoCompleteResult: [],
    id: null,
    type: "",
    status: "", // add 新建  edit 编辑
    userType: "",
    loading: false
    // login: 注册
    // society: 社会用户
    // admin: 行政用户
    // role: 行政角色
  };

  componentDidMount() {
    const {
      form: { resetFields, setFieldsValue }
    } = this.props;

    this.eventEmitter = emitter.addListener("showRegister", v => {
      console.log(v);
      this.setState({ type: v.type, status: v.status });
      if (v.status === "add") {
        resetFields();
        this.departsTree();
      } else {
        this.setState({ id: v.item.id });
        if (v.type === "role") {
          setFieldsValue({
            name: v.item.name,
            displayName: v.item.displayName
          });
        } else if (v.type === "society" || v.type === "admin") {
          console.log(v.item.userType);
          this.setState({ userType: v.item.userType });
          setFieldsValue({
            userName: v.item.userName,
            displayName: v.item.displayName,
            phoneNumber: v.item.phoneNumber
          });
          this.departsTree(result => {
            setFieldsValue({
              govDepartmentId: this.find(v.item.govDepartmentId, result)
            });
          });
        }
      }
    });
  }

  find = (v, list) => {
    let data;
    (list || []).map(i => {
      if (i.value === v) {
        data = [i.value];
      } else {
        const child = this.find(v, i.children);
        if (child) {
          data = [i.value, ...child];
        }
      }
    });
    return data;
  };

  departsTree = fn => {
    const { dispatch } = this.props;
    this.setState({ loading: true });
    dispatch({
      type: "departs/departsTree",
      callback: (success, error, result) => {
        this.setState({ loading: false });
        if (success && fn) {
          fn(result.items);
        }
      }
    });
  };

  handleSubmit = e => {
    e.preventDefault();
    const { type, userType } = this.state;
    this.props.form.validateFields((err, v) => {
      console.log("填写用户信息1", v, type);
      if (!err) {
        emitter.emit("setUserType", {
          type:
            type === "login"
              ? v.userType
              : type === "admin"
              ? 0
              : type === "society"
              ? 1
              : type === "role"
              ? 2
              : 3
        });
        const g = v.govDepartmentId;
        this.props.saveState({
          user: { ...v, userType, govDepartmentId: g[g.length - 1] },
          state: 1
        });
      }
    });
  };

  compareToFirstPassword = (rule, value, callback) => {
    const {
      form: { getFieldValue }
    } = this.props;
    if (value && value !== getFieldValue("password")) {
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

  showStyle = v => {
    return { display: v ? "block" : "none" };
  };

  render() {
    const {
      isLogin,
      show,
      form: { getFieldDecorator },
      departs: { departsTree, userList }
    } = this.props;
    const { type, userType, status, loading } = this.state;

    const showRole = { display: type === "role" ? "block" : "none" };
    const hideRole = { display: type === "role" ? "none" : "block" };

    return (
      <Layout
        style={{
          backgroundColor: "#fff"
        }}
      >
        <Spins show={loading} />
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
              {getFieldDecorator(type === "role" ? "name" : "userName", {
                initialValue: "",
                rules: [
                  {
                    required: true,
                    message: `请输入${type === "role" ? "角色标识" : "账号"}`
                  }
                ]
              })(
                <Input
                  placeholder={type === "role" ? "请输入英文" : ""}
                  maxLength={20}
                />
              )}
            </Form.Item>
            <Form.Item
              label="密码"
              hasFeedback
              style={this.showStyle(type !== "role" && status === "add")}
            >
              {getFieldDecorator("password", {
                initialValue: "",
                rules: [
                  {
                    required: type !== "role" && status === "add",
                    message: "请输入密码"
                  },
                  {
                    validator: this.validateToNextPassword
                  }
                ]
              })(<Input.Password maxLength={30} />)}
            </Form.Item>
            <Form.Item
              label="确认密码"
              hasFeedback
              style={this.showStyle(type !== "role" && status === "add")}
            >
              {getFieldDecorator("confirm", {
                initialValue: "",
                rules: [
                  {
                    required: type !== "role" && status === "add",
                    message: "请输入确认密码"
                  },
                  {
                    validator: this.compareToFirstPassword
                  }
                ]
              })(
                <Input.Password
                  onBlur={this.handleConfirmBlur}
                  maxLength={30}
                />
              )}
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
              })(<Input maxLength={20} />)}
            </Form.Item>
            <Form.Item
              label="电话"
              hasFeedback
              style={this.showStyle(type !== "role")}
            >
              {getFieldDecorator("phoneNumber", {
                initialValue: "",
                rules: [
                  {
                    required: type !== "role",
                    message: `请输入电话`
                  }
                ]
              })(<Input maxLength={11} />)}
            </Form.Item>
            <Form.Item
              label="用户类型"
              hasFeedback
              style={{ display: isLogin ? "block" : "none" }}
            >
              {getFieldDecorator("userType", {
                rules: [
                  {
                    required: isLogin,
                    message: "请选择用户类型"
                  }
                ]
              })(
                <Select
                  showSearch
                  optionFilterProp="children"
                  onChange={userType => {
                    this.setState({ userType });
                  }}
                >
                  {[
                    { text: "社会用户", value: 1 },
                    { text: "行政用户", value: 0 }
                  ].map((item, index) => (
                    <Select.Option value={item.value} key={index}>
                      {item.text}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </Form.Item>
            <Form.Item
              label={userType === 1 ? `提交审核单位` : `所属单位`}
              hasFeedback
              style={{ display: type !== "role" ? "block" : "none" }}
            >
              {getFieldDecorator("govDepartmentId", {
                initialValue: "",
                rules: [
                  {
                    required: type !== "role",
                    message:
                      userType === 1 ? `请选择提交审核单位` : `请选择所属单位`
                  }
                ]
              })(
                <Cascader
                  showSearch
                  options={departsTree}
                  changeOnSelect
                  placeholder=""
                />
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

const Dom = Form.create({ name: "Info" })(Info);

export default class register extends PureComponent {
  render() {
    const { show, ...rest } = this.props;

    return (
      <div style={{ display: show ? "block" : "none" }}>
        <Dom {...rest}></Dom>
      </div>
    );
  }
}
