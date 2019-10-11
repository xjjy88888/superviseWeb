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
    this.tileset = null;
    this.cesiumLayerList = [];
    this.onlineBasemapLayers = null;
  }

  componentDidMount() {
    const me = this;  
    // 创建地图
    me.createMap();
    // 创建底图切换控件
    me.createSwitcherMapControl(); 
    // 创建图层管理控件
    me.createToc();    
    // 创建地图导航控件
    me.createNavigationControl();
  }
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

    //默认加载配置文件第一个底图
    me.viewer.scene.imageryLayers.removeAll();//清空底图
    const layers = me.viewer.scene.imageryLayers;
    const baseLayer = layers.addImageryProvider(me.returnProviderViewModel(cesiumMapInitParams.imageryViewModels[0]));
    layers.lowerToBottom(baseLayer);
    //viewer.scene.globe.show = false;//设置隐藏球体不可见
    me.cesiumLayerList.push({layer:baseLayer,id:"baseMap"});   
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

    //创建3DTiles按钮容器
    me.create3DTilesButton();
    
  }

  // 创建底图切换控件
  createSwitcherMapControl= () => {
    const me = this;
    const { cesiumMapInitParams } = config;
    me.loadSwitcherMap(cesiumMapInitParams.imageryViewModels);
  }

  /**
   * 地图切换控件
  */ 
  loadSwitcherMap= (data) => {
    const me = this;
    const { cesiumMapInitParams } = config;
    //设置底图不同类型
    // eslint-disable-next-line no-undef
    const baseLayerSwitcherToolbar = new BaseLayerSwitcherToolBar({
        data: data
    });
    jQuery(".cesium-viewer").append(baseLayerSwitcherToolbar.target);
    let curlayer = null;
    baseLayerSwitcherToolbar.onItemClick = function(itemData,index,element){
        //var data = itemData.data;
        // const data = itemData;
        //清空指定ID的底图imageryLayers
        me.removeLayerByID("baseMap");
        const layers = me.viewer.scene.imageryLayers;
        // curlayer = layers.addImageryProvider(me.returnProviderViewModel(cesiumMapInitParams.imageryViewModels[data.id]));
        curlayer = layers.addImageryProvider(me.returnProviderViewModel(cesiumMapInitParams.imageryViewModels[index]));
        layers.lowerToBottom(curlayer);
        me.cesiumLayerList.push({layer:curlayer,id:"baseMap"});
    };   
  }

  /**
   * 删除指定id的底图
   * @method removeLayerByID
   * @param  id
   * @return
   */
  removeLayerByID = (id) => {
    if(this.cesiumLayerList.length>0){
      for(var i=0;i<this.cesiumLayerList.length;i++){
          if(this.cesiumLayerList[i].id === id){
              this.viewer.scene.imageryLayers.remove(this.cesiumLayerList[i].layer);
          }
      }
  }    
  }
  
  // 创建图层管理控件
  createToc = () => {
  };  

  // 创建地图导航控件
  createNavigationControl = () => {
    // eslint-disable-next-line no-undef
    this.viewer.extend(Cesium.viewerCesiumNavigationMixin, {defaultResetView:this.defaultResetView});
  };

  /*创建3DTiles按钮容器*/
  create3DTilesButton = () =>{
    const me = this;
    const { cesiumMapInitParams } = config;
    let html ='<button id="cesium-3DTiles-btn" type="button" class="cesium-button cesium-toolbar-button cesium-3DTiles-button" title="倾斜模型">';
    html += '<svg class="cesium-svgPath-svg" width="28" height="28" viewBox="0 0 310.288 310.288" >';
    // html += '<path d="M14,4l-10,8.75h20l-4.25-3.7188v-4.6562h-2.812v2.1875l-2.938-2.5625zm-7.0938,9.906v10.094h14.094v-10.094h-14.094zm2.1876,2.313h3.3122v4.25h-3.3122v-4.25zm5.8442,1.281h3.406v6.438h-3.406v-6.438z"></path>';
    html += '<g><g><polygon style="fill:#FFC843;" points="287.641,76.497 155.144,0 22.647,76.497 155.144,152.993"/></g><g><polygon style="fill:#0071CE;" points="155.144,310.288 22.647,233.792 22.647,76.497 155.144,152.993"/></g><g><polygon style="fill:#00AF41;" points="155.144,310.288 287.641,233.792 287.641,76.497 155.144,152.993"/></g><g><path style="fill:#1E252B;" d="M64.62,208.163c2.68,3.262,8.896,9.53,15.434,13.304c12.109,6.992,15.86,1.44,15.754-4.408c-0.107-9.815-8.896-19.069-18.005-24.328l-5.251-3.032v-7.073l5.251,3.031c6.859,3.96,15.54,5.435,15.54-2.817c0-5.573-3.537-12.546-12.218-17.558c-5.572-3.217-10.932-3.846-13.932-3.435l-2.466-8.283c3.645-0.576,10.718,0.829,18.219,5.16c13.718,7.92,19.935,19.654,19.935,28.121c0,7.181-4.287,10.815-12.86,8.974v0.214c8.573,6.665,15.539,17.117,15.539,26.871c0,11.146-8.681,15.888-25.398,6.235c-7.824-4.517-14.684-10.942-18.112-15.173L64.62,208.163z"/></g><g><path style="fill:#1E252B;" d="M197.157,174.405c5.68-4.137,12.432-8.677,19.826-12.947c13.396-7.734,22.935-10.132,29.258-7.889c6.43,2.182,10.181,8.376,10.181,20.059c0,11.79-3.644,23.539-10.396,34.083c-6.752,10.65-17.897,20.729-31.937,28.835c-6.645,3.836-12.218,6.731-16.933,8.918L197.157,174.405L197.157,174.405z M206.48,232.9c2.358-0.933,5.787-2.805,9.431-4.909c19.935-11.509,30.759-28.905,30.759-48.412c0.106-17.103-9.538-22.358-29.258-10.973c-4.822,2.784-8.466,5.315-10.932,7.275V232.9z"/></g></g>';
    html += '</svg>';    
    html += '</button>';
    jQuery(".cesium-viewer-toolbar").append(html); 
    jQuery("#cesium-3DTiles-btn").on("click", function () {
      me.add3DTile(cesiumMapInitParams.Tiles3D);
    });  
  }

  /**
   * 加载指定的3DTitle模型
   * @method add3DTile
   * @param  obj
   * @return
   */
  add3DTile= (obj) => {
    const me = this;
    if(me.tileset){
      me.viewer.scene.primitives.remove(me.tileset);      
    }
    // eslint-disable-next-line no-undef
    me.tileset = me.viewer.scene.primitives.add(new Cesium.Cesium3DTileset({
        url:obj.url,
        maximumScreenSpaceError: 2,//默认16,最大屏幕空间错误
        maximumMemoryUsage:1024//默认512,内存MB的最大数量
    }));
    me.tileset.readyPromise.then(function(tileset) {
        // // eslint-disable-next-line no-undef
        // me.viewer.camera.viewBoundingSphere(tileset.boundingSphere, new Cesium.HeadingPitchRange(0, -0.5, 0));
        // // eslint-disable-next-line no-undef
        // me.viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
        me.viewer.zoomTo(tileset);       
    }).otherwise(function (error) {
        throw (error);
    });   
  }

  /**
   * 删除指定的3DTitle模型
   * @method remove3DTile
   * @param  primitive
   * @return
   */
  remove3DTile= (primitive) => {
    this.viewer.scene.primitives.remove(primitive);      
  }  

  /**
   * 返回地图服务imageryProvider
   * @method returnProviderViewModel
   * @param  model 配置文件中的底图服务列表其中一个选项
   * @return imageryProvider
   */ 
  returnProviderViewModel = (model) => {
    let provider ={};
    let obj = null;
    let providerViewModel = null;
    // if(model.proxyUrl && model.proxyUrl.length>0){
    //   // eslint-disable-next-line no-undef
    //   provider = {proxy : new Cesium.DefaultProxy(model.proxyUrl),url : model.Url};
    // }
    // else{
    //   provider = {url : model.Url};
    // }
    
    // eslint-disable-next-line no-undef
    provider = model.proxyUrl && model.proxyUrl.length>0 ? {proxy : new Cesium.DefaultProxy(model.proxyUrl),url : model.Url}: {url : model.Url};

    switch (model.type) {
        case 0://ArcGisMapServerImageryProvider
            obj= {enablePickFeatures:false};
            provider = Object.assign(provider, obj);
            // eslint-disable-next-line no-undef
            providerViewModel = new Cesium.ArcGisMapServerImageryProvider(provider);
            break;
        case 1://OpenStreetMapImageryProvider
            // eslint-disable-next-line no-undef
            providerViewModel = new Cesium.OpenStreetMapImageryProvider(provider);
            //providerViewModel = Cesium.createOpenStreetMapImageryProvider(provider);
            break;
        case 2://WebMapTileServiceImageryProvider
            /*var obj= { layer:model.layer,style:model.style,format:model.format,tileMatrixSetID:model.tileMatrixSetID};
            provider = Object.assign(provider, obj);
            return new Cesium.WebMapTileServiceImageryProvider(provider);*/
            // var obj= { layer:model.layer,style:model.style,format:model.format,tileMatrixSetID:model.tileMatrixSetID};
            // provider = Object.assign(provider, obj);
            // var tdtProvider = new TDTWMTSImageProvider(provider.url, false, 1, 18);
            // return tdtProvider;
            break;
        case 3://TileMapServiceImageryProvider
            obj= {credit:model.credit,fileExtension:model.fileExtension};
            provider = Object.assign(provider, obj);
            // eslint-disable-next-line no-undef
            providerViewModel = new Cesium.TileMapServiceImageryProvider(provider);
            //providerViewModel = Cesium.createTileMapServiceImageryProvider(provider);
            break;
        case 4://Cesium.UrlTemplateImageryProvider
            obj= {credit:model.credit};
            provider = Object.assign(provider, obj);
            // eslint-disable-next-line no-undef
            providerViewModel = new Cesium.UrlTemplateImageryProvider(provider);
            break;
        case 5://Cesium.WebMapServiceImageryProvider
            obj= {credit:model.credit,layers:model.layers,tilingScheme:model.tilingScheme};
            provider = Object.assign(provider, obj);
            // eslint-disable-next-line no-undef
            providerViewModel = new Cesium.WebMapServiceImageryProvider(provider);
            break;
        default:
            obj= {enablePickFeatures:false};
            provider = Object.assign(provider, obj);
            // eslint-disable-next-line no-undef
            providerViewModel = new Cesium.ArcGisMapServerImageryProvider(provider);
            break;
    } 
    return providerViewModel;  
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
