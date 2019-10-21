const l = window.location;
const isFormal = l.href.split('/')[3] === 'stbcjg';
const isLocal = l.hostname === 'localhost';

console.log(`%c当前版本：v2.0.11`, 'color:green;font-size:30px');

console.log(isLocal ? '本地环境' : isFormal ? '正式环境' : '测试环境');

const domain = isLocal
  ? 'http://183.6.178.124:8001/stbct/'
  : `${l.origin}/stbc${isFormal ? '' : 't'}/`;

const domainApi = domain + 'api/services/app/';

const imageBaseUrl = 'http://www.stbcjg.cn/BasemapService/rest/image';
const imageQueryBaseUrl = 'http://210.36.22.122/BasemapService/rest/image';

const color_back_spot = 'rgba(255,255,0,0.4)'; //背景色-图斑
const color_back_redLine = 'rgba(230,0,0,0.4)'; //背景色-红线
const color_border_spot1 = '#ffd700'; //边框色-图斑-未复核
const color_border_spot2 = '#E09A00'; //边框色-图斑-已复核
const color_border_redLine = '#e60000'; //边框色-红线

const myOnlineImageUrl =
  'http://www.stbcjg.cn/BasemapService/rest/image/latest/tile/{z}/{y}/{x}';
const arcgisVectorUrl =
  'http://cache1.arcgisonline.cn/arcgis/rest/services/ChinaOnlineCommunity/MapServer/tile/{z}/{y}/{x}';
const arcgisImageUrl =
  'https://server.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
const tdtVectorUrl =
  'http://t{s}.tianditu.gov.cn/DataServer?T=vec_w&x={x}&y={y}&l={z}&tk=7786923a385369346d56b966bb6ad62f';
const tdtImageUrl =
  'http://t{s}.tianditu.gov.cn/DataServer?T=img_w&x={x}&y={y}&l={z}&tk=7786923a385369346d56b966bb6ad62f';
const tdtImageLabelUrl =
  'http://t{s}.tianditu.gov.cn/DataServer?T=cia_w&x={x}&y={y}&l={z}&tk=7786923a385369346d56b966bb6ad62f';
// "http://t{s}.tianditu.gov.cn/DataServer?T=cva_w&x={x}&y={y}&l={z}&tk=7786923a385369346d56b966bb6ad62f";
const googleVectorUrl =
  'http://www.google.cn/maps/vt?lyrs=m@189&gl=cn&x={x}&y={y}&z={z}';
const googleImageUrl =
  'http://www.google.cn/maps/vt?lyrs=s@189&gl=cn&x={x}&y={y}&z={z}';
const gaodeVectorUrl =
  'http://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}';
const gaodeImageUrl =
  'http://webst0{s}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}';
// const bdVectorUrl =
//   'http://online{s}.map.bdimg.com/onlinelabel/?qt=tile&x={x}&y={y}&z={z}&styles={styles}&scaler=1&p=1';
// const bdImageUrl =
//   'http://shangetu{s}.map.bdimg.com/it/u=x={x};y={y};z={z};v=009;type=sate&fm=46';
const OSMVectorUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const errorTileUrl = './img/errorTileUrl.png';
//行政边界
// const districtBoundUrl = "http://www.stbcjg.cn:6080/arcgis/rest/services/STBC/XZQH_QG/MapServer";
const districtBoundUrl = `${
  isFormal
    ? 'https://www.zkygis.cn:8143/geoserver/ZKYGIS'
    : 'http://183.6.178.124:8143/geoserver/ZKYGIS'
}`;

