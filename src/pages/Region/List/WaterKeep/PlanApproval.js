import React, { PureComponent } from "react";
import { connect } from "dva";

import { Button } from "antd";

// 水土保持方案
@connect(({ waterConserManage }) => ({
  waterConserManage
}))
export default class PlanApproval extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      show: false
    };
  }

  componentDidMount() {}

  hide = () => {
    const { dispatch } = this.props;
    dispatch({
      type: "waterConserManage/save",
      payload: {
        showWaterConserPage: ""
      }
    });
  };

  render() {
    return (
      <div
        style={{
          position: "absolute",
          left: 350,
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
          onClick={this.hide}
        />
        <div>方案报批</div>
      </div>
    );
  }
}
