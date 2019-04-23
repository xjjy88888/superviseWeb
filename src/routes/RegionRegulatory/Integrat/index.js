import React, { PureComponent } from "react";
import { connect } from "dva";
import { Menu, Icon, Button, LocaleProvider, Switch } from "antd";
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
import "leaflet.pm/dist/leaflet.pm.css";
import "leaflet.pm";
import shp from "shpjs";
import * as turf from "@turf/turf";
//import '@h21-map/leaflet-path-drag';
//import 'leaflet-editable';
//import { greatCircle, point, circle } from '@turf/turf';
import "leaflet/dist/leaflet.css";
import "antd-mobile/dist/antd-mobile.css";
import config from "../../../config";
import emitter from "../../../utils/event";
import jQuery from "jquery";

let userconfig = {};
let map;
@connect(({ user, mapdata, project }) => ({
  user,
  mapdata,
  project
}))
export default class integrat extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      showButton: false
    };
    this.map = null;
  }
  componentDidMount() {
    const me = this;
    //气泡窗口详情查看
    window.goDetail = obj => {
      //console.log("goDetail", obj);
      emitter.emit("showProjectSpotInfo", obj);
    };
    //气泡窗口图形编辑
    window.goEditGraphic = obj => {
      if (obj.from === "project") {
        me.queryWFSServiceByProperty(
          obj.id,
          "project_id",
          config.mapProjectLayerName,
          me.callbackEditQueryWFSService
        );
      }else if (obj.from === "spot") {
        me.queryWFSServiceByProperty(
          obj.id,
          "spot_tbid",
          config.mapSpotLayerName,
          me.callbackEditQueryWFSService
        );
      }
    };
    //获取url参数
    me.initUrlParams();
    // 创建地图
    me.createMap();
    // 组件通信
    this.eventEmitter = emitter.addListener("mapLocation", data => {
      /*this.setState({
        item: data.item
      });*/
      if (data.key === "project") {
        this.queryWFSServiceByProperty(
          data.item.project_id,
          "project_id",
          config.mapProjectLayerName,
          this.callbackLocationQueryWFSService
          
        );
      } else if (data.key === "spot") {
        this.queryWFSServiceByProperty(
          data.item.spot_tbid,
          "spot_tbid",
          config.mapSpotLayerName,
          this.callbackLocationQueryWFSService
        );
      }
    });
  }
  /*
   * 编辑图形查询回调函数
  */ 
  callbackEditQueryWFSService = (data)=>{
    const me = this;
    //关闭地图气泡窗口
    map.closePopup();
    //显示图形编辑菜单按钮
    me.setState({ showButton: true });
    //移除地图监听事件
    //map.off('click contextmenu');
    map.off("click");
    me.clearGeojsonLayer();
    let style = {
      color: "#33CCFF", //#33CCFF #e60000
      weight: 3,
      opacity: 1,
      fillColor: "#e6d933", //#33CCFF #e6d933
      fillOpacity: 0.1
    };
    me.loadGeojsonLayer(data, style);
    //编辑图形
    userconfig.projectgeojsonLayer.pm.enable({
      allowSelfIntersection: false
    });
    //移动图形
    //map.pm.toggleGlobalDragMode();

  };
  /*
   * 地图定位查询回调函数
  */
  callbackLocationQueryWFSService = (data)=>{
    const me = this;
    me.clearGeojsonLayer();
    let style = {
      color: "#33CCFF", //#33CCFF #e60000
      weight: 3,
      opacity: 1,
      fillColor: "#e6d933", //#33CCFF #e6d933
      fillOpacity: 0.1
    };
    me.loadGeojsonLayer(data, style);
    map.fitBounds(userconfig.projectgeojsonLayer.getBounds(), {
      maxZoom: 16
    });
    if (data.features.length > 0) {
      let content = "";
      for (let i = 0; i < data.features.length; i++) {
        let feature = data.features[i];
        if (i === data.features.length - 1) {
          content += me.getWinContent(feature.properties)[0].innerHTML;
        } else {
          content +=
            me.getWinContent(feature.properties)[0].innerHTML + "<br><br>";
        }
      }
      map.openPopup(
        content,
        userconfig.projectgeojsonLayer.getBounds().getCenter()
      );
    }
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
    userconfig.dwdm = userParams.ctn_code;
    userconfig.userId = userParams.us_id;
    userconfig.userName = userParams.us_truename;
  };
  // 创建地图
  createMap = () => {
    const me = this;
    map = L.map("map", {
      zoomControl: false,
      //editable: true,
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
    map.on("click", me.onClickMap);
    /*map.on("popupclose", function(e) {
      map.on("click", me.onClickMap);
      //禁止编辑图形
      userconfig.projectgeojsonLayer.pm.disable();
      //禁止移动图形
      map.pm.disableGlobalRemovalMode();
    });*/
    //获取项目区域范围
    me.getRegionGeometry();
    //编辑图形工具
    // 定义图层绘制控件选择项
    const options = {
      position: "topright", // toolbar position, options are 'topleft', 'topright', 'bottomleft', 'bottomright'
      drawMarker: false, // adds button to draw markers
      drawPolyline: false, // adds button to draw a polyline
      drawRectangle: false, // adds button to draw a rectangle
      drawPolygon: false, // adds button to draw a polygon
      drawCircle: false, // adds button to draw a cricle
      cutPolygon: false, // adds button to cut a hole in a polygon
      editMode: false, // adds button to toggle edit mode for all layers
      dragMode: false, //adds button to toggle drag mode for all layers
      removalMode: false // adds a button to remove layers
    };
    // 将图层绘制控件添加的地图页面上
    map.pm.addControls(options);
  };
  onClickMap = e => {
    const me = this;
    //点查WMS图层
    userconfig.mapPoint = e.latlng;
    let point = { x: e.latlng.lng, y: e.latlng.lat };
    me.queryWFSServiceByPoint(point, config.mapLayersName);
  };
  /*属性查询图层
   *@method queryWFSServiceByProperty
   *@param propertyValue 属性值
   *@param propertyName 属性名称
   *@param typeName 图层名称
   *@return null
   */
  queryWFSServiceByProperty = (propertyValue, propertyName, typeName,callback) => {
    const me = this;
    let filter =
      '<Filter xmlns="http://www.opengis.net/ogc" xmlns:gml="http://www.opengis.net/gml">';
    filter += "<PropertyIsEqualTo>";
    filter += "<PropertyName>" + propertyName + "</PropertyName>";
    filter += "<Literal>" + propertyValue + "</Literal>";
    filter += "</PropertyIsEqualTo>";
    filter += "</Filter>";
    let urlString = config.mapUrl.geoserverUrl + "/ows";
    let param = {
      service: "WFS",
      version: "1.0.0",
      request: "GetFeature",
      typeName: typeName,
      outputFormat: "application/json",
      filter: filter
    };
    let geojsonUrl = urlString + L.Util.getParamString(param, urlString);
    me.props.dispatch({
      type: "mapdata/queryWFSLayer",
      payload: { geojsonUrl },
      callback:callback
      /*callback: data => {
        me.clearGeojsonLayer();
        let style = {
          color: "#33CCFF", //#33CCFF #e60000
          weight: 3,
          opacity: 1,
          fillColor: "#e6d933", //#33CCFF #e6d933
          fillOpacity: 0.1
        };
        me.loadGeojsonLayer(data, style);
        map.fitBounds(userconfig.projectgeojsonLayer.getBounds(), {
          maxZoom: 16
        });
        if (data.features.length > 0) {
          let content = "";
          for (let i = 0; i < data.features.length; i++) {
            let feature = data.features[i];
            if (i === data.features.length - 1) {
              content += me.getWinContent(feature.properties)[0].innerHTML;
            } else {
              content +=
                me.getWinContent(feature.properties)[0].innerHTML + "<br><br>";
            }
          }
          map.openPopup(
            content,
            userconfig.projectgeojsonLayer.getBounds().getCenter()
          );
        }
      }*/
    });
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
    let urlString = config.mapUrl.geoserverUrl + "/ows";
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
            if (i === data.features.length - 1) {
              content += me.getWinContent(feature.properties)[0].innerHTML;
            } else {
              content +=
                me.getWinContent(feature.properties)[0].innerHTML + "<br><br>";
            }
          }
          map.openPopup(content, userconfig.mapPoint);
        }
      }
    });
  };
  /*
   * 匹配气泡窗口信息模版函数
   */

  getWinContent = properties => {
    let elements;
    const obj = {
      show: true,
      edit: false,
      id: properties.spot_tbid || properties.project_id,
      from: properties.spot_tbid ? "spot" : "project"
    };
    elements = properties.spot_tbid
      ? jQuery(
          `<div>图斑编号:${properties.spot_tbid}</br>
        ${
          properties.project_id
            ? "关联项目:" + properties.project_id + "</br>"
            : ""
        }${
            properties.byd ? "扰动范围:" + properties.byd + "</br>" : ""
          }<a onclick='goDetail(${JSON.stringify(
            obj
          )})'>详情</a>    <a onclick='goEditGraphic(${JSON.stringify(
            obj
          )})'>图形编辑</a></div>`
        )
      : jQuery(
          `<div>项目ID:${properties.project_id}</br>
          <a onclick='goDetail(${JSON.stringify(
            obj
          )})'>详情</a>    <a onclick='goEditGraphic(${JSON.stringify(
            obj
          )})'>图形编辑</a></div>`
        );
    return elements;
  };
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
                  if (
                    userconfig.geojson.features[0].geometry.coordinates.length >
                    0
                  ) {
                    //var polygon = "polygon((103.661122555 24.288901115,103.661122555 29.352674495,110.942772097 29.352674495,110.942772097 24.288901115,103.661122555 24.288901115))";
                    polygon = "polygon((";
                    let coordinates =
                      userconfig.geojson.features[0].geometry.coordinates;
                    for (let i = 0; i < coordinates.length; i++) {
                      let coordinate = coordinates[i];
                      for (let j = 0; j < coordinate.length; j++) {
                        let xy = coordinate[j];
                        if (j === coordinate.length - 1) {
                          polygon += xy[0] + " " + xy[1];
                        } else {
                          polygon += xy[0] + " " + xy[1] + ",";
                        }
                      }
                    }
                    polygon += "))";
                  }
                }
              }
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
    L.tileLayer
      .wms(config.mapUrl.geoserverUrl + "/wms?", {
        layers: "ZKYGIS:project_scope", //需要加载的图层
        format: "image/png", //返回的数据格式
        transparent: true
      })
      .addTo(projectlayerGroup);
    //加载图斑图层wms
    L.tileLayer
      .wms(config.mapUrl.geoserverUrl + "/wms?", {
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
  /*
   * 取消编辑图形
  */
  cancelEditGraphic = ()=>{
    this.setState({ showButton: false });
    map.on("click", this.onClickMap);
    //禁止编辑图形
    userconfig.projectgeojsonLayer.pm.disable();
    //禁止移动图形
    //map.pm.disableGlobalRemovalMode();
    this.clearGeojsonLayer();
  };
  /*
   * 保存编辑图形
  */ 
  saveEditGraphic = ()=>{
    this.setState({ showButton: false });
  }

  render() {
    const { showButton } = this.state;
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
          <div
            style={{
              paddingTop: 48
            }}
          >
            <div
              id="map"
              style={{
                height: "100%",
                boxSizing: "border-box",
                position: "relative"
              }}
            >
              {/* 编辑图形-保存、取消保存按钮 */}
              <div
                style={{
                  position: "absolute",
                  display: showButton ? "block" : "none",
                  top: 220,
                  right: 15,
                  zIndex: 1000
                }}
              >
                <Button
                  icon="rollback"
                  onClick={() => {
                     this.cancelEditGraphic();
                  }}
                />
                <br />
                <Button
                  icon="check"
                  onClick={() => {
                    this.saveEditGraphic();
                  }}
                />
              </div>
              {/*图标联动按钮 */}
              <div
                style={{
                  position: "absolute",
                  top: 20,
                  left: 380,
                  zIndex: 1000
                }}
              >
                <Switch
                  checkedChildren="图表联动"
                  unCheckedChildren="图表不联动"
                  defaultChecked
                  style={{
                    width: 100
                  }}
                />
              </div>
              {/*测量、历史对比按钮 */}
              <div
                style={{
                  position: "absolute",
                  top: 20,
                  right: 80,
                  zIndex: 1000
                }}
              >
                <Button
                  icon="colum-height"
                  style={{
                    marginRight: 20
                  }}
                >
                  测量
                </Button>
                <Button icon="swap">历史对比</Button>
              </div>
            </div>
          </div>
        </div>
      </LocaleProvider>
    );
  }
}
