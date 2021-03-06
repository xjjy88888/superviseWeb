import { notification } from "antd";
import {
  spotTableListApi,
  spotListApi,
  spotPolygonByIdApi,
  spotByIdApi,
  spotCreateUpdateApi,
  projectListApi,
  spotDeleteApi,
  spotArchiveApi,
  spotUnArchiveApi,
  spotDeleteMulApi,
  spotHistoryApi,
  spotOldImgApi,
  interpretListApi,
  spotReviewCreateUpdateApi,
  spotReviewDeleteApi,
  spotDivideApi
} from "../services/httpApi";
import { messages } from "../utils/util";

export default {
  namespace: "spot",

  state: {
    spotTableList: { totalCount: 0, items: [] },
    spotList: { totalCount: 0, items: [] },
    projectInfoSpotList: { totalCount: 0, items: [] },
    spotInfo: {
      mapNum: "",
      provinceCityDistrict: [null, null, null],
      spotReviews: []
    },
    projectSelectListSpot: [],
    spotHistoryList: [],
    interpretList: []
  },

  subscriptions: {
    setup({ dispatch, history }) {}
  },

  effects: {
    // 图斑列表---表格展示
    *getSpotTableList({ payload, callback }, { call, put }) {
      const {
        data: { success, error, result: spotTableList }
      } = yield call(spotTableListApi, payload);
      if (success) {
        const response = {
          items: spotTableList.items,
          totalCount: spotTableList.totalCount
        };
        if (callback) callback(success, response);
        yield put({ type: "save", payload: { spotTableList: response } });
      } else {
        notification["error"]({
          message: `查询图斑列表失败：${error.message}`
        });
        if (callback) callback(success);
      }
    },
    // 图斑列表
    *querySpot({ payload, callback }, { call, put }) {
      const items_old = payload.items;
      const {
        data: { success, error, result: spotList }
      } = yield call(spotListApi, payload);
      if (success) {
        const response = {
          items: [...items_old, ...spotList.items],
          totalCount: spotList.totalCount
        };
        yield put({ type: "save", payload: { spotList: response } });
        if (callback) callback(success, response);
      } else {
        notification["error"]({
          message: `查询图斑列表失败：${error.message}`
        });
        if (callback) callback(success);
      }
    },

    // 图斑信息
    *querySpotById({ payload, callback }, { call, put }) {
      const {
        data: { success, error, result }
      } = yield call(spotByIdApi, payload.id);
      if (success) {
        if (result) {
          const projectSelectListSpot = result.projectName
            ? [{ label: result.projectName, value: result.projectId }]
            : [];
          if (payload.refresh) {
            yield put({
              type: "save",
              payload: { spotInfo: result, projectSelectListSpot }
            });
          }
        }
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
        if (callback) callback(success);
        notification["error"]({
          message: `${payload.id ? "编辑" : "新建"}图斑失败：${
            error.validationErrors
              ? error.validationErrors[0].message
              : error.message
          }`
        });
      }
    },

    // 图斑复核-新建编辑
    *spotReviewCreateUpdate({ payload, callback }, { call, put }) {
      const {
        data: { success, error }
      } = yield call(spotReviewCreateUpdateApi, payload);
      if (callback) callback(success);
      messages(success, error, `${payload.id ? "编辑" : "新建"}图斑复核`);
    },

    // 图斑复核-删除
    *spotReviewDelete({ payload, callback }, { call, put }) {
      const {
        data: { success, error }
      } = yield call(spotReviewDeleteApi, payload);
      if (callback) callback(success);
      messages(success, error, `删除图斑复核`);
    },

    // 图斑删除
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

    // 图斑批量删除
    *spotDeleteMul({ payload, callback }, { call, put }) {
      const {
        data: { success, error }
      } = yield call(spotDeleteMulApi, payload);
      if (callback) callback(success);
      notification[success ? "success" : "error"]({
        message: `批量删除图斑${success ? "成功" : "失败"}${
          success ? "" : `：${error.message}`
        }`
      });
    },

    // 图斑归档
    *spotArchive({ payload, callback }, { call, put }) {
      const {
        data: { success, error }
      } = yield call(spotArchiveApi, payload);
      if (callback) callback(success);
      notification[success ? "success" : "error"]({
        message: `图斑归档${success ? "成功" : "失败"}${
          success ? "" : `：${error.message}`
        }`
      });
    },

    // 图斑撤销归档
    *spotUnArchive({ payload, callback }, { call, put }) {
      const {
        data: { success, error }
      } = yield call(spotUnArchiveApi, payload);
      if (callback) callback(success);
      notification[success ? "success" : "error"]({
        message: `图斑撤销归档${success ? "成功" : "失败"}${
          success ? "" : `：${error.message}`
        }`
      });
    },

    // 项目id查图斑列表
    *projectInfoSpotList({ payload, callback }, { call, put }) {
      const {
        data: { success, error, result: projectInfoSpotList }
      } = yield call(spotListApi, payload);
      if (callback) callback(success, projectInfoSpotList);
      if (success) {
        yield put({ type: "save", payload: { projectInfoSpotList } });
      } else {
        notification["error"]({
          message: `查询项目关联图斑列表失败：${error.message}`
        });
      }
    },

    // 项目id查图斑列表
    *querySpotPolygonByProjectId({ payload, callback }, { call }) {
      const {
        data: { success, result }
      } = yield call(spotPolygonByIdApi, payload.ProjectId);
      if (callback) callback(success, result);
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
      const projectSelectListSpot = list.map(item => {
        return {
          label: item.projectName,
          value: item.id
        };
      });
      if (success) {
        yield put({
          type: "save",
          payload: { projectSelectListSpot }
        });
      } else {
        notification["error"]({
          message: `查询关联项目列表失败：${error.message}`
        });
      }
    },

    // 图斑统计
    *spotChart({ payload, callback }, { call, put }) {
      const {
        data: { success, error, result }
      } = yield call(spotListApi, payload);
      if (callback) callback(success, error, result);
    },

    // 图斑历史
    *spotHistory({ payload, callback }, { call, put }) {
      const {
        data: { success, error, result }
      } = yield call(spotHistoryApi, payload);
      if (success) {
        yield put({
          type: "save",
          payload: { spotHistoryList: result }
        });
      } else {
        notification["error"]({
          message: `查询图斑历史失败：${error.message}`
        });
      }
    },

    // 图斑同步旧系统附件
    *spotOldImg({ payload, callback }, { call, put }) {
      const {
        data: { success, error, result }
      } = yield call(spotOldImgApi, payload);
      if (callback) callback(success, error, result);
    },

    *interpretList({ payload, callback }, { call, put }) {
      const {
        data: { success, result }
      } = yield call(interpretListApi, payload);
      if (callback) callback(success, result);
      if (success) {
        yield put({
          type: "save",
          payload: { interpretList: result }
        });
      }
    },

    *spotDivide({ payload, callback }, { call, put }) {
      const {
        data: { success, error }
      } = yield call(spotDivideApi, payload);
      if (callback) callback(success);
      messages(success, error, `图斑分割`);
    }
  },

  reducers: {
    save(state, action) {
      return { ...state, ...action.payload };
    }
  }
};
