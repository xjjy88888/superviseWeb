import { routerRedux } from "dva/router";
import { notification } from "antd";
import {
  problemPointListApi,
  problemPointCreateUpdateApi,
  problemPointDeleteApi,
  problemPointByIdApi,
  problemTypeApi
} from "../services/httpApi";
import config from "../config";

const initialState = {
  problemPointId: "605312469782495232",
  location: null,
  problemPointInfo: {},
  imageInfos: [],
  refresh: true,
  problemType: [],
  problemPointList: { totalCount: 0, items: [] },
  from: "edit"
};

export default {
  namespace: "problemPoint",

  state: initialState,

  subscriptions: {
    setup({ dispatch, history }) {}
  },

  effects: {
    // 问题点_问题类型
    *problemType({ payload, callback }, { call, put }) {
      const {
        data: { success, error, result }
      } = yield call(problemTypeApi, payload);
      if (callback) callback(success, error, result);

      const res = result.map(item => {
        if (item.label === "措施缺陷") {
          return { ...item, children: item.children[0].children };
        } else {
          return item;
        }
      });
      const re = res.map(item => {
        if (item.label === "措施缺陷") {
          const arr = item.children.map(ite => {
            return {
              label: ite.label,
              value: ite.value,
              data: ite.children
            };
          });
          return {
            label: item.label,
            value: item.value,
            children: arr
          };
        } else {
          const arr = item.children.map(ite => {
            const arr2 = ite.children.map(it => {
              return {
                label: it.label,
                value: it.value,
                data: it.children
              };
            });
            return {
              label: ite.label,
              value: ite.value,
              children: arr2
            };
          });
          return {
            label: item.label,
            value: item.value,
            children: arr
          };
        }
      });

      if (success) {
        yield put({
          type: "save",
          payload: { problemType: re }
        });
      } else {
        notification["error"]({
          message: `查询问题类型失败`,
          duration: 1
        });
      }
    },

    //问题点_详情
    *problemPointById({ payload, callback }, { call, put }) {
      const {
        data: { success, error, result }
      } = yield call(problemPointByIdApi, payload);
      if (success) {
        if (callback) callback(success, error, result);
        yield put({
          type: "save",
          payload: {
            problemPointInfo: result
          }
        });
      } else {
        notification["error"]({
          message: `查询问题点详情失败`,
          duration: 1
        });
      }
    },

    // 问题点_新建编辑
    *problemPointCreateUpdate({ payload, callback }, { call, put }) {
      const {
        data: { success, error, result }
      } = yield call(problemPointCreateUpdateApi, payload);
      if (callback) callback(success, error, result);
      notification["error"]({
        message: `${payload.id ? "编辑" : "新增"}问题点${
          success ? "成功" : "失败"
        }`,
        duration: 1
      });
    },

    //问题点_删除
    *problemPointDelete({ payload, callback }, { call, put }) {
      const {
        data: { success, error, result }
      } = yield call(problemPointDeleteApi, payload);
      if (callback) callback(success, error, result);
      notification["error"]({
        message: `删除问题点${success ? "成功" : "失败"}`,
        duration: 1
      });
    },

    //问题点_列表
    *problemPointList({ payload, callback }, { call, put }) {
      const {
        data: { success, error, result }
      } = yield call(problemPointListApi, payload);
      if (callback) callback(success, error, result);
      if (success) {
        yield put({
          type: "save",
          payload: { problemPointList: result }
        });
      } else {
        notification["error"]({
          message: `查询问题点列表失败`,
          duration: 1
        });
      }
    }
  },

  reducers: {
    save(state, action) {
      return {
        ...state,
        ...action.payload
      };
    },

    clear() {
      return initialState;
    }
  }
};
