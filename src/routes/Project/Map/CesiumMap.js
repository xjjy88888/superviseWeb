import React, { PureComponent } from "react";
import { connect } from "dva";
import Layouts from "../../../components/Layouts";
import proj4 from "proj4";
import config from "../../../config";
// import $ from "jquery";
import $ from './jquery-vendor'
import 'ztree';
import 'ztree/css/zTreeStyle/zTreeStyle.css';


@connect(({ mapdata }) => ({
  mapdata
}))
export default class homePage extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      imageTimeText:'',
      showImageTimeText:true,
      showLayerContainer:false,
    };
    this.viewer = null;
    this.initExtent = null;
    this.defaultResetView = null;
    this.tileset = null;
    this.cesiumLayerList = [];
    this.layer3DList=[];
    this.treeObj = null;
    this.onlineBasemapLayers = null;
  }

  componentDidMount() {
    const me = this;  
    // 创建地图
    me.createMap();
    // 创建底图切换控件
    me.createSwitcherMapControl(); 
    //创建3DTiles按钮容器
    me.create3DTilesButton();
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
      // skyBox : false, //天空设置，undefined则显示默认星空
      skyAtmosphere : false,//不显示蓝色的大气层
      //imageryProviderViewModels:this._getImageryViewModels(options.mapInitParams.imageryViewModels),//设置影像图列表，baseLayerPicker配合使用
      //imageryProvider :this.returnProviderViewModel(options.mapInitParams.imageryViewModels[0]),//baseLayerPicker设置false才生效，默认加载的底图
      sceneModePicker : false,//是否显示地图2D2.5D3D模式  
    });
    //监听地图移动完成事件
    me.viewer.camera.moveEnd.addEventListener(this.onMoveendMap);

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
      $(".cesium-viewer-fullscreenContainer").css("z-index","100");
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

    //设置为true时,球体会有高程遮挡效果(在没有地形时候也会有高程遮挡效果)
    //me.viewer.scene.globe.depthTestAgainstTerrain = true;
   
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
    $(".cesium-viewer").append(baseLayerSwitcherToolbar.target);
    let curlayer = null;
    baseLayerSwitcherToolbar.onItemClick = function(itemData,index,element){
        // console.log('itemData',itemData);
        //清空指定ID的底图imageryLayers
        me.removeLayerByID("baseMap");
        const layers = me.viewer.scene.imageryLayers;
        curlayer = layers.addImageryProvider(me.returnProviderViewModel(cesiumMapInitParams.imageryViewModels[index]));
        layers.lowerToBottom(curlayer);
        me.cesiumLayerList.push({layer:curlayer,id:"baseMap"});
        //判断当前底图是否等于监管影像
        if(itemData.Url === config.onlineBasemaps[0].url){
          me.setState({ showImageTimeText: true });       
        }
        else{
          me.setState({ showImageTimeText: false });
        }
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
    const me = this;
    const { cesiumMapInitParams } = config;
    let html ='<button id="cesium-layer-btn" type="button" class="cesium-button cesium-toolbar-button cesium-layer-button" title="图层控制">';
    html += '<img src="./g/component/Cesium/images/layer.png" width="30" height="30">';
    html += '</img>';    
    html += '</button>';
    $(".cesium-viewer-toolbar").append(html);
    //加载ztree目录树数据源
    me.Init3DTreeLayers(cesiumMapInitParams.overlayLayers);
    //点击事件显示以及隐藏 ztree目录树
    $("#cesium-layer-btn").on("click", function () {
      const { showLayerContainer } = me.state;
      me.setState({ showLayerContainer: !showLayerContainer });   
    });     
  };

  /*初始化三维目录树图层*/
  Init3DTreeLayers = (layersconfig) => {
    const me = this;
    const setting = {
        check: {
            enable: true
        },
        data: {
            simpleData: {
                enable: true
            }
        },
        callback: {
            onCheck: function (e, treeId, treeNode) {
                if (treeNode.checked) {//勾选状态下,显示地图控件
                    if (treeNode.children) { //勾选专题目录
                        for (let i = 0; i < treeNode.children.length; i++) {
                          me.loadServerTypeMap(treeNode.children[i].id, treeNode.children[i].type, treeNode.children[i].layerurl, treeNode.children[i].layerid, treeNode.children[i].proxyUrl,treeNode.children[i].IsWebMercatorTilingScheme);
                        }
                    }
                    else {//勾选叶节点
                          me.loadServerTypeMap(treeNode.id, treeNode.type, treeNode.layerurl, treeNode.layerid, treeNode.proxyUrl,treeNode.IsWebMercatorTilingScheme);
                    }
                }
                else { //去掉勾选框,隐藏地图控件
                    if (treeNode.children) { //专题目录
                        for (let i = 0; i < treeNode.children.length; i++) {
                          me.deleteServerTypeMap(treeNode.children[i].id);
                        }
                    }
                    else {//叶节点
                         me.deleteServerTypeMap(treeNode.id);
                    }
                }
            }
        }
    };
    const ztreeRoleAuth = $("#ztreeThemeServerOfLayer");
    $.fn.zTree.init(ztreeRoleAuth, setting, layersconfig);
    this.treeObj = $.fn.zTree.getZTreeObj("ztreeThemeServerOfLayer");
    this.treeObj.expandAll(true);
    //加载已经勾选的图层
    const nodes = this.treeObj.getCheckedNodes(true);
    if(nodes.length>0){
        for(let i=0;i<nodes.length;i++){
            if(!nodes[i].isParent){//节点图层
               me.loadServerTypeMap(nodes[i].id, nodes[i].type, nodes[i].layerurl, nodes[i].layerid, nodes[i].proxyUrl,nodes[i].IsWebMercatorTilingScheme);
            }
        }
    }   
  }

  /**
   * 加载不同类型地图服务的底图
   @ id 图层的id标识
    @ servertype 地图服务类型(0代表ArcGisMapServerImageryProvider;1代表OpenStreetMapImageryProvider;
    2代表WebMapTileServiceImageryProvider;3代表TileMapServiceImageryProvider;
    4 代表UrlTemplateImageryProvider;5 代表WebMapServiceImageryProviderr(WMS));6 代表kml,kmz;7 代表geoJson
    @ url 地图服务的url
    @ layerid 地图图层的id
    @ proxyUrl 代理请求url
    @ tilingScheme 地图坐标系,WebMercatorTilingScheme(摩卡托投影坐标系3857);GeographicTilingScheme(世界地理坐标系4326)
  */
  loadServerTypeMap = (id, servertype, url, layerid, proxyUrl,IsWebMercatorTilingScheme) => {
    const layers = this.viewer.scene.imageryLayers;
    let layer = null;
    let curlayer = null;
    switch (servertype) {
        case 0://ArcGisMapServerImageryProvider
            // eslint-disable-next-line no-undef
            curlayer = layers.addImageryProvider(new Cesium.ArcGisMapServerImageryProvider({
                // eslint-disable-next-line no-undef
                proxy : new Cesium.DefaultProxy(proxyUrl),
                url : url,
                layers:layerid,
                enablePickFeatures : false
            }));
            layer = {layer:curlayer,id:id};
            break;
        case 1://OpenStreetMapImageryProvider
            // eslint-disable-next-line no-undef
            curlayer = layers.addImageryProvider(new Cesium.OpenStreetMapImageryProvider({
                url : url
            }));
            layer = {layer:curlayer,id:id};
            break;
        case 2://WebMapTileServiceImageryProvider 天地图
            // obj= { layer:model.layer,style:model.style,format:model.format,tileMatrixSetID:model.tileMatrixSetID,subdomains:model.subdomains};
            // provider = Object.assign(provider, obj);
            // // eslint-disable-next-line no-undef
            // providerViewModel = new Cesium.WebMapTileServiceImageryProvider(provider);
            // eslint-disable-next-line no-undef
            curlayer = layers.addImageryProvider(new Cesium.WebMapTileServiceImageryProvider({
                url : url,
                layer:layerid,
                style:'default',
                format:'tiles',
                subdomains:["0", "1", "2", "3", "4", "5", "6", "7"]
            }));
            layer = {layer:curlayer,id:id};        
            break;
        case 3://TileMapServiceImageryProvider
            break;
        case 4://UrlTemplateImageryProvider
            break;
        case 5://WebMapServiceImageryProvider
            // eslint-disable-next-line no-undef
            let m_tilingScheme = new Cesium.GeographicTilingScheme();
            if(IsWebMercatorTilingScheme){
                // eslint-disable-next-line no-undef
                m_tilingScheme = new Cesium.WebMercatorTilingScheme();
            }
            // eslint-disable-next-line no-undef
            curlayer = layers.addImageryProvider(new Cesium.WebMapServiceImageryProvider({
                url: url,
                layers: layerid,
                tilingScheme:m_tilingScheme,
                parameters : {
                    service:"WMS",
                    version:"1.1.1",
                    request:"GetMap",
                    transparent : true,
                    format : 'image/png'
                },
                enablePickFeatures : false,
                show: false
            }));
            layer = {layer:curlayer,id:id};
            break;
        case 6://kml,kmz
            var options = {
                camera : this.viewer.scene.camera,
                canvas : this.viewer.scene.canvas
            };
            // eslint-disable-next-line no-undef
            this.viewer.dataSources.add(Cesium.KmlDataSource.load(url, options)).then(function(dataSource){
               this.viewer.camera.flyHome();
            });
            break;
        case 7://geoJson
            // eslint-disable-next-line no-undef
            this.viewer.dataSources.add(Cesium.GeoJsonDataSource.load(url)).then(function(dataSource){
               this.viewer.zoomTo(dataSource);
            });
            break;
        default://ArcGisMapServerImageryProvider
            // eslint-disable-next-line no-undef
            curlayer = layers.addImageryProvider(new Cesium.ArcGisMapServerImageryProvider({
                // eslint-disable-next-line no-undef
                proxy : new Cesium.DefaultProxy(proxyUrl),
                url : url,
                layers:layerid,
                enablePickFeatures : false
            }));
            layer = {layer:curlayer,id:id};
            break;
    }
    if(layer)
        this.layer3DList.push(layer);   
  } 

  /**
   * 删除指定ID的图层
   */
  deleteServerTypeMap = (id) => {
    // eslint-disable-next-line default-case
    switch(typeof(id))
    {
        case "number":
            if(this.layer3DList.length>0){
                for(let i=0;i<this.layer3DList.length;i++){
                    if(this.layer3DList[i].id === id){
                        this.viewer.scene.imageryLayers.remove(this.layer3DList[i].layer);
                    }
                }
            }
            break;
        case "string":
            var len = this.viewer.dataSources.length;
            if(len>0){
                for(let i=0;i<len;i++){
                    var dataSource = this.viewer.dataSources.get(i);
                    if(dataSource._name && dataSource._name === id){
                      this.viewer.dataSources.remove(dataSource);
                    }
                }
            }
            break;
        case "undefined":
            break;
    }   
  }

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
    $(".cesium-viewer-toolbar").append(html); 
    $("#cesium-3DTiles-btn").on("click", function () {
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
        // me.changeHeight(tileset,-1000);       
    }).otherwise(function (error) {
        throw (error);
    });   
  }

  /*调整3dtiles模型高度*/
  changeHeight = (tileset,height) => {
    height = Number(height);
    if (isNaN(height)) {
    return;
    }
    // eslint-disable-next-line no-undef
    var cartographic = Cesium.Cartographic.fromCartesian(tileset.boundingSphere.center);
        // eslint-disable-next-line no-undef
    var surface = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, cartographic.height);
        // eslint-disable-next-line no-undef
    var offset = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude,height);
        // eslint-disable-next-line no-undef
    var translation = Cesium.Cartesian3.subtract(offset, surface, new Cesium.Cartesian3());
        // eslint-disable-next-line no-undef
    tileset.modelMatrix = Cesium.Matrix4.fromTranslation(translation);    
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
            obj= { layer:model.layer,style:model.style,format:model.format,tileMatrixSetID:model.tileMatrixSetID,subdomains:model.subdomains};
            provider = Object.assign(provider, obj);
            // eslint-disable-next-line no-undef
            providerViewModel = new Cesium.WebMapTileServiceImageryProvider(provider);
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
            obj= {credit:model.credit,subdomains:model.subdomains};
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
    $(".cesium-viewer").append(elementbottom);
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
        $(".cesium-viewer").append(coordinatesDiv);
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
                        coordinatesDiv.innerHTML = "<span id='cd_label' style='font-size:13px;text-align:center;font-family:微软雅黑;color:#edffff;'>视角高度:"+(he - he2).toFixed(2)+"米&nbsp;&nbsp;&nbsp;&nbsp;海拔高度:"+height.toFixed(2)+"米&nbsp;&nbsp;&nbsp;&nbsp;经度：" + point[0].toFixed(6) + "&nbsp;&nbsp;纬度：" + point[1].toFixed(6)+ "</span>";
                        //刷新监管影像时间信息
                        me.showImageInfos(point);
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
    
    /*me.limitCameraHandler = me.viewer.scene.postRender.addEventListener(function() {
      // eslint-disable-next-line no-undef
      if (me.viewer.camera._suspendTerrainAdjustment && me.viewer.scene.mode === Cesium.SceneMode.SCENE3D) {
        me.viewer.camera._suspendTerrainAdjustment = !isOpen;
        me.viewer.camera._adjustHeightForTerrain();
      }
    });*/       
    
  }

  limitCamera = (viewer) => {
      /**
       * 设置后当相机高度达到设置的最大和最小高度时将不再放大和缩小
       */
      viewer.scene.screenSpaceCameraController.minimumZoomDistance = 50;//相机的高度的最小值
      viewer.scene.screenSpaceCameraController.maximumZoomDistance = 20000;  //相机高度的最大值
      viewer.scene.screenSpaceCameraController._minimumZoomRate = 50; // 设置相机缩小时的速率
      viewer.scene.screenSpaceCameraController._maximumZoomRate=500000000   //设置相机放大时的速率

      // 限制相机钻到地下
      // eslint-disable-next-line no-undef
      var minPitch = -Cesium.Math.PI_OVER_TWO;
      var maxPitch = 0;
      var minHeight = 50;

      viewer.camera.changed.addEventListener(
      function() {
      // eslint-disable-next-line no-undef
      if (viewer.camera._suspendTerrainAdjustment && viewer.scene.mode === Cesium.SceneMode.SCENE3D) {
      viewer.camera._suspendTerrainAdjustment = false;
      viewer.camera._adjustHeightForTerrain();
      }

      // Keep camera in a reasonable pitch range
      var pitch = viewer.camera.pitch;

      if (pitch > maxPitch || pitch < minPitch) {
      viewer.scene.screenSpaceCameraController.enableTilt = false;

      // clamp the pitch
      if(pitch > maxPitch ) { 
      pitch = maxPitch; 
      } else if(pitch < minPitch) {
      pitch = minPitch;
      }

      // eslint-disable-next-line no-undef
      var destination = Cesium.Cartesian3.fromRadians(
      viewer.camera.positionCartographic.longitude,
      viewer.camera.positionCartographic.latitude,
      Math.max(viewer.camera.positionCartographic.height, minHeight));

      viewer.camera.setView({
      destination: destination,
      orientation: { pitch: pitch }
      });
      viewer.scene.screenSpaceCameraController.enableTilt = true;
      }
      }
      );    
  }

  //监听地图移动完成事件
  onMoveendMap = () => {
    const me = this;
    //获取当前相机高度
    let height = Math.ceil(me.viewer.camera.positionCartographic.height);
    let zoom = me.heightToZoom(height);
    let bounds = me.getCurrentExtent();
    // console.log('地图变化监听事件',zoom,bounds);
    //根据地图当前范围获取对应监管影像时间
    const { showImageTimeText } = me.state;
    if (showImageTimeText) {
      me.getInfoByExtent(zoom, bounds, data => {
        //  console.log('data',data);
         me.setState({ imageTimeText: data[0] });  
      });
    }
  }; 
  /*
   *获取当前三维范围
   *extent,返回当前模式下地图范围[xmin,ymin,xmax,ymax]
   *extent,返回当前模式下地图范围{xmin,ymin,xmax,ymax}
  */
  getCurrentExtent = () => {
    //获取当前三维地图范围
    var Rectangle = this.viewer.camera.computeViewRectangle();
    //地理坐标（弧度）转经纬度坐标
    var extent=[ Rectangle.west / Math.PI * 180, Rectangle.south / Math.PI * 180, Rectangle.east / Math.PI * 180, Rectangle.north / Math.PI * 180];
    //var cartographic1 = proj4('EPSG:4326', 'EPSG:3857', [extent[0], extent[1]]);
    //var cartographic2 = proj4('EPSG:4326', 'EPSG:3857', [extent[2], extent[3]]);
    // eslint-disable-next-line no-undef
    //extent = new Cesium.Rectangle(cartographic1[0], cartographic1[1], cartographic2[0], cartographic2[1]);
    return extent;
     /*// 范围对象
     var extent = {};
    
     // 得到当前三维场景
     var scene = this.viewer.scene;
     
     // 得到当前三维场景的椭球体
     var ellipsoid = scene.globe.ellipsoid;
     var canvas = scene.canvas;
     
     // canvas左上角
     // eslint-disable-next-line no-undef
     var car3_lt = this.viewer.camera.pickEllipsoid(new Cesium.Cartesian2(0,0), ellipsoid);
     
     // canvas右下角
     // eslint-disable-next-line no-undef
     var car3_rb = this.viewer.camera.pickEllipsoid(new Cesium.Cartesian2(canvas.width,canvas.height), ellipsoid);
     
     // 当canvas左上角和右下角全部在椭球体上
     if (car3_lt && car3_rb) {
         var carto_lt = ellipsoid.cartesianToCartographic(car3_lt);
         var carto_rb = ellipsoid.cartesianToCartographic(car3_rb);
              // eslint-disable-next-line no-undef
         extent.xmin = Cesium.Math.toDegrees(carto_lt.longitude);
              // eslint-disable-next-line no-undef
         extent.ymax = Cesium.Math.toDegrees(carto_lt.latitude);
              // eslint-disable-next-line no-undef
         extent.xmax = Cesium.Math.toDegrees(carto_rb.longitude);
              // eslint-disable-next-line no-undef
         extent.ymin = Cesium.Math.toDegrees(carto_rb.latitude);
     }
     
     // 当canvas左上角不在但右下角在椭球体上
     else if (!car3_lt && car3_rb) {
         var car3_lt2 = null;
         var yIndex = 0;
         do {
             // 这里每次10像素递加，一是10像素相差不大，二是为了提高程序运行效率
             // eslint-disable-next-line no-unused-expressions
             yIndex <= canvas.height ? yIndex += 10 : canvas.height;
             // eslint-disable-next-line no-undef
             car3_lt2 = this.viewer.camera.pickEllipsoid(new Cesium.Cartesian2(0,yIndex), ellipsoid);
         }while (!car3_lt2);
         var carto_lt2 = ellipsoid.cartesianToCartographic(car3_lt2);
         var carto_rb2 = ellipsoid.cartesianToCartographic(car3_rb);
                       // eslint-disable-next-line no-undef
         extent.xmin = Cesium.Math.toDegrees(carto_lt2.longitude);
                       // eslint-disable-next-line no-undef
         extent.ymax = Cesium.Math.toDegrees(carto_lt2.latitude);
                       // eslint-disable-next-line no-undef
         extent.xmax = Cesium.Math.toDegrees(carto_rb2.longitude);
                       // eslint-disable-next-line no-undef
         extent.ymin = Cesium.Math.toDegrees(carto_rb2.latitude);
     }    
     // 获取高度
    //  extent.height = Math.ceil(this.viewer.camera.positionCartographic.height);
     return extent;*/       
  }
  /*根据camera高度近似计算当前层级*/  
  heightToZoom = (height) => {
    var A = 40487.57;
    var B = 0.00007096758;
    var C = 91610.74;
    var D = -40467.74;
    return Math.round(D+(A-D)/(1+Math.pow(height/C, B)));
  }
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
    const mercator_xmin  = -20037508.34;
    const mercator_ymin  = -20037508.34;
    const mercator_xmax  = 20037508.34;
    const mercator_ymax  = 20037508.34;
    let xmin,xmax,ymin,ymax;
    if(bounds[0] === -180){
      xmin = mercator_xmin;
      xmax = mercator_xmax;
      ymin = mercator_ymin;
      ymax = mercator_ymax;
    }
    else{
      let xyMin = proj4("EPSG:4326", "EPSG:3857", [
        bounds[0],
        bounds[1]
      ]);
      xmin = xyMin[0];
      ymin = xyMin[1];
      let xyMax = proj4("EPSG:4326", "EPSG:3857", [
        bounds[2],
        bounds[3]
      ]);
      xmax = xyMax[0];
      ymax = xyMax[1];
    }  
    let param = {
      level: zoom, //地图当前范围级别
      xmin: xmin, //地图当前范围x最小值
      xmax: xmax, //地图当前范围x最大值
      ymin: ymin, //地图当前范围y最小值
      ymax: ymax //地图当前范围y最大值
    };
    // console.log('param',param);
    let geojsonUrl = urlString + me.getParamString(param, urlString);
    // console.log('geojsonUrl',geojsonUrl);
    me.props.dispatch({
      type: "mapdata/getInfoByExtent",
      payload: { geojsonUrl },
      callback: callback
    });
  }; 
  
  getParamString = (obj, existingUrl, uppercase) => {
    var params = [];
    for (var i in obj) {
      params.push(encodeURIComponent(uppercase ? i.toUpperCase() : i) + '=' + encodeURIComponent(obj[i]));
    }
    return ((!existingUrl || existingUrl.indexOf('?') === -1) ? '?' : '&') + params.join('&');    
  }

  //经度转墨卡托
  handle_x = (x) => {
    return (x / 180.0) * 20037508.34;
  }

  //纬度度转墨卡托
  handle_y = (y) => {
    if (y > 85.05112) {
      y = 85.05112;
    }
    
    if (y < -85.05112) {
      y = -85.05112;
    }
    
    y = (Math.PI / 180.0) * y;
    var tmp = Math.PI / 4.0 + y / 2.0;
    return 20037508.34 * Math.log(Math.tan(tmp)) / Math.PI; 

  }

  //墨卡托转经度
  handle_me_x = (x) => {
    return x/20037508.34*180;
  }

  //墨卡托转纬度
  handle_me_y = (y) => {
    var my = y/20037508.34*180;
    return 180/Math.PI*(2*Math.atan(Math.exp(my*Math.PI/180))-Math.PI/2);
  
  }

  //监听地图鼠标移动事件
  showImageInfos = point => {
    const {mapdata:{imageTimeResult}} = this.props; 
    const me = this;
    //根据地图当前范围获取对应监管影像时间
    const { showImageTimeText } = me.state;
    if (showImageTimeText && imageTimeResult) {
      let tileInfos = imageTimeResult.tileInfos;
      if(tileInfos && tileInfos.length>0){
        let pt = proj4("EPSG:4326", "EPSG:3857", [
          point[0],
          point[1]
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

  render() {
    const {
      imageTimeText,
      showImageTimeText,
      showLayerContainer,
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
          {/* 图层叠加面板 */}
          <div
            style={{
              display: showLayerContainer ? "block" : "none",
              width:150,
              position: "absolute",
              top: 95,
              right: 10, 
              background: 'rgba(0, 0, 0, 0.5)'          
            }}
          >
            <ul id="ztreeThemeServerOfLayer" className="ztree"></ul>
          </div>
          {/* 监管影像时间显示信息 */}
          <div
            style={{
              display: showImageTimeText ? "block" : "none",
              position: "absolute",
              bottom: 5,
              right: 150,
              zIndex: 1000,
              color:'#fff',
              fontSize:'13px',
              // background: "rgba(255, 255, 255, 0.8)"
              // background: "#fff"
            }}
          > 
            <span
              style={{
                padding: "0 10px"
              }}
            >
              影像时间:{imageTimeText}
            </span>          
          </div>          
      </div>
      </Layouts>
    );
  }
}
