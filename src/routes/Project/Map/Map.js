import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { message, Radio } from 'antd';
import Layouts from '../../../components/Layouts';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import proj4 from 'proj4';
import 'proj4leaflet';
import 'leaflet.vectorgrid'; //矢量瓦片
import 'leaflet-easybutton/src/easy-button.css';
import 'leaflet-easybutton';
import 'leaflet-measure/dist/leaflet-measure.css';
import 'leaflet-measure/dist/leaflet-measure.cn';
import echarts from 'echarts/lib/echarts';
import config from '../../../config';

//模拟测试数据
const RegionCenterData = [
  {
    pointX:110.021,
    pointY:21.124,
    num:12,
    name:'湛江市'
  },
  {
    pointX:110.88,
    pointY:21.976,
    num:22,
    name:'茂名市'
  },
  {
    pointX:111.759,
    pointY:22.029,
    num:35,
    name:'阳江市'
  },
  {
    pointX:111.746,
    pointY:22.842,
    num:40,
    name:'云浮市'
  },
  {
    pointX:112.644,
    pointY:22.243,
    num:55,
    name:'江门市'
  },
  {
    pointX:113.282,
    pointY:22.139,
    num:78,
    name:'珠海市'
  }, 
  {
    pointX:113.387,
    pointY:22.523,
    num:102,
    name:'中山市'
  }, 
  {
    pointX:112.957,
    pointY:22.999,
    num:85,
    name:'佛山市'
  },
  {
    pointX:112.169,
    pointY:23.487,
    num:75,
    name:'肇庆市'
  },
  {
    pointX:114.103,
    pointY:22.627,
    num:120,
    name:'深圳市'
  },
  {
    pointX:113.484,
    pointY:23.331,
    num:108,
    name:'广州市'
  }, 
  {
    pointX:112.989,
    pointY:24.222,
    num:68,
    name:'清远市'
  }, 
  {
    pointX:113.823,
    pointY:22.953,
    num:98,
    name:'东莞市'
  },
  {
    pointX:114.461,
    pointY:23.187,
    num:55,
    name:'惠州市'
  },
  {
    pointX:113.712,
    pointY:24.828,
    num:66,
    name:'韶关市'
  },
  {
    pointX:115.535,
    pointY:23.025,
    num:88,
    name:'汕尾市'
  }, 
  {
    pointX:114.936,
    pointY:23.962,
    num:78,
    name:'河源市'
  }, 
  {
    pointX:116.075,
    pointY:23.344,
    num:95,
    name:'揭阳市'
  }, 
  {
    pointX:116.531,
    pointY:23.291,
    num:35,
    name:'汕头市'
  },
  {
    pointX:116.752,
    pointY:23.793,
    num:45,
    name:'潮州市'
  },
  {
    pointX:116.082,
    pointY:24.196,
    num:35,
    name:'梅州市'
  },                 

];

