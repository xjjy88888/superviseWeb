/* eslint-disable array-callback-return */
import moment from "moment";
import { EXIF } from "exif-js";
import { message, notification } from "antd";
import emitter from "./event";
import jQuery from "jquery";
import bigInt from "big-integer";
import config from "../config";
import * as turf from "@turf/turf";

const dateFormat = v => {
  return v ? moment(new Date(v).getTime()).format("YYYY-MM-DD") : null;
};

const dateInitFormat = v => {
  return v ? moment(v, "YYYY-MM-DD") : null;
};

const dateTimeFormat = v => {
  return v ? moment(new Date(v).getTime()).format("YYYY-MM-DD HH:mm:ss") : null;
};

const getFile = url => {
  const dom = jQuery(`<img src=${url}></img>`);
  EXIF.getData(dom[0], function() {
    const allMetaData = EXIF.getAllTags(this);

    console.log(allMetaData);
    let direction;
    if (allMetaData.GPSImgDirection) {
      const directionArry = allMetaData.GPSImgDirection; // 方位角
      direction = directionArry.numerator / directionArry.denominator;
    }

    let Longitude;
    if (allMetaData.GPSLongitude) {
      const LongitudeArry = allMetaData.GPSLongitude;
      const longLongitude =
        LongitudeArry[0].numerator / LongitudeArry[0].denominator +
        LongitudeArry[1].numerator / LongitudeArry[1].denominator / 60 +
        LongitudeArry[2].numerator / LongitudeArry[2].denominator / 3600;
      Longitude = longLongitude.toFixed(8);
    }

    let Latitude;
    if (allMetaData.GPSLatitude) {
      const LatitudeArry = allMetaData.GPSLatitude;
      const longLatitude =
        LatitudeArry[0].numerator / LatitudeArry[0].denominator +
        LatitudeArry[1].numerator / LatitudeArry[1].denominator / 60 +
        LatitudeArry[2].numerator / LatitudeArry[2].denominator / 3600;
      Latitude = longLatitude.toFixed(8);
    }

    console.log(Longitude, Latitude, direction);
    emitter.emit("imgLocation", {
      Latitude: Latitude,
      Longitude: Longitude,
      direction: direction,
      show: true
    });
  });
};

const accessToken = () =>
  localStorage.length > 0 && localStorage.user
    ? JSON.parse(localStorage.user).accessToken
    : "";

const guid = () => {
  const Snowflake = /** @class */ (function() {
    function Snowflake(_workerId, _dataCenterId, _sequence) {
      // this.twepoch = 1288834974657;
      this.twepoch = 0;
      this.workerIdBits = 5;
      this.dataCenterIdBits = 5;
      this.maxWrokerId = -1 ^ (-1 << this.workerIdBits); // 值为：31
      this.maxDataCenterId = -1 ^ (-1 << this.dataCenterIdBits); // 值为：31
      this.sequenceBits = 12;
      this.workerIdShift = this.sequenceBits; // 值为：12
      this.dataCenterIdShift = this.sequenceBits + this.workerIdBits; // 值为：17
      this.timestampLeftShift =
        this.sequenceBits + this.workerIdBits + this.dataCenterIdBits; // 值为：22
      this.sequenceMask = -1 ^ (-1 << this.sequenceBits); // 值为：4095
      this.lastTimestamp = -1;
      //设置默认值,从环境变量取
      this.workerId = 1;
      this.dataCenterId = 1;
      this.sequence = 0;
      if (this.workerId > this.maxWrokerId || this.workerId < 0) {
        throw new Error(
          "config.worker_id must max than 0 and small than maxWrokerId-[" +
            this.maxWrokerId +
            "]"
        );
      }
      if (this.dataCenterId > this.maxDataCenterId || this.dataCenterId < 0) {
        throw new Error(
          "config.data_center_id must max than 0 and small than maxDataCenterId-[" +
            this.maxDataCenterId +
            "]"
        );
      }
      this.workerId = _workerId;
      this.dataCenterId = _dataCenterId;
      this.sequence = _sequence;
    }
    Snowflake.prototype.tilNextMillis = function(lastTimestamp) {
      var timestamp = this.timeGen();
      while (timestamp <= lastTimestamp) {
        timestamp = this.timeGen();
      }
      return timestamp;
    };
    Snowflake.prototype.timeGen = function() {
      //new Date().getTime() === Date.now()
      return Date.now();
    };
    Snowflake.prototype.nextId = function() {
      var timestamp = this.timeGen();
      if (timestamp < this.lastTimestamp) {
        throw new Error(
          "Clock moved backwards. Refusing to generate id for " +
            (this.lastTimestamp - timestamp)
        );
      }
      if (this.lastTimestamp === timestamp) {
        this.sequence = (this.sequence + 1) & this.sequenceMask;
        if (this.sequence === 0) {
          timestamp = this.tilNextMillis(this.lastTimestamp);
        }
      } else {
        this.sequence = 0;
      }
      this.lastTimestamp = timestamp;
      var shiftNum =
        (this.dataCenterId << this.dataCenterIdShift) |
        (this.workerId << this.workerIdShift) |
        this.sequence; // dataCenterId:1,workerId:1,sequence:0  shiftNum:135168
      var nfirst = new bigInt(String(timestamp - this.twepoch), 10);
      nfirst = nfirst.shiftLeft(this.timestampLeftShift);
      var nnextId = nfirst.or(new bigInt(String(shiftNum), 10)).toString(10);
      return nnextId;
    };
    return Snowflake;
  })();

  return new Snowflake(1, 1, 0).nextId();
};

