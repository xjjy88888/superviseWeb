import config from "../config";
import request from "../utils/request";
import CryptoJS from "crypto-js";

// 登录
export async function login(params) {
  const { username, password } = params;
  const passwordMd5 = CryptoJS.MD5(password).toString();
  return request(
    `${
      config.url.GetUserPassWord
    }?username=${username}&password=${passwordMd5}`,
    {
      method: "GET"
    }
  );
}

// 项目列表
export async function projectListApi(params) {
  return request(`${config.url.projectListUrl}?MaxResultCount=10&SkipCount=0`, {
    method: "GET"
  });
}

// 项目id查询项目信息
export async function projectById(id) {
  return request(`${config.url.projectById}?project_id=${id}`, {
    method: "GET"
  });
}

// 图斑列表
export async function spotGetIntersects(params) {
  return request(`${config.url.spotGetIntersects}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    },
    body: JSON.stringify(params.polygon)
  });
}

// 图斑id查询图斑信息
export async function spotById(id) {
  return request(`${config.url.spotBytbId}?spot_tbid=${id}`, {
    method: "GET"
  });
}

//编辑扰动图斑图形信息
export async function updateSpotGraphic(params) {
  return request(`${config.url.updateSpotGraphic}?obj=${JSON.stringify(params)}`, {
    method: 'GET',
  });
}

//编辑项目红线图形信息
export async function updateProjectScopeGraphic(params) {
  return request(`${config.url.updateProjectScopeGraphic}?obj=${JSON.stringify(params)}`, {
    method: 'GET',
  });
}

//地图WFS请求图层数据源
export async function queryWFSLayer(params) {
  //console.log(params);
  return request(params.geojsonUrl, {
    method: "GET",
    dataType: "json"
  });
}
