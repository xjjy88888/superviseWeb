import React, { PureComponent } from "react";
import { connect } from "dva";
import { Menu, Icon, Button, LocaleProvider } from "antd";
import zhCN from "antd/lib/locale-provider/zh_CN";
import SiderMenu from "../../../components/SiderMenu";
import Sidebar from "./sidebar";
import SidebarDetail from "./siderbarDetail";
import moment from "moment";
import Tool from "./tool";
import Sparse from "./sparse";
import Chart from "./chart";
import Query from "./query";
import ProjectDetail from "./projectDetail";
import L from "leaflet";
import "proj4";
import "proj4leaflet";
import shp from "shpjs";
import * as turf from "@turf/turf";
//import { greatCircle, point, circle } from '@turf/turf';
import "leaflet/dist/leaflet.css";
import "antd-mobile/dist/antd-mobile.css";
import config from "../../../config";
import emitter from "../../../utils/event";

let userconfig = {};
let map;
@connect(({ user, mapdata }) => ({
  user,
  mapdata
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
    //获取url参数
    me.initUrlParams();
    // 创建地图
    me.createMap();
    // 组件通信
    this.eventEmitter = emitter.addListener("mapLocation", data => {
      this.setState({
        project_id: data.project_id
      });
      
      //console.log(data)
    });
  }
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
    userconfig.dwdm = userParams.ctn_code;
    userconfig.userId = userParams.us_id;
    userconfig.userName = userParams.us_truename;
    //console.log(123);
  };
  // 创建地图
  createMap = () => {
    const me = this;
    map = L.map("map", {
      zoomControl: false,
      attributionControl: false
    }).setView(config.mapInitParams.center, config.mapInitParams.zoom);
    /*map = L.map('map',{
      zoomControl: false,
      attributionControl: false,
    });*/
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
    userconfig.baseLayers = {
      监管影像: baseLayer2,
      街道图: baseLayer,
      影像图: baseLayer1
    };
    map.on("click", function(e) {
      //点查WMS图层
      userconfig.mapPoint = e.latlng;
      let point = { x: e.latlng.lng, y: e.latlng.lat };
      me.queryWFSServiceByPoint(point, config.mapLayersName);
    });
    //获取项目区域范围
    me.getRegionGeometry();
  };
  /*点选查询图层
   *@method queryWFSServiceByPoint
   *@param point 坐标点
   *@param typeName 图层名称
   *@return null
   */

  queryWFSServiceByPoint = (point, typeName) => {
    const me = this;
    point = point.x + "," + point.y;
    let filter =
      '<Filter xmlns="http://www.opengis.net/ogc" xmlns:gml="http://www.opengis.net/gml">';
    filter += "<Intersects>";
    filter += "<PropertyName>geom</PropertyName>";
    filter += "<gml:Point>";
    filter += "<gml:coordinates>" + point + "</gml:coordinates>";
    filter += "</gml:Point>";
    filter += "</Intersects>";
    filter += "</Filter>";
    let urlString = config.mapUrl.geoserverUrl+"/ows";
    let param = {
      service: "WFS",
      version: "1.0.0",
      request: "GetFeature",
      typeName: typeName,
      outputFormat: "application/json",
      //maxFeatures: 100,
      filter: filter
      //srsName: epsg
    };
    let geojsonUrl = urlString + L.Util.getParamString(param, urlString);
    me.props.dispatch({
      type: "mapdata/queryWFSLayer",
      payload: { geojsonUrl },
      callback: data => {
        me.clearGeojsonLayer();
        let style = {
          color: "#33CCFF", //#33CCFF #e60000
          weight: 3,
          opacity: 1,
          fillColor: "#e6d933", //#33CCFF #e6d933
          fillOpacity: 0.1
        };
        me.loadGeojsonLayer(data, style);
        if (data.features.length > 0) {
          let content = "";
          for (let i = 0; i < data.features.length; i++) {
            let feature = data.features[i];
            if(i === data.features.length-1){
              content += me.getWinContent(feature.properties);
            }
            else{
              content += me.getWinContent(feature.properties) + "<br>";
            }
          }
          map.openPopup(content, userconfig.mapPoint);
        }
      }
    });
    //console.log(this.props);
  };
   /*
   * 匹配气泡窗口信息模版函数
   */ 
  getWinContent = (properties) =>{
    let content = "";
    //判断点击哪个图层
    if (properties.spot_tbid) {//扰动图斑
        content = "图斑编号:" + properties.spot_tbid + "</br>";
        content += '<a onclick="locateMap(\'' + properties.spot_tbid+ '\')">详情</a>&nbsp;&nbsp;&nbsp;';
        content += '<a onclick="locateMap(\'' + properties.spot_tbid+ '\')">编辑</a>&nbsp;&nbsp;&nbsp;';
        content += '<a onclick="locateMap(\'' + properties.spot_tbid+ '\')">定位</a></br>';
        //content += "项目ID:" + properties.project_id + "</br>";
        //content += "复核状态:" + properties.isreview + "</br>";
        //content += "扰动类型:" + properties.qtype + "</br>";
        //content += "扰动面积:" + properties.qarea + "</br>";
        //content += "建设状态:" + properties.qdcs + "</br>";
        //content += "扰动变化类型:" + properties.qdtype + "</br>";
        //content += "超出防治责任范围面积:" + properties.earea;
    }
    else if (properties.project_id) {//项目红线
        content = "项目ID:" + properties.project_id + "</br>";
        content += '<a onclick="locateMap(\'' + properties.project_id+ '\')">详情</a>&nbsp;&nbsp;&nbsp;';
        content += '<a onclick="locateMap(\'' + properties.project_id+ '\')">编辑</a>&nbsp;&nbsp;&nbsp;';
        content += '<a onclick="locateMap(\'' + properties.spot_tbid+ '\')">定位</a></br>';
        //content += "上图单元ID:" + properties.sup_unit + "</br>";
        //content += "矢量化类型:" + properties.vectype + "</br>";
        //content += "设计阶段:" + properties.design_stage + "</br>";
        //content += "面积:" + properties.area;
    }
    return content;
  }
 /*
  * 定位地图并且高亮显示
  */ 
  locateMap = (id) =>{
     
  }
  /*
   * 绘制图形函数
  */
  loadGeojsonLayer = (geojson, style) => {
    //map.createPane('ProjectVectorLayer');
    //map.getPane('ProjectVectorLayer').style.zIndex = 2;
    userconfig.projectgeojsonLayer = L.Proj.geoJson(geojson, {
      style: style
      //pane: 'ProjectVectorLayer'
      /*filter: function (geoJsonFeature) {
          return true;
      },
      onEachFeature: function (feature, layer) {
          var e = feature;
      }*/
    }).addTo(map);
  };
  /*
   * 清空绘制图形函数
   */
  clearGeojsonLayer = () => {
    if (userconfig.projectgeojsonLayer) {
      userconfig.projectgeojsonLayer.clearLayers();
      map.removeLayer(userconfig.projectgeojsonLayer);
      userconfig.projectgeojsonLayer = null;
    }
  };
  /*
   *获取项目区域范围
   */
  getRegionGeometry = () => {
    const me = this;
    let url = "";
    /*if(userconfig.regionArea != "") {//流域账号
      //url = config.url.xzqhUrl + "/0?t=" + timeStamp;//区县
  }
  else{
      if (userconfig.dwdm == "100000") { //admin管理员
          url = "SHP/Country.zip"; //全国
      }
      else if (userconfig.dwdm.endsWith("0000")) {
          url = "SHP/Province.zip"; //省
      }
      else if (userconfig.dwdm.endsWith("00")) {
          url = "SHP/City.zip";//市
      }
      else {
          url = "SHP/District.zip";//区县
      }
  }*/
    if (userconfig.dwdm === "100000") {
      //admin管理员
      url = config.mapUrl.SHP + "Country.zip"; //全国
    } else if (userconfig.dwdm.endsWith("0000")) {
      url = config.mapUrl.SHP + "Province.zip"; //省
    } else if (userconfig.dwdm.endsWith("00")) {
      url = config.mapUrl.SHP + "City.zip"; //市
    } else {
      url = config.mapUrl.SHP + "District.zip"; //区县
    }
    me.loadSHP(url);
  };
  /*
   * 获取SHP图层
   */
  loadSHP = url => {
    const me = this;
    if (url.length > 0) {
      shp(url).then(function(data) {
        if (data && data.features && data.features.length > 0) {
          let geojson = {
            type: "FeatureCollection",
            features: []
          };
          let len = data.features.length;
          for (let i = 0; i < len; i++) {
            let feature = data.features[i];
            if (feature.properties.XZQDM == userconfig.dwdm) {
              geojson.features.push(feature);
              userconfig.geojson = geojson;
              // L.Proj.GeoJSON继承于L.GeoJSON，可调样式
              map.createPane("geoJsonZIndex");
              map.getPane("geoJsonZIndex").style.zIndex = 1;
              userconfig.geoJsonLayer = L.Proj.geoJson(geojson, {
                style: {
                  color: "#0070FF",
                  weight: 3,
                  opacity: 1,
                  //"fillColor":"",
                  fillOpacity: 0
                },
                pane: "geoJsonZIndex"
              }).addTo(map);
              //构造面
              userconfig.polygon = turf.polygon(feature.geometry.coordinates);
              let bounds = [
                [feature.geometry.bbox[3], feature.geometry.bbox[2]],
                [feature.geometry.bbox[1], feature.geometry.bbox[0]]
              ];
              map.fitBounds(bounds);
              if (userconfig.dwdm === "100000") {
                //admin管理员
              } else if (userconfig.dwdm.endsWith("0000")) {
                userconfig.zoom = map.getZoom() + 1;
              } else if (userconfig.dwdm.endsWith("00")) {
                userconfig.zoom = map.getZoom() + 1;
              } else {
                userconfig.zoom = map.getZoom() + 1;
              }
              //加载geoserver发布的WMS地图服务
              me.overlayWMSLayers();
              //当前用户区域范围过滤空间数据
              let polygon = "";
              if (userconfig.geojson) {
                if (userconfig.geojson.features.length > 0) {
                    if (userconfig.geojson.features[0].geometry.coordinates.length > 0) {
                        //var polygon = "polygon((103.661122555 24.288901115,103.661122555 29.352674495,110.942772097 29.352674495,110.942772097 24.288901115,103.661122555 24.288901115))";
                        polygon = "polygon((";
                        let coordinates = userconfig.geojson.features[0].geometry.coordinates;
                        for (let i = 0; i < coordinates.length; i++) {
                          let coordinate = coordinates[i];
                            for (let j = 0; j < coordinate.length; j++) {
                              let xy = coordinate[j];
                                if (j === coordinate.length - 1) {
                                    polygon += xy[0] + " " + xy[1];
                                }
                                else {
                                    polygon += xy[0] + " " + xy[1] + ",";
                                }
        
                            }
                        }
                        polygon += "))";
                    }
                }
              }
              //console.log(polygon);
              //let polygon = '123';
              emitter.emit("polygon", {
                polygon: polygon
              });
              break;
            }
          }
        }
      });
    }
  };
  /*
   * 加载geoserver发布的WMS地图服务
   */
  overlayWMSLayers = () => {
    let bounds = userconfig.geoJsonLayer.getBounds();
    map.setMaxBounds(bounds);
    map.setMinZoom(userconfig.zoom);
    const projectlayerGroup = L.layerGroup();
    const spotlayerGroup = L.layerGroup();
    //加载项目红线图层wms
    L.tileLayer.wms(config.mapUrl.geoserverUrl+"/wms?", {
        layers: "ZKYGIS:project_scope", //需要加载的图层
        format: "image/png", //返回的数据格式
        transparent: true
      })
      .addTo(projectlayerGroup);
    //加载图斑图层wms
    L.tileLayer.wms(config.mapUrl.geoserverUrl+"/wms?", {
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
    L.control.layers(userconfig.baseLayers, overlays).addTo(map);
  };

  render() {
    //console.log(this.props);
    return (
      <LocaleProvider locale={zhCN}>
        <div>
          <SiderMenu active="401" />
          <Sidebar />
          <SidebarDetail />
          <Tool />
          <Chart />
          <Query />
          <Sparse />
          <ProjectDetail />
          <div id="map" style={{ height: "95vh" }} />
        </div>
      </LocaleProvider>
    );
  }
}
