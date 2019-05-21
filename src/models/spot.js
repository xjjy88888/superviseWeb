import { notification } from "antd";
import { spotListApi, spotByIdApi } from "../services/httpApi";

export default {
  namespace: "spot",

  state: {
    spotList: { totalCount: 0, items: [] },
    projectInfoSpotList: { totalCount: 0, items: [] },
    spotItem: {}
  },

  subscriptions: {
    setup({ dispatch, history }) {}
  },

  effects: {
    // 图斑列表
    *querySpot({ payload, callback }, { call, put }) {
      const items_old = payload.items;
      const {
        data: { success, error, result: spotList }
      } = yield call(spotListApi, payload);
      if (success) {
        const data = {
          items: [...items_old, ...spotList.items],
          totalCount: spotList.totalCount
        };
        yield put({ type: "save", payload: { spotList: data } });
        if (callback) callback(data);
      } else {
        notification["error"]({
          message: `查询图斑列表失败：${error.message}`
        });
      }
    },

    // 项目id查图斑列表
    *querySpotByProjectId({ payload }, { call, put }) {
      const {
        data: { success, error, result: projectInfoSpotList }
      } = yield call(spotListApi, payload);
      if (success) {
        yield put({ type: "save", payload: { projectInfoSpotList } });
      } else {
        notification["error"]({
          message: `查询项目关联图斑列表失败：${error.message}`
        });
      }
    },

    // id查询图斑
    *querySpotById({ payload, callback }, { call, put }) {
      const {
        data: { success, error, result }
      } = yield call(spotByIdApi, payload.id);
      if (success) {
        yield put({ type: "save", payload: { spotItem: result } });
        if (callback) callback(result);
      } else {
        notification["error"]({
          message: `查询图斑信息失败：${error.message}`
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
