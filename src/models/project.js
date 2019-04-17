import { routerRedux } from "dva/router";
import { getProjectUnionScopeList, getSpotList } from "../services/httpApi";

export default {
  namespace: "project",

  state: {
    projectList: { rows: [], total: 0 },
    spotList: { rows: [], total: 0 },
  },

  subscriptions: {
    setup({ dispatch, history }) {}
  },

  effects: {
    *queryProject({ payload }, { call, put }) {
      const { data: projectList } = yield call(getProjectUnionScopeList);
      yield put({ type: "save", payload: { projectList } });
    },
    *querySpot({ payload }, { call, put }) {
      const { data: spotList } = yield call(getSpotList);
      yield put({ type: "save", payload: { spotList } });
    }
  },

  reducers: {
    save(state, action) {
      return { ...state, ...action.payload };
    }
  }
};
