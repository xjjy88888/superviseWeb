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
import "leaflet/dist/leaflet.css";
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

@connect(({ project, spot, point, user, annex }) => ({
  project,
  spot,
  point,
  user,
  annex
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
      spotFileList: []
    };
    this.map = null;
  }

  componentDidMount() {
    const {
      form: { resetFields }
    } = this.props;
    self = this;
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
      if (data.type === "add") {
        resetFields();
      }
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
          this.queryPointSiteById(data.id);
        }
      }
    });
    this.eventEmitter = emitter.addListener("showProjectSpotInfo", data => {
      console.log(data);
      if (data.from === "spot") {
        this.setState({
          show: data.show,
          edit: data.edit
        });
        this.querySpotById(data.id);
      }
    });
  }

  querySpotById = id => {
    const { dispatch } = this.props;
    dispatch({
      type: "spot/querySpotById",
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
      }
    });
  };

  queryPointSiteById = id => {
    const { dispatch } = this.props;
    dispatch({
      type: "point/queryPointSiteById",
      payload: {
        id: id
      }
    });
  };

  getDictList = type => {
    const {
      user: { dicList }
    } = this.props;
    if (type) {
      const filter = dicList.filter(item => {
        return item.dictTypeName === type;
      });
      return filter.map(item => item.value);
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
      spot: { spotInfo, projectSelectList }
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
            interferenceTypeId: this.getDictKey(
              v.interferenceTypeId,
              "扰动类型"
            ),
            interferenceComplianceId: this.getDictKey(
              v.interferenceComplianceId,
              "扰动合规性"
            ),
            interferenceVaryTypeId: this.getDictKey(
              v.interferenceVaryTypeId,
              "扰动变化类型"
            ),
            buildStatusId: this.getDictKey(v.buildStatusId, "建设状态"),
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
      spot: { spotInfo, projectSelectList },
      point: { pointItem, pointSite }
    } = this.props;
    const {
      show,
      from,
      polygon,
      ParentId,
      type,
      edit,
      fileList,
      spotFileList,
      isSpotUpdate,
      previewVisible,
      previewImage,
      previewVisible_min
    } = this.state;

    const spotItem = isSpotUpdate
      ? spotInfo
      : { mapNum: "", provinceCityDistrict: [null, null, null] };

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
              this.setState({ edit: !edit });
              if (edit) {
                validateFields((err, v) => {
                  if (!err) {
                    console.log("图斑信息", v);
                  }
                });
              } else {
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
              display: from === "duty" ? "block" : "none"
            }}
          >
            <Form>
              <p>
                <b>防治责任范围</b>
              </p>
              <Form.Item label="矢量化类型" {...formItemLayout}>
                <Input defaultValue={`矢量化类型`} disabled={!edit} />
              </Form.Item>
              <Form.Item label="面积" {...formItemLayout}>
                <Input disabled={!edit} addonAfter="公顷" />
              </Form.Item>
              <Form.Item label="组成部分" {...formItemLayout}>
                <Input defaultValue={`矢量化类型`} disabled={!edit} />
              </Form.Item>
              <Form.Item label="上图单位" {...formItemLayout}>
                <Input defaultValue={`矢量化类型`} disabled={!edit} />
              </Form.Item>
            </Form>
            <Upload
              style={{ width: 200 }}
              action="//jsonplaceholder.typicode.com/posts/"
              listType="picture-card"
              fileList={fileList}
              onPreview={file => {
                this.setState({
                  previewImage: file.url || file.thumbUrl,
                  previewVisible_min: true
                });
                getFile(file.url);
              }}
              onChange={({ fileList }) => this.setState({ fileList })}
            >
              {edit ? (
                <div>
                  <Icon type="plus" />
                  <div className="ant-upload-text">上传</div>
                </div>
              ) : null}
            </Upload>
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
                    style={{ width: 220 }}
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
                    {projectSelectList.map(item => (
                      <Select.Option value={item.value} key={item.value}>
                        {item.label}
                      </Select.Option>
                    ))}
                  </Select>
                )}
              </Form.Item>
              <Form.Item label="扰动类型" {...formItemLayout}>
                {getFieldDecorator("interferenceTypeId", {
                  initialValue: spotItem.interferenceType
                })(
                  <AutoComplete
                    placeholder="请选择扰动类型"
                    disabled={!edit}
                    dataSource={this.getDictList("扰动类型")}
                    filterOption={(inputValue, option) =>
                      option.props.children
                        .toUpperCase()
                        .indexOf(inputValue.toUpperCase()) !== -1
                    }
                  />
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
                  initialValue: spotItem.interferenceCompliance
                })(
                  <AutoComplete
                    placeholder="请选择扰动合规性"
                    disabled={!edit}
                    dataSource={this.getDictList("扰动合规性")}
                    filterOption={(inputValue, option) =>
                      option.props.children
                        .toUpperCase()
                        .indexOf(inputValue.toUpperCase()) !== -1
                    }
                  />
                )}
              </Form.Item>
              <Form.Item label="扰动变化类型" {...formItemLayout}>
                {getFieldDecorator("interferenceVaryTypeId", {
                  initialValue: spotItem.interferenceVaryType
                })(
                  <AutoComplete
                    placeholder="请选择扰动变化类型"
                    disabled={!edit}
                    dataSource={this.getDictList("扰动变化类型")}
                    filterOption={(inputValue, option) =>
                      option.props.children
                        .toUpperCase()
                        .indexOf(inputValue.toUpperCase()) !== -1
                    }
                  />
                )}
              </Form.Item>
              <Form.Item label="建设状态" {...formItemLayout}>
                {getFieldDecorator("buildStatusId", {
                  initialValue: spotItem.buildStatus
                })(
                  <AutoComplete
                    placeholder="请选择建设状态"
                    disabled={!edit}
                    dataSource={this.getDictList("建设状态")}
                    filterOption={(inputValue, option) =>
                      option.props.children
                        .toUpperCase()
                        .indexOf(inputValue.toUpperCase()) !== -1
                    }
                  />
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
                      message: `附件上传失败：${v.error.message}`
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
                  console.log({
                    FileId: file.uid,
                    Id: spotItem.attachment.id
                  });
                  return new Promise((resolve, reject) => {
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
                      }
                    }}
                  >
                    关联项目
                  </a>
                }
                {...formItemLayout}
              >
                {getFieldDecorator("projectId", {
                  initialValue: pointItem.projectId
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
                    {projectSelectList.map(item => (
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
            <Upload
              style={{ width: 200 }}
              action="//jsonplaceholder.typicode.com/posts/"
              listType="picture-card"
              fileList={fileList}
              onPreview={file => {
                this.setState({
                  previewImage: file.url || file.thumbUrl,
                  previewVisible_min: true
                });
                getFile(file.url);
              }}
              onChange={({ fileList }) => this.setState({ fileList })}
            >
              {edit ? (
                <div>
                  <Icon type="plus" />
                  <div className="ant-upload-text">上传</div>
                </div>
              ) : null}
            </Upload>
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
                  style={{ marginLeft: 20 }}
                  onClick={() => {
                    Modal.confirm({
                      title: "删除",
                      content: "是否确定要删除这条标注点数据？",
                      okText: "是",
                      okType: "danger",
                      cancelText: "否",
                      onOk() {
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
