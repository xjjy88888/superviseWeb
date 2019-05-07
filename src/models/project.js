import { routerRedux } from "dva/router";
import { Button, notification } from "antd";
import {
  projectListApi,
  projectByIdApi,
  updateSpotGraphic,
  addSpotGraphic,
  removeSpotGraphic,
  updateProjectScopeGraphic,
  addProjectScopeGraphic,
  removeProjectScopeGraphic
} from "../services/httpApi";

export default {
  namespace: "project",

  state: {
    projectList: { totalCount: 0, items: [] },
    projectItem: {
      projectBase: { name: "" },
      expand: {
        designStartTime: "",
        designCompTime: "",
        actStartTime: "",
        actCompTime: ""
      }
    }
  },

  subscriptions: {
    setup({ dispatch, history }) {}
  },

  effects: {
    // 项目列表
    *queryProject({ payload }, { call, put }) {
      const {
        data: { result: projectList }
      } = yield call(projectListApi, payload.row);
      const data = {
        items: [...payload.items, ...projectList.items],
        totalCount: projectList.totalCount
      };
      yield put({ type: "save", payload: { projectList: data } });
    },

    // id查询项目
    *queryProjectById({ payload, callback }, { call, put }) {
      const {
        data: { success, result }
      } = yield call(projectByIdApi, payload.id);
      notification[success ? "success" : "error"]({
        message: success ? "查询项目成功" : "查询项目失败"
      });
      if (success) {
        yield put({ type: "save", payload: { projectItem: result } });
      }
    },
    *updateSpotGraphic({ payload, callback }, { call, put }) {
      const { data: obj } = yield call(updateSpotGraphic, payload);
      notification[obj ? "success" : "error"]({
        message: obj ? "编辑图斑图形成功" : "编辑图斑图形失败"
      });
      yield put({ type: "save", payload: { obj } });
      if (callback) callback(obj);
    },
    *addSpotGraphic({ payload, callback }, { call, put }) {
      const { data: obj } = yield call(addSpotGraphic, payload);
      notification[obj ? "success" : "error"]({
        message: obj ? "新增图斑图形成功" : "新增图斑图形失败"
      });
      yield put({ type: "save", payload: { obj } });
      if (callback) callback(obj);
    },
    *removeSpotGraphic({ payload, callback }, { call, put }) {
      const { data: obj } = yield call(removeSpotGraphic, payload.spot_tbid);
      notification[obj ? "success" : "error"]({
        message: obj ? "删除图斑图形成功" : "删除图斑图形失败"
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
    },
    *addProjectScopeGraphic({ payload, callback }, { call, put }) {
      const { data: obj } = yield call(addProjectScopeGraphic, payload);
      notification[obj ? "success" : "error"]({
        message: obj ? "新增项目红线图形成功" : "新增项目红线图形失败"
      });
      yield put({ type: "save", payload: { obj } });
      if (callback) callback(obj);
    },
    *removeProjectScopeGraphic({ payload, callback }, { call, put }) {
      const { data: obj } = yield call(
        removeProjectScopeGraphic,
        payload.project_id
      );
      notification[obj ? "success" : "error"]({
        message: obj ? "删除项目红线图形成功" : "删除项目红线图形失败"
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
