const domain = "http://aj.zkygis.cn/dutySys";
const domain_ = "http://aj.zkygis.cn/stbc/";

const color_back_spot = "rgba(255,255,0,0.4)"; //背景色-图斑
const color_back_redLine = "rgba(230,0,0,0.4)"; //背景色-红线
const color_border_spot1 = "#ffd700"; //边框色-图斑-未复核
const color_border_spot2 = "#E09A00"; //边框色-图斑-已复核
const color_border_redLine = "#e60000"; //边框色-红线

const config = {
  url: {
    // 登录
    loginUrl: `${domain_}api/TokenAuth/Authenticate`,

    // 项目列表
    projectListUrl: `${domain_}api/services/app/Project/GetAll`,

    // 图斑列表
    spotListUrl: `${domain_}api/services/app/Spot/GetAll`,

    // 标注点列表
    pointListUrl: `${domain_}api/services/app/MarkingPoint/GetAll`,

    // id查询项目
    projectByIdUrl: `${domain_}/api/services/app/Project/Get`,

    // id查询图斑
    spotByIdUrl: `${domain_}/api/services/app/Spot/Get`,

    // id查询标注点
    pointByIdUrl: `${domain_}/api/services/app/MarkingPoint/Get`,

    // 项目位置
    projectPositionUrl: `${domain_}/api/services/app/Project/GetPoint`,

    // 获取边界
    boundaryUrl: `${domain_}/api/services/app/User/GetBoundAsync`,

    //编辑图斑图形
    updateSpotGraphic: `${domain}/api/app/updateSpotGraphic`,
    //编辑项目红线图形
    updateProjectScopeGraphic: `${domain}/api/app/updateProjectScopeGraphic`,
    //新增图斑图形
    addSpotGraphic: `${domain}/api/app/addSpotGraphic`,
    //新增项目红线图形
    addProjectScopeGraphic: `${domain}/api/app/addProjectScopeGraphic`,
    //删除图斑图形
    removeSpotGraphic: `${domain}/api/app/removeSpotGraphic`,
    //删除项目红线图形
    removeProjectScopeGraphic: `${domain}/api/app/removeProjectScopeGraphic`
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
    "疑似超出防治责任范围",
    "超出防治责任范围",
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
  vectorization_type: ["防治责任范围", "示意性范围"],

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
      label: "批量上传(Shapfile)",
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

  // -----------------------------------------------------------------------

  //所在地区
  demo_location: [
    {
      value: "guangdong",
      label: "广东",
      children: [
        {
          value: "gaungzhou",
          label: "广州",
          children: [
            {
              value: "tianhe",
              label: "天河区"
            },
            {
              value: "haizhu",
              label: "海珠区"
            },
            {
              value: "baiyun",
              label: "白云区"
            }
          ]
        },
        {
          value: "zhongshan",
          label: "中山市",
          children: [
            {
              value: "dongqu",
              label: "东区"
            },
            {
              value: "xiqu",
              label: "西区"
            }
          ]
        }
      ]
    },
    {
      value: "jiangsu",
      label: "北京",
      children: [
        {
          value: "nanjing",
          label: "北京市",
          children: [
            {
              value: "zhonghuamen",
              label: "东城区"
            }
          ]
        }
      ]
    }
  ],
  /*----------------------------------地图配置部分-------------------------------------*/
  mapInitParams: {
    center: [23.1441, 113.3693],
    zoom: 13
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
      Url:
        "http://www.stbcjg.cn/BasemapService/rest/image/latest/tile/{z}/{y}/{x}"
    }
  ],
  mapUrl: {
    //SHP: `http://aj.zkygis.cn/stbcSys/mapfile/SHP/`,
    //mapshaper: `http://aj.zkygis.cn/stbcSys/mapshaper/index.html`,
    SHP: `./mapfile/SHP/`,
    mapshaper: `./mapshaper/index.html`,
    geoserverUrl: "http://rs.stbcjg.cn:8080/geoserver/ZKYGIS"
  },
  /*配置气泡窗口模板匹配字段信息*/
  mapFields: {
    spot: {
      simple: [
        { field: "spot_tbid", alias: "图斑编号" },
        { field: "project_id", alias: "所属项目ID" },
        { field: "qtype", alias: "扰动类型" },
        { field: "qarea", alias: "扰动面积" },
        { field: "earea", alias: "超出防治责任范围面积" },
        { field: "qdcs", alias: "建设状态" },
        { field: "qdtype", alias: "扰动变化类型" },
        { field: "byd", alias: "扰动合规性" },
        { field: "isreview", alias: "复核状态" },
        { field: "c_time", alias: "创建时间" },
        { field: "file_time", alias: "归档时间" },
        { field: "m_time", alias: "修改时间" },
        { field: "interpretation_unitid", alias: "解译单位ID" }
      ]
    }
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
