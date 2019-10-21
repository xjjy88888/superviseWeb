import { notification } from 'antd';
import {
  projectSuperviseListApi,
  projectSuperviseCreateUpdateApi
} from '../services/httpApi';

export default {
  namespace: 'projectSupervise',

  state: {
    projectDataList: { totalCount: 0, items: [] },
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
    *projectDataList({ payload, callback }, { call, put }) {
      const {
        data: { success, result }
      } = yield call(projectSuperviseListApi, payload);
      if (success) {
        yield put({ type: 'save', payload: { projectDataList: result } });
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
        message: `${payload.id ? '编辑' : '新建'}项目${
          success ? '成功' : '失败'
        }`
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
