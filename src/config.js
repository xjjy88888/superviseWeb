const domain = "http://aj.zkygis.cn";

const config = {
  url: {
    getUserInfoLis: `${domain}/api/account/getUserInfoList`
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
      value: "zhejiang",
      label: "广东",
      children: [
        {
          value: "hangzhou",
          label: "广州",
          children: [
            {
              value: "xihu",
              label: "天河区"
            },
            {
              value: "xihu",
              label: "海珠区"
            },
            {
              value: "xihu2",
              label: "白云区"
            }
          ]
        },
        {
          value: "hangzhou",
          label: "中山市",
          children: [
            {
              value: "xihu",
              label: "东区"
            },
            {
              value: "xihu2",
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
  ]
};

export default config;
