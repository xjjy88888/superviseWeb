import { notification } from "antd";
import {
  roleListApi,
  powerListApi,
  roleCreateUpdateApi,
  roleDeleteApi,
  roleDeleteMulApi
} from "../services/httpApi";

export default {
  namespace: "role",

  state: {
    roleList: { totalCount: 0, items: [] },
    redLineInfo: {},
    projectSelectListRedLine: [],
    powerList: [],
    companyTypeList: []
  },

  subscriptions: {
    setup({ dispatch, history }) {}
  },

  effects: {
    // 角色_列表
    *roleList({ payload, callback }, { call, put }) {
      const {
        data: { success, error, result }
      } = yield call(roleListApi, payload);
      if (callback) callback(success, error, result);
      if (success) {
        yield put({ type: "save", payload: { roleList: result } });
      } else {
        notification["error"]({
          message: `查询角色列表失败`
        });
      }
    },

    // 角色_新建编辑
    *roleCreateUpdate({ payload, callback }, { call, put }) {
      const {
        data: { success, error, result }
      } = yield call(roleCreateUpdateApi, payload);
      if (callback) callback(success, error, result);
      notification[success ? "success" : "error"]({
        message: `${payload.id ? "编辑" : "新建"}${success ? `成功` : `失败`}`
      });
    },

    // 角色_删除
    *roleDelete({ payload, callback }, { call, put }) {
      const {
        data: { success, error }
      } = yield call(roleDeleteApi, payload);
      if (callback) callback(success);
      notification[success ? "success" : "error"]({
        message: `删除${success ? "成功" : "失败"}${
          success ? "" : `：${error.message}`
        }`
      });
    },

    // 角色批量删除
    *roleDeleteMul({ payload, callback }, { call, put }) {
      const {
        data: { success, error }
      } = yield call(roleDeleteMulApi, payload);
      if (callback) callback(success);
      notification[success ? "success" : "error"]({
        message: `批量删除${success ? "成功" : "失败"}${
          success ? "" : `：${error.message}`
        }`
      });
    },

    // 权限列表
    *powerList({ payload, callback }, { call, put }) {
      const {
        data: { success, error, result }
      } = yield call(powerListApi, payload);
      if (callback) callback(success, error, result);
      if (success) {
        yield put({
          type: "save",
          payload: {
            [payload.userType === 1
              ? "companyTypeList"
              : "powerList"]: result.items
          }
        });
      } else {
        notification["error"]({
          message: `查询权限列表失败：${error.message}`
        });
      }
    }
  },

  reducers: {
    save(state, action) {
      return { ...state, ...action.payload };
    }
  }
};
