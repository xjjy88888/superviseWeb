import { notification } from "antd";
import {
  projectListApi,
  projectByIdApi,
  updateSpotGraphic,
  addSpotGraphic,
  removeSpotGraphic,
  updateProjectScopeGraphic,
  addProjectScopeGraphic,
  redLineByProjectIdApi,
  projectCreateUpdateApi,
  projectDeleteApi,
  removeProjectScopeGraphic,
  projectDeleteMulApi,
  departListApi,
  departCreateApi
} from "../services/httpApi";

export default {
  namespace: "project",

  state: {
    projectList: { totalCount: "", items: [] },
    projectInfoRedLineList: { totalCount: "", items: [] },
    projectInfo: {
      projectBase: {},
      productDepartment: { name: "", id: "" },
      expand: {
        designStartTime: "",
        designCompTime: "",
        actStartTime: "",
        actCompTime: ""
      }
    },
    departSelectList: []
  },

  subscriptions: {
    setup({ dispatch, history }) {}
  },

  effects: {
    // 项目列表
    *queryProject({ payload, callback }, { call, put }) {
      const items_old = payload.items;
      const {
        data: { success, error, result: projectList }
      } = yield call(projectListApi, payload);
      if (success) {
        const data = {
          items: [...items_old, ...projectList.items],
          totalCount: projectList.totalCount
        };
        yield put({ type: "save", payload: { projectList: data } });
        if (callback) callback(data);
      } else {
        notification["error"]({
          message: `查询项目列表失败：${error.message}`
        });
      }
    },

    // 项目信息
    *queryProjectById({ payload, callback }, { call, put }) {
      const {
        data: { success, error, result }
      } = yield call(projectByIdApi, payload.id);
      if (success) {
        console.log(payload.refresh);
        if (payload.refresh) {
          let departSelectList = [];
          const list = [
            "productDepartment",
            "supDepartment",
            // "replyDepartment",

            "projectDepartment",
            "monitorDepartment",
            "supervisionDepartment",
            "getDepartName",
            "constructionDepartment",
            "reportDepartment"
          ];
          list.map(item => {
            if (result[item]) {
              departSelectList.push({
                label: result[item].name,
                value: result[item].id
              });
            }
          });

          yield put({
            type: "save",
            payload: {
              projectInfo: result,
              departSelectList: [...new Set(departSelectList)]
            }
          });
        }
        if (callback) callback(result, success);
      } else {
        notification["error"]({
          message: `查询项目信息失败：${error.message}`
        });
      }
    },

    // 项目新建编辑
    *projectCreateUpdate({ payload, callback }, { call, put }) {
      const {
        data: { success, error, result: response }
      } = yield call(projectCreateUpdateApi, payload);
      if (success) {
        if (callback) callback(success, response);
      } else {
        notification["error"]({
          message: `${payload.id ? "编辑" : "新建"}项目失败：${error.message}`
        });
      }
    },

    // 项目删除
    *projectDelete({ payload, callback }, { call, put }) {
      const {
        data: { success, error }
      } = yield call(projectDeleteApi, payload);
      if (callback) callback(success);
      notification[success ? "success" : "error"]({
        message: `删除项目${success ? "成功" : "失败"}${
          success ? "" : `：${error.message}`
        }`
      });
    },

    // 项目批量删除
    *projectDeleteMul({ payload, callback }, { call, put }) {
      const {
        data: { success, error }
      } = yield call(projectDeleteMulApi, payload);
      if (callback) callback(success);
      notification[success ? "success" : "error"]({
        message: `批量删除项目${success ? "成功" : "失败"}${
          success ? "" : `：${error.message}`
        }`
      });
    },

    // 项目id查询项目红线列表
    *queryRedLineByProjectId({ payload }, { call, put }) {
      const {
        data: { success, error, result: projectInfoRedLineList }
      } = yield call(redLineByProjectIdApi, payload.ProjectId);
      if (success) {
        yield put({ type: "save", payload: { projectInfoRedLineList } });
      } else {
        notification["error"]({
          message: `查询项目关联红线列表失败：${error.message}`
        });
      }
    },

    // 单位列表
    *departList({ payload, callback }, { call, put }) {
      const {
        data: {
          success,
          error,
          result: { items: list }
        }
      } = yield call(departListApi, payload);
      const departSelectList = list.map(item => {
        return { label: item.name, value: item.id };
      });
      if (success) {
        yield put({
          type: "save",
          payload: { departSelectList }
        });
      } else {
        notification["error"]({
          message: `查询单位列表失败：${error.message}`
        });
      }
    },

    //部门新建
    *departCreate({ payload, callback }, { call, put }) {
      const {
        data: { success, error, result }
      } = yield call(departCreateApi, payload);
      if (success) {
        if (callback) callback(success, result);
        const departSelectList = [{ label: result.name, value: result.id }];
        yield put({
          type: "save",
          payload: { departSelectList }
        });
      } else {
        notification["error"]({
          message: `单位新建失败：${error.message}`
        });
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
