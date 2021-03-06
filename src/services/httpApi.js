import config from "../config";
import request from "../utils/request";
import CryptoJS from "crypto-js";
import { dateFormat, accessToken } from "../utils/util";
import { stringify } from "qs";

// 初始化
export async function initApi() {
  return request(`${config.url.initUrl}`, {
    method: "GET"
  });
}

// 登录
export async function loginApi(params) {
  const passwordMd5 = CryptoJS.MD5(params.password).toString();
  return request(config.url.loginUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify({ ...params, password: passwordMd5 })
  });
}

// 项目合并
export async function mergeProjectApi(params) {
  // delete params.items;
  return request(`${config.url.mergeProjectUrl}?${stringify(params)}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken()}`
    }
  });
}

// 项目列表---表格展示
export async function projectTableListApi(params) {
  // delete params.items;
  return request(`${config.url.projectTableListUrl}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken()}`,
      "Content-Type": "application/json-patch+json"
    },
    body: JSON.stringify({ ...params })
  });
}

// 项目列表
export async function projectListApi(params) {
  delete params.items;
  return request(
    params.isChart ? config.url.projectChartUrl : config.url.projectListUrl,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken()}`,
        "Content-Type": "application/json-patch+json"
      },
      body: JSON.stringify(params)
    }
  );
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
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken()}`,
        "Content-Type": "application/json-patch+json"
      },
      body: JSON.stringify(params)
    }
  );
}

// 项目查处
export async function projectExamineApi(params) {
  return request(config.url.projectExamineUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken()}`,
      "Content-Type": "application/json-patch+json"
    },
    body: JSON.stringify(params)
  });
}

// 项目删除
export async function projectDeleteApi(params) {
  return request(`${config.url.projectDeleteUrl}?id=${params.id}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken()}`,
      "Content-Type": "application/json-patch+json"
    }
  });
}

// 项目批量删除
export async function projectDeleteMulApi(params) {
  return request(`${config.url.projectDeleteMulUrl}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken()}`,
      "Content-Type": "application/json-patch+json"
    },
    body: JSON.stringify(params.id)
  });
}

// 项目归档
export async function projectArchiveApi(params) {
  return request(
    `${config.url.projectArchiveUrl}?id=${params.id}&ArchiveTime=${params.ArchiveTime}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken()}`
      }
    }
  );
}

// 项目撤销归档
export async function projectUnArchiveApi(params) {
  return request(`${config.url.projectUnArchiveUrl}?id=${params.id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken()}`
    }
  });
}

// 项目重名验证
export async function projectVerifyApi(params) {
  return request(`${config.url.projectVerifyUrl}?name=${params.name}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken()}`
    }
  });
}

// 项目取消关联图斑
export async function projectUnbindSpotApi(params) {
  return request(
    `${config.url.projectUnbindSpotUrl}?projectId=${params.projectId}&spotId=${params.spotId}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken()}`
      }
    }
  );
}

// 项目-设置待查处
export async function projectSetExamineApi(params) {
  return request(`${config.url.projectSetExamineUrl}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken()}`,
      "Content-Type": "application/json-patch+json"
    },
    body: JSON.stringify(params)
  });
}

// 项目-取消待查处
export async function projectCancelExamineApi(params) {
  return request(`${config.url.projectCancelExamineUrl}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken()}`,
      "Content-Type": "application/json-patch+json"
    },
    body: JSON.stringify(params)
  });
}

// 图斑列表---表格展示
export async function spotTableListApi(params) {
  // delete params.items;
  return request(`${config.url.spotTableListUrl}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken()}`,
      "Content-Type": "application/json-patch+json"
    },
    body: JSON.stringify({
      ...params
    })
  });
}

// 图斑列表
export async function spotListApi(params) {
  delete params.items;
  return request(
    params.isChart ? config.url.spotChartUrl : config.url.spotListUrl,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken()}`,
        "Content-Type": "application/json-patch+json"
      },
      body: JSON.stringify({
        ...params
        // MaxResultCount: params.MaxResultCount || "10",
        // InterferenceType: params.InterferenceType
        //   ? params.InterferenceType.map(v => v).join(",")
        //   : "",
        // InterferenceCompliance: params.InterferenceCompliance
        //   ? params.InterferenceCompliance.map(v => v).join(",")
        //   : "",
        // BuildStatus: params.BuildStatus
        //   ? params.BuildStatus.map(v => v).join(",")
        //   : "",
        // InterferenceVaryType: params.InterferenceVaryType
        //   ? params.InterferenceVaryType.map(v => v).join(",")
        //   : ""
      })
    }
  );
}

