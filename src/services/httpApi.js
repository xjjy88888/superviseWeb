import config from "../config";
import request from "../utils/request";
// import CryptoJS from "crypto-js";
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
  delete params.items;
  return request(`${config.url.projectListUrl}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken()}`,
      "Content-Type": "application/json-patch+json"
    },
    body: JSON.stringify({
      ...params,
      MaxResultCount: params.MaxResultCount || "10",
      ReplyTimeBegin:
        params.ReplyTime && params.ReplyTime.length
          ? dateFormat(params.ReplyTime[0]._d)
          : "",
      ReplyTimeEnd:
        params.ReplyTime && params.ReplyTime.length
          ? dateFormat(params.ReplyTime[1]._d)
          : "",
      ProjectCate: params.ProjectCate
        ? params.ProjectCate.map(v => v).join(",")
        : "",
      HasScopes: params.HasScopes ? params.HasScopes.map(v => v).join(",") : "",
      ProjectNat: params.ProjectNat
        ? params.ProjectNat.map(v => v).join(",")
        : "",
      ProjectStatus: params.ProjectStatus
        ? params.ProjectStatus.map(v => v).join(",")
        : "",
      VecType: params.VecType ? params.VecType.map(v => v).join(",") : "",
      HasSpot: params.HasSpot ? params.HasSpot.map(v => v).join(",") : "",
      ProjectType: params.ProjectType
        ? params.ProjectType.map(v => v).join(",")
        : "",
      Compliance: params.Compliance
        ? params.Compliance.map(v => v).join(",")
        : "",
      ProjectLevel: params.ProjectLevel
        ? params.ProjectLevel.map(v => v).join(",")
        : ""
    })
  });
}

// 项目信息
export async function projectByIdApi(id) {
  return request(`${config.url.projectByIdUrl}?id=${id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken()}`
    }
  });
}

// 项目新建-编辑
export async function projectCreateUpdateApi(params) {
  return request(
    params.id ? config.url.projectUpdateUrl : config.url.projectCreateUrl,
    {
      method: params.id ? "PUT" : "POST",
      headers: {
        Authorization: `Bearer ${accessToken()}`,
        "Content-Type": "application/json-patch+json"
      },
      body: JSON.stringify(params)
    }
  );
}

// 项目删除
export async function projectDeleteApi(payload) {
  return request(`${config.url.projectDeleteUrl}?id=${payload.id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken()}`
    }
  });
}

// 项目批量删除
export async function projectDeleteMulApi(payload) {
  return request(`${config.url.projectDeleteMulUrl}?ids=${payload.id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken()}`
    }
  });
}

// 图斑列表
export async function spotListApi(params) {
  delete params.items;
  return request(`${config.url.spotListUrl}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken()}`,
      "Content-Type": "application/json-patch+json"
    },
    body: JSON.stringify({
      ...params,
      MaxResultCount: params.MaxResultCount || "10",
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
  });
}

// 图斑信息
export async function spotByIdApi(id) {
  return request(`${config.url.spotByIdUrl}?id=${id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken()}`
    }
  });
}

// 图斑新建编辑
export async function spotCreateUpdateApi(params) {
  return request(
    params.id ? config.url.spotUpdateUrl : config.url.spotCreateUrl,
    {
      method: params.id ? "PUT" : "POST",
      headers: {
        Authorization: `Bearer ${accessToken()}`,
        "Content-Type": "application/json-patch+json"
      },
      body: JSON.stringify(params)
    }
  );
}

// 图斑删除
export async function spotDeleteApi(payload) {
  return request(`${config.url.spotDeleteUrl}?id=${payload.id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken()}`
    }
  });
}

// 图斑批量删除
export async function spotDeleteMulApi(payload) {
  return request(`${config.url.spotDeleteMulUrl}?ids=${payload.id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken()}`
    }
  });
}

// 标注点列表
export async function pointListApi(params) {
  return request(
    `${config.url.pointListUrl}?MaxResultCount=10&SkipCount=${
      params.SkipCount
    }` +
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

// id查询标注点
export async function pointByIdApi(id) {
  return request(`${config.url.pointByIdUrl}?id=${id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken()}`
    }
  });
}

// id查询标注点经纬度
export async function pointSiteByIdApi(id) {
  return request(`${config.url.pointSiteByIdUrl}?id=${id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken()}`
    }
  });
}

// 字典
export async function dictApi() {
  return request(`${config.url.dictUrl}?DictTypeName=`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken()}`
    }
  });
}

// 部门新建
export async function departCreateApi(params) {
  return request(config.url.departCreateUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken()}`,
      "Content-Type": "application/json-patch+json"
    },
    body: JSON.stringify(params)
  });
}

// 部门列表
export async function departListApi(params) {
  return request(`${config.url.departListUrl}?name=${params.name}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken()}`
    }
  });
}

// 部门校验
export async function departVaildApi(params) {
  return request(`${config.url.departVaildUrl}?name=${params.name}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken()}`
    }
  });
}

// 附件删除
export async function annexDeleteApi(params) {
  return request(
    `${config.url.annexDeleteUrl}?FileId=${params.FileId}&Id=${params.Id}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken()}`
      }
    }
  );
}

// 行政区域
export async function districtApi() {
  return request(`${config.url.districtUrl}`, {
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
/*export async function queryWFSLayer(params) {
  return request(params.geojsonUrl, {
    method: "GET",
    dataType: "json",
    headers: {
    }
  });
}*/
export async function queryWFSLayer(params) {
  //console.log(params);
  return request(`${config.url.queryWFSLayer}`, {
    method: "POST",
    dataType: "json",
    headers: {
      Authorization: `Bearer ${accessToken()}`,
      "Content-Type": "application/json-patch+json"
    },
    body: JSON.stringify({
      method: "get",
      url: params.geojsonUrl
    })
  });
}
//根据地图当前范围获取对应历史影像数据接口
/*export async function getInfoByExtent(params) {
  return request(params.geojsonUrl, {
    method: "GET",
    //dataType: "json",
    dataType: "jsonp",
    headers: {
    }
  });
}*/
export async function getInfoByExtent(params) {
  //return request(`${config.mapUrl.getInfoByExtent}`, {
  return request(`${config.url.queryWFSLayer}`, {
    method: "POST",
    dataType: "json",
    headers: {
      Authorization: `Bearer ${accessToken()}`,
      "Content-Type": "application/json-patch+json"
    },
    body: JSON.stringify({
      method: "get",
      url: params.geojsonUrl
    })
  });
}
