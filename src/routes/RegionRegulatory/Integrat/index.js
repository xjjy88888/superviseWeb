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
  Select,
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
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "proj4";
import "proj4leaflet";
import "leaflet.pm/dist/leaflet.pm.css";
import "leaflet.pm";
import "leaflet-navbar/Leaflet.NavBar.css";
import "leaflet-navbar";
import "leaflet-side-by-side";
import "leaflet-measure/dist/leaflet-measure.css";
import "leaflet-measure/dist/leaflet-measure.cn";
import shp from "shpjs";
import * as turf from "@turf/turf";
//import '@h21-map/leaflet-path-drag';
//import 'leaflet-editable';
//import { greatCircle, point, circle } from '@turf/turf';
import "antd-mobile/dist/antd-mobile.css";
import config from "../../../config";
import emitter from "../../../utils/event";
import jQuery from "jquery";

let userconfig = {};
let map;
let marker;
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
      showHistoryContrast: false,
      showSiderbar: true,
      showSiderbarDetail: false,
      showProblem: false,
      showQuery: false,
      drawGrphic: "edit",
      project_id: null, //针对新增图形的项目红线id
      addGraphLayer: null //针对新增图形的图层
    };
    this.map = null;
    this.saveRef = v => {
      this.refDom = v;
    };
  }
  componentDidMount() {
    const me = this;
    const { dispatch } = this.props;
    dispatch({
      type: "mapdata/GetBoundAsync",
      callback: boundary => {
        //console.log(boundary);
        userconfig.geojson = JSON.parse(boundary.result);
        // 创建地图
        me.createMap();
      }
    });
    //气泡窗口详情查看
    window.goDetail = obj => {
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
          "map_num",
          config.mapSpotLayerName,
          me.callbackEditQueryWFSService
        );
      }
    };
    //气泡窗口图形删除
    window.goDeleteGraphic = obj => {
      Modal.confirm({
        title: "你确定要删除该图形?",
        content: "删除之后该图形无法恢复",
        onOk() {
          me.setState({ drawGrphic: "delete" });
          if (obj.from === "project") {
            me.props.dispatch({
              type: "project/removeProjectScopeGraphic",
              payload: {
                project_id: obj.id
              },
              callback: obj => {
                me.clearGeojsonLayer();
                map.closePopup();
              }
            });
          } else if (obj.from === "spot") {
            me.props.dispatch({
              type: "project/removeSpotGraphic",
              payload: {
                spot_tbid: obj.id
              },
              callback: obj => {
                me.clearGeojsonLayer();
                map.closePopup();
              }
            });
          }
        },
        onCancel() {
          me.clearGeojsonLayer();
          map.closePopup();
        }
      });
    };
    //获取url参数
    me.initUrlParams();
    // 创建地图
    //me.createMap();
    // 组件通信
    //地图定位
    this.eventEmitter = emitter.addListener("mapLocation", data => {
      if (data.key === "project") {
        dispatch({
          type: "mapdata/queryProjectPosition",
          payload: {
            id: data.item.projectId
          },
          callback: response => {
            //console.log("response", response);
            if(response.success){
              //点查WMS图层
              let point = { x: response.result.pointX, y: response.result.pointY};
              userconfig.mapPoint = [point.y,point.x];
              me.queryWFSServiceByPoint(point, config.mapLayersName,true);
            }else{
              message.warning("地图定位不到相关数据", 1);             
            }
          }
        });
        /*this.queryWFSServiceByProperty(
          data.item.projectId,
          "project_id",
          config.mapProjectLayerName,
          this.callbackLocationQueryWFSService
        );*/
      } else if (data.key === "spot") {
        this.queryWFSServiceByProperty(
          data.item.mapNum,
          "map_num",
          config.mapSpotLayerName,
          this.callbackLocationQueryWFSService
        );
      }
    });
    //照片定位
    this.eventEmitter = emitter.addListener("imgLocation", data => {
      if (data.show) {
        let latLng = [data.Latitude, data.Longitude];
        //direction 方位角
        let picName = me.getPicByAzimuth(data.direction);
        let myIcon = L.icon({
          iconUrl: "./img/" + picName + ".png",
          iconSize: [60, 60]
        });
        if (marker) marker.remove();
        marker = L.marker(latLng, { icon: myIcon }).addTo(map);
        //marker = L.marker(latLng).addTo(map);
        map.setZoom(13);
        me.automaticToMap(latLng);
      } else {
        if (marker) marker.remove();
      }
    });
    //屏幕截图
    this.eventEmitter = emitter.addListener("screenshot", data => {
      //var areaSelect = L.areaSelect({width:200, height:300});
      //areaSelect.addTo(map);
      //绘制图形之前
      if (userconfig.screenLayer) {
        map.removeLayer(userconfig.screenLayer);
      }
      //绘制矩形
      map.pm.enableDraw("Rectangle", {
        finishOn: "dblclick",
        allowSelfIntersection: false,
        tooltips: false
      });
      map.on("pm:create", e => {
        userconfig.screenLayer = e.layer;
        //console.log(userconfig.screenLayer.getBounds());
        let northEast = userconfig.screenLayer.getBounds()._northEast;
        let southWest = userconfig.screenLayer.getBounds()._southWest;
        //console.log(map.latLngToContainerPoint(northEast));
        //console.log(map.latLngToContainerPoint(southWest));
        let northEastPoint = map.latLngToContainerPoint(northEast);
        let southWestPoint = map.latLngToContainerPoint(southWest);
        let width = Math.abs(northEastPoint.x - southWestPoint.x);
        let height = Math.abs(northEastPoint.y - southWestPoint.y);
        //let size = {x:width,y:height};
        /*leafletImage(map, (err, canvas)=>{
          //console.log(canvas.toDataURL());
          //let snapshot = document.getElementById('snapshot');
          var img = document.createElement('img');
          img.width = width;
          img.height = height;
          //var dimensions = map.getSize();
          //img.width = dimensions.x;
          //img.height = dimensions.y;
          img.src = canvas.toDataURL();
          //snapshot.innerHTML = '';
          //snapshot.appendChild(img);
        });*/
      });
    });
    //绘制扰动图斑图形
    this.eventEmitter = emitter.addListener("drawSpot", data => {
      if (data.draw) {
        me.setState({ drawGrphic: "addSpot", project_id: data.project_id });
        const { addGraphLayer } = me.state;
        if (addGraphLayer) {
          map.removeLayer(addGraphLayer);
          me.setState({ addGraphLayer: null });
        }
        //绘制图形之前
        map.on("pm:drawstart", ({ workingLayer }) => {
          workingLayer.on("pm:vertexadded", e => {
            let turfpoint = turf.point([e.latlng.lng, e.latlng.lat]);
            //if (!turf.booleanContains(userconfig.polygon, turfpoint)) {
            if (!turf.booleanPointInPolygon(turfpoint, userconfig.polygon)) {
              map.pm.disableDraw("Polygon");
              emitter.emit("showSiderbarDetail", {
                show: false,
                from: "spot",
                item: { id: "" }
              });
              me.setState({ showButton: false });
              return;
            }
          });
        });
        map.pm.enableDraw("Polygon", {
          finishOn: "dblclick",
          allowSelfIntersection: false,
          tooltips: false
        });
        //显示图形编辑菜单按钮
        me.setState({ showButton: true });
        //编辑图形
        map.on("pm:create", e => {
          //console.log(e);
          me.setState({ addGraphLayer: e.layer });
          e.layer.pm.enable({
            allowSelfIntersection: false
          });
        });
      }
    });
    //绘制项目红线图形
    this.eventEmitter = emitter.addListener("drawDuty", data => {
      if (data.draw) {
        me.setState({ drawGrphic: "addDuty" });
        const { addGraphLayer } = me.state;
        if (addGraphLayer) {
          map.removeLayer(addGraphLayer);
          me.setState({ addGraphLayer: null });
        }
        //绘制图形之前
        map.on("pm:drawstart", ({ workingLayer }) => {
          workingLayer.on("pm:vertexadded", e => {
            let turfpoint = turf.point([e.latlng.lng, e.latlng.lat]);
            //if (!turf.booleanContains(userconfig.polygon, turfpoint)) {
            if (!turf.booleanPointInPolygon(turfpoint, userconfig.polygon)) {
              map.pm.disableDraw("Polygon");
              emitter.emit("showSiderbarDetail", {
                show: false,
                from: "spot",
                item: { id: "" }
              });
              me.setState({ showButton: false });
              return;
            }
          });
        });
        map.pm.enableDraw("Polygon", {
          finishOn: "dblclick",
          allowSelfIntersection: false,
          tooltips: false
        });
        //显示图形编辑菜单按钮
        me.setState({ showButton: true });
        //编辑图形
        map.on("pm:create", e => {
          //console.log(e);
          me.setState({ addGraphLayer: e.layer });
          e.layer.pm.enable({
            allowSelfIntersection: false
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
    this.eventEmitter = emitter.addListener("showProblem", data => {
      this.setState({
        showProblem: data.show
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
    if (data.features.length > 0) {
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
      me.automaticToMap(userconfig.projectgeojsonLayer.getBounds().getCenter());
    } else {
      message.warning("地图定位不到相关数据", 1);
    }
  };
  /*
   * 根据方位角获取对应的图片
   */
  getPicByAzimuth = azimuth => {
    let pic;
    pic =
      azimuth === 0
        ? "north"
        : azimuth < 90
        ? "east_north"
        : azimuth === 90
        ? "east"
        : azimuth < 180
        ? "east_south"
        : azimuth === 180
        ? "south"
        : azimuth < 270
        ? "west_south"
        : azimuth === 270
        ? "west"
        : azimuth < 360
        ? "west_north"
        : "north";
    //console.log(pic);
    return pic;
  };
  /*
   * 自动匹配地图偏移
   */
  automaticToMap = latLng => {
    const me = this;
    const { clientWidth, clientHeight } = me.refDom;
    const {
      showSiderbar,
      showSiderbarDetail,
      showQuery,
      showProblem
    } = me.state;
    let point = map.latLngToContainerPoint(
      //userconfig.projectgeojsonLayer.getBounds().getCenter()
      latLng
    );
    const offsetSiderbar = showSiderbar ? 200 : 0;
    const offsetSiderbarDetail = showSiderbarDetail ? 200 : 0;
    const offsetQuery = showQuery ? 225 : 0;
    const offsetProblem = showProblem ? 215 : 0;
    point.x =
      point.x -
      clientWidth / 2 -
      offsetSiderbar -
      offsetSiderbarDetail -
      offsetProblem -
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
    /* This code is needed to properly load the images in the Leaflet CSS */
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
      iconUrl: require("leaflet/dist/images/marker-icon.png"),
      shadowUrl: require("leaflet/dist/images/marker-shadow.png")
    });
    map = L.map("map", {
      zoomControl: false,
      attributionControl: false
      //editable: true
    }).setView(config.mapInitParams.center, config.mapInitParams.zoom);

    map.createPane("tileLayerZIndex");
    map.getPane("tileLayerZIndex").style.zIndex = 0;
    const baseLayer1 = (userconfig.baseLayer1 = L.tileLayer(
      config.baseMaps[0].Url,
      {
        pane: "tileLayerZIndex"
      }
    )); //街道图
    const baseLayer2 = (userconfig.baseLayer2 = L.tileLayer(
      config.baseMaps[1].Url,
      {
        pane: "tileLayerZIndex"
      }
    )); //影像图
    const baseLayer3 = (userconfig.baseLayer3 = L.tileLayer(
      config.baseMaps[2].Url,
      {
        pane: "tileLayerZIndex"
      }
    )); //监管影像
    map.addLayer(baseLayer2);
    userconfig.baseLayers = {
      监管影像: baseLayer3,
      街道图: baseLayer1,
      影像图: baseLayer2
    };
    //卷帘地图效果
    //L.control.sideBySide(baseLayer1, baseLayer).addTo(map);
    //监听地图点击事件
    map.on("click", me.onClickMap);
    //监听地图移动完成事件
    map.on("moveend", me.onMoveendMap);
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
    //if (!turf.booleanContains(userconfig.polygon, turfpoint)) {
    if (!turf.booleanPointInPolygon(turfpoint, userconfig.polygon)) {
      message.warning("区域范围之外的数据没有权限操作", 1);
      return;
    }
    //点查WMS图层
    userconfig.mapPoint = e.latlng;
    let point = { x: e.latlng.lng, y: e.latlng.lat };
    me.queryWFSServiceByPoint(point, config.mapLayersName,false);
  };
  onMoveendMap = e => {
    //console.log(map.getZoom());
    if (map.getZoom() >= 13) {
      this.queryWFSServiceByPolygon(config.mapLayersName);
    }
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

  /*空间查询图层
   *@method queryWFSServiceByPolygon
   *@param typeName 图层名称
   *@return null
   */
  queryWFSServiceByPolygon = typeName => {
    const me = this;
    let bounds = map.getBounds();
    let polygon = bounds.getSouthWest().lng + "," + bounds.getSouthWest().lat;
    polygon +=
      " " + bounds.getSouthWest().lng + "," + bounds.getNorthEast().lat;
    polygon +=
      " " + bounds.getNorthEast().lng + "," + bounds.getNorthEast().lat;
    polygon +=
      " " + bounds.getNorthEast().lng + "," + bounds.getSouthWest().lat;
    polygon +=
      " " + bounds.getSouthWest().lng + "," + bounds.getSouthWest().lat;
    //console.log(polygon);
    let filter =
      '<Filter xmlns="http://www.opengis.net/ogc" xmlns:gml="http://www.opengis.net/gml">';
    filter += "<Intersects>";
    filter += "<PropertyName>geom</PropertyName>";
    filter += "<gml:Polygon>";
    filter += "<gml:outerBoundaryIs>";
    filter += "<gml:LinearRing>";
    filter += "<gml:coordinates>" + polygon + "</gml:coordinates>";
    filter += "</gml:LinearRing>";
    filter += "</gml:outerBoundaryIs>";
    filter += "</gml:Polygon>";
    filter += "</Intersects>";
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
      callback: data => {
        if (data.features.length > 0) {
          console.log(data);
        }
      }
    });
  };
  /*点选查询图层
   *@method queryWFSServiceByPoint
   *@param point 坐标点
   *@param typeName 图层名称
   *@param isautomaticToMap 是否自动跳转居中地图不被遮盖
   *@return null
   */
  queryWFSServiceByPoint = (point, typeName,isautomaticToMap) => {
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
          if(isautomaticToMap){
            map.setZoom(15);
            me.automaticToMap(
              userconfig.projectgeojsonLayer.getBounds().getCenter()
            );
          }
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
      id: properties.map_num || properties.project_id,
      from: properties.map_num ? "spot" : "project"
    };
    elements = properties.map_num
      ? jQuery(
          `<div>图斑编号:${properties.map_num}</br>
        ${
          properties.project_id
            ? "关联项目:" + properties.project_id + "</br>"
            : ""
        }${
            properties.interference_compliance_id
              ? "扰动范围:" + properties.interference_compliance_id + "</br>"
              : ""
          }<a onclick='goDetail(${JSON.stringify(
            obj
          )})'>详情</a>    <a onclick='goEditGraphic(${JSON.stringify(
            obj
          )})'>图形编辑</a>  <a onclick='goDeleteGraphic(${JSON.stringify(
            obj
          )})'>图形删除</a></div>`
        )
      : jQuery(
          `<div>项目ID:${properties.project_id}</br>
          <a onclick='goDetail(${JSON.stringify(
            obj
          )})'>详情</a>    <a onclick='goEditGraphic(${JSON.stringify(
            obj
          )})'>图形编辑</a>  <a onclick='goDeleteGraphic(${JSON.stringify(
            obj
          )})'>图形删除</a></div>`
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
    let bounds = userconfig.geoJsonLayer.getBounds();
    map.fitBounds(bounds);
    //构造面
    userconfig.polygon = turf.multiPolygon(
      geojson.features[0].geometry.coordinates
    );
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
    //地图模态层效果
    me.loadmodalLayer();

    /*let url = "";
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
    me.loadSHP(url);*/
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
              //console.log(polygon);
              emitter.emit("polygon", {
                polygon: polygon
              });
              //地图模态层效果
              me.loadmodalLayer();

              break;
            }
          }
        }
      });
    }
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
    let tempLayer = L.Proj.geoJson(modalJson, {
      style: {
        color: "#0070FF",
        weight: 3,
        opacity: 1,
        fillColor: "rgba(0, 0, 0, 0.45)",
        fillOpacity: 1
      }
    }).addTo(map);
    jQuery(tempLayer.getPane())
      .find("path")
      .css({
        cursor: "not-allowed"
      });
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
        layers: "ZKYGIS:bs_project_scope", //需要加载的图层
        format: "image/png", //返回的数据格式
        transparent: true
      })
      .addTo(projectlayerGroup);
    //加载图斑图层wms
    L.tileLayer
      .wms(config.mapUrl.geoserverUrl + "/wms?", {
        layers: "	ZKYGIS:bs_spot", //需要加载的图层
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
    //底图切换控件
    L.control.layers(userconfig.baseLayers, overlays).addTo(map);
    //地图缩放控件
    L.control
      .zoom({ zoomInTitle: "放大", zoomOutTitle: "缩小", position: "topright" })
      .addTo(map);
    //地图视图控件
    L.control
      .navbar({
        center: bounds.getCenter(),
        forwardTitle: "前视图",
        backTitle: "后视图",
        homeTitle: "全图"
      })
      .addTo(map);
    //地图比例尺控件
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
  cancelEditGraphic = () => {
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
  cancelAddGraphic = () => {
    //addGraphLayer.toGeoJSON()
    this.setState({ showButton: false });
    const { addGraphLayer } = this.state;
    //禁止编辑图形
    if (addGraphLayer) {
      addGraphLayer.pm.disable();
      map.removeLayer(addGraphLayer);
      this.setState({ addGraphLayer: null });
    }
    emitter.emit("showSiderbarDetail", {
      show: false,
      from: "spot",
      item: { id: "" }
    });
  };
  /*
   * 保存新增图形
   */
  saveAddGraphic = () => {
    const me = this;
    me.setState({ showButton: false });
    const { addGraphLayer, drawGrphic, project_id } = me.state;
    //禁止编辑图形
    if (addGraphLayer) {
      addGraphLayer.pm.disable();
      let geojson = addGraphLayer.toGeoJSON();
      let polygon = me.geojson2Multipolygon(geojson, 1);
      if (drawGrphic === "addSpot") {
        //新增绘制扰动图斑保存
        me.props.dispatch({
          type: "project/addSpotGraphic",
          payload: {
            spot_tbid: "spot_" + Math.random(),
            project_id: project_id,
            geometry: polygon
          },
          callback: obj => {
            map.removeLayer(addGraphLayer);
            me.setState({ addGraphLayer: null });
            emitter.emit("showSiderbarDetail", {
              show: false,
              from: "spot"
            });
          }
        });
      } else {
        //新增绘制项目红线范围保存
        me.props.dispatch({
          type: "project/addProjectScopeGraphic",
          payload: {
            project_id: "",
            geometry: polygon
          },
          callback: obj => {
            map.removeLayer(addGraphLayer);
            me.setState({ addGraphLayer: null });
            emitter.emit("showSiderbarDetail", {
              show: false,
              from: "spot"
            });
          }
        });
      }
    }
  };
  /*
   * 保存编辑图形
   */
  saveEditGraphic = e => {
    console.log(e);
    e.stopPropagation();
    const me = this;
    this.setState({ showButton: false });
    map.on("click", this.onClickMap);
    //禁止编辑图形
    userconfig.projectgeojsonLayer.pm.disable();
    //禁止移动图形
    //map.pm.disableGlobalRemovalMode();

    let geojson = userconfig.projectgeojsonLayer.toGeoJSON();
    let polygon = me.geojson2Multipolygon(geojson, 0);
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
  /*
   * geojson转换multipolygon
   * @type 0代表编辑图形;1代表新增图形
   */
  geojson2Multipolygon = (geojson, type) => {
    let polygon = "";
    let coordinates;
    type === 0
      ? (coordinates = geojson.features[0].geometry.coordinates)
      : (coordinates = geojson.geometry.coordinates);
    polygon += "multipolygon((";
    //let coordinates = geojson.features[0].geometry.coordinates;
    for (let i = 0; i < coordinates.length; i++) {
      let coordinate = coordinates[i];
      if (i === coordinates.length - 1) {
        polygon += "(";
        for (let j = 0; j < coordinate.length; j++) {
          let xy = coordinate[j];
          if (type === 0) {
            //编辑图形
            for (let n = 0; n < xy.length; n++) {
              let data = xy[n];
              if (n === xy.length - 1) {
                polygon += data[0] + " " + data[1];
              } else {
                polygon += data[0] + " " + data[1] + ",";
              }
            }
          } else {
            //新增图形
            if (j === coordinate.length - 1) {
              polygon += xy[0] + " " + xy[1];
            } else {
              polygon += xy[0] + " " + xy[1] + ",";
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
    return polygon;
  };
  /*
   * 地图历史对比-卷帘效果
   */
  showHistoryMap = () => {
    const { showHistoryContrast } = this.state;
    if (showHistoryContrast) {
      //移除卷帘效果
      this.removeSideBySide();
      this.addSideBySide();
    } else {
      //移除卷帘效果
      this.removeSideBySide();
      //还原默认底图加载
      map.addLayer(userconfig.baseLayer2);
    }
  };
  /*
   * 添加卷帘效果
   */
  addSideBySide = () => {
    //map.addLayer(userconfig.baseLayer3);
    map.addLayer(userconfig.baseLayer1);
    map.addLayer(userconfig.baseLayer2);
    //卷帘地图效果
    userconfig.sideBySide = L.control
      .sideBySide(userconfig.baseLayer2, userconfig.baseLayer1)
      .addTo(map);
    userconfig.curleftlayer = userconfig.baseLayer2;
    userconfig.currightlayer = userconfig.baseLayer1;
  };
  /*
   * 移除卷帘效果
   */
  removeSideBySide = () => {
    if (userconfig.sideBySide) {
      userconfig.sideBySide.remove();
    }
    if (map.hasLayer(userconfig.baseLayer1))
      map.removeLayer(userconfig.baseLayer1);
    if (map.hasLayer(userconfig.baseLayer2))
      map.removeLayer(userconfig.baseLayer2);
    if (map.hasLayer(userconfig.baseLayer3))
      map.removeLayer(userconfig.baseLayer3);
  };
  onChangeSelectLeft = v => {
    //console.log(v);
    let layer;
    switch (v) {
      case "1":
        layer = userconfig.baseLayer1;
        break;
      case "2":
        layer = userconfig.baseLayer2;
        break;
      case "3":
        layer = userconfig.baseLayer3;
        break;
      default:
    }
    if (map.hasLayer(userconfig.curleftlayer))
      map.removeLayer(userconfig.curleftlayer);
    if (map.hasLayer(userconfig.currightlayer))
      map.removeLayer(userconfig.currightlayer);
    map.addLayer(layer);
    map.addLayer(userconfig.currightlayer);
    userconfig.sideBySide.setLeftLayers(layer);
    userconfig.curleftlayer = layer;
    userconfig.sideBySide.setRightLayers(userconfig.currightlayer);
  };
  onChangeSelectRight = v => {
    //console.log(v);
    let layer;
    switch (v) {
      case "1":
        layer = userconfig.baseLayer1;
        break;
      case "2":
        layer = userconfig.baseLayer2;
        break;
      case "3":
        layer = userconfig.baseLayer3;
        break;
      default:
    }
    if (map.hasLayer(userconfig.curleftlayer))
      map.removeLayer(userconfig.curleftlayer);
    if (map.hasLayer(userconfig.currightlayer))
      map.removeLayer(userconfig.currightlayer);
    map.addLayer(layer);
    map.addLayer(userconfig.curleftlayer);
    userconfig.sideBySide.setLeftLayers(userconfig.curleftlayer);
    userconfig.sideBySide.setRightLayers(layer);
    userconfig.currightlayer = layer;
  };

  render() {
    const { showButton, drawGrphic, showHistoryContrast } = this.state;
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
            />
            {/* 编辑图形-保存、取消保存按钮 */}
            <div
              style={{
                display: showButton ? "block" : "none",
                position: "absolute",
                top: 65,
                right: 240,
                zIndex: 1000
              }}
            >
              <Button
                icon="rollback"
                onClick={
                  drawGrphic === "edit"
                    ? this.cancelEditGraphic
                    : this.cancelAddGraphic
                }
              />
              <Button
                icon="check"
                onClick={
                  drawGrphic === "edit"
                    ? this.saveEditGraphic
                    : this.saveAddGraphic
                }
              />
            </div>
            {/*图标联动按钮 */}
            <div
              style={{
                position: "absolute",
                top: 65,
                right: 120,
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
                unCheckedChildren="图表联动"
                style={{
                  width: 100
                }}
                onClick={(v, e) => {
                  e.stopPropagation();
                  console.log(v, e);
                }}
              />
            </div>
            {/* 图例说明、历史对比 */}
            <div
              style={{
                position: "absolute",
                bottom: 50,
                right: 20,
                zIndex: 1000,
                background: "#fff"
              }}
            >
              <Popover content="历史对比" title="" trigger="hover">
                <Button
                  icon="swap"
                  onClick={() => {
                    this.setState({
                      showHistoryContrast: !showHistoryContrast
                    });
                    emitter.emit("showSiderbar", {
                      show: showHistoryContrast
                    });
                    setTimeout(() => {
                      this.showHistoryMap();
                    }, 200);
                  }}
                />
              </Popover>
              <br />
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
                <Button icon="bars" />
              </Popover>
            </div>
            {/* 历史对比地图切换 */}
            <div
              style={{
                display: showHistoryContrast ? "block" : "none",
                position: "absolute",
                top: 65,
                left: 15,
                zIndex: 1000
              }}
            >
              <Select defaultValue="2" onChange={this.onChangeSelectLeft}>
                <Select.Option value="1">街道图</Select.Option>
                <Select.Option value="2">影像图</Select.Option>
                <Select.Option value="3">监管影像</Select.Option>
              </Select>
            </div>
            <div
              style={{
                display: showHistoryContrast ? "block" : "none",
                position: "absolute",
                top: 65,
                right: 240,
                zIndex: 1001
              }}
            >
              <Select defaultValue="1" onChange={this.onChangeSelectRight}>
                <Select.Option value="1">街道图</Select.Option>
                <Select.Option value="2">影像图</Select.Option>
                <Select.Option value="3">监管影像</Select.Option>
              </Select>
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
            {/* 历史对比 */}
            {/* <div
              style={{
                display: showHistoryContrast ? "block" : "none",
                position: "fixed",
                left: 0,
                top: 0,
                height: "100vh",
                width: "100vw",
                background: "rgba(0,0,0,.3)",
                zIndex: 1001
              }}
            >
              <div
                id="historymap"
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  width: "85vw",
                  height: "85vh",
                  background: "#fff",
                  transform: "translate(-50%,-50%)"
                }}
              >
                <Icon
                  type="close"
                  style={{
                    position: "absolute",
                    top: 10,
                    right: 10,
                    fontSize: 20,
                    zIndex: 1001
                  }}
                  onClick={() => {
                    this.setState({ showHistoryContrast: false });
                  }}
                />
              </div>
            </div>
 */}
          </div>
        </div>
      </LocaleProvider>
    );
  }
}
