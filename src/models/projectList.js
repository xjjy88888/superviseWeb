import { notification } from 'antd';
import { projectDataListApi } from '../services/httpApi';

export default {
  namespace: 'projectList',

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
      } = yield call(projectDataListApi, payload);
      console.log(result);
      if (success) {
        yield put({ type: 'save', payload: { projectDataList: result } });
      } else {
        notification['error']({
          message: `查询项目监管列表失败`
        });
      }
      if (callback) callback(success, result);
    }
  },

  reducers: {
    save(state, action) {
      return { ...state, ...action.payload };
    }
  }
};
