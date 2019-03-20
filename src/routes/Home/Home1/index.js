import React, { PureComponent } from "react";
import SiderMenu from "../../../components/SiderMenu";

export default class home1 extends PureComponent {
  render() {
    return (
      <div>
        <SiderMenu active="101" />
        <div>首页1</div>
      </div>
    );
  }
}
