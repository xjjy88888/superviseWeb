import { mergeProjectApi } from "../services/httpApi";

export default {
  namespace: "commonModel",

  state: {
    siderBarPageInfo: {
      activeMenu: "",
      currentProjectId: "",
      currentSpotId: ""
    },
    mergeProjectModalInfo: {
      tableDataSource: [],
      tableSelectedRowKeys: []
    }
  },

  effects: {
    // 项目合并请求
    *mergeProject({ payload, callback }, { call, put }) {
      const {
        data: { success, error, result }
      } = yield call(mergeProjectApi, payload);
      if (callback) callback(success, error, result);
    }
  },

  reducers: {
    save(state, action) {
      return { ...state, ...action.payload };
    }
  }
};
