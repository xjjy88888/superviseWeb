import React, { PureComponent } from "react";
import { Button } from "antd";

// 项目监测
export default class Monitor extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      show: false
    };
  }

  componentDidMount() {
    const { link } = this.props;
    link(this);
  }

  show = v => {
    console.log("显示项目监测", v);
    this.setState({ show: true });
  };

  hide = () => {
    this.setState({ show: false });
  };

  render() {
    const { show } = this.state;
    return (
      <div
        style={{
          position: "absolute",
          left: show ? 350 : window.innerWidth * -1,
          top: 46,
          zIndex: 1002,
          width: window.innerWidth - 350,
          height: "100%",
          backgroundColor: `#fff`,
          padding: 20
        }}
      >
        <Button
          icon="close"
          shape="circle"
          style={{
            float: "right",
            color: "#1890ff"
          }}
          onClick={() => {
            this.hide();
          }}
        />
        <div>项目监测</div>
      </div>
    );
  }
}
