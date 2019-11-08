import React, { PureComponent } from "react";
import { connect } from "dva";
import { Select, Popover, Button, message } from "antd";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import proj4 from "proj4";
import * as turf from "@turf/turf";
import config from "../../../config";
import jQuery from "jquery";
// import { Link } from "dva/router";
// import Layouts from "../../../components/Layouts";
import emitter from "../../../utils/event";
// import { relativeTimeThreshold } from "moment";

let contrastconfig = {};
@connect(({ user, mapdata, project, spot }) => ({
  user,
  mapdata,
  project,
  spot
}))
export default class splitScreen extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      show: false,
      selectLeftV: "",
      selectRightV: "",
      selectSpotLeftV: "",
      selectSpotRightV: ""
    };
    this.map = null;
    this.isload = false;
    this.saveRef = v => {
      this.refDom = v;
    };
  }
  componentDidMount() {
    const me = this;
    this.eventEmitter = emitter.addListener("showContrast", v => {
      this.setState({ show: v.show });
      if(!this.isload){
        me.props.dispatch({
          type: "mapdata/GetBoundAsync",
          callback: boundary => {
            contrastconfig.geojson = JSON.parse(boundary.result);
            this.isload = true;
            // 创建地图
            me.createMap(v.center,v.zoom,v.isGetInfoByExtent); 
          }
        });
      }
      else{
        setTimeout(() => {
          contrastconfig.LMap.setView(v.center,v.zoom);
          contrastconfig.RMap.setView(v.center,v.zoom);
        }, 500);        
      }
    });
    //防止切换元素dom触发地图点击事件
    const leftel = document.getElementById('leftDIV');
    L.DomEvent.disableClickPropagation(leftel);
    /*L.DomEvent.addListener(leftel, 'dblclick', L.DomEvent.stop);
    L.DomEvent.addListener(leftel, 'mousedown', L.DomEvent.stop);
    L.DomEvent.addListener(leftel, 'mouseup', L.DomEvent.stop);
    L.DomEvent.addListener(leftel, 'click', function (e) {
      //e.stopPropagation();
      // L.DomEvent.preventDefault(e);
      // L.DomEvent.stopPropagation(e);
      // L.DomEvent.stop(e);
      //L.DomEvent.disableClickPropagation(leftel);
    });*/
    const rightel = document.getElementById('rightDIV');
    L.DomEvent.disableClickPropagation(rightel);//停止给定事件传播到父元素,这里父元素指地图map
    /*L.DomEvent.addListener(rightel, 'dblclick', L.DomEvent.stop);
    L.DomEvent.addListener(rightel, 'mousedown', L.DomEvent.stop);
    L.DomEvent.addListener(rightel, 'mouseup', L.DomEvent.stop);
    L.DomEvent.addListener(rightel, 'click', function (e) {
      //e.stopPropagation();
      // L.DomEvent.preventDefault(e);
      // L.DomEvent.stopPropagation(e);
      // L.DomEvent.stop(e);
      //L.DomEvent.disableClickPropagation(rightel);
    });*/


  }
  // 创建地图
  createMap = (center,zoom,isGetInfoByExtent) => {
    const me = this;
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
      iconUrl: require("leaflet/dist/images/marker-icon.png"),
      shadowUrl: require("leaflet/dist/images/marker-shadow.png")
    });
    contrastconfig.LMap = L.map("LMap", {
      zoomControl: false,
      attributionControl: false
    });
    //地图缩放控件
    L.control
      .zoom({ zoomInTitle: "放大", zoomOutTitle: "缩小", position: "topleft" })
      .addTo(contrastconfig.LMap);
      contrastconfig.RMap = L.map("RMap", {
      zoomControl: false,
      attributionControl: false
    });
    //地图缩放控件
    L.control
      .zoom({ zoomInTitle: "放大", zoomOutTitle: "缩小", position: "topright" })
      .addTo(contrastconfig.RMap);
    //获取项目区域范围
    me.getRegionGeometry(center,zoom,isGetInfoByExtent);
  };
  /*
   *地图鼠标移动监听事件
   */
  onMoveMap = e => {
    if (contrastconfig.marker) contrastconfig.marker.remove();
    let myIcon = L.icon({
      iconUrl: "./img/hand_pointer.png",
      iconSize: [17, 23]
    });
    if (e.target._container.id === "LMap") {
      //操作右侧地图
      contrastconfig.marker = L.marker(e.latlng, { icon: myIcon }).addTo(
        contrastconfig.RMap
      );
    } else {
      //操作左侧地图
      contrastconfig.marker = L.marker(e.latlng, { icon: myIcon }).addTo(
        contrastconfig.LMap
      );
    }
  };
  /*
   *地图点击事件
   */
  onClickMap = e => {
    const me = this;
    if (e.target._container.id === "LMap") {
      //左侧地图
      contrastconfig.map = contrastconfig.LMap;
    } else {
      //右侧地图
      contrastconfig.map = contrastconfig.RMap;
    }
    contrastconfig.LMap.closePopup();
    contrastconfig.RMap.closePopup();
    me.clearGeojsonLayer();
    let turfpoint = turf.point([e.latlng.lng, e.latlng.lat]);
    if (!turf.booleanPointInPolygon(turfpoint, contrastconfig.polygon)) {
      message.warning("区域范围之外的数据没有权限操作", 1);
      return;
    }
    contrastconfig.mapPoint = e.latlng;
    //点查WMS图层
    const point = { x: e.latlng.lng, y: e.latlng.lat };
    //普通点查
    const LayersName = config.mapLayersName; //扰动图斑、项目红线勾选
    me.queryWFSServiceByPoint(
      point,
      LayersName,
      me.callbackPointQueryWFSService
    );
  };
  /*
   * 获取气泡窗口内容
   */
  getWinContent = (properties, callback) => {
    this.creatElements(properties, callback);
  };
  creatElements = (properties, callback) => {
    const elements = properties.map_num
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
          }</div>`
        )
      : jQuery(`<div>项目:${properties.project_name}</br></div>`);
    callback(elements);
  };

  // 点选查询回调函数
  callbackPointQueryWFSService = data => {
    const me = this;
    if (data.success) {
      data = data.result;
      me.clearGeojsonLayer();
      const style = {
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
            // eslint-disable-next-line no-loop-func
            me.getWinContent(feature.properties, data => {
              content += data[0].innerHTML;
            });
          } else {
            // eslint-disable-next-line no-loop-func
            me.getWinContent(feature.properties, data => {
              content += data[0].innerHTML + "<br>";
            });
          }
        }
        if (contrastconfig.map.getZoom() < config.mapInitParams.zoom) {
          contrastconfig.map.fitBounds(contrastconfig.projectgeojsonLayer.getBounds(), {
            maxZoom: config.mapInitParams.zoom
          });
        }
        contrastconfig.map.openPopup(content, contrastconfig.mapPoint);
      } else {
        contrastconfig.map.closePopup();
      }
    } else {
      message.warning("地图匹配不到相关数据", 1);
      contrastconfig.map.closePopup();
    }
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
    const urlString = config.mapUrl.geoserverQueryUrl + "/ows";
    const param = {
      service: "WFS",
      version: "1.0.0",
      request: "GetFeature",
      typeName: typeName,
      outputFormat: "application/json",
      //maxFeatures: 100,
      filter: filter
      //srsName: epsg
    };
    const geojsonUrl = urlString + L.Util.getParamString(param, urlString);
    me.props.dispatch({
      type: "mapdata/queryWFSLayer",
      payload: { geojsonUrl },
      callback: callback
    });
  };
  /*
   * 绘制图形函数
   */
  loadGeojsonLayer = (geojson, style) => {
    contrastconfig.projectgeojsonLayer = L.Proj.geoJson(geojson, {
      style: style
    }).addTo(contrastconfig.map);
  };
  /*
   * 清空绘制图形函数
   */
  clearGeojsonLayer = () => {
    if (contrastconfig.projectgeojsonLayer) {
      contrastconfig.projectgeojsonLayer.clearLayers();
      contrastconfig.map.removeLayer(contrastconfig.projectgeojsonLayer);
      contrastconfig.projectgeojsonLayer = null;
    }
  };
  /*
   *获取项目区域范围
   */
  getRegionGeometry = (mapcenter,mapzoom,isGetInfoByExtent) => {
    const me = this;
    //调用后台接口形式改造
    let geojson = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: {
            type: "MultiPolygon",
            coordinates: contrastconfig.geojson.coordinates
          }
        }
      ]
    };
    contrastconfig.geojson = geojson;
    //加载地图geoJsonLayer图层
    me.loadMapgeoJsonLayer(contrastconfig.LMap);
    me.loadMapgeoJsonLayer(contrastconfig.RMap);
    //加载影像底图
    contrastconfig.leftImgLayer = me.loadMapbaseLayer(
      contrastconfig.LMap,
      config.onlineBasemaps[0].url
    );
    if(!contrastconfig.LMap.hasLayer(contrastconfig.leftImgLayer)){
      contrastconfig.LMap.addLayer(contrastconfig.leftImgLayer);
    }
    contrastconfig.rightImgLayer = me.loadMapbaseLayer(
      contrastconfig.RMap,
      config.onlineBasemaps[0].url
    );
    if(!contrastconfig.RMap.hasLayer(contrastconfig.rightImgLayer)){
      contrastconfig.RMap.addLayer(contrastconfig.rightImgLayer);
    }
    //构造面
    contrastconfig.polygon = turf.multiPolygon(
      geojson.features[0].geometry.coordinates
    );
    setTimeout(() => {
      contrastconfig.zoom = contrastconfig.LMap.getZoom() + 1;
      //加载geoserver发布的WMS地图服务
      me.overlayWMSLayers(contrastconfig.LMap);
      me.overlayWMSLayers(contrastconfig.RMap);
      //地图模态层效果
      me.loadmodalLayer();
      setTimeout(() => {
        //监听地图移动完成事件
        contrastconfig.maps = [contrastconfig.LMap, contrastconfig.RMap];
        // eslint-disable-next-line array-callback-return
        contrastconfig.maps.map(function(t) {
          // console.log(t);
          t.on({ drag: maplink, zoom: maplink });
        }); //地图联动实现
        function maplink(e) {
          var _this = this;
          // console.log(e);
          let zoom = e.target.getZoom();
          let bounds = e.target.getBounds();
          me.getInfoByExtent(zoom, bounds, me.callbackGetInfoByExtent, false);
          // eslint-disable-next-line array-callback-return
          contrastconfig.maps.map(function(t) {
            t.setView(_this.getCenter(), _this.getZoom());
          });
        }
        //监听地图移动事件
        contrastconfig.LMap.on("mousemove", me.onMoveMap);
        //监听地图移动事件
        contrastconfig.RMap.on("mousemove", me.onMoveMap);
        //监听地图点击事件
        contrastconfig.LMap.on("click", me.onClickMap);
        //监听地图点击事件
        contrastconfig.RMap.on("click", me.onClickMap);
        contrastconfig.LMap.setView(mapcenter,mapzoom);
        contrastconfig.RMap.setView(mapcenter,mapzoom);
        //根据地图当前范围获取对应历史影像数据
        if(isGetInfoByExtent){
          let zoom = contrastconfig.LMap.getZoom();
          let bounds = contrastconfig.LMap.getBounds();
          me.getInfoByExtent(zoom, bounds, me.callbackGetInfoByExtent, true);
        }
        // let point = contrastconfig.LMap.latLngToContainerPoint(mapcenter);
        // point.x =point.x - 0.00001;
        // point.y = point.y - 0.00001;
        // contrastconfig.LMap.panBy(point);
        // contrastconfig.RMap.panBy(point);
        // let point = mapcenter;
        // point.lat = point.lat - 0.00001;
        // point.lng = point.lng - 0.00001; 
        // contrastconfig.LMap.panTo(point);
        // contrastconfig.RMap.panTo(point);
      }, 500);
    }, 500);
  };
  /*
   * 加载地图geoJsonLayer图层
   */
  loadMapbaseLayer = (map, url) => {
    map.createPane("tileLayerZIndex");
    map.getPane("tileLayerZIndex").style.zIndex = 0;
    let layer = L.tileLayer(url, {
      pane: "tileLayerZIndex",
      maxZoom: config.mapInitParams.maxZoom,
      errorTileUrl:config.errorTileUrl
    // }).addTo(map); //影像图
    }); //影像图
    return layer;
  };
  /*
   * 加载地图geoJsonLayer图层
   */
  loadMapgeoJsonLayer = map => {
    // L.Proj.GeoJSON继承于L.GeoJSON，可调样式
    map.createPane("geoJsonZIndex");
    map.getPane("geoJsonZIndex").style.zIndex = 1;
    contrastconfig.geoJsonLayer = L.Proj.geoJson(contrastconfig.geojson, {
      style: {
        color: "#0070FF",
        weight: 3,
        opacity: 1,
        //"fillColor":"",
        fillOpacity: 0
      },
      pane: "geoJsonZIndex"
    }).addTo(map);
    let bounds = contrastconfig.geoJsonLayer.getBounds();
    map.fitBounds(bounds);
  };
  /*
   * 加载geoserver发布的WMS地图服务
   */
  overlayWMSLayers = map => {
    let bounds = contrastconfig.geoJsonLayer.getBounds();
    map.setMaxBounds(bounds);
    map.setMinZoom(contrastconfig.zoom);
    //加载项目红线图层wms
    L.tileLayer
      .wms(config.mapUrl.geoserverUrl + "/wms?", {
        layers: config.mapProjectLayerName, //需要加载的图层
        format: "image/png", //返回的数据格式
        transparent: true,
        maxZoom: config.mapInitParams.maxZoom
      })
      .addTo(map);
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
    let modalJson = turf.difference(boundGeo, contrastconfig.polygon);
    let lLayer = L.Proj.geoJson(modalJson, {
      style: {
        color: "#0070FF",
        weight: 3,
        opacity: 1,
        fillColor: "rgba(0, 0, 0, 0.45)",
        fillOpacity: 1
      }
    }).addTo(contrastconfig.LMap);
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
    }).addTo(contrastconfig.RMap);
    jQuery(rLayer.getPane())
      .find("path")
      .css({
        cursor: "not-allowed"
      });
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
    contrastconfig.isLoadSideBySide = isLoadSideBySide;
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
  /*空间范围查询图层
   *@method queryWFSServiceByExtent
   *@return null
   */
  queryWFSServiceByExtent = (typeName, callback) => {
    const me = this;
    let bounds = contrastconfig.LMap.getBounds();
    let polygon = bounds.getSouthWest().lng + "," + bounds.getSouthWest().lat;
    polygon +=
      " " + bounds.getSouthWest().lng + "," + bounds.getNorthEast().lat;
    polygon +=
      " " + bounds.getNorthEast().lng + "," + bounds.getNorthEast().lat;
    polygon +=
      " " + bounds.getNorthEast().lng + "," + bounds.getSouthWest().lat;
    polygon +=
      " " + bounds.getSouthWest().lng + "," + bounds.getSouthWest().lat;

    let filter =
      '<Filter xmlns="http://www.opengis.net/ogc" xmlns:gml="http://www.opengis.net/gml">';
    filter += '<And>';
    filter += '<Intersects>';
    filter += '<PropertyName>geom</PropertyName>';
    filter += '<gml:Polygon>';
    filter += '<gml:outerBoundaryIs>';
    filter += '<gml:LinearRing>';
    filter += '<gml:coordinates>' + polygon + '</gml:coordinates>';
    filter += '</gml:LinearRing>';
    filter += '</gml:outerBoundaryIs>';
    filter += '</gml:Polygon>';
    filter += '</Intersects>';
    filter += '<Not>';
    filter += '<PropertyIsNull>';
    filter += '<PropertyName>archive_time</PropertyName>';
    filter += '</PropertyIsNull>';
    filter += '</Not>';
    filter += '</And>';
    filter += '</Filter>';    
    // let urlString = config.mapUrl.geoserverUrl + "/ows";
    let urlString = config.mapUrl.geoserverQueryUrl + '/ows';
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
  /*
   * 根据地图当前范围获取对应历史影像数据回调函数
   */
  callbackGetInfoByExtent = data => {
    if (
      contrastconfig.isLoadSideBySide ||
      contrastconfig.sideBySideZoom !== contrastconfig.LMap.getZoom()
    ) {
      this.setState({ selectLeftV: data[0] });
      this.setState({ selectRightV: data[0] });
      contrastconfig.sideBySideZoom = contrastconfig.LMap.getZoom();
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
    this.setState({ selectSpotLeftV: data[0].value });
    this.setState({ selectSpotRightV: data[0].value });
    //移除左右地图的图层列表
    this.removeLMapLayers();
    this.removeRMapLayers();
    setTimeout(() => {
      //新建左右地图的图层列表
      this.addLMapLayers();
      this.addRMapLayers();
    }, 200);
  };

    /*
   * 匹配选择下拉框日期最接近的历史图斑数据
   */
  getLimitSpotByTargetDate = (strDate) => {
    const {
      mapdata: { historiesSpotProperties }
    } = this.props;
    //console.log('历史扰动图斑数据',historiesSpotProperties);
    var arrDate = [];
    var historiesSpotData = [];
    var targetDate = this.strToDate(strDate.split("T")[0]);
    for(var i = 0; i<historiesSpotProperties.length;i++){
       var imageDate = historiesSpotProperties[i].archive_time;
       arrDate.push(this.strToDate(imageDate.split("T")[0]));
    }
    var len = arrDate.length;
    for(var j = 0; j<len;j++){
      var date = this.limitDateIndex(arrDate,targetDate).date;
      var index = this.limitDateIndex(arrDate,targetDate).index;
      // eslint-disable-next-line no-loop-func
      historiesSpotProperties.forEach(item=>{
        if(date === this.strToDate(item.archive_time.split("T")[0]) && JSON.stringify(historiesSpotData).indexOf(JSON.stringify(item.spot_id))===-1){
          historiesSpotData.push(item); // 进行动态的操作
        }
      })
      arrDate.splice(index,1);
    }
    //console.log('匹配日期数组最接近目标日期值',historiesSpotData);
    const targethistoriesSpotData =  this.greaterOrEqualDates(historiesSpotData,targetDate);
    //console.log('匹配最终目标历史图斑数组值',targethistoriesSpotData);
    return targethistoriesSpotData;   
  }
  /*
   * 根据过滤后的历史图斑数组,动态拼接图斑id字符串
  */
  getSpotIdsByHistorySpots = (historySpots) => {
    var spotIds =  "";
    if(historySpots && historySpots.length>0){
      var len = historySpots.length;
      for(var i = 0; i<len; i++){
          var data = historySpots[i];
          if (i === len - 1) {
            // spotIds += "'" + data.spot_id + "'";
            spotIds += data.spot_id;
          }
          else {
            // spotIds += "'" + data.spot_id  + "',";
            spotIds += data.spot_id  + ",";
          }
      }
    }
    return spotIds;
  }
  /*
   * 字符串格式日期转换Date
   */
  strToDate = (strDate) => {
    var OneMonth = strDate.substring(5, strDate.lastIndexOf("-"));
    var OneDay = strDate.substring(strDate.length, strDate.lastIndexOf("-") + 1);
    var OneYear = strDate.substring(0, strDate.indexOf("-"));
    return Date.parse(OneMonth + "/" + OneDay + "/" + OneYear);
  }
  /*
   * 匹配日期数组最接近目标日期的日期索引以及数据
   */
  limitDateIndex = (arrDate, targetDate) => {
    var newArr = [];
    // eslint-disable-next-line array-callback-return
    arrDate.map(function(x){
      // 对数组各个数值求差值
      newArr.push(Math.abs(x - targetDate));
    });
    // 求最小值的索引
    var index = newArr.indexOf(Math.min.apply(null, newArr));
    // return index;
    return {index:index,date:arrDate[index]};
  }
  /*
   * 匹配大于或者等于目标日期的数组值
   */
  greaterOrEqualDates = (historiesSpotData, targetDate) => {
    const me = this;
    var newArr = [];
    // eslint-disable-next-line array-callback-return
    historiesSpotData.map(function(x){      
      if(me.strToDate(x.archive_time.split("T")[0]) >= targetDate){
        newArr.push(x);       
      }
    });
    return newArr;
  }
  
  /*
   * 移除左地图的图层列表
   */
  removeLMapLayers = () => {
    if (contrastconfig.leftImgLayer && contrastconfig.LMap.hasLayer(contrastconfig.leftImgLayer)){
      contrastconfig.LMap.removeLayer(contrastconfig.leftImgLayer);
    }
    if (contrastconfig.leftSpotLayer && contrastconfig.LMap.hasLayer(contrastconfig.leftSpotLayer)){
      contrastconfig.LMap.removeLayer(contrastconfig.leftSpotLayer);
    }

  };
  /*
   * 移除右地图的图层列表
   */
  removeRMapLayers = () => {
    if (contrastconfig.rightImgLayer && contrastconfig.RMap.hasLayer(contrastconfig.rightImgLayer)){
      contrastconfig.RMap.removeLayer(contrastconfig.rightImgLayer);
    }
    if (contrastconfig.rightSpotLayer && contrastconfig.RMap.hasLayer(contrastconfig.rightSpotLayer)){
      contrastconfig.RMap.removeLayer(contrastconfig.rightSpotLayer);
    }

  };
  /*
   * 新建左地图的图层列表
   */
  addLMapLayers = () => {
    const { selectLeftV, selectSpotLeftV } = this.state;
    if (selectLeftV) {
      let leftLayerUrl =
        config.imageBaseUrl +
        "/" +
        selectLeftV.replace(/\//g, "-") +
        "/tile/{z}/{y}/{x}";
        contrastconfig.leftImgLayer = this.loadMapbaseLayer(
          contrastconfig.LMap,
        leftLayerUrl
      ); //左侧影像
      if(!contrastconfig.LMap.hasLayer(contrastconfig.leftImgLayer)){
        contrastconfig.LMap.addLayer(contrastconfig.leftImgLayer);
      }
    }
    //加载历史扰动图斑
    contrastconfig.leftSpotLayer = null;
    if (selectSpotLeftV) {
      if (selectSpotLeftV.indexOf("现状") !== -1) {
        //现状扰动图斑
        contrastconfig.leftSpotLayer = L.tileLayer.wms(
          config.mapUrl.geoserverUrl + "/wms?",
          {
            layers: config.mapSpotLayerName, //需要加载的图层
            format: "image/png", //返回的数据格式
            transparent: true,
            maxZoom: config.mapInitParams.maxZoom,
            cql_filter: 'archive_time is null'
          }
        );
      } else {
        const leftspotIds = this.getSpotIdsByHistorySpots(this.getLimitSpotByTargetDate(selectSpotLeftV));
        //console.log('leftspotIds',leftspotIds);
        //历史扰动图斑
        contrastconfig.leftSpotLayer = L.tileLayer.wms(
          config.mapUrl.geoserverUrl + "/wms?",
          {
            layers: config.mapSpotLayerName, //需要加载的图层
            format: "image/png", //返回的数据格式
            transparent: true,
            maxZoom: config.mapInitParams.maxZoom,
            // cql_filter: "archive_time >= " + selectSpotLeftV
            cql_filter: "spot_id in ("+leftspotIds+") and archive_time >= " + selectSpotLeftV
          }
        );
      }
      //contrastconfig.LMap.addLayer(contrastconfig.leftSpotLayer);
      if(!contrastconfig.LMap.hasLayer(contrastconfig.leftSpotLayer)){
        contrastconfig.LMap.addLayer(contrastconfig.leftSpotLayer);
      }
    }
  };
  /*
   * 新建右地图的图层列表
   */
  addRMapLayers = () => {
    const { selectRightV, selectSpotRightV } = this.state;
    if (selectRightV) {
      let rightLayerUrl =
        config.imageBaseUrl +
        "/" +
        selectRightV.replace(/\//g, "-") +
        "/tile/{z}/{y}/{x}";
        contrastconfig.rightImgLayer = this.loadMapbaseLayer(
        contrastconfig.RMap,
        rightLayerUrl
      ); //右侧影像
      if(!contrastconfig.RMap.hasLayer(contrastconfig.rightImgLayer)){
        contrastconfig.RMap.addLayer(contrastconfig.rightImgLayer);
      }
    }
    //加载历史扰动图斑
    contrastconfig.rightSpotLayer = null;
    if (selectSpotRightV) {
      if (selectSpotRightV.indexOf("现状") !== -1) {
        //现状扰动图斑
        contrastconfig.rightSpotLayer = L.tileLayer.wms(
          config.mapUrl.geoserverUrl + "/wms?",
          {
            layers: config.mapSpotLayerName, //需要加载的图层
            format: "image/png", //返回的数据格式
            transparent: true,
            maxZoom: config.mapInitParams.maxZoom,
            cql_filter: 'archive_time is null'
          }
        );
      } else {
        const rightspotIds = this.getSpotIdsByHistorySpots(this.getLimitSpotByTargetDate(selectSpotRightV));
        //历史扰动图斑
        contrastconfig.rightSpotLayer = L.tileLayer.wms(
          config.mapUrl.geoserverUrl + "/wms?",
          {
            layers: config.mapSpotLayerName, //需要加载的图层
            format: "image/png", //返回的数据格式
            transparent: true,
            maxZoom: config.mapInitParams.maxZoom,
            // cql_filter: "archive_time >= " + selectSpotRightV
            cql_filter: "spot_id in ("+rightspotIds+") and archive_time >= " + selectSpotRightV
          }
        );
      }
      //contrastconfig.RMap.addLayer(contrastconfig.rightSpotLayer);
      if(!contrastconfig.RMap.hasLayer(contrastconfig.rightSpotLayer)){
        contrastconfig.RMap.addLayer(contrastconfig.rightSpotLayer);
      }
    }
  };
  /*
   * 左地图的影像列表切换
   */
  onChangeSelectLeft = v => {
    this.setState({ selectLeftV: v });
    //移除左地图的图层列表
    this.removeLMapLayers();
    //新建左地图的图层列表
    setTimeout(() => {
      this.addLMapLayers();
    }, 200);
  };
  //左侧历史扰动图斑切换事件
  onChangeSelectSpotLeft = v => {
    this.setState({ selectSpotLeftV: v });
    //移除左地图的图层列表
    this.removeLMapLayers();
    //新建左地图的图层列表
    setTimeout(() => {
      this.addLMapLayers();
    }, 200);
  };
  /*
   * 右地图的影像列表切换
   */
  onChangeSelectRight = v => {
    this.setState({ selectRightV: v });
    //移除右地图的图层列表
    this.removeRMapLayers();
    //新建右地图的图层列表
    setTimeout(() => {
      this.addRMapLayers();
    }, 200);
  };
  //右侧历史扰动图斑切换事件
  onChangeSelectSpotRight = v => {
    this.setState({ selectSpotRightV: v });
    //移除左地图的图层列表
    this.removeRMapLayers();
    //新建左地图的图层列表
    setTimeout(() => {
      this.addRMapLayers();
    }, 200);
  };

  render() {
    const {
      mapdata: { histories, historiesSpot }
    } = this.props;
    //console.log('histories',histories);
    const {
      show,
      selectLeftV,
      selectRightV,
      selectSpotLeftV,
      selectSpotRightV
    } = this.state;

    return (
      <div
        style={{
          display: show ? "flex" : "none",
          position: "absolute",
          top: 0,
          paddingTop: 46,
          height: "100vh",
          width: "100vw",
          zIndex: 1001
        }}
      >
        <div
          style={{ flex: 1, border: "1px solid #cccccc" }}
          id="LMap"
        >
          {/*历史影像图切换*/}
          <div id="leftDIV"
            // onClick={e => {
            //   console.log("e",e);
            //   e.stopPropagation();
            //   L.DomEvent.stop(e);
            // }}
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              zIndex: 1000,
              // pointerEvents:"none",
              background: "#fff"
            }}
          >
            {/* 左侧历史影像切换 */}
            <span
              style={{
                padding: "0 10px"
              }}
            >
              影像:
            </span>
            <Select
              value={[selectLeftV]}
              placeholder="请选择"
              onChange={this.onChangeSelectLeft}
              style={{
                width: 150
              }}
            >
              {histories.map((item, id) => (
                <Select.Option key={id} value={item}>
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
                <Select.Option key={id} value={item.value}>
                  {item.id}
                </Select.Option>
              ))}
            </Select>
          </div>
        </div>
        <div style={{ flex: 1, border: "1px solid #cccccc" }} id="RMap">
          <div id="rightDIV"
            style={{
              position: "absolute",
              top: 10,
              left: 10,
              zIndex: 1000,
              background: "#fff"
            }}
          >
            {/* 右侧历史影像切换 */}
            <span
              style={{
                padding: "0 10px"
              }}
            >
              影像:
            </span>
            <Select
              value={[selectRightV]}
              placeholder="请选择"
              onChange={this.onChangeSelectRight}
              style={{
                width: 150
              }}
            >
              {histories.map((item, id) => (
                <Select.Option key={id} value={item}>
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
                <Select.Option key={id} value={item.value}>
                  {item.id}
                </Select.Option>
              ))}
            </Select>
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 20,
            right: 20,
            zIndex: 1000,
            background: "#fff"
          }}
        >
          <Popover content="天地一体化" title="" trigger="hover">
            <Button
              icon="rollback"
              onClick={() => this.setState({ show: false })}
            />
          </Popover>
        </div>
      </div>
    );
  }
}
