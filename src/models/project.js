import { routerRedux } from "dva/router";
import {
  projectScopeGetIntersects,
  projectById,
  spotGetIntersects
} from "../services/httpApi";

export default {
  namespace: "project",

  state: {
    projectList: [],
    spotList: [],
    projectItem: {}
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
    *queryProjectById({ payload }, { call, put }) {
      const { data: projectItem } = yield call(projectById, payload.project_id);
      yield put({ type: "save", payload: { projectItem: projectItem[0] } });
    },
    *querySpot({ payload }, { call, put }) {
      //console.log(payload);
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
