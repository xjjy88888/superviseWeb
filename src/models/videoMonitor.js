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
          pointX: "113.398818969727",
          pointY: "23.5104781756014"
        },
        {
          id: "1909030003",
          name: "1909030003",
          pointX: "113.398818969727",
          pointY: "23.5104781756014"
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
