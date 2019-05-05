import config from "../config";
import request from "../utils/request";
import CryptoJS from "crypto-js";

// 登录
export async function loginApi(params) {
  // const passwordMd5 = CryptoJS.MD5(password).toString();
  return request(config.url.loginUrl, {
    method: "POST",
    headers: {
      Authorization: "Bearer Token",
      "content-type": "application/json"
    },
    body: JSON.stringify(params)
  });
}
// export async function loginApi(params) {
//   const { userName, password } = params;
//   const passwordMd5 = CryptoJS.MD5(password).toString();
//   return request(
//     `${
//       config.url.loginUrl
//     }?username=${userName}&password=${passwordMd5}`,
//     {
//       method: "GET"
//     }
//   );
// }

// 项目列表
export async function projectListApi(row) {
  return request(
    `${config.url.projectListUrl}?MaxResultCount=${row}&SkipCount=0`,
    {
      method: "GET"
    }
  );
}

// 项目id查询项目信息
export async function projectByIdApi(id) {
  return request(`${config.url.projectByIdUrl}?id=${id}`, {
    method: "GET"
  });
}

// 图斑列表
export async function spotListApi(row) {
  return request(`${config.url.spotListUrl}?MaxResultCount=${row}&SkipCount=0`, {
    method: "GET"
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
  return request(
    `${config.url.updateSpotGraphic}?obj=${JSON.stringify(params)}`,
    {
      method: "GET"
    }
  );
}

//新增扰动图斑图形信息
export async function addSpotGraphic(params) {
  return request(`${config.url.addSpotGraphic}?obj=${JSON.stringify(params)}`, {
    method: "GET"
  });
}

//删除扰动图斑图形信息
export async function removeSpotGraphic(spot_tbid) {
  return request(`${config.url.removeSpotGraphic}?spot_tbid=${spot_tbid}`, {
    method: "GET"
  });
}

//编辑项目红线图形信息
export async function updateProjectScopeGraphic(params) {
  return request(
    `${config.url.updateProjectScopeGraphic}?obj=${JSON.stringify(params)}`,
    {
      method: "GET"
    }
  );
}

//新增项目红线图形信息
export async function addProjectScopeGraphic(params) {
  return request(
    `${config.url.addProjectScopeGraphic}?obj=${JSON.stringify(params)}`,
    {
      method: "GET"
    }
  );
}

//删除项目红线图形信息
export async function removeProjectScopeGraphic(project_id) {
  return request(
    `${config.url.removeProjectScopeGraphic}?project_id=${project_id}`,
    {
      method: "GET"
    }
  );
}

//地图WFS请求图层数据源
export async function queryWFSLayer(params) {
  //console.log(params);
  return request(params.geojsonUrl, {
    method: "GET",
    dataType: "json"
  });
}
