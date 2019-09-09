import React, { PureComponent } from "react";
import { Layout, Button } from "antd";
import emitter from "../../../utils/event";
import { LocaleProvider } from "antd";
import zh_CN from "antd/lib/locale-provider/zh_CN";

export default class register extends PureComponent {
  constructor(props) {
    super(props);
    this.state = { show: false };
  }

  componentDidMount() {
    this.eventEmitter = emitter.addListener("showHistoryPlay", v => {
      this.setState({
        show: v.show
      });
    });
  }

  render() {
    const { show } = this.state;

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
            zIndex: 1000
          }}
        >
          <Layout
            style={{
              transform: " translate(-50%,-50%)",
              position: "absolute",
              top: "50%",
              left: "50%",
              background: "#fff",
              width: "80%",
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
            历史播放
          </Layout>
        </Layout>
      </LocaleProvider>
    );
  }
}
