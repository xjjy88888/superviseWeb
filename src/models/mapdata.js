import {
  queryWFSLayer,
  boundaryApi,
  projectPositionApi
} from "../services/httpApi";
export default {
  namespace: "mapdata",

  state: {},

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
      const { data: projectPosition } = yield call(projectPositionApi, payload.id);
      if (callback) callback(projectPosition);
      yield put({ type: "save", payload: { projectPosition } });
    }
  },

  reducers: {
    save(state, action) {
      return { ...state, ...action.payload };
    }
  }
};
