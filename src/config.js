const url = "http://aj.zkygis.cn";

const config = {
  //账号
  getUserInfoLis: `${url}/api/account/getUserInfoList`,

  //调查组
  getGroupInfoListByID: `${url}/api/account/getGroupInfoListByID`,

  //法律法规-通知
  getLawNoticeList: `${url}/api/app/getLawNoticeList`,

  //水库
  getRRrelationInfoList: `${url}/api/business/getRRrelationInfoList`,

  //公告
  getNoticeList: `${url}/api/app/getNoticeList`,

  //公告-编辑
  updateNoticeInfo: `${url}/api/app/updateNoticeInfo`,

  // 行政区域
  getRegionList: `${url}/api/app/getRegionList`
};

export default config;
