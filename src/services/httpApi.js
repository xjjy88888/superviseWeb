import config from "../config";
import request from "../utils/request";
import CryptoJS from "crypto-js";
import { dateFormat, accessToken } from "../utils/util";

// 登录
export async function loginApi(params) {
  return request(config.url.loginUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify(params)
  });
}

// 项目列表
export async function projectListApi(params) {
  return request(
    `${config.url.projectListUrl}?MaxResultCount=10&SkipCount=${params.row -
      10}` +
      `&Sorting=${params.Sorting || ""}` +
      `&ProjectName=${params.ProjectName || ""}` +
      `&SupDepartment=${params.SupDepartment || ""}` +
      `&ReplyDepartment=${params.ReplyDepartment || ""}` +
      `&ReplyNum=${params.ReplyNum || ""}` +
      `&ProductDepartment=${params.ProductDepartment || ""}` +
      `&ProjectCate=${
        params.ProjectCate ? params.ProjectCate.map(v => v).join(",") : ""
      }` +
      `&ProjectNat=${
        params.ProjectNat ? params.ProjectNat.map(v => v).join(",") : ""
      }` +
      `&ProjectStatus=${
        params.ProjectStatus ? params.ProjectStatus.map(v => v).join(",") : ""
      }` +
      `&vectorization_type=${
        params.vectorization_type
          ? params.vectorization_type.map(v => v).join(",")
          : ""
      }` +
      `&ProjectType=${
        params.ProjectType ? params.ProjectType.map(v => v).join(",") : ""
      }` +
      `&Compliance=${
        params.Compliance ? params.Compliance.map(v => v).join(",") : ""
      }` +
      `&ReplyTimeBegin=${
        params.ReplyTime && params.ReplyTime.length
          ? dateFormat(params.ReplyTime[0]._d)
          : ""
      }` +
      `&ReplyTimeEnd=${
        params.ReplyTime && params.ReplyTime.length
          ? dateFormat(params.ReplyTime[1]._d)
          : ""
      }` +
      `&ProjectLevel=${
        params.ProjectLevel ? params.ProjectLevel.map(v => v).join(",") : ""
      }`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken()}`
      }
    }
  );
}

// 图斑列表
export async function spotListApi(params) {
  return request(
    `${
      params.polygon ? config.url.spotListLinkageUrl : config.url.spotListUrl
    }`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken()}`,
        "Content-Type": "application/json-patch+json"
      },
      body: JSON.stringify({
        SkipCount: params.row - 10,
        MaxResultCount: params.MaxResultCount || "10",
        ProjectId: params.ProjectId || "",
        polygon: params.polygon || "",
        Sorting: params.Sorting || "",
        MapNum: params.MapNum || "",
        InterferenceAreaMin: params.InterferenceArea
          ? params.InterferenceArea[0]
          : "",
        InterferenceAreaMax: params.InterferenceArea
          ? params.InterferenceArea[1]
          : "",
        OverAreaOfResMin: params.OverAreaOfRes ? params.OverAreaOfRes[0] : "",
        OverAreaOfResMax: params.OverAreaOfRes ? params.OverAreaOfRes[1] : "",
        InterferenceType: params.InterferenceType
          ? params.InterferenceType.map(v => v).join(",")
          : "",
        InterferenceCompliance: params.InterferenceCompliance
          ? params.InterferenceCompliance.map(v => v).join(",")
          : "",
        BuildStatus: params.BuildStatus
          ? params.BuildStatus.map(v => v).join(",")
          : "",
        InterferenceVaryType: params.InterferenceVaryType
          ? params.InterferenceVaryType.map(v => v).join(",")
          : ""
      })
    }
  );
}

// 标注点列表
export async function pointListApi(params) {
  return request(
    `${config.url.pointListUrl}?MaxResultCount=10&SkipCount=${params.row -
      10}` +
      `&Sorting=${params.Sorting || ""}` +
      `&ProjectName=${params.ProjectName || ""}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken()}`
      }
    }
  );
}

// 项目id查询项目红线列表
export async function redLineByProjectIdApi(ProjectId) {
  return request(
    `${
      config.url.redLineByProjectIdUrl
    }?SkipCount=0&MaxResultCount=20&ProjectId=${ProjectId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken()}`
      }
    }
  );
}

// id查询项目
export async function projectByIdApi(id) {
  return request(`${config.url.projectByIdUrl}?id=${id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken()}`
    }
  });
}

// id查询图斑
export async function spotByIdApi(id) {
  return request(`${config.url.spotByIdUrl}?id=${id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken()}`
    }
  });
}

// id查询标注点
export async function pointByIdApi(id) {
  return request(`${config.url.pointByIdUrl}?id=${id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken()}`
    }
  });
}

// 项目位置
export async function projectPositionApi(id) {
  return request(`${config.url.projectPositionUrl}?id=${id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken()}`
    }
  });
}

// 获取边界
export async function boundaryApi(id) {
  return request(`${config.url.boundaryUrl}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken()}`
    }
  });
}

// 腾讯地图
export async function txRegionApi(id) {
  return request(`${config.url.txRegionUrl}`, {
    method: "GET",
    headers: {
      contentType: "application/json;charset=utf-8"
    }
  });
}

//编辑扰动图斑图形信息
export async function updateSpotGraphic(params) {
  return request(
    `${config.url.updateSpotGraphic}?obj=${JSON.stringify(params)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken()}`
      }
    }
  );
}

//新增扰动图斑图形信息
export async function addSpotGraphic(params) {
  return request(`${config.url.addSpotGraphic}?obj=${JSON.stringify(params)}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken()}`
    }
  });
}

//删除扰动图斑图形信息
export async function removeSpotGraphic(spot_tbid) {
  return request(`${config.url.removeSpotGraphic}?spot_tbid=${spot_tbid}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken()}`
    }
  });
}

//编辑项目红线图形信息
export async function updateProjectScopeGraphic(params) {
  return request(
    `${config.url.updateProjectScopeGraphic}?obj=${JSON.stringify(params)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken()}`
      }
    }
  );
}

//新增项目红线图形信息
export async function addProjectScopeGraphic(params) {
  return request(
    `${config.url.addProjectScopeGraphic}?obj=${JSON.stringify(params)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken()}`
      }
    }
  );
}

//删除项目红线图形信息
export async function removeProjectScopeGraphic(project_id) {
  return request(
    `${config.url.removeProjectScopeGraphic}?project_id=${project_id}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken()}`
      }
    }
  );
}

//地图WFS请求图层数据源
export async function queryWFSLayer(params) {
  //console.log(params);
  return request(params.geojsonUrl, {
    method: "GET",
    dataType: "json",
    headers: {
      //Authorization: `Bearer ${accessToken()}`
    }
  });
}