// 图斑列表
export async function spotPolygonByIdApi(ProjectId) {
  return request(`${config.url.spotPolygonByIdUrl}?ProjectId=${ProjectId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken()}`
    }
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
      method: params.id ? "POST" : "POST",
      headers: {
        Authorization: `Bearer ${accessToken()}`,
        "Content-Type": "application/json-patch+json"
      },
      body: JSON.stringify(params)
    }
  );
}

// 图斑删除
export async function spotDeleteApi(params) {
  return request(`${config.url.spotDeleteUrl}?id=${params.id}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken()}`
    }
  });
}

// 图斑批量删除
export async function spotDeleteMulApi(params) {
  return request(`${config.url.spotDeleteMulUrl}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken()}`,
      "Content-Type": "application/json-patch+json"
    },
    body: JSON.stringify(params.id)
  });
}

// 图斑归档
export async function spotArchiveApi(params) {
  return request(
    `${config.url.spotArchiveUrl}?id=${params.id}&ArchiveTime=${params.ArchiveTime}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken()}`
      }
    }
  );
}

// 图斑撤销归档
export async function spotUnArchiveApi(params) {
  return request(`${config.url.spotUnArchiveUrl}?id=${params.id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken()}`
    }
  });
}

// 图斑历史
export async function spotHistoryApi(params) {
  return request(`${config.url.spotHistoryUrl}?spotId=${params.id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken()}`
    }
  });
}

// 图斑同步旧系统附件
export async function spotOldImgApi(params) {
  return request(`${config.url.spotOldImgUrl}?Id=${params.id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken()}`
    }
  });
}

// 图斑复核-新建编辑
export async function spotReviewCreateUpdateApi(params) {
  return request(
    `${config.url.spotReviewCreateUpdateUrl}${params.id ? "Update" : "Create"}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken()}`,
        "Content-Type": "application/json-patch+json"
      },
      body: JSON.stringify(params)
    }
  );
}

// 图斑复核-删除
export async function spotReviewDeleteApi(id) {
  return request(`${config.url.spotReviewDeleteUrl}?id=${id}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken()}`
    }
  });
}

// 图斑-分割
export async function spotDivideApi(params) {
  return request(config.url.spotDivideUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken()}`,
      "Content-Type": "application/json-patch+json"
    },
    body: JSON.stringify(params)
  });
}

// 标注点列表
export async function pointListApi(params) {
  return request(
    `${config.url.pointListUrl}?MaxResultCount=10&SkipCount=${params.SkipCount}` +
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

// 标注点信息
export async function pointByIdApi(id) {
  return request(`${config.url.pointByIdUrl}?id=${id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken()}`
    }
  });
}

// 标注点新建编辑
export async function pointCreateUpdateApi(params) {
  return request(
    params.id ? config.url.pointUpdateUrl : config.url.pointCreateUrl,
    {
      method: params.id ? "POST" : "POST",
      headers: {
        Authorization: `Bearer ${accessToken()}`,
        "Content-Type": "application/json-patch+json"
      },
      body: JSON.stringify(params)
    }
  );
}

// 标注点删除
export async function pointDeleteApi(params) {
  return request(`${config.url.pointDeleteUrl}?id=${params.id}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken()}`
    }
  });
}

// 标注点批量删除
export async function pointDeleteMulApi(params) {
  return request(`${config.url.pointDeleteMulUrl}?ids=${params.id}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken()}`
    }
  });
}

// 项目红线列表
export async function redLineListApi(ProjectId) {
  return request(
    `${config.url.redLineListUrl}?SkipCount=0&MaxResultCount=20&ProjectId=${ProjectId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken()}`
      }
    }
  );
}

// 项目红线信息
export async function redLineByIdApi(id) {
  return request(`${config.url.redLineByIdUrl}?id=${id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken()}`
    }
  });
}

// 项目红线新建编辑
export async function redLineCreateUpdateApi(params) {
  return request(
    params.id ? config.url.redLineUpdateUrl : config.url.redLineCreateUrl,
    {
      method: params.id ? "POST" : "POST",
      headers: {
        Authorization: `Bearer ${accessToken()}`,
        "Content-Type": "application/json-patch+json"
      },
      body: JSON.stringify(params)
    }
  );
}

// 项目红线删除
export async function redLineDeleteApi(params) {
  return request(`${config.url.redLineDeleteUrl}?id=${params.id}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken()}`
    }
  });
}

// 项目红线批量删除
export async function redLineDeleteMulApi(params) {
  return request(`${config.url.redLineDeleteMulUrl}?ids=${params.id}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken()}`
    }
  });
}

// 导出项目/图斑(附件)数据
export async function exportApi(params) {
  const url = `${params.key}${params.isAttach ? "File" : ""}Export`;
  return request(config.url.exportUrl + url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken()}`,
      "Content-Type": "application/json-patch+json"
    },
    body: JSON.stringify(params)
  });
}

