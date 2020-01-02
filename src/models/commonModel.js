import { notification } from "antd";
import {} from "../services/httpApi";

export default {
  namespace: "commonModel",

  state: {
    siderBarPageInfo: {
      activeMenu: ""
    },
    mergeProjectModalInfo: {
      tableDataSource: [],
      tableSelectedRowKeys: []
    }
  },

  effects: {
    // 行政区划批量删除
    // *districtDeleteMul({ payload, callback }, { call, put }) {
    //   const {
    //     data: { success, error, result }
    //   } = yield call(districtDeleteMulApi, payload);
    //   if (callback) callback(success, error, result);
    // }
  },

  reducers: {
    save(state, action) {
      return { ...state, ...action.payload };
    }
  }
};
