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
export async function projectScopeGetIntersects(params) {
  return request(`${config.url.projectScopeGetIntersects}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    },
    body: JSON.stringify(params.polygon)
  });
}

// 根据项目id获取对应的项目信息
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

//地图WFS请求图层数据源
export async function queryWFSLayer(params) {
  //console.log(params);
  return request(params.geojsonUrl, {
    method: "GET",
    dataType: "json"
  });
}
