import { notification } from "antd";
import { annexDeleteApi } from "../services/httpApi";

export default {
  namespace: "annex",

  state: {
    spotList: { totalCount: 0, items: [] },
    projectInfoSpotList: { totalCount: 0, items: [] },
    spotItem: {}
  },

  subscriptions: {
    setup({ dispatch, history }) {}
  },

  effects: {
    // 附件删除
    *annexDelete({ payload, callback }, { call, put }) {
      const {
        data: { success, error, result }
      } = yield call(annexDeleteApi, payload);
      if (callback) callback(success);
      if (success) {
      } else {
        notification["error"]({
          message: `附件删除失败：${error.message}`
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
