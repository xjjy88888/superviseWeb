import { notification } from "antd";
import {
  measurePointCreateUpdateApi,
  measurePointDeleteApi,
  measurePointByIdApi
} from "../services/httpApi";

const initialState = {
  measurePointId: "605312469782495232",
  location: null,
  measurePointInfo: {},
  imageInfos: [],
  refresh: true,
  problemType: [],
  measurePointList: { totalCount: 0, items: [] },
  from: "edit"
};

export default {
  namespace: "measurePoint",

  state: initialState,

  subscriptions: {
    setup({ dispatch, history }) {}
  },

  effects: {
    //措施点_详情
    *measurePointById({ payload, callback }, { call, put }) {
      if (payload.from === "add") {
        yield put({
          type: "save",
          payload: { measurePointInfo: {} }
        });
        if (callback) callback(false);
      } else {
        const {
          data: { success, error, result }
        } = yield call(measurePointByIdApi, payload);
        if (success) {
          if (callback) callback(success, error, result);
          yield put({
            type: "save",
            payload: {
              measurePointInfo: result
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
    *measurePointCreateUpdate({ payload, callback }, { call, put }) {
      const {
        data: { success, error, result }
      } = yield call(measurePointCreateUpdateApi, payload);
      if (callback) callback(success, error, result);
      notification[success ? "success" : "error"]({
        message: `${payload.id ? "编辑" : "新建"}措施点${
          success ? "成功" : "失败"
        }`,
        duration: 1
      });
    },

    //措施点_删除
    *measurePointDelete({ payload, callback }, { call, put }) {
      const {
        data: { success, error, result }
      } = yield call(measurePointDeleteApi, payload);
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
