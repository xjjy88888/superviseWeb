import React, { PureComponent } from "react";
import jQuery from "jquery";
import { Button } from "antd";

export default class ProjectList extends PureComponent {
  componentDidMount() {
    const { link } = this.props;
    link(this);
  }

  show = () => {
    jQuery("#ProjectList").animate({ left: 0 });
  };

  render() {
    return (
      <div
        id="ProjectList"
        style={{
          position: "absolute",
          left: -window.innerWidth,
          top: 0,
          zIndex: 1000,
          width: window.innerWidth,
          height: "100%",
          paddingTop: 46,
          backgroundColor: "#fff"
        }}
      >
        区域监管-项目列表
        <Button
          type="primary"
          shape="circle"
          icon="close"
          style={{
            position: "absolute",
            top: 50,
            right: 50,
          }}
          onClick={() => {
            jQuery("#ProjectList").animate({ left: -window.innerWidth });
          }}
        />
      </div>
    );
  }
}
