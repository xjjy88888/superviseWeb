import config from "../config";
import request from "../utils/request";
import CryptoJS from "crypto-js";
import { dateFormat } from "../utils/util";

// 登录
export async function loginApi(params) {
  return request(config.url.loginUrl, {
    method: "POST",
    headers: {
      // 'Authorization': "Bearer Token",
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
      method: "GET"
    }
  );
}

// 图斑列表
export async function spotListApi(row) {
  return request(
    `${config.url.spotListUrl}?MaxResultCount=10&SkipCount=${row - 10}`,
    {
      method: "GET"
    }
  );
}

// id查询项目
export async function projectByIdApi(id) {
  return request(`${config.url.projectByIdUrl}?id=${id}`, {
    method: "GET"
  });
}

// id查询图斑
export async function spotByIdApi(id) {
  return request(`${config.url.spotBytbId}?id=${id}`, {
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
