import React, { PureComponent } from "react";
import { Menu, Icon, Button } from "antd";
import SiderMenu from "../../../components/SiderMenu";
import Sidebar from "./sidebar";
import L from "leaflet";
import styles from "./index.less";
import "leaflet/dist/leaflet.css";

export default class integrat extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      loading: false
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
      <div className={styles.main}>
        <SiderMenu active="401" />
        <Sidebar />
        <div id="map" className={styles.map} />
      </div>
    );
  }
}
