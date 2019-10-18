import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { message } from 'antd';
import Layouts from '../../components/Layouts';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import proj4 from 'proj4';
import 'proj4leaflet';
import 'leaflet-measure/dist/leaflet-measure.css';
import 'leaflet-measure/dist/leaflet-measure.cn';
import config from '../../config';

const DISTRICT_FILL_COLOR = 'rgba(230,0,0,0)';
// const DISTRICT_COLOR = '#bfbfbf';
const DISTRICT_COLOR = '#0070FF';

//绘制geojson行政区划图层样式
const regionGeoJsonStyle = {
  color: '#0000FF',
  weight: 2,
  opacity: 0.8,
  fillColor: '#0000FF',
  fillOpacity: 0.1
};
//绘制geojson行政区划图层高亮样式
const regionGeoJsonHLightStyle = {
  color: '#FF0000',
  weight: 3,
  opacity: 1,
  fillColor: '#FF0000',
  fillOpacity: 0
};

@connect(({ mapdata }) => ({
  mapdata
}))
export default class homePage extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      imageTimeText: '',
      showImageTimeText: true
    };
    this.map = null;
    this.regiongeojsonLayer = null; //行政区划矢量图层
    this.onlineBasemapLayers = null;
  }

  componentDidMount() {
    const me = this;
    // 创建图层
    me.createLayers();
    // 创建地图
    me.createMap();
    // 创建行政区划渲染
    me.createRegion();
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
    const { tdtImageLabel, districtBound } = config;
    //天地图地图标注图层
    const placeNameImageLayer = L.tileLayer(`${tdtImageLabel.url}`, {
      minZoom: tdtImageLabel.minZoom,
      maxZoom: tdtImageLabel.maxZoom,
      subdomains: tdtImageLabel.subdomains
    });
    this.placeNameImageLayer = placeNameImageLayer;
    //行政边界-区县图层
    const districtBoundLayer = L.tileLayer.wms(districtBound.url + '/wms?', {
      layers: districtBound.mapDistrictLayerName, //需要加载的图层
      format: 'image/png', //返回的数据格式
      transparent: true,
      maxZoom: districtBound.maxZoom
    });
    this.districtBoundLayer = districtBoundLayer;

    //行政区划图层
    const regiongeojsonLayer = L.Proj.geoJson(null, {
      style: regionGeoJsonStyle
    });

    this.regiongeojsonLayer = regiongeojsonLayer;
  };
  // 创建地图
  createMap = () => {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
      iconUrl: require('leaflet/dist/images/marker-icon.png'),
      shadowUrl: require('leaflet/dist/images/marker-shadow.png')
    });
    const { regiongeojsonLayer } = this;
    const map = L.map('map', {
      zoomControl: false,
      //crs: L.CRS.EPSG3857,
      attributionControl: false,
      layers: [regiongeojsonLayer]
    });
    const { onlineBasemaps } = config;
    map.createPane('tileLayerZIndex');
    map.getPane('tileLayerZIndex').style.zIndex = 0;
    // 在线底图
    const onlineBasemapLayers = onlineBasemaps.map(item => {
      return L.tileLayer(`${item.url}`, {
        minZoom: item.minZoom,
        maxZoom: item.maxZoom,
        subdomains: item.subdomains,
        pane: 'tileLayerZIndex',
        errorTileUrl: item.errorTileUrl
      });
    });
    map.addLayer(onlineBasemapLayers[0]);
    this.onlineBasemapLayers = onlineBasemapLayers;
    this.map = map;
    //监听地图移动完成事件
    map.on('moveend', this.onMoveendMap);
    //监听地图底图切换事件
    map.on('baselayerchange', this.onBaseLayerChange);
    //监听地图鼠标移动事件
    map.on('mousemove', this.showImageInfos);
    //地图范围跳转
    map.setView(config.mapInitParams.center, config.mapInitParams.zoom);
  };
  //监听地图点击事件
  onBaseLayerChange = e => {
    //判断当前底图是否等于监管影像
    if (e.layer._url === config.onlineBasemaps[0].url) {
      this.setState({ showImageTimeText: true });
    } else {
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
    let xyMin = proj4('EPSG:4326', 'EPSG:3857', [
      bounds.getSouthWest().lng,
      bounds.getSouthWest().lat
    ]);
    let xyMax = proj4('EPSG:4326', 'EPSG:3857', [
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
      type: 'mapdata/getInfoByExtent',
      payload: { geojsonUrl },
      callback: callback
    });
  };
  //监听地图鼠标移动事件
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
        let pt = proj4('EPSG:4326', 'EPSG:3857', [e.latlng.lng, e.latlng.lat]);
        for (let i = 0; i < tileInfos.length; i++) {
          let item = tileInfos[i];
          if (
            pt[0] >= item.xmin &&
            pt[0] <= item.xmax &&
            pt[1] >= item.ymin &&
            pt[1] <= item.ymax
          ) {
            let data = item.data;
            if (data && data.hasOwnProperty('takenDate')) {
              me.setState({ imageTimeText: data.takenDate });
            }
            return true;
          }
        }
      }
    }
  };
  // 创建图层管理控件
  createToc = () => {
    const {
      map,
      onlineBasemapLayers,
      placeNameImageLayer,
      districtBoundLayer
    } = this;
    const { onlineBasemaps, tdtImageLabel, districtBound } = config;

    // 构建图层标题及图例
    const getTitle = (
      text,
      borderColor,
      fillColor,
      isBorderDashed,
      className
    ) => {
      if (className) {
        return `<i style='display:inline-block;border:${
          isBorderDashed ? 'dashed' : 'solid'
        } 2px ${borderColor};background:${fillColor};width:20px;height:20px;position:relative;top:4px;'></i><span style='padding-left:1px;'>${text}</span><div class='${className}'></div>`;
      } else {
        return `<i style='display:inline-block;border:${
          isBorderDashed ? 'dashed' : 'solid'
        } 2px ${borderColor};background:${fillColor};width:20px;height:20px;position:relative;top:4px;'></i><span style='padding-left:1px;'>${text}</span>`;
      }
    };

    // 构建图片形式的标题及图例
    const getImageTitle = (text, imgUrl) => {
      return `<div style='display:inline-block;width:20px;height:20px;position:relative;top:0px;'><img src='${imgUrl}' style='height:20px;'/></div><span style='padding-left:1px;'>${text}</span>`;
    };
    // 底图图层
    const baseMaps = {};
    onlineBasemaps.forEach((item, i) => {
      baseMaps[getImageTitle(item.title, item.picUrl)] = onlineBasemapLayers[i];
    });

    // 专题图层
    // const overlayMaps = {};
    const overlayMaps = {
      [getImageTitle(
        tdtImageLabel.title,
        tdtImageLabel.picUrl
      )]: placeNameImageLayer,
      [getTitle(
        districtBound.title,
        DISTRICT_COLOR,
        DISTRICT_FILL_COLOR,
        true,
        'overlayMapsTile'
      )]: districtBoundLayer
    };

    // 添加控件
    const container = L.control
      .layers(baseMaps, overlayMaps)
      .addTo(map)
      .getContainer();

    // 修改图标样式
    L.DomUtil.addClass(
      container.firstChild,
      'iconfont icon-layer global-icon-normal'
    );
  };
  // 创建地图缩放控件
  createZoomControl = () => {
    const { map } = this;
    //地图缩放控件
    L.control
      .zoom({ zoomInTitle: '放大', zoomOutTitle: '缩小', position: 'topright' })
      .addTo(map);
  };
  // 创建比例尺控件
  createScale = () => {
    const { map } = this;
    L.control
      .scale({
        imperial: false,
        position: 'bottomright'
      })
      .addTo(map);
  };
  // 创建量算工具控件
  createMeasureControl = () => {
    const { map } = this;
    //量算工具
    var measureControl = new L.Control.Measure({
      primaryLengthUnit: 'kilometers',
      primaryAreaUnit: 'sqmeters',
      activeColor: '#3388FF',
      completedColor: '#3388FF',
      position: 'topright'
    });
    measureControl.addTo(map);
  };

  // 创建行政区划渲染
  createRegion = () => {
    const { regiongeojsonLayer } = this;
    const me = this;
    this.getNextRegions();
    //监听行政区划图层鼠标事件
    regiongeojsonLayer.on('mouseover', me.onMoveoverRegiongeojsonLayer);
    regiongeojsonLayer.on('mouseout', me.onMoveoutRegiongeojsonLayer);
  };

  onMoveoverRegiongeojsonLayer = e => {
    //console.log('e',e);
    e.layer.setStyle(regionGeoJsonHLightStyle);
    e.layer.bringToFront();
  };

  onMoveoutRegiongeojsonLayer = e => {
    //console.log('e',e);
    e.layer.setStyle(regionGeoJsonStyle);
  };

  //获取当前账号行政区下一级行政区数据
  getNextRegions = () => {
    const user = localStorage.getItem('user');
    if (user) {
      const curuser = JSON.parse(user);
      const parentid = curuser.departmentDistrictCodeId;
      //  console.log('curuser',curuser);
      this.queryRegionByProperty(
        parentid,
        'parent_id',
        config.districtBound.mapDistrictLayerName,
        this.callbackRegionQueryWFSService
      );
    } else {
      message.warning('区域范围之外的数据没有权限操作', 1);
    }
  };

  /*
   * 行政区划查询回调函数
   */
  callbackRegionQueryWFSService = data => {
    // console.log('data',data);
    if (data && data.features.length > 0) {
      this.loadRegionGeojsonLayer(data);
      const bounds = this.regiongeojsonLayer.getBounds();
      this.map.fitBounds(bounds);
    } else {
      const user = localStorage.getItem('user');
      if (user) {
        const curuser = JSON.parse(user);
        const id = curuser.departmentDistrictCodeId;
        this.queryRegionByProperty(
          id,
          'id',
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
      const bounds = this.regiongeojsonLayer.getBounds();
      this.map.fitBounds(bounds);
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
    filter += '<PropertyIsEqualTo>';
    filter += '<PropertyName>' + propertyName + '</PropertyName>';
    filter += '<Literal>' + propertyValue + '</Literal>';
    filter += '</PropertyIsEqualTo>';
    filter += '</Filter>';
    let urlString = config.mapUrl.geoserverUrl + '/ows';
    let param = {
      service: 'WFS',
      version: '1.0.0',
      request: 'GetFeature',
      typeName: typeName,
      outputFormat: 'application/json',
      filter: filter
    };
    let geojsonUrl = urlString + L.Util.getParamString(param, urlString);
    me.props.dispatch({
      type: 'mapdata/queryRegionWFSLayer',
      payload: { geojsonUrl },
      callback: callback
    });
  };

  /*
   * 绘制行政区划图形函数
   */
  loadRegionGeojsonLayer = geojson => {
    this.regiongeojsonLayer.addData(geojson);
  };

  /*
   * 清空绘制图形函数
   */
  clearGeojsonLayer = () => {
    if (this.regiongeojsonLayer) {
      this.regiongeojsonLayer.clearLayers();
      //this.map.removeLayer(this.regiongeojsonLayer);
      //this.regiongeojsonLayer = null;
    }
  };

  render() {
    const { imageTimeText, showImageTimeText } = this.state;
    return (
      <Layouts avtive="map">
        <div
          style={{
            position: 'absolute',
            top: 0,
            paddingTop: 46,
            height: '100vh',
            width: '100vw'
          }}
        >
          <div
            id="map"
            style={{
              boxSizing: 'border-box',
              width: '100%',
              height: '100%'
            }}
          />
          {/* 监管影像时间显示信息 */}
          <div
            style={{
              display: showImageTimeText ? 'block' : 'none',
              position: 'absolute',
              bottom: 5,
              right: 150,
              zIndex: 1000,
              background: 'rgba(255, 255, 255, 0.8)'
              // background: "#fff"
            }}
          >
            <span
              style={{
                padding: '0 10px'
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
