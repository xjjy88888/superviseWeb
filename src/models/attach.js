import { notification } from "antd";
import { attachmentListApi } from "../services/httpApi";

export default {
  namespace: "attach",

  state: {
    spotList: { totalCount: 0, items: [] },
    projectInfoSpotList: { totalCount: 0, items: [] },
    spotItem: {}
  },

  subscriptions: {
    setup({ dispatch, history }) {}
  },

  effects: {
    // 附件列表
    *queryAttachById({ payload, callback }, { call, put }) {
      const {
        data: {
          success,
          error,
          result: { child: attachList }
        }
      } = yield call(attachmentListApi, payload);
      if (success) {
        yield put({ type: "save", payload: { attachList } });
        if (callback) callback(attachList);
      } else {
        notification["error"]({
          message: `查询项目列表失败：${error.message}`
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
