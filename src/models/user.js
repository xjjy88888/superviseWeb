import { login } from "../services/httpApi";
import { routerRedux } from "dva/router";
import { Form, Icon, Input, Button, Checkbox, message } from "antd";

export default {
  namespace: "user",

  state: {
    current_user: [
      {
        us_name: "请登录"
      }
    ]
  },

  subscriptions: {
    setup({ dispatch, history }) {}
  },

  effects: {
    *fetch({ payload }, { call, put }) {
      // eslint-disable-line
      yield put({ type: "save" });
    },
    *login({ payload }, { call, put }) {
      const { data: current_user } = yield call(login, payload);
      if (current_user.length === 0) {
        message.error("账号密码错误");
      } else {
        message.success("登录成功");
        yield put({
          type: "save",
          payload: { current_user }
        });
        yield put(routerRedux.replace("/regionRegulatory/integrat"));
      }
    },
    *loginOut({ payload }, { call, put }) {
      yield put(routerRedux.replace("/user/login"));
    }
  },

  reducers: {
    save(state, action) {
      return { ...state, ...action.payload };
    }
  }
};
