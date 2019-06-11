import { notification } from "antd";
import {
  annexDeleteApi,
  exportApi,
  annexUploadBase64Api
} from "../services/httpApi";

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
        data: { success, error }
      } = yield call(annexDeleteApi, payload);
      if (callback) callback(success);
      notification[success ? "success" : "error"]({
        message: success ? `附件删除成功` : `附件删除失败：${error.message}`
      });
    },

    // 附件上传base64
    *annexUploadBase64Api({ payload, callback }, { call, put }) {
      const {
        data: { success, error, result }
      } = yield call(annexUploadBase64Api, payload);
      if (callback) callback(success, error, result);
    },

    // 导出项目
    *export({ payload, callback }, { call, put }) {
      const {
        data: { success, error, result }
      } = yield call(exportApi, payload);
      if (callback) callback(success, error, result);
      notification[success ? "success" : "error"]({
        message: `导出${payload.key === "Project" ? "项目" : "图斑"}${
          payload.isAttach ? "附件" : ""
        }数据${success ? "成功" : "失败"}${success ? "" : `：${error.message}`}`
      });
    }
  },

  reducers: {
    save(state, action) {
      return { ...state, ...action.payload };
    }
  }
};
