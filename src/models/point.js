import { notification } from "antd";
import {
  pointListApi,
  pointByIdApi,
  pointSiteByIdApi
} from "../services/httpApi";

export default {
  namespace: "point",

  state: {
    pointList: { totalCount: 0, items: [] },
    pointItem: {},
    pointSite: {}
  },

  subscriptions: {
    setup({ dispatch, history }) {}
  },

  effects: {
    // 标注点列表
    *queryPoint({ payload, callback }, { call, put }) {
      const {
        data: { success, error, result: pointList }
      } = yield call(pointListApi, payload);
      const data = {
        items: [...payload.items, ...pointList.items],
        totalCount: pointList.totalCount
      };
      if (success) {
        yield put({ type: "save", payload: { pointList: data } });
        if (callback) callback(data);
      } else {
        notification["error"]({
          message: `查询标注点列表失败：${error.message}`
        });
      }
    },

    // id查询标注点
    *queryPointById({ payload, callback }, { call, put }) {
      const {
        data: { success, error, result }
      } = yield call(pointByIdApi, payload.id);
      if (success) {
        yield put({ type: "save", payload: { pointItem: result } });
        if (callback) callback(result);
      } else {
        notification["error"]({
          message: `查询标注点信息失败：${error.message}`
        });
      }
    },

    // id查询标注点经纬度
    *queryPointSiteById({ payload, callback }, { call, put }) {
      const {
        data: { success, error, result }
      } = yield call(pointSiteByIdApi, payload.id);
      if (success) {
        yield put({ type: "save", payload: { pointSite: result } });
        if (callback) callback(result);
      } else {
        notification["error"]({
          message: `查询标注点经纬度失败：${error.message}`
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
