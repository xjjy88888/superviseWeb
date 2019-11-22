import { notification } from "antd";
import {
  measureCreateUpdateApi,
  measureDeleteApi,
  measureByIdApi
} from "../services/httpApi";

const initialState = {
  measureId: "605312469782495232",
  location: null,
  measureInfo: {},
  imageInfos: [],
  refresh: true,
  problemType: [],
  measureList: { totalCount: 0, items: [] },
  from: "edit"
};

export default {
  namespace: "measure",

  state: initialState,

  subscriptions: {
    setup({ dispatch, history }) {}
  },

  effects: {
    //措施点_详情
    *measureById({ payload, callback }, { call, put }) {
      if (payload.from === "add") {
        yield put({
          type: "save",
          payload: { measureInfo: {} }
        });
        if (callback) callback(false);
      } else {
        const {
          data: { success, error, result }
        } = yield call(measureByIdApi, payload);
        if (success) {
          if (callback) callback(success, error, result);
          yield put({
            type: "save",
            payload: {
              measureInfo: result
            }
          });
        } else {
          notification["error"]({
            message: `查询措施点详情失败`,
            duration: 1
          });
        }
      }
    },

    // 措施点_新建编辑
    *measureCreateUpdate({ payload, callback }, { call, put }) {
      const {
        data: { success, error, result }
      } = yield call(measureCreateUpdateApi, payload);
      if (callback) callback(success, error, result);
      notification[success ? "success" : "error"]({
        message: `${payload.id ? "编辑" : "新建"}措施点${
          success ? "成功" : "失败"
        }`,
        duration: 1
      });
    },

    //措施点_删除
    *measureDelete({ payload, callback }, { call, put }) {
      const {
        data: { success, error, result }
      } = yield call(measureDeleteApi, payload);
      if (callback) callback(success, error, result);
      notification[success ? "success" : "error"]({
        message: `删除措施点${success ? "成功" : "失败"}`,
        duration: 1
      });
    }
  },

  reducers: {
    save(state, action) {
      return {
        ...state,
        ...action.payload
      };
    },

    clear() {
      return initialState;
    }
  }
};
