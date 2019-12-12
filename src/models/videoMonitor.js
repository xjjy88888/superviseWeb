import { notification } from "antd";
import {
  videoMonitorListApi,
  videoMonitorCreateUpdateApi,
  videoMonitorDeleteApi,
  videoMonitorByIdApi
} from "../services/httpApi";

export default {
  namespace: "videoMonitor",

  state: {
    videoMonitorInfo: {},
    videoMonitorList: {
      totalCount: 0,
      items: []
    }
    // videoMonitorList: {
    //   totalCount: 2,
    //   items: [
    //     {
    //       id: "1909030002",
    //       name: "1909030002",
    //       pointX: "110.03575555555555",
    //       pointY: "23.470152777777777"
    //     },
    //     {
    //       id: "1909030003",
    //       name: "1909030003",
    //       pointX: "110.03546388888888",
    //       pointY: "23.462294444444446"
    //     }
    //   ]
    // }
  },

  subscriptions: {
    setup({ dispatch, history }) {}
  },

  effects: {
    *videoMonitorList({ payload, callback }, { call, put }) {
      const {
        data: { success, result }
      } = yield call(videoMonitorListApi, payload);
      if (success) {
        yield put({ type: "save", payload: { videoMonitorList: result } });
      } else {
        notification["error"]({
          message: `查看视频监控列表失败`
        });
      }
    },

    *videoMonitorById({ payload, callback }, { call, put }) {
      if (payload) {
        const {
          data: { success, error, result }
        } = yield call(videoMonitorByIdApi, payload);
        if (success) {
          if (callback) callback(success, error, result);
          yield put({
            type: "save",
            payload: {
              videoMonitorInfo: result
            }
          });
        } else {
          notification["error"]({
            message: `查询视频监控详情失败`,
            duration: 1
          });
        }
      } else {
        yield put({
          type: "save",
          payload: { videoMonitorInfo: {} }
        });
        if (callback) callback(false);
      }
    },

    *videoMonitorCreateUpdate({ payload, callback }, { call, put }) {
      const {
        data: { success, error, result }
      } = yield call(videoMonitorCreateUpdateApi, payload);
      if (callback) callback(success, error, result);
      notification[success ? "success" : "error"]({
        message: `${payload.id ? "编辑" : "新建"}视频监控${
          success ? "成功" : "失败"
        }`,
        duration: 1
      });
    },

    *videoMonitorDelete({ payload, callback }, { call, put }) {
      const {
        data: { success, error, result }
      } = yield call(videoMonitorDeleteApi, payload);
      if (callback) callback(success, error, result);
      notification[success ? "success" : "error"]({
        message: `删除视频监控${success ? "成功" : "失败"}`,
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
    }
  }
};
