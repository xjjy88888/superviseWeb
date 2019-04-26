import React, { PureComponent } from "react";
import { connect } from "dva";
import {
  Menu,
  Icon,
  Button,
  LocaleProvider,
  Switch,
  Popover,
  Modal,
  message
} from "antd";
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
import "leaflet-navbar/Leaflet.NavBar.css";
import "leaflet-navbar";
import shp from "shpjs";
import * as turf from "@turf/turf";
//import '@h21-map/leaflet-path-drag';
//import 'leaflet-editable';
//import { greatCircle, point, circle } from '@turf/turf';
import "leaflet-measure/dist/leaflet-measure.css";
import "leaflet-measure/dist/leaflet-measure.cn";
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
      showButton: false,
      showSiderbar: true,
      showSiderbarDetail: false,
      showQuery: false,
      drawGrphic: "edit",
      project_id:null,//针对新增图形的项目红线id
      addGraphLayer:null//针对新增图形的图层
    };
    this.map = null;
    this.saveRef = v => {
      this.refDom = v;
    };
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
      me.setState({ drawGrphic: "edit" });
      if (obj.from === "project") {
        me.queryWFSServiceByProperty(
          obj.id,
          "project_id",
          config.mapProjectLayerName,
          me.callbackEditQueryWFSService
        );
      } else if (obj.from === "spot") {
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
    //地图定位
    this.eventEmitter = emitter.addListener("mapLocation", data => {
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
    //绘制扰动图斑图形
    this.eventEmitter = emitter.addListener("drawSpot", data => {
      if (data.draw) {
        me.setState({ drawGrphic: "add",project_id:data.project_id });
        const { addGraphLayer } = me.state;
        if(addGraphLayer){
            map.removeLayer(addGraphLayer);
            me.setState({ addGraphLayer: null });
        }
        map.pm.enableDraw("Polygon", {
          finishOn: "dblclick",
          allowSelfIntersection: false,
          tooltips: false
        });
        //显示图形编辑菜单按钮
        me.setState({ showButton: true });
        //编辑图形
        map.on('pm:create', e => {
          //console.log(e);
          me.setState({addGraphLayer:e.layer});
          e.layer.pm.enable({
            allowSelfIntersection: false,
          });
        });       
      }
    });
    //监听侧边栏显隐
    this.eventEmitter = emitter.addListener("showSiderbar", data => {
      this.setState({
        showSiderbar: data.show
      });
    });
    this.eventEmitter = emitter.addListener("showSiderbarDetail", data => {
      this.setState({
        showSiderbarDetail: data.show
      });
    });
    this.eventEmitter = emitter.addListener("showQuery", data => {
      this.setState({
        showQuery: data.show
      });
    });
  }
  /*
   * 编辑图形查询回调函数
   */

  callbackEditQueryWFSService = data => {
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
  callbackLocationQueryWFSService = data => {
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
      me.automaticToMap();
    }
  };
  /*
   * 自动匹配地图偏移
   */
  automaticToMap = () => {
    const me = this;
    const { clientWidth, clientHeight } = me.refDom;
    const { showSiderbar, showSiderbarDetail, showQuery } = me.state;
    let point = map.latLngToContainerPoint(
      userconfig.projectgeojsonLayer.getBounds().getCenter()
    );
    const offsetSiderbar = showSiderbar ? 200 : 0;
    const offsetSiderbarDetail = showSiderbarDetail ? 200 : 0;
    const offsetQuery = showQuery ? 225 : 0;
    point.x =
      point.x -
      clientWidth / 2 -
      offsetSiderbar -
      offsetSiderbarDetail -
      offsetQuery;
    point.y = point.y - clientHeight / 2;
    map.panBy(point);
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
  // 创建地图
  createMap = () => {
    const me = this;
    map = L.map("map", {
      zoomControl: false,
      attributionControl: false
      //editable: true
    }).setView(config.mapInitParams.center, config.mapInitParams.zoom);

    L.control
      .zoom({ zoomInTitle: "放大", zoomOutTitle: "缩小", position: "topright" })
      .addTo(map);
    const scale = L.control
      .scale({ imperial: false, position: "bottomright" })
      .addTo(map);
    jQuery(scale.getContainer())
      .find("div")
      .css({
        background: "rgba(255, 255, 255, 1)",
        border: "1px solid #000",
        borderTop: "none"
      });

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
    let turfpoint = turf.point([e.latlng.lng, e.latlng.lat]);
    if (!turf.booleanContains(userconfig.polygon, turfpoint)) {
      message.warning("区域范围之外的数据没有权限操作", 1);
      return;
    }
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
  queryWFSServiceByProperty = (
    propertyValue,
    propertyName,
    typeName,
    callback
  ) => {
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
      callback: callback
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
          me.automaticToMap();
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
    L.control
      .navbar({
        center: bounds.getCenter(),
        forwardTitle: "前视图",
        backTitle: "后视图",
        homeTitle: "全图"
      })
      .addTo(map);
    L.control.layers(userconfig.baseLayers, overlays).addTo(map);
    //量算工具
    var measureControl = new L.Control.Measure({
      primaryLengthUnit: "kilometers",
      primaryAreaUnit: "sqmeters",
      activeColor: "#3388FF",
      completedColor: "#3388FF"
    });
    measureControl.addTo(map);
  };
  /*
   * 取消编辑图形
   */
  cancelEditGraphic = e => {
    e.stopPropagation();
    this.setState({ showButton: false });
    map.on("click", this.onClickMap);
    //禁止编辑图形
    userconfig.projectgeojsonLayer.pm.disable();
    //禁止移动图形
    //map.pm.disableGlobalRemovalMode();
    this.clearGeojsonLayer();
  };
  /*
   * 取消新增图形
   */
  cancelAddGraphic = e => {
    e.stopPropagation();
    this.setState({ showButton: false });
    const { addGraphLayer } = this.state;
    //禁止编辑图形
    if(addGraphLayer){
      addGraphLayer.pm.disable();
      map.removeLayer(addGraphLayer);
      this.setState({ addGraphLayer: null });
    }
  };
  /*
   * 保存编辑图形
   */

  saveEditGraphic = e => {
    e.stopPropagation();
    const me = this;
    this.setState({ showButton: false });
    map.on("click", this.onClickMap);
    //禁止编辑图形
    userconfig.projectgeojsonLayer.pm.disable();
    //禁止移动图形
    //map.pm.disableGlobalRemovalMode();

    let geojson = userconfig.projectgeojsonLayer.toGeoJSON();
    let polygon = "multipolygon((";
    let coordinates = geojson.features[0].geometry.coordinates;
    for (let i = 0; i < coordinates.length; i++) {
      let coordinate = coordinates[i];
      if (i === coordinates.length - 1) {
        polygon += "(";
        for (let j = 0; j < coordinate.length; j++) {
          let xy = coordinate[j];
          for (let n = 0; n < xy.length; n++) {
            let data = xy[n];
            if (n === xy.length - 1) {
              polygon += data[0] + " " + data[1];
            } else {
              polygon += data[0] + " " + data[1] + ",";
            }
          }
        }
        polygon += ")";
      } else {
        polygon += "(";
        for (let j = 0; j < coordinate.length; j++) {
          let xy = coordinate[j];
          for (let n = 0; n < xy.length; n++) {
            let data = xy[n];
            if (n === xy.length - 1) {
              polygon += data[0] + " " + data[1];
            } else {
              polygon += data[0] + " " + data[1] + ",";
            }
          }
        }
        polygon += "),";
      }
    }
    polygon += "))";

    if (geojson.features[0].properties.spot_tbid) {
      this.props.dispatch({
        type: "project/updateSpotGraphic",
        payload: {
          spot_tbid: geojson.features[0].properties.spot_tbid,
          geometry: polygon
        },
        callback: obj => {
          me.clearGeojsonLayer();
        }
      });
    } else {
      this.props.dispatch({
        type: "project/updateProjectScopeGraphic",
        payload: {
          project_id: geojson.features[0].properties.project_id,
          geometry: polygon
        },
        callback: obj => {
          me.clearGeojsonLayer();
        }
      });
    }
  };

  render() {
    const { showButton, drawGrphic } = this.state;
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
            ref={this.saveRef}
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
                  display: showButton ? "block" : "none",
                  position: "absolute",
                  top: 15,
                  right: 180,
                  zIndex: 1000
                }}
              >
                <Button
                  icon="rollback"
                  onClick={
                    drawGrphic === "edit" ? this.cancelEditGraphic : this.cancelAddGraphic
                  }
                />
                <Button
                  icon="check"
                  onClick={drawGrphic === "edit" ? this.saveEditGraphic : null}
                />
              </div>
            </div>
            {/*图标联动按钮 */}
            <div
              style={{
                position: "absolute",
                top: 70,
                left: 380,
                height: 0,
                zIndex: 1000,
                background: "transparent"
              }}
              onClick={(v, e) => {
                console.log(111);
              }}
            >
              <Switch
                checkedChildren="图表联动"
                unCheckedChildren="图表不联动"
                style={{
                  width: 100
                }}
                onClick={(v, e) => {
                  e.stopPropagation();
                  console.log(v, e);
                }}
              />
            </div>
            {/*测量、历史对比按钮 */}
            <div
              style={{
                position: "absolute",
                top: 62,
                right: 80,
                zIndex: 1000
              }}
            >
              <Popover content="测量" title="" trigger="hover">
                <Button icon="colum-height" />
              </Popover>
              <Popover content="历史对比" title="" trigger="hover">
                <Button icon="swap" />
              </Popover>
            </div>
            {/* 图例说明 */}
            <div
              style={{
                position: "absolute",
                bottom: 50,
                right: 20,
                zIndex: 1000,
                background: "#fff"
                // padding: "10px 10px 0px 17px",
                // border: "solid 1px #ddd",
                // borderRadius: 3
              }}
            >
              <Popover
                content={
                  <div>
                    {config.legend.map((item, index) => (
                      <p key={index}>
                        <span
                          style={{
                            background: item.background,
                            border: `${index < 2 ? "dotted" : "solid"} 2px ${
                              item.border
                            }`,
                            width: 13,
                            height: 13,
                            display: "inline-block",
                            position: "relative",
                            top: 2,
                            right: 6
                          }}
                        />
                        <span>{item.title}</span>
                      </p>
                    ))}
                  </div>
                }
                title=""
                trigger="hover"
              >
                <Button icon="question-circle" />
              </Popover>
            </div>
            {/* 底部遮罩层 */}
            {/* <div
              style={{
                position: "absolute",
                bottom: 0,
                height: 30,
                width: "100vw",
                zIndex: 1000,
                background: "rgba(0,0,0,.4)"
              }}
            /> */}
          </div>
        </div>
      </LocaleProvider>
    );
  }
}
