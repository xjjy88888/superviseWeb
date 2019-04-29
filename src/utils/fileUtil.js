import { EXIF } from 'exif-js';
import isCordova from './cordova';

// eslint-disable-next-line
export const ROOT_DIR_PATH = isCordova() ? cordova.file.externalDataDirectory : '';

// 获取本地路径dirEntry（目录）
export async function resolveLocalFileSystemURL(dirPath) {
  return new Promise((resolve, reject) => {
    window.resolveLocalFileSystemURL(
      dirPath,
      dirEntry => {
        resolve(dirEntry);
      },
      err => {
        console.error(`Failed resolveLocalFileSystemURL ${dirPath}! `, err);
        reject(err);
      }
    );
  });
}

// 获取文件夹（父文件夹DirEntry、目录名称）
export async function getDirectory(parentDirEntry, dirName) {
  return new Promise((resolve, reject) => {
    parentDirEntry.getDirectory(
      dirName,
      { create: true },
      dirEntry => {
        resolve(dirEntry);
      },
      err => {
        console.error(`Failed getDirectory ${dirName}! `, err);
        reject(err);
      }
    );
  });
}

// 获取文件（父文件夹DirEntry、文件名称）
export async function getFile(parentDirEntry, fileName) {
  return new Promise((resolve, reject) => {
    parentDirEntry.getFile(
      fileName,
      { create: true, exclusive: false },
      fileEntry => {
        resolve(fileEntry);
      },
      err => {
        console.error(`Failed getFile ${fileName}! `, err);
        reject(err);
      }
    );
  });
}

// 下载文件（源文件地址、目标文件FileEntry、目标文件名称）
export async function downloadFile(sourceUrl, destFileEntry, destFileName) {
  /* eslint-disable */
  const [fileName, fileEntry] = [destFileName, destFileEntry];
  return new Promise((resolve, reject) => {
    const oReq = new XMLHttpRequest();
    // Make sure you add the domain name to the Content-Security-Policy <meta> element.
    oReq.open('GET', sourceUrl, true);
    // Define how you want the XHR data to come back
    oReq.responseType = 'blob';
    oReq.onload = function(oEvent) {
      if (oReq.status === 200) {
        const blob = oReq.response;
        // 创建一个写入对象
        fileEntry.createWriter(fileWriter => {
          // 文件写入成功
          fileWriter.onwriteend = function() {
            console.log(`Successful get ${sourceUrl}. Successful write ${fileName}`);
            resolve();
          };

          // 文件写入失败
          fileWriter.onerror = function(e) {
            console.error(`Successful get ${sourceUrl}. Failed write ${fileName}: ${e.toString()}`);
            reject(e.toString());
          };

          // 写入文件
          fileWriter.write(blob);
        });
      } else {
        console.error(`Failed get ${sourceUrl}`);
        resolve();
      }
    };
    oReq.send(null);
  });
  /* eslint-enable */
}

// 复制文件（源文件FileEntry、目标父文件夹DirEntry、目标文件名）
export async function copyTo(sourceFileEntry, destParentDirEntry, destFileName) {
  return new Promise((resolve, reject) => {
    sourceFileEntry.copyTo(
      destParentDirEntry,
      destFileName,
      // eslint-disable-next-line
      destFileEntry => {
        console.log(
          `Successful copy from ${sourceFileEntry.fullPath} to ${
            destParentDirEntry.fullPath
          }${destFileName}`
        );
        resolve(destFileEntry);
      },
      err => {
        console.error(
          `Failed copy from ${sourceFileEntry.fullPath} to ${destParentDirEntry}{destFileName}! `,
          err
        );
        reject();
      }
    );
  });
}

// 获取文件Base64（文件FileEntry）
export async function getBase64(fileEntry) {
  return new Promise((resolve, reject) => {
    fileEntry.file(
      file => {
        console.log(`Successful get base64 of file ${fileEntry.fullPath}`);
        const reader = new FileReader();
        // eslint-disable-next-line
        reader.onloadend = function() {
          // 注意由于this作用域，不能用箭头函数
          // 64 位编码
          const code = this.result.split('base64,')[1];

          // 文件类型
          const filePath = fileEntry.nativeURL;
          const fileName = filePath.substring(filePath.lastIndexOf('/') + 1);

          resolve({ code, fileName });
        };
        reader.readAsDataURL(file);
      },
      err => {
        console.error(`Failed get base64 of file ${fileEntry.fullPath}! `, err);
        reject();
      }
    );
  });
}

/* eslint-disable */
export async function getPicture(isCamera) {
  return new Promise((resolve, reject) => {
    const sourceType = isCamera
      ? Camera.PictureSourceType.CAMERA
      : Camera.PictureSourceType.PHOTOLIBRARY;

    navigator.camera.getPicture(imageURI => resolve(imageURI), message => reject(message), {
      quality: 100,
      destinationType: Camera.DestinationType.FILE_URI,
      encodingType: Camera.EncodingType.JPEG,
      sourceType,
    });
  });
}

// 获取图片EXIF信息
/* eslint-disable */
export async function getPictureExif(imageUri) {
  return new Promise((resolve, reject) => {
    window.resolveLocalFileSystemURL(imageUri, entry => {
      entry.file(
        file => {
          EXIF.getData(file, function() {
            const allMetaData = EXIF.getAllTags(this);

            let direction;
            if (allMetaData.GPSImgDirection) {
              const directionArry = allMetaData.GPSImgDirection; // 方位角
              direction = directionArry.numerator / directionArry.denominator;
            }

            // 经度 numerator(数值) denominator（自身的进制） 三个参数 度、分、秒换算，保留小数点后两位
            let Longitude;
            if (allMetaData.GPSLongitude) {
              const LongitudeArry = allMetaData.GPSLongitude;
              const longLongitude =
                LongitudeArry[0].numerator / LongitudeArry[0].denominator +
                LongitudeArry[1].numerator / LongitudeArry[1].denominator / 60 +
                LongitudeArry[2].numerator / LongitudeArry[2].denominator / 3600;
              Longitude = longLongitude.toFixed(8);
            }

            // 纬度 numerator(数值) denominator（自身的进制） 三个参数 度、分、秒换算 ，保留小数点后两位
            let Latitude;
            if (allMetaData.GPSLatitude) {
              const LatitudeArry = allMetaData.GPSLatitude;
              const longLatitude =
                LatitudeArry[0].numerator / LatitudeArry[0].denominator +
                LatitudeArry[1].numerator / LatitudeArry[1].denominator / 60 +
                LatitudeArry[2].numerator / LatitudeArry[2].denominator / 3600;
              Latitude = longLatitude.toFixed(8);
            }

            let originalTime;
            if (allMetaData.DateTimeOriginal) {
              originalTime = allMetaData.DateTimeOriginal; // 时间
            }

            console.log('图片EXIF信息', allMetaData);
            resolve({ direction, Longitude, Latitude, originalTime });
          });
        },
        err => {
          console.error(`Failed get base64 of file ${imageUri}! `, err);
          reject();
        }
      );
    });
  });
}
