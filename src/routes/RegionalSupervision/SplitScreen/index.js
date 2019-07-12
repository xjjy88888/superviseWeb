import React, { PureComponent } from "react";
import { connect } from "dva";
import { Select, Popover, Button } from "antd";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import proj4 from "proj4";
import * as turf from "@turf/turf";
import config from "../../../config";
import jQuery from "jquery";
import { Link } from "dva/router";
import Layouts from "../../../components/Layouts";

let userconfig = {};
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
      selectLeftV: "",
      selectRightV: "",
      selectSpotLeftV: "",
      selectSpotRightV: ""
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
  };
  /*
   *地图鼠标移动监听事件
   */
  onMoveMap = e => {
    if (userconfig.marker) userconfig.marker.remove();
    let myIcon = L.icon({
      iconUrl: "./img/hand_pointer.png",
      iconSize: [17, 23]
    });
    if (e.target._container.id === "LMap") {
      //操作右侧地图
      userconfig.marker = L.marker(e.latlng, { icon: myIcon }).addTo(
        userconfig.RMap
      );
      //userconfig.marker = L.marker(e.latlng).addTo(userconfig.RMap);
    } else {
      //操作左侧地图
      userconfig.marker = L.marker(e.latlng, { icon: myIcon }).addTo(
        userconfig.LMap
      );
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
    userconfig.leftImgLayer = me.loadMapbaseLayer(
      userconfig.LMap,
      config.baseMaps[1].Url
    );
    userconfig.rightImgLayer = me.loadMapbaseLayer(
      userconfig.RMap,
      config.baseMaps[1].Url
    );
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
        userconfig.maps = [userconfig.LMap, userconfig.RMap];
        // eslint-disable-next-line array-callback-return
        userconfig.maps.map(function(t) {
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
          userconfig.maps.map(function(t) {
            t.setView(_this.getCenter(), _this.getZoom());
          });
        }
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
  loadMapbaseLayer = (map, url) => {
    map.createPane("tileLayerZIndex");
    map.getPane("tileLayerZIndex").style.zIndex = 0;
    let layer = L.tileLayer(url, {
      pane: "tileLayerZIndex"
    }).addTo(map); //影像图
    return layer;
  };
  /*
   * 加载地图geoJsonLayer图层
   */
  loadMapgeoJsonLayer = map => {
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
  };
  /*
   * 加载geoserver发布的WMS地图服务
   */
  overlayWMSLayers = map => {
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
    // L.tileLayer
    //   .wms(config.mapUrl.geoserverUrl + "/wms?", {
    //     layers: config.mapSpotLayerName, //需要加载的图层
    //     format: "image/png", //返回的数据格式
    //     transparent: true
    //     //cql_filter:"map_num like '%_52_%'"
    //   })
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
    let userParams = JSON.parse(localStorage.getItem("user"));
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
  /*空间范围查询图层
   *@method queryWFSServiceByExtent
   *@return null
   */
  queryWFSServiceByExtent = (typeName, callback) => {
    const me = this;
    let bounds = userconfig.LMap.getBounds();
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
      userconfig.isLoadSideBySide ||
      userconfig.sideBySideZoom !== userconfig.LMap.getZoom()
    ) {
      this.setState({ selectLeftV: data[0] });
      this.setState({ selectRightV: data[0] });
      userconfig.sideBySideZoom = userconfig.LMap.getZoom();
      //历史扰动图斑查询
      this.queryWFSServiceByExtent(
        config.mapHistorySpotLayerName,
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
      //添加左右地图的图层列表
      this.addLMapLayers();
      this.addRMapLayers();
    }, 200);
  };
  /*
   * 移除左地图的图层列表
   */
  removeLMapLayers = () => {
    if (userconfig.leftImgLayer)
      userconfig.LMap.removeLayer(userconfig.leftImgLayer);
    if (userconfig.leftSpotLayer)
      userconfig.LMap.removeLayer(userconfig.leftSpotLayer);
  };
  /*
   * 移除右地图的图层列表
   */
  removeRMapLayers = () => {
    if (userconfig.rightImgLayer)
      userconfig.RMap.removeLayer(userconfig.rightImgLayer);
    if (userconfig.rightSpotLayer)
      userconfig.RMap.removeLayer(userconfig.rightSpotLayer);
  };
  /*
   * 添加左地图的图层列表
   */
  addLMapLayers = () => {
    const { selectLeftV, selectSpotLeftV } = this.state;
    if (selectLeftV) {
      let leftLayerUrl =
        config.imageBaseUrl +
        "/" +
        selectLeftV.replace(/\//g, "-") +
        "/tile/{z}/{y}/{x}";
      userconfig.leftImgLayer = this.loadMapbaseLayer(
        userconfig.LMap,
        leftLayerUrl
      ); //左侧影像
    }
    //加载历史扰动图斑
    userconfig.leftSpotLayer = null;
    if (selectSpotLeftV) {
      if (selectSpotLeftV.indexOf("现状") !== -1) {
        //现状扰动图斑
        userconfig.leftSpotLayer = L.tileLayer.wms(
          config.mapUrl.geoserverUrl + "/wms?",
          {
            layers: config.mapSpotLayerName, //需要加载的图层
            format: "image/png", //返回的数据格式
            transparent: true
          }
        );
      } else {
        //历史扰动图斑
        userconfig.leftSpotLayer = L.tileLayer.wms(
          config.mapUrl.geoserverUrl + "/wms?",
          {
            layers: config.mapHistorySpotLayerName, //需要加载的图层
            format: "image/png", //返回的数据格式
            transparent: true,
            cql_filter: "archive_time <= " + selectSpotLeftV
          }
        );
      }
      userconfig.LMap.addLayer(userconfig.leftSpotLayer);
    }
  };
  /*
   * 添加右地图的图层列表
   */
  addRMapLayers = () => {
    const { selectRightV, selectSpotRightV } = this.state;
    if (selectRightV) {
      let rightLayerUrl =
        config.imageBaseUrl +
        "/" +
        selectRightV.replace(/\//g, "-") +
        "/tile/{z}/{y}/{x}";
      userconfig.rightImgLayer = this.loadMapbaseLayer(
        userconfig.RMap,
        rightLayerUrl
      ); //右侧影像
    }
    //加载历史扰动图斑
    userconfig.rightSpotLayer = null;
    if (selectSpotRightV) {
      if (selectSpotRightV.indexOf("现状") !== -1) {
        //现状扰动图斑
        userconfig.rightSpotLayer = L.tileLayer.wms(
          config.mapUrl.geoserverUrl + "/wms?",
          {
            layers: config.mapSpotLayerName, //需要加载的图层
            format: "image/png", //返回的数据格式
            transparent: true
          }
        );
      } else {
        //历史扰动图斑
        userconfig.rightSpotLayer = L.tileLayer.wms(
          config.mapUrl.geoserverUrl + "/wms?",
          {
            layers: config.mapHistorySpotLayerName, //需要加载的图层
            format: "image/png", //返回的数据格式
            transparent: true,
            cql_filter: "archive_time <= " + selectSpotRightV
          }
        );
      }
      userconfig.RMap.addLayer(userconfig.rightSpotLayer);
    }
  };
  /*
   * 左地图的影像列表切换
   */
  onChangeSelectLeft = v => {
    this.setState({ selectLeftV: v });
    //移除左地图的图层列表
    this.removeLMapLayers();
    //添加左地图的图层列表
    setTimeout(() => {
      this.addLMapLayers();
    }, 200);
  };
  //左侧历史扰动图斑切换事件
  onChangeSelectSpotLeft = v => {
    this.setState({ selectSpotLeftV: v });
    //移除左地图的图层列表
    this.removeLMapLayers();
    //添加左地图的图层列表
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
    //添加右地图的图层列表
    setTimeout(() => {
      this.addRMapLayers();
    }, 200);
  };
  //右侧历史扰动图斑切换事件
  onChangeSelectSpotRight = v => {
    this.setState({ selectSpotRightV: v });
    //移除左地图的图层列表
    this.removeRMapLayers();
    //添加左地图的图层列表
    setTimeout(() => {
      this.addRMapLayers();
    }, 200);
  };

  render() {
    const {
      selectLeftV,
      selectRightV,
      selectSpotLeftV,
      selectSpotRightV
    } = this.state;
    const {
      mapdata: { histories, historiesSpot }
    } = this.props;
    return (
      <Layouts>
        <div
          style={{
            display: "flex",
            position: "absolute",
            top: 0,
            paddingTop: 46,
            height: "100vh",
            width: "100vw"
          }}
        >
          <div style={{ flex: 1, border: "1px solid #cccccc" }} id="LMap">
            {/*历史影像图切换*/}
            <div
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                zIndex: 1000,
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
            <div
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
            <Link to="/regionalSupervision/integration">
              <Popover content="天地一体化" title="" trigger="hover">
                <Button icon="rollback" />
              </Popover>
            </Link>
          </div>
        </div>
      </Layouts>
    );
  }
}
