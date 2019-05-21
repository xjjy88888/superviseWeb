import {
  queryWFSLayer,
  boundaryApi,
  projectPositionApi,
  getInfoByExtent
} from "../services/httpApi";
export default {
  namespace: "mapdata",

  state: { histories: [] },

  subscriptions: {
    setup({ dispatch, history }) {
      // eslint-disable-line
    }
  },

  effects: {
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
      yield put({ type: "save", payload: { histories: [...histories].reverse() } });
      if (callback) callback([...histories].reverse());
    }
  },

  reducers: {
    save(state, action) {
      return { ...state, ...action.payload };
    }
  }
};