// 流域机构列表
export async function basinOrganizationApi() {
  return request(`${config.url.basinOrganizationUrl}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken()}`
    }
  });
}

// 字典
export async function dictApi() {
  return request(`${config.url.dictUrl}?SkipCount=0&MaxResultCount=10000`, {
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
  return request(
    `${config.url.departListUrl}?name=${params.name}&kind=${params.kind}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken()}`
      }
    }
  );
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
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken()}`
      }
    }
  );
}

// 附件上传base64
export async function annexUploadBase64Api(params) {
  let formData = new FormData();
  formData.append("Id", params.Id);
  formData.append("FileBase64.FileName", params["FileBase64.FileName"]);
  formData.append("FileBase64.Base64", params["FileBase64.Base64"]);
  formData.append("Longitude", params.Longitude);
  formData.append("Latitude", params.Latitude);
  formData.append("Azimuth", params.Azimuth);

  return request(config.url.annexUploadUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken()}`
    },
    body: formData
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

//新建扰动图斑图形信息
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

//新建项目红线图形信息
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

export async function queryRegionWFSLayer(params) {
  return request(params.geojsonUrl, {
    method: "GET",
    dataType: "json",
    headers: {}
  });
}

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

//根据地图当前范围获取对应历史扰动图斑数据接口
export async function getHistorySpotTimeByExtent(params) {
  // return request(params.geojsonUrl, {
  //   method: 'GET',
  //   dataType: 'json',
  //   headers: {}
  // });
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

// 检查表_模板
export async function inspectFormApi(params) {
  return request(`${config.url.inspectFormUrl}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken()}`
    }
  });
}

// 检查表_项目id查询列表
export async function inspectListApi(params) {
  return request(`${config.url.inspectListUrl}?ProjectId=${params.ProjectId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken()}`
    }
  });
}

// 检查表_新建编辑
export async function inspectCreateUpdateApi(params) {
  return request(
    `${config.url.inspectCreateUpdateUrl}${params.id ? "Update" : "Create"}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken()}`,
        "Content-Type": "application/json-patch+json"
      },
      body: JSON.stringify(params)
    }
  );
}

// 检查表_删除
export async function inspectDeleteApi(params) {
  return request(`${config.url.inspectDeleteUrl}?id=${params.id}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken()}`,
      "Content-Type": "application/json-patch+json"
    }
  });
}

// 检查表_详情
export async function inspectByIdApi(params) {
  return request(`${config.url.inspectByIdUrl}?Id=${params.id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken()}`
    }
  });
}

// 检查表_导出
export async function inspectExportApi(params) {
  return request(`${config.url.inspectExportUrl}?id=${params.id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken()}`
    }
  });
}

// 问题点_问题类型
export async function problemTypeApi() {
  return request(`${config.url.problemTypeUrl}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken()}`
    }
  });
}

