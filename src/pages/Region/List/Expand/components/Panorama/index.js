import React, { PureComponent } from "react";
import {
  Icon,
  Button,
  Input,
  Upload,
  notification,
  DatePicker,
  Form,
  message
} from "antd";
import { connect } from "dva";
import { createForm } from "rc-form";
import moment from "moment";

import config from "@/config";
import emitter from "../../../../../../utils/event";
import { getFile, accessToken } from "../../../../../../utils/util";

const { TextArea } = Input;

const formItemLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 }
};

@createForm()
@connect(({ panorama }) => ({
  ...panorama
}))
// 全景图
export default class Panorama extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      panoramaUrlConfig: "",
      fileList: []
    };
  }
  componentDidMount() {
    this.eventEmitter = emitter.addListener("siteLocationBack", data => {
      this.props.form.setFieldsValue({
        pointX_pano: data.longitude, //经度
        pointY_pano: data.latitude //维度
      });
    });
  }
  componentWillUnmount() {
    // this.eventEmitter && emitter.removeAllListeners();
  }
  render() {
    const {
      dispatch,
      item,
      type,
      edit,
      panoramaUrlConfig,
      projectId,
      form: { getFieldDecorator, validateFields, getFieldValue }
    } = this.props;
    const { fileList } = this.state;
    return (
      <div>
        <Form>
          <Form.Item label="全景点名" {...formItemLayout}>
            {getFieldDecorator("name", {
              initialValue: item.name
            })(<Input disabled={edit} />)}
          </Form.Item>
          <Form.Item label="拍摄日期" {...formItemLayout}>
            {getFieldDecorator("filmingTime", {
              initialValue: item.filmingTime ? moment(item.filmingTime) : null
            })(<DatePicker disabled={edit} />)}
          </Form.Item>
          <Form.Item label="描述" {...formItemLayout}>
            {getFieldDecorator("description", {
              initialValue: item.description
            })(<TextArea autosize={true} disabled={edit} />)}
          </Form.Item>
          <Form.Item label="坐标" {...formItemLayout}>
            {getFieldDecorator("pointX_pano", {
              initialValue: item.pointX
            })(
              <Input
                allowClear={true}
                placeholder="经度"
                disabled={edit}
                style={{ width: 98 }}
              />
            )}
            {getFieldDecorator("pointY_pano", {
              initialValue: item.pointY
            })(
              <Input
                allowClear={true}
                placeholder="纬度"
                disabled={edit}
                style={{ width: 135, position: "relative", top: -2 }}
                addonAfter={
                  <Icon
                    type="environment"
                    style={{
                      color: "#1890ff"
                    }}
                    onClick={() => {
                      const x = getFieldValue("pointX");
                      const y = getFieldValue("pointY");
                      emitter.emit("siteLocation", {
                        state: "position",
                        Longitude: x,
                        Latitude: y,
                        type: "panorama"
                      });
                    }}
                  />
                }
              />
            )}
          </Form.Item>
        </Form>
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
            {(edit || type === "add") && fileList.length < 1 ? (
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

        {edit || type === "add" ? (
          <Button
            icon="check"
            style={{ marginTop: 20 }}
            onClick={() => {
              validateFields((err, v) => {
                console.log(v);
                if (!v.pointX_pano || !v.pointY_pano) {
                  message.warning(`请填写经纬度`);
                  return;
                }
                if (!panoramaUrlConfig) {
                  message.warning(`请上传全景图`);
                  return;
                }
                this.setState({ loading: true });
                dispatch({
                  type: "panorama/panoramaCreateUpdate",
                  payload: {
                    ...v,
                    projectId,
                    urlConfig: panoramaUrlConfig,
                    id: type === "edit" ? item.id : "",
                    pointX: v.pointX_pano,
                    pointY: v.pointY_pano
                  },
                  callback: (success, response) => {
                    this.setState({ loading: false });
                    if (success) {
                      emitter.emit("projectInfoRefresh", {
                        projectId
                      });
                      emitter.emit("showSiderbarDetail", {
                        show: false
                      });
                    }
                  }
                });
              });
            }}
          >
            保存
          </Button>
        ) : null}
      </div>
    );
  }
}
