import React, { PureComponent } from "react";
import { Button, Upload, notification } from "antd";

export default class UploadForPanorama extends PureComponent {
  render() {
    return (
      <div style={{ minHeight: fileList.length ? 120 : 0 }}>
        <Upload
          action={config.url.panoramaUploadUrl}
          headers={{ Authorization: `Bearer ${accessToken()}` }}
          data={{ GenerateType: "2" }}
          listType="picture-card"
          fileList={fileList}
          beforeUpload={() => {
            console.log("beforeUpload");
            this.setState({ loading: true });
          }}
          onSuccess={v => {
            this.setState({
              panoramaUrlConfig: v.result,
              loading: false
            });
          }}
          onError={(v, response) => {
            this.setState({
              loading: false
            });
            notification["error"]({
              message: `全景图上传失败：${response.error.message}`
            });
          }}
          onPreview={file => {
            console.log(file.fileExtend, file);
            switch (file.fileExtend) {
              case "pdf":
                window.open(file.url);
                break;
              case "doc":
              case "docx":
              case "xls":
              case "xlsx":
              case "ppt":
              case "pptx":
                window.open(file.url + "&isDown=true");
                break;
              default:
                this.setState({
                  previewImage: file.url || file.thumbUrl,
                  previewVisible_min: true
                });
                if (file.latitude || file.longitude) {
                  emitter.emit("imgLocation", {
                    Latitude: file.latitude,
                    Longitude: file.longitude,
                    direction: file.azimuth,
                    show: true
                  });
                } else {
                  getFile(file.url);
                }
                break;
            }
          }}
          onChange={({ fileList }) => {
            const data = fileList.map(item => {
              return {
                ...item,
                status: "done"
              };
            });
            this.setState({ fileList: data });
          }}
          onRemove={() => {
            this.setState({
              panoramaUrlConfig: null
            });
          }}
        >
          {edit && fileList.length < 1 ? (
            <div>
              <div className="ant-upload-text">
                <Button type="div" icon="plus">
                  上传全景图
                </Button>
              </div>
            </div>
          ) : null}
        </Upload>
      </div>
    );
  }
}
