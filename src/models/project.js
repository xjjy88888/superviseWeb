/* eslint-disable array-callback-return */
import { notification } from "antd";
import {
  projectTableListApi,
  projectListApi,
  projectByIdApi,
  updateSpotGraphic,
  addSpotGraphic,
  removeSpotGraphic,
  updateProjectScopeGraphic,
  addProjectScopeGraphic,
  projectVerifyApi,
  projectCreateUpdateApi,
  projectDeleteApi,
  removeProjectScopeGraphic,
  projectDeleteMulApi,
  departListApi,
  departCreateApi,
  projectUnArchiveApi,
  projectUnbindSpotApi,
  projectArchiveApi,
  projectSuperviseCreateUpdateApi,
  projectExamineApi,
  projectSetExamineApi,
  projectCancelExamineApi
} from "../services/httpApi";
import { messages } from "../utils/util";

export default {
  namespace: "project",

  state: {
    showProjectBigTable: true,
    projectList: { totalCount: 0, items: [] },
    projectTableList: { totalCount: 0, items: [] },
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
    departSelectList: [],
    projectListAdd: [],
    queryParams: {},
    projectInfoMoreLeftShow: false
  },
  subscriptions: {
    setup({ dispatch, history }) {}
  },

  effects: {
    *projectSave({ payload, callback }, { call, put }) {
      yield put({ type: "save", payload });
    },
    // 项目列表---表格展示
    *getProjectTableList({ payload, callback }, { call, put }) {
      const {
        data: { success, error, result: projectTableList }
      } = yield call(projectTableListApi, payload);

      if (success) {
        const response = {
          items: projectTableList.items,
          totalCount: projectTableList.totalCount
        };
        if (callback) callback(success, response);
        yield put({ type: "save", payload: { projectTableList: response } });
      } else {
        notification["error"]({
          message: `查询项目列表失败：${error.message}`
        });
        if (callback) callback(success, projectTableList);
      }
    },

    // 项目列表
    *queryProject({ payload, callback }, { call, put }) {
      const items_old = payload.items;
      const {
        data: { success, error, result: projectList }
      } = yield call(projectListApi, payload);
      if (success) {
        const response = {
          items: [...items_old, ...projectList.items],
          totalCount: projectList.totalCount
        };
        if (callback) callback(success, response);
        yield put({ type: "save", payload: { projectList: response } });
      } else {
        notification["error"]({
          message: `查询项目列表失败：${error.message}`
        });
        if (callback) callback(success);
      }
    },

    // 项目列表模糊查询
    *queryProjectAdd({ payload, callback }, { call, put }) {
      const {
        data: { success, error, result }
      } = yield call(projectListApi, payload);
      if (success) {
        const d = result.items.map(item => item.projectName);
        yield put({ type: "save", payload: { projectListAdd: d } });
      } else {
        notification["error"]({
          message: `新建项目名模糊查询失败：${error.message}`
        });
      }
    },

    // 项目信息
    *queryProjectById({ payload, callback }, { call, put }) {
      const {
        data: { success, error, result }
      } = yield call(projectByIdApi, payload.id);
      if (success) {
        if (result) {
          let departSelectList = [];
          const list = [
            "productDepartment",
            "supDepartment",
            "replyDepartment",
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
          if (payload.refresh) {
            yield put({
              type: "save",
              payload: {
                projectInfo: result,
                departSelectList: [...new Set(departSelectList)]
              }
            });
          }
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
        data: { success }
      } = yield call(
        payload.isProjectSupervise
          ? projectSuperviseCreateUpdateApi
          : projectCreateUpdateApi,
        payload
      );
      notification[success ? `success` : `error`]({
        message: `${payload.id ? "编辑" : "新建"}${success ? `成功` : `失败`}`
      });
      if (callback) callback(success);
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

    // 项目归档
    *projectArchive({ payload, callback }, { call, put }) {
      const {
        data: { success, error }
      } = yield call(projectArchiveApi, payload);
      if (callback) callback(success);
      notification[success ? "success" : "error"]({
        message: `项目归档${success ? "成功" : "失败"}${
          success ? "" : `：${error.message}`
        }`
      });
    },

    // 项目撤销归档
    *projectUnArchive({ payload, callback }, { call, put }) {
      const {
        data: { success, error }
      } = yield call(projectUnArchiveApi, payload);
      if (callback) callback(success);
      notification[success ? "success" : "error"]({
        message: `撤销归档${success ? "成功" : "失败"}${
          success ? "" : `：${error.message}`
        }`
      });
    },

    // 项目重名验证
    *projectVerify({ payload, callback }, { call, put }) {
      const {
        data: { success, error, result }
      } = yield call(projectVerifyApi, payload);
      if (callback) callback(success, result);
      if (!success) {
        notification["error"]({
          message: `项目重名验证失败${error.message}`
        });
      }
    },

    // 项目取消关联图斑
    *projectUnRelateSpot({ payload, callback }, { call, put }) {
      const {
        data: { success, error }
      } = yield call(projectUnbindSpotApi, payload);
      if (callback) callback(success);
      messages(success, error, "取消关联图斑");
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
      if (success) {
        const departSelectList = list.map(item => {
          return { label: item.name, value: item.id };
        });
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

    // 项目统计
    *projectChart({ payload, callback }, { call, put }) {
      const {
        data: { success, error, result }
      } = yield call(projectListApi, payload);
      if (callback) callback(success, error, result);
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
        message: obj ? "新建图斑图形成功" : "新建图斑图形失败"
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
        message: obj ? "新建项目红线图形成功" : "新建项目红线图形失败"
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
    },

    *projectExamine({ payload, callback }, { call, put }) {
      const {
        data: { success }
      } = yield call(projectExamineApi, payload);
      notification[success ? "success" : "error"]({
        message: success ? "项目查处成功" : "项目查处失败"
      });
      if (callback) callback(success);
    },

    *projectSetExamine({ payload, callback }, { call, put }) {
      const {
        data: { success, error }
      } = yield call(projectSetExamineApi, payload);
      if (callback) callback(success);
      messages(success, error, "设置待查处");
    },

    *projectCancelExamine({ payload, callback }, { call, put }) {
      const {
        data: { success, error }
      } = yield call(projectCancelExamineApi, payload);
      if (callback) callback(success);
      messages(success, error, "取消待查处");
    }
  },

  reducers: {
    save(state, action) {
      // console.log("...action.payload=========", action);
      return {
        ...state,
        ...action.payload
      };
    }
  }
};
