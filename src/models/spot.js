import { routerRedux } from "dva/router";
import { Button, notification } from "antd";
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
        data: { result: spotList }
      } = yield call(spotListApi, payload);
      const data = {
        items: [...items_old, ...spotList.items],
        totalCount: spotList.totalCount
      };
      yield put({ type: "save", payload: { spotList: data } });
      if (callback) callback(data);
    },

    // 项目id查询图斑列表
    *querySpotByProjectId({ payload }, { call, put }) {
      const {
        data: { result: projectInfoSpotList }
      } = yield call(spotListApi, payload);
      yield put({ type: "save", payload: { projectInfoSpotList } });
    },

    // id查询图斑
    *querySpotById({ payload, callback }, { call, put }) {
      const {
        data: { success, result }
      } = yield call(spotByIdApi, payload.id);
      // notification[success ? "success" : "error"]({
      //   message: success ? "查询图斑成功" : "查询图斑失败"
      // });
      if (success) {
        yield put({ type: "save", payload: { spotItem: result } });
        if (callback) callback(result);
      } else {
        notification["error"]({
          message: "查询图斑失败"
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
