import React, { PureComponent } from "react";
import { connect } from "dva";
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
import config from "../../../config";

@connect(({ user }) => ({
  user
}))
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
      zoomControl: false,
      attributionControl: false
    }).setView(config.mapInitParams.center, config.mapInitParams.zoom);

    L.control
      .zoom({ zoomInTitle: "放大", zoomOutTitle: "缩小", position: "topright" })
      .addTo(map);

    map.createPane("tileLayerZIndex");
    map.getPane("tileLayerZIndex").style.zIndex = 0;
    const baseLayer = L.tileLayer(config.baseMaps[0].Url, {
      pane: "tileLayerZIndex"
    });

    const baseLayer1 = L.tileLayer(config.baseMaps[1].Url, {
      pane: "tileLayerZIndex"
    });
    map.addLayer(baseLayer1);

    const baseLayer2 = L.tileLayer(config.baseMaps[2].Url, {
      pane: "tileLayerZIndex"
    });

    const baseLayers = {
      监管影像: baseLayer2,
      街道图: baseLayer,
      影像图: baseLayer1
    };

    //var bounds = geoJsonLayer.getBounds();
    //map.setMaxBounds(bounds);
    //map.setMinZoom(config.zoom);
    const projectlayerGroup = L.layerGroup();
    const spotlayerGroup = L.layerGroup();
    //加载项目红线图层wms
    const project_wmsLayer = L.tileLayer
      .wms("http://localhost:8080/geoserver/ZKYGIS/wms?", {
        layers: "ZKYGIS:project_scope", //需要加载的图层
        format: "image/png", //返回的数据格式
        transparent: true
      })
      .addTo(projectlayerGroup);
    //加载图斑图层wms
    const spot_wmsLayer = L.tileLayer
      .wms("http://localhost:8080/geoserver/ZKYGIS/wms?", {
        layers: "ZKYGIS:spot", //需要加载的图层
        format: "image/png", //返回的数据格式
        transparent: true
      })
      .addTo(spotlayerGroup);

    map.addLayer(projectlayerGroup);
    map.addLayer(spotlayerGroup);
    const overlays = {
      项目红线: projectlayerGroup,
      扰动图斑: spotlayerGroup
    };
    L.control.layers(baseLayers, overlays).addTo(map);

  };

  render() {
    const {
      user: { current_user }
    } = this.props;
    console.log(current_user);
    const username = current_user ? current_user[0].us_name : "";
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
