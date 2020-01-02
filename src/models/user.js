import {
  loginApi,
  dictApi,
  basinOrganizationApi,
  departVaildApi,
  userCreateUpdateApi,
  userDeleteApi,
  initApi,
  userListApi,
  userProjectApi,
  userCompanyApi,
  userSetPowerApi,
  userExamineApi,
  userInfoApi
} from '../services/httpApi';
import { routerRedux } from 'dva/router';
import { notification } from 'antd';

export default {
  namespace: 'user',

  state: {
    current_user: [
      {
        us_name: '请登录'
      }
    ],
    dictList: [],
    departSelectList: [],
    basinOrganList: [],
    departList: [],
    departUpdateId: '',
    userProjectList: [],
    userCompanyList: []
  },

  subscriptions: {
    setup({ dispatch, history }) {}
  },

  effects: {
    *init({ payload, callback }, { call, put }) {
      const {
        data: { success }
      } = yield call(initApi);
      if (!success) {
        notification['error']({
          message: `初始化失败`
        });
      }
    },

    *goBack({ payload }, { call, put }) {
      yield put(routerRedux.goBack());
    },

    *loginOut({ payload }, { call, put }) {
      yield put(routerRedux.replace('/login'));
    },

    *login({ payload, callback }, { call, put }) {
      const { data: response } = yield call(loginApi, payload);
      if (callback) callback();
      if (response.success) {
        notification['success']({
          message: '登录成功'
        });
        localStorage.setItem('user', JSON.stringify(response.result));
        yield put({
          type: 'save',
          payload: { current_user: response.result }
        });
        yield put(routerRedux.replace('/region'));
      } else {
        notification['error']({
          message: `登录失败：${response.error.message}`
        });
      }
    },

    *queryDict({ payload }, { call, put }) {
      const {
        data: {
          success,
          error,
          result: { items: dictList }
        }
      } = yield call(dictApi, payload);
      if (success) {
        yield put({
          type: 'save',
          payload: { dictList }
        });
      } else {
        notification['error']({
          message: `查询字典失败：${error.message}`
        });
      }
    },

    //部门校验
    *departVaild({ payload, callback }, { call, put }) {
      const {
        data: { success, error, result: response }
      } = yield call(departVaildApi, payload);
      if (success) {
        if (callback) callback(response.isVaild, response.department);
      } else {
        notification['error']({
          message: `单位校验失败：${error.message}`
        });
      }
    },

    //流域机构列表
    *basinOrgan({ payload, callback }, { call, put }) {
      const {
        data: { success, error, result: basinOrganList }
      } = yield call(basinOrganizationApi, payload);
      if (success) {
        yield put({
          type: 'save',
          payload: { basinOrganList }
        });
      } else {
        notification['error']({
          message: `获取流域机构列表失败：${error.message}`
        });
      }
    },

    // 用户_列表
    *userList({ payload, callback }, { call, put }) {
      const {
        data: { success, error, result }
      } = yield call(userListApi, payload);
      if (callback) callback(success, error, result);
      if (success) {
        yield put({ type: 'save', payload: { userList: result } });
      } else {
        notification['error']({
          message: `查询用户列表失败`
        });
      }
    },

    // 用户_新建编辑
    *userCreateUpdate({ payload, callback }, { call, put }) {
      const {
        data: { success, error, result }
      } = yield call(userCreateUpdateApi, payload);
      if (callback) callback(success, error, result);
      notification[success ? 'success' : 'error']({
        message: `${payload.id ? '编辑' : '新建'}${
          success
            ? `成功`
            : `失败：${
                error.validationErrors ? error.validationErrors[0].message : ''
              }${error.message || ''}`
        }`
      });
    },

    // 用户_详情
    *userInfo({ payload, callback }, { call, put }) {
      const {
        data: { success, error, result }
      } = yield call(userInfoApi, payload);
      if (callback) callback(success, error, result);
      if (success) {
        yield put({
          type: 'save',
          payload: {
            userCompanyList: [
              {
                name: result.socialDepartmentName,
                id: result.socialDepartmentId
              }
            ],
            userProjectList: [
              {
                name: result.projectName,
                id: result.projectId
              }
            ]
          }
        });
      } else {
        notification['error']({
          message: `查询用户详情失败`
        });
      }
    },

    //  用户_删除
    *userDelete({ payload, callback }, { call, put }) {
      const {
        data: { success, error }
      } = yield call(userDeleteApi, payload);
      if (callback) callback(success);
      notification[success ? 'success' : 'error']({
        message: `删除${success ? '成功' : '失败'}${
          success ? '' : `：${error.message}`
        }`
      });
    },

    // 所属项目
    *userProject({ payload, callback }, { call, put }) {
      const {
        data: { success, result }
      } = yield call(userProjectApi, payload);
      if (success) {
        yield put({ type: 'save', payload: { userProjectList: result.items } });
      }
    },

    // 所属单位
    *userCompany({ payload, callback }, { call, put }) {
      const {
        data: { success, result }
      } = yield call(userCompanyApi, payload);
      if (success) {
        yield put({ type: 'save', payload: { userCompanyList: result.items } });
      }
    },

    // 用户_审核
    *userExamine({ payload, callback }, { call, put }) {
      const {
        data: { success, error, result }
      } = yield call(userExamineApi, payload);
      if (callback) callback(success, error, result);
      notification[success ? 'success' : 'error']({
        message: `审核通过${success ? `成功` : `失败`}`
      });
    },

    // 用户_新建设置权限
    *userSetPower({ payload, callback }, { call, put }) {
      const {
        data: { success, error, result }
      } = yield call(userSetPowerApi, payload);
      if (callback) callback(success, error, result);
      if (success) {
      } else {
        notification['error']({
          message: `配置权限失败`
        });
      }
    }
  },

  reducers: {
    save(state, action) {
      return { ...state, ...action.payload };
    }
  }
};
