import React, { PureComponent } from "react";
import { connect } from "dva";
import SiderMenu from "../components/SiderMenu";

@connect()
export default class IndexPage extends PureComponent {
  render() {
    return (
      <div>
        <SiderMenu />
        <div>index</div>
      </div>
    );
  }
}