// 问题点_详情
export async function problemPointByIdApi(params) {
  return request(`${config.url.problemPointByIdUrl}?Id=${params.id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken()}`
    }
  });
}

// 问题点_新建编辑
export async function problemPointCreateUpdateApi(params) {
  return request(
    `${config.url.problemPointCreateUpdateUrl}${
      params.id ? "Update" : "Create"
    }`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken()}`,
        "Content-Type": "application/json-patch+json"
      },
      body: JSON.stringify(params)
    }
  );
}

// 问题点_删除
export async function problemPointDeleteApi(params) {
  return request(`${config.url.problemPointDeleteUrl}?id=${params.id}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken()}`,
      "Content-Type": "application/json-patch+json"
    }
  });
}

// 问题点_列表
export async function problemPointListApi(params) {
  return request(
    `${config.url.problemPointListUrl}?SkipCount=${params.SkipCount}&MaxResultCount=${params.MaxResultCount}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken()}`
      }
    }
  );
}

// 措施点_详情
export async function measurePointByIdApi(params) {
  return request(`${config.url.measurePointByIdUrl}?Id=${params.id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken()}`
    }
  });
}

// 措施点_新建编辑
export async function measurePointCreateUpdateApi(params) {
  return request(
    `${config.url.measurePointCreateUpdateUrl}${
      params.id ? "Update" : "Create"
    }`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken()}`,
        "Content-Type": "application/json-patch+json"
      },
      body: JSON.stringify(params)
    }
  );
}

// 措施点_删除
export async function measurePointDeleteApi(params) {
  return request(`${config.url.measurePointDeleteUrl}?id=${params.id}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken()}`,
      "Content-Type": "application/json-patch+json"
    }
  });
}

export async function videoMonitorListApi(params) {
  return request(config.url.videoMonitorListUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken()}`,
      "Content-Type": "application/json-patch+json"
    },
    body: JSON.stringify(params)
  });
}

export async function videoMonitorByIdApi(id) {
  return request(`${config.url.videoMonitorByIdUrl}?Id=${id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken()}`
    }
  });
}

export async function videoMonitorCreateUpdateApi(params) {
  return request(
    `${config.url.videoMonitorCreateUpdateUrl}${
      params.id ? "Update" : "Create"
    }`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken()}`,
        "Content-Type": "application/json-patch+json"
      },
      body: JSON.stringify(params)
    }
  );
}

export async function videoMonitorDeleteApi(params) {
  return request(`${config.url.videoMonitorDeleteUrl}?id=${params.id}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken()}`,
      "Content-Type": "application/json-patch+json"
    }
  });
}

