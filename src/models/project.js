import { routerRedux } from "dva/router";
import {
  projectScopeGetIntersects,
  spotGetIntersects
} from "../services/httpApi";

export default {
  namespace: "project",

  state: {
    projectList: [],
    spotList: []
  },

  subscriptions: {
    setup({ dispatch, history }) {}
  },

  effects: {
    *queryProject({ payload }, { call, put }) {
      const { data: projectList } = yield call(
        projectScopeGetIntersects,
        payload
      );
      yield put({ type: "save", payload: { projectList } });
    },
    *querySpot({ payload }, { call, put }) {
      console.log(payload);
      const { data: spotList } = yield call(spotGetIntersects, payload);
      yield put({ type: "save", payload: { spotList } });
    }
  },

  reducers: {
    save(state, action) {
      return { ...state, ...action.payload };
    }
  }
};
