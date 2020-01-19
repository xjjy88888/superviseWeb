import {} from "../services/httpApi";

export default {
  namespace: "waterKeep",

  state: {
    showwaterKeepPage: ""
  },

  effects: {
    //
    // *xxx({ payload, callback }, { call, put }) {
    //   const {
    //     data: { success, error, result }
    //   } = yield call('xxx', payload);
    //   if (callback) callback(success, error, result);
    // }
  },

  reducers: {
    save(state, action) {
      return { ...state, ...action.payload };
    }
  }
};
