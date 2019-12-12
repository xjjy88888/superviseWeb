import { notification } from "antd";
import {
  panoramaListApi,
  panoramaCreateUpdateApi,
  panoramaDeleteApi
} from "../services/httpApi";

export default {
  namespace: "videoMonitor",

  state: {
    videoMonitorList: {
      totalCount: 2,
      items: [
        {
          id: "1909030002",
          name: "1909030002",
          pointX: "110.03575555555555",
          pointY: "23.470152777777777"
        },
        {
          id: "1909030003",
          name: "1909030003",
          pointX: "110.03546388888888",
          pointY: "23.462294444444446"
        }
      ]
    }
  },

  subscriptions: {
    setup({ dispatch, history }) {}
  },

  effects: {},

  reducers: {
    save(state, action) {
      return { ...state, ...action.payload };
    }
  }
};
