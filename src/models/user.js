import { loginApi, districtApi, dictApi, DepartApi } from "../services/httpApi";
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
    districtList: [],
    dicList: []
  },

  subscriptions: {
    setup({ dispatch, history }) {}
  },

  effects: {
    *fetch({ payload }, { call, put }) {
      yield put({ type: "save" });
    },
    *login({ payload }, { call, put }) {
      const { data: response } = yield call(loginApi, payload);
      if (response.success) {
        notification["success"]({
          message: "登录成功"
        });
        sessionStorage.setItem("user", JSON.stringify(response.result));
        yield put({
          type: "save",
          payload: { current_user: response.result }
        });
        yield put(routerRedux.replace("/regionRegulatory/integrat"));
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
    *queryDepart({ payload, callback }, { call, put }) {
      const {
        data: { success, error, result: response }
      } = yield call(DepartApi, payload);
      if (success) {
        if (response.isVaild) {
          if (callback) callback(response.department);
        } else {
          notification["warning"]({
            message: `查不到${payload.name}单位，请重新输入`
          });
        }
      } else {
        notification["error"]({
          message: `单位校验失败：${error.message}`
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
