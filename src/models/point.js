import { notification } from "antd";
import {
  pointListApi,
  pointByIdApi,
  pointSiteByIdApi,
  pointCreateUpdateApi,
  pointDeleteApi,
  pointDeleteMulApi
} from "../services/httpApi";

export default {
  namespace: "point",

  state: {
    pointList: { totalCount: 0, items: [] },
    pointItem: {},
    pointSite: {}
  },

  subscriptions: {
    setup({ dispatch, history }) {}
  },

  effects: {
    // 标注点列表
    *queryPoint({ payload, callback }, { call, put }) {
      const {
        data: { success, error, result: pointList }
      } = yield call(pointListApi, payload);
      const data = {
        items: [...payload.items, ...pointList.items],
        totalCount: pointList.totalCount
      };
      if (success) {
        yield put({ type: "save", payload: { pointList: data } });
        if (callback) callback(data);
      } else {
        notification["error"]({
          message: `查询标注点列表失败：${error.message}`
        });
      }
    },

    // 标注点信息
    *queryPointById({ payload, callback }, { call, put }) {
      const {
        data: { success, error, result }
      } = yield call(pointByIdApi, payload.id);
      if (success) {
        yield put({ type: "save", payload: { pointItem: result } });
        if (callback) callback(result);
      } else {
        notification["error"]({
          message: `查询标注点信息失败：${error.message}`
        });
      }
    },

    // 标注点新建编辑
    *pointCreateUpdate({ payload, callback }, { call, put }) {
      const {
        data: { success, error, result: response }
      } = yield call(pointCreateUpdateApi, payload);
      if (success) {
        if (callback) callback(success, response);
      } else {
        notification["error"]({
          message: `${payload.id ? "编辑" : "新建"}标注点失败：${error.message}`
        });
      }
    },

    // 标注点删除
    *pointDelete({ payload, callback }, { call, put }) {
      const {
        data: { success, error }
      } = yield call(pointDeleteApi, payload);
      if (callback) callback(success);
      notification[success ? "success" : "error"]({
        message: `删除标注点${success ? "成功" : "失败"}${
          success ? "" : `：${error.message}`
        }`
      });
    },

    // 标注点批量删除
    *pointDeleteMul({ payload, callback }, { call, put }) {
      const {
        data: { success, error }
      } = yield call(pointDeleteMulApi, payload);
      if (callback) callback(success);
      notification[success ? "success" : "error"]({
        message: `批量删除标注点${success ? "成功" : "失败"}${
          success ? "" : `：${error.message}`
        }`
      });
    },

    // id查询标注点经纬度
    *queryPointSiteById({ payload, callback }, { call, put }) {
      const {
        data: { success, error, result }
      } = yield call(pointSiteByIdApi, payload.id);
      if (success) {
        yield put({ type: "save", payload: { pointSite: result } });
        if (callback) callback(result);
      } else {
        notification["error"]({
          message: `查询标注点经纬度失败：${error.message}`
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
