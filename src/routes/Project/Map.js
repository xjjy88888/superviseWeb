import React, { PureComponent } from "react";
import Layouts from "../../components/Layouts";

export default class homePage extends PureComponent {
  render() {
    return (
      <Layouts avtive="map">
        <div>地图</div>
      </Layouts>
    );
  }
}
