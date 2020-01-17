import React, { PureComponent } from "react";
import { Button } from "antd";

// 水土保持方案
export default class Plan extends PureComponent {
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
    console.log("显示水土保持方案", v);
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
        <div>水土保持方案</div>
      </div>
    );
  }
}
