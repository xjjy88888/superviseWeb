import { notification } from "antd";
import {
  measureListApi,
  measureCreateUpdateApi,
  measureDeleteApi,
  measureByIdApi,
  problemTypeApi
} from "../services/httpApi";

const initialState = {
  measureId: "605312469782495232",
  location: null,
  measureInfo: {},
  imageInfos: [],
  refresh: true,
  problemType: [],
  measureList: { totalCount: 0, items: [] },
  from: "edit"
};

export default {
  namespace: "measure",

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
    *measureById({ payload, callback }, { call, put }) {
      console.log(payload);

      if (payload.from === "add") {
        yield put({
          type: "save",
          payload: { measureInfo: {} }
        });
        if (callback) callback(false);
      } else {
        const {
          data: { success, error, result }
        } = yield call(measureByIdApi, payload);
        if (success) {
          if (callback) callback(success, error, result);
          yield put({
            type: "save",
            payload: {
              measureInfo: result
            }
          });
        } else {
          notification["error"]({
            message: `查询问题点详情失败`,
            duration: 1
          });
        }
      }
    },

    // 问题点_新建编辑
    *measureCreateUpdate({ payload, callback }, { call, put }) {
      const {
        data: { success, error, result }
      } = yield call(measureCreateUpdateApi, payload);
      if (callback) callback(success, error, result);
      notification[success ? "success" : "error"]({
        message: `${payload.id ? "编辑" : "新建"}问题点${
          success ? "成功" : "失败"
        }`,
        duration: 1
      });
    },

    //问题点_删除
    *measureDelete({ payload, callback }, { call, put }) {
      const {
        data: { success, error, result }
      } = yield call(measureDeleteApi, payload);
      if (callback) callback(success, error, result);
      notification[success ? "success" : "error"]({
        message: `删除问题点${success ? "成功" : "失败"}`,
        duration: 1
      });
    },

    //问题点_列表
    *measureList({ payload, callback }, { call, put }) {
      const {
        data: { success, error, result }
      } = yield call(measureListApi, payload);
      if (callback) callback(success, error, result);
      if (success) {
        yield put({
          type: "save",
          payload: { measureList: result }
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
