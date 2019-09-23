import { notification } from "antd";
import { panoramaListApi, panoramaCreateUpdateApi } from "../services/httpApi";

export default {
  namespace: "panorama",

  state: {
    panoramaList: { totalCount: 0, items: [] }
  },

  subscriptions: {
    setup({ dispatch, history }) {}
  },

  effects: {
    *panoramaList({ payload, callback }, { call, put }) {
      const {
        data: { success, result }
      } = yield call(panoramaListApi, payload);
      if (success) {
        yield put({ type: "save", payload: { panoramaList: result } });
      } else {
        notification["error"]({
          message: `查看全景图列表失败`
        });
      }
    },

    *panoramaCreateUpdate({ payload, callback }, { call, put }) {
      const {
        data: { success, result }
      } = yield call(panoramaCreateUpdateApi, payload);
      if (callback) callback(success, result);
      notification[success ? "success" : "error"]({
        message: `${payload.id ? "编辑" : "新建"}全景图${
          success ? "成功" : "失败"
        }`,
        duration: 1
      });
    }
  },

  reducers: {
    save(state, action) {
      return { ...state, ...action.payload };
    }
  }
};
