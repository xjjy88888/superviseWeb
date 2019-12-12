/* eslint-disable array-callback-return */
import React, { PureComponent } from "react";
import { createForm } from "rc-form";
import { connect } from "dva";
import {
  Icon,
  Button,
  Input,
  Form,
  Modal,
  Typography,
  notification,
  Upload,
  Select
} from "antd";
import emitter from "../../../utils/event";
import "leaflet/dist/leaflet.css";
import Spins from "../../../components/Spins";
import config from "../../../config";
import { getFile, accessToken } from "../../../utils/util";

let self;
const { Text } = Typography;

const formItemLayout = {
  labelCol: { span: 7 },
  wrapperCol: { span: 16 }
};

@createForm()
@connect(({ inspect, measurePoint, user }) => ({
  inspect,
  measurePoint,
  user
}))
export default class measurePoint extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      show: false,
      id: null,
      projectId: null,
      inspectId: null,
      problemTypeData: [],
      loading: false,
      fileList: [],
      attachmentId: 0,
      from: null,
      previewImage: null,
      previewVisible_min: false,
      previewVisible: false
    };
  }

  componentDidMount() {
    self = this;
    const {
      form: { resetFields, setFieldsValue }
    } = this.props;

    this.eventEmitter = emitter.addListener("showMeasurePoint", v => {
      this.setState({
        ...v,
        problemTypeData: [],
        attachmentId: 0
      });

      if (v.show) {
        resetFields();
        this.measurePointById(v);
      }
    });

    this.eventEmitter = emitter.addListener("siteLocationBack", data => {
      setFieldsValue({
        pointX: data.longitude, //经度1
        pointY: data.latitude //维度
      });
    });
  }
  dictList = type => {
    const {
      user: { dicList }
    } = this.props;
    if (type) {
      return dicList.filter(item => {
        return item.dictTypeName === type;
      });
    } else {
      return [];
    }
  };

  measurePointById = v => {
    const { dispatch } = this.props;
    this.setState({ loading: true });
    dispatch({
      type: "measurePoint/measurePointById",
      payload: {
        id: v.id,
        from: v.from
      },
      callback: (success, error, result) => {
        this.setState({ loading: false, fileList: [] });
        if (success) {
          if (result.attachment) {
            const list = result.attachment.child.map(item => {
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
            this.setState({
              fileList: list,
              attachmentId: result.attachment.id
            });
          }
        }
      }
    });
  };

  render() {
    const {
      dispatch,
      form: { getFieldDecorator, validateFields, getFieldValue },
      inspect: { inspectInfo },
      measurePoint: { measurePointInfo }
    } = this.props;

    const {
      show,
      id,
      loading,
      fileList,
      attachmentId,
      projectId,
      inspectId,
      previewImage,
      previewVisible_min,
      previewVisible
    } = this.state;

    return (
      <div
        style={{
          position: `absolute`,
          top: 0,
          left: show ? 350 : -1000,
          zIndex: 1000,
          width: 500,
          height: `100%`,
          paddingTop: 60,
          borderLeft: "solid 1px #ddd",
          backgroundColor: `#fff`
        }}
        ref={this.saveRef}
      >
        <div
          style={{
            display: previewVisible_min ? "block" : "none",
            position: "fixed",
            zIndex: 2,
            width: 350
          }}
        >
          <Icon
            type="close"
            style={{
              fontSize: 18,
              position: "absolute",
              top: 0,
              right: 0
            }}
            onClick={() => {
              this.setState({ previewVisible_min: false });
              emitter.emit("imgLocation", {
                Latitude: 0,
                Longitude: 0,
                show: false
              });
            }}
          />
          <img
            alt="example"
            style={{ width: "100%", cursor: "pointer" }}
            src={previewImage}
            onClick={() => {
              this.setState({
                previewImage: previewImage,
                previewVisible: true
              });
            }}
          />
        </div>
        <Modal
          width={"50vw"}
          visible={previewVisible}
          footer={null}
          onCancel={() => {
            this.setState({ previewVisible: false });
          }}
        >
          <img alt="example" style={{ width: "100%" }} src={previewImage} />
        </Modal>
        <Spins show={loading} />
        <Icon
          type="left"
          style={{
            fontSize: 30,
            display: show ? "block" : "none",
            position: `absolute`,
            right: -50,
            top: `48%`,
            backgroundColor: `rgba(0, 0, 0, 0.5)`,
            borderRadius: `50%`,
            padding: 10,
            cursor: `pointer`
          }}
          onClick={() => {
            this.setState({ show: false });
            emitter.emit("hideQuery", {
              hide: true
            });
          }}
        />
        <span
          style={{
            position: "absolute",
            color: "#1890ff",
            right: 25,
            top: 60
          }}
        >
          <Button
            icon="check"
            shape="circle"
            style={{
              color: "#1890ff",
              fontSize: 18
            }}
            onClick={() => {
              // submit
              validateFields((error, v) => {
                console.log(error, v);
                if (!v.name) {
                  notification["warning"]({
                    message: `请填写措施点`,
                    duration: 1
                  });
                  return;
                }
                //提交
                dispatch({
                  type: "measurePoint/measurePointCreateUpdate",
                  payload: {
                    ...v,
                    id: id,
                    monitorCheckListId: inspectId,
                    attachmentId
                  },
                  callback: (success, error, result) => {
                    if (success) {
                      emitter.emit("projectInfoRefresh", {
                        projectId: projectId
                      });
                      this.setState({ show: false });
                    }
                  }
                });
              });
            }}
          />
          <Button
            icon="rollback"
            shape="circle"
            style={{
              color: "#1890ff",
              fontSize: 18
            }}
            onClick={() => {
              Modal.confirm({
                title: `确定放弃填写措施点吗？`,
                content: "",
                onOk() {
                  self.setState({ show: false });
                  emitter.emit("deleteDraw", {});
                },
                onCancel() {}
              });
            }}
          />
        </span>
        <b style={{ fontSize: 16, padding: "0 50px" }}>
          {id ? `措施点详情` : `新建措施点`}
        </b>
        <Form
          style={{
            height: window.innerHeight - 100,
            paddingTop: 20,
            overflow: "auto"
          }}
        >
          <Form.Item
            label={
              <span>
                措施点 <Text type="danger">*</Text>
              </span>
            }
            {...formItemLayout}
          >
            {getFieldDecorator("name", {
              initialValue: measurePointInfo.name
            })(<Input allowClear style={{ width: 240 }} />)}
          </Form.Item>
          <Form.Item label="措施类型" {...formItemLayout}>
            {getFieldDecorator("measurePointTypeId", {
              initialValue: measurePointInfo.measurePointTypeId
            })(
              <Select showSearch allowClear optionFilterProp="children">
                {this.dictList("措施类型").map(item => (
                  <Select.Option value={item.id} key={item.id}>
                    {item.dictTableValue}
                  </Select.Option>
                ))}
              </Select>
            )}
          </Form.Item>
          <Form.Item label="坐标" {...formItemLayout}>
            {getFieldDecorator("pointX", {
              initialValue: measurePointInfo.pointX
            })(<Input placeholder="经度" style={{ width: 103 }} disabled />)}
            {getFieldDecorator("pointY", {
              initialValue: measurePointInfo.pointY
            })(
              <Input
                disabled
                placeholder="纬度"
                style={{ width: 140, position: "relative", top: -2 }}
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
                        type: "measurePoint"
                      });
                    }}
                  />
                }
              />
            )}
          </Form.Item>
          <Form.Item label="备注" {...formItemLayout}>
            {getFieldDecorator("description", {
              initialValue: measurePointInfo.description
            })(<Input.TextArea allowClear autosize />)}
          </Form.Item>
          <div
            style={{ minHeight: fileList.length ? 120 : 0, margin: "0 30px" }}
          >
            <Upload
              action={config.url.annexUploadUrl}
              headers={{ Authorization: `Bearer ${accessToken()}` }}
              data={{ Id: attachmentId }}
              listType="picture-card"
              fileList={fileList}
              beforeUpload={() => {
                this.setState({ loading: true });
              }}
              onSuccess={v => {
                this.setState({ loading: false, attachmentId: v.result.id });
                const item = v.result.child[0];
                const obj = {
                  uid: item.id,
                  name: item.fileName,
                  url: config.url.annexPreviewUrl + item.id,
                  latitude: item.latitude,
                  longitude: item.longitude,
                  azimuth: item.azimuth,
                  fileExtend: item.fileExtend,
                  status: "done"
                };
                this.setState({
                  fileList: [...fileList, obj]
                });
              }}
              onError={(v, response) => {
                notification["error"]({
                  message: `图斑附件上传失败：${response.error.message}`,
                  duration: 1
                });
              }}
              onPreview={file => {
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
              onRemove={file => {
                return new Promise((resolve, reject) => {
                  dispatch({
                    type: "annex/annexDelete",
                    payload: {
                      FileId: file.uid,
                      Id: inspectInfo.attachment
                        ? inspectInfo.attachment.id
                        : attachmentId
                    },
                    callback: success => {
                      if (success) {
                        resolve();
                      } else {
                        reject();
                      }
                    }
                  });
                });
              }}
            >
              <div>
                <div className="ant-upload-text">
                  <Button type="div" icon="plus">
                    上传文件
                  </Button>
                  {/* <Button
                    icon="picture"
                    onClick={e => {
                      e.stopPropagation();
                      emitter.emit("screenshot", {
                        show: true
                      });
                    }}
                  >
                    屏幕截图1
                  </Button> */}
                </div>
              </div>
            </Upload>
          </div>
        </Form>
      </div>
    );
  }
}
