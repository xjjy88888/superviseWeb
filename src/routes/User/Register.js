import React, { PureComponent } from "react";
import { createForm } from "rc-form";
import { connect } from "dva";
import { Form, Icon, Input, Button, Checkbox, Select } from "antd";
import config from "../../config";
import Spins from "../../components/Spins";
import { Link } from "dva/router";

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

@connect(({ user }) => ({
  user
}))
@createForm()
export default class Registers extends PureComponent {
  render() {
    return <DomRegister />;
  }
}

class register extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {}
  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields((err, v) => {
      if (err) {
        console.log("注册信息: ", v);
      }
    });
  };
  handleConfirmBlur = e => {
    const { value } = e.target;
    this.setState({ confirmDirty: this.state.confirmDirty || value });
  };

  compareToFirstPassword = (rule, value, callback) => {
    const { form } = this.props;
    if (value && value == form.getFieldValue("password")) {
      callback("您输入的两个密码不一致");
    } else {
      callback();
    }
  };

  validateToNextPassword = (rule, value, callback) => {
    const { form } = this.props;
    if (value && this.state.confirmDirty) {
      form.validateFields(["confirm"], { force: true });
    }
    callback();
  };

  render() {
    const { getFieldDecorator, getFieldsError } = this.props.form;
    const { showSpin } = this.state;
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
        <Spins show={showSpin} />
        <p>
          <img
            src="./img/logo.png"
            alt=""
            style={{ width: 30, marginRight: 10 }}
            onClick={() => {}}
          />
          <span>生产建设项目水土保持信息化监管系统</span>
        </p>
        <Form
          // layout="inline"
          onSubmit={this.handleSubmit}
          style={{ width: 300 }}
        >
          <Form.Item hasFeedback>
            {getFieldDecorator("nick_name", {
              rules: [{ required: true, message: "请输入用户名" }],
              initialValue: ""
            })(<Input placeholder="用户名" />)}
          </Form.Item>
          <Form.Item hasFeedback>
            {getFieldDecorator("name", {
              rules: [{ required: true, message: "请输入登录名" }],
              initialValue: ""
            })(<Input placeholder="登录名" />)}
          </Form.Item>
          <Form.Item hasFeedback>
            {getFieldDecorator("password", {
              rules: [
                {
                  required: true,
                  message: "请输入登录密码"
                },
                {
                  validator: this.validateToNextPassword
                }
              ]
            })(<Input.Password placeholder="登录密码" />)}
          </Form.Item>
          <Form.Item hasFeedback>
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
                onBlur={this.handleConfirmBlur}
                placeholder="确认密码"
              />
            )}
          </Form.Item>
          <Form.Item hasFeedback>
            {getFieldDecorator("desc", {
              rules: [
                {
                  required: true,
                  message: "请选择职务"
                }
              ]
            })(
              <Select
                showSearch
                allowClear
                optionFilterProp="children"
                placeholder="职务"
                // style={{ width: 200, margin: 10 }}
              >
                {[
                  { text: "管理员", value: 1 },
                  { text: "办事员", value: 2 },
                  { text: "负责人", value: 3 }
                ].map(item => (
                  <Select.Option value={item.value}>{item.text}</Select.Option>
                ))}
              </Select>
            )}
          </Form.Item>
          <Form.Item hasFeedback>
            {getFieldDecorator("phone", {
              initialValue: ""
            })(<Input placeholder="联系电话" />)}
          </Form.Item>
          <Form.Item hasFeedback>
            {getFieldDecorator("mail", {
              rules: [
                // {
                //   type: "email",
                //   message: "输入的邮箱无效"
                // },
                // {
                //   required: true,
                //   message: "请输入邮箱"
                // }
              ]
            })(<Input placeholder="邮箱" />)}
          </Form.Item>
          <Form.Item hasFeedback>
            {getFieldDecorator("address", {
              initialValue: ""
            })(<Input placeholder="住址" />)}
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: "100%" }}>
              注册
            </Button>
            <span>
              去
              <a>
                <Link to="/user/login">登录</Link>
              </a>
            </span>
          </Form.Item>
        </Form>
      </div>
    );
  }
}
const DomRegister = Form.create({ name: "registerName" })(register);
