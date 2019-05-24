import moment from "moment";
import { EXIF } from "exif-js";
import emitter from "./event";
import jQuery from "jquery";

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
  sessionStorage.length > 0 ? JSON.parse(sessionStorage.user).accessToken : "";

export async function getProjectName(id) {
  return new Promise((resolve, reject) => {
    resolve(id);
  });
}

export { dateFormat, dateInitFormat,dateTimeFormat, getFile, accessToken };
