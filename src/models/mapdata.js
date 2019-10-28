import {
  queryWFSLayer,
  queryRegionWFSLayer,
  boundaryApi,
  projectPositionApi,
  getInfoByExtent,
  getHistorySpotTimeByExtent,
  totalByDistrictCodeApi
} from "../services/httpApi";
import { routerRedux } from "dva/router";
export default {
  namespace: "mapdata",

  state: { histories: [], historiesSpot: [], imageTimeResult: null },

  subscriptions: {
    setup({ dispatch, history }) {
      // eslint-disable-line
    }
  },

  effects: {
    *gotest({ payload, callback }, { call, put }) {
      yield put(routerRedux.replace("/home/welcome"));
    },
    *queryRegionWFSLayer({ payload, callback }, { call, put }) {
      const { data: result } = yield call(queryRegionWFSLayer, payload);
      if (callback) callback(result);
    },  
    *queryWFSLayer({ payload, callback }, { call, put }) {
      // eslint-disable-line
      //console.log(payload);
      const { data: result } = yield call(queryWFSLayer, payload);
      if (callback) callback(result);
      //yield put({ type: 'save',payload:{result}});
    },
    // 获取边界
    *GetBoundAsync({ payload, callback }, { call, put }) {
      const { data: boundary } = yield call(boundaryApi, payload);
      if (callback) callback(boundary);
      yield put({ type: "save", payload: { boundary } });
    },
    // 获取边界
    *queryProjectPosition({ payload, callback }, { call, put }) {
      const { data: projectPosition } = yield call(
        projectPositionApi,
        payload.id
      );
      if (callback) callback(projectPosition);
      yield put({ type: "save", payload: { projectPosition } });
    },
    //根据地图当前范围获取对应历史影像数据接口
    *getInfoByExtent({ payload, callback }, { call, put }) {
      const { data: result } = yield call(getInfoByExtent, payload);
      let histories = new Set(result.result.histories);
      yield put({
        type: "save",
        payload: { imageTimeResult: result.result,histories:[...histories].reverse() }
      });
      if (callback) callback([...histories].reverse());
    },
    //根据地图当前范围获取对应历史扰动图斑数据接口
    *getHistorySpotTimeByExtent({ payload, callback }, { call, put }) {
      const { data: result } = yield call(getHistorySpotTimeByExtent, payload);
      const formatNumber = n => {
        n = n.toString();
        return n[1] ? n : "0" + n;
      };
      const formatTime = date => {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        // const hour = date.getHours();
        // const minute = date.getMinutes();
        // const second = date.getSeconds();
        // return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':');
        // return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':');
        return [year, month, day].map(formatNumber).join("-") + "现状";
      };
      let historiesSpot = {};
      if (result.features.length > 0) {
        for (let i = 0; i < result.features.length; i++) {
          let item = result.features[i];
          let time = item.properties.archive_time;
          let strtime = time.split("T")[0];
          // strtime = strtime.replace(/-/g, "/");
          historiesSpot[strtime] = time;
        }
      }
      historiesSpot[formatTime(new Date())] = formatTime(new Date());
      const objKeySort = obj => {
        //排序的函数
        var newkey = Object.keys(obj).sort(); //先用Object内置类的keys方法获取要排序对象的属性名，再利用Array原型上的sort方法对获取的属性名进行排序，newkey是一个数组
        var newObj = {}; //创建一个新的对象，用于存放排好序的键值对
        for (var i = 0; i < newkey.length; i++) {
          //遍历newkey数组
          newObj[newkey[i]] = obj[newkey[i]]; //向新创建的对象中按照排好的顺序依次增加键值对
        }
        return newObj; //返回排好序的新对象
      };
      historiesSpot = objKeySort(historiesSpot); //函数执行
      // console.log(historiesSpot);
      var arr = [];
      for (let j in historiesSpot) {
        arr.push({ id: j, value: historiesSpot[j] });
      }
      //数组倒序
      arr.reverse();
      yield put({
        type: "save",
        payload: { historiesSpot: arr }
      });
      if (callback) callback(arr);
    },

    *totalByDistrictCode({ payload, callback }, { call, put }) {
      const {
        data: { result }
      } = yield call(totalByDistrictCodeApi, payload);
      yield put({
        type: "save",
        payload: { RegionCenterData: result}
      });
      if (callback) callback(result);
    },

  },

  reducers: {
    save(state, action) {
      return { ...state, ...action.payload };
    }
  }
};
