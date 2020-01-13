/* eslint-disable no-loop-func */
import React, { PureComponent } from "react";
import { connect } from "dva";
import {
  Button,
  Switch,
  Popover,
  Modal,
  Select,
  notification,
  message,
  Radio,
  Carousel
} from "antd";
import Sidebar from "../List/Sidebar";
import ProjectList from "../List/ProjectList";
import SidebarDetail from "../List/Expand/SiderbarDetail";
import Tool from "../List/Aside/Tool";
import Sparse from "./Sparse";
import Panorama from "./Panorama";
import Chart from "../List/Aside/Chart";
import Query from "../List/Aside/Query";
import Inspect from "../List/Inspect/Edit";
import ProblemPoint from "../List/Inspect/ProblemPoint";
import MeasurePoint from "../List/Inspect/MeasurePoint";
import ProjectDetail from "../List/ProjectInfoMore";
import VideoMonitor from "../List/Expand/VideoMonitor";
import Examine from "../List/Expand/Examine";
import HistoryPlay from "./HistoryPlay";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
// import DynamicMapLayer from 'esri-leaflet/src/Layers/DynamicMapLayer';
import proj4 from "proj4";
import "proj4leaflet";
import "leaflet.pm/dist/leaflet.pm.css";
import "leaflet.pm";
import "leaflet-navbar/Leaflet.NavBar.css";
import "leaflet-navbar";
import "leaflet-side-by-side";
import "leaflet-measure/dist/leaflet-measure.css";
import "leaflet-measure/dist/leaflet-measure.cn";
import "leaflet.vectorgrid"; //矢量瓦片
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet.markercluster";
import "leaflet-easybutton/src/easy-button.css";
import "leaflet-easybutton";
import echarts from "echarts/lib/echarts";
import LeaftWMS from "leaflet.wms";
import * as turf from "@turf/turf";
import domtoimage from "dom-to-image";
//import '@h21-map/leaflet-path-drag';
//import 'leaflet-editable';
//import { greatCircle, point, circle } from '@turf/turf';
import "antd-mobile/dist/antd-mobile.css";
import config from "../../../config";
import emitter from "../../../utils/event";
import jQuery from "jquery";
// import { validateId } from "@turf/helpers";
import Layouts from "../../../components/Layouts";
import Spins from "../../../components/Spins";
import "./index.less";
import Contrast from "./Contrast";
import { getUrl, polygonClipByLine } from "../../../utils/util";

let userconfig = {};
let map = null;
let ImgListLayer = null;
/*-------------------------------------区域监管部分-------------------------------------*/
let marker = null;
let picLayerGroup = null;
let problemPointLayer = L.layerGroup([]); //问题点
let measurePointLayer = L.layerGroup([]); //措施点

/*-------------------------------------项目监管部分-------------------------------------*/
let regiongeojsonLayer = null; //行政区划矢量图层
let ZSgeojsonLayer = null; //区域统计图层
let projectPointLayer = null; //项目点图层
let temprenlinegeojsonLayer = null; //临时绘制关联项目红线
let tempspotgeojsonLayer = null; //临时绘制扰动图斑
let radius = null; //画圆圈半径大小
let RegionCenterData = [];
let RegionPieData = [];
let ProjectPointsData = null;

let clipSpotLayer = null; //分割图斑临时图层
let clipSpotData = null;
let clipResultLayer = null;
let colorList = ["#00FF66", "#66CCFF", "#6600FF", "#FF9933", "#FF3333"];

const DISTRICT_FILL_COLOR = "rgba(230,0,0,0)";
// const DISTRICT_COLOR = '#bfbfbf';
const DISTRICT_COLOR = "#0070FF";
//绘制geojson图层样式
const geoJsonStyle = {
  color: "#33CCFF", //#33CCFF #e60000
  weight: 3,
  opacity: 1,
  fillColor: "#e6d933", //#33CCFF #e6d933
  fillOpacity: 0.1
};
//项目红线关联扰动图斑高亮样式
const highLightGeoJsonStyle = {
  color: "#0000FF",
  weight: 3,
  opacity: 1,
  fillColor: "#7CFC00",
  fillOpacity: 0.8
};
//临时绘制关联项目红线以及扰动图斑图层样式
const tempRedlineGeoJsonStyle = {
  color: "#e60000", //#33CCFF #0000FF
  weight: 2,
  opacity: 1,
  fillColor: "#e60000",
  fillOpacity: 0.1
};
const tempSpotGeoJsonStyle = {
  color: "#ffd700",
  weight: 2,
  opacity: 1,
  fillColor: "#ffd700",
  fillOpacity: 0.1
};
//绘制geojson行政区划图层样式
const regionGeoJsonStyle = {
  color: "#33CCFF", //#33CCFF #0000FF
  weight: 2,
  opacity: 0.8,
  fillColor: "#33CCFF",
  fillOpacity: 0.1
};
//绘制geojson行政区划图层高亮样式
const regionGeoJsonHLightStyle = {
  color: "#FF0000",
  weight: 3,
  opacity: 1,
  fillColor: "#FF0000",
  fillOpacity: 0
};
//绘制geojson区域统计图层样式
const ZSGeoJsonStyle = {
  color: "#33CCFF",
  weight: 2,
  opacity: 0.6,
  fillColor: "#33CCFF",
  fillOpacity: 0.3
};
//绘制geojson区域统计图层高亮样式
const ZSGeoJsonHLightStyle = {
  color: "#FF0000",
  weight: 2,
  opacity: 0.6,
  fillColor: "#FF0000",
  fillOpacity: 0.3
};
//绘制分割图斑样式符号style
const clipSpotStyle = {
  stroke: true,
  color: "#3388ff",
  opacity: 1,
  weight: 3,
  dashArray: "5,5"
};

