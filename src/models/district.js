import { notification } from "antd";
import {
  districtTreeApi,
  districtCreateUpdateApi,
  districtDeleteApi,
  districtDeleteMulApi
} from "../services/httpApi";
import { dateTimeFormat, tree } from "../utils/util";

export default {
  namespace: "district",

  state: {
    districtTree: [{ children: null, id: null, value: null }]
  },

  subscriptions: {
    setup({ dispatch, history }) {}
  },

  effects: {
    // 行政区划_列表
    *districtTree({ payload }, { call, put }) {
      const {
      data: { result: districtTree }
      } = yield call(districtTreeApi);
      console.log(districtTree);
      console.log(tree(districtTree));
      yield put({
        type: "save",
        payload: { districtTree: [districtTree] }
      });
    },

    // 行政区划_列表
    *districtTree_({ payload, callback }, { call, put }) {
      const {
        data: { success, error, result }
      } = yield call(districtTreeApi, payload);
      if (callback) callback(success, error, result);
      if (success) {
        yield put({ type: "save", payload: { districtTree: result } });
      } else {
        notification["error"]({
          message: `查询行政区划列表失败：${error.message}`
        });
      }
    },

    // 行政区划_新建编辑
    *districtCreateUpdate({ payload, callback }, { call, put }) {
      const {
        data: { success, error, result }
      } = yield call(districtCreateUpdateApi, payload);
      if (callback) callback(success, error, result);
    },

    // 行政区划_删除
    *districtDelete({ payload, callback }, { call, put }) {
      const {
        data: { success, error, result }
      } = yield call(districtDeleteApi, payload);
      if (callback) callback(success, error, result);
    },

    // 行政区划批量删除
    *districtDeleteMul({ payload, callback }, { call, put }) {
      const {
        data: { success, error }
      } = yield call(districtDeleteMulApi, payload);
      if (callback) callback(success);
      notification[success ? "success" : "error"]({
        message: `批量删除行政区划${success ? "成功" : "失败"}${
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