// 字典类型_列表
export async function dictTypeListApi() {
  return request(
    `${config.url.dictTypeListUrl}?SkipCount=0&MaxResultCount=1000`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken()}`
      }
    }
  );
}

// 字典类型_新建编辑
export async function dictTypeCreateUpdateApi(params) {
  return request(
    `${config.url.dictTypeCreateUpdateUrl}${params.id ? "Update" : "Create"}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken()}`,
        "Content-Type": "application/json-patch+json"
      },
      body: JSON.stringify(params)
    }
  );
}

// 字典类型_删除
export async function dictTypeDeleteApi(id) {
  return request(`${config.url.dictTypeDeleteUrl}?id=${id}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken()}`,
      "Content-Type": "application/json-patch+json"
    }
  });
}

// 字典类型_批量删除
export async function dictTypeDeleteMulApi(params) {
  return request(`${config.url.dictTypeDeleteMulUrl}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken()}`,
      "Content-Type": "application/json-patch+json"
    },
    body: JSON.stringify(params.id)
  });
}

// 字典数据_列表
export async function dictDataListApi(id) {
  return request(
    `${config.url.dictDataListUrl}?SkipCount=0&MaxResultCount=1000&DictTypeId=${id}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken()}`
      }
    }
  );
}

// 字典数据_新建编辑
export async function dictDataCreateUpdateApi(params) {
  return request(
    `${config.url.dictDataCreateUpdateUrl}${params.id ? "Update" : "Create"}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken()}`,
        "Content-Type": "application/json-patch+json"
      },
      body: JSON.stringify(params)
    }
  );
}

// 字典数据_删除
export async function dictDataDeleteApi(id) {
  return request(`${config.url.dictDataDeleteUrl}?id=${id}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken()}`,
      "Content-Type": "application/json-patch+json"
    }
  });
}

// 字典数据_批量删除
export async function dictDataDeleteMulApi(params) {
  return request(`${config.url.dictDataDeleteMulUrl}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken()}`,
      "Content-Type": "application/json-patch+json"
    },
    body: JSON.stringify(params.id)
  });
}

// 行政区域_列表
export async function districtTreeApi(params) {
  return request(`${config.url.districtTreeUrl}?IsFilter=${params.IsFilter}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken()}`
    }
  });
}

// 行政区域_新建编辑
export async function districtCreateUpdateApi(params) {
  return request(
    `${config.url.districtCreateUpdateUrl}${params.id ? "Update" : "Create"}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken()}`,
        "Content-Type": "application/json-patch+json"
      },
      body: JSON.stringify(params)
    }
  );
}

// 行政区域_删除
export async function districtDeleteApi(id) {
  return request(`${config.url.districtDeleteUrl}?id=${id}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken()}`,
      "Content-Type": "application/json-patch+json"
    }
  });
}

// 行政区域_批量删除
export async function districtDeleteMulApi(params) {
  return request(`${config.url.districtDeleteMulUrl}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken()}`,
      "Content-Type": "application/json-patch+json"
    },
    body: JSON.stringify(params.id)
  });
}

// 单位_列表
export async function companyListApi(params) {
  return request(
    `${config.url.companyListUrl}?SkipCount=${
      params.SkipCount
    }&MaxResultCount=${params.MaxResultCount}&Name=${params.Name || ""}${
      params.isBuild
        ? "&DepTypes=1"
        : "&DepTypes=2&DepTypes=3&DepTypes=4&DepTypes=5&DepTypes=6&DepTypes=7"
    }&IsGetProject=${Boolean(params.IsGetProject)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken()}`
      }
    }
  );
}

// 单位_新建编辑
export async function companyCreateUpdateApi(params) {
  return request(
    `${config.url.companyCreateUpdateUrl}${params.id ? "Update" : "Create"}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken()}`,
        "Content-Type": "application/json-patch+json"
      },
      body: JSON.stringify(params)
    }
  );
}

// 单位_删除
export async function companyDeleteApi(id) {
  return request(`${config.url.companyDeleteUrl}?id=${id}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken()}`,
      "Content-Type": "application/json-patch+json"
    }
  });
}

// 单位_批量删除
export async function companyDeleteMulApi(params) {
  return request(`${config.url.companyDeleteMulUrl}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken()}`,
      "Content-Type": "application/json-patch+json"
    },
    body: JSON.stringify(params.id)
  });
}

// 行政部门_树状列表
export async function departsTreeApi(params) {
  return request(`${config.url.departsTreeUrl}?IsFilter=${params.IsFilter}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken()}`
    }
  });
}

// 行政部门_列表
export async function departsListApi(params) {
  return request(
    `${config.url.departsListUrl}?SkipCount=${
      params.SkipCount
    }&MaxResultCount=${params.MaxResultCount}&ParentId=${params.ParentId ||
      ""}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken()}`
      }
    }
  );
}

// 行政部门_新建编辑
export async function departsCreateUpdateApi(params) {
  return request(
    `${config.url.departsCreateUpdateUrl}${params.id ? "Update" : "Create"}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken()}`,
        "Content-Type": "application/json-patch+json"
      },
      body: JSON.stringify(params)
    }
  );
}

// 行政部门_删除
export async function departsDeleteApi(id) {
  return request(`${config.url.departsDeleteUrl}?id=${id}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken()}`,
      "Content-Type": "application/json-patch+json"
    }
  });
}

// 行政部门_批量删除
export async function departsDeleteMulApi(params) {
  return request(`${config.url.departsDeleteMulUrl}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken()}`,
      "Content-Type": "application/json-patch+json"
    },
    body: JSON.stringify(params.id)
  });
}

// 角色_列表
export async function roleListApi(params) {
  return request(
    `${config.url.roleListUrl}?SkipCount=${params.SkipCount}&MaxResultCount=${
      params.MaxResultCount
    }&Name=${params.name || ``}&DisplayName=${params.displayName ||
      ``}&Sorting=${params.Sorting || ``}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken()}`
      }
    }
  );
}

// 角色_新建编辑
export async function roleCreateUpdateApi(params) {
  console.log(params);
  return request(
    `${config.url.roleCreateUpdateUrl}${params.id ? "Update" : "Create"}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken()}`,
        "Content-Type": "application/json-patch+json"
      },
      body: JSON.stringify(params)
    }
  );
}

// 角色_删除
export async function roleDeleteApi(params) {
  return request(`${config.url.roleDeleteUrl}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken()}`,
      "Content-Type": "application/json-patch+json"
    },
    body: JSON.stringify(params.ids)
  });
}

// 权限列表
export async function powerListApi(params) {
  return request(`${config.url.powerListUrl}?userType=${params.userType}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken()}`
    }
  });
}

// 用户_列表
export async function userListApi(params) {
  return request(
    `${config.url.userListUrl}?SkipCount=${params.SkipCount}&MaxResultCount=${
      params.MaxResultCount
    }&IsActive=${params.IsActive}&UserType=${
      params.UserType
    }&GovDepartmentId=${params.GovDepartmentId || ``}&Name=${params.name ||
      ``}&DisplayName=${params.displayName ||
      ``}&PhoneNumber=${params.phoneNumber || ``}&Sorting=${params.Sorting ||
      ``}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken()}`
      }
    }
  );
}

// 用户_新建编辑
export async function userCreateUpdateApi(params) {
  console.log(params);
  const { password, ...rest } = params;
  const passwordMd5 = CryptoJS.MD5(params.password).toString();
  const data = params.id ? rest : { ...params, password: passwordMd5 };
  return request(
    `${
      params.isLogin
        ? config.url.userCreateOutsideUrl
        : `${config.url.userCreateUpdateUrl}${params.id ? "Update" : "Create"}`
    }`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken()}`,
        "Content-Type": "application/json-patch+json"
      },
      body: JSON.stringify(data)
    }
  );
}

