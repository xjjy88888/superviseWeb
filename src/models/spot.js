import { notification } from "antd";
import {
  spotListApi,
  spotByIdApi,
  spotCreateUpdateApi,
  projectListApi,
  spotDeleteApi
} from "../services/httpApi";

export default {
  namespace: "spot",

  state: {
    spotList: { totalCount: 0, items: [] },
    projectInfoSpotList: { totalCount: 0, items: [] },
    spotInfo: { mapNum: "", provinceCityDistrict: [null, null, null] },
    projectSelectList: []
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

    // 图斑信息
    *querySpotById({ payload, callback }, { call, put }) {
      const {
        data: { success, error, result }
      } = yield call(spotByIdApi, payload.id);
      if (success) {
        const projectSelectList = result.projectName
          ? [{ label: result.projectName, value: result.projectId }]
          : [];
        yield put({
          type: "save",
          payload: { spotInfo: result, projectSelectList }
        });
        if (callback) callback(result);
      } else {
        notification["error"]({
          message: `查询图斑信息失败：${error.message}`
        });
      }
    },

    // 图斑新建编辑
    *spotCreateUpdate({ payload, callback }, { call, put }) {
      const {
        data: { success, error, result: response }
      } = yield call(spotCreateUpdateApi, payload);
      if (success) {
        if (callback) callback(success, response);
      } else {
        notification["error"]({
          message: `${payload.id ? "编辑" : "新建"}图斑失败：${error.message}`
        });
      }
    },

    //图斑删除
    *spotDelete({ payload, callback }, { call, put }) {
      const {
        data: { success, error }
      } = yield call(spotDeleteApi, payload);
      if (callback) callback(success);
      notification[success ? "success" : "error"]({
        message: `删除图斑${success ? "成功" : "失败"}${
          success ? "" : `：${error.message}`
        }`
      });
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

    // 项目下拉列表
    *queryProjectSelect({ payload, callback }, { call, put }) {
      const {
        data: {
          success,
          error,
          result: { items: list }
        }
      } = yield call(projectListApi, payload);
      const projectSelectList = list.map(item => {
        return {
          label: item.projectName,
          value: item.id
        };
      });
      if (success) {
        yield put({
          type: "save",
          payload: { projectSelectList }
        });
      } else {
        notification["error"]({
          message: `查询关联项目列表失败：${error.message}`
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
