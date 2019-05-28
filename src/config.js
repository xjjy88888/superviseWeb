const domain = "http://aj.zkygis.cn/stbc/";
const imageBaseUrl = "http://10.7.23.178/BasemapService/rest/image";
const txKey = "TERBZ-ZU46D-KZT46-HZZIB-RNDMZ-7GFP3";

const color_back_spot = "rgba(255,255,0,0.4)"; //背景色-图斑
const color_back_redLine = "rgba(230,0,0,0.4)"; //背景色-红线
const color_border_spot1 = "#ffd700"; //边框色-图斑-未复核
const color_border_spot2 = "#E09A00"; //边框色-图斑-已复核
const color_border_redLine = "#e60000"; //边框色-红线

const config = {
  url: {
    // 登录
    loginUrl: `${domain}api/TokenAuth/Authenticate`,

    // 项目列表
    projectListUrl: `${domain}api/services/app/Project/GetAllByPost`,

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

    // 图斑列表
    spotListUrl: `${domain}api/services/app/Spot/GetAllByPost`,

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
    redLineByIdUrl: `${domain}api/services/app/MarkingPoint/Get`,

    // 项目红线新建
    redLineCreateUrl: `${domain}api/services/app/MarkingPoint/Create`,

    // 项目红线编辑
    redLineUpdateUrl: `${domain}api/services/app/MarkingPoint/Update`,

    // 项目红线删除
    redLineDeleteUrl: `${domain}api/services/app/MarkingPoint/Delete`,

    // 项目红线批量删除
    redLineDeleteMulUrl: `${domain}api/services/app/MarkingPoint/DeleteBatch`,

    // id查询标注点经纬度
    pointSiteByIdUrl: `${domain}api/services/app/MarkingPoint/GetPoint`,

    // 附件上传
    annexUploadUrl: `${domain}api/services/app/File/UploadAsync`,

    // 附件预览
    annexPreviewUrl: `${domain}api/services/app/File/GetFile?id=`,

    // 附件删除
    annexDeleteUrl: `${domain}api/services/app/File/Delete`,

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

    // 行政区域
    districtUrl: `${domain}api/services/app/User/GetDistrictCodesTree`,

    // 获取边界
    boundaryUrl: `${domain}api/services/app/User/GetBoundAsync`,

    // 腾讯地图
    txRegionUrl: `https://apis.map.qq.com/ws/district/v1/list?key=${txKey}`,

    //天地图
    tdRegionUrl: `http://api.tianditu.gov.cn/administrative?postStr={"searchWord":"北京","searchType":"1","needSubInfo":"false","needAll":"false","needPolygon":"true","needPre":"true"}&tk=e606f896eaad4c8ab29275f85861af96`,

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
    queryWFSLayer: `${domain}api/Tool/Forward`
  },

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
      icon: "export"
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
      label: "模板下载(Shapfile)",
      key: "download_shapfile",
      icon: "cloud-download"
    },
    {
      label: "模板下载(Excel)",
      key: "download_excel",
      icon: "download"
    },
    {
      label: "模板说明",
      key: "template_description",
      icon: "question-circle"
    },
    {
      label: "批量上传(GeoJSON)",
      key: "upload_shapfile",
      icon: "cloud-upload"
    },
    {
      label: "批量上传(Excel)",
      key: "upload_excel",
      icon: "upload"
    },
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
      icon: "schedule"
    },
    {
      label: "合规性",
      value: "compliance",
      icon: "info-circle"
    },
    {
      label: "项目类型",
      value: "type",
      icon: "appstore"
    },
    {
      label: "项目类别",
      value: "sort",
      icon: "ant-design"
    },
    {
      label: "项目性质",
      value: "nature",
      icon: "project"
    },
    {
      label: "建设状态",
      value: "state",
      icon: "thunderbolt"
    },
    {
      label: "矢量化类型",
      value: "vector",
      icon: "profile"
    }
  ],

  //控制台-图斑
  console_spot: [
    {
      label: "现场复核",
      value: "level",
      icon: "edit"
    },
    {
      label: "合规性",
      value: "compliance",
      icon: "info-circle"
    },
    {
      label: "扰动类型",
      value: "type",
      icon: "appstore"
    },
    {
      label: "建设状态",
      value: "nature",
      icon: "thunderbolt"
    },
    {
      label: "扰动变化类型",
      value: "sort",
      icon: "border-inner"
    }
  ],
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
    geoserverUrl: "http://10.7.23.177:8080/geoserver/ZKYGIS",
    //根据地图当前范围获取对应历史影像数据接口
    getInfoByExtent: `${imageBaseUrl}/latest/getInfoByExtent`
  },
  mapLayersName: "ZKYGIS:bs_project_scope,ZKYGIS:bs_spot",
  mapProjectLayerName: "ZKYGIS:bs_project_scope",
  mapSpotLayerName: "ZKYGIS:bs_spot",
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