const unique = (arr, k) => {
  const key = k || "value";
  const res = new Map();
  return arr.filter(a => !res.has(a[key]) && res.set(a[key], 1));
};

const treeToList = (v, parent_name = "", parent_code = "", parent_id = "") => {
  let child = v.children,
    arr = [];
  arr.push({
    name: v.label,
    code: v.code,
    id: v.value,
    description: v.description,
    parent_name: parent_name,
    parent_code: parent_code,
    parent_id: parent_id
  });
  if (child) {
    child.forEach(function(node) {
      arr = arr.concat(treeToList(node, v.label, v.code, v.value));
    });
  }
  return arr;
};

const inspectFormData = (items, pTitle = null, color = null) => {
  let arr = [];
  items.forEach(item => {
    if (item.type === "label") {
      arr = arr.concat(
        inspectFormData(item.child, item.title, item.color ? item.color : color)
      );
    } else {
      arr.push({
        ...item,
        title: pTitle ? `${pTitle}-${item.title}` : item.title,
        color: item.color ? item.color : color
      });
    }
  });
  return arr;
};

const getUrl = key => {
  let result = null;
  const url = window.location.href.split(`?`);
  if (url.length > 1) {
    url[1].split(`&`).map(item => {
      const res = item.split(`=`);
      if (res[0] === key) {
        result = res[1];
      }
    });
  }
  return result;
};

const localStorageSet = (name, data, expire = 24) => {
  const time = new Date().getTime() + expire * 60 * 60 * 1000;
  const obj = { data, time };
  localStorage.setItem(name, JSON.stringify(obj));
};

const localStorageGet = name => {
  const storage = localStorage.getItem(name);
  const time = new Date().getTime();
  let result = {};
  if (storage) {
    const obj = JSON.parse(storage);
    if (time < obj.time) {
      result = obj.data;
    } else {
      localStorage.removeItem(name);
    }
  }
  return result;
};

const getDictList = (v, list) => {
  const filter = list.filter(item => item.dictTypeName === v);
  const result = filter.map(i => {
    return {
      label: i.dictTableValue,
      value: i.id
    };
  });
  return result;
};

const getLabel = (v = "", list = [], label = "label", value = "value") => {
  if (!v) {
    return "";
  }
  const result = list.filter(i => i[value] === v);
  // console.log(v, list, result);
  return result.length ? result[0][label] : "";
};

const formErrorMsg = v => {
  const list = Object.values(v);
  // console.log(list);
  message.warning(list[0].errors[0].message);
};

const messages = (success, error, info) => {
  console.log(info);
  const result = success
    ? "成功"
    : `失败：${
        error.validationErrors
          ? error.validationErrors[0].message
          : error.message
      }`;
  return notification[success ? "success" : "error"]({
    message: info + result
  });
};

const photoFormat = v => {
  if (!v) {
    return [];
  }
  const result = v.child.map(item => {
    return {
      uid: item.id,
      name: item.fileName,
      fileExtend: item.fileExtend,
      url: config.url.annexPreviewUrl + item.id,
      latitude: item.latitude,
      longitude: item.longitude,
      azimuth: item.azimuth,
      status: "done"
    };
  });
  return result;
};

//turf图形裁剪
/**
 * 线分割面
 * 面类型只能是polygon 但可以是环
 * 注:线与多边形必须有两个交点
 */
