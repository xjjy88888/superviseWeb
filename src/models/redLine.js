import { notification } from "antd";
import {
  redLineListApi,
  redLineByIdApi,
  redLineCreateUpdateApi,
  redLineDeleteApi,
  redLineDeleteMulApi
} from "../services/httpApi";

export default {
  namespace: "redLine",

  state: {
    redLineList: { totalCount: 0, items: [] },
    redLineInfo: {},
    projectSelectListRedLine: []
  },

  subscriptions: {
    setup({ dispatch, history }) {}
  },

  effects: {
    // 项目红线列表
    *queryRedLineList({ payload, callback }, { call, put }) {
      const {
        data: { success, error, result: redLineList }
      } = yield call(redLineListApi, payload.ProjectId);
      if (callback) callback(success);
      if (success) {
        yield put({ type: "save", payload: { redLineList } });
      } else {
        notification["error"]({
          message: `查询项目红线列表失败：${error.message}`
        });
      }
    },

    // 项目红线信息
    *queryredLineById({ payload, callback }, { call, put }) {
      const {
        data: { success, error, result }
      } = yield call(redLineByIdApi, payload.id);
      if (success) {
        const projectSelectListRedLine = result.upmapDepartment
          ? [
              {
                label: result.upmapDepartment.name,
                value: result.upmapDepartment.id
              }
            ]
          : [];
        yield put({
          type: "save",
          payload: { redLineInfo: result, projectSelectListRedLine }
        });
        if (callback) callback(result);
      } else {
        notification["error"]({
          message: `查询项目红线信息失败：${error.message}`
        });
      }
    },

    // 项目红线新建编辑
    *redLineCreateUpdate({ payload, callback }, { call, put }) {
      const {
        data: { success, error, result: response }
      } = yield call(redLineCreateUpdateApi, payload);
      if (success) {
        if (callback) callback(success, response);
      } else {
        notification["error"]({
          message: `${payload.id ? "编辑" : "新建"}项目红线失败：${
            error.message
          }`
        });
      }
    },

    // 项目红线删除
    *redLineDelete({ payload, callback }, { call, put }) {
      const {
        data: { success, error }
      } = yield call(redLineDeleteApi, payload);
      if (callback) callback(success);
      notification[success ? "success" : "error"]({
        message: `删除项目红线${success ? "成功" : "失败"}${
          success ? "" : `：${error.message}`
        }`
      });
    },

    // 项目红线批量删除
    *redLineDeleteMul({ payload, callback }, { call, put }) {
      const {
        data: { success, error }
      } = yield call(redLineDeleteMulApi, payload);
      if (callback) callback(success);
      notification[success ? "success" : "error"]({
        message: `批量删除项目红线${success ? "成功" : "失败"}${
          success ? "" : `：${error.message}`
        }`
      });
    }
  },

  reducers: {
    save(state, action) {
      return { ...state, ...action.payload };
    }
  }
};
