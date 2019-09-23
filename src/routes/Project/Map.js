import React, { PureComponent } from "react";
import { connect } from "dva";
import Layouts from "../../components/Layouts";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import proj4 from "proj4";
import "proj4leaflet";
import "leaflet-measure/dist/leaflet-measure.css";
import "leaflet-measure/dist/leaflet-measure.cn";
import config from "../../config";
@connect(({ mapdata }) => ({
  mapdata
}))
export default class homePage extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      imageTimeText:'',
      showImageTimeText:true,
    };
    this.map = null;
    this.onlineBasemapLayers = null;
  }

  componentDidMount() {
    const me = this;
    // 创建图层
    me.createLayers();    
    // 创建地图
    me.createMap();
    // 创建图层管理控件
    me.createToc();    
    // 创建地图缩放控件
    me.createZoomControl();
    // 创建比例尺控件
    me.createScale();
    // 创建量算工具
    me.createMeasureControl();
  }
  // 创建图层
  createLayers = () => {
    // const { onlineBasemaps } = config;
    // // 在线底图
    // this.onlineBasemapLayers = onlineBasemaps.map(item => {
    //   return L.tileLayer(`${item.url}`, {
    //     minZoom: item.minZoom,
    //     maxZoom: item.maxZoom,
    //     subdomains: item.subdomains
    //   });
    // });
  };
  // 创建地图
  createMap = () => {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
      iconUrl: require("leaflet/dist/images/marker-icon.png"),
      shadowUrl: require("leaflet/dist/images/marker-shadow.png")
    });
    // const { onlineBasemapLayers } = this;
    const map = L.map("map", {
      zoomControl: false,
      //crs: L.CRS.EPSG3857,
      attributionControl: false,
      layers: [
        // onlineBasemapLayers[0]
      ]
    });
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
    //监听地图移动完成事件
    map.on("moveend", this.onMoveendMap);
    //监听地图底图切换事件
    map.on("baselayerchange", this.onBaseLayerChange); 
    //监听地图鼠标移动事件
    map.on("mousemove", this.showImageInfos);
    //地图范围跳转
    map.setView(config.mapInitParams.center, config.mapInitParams.zoom);    
    
  }
  //监听地图点击事件
  onBaseLayerChange = e => {
    //判断当前底图是否等于监管影像
    if(e.layer._url === config.onlineBasemaps[0].url){
      this.setState({ showImageTimeText: true });       
    }
    else{
      this.setState({ showImageTimeText: false });
    }

  };
  //监听地图移动完成事件
  onMoveendMap = e => {
    const me = this;
    const { map } = this;
    let zoom = map.getZoom();
    let bounds = map.getBounds();
    //根据地图当前范围获取对应监管影像时间
    const { showImageTimeText } = me.state;
    if (showImageTimeText) {
      me.getInfoByExtent(zoom, bounds, data => {
         me.setState({ imageTimeText: data[0] });  
      });
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
  getInfoByExtent = (zoom, bounds, callback) => {
    const me = this;
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
  //监听地图鼠标移动事件
  showImageInfos = e => {
    const {mapdata:{imageTimeResult}} = this.props; 
    const me = this;
    //根据地图当前范围获取对应监管影像时间
    const { showImageTimeText } = me.state;
    if (showImageTimeText && imageTimeResult) {
      let tileInfos = imageTimeResult.tileInfos;
      if(tileInfos.length>0){
        let pt = proj4("EPSG:4326", "EPSG:3857", [
          e.latlng.lng,
          e.latlng.lat
        ]);
        for (let i=0; i < tileInfos.length; i++) {
          let item = tileInfos[i];
          if (pt[0] >= item.xmin && pt[0] <= item.xmax && pt[1] >= item.ymin && pt[1] <= item.ymax) {
            let data = item.data;
            if (data && data.hasOwnProperty("takenDate")) {
                me.setState({ imageTimeText: data.takenDate });
            }
            return true;
          }  

        }
      }
    }
  } 
  // 创建图层管理控件
  createToc = () => {
    const { map, onlineBasemapLayers } = this;
    const { onlineBasemaps } = config;

    // 构建图层标题及图例
    const getTitle = (text, borderColor, fillColor, isBorderDashed) => {
      return `<i style='display:inline-block;border:${
        isBorderDashed ? "dashed" : "solid"
      } 2px ${borderColor};background:${fillColor};width:20px;height:20px;position:relative;top:4px;'></i><span style='padding-left:1px;'>${text}</span>`;
    };

    // 构建图片形式的标题及图例
    const getImageTitle = (text, imgUrl) => {
      return `<div style='display:inline-block;width:20px;height:20px;position:relative;top:4px;'><img src='${imgUrl}' style='height:20px;'/></div><span style='padding-left:1px;'>${text}</span>`;
    };
    // 底图图层
    const baseMaps = {};
    onlineBasemaps.forEach((item, i) => {
      baseMaps[getImageTitle(item.title, item.picUrl)] = onlineBasemapLayers[i];
    });

    // 专题图层
    const overlayMaps = {};

    // 添加控件
    const container = L.control
      .layers(baseMaps, overlayMaps)
      .addTo(map)
      .getContainer();

    // 修改图标样式
    L.DomUtil.addClass(
      container.firstChild,
      "iconfont icon-layer global-icon-normal"
    );
  };  
  // 创建地图缩放控件
  createZoomControl = () => {
    const { map } = this;
    //地图缩放控件
    L.control
      .zoom({ zoomInTitle: "放大", zoomOutTitle: "缩小", position: "topright" })
      .addTo(map);
  };
  // 创建比例尺控件
  createScale = () => {
    const { map } = this;
    L.control
      .scale({
        imperial: false,
        position: "bottomright" 
      })
      .addTo(map);
  };
  // 创建量算工具控件
  createMeasureControl = () => {
    const { map } = this;
    //量算工具
    var measureControl = new L.Control.Measure({
      primaryLengthUnit: "kilometers",
      primaryAreaUnit: "sqmeters",
      activeColor: "#3388FF",
      completedColor: "#3388FF",
      position: "topright"
    });
    measureControl.addTo(map);
  }; 

  render() {
    const {
      imageTimeText,
      showImageTimeText,
    } = this.state;
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
          {/* 监管影像时间显示信息 */}
          <div
            style={{
              display: showImageTimeText ? "block" : "none",
              position: "absolute",
              bottom: 5,
              right: 150,
              zIndex: 1000,
              background: "rgba(255, 255, 255, 0.8)"
              // background: "#fff"
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
      </div>
      </Layouts>
    );
  }
}