const polygonClipByLine = (polygon, clipLine) => {
  if (polygon.geometry.type === "Polygon") {
    var polyLine = turf.polygonToLine(polygon);
    if (polyLine.geometry.type === "LineString") {
      // 切割普通多边形
      return _singlePolygonClip(polyLine, clipLine);
    } else if (polyLine.geometry.type === "MultiLineString") {
      //切割环
      return _multiPolygonClip(polyLine, clipLine);
    }
  } else if (polygon.geometry.type === "MultiPolygon") {
    // 若输入的多边形类型为Multipolygon则拆分成多个Polygon
    var polygons = multiPolygon2polygons(polygon);
    var clipPolygon = null;
    var clipPolygonIndex = -1;
    // 获取MultiPolygon中与切割线相交的多边形（有且只能有一个多边形相交2个交点）
    polygons.forEach(function(polygon, index) {
      var polyLine = turf.polygonToLine(polygon);
      if (turf.lineIntersect(polyLine, clipLine).features.length === 2) {
        if (!clipPolygon) {
          clipPolygon = polygon;
          clipPolygonIndex = index;
        } else {
          // eslint-disable-next-line no-throw-literal
          throw {
            state: "裁剪失败",
            message: "MultiPolygon只能有一个多边形与切割线存在交点"
          };
        }
      }
    });
    if (clipPolygonIndex !== -1) {
      polygons.splice(clipPolygonIndex, 1);
      return turf.featureCollection(
        polygons.concat(polygonClipByLine(clipPolygon, clipLine).features)
      );
    } else {
      // eslint-disable-next-line no-throw-literal
      throw { state: "裁剪失败", message: "MultiPolygon与切割线无交点" };
    }
  } else {
    // eslint-disable-next-line no-throw-literal
    throw { state: "裁剪失败", message: "输入的多边形类型为错误" };
  }
};
/**
 * multiPolygon转polygons,不涉及属性
 */
const multiPolygon2polygons = multiPolygon => {
  if (multiPolygon.geometry.type !== "MultiPolygon") {
    return;
  }
  var polygons = [];
  multiPolygon.geometry.coordinates.forEach(item => {
    var polygon = {
      type: "Feature",
      properties: {},
      geometry: {
        type: "Polygon",
        coordinates: []
      }
    };
    polygon.geometry.coordinates = item;
    polygons.push(polygon);
  });
  return polygons;
};

const _multiPolygonClip = (polyLine, clipLine) => {
  // 将环 多边形分割成 内部逆时针多边形+外部多边形
  var outPolyline,
    insidePolylineList = [];
  for (var i = 0; i < polyLine.geometry.coordinates.length; i++) {
    var splitPolyline = turf.lineString(polyLine.geometry.coordinates[i]);
    if (turf.booleanClockwise(splitPolyline)) {
      if (outPolyline) {
        // eslint-disable-next-line no-throw-literal
        throw { state: "裁剪失败", message: "出现了两个外部多边形无法处理" };
      } else {
        outPolyline = splitPolyline;
      }
    } else {
      var intersects = turf.lineIntersect(splitPolyline, clipLine);
      if (intersects.features.length > 0) {
        // eslint-disable-next-line no-throw-literal
        throw { state: "裁剪失败", message: "切割线不能与内环有交点" };
      }
      insidePolylineList.push(splitPolyline);
    }
  }
  var resultCollection = _singlePolygonClip(outPolyline, clipLine);

  // eslint-disable-next-line no-redeclare
  for (var i = 0; i < resultCollection.features.length; i++) {
    for (var j = 0; j < insidePolylineList.length; j++) {
      var startPoint = turf.point(
        insidePolylineList[j].geometry.coordinates[0]
      );
      if (
        turf.booleanPointInPolygon(startPoint, resultCollection.features[i])
      ) {
        resultCollection.features[i] = turf.mask(
          resultCollection.features[i],
          turf.lineToPolygon(insidePolylineList[j])
        );
      }
    }
  }
  return resultCollection;
};

