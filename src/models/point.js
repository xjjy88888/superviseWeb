import { routerRedux } from "dva/router";
import { Button, notification } from "antd";
import { pointListApi, projectByIdApi } from "../services/httpApi";

export default {
  namespace: "point",

  state: {
    pointList: { totalCount: 0, items: [] },
    pointItem: {}
  },

  subscriptions: {
    setup({ dispatch, history }) {}
  },

  effects: {
    // 标注点列表
    *queryPoint({ payload }, { call, put }) {
      const {
        data: { result: pointList }
      } = yield call(pointListApi, payload);
      const data = {
        items: [...payload.items, ...pointList.items],
        totalCount: pointList.totalCount
      };
      yield put({ type: "save", payload: { pointList: data } });
    },

    // id查询标注点
    *queryPointById({ payload, callback }, { call, put }) {
      const {
        data: { success, result }
      } = yield call(projectByIdApi, payload.id);
      notification[success ? "success" : "error"]({
        message: success ? "查询标注点成功" : "查询标注点失败"
      });
      if (success) {
        yield put({ type: "save", payload: { pointItem: result } });
      }
    }
  },

  reducers: {
    save(state, action) {
      return { ...state, ...action.payload };
    }
  }
};
