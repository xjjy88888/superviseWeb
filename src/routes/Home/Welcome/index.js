import React, { PureComponent } from "react";
import SiderMenu from "../../../components/SiderMenu";

export default class home2 extends PureComponent {
  render() {
    return (
      <div>
        <SiderMenu active="101" />
        <div style={{ display: "flex" }}>
          <div style={{ flex: 1, background: "orange" }}>111</div>
          <div style={{ flex: 1, background: "#ddd" }}>111</div>
        </div>
      </div>
    );
  }
}
