const domain = "http://aj.zkygis.cn/dutySys";
const domain_ = "http://aj.zkygis.cn/stbc/";

const config = {
  url: {
    //登录
    GetUserPassWord: `${domain}/api/account/GetUserPassWord`,

    //项目列表
    // projectListUrl: `${domain}/api/app/projectScopeGetIntersects`,
    projectListUrl: `${domain_}api/services/app/ProjectManagerService/GetAll`,
    
    //根据项目id获取对应的项目信息
    projectById: `${domain}/api/app/projectById`,
    //projectScopeGetIntersects: `http://10.7.23.81:8090/stbcSys/api/app/projectScopeGetIntersects`,

    //图斑列表
    spotGetIntersects: `${domain}/api/app/spotGetIntersects`,
   
    //根据扰动图斑id获取对应的扰动图斑信息
    spotBytbId: `${domain}/api/app/spotBytbId`,
    //spotGetIntersects: `http://10.7.23.81:8090/stbcSys/api/app/spotGetIntersects`
    //编辑图斑图形
    updateSpotGraphic:`${domain}/api/app/updateSpotGraphic`,
    //编辑项目红线图形
    updateProjectScopeGraphic:`${domain}/api/app/updateProjectScopeGraphic`

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
      label: "导出当前列表数据",
      value: "shopping",
      icon: "shopping"
    },
    {
      label: "模板下载",
      value: "login",
      icon: "login"
    },
    {
      label: "模板说明",
      value: "question-circle",
      icon: "question-circle"
    },
    {
      label: "批量上传(Shapfile)",
      value: "upload",
      icon: "upload"
    },
    {
      label: "批量上传(Excel)",
      value: "upload",
      icon: "upload"
    },
    {
      label: "数据归档",
      value: "cloud-download",
      icon: "cloud-download"
    },
    {
      label: "数据抽稀",
      value: "font-size",
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
    //SHP: `${domain}/WebPage/SHP/`
    SHP: `http://aj.zkygis.cn/stbcSys/mapfile/SHP/`,
    mapshaper: `http://aj.zkygis.cn/stbcSys/mapshaper/index.html`,
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
  mapLayersName: "ZKYGIS:project_scope,ZKYGIS:spot",
  mapProjectLayerName: "ZKYGIS:project_scope",
  mapSpotLayerName: "ZKYGIS:spot"

};

export default config;
