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
  Cascader,
  List
} from "antd";
import emitter from "../../../utils/event";
import "leaflet/dist/leaflet.css";
import Spins from "../../../components/Spins";
import config from "../../../config";
import { getFile, accessToken } from "../../../utils/util";

let self;
let isOnChange = false;
const { Text } = Typography;

const formItemLayout = {
  labelCol: { span: 7 },
  wrapperCol: { span: 16 }
};

@createForm()
@connect(({ inspect, problemPoint }) => ({
  inspect,
  problemPoint
}))
export default class problemPoint extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      show: false,
      id: null,
      projectId: null,
      inspectId: null,
      problemTypeData: [],
      showSpin: false,
      fileList: [],
      attachmentId: 0,
      radioChecked: null,
      from: null,
      previewImage: null,
      previewVisible_min: false,
      previewVisible: false
    };
  }

  componentDidMount() {
    isOnChange = false;
    self = this;
    const {
      form: { resetFields, setFieldsValue }
    } = this.props;

    this.eventEmitter = emitter.addListener("showProblemPoint", v => {
      this.setState({
        ...v,
        problemTypeData: [],
        radioChecked: null,
        attachmentId: 0
      });

      if (v.show) {
        isOnChange = false;
        resetFields();
        this.setState({ showSpin: true });
        this.problemType(v);
      }
    });

    this.eventEmitter = emitter.addListener("siteLocationBack", data => {
      setFieldsValue({
        pointX: data.longitude, //经度1
        pointY: data.latitude //维度
      });
    });
  }

  problemType = v => {
    const { dispatch } = this.props;
    dispatch({
      type: "problemPoint/problemType",
      callback: (success, error, result) => {
        if (success) {
          this.problemPointById(v);
        }
      }
    });
  };

  problemPointById = v => {
    const { dispatch } = this.props;
    dispatch({
      type: "problemPoint/problemPointById",
      payload: {
        id: v.id,
        from: v.from
      },
      callback: (success, error, result) => {
        this.setState({ showSpin: false, fileList: [] });
        if (success) {
          this.setState({
            radioChecked: result.problem ? result.problem.id : null
          });
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

  cascaderInit = v => {
    const {
      problemPoint: { problemType }
    } = this.props;

    const { from } = this.state;

    if (!v || from === "add" || isOnChange) {
      return [];
    }

    problemType.map(item => {
      const filter = item.children.filter(record => record.value === v.type.id);
      if (filter.length === 1) {
        this.setState({ problemTypeData: filter[0].data });
      } else {
        item.children.map(ite => {
          const filt = (ite.children || []).filter(
            reco => reco.value === v.type.id
          );
          if (filt.length === 1) {
            this.setState({ problemTypeData: filt[0].data });
          }
        });
      }
    });

    if (v.type.type === 2) {
      return [v.type.type, v.type.id];
    }
    return [v.type.type, v.type.depType, v.type.id];
  };

  render() {
    const {
      dispatch,
      form: { getFieldDecorator, validateFields },
      inspect: { inspectInfo },
      problemPoint: { problemType, problemPointInfo }
    } = this.props;

    const {
      show,
      id,
      showSpin,
      fileList,
      attachmentId,
      problemTypeData,
      radioChecked,
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
        <Spins show={showSpin} />
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

                // if (!v.pointX || !v.pointY) {
                //   notification["warning"]({
                //     message: `请在地图上选择问题点位置`,
                //     duration: 1
                //   });
                //   return;
                // }
                if (!v.name) {
                  notification["warning"]({
                    message: `请填写问题点`,
                    duration: 1
                  });
                  return;
                }
                // if (!v.problemId || !radioChecked) {
                //   notification["warning"]({
                //     message: `请选择问题类型`,
                //     duration: 1
                //   });
                //   return;
                // }
                //提交
                dispatch({
                  type: "problemPoint/problemPointCreateUpdate",
                  payload: {
                    ...v,
                    id: id,
                    monitorCheckListId: inspectId,
                    problemId: radioChecked,
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
                title: `确定放弃填写问题点吗？`,
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
          {id ? `问题点详情` : `新建问题点`}
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
                问题点 <Text type="danger">*</Text>
              </span>
            }
            {...formItemLayout}
          >
            {getFieldDecorator("name", {
              initialValue: problemPointInfo.name
            })(<Input style={{ width: 240 }} />)}
          </Form.Item>
          <Form.Item label={<span>问题类型</span>} {...formItemLayout}>
            {getFieldDecorator("problemId", {
              initialValue: this.cascaderInit(problemPointInfo.problem)
            })(
              <Cascader
                placeholder="请选择问题类型"
                options={problemType}
                onChange={(v, a) => {
                  isOnChange = true;
                  const data = a[a.length - 1].data;
                  self.setState({ problemTypeData: data, radioChecked: null });
                }}
              />
            )}
          </Form.Item>
          <List style={{ padding: "0 30px", fontStyle: "italic" }}>
            {problemTypeData.map((item, index) => (
              <List.Item
                key={index}
                style={{
                  position: "relative",
                  color: radioChecked === item.id ? "#108ee9" : "#000",
                  paddingRight: 20
                }}
                onClick={() => {
                  this.setState({ radioChecked: item.id });
                }}
              >
                {item.info}
                <Icon
                  type="check"
                  style={{
                    display: radioChecked === item.id ? "block" : "none",
                    color: "#1890ff",
                    fontSize: 20,
                    position: "absolute",
                    right: 0,
                    top: 15
                  }}
                />
              </List.Item>
            ))}
          </List>
          <Form.Item label={<span>坐标</span>} {...formItemLayout}>
            {getFieldDecorator("pointX", {
              initialValue: problemPointInfo.pointX
            })(<Input placeholder="经度" style={{ width: 103 }} disabled />)}
            {getFieldDecorator("pointY", {
              initialValue: problemPointInfo.pointY
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
                      emitter.emit("siteLocation", {});
                    }}
                  />
                }
              />
            )}
          </Form.Item>
          <Form.Item label="备注" {...formItemLayout}>
            {getFieldDecorator("description", {
              initialValue: problemPointInfo.description
            })(<Input.TextArea autosize />)}
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
              onSuccess={v => {
                this.setState({
                  attachmentId: v.result.id
                });
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
