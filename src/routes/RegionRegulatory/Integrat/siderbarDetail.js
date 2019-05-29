import React, { PureComponent } from "react";
import { createForm } from "rc-form";
import { connect } from "dva";
import moment from "moment";
import {
  Icon,
  message,
  Button,
  Input,
  Cascader,
  Select,
  Upload,
  notification,
  Modal,
  AutoComplete,
  Switch,
  TreeSelect,
  DatePicker,
  Form
} from "antd";
import locale from "antd/lib/date-picker/locale/zh_CN";
import emitter from "../../../utils/event";
import config from "../../../config";
import { getFile } from "../../../utils/util";
import jQuery from "jquery";
import { dateInitFormat, accessToken } from "../../../utils/util";

let self;
const { TextArea } = Input;
const dateFormat = "YYYY-MM-DD";
const formItemLayout = {
  labelCol: { span: 7 },
  wrapperCol: { span: 16 }
};

@connect(({ project, spot, point, user, annex, redLine }) => ({
  project,
  spot,
  point,
  user,
  annex,
  redLine
}))
@createForm()
export default class siderbarDetail extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      show: false,
      from: "spot",
      ParentId: 0,
      edit: false,
      polygon: "",
      isSpotUpdate: true,
      item: { project_id: "" },
      spotFileList: [],
      pointFileList: [],
      redLineFileList: []
    };
    this.map = null;
  }

  componentDidMount() {
    self = this;
    const {
      form: { resetFields }
    } = this.props;
    this.eventEmitter = emitter.addListener("siteLocationBack", data => {
      this.props.form.setFieldsValue({
        pointX: data.longitude, //经度
        pointY: data.latitude //维度
      });
    });
    this.eventEmitter = emitter.addListener("drawSpotBack", v => {
      this.setState({
        polygon: v.polygon
      });
      emitter.emit("showSiderbarDetail", {
        show: true,
        edit: true,
        from: "spot",
        type: v.state,
        id: ""
      });
    });
    this.eventEmitter = emitter.addListener("showSiderbarDetail", data => {
      console.log(data);
      resetFields();
      this.setState({
        show: data.show,
        edit: data.edit,
        projectId: data.projectId,
        isSpotUpdate: data.type === "edit",
        from: data.from, //spot  point
        item: data.item,
        type: data.type, //add  edit
        previewVisible_min: false
      });
      if (data.type !== "add" && data.id) {
        if (data.from === "spot") {
          this.querySpotById(data.id);
        } else if (data.from === "point") {
          this.queryPointById(data.id);
        } else if (data.from === "redLine") {
          this.queryRedLineById(data.id);
        }
      }
    });
    this.eventEmitter = emitter.addListener("showProjectSpotInfo", data => {
      console.log(data);
      if (data.from !== "project") {
        resetFields();
        this.setState({
          show: data.show,
          edit: data.edit,
          isSpotUpdate: data.type === "edit",
          from: data.from, //spot  point
          item: data.item,
          type: data.type, //add  edit
          previewVisible_min: false
        });
        if (data.show && data.type !== "add" && data.id) {
          if (data.from === "spot") {
            this.querySpotById(data.id);
          } else if (data.from === "point") {
            this.queryPointById(data.id);
          }
        }
      }
    });
  }

  querySpotById = id => {
    const { dispatch } = this.props;
    dispatch({
      type: "spot/querySpotById",
      payload: {
        id: id,
        refresh: true
      },
      callback: data => {
        this.setState({ ParentId: data.attachment ? data.attachment.id : 0 });
        if (data.attachment) {
          const list = data.attachment.child.map(item => {
            return {
              uid: item.id,
              name: item.fileName,
              status: "done",
              url: config.url.annexPreviewUrl + item.id
            };
          });
          this.setState({ spotFileList: list });
        } else {
          this.setState({ spotFileList: [] });
        }
      }
    });
  };

  queryPointById = id => {
    const { dispatch } = this.props;
    dispatch({
      type: "point/queryPointById",
      payload: {
        id: id
      },
      callback: data => {
        this.setState({ ParentId: data.attachment ? data.attachment.id : 0 });
        if (data.attachment) {
          const list = data.attachment.child.map(item => {
            return {
              uid: item.id,
              name: item.fileName,
              status: "done",
              url: config.url.annexPreviewUrl + item.id
            };
          });
          this.setState({ pointFileList: list });
        } else {
          this.setState({ pointFileList: [] });
        }
      }
    });
  };

  queryRedLineById = id => {
    const { dispatch } = this.props;
    dispatch({
      type: "redLine/queryredLineById",
      payload: {
        id: id
      },
      callback: data => {
        this.setState({ ParentId: data.attachment ? data.attachment.id : 0 });
        if (data.attachment) {
          const list = data.attachment.child.map(item => {
            return {
              uid: item.id,
              name: item.fileName,
              status: "done",
              url: config.url.annexPreviewUrl + item.id
            };
          });
          this.setState({ redLineFileList: list });
        } else {
          this.setState({ redLineFileList: [] });
        }
      }
    });
  };

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

  getDictKey = (value, type) => {
    const {
      user: { dicList }
    } = this.props;
    if (value) {
      const filter = dicList.filter(item => {
        return item.dictTypeName === type && item.value === value;
      });
      return filter.map(item => item.id).join(",");
    } else {
      return "";
    }
  };

  submit = isArchive => {
    const {
      dispatch,
      spot: { spotInfo }
    } = this.props;
    const { type, polygon, archiveTime, ParentId } = this.state;
    this.props.form.validateFields((err, v) => {
      if (!err) {
        console.log(v);
        dispatch({
          type: "spot/spotCreateUpdate",
          payload: {
            ...v,
            archiveTime: isArchive ? archiveTime : null,
            attachmentId: ParentId,
            polygon: polygon,
            // interferenceTypeId: this.getDictKey(
            //   v.interferenceTypeId,
            //   "扰动类型"
            // ),
            // interferenceComplianceId: this.getDictKey(
            //   v.interferenceComplianceId,
            //   "扰动合规性"
            // ),
            // interferenceVaryTypeId: this.getDictKey(
            //   v.interferenceVaryTypeId,
            //   "扰动变化类型"
            // ),
            // buildStatusId: this.getDictKey(v.buildStatusId, "建设状态"),
            districtCodeId: v.districtCodeId.length
              ? v.districtCodeId.pop()
              : "",
            id: type === "edit" ? spotInfo.id : ""
          },
          callback: (success, response) => {
            if (success) {
              emitter.emit("projectCreateUpdateBack", {});
              notification["success"]({
                message: `${type === "edit" ? "编辑" : "新建"}图斑成功`
              });
            }
          }
        });
      } else {
        notification["warning"]({
          message: err.mapNum.errors[0].message
        });
      }
    });
  };

  render() {
    const {
      dispatch,
      form: { getFieldDecorator, resetFields, validateFields },
      user: { districtList },
      spot: { spotInfo, projectSelectListSpot },
      point: { pointInfo, projectSelectListPoint },
      redLine: { redLineInfo, projectSelectListRedLine }
    } = this.props;
    const {
      show,
      from,
      polygon,
      ParentId,
      type,
      projectId,
      edit,
      spotFileList,
      redLineFileList,
      pointFileList,
      isSpotUpdate,
      previewVisible,
      previewImage,
      previewVisible_min
    } = this.state;

    const projectSelectListAll = [
      ...projectSelectListSpot,
      ...projectSelectListPoint,
      ...projectSelectListRedLine
    ];

    const spotItem = isSpotUpdate
      ? spotInfo
      : { mapNum: "", provinceCityDistrict: [null, null, null] };

    const pointItem = isSpotUpdate ? pointInfo : {};

    const redLineItem = isSpotUpdate ? redLineInfo : {};

    return (
      <div
        style={{
          left: show ? 350 : -4000,
          width: 400,
          backgroundColor: `#fff`,
          position: `absolute`,
          zIndex: 1000,
          borderLeft: `solid 1px #ddd`
        }}
      >
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
            this.setState({ show: !show, showDetail: false });
            // emitter.emit("showSiderbarDetail", {
            //   show: !show
            // });
          }}
        />
        <p
          style={{
            float: "right",
            position: "absolute",
            right: 25,
            top: 60,
            zIndex: 1
          }}
        >
          <Button
            icon={edit ? "rollback" : "edit"}
            shape="circle"
            style={{
              float: "right",
              color: "#1890ff"
            }}
            onClick={() => {
              if (edit) {
                if (from === "spot") {
                  Modal.confirm({
                    title: `确定放弃已绘制图斑和填写的图斑属性？`,
                    content: "",
                    onOk() {
                      self.setState({ show: false });
                    },
                    onCancel() {}
                  });
                } else {
                  this.setState({ edit: !edit });
                }
              } else {
                this.setState({ edit: !edit });
              }
            }}
          />
        </p>
        <div style={{ height: "100%", overflow: `auto`, padding: 23 }}>
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
            visible={previewVisible}
            footer={null}
            onCancel={() => {
              this.setState({ previewVisible: false });
            }}
          >
            <img alt="example" style={{ width: "100%" }} src={previewImage} />
          </Modal>
          <div
            style={{
              display: from === "redLine" ? "block" : "none"
            }}
          >
            <Form>
              <p>
                <b>防治责任范围</b>
              </p>
              <Form.Item label="设计阶段" {...formItemLayout}>
                {getFieldDecorator("designStageId", {
                  initialValue: redLineItem.designStageId
                })(
                  <Select
                    showSearch
                    allowClear
                    disabled={!edit}
                    optionFilterProp="children"
                  >
                    {this.dictList("设计阶段").map(item => (
                      <Select.Option value={item.id} key={item.id}>
                        {item.value}
                      </Select.Option>
                    ))}
                  </Select>
                )}
              </Form.Item>
              <Form.Item label="矢量化类型" {...formItemLayout}>
                {getFieldDecorator("vecTypeId", {
                  initialValue: redLineItem.vecTypeId
                })(
                  <Select
                    showSearch
                    allowClear
                    disabled={!edit}
                    optionFilterProp="children"
                  >
                    {this.dictList("矢量化类型").map(item => (
                      <Select.Option value={item.id} key={item.id}>
                        {item.value}
                      </Select.Option>
                    ))}
                  </Select>
                )}
              </Form.Item>
              <Form.Item label="面积" {...formItemLayout}>
                {getFieldDecorator("area", {
                  initialValue: redLineItem.area
                })(<Input addonAfter="㎡" disabled={!edit} />)}
              </Form.Item>
              <Form.Item label="组成部分" {...formItemLayout}>
                {getFieldDecorator("consPart", {
                  initialValue: redLineItem.consPart
                })(<Input disabled={!edit} />)}
              </Form.Item>
              <Form.Item label="上图单位" {...formItemLayout}>
                {getFieldDecorator("upmapDepartment", {
                  initialValue: redLineItem.upmapDepartment
                    ? redLineItem.upmapDepartment.id
                    : ""
                })(
                  <Select
                    disabled={!edit}
                    showSearch
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
            </Form>
            <div style={{ minHeight: redLineFileList.length ? 120 : 0 }}>
              <Upload
                action={config.url.annexUploadUrl}
                headers={{ Authorization: `Bearer ${accessToken()}` }}
                data={{ Id: ParentId }}
                listType="picture-card"
                fileList={redLineFileList}
                onSuccess={v => {
                  if (v.success) {
                    console.log(v.result);
                    this.setState({ ParentId: v.result.id });
                  } else {
                    notification["error"]({
                      message: `项目红线附件上传失败：${v.error.message}`
                    });
                  }
                }}
                onPreview={file => {
                  this.setState({
                    previewImage: file.url || file.thumbUrl,
                    previewVisible_min: true
                  });
                  getFile(file.url);
                }}
                onChange={({ fileList }) => {
                  const data = fileList.map(item => {
                    return {
                      ...item,
                      status: "done"
                    };
                  });
                  this.setState({ redLineFileList: data });
                }}
                onRemove={file => {
                  return new Promise((resolve, reject) => {
                    if (edit) {
                      dispatch({
                        type: "annex/annexDelete",
                        payload: {
                          FileId: file.uid,
                          Id: redLineItem.attachment.id
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
                        message: `请先开始编辑项目红线`
                      });
                    }
                  });
                }}
              >
                {edit ? (
                  <div>
                    <Icon type="plus" />
                    <div className="ant-upload-text">上传</div>
                  </div>
                ) : null}
              </Upload>
            </div>
            {edit ? (
              <span>
                <Button
                  htmlType="submit"
                  icon="check"
                  style={{ marginTop: 20 }}
                  onClick={() => {
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
                            resetFields();
                            emitter.emit("projectInfoRefresh", {
                              projectId: projectId
                            });
                            notification["success"]({
                              message: `${
                                type === "edit" ? "编辑" : "新建"
                              }项目红线成功`
                            });
                          }
                        }
                      });
                    });
                  }}
                >
                  保存
                </Button>
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
              </span>
            ) : null}
          </div>
          <div
            style={{
              display: from === "spot" ? "block" : "none"
            }}
          >
            <Form>
              <Form.Item label="图斑编号" {...formItemLayout} hasFeedback>
                {getFieldDecorator("mapNum", {
                  initialValue: spotItem.mapNum,
                  rules: [{ required: true, message: "图斑编号不能为空" }]
                })(<Input disabled={!edit} />)}
              </Form.Item>
              <Form.Item
                label={
                  <a
                    onClick={() => {
                      if (spotItem.projectName) {
                        emitter.emit("showProjectSpotInfo", {
                          show: true,
                          edit: type === "add",
                          from: "project",
                          state: type,
                          id: spotItem.projectId
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
                  initialValue: spotItem.projectId
                })(
                  <Select
                    disabled={!edit}
                    showSearch
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
              <Form.Item label="扰动类型" {...formItemLayout}>
                {getFieldDecorator("interferenceTypeId", {
                  initialValue: spotItem.interferenceTypeId
                })(
                  <Select
                    showSearch
                    allowClear
                    disabled={!edit}
                    optionFilterProp="children"
                  >
                    {this.dictList("扰动类型").map(item => (
                      <Select.Option value={item.id} key={item.id}>
                        {item.value}
                      </Select.Option>
                    ))}
                  </Select>
                )}
              </Form.Item>
              <Form.Item label="扰动面积" {...formItemLayout}>
                {getFieldDecorator("interferenceArea", {
                  initialValue: spotItem.interferenceArea
                })(<Input disabled={!edit} addonAfter="公顷" />)}
              </Form.Item>
              <Form.Item label="扰动超出面积" {...formItemLayout}>
                {getFieldDecorator("overAreaOfRes", {
                  initialValue: spotItem.overAreaOfRes
                })(<Input disabled={!edit} addonAfter="公顷" />)}
              </Form.Item>
              <Form.Item label="扰动合规性" {...formItemLayout}>
                {getFieldDecorator("interferenceComplianceId", {
                  initialValue: spotItem.interferenceComplianceId
                })(
                  <Select
                    showSearch
                    allowClear
                    disabled={!edit}
                    optionFilterProp="children"
                  >
                    {this.dictList("扰动合规性").map(item => (
                      <Select.Option value={item.id} key={item.id}>
                        {item.value}
                      </Select.Option>
                    ))}
                  </Select>
                )}
              </Form.Item>
              <Form.Item label="扰动变化类型" {...formItemLayout}>
                {getFieldDecorator("interferenceVaryTypeId", {
                  initialValue: spotItem.interferenceVaryTypeId
                })(
                  <Select
                    showSearch
                    allowClear
                    disabled={!edit}
                    optionFilterProp="children"
                  >
                    {this.dictList("扰动变化类型").map(item => (
                      <Select.Option value={item.id} key={item.id}>
                        {item.value}
                      </Select.Option>
                    ))}
                  </Select>
                )}
              </Form.Item>
              <Form.Item label="建设状态" {...formItemLayout}>
                {getFieldDecorator("buildStatusId", {
                  initialValue: spotItem.buildStatusId
                })(
                  <Select
                    showSearch
                    allowClear
                    disabled={!edit}
                    optionFilterProp="children"
                  >
                    {this.dictList("建设状态").map(item => (
                      <Select.Option value={item.id} key={item.id}>
                        {item.value}
                      </Select.Option>
                    ))}
                  </Select>
                )}
              </Form.Item>
              <Form.Item label="是否复核" {...formItemLayout}>
                {getFieldDecorator("isReview", {
                  valuePropName: "checked",
                  initialValue: spotItem.isReview ? true : false
                })(<Switch disabled={!edit} />)}
              </Form.Item>
              <Form.Item label="所在地区" {...formItemLayout}>
                {getFieldDecorator("districtCodeId", {
                  initialValue: spotItem.provinceCityDistrict
                })(
                  <Cascader
                    disabled={!edit}
                    placeholder="请选择所在地区"
                    options={districtList}
                    changeOnSelect
                  />
                )}
              </Form.Item>
              <Form.Item label="详细地址" {...formItemLayout}>
                {getFieldDecorator("addressInfo", {
                  initialValue: spotItem.addressInfo
                })(<Input disabled={!edit} />)}
              </Form.Item>
              <Form.Item label="问题" {...formItemLayout}>
                {getFieldDecorator("problem", {
                  initialValue: spotItem.problem
                })(<TextArea autosize={true} disabled={!edit} />)}
              </Form.Item>
              <Form.Item label="建议" {...formItemLayout}>
                {getFieldDecorator("proposal", {
                  initialValue: spotItem.proposal
                })(<TextArea autosize={true} disabled={!edit} />)}
              </Form.Item>
              <Form.Item label="备注" {...formItemLayout}>
                {getFieldDecorator("description", {
                  initialValue: spotItem.description
                })(<TextArea autosize={true} disabled={!edit} />)}
              </Form.Item>
            </Form>
            <div style={{ minHeight: spotFileList.length ? 120 : 0 }}>
              <Upload
                action={config.url.annexUploadUrl}
                headers={{ Authorization: `Bearer ${accessToken()}` }}
                data={{ Id: ParentId }}
                listType="picture-card"
                fileList={spotFileList}
                onSuccess={v => {
                  if (v.success) {
                    console.log(v.result);
                    this.setState({ ParentId: v.result.id });
                  } else {
                    notification["error"]({
                      message: `图斑附件上传失败：${v.error.message}`
                    });
                  }
                }}
                onPreview={file => {
                  this.setState({
                    previewImage: file.url || file.thumbUrl,
                    previewVisible_min: true
                  });
                  getFile(file.url);
                }}
                onChange={({ fileList }) => {
                  const data = fileList.map(item => {
                    return {
                      ...item,
                      status: "done"
                    };
                  });
                  this.setState({ spotFileList: data });
                }}
                onRemove={file => {
                  return new Promise((resolve, reject) => {
                    if (edit) {
                      dispatch({
                        type: "annex/annexDelete",
                        payload: {
                          FileId: file.uid,
                          Id: spotItem.attachment.id
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
                {edit ? (
                  <div>
                    <Icon type="plus" />
                    <div className="ant-upload-text">上传</div>
                  </div>
                ) : null}
              </Upload>
            </div>
            {edit ? (
              <span>
                <Button
                  icon="check"
                  style={{ marginTop: 20 }}
                  onClick={() => {
                    this.submit(false);
                  }}
                >
                  保存
                </Button>
                <Button
                  icon="check-circle"
                  style={{
                    display: type !== "add" ? "inherit" : "none",
                    marginLeft: 20
                  }}
                  onClick={() => {
                    Modal.confirm({
                      title: "归档保存",
                      content: (
                        <span>
                          归档时间：
                          <DatePicker
                            locale={locale}
                            onChange={(date, dateString) => {
                              console.log(date, dateString);
                              this.setState({ archiveTime: dateString });
                            }}
                          />
                        </span>
                      ),
                      onOk() {
                        const { archiveTime } = self.state;
                        console.log(archiveTime);
                        if (archiveTime) {
                          self.submit(true);
                        } else {
                          notification["warning"]({
                            message: `请选择归档时间`
                          });
                        }
                      },
                      onCancel() {}
                    });
                  }}
                >
                  归档保存
                </Button>
                <Button
                  icon="delete"
                  style={{
                    display: type !== "add" ? "inherit" : "none",
                    marginLeft: 20
                  }}
                  onClick={() => {
                    Modal.confirm({
                      title: "删除",
                      content: "是否确定要删除这条图斑数据？",
                      okText: "是",
                      okType: "danger",
                      cancelText: "否",
                      onOk() {
                        dispatch({
                          type: "spot/spotDelete",
                          payload: {
                            id: spotItem.id
                          },
                          callback: success => {
                            if (success) {
                              self.setState({ show: false });
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
              </span>
            ) : (
              <div>
                <Button icon="swap" style={{ marginTop: 20 }}>
                  历史查看
                </Button>
                <Button icon="cloud-download" style={{ marginLeft: 20 }}>
                  数据归档
                </Button>
                <Button icon="rollback" style={{ marginTop: 20 }}>
                  撤销归档
                </Button>
              </div>
            )}
          </div>
          <div
            style={{
              display: from === "point" ? "block" : "none"
            }}
          >
            <Form>
              <Form.Item label="标注点" {...formItemLayout}>
                {getFieldDecorator("name", {
                  initialValue: pointItem.name
                })(<Input disabled={!edit} />)}
              </Form.Item>
              {/* <Form.Item label="标注时间" {...formItemLayout}>
                {getFieldDecorator("createTime", {
                  initialValue: moment(pointItem.createTime, dateFormat)
                })(<DatePicker disabled={!edit} showTime />)}
              </Form.Item> */}
              <Form.Item
                label={
                  <a
                    onClick={() => {
                      if (pointItem.projectName) {
                        emitter.emit("showProjectSpotInfo", {
                          show: true,
                          edit: type === "add",
                          from: "project",
                          state: type,
                          id: pointItem.projectId
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
                    disabled={!edit}
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
                })(<TextArea autosize={true} disabled={!edit} />)}
              </Form.Item>
              <Form.Item label="坐标" {...formItemLayout}>
                {getFieldDecorator("pointX", {
                  initialValue: pointItem.pointX
                })(
                  <Input
                    placeholder="经度"
                    disabled={!edit}
                    style={{ width: 98 }}
                  />
                )}
                {getFieldDecorator("pointY", {
                  initialValue: pointItem.pointY
                })(
                  <Input
                    placeholder="纬度"
                    disabled={!edit}
                    style={{ width: 135, position: "relative", top: -2 }}
                    addonAfter={
                      <Icon
                        type="environment"
                        style={{
                          color: "#1890ff"
                        }}
                        onClick={() => {
                          emitter.emit("showProjectDetail", {
                            show: false,
                            edit: false
                          });
                          this.props.form.validateFields((err, values) => {
                            emitter.emit("siteLocation", {
                              state:
                                values.pointX && values.pointY
                                  ? "end"
                                  : "begin",
                              Longitude: values.pointX,
                              Latitude: values.pointY
                            });
                          });
                        }}
                      />
                    }
                  />
                )}
              </Form.Item>
            </Form>
            <div style={{ minHeight: pointFileList.length ? 120 : 0 }}>
              <Upload
                action={config.url.annexUploadUrl}
                headers={{ Authorization: `Bearer ${accessToken()}` }}
                data={{ Id: ParentId }}
                listType="picture-card"
                fileList={pointFileList}
                onSuccess={v => {
                  if (v.success) {
                    this.setState({ ParentId: v.result.id });
                  } else {
                    notification["error"]({
                      message: `标注点附件上传失败：${v.error.message}`
                    });
                  }
                }}
                onPreview={file => {
                  this.setState({
                    previewImage: file.url || file.thumbUrl,
                    previewVisible_min: true
                  });
                  getFile(file.url);
                }}
                onChange={({ fileList }) => {
                  const data = fileList.map(item => {
                    return {
                      ...item,
                      status: "done"
                    };
                  });
                  this.setState({ pointFileList: data });
                }}
                onRemove={file => {
                  return new Promise((resolve, reject) => {
                    if (edit) {
                      dispatch({
                        type: "annex/annexDelete",
                        payload: {
                          FileId: file.uid,
                          Id: pointItem.attachment.id
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
                        message: `请先开始编辑标注点`
                      });
                    }
                  });
                }}
              >
                {edit ? (
                  <div>
                    <Icon type="plus" />
                    <div className="ant-upload-text">上传</div>
                  </div>
                ) : null}
              </Upload>
            </div>
            {edit ? (
              <span>
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
                          }
                        }
                      });
                    });
                  }}
                >
                  保存
                </Button>
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
                              self.setState({ show: false });
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
              </span>
            ) : null}
          </div>
        </div>
      </div>
    );
  }
}
