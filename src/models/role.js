import { notification } from "antd";
import {
  roleListApi,
  powerListApi,
  roleCreateUpdateApi
} from "../services/httpApi";

export default {
  namespace: "role",

  state: {
    redLineList: { totalCount: 0, items: [] },
    powerList: { totalCount: 0, items: [] },
    redLineInfo: {},
    projectSelectListRedLine: []
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
        message: `${payload.id ? "编辑" : "新建"}角色${
          success ? `成功` : `失败`
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
        yield put({ type: "save", payload: { powerList: result } });
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
