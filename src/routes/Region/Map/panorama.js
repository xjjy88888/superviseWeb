import React, { PureComponent } from "react";
import { Icon } from "antd";
import emitter from "../../../utils/event";
import "leaflet/dist/leaflet.css";
import "echarts";

export default class siderbarDetail extends PureComponent {
  constructor(props) {
    super(props);
    this.state = { show: false, fullviewURL: "" };
    this.charRef = ref => {
      this.chartDom = ref;
    };
  }

  componentDidMount() {
    this.eventEmitter = emitter.addListener("showPanorama", data => {
      this.setState({
        show: data.show,
        fullviewURL: data.fullviewURL
      });
    });
  }

  render() {
    const { show, fullviewURL } = this.state;
    return (
      <div
        style={{
          display: show ? "block" : "none",
          backgroundColor: "rgba(0,0,0,.3)",
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          zIndex: 1001
        }}
      >
        <div
          style={{
            backgroundColor: "#fff",
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            // width: "1200px",
            // height: "600px",
            overflow: "auto"
          }}
        >
          <Icon
            type="close"
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              fontSize: 30
            }}
            onClick={() => {
              this.setState({ show: false });
            }}
          />
          <iframe
            title="全景点"
            height="595px"
            width="1200px"
            // src="./vtour/tour.html"
            src={fullviewURL}
          />
        </div>
      </div>
    );
  }
}