const _singlePolygonClip = (polyLine, clipLine) => {
  // 获得裁切点
  var intersects = turf.lineIntersect(polyLine, clipLine);
  if (intersects.features.length !== 2) {
    // eslint-disable-next-line no-throw-literal
    throw {
      state: "裁剪失败",
      message:
        "切割线与多边形交点应该为2个,当前交点个数为" +
        intersects.features.length
    };
  }
  // 检查切割线与多边形的位置关系 （切割线的起点和终点不能落在多边形内部）
  var clipLineLength = clipLine.geometry.coordinates.length;
  var clipLineStartPoint = turf.point(clipLine.geometry.coordinates[0]);
  var clipLineEndPoint = turf.point(
    clipLine.geometry.coordinates[clipLineLength - 1]
  );
  var polygon = turf.polygon([polyLine.geometry.coordinates]);
  if (
    turf.booleanPointInPolygon(clipLineStartPoint, polygon) ||
    turf.booleanPointInPolygon(clipLineEndPoint, polygon)
  ) {
    // eslint-disable-next-line no-throw-literal
    throw {
      state: "裁剪失败",
      message: "切割线起点或终点不能在 裁剪多边形内部"
    };
  }
  // 通过裁切点 分割多边形（只能获得多边形的一部分）
  var slicedPolyLine = turf.lineSlice(
    intersects.features[0],
    intersects.features[1],
    polyLine
  );
  // 裁剪线分割 保留多边形内部部分
  var slicedClipLine = turf.lineSlice(
    intersects.features[0],
    intersects.features[1],
    clipLine
  );
  // 重新拼接多边形 存在 对接的问题 所以先进行判断 如何对接裁剪的多边形和裁剪线
  var resultPolyline1 = connectLine(slicedPolyLine, slicedClipLine);
  // 闭合线 来构造多边形
  resultPolyline1.geometry.coordinates.push(
    resultPolyline1.geometry.coordinates[0]
  );
  var resultPolygon1 = turf.lineToPolygon(resultPolyline1);
  // 构造切割的另一面多边形
  var firstPointOnLine = isOnLine(
    turf.point(polyLine.geometry.coordinates[0]),
    slicedPolyLine
  );
  var pointList = [];
  if (firstPointOnLine) {
    for (var i = 0; i < polyLine.geometry.coordinates.length; i++) {
      var coordinate = polyLine.geometry.coordinates[i];
      if (!isOnLine(turf.point(coordinate), slicedPolyLine)) {
        pointList.push(coordinate);
      }
    }
  } else {
    var skipNum = 0; // 记录前面被跳过的点的个数
    var isStartPush = false;
    // eslint-disable-next-line no-redeclare
    for (var i = 0; i < polyLine.geometry.coordinates.length; i++) {
      // eslint-disable-next-line no-redeclare
      var coordinate = polyLine.geometry.coordinates[i];
      if (!isOnLine(turf.point(coordinate), slicedPolyLine)) {
        if (isStartPush) {
          pointList.push(coordinate);
        } else {
          skipNum++;
        }
      } else {
        isStartPush = true;
      }
    }
    // 将前面跳过的点补充到 点数组中
    // eslint-disable-next-line no-redeclare
    for (var i = 0; i < skipNum; i++) {
      pointList.push(polyLine.geometry.coordinates[i]);
    }
  }
  var slicedPolyLine_2 = turf.lineString(pointList);
  var resultPolyline2 = connectLine(slicedPolyLine_2, slicedClipLine);
  // 闭合线 来构造多边形
  resultPolyline2.geometry.coordinates.push(
    resultPolyline2.geometry.coordinates[0]
  );
  var resultPolygon2 = turf.lineToPolygon(resultPolyline2);
  // 返回面要素集
  return turf.featureCollection([resultPolygon1, resultPolygon2]);
};
/**
 * 连接两条线
 * 方法会将两条线段最近的一段直接连接
 */
const connectLine = (line1, line2) => {
  var line2_length = line2.geometry.coordinates.length;
  var line1_startPoint = line1.geometry.coordinates[0];
  var line2_startPoint = line2.geometry.coordinates[0];
  var line2_endPoint = line2.geometry.coordinates[line2_length - 1];
  var pointList = [];
  // 获取line1 所有点坐标
  for (var i = 0; i < line1.geometry.coordinates.length; i++) {
    var coordinate = line1.geometry.coordinates[i];
    pointList.push(coordinate);
  }

  // 判断两条线的 起点是否接近，如果接近 逆转line2线 进行连接
  if (
    turf.distance(line1_startPoint, line2_startPoint) <
    turf.distance(line1_startPoint, line2_endPoint)
  ) {
    line2.geometry.coordinates = line2.geometry.coordinates.reverse();
  }
  // eslint-disable-next-line no-redeclare
  for (var i = 0; i < line2.geometry.coordinates.length; i++) {
    // eslint-disable-next-line no-redeclare
    var coordinate = line2.geometry.coordinates[i];
    pointList.push(coordinate);
  }
  return turf.lineString(pointList);
};

/**
 * 判断点是否在线里面
 * 注：线组成的坐标对比
 */
const isOnLine = (point, line) => {
  for (var i = 0; i < line.geometry.coordinates.length; i++) {
    var coordinate = line.geometry.coordinates[i];
    if (
      point.geometry.coordinates[0] === coordinate[0] &&
      point.geometry.coordinates[1] === coordinate[1]
    ) {
      return true;
    }
  }
  return false;
};

export {
  dateFormat,
  dateInitFormat,
  dateTimeFormat,
  getFile,
  accessToken,
  guid,
  unique,
  treeToList,
  inspectFormData,
  getUrl,
  localStorageSet,
  localStorageGet,
  getDictList,
  getLabel,
  formErrorMsg,
  messages,
  photoFormat,
  polygonClipByLine
};
