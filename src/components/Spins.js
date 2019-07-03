import React, { PureComponent } from "react";
import { Spin } from "antd";

export default class spins extends PureComponent {
  static defaultProps = {
    show: false
  };

  render() {
    const { show } = this.props;
    return (
      <Spin
        size="large"
        style={{
          display: show ? "block" : "none",
          transform: " translate(-50%,-50%)",
          position: "absolute",
          top: "50%",
          left: "50%",
          zIndex: 1
        }}
      />
    );
  }
}
