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
import emitter from "../../../../utils/event";
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

//填写用户信息
@createForm()
@connect(({ user, district }) => ({
  user,
  district
}))
class Info extends PureComponent {
  state = {
    confirmDirty: false,
    autoCompleteResult: [],
    showDistrict: false,
    id: null,
    type: ""
  };

  componentDidMount() {
    const {
      form: { resetFields, setFieldsValue }
    } = this.props;
    this.eventEmitter = emitter.addListener("showRegister", v => {
      console.log(v);
      this.setState({ type: v.type });
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
    e.preventDefault();
    this.props.form.validateFields((err, v) => {
      console.log("填写用户信息", v);
      if (!err) {
        emitter.emit("setUserType", {
          type: v.userType || "2"
        });
        this.props.saveState({ user: v, state: 1 });
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

  render() {
    const {
      isLogin,
      show,
      form: { getFieldDecorator }
    } = this.props;
    const { showDistrict, type } = this.state;

    const showRole = { display: type === "role" ? "block" : "none" };
    const hideRole = { display: type === "role" ? "none" : "block" };

    return (
      <Layout
        style={{
          backgroundColor: "#fff"
        }}
      >
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
              })(<Input.Password maxLength={30} />)}
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
            <Form.Item label="电话" hasFeedback style={hideRole}>
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
                  allowClear
                  optionFilterProp="children"
                  onChange={e => {
                    console.log(e);
                    this.setState({ showDistrict: e === "account" });
                  }}
                >
                  {[
                    { text: "社会用户", value: "1" },
                    { text: "行政用户", value: "0" }
                  ].map((item, index) => (
                    <Select.Option value={item.value} key={index}>
                      {item.text}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </Form.Item>
            <Form.Item
              label={`提交审核单位`}
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
