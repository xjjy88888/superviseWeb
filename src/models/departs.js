import { notification } from "antd";
import {
  departsTreeApi,
  departsListApi,
  departsCreateUpdateApi,
  departsDeleteApi,
  departsDeleteMulApi
} from "../services/httpApi";

export default {
  namespace: "departs",

  state: {
    departsTree: [{ children: null, id: null, value: null }],
    departsList: { totalCount: 0, items: [] }
  },

  subscriptions: {
    setup({ dispatch, history }) {}
  },

  effects: {
    // 行政部门_树状列表
    *departsTree({ payload, callback }, { call, put }) {
      const {
        data: { success, error, result }
      } = yield call(departsTreeApi, payload);
      if (callback) callback(success, error, result);
      if (success) {
        yield put({
          type: "save",
          payload: { departsTree: result.items[0].children }
        });
      } else {
        notification["error"]({
          message: `查询行政部门列表失败`
        });
      }
    },

    // 行政部门_列表1
    *departsList({ payload, callback }, { call, put }) {
      const {
        data: { success, error, result }
      } = yield call(departsListApi, payload);
      if (callback) callback(success, error, result);
      if (success) {
        yield put({
          type: "save",
          payload: { departsList: result }
        });
      } else {
        notification["error"]({
          message: `查询行政部门列表失败`
        });
      }
    },

    // 行政部门_新建编辑
    *departsCreateUpdate({ payload, callback }, { call, put }) {
      const {
        data: { success, error, result }
      } = yield call(departsCreateUpdateApi, payload);
      if (callback) callback(success, error, result);
      if (success) {
        yield put({
          type: "save",
          payload: { departsList: result.items }
        });
      } else {
        notification["error"]({
          message: `查询行政部门列表失败`
        });
      }
    },

    // 行政部门_删除
    *departsDelete({ payload, callback }, { call, put }) {
      const {
        data: { success, error, result }
      } = yield call(departsDeleteApi, payload);
      if (callback) callback(success, error, result);
    },

    // 行政部门批量删除
    *departsDeleteMul({ payload, callback }, { call, put }) {
      const {
        data: { success, error, result }
      } = yield call(departsDeleteMulApi, payload);
      if (callback) callback(success, error, result);
    }
  },

  reducers: {
    save(state, action) {
      return { ...state, ...action.payload };
    }
  }
};
