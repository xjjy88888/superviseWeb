import { reservoirListApi, areaListApi } from "../services/httpApi";

export default {
  namespace: "inspect",

  state: {
    reservoirList: []
  },

  subscriptions: {
    setup({ dispatch, history }) {}
  },

  effects: {
    *queryReservoir({ payload }, { call, put }) {
      const { data: reservoirList_ } = yield call(
        reservoirListApi,
        payload.us_id
      );
      const { data: areaList } = yield call(areaListApi);

      const reservoirList = reservoirList_.map(item => {
        return {
          ...item,
          address:
            areaList.filter(ite => ite.ctn_code === item.r_province)[0]
              .ctn_name +
            areaList.filter(ite => ite.ctn_code === item.r_city)[0].ctn_name +
            areaList.filter(ite => ite.ctn_code === item.r_district)[0].ctn_name
        };
      });

      yield put({
        type: "save",
        payload: { reservoirList, areaList }
      });
    }
  },

  reducers: {
    save(state, action) {
      return { ...state, ...action.payload };
    }
  }
};
