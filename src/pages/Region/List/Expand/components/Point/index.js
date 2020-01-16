import React, { PureComponent } from "react";
import {
  Icon,
  Button,
  Input,
  notification,
  Form,
  Select,
  Upload,
  Modal
} from "antd";
import { connect } from "dva";
import { createForm } from "rc-form";

import config from "@/config";
import emitter from "../../../../../../utils/event";
import { getFile, accessToken } from "../../../../../../utils/util";

const { TextArea } = Input;

const formItemLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 }
};

@createForm()
@connect(({ point, spot, annex }) => ({
  ...point,
  ...spot,
  ...annex
}))
export default class Point extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      ParentId: 0,
      fileList: []
    };
  }
  componentDidUpdate(prevProps, prevState) {
    const { type, currentFromId } = this.props;
    if (
      prevProps.currentFromId !== "" &&
      currentFromId !== prevProps.currentFromId &&
      type === "edit"
    ) {
      this.queryPointById(currentFromId);
    }
  }
  componentDidMount() {
    const { type, currentFromId } = this.props;

    if (type === "edit") {
      this.queryPointById(currentFromId);
    }
    this.eventEmitter = emitter.addListener("siteLocationBack", data => {
      this.props.form.setFieldsValue({
        pointX: data.longitude, //经度
        pointY: data.latitude //维度
      });
    });
    this.eventEmitter = emitter.addListener("screenshotBack", v => {
      console.log("屏幕截图", v);
      if (v.img) {
        this.annexUploadBase64(v);
      } else {
        notification["warning"]({
          message: `未获取到数据，请重新截图`
        });
      }
    });
  }
  componentWillUnmount() {
    // this.eventEmitter && emitter.removeAllListeners();
  }
  annexUploadBase64 = v => {
    const { dispatch } = this.props;
    const { ParentId, fileList } = this.state;
    dispatch({
      type: "annex/annexUploadBase64Api",
      payload: {
        Id: ParentId,
        "FileBase64.FileName": Math.random()
          .toString(36)
          .substr(2),
        "FileBase64.Base64": v.img,
        Longitude: v.longitude,
        Latitude: v.latitude,
        Azimuth: 0
      },
      callback: (success, error, result) => {
        if (success) {
          this.setState({ ParentId: result.id });
          const item = result.child[0];
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
          this.setState({ fileList: [...fileList, obj] });
        } else {
          notification["error"]({
            message: `屏幕截图上传失败：${error.message}`
          });
        }
      }
    });
  };

  queryPointById = id => {
    this.queryDetail(id, "point/queryPointById");
  };

  queryDetail = (id, url) => {
    const { dispatch } = this.props;
    this.setState({ loading: true });
    dispatch({
      type: url,
      payload: {
        id: id,
        refresh: true
      },
      callback: v => {
        this.setState({
          loading: false,
          ParentId: v.attachment ? v.attachment.id : 0
        });
        if (v.attachment) {
          const list = v.attachment.child.map(item => {
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
          console.log("list==================", list);
          this.setState({ fileList: list });
        } else {
          this.setState({ fileList: [] });
        }
      }
    });
  };
  render() {
    const {
      dispatch,
      type,
      edit,
      form: { getFieldDecorator, validateFields, getFieldValue, resetFields },
      pointInfo,
      projectSelectListAll,
      ParentId,
      spotItem
    } = this.props;
    const { fileList } = this.state;
    const pointItem = (type !== "add" && pointInfo && pointInfo) || {};

    const domUpload = (
      <div style={{ minHeight: fileList.length ? 120 : 0 }}>
        <Upload
          action={config.url.annexUploadUrl}
          headers={{ Authorization: `Bearer ${accessToken()}` }}
          data={{ Id: ParentId }}
          listType="picture-card"
          fileList={fileList}
          onSuccess={v => {
            this.setState({
              ParentId: v.result.id
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
              message: `附件上传失败：${response.error.message}`
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
          onRemove={file => {
            return new Promise((resolve, reject) => {
              if (edit) {
                dispatch({
                  type: "annex/annexDelete",
                  payload: {
                    FileId: file.uid,
                    Id: spotItem.attachment ? spotItem.attachment.id : ParentId
                  },
                  callback: success => {
                    if (success) {
                      resolve();
                    } else {
                      reject();
                    }
                  }
                });
              } else {
                reject();
                notification["info"]({
                  message: `请先开始编辑图斑`
                });
              }
            });
          }}
        >
          {edit || type === "add" ? (
            <div>
              <div className="ant-upload-text">
                <Button type="div" icon="plus">
                  上传文件
                </Button>
                <Button
                  icon="picture"
                  onClick={e => {
                    e.stopPropagation();
                    emitter.emit("screenshot", {
                      show: true
                    });
                  }}
                >
                  屏幕截图
                </Button>
              </div>
            </div>
          ) : null}
        </Upload>
      </div>
    );

    return (
      <div>
        <Form>
          <Form.Item label="标注点" {...formItemLayout}>
            {getFieldDecorator("name", {
              initialValue: pointItem.name
            })(<Input disabled={type === "edit" && !edit} />)}
          </Form.Item>
          <Form.Item
            label={
              <a
                onClick={() => {
                  console.log(pointItem, 1);
                  if (pointItem.project) {
                    emitter.emit("showProjectSpotInfo", {
                      show: true,
                      edit: type === "add",
                      from: "project",
                      state: type,
                      id: pointItem.project.id
                    });
                  } else {
                    notification["info"]({
                      message: `关联项目为空`
                    });
                  }
                }}
              >
                关联项目
              </a>
            }
            {...formItemLayout}
          >
            {getFieldDecorator("projectId", {
              initialValue: pointItem.project ? pointItem.project.id : ""
            })(
              <Select
                disabled={type === "edit" && !edit}
                showSearch
                style={{ width: 235 }}
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.props.children
                    .toLowerCase()
                    .indexOf(input.toLowerCase()) >= 0
                }
                onSearch={v => {
                  dispatch({
                    type: "spot/queryProjectSelect",
                    payload: {
                      ProjectName: v,
                      MaxResultCount: 5
                    }
                  });
                }}
              >
                {projectSelectListAll.map(item => (
                  <Select.Option value={item.value} key={item.value}>
                    {item.label}
                  </Select.Option>
                ))}
              </Select>
            )}
          </Form.Item>
          <Form.Item label="描述" {...formItemLayout}>
            {getFieldDecorator("description", {
              initialValue: pointItem.description
            })(
              <TextArea autosize={true} disabled={type === "edit" && !edit} />
            )}
          </Form.Item>
          <Form.Item label="坐标" {...formItemLayout}>
            {getFieldDecorator("pointX", {
              initialValue: pointItem.pointX
            })(
              <Input
                placeholder="经度"
                disabled={type === "edit" && !edit}
                style={{ width: 98 }}
              />
            )}
            {getFieldDecorator("pointY", {
              initialValue: pointItem.pointY
            })(
              <Input
                placeholder="纬度"
                disabled={type === "edit" && !edit}
                style={{ width: 135, position: "relative", top: -2 }}
                addonAfter={
                  <Icon
                    type="environment"
                    style={{
                      color: "#1890ff"
                    }}
                    onClick={
                      type === "edit" && !edit
                        ? null
                        : () => {
                            const x = getFieldValue("pointX");
                            const y = getFieldValue("pointY");
                            emitter.emit("siteLocation", {
                              state: "position",
                              Longitude: x,
                              Latitude: y,
                              type: "point"
                            });
                          }
                    }
                  />
                }
              />
            )}
          </Form.Item>
        </Form>
        {domUpload}
        {edit || type === "add" ? (
          <Button
            icon="check"
            style={{ marginTop: 20 }}
            onClick={() => {
              validateFields((err, v) => {
                console.log(v);
                dispatch({
                  type: "point/pointCreateUpdate",
                  payload: {
                    ...v,
                    attachmentId: ParentId,
                    id: type === "edit" ? pointItem.id : ""
                  },
                  callback: (success, response) => {
                    if (success) {
                      emitter.emit("projectCreateUpdateBack", {});
                      notification["success"]({
                        message: `${
                          type === "edit" ? "编辑" : "新建"
                        }标注点成功`
                      });
                      emitter.emit("deleteSuccess", {
                        success: true
                      });
                      emitter.emit("deleteDraw", {});
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
        ) : (
          <Button
            icon="delete"
            style={{
              display: type !== "add" ? "inherit" : "none",
              marginLeft: 20
            }}
            onClick={() => {
              Modal.confirm({
                title: "删除",
                content: "是否确定要删除这条标注点数据？",
                okText: "是",
                okType: "danger",
                cancelText: "否",
                onOk() {
                  resetFields();
                  dispatch({
                    type: "point/pointDelete",
                    payload: {
                      id: pointItem.id
                    },
                    callback: success => {
                      if (success) {
                        emitter.emit("deleteDraw", {});
                        emitter.emit("showSiderbarDetail", {
                          show: false
                        });
                        emitter.emit("deleteSuccess", {
                          success: true
                        });
                      }
                    }
                  });
                },
                onCancel() {}
              });
            }}
          >
            删除
          </Button>
        )}
      </div>
    );
  }
}
