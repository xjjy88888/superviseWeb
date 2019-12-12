import { notification } from "antd";
import {
  dictTypeListApi,
  dictTypeCreateUpdateApi,
  dictTypeDeleteApi,
  dictDataListApi,
  dictDataCreateUpdateApi,
  dictDataDeleteApi,
  dictTypeDeleteMulApi,
  dictDataDeleteMulApi
} from "../services/httpApi";

export default {
  namespace: "dict",

  state: {
    dictTypeList: { totalCount: 0, items: [] },
    dictDataList: { totalCount: 0, items: [] }
  },

  subscriptions: {
    setup({ dispatch, history }) {}
  },

  effects: {
    // 字典类型_列表
    *dictTypeList({ payload, callback }, { call, put }) {
      const {
        data: { success, error, result }
      } = yield call(dictTypeListApi, payload);
      if (callback) callback(success, error, result);
      if (success) {
        yield put({ type: "save", payload: { dictTypeList: result } });
      } else {
        notification["error"]({
          message: `查询字典类型列表失败：${error.message}`
        });
      }
    },

    // 字典类型_新建编辑
    *dictTypeCreateUpdate({ payload, callback }, { call, put }) {
      const {
        data: { success, error, result }
      } = yield call(dictTypeCreateUpdateApi, payload);
      if (callback) callback(success, error, result);
    },

    // 字典类型_删除
    *dictTypeDelete({ payload, callback }, { call, put }) {
      const {
        data: { success, error, result }
      } = yield call(dictTypeDeleteApi, payload);
      if (callback) callback(success, error, result);
    },

    // 字典类型_批量删除
    *dictTypeDeleteMul({ payload, callback }, { call, put }) {
      const {
        data: { success, error, result }
      } = yield call(dictTypeDeleteMulApi, payload);
      if (callback) callback(success, error, result);
    },

    // 字典数据_列表
    *dictDataList({ payload, callback }, { call, put }) {
      const {
        data: { success, error, result }
      } = yield call(dictDataListApi, payload);
      if (callback) callback(success, error, result);
      if (success) {
        yield put({ type: "save", payload: { dictDataList: result } });
      } else {
        notification["error"]({
          message: `查询字典数据列表失败：${error.message}`
        });
      }
    },

    // 字典数据_新建编辑
    *dictDataCreateUpdate({ payload, callback }, { call, put }) {
      const {
        data: { success, error, result }
      } = yield call(dictDataCreateUpdateApi, payload);
      if (callback) callback(success, error, result);
    },

    // 字典数据_删除
    *dictDataDelete({ payload, callback }, { call, put }) {
      const {
        data: { success, error, result }
      } = yield call(dictDataDeleteApi, payload);
      if (callback) callback(success, error, result);
    },

    // 字典数据_批量删除
    *dictDataDeleteMul({ payload, callback }, { call, put }) {
      const {
        data: { success, error, result }
      } = yield call(dictDataDeleteMulApi, payload);
      if (callback) callback(success, error, result);
    }
  },

  reducers: {
    save(state, action) {
      return { ...state, ...action.payload };
    }
  }
};
