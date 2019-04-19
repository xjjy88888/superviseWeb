import { routerRedux } from "dva/router";
import { Button, notification } from "antd";
import {
  projectScopeGetIntersects,
  projectById,
  spotGetIntersects,
  spotById
} from "../services/httpApi";

export default {
  namespace: "project",

  state: {
    projectList: [],
    spotList: [],
    projectItem: {},
    spotItem: {}
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
    *queryProjectById({ payload, callback }, { call, put }) {
      const { data: projectItem } = yield call(projectById, payload.id);
      notification[projectItem.length ? "success" : "error"]({
        message: projectItem.length ? "查询项目成功" : "查询项目失败"
      });
      if (projectItem.length) {
        yield put({ type: "save", payload: { projectItem: projectItem[0] } });
      }
      if (callback) callback(projectItem);
    },
    *querySpot({ payload }, { call, put }) {
      const { data: spotList } = yield call(spotGetIntersects, payload);
      yield put({ type: "save", payload: { spotList } });
    },
    *querySpotById({ payload, callback }, { call, put }) {
      const { data: spotItem } = yield call(spotById, payload.id);
      notification[spotItem.length ? "success" : "error"]({
        message: spotItem.length ? "查询图斑成功" : "查询图斑失败"
      });
      if (spotItem.length) {
        yield put({
          type: "save",
          payload: { spotItem: spotItem[0] }
        });
      }
      if (callback) callback(spotItem);
    }
  },

  reducers: {
    save(state, action) {
      return { ...state, ...action.payload };
    }
  }
};
