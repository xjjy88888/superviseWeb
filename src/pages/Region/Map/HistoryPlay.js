import React, { PureComponent } from "react";
import { Layout, Button } from "antd";
import emitter from "../../../utils/event";
import { LocaleProvider } from "antd";
import zh_CN from "antd/lib/locale-provider/zh_CN";

export default class HistoryPlay extends PureComponent {
  constructor(props) {
    super(props);
    this.state = { show: false, hisPlayURL: "" };
  }

  componentDidMount() {
    //console.log("历史播放");
    this.eventEmitter = emitter.addListener("showHistoryPlay", v => {
      this.setState({
        show: v.show,
        hisPlayURL: v.hisPlayURL
      });
    });
  }

  render() {
    const { show, hisPlayURL } = this.state;

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
            // zIndex: show ? 1000 : 0
            zIndex: 1001
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
              padding: 10,
              borderRadius: 10
            }}
          >
            <Button
              type="primary"
              shape="circle"
              icon="close"
              style={{ position: "absolute", right: 1, top: 1, zIndex: 999 }}
              onClick={() => {
                this.setState({ show: false });
              }}
            />
            <iframe
              title="扰动图斑历史播放"
              id="hisPlayIframe"
              height="100%"
              width="100%"
              // src="./timelinejs/spaceTimeSpot.html"
              src={hisPlayURL}
            />
          </Layout>
        </Layout>
      </LocaleProvider>
    );
  }
}
