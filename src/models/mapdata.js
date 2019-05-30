import {
  queryWFSLayer,
  boundaryApi,
  projectPositionApi,
  getInfoByExtent,
  getHistorySpotTimeByExtent
} from "../services/httpApi";
import { routerRedux } from "dva/router";
export default {
  namespace: "mapdata",

  state: { histories: [] },

  subscriptions: {
    setup({ dispatch, history }) {
      // eslint-disable-line
    }
  },

  effects: {
    *gotest({ payload, callback }, { call, put }) {
      yield put(routerRedux.replace("/home/welcome"));
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
        payload: { histories: [...histories].reverse() }
      });
      if (callback) callback([...histories].reverse());
    },
    //根据地图当前范围获取对应历史扰动图斑数据接口
    *getHistorySpotTimeByExtent({ payload, callback }, { call, put }) {
      const { data: result } = yield call(getHistorySpotTimeByExtent, payload);
      const formatNumber = n => {
        n = n.toString();
        return n[1] ? n : '0' + n;
      }
      const formatTime = date => {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        //const hour = date.getHours();
        //const minute = date.getMinutes();
        //const second = date.getSeconds();    
        // return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':');
        // return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':');
        return [year, month, day].map(formatNumber).join('/');
      }
      let timeList = [];
      if(result.features.length>0){
          for(let i =0; i< result.features.length;i++){
              let item = result.features[i];
              let time = item.properties.archive_time;
              time = time.split("T")[0];
              time = time.replace(/-/g, "/");
              timeList.push(time);
          }
      }
      timeList.push(formatTime(new Date()));
      console.log(timeList);
      let historiesSpot = new Set(timeList);
      console.log([...historiesSpot].reverse());
      if (callback) callback(result);
    }
  },

  reducers: {
    save(state, action) {
      return { ...state, ...action.payload };
    }
  }
};
