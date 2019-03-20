import { routerRedux } from 'dva/router';

export default {
  namespace: 'index',

  state: {},

  subscriptions: {
    setup({ dispatch, history }) {
    },
  },

  effects: {
  },

  reducers: {
    save(state, action) {
      return { ...state, ...action.payload };
    },
  },
};
