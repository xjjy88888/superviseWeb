import { queryWFSLayer } from "../services/httpApi";
export default {

  namespace: 'mapdata',

  state: {},

  subscriptions: {
    setup({ dispatch, history }) {  // eslint-disable-line
    },
  },

  effects: {
    *queryWFSLayer({ payload,callback }, { call, put }) {  // eslint-disable-line
      //console.log(payload);
      const { data: result } = yield call(queryWFSLayer, payload);
      if (callback) callback(result);
      //yield put({ type: 'save',payload:{result}});

    },
  },

  reducers: {
    save(state, action) {
      return { ...state, ...action.payload };
    },
  },

};
