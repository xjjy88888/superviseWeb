import { notification } from 'antd';
import {
  projectSuperviseListApi,
  projectSuperviseCreateUpdateApi,
  projectSuperviseDeleteApi,
  projectListApi,
  projectShareApi,
  projectImportApi,
  projectSuperviseCancelDeleteApi,
  projectSuperviseForeverDeleteApi
} from '../services/httpApi';

export default {
  namespace: 'projectSupervise',

  state: {
    projectSuperviseList: { totalCount: 0, items: [] },
    projectItem: {
      projectBase: {},
      productDepartment: { name: '', id: '' },
      expand: {
        designStartTime: '',
        designCompTime: '',
        actStartTime: '',
        actCompTime: ''
      }
    }
  },

  subscriptions: {
    setup({ dispatch, history }) {}
  },

  effects: {
    *queryProjectSupervise({ payload, callback }, { call, put }) {
      const items_old = payload.items;
      const {
        data: { success, error, result }
      } = yield call(projectSuperviseListApi, payload);
      if (success) {
        const response = {
          items: [...items_old, ...result.items],
          totalCount: result.totalCount
        };
        yield put({
          type: 'save',
          payload: { projectSuperviseList: response }
        });
        if (callback) callback(success, response);
      } else {
        notification['error']({
          message: `查询图斑列表失败：${error.message}`
        });
        if (callback) callback(success);
      }
    },

    *projectSuperviseList({ payload, callback }, { call, put }) {
      const {
        data: { success, result }
      } = yield call(
        payload.isImport ? projectListApi : projectSuperviseListApi,
        payload
      );
      if (success) {
        yield put({ type: 'save', payload: { projectSuperviseList: result } });
      } else {
        notification['error']({
          message: `查询项目监管列表失败`
        });
      }
      if (callback) callback(success, result);
    },

    *projectSuperviseCreateUpdate({ payload, callback }, { call, put }) {
      const {
        data: { success }
      } = yield call(projectSuperviseCreateUpdateApi, payload);
      notification[success ? 'success' : 'error']({
        message: `${payload.id ? '编辑' : '新建'}${success ? '成功' : '失败'}`
      });
      if (callback) callback(success);
    },

    *projectSuperviseDelete({ payload, callback }, { call, put }) {
      const {
        data: { success }
      } = yield call(projectSuperviseDeleteApi, payload);
      notification[success ? 'success' : 'error']({
        message: `删除${success ? '成功' : '失败'}`
      });
      if (callback) callback(success);
    },

    *projectShare({ payload, callback }, { call, put }) {
      const {
        data: { success }
      } = yield call(projectShareApi, payload);
      notification[success ? 'success' : 'error']({
        message: `共享${success ? '成功' : '失败'}`
      });
      if (callback) callback(success);
    },

    *projectImport({ payload, callback }, { call, put }) {
      const {
        data: { success }
      } = yield call(projectImportApi, payload);
      notification[success ? 'success' : 'error']({
        message: `导入${success ? '成功' : '失败'}`
      });
      if (callback) callback(success);
    },

    *projectSuperviseCancelDelete({ payload, callback }, { call, put }) {
      const {
        data: { success }
      } = yield call(projectSuperviseCancelDeleteApi, payload);
      notification[success ? 'success' : 'error']({
        message: `恢复${success ? '成功' : '失败'}`
      });
      if (callback) callback(success);
    },

    *projectSuperviseForeverDelete({ payload, callback }, { call, put }) {
      const {
        data: { success }
      } = yield call(projectSuperviseForeverDeleteApi, payload);
      notification[success ? 'success' : 'error']({
        message: `永久删除${success ? '成功' : '失败'}`
      });
      if (callback) callback(success);
    }
  },

  reducers: {
    save(state, action) {
      return { ...state, ...action.payload };
    }
  }
};