const RegionPieData = [
  {
    pointX:110.021,
    pointY:21.124,
    result:[
      {
        type:'立项级别',
        data:[
          {name:'部级',value:20},
          {name:'省级',value:25},
          {name:'市级',value:40},
          {name:'县级',value:40},
          {name:'未说明',value:12}
        ]
      }
    ]
  },
  {
    pointX:110.88,
    pointY:21.976,
    result:[
      {
        type:'立项级别',
        data:[
          {name:'部级',value:44},
          {name:'省级',value:25},
          {name:'市级',value:22},
          {name:'县级',value:62},
          {name:'未说明',value:10}
        ]
      }
    ]
  },
  {
    pointX:111.759,
    pointY:22.029,
    result:[
      {
        type:'立项级别',
        data:[
          {name:'部级',value:44},
          {name:'省级',value:63},
          {name:'市级',value:22},
          {name:'县级',value:55},
          {name:'未说明',value:6}
        ]
      }
    ]
  },
  {
    pointX:111.746,
    pointY:22.842,
    result:[
      {
        type:'立项级别',
        data:[
          {name:'部级',value:44},
          {name:'省级',value:25},
          {name:'市级',value:88},
          {name:'县级',value:23},
          {name:'未说明',value:8}
        ]
      }
    ]
  },
  {
    pointX:112.644,
    pointY:22.243,
    result:[
      {
        type:'立项级别',
        data:[
          {name:'部级',value:44},
          {name:'省级',value:25},
          {name:'市级',value:22},
          {name:'县级',value:55},
          {name:'未说明',value:9}
        ]
      }
    ]
  },
  {
    pointX:113.282,
    pointY:22.139,
    result:[
      {
        type:'立项级别',
        data:[
          {name:'部级',value:44},
          {name:'省级',value:25},
          {name:'市级',value:22},
          {name:'县级',value:33},
          {name:'未说明',value:6}
        ]
      }
    ]
  }, 
  {
    pointX:113.387,
    pointY:22.523,
    result:[
      {
        type:'立项级别',
        data:[
          {name:'部级',value:44},
          {name:'省级',value:77},
          {name:'市级',value:22},
          {name:'县级',value:35},
          {name:'未说明',value:14}
        ]
      }
    ]
  }, 
  {
    pointX:112.957,
    pointY:22.999,
    result:[
      {
        type:'立项级别',
        data:[
          {name:'部级',value:44},
          {name:'省级',value:25},
          {name:'市级',value:22},
          {name:'县级',value:56},
          {name:'未说明',value:18}
        ]
      }
    ]
  },
  {
    pointX:112.169,
    pointY:23.487,
    result:[
      {
        type:'立项级别',
        data:[
          {name:'部级',value:44},
          {name:'省级',value:85},
          {name:'市级',value:22},
          {name:'县级',value:62},
          {name:'未说明',value:13}
        ]
      }
    ]
  },
  {
    pointX:114.103,
    pointY:22.627,
    result:[
      {
        type:'立项级别',
        data:[
          {name:'部级',value:44},
          {name:'省级',value:25},
          {name:'市级',value:22},
          {name:'县级',value:88},
          {name:'未说明',value:7}
        ]
      }
    ]
  },
  {
    pointX:113.484,
    pointY:23.331,
    result:[
      {
        type:'立项级别',
        data:[
          {name:'部级',value:44},
          {name:'省级',value:36},
          {name:'市级',value:88},
          {name:'县级',value:25},
          {name:'未说明',value:11}
        ]
      }
    ]
  }, 
  {
    pointX:112.989,
    pointY:24.222,
    result:[
      {
        type:'立项级别',
        data:[
          {name:'部级',value:44},
          {name:'省级',value:35},
          {name:'市级',value:22},
          {name:'县级',value:55},
          {name:'未说明',value:15}
        ]
      }
    ]
  }, 
  {
    pointX:113.823,
    pointY:22.953,
    result:[
      {
        type:'立项级别',
        data:[
          {name:'部级',value:44},
          {name:'省级',value:65},
          {name:'市级',value:25},
          {name:'县级',value:33},
          {name:'未说明',value:11}
        ]
      }
    ]
  },
  {
    pointX:114.461,
    pointY:23.187,
    result:[
      {
        type:'立项级别',
        data:[
          {name:'部级',value:25},
          {name:'省级',value:25},
          {name:'市级',value:33},
          {name:'县级',value:62},
          {name:'未说明',value:15}
        ]
      }
    ]
  },
  {
    pointX:113.712,
    pointY:24.828,
    result:[
      {
        type:'立项级别',
        data:[
          {name:'部级',value:44},
          {name:'省级',value:55},
          {name:'市级',value:22},
          {name:'县级',value:33},
          {name:'未说明',value:15}
        ]
      }
    ]
  },
  {
    pointX:115.535,
    pointY:23.025,
    result:[
      {
        type:'立项级别',
        data:[
          {name:'部级',value:85},
          {name:'省级',value:26},
          {name:'市级',value:77},
          {name:'县级',value:55},
          {name:'未说明',value:6}
        ]
      }
    ]
  }, 
  {
    pointX:114.936,
    pointY:23.962,
    result:[
      {
        type:'立项级别',
        data:[
          {name:'部级',value:33},
          {name:'省级',value:66},
          {name:'市级',value:55},
          {name:'县级',value:11},
          {name:'未说明',value:9}
        ]
      }
    ]
  }, 
  {
    pointX:116.075,
    pointY:23.344,
    result:[
      {
        type:'立项级别',
        data:[
          {name:'部级',value:44},
          {name:'省级',value:55},
          {name:'市级',value:22},
          {name:'县级',value:88},
          {name:'未说明',value:7}
        ]
      }
    ]
  }, 
  {
    pointX:116.531,
    pointY:23.291,
    result:[
      {
        type:'立项级别',
        data:[
          {name:'部级',value:44},
          {name:'省级',value:42},
          {name:'市级',value:22},
          {name:'县级',value:88},
          {name:'未说明',value:9}
        ]
      }
    ]
  },
  {
    pointX:116.752,
    pointY:23.793,
    result:[
      {
        type:'立项级别',
        data:[
          {name:'部级',value:33},
          {name:'省级',value:25},
          {name:'市级',value:44},
          {name:'县级',value:55},
          {name:'未说明',value:11}
        ]
      }
    ]
  },
  {
    pointX:116.082,
    pointY:24.196,
    result:[
      {
        type:'立项级别',
        data:[
          {name:'部级',value:88},
          {name:'省级',value:85},
          {name:'市级',value:23},
          {name:'县级',value:55},
          {name:'未说明',value:8}
        ]
      }
    ]
  },                 

];

