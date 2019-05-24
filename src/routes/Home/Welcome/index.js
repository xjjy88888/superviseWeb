import React, { PureComponent } from "react";
import { connect } from "dva";
import SiderMenu from "../../../components/SiderMenu";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import * as turf from "@turf/turf";
import config from "../../../config";
import jQuery from "jquery";
let userconfig = {};
@connect(({ user, mapdata, project, spot }) => ({
  user,
  mapdata,
  project,
  spot
}))
export default class home2 extends PureComponent {
  componentDidMount() {
    const me = this;
    //获取url参数
    me.initUrlParams();
    me.props.dispatch({
      type: "mapdata/GetBoundAsync",
      callback: boundary => {
        userconfig.geojson = JSON.parse(boundary.result);
        // 创建地图
        me.createMap();
      }
    });
  }
  // 创建地图
  createMap = () => {
    const me = this;
    userconfig.LMap = L.map("LMap", {
      attributionControl: false
    });
    userconfig.RMap = L.map("RMap", {
      attributionControl: false
    });
    // //监听地图移动完成事件
    // userconfig.LMap.on("moveend", me.onMoveendMap);
    // //监听地图移动完成事件
    // userconfig.RMap.on("moveend", me.onMoveendMap);
    //获取项目区域范围
    me.getRegionGeometry();
  }
  /*
   *地图范围变化监听事件
  */ 
  onMoveendMap = e => {
    let zoom = e.target.getZoom();
    let center = e.target.getCenter();
    //console.log(center);
    if(e.target._container.id === "LMap"){
      if(userconfig.RMap.getZoom() !==zoom || userconfig.RMap.getCenter().lat !==center.lat && userconfig.RMap.getCenter().lng !==center.lng)
         userconfig.RMap.setView(center,zoom)
    }
    else{
      if(userconfig.LMap.getZoom() !==zoom || userconfig.LMap.getCenter().lat !==center.lat && userconfig.LMap.getCenter().lng !==center.lng)
         userconfig.LMap.setView(center,zoom)
    }
  }; 
  /*
   *获取项目区域范围
   */
  getRegionGeometry = () => {
    const me = this;
    //调用后台接口形式改造
    let geojson = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: {
            type: "MultiPolygon",
            coordinates: userconfig.geojson.coordinates
          }
        }
      ]
    };
    userconfig.geojson = geojson;
    //加载地图geoJsonLayer图层
    me.loadMapgeoJsonLayer(userconfig.LMap);
    me.loadMapgeoJsonLayer(userconfig.RMap);
    //加载影像底图
    me.loadMapbaseLayer(userconfig.LMap);
    me.loadMapbaseLayer(userconfig.RMap);
    //构造面
    userconfig.polygon = turf.multiPolygon(
      geojson.features[0].geometry.coordinates
    );
    setTimeout(() => {
      userconfig.zoom = userconfig.LMap.getZoom() + 1;
      //加载geoserver发布的WMS地图服务
      me.overlayWMSLayers(userconfig.LMap);
      me.overlayWMSLayers(userconfig.RMap);
      //地图模态层效果
      me.loadmodalLayer();
      setTimeout(() => {
        //监听地图移动完成事件
        userconfig.LMap.on("moveend", me.onMoveendMap);
        //监听地图移动完成事件
        userconfig.RMap.on("moveend", me.onMoveendMap);
      }, 500);
    }, 500);
  };
  /*
   * 加载地图geoJsonLayer图层
   */
  loadMapbaseLayer = (map) => {
    map.createPane("tileLayerZIndex");
    map.getPane("tileLayerZIndex").style.zIndex = 0;
    L.tileLayer(
      config.baseMaps[1].Url,
      {
        pane: "tileLayerZIndex"
      }
    ).addTo(map); //影像图
  }
  /*
   * 加载地图geoJsonLayer图层
   */
  loadMapgeoJsonLayer = (map) => {
    // L.Proj.GeoJSON继承于L.GeoJSON，可调样式
    map.createPane("geoJsonZIndex");
    map.getPane("geoJsonZIndex").style.zIndex = 1;
    userconfig.geoJsonLayer = L.Proj.geoJson(userconfig.geojson, {
      style: {
        color: "#0070FF",
        weight: 3,
        opacity: 1,
        //"fillColor":"",
        fillOpacity: 0
      },
      pane: "geoJsonZIndex"
    }).addTo(map);
    let bounds = userconfig.geoJsonLayer.getBounds();
    map.fitBounds(bounds);
  }
  /*
   * 加载geoserver发布的WMS地图服务
   */
  overlayWMSLayers = (map) => {
    let bounds = userconfig.geoJsonLayer.getBounds();
    map.setMaxBounds(bounds);
    map.setMinZoom(userconfig.zoom);
    //加载项目红线图层wms
    L.tileLayer
      .wms(config.mapUrl.geoserverUrl + "/wms?", {
        layers: config.mapProjectLayerName, //需要加载的图层
        format: "image/png", //返回的数据格式
        transparent: true
      })
      .addTo(map);
    //加载图斑图层wms
    L.tileLayer
      .wms(config.mapUrl.geoserverUrl + "/wms?", {
        layers: config.mapSpotLayerName, //需要加载的图层
        format: "image/png", //返回的数据格式
        transparent: true
        //cql_filter:"map_num like '%_52_%'"
      })
      .addTo(map);
    //地图缩放控件
    // L.control
    //   .zoom({ zoomInTitle: "放大", zoomOutTitle: "缩小", position: "topright" })
    //   .addTo(map);
  };  
  /*
   * 加载地图模态层效果
   */
  loadmodalLayer = () => {
    let xy1 = [-180, -90];
    let xy2 = [180, 90];
    let xy3 = [180, -90];
    let xy4 = [-180, 90];
    let boundCoord = [
      [
        [xy1[0], xy1[1]],
        [xy3[0], xy3[1]],
        [xy2[0], xy2[1]],
        [xy4[0], xy4[1]],
        [xy1[0], xy1[1]]
      ]
    ];
    let boundGeo = turf.polygon(boundCoord);
    let modalJson = turf.difference(boundGeo, userconfig.polygon);
    let lLayer = L.Proj.geoJson(modalJson, {
      style: {
        color: "#0070FF",
        weight: 3,
        opacity: 1,
        fillColor: "rgba(0, 0, 0, 0.45)",
        fillOpacity: 1
      }
    }).addTo(userconfig.LMap);
    jQuery(lLayer.getPane())
      .find("path")
      .css({
        cursor: "not-allowed"
    });

    let rLayer = L.Proj.geoJson(modalJson, {
      style: {
        color: "#0070FF",
        weight: 3,
        opacity: 1,
        fillColor: "rgba(0, 0, 0, 0.45)",
        fillOpacity: 1
      }
    }).addTo(userconfig.RMap);
    jQuery(rLayer.getPane())
      .find("path")
      .css({
        cursor: "not-allowed"
    });

  };  
  /*
   * 获取url参数
   */
  initUrlParams = () => {
    let userParams = JSON.parse(sessionStorage.getItem("user"));
    if (!userParams) {
      this.props.dispatch({
        type: "user/loginOut"
      });
      return;
    }
    userconfig.dwdm = userParams.displayArea;
    userconfig.userId = userParams.userId;
    userconfig.userName = userParams.displayName;
  };
  render() {
    return (
      <div>
        <SiderMenu active="101" />
        <div style={{ display: "flex" }}>
          <div style={{ flex: 1, border:"1px solid #cccccc" }} id="LMap"></div>
          <div style={{ flex: 1, border:"1px solid #cccccc" }} id="RMap"></div>
        </div>
      </div>
    );
  }
}
