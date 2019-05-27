import React, { PureComponent } from "react";
import { connect } from "dva";
import {
  Select
} from "antd";
import SiderMenu from "../../../components/SiderMenu";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import proj4 from "proj4";
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
  constructor(props) {
    super(props);
    this.state = {
      selectLeftV: "",
      selectRightV: ""
    };
    this.map = null;
    this.saveRef = v => {
      this.refDom = v;
    };
  }
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
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
      iconUrl: require("leaflet/dist/images/marker-icon.png"),
      shadowUrl: require("leaflet/dist/images/marker-shadow.png")
    });
    userconfig.LMap = L.map("LMap", {
      zoomControl: false,
      attributionControl: false
    });
    //地图缩放控件
    L.control
    .zoom({ zoomInTitle: "放大", zoomOutTitle: "缩小", position: "topleft" })
    .addTo(userconfig.LMap);
    userconfig.RMap = L.map("RMap", {
      zoomControl: false,
      attributionControl: false
    });
    //地图缩放控件
    L.control
    .zoom({ zoomInTitle: "放大", zoomOutTitle: "缩小", position: "topright" })
    .addTo(userconfig.RMap);
    //获取项目区域范围
    me.getRegionGeometry();
  }
  /*
   *地图范围变化监听事件
  */ 
  onMoveendMap = e => {
    const me = this;
    let zoom = e.target.getZoom();
    let center = e.target.getCenter();
    let bounds = e.target.getBounds();
    //console.log(center);
    if(e.target._container.id === "LMap"){
      if(userconfig.RMap.getZoom() !==zoom || userconfig.RMap.getCenter().lat !==center.lat && userconfig.RMap.getCenter().lng !==center.lng)
         userconfig.RMap.setView(center,zoom)
    }
    else{
      if(userconfig.LMap.getZoom() !==zoom || userconfig.LMap.getCenter().lat !==center.lat && userconfig.LMap.getCenter().lng !==center.lng)
         userconfig.LMap.setView(center,zoom)
    }
    //根据地图当前范围获取对应历史影像数据
    me.getInfoByExtent(zoom, bounds, me.callbackGetInfoByExtent, false);
  }; 
  /*
   *地图鼠标移动监听事件
  */ 
  onMoveMap = e => {
    //console.log(e);
    if (userconfig.marker) userconfig.marker.remove();
    let myIcon = L.icon({
      iconUrl: "./img/hand_pointer.png",
      iconSize: [17, 23]
    });
    if(e.target._container.id === "LMap"){//操作右侧地图
      userconfig.marker = L.marker(e.latlng, { icon: myIcon }).addTo(userconfig.RMap);
      //userconfig.marker = L.marker(e.latlng).addTo(userconfig.RMap);
    }
    else{//操作左侧地图
      userconfig.marker = L.marker(e.latlng, { icon: myIcon }).addTo(userconfig.LMap);
      //userconfig.marker = L.marker(e.latlng).addTo(userconfig.LMap);
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
    userconfig.leftImgLayer = me.loadMapbaseLayer(userconfig.LMap,config.baseMaps[1].Url);
    userconfig.rightImgLayer = me.loadMapbaseLayer(userconfig.RMap,config.baseMaps[1].Url);
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
        //监听地图移动事件
        userconfig.LMap.on("mousemove", me.onMoveMap);
        //监听地图移动事件
        userconfig.RMap.on("mousemove", me.onMoveMap);
        //根据地图当前范围获取对应历史影像数据
        let zoom = userconfig.LMap.getZoom();
        let bounds = userconfig.LMap.getBounds();
        me.getInfoByExtent(zoom, bounds, me.callbackGetInfoByExtent, true);
      }, 500);
    }, 500);
  };
  /*
   * 加载地图geoJsonLayer图层
   */
  loadMapbaseLayer = (map,url) => {
    map.createPane("tileLayerZIndex");
    map.getPane("tileLayerZIndex").style.zIndex = 0;
    let layer = L.tileLayer(
      url,
      {
        pane: "tileLayerZIndex"
      }
    ).addTo(map); //影像图
    return layer;
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
  /*
   * 根据地图当前范围获取对应历史影像数据回调函数
   */
  callbackGetInfoByExtent = data => {
    if (
      userconfig.isLoadSideBySide ||
      userconfig.sideBySideZoom !== userconfig.LMap.getZoom()
    ) {
      this.setState({ selectLeftV: data[0] });
      this.setState({ selectRightV: data[0] });
      userconfig.sideBySideZoom = userconfig.LMap.getZoom();
      //移除左右地图的图层列表
      this.removeLRMapLayers();
      this.addLRMapLayers();
    }
  }; 
  /*
   * 移除左右地图的图层列表
  */
  removeLRMapLayers = () => {
    //移除地图默认加载底图
    if (userconfig.LMap.hasLayer(userconfig.leftImgLayer))
        userconfig.LMap.removeLayer(userconfig.leftImgLayer);
    if (userconfig.RMap.hasLayer(userconfig.rightImgLayer))
        userconfig.RMap.removeLayer(userconfig.rightImgLayer);
  }; 
    /*
   * 添加左右地图的图层列表
   */
  addLRMapLayers = () => {
    const { selectLeftV, selectRightV } = this.state;
    let leftLayerUrl =config.imageBaseUrl +"/" +selectLeftV.replace(/\//g, "-") +"/tile/{z}/{y}/{x}";
    userconfig.leftImgLayer = this.loadMapbaseLayer(userconfig.LMap,leftLayerUrl);//左侧影像
    let rightLayerUrl =config.imageBaseUrl +"/" +selectRightV.replace(/\//g, "-") +"/tile/{z}/{y}/{x}";
    userconfig.rightImgLayer = this.loadMapbaseLayer(userconfig.RMap,rightLayerUrl);//右侧影像
  };
  onChangeSelectLeft = v => {
    this.setState({ selectLeftV: v });
    if (userconfig.LMap.hasLayer(userconfig.leftImgLayer))
        userconfig.LMap.removeLayer(userconfig.leftImgLayer);
    let leftLayerUrl =config.imageBaseUrl +"/" + v.replace(/\//g, "-") +"/tile/{z}/{y}/{x}";
    userconfig.leftImgLayer = this.loadMapbaseLayer(userconfig.LMap,leftLayerUrl);//左侧影像
  };
  onChangeSelectRight = v => {
    this.setState({ selectRightV: v });
    if (userconfig.RMap.hasLayer(userconfig.rightImgLayer))
        userconfig.RMap.removeLayer(userconfig.rightImgLayer);
    let rightLayerUrl =config.imageBaseUrl +"/" +v.replace(/\//g, "-") +"/tile/{z}/{y}/{x}";
    userconfig.rightImgLayer = this.loadMapbaseLayer(userconfig.RMap,rightLayerUrl);//右侧影像
  };

  render() {
    const {
      selectLeftV,
      selectRightV
    } = this.state;
    const {
      mapdata: { histories }
    } = this.props;
    return (
      <div>
        <SiderMenu active="101" />
        <div style={{ display: "flex" }}>
          <div style={{ flex: 1, border:"1px solid #cccccc" }} id="LMap">
            {/*历史影像图切换*/}
            <div
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                zIndex: 1000
              }}
            >
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
            </div>
          </div>
          <div style={{ flex: 1, border:"1px solid #cccccc" }} id="RMap">
          <div
              style={{
                position: "absolute",
                top: 10,
                left: 10,
                zIndex: 1000
              }}
            >
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
            </div>
          </div>
        </div>
      </div>
    );
  }
}
