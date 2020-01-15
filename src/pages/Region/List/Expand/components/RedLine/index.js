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
let self;
@createForm()
@connect(({ project, redLine, annex, user }) => ({
  ...project,
  ...redLine,
  ...annex,
  ...user
}))
export default class RedLine extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      ParentId: 0,
      fileList: []
    };
  }
  componentDidMount() {
    self = this;
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

  queryRedLineById = id => {
    this.queryDetail(id, "redLine/queryredLineById");
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
          this.setState({ fileList: list });
        } else {
          this.setState({ fileList: [] });
        }
      }
    });
  };
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
  dictList = type => {
    const { dictList } = this.props;
    if (type) {
      return dictList.filter(item => {
        return item.dictTypeName === type;
      });
    } else {
      return [];
    }
  };

  getDictKey = (value, type) => {
    const { dictList } = this.props;
    if (value) {
      const filter = dictList.filter(item => {
        return item.dictTypeName === type && item.dictTableValue === value;
      });
      return filter.map(item => item.id).join(",");
    } else {
      return "";
    }
  };
  render() {
    const {
      dispatch,
      type,
      edit,
      form: { getFieldDecorator, validateFields, getFieldValue, resetFields },
      ParentId,
      redLineInfo,
      departSelectListAll,
      polygon,
      projectId,
      spotItem
    } = this.props;
    const { fileList } = this.state;
    const redLineItem = redLineInfo;

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
          <p>
            <b>防治责任范围</b>
          </p>
          <Form.Item label="设计阶段" {...formItemLayout}>
            {getFieldDecorator("designStageId", {
              initialValue: redLineItem.designStage
                ? redLineItem.designStage.id
                : ""
            })(
              <Select
                showSearch
                allowClear={true}
                disabled={type === "edit" && !edit}
                optionFilterProp="children"
              >
                {this.dictList("设计阶段").map(item => (
                  <Select.Option value={item.id} key={item.id}>
                    {item.dictTableValue}
                  </Select.Option>
                ))}
              </Select>
            )}
          </Form.Item>
          <Form.Item
            label={
              <span>
                <b style={{ color: "red" }}>*</b>
                矢量化类型
              </span>
            }
            {...formItemLayout}
          >
            {getFieldDecorator("vecTypeId", {
              initialValue: redLineItem.vecType ? redLineItem.vecType.id : ""
            })(
              <Select
                showSearch
                allowClear={true}
                disabled={type === "edit" && !edit}
                optionFilterProp="children"
              >
                {this.dictList("矢量化类型").map(item => (
                  <Select.Option value={item.id} key={item.id}>
                    {item.dictTableValue}
                  </Select.Option>
                ))}
              </Select>
            )}
          </Form.Item>
          <Form.Item label="面积" {...formItemLayout}>
            {getFieldDecorator("area", {
              initialValue: redLineItem.area
            })(<Input addonAfter="公顷" disabled={type === "edit" && !edit} />)}
          </Form.Item>
          <Form.Item label="组成部分" {...formItemLayout}>
            {getFieldDecorator("consPart", {
              initialValue: redLineItem.consPart
            })(<Input disabled={type === "edit" && !edit} />)}
          </Form.Item>
          <Form.Item label="上图单位" {...formItemLayout}>
            {getFieldDecorator("upmapDepartmentId", {
              initialValue: redLineItem.upmapDepartment
                ? redLineItem.upmapDepartment.id
                : ""
            })(
              <Select
                disabled={type === "edit" && !edit}
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.props.children
                    .toLowerCase()
                    .indexOf(input.toLowerCase()) >= 0
                }
                onSearch={v => {
                  dispatch({
                    type: "project/departList",
                    payload: {
                      name: v,
                      kind: 2
                    }
                  });
                }}
              >
                {departSelectListAll.map(item => (
                  <Select.Option value={item.value} key={item.value}>
                    {item.label}
                  </Select.Option>
                ))}
              </Select>
            )}
          </Form.Item>
        </Form>
        {domUpload}
        {edit || type === "add" ? (
          <Button
            htmlType="submit"
            icon="check"
            style={{ marginTop: 20 }}
            onClick={() => {
              const vecTypeId = getFieldValue("vecTypeId");
              if (!vecTypeId) {
                notification["warning"]({
                  message: "矢量化类型不能为空"
                });
                return;
              }
              validateFields((err, v) => {
                console.log("项目红线信息", v);
                dispatch({
                  type: "redLine/redLineCreateUpdate",
                  payload: {
                    ...v,
                    attachmentId: ParentId,
                    polygon: polygon,
                    projectId: projectId,
                    id: type === "edit" ? redLineInfo.id : ""
                  },
                  callback: (success, response) => {
                    if (success) {
                      this.setState({ show: false });
                      resetFields();
                      emitter.emit("projectInfoRefresh", {
                        projectId: projectId
                      });
                      notification["success"]({
                        message: `${
                          type === "edit" ? "编辑" : "新建"
                        }项目红线成功`
                      });
                      emitter.emit("deleteDraw", {});
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
                content: "是否确定要删除这条项目红线数据？",
                okText: "是",
                okType: "danger",
                cancelText: "否",
                onOk() {
                  dispatch({
                    type: "redLine/redLineDelete",
                    payload: {
                      id: redLineItem.id
                    },
                    callback: success => {
                      if (success) {
                        emitter.emit("deleteDraw", {});
                        self.setState({ show: false });
                        emitter.emit("projectInfoRefresh", {
                          projectId: projectId
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