@connect(
  ({ user, mapdata, project, spot, projectSupervise, videoMonitor }) => ({
    user,
    mapdata,
    project,
    spot,
    projectSupervise,
    videoMonitor
  })
)
export default class RegionMap extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      showButton: false,
      showHistoryContrast: false,
      showQYJGPanel: true,
      showSiderbar: true,
      showSiderbarDetail: false,
      showProblem: false,
      showQuery: false,
      drawType: "spot",
      drawState: "add",
      chartStatus: false,
      selectLeftV: "",
      selectSpotLeftV: "",
      selectRightV: "",
      selectSpotRightV: "",
      spotStatus: "",
      projectId: null, //针对新建图形的项目红线id
      addGraphLayer: null, //针对新建图形的图层
      showPhotoPreview: false,
      photoPreviewUrl: null,
      imageTimeText: "",
      showImageTimeText: true,
      showHistoryIMG: false, //历史监管影像
      switchDataModal: true, //区域监管、项目监管切换模式
      projectSymbolValue: "项目总数",
      payload: null,
      showProgress_ZS: false,
      showProgress_Pie: false,
      showProgress_ProjectPoint: false,
      showXMJGPanel: false,
      selectIMG: "",
      showVedioPreview: false,
      showVedioPicPreview: false,
      vedioPicPreviewUrl: null,
      vedioPicList: ["./img/loading.png"],
      showClipSpot: false
      //loading: true
    };
    this.saveRef = v => {
      this.refDom = v;
    };
  }

  componentDidMount() {
    /*-------------------------------------区域监管部分-------------------------------------*/
    userconfig = {};
    map = null;
    ImgListLayer = null;
    marker = null;
    picLayerGroup = null;
    problemPointLayer = L.layerGroup([]);
    measurePointLayer = L.layerGroup([]);
    clipSpotLayer = null; //分割图斑临时图层
    clipSpotData = null;
    clipResultLayer = null;
    /*-------------------------------------项目监管部分-------------------------------------*/
    regiongeojsonLayer = null; //行政区划矢量图层
    ZSgeojsonLayer = null; //区域统计图层
    projectPointLayer = null; //项目点图层
    temprenlinegeojsonLayer = null; //临时绘制关联项目红线
    tempspotgeojsonLayer = null; //临时绘制扰动图斑
    radius = null; //画圆圈半径大小
    RegionCenterData = [];
    RegionPieData = [];
    ProjectPointsData = null;
    userconfig.isloadMap = false;

    const me = this;
    const { dispatch } = this.props;
    //判断项目监管列表跳转过来
    const urlFrom = getUrl(`from`);
    const urlIsProject = getUrl(`isProject`);
    //判断项目监管列表跳转过来
    if (urlFrom === `project` && urlIsProject === `true`) {
      this.setState({ isProjectSupervise: true });
      this.setState({
        switchDataModal: false
      });
    }

    dispatch({
      type: "mapdata/GetBoundAsync",
      callback: boundary => {
        userconfig.geojson = JSON.parse(boundary.result);
        // 创建地图
        me.createMap();
      }
    });
    //气泡窗口详情查看
    window.goDetail = obj => {
      emitter.emit("showProjectSpotInfo", { ...obj, edit: false });
    };
    //气泡窗口编辑
    window.goEditGraphic = obj => {
      me.setState({
        drawState: "edit",
        drawType: obj.from === "spot" ? "spot" : "redLine"
      });
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
          "id",
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

    //分割图斑
    window.divideSpot = v => {
      console.log("分割图斑", v);
      const me = this;
      clipSpotData = v;
      me.setState({
        showClipSpot: true
      });
      map.off("click");
      me.clearPlotGraphic();
      map.off("pm:create");
      if (clipResultLayer) clipResultLayer.clearLayers();
      map.closePopup();
      let geojsondata = {
        type: "FeatureCollection",
        features: []
      };
      geojsondata.features.push(clipSpotLayer);
      me.clearGeojsonLayer();
      me.loadGeojsonLayer(geojsondata, geoJsonStyle);
      map.pm.enableDraw("Line", {
        finishOn: "dblclick",
        allowSelfIntersection: false,
        tooltips: false
      });
      map.on("pm:create", e => {
        if (clipResultLayer) clipResultLayer.clearLayers();
        e.layer.setStyle(clipSpotStyle);
        me.setState({ addGraphLayer: e.layer });
        if (clipSpotLayer) {
          var clipLine = L.polyline(e.layer._latlngs);
          try {
            var clippedPolygon = polygonClipByLine(
              clipSpotLayer,
              clipLine.toGeoJSON()
            );
            for (var i = 0; i < clippedPolygon.features.length; i++) {
              var newLayer = L.Proj.geoJson(clippedPolygon.features[i], {
                style: { color: colorList[i] }
              });
              clipResultLayer.addLayer(newLayer);
            }
          } catch (error) {
            message.warning(error.state + ":" + error.message, 2);
          }
        }
      });
    };

    this.eventEmitter = emitter.addListener("deleteDraw", () => {
      this.clearPlotGraphic();
      this.reDrawWMSLayers();
      this.clearProblemPoints();
      this.clearMeasurePoints();
      if (marker) marker.remove();
    });
    this.eventEmitter = emitter.addListener("emptyPoint", () => {
      //清空标注点
      if (marker) marker.remove();
    });

    //清空指定的问题点或者措施点
    this.eventEmitter = emitter.addListener("deleteLocationPoint", v => {
      console.log("deleteLocationPoint", v);
      if (v.key === "problemPoint") {
        //问题点
        this.deleteProblemPoint(v.item.id);
      } else if (v.key === "measurePoint") {
        //措施点
        this.deleteMeasurePoint(v.item.id);
      }
    });

    // 位置定位
    this.eventEmitter = emitter.addListener("siteLocation", data => {
      console.log("位置定位", data);
      userconfig.state = "position";
      userconfig.siteLocationtype = data.type;
      //地图获取定位点
      jQuery(userconfig.geoJsonLayer.getPane())
        .find("path")
        .css({
          cursor: "crosshair"
        });
    });
    // 检查照片定位
    this.eventEmitter = emitter.addListener("pictureLocation", data => {
      console.log("181", data.item);
      const items = data.item;
      let picPoints = [];
      items.forEach(item => {
        if (item.latitude && item.longitude) {
          picPoints.push(item);
        }
      });
      //地图打点
      if (picPoints.length > 0) {
        //清空图层组
        if (picLayerGroup) picLayerGroup.clearLayers();
        picPoints.forEach(item => {
          let latLng = [item.latitude, item.longitude];
          let marker = L.marker(latLng)
            .addTo(map)
            .on("click", function(e) {
              console.log("item.id", item.id);
              me.setState({
                showPhotoPreview: true,
                photoPreviewUrl: config.url.annexPreviewUrl + item.id
              });
            });
          picLayerGroup.addLayer(marker);
        });
        //地图范围跳转
        if (picLayerGroup.getLayers().length > 0)
          map.fitBounds(picLayerGroup.getBounds(), {
            maxZoom: config.mapInitParams.zoom
          });
      } else {
        message.warning("附件照片无可用位置信息", 1);
      }
    });
    // 全景定位
    this.eventEmitter = emitter.addListener("fullViewLocation", v => {
      console.log("fullViewLocation", v);
      //全景定位
      if (v.pointX && v.pointY) {
        if (marker) marker.remove();

        let latLng = [v.pointY, v.pointX];
        if (map.getZoom() >= config.mapInitParams.zoom) {
          if (latLng) me.automaticToMap(latLng);
        } else {
          map.setZoom(config.mapInitParams.zoom);
          setTimeout(() => {
            if (latLng) me.automaticToMap(latLng);
          }, 500);
        }

        let fullviewURL = config.url.panoramaPreviewUrl + v.urlConfig;
        const myIcon = L.icon({
          iconUrl: "./img/camer.png",
          iconSize: [24, 24]
        });
        marker = L.marker([v.pointY, v.pointX], { icon: myIcon })
          .addTo(map)
          .on("click", function(e) {
            //console.log("marker", e);
            emitter.emit("showPanorama", {
              show: true,
              fullviewURL: fullviewURL
            });
          });
      }
    });
    // this.eventEmitter = emitter.addListener("mapLocation", data => {});
    //照片定位
    this.eventEmitter = emitter.addListener("imgLocation", data => {
      if (data.show) {
        if (data.Latitude && data.Longitude) {
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
          if (map.getZoom() >= config.mapInitParams.zoom) {
            if (latLng) me.automaticToMap(latLng);
          } else {
            map.setZoom(config.mapInitParams.zoom);
            setTimeout(() => {
              if (latLng) me.automaticToMap(latLng);
            }, 500);
          }
        } else {
          notification["warning"]({
            message: "该附件照片无位置信息，无法在地图定位"
          });
        }
      } else {
        if (marker) marker.remove();
      }
    });
    //屏幕截图
    this.eventEmitter = emitter.addListener("screenshot", data => {
      me.setState({ drawType: "screenshot", drawState: "add" });
      //移除地图监听事件
      map.off("click");
      //显示屏幕截图绘制保存取消菜单按钮
      me.setState({ showButton: true });
      //绘制图形之前
      if (userconfig.screenLayer) {
        map.pm.disableDraw("Rectangle");
        map.off("pm:create");
        map.removeLayer(userconfig.screenLayer);
        userconfig.screenLayer = null;
      }
      //绘制矩形
      map.pm.enableDraw("Rectangle", {
        finishOn: "dblclick",
        allowSelfIntersection: false,
        tooltips: false
      });
      map.on("pm:create", e => {
        //监听地图点击事件
        map.on("click", me.onClickMap);
        //截图进度条显示
        const hide = message.loading("屏幕截图操作进行中...", 0);

        userconfig.screenLayer = e.layer;
        let northEast = userconfig.screenLayer.getBounds()._northEast;
        let southWest = userconfig.screenLayer.getBounds()._southWest;
        //框选矩形的中心点
        let centerPoint = L.latLng(
          (northEast.lat + southWest.lat) / 2.0,
          (northEast.lng + southWest.lng) / 2.0
        );
        //地理坐标转换屏幕坐标
        let northEastPoint = map.latLngToContainerPoint(northEast);
        let southWestPoint = map.latLngToContainerPoint(southWest);
        //计算框选矩形的宽度以及高度像素
        let width = Math.abs(northEastPoint.x - southWestPoint.x);
        let height = Math.abs(northEastPoint.y - southWestPoint.y);
        //计算框选矩形的左上角屏幕坐标
        let minx =
          northEastPoint.x <= southWestPoint.x
            ? northEastPoint.x
            : southWestPoint.x;
        let miny =
          northEastPoint.y <= southWestPoint.y
            ? northEastPoint.y
            : southWestPoint.y;
        //获取当前地图元素dom节点node,用于屏幕截图
        let node = document.getElementById("map");
        /*domtoimage.toPng(node, {
          width: width,
          height: height
        })*/
        domtoimage
          .toPng(node)
          .then(function(dataUrl) {
            if (dataUrl.length <= 6) {
              //关闭屏幕截图操作
              setTimeout(hide, 10);
              message.warning(
                "屏幕截图结果为空,建议放大地图,重新截图操作试试看",
                2
              );
              return;
            }
            //过渡img图片,为了截取img指定位置的截图需要
            let img = new Image();
            img.src = dataUrl;
            //document.body.appendChild(img);
            img.onload = function() {
              //要先确保图片完整获取到，这是个异步事件
              let canvas = document.createElement("canvas"); //创建canvas元素
              canvas.width = width;
              canvas.height = height;
              canvas
                .getContext("2d")
                .drawImage(img, minx, miny, width, height, 0, 0, width, height); //将图片绘制到canvas中
              dataUrl = canvas.toDataURL(); //转换图片为dataURL
              //保存截图以及中心点经纬度
              userconfig.dataImgUrl = dataUrl;
              userconfig.imglng = centerPoint.lng;
              userconfig.imglat = centerPoint.lat;
              //关闭屏幕截图操作
              setTimeout(hide, 10);
              message.success("屏幕截图成功", 2);
            };
          })
          .catch(function(error) {
            console.error("oops, something went wrong!", error);
          });
      });
    });
    //绘制图形-新建
    this.eventEmitter = emitter.addListener("drawGraphics", data => {
      if (data.draw) {
        me.setState({
          drawState: data.state,
          drawType: data.type,
          projectId: data.projectId,
          projectName: data.projectName,
          fromList: data.fromList
        });
        const { addGraphLayer } = me.state;
        //移除地图监听事件
        map.off("click");
        me.clearPlotGraphic();
        if (addGraphLayer) {
          map.removeLayer(addGraphLayer);
          me.setState({ addGraphLayer: null });
        }
        //绘制图形之前
        map.off("pm:create");
        map.on("pm:drawstart", ({ workingLayer }) => {
          workingLayer.on("pm:vertexadded", e => {
            let turfpoint = turf.point([e.latlng.lng, e.latlng.lat]);
            //if (!turf.booleanContains(userconfig.polygon, turfpoint)) {
            if (!turf.booleanPointInPolygon(turfpoint, userconfig.polygon)) {
              map.pm.disableDraw("Polygon");
              emitter.emit("showSiderbarDetail", {
                show: false,
                from: me.state.drawType,
                type: me.state.drawState,
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
        //显示编辑菜单按钮
        me.setState({ showButton: true });
        //编辑图形
        map.on("pm:create", e => {
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
    //图斑关联
    this.eventEmitter = emitter.addListener("spotRelate", data => {
      this.setState({
        spotStatus: data.status, //start：开始，end：结束
        spotRelateProjectId: data.projectId
      });
    });
  }

  /*
   * 取消分割图斑
   */
  cancelClipGraphic = () => {
    this.setState({ showClipSpot: false });
    map.on("click", this.onClickMap);
    const { addGraphLayer } = this.state;
    if (addGraphLayer) {
      addGraphLayer.pm.disable();
      map.removeLayer(addGraphLayer);
      this.setState({ addGraphLayer: null });
    }
    map.pm.disableDraw("Line");
    if (clipResultLayer) clipResultLayer.clearLayers();
    this.clearGeojsonLayer();
    clipSpotLayer = null;
  };

  /*
   * 保存分割图形
   */
  saveClipGraphic = () => {
    const me = this;
    map.on("click", me.onClickMap);
    const { addGraphLayer } = me.state;
    if (addGraphLayer) {
      me.setState({ showDrawSpot: false });
      addGraphLayer.pm.disable();
      map.removeLayer(addGraphLayer);
      me.setState({ addGraphLayer: null });
      // me.clearGeojsonLayer();
      // clipSpotLayer = null;
      let list = [];
      let listGeojson = [];
      clipResultLayer.eachLayer(function(layer) {
        if (layer) {
          let geojson = layer.toGeoJSON();
          geojson = geojson.features[0];
          listGeojson.push(geojson);
          let geom = me.geojson2Multipolygon(geojson, 1);
          console.log("geom", geom);
          list.push(geom);
        }
      });
      console.log("分割图斑完成", list, clipSpotData);
      //判断分割多边形是否自相交
      //let poly1 = turf.polygon(listGeojson[0].geometry.coordinates);
      //let poly2 = turf.polygon(listGeojson[1].geometry.coordinates);
      //let kinks1 = turf.kinks(poly1);
      //let kinks2 = turf.kinks(poly2);
      // //flag flag = turf.booleanOverlap(poly1, poly2);
      // let flag = turf.booleanCrosses(turf.polygonToLine(poly1), turf.polygonToLine(poly2));
      // if(flag){
      //   message.warning("拓扑错误:分割图形自相交", 2);
      //   return;  
      // }

      const data = {
        id: clipSpotData.id,
        polygon1: list[0],
        polygon2: list[1]
      };
      this.spotDivide(data);
    } else {
      message.warning("请绘制分割图形", 2);
    }
  };

  // 项目监管请求参数
  queryProjectFilter = payload => {
    // console.log("queryProjectFilter", payload);
    this.setState({
      payload: payload
    });
    const { switchDataModal } = this.state;
    // console.log("switchDataModal", switchDataModal);
    if (!switchDataModal) {
      const { projectSymbolValue } = this.state;
      if (map) {
        const zoom = map.getZoom();
        if (zoom >= config.pointLevel) {
          // 切换项目点符号类型
          this.requestProjectPoints(this.callbackDrawMapProjectPoints);
        } else {
          // 切换区域统计类型
          if (projectSymbolValue === "项目总数") {
            this.requestZStatistics(this.callbackDrawMapZStatistics); //区域总数统计
          } else {
            this.requestPieZStatistics(this.callbackDrawMapPieZStatistics); //区域饼状图统计
          }
        }
      }
    }
  };

  // 区域监管以及项目监管之间切换监听事件
  switchData = v => {
    console.log(
      `switchData`,
      v,
      `${v.state ? `项目` : `区域`}监管切换到${v.state ? `区域` : `项目`}监管`
    );
    this.setState({
      switchDataModal: v.state
    });
    // 清空地图状态
    this.clearGeojsonLayer();
    if (map) {
      map.closePopup();
    }
    // 切换模式
    if (v.state) {
      //区域监管
      this.switchQYJG();
    } else {
      //项目监管
      this.switchXMJG();
    }
  };

  // 地图定位
  mapLocation = data => {
    const { dispatch } = this.props;
    const me = this;
    console.log(data);
    userconfig.poupLatLng = null;
    if (data.key === "project") {
      //项目
      dispatch({
        type: "mapdata/queryProjectPosition",
        payload: {
          id: data.item.id
        },
        callback: response => {
          if (response.success) {
            if (response.result.pointX === 0 || response.result.pointY === 0) {
              message.warning("项目无可用位置信息", 1);
              return;
            }
            let point = {
              x: response.result.pointX,
              y: response.result.pointY
            };
            let latLng = [point.y, point.x];
            userconfig.poupLatLng = latLng;
            if (marker) marker.remove();
            switch (response.result.type) {
              case "ProjectScope": //项目红线
                me.queryWFSServiceByProperty(
                  response.result.id,
                  "id",
                  config.mapProjectLayerName,
                  me.callbackLocationQueryWFSService
                );
                break;
              case "Spot": //扰动图斑
                me.queryWFSServiceByProperty(
                  response.result.id,
                  "id",
                  config.mapSpotLayerName,
                  me.callbackLocationQueryWFSService
                );
                break;
              case "ProjectPoint": //项目点
                let turfpoint = turf.point([latLng[1], latLng[0]]);
                if (
                  !turf.booleanPointInPolygon(turfpoint, userconfig.polygon)
                ) {
                  message.warning("项目点位置超出区域范围之外", 1);
                  return;
                }
                marker = L.marker(latLng).addTo(map);
                if (map.getZoom() >= config.mapInitParams.zoom) {
                  if (latLng) me.automaticToMap(latLng);
                } else {
                  map.setZoom(config.mapInitParams.zoom);
                  setTimeout(() => {
                    if (latLng) me.automaticToMap(latLng);
                  }, 500);
                }

                const { switchDataModal } = this.state;
                if (!switchDataModal) {
                  //项目监管状态下
                  let id = response.result.id;
                  //查询关联项目红线
                  me.queryRegionByProperty(
                    id,
                    "project_id",
                    config.mapProjectLayerName,
                    me.callbackRelateRedLineQueryWFSService
                  );
                  //查询关联扰动图斑
                  me.queryRegionByProperty(
                    id,
                    "project_id",
                    config.mapSpotLayerName,
                    me.callbackRelateSpotQueryWFSService
                  );
                }
                break;
              default:
            }
          } else {
            message.warning("项目无可用位置信息", 1);
          }
        }
      });
    } else if (data.key === "spot") {
      if (data.item.mapNum === "") {
        message.warning("地图定位不到相关数据", 1);
        return;
      }

      if (data.item.isArchive) {
        //历史扰动图斑
        this.queryWFSServiceByProperty(
          data.item.id,
          "id",
          config.mapSpotLayerName,
          this.callbackLocationNoPopup
        );
      } else {
        //现状扰动图斑
        this.queryWFSServiceByProperty(
          data.item.id,
          "id",
          config.mapSpotLayerName,
          this.callbackLocationQueryWFSService
        );
      }
    } else if (data.key === "point") {
      let latLng = [data.item.pointY, data.item.pointX];
      let turfpoint = turf.point([latLng[1], latLng[0]]);
      if (!turf.booleanPointInPolygon(turfpoint, userconfig.polygon)) {
        message.warning("当前标注点不是区域范围之内的点", 2);
        return;
      }
      //标注点定位
      if (marker) marker.remove();
      marker = L.marker(latLng).addTo(map);

      if (map.getZoom() >= config.mapInitParams.zoom) {
        if (latLng) me.automaticToMap(latLng);
      } else {
        map.setZoom(config.mapInitParams.zoom);
        setTimeout(() => {
          if (latLng) me.automaticToMap(latLng);
        }, 500);
      }
    } else if (data.key === "redLine") {
      //防治责任范围定位
      me.queryWFSServiceByProperty(
        data.item.id,
        "id",
        config.mapProjectLayerName,
        me.callbackLocationQueryWFSService
      );
    } else if (data.key === "problemPoint") {
      //问题点定位
      me.locateProblemPoint(data.item, data.id);
    } else if (data.key === "measurePoint") {
      //措施点定位
      me.locateMeasurePoint(data.item, data.id);
    }
  };

  // 切换到区域监管
  switchQYJG = () => {
    const { showQYJGPanel } = this.state;
    const { showXMJGPanel } = this.state;
    /*-------------------------------------区域监管部分-------------------------------------*/
    //显示区域监管的图表联动、地图分屏、地图历史对比、图斑面板
    this.setState({
      showQYJGPanel: !showQYJGPanel
    });
    //添加项目红线、扰动图斑图层到图层管理控件
    if (userconfig.layersControl) {
      userconfig.layersControl.addOverlay(
        userconfig.projectWmsLayer,
        "项目红线"
      );
      userconfig.layersControl.addOverlay(userconfig.spotWmsLayer, "扰动图斑");
      userconfig.layersControl.addOverlay(
        userconfig.siteSpotWmsLayer,
        "现场图斑"
      );
    }
    //显示项目红线、扰动图斑图层
    if (userconfig.projectWmsLayer) {
      userconfig.projectWmsLayer.setOpacity(1);
    }
    if (userconfig.spotWmsLayer) {
      userconfig.spotWmsLayer.setOpacity(1);
    }
    if (userconfig.siteSpotWmsLayer) {
      userconfig.siteSpotWmsLayer.setOpacity(1);
    }
    if (userconfig.geoJsonLayer) {
      userconfig.geoJsonLayer.setStyle({ opacity: 1, fillOpacity: 0 });
    }
    /*-------------------------------------项目监管部分-------------------------------------*/
    //显示图斑面板
    this.setState({
      showXMJGPanel: !showXMJGPanel
    });
    if (userconfig.layersControl) {
      userconfig.layersControl.removeLayer(projectPointLayer); //项目点图层
    }
    //行政区划图层
    if (regiongeojsonLayer) {
      regiongeojsonLayer.setStyle({ opacity: 0, fillOpacity: 0 });
    }
    //区域统计图层
    if (ZSgeojsonLayer) {
      this.clearXMJGGeojsonLayer(ZSgeojsonLayer);
    }
    //项目点图层
    if (projectPointLayer) {
      this.clearXMJGGeojsonLayer(projectPointLayer);
    }
    //临时绘制关联项目红线
    if (temprenlinegeojsonLayer) {
      this.clearXMJGGeojsonLayer(temprenlinegeojsonLayer);
    }
    //临时绘制扰动图斑
    if (tempspotgeojsonLayer) {
      this.clearXMJGGeojsonLayer(tempspotgeojsonLayer);
    }
  };

  // 切换到项目监管
  switchXMJG = () => {
    const me = this;
    const { showQYJGPanel } = this.state;
    const { showXMJGPanel } = this.state;
    /*-------------------------------------区域监管部分-------------------------------------*/
    //隐藏区域监管的图表联动、地图分屏、地图历史对比、图斑面板
    this.setState({
      showQYJGPanel: !showQYJGPanel
    });
    //移除项目红线、扰动图斑图层到图层管理控件
    if (userconfig.layersControl) {
      userconfig.layersControl.removeLayer(userconfig.projectWmsLayer);
      userconfig.layersControl.removeLayer(userconfig.spotWmsLayer);
      userconfig.layersControl.removeLayer(userconfig.siteSpotWmsLayer);
    }
    //隐藏项目红线、扰动图斑图层
    if (userconfig.projectWmsLayer) {
      userconfig.projectWmsLayer.setOpacity(0);
    }
    if (userconfig.spotWmsLayer) {
      userconfig.spotWmsLayer.setOpacity(0);
    }
    if (userconfig.siteSpotWmsLayer) {
      userconfig.siteSpotWmsLayer.setOpacity(0);
    }
    if (userconfig.geoJsonLayer) {
      userconfig.geoJsonLayer.setStyle({ opacity: 0, fillOpacity: 0 });
    }
    /*-------------------------------------项目监管部分-------------------------------------*/
    //显示图斑面板
    this.setState({
      showXMJGPanel: !showXMJGPanel
    });
    if (userconfig.layersControl) {
      userconfig.layersControl.addOverlay(projectPointLayer, "项目点"); //项目点图层
    }
    //行政区划图层
    if (regiongeojsonLayer) {
      let regionLayers = regiongeojsonLayer.getLayers();
      if (regionLayers.length > 0) {
        regiongeojsonLayer.setStyle({ opacity: 0.8, fillOpacity: 0.1 });
        const bounds = regiongeojsonLayer.getBounds();
        map.fitBounds(bounds);
      } else {
        // 创建行政区划渲染
        me.createRegion();
      }
    }
    //创建区域统计渲染
    const { projectSymbolValue } = this.state;
    console.log("projectSymbolValue896", projectSymbolValue);
    if (projectSymbolValue === "项目总数") {
      me.createZStatistics(); //区域总数统计
      //预先请求区域饼状图数据
      if (RegionPieData.length <= 0) {
        this.requestPieZStatistics(this.callbackPieZStatistics);
      }
    } else {
      me.createZSPie(projectSymbolValue); //区域饼状图统计
      //预先请求区域总数数据
      if (RegionCenterData.length <= 0) {
        this.requestZStatistics(this.callbackZStatistics);
      }
    }
    //项目点图层
    //添加所有项目点要素
    me.addAllProjectPoints(me.callbackProjectPoints, projectSymbolValue);
  };

  setOpacityFeatureGroup = (opacity, featureGroup) => {
    featureGroup.eachLayer(function(layer) {
      layer.setOpacity(opacity);
    });
  };

  //添加所有项目点要素
  addAllProjectPoints = (callback, projectSymbolValue) => {
    if (ProjectPointsData) {
      const zoom = map.getZoom();
      if (zoom >= config.pointLevel) {
        //切换项目点符号类型
        this.addProjectPointClusterLayers(
          ProjectPointsData,
          projectSymbolValue
        );
      }
    } else {
      this.requestProjectPoints(callback);
    }
  };

  //项目点图层点击事件监听
  onClickProjectPointLayer = e => {
    const { switchDataModal } = this.state;
    if (!switchDataModal) {
      //项目监管
      console.log("e.layer.options.properties", e.layer.options.properties);
      //查询关联项目红线
      this.queryRegionByProperty(
        e.layer.options.properties.id,
        "project_id",
        config.mapProjectLayerName,
        this.callbackRelateRedLineQueryWFSService
      );
      //查询关联扰动图斑
      this.queryRegionByProperty(
        e.layer.options.properties.id,
        "project_id",
        config.mapSpotLayerName,
        this.callbackRelateSpotQueryWFSService
      );
    }
  };

  /*
   * 项目红线查询回调函数
   */
  callbackRelateRedLineQueryWFSService = data => {
    //console.log('data',data);
    if (data && data.features.length > 0) {
      this.loadRenlineGeojsonLayer(data);
    }
  };

  /*
   * 扰动图斑查询回调函数
   */
  callbackRelateSpotQueryWFSService = data => {
    //console.log('data',data);
    if (data && data.features.length > 0) {
      this.loadSpotGeojsonLayer(data);
    }
  };

  /*
   * 绘制关联扰动图斑图形函数
   */
  loadSpotGeojsonLayer = geojson => {
    this.clearXMJGGeojsonLayer(tempspotgeojsonLayer);
    tempspotgeojsonLayer.addData(geojson);
  };

  /*
   * 绘制关联项目红线图形函数
   */
  loadRenlineGeojsonLayer = geojson => {
    this.clearXMJGGeojsonLayer(temprenlinegeojsonLayer);
    temprenlinegeojsonLayer.addData(geojson);
  };

  addProjectPointClusterLayers = (ProjectPointsData, projectSymbolValue) => {
    //console.log('projectSymbolValue998', projectSymbolValue);
    if (ProjectPointsData && ProjectPointsData.items.length > 0) {
      this.clearXMJGGeojsonLayer(projectPointLayer);
      let markerList = [];
      let iconUrl =
        projectSymbolValue === "项目总数"
          ? "./img/projectPoint_XMZS.png"
          : projectSymbolValue === "立项级别"
          ? "./img/projectPoint_LXJB.png"
          : projectSymbolValue === "合规性"
          ? "./img/projectPoint_HGX.png"
          : projectSymbolValue === "项目类别"
          ? "./img/projectPoint_XMLB.png"
          : projectSymbolValue === "项目性质"
          ? "./img/projectPoint_XMXZ.png"
          : projectSymbolValue === "建设状态"
          ? "./img/projectPoint_JSZT.png"
          : "./img/projectPoint_XMZS.png";
      const myIcon = L.icon({
        iconUrl: iconUrl,
        iconSize: [24, 24]
      });
      for (let i = 0; i < ProjectPointsData.items.length; i++) {
        let pointJson = this.WKT2GeoJSON(ProjectPointsData.items[i].point);
        //console.log('pointJson',pointJson);
        if (pointJson[0] !== 0 && pointJson[1] !== 0) {
          let marker = L.marker(new L.LatLng(pointJson[1], pointJson[0]), {
            properties: {
              id: ProjectPointsData.items[i].id,
              complianceId: ProjectPointsData.items[i].complianceId,
              projectCateId: ProjectPointsData.items[i].projectCateId,
              projectLevelId: ProjectPointsData.items[i].projectLevelId,
              projectName: ProjectPointsData.items[i].projectName,
              projectNatId: ProjectPointsData.items[i].projectNatId,
              projectStatusId: ProjectPointsData.items[i].projectStatusId,
              projectTypeId: ProjectPointsData.items[i].projectTypeId,
              vecTypeId: ProjectPointsData.items[i].vecTypeId
            },
            icon: myIcon
          });
          markerList.push(marker);
        }
      }
      projectPointLayer.addLayers(markerList);
    }
  };

  WKT2GeoJSON = wkt => {
    let data = wkt.split(" ");
    let left = data[0];
    let right = data[1];
    let x = left.substring(6, left.length);
    let y = right.substring(0, right.length - 1);
    let pointJson = [Number(x), Number(y)];
    return pointJson;
  };

  callbackDrawMapProjectPoints = data => {
    console.log("callbackDrawMapProjectPoints", data);
    this.setState({ showProgress_ProjectPoint: false });
    ProjectPointsData = data;
    const { projectSymbolValue } = this.state;
    this.addProjectPointClusterLayers(data, projectSymbolValue);
  };

  callbackProjectPoints = data => {
    console.log("callbackProjectPoints", data);
    this.setState({ showProgress_ProjectPoint: false });
    ProjectPointsData = data;
  };

  requestProjectPoints = callback => {
    const {
      projectSupervise: { projectSuperviseList }
    } = this.props;
    //projectSuperviseList.totalCount
    const { payload } = this.state;
    const params = {
      ...payload,
      MaxResultCount:
        projectSuperviseList && projectSuperviseList.totalCount
          ? projectSuperviseList.totalCount
          : 1000
      // MaxResultCount: 1000
      // SkipCount: null
    };
    this.setState({ showProgress_ProjectPoint: true });
    this.props.dispatch({
      type: "mapdata/getAllPoint",
      payload: params,
      callback: callback
    });
  };

  /*
   * 项目符号化类型切换函数
   */
  onChangeProjectSymbol = e => {
    console.log("radio checked", e.target.value);
    this.setState({
      projectSymbolValue: e.target.value
    });
    const zoom = map.getZoom();
    if (zoom >= config.pointLevel) {
      //切换项目点符号类型
      this.addAllProjectPoints(
        this.callbackDrawMapProjectPoints,
        e.target.value
      );
    } else {
      //切换区域统计类型
      if (e.target.value === "项目总数") {
        this.createZStatistics();
      } else {
        this.createZSPie(e.target.value);
      }
    }
  };

  // 创建饼状图区域统计渲染
  createZSPie = projectSymbolValue => {
    if (RegionPieData.length > 0) {
      this.drawMapPieZStatistics(RegionPieData, projectSymbolValue);
    } else {
      this.requestPieZStatistics(this.callbackDrawMapPieZStatistics);
    }
  };

  drawMapPieZStatistics = (RegionPieData, projectSymbolValue) => {
    if (RegionPieData.length > 0) {
      this.clearXMJGGeojsonLayer(ZSgeojsonLayer);
      RegionPieData.forEach((item, index) => {
        let result = item.result;
        for (let i = 0; i < result.length; i++) {
          if (
            result[i].type === projectSymbolValue &&
            result[i].data.length > 0
          ) {
            //符合饼状图类型过滤条件
            const myIcon = L.divIcon({
              html: `<div id="cMark${index}" style="width:40px;height:40px;position:relative;background-color:transparent;"></div>`,
              className: "leaflet-echart-icon",
              iconSize: [40, 40]
            });
            ZSgeojsonLayer.addLayer(
              L.marker([item.pointY, item.pointX], { icon: myIcon })
            );
            let ChartMarker = echarts.init(
              document.getElementById(`cMark${index}`)
            );
            let option = {
              tooltip: {
                trigger: "item",
                formatter: "{a} <br/>{b}: {c} ({d}%)"
              },
              series: [
                {
                  name: `${result[i].type}`,
                  type: "pie",
                  hoverAnimation: false, //是否开启hover在扇区上的放大动画效果
                  radius: "100%",
                  center: ["50%", "50%"],
                  label: {
                    //饼图图形上的文本标签
                    normal: {
                      show: true,
                      position: "inner", //标签的位置
                      textStyle: {
                        // fontWeight : 300 ,
                        fontSize: 10 //文字的字体大小
                      },
                      //formatter:'{d}%'
                      formatter: "{c}"
                    }
                  },
                  //{value:50,name:'高速50KM',itemStyle:{normal:{color:'#FE0000'}}},
                  data: result[i].data,
                  itemStyle: {
                    emphasis: {
                      shadowBlur: 10,
                      shadowOffsetX: 0,
                      shadowColor: "rgba(0, 0, 0, 0.5)"
                    }
                  }
                }
              ]
            };
            ChartMarker.setOption(option);
          }
        }
      });
    }
  };

  callbackDrawMapPieZStatistics = data => {
    console.log("callbackDrawMapPieZStatistics", data);
    this.setState({ showProgress_Pie: false });
    RegionPieData = data;
    const { projectSymbolValue } = this.state;
    this.drawMapPieZStatistics(data, projectSymbolValue);
  };

  callbackPieZStatistics = data => {
    console.log("callbackDrawMapPieZStatistics", data);
    this.setState({ showProgress_Pie: false });
    RegionPieData = data;
  };

  requestPieZStatistics = callback => {
    const { payload } = this.state;
    const params = {
      ...payload
      // MaxResultCount: null,
      // SkipCount: null
    };
    this.setState({ showProgress_Pie: true });
    this.props.dispatch({
      type: "mapdata/statisticsByDistrictCode",
      payload: params,
      callback: callback
    });
  };

  // 创建区域统计渲染
  createZStatistics = () => {
    if (!radius) {
      setTimeout(() => {
        if (map && map.getZoom()) {
          const zoom = map.getZoom();
          if (zoom <= 7) {
            //省级行政区划
            radius = 17000;
          } else if (zoom > 7 && zoom <= 9) {
            //市级行政区划
            radius = 7000;
          } else {
            //区县级行政区划
            radius = 2000;
          }
          if (RegionCenterData.length > 0) {
            this.drawMapZStatistics(RegionCenterData);
          } else {
            this.requestZStatistics(this.callbackDrawMapZStatistics);
          }
        }
      }, 2000);
    } else {
      if (RegionCenterData.length > 0) {
        this.drawMapZStatistics(RegionCenterData);
      } else {
        this.requestZStatistics(this.callbackDrawMapZStatistics);
      }
    }
  };

  drawMapZStatistics = RegionCenterData => {
    if (RegionCenterData.length > 0) {
      this.clearXMJGGeojsonLayer(ZSgeojsonLayer);
      RegionCenterData.forEach(item => {
        if (item.totalCount > 0) {
          const myIcon = L.divIcon({
            html: item.totalCount,
            className: "my-div-icon",
            iconSize: 16
          });
          ZSgeojsonLayer.addLayer(
            L.circle(
              [item.pointY, item.pointX],
              radius,
              Object.assign(ZSGeoJsonStyle, { name: item.name })
            )
          );
          ZSgeojsonLayer.addLayer(
            L.marker([item.pointY, item.pointX], { icon: myIcon })
          );
        }
      });
    }
  };

  requestZStatistics = callback => {
    const { payload } = this.state;
    const params = {
      ...payload
      // MaxResultCount: null,
      // SkipCount: null
    };
    this.setState({ showProgress_ZS: true });
    this.props.dispatch({
      type: "mapdata/totalByDistrictCode",
      payload: params,
      callback: callback
    });
  };

  callbackDrawMapZStatistics = data => {
    console.log("callbackDrawMapZStatistics", data);
    this.setState({ showProgress_ZS: false });
    RegionCenterData = data;
    this.drawMapZStatistics(data);
  };

  callbackZStatistics = data => {
    console.log("callbackZStatistics", data);
    this.setState({ showProgress_ZS: false });
    RegionCenterData = data;
  };

  // 创建行政区划渲染
  createRegion = () => {
    this.getNextRegions();
  };

  onClickRegiongeojsonLayer = e => {
    //console.log('onClickRegiongeojsonLayer',e);
    const { switchDataModal } = this.state;
    if (!switchDataModal) {
      //项目监管
      const zoom = map.getZoom();
      if (zoom < config.pointLevel) {
        let regionPolygon = this.getRegionPolygonbyPoint(e.latlng);
        console.log("regionPolygon", regionPolygon);
        userconfig.pointsInPolygon_XMJG = this.getPointsbyRegionPolygon(
          regionPolygon,
          ProjectPointsData
        );
        console.log(
          "userconfig.pointsInPolygon_XMJG",
          userconfig.pointsInPolygon_XMJG
        );
        if (userconfig.pointsInPolygon_XMJG.length > 0) {
          // map.flyTo(e.latlng, config.pointLevel);
          map.fitBounds(userconfig.pointsInPolygon_XMJG);
        } else {
          message.warning("点击该区域范围内没有项目点", 1);
        }
      }
    }
  };

  onMoveoverRegiongeojsonLayer = e => {
    const { switchDataModal } = this.state;
    if (!switchDataModal) {
      //项目监管
      //console.log('onMoveoverRegiongeojsonLayer',e);
      e.layer.setStyle(regionGeoJsonHLightStyle);
      e.layer.bringToFront();
      //高亮区域统计圆圈图层样式
      this.HLZSLayerbyName(e.layer.feature.properties.name);
    }
  };

  onMoveoutRegiongeojsonLayer = e => {
    const { switchDataModal } = this.state;
    if (!switchDataModal) {
      //项目监管
      //console.log('onMoveoutRegiongeojsonLayer',e);
      e.layer.setStyle(regionGeoJsonStyle);
      //设置区域统计圆圈图层默认样式
      this.resetZSLayerbyName(e.layer.feature.properties.name);
    }
  };

  //区域统计图层点击事件监听
  onClickZSgeojsonLayer = e => {
    //console.log('onClickZSgeojsonLayer',e);
    const { switchDataModal } = this.state;
    if (!switchDataModal) {
      //项目监管
      const zoom = map.getZoom();
      if (zoom < config.pointLevel) {
        let regionPolygon = this.getRegionPolygonbyPoint(e.latlng);
        console.log("regionPolygon", regionPolygon);
        userconfig.pointsInPolygon_XMJG = this.getPointsbyRegionPolygon(
          regionPolygon,
          ProjectPointsData
        );
        console.log(
          "userconfig.pointsInPolygon_XMJG",
          userconfig.pointsInPolygon_XMJG
        );
        if (userconfig.pointsInPolygon_XMJG.length > 0) {
          //map.flyTo(e.latlng, config.pointLevel);
          map.fitBounds(userconfig.pointsInPolygon_XMJG);
        } else {
          message.warning("点击该区域范围内没有项目点", 1);
        }
      }
    }
  };

  // 获取行政区域面内的项目点
  getPointsbyRegionPolygon = (regionPolygon, ProjectPointsData) => {
    let pointsInPolygon_XMJG = [];
    if (ProjectPointsData && ProjectPointsData.items.length > 0) {
      for (let i = 0; i < ProjectPointsData.items.length; i++) {
        let data = ProjectPointsData.items[i];
        let pointJson = this.WKT2GeoJSON(data.point);
        if (pointJson[0] !== 0 && pointJson[1] !== 0) {
          let turfpoint = turf.point(pointJson);
          if (turf.booleanPointInPolygon(turfpoint, regionPolygon)) {
            // pointsInPolygon_XMJG.push(pointJson);
            pointsInPolygon_XMJG.push([pointJson[1], pointJson[0]]);
          }
        }
      }
    }
    return pointsInPolygon_XMJG;
  };

  // 根据点匹配对应的行政区域面
  getRegionPolygonbyPoint = latlng => {
    let regionPolygon = null;
    if (regiongeojsonLayer) {
      let polygon = null;
      let turfpoint = null;
      regiongeojsonLayer.eachLayer(function(layer) {
        //构造面
        polygon = turf.multiPolygon(layer.feature.geometry.coordinates);
        turfpoint = turf.point([latlng.lng, latlng.lat]);
        if (turf.booleanPointInPolygon(turfpoint, polygon)) {
          regionPolygon = polygon;
        }
      });
    }
    return regionPolygon;
  };

  // 根据行政区划名称匹配对应的区域统计圆圈图层
  HLZSLayerbyName = name => {
    let layers = ZSgeojsonLayer.getLayers();
    if (layers.length > 0) {
      for (let i = 0; i < layers.length; i++) {
        if (layers[i].options.name && layers[i].options.name === name) {
          layers[i].setStyle(
            Object.assign(ZSGeoJsonHLightStyle, { name: name })
          );
          break;
        }
      }
    }
  };

  resetZSLayerbyName = name => {
    let layers = ZSgeojsonLayer.getLayers();
    if (layers.length > 0) {
      for (let i = 0; i < layers.length; i++) {
        if (layers[i].options.name && layers[i].options.name === name) {
          layers[i].setStyle(Object.assign(ZSGeoJsonStyle, { name: name }));
          break;
        }
      }
    }
  };

  /*
   * 绘制行政区划图形函数
   */
  loadRegionGeojsonLayer = geojson => {
    regiongeojsonLayer.addData(geojson);
  };

  /*
   * 清空绘制图形函数
   */
  clearXMJGGeojsonLayer = geojsonLayer => {
    if (geojsonLayer) {
      geojsonLayer.clearLayers();
    }
  };

  //获取当前账号行政区下一级行政区数据
  getNextRegions = () => {
    const user = localStorage.getItem("user");
    if (user) {
      const curuser = JSON.parse(user);
      const parentid = curuser.departmentDistrictCodeId;
      //  console.log('curuser',curuser);
      this.queryRegionByProperty(
        parentid,
        "parent_id",
        config.districtBound.mapDistrictLayerName,
        this.callbackRegionQueryWFSService
      );
    } else {
      message.warning("区域范围之外的数据没有权限操作", 1);
    }
  };

  /*
   * 行政区划查询回调函数
   */
  callbackRegionQueryWFSService = data => {
    // console.log('data',data);
    if (data && data.features.length > 0) {
      this.loadRegionGeojsonLayer(data);
      const bounds = regiongeojsonLayer.getBounds();
      map.fitBounds(bounds);
    } else {
      const user = localStorage.getItem("user");
      if (user) {
        const curuser = JSON.parse(user);
        const id = curuser.departmentDistrictCodeId;
        this.queryRegionByProperty(
          id,
          "id",
          config.districtBound.mapDistrictLayerName,
          this.callbackLastRegionQueryWFSService
        );
      }
    }
  };

  /*
   * 行政区划查询回调函数
   */
  callbackLastRegionQueryWFSService = data => {
    // console.log('data',data);
    if (data && data.features.length > 0) {
      this.loadRegionGeojsonLayer(data);
      const bounds = regiongeojsonLayer.getBounds();
      map.fitBounds(bounds);
    }
  };

  /*属性查询行政区划图层
   *@method queryRegionByProperty
   *@param propertyValue 属性值
   *@param propertyName 属性名称
   *@param typeName 图层名称
   *@return null
   */
  queryRegionByProperty = (propertyValue, propertyName, typeName, callback) => {
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
      type: "mapdata/queryRegionWFSLayer",
      payload: { geojsonUrl },
      callback: callback
    });
  };

  // 获取图标文本按钮html
  imgTextButtonHtml = (icon, title, text) => {
    if (text) {
      return `<div class="global-map-button-icon"><img src="${icon}"></img></div><div class="global-map-button-text">${text}</div>`;
    } else {
      if (title) {
        return `<img src="${icon}" style='width:20px;height:20px;margin-top:-5px;margin-left:-1px;' title='${title}'></img>`;
      } else {
        return `<img src="${icon}" style='width:20px;height:20px;margin-top:-5px;margin-left:-1px;'></img>`;
      }
    }
  };
  // 获取图标文本按钮html
  iconTextButtonHtml = (icon, text) => {
    if (text) {
      return `<div class="global-map-button-icon"><i class="iconfont ${icon}"></i></div><div class="global-map-button-text">${text}</div>`;
    } else {
      return `iconfont ${icon} global-icon-normal`;
    }
  };

  // 定位措施点
  async locateMeasurePoint(measurePointInfos, id) {
    if (measurePointInfos.length <= 0) return;
    await this.clearMeasurePoints();
    await this.addMeasurePoints(measurePointInfos);
    if (measurePointInfos.length > 0) {
      for (let i = 0; i < measurePointInfos.length; i++) {
        let index = measurePointInfos.findIndex(
          measurePointInfo => measurePointInfo.id === id
        );
        if (index !== -1) {
          //地图范围跳转
          const FeatureCollection = measurePointLayer.toGeoJSON();
          let Bounds = [];
          if (FeatureCollection.features.length > 0) {
            for (let i = 0; i < FeatureCollection.features.length; i++) {
              let feature = FeatureCollection.features[i];
              Bounds.push([
                feature.geometry.coordinates[1],
                feature.geometry.coordinates[0]
              ]);
            }
            map.fitBounds(Bounds, {
              maxZoom: config.mapInitParams.zoom
            });
          }

          let measurePointInfo = measurePointInfos[index];
          let latLng = L.latLng(
            measurePointInfo.pointY,
            measurePointInfo.pointX
          );
          if (latLng) {
            const elements = this.getMeasurePopupContent(
              measurePointInfo,
              latLng
            );
            map.openPopup(elements[0], latLng);
          } else {
            message.warning("措施点的坐标为空", 1);
          }
          break;
        }
      }
    }
  }
  // 清除措施点
  async clearMeasurePoints() {
    if (measurePointLayer) {
      measurePointLayer.clearLayers();
    }
    map.closePopup();
  }
  // 清除指定措施点
  async deleteMeasurePoint(id) {
    if (measurePointLayer) {
      measurePointLayer.eachLayer(function(layer) {
        if (layer.options.properties.id === id) {
          measurePointLayer.removeLayer(layer);
        }
      });
    }
    map.closePopup();
  }
  //新建措施点要素
  async addMeasurePoints(measurePointInfos) {
    const me = this;
    //查询数据源构造geojson
    let geojson = me.data2GeoJSON(measurePointInfos);
    if (geojson) {
      await me.addMeasurePointsToMap(geojson, measurePointLayer);
    }
    measurePointLayer.eachLayer(function(layer) {
      layer.unbindPopup();
      const elements = me.getMeasurePopupContent(
        layer.options.properties,
        layer._latlng
      );
      layer.bindPopup(elements[0]);
    });
  }
  /*
   * 措施点单击内容函数
   */
  getMeasurePopupContent(item, latlng) {
    const { toPopupItemStr } = this;
    // 内容及单击事件
    const elements = jQuery(
      `<div>
        ${toPopupItemStr("措施点名称", item.name)}
        ${toPopupItemStr("经度", latlng.lng)}
        ${toPopupItemStr("纬度", latlng.lat)}
      </div>`
    );
    return elements;
  }
  /*
   * 加载聚合图层
   */
  async addMeasurePointsToMap(geojson, measurePointLayer) {
    for (let i = 0; i < geojson.features.length; i++) {
      const myIcon = L.icon({
        iconUrl: "./img/measurePointMarker.png",
        iconSize: [32, 32]
      });
      let marker = L.marker(
        new L.LatLng(
          geojson.features[i].geometry.coordinates[1],
          geojson.features[i].geometry.coordinates[0]
        ),
        { properties: geojson.features[i].properties, icon: myIcon }
      );
      measurePointLayer.addLayer(marker);
    }
  }

  // 定位问题点
  async locateProblemPoint(problemPointInfos, id) {
    if (problemPointInfos.length <= 0) return;
    await this.clearProblemPoints();
    await this.addProblemPoints(problemPointInfos);
    if (problemPointInfos.length > 0) {
      for (let i = 0; i < problemPointInfos.length; i++) {
        //let indexLayer = layers.findIndex(layer => layer.options.properties.id === id);
        let index = problemPointInfos.findIndex(
          problemPointInfo => problemPointInfo.id === id
        );
        if (index !== -1) {
          //地图范围跳转
          const FeatureCollection = problemPointLayer.toGeoJSON();
          let Bounds = [];
          if (FeatureCollection.features.length > 0) {
            for (let i = 0; i < FeatureCollection.features.length; i++) {
              let feature = FeatureCollection.features[i];
              Bounds.push([
                feature.geometry.coordinates[1],
                feature.geometry.coordinates[0]
              ]);
            }
            map.fitBounds(Bounds, {
              maxZoom: config.mapInitParams.zoom
            });
          }

          let problemPointInfo = problemPointInfos[index];
          let latLng = L.latLng(
            problemPointInfo.pointY,
            problemPointInfo.pointX
          );
          if (latLng) {
            const elements = this.getProblemPopupContent(
              problemPointInfo,
              latLng
            );
            map.openPopup(elements[0], latLng);
          } else {
            message.warning("问题点的坐标为空", 1);
          }
          break;
        }
      }
    }
  }

  // 清除问题点
  async clearProblemPoints() {
    if (problemPointLayer) {
      problemPointLayer.clearLayers();
    }
    map.closePopup();
  }

  // 清除指定问题点
  async deleteProblemPoint(id) {
    if (problemPointLayer) {
      problemPointLayer.eachLayer(function(layer) {
        if (layer.options.properties.id === id) {
          problemPointLayer.removeLayer(layer);
        }
      });
    }
    map.closePopup();
  }

  //新建问题点要素
  async addProblemPoints(problemPointInfos) {
    const me = this;
    //查询数据源构造geojson
    let geojson = me.data2GeoJSON(problemPointInfos);
    if (geojson) {
      await me.addProblemPointsToMap(geojson, problemPointLayer);
    }
    problemPointLayer.eachLayer(function(layer) {
      layer.unbindPopup();
      const elements = me.getProblemPopupContent(
        layer.options.properties,
        layer._latlng
      );
      layer.bindPopup(elements[0]);
    });
  }

  /*
   * 问题点单击内容函数
   */
  getProblemPopupContent(item, latlng) {
    const { toPopupItemStr } = this;
    // 内容及单击事件
    const elements = jQuery(
      `<div>
        ${toPopupItemStr("问题点名称", item.name)}
        ${toPopupItemStr("问题点备注", item.description)}
        ${toPopupItemStr("经度", latlng.lng)}
        ${toPopupItemStr("纬度", latlng.lat)}
      </div>`
    );
    return elements;
  }

  // 转为popup项
  toPopupItemStr = (name, value) => {
    return value ? `<b>${name}：</b>${value}<br>` : "";
  };

  /*
   * 加载聚合图层
   */
  async addProblemPointsToMap(geojson, problemPointLayer) {
    for (let i = 0; i < geojson.features.length; i++) {
      const myIcon = L.icon({
        iconUrl: "./img/problemPointMarker.png",
        iconSize: [32, 32]
      });
      let marker = L.marker(
        new L.LatLng(
          geojson.features[i].geometry.coordinates[1],
          geojson.features[i].geometry.coordinates[0]
        ),
        { properties: geojson.features[i].properties, icon: myIcon }
      );
      problemPointLayer.addLayer(marker);
    }
  }

  //查询数据源构造geojson
  data2GeoJSON(items) {
    let geojson = {};
    let item = null;
    try {
      geojson = {
        type: "FeatureCollection",
        features: []
      };
      //构造geojson数据源
      if (items.length > 0) {
        for (let i = 0; i < items.length; i++) {
          item = items[i];
          if (item.pointX && item.pointY) {
            let properties = {
              description: item.description ? item.description : "",
              name: item.name,
              id: item.id
            };
            let obj = {
              type: "Feature",
              properties: properties,
              geometry: {
                type: "Point",
                coordinates: [item.pointX, item.pointY]
              }
            };
            geojson.features.push(obj);
          }
        }
      }
    } catch (e) {
      console.error(e, JSON.stringify(item));
    }
    return geojson;
  }

  /*
   * 编辑图形查询回调函数
   */

  callbackEditQueryWFSService = data => {
    const me = this;
    if (data.success) {
      data = data.result;
      //关闭地图气泡窗口
      map.closePopup();
      //显示编辑菜单按钮
      me.setState({ showButton: true });
      //移除地图监听事件
      map.off("click");
      me.clearPlotGraphic();
      me.clearGeojsonLayer();
      me.loadGeojsonLayer(data, geoJsonStyle);
      //编辑图形
      userconfig.projectgeojsonLayer.pm.enable({
        allowSelfIntersection: false
      });
      //移动图形
      //map.pm.toggleGlobalDragMode();
    } else {
      message.warning("匹配不到相关编辑", 1);
    }
  };
  /*
   * 地图定位查询回调函数
   */
  callbackLocationQueryWFSService = data => {
    const me = this;
    if (data.success) {
      data = data.result;
      if (data.features.length > 0) {
        me.clearGeojsonLayer();
        me.loadGeojsonLayer(data, geoJsonStyle);
        if (map.getZoom() < config.mapInitParams.zoom) {
          map.fitBounds(userconfig.projectgeojsonLayer.getBounds(), {
            maxZoom: config.mapInitParams.zoom
          });
        }
        let content = "";
        for (let i = 0; i < data.features.length; i++) {
          let feature = data.features[i];
          //判断是不是分割图斑
          if (feature.properties.map_num) clipSpotLayer = feature;
          if (i === data.features.length - 1) {
            me.getWinContent(feature.properties, data => {
              content += data[0].innerHTML;
            });
          } else {
            me.getWinContent(feature.properties, data => {
              content += data[0].innerHTML + "<br><br>";
            });
          }
          //项目红线高亮关联扰动图斑
          if (!feature.properties.map_num) {
            me.querySpotByProjectId(feature.properties.project_id);
          }
        }
        setTimeout(() => {
          if (userconfig.poupLatLng) {
            map.openPopup(content, userconfig.poupLatLng);
            me.automaticToMap(userconfig.poupLatLng);
          } else {
            let latlng = userconfig.projectgeojsonLayer.getBounds().getCenter();
            map.openPopup(content, latlng);
            me.automaticToMap(latlng);
          }
        }, 500);
      } else {
        message.warning("项目无可用位置信息", 1);
      }
    } else {
      message.warning("项目无可用位置信息", 1);
    }
  };
  /*
   * 地图定位查询回调函数-不弹气泡窗口
   */
  callbackLocationNoPopup = data => {
    const me = this;
    if (data.success) {
      data = data.result;
      if (data.features.length > 0) {
        me.clearGeojsonLayer();
        me.loadGeojsonLayer(data, geoJsonStyle);
        if (map.getZoom() < config.mapInitParams.zoom) {
          map.fitBounds(userconfig.projectgeojsonLayer.getBounds(), {
            maxZoom: config.mapInitParams.zoom
          });
        } else {
          let latLng = userconfig.projectgeojsonLayer.getBounds().getCenter();
          if (latLng) {
            me.automaticToMap(latLng);
          }
        }
      } else {
        message.warning("项目无可用位置信息", 1);
      }
    } else {
      message.warning("项目无可用位置信息", 1);
    }
  };
  /*
   * 点选查询回调函数
   */
  callbackPointQueryWFSService = data => {
    const me = this;
    if (data.success) {
      data = data.result;
      let geojsondata = {
        type: "FeatureCollection",
        features: []
      };
      //console.log("data", data);
      if (data.features.length > 0) {
        let content = "";
        for (let i = 0; i < data.features.length; i++) {
          let feature = data.features[i];
          //过滤历史图斑记录
          if (!feature.properties.archive_time) {
            geojsondata.features.push(feature);
            //判断是不是分割图斑
            if (feature.properties.map_num) clipSpotLayer = feature;
            if (i === data.features.length - 1) {
              me.getWinContent(feature.properties, data => {
                content += data[0].innerHTML;
              });
            } else {
              me.getWinContent(feature.properties, data => {
                content += data[0].innerHTML + "<br>";
              });
            }
          }
          //console.log("feature", feature);
          //项目红线高亮关联扰动图斑
          if (!feature.properties.map_num) {
            me.querySpotByProjectId(feature.properties.project_id);
          }
        }
        me.clearGeojsonLayer();
        me.loadGeojsonLayer(geojsondata, geoJsonStyle);
        if (map.getZoom() < config.mapInitParams.zoom) {
          map.fitBounds(userconfig.projectgeojsonLayer.getBounds(), {
            maxZoom: config.mapInitParams.zoom
          });
        }
        map.openPopup(content, userconfig.mapPoint);
      } else {
        map.closePopup();
      }
    } else {
      message.warning("地图匹配不到相关数据", 1);
      map.closePopup();
    }
  };

  //根据项目id查询关联扰动图斑信息
  querySpotByProjectId = ProjectId => {
    const { dispatch } = this.props;
    dispatch({
      type: "spot/querySpotPolygonByProjectId",
      payload: {
        ProjectId: ProjectId
      },
      callback: (success, result) => {
        if (success) {
          //console.log("result",result);
          if (result.length > 0) {
            result.forEach(element => {
              this.loadHighlightGeojsonLayer(
                JSON.parse(element.geom),
                highLightGeoJsonStyle
              );
            });
          }
        }
      }
    });
  };

  callbackPointQuerySpotWFSService = data => {
    const me = this;
    if (data.success) {
      data = data.result;
      me.clearGeojsonLayer();
      me.loadGeojsonLayer(data, geoJsonStyle);
      me.setState({
        spotStatus: "end" //start：开始，end：结束
      });
      if (data.features.length > 0) {
        let spotIds = [];
        for (let i = 0; i < data.features.length; i++) {
          let item = data.features[i];
          let spotId = item.properties.id ? item.properties.id : "";
          let project_id = item.properties.project_id
            ? item.properties.project_id
            : "";
          spotIds.push({ spotId: spotId, projectId: project_id });
        }
        //图斑关联
        emitter.emit("spotRelate", {
          status: "end", //start：开始，end：结束
          spotId: spotIds,
          projectId: me.state.spotRelateProjectId
        });
      } else {
        //图斑关联
        emitter.emit("spotRelate", {
          status: "end", //start：开始，end：结束
          spotId: []
        });
      }
    } else {
      message.warning("地图匹配不到相关数据", 1);
      map.closePopup();
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
    return pic;
  };
  /*
   * 自动匹配地图偏移
   */
  automaticToMap = latLng => {
    const me = this;
    const {
      showSiderbar,
      showSiderbarDetail,
      showQuery,
      showProblem
    } = me.state;
    let point = map.latLngToContainerPoint(latLng);
    const offsetSiderbar = showSiderbar ? 200 : 0;
    const offsetSiderbarDetail = showSiderbarDetail ? 200 : 0;
    const offsetQuery = showQuery ? 225 : 0;
    const offsetProblem = showProblem ? 215 : 0;
    if (me.refDom && me.refDom.clientWidth && me.refDom.clientHeight) {
      const { clientWidth, clientHeight } = me.refDom;
      if (clientWidth && clientHeight) {
        point.x =
          point.x -
          clientWidth / 2 -
          offsetSiderbar -
          offsetSiderbarDetail -
          offsetProblem -
          offsetQuery;
        point.y = point.y - clientHeight / 2;
        map.panBy(point);
      }
    }
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
      attributionControl: false,
      //editable: true
      layers: [problemPointLayer, measurePointLayer]
    }).setView(config.mapInitParams.center, config.mapInitParams.zoom);

    map.createPane("tileLayerZIndex");
    map.getPane("tileLayerZIndex").style.zIndex = 0;
    const { onlineBasemaps } = config;
    // 在线底图
    this.onlineBasemapLayers = onlineBasemaps.map(item => {
      return L.tileLayer(`${item.url}`, {
        minZoom: item.minZoom,
        maxZoom: item.maxZoom,
        subdomains: item.subdomains,
        pane: "tileLayerZIndex",
        errorTileUrl: item.errorTileUrl
      });
    });
    map.addLayer(this.onlineBasemapLayers[0]);
    userconfig.baseLayer = this.onlineBasemapLayers[0];

    // 编辑图形工具
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
    // 将图层绘制控件新建的地图页面上
    map.pm.addControls(options);
    //检查照片列表
    picLayerGroup = L.featureGroup().addTo(map);
    //临时分割图斑图层
    clipResultLayer = L.Proj.geoJson(null, {}).addTo(map);

    // 监听地图点击事件
    map.on("click", me.onClickMap);
    // 监听地图移动完成事件
    map.on("moveend", me.onMoveendMap);
    // 监听地图底图切换事件
    map.on("baselayerchange", me.onBaseLayerChange);
    // 监听地图鼠标移动事件
    map.on("mousemove", me.showImageInfos);
    // 获取项目区域范围
    me.getRegionGeometry();

    /*-------------------------------------项目监管部分-------------------------------------*/
    //行政区划图层
    map.createPane("regiongeoJsonZIndex");
    map.getPane("regiongeoJsonZIndex").style.zIndex = 1;
    regiongeojsonLayer = L.Proj.geoJson(null, {
      style: regionGeoJsonStyle,
      pane: "regiongeoJsonZIndex"
    });
    map.addLayer(regiongeojsonLayer);
    //监听行政区划图层鼠标事件
    regiongeojsonLayer.on("click", me.onClickRegiongeojsonLayer);
    regiongeojsonLayer.on("mouseover", me.onMoveoverRegiongeojsonLayer);
    regiongeojsonLayer.on("mouseout", me.onMoveoutRegiongeojsonLayer);

    //临时绘制关联项目红线以及扰动图斑
    temprenlinegeojsonLayer = L.Proj.geoJson(null, {
      style: tempRedlineGeoJsonStyle,
      pane: "regiongeoJsonZIndex"
    });
    map.addLayer(temprenlinegeojsonLayer);
    tempspotgeojsonLayer = L.Proj.geoJson(null, {
      style: tempSpotGeoJsonStyle,
      pane: "regiongeoJsonZIndex"
    });
    map.addLayer(tempspotgeojsonLayer);

    //区域统计图层
    ZSgeojsonLayer = L.featureGroup([], { pane: "regiongeoJsonZIndex" });
    map.addLayer(ZSgeojsonLayer);
    ZSgeojsonLayer.on("click", me.onClickZSgeojsonLayer);

    // 项目点
    projectPointLayer = L.markerClusterGroup({
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      chunkedLoading: true,
      maxClusterRadius: 80 //默认80
    });
    map.addLayer(projectPointLayer);
    projectPointLayer.on("click", me.onClickProjectPointLayer);
  };
  //监听地图点击事件
  onBaseLayerChange = e => {
    userconfig.baseLayer = e.layer;
    //判断当前底图是否等于监管影像
    if (e.layer._url === config.onlineBasemaps[0].url) {
      this.setState({ showImageTimeText: true });
    } else {
      this.setState({ showImageTimeText: false });
    }

    //隐藏影像历史列表下拉框
    this.setState({ showHistoryIMG: false });
    //移除影像图层
    if (ImgListLayer) {
      map.removeLayer(ImgListLayer);
    }
    //设置默认底图可见
    if (userconfig.baseLayer)
      userconfig.baseLayer = this.getBasemapLayer(
        userconfig.baseLayer,
        this.onlineBasemapLayers
      );
    userconfig.baseLayer.setOpacity(1);
  };
  getBasemapLayer = (baseLayer, onlineBasemapLayers) => {
    let layer = onlineBasemapLayers[0];
    onlineBasemapLayers.forEach((item, i) => {
      if (item._url === baseLayer._url) {
        layer = onlineBasemapLayers[i];
      }
    });
    return layer;
  };
  onClickMap = e => {
    const me = this;
    const { switchDataModal } = this.state;
    let turfpoint = turf.point([e.latlng.lng, e.latlng.lat]);
    if (!turf.booleanPointInPolygon(turfpoint, userconfig.polygon)) {
      message.warning("区域范围之外的数据没有权限操作", 1);
      return;
    }
    me.clearGeojsonLayer();
    userconfig.mapPoint = e.latlng;
    //地图定位判断
    if (userconfig.state === "position") {
      //地图获取经纬度
      jQuery(userconfig.geoJsonLayer.getPane())
        .find("path")
        .css({
          cursor: "pointer"
        });
      let myIcon = "";
      if (userconfig.siteLocationtype === "panorama") {
        //全景点
        myIcon = L.icon({
          iconUrl: "./img/camer.png",
          iconSize: [24, 24]
        });
      } else if (userconfig.siteLocationtype === "problemPoint") {
        //问题点
        myIcon = L.icon({
          iconUrl: "./img/problemPointMarker.png",
          iconSize: [32, 32]
        });
      } else if (userconfig.siteLocationtype === "measurePoint") {
        //措施点
        myIcon = L.icon({
          iconUrl: "./img/measurePointMarker.png",
          iconSize: [32, 32]
        });
      } else {
        myIcon = L.icon({
          iconUrl: "./img/marker-icon.png",
          iconSize: [17, 31]
        });
      }
      userconfig.state = "";
      userconfig.siteLocationtype = "";
      emitter.emit("siteLocationBack", {
        latitude: userconfig.mapPoint.lat,
        longitude: userconfig.mapPoint.lng
      });
      if (marker) marker.remove();
      marker = L.marker([userconfig.mapPoint.lat, userconfig.mapPoint.lng], {
        icon: myIcon
      }).addTo(map);
      return;
    }

    if (switchDataModal) {
      /*-------------------------------------区域监管部分-------------------------------------*/
      //点查WMS图层
      let point = { x: e.latlng.lng, y: e.latlng.lat };
      //图斑关联判断spotStatus
      const { spotStatus } = me.state;
      if (spotStatus === "start") {
        //图斑关联点查
        me.queryWFSServiceByPoint(
          point,
          config.mapSpotLayerName,
          me.callbackPointQuerySpotWFSService
        );
      } else {
        //普通点查
        let LayersName = "";
        const { showHistoryContrast } = me.state;
        if (showHistoryContrast) {
          //地图卷帘模式下
          LayersName = config.mapLayersName; //扰动图斑、项目红线勾选
        } else {
          //非地图卷帘模式下
          if (
            userconfig.overlays.扰动图斑._map &&
            userconfig.overlays.项目红线._map
          ) {
            LayersName = config.mapLayersName; //扰动图斑、项目红线勾选
          } else if (
            userconfig.overlays.扰动图斑._map &&
            !userconfig.overlays.项目红线._map
          ) {
            LayersName = config.mapSpotLayerName; //扰动图斑勾选
          } else if (
            !userconfig.overlays.扰动图斑._map &&
            userconfig.overlays.项目红线._map
          ) {
            LayersName = config.mapProjectLayerName; //项目红线勾选
          } else {
            //扰动图斑、项目红线都不勾选
            return;
          }
        }
        me.queryWFSServiceByPoint(
          point,
          LayersName,
          me.callbackPointQueryWFSService
        );
      }
    } else {
      /*-------------------------------------项目监管部分-------------------------------------*/
      me.clearXMJGGeojsonLayer(tempspotgeojsonLayer);
      me.clearXMJGGeojsonLayer(temprenlinegeojsonLayer);
      if (marker) marker.remove();
    }
  };

  showImageInfos = e => {
    const {
      mapdata: { imageTimeResult }
    } = this.props;
    const me = this;
    //根据地图当前范围获取对应监管影像时间
    const { showImageTimeText } = me.state;
    if (showImageTimeText && imageTimeResult) {
      let tileInfos = imageTimeResult.tileInfos;
      if (tileInfos.length > 0) {
        let pt = proj4("EPSG:4326", "EPSG:3857", [e.latlng.lng, e.latlng.lat]);
        for (let i = 0; i < tileInfos.length; i++) {
          let item = tileInfos[i];
          if (
            pt[0] >= item.xmin &&
            pt[0] <= item.xmax &&
            pt[1] >= item.ymin &&
            pt[1] <= item.ymax
          ) {
            let data = item.data;
            if (data && data.hasOwnProperty("takenDate")) {
              me.setState({ imageTimeText: data.takenDate });
            }
            return true;
          }
        }
      }
    }
  };

  onMoveendMap = e => {
    const me = this;
    const { switchDataModal } = this.state;
    if (!map) {
      return;
    }
    let zoom = map.getZoom();
    let bounds = map.getBounds();
    // console.log("zoom",zoom);
    // console.log("userconfig.zoom",userconfig.zoom);
    //根据地图当前范围获取对应监管影像时间
    me.getInfoByExtent(zoom, bounds, data => {
      me.setState({ imageTimeText: data[0] });
      me.setState({ selectIMG: data[0] });
    });
    /*const { showImageTimeText } = me.state;
    if (showImageTimeText) {
      me.getInfoByExtent(zoom, bounds, data => {
        me.setState({ imageTimeText: data[0] });
        me.setState({ selectIMG: data[0] });
      });
    }
    const { showHistoryIMG } = me.state;
    if (showHistoryIMG) {
      me.getInfoByExtent(zoom, bounds, data => {
        me.setState({ imageTimeText: data[0] });
        me.setState({ selectIMG: data[0] });
      });
    }*/

    if (switchDataModal) {
      /*-------------------------------------区域监管部分-------------------------------------*/
      //图属联动空间过滤
      const { chartStatus } = this.state;
      if (zoom >= config.mapInitParams.zoom && chartStatus) {
        let polygon = "polygon((";
        polygon +=
          bounds.getSouthWest().lng + " " + bounds.getSouthWest().lat + ",";
        polygon +=
          bounds.getSouthWest().lng + " " + bounds.getNorthEast().lat + ",";
        polygon +=
          bounds.getNorthEast().lng + " " + bounds.getNorthEast().lat + ",";
        polygon +=
          bounds.getNorthEast().lng + " " + bounds.getSouthWest().lat + ",";
        polygon += bounds.getSouthWest().lng + " " + bounds.getSouthWest().lat;
        polygon += "))";

        emitter.emit("chartLinkage", {
          open: true,
          type: "spot",
          polygon: polygon
        });
      }
      //根据地图当前范围获取对应历史影像数据
      const { showHistoryContrast } = me.state;
      if (showHistoryContrast) {
        //历史影像查询
        me.getInfoByExtent(zoom, bounds, me.callbackGetInfoByExtent, false);
      }
    } else {
      /*-------------------------------------项目监管部分-------------------------------------*/
      if (zoom >= config.pointLevel) {
        //隐藏区域统计图层
        if (ZSgeojsonLayer && ZSgeojsonLayer.getLayers().length > 0) {
          me.clearXMJGGeojsonLayer(ZSgeojsonLayer);
        }
        //显示项目点聚合图层
        if (projectPointLayer && projectPointLayer.getLayers().length <= 0) {
          const { projectSymbolValue } = me.state;
          me.addAllProjectPoints(
            me.callbackDrawMapProjectPoints,
            projectSymbolValue
          );
        }
      } else {
        //隐藏项目点聚合图层
        if (projectPointLayer && projectPointLayer.getLayers().length > 0) {
          me.clearXMJGGeojsonLayer(projectPointLayer);
        }
        //显示区域统计图层
        const { projectSymbolValue } = me.state;
        if (projectSymbolValue === "项目总数") {
          if (ZSgeojsonLayer && ZSgeojsonLayer.getLayers().length <= 0) {
            //预防初始化时候加载两次请求
            if (userconfig.isloadMap) {
              me.createZStatistics(); //区域总数统计
            }
            userconfig.isloadMap = true;
          }
        } else {
          if (ZSgeojsonLayer && ZSgeojsonLayer.getLayers().length <= 0) {
            me.createZSPie(projectSymbolValue); //区域饼状图统计
          }
        }
      }
      //根据地图当前级别zoom,动态改变圆圈半径大小
      if (zoom <= 7) {
        //省级行政区划
        radius = 17000;
      } else if (zoom === 8) {
        //市级行政区划
        radius = 12000;
      } else if (zoom === 9) {
        //市级行政区划
        radius = 7000;
      } else if (zoom === 10) {
        //市级行政区划
        radius = 3500;
      } else {
        //区县级行政区划
        radius = 2000;
      }
      if (ZSgeojsonLayer) {
        ZSgeojsonLayer.eachLayer(function(layer) {
          //console.log('radius',zoom,radius);
          if (layer.options.radius) {
            layer.setRadius(radius);
          }
        });
      }
    }
  };
  /*根据地图当前范围获取对应历史影像数据
   *@method getInfoByExtent
   *@param zoom 地图当前范围级别
   *@param bounds 地图当前范围
   *@param callback 回调函数
   *@param isLoadSideBySide 是否重新加载地图卷帘
   *@return null
   */
  getInfoByExtent = (zoom, bounds, callback, isLoadSideBySide) => {
    const me = this;
    userconfig.isLoadSideBySide = isLoadSideBySide;
    let urlString = config.mapUrl.getInfoByExtent;
    let xyMin = proj4("EPSG:4326", "EPSG:3857", [
      bounds.getSouthWest().lng,
      bounds.getSouthWest().lat
    ]);
    let xyMax = proj4("EPSG:4326", "EPSG:3857", [
      bounds.getNorthEast().lng,
      bounds.getNorthEast().lat
    ]);
    let param = {
      level: zoom, //地图当前范围级别
      xmin: xyMin[0], //地图当前范围x最小值
      xmax: xyMax[0], //地图当前范围x最大值
      ymin: xyMin[1], //地图当前范围y最小值
      ymax: xyMax[1] //地图当前范围y最大值
    };
    let geojsonUrl = urlString + L.Util.getParamString(param, urlString);
    me.props.dispatch({
      type: "mapdata/getInfoByExtent",
      payload: { geojsonUrl },
      callback: callback
    });
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
    let urlString = config.mapUrl.geoserverQueryUrl + "/ows";
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

  /*空间范围查询图层
   *@method queryWFSServiceByExtent
   *@return null
   */
  queryWFSServiceByExtent = (typeName, callback) => {
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
    filter += "<And>";
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
    filter += "<Not>";
    filter += "<PropertyIsNull>";
    filter += "<PropertyName>archive_time</PropertyName>";
    filter += "</PropertyIsNull>";
    filter += "</Not>";
    filter += "</And>";
    filter += "</Filter>";
    // let urlString = config.mapUrl.geoserverUrl + '/ows';
    let urlString = config.mapUrl.geoserverQueryUrl + "/ows";
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
      type: "mapdata/getHistorySpotTimeByExtent",
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
  queryWFSServiceByPoint = (point, typeName, callback) => {
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
    let urlString = config.mapUrl.geoserverQueryUrl + "/ows";
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
      callback: callback
    });
  };

  creatElements = (properties, callback) => {
    console.log(properties);
    let elements;
    const obj = {
      show: true,
      type: "edit",
      id: properties.map_num ? properties.id : properties.project_id,
      from: properties.map_num ? "spot" : "project"
    };
    elements = properties.map_num
      ? jQuery(
          `<div>图斑编号:${properties.map_num}</br>
    ${
      properties.project_name
        ? "关联项目:" + properties.project_name + "</br>"
        : ""
    }${
            properties.interference_compliance
              ? "扰动范围:" + properties.interference_compliance + "</br>"
              : ""
          }<a onclick='goDetail(${JSON.stringify(
            obj
          )})'>详情</a>    <a onclick='goEditGraphic(${JSON.stringify(
            obj
          )})'>图形编辑</a>  <a onclick='goDeleteGraphic(${JSON.stringify(
            obj
          )})' style='display:none'>图形删除</a><a onclick='divideSpot(${JSON.stringify(
            obj
          )})'>分割图斑</a></div>`
        )
      : jQuery(
          `<div>项目:${properties.project_name}</br>
        <a onclick='goDetail(${JSON.stringify(
          obj
        )})'>详情</a>    <a onclick='goEditGraphic(${JSON.stringify(
            obj
          )})'>图形编辑</a>  <a onclick='goDeleteGraphic(${JSON.stringify(
            obj
          )})' style='display:none'>图形删除</a></div>`
        );
    callback(elements);
  };

  getWinContent = (properties, callback) => {
    if (properties.map_num) {
      this.creatElements(properties, callback);
    } else {
      this.creatElements(properties, callback, "");
    }
  };
  /*
   * 绘制图形函数
   */
  loadGeojsonLayer = (geojson, style) => {
    if (!userconfig.projectgeojsonLayer) {
      userconfig.projectgeojsonLayer = L.Proj.geoJson(geojson, {
        style: style
      }).addTo(map);
    }
  };
  loadHighlightGeojsonLayer = (geojson, style) => {
    if (!userconfig.highlightgeojsonLayer) {
      userconfig.highlightgeojsonLayer = L.Proj.geoJson(geojson, {
        style: style
      }).addTo(map);
    } else {
      userconfig.highlightgeojsonLayer.addData(geojson);
    }
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
    if (userconfig.highlightgeojsonLayer) {
      userconfig.highlightgeojsonLayer.clearLayers();
      map.removeLayer(userconfig.highlightgeojsonLayer);
      userconfig.highlightgeojsonLayer = null;
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
    //me.geojson2Multipolygon(userconfig.geojson,0);
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
    setTimeout(() => {
      // console.log("地图最小级别1285",map.getMinZoom());
      userconfig.zoom = map.getZoom();
      //加载geoserver发布的WMS地图服务
      me.overlayWMSLayers();
      //地图模态层效果
      me.loadmodalLayer();
    }, 1500);
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
        opacity: 0,
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
    // console.log("地图最小级别1334",map.getMinZoom());
    //加载图层控件
    userconfig.layersControl = this.loadLayersControl();
    //地图缩放控件
    L.control
      .zoom({ zoomInTitle: "放大", zoomOutTitle: "缩小", position: "topright" })
      .addTo(map);
    //地图视图控件
    // L.control
    //   .navbar({
    //     center: bounds.getCenter(),
    //     forwardTitle: "前视图",
    //     backTitle: "后视图",
    //     homeTitle: "全图"
    //   })
    //   .addTo(map);
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
    //判断地图初始化是否项目监管状态
    const { switchDataModal } = this.state;
    // console.log("switchDataModal2675", switchDataModal);
    if (!switchDataModal) {
      userconfig.projectWmsLayer.setOpacity(0);
      userconfig.spotWmsLayer.setOpacity(0);
      userconfig.siteSpotWmsLayer.setOpacity(0);
      userconfig.layersControl.removeLayer(userconfig.projectWmsLayer);
      userconfig.layersControl.removeLayer(userconfig.spotWmsLayer);
      userconfig.layersControl.removeLayer(userconfig.siteSpotWmsLayer);
      //项目监管
      this.switchXMJG();
    }
  };
  /*
   *加载默认图层控件
   */
  loadLayersControl = () => {
    const frequentEdit = localStorage.getItem("frequentEdit");
    // console.log("是否频繁编辑", frequentEdit, typeof frequentEdit);
    if (frequentEdit === "1") {
      //加载项目红线图层wms
      userconfig.projectWmsLayer = LeaftWMS.overlay(
        config.mapUrl.geoserverUrl + "/wms?",
        {
          layers: config.mapProjectLayerName, //需要加载的图层
          format: "image/png", //返回的数据格式
          transparent: true,
          maxZoom: config.mapInitParams.maxZoom
        }
      ).addTo(map);

      //加载图斑图层wms
      userconfig.spotWmsLayer = LeaftWMS.overlay(
        config.mapUrl.geoserverUrl + "/wms?",
        {
          layers: config.mapSpotLayerName, //需要加载的图层
          format: "image/png", //返回的数据格式
          transparent: true,
          maxZoom: config.mapInitParams.maxZoom,
          cql_filter: userconfig.cql_filter
            ? userconfig.cql_filter
            : "archive_time is null and create_type==0"
        }
      ).addTo(map);
      //加载现场创建图斑图层wms
      userconfig.siteSpotWmsLayer = LeaftWMS.overlay(
        config.mapUrl.geoserverUrl + "/wms?",
        {
          layers: config.mapSpotLayerName, //需要加载的图层
          format: "image/png", //返回的数据格式
          transparent: true,
          maxZoom: config.mapInitParams.maxZoom,
          cql_filter: "archive_time is null and create_type==1"
        }
      ).addTo(map);
    } else {
      //默认加载瓦片地图模式
      //加载项目红线图层wms
      userconfig.projectWmsLayer = L.tileLayer
        .wms(config.mapUrl.geoserverUrl + "/wms?", {
          layers: config.mapProjectLayerName, //需要加载的图层
          format: "image/png", //返回的数据格式
          transparent: true,
          maxZoom: config.mapInitParams.maxZoom
        })
        .addTo(map);

      //加载图斑图层wms
      userconfig.spotWmsLayer = L.tileLayer
        .wms(config.mapUrl.geoserverUrl + "/wms?", {
          layers: config.mapSpotLayerName, //需要加载的图层
          format: "image/png", //返回的数据格式
          transparent: true,
          maxZoom: config.mapInitParams.maxZoom,
          cql_filter: userconfig.cql_filter
            ? userconfig.cql_filter
            : "archive_time is null and create_type==0"
        })
        .addTo(map);
      //加载现场创建图斑图层wms
      userconfig.siteSpotWmsLayer = L.tileLayer
        .wms(config.mapUrl.geoserverUrl + "/wms?", {
          layers: config.mapSpotLayerName, //需要加载的图层
          format: "image/png", //返回的数据格式
          transparent: true,
          maxZoom: config.mapInitParams.maxZoom,
          cql_filter: "archive_time is null and create_type==1"
        })
        .addTo(map);
    }

    const { onlineBasemapLayers } = this;
    const { onlineBasemaps, tdtImageLabel, districtBound } = config;
    // 底图图层
    const baseMaps = {};
    onlineBasemaps.forEach((item, i) => {
      baseMaps[this.getImageTitle(item.title, item.picUrl)] =
        onlineBasemapLayers[i];
    });
    // 专题图层
    //基础地图数据
    //天地图地图标注图层
    const placeNameImageLayer = L.tileLayer(`${tdtImageLabel.url}`, {
      minZoom: tdtImageLabel.minZoom,
      maxZoom: tdtImageLabel.maxZoom,
      subdomains: tdtImageLabel.subdomains
    });
    this.placeNameImageLayer = placeNameImageLayer;
    //行政边界-区县图层
    // const districtBoundLayer = DynamicMapLayer({
    //   url:districtBound.url,
    //   minZoom:districtBound.minZoom,
    //   maxZoom:districtBound.maxZoom
    // });
    const districtBoundLayer = L.tileLayer.wms(districtBound.url + "/wms?", {
      layers: districtBound.mapDistrictLayerName, //需要加载的图层
      format: "image/png", //返回的数据格式
      transparent: true,
      maxZoom: districtBound.maxZoom
    });
    this.districtBoundLayer = districtBoundLayer;

    const overlays = (userconfig.overlays = {
      [this.getImageTitle(
        tdtImageLabel.title,
        tdtImageLabel.picUrl
      )]: placeNameImageLayer,
      [this.getTitle(
        districtBound.title,
        DISTRICT_COLOR,
        DISTRICT_FILL_COLOR,
        true,
        "overlayMapsTile"
      )]: districtBoundLayer,
      项目红线: userconfig.projectWmsLayer,
      扰动图斑: userconfig.spotWmsLayer,
      现场图斑: userconfig.siteSpotWmsLayer
    });
    //底图切换控件
    const layersControl = L.control
      .layers(baseMaps, overlays, { position: "topright" })
      .addTo(map);
    // 修改图标样式
    L.DomUtil.addClass(
      layersControl.getContainer().firstChild,
      "iconfont icon-layer global-icon-normal"
    );
    return layersControl;
  };

  // 构建图层标题及图例
  getTitle = (text, borderColor, fillColor, isBorderDashed, className) => {
    if (className) {
      return `<i style='display:inline-block;border:${
        isBorderDashed ? "dashed" : "solid"
      } 2px ${borderColor};background:${fillColor};width:20px;height:20px;position:relative;top:4px;'></i><span style='padding-left:1px;'>${text}</span><div class='${className}'></div>`;
    } else {
      return `<i style='display:inline-block;border:${
        isBorderDashed ? "dashed" : "solid"
      } 2px ${borderColor};background:${fillColor};width:20px;height:20px;position:relative;top:4px;'></i><span style='padding-left:1px;'>${text}</span>`;
    }
  };

  // 构建图片形式的标题及图例
  getImageTitle = (text, imgUrl) => {
    return `<div style='display:inline-block;width:20px;height:20px;position:relative;top:0px;'><img src='${imgUrl}' style='height:20px;'/></div><span style='padding-left:1px;'>${text}</span>`;
  };

  /*
   *移除图层控件
   */
  removeLayersControl = () => {
    if (userconfig.layersControl) userconfig.layersControl.remove();
  };
  /*
   *刷新重绘WMS图层
   */
  reDrawWMSLayers = () => {
    //获取地图当前范围中心点
    let latlng = map.getCenter();
    latlng.lat = latlng.lat - 0.001;
    latlng.lng = latlng.lng - 0.001;
    //通过移动地图来刷新地图
    map.panTo(latlng);
  };
  /*
   *清空绘制图形,避免新建图形以及编辑图形冲突
   */
  clearPlotGraphic = () => {
    //禁止编辑图形
    if (userconfig.projectgeojsonLayer)
      userconfig.projectgeojsonLayer.pm.disable();
    this.clearGeojsonLayer();
    //针对新建图形
    const { addGraphLayer } = this.state;
    //禁止编辑图形
    if (addGraphLayer) {
      addGraphLayer.pm.disable();
      map.removeLayer(addGraphLayer);
      this.setState({ addGraphLayer: null });
    }
    if (map && map.pm && map.pm.disableDraw) {
      map.pm.disableDraw("Polygon");
    }
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
   * 取消新建图形
   */
  cancelAddGraphic = () => {
    this.setState({ showButton: false });
    map.on("click", this.onClickMap);
    const { addGraphLayer, drawType, drawState } = this.state;
    //禁止编辑图形
    if (addGraphLayer) {
      addGraphLayer.pm.disable();
      map.removeLayer(addGraphLayer);
      this.setState({ addGraphLayer: null });
    }
    map.pm.disableDraw("Polygon");
    emitter.emit("showSiderbarDetail", {
      show: false,
      from: drawType,
      type: drawState,
      item: { id: "" }
    });
  };
  /*
   * 取消屏幕截图
   */
  cancelScreenshot = () => {
    this.setState({ showButton: false });
    map.pm.disableDraw("Rectangle");
    map.off("pm:create");
    //监听地图点击事件
    // map.on("click", this.onClickMap);
    if (userconfig.screenLayer) {
      map.removeLayer(userconfig.screenLayer);
      userconfig.screenLayer = null;
    }
  };
  /*
   * 保存新建图形
   */
  saveAddGraphic = () => {
    const me = this;
    map.on("click", this.onClickMap);
    const {
      addGraphLayer,
      drawType,
      drawState,
      projectId,
      projectName,
      fromList
    } = me.state;
    //禁止编辑图形
    if (addGraphLayer) {
      me.setState({ showButton: false });
      addGraphLayer.pm.disable();
      let geojson = addGraphLayer.toGeoJSON();
      let polygon = me.geojson2Multipolygon(geojson, 1);
      emitter.emit("showSiderbarDetail", {
        polygon: polygon,
        show: true,
        type: drawState,
        from: drawType,
        edit: true,
        projectId: projectId,
        projectName: projectName,
        fromList: fromList,
        id: ""
      });
    } else {
      notification["warning"]({
        message: `请绘制图形`
      });
    }
  };
  /*
   * 保存编辑图形
   */
  saveEditGraphic = e => {
    const {
      drawType,
      drawState,
      projectId,
      projectName,
      fromList
    } = this.state;
    e.stopPropagation();
    const me = this;
    this.setState({ showButton: false });
    map.on("click", this.onClickMap);
    //禁止编辑图形
    userconfig.projectgeojsonLayer.pm.disable();
    // 禁止移动图形
    //map.pm.disableGlobalRemovalMode() ;

    let geojson = userconfig.projectgeojsonLayer.toGeoJSON();
    let polygon = me.geojson2Multipolygon(geojson, 0);
    emitter.emit("showSiderbarDetail", {
      polygon: polygon,
      show: true,
      from: drawType,
      type: drawState,
      edit: true,
      projectId: projectId,
      projectName: projectName,
      fromList: fromList,
      id: geojson.features[0].properties.id
    });
  };
  /*
   * 保存屏幕截图
   */
  saveScreenshot = e => {
    if (!userconfig.dataImgUrl) {
      message.warning("屏幕截图结果为空,建议放大地图,重新截图操作试试看", 2);
      return;
    }
    this.cancelScreenshot();
    emitter.emit("screenshotBack", {
      longitude: userconfig.imglng,
      latitude: userconfig.imglat,
      img: userconfig.dataImgUrl
    });
  };
  /*
   * geojson转换multipolygon
   * @type 0代表编辑图形;1代表新建图形
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
            //新建图形
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
    //console.log('polygon',polygon);
    return polygon;
  };
  /*
   * 地图历史对比-卷帘效果
   */
  showHistoryMap = () => {
    const { showHistoryContrast } = this.state;
    if (showHistoryContrast) {
      this.setState({ showImageTimeText: true });
      let zoom = map.getZoom();
      let bounds = map.getBounds();
      //历史影像查询
      this.getInfoByExtent(zoom, bounds, this.callbackGetInfoByExtent, true);
      //隐藏图层控件
      jQuery(userconfig.layersControl.getContainer()).css("display", "none");
    } else {
      //移除卷帘效果
      this.removeSideBySide();
      //还原默认底图加载
      if (userconfig.baseLayer)
        userconfig.baseLayer = this.getBasemapLayer(
          userconfig.baseLayer,
          this.onlineBasemapLayers
        );
      map.addLayer(userconfig.baseLayer);
      map.addLayer(userconfig.spotWmsLayer);
      //显示图层控件
      jQuery(userconfig.layersControl.getContainer()).css("display", "block");
    }
  };
  /*
   * 根据地图当前范围获取对应历史影像数据回调函数
   */
  callbackGetInfoByExtent = data => {
    if (
      userconfig.isLoadSideBySide ||
      userconfig.sideBySideZoom !== map.getZoom()
    ) {
      this.setState({ selectLeftV: data[0] });
      this.setState({ selectRightV: data[0] });
      userconfig.sideBySideZoom = map.getZoom();
      //历史扰动图斑查询
      this.queryWFSServiceByExtent(
        config.mapSpotLayerName,
        this.callbackgetHistorySpotTimeByExtent
      );
    }
  };
  /*
   * 根据地图当前范围获取对应历史扰动图斑数据回调函数
   */
  callbackgetHistorySpotTimeByExtent = data => {
    //console.log(data);
    this.setState({ selectSpotLeftV: data[0].value });
    this.setState({ selectSpotRightV: data[0].value });
    //移除卷帘效果
    this.removeSideBySide();
    this.addSideBySide();
  };

  /*
   * 匹配选择下拉框日期最接近的历史图斑数据
   */
  getLimitSpotByTargetDate = strDate => {
    const {
      mapdata: { historiesSpotProperties }
    } = this.props;
    //console.log('历史扰动图斑数据',historiesSpotProperties);
    var arrDate = [];
    var historiesSpotData = [];
    var targetDate = this.strToDate(strDate.split("T")[0]);
    for (var i = 0; i < historiesSpotProperties.length; i++) {
      var imageDate = historiesSpotProperties[i].archive_time;
      arrDate.push(this.strToDate(imageDate.split("T")[0]));
    }
    var len = arrDate.length;
    for (var j = 0; j < len; j++) {
      var date = this.limitDateIndex(arrDate, targetDate).date;
      var index = this.limitDateIndex(arrDate, targetDate).index;
      historiesSpotProperties.forEach(item => {
        if (
          date === this.strToDate(item.archive_time.split("T")[0]) &&
          JSON.stringify(historiesSpotData).indexOf(
            JSON.stringify(item.spot_id)
          ) === -1
        ) {
          historiesSpotData.push(item); // 进行动态的操作
        }
      });
      arrDate.splice(index, 1);
    }
    //console.log('匹配日期数组最接近目标日期值',historiesSpotData);
    const targethistoriesSpotData = this.greaterOrEqualDates(
      historiesSpotData,
      targetDate
    );
    //console.log('匹配最终目标历史图斑数组值',targethistoriesSpotData);
    return targethistoriesSpotData;
  };
  /*
   * 根据过滤后的历史图斑数组,动态拼接图斑id字符串
   */
  getSpotIdsByHistorySpots = historySpots => {
    var spotIds = "";
    if (historySpots && historySpots.length > 0) {
      var len = historySpots.length;
      for (var i = 0; i < len; i++) {
        var data = historySpots[i];
        if (i === len - 1) {
          // spotIds += "'" + data.spot_id + "'";
          spotIds += data.spot_id;
        } else {
          // spotIds += "'" + data.spot_id  + "',";
          spotIds += data.spot_id + ",";
        }
      }
    }
    return spotIds;
  };
  /*
   * 字符串格式日期转换Date
   */
  strToDate = strDate => {
    var OneMonth = strDate.substring(5, strDate.lastIndexOf("-"));
    var OneDay = strDate.substring(
      strDate.length,
      strDate.lastIndexOf("-") + 1
    );
    var OneYear = strDate.substring(0, strDate.indexOf("-"));
    return Date.parse(OneMonth + "/" + OneDay + "/" + OneYear);
  };
  /*
   * 匹配日期数组最接近目标日期的日期索引以及数据
   */
  limitDateIndex = (arrDate, targetDate) => {
    var newArr = [];
    // eslint-disable-next-line array-callback-return
    arrDate.map(function(x) {
      // 对数组各个数值求差值
      newArr.push(Math.abs(x - targetDate));
    });
    // 求最小值的索引
    var index = newArr.indexOf(Math.min.apply(null, newArr));
    // return index;
    return { index: index, date: arrDate[index] };
  };
  /*
   * 匹配大于或者等于目标日期的数组值
   */
  greaterOrEqualDates = (historiesSpotData, targetDate) => {
    const me = this;
    var newArr = [];
    // eslint-disable-next-line array-callback-return
    historiesSpotData.map(function(x) {
      if (me.strToDate(x.archive_time.split("T")[0]) >= targetDate) {
        newArr.push(x);
      }
    });
    return newArr;
  };

  /*
   * 新建卷帘效果
   */
  addSideBySide = () => {
    const {
      selectLeftV,
      selectRightV,
      selectSpotLeftV,
      selectSpotRightV
    } = this.state;
    this.addLRLayers(
      selectLeftV,
      selectRightV,
      selectSpotLeftV,
      selectSpotRightV
    );
    //卷帘地图效果
    userconfig.sideBySide = L.control
      .sideBySide(userconfig.leftLayers, userconfig.rightLayers)
      .addTo(map);

    const dom = userconfig.sideBySide.getContainer();
    L.DomEvent.disableClickPropagation(dom); //停止给定事件传播到父元素,这里父元素指地图map
  };
  /*
   * 移除卷帘效果
   */
  removeSideBySide = () => {
    if (userconfig.sideBySide) {
      userconfig.sideBySide.remove();
    }
    //移除地图默认加载底图
    if (userconfig.baseLayer)
      userconfig.baseLayer = this.getBasemapLayer(
        userconfig.baseLayer,
        this.onlineBasemapLayers
      );
    if (map.hasLayer(userconfig.baseLayer))
      map.removeLayer(userconfig.baseLayer);
    //移除地图默认加载叠加图层组;
    if (userconfig.spotWmsLayer) map.removeLayer(userconfig.spotWmsLayer);
    //移除卷帘对比左右边图层列表
    this.removeleftrightLayers();
  };
  /*
   *移除卷帘对比左右边图层列表
   */
  removeleftrightLayers = () => {
    if (userconfig.leftLayers && userconfig.leftLayers.length > 0) {
      for (let i = 0; i < userconfig.leftLayers.length; i++) {
        let layer = userconfig.leftLayers[i];
        if (map.hasLayer(layer)) map.removeLayer(layer);
      }
    }
    if (userconfig.leftLayers && userconfig.rightLayers.length > 0) {
      for (let i = 0; i < userconfig.rightLayers.length; i++) {
        let layer = userconfig.rightLayers[i];
        if (map.hasLayer(layer)) map.removeLayer(layer);
      }
    }
  };
  //左侧历史影像切换事件
  onChangeSelectLeft = v => {
    this.setState({ selectLeftV: v });
    const {
      // selectLeftV,
      selectRightV,
      selectSpotLeftV,
      selectSpotRightV
    } = this.state;
    userconfig.setTopLayer = "imgLayer";
    // const { selectRightV } = this.state;
    this.addLRLayers(v, selectRightV, selectSpotLeftV, selectSpotRightV);
    userconfig.sideBySide.setLeftLayers(userconfig.leftLayers);
    userconfig.sideBySide.setRightLayers(userconfig.rightLayers);
  };
  //左侧历史扰动图斑切换事件
  onChangeSelectSpotLeft = v => {
    this.setState({ selectSpotLeftV: v });
    const {
      selectLeftV,
      selectRightV,
      // selectSpotLeftV,
      selectSpotRightV
    } = this.state;
    userconfig.setTopLayer = "spotLayer";
    // const { selectLeftV } = this.state;
    this.addLRLayers(selectLeftV, selectRightV, v, selectSpotRightV);
    userconfig.sideBySide.setLeftLayers(userconfig.leftLayers);
    userconfig.sideBySide.setRightLayers(userconfig.rightLayers);
  };
  //右侧历史影像切换事件
  onChangeSelectRight = v => {
    this.setState({ selectRightV: v });
    const {
      selectLeftV,
      // selectRightV,
      selectSpotLeftV,
      selectSpotRightV
    } = this.state;
    userconfig.setTopLayer = "imgLayer";
    // const { selectLeftV } = this.state;
    this.addLRLayers(selectLeftV, v, selectSpotLeftV, selectSpotRightV);
    userconfig.sideBySide.setLeftLayers(userconfig.leftLayers);
    userconfig.sideBySide.setRightLayers(userconfig.rightLayers);
  };
  //右侧历史扰动图斑切换事件
  onChangeSelectSpotRight = v => {
    this.setState({ selectSpotRightV: v });
    const {
      selectLeftV,
      selectRightV,
      selectSpotLeftV
      // selectSpotRightV
    } = this.state;
    userconfig.setTopLayer = "spotLayer";
    // const { selectLeftV } = this.state;
    this.addLRLayers(selectLeftV, selectRightV, selectSpotLeftV, v);
    userconfig.sideBySide.setLeftLayers(userconfig.leftLayers);
    userconfig.sideBySide.setRightLayers(userconfig.rightLayers);
  };
  addLRLayers = (
    selectLeftV,
    selectRightV,
    selectSpotLeftV,
    selectSpotRightV
  ) => {
    //清空图层
    this.removeleftrightLayers();
    userconfig.leftLayers = [];
    userconfig.rightLayers = [];
    let leftImgLayer = null;
    let rightImgLayer = null;
    let spotleftwms = null;
    let spotrightwms = null;
    //加载历史影像
    if (selectLeftV && selectRightV) {
      //历史影像存在
      let leftLayerUrl =
        config.imageBaseUrl +
        "/" +
        selectLeftV.replace(/\//g, "-") +
        "/tile/{z}/{y}/{x}";
      leftImgLayer = L.tileLayer(leftLayerUrl, {
        pane: "tileLayerZIndex",
        maxZoom: config.mapInitParams.maxZoom,
        errorTileUrl: config.errorTileUrl
      }); //左侧影像
      map.addLayer(leftImgLayer);
      let rightLayerUrl =
        config.imageBaseUrl +
        "/" +
        selectRightV.replace(/\//g, "-") +
        "/tile/{z}/{y}/{x}";
      rightImgLayer = L.tileLayer(rightLayerUrl, {
        pane: "tileLayerZIndex",
        maxZoom: config.mapInitParams.maxZoom,
        errorTileUrl: config.errorTileUrl
      }); //右侧影像
      map.addLayer(rightImgLayer);
    }
    //加载历史扰动图斑
    if (selectSpotLeftV && selectSpotRightV) {
      if (selectSpotLeftV.indexOf("现状") !== -1) {
        //现状扰动图斑
        spotleftwms = L.tileLayer.wms(config.mapUrl.geoserverUrl + "/wms?", {
          layers: config.mapSpotLayerName, //需要加载的图层
          format: "image/png", //返回的数据格式
          transparent: true,
          maxZoom: config.mapInitParams.maxZoom,
          cql_filter: "archive_time is null and create_type==0"
        });
      } else {
        const leftspotIds = this.getSpotIdsByHistorySpots(
          this.getLimitSpotByTargetDate(selectSpotLeftV)
        );
        //console.log('spotIds',spotIds);
        //历史扰动图斑
        spotleftwms = L.tileLayer.wms(config.mapUrl.geoserverUrl + "/wms?", {
          layers: config.mapSpotLayerName, //需要加载的图层
          format: "image/png", //返回的数据格式
          transparent: true,
          maxZoom: config.mapInitParams.maxZoom,
          cql_filter:
            "spot_id in (" +
            leftspotIds +
            ") and archive_time >= " +
            selectSpotLeftV
        });
      }
      if (selectSpotRightV.indexOf("现状") !== -1) {
        //现状扰动图斑
        spotrightwms = L.tileLayer.wms(config.mapUrl.geoserverUrl + "/wms?", {
          layers: config.mapSpotLayerName, //需要加载的图层
          format: "image/png", //返回的数据格式
          transparent: true,
          maxZoom: config.mapInitParams.maxZoom,
          cql_filter: "archive_time is null and create_type==0"
        });
      } else {
        const rightspotIds = this.getSpotIdsByHistorySpots(
          this.getLimitSpotByTargetDate(selectSpotRightV)
        );
        //历史扰动图斑
        spotrightwms = L.tileLayer.wms(config.mapUrl.geoserverUrl + "/wms?", {
          layers: config.mapSpotLayerName, //需要加载的图层
          format: "image/png", //返回的数据格式
          transparent: true,
          maxZoom: config.mapInitParams.maxZoom,
          cql_filter:
            "spot_id in (" +
            rightspotIds +
            ") and archive_time >= " +
            selectSpotRightV
        });
      }
      map.addLayer(spotleftwms);
      map.addLayer(spotrightwms);
    }

    if (userconfig.setTopLayer === "spotLayer") {
      //历史扰动图斑优先
      userconfig.leftLayers = [leftImgLayer, spotleftwms];
      userconfig.rightLayers = [rightImgLayer, spotrightwms];
    } else {
      //历史影像优先
      userconfig.leftLayers = [spotleftwms, leftImgLayer];
      userconfig.rightLayers = [spotrightwms, rightImgLayer];
    }
  };

  /*
   * 影像列表切换
   */
  onChangeSelectImg = v => {
    this.setState({ selectIMG: v });
    //刷新选择影像列表对应影像
    if (v) {
      this.loadImgLayerByselectIMG(v);
    }
  };
  loadImgLayerByselectIMG = v => {
    //刷新选择影像列表对应影像
    if (v) {
      let leftLayerUrl =
        config.imageBaseUrl + "/" + v.replace(/\//g, "-") + "/tile/{z}/{y}/{x}";
      if (ImgListLayer) {
        map.removeLayer(ImgListLayer);
      }
      ImgListLayer = this.loadMapbaseLayer(map, leftLayerUrl); //影像
    }
  };

  /*
   * 加载地图影像图层
   */
  loadMapbaseLayer = (map, url) => {
    let layer = L.tileLayer(url, {
      pane: "tileLayerZIndex",
      minZoom: config.tdtImageLabel.minZoom,
      maxZoom: config.tdtImageLabel.maxZoom,
      errorTileUrl: config.tdtImageLabel.errorTileUrl
    }).addTo(map); //影像图
    return layer;
  };

  showIMGListMap = () => {
    const { showHistoryIMG, showImageTimeText } = this.state;
    //判断当前底图是否等于监管影像
    if (userconfig.baseLayer._url === config.onlineBasemaps[0].url) {
      // this.setState({ showImageTimeText: true });
      this.setState({
        showImageTimeText: !showImageTimeText
      });
    } else {
      this.setState({ showImageTimeText: false });
    }
    this.setState({
      showHistoryIMG: !showHistoryIMG
    });
    setTimeout(() => {
      if (this.state.showHistoryIMG) {
        //加载当前影像图层
        const { selectIMG } = this.state;
        if (selectIMG) {
          this.loadImgLayerByselectIMG(selectIMG);
        }
        //设置默认底图隐藏
        if (userconfig.baseLayer)
          userconfig.baseLayerr = this.getBasemapLayer(
            userconfig.baseLayer,
            this.onlineBasemapLayers
          );
        userconfig.baseLayer.setOpacity(0);
      } else {
        //移除影像图层
        if (ImgListLayer) {
          map.removeLayer(ImgListLayer);
        }
        //设置默认底图可见
        if (userconfig.baseLayer)
          userconfig.baseLayer = this.getBasemapLayer(
            userconfig.baseLayer,
            this.onlineBasemapLayers
          );
        userconfig.baseLayer.setOpacity(1);
      }
    }, 200);
  };

  switchInterpret = v => {
    console.log(`切换解译期次`, v);
    //userconfig.cql_filter = "archive_time is null";
    userconfig.cql_filter = "create_type==0";
    if (v) {
      const taskLevel = v.split("-")[0];
      let task_level = 3;
      if (taskLevel === "部级") {
        task_level = 0;
      } else if (taskLevel === "省级") {
        task_level = 1;
      } else if (taskLevel === "市级") {
        task_level = 2;
      } else if (taskLevel === "县级") {
        task_level = 3;
      }
      const inter_batch = v.split("-")[1];
      const sql =
        " and inter_batch = " + inter_batch + " and task_level = " + task_level;
      // " and create_type==0";
      userconfig.cql_filter += sql;
    } else {
      userconfig.cql_filter += " and archive_time is null";
    }
    if (userconfig.spotWmsLayer) {
      userconfig.spotWmsLayer.setParams({
        cql_filter: userconfig.cql_filter
      });
    }
  };

  videoMonitorLocation = params => {
    const me = this;
    console.log("视频监控定位", params);
    map.closePopup();
    //视频监控定位
    if (params.pointX && params.pointY) {
      if (marker) marker.remove();

      let latLng = [params.pointY, params.pointX];
      if (map.getZoom() >= config.mapInitParams.zoom) {
        if (latLng) this.automaticToMap(latLng);
      } else {
        map.setZoom(config.mapInitParams.zoom);
        setTimeout(() => {
          if (latLng) this.automaticToMap(latLng);
        }, 500);
      }

      const myIcon = L.icon({
        iconUrl: "./img/camer.png",
        iconSize: [24, 24]
      });
      marker = L.marker([params.pointY, params.pointX], { icon: myIcon })
        .addTo(map)
        .on("click", function(e) {
          //获取AccessToken
          jQuery.ajax({
            type: "POST",
            url: config.url.deviceAccessToken,
            data: {
              appKey: config.url.appKey,
              appSecret: config.url.appSecret
            },
            dataType: "json",
            contentType: "application/x-www-form-urlencoded",
            success: function(data) {
              console.log("获取AccessToken", data);
              data = data.data;
              if (data && data.accessToken) {
                //获取直播地址
                jQuery.ajax({
                  type: "POST",
                  url: config.url.deviceAddress,
                  data: {
                    accessToken: data.accessToken,
                    source: params.deviceSerial + ":1"
                  },
                  dataType: "json",
                  contentType: "application/x-www-form-urlencoded",
                  success: function(data) {
                    console.log("获取设备直播地址", data);
                    data = data.data;
                    if (data && data.length > 0) {
                      const url = data[0].hlsHd;
                      const paramsData = { ...params, url };
                      //不相等的话，则调用后台接口修改url
                      if (params.url !== data[0].hlsHd) {
                        me.videoMonitorCreateUpdate(paramsData);
                      }
                      params.url = url;
                    }
                    //console.log('params.url',params.url);
                    me.openVideoMonitor(params, e.latlng);
                  },
                  error: function(msg) {
                    console.log("error", msg);
                    me.openVideoMonitor(params, e.latlng);
                  }
                });
              }
            },
            error: function(msg) {
              console.log("error", msg);
              me.openVideoMonitor(params, e.latlng);
            }
          });
        });
    } else {
      message.warning("视频监控无可用位置信息", 1);
    }
  };

  videoMonitorCreateUpdate = payload => {
    const { dispatch } = this.props;
    dispatch({
      type: "videoMonitor/videoMonitorCreateUpdate",
      payload,
      callback: (success, error, result) => {
        if (success) {
        }
      }
    });
  };

  openVideoMonitor = (params, latlng) => {
    const me = this;
    jQuery.ajax({
      url: config.url.deviceImgList,
      type: "GET",
      dataType: "json",
      async: true,
      data: { emcd: params.name, size: 16 },
      success: function(data) {
        console.log("success", data);
        data = data.data;
        var vedioPicList = [];
        if (data && data[params.name]) {
          data = data[params.name];
          for (var i = 0; i < data.length; i++) {
            var imgUrl = data[i];
            imgUrl = imgUrl.replace(/\\/g, "/");
            // jQuery("#m_pic").append(
            //   '<img src="' +
            //     imgUrl +
            //     '" height="118" width="118" style="padding-top:2px;padding-right:2px;cursor:pointer;"></img>'
            // );
            // var dom = '<img alt="example" style={{ width: "100%" }} src="'+imgUrl+'" />'
            vedioPicList.push(imgUrl);
          }
          //监听img点击事件
          // jQuery("#m_pic img").on("click", function(e) {
          //   jQuery("#fullImg").attr("src", e.currentTarget.currentSrc);
          //   jQuery("#fullImg").show();
          // });
          // jQuery("#fullImg").on("click", function(e) {
          //   jQuery("#fullImg").hide();
          // });
        } else {
          // jQuery("#m_pic").append(
          //   '<span style="line-height:118px;margin-left:230px;">设备获取图片异常,请联系管理员</span>'
          // );
          vedioPicList.push("./img/error.png");
        }
        me.setState({
          vedioPicList: vedioPicList
        });
      },
      error: function(msg) {
        console.log("error", msg);
      }
    });
    this.setState({
      showVedioPreview: true
    });
    // var content =
    //   '<img id="fullImg" height="100%" width="100%" style="padding:13px;position:absolute;left:0;top:0;z-index:9999;display:none;"></img>';
    // content += '<div id="m_video2" style="width: 600px; height: 400px;"></div>';
    // content += '<div id="m_pic" style="width: 600px; height: 120px;"></div>';
    //map.openPopup(content, latlng, { maxWidth: 1000 });
    if (!params.url || params.url.length === 0) params.url = "testUrl";
    var videoObject = {
      container: "#m_video2", //容器的ID或className
      variable: "player", //播放函数名称
      autoplay: true, //是否自动播放
      loop: true, //是否需要循环播放
      live: true,
      // video: 'rtmp://rtmp01open.ys7.com/openlive/f01018a141094b7fa138b9d0b856507b.hd' //萤石官网测试url
      video: params.url
    };
    // eslint-disable-next-line no-undef
    var player = new ckplayer(videoObject);
  };
  onClick_Img = e => {
    // console.log(e.currentTarget.src);
    if (e.currentTarget && e.currentTarget.src) {
      this.setState({
        showVedioPicPreview: true,
        vedioPicPreviewUrl: e.currentTarget.src
      });
    }
  };

  spotDivide = payload => {
    const { dispatch } = this.props;
    this.setState({ loading: true });
    dispatch({
      type: "spot/spotDivide",
      payload,
      callback: success => {
        this.setState({ loading: false });
        if (success) {
          this.Sidebar.refreshSpotList();
          this.setState({ showClipSpot: false });
          if (clipResultLayer) clipResultLayer.clearLayers();
          this.clearGeojsonLayer();
          clipSpotLayer = null;
          //刷新图斑图层
          if (userconfig.spotWmsLayer) {
            userconfig.spotWmsLayer.setParams({
              cql_filter: userconfig.cql_filter
            });
          }
        }
      }
    });
  };

  render() {
    const radioStyle = {
      display: "block",
      height: "25px",
      lineHeight: "25px"
    };
    const {
      showButton,
      drawType,
      drawState,
      showHistoryContrast,
      showQYJGPanel,
      showXMJGPanel,
      selectLeftV,
      selectSpotLeftV,
      selectSpotRightV,
      selectRightV,
      showPhotoPreview,
      photoPreviewUrl,
      imageTimeText,
      showImageTimeText,
      showHistoryIMG,
      // showProjectSymbol,
      projectSymbolValue,
      showProgress_ZS,
      showProgress_Pie,
      showProgress_ProjectPoint,
      selectIMG,
      showVedioPreview,
      showVedioPicPreview,
      vedioPicPreviewUrl,
      vedioPicList,
      showClipSpot,
      loading
    } = this.state;
    const {
      mapdata: { histories, historiesSpot },
      project: { showProjectBigTable }
    } = this.props;

    return (
      <Layouts>
        <Sidebar
          link={t => (this.Sidebar = t)}
          queryProjectFilter={this.queryProjectFilter}
          switchData={this.switchData}
          mapLocation={this.mapLocation}
          switchInterpret={this.switchInterpret}
          showInspect={v => this.Inspect.show(v)}
          videoMonitorLocation={this.videoMonitorLocation}
          showVideoMonitor={v => this.VideoMonitor.show(v)}
          showExamine={v => this.Examine.show(v)}
          hideExamine={() => this.Examine.hide()}
          showProjectList={v => this.ProjectList.show(v)}
        />
        {showProjectBigTable ? (
          <ProjectList
            link={t => (this.ProjectList = t)}
            showProjectDetail={v => this.Sidebar.showProjectDetail(v)}
          />
        ) : null}

        <SidebarDetail mapLocation={this.mapLocation} />
        <Tool link={t => (this.Tool = t)} />
        <Chart link={t => (this.Chart = t)} />
        <Query
          queryInfo={v => {
            this.Sidebar.queryInfo(v);
            this.Tool.queryInfo(v);
            this.Chart.queryInfo(v);
          }}
          queryReset={() => this.ProjectList.queryReset()}
        />
        <Sparse />
        <Panorama />
        <VideoMonitor link={t => (this.VideoMonitor = t)} />
        <Examine link={t => (this.Examine = t)} />
        <ProjectDetail />
        <Inspect link={t => (this.Inspect = t)} />
        <ProblemPoint />
        <MeasurePoint />
        <HistoryPlay />
        <Contrast />
        <div
          ref={this.saveRef}
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
          {/* 视频监控图片轮播 */}
          <Modal
            visi  
            
            
            ble={showVedioPreview}
            footer={null}
            width={660}
            onCancel={() => {
              this.setState({ showVedioPreview: false });
            }}
          >
            <div id="videoMoitor" style={{ width: 600 }}>
              <div id="m_video2" style={{ width: 600, height: 400 }}></div>
              {/* <div id="m_pic" style={{width:600,height:120}}></div> */}
              <Carousel autoplay>
                {vedioPicList.map((item, id) => {
                  // console.log(item)
                  return (
                    <div key={id}>
                      <img
                        onClick={this.onClick_Img}
                        alt="example"
                        style={{ width: "100%" }}
                        src={item}
                      />
                    </div>
                  );
                })}
              </Carousel>
            </div>
          </Modal>
          {/* 视频监控图片放大预览 */}
          <Modal
            visible={showVedioPicPreview}
            footer={null}
            // width={660}
            width={"70%"}
            height={"70%"}
            onCancel={() => {
              this.setState({ showVedioPicPreview: false });
            }}
          >
            <img
              alt="example"
              style={{ width: "100%" }}
              src={vedioPicPreviewUrl}
            />
          </Modal>
          {/* 项目监管请求后台接口进度条 */}
          <div
            style={{
              display: showProgress_ZS ? "block" : "none",
              position: "absolute",
              bottom: 14,
              right: 400,
              zIndex: 1000
            }}
          >
            <img alt="loading1.gif" src="./img/loading1.gif" />
          </div>
          <div
            style={{
              display: showProgress_Pie ? "block" : "none",
              position: "absolute",
              bottom: 14,
              right: 450,
              zIndex: 1000
            }}
          >
            <img alt="loading1.gif" src="./img/loading1.gif" />
          </div>
          <div
            style={{
              display: showProgress_ProjectPoint ? "block" : "none",
              position: "absolute",
              bottom: 14,
              right: 500,
              zIndex: 1000
            }}
          >
            <img alt="loading1.gif" src="./img/loading1.gif" />
          </div>
          {/* 监管影像时间显示信息 */}
          <div
            style={{
              display: showImageTimeText ? "block" : "none",
              position: "absolute",
              bottom: 5,
              right: 150,
              zIndex: 1000,
              background: "#fff"
            }}
          >
            <span
              style={{
                padding: "0 10px"
              }}
            >
              监管影像时间:{imageTimeText}
            </span>
          </div>
          {/*历史监管影像时间轴控件信息 */}
          <div
            style={{
              display: showHistoryIMG ? "block" : "none",
              position: "absolute",
              // bottom: 5,
              // left: 360,
              top: 58,
              right: 240,
              zIndex: 1000,
              background: "#fff"
            }}
          >
            <span
              style={{
                padding: "0 10px"
              }}
            >
              历史影像:
            </span>
            <Select
              value={[selectIMG]}
              placeholder="请选择"
              onChange={this.onChangeSelectImg}
              style={{
                width: 150
              }}
            >
              {histories.map((item, id) => (
                <Select.Option key={id + "first"} value={item}>
                  {item}
                </Select.Option>
              ))}
            </Select>
          </div>
          {/* 照片预览*/}
          <Modal
            // height={"100vh"}
            visible={showPhotoPreview}
            footer={null}
            onCancel={() => {
              this.setState({ showPhotoPreview: false });
            }}
          >
            <img
              alt="example"
              style={{ width: "100%" }}
              src={photoPreviewUrl}
            />
          </Modal>
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
                drawType === "screenshot"
                  ? this.cancelScreenshot
                  : drawState === "edit"
                  ? this.cancelEditGraphic
                  : this.cancelAddGraphic
              }
            />
            <Popover content={"第二步：填写属性信息"}>
              <Button
                icon="arrow-right"
                onClick={
                  drawType === "screenshot"
                    ? this.saveScreenshot
                    : drawState === "edit"
                    ? this.saveEditGraphic
                    : this.saveAddGraphic
                }
              />
            </Popover>
          </div>
          {/* 分割图斑面板 */}
          <div
            style={{
              display: showClipSpot ? "block" : "none",
              position: "absolute",
              top: 65,
              right: 240,
              zIndex: 1000
            }}
          >
            <Button
              icon="rollback"
              onClick={() => {
                this.cancelClipGraphic();
              }}
            />
            <Button
              icon="arrow-right"
              onClick={() => {
                this.saveClipGraphic();
              }}
            />
          </div>
          {/*图标联动按钮 */}
          <div
            style={{
              position: "absolute",
              display: showQYJGPanel ? "block" : "none",
              top: 65,
              right: 120,
              height: 0,
              zIndex: 999,
              background: "transparent"
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
                this.setState({ chartStatus: v });
                console.log(v, e);
                let polygon = "";
                if (map.getZoom() >= config.mapInitParams.zoom) {
                  let bounds = map.getBounds();
                  polygon = "polygon((";
                  polygon +=
                    bounds.getSouthWest().lng +
                    " " +
                    bounds.getSouthWest().lat +
                    ",";
                  polygon +=
                    bounds.getSouthWest().lng +
                    " " +
                    bounds.getNorthEast().lat +
                    ",";
                  polygon +=
                    bounds.getNorthEast().lng +
                    " " +
                    bounds.getNorthEast().lat +
                    ",";
                  polygon +=
                    bounds.getNorthEast().lng +
                    " " +
                    bounds.getSouthWest().lat +
                    ",";
                  polygon +=
                    bounds.getSouthWest().lng + " " + bounds.getSouthWest().lat;
                  polygon += "))";
                  emitter.emit("chartLinkage", {
                    open: v,
                    type: "spot",
                    polygon: v ? polygon : ""
                  });
                }
              }}
            />
          </div>
          {/* 图例说明、历史对比 */}
          <div
            style={{
              display: showQYJGPanel ? "block" : "none",
              position: "absolute",
              bottom: 40,
              right: 20,
              zIndex: 400,
              background: "#fff"
            }}
          >
            <Popover content="历史影像" title="" trigger="hover">
              <Button
                // icon="ordered-list"
                icon="dash"
                onClick={() => {
                  this.showIMGListMap();
                }}
              />
            </Popover>
            <br />
            <Popover content="地图分屏" title="" trigger="hover">
              <Button
                icon="column-width"
                onClick={() => {
                  const center = map.getCenter();
                  const zoom = map.getZoom();
                  //console.log(center,zoom);
                  emitter.emit("showContrast", {
                    show: true,
                    center: center,
                    zoom: zoom,
                    isGetInfoByExtent: userconfig.zoom === zoom
                  });
                }}
              />
            </Popover>
            <br />
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
              zIndex: 1000,
              background: "#fff"
            }}
          >
            {/* 左侧历史影像切换 */}
            <span
              style={{
                padding: "0 10px",
                display: "none"
              }}
            >
              影像:
            </span>
            <Select
              value={[selectLeftV]}
              placeholder="请选择"
              onChange={this.onChangeSelectLeft}
              style={{
                width: 150,
                display: "none"
              }}
            >
              {histories.map((item, id) => (
                <Select.Option key={id + "second"} value={item}>
                  {item}
                </Select.Option>
              ))}
            </Select>
            {/* 左侧扰动图斑切换 */}
            <span
              style={{
                marginLeft: 10,
                padding: "0 10px"
              }}
            >
              图斑:
            </span>
            <Select
              value={[selectSpotLeftV]}
              placeholder="请选择"
              onChange={this.onChangeSelectSpotLeft}
              style={{
                width: 150
              }}
            >
              {historiesSpot.map((item, id) => (
                <Select.Option key={id + "spotFirst"} value={item.value}>
                  {item.id}
                </Select.Option>
              ))}
            </Select>
          </div>
          <div
            style={{
              display: showHistoryContrast ? "block" : "none",
              position: "absolute",
              top: 65,
              right: 240,
              zIndex: 1000,
              background: "#fff"
            }}
          >
            {/* 右侧历史影像切换 */}
            <span
              style={{
                padding: "0 10px",
                display: "none"
              }}
            >
              影像:
            </span>
            <Select
              value={[selectRightV]}
              placeholder="请选择"
              onChange={this.onChangeSelectRight}
              style={{
                width: 150,
                display: "none"
              }}
            >
              {histories.map((item, id) => (
                <Select.Option key={id + "three"} value={item}>
                  {item}
                </Select.Option>
              ))}
            </Select>
            {/*右侧扰动图斑切换 */}
            <span
              style={{
                marginLeft: 10,
                padding: "0 10px"
              }}
            >
              图斑:
            </span>
            <Select
              value={[selectSpotRightV]}
              placeholder="请选择"
              onChange={this.onChangeSelectSpotRight}
              style={{
                width: 150
              }}
            >
              {historiesSpot.map((item, id) => (
                <Select.Option key={id + "spotSecond"} value={item.value}>
                  {item.id}
                </Select.Option>
              ))}
            </Select>
          </div>
          {/* 项目监管 图例说明 */}
          <div
            style={{
              display: showXMJGPanel ? "block" : "none",
              position: "absolute",
              bottom: 40,
              right: 20,
              zIndex: 1000,
              background: "#fff"
            }}
          >
            <Popover content="历史影像" title="" trigger="hover">
              <Button
                // icon="ordered-list"
                icon="dash"
                onClick={() => {
                  this.showIMGListMap();
                }}
              />
            </Popover>
            <br />
            <Popover
              content={
                <div>
                  <Radio.Group
                    onChange={this.onChangeProjectSymbol}
                    value={projectSymbolValue}
                  >
                    <Radio style={radioStyle} value={"项目总数"}>
                      项目总数
                    </Radio>
                    <Radio style={radioStyle} value={"立项级别"}>
                      立项级别
                    </Radio>
                    <Radio style={radioStyle} value={"合规性"}>
                      合规性
                    </Radio>
                    <Radio style={radioStyle} value={"项目类别"}>
                      项目类别
                    </Radio>
                    <Radio style={radioStyle} value={"项目性质"}>
                      项目性质
                    </Radio>
                    <Radio style={radioStyle} value={"建设状态"}>
                      建设状态
                    </Radio>
                    {/* <Radio style={radioStyle} value={'矢量化类型'}>
                      矢量化类型
                    </Radio> */}
                  </Radio.Group>
                </div>
              }
              title=""
              trigger="hover"
            >
              <Button icon="bars" />
            </Popover>
            <br />
            <Popover
              content={
                <div
                  style={{
                    width: 80,
                    height: 210
                  }}
                >
                  {config.legend_xmjg.map((item, index) => (
                    <p key={index}>
                      <img alt={item.imgUrl} src={item.imgUrl} />
                      <span>{item.title}</span>
                    </p>
                  ))}
                </div>
              }
              title=""
              trigger="hover"
            >
              <Button icon="environment" />
            </Popover>
          </div>
        </div>
        <Spins show={loading} />
      </Layouts>
    );
  }
}