const ProjectPointsData = [
  {
    id:1,
    pointX:110.021,
    pointY:21.124,
    projectLevelId:'',//立项级别
    complianceId:'',//扰动合规性
    projectCateId:'',//项目类别
    projectNatId:'',//项目性质
    projectStatusId:'',//建设状态
    vecTypeId:'',//矢量化类型
  },
  {
    id:2,
    pointX:109.995,
    pointY:21.069,
    projectLevelId:'',//立项级别
    complianceId:'',//扰动合规性
    projectCateId:'',//项目类别
    projectNatId:'',//项目性质
    projectStatusId:'',//建设状态
    vecTypeId:'',//矢量化类型
  }, 
  {
    id:3,
    pointX:110.88,
    pointY:21.976,
    projectLevelId:'',//立项级别
    complianceId:'',//扰动合规性
    projectCateId:'',//项目类别
    projectNatId:'',//项目性质
    projectStatusId:'',//建设状态
    vecTypeId:'',//矢量化类型
  },
  {
    id:4,
    pointX:110.961,
    pointY:21.886,
    projectLevelId:'',//立项级别
    complianceId:'',//扰动合规性
    projectCateId:'',//项目类别
    projectNatId:'',//项目性质
    projectStatusId:'',//建设状态
    vecTypeId:'',//矢量化类型
  },  
  {
    id:5,
    pointX:111.759,
    pointY:22.029,
    projectLevelId:'',//立项级别
    complianceId:'',//扰动合规性
    projectCateId:'',//项目类别
    projectNatId:'',//项目性质
    projectStatusId:'',//建设状态
    vecTypeId:'',//矢量化类型
  },
  {
    id:6,
    pointX:111.796,
    pointY:22.072,
    projectLevelId:'',//立项级别
    complianceId:'',//扰动合规性
    projectCateId:'',//项目类别
    projectNatId:'',//项目性质
    projectStatusId:'',//建设状态
    vecTypeId:'',//矢量化类型
  },
  {
    id:7,
    pointX:111.746,
    pointY:22.842,
    projectLevelId:'',//立项级别
    complianceId:'',//扰动合规性
    projectCateId:'',//项目类别
    projectNatId:'',//项目性质
    projectStatusId:'',//建设状态
    vecTypeId:'',//矢量化类型
  },
  {
    id:8,
    pointX:111.805,
    pointY:22.826,
    projectLevelId:'',//立项级别
    complianceId:'',//扰动合规性
    projectCateId:'',//项目类别
    projectNatId:'',//项目性质
    projectStatusId:'',//建设状态
    vecTypeId:'',//矢量化类型
  },
  {
    id:9,
    pointX:112.644,
    pointY:22.243,
    projectLevelId:'',//立项级别
    complianceId:'',//扰动合规性
    projectCateId:'',//项目类别
    projectNatId:'',//项目性质
    projectStatusId:'',//建设状态
    vecTypeId:'',//矢量化类型
  },
  {
    id:10,
    pointX:112.731,
    pointY:22.245,
    projectLevelId:'',//立项级别
    complianceId:'',//扰动合规性
    projectCateId:'',//项目类别
    projectNatId:'',//项目性质
    projectStatusId:'',//建设状态
    vecTypeId:'',//矢量化类型
  },
  {
    id:11,
    pointX:113.282,
    pointY:22.139,
    projectLevelId:'',//立项级别
    complianceId:'',//扰动合规性
    projectCateId:'',//项目类别
    projectNatId:'',//项目性质
    projectStatusId:'',//建设状态
    vecTypeId:'',//矢量化类型
  }, 
  {
    id:12,
    pointX:113.387,
    pointY:22.523,
    projectLevelId:'',//立项级别
    complianceId:'',//扰动合规性
    projectCateId:'',//项目类别
    projectNatId:'',//项目性质
    projectStatusId:'',//建设状态
    vecTypeId:'',//矢量化类型
  }, 
  {
    id:13,
    pointX:112.957,
    pointY:22.999,
    projectLevelId:'',//立项级别
    complianceId:'',//扰动合规性
    projectCateId:'',//项目类别
    projectNatId:'',//项目性质
    projectStatusId:'',//建设状态
    vecTypeId:'',//矢量化类型
  },
  {
    id:14,
    pointX:112.169,
    pointY:23.487,
    projectLevelId:'',//立项级别
    complianceId:'',//扰动合规性
    projectCateId:'',//项目类别
    projectNatId:'',//项目性质
    projectStatusId:'',//建设状态
    vecTypeId:'',//矢量化类型
  },
  {
    id:15,
    pointX:114.103,
    pointY:22.627,
    projectLevelId:'',//立项级别
    complianceId:'',//扰动合规性
    projectCateId:'',//项目类别
    projectNatId:'',//项目性质
    projectStatusId:'',//建设状态
    vecTypeId:'',//矢量化类型
  },
  {
    id:16,
    pointX:113.484,
    pointY:23.331,
    projectLevelId:'',//立项级别
    complianceId:'',//扰动合规性
    projectCateId:'',//项目类别
    projectNatId:'',//项目性质
    projectStatusId:'',//建设状态
    vecTypeId:'',//矢量化类型
  }, 
  {
    id:17,
    pointX:112.989,
    pointY:24.222,
    projectLevelId:'',//立项级别
    complianceId:'',//扰动合规性
    projectCateId:'',//项目类别
    projectNatId:'',//项目性质
    projectStatusId:'',//建设状态
    vecTypeId:'',//矢量化类型
  }, 
  {
    id:18,
    pointX:113.823,
    pointY:22.953,
    projectLevelId:'',//立项级别
    complianceId:'',//扰动合规性
    projectCateId:'',//项目类别
    projectNatId:'',//项目性质
    projectStatusId:'',//建设状态
    vecTypeId:'',//矢量化类型
  },
  {
    id:19,
    pointX:114.461,
    pointY:23.187,
    projectLevelId:'',//立项级别
    complianceId:'',//扰动合规性
    projectCateId:'',//项目类别
    projectNatId:'',//项目性质
    projectStatusId:'',//建设状态
    vecTypeId:'',//矢量化类型
  },
  {
    id:20,
    pointX:113.712,
    pointY:24.828,
    projectLevelId:'',//立项级别
    complianceId:'',//扰动合规性
    projectCateId:'',//项目类别
    projectNatId:'',//项目性质
    projectStatusId:'',//建设状态
    vecTypeId:'',//矢量化类型
  },
  {
    id:21,
    pointX:115.535,
    pointY:23.025,
    projectLevelId:'',//立项级别
    complianceId:'',//扰动合规性
    projectCateId:'',//项目类别
    projectNatId:'',//项目性质
    projectStatusId:'',//建设状态
    vecTypeId:'',//矢量化类型
  }, 
  {
    id:22,
    pointX:114.936,
    pointY:23.962,
    projectLevelId:'',//立项级别
    complianceId:'',//扰动合规性
    projectCateId:'',//项目类别
    projectNatId:'',//项目性质
    projectStatusId:'',//建设状态
    vecTypeId:'',//矢量化类型
  }, 
  {
    id:23,
    pointX:116.075,
    pointY:23.344,
    projectLevelId:'',//立项级别
    complianceId:'',//扰动合规性
    projectCateId:'',//项目类别
    projectNatId:'',//项目性质
    projectStatusId:'',//建设状态
    vecTypeId:'',//矢量化类型
  }, 
  {
    id:24,
    pointX:116.531,
    pointY:23.291,
    projectLevelId:'',//立项级别
    complianceId:'',//扰动合规性
    projectCateId:'',//项目类别
    projectNatId:'',//项目性质
    projectStatusId:'',//建设状态
    vecTypeId:'',//矢量化类型
  },
  {
    id:25,
    pointX:116.752,
    pointY:23.793,
    projectLevelId:'',//立项级别
    complianceId:'',//扰动合规性
    projectCateId:'',//项目类别
    projectNatId:'',//项目性质
    projectStatusId:'',//建设状态
    vecTypeId:'',//矢量化类型
  },
  {
    id:26,
    pointX:116.082,
    pointY:24.196,
    projectLevelId:'',//立项级别
    complianceId:'',//扰动合规性
    projectCateId:'',//项目类别
    projectNatId:'',//项目性质
    projectStatusId:'',//建设状态
    vecTypeId:'',//矢量化类型
  },
  {
    id:27,
    pointX:115.927,
    pointY:24.056,
    projectLevelId:'',//立项级别
    complianceId:'',//扰动合规性
    projectCateId:'',//项目类别
    projectNatId:'',//项目性质
    projectStatusId:'',//建设状态
    vecTypeId:'',//矢量化类型
  },  
  {
    id:28,
    pointX:116.169,
    pointY:24.076,
    projectLevelId:'',//立项级别
    complianceId:'',//扰动合规性
    projectCateId:'',//项目类别
    projectNatId:'',//项目性质
    projectStatusId:'',//建设状态
    vecTypeId:'',//矢量化类型
  },  
  {
    id:29,
    pointX:116.383,
    pointY:24.201,
    projectLevelId:'',//立项级别
    complianceId:'',//扰动合规性
    projectCateId:'',//项目类别
    projectNatId:'',//项目性质
    projectStatusId:'',//建设状态
    vecTypeId:'',//矢量化类型
  },  
  {
    id:30,
    pointX:116.284,
    pointY:24.367,
    projectLevelId:'',//立项级别
    complianceId:'',//扰动合规性
    projectCateId:'',//项目类别
    projectNatId:'',//项目性质
    projectStatusId:'',//建设状态
    vecTypeId:'',//矢量化类型
  },  
  {
    id:31,
    pointX:116.114,
    pointY:24.417,
    projectLevelId:'',//立项级别
    complianceId:'',//扰动合规性
    projectCateId:'',//项目类别
    projectNatId:'',//项目性质
    projectStatusId:'',//建设状态
    vecTypeId:'',//矢量化类型
  },  
  {
    id:32,
    pointX:115.872,
    pointY:24.241,
    projectLevelId:'',//立项级别
    complianceId:'',//扰动合规性
    projectCateId:'',//项目类别
    projectNatId:'',//项目性质
    projectStatusId:'',//建设状态
    vecTypeId:'',//矢量化类型
  },                  

];

