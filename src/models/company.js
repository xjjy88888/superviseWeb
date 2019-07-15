import { notification } from "antd";
import {
  companyListApi,
  companyCreateUpdateApi,
  companyDeleteApi,
  companyDeleteMulApi
} from "../services/httpApi";

export default {
  namespace: "company",

  state: {
    companyList: { totalCount: 0, items: [] },
    dictDataList: { totalCount: 0, items: [] }
  },

  subscriptions: {
    setup({ dispatch, history }) {}
  },

  effects: {
    // 单位_列表
    *companyList({ payload, callback }, { call, put }) {
      const {
        data: { success, error, result }
      } = yield call(companyListApi, payload);
      if (callback) callback(success, error, result);
      if (success) {
        yield put({ type: "save", payload: { companyList: result } });
      } else {
        notification["error"]({
          message: `查询单位列表失败：${error.message}`
        });
      }
    },

    // 单位_新建编辑
    *companyCreateUpdate({ payload, callback }, { call, put }) {
      const {
        data: { success, error, result }
      } = yield call(companyCreateUpdateApi, payload);
      if (callback) callback(success, error, result);
    },

    // 单位_删除
    *companyDelete({ payload, callback }, { call, put }) {
      const {
        data: { success, error, result }
      } = yield call(companyDeleteApi, payload);
      if (callback) callback(success, error, result);
    },

    // 单位_批量删除
    *companyDeleteMul({ payload, callback }, { call, put }) {
      const {
        data: { success, error, result }
      } = yield call(companyDeleteMulApi, payload);
      if (callback) callback(success, error, result);
    }
  },

  reducers: {
    save(state, action) {
      return { ...state, ...action.payload };
    }
  }
};