// 用户_详情
export async function userInfoApi(params) {
  console.log(params);
  return request(`${config.url.userInfoUrl}?Id=${params.id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken()}`
    }
  });
}

// 用户_审核
export async function userExamineApi(params) {
  return request(`${config.url.userExamineUrl}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken()}`,
      "Content-Type": "application/json-patch+json"
    },
    body: JSON.stringify(params.items)
  });
}

// 用户_新建设置权限
export async function userSetPowerApi(params) {
  console.log("用户设置权限", params);
  return request(
    `${
      params.isActive
        ? config.url.userSetPowerUrl
        : config.url.userSetPowerOutsideUrl
    }`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken()}`,
        "Content-Type": "application/json-patch+json"
      },
      body: JSON.stringify(params)
    }
  );
}

// 用户_删除
export async function userDeleteApi(params) {
  return request(`${config.url.userDeleteUrl}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken()}`,
      "Content-Type": "application/json-patch+json"
    },
    body: JSON.stringify(params.ids)
  });
}

// 所属项目
export async function userProjectApi(params) {
  return request(
    `${config.url.userProjectUrl}?SkipCount=0&MaxResultCount=10&Name=${params.name}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken()}`
      }
    }
  );
}

// 所属单位
export async function userCompanyApi(params) {
  return request(
    `${config.url.userCompanyUrl}?SkipCount=0&MaxResultCount=10&Name=${params.name}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken()}`
      }
    }
  );
}

export async function panoramaListApi(params) {
  delete params.items;
  return request(config.url.panoramaListUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken()}`,
      "Content-Type": "application/json-patch+json"
    },
    body: JSON.stringify(params)
  });
}

