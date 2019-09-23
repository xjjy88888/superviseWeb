import { notification } from "antd";
import { panoramaListApi } from "../services/httpApi";

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
    }
  },

  reducers: {
    save(state, action) {
      return { ...state, ...action.payload };
    }
  }
};
