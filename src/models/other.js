import { txRegionApi } from "../services/httpApi";

export default {
  namespace: "other",

  state: {
    spotList: { totalCount: 0, items: [] },
    projectInfoSpotList: { totalCount: 0, items: [] },
    spotItem: {}
  },

  subscriptions: {
    setup({ dispatch, history }) {}
  },

  effects: {
    // 腾讯地图
    *queryTxRegion({ payload }, { call, put }) {
      const response = yield call(txRegionApi, payload);
      console.log(response);
      // yield put({ type: "save", payload: { spotList: data } });
    }
  },

  reducers: {
    save(state, action) {
      return { ...state, ...action.payload };
    }
  }
};