export async function panoramaCreateUpdateApi(params) {
  return request(
    `${config.url.panoramaCreateUpdateUrl}${params.id ? "Update" : "Create"}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken()}`,
        "Content-Type": "application/json-patch+json"
      },
      body: JSON.stringify(params)
    }
  );
}

export async function panoramaDeleteApi(params) {
  return request(`${config.url.panoramaDeleteUrl}?id=${params.id}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken()}`,
      "Content-Type": "application/json-patch+json"
    }
  });
}

export async function projectSuperviseListApi(params) {
  return request(
    `${config.url.projectSuperviseUrl}${
      params.isRecycleBin ? `GetRecycleBinByPost` : `GetAllByPost`
    }`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken()}`,
        "Content-Type": "application/json-patch+json"
      },
      body: JSON.stringify({
        ...params
        // MaxResultCount: params.MaxResultCount || "10",
        // ReplyTimeBegin:
        //   params.ReplyTime && params.ReplyTime.length
        //     ? dateFormat(params.ReplyTime[0]._d)
        //     : "",
        // ReplyTimeEnd:
        //   params.ReplyTime && params.ReplyTime.length
        //     ? dateFormat(params.ReplyTime[1]._d)
        //     : "",
        // ProjectCate: params.ProjectCate
        //   ? params.ProjectCate.map(v => v).join(",")
        //   : "",
        // HasScopes: params.HasScopes
        //   ? params.HasScopes.map(v => v).join(",")
        //   : "",
        // ProjectNat: params.ProjectNat
        //   ? params.ProjectNat.map(v => v).join(",")
        //   : "",
        // ProjectStatus: params.ProjectStatus
        //   ? params.ProjectStatus.map(v => v).join(",")
        //   : "",
        // VecType: params.VecType ? params.VecType.map(v => v).join(",") : "",
        // HasSpot: params.HasSpot ? params.HasSpot.map(v => v).join(",") : "",
        // ProjectType: params.ProjectType
        //   ? params.ProjectType.map(v => v).join(",")
        //   : "",
        // Compliance: params.Compliance
        //   ? params.Compliance.map(v => v).join(",")
        //   : "",
        // ProjectLevel: params.ProjectLevel
        //   ? params.ProjectLevel.map(v => v).join(",")
        //   : ""
      })
    }
  );
}

export async function projectSuperviseCreateUpdateApi(params) {
  return request(
    `${config.url.projectSuperviseUrl}${params.id ? "Update" : "Create"}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken()}`,
        "Content-Type": "application/json-patch+json"
      },
      body: JSON.stringify(params)
    }
  );
}

export async function projectSuperviseDeleteApi(id) {
  return request(`${config.url.projectSuperviseDeleteUrl}?id=${id}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken()}`,
      "Content-Type": "application/json-patch+json"
    }
  });
}

export async function projectShareApi(id) {
  return request(`${config.url.projectShareUrl}?Id=${id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken()}`
    }
  });
}

export async function projectImportApi(params) {
  return request(`${config.url.projectImportUrl}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken()}`,
      "Content-Type": "application/json-patch+json"
    },
    body: JSON.stringify(params)
  });
}

export async function projectSuperviseCancelDeleteApi(params) {
  return request(`${config.url.projectSuperviseCancelDeleteUrl}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken()}`,
      "Content-Type": "application/json-patch+json"
    },
    body: JSON.stringify(params)
  });
}

export async function projectSuperviseForeverDeleteApi(params) {
  return request(`${config.url.projectSuperviseForeverDeleteUrl}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken()}`,
      "Content-Type": "application/json-patch+json"
    },
    body: JSON.stringify(params)
  });
}

export async function totalByDistrictCodeApi(params) {
  // console.log('1410',params);
  return request(`${config.url.totalByDistrictCodeUrl}`, {
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

export async function statisticsByDistrictCodeApi(params) {
  //console.log('1456',params);
  return request(`${config.url.statisticsByDistrictCodeUrl}`, {
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

export async function getAllPointApi(params) {
  console.log("项目监管请求项目点参数params", params);
  return request(`${config.url.getAllPointUrl}`, {
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

export async function interpretListApi() {
  return request(`${config.url.interpretListUrl}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken()}`
    }
  });
}
