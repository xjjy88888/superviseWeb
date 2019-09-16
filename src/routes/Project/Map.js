import React, { PureComponent } from "react";
import Layouts from "../../components/Layouts";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "proj4leaflet";
import "leaflet-measure/dist/leaflet-measure.css";
import "leaflet-measure/dist/leaflet-measure.cn";
import config from "../../config";

export default class homePage extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
    };
    this.map = null;
    this.onlineBasemapLayers = null;
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
      attributionControl: false,
    }).setView(config.mapInitParams.center, config.mapInitParams.zoom);
    const { onlineBasemaps } = config;
    map.createPane("tileLayerZIndex");
    map.getPane("tileLayerZIndex").style.zIndex = 0;
    // 在线底图
    const onlineBasemapLayers = onlineBasemaps.map(item => {
      return L.tileLayer(`${item.url}`, {
        minZoom: item.minZoom,
        maxZoom: item.maxZoom,
        subdomains: item.subdomains,
        pane: "tileLayerZIndex"
      });
    });
    map.addLayer(onlineBasemapLayers[0]); 
    this.onlineBasemapLayers =  onlineBasemapLayers;
    this.map = map;     
  }

  render() {
    return (
      <Layouts avtive="map">
      <div
          style={{
            position: "absolute",
            top: 0,
            paddingTop: 46,
            height: "100vh",
            width: "100vw"
          }}
      >
          <div
            id="map"
            style={{
              boxSizing: "border-box",
              width: "100%",
              height: "100%"
            }}
          />
      </div>
      </Layouts>
    );
  }
}
