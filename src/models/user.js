import {
  loginApi,
  dictApi,
  basinOrganizationApi,
  departVaildApi,
  powerListApi
} from "../services/httpApi";
import { routerRedux } from "dva/router";
import { notification } from "antd";

export default {
  namespace: "user",

  state: {
    current_user: [
      {
        us_name: "请登录"
      }
    ],
    dicList: [],
    departSelectList: [],
    basinOrganList: [],
    departList: [],
    departUpdateId: "",
    powerList: []
  },

  subscriptions: {
    setup({ dispatch, history }) {}
  },

  effects: {
    *goBack({ payload }, { call, put }) {
      yield put(routerRedux.goBack());
    },
    *fetch({ payload }, { call, put }) {
      yield put({ type: "save" });
    },
    *login({ payload, callback }, { call, put }) {
      const { data: response } = yield call(loginApi, payload);
      if (callback) callback();
      if (response.success) {
        notification["success"]({
          message: "登录成功"
        });
        localStorage.setItem("user", JSON.stringify(response.result));
        yield put({
          type: "save",
          payload: { current_user: response.result }
        });
        yield put(routerRedux.replace("/regionalSupervision/integration"));
      } else {
        notification["error"]({
          message: `登录失败：${response.error.message}`
        });
      }
    },
    *loginOut({ payload }, { call, put }) {
      yield put(routerRedux.replace("/login"));
    },
    *queryDict({ payload }, { call, put }) {
      const {
        data: {
          success,
          error,
          result: { items: dicList }
        }
      } = yield call(dictApi, payload);
      if (success) {
        yield put({
          type: "save",
          payload: { dicList }
        });
      } else {
        notification["error"]({
          message: `查询字典失败：${error.message}`
        });
      }
    },

    //部门校验
    *departVaild({ payload, callback }, { call, put }) {
      const {
        data: { success, error, result: response }
      } = yield call(departVaildApi, payload);
      if (success) {
        if (callback) callback(response.isVaild, response.department);
      } else {
        notification["error"]({
          message: `单位校验失败：${error.message}`
        });
      }
    },

    //流域机构列表
    *basinOrgan({ payload, callback }, { call, put }) {
      const {
        data: { success, error, result: basinOrganList }
      } = yield call(basinOrganizationApi, payload);
      if (success) {
        yield put({
          type: "save",
          payload: { basinOrganList }
        });
      } else {
        notification["error"]({
          message: `获取流域机构列表失败：${error.message}`
        });
      }
    },

    // 权限列表
    *powerList({ payload, callback }, { call, put }) {
      const {
        data: { success, error, result }
      } = yield call(powerListApi, payload);
      if (callback) callback(success, error, result);
      if (success) {
        yield put({ type: "save", payload: { powerList: result.items } });
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