const DISTRICT_FILL_COLOR = 'rgba(230,0,0,0)';
// const DISTRICT_COLOR = '#bfbfbf';
const DISTRICT_COLOR = '#0070FF';

//绘制geojson行政区划图层样式
const regionGeoJsonStyle = {
  color: '#33CCFF', //#33CCFF #0000FF
  weight: 2,
  opacity: 0.8,
  fillColor: '#33CCFF',
  fillOpacity: 0.1
};
//绘制geojson行政区划图层高亮样式
const regionGeoJsonHLightStyle = {
  color: '#FF0000',
  weight: 3,
  opacity: 1,
  fillColor: '#FF0000',
  fillOpacity: 0
};

//绘制geojson区域统计图层样式
const ZSGeoJsonStyle = {
  color: '#33CCFF',
  weight: 2,
  opacity: 0.6,
  fillColor: '#33CCFF',
  fillOpacity: 0.3
};
//绘制geojson区域统计图层高亮样式
const ZSGeoJsonHLightStyle = {
  color: '#FF0000',
  weight: 2,
  opacity: 0.6,
  fillColor: '#FF0000',
  fillOpacity: 0.3
};

@connect(({ mapdata }) => ({
  mapdata
}))
export default class homePage extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      imageTimeText: '',
      showImageTimeText: true,
      projectSymbolValue:1,
      showProjectSymbol: false,
    };
    this.map = null;
    this.regiongeojsonLayer = null; //行政区划矢量图层
    this.ZSgeojsonLayer = null;//区域统计图层
    this.projectPointVGLayer = null;//项目点矢量瓦片图层
    this.radius = null;//画圆圈半径大小
    this.onlineBasemapLayers = null;
  }

  componentDidMount() {
    const me = this;
    // 创建图层
    me.createLayers();
    // 创建地图
    me.createMap();
    // 创建行政区划渲染
    me.createRegion();
    // 创建区域统计渲染
    me.createZStatistics();
    //me.createZSPie();
    // 添加所有项目点要素
    me.addAllProjectPoints();
    // 创建图层管理控件
    me.createToc();
    // 创建地图缩放控件
    me.createZoomControl();
    // 创建比例尺控件
    me.createScale();
    // 创建量算工具
    me.createMeasureControl();
    // 创建项目类型符号化按钮
    me.createProjectSymbolButton();
  }

  // 创建图层
  createLayers = () => {
    const { tdtImageLabel, districtBound } = config;
    //天地图地图标注图层
    const placeNameImageLayer = L.tileLayer(`${tdtImageLabel.url}`, {
      minZoom: tdtImageLabel.minZoom,
      maxZoom: tdtImageLabel.maxZoom,
      subdomains: tdtImageLabel.subdomains
    });
    this.placeNameImageLayer = placeNameImageLayer;
    //行政边界-区县图层
    const districtBoundLayer = L.tileLayer.wms(districtBound.url + '/wms?', {
      layers: districtBound.mapDistrictLayerName, //需要加载的图层
      format: 'image/png', //返回的数据格式
      transparent: true,
      maxZoom: districtBound.maxZoom
    });
    this.districtBoundLayer = districtBoundLayer;

    //项目点矢量瓦片图层
    const projectPointVGLayer = L.gridLayer();
    this.projectPointVGLayer = projectPointVGLayer;

  };
  // 创建地图
  createMap = () => {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
      iconUrl: require('leaflet/dist/images/marker-icon.png'),
      shadowUrl: require('leaflet/dist/images/marker-shadow.png')
    });
    // const { ZSgeojsonLayer } = this;
    const map = L.map('map', {
      zoomControl: false,
      //crs: L.CRS.EPSG3857,
      attributionControl: false,
      // layers: [ZSgeojsonLayer]
    });
    const { onlineBasemaps } = config;
    map.createPane('tileLayerZIndex');
    map.getPane('tileLayerZIndex').style.zIndex = 0;
    // 在线底图
    const onlineBasemapLayers = onlineBasemaps.map(item => {
      return L.tileLayer(`${item.url}`, {
        minZoom: item.minZoom,
        maxZoom: item.maxZoom,
        subdomains: item.subdomains,
        pane: 'tileLayerZIndex',
        errorTileUrl: item.errorTileUrl
      });
    });
    map.addLayer(onlineBasemapLayers[0]);
    this.onlineBasemapLayers = onlineBasemapLayers;

    //行政区划图层
    map.createPane('regiongeoJsonZIndex');
    map.getPane('regiongeoJsonZIndex').style.zIndex = 1;
    const regiongeojsonLayer = L.Proj.geoJson(null, {
      style: regionGeoJsonStyle,
      pane: 'regiongeoJsonZIndex'
    });
    this.regiongeojsonLayer = regiongeojsonLayer;
    map.addLayer(regiongeojsonLayer);

    //区域统计图层
    const ZSgeojsonLayer = L.featureGroup([],{pane: 'regiongeoJsonZIndex'});
    this.ZSgeojsonLayer = ZSgeojsonLayer;
    map.addLayer(ZSgeojsonLayer);

    this.map = map;
    //监听地图移动完成事件
    map.on('moveend', this.onMoveendMap);
    //监听地图底图切换事件
    map.on('baselayerchange', this.onBaseLayerChange);
    //监听地图鼠标移动事件
    map.on('mousemove', this.showImageInfos);
    // 监听地图点击事件
    //map.on('click', this.onClickMap);
    //地图范围跳转
    map.setView(config.mapInitParams.center, config.mapInitParams.zoom);
  };
  //监听地图点击事件
  onBaseLayerChange = e => {
    //判断当前底图是否等于监管影像
    if (e.layer._url === config.onlineBasemaps[0].url) {
      this.setState({ showImageTimeText: true });
    } else {
      this.setState({ showImageTimeText: false });
    }
  };
  //监听地图移动完成事件
  onMoveendMap = e => {
    const me = this;
    const { map } = this;
    let zoom = map.getZoom();
    console.log('zoom',zoom);
    let bounds = map.getBounds();
    //根据地图当前范围获取对应监管影像时间
    const { showImageTimeText } = me.state;
    if (showImageTimeText) {
      me.getInfoByExtent(zoom, bounds, data => {
        me.setState({ imageTimeText: data[0] });
      });
    }
    //设置区域统计图层是否隐藏
    if(zoom>=config.pointLevel){
      // me.ZSgeojsonLayer.eachLayer(function (layer) {
      //   if(layer.setOpacity){
      //     layer.setOpacity(0);
      //   }
      // });
      // setTimeout(() => {
      //   me.ZSgeojsonLayer.setStyle({opacity:0,fillOpacity:0});
      // },500);

      if(me.ZSgeojsonLayer.getLayers().length>0){
        me.clearGeojsonLayer(me.ZSgeojsonLayer);
      }
    }
    else{
      // me.ZSgeojsonLayer.eachLayer(function (layer) {
      //   if(layer.setOpacity){
      //     layer.setOpacity(1);
      //   }
      // });
      // me.ZSgeojsonLayer.setStyle({opacity:0.6,fillOpacity:0.3});

      const { projectSymbolValue } = me.state;
      if(projectSymbolValue === 1){
        if(me.ZSgeojsonLayer.getLayers().length<=0){
          me.createZStatistics();
        }
      }
      else{
        if(me.ZSgeojsonLayer.getLayers().length<=0){
          me.createZSPie();
        }
      }
    }
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
    const me = this;
    let urlString = config.mapUrl.getInfoByExtent;
    let xyMin = proj4('EPSG:4326', 'EPSG:3857', [
      bounds.getSouthWest().lng,
      bounds.getSouthWest().lat
    ]);
    let xyMax = proj4('EPSG:4326', 'EPSG:3857', [
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
      type: 'mapdata/getInfoByExtent',
      payload: { geojsonUrl },
      callback: callback
    });
  };

  //监听地图鼠标移动事件
  showImageInfos = e => {
    const {
      mapdata: { imageTimeResult }
    } = this.props;
    const me = this;
    //根据地图当前范围获取对应监管影像时间
    const { showImageTimeText } = me.state;
    if (showImageTimeText && imageTimeResult) {
      let tileInfos = imageTimeResult.tileInfos;
      if (tileInfos.length > 0) {
        let pt = proj4('EPSG:4326', 'EPSG:3857', [e.latlng.lng, e.latlng.lat]);
        for (let i = 0; i < tileInfos.length; i++) {
          let item = tileInfos[i];
          if (
            pt[0] >= item.xmin &&
            pt[0] <= item.xmax &&
            pt[1] >= item.ymin &&
            pt[1] <= item.ymax
          ) {
            let data = item.data;
            if (data && data.hasOwnProperty('takenDate')) {
              me.setState({ imageTimeText: data.takenDate });
            }
            return true;
          }
        }
      }
    }
  };
  // 创建图层管理控件
  createToc = () => {
    const {
      map,
      onlineBasemapLayers,
      placeNameImageLayer,
      districtBoundLayer
    } = this;
    const { onlineBasemaps, tdtImageLabel, districtBound } = config;

    // 构建图层标题及图例
    const getTitle = (
      text,
      borderColor,
      fillColor,
      isBorderDashed,
      className
    ) => {
      if (className) {
        return `<i style='display:inline-block;border:${
          isBorderDashed ? 'dashed' : 'solid'
        } 2px ${borderColor};background:${fillColor};width:20px;height:20px;position:relative;top:4px;'></i><span style='padding-left:1px;'>${text}</span><div class='${className}'></div>`;
      } else {
        return `<i style='display:inline-block;border:${
          isBorderDashed ? 'dashed' : 'solid'
        } 2px ${borderColor};background:${fillColor};width:20px;height:20px;position:relative;top:4px;'></i><span style='padding-left:1px;'>${text}</span>`;
      }
    };

    // 构建图片形式的标题及图例
    const getImageTitle = (text, imgUrl) => {
      return `<div style='display:inline-block;width:20px;height:20px;position:relative;top:0px;'><img src='${imgUrl}' style='height:20px;'/></div><span style='padding-left:1px;'>${text}</span>`;
    };
    // 底图图层
    const baseMaps = {};
    onlineBasemaps.forEach((item, i) => {
      baseMaps[getImageTitle(item.title, item.picUrl)] = onlineBasemapLayers[i];
    });

    // 专题图层
    // const overlayMaps = {};
    const overlayMaps = {
      [getImageTitle(
        tdtImageLabel.title,
        tdtImageLabel.picUrl
      )]: placeNameImageLayer,
      [getTitle(
        districtBound.title,
        DISTRICT_COLOR,
        DISTRICT_FILL_COLOR,
        true,
        'overlayMapsTile'
      )]: districtBoundLayer
    };

    // 添加控件
    const container = L.control
      .layers(baseMaps, overlayMaps)
      .addTo(map)
      .getContainer();

    // 修改图标样式
    L.DomUtil.addClass(
      container.firstChild,
      'iconfont icon-layer global-icon-normal'
    );
  };
  // 创建地图缩放控件
  createZoomControl = () => {
    const { map } = this;
    //地图缩放控件
    L.control
      .zoom({ zoomInTitle: '放大', zoomOutTitle: '缩小', position: 'topright' })
      .addTo(map);
  };
  // 创建比例尺控件
  createScale = () => {
    const { map } = this;
    L.control
      .scale({
        imperial: false,
        position: 'bottomright'
      })
      .addTo(map);
  };
  // 创建量算工具控件
  createMeasureControl = () => {
    const { map } = this;
    //量算工具
    var measureControl = new L.Control.Measure({
      primaryLengthUnit: 'kilometers',
      primaryAreaUnit: 'sqmeters',
      activeColor: '#3388FF',
      completedColor: '#3388FF',
      position: 'topright'
    });
    measureControl.addTo(map);
  };

  // 创建项目类型符号化按钮
  createProjectSymbolButton = () => {
    const { map, imgTextButtonHtml } = this;
    const me = this;
    L.easyButton(imgTextButtonHtml('./img/projectSymbol.png','项目符号化'), () => {
      const { showProjectSymbol } = me.state;
      this.setState({ showProjectSymbol: !showProjectSymbol });
    }).addTo(map).setPosition('topright');
  };
  
  // 获取图标文本按钮html
  imgTextButtonHtml = (icon, title, text) => {
    if (text) {
      return `<div class="global-map-button-icon"><img src="${icon}"></img></div><div class="global-map-button-text">${text}</div>`;
    }
    else {
      if (title) {
        return `<img src="${icon}" style='width:20px;height:20px;margin-top:-5px;margin-left:-1px;' title='${title}'></img>`;
      }
      else{
        return `<img src="${icon}" style='width:20px;height:20px;margin-top:-5px;margin-left:-1px;'></img>`;
      }
    }
  };
  // 获取图标文本按钮html
  iconTextButtonHtml = (icon, text) => {
    if (text) {
      return `<div class="global-map-button-icon"><i class="iconfont ${icon}"></i></div><div class="global-map-button-text">${text}</div>`;
    } else {
      return `iconfont ${icon} global-icon-normal`;
    }
  };  

  // 创建区域统计渲染
  createZStatistics = () => {

    if(!this.radius){
      setTimeout(() => {
        const zoom = this.map.getZoom();
        if(zoom<=7){//省级行政区划
          this.radius = 15000;
        }
        else if(zoom>7 && zoom <=9){//市级行政区划
          this.radius = 5000;
        }
        else{//区县级行政区划
          this.radius = 1500;
        }
        this.drawMapZStatistics();
      }, 2000);
    }
    else{
      this.drawMapZStatistics();
    }
  }

  drawMapZStatistics = () =>{
    if(RegionCenterData.length>0){
      this.clearGeojsonLayer(this.ZSgeojsonLayer);
      RegionCenterData.forEach((item) => {
        const myIcon = L.divIcon({
          html: item.num,
          className: 'my-div-icon',
          iconSize:16
        });
        //console.log('item.name',item.name);
        this.ZSgeojsonLayer.addLayer(L.circle([item.pointY,item.pointX],this.radius,Object.assign(ZSGeoJsonStyle, {name:item.name})));
        this.ZSgeojsonLayer.addLayer(L.marker([item.pointY,item.pointX], { icon: myIcon }));
      });
      //console.log('this.ZSgeojsonLayer.getLayers()',this.ZSgeojsonLayer.getLayers());
    }     
  }

  createZSPie = () => {
    if(RegionPieData.length>0){
      this.clearGeojsonLayer(this.ZSgeojsonLayer);
        RegionPieData.forEach((item,index) => {
          const myIcon = L.divIcon({
            html: `<div id="cMark${index}" style="width:40px;height:40px;position:relative;background-color:transparent;"></div>`,
            className: 'leaflet-echart-icon',
            iconSize:[40,40]
          });
          //console.log('item.name',item.name);
          this.ZSgeojsonLayer.addLayer(L.marker([item.pointY,item.pointX], { icon: myIcon }));
          let ChartMarker=echarts.init(document.getElementById(`cMark${index}`));
          let option = {
              tooltip: {
                  trigger: 'item',
                  formatter: "{a} <br/>{b}: {c} ({d}%)"
              },
              // legend: {
              //     orient: 'vertical',
              //     x: 'left',
              //     data:['直接访问','邮件营销','联盟广告','视频广告','搜索引擎']
              // },
              series : [
                {
                    name: `${item.result[0].type}`,
                    type: 'pie',
                    hoverAnimation:false,//是否开启hover在扇区上的放大动画效果
                    radius : '100%',
                    center: ['50%', '50%'],
                    label:{            //饼图图形上的文本标签
                      normal:{
                          show:true,
                          position:'inner', //标签的位置
                          textStyle : {
                              // fontWeight : 300 ,
                              fontSize : 10    //文字的字体大小
                          },
                          //formatter:'{d}%'
                          formatter:'{c}'                             
                      }
                    },
                    //{value:50,name:'高速50KM',itemStyle:{normal:{color:'#FE0000'}}},  
                    data:item.result[0].data,
                    itemStyle: {
                        emphasis: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    }
                }
              ]
          };
          ChartMarker.setOption(option);          
        });
      //console.log('this.ZSgeojsonLayer.getLayers()',this.ZSgeojsonLayer.getLayers());
    }     
  }

  //添加所有项目点要素
  addAllProjectPoints = () => {
    //查询数据源构造geojson
    const geojson = this.data2GeoJSON(ProjectPointsData);
    if (geojson) {
      //加载项目点矢量瓦片图层
      this.loadProjectPointsVectorLayer(geojson);
    }
  }
  /*
   * 矢量瓦片扰动图斑绘制函数
   */
  loadProjectPointsVectorLayer(geojson) {
    let obj = {
      //rendererFactory: L.svg.tile,
      rendererFactory: L.canvas.tile,
      // vectorTileLayerStyles: { sliced: {icon: new L.Icon.Default()} },
			vectorTileLayerStyles: {
				sliced: function(properties, zoom) {
          // return {icon: L.icon({
          //   iconUrl: './img/problemPointMarker.png',
          //   iconSize: [40, 40]
          // })};
          // return {icon: new L.Icon.Default() };
          return {
						weight: 2,
						color: 'red',
						opacity: 1,
						fillColor: 'yellow',
						fill: true,
						radius: 12,
						fillOpacity: 0.7
					}
				}
			},
      interactive: true,
      getFeatureId: function(f) {
        return f.properties.id;
      },
      maxZoom: 21,
      minZoom: config.pointLevel,
      zIndex: 500
    };
    this.projectPointVGLayer = L.vectorGrid.slicer(geojson, obj).on('click', function(e) {
      console.log('e.layer.properties', e.layer.properties);
    }).addTo(this.map);;
  }
  //查询数据源构造geojson
  data2GeoJSON(items) {
    let geojson = {};
    let item = null;
    try {
      geojson = {
        type: 'FeatureCollection',
        features: []
      };
      //构造geojson数据源
      if (items.length > 0) {
        for (let i = 0; i < items.length; i++) {
          item = items[i];
          if (item.pointX && item.pointY) {
            // console.log("item",item);
            let properties = {
              id: item.id, //项目点
              projectLevelId:item.projectLevelId,//立项级别
              complianceId:item.complianceId,//扰动合规性
              projectCateId:item.projectCateId,//项目类别
              projectNatId:item.projectNatId,//项目性质
              projectStatusId:item.projectStatusId,//建设状态
              vecTypeId:item.vecTypeId,//矢量化类型
            };

            let obj = {
              type: 'Feature',
              properties: properties,
              geometry:{
                type:"Point",
                coordinates:[item.pointX,item.pointY]
              }
            };
            geojson.features.push(obj);
          }
        }
      }
    } catch (e) {
      console.error(e, JSON.stringify(item));
    }
    return geojson;       
  }

  // 根据行政区划名称匹配对应的区域统计圆圈图层
  HLZSLayerbyName = (name) => {
    //console.log('HLZSLayerbyName',this.ZSgeojsonLayer.getLayers());
    let layers = this.ZSgeojsonLayer.getLayers();
    if(layers.length>0){
      for(let i = 0;i<layers.length;i++){
          if(layers[i].options.name && layers[i].options.name === name){
            //  layers[i].setStyle(ZSGeoJsonHLightStyle);
            layers[i].setStyle(Object.assign(ZSGeoJsonHLightStyle, {name:name}));
             break;
          }        
      }
    }
  }

  resetZSLayerbyName = (name) => {
    //console.log('resetZSLayerbyName',this.ZSgeojsonLayer.getLayers());
    let layers = this.ZSgeojsonLayer.getLayers();
    if(layers.length>0){
      for(let i = 0;i<layers.length;i++){
        if(layers[i].options.name && layers[i].options.name === name){
           layers[i].setStyle(Object.assign(ZSGeoJsonStyle, {name:name}));
           break;  
        }     
      }
    }
  }


  // 创建行政区划渲染
  createRegion = () => {
    const { regiongeojsonLayer } = this;
    const me = this;
    this.getNextRegions();
    //监听行政区划图层鼠标事件
    regiongeojsonLayer.on('click', me.onClickRegiongeojsonLayer);
    regiongeojsonLayer.on('mouseover', me.onMoveoverRegiongeojsonLayer);
    regiongeojsonLayer.on('mouseout', me.onMoveoutRegiongeojsonLayer);
  };

  onClickRegiongeojsonLayer = e => {
    const zoom = this.map.getZoom();
    if(zoom<config.pointLevel){
      this.map.flyTo(e.latlng,config.pointLevel);
    }   
  }

  onMoveoverRegiongeojsonLayer = e => {
    //console.log('onMoveoverRegiongeojsonLayer',e);
    //e.layer.feature.properties.name
    e.layer.setStyle(regionGeoJsonHLightStyle);
    e.layer.bringToFront();
    //高亮区域统计圆圈图层样式
    this.HLZSLayerbyName(e.layer.feature.properties.name);
  };

  onMoveoutRegiongeojsonLayer = e => {
    //console.log('onMoveoutRegiongeojsonLayer',e);
    e.layer.setStyle(regionGeoJsonStyle);
    //设置区域统计圆圈图层默认样式
    this.resetZSLayerbyName(e.layer.feature.properties.name);   
  };

  //获取当前账号行政区下一级行政区数据
  getNextRegions = () => {
    const user = localStorage.getItem('user');
    if (user) {
      const curuser = JSON.parse(user);
      const parentid = curuser.departmentDistrictCodeId;
      //  console.log('curuser',curuser);
      this.queryRegionByProperty(
        parentid,
        'parent_id',
        config.districtBound.mapDistrictLayerName,
        this.callbackRegionQueryWFSService
      );
    } else {
      message.warning('区域范围之外的数据没有权限操作', 1);
    }
  };

  /*
   * 行政区划查询回调函数
   */
  callbackRegionQueryWFSService = data => {
    // console.log('data',data);
    if (data && data.features.length > 0) {
      this.loadRegionGeojsonLayer(data);
      const bounds = this.regiongeojsonLayer.getBounds();
      this.map.fitBounds(bounds);
    } else {
      const user = localStorage.getItem('user');
      if (user) {
        const curuser = JSON.parse(user);
        const id = curuser.departmentDistrictCodeId;
        this.queryRegionByProperty(
          id,
          'id',
          config.districtBound.mapDistrictLayerName,
          this.callbackLastRegionQueryWFSService
        );
      }
    }
  };

  /*
   * 行政区划查询回调函数
   */
  callbackLastRegionQueryWFSService = data => {
    // console.log('data',data);
    if (data && data.features.length > 0) {
      this.loadRegionGeojsonLayer(data);
      const bounds = this.regiongeojsonLayer.getBounds();
      this.map.fitBounds(bounds);
    }
  };

  /*属性查询行政区划图层
   *@method queryRegionByProperty
   *@param propertyValue 属性值
   *@param propertyName 属性名称
   *@param typeName 图层名称
   *@return null
   */
  queryRegionByProperty = (propertyValue, propertyName, typeName, callback) => {
    const me = this;
    let filter =
      '<Filter xmlns="http://www.opengis.net/ogc" xmlns:gml="http://www.opengis.net/gml">';
    filter += '<PropertyIsEqualTo>';
    filter += '<PropertyName>' + propertyName + '</PropertyName>';
    filter += '<Literal>' + propertyValue + '</Literal>';
    filter += '</PropertyIsEqualTo>';
    filter += '</Filter>';
    let urlString = config.mapUrl.geoserverUrl + '/ows';
    let param = {
      service: 'WFS',
      version: '1.0.0',
      request: 'GetFeature',
      typeName: typeName,
      outputFormat: 'application/json',
      filter: filter
    };
    let geojsonUrl = urlString + L.Util.getParamString(param, urlString);
    me.props.dispatch({
      type: 'mapdata/queryRegionWFSLayer',
      payload: { geojsonUrl },
      callback: callback
    });
  };

  /*
   * 绘制行政区划图形函数
   */
  loadRegionGeojsonLayer = geojson => {
    this.regiongeojsonLayer.addData(geojson);
  };

  /*
   * 清空绘制图形函数
   */
  clearGeojsonLayer = (geojsonLayer) => {
    if(geojsonLayer){
       geojsonLayer.clearLayers();      
    }
  };

  /*
   * 项目符号化类型切换函数
  */
  onChangeProjectSymbol = e => {
    console.log('radio checked', e.target.value);
    const zoom = this.map.getZoom();
    if(zoom >= config.pointLevel){ //切换项目点符号类型

    }
    else{ //切换区域统计类型
      if(e.target.value === 1){
        this.createZStatistics();
      }
      else{
        this.createZSPie();
      }
    }
    this.setState({
      projectSymbolValue: e.target.value,
    });
  };

  render() {
    const radioStyle = {
      display: 'block',
      height: '25px',
      lineHeight: '25px',
    };
    const { imageTimeText, showImageTimeText,projectSymbolValue,showProjectSymbol } = this.state;
    return (
      <Layouts avtive="map">
        <div
          style={{
            position: 'absolute',
            top: 0,
            paddingTop: 46,
            height: '100vh',
            width: '100vw'
          }}
        >
          <div
            id="map"
            style={{
              boxSizing: 'border-box',
              width: '100%',
              height: '100%'
            }}
          />
          {/* 监管影像时间显示信息 */}
          <div
            style={{
              display: showImageTimeText ? 'block' : 'none',
              position: 'absolute',
              bottom: 5,
              right: 150,
              zIndex: 1000,
              background: 'rgba(255, 255, 255, 0.8)'
              // background: "#fff"
            }}
          >
            <span
              style={{
                padding: '0 10px'
              }}
            >
              监管影像时间:{imageTimeText}
            </span>
          </div>
          {/* 项目符号化 */}
          <div
            style={{
              display: showProjectSymbol ? 'block' : 'none',
              position: 'absolute',
              top: 260,
              right: 13,
              zIndex: 1000,
              background: '#fff',
              padding:'5px',
              borderRadius:'5px'
            }}
          >
            <Radio.Group onChange={this.onChangeProjectSymbol} value={projectSymbolValue}>
              <Radio style={radioStyle} value={1}>
                项目总数
              </Radio>
              <Radio style={radioStyle} value={2}>
                立项级别
              </Radio>
              <Radio style={radioStyle} value={3}>
                扰动合规性
              </Radio>
              <Radio style={radioStyle} value={4}>
                项目类别
              </Radio>
              <Radio style={radioStyle} value={5}>
                项目性质
              </Radio>
              <Radio style={radioStyle} value={6}>
                建设状态
              </Radio>
              <Radio style={radioStyle} value={7}>
                矢量化类型
              </Radio>
            </Radio.Group>
          </div>
        </div>
      </Layouts>
    );
  }
}
