import { notification } from "antd";
import {
  inspectFormApi,
  inspectCreateUpdateApi,
  inspectListApi,
  inspectDeleteApi,
  inspectByIdApi
} from "../services/httpApi";

export default {
  namespace: "inspect",

  state: {
    inspectForm: [],
    inspectList: [],
    inspectInfo: { checkInfoLists: null }
  },

  subscriptions: {
    setup({ dispatch, history }) {}
  },

  effects: {
    // 检查表_模板
    *inspectForm({ payload, callback }, { call, put }) {
      const {
        data: { success, error, result }
      } = yield call(inspectFormApi, payload);
      if (callback) callback(success, error, result);
      if (success) {
        yield put({ type: "save", payload: { inspectForm: result } });
      } else {
        notification["error"]({
          message: `查询检查表模板失败：${error.message}`
        });
      }
    },

    // 检查表_项目id查询列表
    *inspectList({ payload, callback }, { call, put }) {
      const {
        data: { success, error, result }
      } = yield call(inspectListApi, payload);
      if (callback) callback(success, error, result);
      if (success) {
        yield put({ type: "save", payload: { inspectList: result.items } });
      } else {
        notification["error"]({
          message: `查询检查表列表失败：${error.message}`
        });
      }
    },

    // 检查表_新建编辑
    *inspectCreateUpdate({ payload, callback }, { call, put }) {
      const {
        data: { success, error, result }
      } = yield call(inspectCreateUpdateApi, payload);
      if (callback) callback(success, error, result);
      notification[success ? "success" : "error"]({
        message: `${payload.id ? "编辑" : "新增"}检查表${
          success ? "成功" : "失败"
        }`
      });
    },

    //检查表_删除
    *inspectDelete({ payload, callback }, { call, put }) {
      const {
        data: { success, error, result }
      } = yield call(inspectDeleteApi, payload);
      if (callback) callback(success, error, result);
      notification[success ? "success" : "error"]({
        message: `删除检查表${success ? "成功" : "失败"}`
      });
    },

    //检查表_详情
    *inspectById({ payload, callback }, { call, put }) {
      console.log(payload);
      if (payload.from === "add") {
        yield put({
          type: "save",
          payload: { inspectInfo: { checkInfoLists: null } }
        });
      } else {
        const {
          data: { success, error, result }
        } = yield call(inspectByIdApi, payload);
        if (callback) callback(success, error, result);
        if (success) {
          yield put({ type: "save", payload: { inspectInfo: result } });
        } else {
          notification["error"]({
            message: `查询检查表详情失败`
          });
        }
      }
    }
  },

  reducers: {
    save(state, action) {
      return { ...state, ...action.payload };
    }
  }
};
