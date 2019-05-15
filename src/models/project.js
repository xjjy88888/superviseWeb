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
  redLineByProjectIdApi,
  removeProjectScopeGraphic
} from "../services/httpApi";

export default {
  namespace: "project",

  state: {
    projectList: { totalCount: "", items: [] },
    projectInfoRedLineList: { totalCount: "", items: [] },
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
    *queryProject({ payload, callback }, { call, put }) {
      const items_old = payload.items;
      const {
        data: { success, result: projectList }
      } = yield call(projectListApi, payload);
      const data = {
        items: [...items_old, ...projectList.items],
        totalCount: projectList.totalCount
      };
      yield put({ type: "save", payload: { projectList: data } });
    },

    // id查询项目
    *queryProjectById({ payload, callback }, { call, put }) {
      const {
        data: { success, result }
      } = yield call(projectByIdApi, payload.id);
      // notification[success ? "success" : "error"]({
      //   message: success ? "查询项目信息成功" : "查询项目信息失败"
      // });
      if (success) {
        yield put({ type: "save", payload: { projectItem: result } });
        if (callback) callback(result);
      }
    },

    // 项目id查询项目红线列表
    *queryRedLineByProjectId({ payload }, { call, put }) {
      const {
        data: { result: projectInfoRedLineList }
      } = yield call(redLineByProjectIdApi, payload.ProjectId);
      yield put({ type: "save", payload: { projectInfoRedLineList } });
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
