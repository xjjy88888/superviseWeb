import {
  userListApi,
  teamListApi,
  lawListApi,
  infoListApi,
  noticeListApi,
  updateNoticeInfo
} from "../services/httpApi";

export default {
  namespace: "settings",

  state: {
    userList: [],
    teamList: [],
    infoList: [],
    noticeList: [],
    lawList: []
  },

  subscriptions: {
    setup({ dispatch, history }) {}
  },

  effects: {
    *queryUser({ payload }, { call, put }) {
      const { data: userList } = yield call(userListApi);

      yield put({
        type: "save",
        payload: { userList }
      });
    },
    *queryTeam({ payload }, { call, put }) {
      const { data: teamList } = yield call(teamListApi, payload.us_id);

      yield put({
        type: "save",
        payload: { teamList }
      });
    },
    *queryLaw({ payload }, { call, put }) {
      const { data: lawList } = yield call(lawListApi);

      yield put({
        type: "save",
        payload: { lawList }
      });
    },
    *queryInfo({ payload }, { call, put }) {
      const { data: infoList } = yield call(infoListApi);

      yield put({
        type: "save",
        payload: { infoList }
      });
    },
    *queryNotice({ payload }, { call, put }) {
      const { data: noticeList } = yield call(noticeListApi);

      yield put({
        type: "save",
        payload: { noticeList }
      });
    }
  },

  reducers: {
    save(state, action) {
      return { ...state, ...action.payload };
    }
  }
};
