import React, { PureComponent } from "react";
import { createForm } from "rc-form";
import { connect } from "dva";
import { Form, Icon, Input, Button, Checkbox, message, Layout } from "antd";
import Spins from "../../components/Spins";
import Register from "../System/User/Register";
import emitter from "../../utils/event";

@connect(({ user }) => ({
  user
}))
@createForm()
export default class login extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isEasy: true,
      showSpin: false
    };
  }

  componentDidMount() {
    localStorage.setItem("key", "");
    this.props.form.validateFields();
    this.init();
  }

  init = () => {
    this.props.dispatch({
      type: "user/init"
    });
  };

  handleSubmit = e => {
    localStorage.setItem("frequentEdit", 0);
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        localStorage.setItem("frequentEdit", values.frequentEdit ? 1 : 0);
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
        this.setState({ showSpin: true });
        this.props.dispatch({
          type: "user/login",
          payload: {
            userName: values.userName,
            password: values.password
          },
          callback: () => {
            this.setState({ showSpin: false });
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
    const { showSpin } = this.state;
    const lastLogin = JSON.parse(localStorage.getItem("lastLogin"));
    return (
      <Layout
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh"
        }}
      >
        <Register />
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
          <Spins show={showSpin} />
          <Form onSubmit={this.handleSubmit} style={{ width: 310 }}>
            <Form.Item>
              <img
                src="./img/logo.png"
                alt=""
                style={{ width: 30, marginRight: 10 }}
                onClick={() => { }}
              />
              水土保持监督管理信息移动采集系统管理端
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
              <Button
                type="primary"
                htmlType="submit"
                style={{ width: "100%" }}
                disabled={this.hasErrors(getFieldsError())}
              >
                登录
              </Button>
              <span>
                去
                <a
                  onClick={() => {
                    emitter.emit("showRegister", {
                      show: true,
                      type: "login",
                      status: "add",
                      item: {}
                    });
                  }}
                >
                  注册
                </a>
              </span>
            </Form.Item>
          </Form>
        </div>
      </Layout>
    );
  }
}
