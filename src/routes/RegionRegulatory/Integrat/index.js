import React, { PureComponent } from "react";
import { Menu, Icon, Button, LocaleProvider } from "antd";
import zhCN from "antd/lib/locale-provider/zh_CN";
import SiderMenu from "../../../components/SiderMenu";
import Sidebar from "./sidebar";
import SidebarDetail from "./siderbarDetail";
import moment from "moment";
import Tool from "./tool";
import Chart from "./chart";
import Query from "./query";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "antd-mobile/dist/antd-mobile.css";

export default class integrat extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      showTool: false
    };
    this.map = null;
  }
  componentDidMount() {
    const me = this;
    // 创建地图
    me.createMap();
  }
  // 创建地图
  createMap = () => {
    const map = L.map("map", {
      zoomControl: false
    }).setView([23.1441, 113.3693], 13);

    L.tileLayer(
      "https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw",
      {
        maxZoom: 18,
        attribution: "生产建设项目水土保持信息化监管系统",
        id: "mapbox.streets"
      }
    ).addTo(map);
    // map.zoomControl.setPosition("topright");
    L.control
      .zoom({ zoomInTitle: "放大", zoomOutTitle: "缩小", position: "topright" })
      .addTo(map);
    this.map = map;
  };

  render() {
    return (
      <LocaleProvider locale={zhCN}>
        <div>
          <SiderMenu active="401" />
          <Sidebar />
          <SidebarDetail />
          <Tool />
          <Chart />
          <Query />
          <div id="map" style={{ height: "95vh" }} />
        </div>
      </LocaleProvider>
    );
  }
}