const geoserverUrl = `${
  isLocal ? 'http://183.6.178.124:8143' : `${l.protocol}//${l.hostname}:8143`
}/geoserver/ZKYGIS`;
const mapProjectLayerName = isFormal
  ? 'ZKYGIS:bs_project_scope'
  : 'ZKYGIS:bs_project_scope_t'; //现状库项目红线
const mapSpotLayerName = isFormal ? 'ZKYGIS:bs_spot' : 'ZKYGIS:bs_spot_t'; //现状库扰动图斑
const mapDistrictLayerName = isFormal
  ? 'ZKYGIS:district_code'
  : 'ZKYGIS:district_code_t';

const config = {
  domain: domain,
  download: `http://www.zkygis.cn/stbcjg/Template/`,
  export: `${domainApi}File/GetTempFile`,
  templateDescription: `http://docs.qq.com/doc/DTEV2TGRsU0RNQUV0?coord=DeJxzNFRxNFQxgEAAEUUCWQ`,
  isFormal: isFormal,
  topologyCheckUrl: `http://183.6.178.124:8001/apk/lib/拓扑检测工具.zip`,

  url: {
    // 初始化
    initUrl: `${domain}AbpUserConfiguration/GetAll`,

    // 登录
    loginUrl: `${domain}api/TokenAuth/Authenticate`,

    // 项目列表
    projectListUrl: `${domainApi}Project/GetAllByPost`,

    // 项目列表统计
    projectChartUrl: `${domainApi}Project/Statistics`,

    // 项目信息
    projectByIdUrl: `${domainApi}Project/Get`,

    // 项目新建
    projectCreateUrl: `${domainApi}Project/Create`,

    // 项目编辑
    projectUpdateUrl: `${domainApi}Project/Update`,

    // 项目删除
    projectDeleteUrl: `${domainApi}Project/Delete`,

    // 项目批量删除
    projectDeleteMulUrl: `${domainApi}Project/DeleteBatch`,

    // 项目归档
    projectArchiveUrl: `${domainApi}Project/Archive`,

    // 项目撤销归档
    projectUnArchiveUrl: `${domainApi}Project/UnArchive`,

    // 项目重名验证
    projectVerifyUrl: `${domainApi}Project/VaildProjectName`,

    // 项目取消关联图斑
    projectUnbindSpotUrl: `${domainApi}Project/UnbindSpot`,

    // 图斑列表
    spotListUrl: `${domainApi}Spot/GetAllByPost`,

    // 图斑信息
    spotPolygonByIdUrl: `${domainApi}Spot/GetSpotPolygonAll`,

    // 图斑列表统计
    spotChartUrl: `${domainApi}Spot/Statistics`,

    // 图斑信息
    spotByIdUrl: `${domainApi}Spot/Get`,

    // 图斑新建
    spotCreateUrl: `${domainApi}Spot/Create`,

    // 图斑编辑
    spotUpdateUrl: `${domainApi}Spot/Update`,

    // 图斑删除
    spotDeleteUrl: `${domainApi}Spot/Delete`,

    // 图斑批量删除
    spotDeleteMulUrl: `${domainApi}Spot/DeleteBatch`,

    // 图斑归档
    spotArchiveUrl: `${domainApi}Spot/Archive`,

    // 图斑撤销归档
    spotUnArchiveUrl: `${domainApi}Spot/UnArchive`,

    // 图斑历史
    spotHistoryUrl: `${domainApi}Spot/GetHistorySpots`,

    // 图斑同步旧系统附件
    spotOldImgUrl: `${domainApi}File/ImgSyn`,

    // 标注点列表
    pointListUrl: `${domainApi}MarkingPoint/GetAll`,

    // 标注点信息
    pointByIdUrl: `${domainApi}MarkingPoint/Get`,

    // 标注点新建
    pointCreateUrl: `${domainApi}MarkingPoint/Create`,

    // 标注点编辑
    pointUpdateUrl: `${domainApi}MarkingPoint/Update`,

    // 标注点删除
    pointDeleteUrl: `${domainApi}MarkingPoint/Delete`,

    // 标注点批量删除
    pointDeleteMulUrl: `${domainApi}MarkingPoint/DeleteBatch`,

    // 项目红线列表
    redLineListUrl: `${domainApi}ProjectScope/GetAll`,

    // 项目红线信息
    redLineByIdUrl: `${domainApi}ProjectScope/Get`,

    // 项目红线新建
    redLineCreateUrl: `${domainApi}ProjectScope/Create`,

    // 项目红线编辑
    redLineUpdateUrl: `${domainApi}ProjectScope/Update`,

    // 项目红线删除
    redLineDeleteUrl: `${domainApi}ProjectScope/Delete`,

    // 项目红线批量删除
    redLineDeleteMulUrl: `${domainApi}ProjectScope/DeleteBatch`,

    // 附件上传
    annexUploadUrl: `${domainApi}File/UploadAsync`,

    // 附件预览
    annexPreviewUrl: `${domainApi}File/GetFile?id=`,

    // 附件删除
    annexDeleteUrl: `${domainApi}File/Delete`,

    // 导出项目/图斑(附件)数据
    exportUrl: `${domainApi}Export/`,

    // 下载导出项目/图斑(附件)数据
    downloadUrl: `${domainApi}File/GetExportFile?id=`,

    // 上传项目
    uploadProjectUrl: `${domainApi}Import/ProjectImport`,

    // 上传图斑
    uploadSpotUrl: `${domainApi}Import/SpotImport`,

    // 流域机构列表
    basinOrganizationUrl: `${domainApi}Project/GetRiverBasinOU`,

    // 字典
    dictUrl: `${domainApi}DictTable/GetAll`,

    // 部门新建
    departCreateUrl: `${domainApi}SocialDepartmentDto/Create`,

    // 部门列表
    departListUrl: `${domainApi}Department/GetAll`,

    // 部门校验
    departVaildUrl: `${domainApi}Department/Vaild`,

    // 项目位置
    projectPositionUrl: `${domainApi}Project/GetPoint`,

    // 获取边界
    boundaryUrl: `${domainApi}User/GetBoundAsync`,

    //编辑图斑图形
    updateSpotGraphic: `${domain}api/app/updateSpotGraphic`,

    //编辑项目红线图形
    updateProjectScopeGraphic: `${domain}api/app/updateProjectScopeGraphic`,

    //新建图斑图形
    addSpotGraphic: `${domain}api/app/addSpotGraphic`,

    //新建项目红线图形
    addProjectScopeGraphic: `${domain}api/app/addProjectScopeGraphic`,

    //删除图斑图形
    removeSpotGraphic: `${domain}api/app/removeSpotGraphic`,

    //删除项目红线图形
    removeProjectScopeGraphic: `${domain}api/app/removeProjectScopeGraphic`,

    //点查地图服务后台接口
    queryWFSLayer: `${domain}api/Tool/Forward`,

    // 检查表_模板
    inspectFormUrl: `${domainApi}MonitorCheck/GetFormStructure`,

    // 检查表_项目id查询列表
    inspectListUrl: `${domainApi}MonitorCheck/GetAll`,

    // 检查表_新建编辑
    inspectCreateUpdateUrl: `${domainApi}MonitorCheck/`,

    // 检查表_删除
    inspectDeleteUrl: `${domainApi}MonitorCheck/Delete`,

    // 检查表_详情
    inspectByIdUrl: `${domainApi}MonitorCheck/Get`,

    // 检查表_导出
    inspectExportUrl: `${domainApi}MonitorCheck/Print`,

    // 问题点_问题类型
    problemTypeUrl: `${domainApi}ProblemPoint/GetProblemAll`,

    // 问题点_详情
    problemPointByIdUrl: `${domainApi}ProblemPoint/Get`,

    // 问题点_新建编辑
    problemPointCreateUpdateUrl: `${domainApi}ProblemPoint/`,

    // 问题点_删除
    problemPointDeleteUrl: `${domainApi}ProblemPoint/Delete`,

    // 问题点_列表
    problemPointListUrl: `${domainApi}ProblemPoint/GetAll`,

    // 字典类型_列表
    dictTypeListUrl: `${domainApi}DictType/GetAll`,

    // 字典类型_新建编辑
    dictTypeCreateUpdateUrl: `${domainApi}DictType/`,

    // 字典类型_删除
    dictTypeDeleteUrl: `${domainApi}DictType/Delete`,

    // 字典类型_批量删除
    dictTypeDeleteMulUrl: `${domainApi}DictType/DeleteBatch`,

    // 字典数据_列表
    dictDataListUrl: `${domainApi}DictTable/GetAll`,

    // 字典数据_新建编辑
    dictDataCreateUpdateUrl: `${domainApi}DictTable/`,

    // 字典数据_删除
    dictDataDeleteUrl: `${domainApi}DictTable/Delete`,

    // 字典数据_批量删除
    dictDataDeleteMulUrl: `${domainApi}DictTable/DeleteBatch`,

    // 行政区划_列表
    districtTreeUrl: `${domainApi}User/GetDistrictCodesTree`,

    // 行政区划_新建编辑
    districtCreateUpdateUrl: `${domainApi}DistrictCode/`,

    // 行政区划_删除
    districtDeleteUrl: `${domainApi}DistrictCode/Delete`,

    // 行政区划_批量删除
    districtDeleteMulUrl: `${domainApi}DistrictCode/DeleteBatch`,

    // 单位_列表
    companyListUrl: `${domainApi}SocialDepartment/GetAll`,

    // 单位_新建编辑
    companyCreateUpdateUrl: `${domainApi}SocialDepartment/`,

    // 单位_删除
    companyDeleteUrl: `${domainApi}SocialDepartment/Delete`,

    // 单位_批量删除
    companyDeleteMulUrl: `${domainApi}SocialDepartment/DeleteBatch`,

    // 行政部门_树状列表
    departsTreeUrl: `${domainApi}GovDepartment/GetTree`,

    // 行政部门_列表
    departsListUrl: `${domainApi}GovDepartment/GetAll`,

    // 行政部门_新建编辑
    departsCreateUpdateUrl: `${domainApi}GovDepartment/`,

    // 行政部门_删除
    departsDeleteUrl: `${domainApi}GovDepartment/Delete`,

    // 行政部门_批量删除
    departsDeleteMulUrl: `${domainApi}GovDepartment/DeleteBatch`,

    // 角色_列表
    roleListUrl: `${domainApi}Role/GetAll`,

    // 角色_新建编辑
    roleCreateUpdateUrl: `${domainApi}Role/`,

    // 角色_删除
    roleDeleteUrl: `${domainApi}Role/DeleteBatch`,

    // 权限_列表
    powerListUrl: `${domainApi}Role/GetAllPermissions`,

    // 用户_列表
    userListUrl: `${domainApi}User/GetAll`,

    // 用户_新建编辑_未登录
    userCreateOutsideUrl: `${domainApi}Account/Register`,

    // 用户_新建编辑
    userCreateUpdateUrl: `${domainApi}User/`,

    // 用户_详情
    userInfoUrl: `${domainApi}User/Get`,

    // 用户_审核
    userExamineUrl: `${domainApi}User/SetIsActive`,

    // 用户_新建设置权限_未登录
    userSetPowerOutsideUrl: `${domainApi}User/PreSetGrantedPermissionsAsync`,

    // 用户_新建设置权限
    userSetPowerUrl: `${domainApi}User/SetGrantedPermissionsAsync`,

    // 用户_删除
    userDeleteUrl: `${domainApi}User/DeleteBatch`,

    // 所属项目
    userProjectUrl: `${domainApi}Project/GetListByName`,

    // 所属单位
    userCompanyUrl: `${domainApi}SocialDepartment/GetListByName`,

    panoramaListUrl: `${domainApi}Pano/GetAllByPost`,

    panoramaUploadUrl: `${domainApi}Pano/Generate`,

    panoramaCreateUpdateUrl: `${domainApi}Pano/`,

    panoramaDeleteUrl: `${domainApi}Pano/Delete`,

    panoramaPreviewUrl: `${domain}pano/pannellum.htm?config=`,

    projectSuperviseListUrl: `${domainApi}ProjectRegulation/GetAllByPost`,

    projectSuperviseCreateUpdateUrl: `${domainApi}ProjectRegulation/`
  },

  //工具箱
  toolbox: [
    {
      label: '勾选管理',
      key: 'checklist',
      icon: 'check'
    },
    {
      label: '导出',
      key: 'export',
      icon: 'cloud-download'
    },
    {
      label: '导出',
      key: 'attach',
      icon: 'cloud-download'
    },
    {
      label: '归档',
      key: 'archiving',
      icon: 'folder-open'
    },
    {
      label: '删除',
      key: 'delete',
      icon: 'delete'
    },
    {
      label: '模板下载',
      key: 'download_shapfile',
      icon: 'download'
    },
    {
      label: '拓扑检测工具下载',
      key: 'topologyCheck',
      icon: 'download'
    },
    {
      label: '模板说明',
      key: 'template_description',
      icon: 'question-circle'
    },
    // {
    //   label: "批量上传(GeoJSON)",
    //   key: "upload_shapfile",
    //   icon: "upload"
    // },
    // {
    //   label: "批量上传(Excel)",
    //   key: "upload_excel",
    //   icon: "upload"
    // },
    {
      label: '数据抽稀',
      key: 'data_sparse',
      icon: 'font-size'
    }
  ],

  //控制台-项目
  console_project: [
    {
      label: '立项级别',
      value: 'level',
      icon: 'schedule',
      type: 0
    },
    {
      label: '合规性',
      value: 'compliance',
      icon: 'info-circle',
      type: 1
    },
    {
      label: '项目类型',
      value: 'type',
      icon: 'appstore',
      type: 2
    },
    {
      label: '项目类别',
      value: 'sort',
      icon: 'ant-design',
      type: 3
    },
    {
      label: '项目性质',
      value: 'nature',
      icon: 'project',
      type: 4
    },
    {
      label: '建设状态',
      value: 'state',
      icon: 'thunderbolt',
      type: 5
    },
    {
      label: '矢量化类型',
      value: 'vector',
      icon: 'profile',
      type: 6
    }
  ],

  //控制台-图斑
  console_spot: [
    {
      label: '现场复核',
      value: 'level',
      icon: 'edit',
      type: 0
    },
    {
      label: '合规性',
      value: 'compliance',
      icon: 'info-circle',
      type: 1
    },
    {
      label: '扰动类型',
      value: 'type',
      icon: 'appstore',
      type: 2
    },
    {
      label: '建设状态',
      value: 'nature',
      icon: 'thunderbolt',
      type: 3
    },
    {
      label: '扰动变化类型',
      value: 'sort',
      icon: 'border-inner',
      type: 4
    }
  ],

  //扰动类型
  disturb_type: ['弃土（渣）场', '取土（石）场', '其他扰动', '非生产建设项目'],

  //扰动变化类型
  disturb_change_type: [
    '新建',
    '续建（范围扩大）',
    '续建（范围缩小）',
    '续建（范围不变）',
    '完工'
  ],

  //合规性
  compliance: [
    '合规',
    '疑似未批先建',
    '未批先建',
    '疑似超出项目红线',
    '超出项目红线',
    '疑似建设地点变更',
    '建设地点变更',
    '已批',
    '可不编报方案'
  ],

  //建设状态
  construct_state: ['未开工', '停工', '施工', '完工', '已验收'],

  //立项级别
  approval_level: ['部级', '省级', '市级', '县级'],

  //项目类型
  project_type: [
    '公路工程',
    '铁路工程',
    '涉水交通工程',
    '机场工程',
    '火电工程',
    '核电工程',
    '风电工程',
    '输变电工程',
    '其他电力工程',
    '水利枢纽工程',
    '灌区工程',
    '引调水工程',
    '堤防工程',
    '蓄滞洪区工程',
    '其他小型水利工程',
    '水电枢纽工程',
    '露天煤矿',
    '露天金属矿',
    '露天非金属矿',
    '井采煤矿',
    '井采金属矿',
    '井采非金属矿',
    '油气开采工程',
    '油气管道工程',
    '油气储存于加工工程',
    '工业园区工程',
    '城市轨道交通工程',
    '城市管网工程',
    '房地产工程',
    '其他城建工程',
    '林浆纸一体化工程',
    '农林开发工程',
    '加工制造类项目',
    '社会事业类项目',
    '信息产业类项目',
    '其他行业项目'
  ],

  //项目类别
  project_category: ['建设类', '生产类'],

  //项目性质
  project_nature: ['新建', '扩建', '续建', '改建'],

  //矢量化类型
  vectorization_type: ['项目红线', '示意性范围'],

  imageBaseUrl: imageBaseUrl,

  /*----------------------------------地图配置部分-------------------------------------*/
  mapInitParams: {
    center: [23.1441, 113.3693],
    zoom: 14,
    maxZoom: 21
  },
  cesiumMapInitParams: {
    extent: {
      //初始化范围
      xmin: 91.262834,
      ymin: 8.178795,
      xmax: 136.851228,
      ymax: 49.517782
    },
    spatialReference: {
      //地图空间参考坐标系
      wkid: 4326
    },
    /*备注说明:配置底图列表
      *type代表地图服务类型(0代表ArcGisMapServerImageryProvider;1代表createOpenStreetMapImageryProvider;
                      2代表WebMapTileServiceImageryProvider;3代表createTileMapServiceImageryProvider;
                      4 代表UrlTemplateImageryProvider;5 代表WebMapServiceImageryProviderr)
      *proxyUrl代理请求服务
      *iconUrl图标
      *name显示名称
      *Url地图Url
      */
    imageryViewModels: [
      {
        label: '监管影像图',
        className: 'imgType',
        type: 4,
        proxyUrl: '',
        Url: myOnlineImageUrl
      },
      {
        label: 'OSM街道图',
        className: 'vecType',
        type: 1,
        proxyUrl: '',
        Url: 'https://a.tile.openstreetmap.org/'
      },
      {
        label: 'ArcGIS影像图',
        className: 'imgType',
        type: 0,
        proxyUrl: '',
        Url:
          'http://server.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer'
      },
      {
        label: 'ArcGIS街道图',
        className: 'vecType',
        type: 0,
        proxyUrl: '',
        Url:
          'http://cache1.arcgisonline.cn/arcgis/rest/services/ChinaOnlineCommunity/MapServer'
      },
      //{"label":"WMS",className:"imgType",type:5,proxyUrl:'',Url:'http://localhost:8180/geoserver/gwc/service/wms',credit:'wms服务',layers: 'worldMap'},
      //{"label":"WMS",className:"imgType",type:5,proxyUrl:'',Url:'http://localhost:8180/geoserver/gwc/service/wms',credit:'wms服务',layers: 'worldMap',tilingScheme:new Cesium.WebMercatorTilingScheme()},
      //subdomains默认值'abc'
      {
        label: '天地影像图',
        className: 'imgType',
        type: 2,
        proxyUrl: '',
        Url:
          'http://t{s}.tianditu.com/img_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=img&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&tk=7786923a385369346d56b966bb6ad62f',
        layer: 'tdtImgBasicLayer',
        style: 'default',
        format: 'tiles',
        tileMatrixSetID: 'tdtMap',
        subdomains: ['0', '1', '2', '3', '4', '5', '6', '7']
      },
      {
        label: '天地街道图',
        className: 'vecType',
        type: 2,
        proxyUrl: '',
        Url:
          'http://t{s}.tianditu.com/vec_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=vec&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&tk=7786923a385369346d56b966bb6ad62f',
        layer: 'tdtVecBasicLayer',
        style: 'default',
        format: 'tiles',
        tileMatrixSetID: 'tdtMap',
        subdomains: ['0', '1', '2', '3', '4', '5', '6', '7']
      },
      {
        label: '谷歌影像图',
        className: 'imgType',
        type: 4,
        proxyUrl: '',
        Url: 'http://www.google.cn/maps/vt?lyrs=s@189&gl=cn&x={x}&y={y}&z={z}',
        credit: 'googleMap服务',
        subdomains: 'abc'
      },
      {
        label: '谷歌街道图',
        className: 'vecType',
        type: 4,
        proxyUrl: '',
        Url: 'http://www.google.cn/maps/vt?lyrs=m@189&gl=cn&x={x}&y={y}&z={z}',
        credit: 'googleMap服务',
        subdomains: 'abc'
      },
      {
        label: '高德影像图',
        className: 'imgType',
        type: 4,
        proxyUrl: '',
        Url:
          'http://webst0{s}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}',
        credit: 'gaodeMap服务',
        subdomains: ['1', '2', '3', '4']
      },
      {
        label: '高德街道图',
        className: 'vecType',
        type: 4,
        proxyUrl: '',
        Url:
          'http://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}',
        credit: 'gaodeMap服务',
        subdomains: ['1', '2', '3', '4']
      }
    ],
    /*地图图层菜单目录构造*/
    /*
      *name-图层名称
      *layerurl-图层服务配置
      *type代表地图服务类型:
      0代表ArcGisMapServerImageryProvider;
      1代表OpenStreetMapImageryProvider;
      2代表WebMapTileServiceImageryProvider;
      3代表TileMapServiceImageryProvider;
      4 代表UrlTemplateImageryProvider;
      5 代表WebMapServiceImageryProviderr(WMS);
      6 代表kml,kmz;
      7 代表geoJson;
      *layerid-图层id
      */

    overlayLayers: [
      { id: 1, pId: 0, name: '基础图层', checked: false },
      {
        id: 11,
        pId: 1,
        name: '扰动图斑', //WMS
        layerurl: geoserverUrl + '/wms',
        layerid: mapSpotLayerName,
        IsWebMercatorTilingScheme: false, //是否创建摩卡托投影坐标系,默认是地理坐标系
        type: 5,
        proxyUrl: '',
        checked: false
      },
      {
        id: 12,
        pId: 1,
        name: '项目红线', //WMS
        layerurl: geoserverUrl + '/wms',
        layerid: mapProjectLayerName,
        IsWebMercatorTilingScheme: false, //是否创建摩卡托投影坐标系,默认是地理坐标系
        type: 5,
        proxyUrl: '',
        checked: false
      },
      {
        id: 13,
        pId: 1,
        name: '路网注记',
        layerurl:
          'http://t{s}.tianditu.com/cia_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=cia&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&tk=7786923a385369346d56b966bb6ad62f',
        layerid: 'tdtImgLabelLayer',
        IsWebMercatorTilingScheme: false, //是否创建摩卡托投影坐标系,默认是地理坐标系
        type: 2,
        proxyUrl: '',
        checked: false
      },
      {
        id: 14,
        pId: 1,
        name: '行政边界', //WMS
        layerurl: geoserverUrl + '/wms',
        layerid: mapDistrictLayerName,
        IsWebMercatorTilingScheme: false, //是否创建摩卡托投影坐标系,默认是地理坐标系
        type: 5,
        proxyUrl: '',
        checked: false
      }
    ],
    Tiles3D: {
      //三维倾斜摄影配置信息
      url: './cesiumfile/3Dtiles/pazhou/Production_3.json'
      //url: "./cesiumfile/3Dtiles/Production_1/Scene/Production_1.json",
    }
  },
  //天地图影像注记
  tdtImageLabel: {
    title: '路网注记',
    url: tdtImageLabelUrl,
    minZoom: 0,
    maxZoom: 21,
    subdomains: ['0', '1', '2', '3', '4', '5', '6', '7'],
    picUrl: `./img/tdtImagelabel.png`,
    errorTileUrl: errorTileUrl
  },
  //行政边界
  districtBound: {
    title: '行政边界',
    url: districtBoundUrl,
    mapDistrictLayerName: mapDistrictLayerName,
    minZoom: 0,
    maxZoom: 21,
    picUrl: `./img/districtBound.png`,
    errorTileUrl: errorTileUrl
  },
  errorTileUrl: errorTileUrl,
  // 在线底图
  onlineBasemaps: [
    {
      title: '监管影像图',
      url: myOnlineImageUrl,
      minZoom: 0,
      maxZoom: 21,
      subdomains: 'abc',
      picUrl: `./img/myOnlineImage.png`,
      errorTileUrl: errorTileUrl
    },
    {
      title: 'OSM街道图',
      url: OSMVectorUrl,
      minZoom: 0,
      maxZoom: 21,
      subdomains: 'abc',
      picUrl: `./img/OSMVector.png`,
      errorTileUrl: errorTileUrl
    },
    {
      title: 'ArcGIS影像图',
      url: arcgisImageUrl,
      minZoom: 0,
      maxZoom: 21,
      subdomains: 'abc',
      picUrl: `./img/arcgisImage.png`,
      errorTileUrl: errorTileUrl
    },
    {
      title: 'ArcGIS街道图(有偏移)',
      url: arcgisVectorUrl,
      minZoom: 0,
      maxZoom: 21,
      subdomains: 'abc',
      picUrl: `./img/arcgisVector.png`,
      errorTileUrl: errorTileUrl
    },
    {
      title: '天地影像图',
      url: tdtImageUrl,
      minZoom: 0,
      maxZoom: 21,
      subdomains: ['0', '1', '2', '3', '4', '5', '6', '7'],
      picUrl: `./img/tdtImage.png`,
      errorTileUrl: errorTileUrl
    },
    {
      title: '天地街道图',
      url: tdtVectorUrl,
      minZoom: 0,
      maxZoom: 21,
      subdomains: ['0', '1', '2', '3', '4', '5', '6', '7'],
      picUrl: `./img/tdtVector.png`,
      errorTileUrl: errorTileUrl
    },
    {
      title: '谷歌影像图(有偏移)',
      url: googleImageUrl,
      minZoom: 0,
      maxZoom: 21,
      subdomains: 'abc',
      picUrl: `./img/googleImage.png`,
      errorTileUrl: errorTileUrl
    },
    {
      title: '谷歌街道图(有偏移)',
      url: googleVectorUrl,
      minZoom: 0,
      maxZoom: 21,
      subdomains: 'abc',
      picUrl: `./img/googleVector.png`,
      errorTileUrl: errorTileUrl
    },
    {
      title: '高德影像图(有偏移)',
      url: gaodeImageUrl,
      minZoom: 0,
      maxZoom: 21,
      subdomains: ['1', '2', '3', '4'],
      picUrl: `./img/gaodeImage.png`,
      errorTileUrl: errorTileUrl
    },
    {
      title: '高德街道图(有偏移)',
      url: gaodeVectorUrl,
      minZoom: 0,
      maxZoom: 21,
      subdomains: ['1', '2', '3', '4'],
      picUrl: `./img/gaodeVector.png`,
      errorTileUrl: errorTileUrl
    }
    // {
    //   title: '百度街道图',
    //   url: bdVectorUrl,
    //   minZoom: 0,
    //   maxZoom: 21,
    // },
    // {
    //   title: '百度影像图',
    //   url: bdImageUrl,
    //   minZoom: 0,
    //   maxZoom: 21,
    // },
  ],
  mapUrl: {
    SHP: `./mapfile/SHP/`,
    mapshaper: `./mapshaper/index.html`,
    //geoserverUrl: "https://www.zkygis.cn:8143/geoserver/ZKYGIS",
    geoserverUrl: geoserverUrl,
    geoserverQueryUrl: 'http://localhost:8080/geoserver/ZKYGIS',
    //根据地图当前范围获取对应历史影像数据接口
    getInfoByExtent: `${imageQueryBaseUrl}/latest/getInfoByExtent`
  },

  // mapLayersName: "ZKYGIS:bs_project_scope,ZKYGIS:bs_spot", //现状库扰动图斑和项目红线
  mapLayersName: isFormal
    ? 'ZKYGIS:bs_project_scope,ZKYGIS:bs_spot'
    : 'ZKYGIS:bs_project_scope_t,ZKYGIS:bs_spot_t', //现状库扰动图斑和项目红线
  mapProjectLayerName: mapProjectLayerName, //现状库项目红线
  mapSpotLayerName: mapSpotLayerName, //现状库扰动图斑
  mapHistorySpotLayerName: isFormal
    ? 'ZKYGIS:bs_spot_history'
    : 'ZKYGIS:bs_spot_history_t', //历史库扰动图斑
  legend: [
    {
      title: '扰动图斑_未关联_未复核',
      background: color_back_spot,
      border: color_border_spot1
    },
    {
      title: '扰动图斑_未关联_已复核',
      background: color_back_spot,
      border: color_border_spot2
    },
    {
      title: '扰动图斑_已关联_未复核',
      background: color_back_spot,
      border: color_border_spot1
    },
    {
      title: '扰动图斑_已关联_已复核',
      background: color_back_spot,
      border: color_border_spot2
    },
    {
      title: '项目红线',
      background: color_back_redLine,
      border: color_border_redLine
    }
  ]
};

export default config;
