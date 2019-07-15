const l = window.location;
const isFormal = l.href.split("/")[3] === "stbcjg";
const isLocal = l.hostname === "localhost";
console.log(isLocal ? "本地环境" : isFormal ? "正式环境" : "测试环境");

const domain = isLocal
  ? "http://183.6.178.124:8001/stbct/"
  : `${l.origin}/stbc${isFormal ? "" : "t"}/`;

const imageBaseUrl = "http://www.stbcjg.cn/BasemapService/rest/image";
const imageQueryBaseUrl = "http://210.36.22.122/BasemapService/rest/image";

const color_back_spot = "rgba(255,255,0,0.4)"; //背景色-图斑
const color_back_redLine = "rgba(230,0,0,0.4)"; //背景色-红线
const color_border_spot1 = "#ffd700"; //边框色-图斑-未复核
const color_border_spot2 = "#E09A00"; //边框色-图斑-已复核
const color_border_redLine = "#e60000"; //边框色-红线

const config = {
  domain: domain,
  download: `http://www.zkygis.cn/stbcjg/Template/`,
  templateDescription: `http://docs.qq.com/doc/DTEV2TGRsU0RNQUV0?coord=DeJxzNFRxNFQxgEAAEUUCWQ`,
  isFormal: isFormal,

  url: {
    // 登录
    loginUrl: `${domain}api/TokenAuth/Authenticate`,

    // 项目列表
    projectListUrl: `${domain}api/services/app/Project/GetAllByPost`,

    // 项目列表统计
    projectChartUrl: `${domain}api/services/app/Project/Statistics`,

    // 项目信息
    projectByIdUrl: `${domain}api/services/app/Project/Get`,

    // 项目新建
    projectCreateUrl: `${domain}api/services/app/Project/Create`,

    // 项目编辑
    projectUpdateUrl: `${domain}api/services/app/Project/Update`,

    // 项目删除
    projectDeleteUrl: `${domain}api/services/app/Project/Delete`,

    // 项目批量删除
    projectDeleteMulUrl: `${domain}api/services/app/Project/DeleteBatch`,

    // 项目归档
    projectArchiveUrl: `${domain}api/services/app/Project/Archive`,

    // 项目撤销归档
    projectUnArchiveUrl: `${domain}api/services/app/Project/UnArchive`,

    // 项目重名验证
    projectVerifyUrl: `${domain}api/services/app/Project/VaildProjectName`,

    // 项目取消关联图斑
    projectUnbindSpotUrl: `${domain}api/services/app/Project/UnbindSpot`,

    // 图斑列表
    spotListUrl: `${domain}api/services/app/Spot/GetAllByPost`,

    // 图斑列表统计
    spotChartUrl: `${domain}api/services/app/Spot/Statistics`,

    // 图斑信息
    spotByIdUrl: `${domain}api/services/app/Spot/Get`,

    // 图斑新建
    spotCreateUrl: `${domain}api/services/app/Spot/Create`,

    // 图斑编辑
    spotUpdateUrl: `${domain}api/services/app/Spot/Update`,

    // 图斑删除
    spotDeleteUrl: `${domain}api/services/app/Spot/Delete`,

    // 图斑批量删除
    spotDeleteMulUrl: `${domain}api/services/app/Spot/DeleteBatch`,

    // 图斑归档
    spotArchiveUrl: `${domain}api/services/app/Spot/Archive`,

    // 图斑撤销归档
    spotUnArchiveUrl: `${domain}api/services/app/Spot/UnArchive`,

    // 图斑历史
    spotHistoryUrl: `${domain}api/services/app/Spot/GetHistorySpots`,

    // 图斑同步旧系统附件
    spotOldImgUrl: `${domain}api/services/app/File/ImgSyn`,

    // 标注点列表
    pointListUrl: `${domain}api/services/app/MarkingPoint/GetAll`,

    // 标注点信息
    pointByIdUrl: `${domain}api/services/app/MarkingPoint/Get`,

    // 标注点新建
    pointCreateUrl: `${domain}api/services/app/MarkingPoint/Create`,

    // 标注点编辑
    pointUpdateUrl: `${domain}api/services/app/MarkingPoint/Update`,

    // 标注点删除
    pointDeleteUrl: `${domain}api/services/app/MarkingPoint/Delete`,

    // 标注点批量删除
    pointDeleteMulUrl: `${domain}api/services/app/MarkingPoint/DeleteBatch`,

    // 项目红线列表
    redLineListUrl: `${domain}api/services/app/ProjectScope/GetAll`,

    // 项目红线信息
    redLineByIdUrl: `${domain}api/services/app/ProjectScope/Get`,

    // 项目红线新建
    redLineCreateUrl: `${domain}api/services/app/ProjectScope/Create`,

    // 项目红线编辑
    redLineUpdateUrl: `${domain}api/services/app/ProjectScope/Update`,

    // 项目红线删除
    redLineDeleteUrl: `${domain}api/services/app/ProjectScope/Delete`,

    // 项目红线批量删除
    redLineDeleteMulUrl: `${domain}api/services/app/ProjectScope/DeleteBatch`,

    // 附件上传
    annexUploadUrl: `${domain}api/services/app/File/UploadAsync`,

    // 附件预览
    annexPreviewUrl: `${domain}api/services/app/File/GetFile?id=`,

    // 附件删除
    annexDeleteUrl: `${domain}api/services/app/File/Delete`,

    // 导出项目/图斑(附件)数据
    exportUrl: `${domain}api/services/app/Export/`,

    // 下载导出项目/图斑(附件)数据
    downloadUrl: `${domain}api/services/app/File/GetExportFile?id=`,

    // 上传项目
    uploadProjectUrl: `${domain}api/services/app/Import/ProjectImport`,

    // 上传图斑
    uploadSpotUrl: `${domain}api/services/app/Import/SpotImport`,

    // 流域机构列表
    basinOrganizationUrl: `${domain}api/services/app/Project/GetRiverBasinOU`,

    // 字典
    dictUrl: `${domain}api/services/app/DictTable/GetAll`,

    // 部门新建
    departCreateUrl: `${domain}api/services/app/SocialDepartmentDto/Create`,

    // 部门列表
    departListUrl: `${domain}api/services/app/Department/GetAll`,

    // 部门校验
    departVaildUrl: `${domain}api/services/app/Department/Vaild`,

    // 项目位置
    projectPositionUrl: `${domain}api/services/app/Project/GetPoint`,

    // 获取边界
    boundaryUrl: `${domain}api/services/app/User/GetBoundAsync`,

    //编辑图斑图形
    updateSpotGraphic: `${domain}api/app/updateSpotGraphic`,

    //编辑项目红线图形
    updateProjectScopeGraphic: `${domain}api/app/updateProjectScopeGraphic`,

    //新增图斑图形
    addSpotGraphic: `${domain}api/app/addSpotGraphic`,

    //新增项目红线图形
    addProjectScopeGraphic: `${domain}api/app/addProjectScopeGraphic`,

    //删除图斑图形
    removeSpotGraphic: `${domain}api/app/removeSpotGraphic`,

    //删除项目红线图形
    removeProjectScopeGraphic: `${domain}api/app/removeProjectScopeGraphic`,

    //点查地图服务后台接口
    queryWFSLayer: `${domain}api/Tool/Forward`,

    // 字典类型_列表
    dictTypeListUrl: `${domain}api/services/app/DictType/GetAll`,

    // 字典类型_新建修改
    dictTypeCreateUpdateUrl: `${domain}api/services/app/DictType/`,

    // 字典类型_删除
    dictTypeDeleteUrl: `${domain}api/services/app/DictType/Delete`,

    // 字典类型_批量删除
    dictTypeDeleteMulUrl: `${domain}api/services/app/DictType/DeleteBatch`,

    // 字典数据_列表
    dictDataListUrl: `${domain}api/services/app/DictTable/GetAll`,

    // 字典数据_新建修改
    dictDataCreateUpdateUrl: `${domain}api/services/app/DictTable/`,

    // 字典数据_删除
    dictDataDeleteUrl: `${domain}api/services/app/DictTable/Delete`,

    // 行政区划_列表
    districtTreeUrl: `${domain}api/services/app/User/GetDistrictCodesTree`,

    // 字典数据_新建修改
    districtCreateUpdateUrl: `${domain}api/services/app/DistrictCode/`,

    // 字典数据_删除
    districtDeleteUrl: `${domain}api/services/app/DistrictCode/Delete`
  },

  //工具箱
  toolbox: [
    {
      label: "勾选管理",
      key: "checklist",
      icon: "check"
    },
    {
      label: "导出",
      key: "export",
      icon: "cloud-download"
    },
    {
      label: "导出",
      key: "attach",
      icon: "cloud-download"
    },
    {
      label: "归档",
      key: "archiving",
      icon: "folder-open"
    },
    {
      label: "删除",
      key: "delete",
      icon: "delete"
    },
    {
      label: "模板下载",
      key: "download_shapfile",
      icon: "download"
    },
    // {
    //   label: "模板下载(Excel)",
    //   key: "download_excel",
    //   icon: "download"
    // },
    {
      label: "模板说明",
      key: "template_description",
      icon: "question-circle"
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
      label: "数据抽稀",
      key: "data_sparse",
      icon: "font-size"
    }
  ],

  //控制台-项目
  console_project: [
    {
      label: "立项级别",
      value: "level",
      icon: "schedule",
      type: 0
    },
    {
      label: "合规性",
      value: "compliance",
      icon: "info-circle",
      type: 1
    },
    {
      label: "项目类型",
      value: "type",
      icon: "appstore",
      type: 2
    },
    {
      label: "项目类别",
      value: "sort",
      icon: "ant-design",
      type: 3
    },
    {
      label: "项目性质",
      value: "nature",
      icon: "project",
      type: 4
    },
    {
      label: "建设状态",
      value: "state",
      icon: "thunderbolt",
      type: 5
    },
    {
      label: "矢量化类型",
      value: "vector",
      icon: "profile",
      type: 6
    }
  ],

  //控制台-图斑
  console_spot: [
    {
      label: "现场复核",
      value: "level",
      icon: "edit",
      type: 0
    },
    {
      label: "合规性",
      value: "compliance",
      icon: "info-circle",
      type: 1
    },
    {
      label: "扰动类型",
      value: "type",
      icon: "appstore",
      type: 2
    },
    {
      label: "建设状态",
      value: "nature",
      icon: "thunderbolt",
      type: 3
    },
    {
      label: "扰动变化类型",
      value: "sort",
      icon: "border-inner",
      type: 4
    }
  ],

  //扰动类型
  disturb_type: ["弃土（渣）场", "取土（石）场", "其他扰动", "非生产建设项目"],

  //扰动变化类型
  disturb_change_type: [
    "新增",
    "续建（范围扩大）",
    "续建（范围缩小）",
    "续建（范围不变）",
    "完工"
  ],

  //合规性
  compliance: [
    "合规",
    "疑似未批先建",
    "未批先建",
    "疑似超出项目红线",
    "超出项目红线",
    "疑似建设地点变更",
    "建设地点变更",
    "已批",
    "可不编报方案"
  ],

  //建设状态
  construct_state: ["未开工", "停工", "施工", "完工", "已验收"],

  //立项级别
  approval_level: ["部级", "省级", "市级", "县级"],

  //项目类型
  project_type: [
    "公路工程",
    "铁路工程",
    "涉水交通工程",
    "机场工程",
    "火电工程",
    "核电工程",
    "风电工程",
    "输变电工程",
    "其他电力工程",
    "水利枢纽工程",
    "灌区工程",
    "引调水工程",
    "堤防工程",
    "蓄滞洪区工程",
    "其他小型水利工程",
    "水电枢纽工程",
    "露天煤矿",
    "露天金属矿",
    "露天非金属矿",
    "井采煤矿",
    "井采金属矿",
    "井采非金属矿",
    "油气开采工程",
    "油气管道工程",
    "油气储存于加工工程",
    "工业园区工程",
    "城市轨道交通工程",
    "城市管网工程",
    "房地产工程",
    "其他城建工程",
    "林浆纸一体化工程",
    "农林开发工程",
    "加工制造类项目",
    "社会事业类项目",
    "信息产业类项目",
    "其他行业项目"
  ],

  //项目类别
  project_category: ["建设类", "生产类"],

  //项目性质
  project_nature: ["新建", "扩建", "续建", "改建"],

  //矢量化类型
  vectorization_type: ["项目红线", "示意性范围"],

  imageBaseUrl: imageBaseUrl,

  /*----------------------------------地图配置部分-------------------------------------*/
  mapInitParams: {
    center: [23.1441, 113.3693],
    zoom: 15
  },
  baseMaps: [
    {
      label: "街道图",
      className: "vecType",
      Url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    },
    {
      label: "影像图",
      className: "imgType",
      Url:
        "https://server.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
    },
    {
      label: "监管影像",
      className: "imgType",
      Url: `${imageBaseUrl}/latest/tile/{z}/{y}/{x}`
    }
  ],
  mapUrl: {
    SHP: `./mapfile/SHP/`,
    mapshaper: `./mapshaper/index.html`,
    // geoserverUrl: "https://www.zkygis.cn/geoserver/ZKYGIS",
    //geoserverUrl: "https://www.zkygis.cn:8143/geoserver/ZKYGIS",
    geoserverUrl: `${
      isLocal
        ? "http://183.6.178.124:8143"
        : `${l.protocol}//${l.hostname}:8143`
    }/geoserver/ZKYGIS`,
    geoserverQueryUrl: "http://localhost:8080/geoserver/ZKYGIS",
    //根据地图当前范围获取对应历史影像数据接口
    getInfoByExtent: `${imageQueryBaseUrl}/latest/getInfoByExtent`
  },

  // mapLayersName: "ZKYGIS:bs_project_scope,ZKYGIS:bs_spot", //现状库扰动图斑和项目红线
  mapLayersName: isFormal
    ? "ZKYGIS:bs_project_scope,ZKYGIS:bs_spot"
    : "ZKYGIS:bs_project_scope_t,ZKYGIS:bs_spot_t", //现状库扰动图斑和项目红线
  // mapProjectLayerName: "ZKYGIS:bs_project_scope", //现状库项目红线
  mapProjectLayerName: isFormal
    ? "ZKYGIS:bs_project_scope"
    : "ZKYGIS:bs_project_scope_t", //现状库项目红线
  // mapSpotLayerName: "ZKYGIS:bs_spot", //现状库扰动图斑
  mapSpotLayerName: isFormal ? "ZKYGIS:bs_spot" : "ZKYGIS:bs_spot_t", //现状库扰动图斑
  // mapHistorySpotLayerName: "ZKYGIS:bs_spot_history", //历史库扰动图斑
  mapHistorySpotLayerName: isFormal
    ? "ZKYGIS:bs_spot_history"
    : "ZKYGIS:bs_spot_history_t", //历史库扰动图斑
  legend: [
    {
      title: "扰动图斑_未关联_未复核",
      background: color_back_spot,
      border: color_border_spot1
    },
    {
      title: "扰动图斑_未关联_已复核",
      background: color_back_spot,
      border: color_border_spot2
    },
    {
      title: "扰动图斑_已关联_未复核",
      background: color_back_spot,
      border: color_border_spot1
    },
    {
      title: "扰动图斑_已关联_已复核",
      background: color_back_spot,
      border: color_border_spot2
    },
    {
      title: "项目红线",
      background: color_back_redLine,
      border: color_border_redLine
    }
  ]
};

export default config;
