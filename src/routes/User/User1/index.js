import React, { PureComponent } from "react";
import SiderMenu from "../../../components/SiderMenu";

export default class user1 extends PureComponent {
  render() {
    return (
      <div>
        <SiderMenu active="101" />
        <div>Admin</div>
      </div>
    );
  }
}
