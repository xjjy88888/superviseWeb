import React, { PureComponent } from "react";
import { Steps, Button, Layout } from "antd";
import { connect } from "dva";
import emitter from "../../../../utils/event";
import { LocaleProvider } from "antd";
import { createForm } from "rc-form";
import Info from "./Info";
import Power from "./Power";
import Finish from "./Finish";
import zh_CN from "antd/lib/locale-provider/zh_CN";

const { Header, Content } = Layout;

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
    id: null,
    isLogin: true,
    isActive: false
    // login: 注册
    // society: 社会用户
    // admin: 行政用户
    // role: 行政角色
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
        isActive: Boolean(v.isActive),
        type: v.type,
        isLogin: h === "#/login" || h === "#/"
      });
    });
  }

  componentWillUnmount() {
    // emitter.removeListener(this.eventEmitter);
  }

  submit = power => {
    const { dispatch } = this.props;
    const { user, type, id, isLogin } = this.state;

    console.log("提交", user, power);
    if (type === "role") {
      dispatch({
        type: "role/roleCreateUpdate",
        payload: {
          ...user,
          id,
          permissions: power.permissions
        },
        callback: (success, error, result) => {
          if (success) {
            this.setState({
              state: 2,
              finishData: [
                { name: "角色标识", cont: result.name },
                { name: "角色名", cont: result.displayName }
              ]
            });
            emitter.emit("refreshSystem", {
              refresh: true
            });
          }
        }
      });
    } else {
      this.userCreateUpdate({ ...user, ...power, isLogin, id });
    }
  };

  saveState = v => {
    console.log(v);
    this.setState(v);
  };

  finish = () => {
    const {
      form: { resetFields }
    } = this.props;
    resetFields();
  };

  userCreateUpdate = payload => {
    console.log(payload);
    const { dispatch } = this.props;
    const { isActive } = this.state;

    dispatch({
      type: "user/userCreateUpdate",
      payload,
      callback: (success, error, result) => {
        if (success) {
          emitter.emit("refreshSystem", {
            refresh: true
          });
          this.userSetPower(
            {
              isActive,
              id: result.id,
              permissions: payload.permissions
            },
            result
          );
        }
      }
    });
  };

  userSetPower = (payload, result) => {
    const { dispatch } = this.props;
    dispatch({
      type: "user/userSetPower",
      payload,
      callback: success => {
        if (success) {
          this.setState({
            state: 2,
            finishData: [
              { name: "账号", cont: result.name },
              { name: "姓名", cont: result.displayName }
            ]
          });
        }
      }
    });
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
                <Steps.Step title="填写信息" />
                <Steps.Step title="权限分配" />
                <Steps.Step title="完成" />
              </Steps>
            </Header>
            <Content style={{ position: "relative" }}>
              <Info
                show={state === 0}
                type={type}
                isLogin={isLogin}
                saveState={this.saveState}
              />
              <Power
                show={state === 1}
                type={type}
                saveState={this.saveState}
                submit={this.submit}
              />
              <Finish
                show={state === 2}
                type={type}
                data={finishData}
                saveState={this.saveState}
                finish={this.finish}
              />
            </Content>
          </Layout>
        </Layout>
      </LocaleProvider>
    );
  }
}
