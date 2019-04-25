import { routerRedux } from "dva/router";
import { Button, notification } from "antd";
import {
  projectListApi,
  projectById,
  spotListUrlApi,
  spotById,
  updateSpotGraphic,
  updateProjectScopeGraphic
} from "../services/httpApi";

export default {
  namespace: "project",

  state: {
    projectList: { totalCount: 0, items: [] },
    spotList: { totalCount: 0, items: [] },
    projectItem: {},
    spotItem: {}
  },

  subscriptions: {
    setup({ dispatch, history }) {}
  },

  effects: {
    *queryProject({ payload }, { call, put }) {
      const {
        data: { result: projectList }
      } = yield call(projectListApi, payload);
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
      const {
        data: { result: spotList }
      } = yield call(spotListUrlApi, payload);
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
    },
    *updateSpotGraphic({ payload, callback }, { call, put }) {
      const { data: obj } = yield call(updateSpotGraphic, payload);
      notification[obj ? "success" : "error"]({
        message: obj ? "编辑图斑图形成功" : "编辑图斑图形失败"
      });
      yield put({ type: "save", payload: { obj } });
      if (callback) callback(obj);
    },
    *updateProjectScopeGraphic({ payload, callback }, { call, put }) {
      const { data: obj } = yield call(updateProjectScopeGraphic, payload);
      notification[obj ? "success" : "error"]({
        message: obj ? "编辑项目红线图形成功" : "编辑项目红线图形失败"
      });
      yield put({ type: "save", payload: { obj } });
      if (callback) callback(obj);
    }
  },

  reducers: {
    save(state, action) {
      return { ...state, ...action.payload };
    }
  }
};
