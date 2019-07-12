import { notification } from "antd";
import {
  districtListApi,
  districtCreateUpdateApi,
  districtDeleteApi,
  districtDeleteMulApi
} from "../services/httpApi";

export default {
  namespace: "district",

  state: {
    districtList: [{ children: null, id: null, value: null }]
  },

  subscriptions: {
    setup({ dispatch, history }) {}
  },

  effects: {
    // 行政区划_列表
    *districtList({ payload }, { call, put }) {
      let arr = [];
      let arr2 = [];
      const {
        data: { result: districtList }
      } = yield call(districtListApi);
      console.log(districtList);
      districtList.children.map(item => {
        arr.push({ ...item, parent: districtList.label });
        // item.children.map(ite => {
        //   arr.push({ ...ite, parent: item.label });
        // });
      });
      console.log(arr);
      yield put({
        type: "save",
        payload: { districtList: [districtList] }
      });
    },

    // 行政区划_列表
    *districtList_({ payload, callback }, { call, put }) {
      const {
        data: { success, error, result }
      } = yield call(districtListApi, payload);
      if (callback) callback(success, error, result);
      if (success) {
        yield put({ type: "save", payload: { districtList: result } });
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
