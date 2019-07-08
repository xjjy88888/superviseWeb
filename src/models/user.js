import {
  loginApi,
  districtApi,
  dictApi,
  basinOrganizationApi,
  departVaildApi
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
    districtList: [{ children: null, id: null, value: null }],
    dicList: [],
    departSelectList: [],
    basinOrganList: [],
    departList: [],
    departUpdateId: ""
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
        sessionStorage.setItem("user", JSON.stringify(response.result));
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
    *queryDistrict({ payload }, { call, put }) {
      const {
        data: { result: districtList }
      } = yield call(districtApi);
      yield put({
        type: "save",
        payload: { districtList: [districtList] }
      });
    },
    *loginOut({ payload }, { call, put }) {
      yield put(routerRedux.replace("/user/login"));
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
    }
  },

  reducers: {
    save(state, action) {
      return { ...state, ...action.payload };
    }
  }
};
