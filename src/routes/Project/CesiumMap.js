import React, { PureComponent } from "react";
import { connect } from "dva";
import Layouts from "../../components/Layouts";
import proj4 from "proj4";
import config from "../../config";
import jQuery from "jquery";


@connect(({ mapdata }) => ({
  mapdata
}))
export default class homePage extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      imageTimeText:'',
      showImageTimeText:false,
    };
    this.viewer = null;
    this.initExtent = null;
    this.defaultResetView = null;
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
    // 创建地图导航控件
    me.createNavigationControl();
  }
  // 创建图层
  createLayers = () => {
  };
  // 创建地图
  createMap = () => {
    const me = this;
    const { cesiumMapInitParams } = config;
    // eslint-disable-next-line no-undef
    Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIxZjhjYjhkYS1jMzA1LTQ1MTEtYWE1Mi0zODc5NDljOGVkMDYiLCJpZCI6MTAzNjEsInNjb3BlcyI6WyJhc2wiLCJhc3IiLCJhc3ciLCJnYyJdLCJpYXQiOjE1NzA2MDY5ODV9.X7tj92tunUvx6PkDpj3LFsMVBs_SBYyKbIL_G9xKESA';
    // eslint-disable-next-line no-undef 
    me.viewer = new Cesium.Viewer('map',{
      animation:false, //动画控制，默认true
      baseLayerPicker:false,//地图切换控件(底图以及地形图)是否显示,默认显示true
      fullscreenButton:false,//全屏按钮,默认显示true
      geocoder:false,//地名查找,默认true
      timeline:false,//时间线,默认true
      vrButton:false,//双屏模式,默认不显示false
      homeButton:true,//主页按钮，默认true
      infoBox:false,//点击要素之后显示的信息,默认true
      selectionIndicator:true,//选中元素显示,默认true
      navigationHelpButton:false,//导航帮助说明,默认true
      navigationInstructionsInitiallyVisible:false,
      //imageryProviderViewModels:this._getImageryViewModels(options.mapInitParams.imageryViewModels),//设置影像图列表，baseLayerPicker配合使用
      //imageryProvider :this.returnProviderViewModel(options.mapInitParams.imageryViewModels[0]),//baseLayerPicker设置false才生效，默认加载的底图
      sceneModePicker : false,//是否显示地图2D2.5D3D模式  
    });
    // //监听地图移动完成事件
    // map.on("moveend", this.onMoveendMap);
    // //监听地图底图切换事件
    // map.on("baselayerchange", this.onBaseLayerChange); 
    // //监听地图鼠标移动事件
    // map.on("mousemove", this.showImageInfos);
    //cesium全屏按钮是否设置
    if(me.viewer.fullscreenButton){
      // this.viewer.fullscreenButton.viewModel.tooltip = "全屏"; 
      jQuery(".cesium-viewer-fullscreenContainer").css("z-index","100");
    }
    //地图初始化跳转
    me.cartographicWS = [cesiumMapInitParams.extent.xmin, cesiumMapInitParams.extent.ymin];
    me.cartographicEN = [cesiumMapInitParams.extent.xmax, cesiumMapInitParams.extent.ymax];
    // eslint-disable-next-line no-undef
    me.initExtent = new Cesium.Rectangle(me.cartographicWS[0], me.cartographicWS[1], me.cartographicEN[0], me.cartographicEN[1]);
    me.flyToRectangle(me.initExtent);
    //设置cesium默认defaultResetView
    // eslint-disable-next-line no-undef
    me.defaultResetView = Cesium.Rectangle.fromDegrees(me.initExtent.west, me.initExtent.south, me.initExtent.east, me.initExtent.north);
    // 重写cesium默认的视图主页跳转行为
    if(me.viewer.homeButton){
      me.viewer.homeButton.viewModel.command.beforeExecute.addEventListener(function(commandInfo) {
          //地图范围跳转
          me.viewer.camera.flyTo({
              // eslint-disable-next-line no-undef
              destination : Cesium.Rectangle.fromDegrees(me.cartographicWS[0], me.cartographicWS[1], me.cartographicEN[0], me.cartographicEN[1])
          });
          commandInfo.cancel = true;
      });
      me.viewer.homeButton.viewModel.tooltip = "地图复位";    
    }

    //隐藏logo以及地图服务版权信息
    me.hideMapLogo();

    //显示地图当前坐标
    me.show3DCoordinates();

    //Cesium 限制相机进入地下
    me.limitCameraToGround(true);

    //添加地形
    me.addTerrainLayer();
    
  }

  /**
   * 添加地形图图层
   * @method addTerrainLayer
   * @param  
   * @return
  */
  addTerrainLayer = () => {
    // eslint-disable-next-line no-undef 
    this.viewer.terrainProvider = new Cesium.CesiumTerrainProvider({//加载在线地形
      // eslint-disable-next-line no-undef 
      url: Cesium.IonResource.fromAssetId(1)
    })   
  }

  /**
   * 移除地形图图层
   * @method romoveTerrainLayer
   * @param
   * @return
  */
  romoveTerrainLayer = () => {
    if (this.viewer.terrainProvider)
    {
        // eslint-disable-next-line no-undef 
        this.viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider();
    }
  }

  /**
   * 地图跳转-地图范围Rectangle
   * @method flyToRectangle
   * @param  对象Rectangle(west, south, east, north);
   * @return
   * 调用用例
   * var rectangle = new Rectangle(-115.0, 37.0, -114.235, 38.23);
   flyToRectangle(rectangle);
    */
  flyToRectangle= (rectangle) => {
    this.viewer.camera.flyTo({
        // eslint-disable-next-line no-undef
        destination : Cesium.Rectangle.fromDegrees(rectangle.west, rectangle.south, rectangle.east, rectangle.north)
    });    
  }

  /*显示地图当前坐标*/
  show3DCoordinates = () => {
    const me = this;
    //地图底部工具栏显示地图坐标信息
    let elementbottom = document.createElement("div");
    jQuery(".cesium-viewer").append(elementbottom);
    // elementbottom.className = "mapfootBottom";
    elementbottom.style.width = "100%";
    elementbottom.style.height = "30px";
    elementbottom.style.background = "rgba(0,0,0,0.5)";
    elementbottom.style.position = "absolute";
    elementbottom.style.bottom = "0px";
    elementbottom.style.cursor = "default";

    let coordinatesDiv = document.getElementById("map_coordinates");
    if (coordinatesDiv) {
        coordinatesDiv.style.display = "block";
    }
    else {
        coordinatesDiv = document.createElement("div");
        coordinatesDiv.id = "map_coordinates";
        // coordinatesDiv.className = "map3D-coordinates";
        coordinatesDiv.style.zIndex = "50";
        coordinatesDiv.style.bottom = "1px";
        coordinatesDiv.style.height = "29px";
        coordinatesDiv.style.position = "absolute";
        coordinatesDiv.style.overflow = "hidden";
        coordinatesDiv.style.textAlign= "center";
        coordinatesDiv.style.left = "10px";
        coordinatesDiv.style.lineHeight = "29px";
        coordinatesDiv.innerHTML = "<span id='cd_label' style='font-size:13px;text-align:center;font-family:微软雅黑;color:#edffff;'>暂无坐标信息</span>";
        jQuery(".cesium-viewer").append(coordinatesDiv);
        // eslint-disable-next-line no-undef
        let handler3D = new Cesium.ScreenSpaceEventHandler(me.viewer.scene.canvas);
        handler3D.setInputAction(function(movement) {
            // eslint-disable-next-line no-undef
            let pick= new Cesium.Cartesian2(movement.endPosition.x,movement.endPosition.y);
            if(pick){
                let cartesian = me.viewer.scene.globe.pick(me.viewer.camera.getPickRay(pick), me.viewer.scene);
                if(cartesian){
                    //世界坐标转地理坐标（弧度）
                    let cartographic = me.viewer.scene.globe.ellipsoid.cartesianToCartographic(cartesian);
                    if(cartographic){
                        //海拔
                        let height = me.viewer.scene.globe.getHeight(cartographic);
                        //视角海拔高度
                        let he = Math.sqrt(me.viewer.scene.camera.positionWC.x * me.viewer.scene.camera.positionWC.x + me.viewer.scene.camera.positionWC.y * me.viewer.scene.camera.positionWC.y + me.viewer.scene.camera.positionWC.z * me.viewer.scene.camera.positionWC.z);
                        let he2 = Math.sqrt(cartesian.x * cartesian.x + cartesian.y * cartesian.y + cartesian.z * cartesian.z);
                        //地理坐标（弧度）转经纬度坐标
                        let point=[ cartographic.longitude / Math.PI * 180, cartographic.latitude / Math.PI * 180];
                        if(!height){
                            height = 0;
                        }
                        if(!he){
                            he = 0;
                        }
                        if(!he2){
                            he2 = 0;
                        }
                        if(!point){
                            point = [0,0];
                        }
                        coordinatesDiv.innerHTML = "<span id='cd_label' style='font-size:13px;text-align:center;font-family:微软雅黑;color:#edffff;'>视角海拔高度:"+(he - he2).toFixed(2)+"米&nbsp;&nbsp;&nbsp;&nbsp;海拔:"+height.toFixed(2)+"米&nbsp;&nbsp;&nbsp;&nbsp;经度：" + point[0].toFixed(6) + "&nbsp;&nbsp;纬度：" + point[1].toFixed(6)+ "</span>";
                    }
                }
            }
        // eslint-disable-next-line no-undef
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    }    
  }

  /**
   * 隐藏logo以及地图服务版权信息
   * @method hideMapLogo
   * @param
   * @return
   */
  hideMapLogo = () => {
    this.viewer._cesiumWidget._creditContainer.style.display = "none";
  }

  //Cesium 限制相机进入地下
  limitCameraToGround = (isOpen) => {
    const me = this;
    if (me.limitCameraHandler) {
      me.limitCameraHandler();
      me.limitCameraHandler = null;
    }
    me.limitCameraHandler = me.viewer.camera.changed.addEventListener(function() {
          // eslint-disable-next-line no-undef
          if (me.viewer.camera._suspendTerrainAdjustment && me.viewer.scene.mode === Cesium.SceneMode.SCENE3D) {
            me.viewer.camera._suspendTerrainAdjustment = !isOpen;
            me.viewer.camera._adjustHeightForTerrain();
          }
    });    
  }

  //监听地图点击事件
  onBaseLayerChange = e => {
    //判断当前底图是否等于监管影像
    // if(e.layer._url === config.onlineBasemaps[0].url){
    //   this.setState({ showImageTimeText: true });       
    // }
    // else{
    //   this.setState({ showImageTimeText: false });
    // }

  };
  //监听地图移动完成事件
  onMoveendMap = e => {
    // const me = this;
    // const { map } = this;
    // let zoom = map.getZoom();
    // let bounds = map.getBounds();
    // //根据地图当前范围获取对应监管影像时间
    // const { showImageTimeText } = me.state;
    // if (showImageTimeText) {
    //   me.getInfoByExtent(zoom, bounds, data => {
    //      me.setState({ imageTimeText: data[0] });  
    //   });
    // }
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
    // const me = this;
    // let urlString = config.mapUrl.getInfoByExtent;
    // let xyMin = proj4("EPSG:4326", "EPSG:3857", [
    //   bounds.getSouthWest().lng,
    //   bounds.getSouthWest().lat
    // ]);
    // let xyMax = proj4("EPSG:4326", "EPSG:3857", [
    //   bounds.getNorthEast().lng,
    //   bounds.getNorthEast().lat
    // ]);
    // let param = {
    //   level: zoom, //地图当前范围级别
    //   xmin: xyMin[0], //地图当前范围x最小值
    //   xmax: xyMax[0], //地图当前范围x最大值
    //   ymin: xyMin[1], //地图当前范围y最小值
    //   ymax: xyMax[1] //地图当前范围y最大值
    // };
    // let geojsonUrl = urlString + L.Util.getParamString(param, urlString);
    // me.props.dispatch({
    //   type: "mapdata/getInfoByExtent",
    //   payload: { geojsonUrl },
    //   callback: callback
    // });
  };  
  //监听地图鼠标移动事件
  showImageInfos = e => {
    // const {mapdata:{imageTimeResult}} = this.props; 
    // const me = this;
    // //根据地图当前范围获取对应监管影像时间
    // const { showImageTimeText } = me.state;
    // if (showImageTimeText && imageTimeResult) {
    //   let tileInfos = imageTimeResult.tileInfos;
    //   if(tileInfos.length>0){
    //     let pt = proj4("EPSG:4326", "EPSG:3857", [
    //       e.latlng.lng,
    //       e.latlng.lat
    //     ]);
    //     for (let i=0; i < tileInfos.length; i++) {
    //       let item = tileInfos[i];
    //       if (pt[0] >= item.xmin && pt[0] <= item.xmax && pt[1] >= item.ymin && pt[1] <= item.ymax) {
    //         let data = item.data;
    //         if (data && data.hasOwnProperty("takenDate")) {
    //             me.setState({ imageTimeText: data.takenDate });
    //         }
    //         return true;
    //       }  

    //     }
    //   }
    // }
  } 
  // 创建图层管理控件
  createToc = () => {
  };  
  // 创建地图导航控件
  createNavigationControl = () => {
    // eslint-disable-next-line no-undef
    this.viewer.extend(Cesium.viewerCesiumNavigationMixin, {defaultResetView:this.defaultResetView});
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
