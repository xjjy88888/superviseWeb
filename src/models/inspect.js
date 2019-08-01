import { notification } from "antd";
import {
  inspectFormApi,
  inspectCreateUpdateApi,
  inspectListApi,
  inspectDeleteApi,
  inspectByIdApi,
  inspectExportApi
} from "../services/httpApi";
import { inspectFormData } from "../utils/util";

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
        yield put({
          type: "save",
          payload: { inspectForm: inspectFormData(result) }
        });
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
      if (payload.from === "add") {
        yield put({
          type: "save",
          payload: { inspectInfo: { checkInfoLists: null } }
        });
        if (callback) callback(false);
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
    },

    //检查表_导出
    *inspectExport({ payload, callback }, { call, put }) {
      const {
        data: { success, error, result }
      } = yield call(inspectExportApi, payload);
      notification[success ? "success" : "error"]({
        message: `导出检查表${success ? "成功" : "失败"}`
      });
      if (callback) callback(success, error, result);
    }
  },

  reducers: {
    save(state, action) {
      return { ...state, ...action.payload };
    }
  }
};
