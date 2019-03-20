import config from "../config";
import request from "../utils/request";

export async function userListApi() {
  return request(`${config.getUserInfoLis}`, {
    method: "GET"
  });
}

export async function teamListApi(us_id) {
  return request(`${config.getGroupInfoListByID}?us_id=${us_id}`, {
    method: "GET"
  });
}

export async function lawListApi() {
  return request(`${config.getLawNoticeList}?used_type=0`, {
    method: "GET"
  });
}

export async function infoListApi() {
  return request(`${config.getLawNoticeList}?used_type=1`, {
    method: "GET"
  });
}

export async function noticeListApi() {
  return request(`${config.getNoticeList}`, {
    method: "GET"
  });
}

export async function updateNoticeInfo(obj) {
  return request(`${config.updateNoticeInfo}?obj=${JSON.stringify(obj)}`, {
    method: "GET"
  });
}

export async function reservoirListApi(us_id) {
  return request(`${config.getRRrelationInfoList}?us_id=${us_id}`, {
    method: "GET"
  });
}

export async function areaListApi() {
  return request(`${config.getRegionList}`, {
    method: "GET"
  });
}
