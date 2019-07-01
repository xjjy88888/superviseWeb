import React, { PureComponent } from "react";
import { createForm } from "rc-form";
import { connect } from "dva";
import { Form, Icon, Input, Button, Checkbox, message } from "antd";

@connect(({ user }) => ({
  user
}))
@createForm()
export default class login extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isEasy: true
    };
  }

  componentDidMount() {
    // To disabled submit button at the beginning.
    this.props.form.validateFields();
    // console.log(
    //   "sessionStorage",
    //   sessionStorage.length > 0 && sessionStorage.user
    //     ? JSON.parse(sessionStorage.user).accessToken
    //     : ""
    // );
  }
  handleSubmit = e => {
    sessionStorage.setItem("frequentEdit", false);
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        // console.log(values);
        sessionStorage.setItem("frequentEdit", values.frequentEdit);
        let lastLogin;
        if (values.remember) {
          lastLogin = {
            userName: values.userName,
            password: values.password,
            remember: true
          };
        } else {
          lastLogin = {
            userName: "",
            password: "",
            remember: false
          };
        }
        localStorage.setItem("lastLogin", JSON.stringify(lastLogin));
        this.props.dispatch({
          type: "user/login",
          payload: {
            userName: values.userName,
            password: values.password
          }
        });
      } else {
        message.warning("请输入完整");
      }
    });
  };

  hasErrors = fieldsError => {
    return Object.keys(fieldsError).some(field => fieldsError[field]);
  };
  render() {
    const { getFieldDecorator, getFieldsError } = this.props.form;
    const lastLogin = JSON.parse(localStorage.getItem("lastLogin"));
    return (
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%)",
          background: "#fff",
          padding: 50,
          borderRadius: 10
        }}
      >
        <Form onSubmit={this.handleSubmit} style={{ maxWidth: 300 }}>
          <Form.Item>
            <img
              src="./img/logo.png"
              alt=""
              style={{ width: 30, marginRight: 10 }}
              onClick={() => {}}
            />
            生产建设项目水土保持信息化监管系统
          </Form.Item>
          <Form.Item>
            {getFieldDecorator("userName", {
              rules: [
                { required: true, message: "Please input your userName!" }
              ],
              initialValue: lastLogin ? lastLogin.userName : ""
            })(
              <Input
                prefix={
                  <Icon type="user" style={{ color: "rgba(0,0,0,.25)" }} />
                }
                placeholder="账号"
              />
            )}
          </Form.Item>
          <Form.Item>
            {getFieldDecorator("password", {
              rules: [
                { required: true, message: "Please input your Password!" }
              ],
              initialValue: lastLogin ? lastLogin.password : ""
            })(
              <Input
                prefix={
                  <Icon type="lock" style={{ color: "rgba(0,0,0,.25)" }} />
                }
                type="password"
                placeholder="密码"
              />
            )}
          </Form.Item>
          <Form.Item>
            {getFieldDecorator("remember", {
              valuePropName: "checked",
              initialValue: lastLogin ? lastLogin.remember : ""
            })(<Checkbox>记住我</Checkbox>)}
            {getFieldDecorator("frequentEdit", {
              valuePropName: "checked",
              initialValue: false
            })(<Checkbox style={{ float: "right" }}>频繁编辑</Checkbox>)}
            {/* <a style={{ float: "right" }}>忘记密码</a> */}
            <Button
              type="primary"
              htmlType="submit"
              style={{ width: "100%" }}
              disabled={this.hasErrors(getFieldsError())}
            >
              登录
            </Button>
            <span>
              去 <a>注册</a>
            </span>
            {/* <span style={{ float: "right" }}>
              去
              <a
                onClick={() => {
                  sessionStorage.setItem("frequentEdit", true);
                }}
              >
                频繁编辑
              </a>
            </span> */}
          </Form.Item>
        </Form>
      </div>
    );
  }
}
