import { notification } from "antd";
import {
  dictTypeListApi,
  dictTypeByIdApi,
  dictTypeCreateUpdateApi,
  dictTypeDeleteApi,
  dictTypeDeleteMulApi
} from "../services/httpApi";

export default {
  namespace: "dict",

  state: {
    dictTypeList: { totalCount: 0, items: [] },
    dictTypeInfo: {}
  },

  subscriptions: {
    setup({ dispatch, history }) {}
  },

  effects: {
    // 字典类型列表
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

    // 字典类型新建编辑
    *dictTypeCreateUpdate({ payload, callback }, { call, put }) {
      const {
        data: { success, error, result }
      } = yield call(dictTypeCreateUpdateApi, payload);
      if (callback) callback(success, error, result);
    },

    // 字典类型删除
    *dictTypeDelete({ payload, callback }, { call, put }) {
      const {
        data: { success, error, result }
      } = yield call(dictTypeDeleteApi, payload);
      if (callback) callback(success, error, result);
    },

    // 字典类型批量删除
    *dictTypeDeleteMul({ payload, callback }, { call, put }) {
      const {
        data: { success, error }
      } = yield call(dictTypeDeleteMulApi, payload);
      if (callback) callback(success);
      notification[success ? "success" : "error"]({
        message: `批量删除字典类型${success ? "成功" : "失败"}${
          success ? "" : `：${error.message}`
        }`
      });
    },

    // 字典类型信息
    *querydictTypeById({ payload, callback }, { call, put }) {
      const {
        data: { success, error, result }
      } = yield call(dictTypeByIdApi, payload.id);
      if (success) {
        const projectSelectListdictType = result.project
          ? [{ label: result.project.projectName, value: result.project.id }]
          : [];
        yield put({
          type: "save",
          payload: { dictTypeInfo: result, projectSelectListdictType }
        });
        if (callback) callback(result);
      } else {
        notification["error"]({
          message: `查询字典类型信息失败：${error.message}`
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
