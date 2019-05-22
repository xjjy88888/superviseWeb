import React, { PureComponent } from "react";
import { createForm } from "rc-form";
import { connect } from "dva";
import moment from "moment";
import {
  Icon,
  Button,
  Input,
  Cascader,
  Upload,
  Modal,
  AutoComplete,
  DatePicker,
  Form
} from "antd";
import locale from "antd/lib/date-picker/locale/zh_CN";
import emitter from "../../../utils/event";
import "leaflet/dist/leaflet.css";
import config from "../../../config";
import { getFile } from "../../../utils/util";
import jQuery from "jquery";

let self;
const { TextArea } = Input;
const dateFormat = "YYYY-MM-DD";
const formItemLayout = {
  labelCol: { span: 7 },
  wrapperCol: { span: 16 }
};

@connect(({ project, spot, point, user }) => ({
  project,
  spot,
  point,
  user
}))
@createForm()
export default class siderbarDetail extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      show: false,
      from: "spot",
      edit: false,
      item: { project_id: "" },
      fileList: [
        {
          uid: "-1",
          name: "xxx.png",
          status: "done",
          url: "./img/logo2.jpg"
        },
        {
          uid: "-2",
          name: "xxx.png",
          status: "done",
          url: "./img/spot.jpg"
        },
        {
          uid: "-3",
          name: "xxx.png",
          status: "done",
          url: "./img/spot.jpg"
        }
      ]
    };
    this.map = null;
  }

  componentDidMount() {
    self = this;
    this.eventEmitter = emitter.addListener("siteLocationBack", data => {
      this.props.form.setFieldsValue({
        latitude: data.latitude,
        longitude: data.longitude
      });
    });
    this.eventEmitter = emitter.addListener("showSiderbarDetail", data => {
      this.setState({
        show: data.show,
        edit: data.edit,
        from: data.from,
        item: data.item,
        type: data.type,
        previewVisible_min: false
      });
      if (data.show && data.type !== "add") {
        this.props.form.resetFields();
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

  render() {
    const {
      dispatch,
      form: { getFieldDecorator },
      spot: { spotItem },
      point: { pointItem, pointSite },
      user: { districtList }
    } = this.props;
    const {
      show,
      from,
      edit,
      fileList,
      previewVisible,
      previewImage,
      previewVisible_min
    } = this.state;
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
            emitter.emit("showSiderbarDetail", {
              show: !show
            });
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
                this.props.form.validateFields((err, v) => {
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
              <Form.Item label="图斑编号" {...formItemLayout}>
                {getFieldDecorator("mapNum", {
                  initialValue: spotItem.mapNum
                })(<Input disabled={!edit} />)}
              </Form.Item>
              <Form.Item label="关联项目" {...formItemLayout}>
                {getFieldDecorator("projectName", {
                  initialValue: spotItem.projectName
                })(
                  <Input
                    disabled={!edit}
                    addonAfter={
                      <Icon
                        type="link"
                        style={{
                          color: "#1890ff"
                        }}
                        onClick={() => {
                          emitter.emit("showProjectSpotInfo", {
                            show: true,
                            edit: false,
                            from: "project",
                            id: spotItem.projectId
                          });
                        }}
                      />
                    }
                  />
                )}
              </Form.Item>
              <Form.Item label="扰动类型" {...formItemLayout}>
                {getFieldDecorator("qtype", {
                  initialValue: spotItem.qtype
                })(
                  <AutoComplete
                    placeholder="请选择扰动类型"
                    disabled={!edit}
                    dataSource={config.disturb_type}
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
                {getFieldDecorator("interferenceCompliance", {
                  initialValue: spotItem.interferenceCompliance
                })(
                  <AutoComplete
                    placeholder="请选择扰动合规性"
                    disabled={!edit}
                    dataSource={config.compliance}
                    filterOption={(inputValue, option) =>
                      option.props.children
                        .toUpperCase()
                        .indexOf(inputValue.toUpperCase()) !== -1
                    }
                  />
                )}
              </Form.Item>
              <Form.Item label="扰动变化类型" {...formItemLayout}>
                {getFieldDecorator("interferenceVaryType", {
                  initialValue: spotItem.interferenceVaryType
                })(
                  <AutoComplete
                    placeholder="请选择扰动变化类型"
                    disabled={!edit}
                    dataSource={config.disturb_change_type}
                    filterOption={(inputValue, option) =>
                      option.props.children
                        .toUpperCase()
                        .indexOf(inputValue.toUpperCase()) !== -1
                    }
                  />
                )}
              </Form.Item>
              <Form.Item label="建设状态" {...formItemLayout}>
                {getFieldDecorator("buildStatus", {
                  initialValue: spotItem.buildStatus
                })(
                  <AutoComplete
                    placeholder="请选择建设状态"
                    disabled={!edit}
                    dataSource={config.construct_state}
                    filterOption={(inputValue, option) =>
                      option.props.children
                        .toUpperCase()
                        .indexOf(inputValue.toUpperCase()) !== -1
                    }
                  />
                )}
              </Form.Item>
              <Form.Item label="复核状态" {...formItemLayout}>
                {getFieldDecorator("isReview", {
                  initialValue: spotItem.isReview ? "是" : "否"
                })(<Input disabled={!edit} />)}
              </Form.Item>
              <Form.Item label="所在地区" {...formItemLayout}>
                <Cascader
                  disabled={!edit}
                  placeholder="请选择所在地区"
                  options={districtList}
                  changeOnSelect
                />
              </Form.Item>
              <Form.Item label="详细地址" {...formItemLayout}>
                {getFieldDecorator("product_department_id1", {
                  initialValue: ""
                })(<Input />)}
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
                <Button icon="check" style={{ marginTop: 20 }}>
                  保存
                </Button>
                <Button
                  icon="check-circle"
                  style={{ marginLeft: 20 }}
                  onClick={() => {
                    Modal.confirm({
                      title: "归档保存",
                      content: (
                        <span>
                          归档时间：
                          <DatePicker locale={locale} />
                        </span>
                      ),
                      onOk() {},
                      onCancel() {}
                    });
                  }}
                >
                  归档保存
                </Button>
                <Button
                  icon="delete"
                  style={{ marginLeft: 20 }}
                  onClick={() => {
                    Modal.confirm({
                      title: "删除",
                      content: "是否确定要删除这条图斑数据？",
                      okText: "是",
                      okType: "danger",
                      cancelText: "否",
                      onOk() {
                        //delete
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
              <span>
                <Button icon="swap" style={{ marginTop: 20 }}>
                  历史查看
                </Button>
                <Button icon="cloud-download" style={{ marginLeft: 20 }}>
                  数据归档
                </Button>
                <Button icon="rollback" style={{ marginTop: 20 }}>
                  撤销归档
                </Button>
              </span>
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
                })(<Input allowClear disabled={!edit} />)}
              </Form.Item>
              <Form.Item label="标注时间" {...formItemLayout}>
                {getFieldDecorator("createTime", {
                  initialValue: moment(pointItem.createTime, dateFormat)
                })(<DatePicker disabled={!edit} showTime />)}
              </Form.Item>
              <Form.Item label="关联项目" {...formItemLayout}>
                {getFieldDecorator("project", {
                  initialValue: pointItem.project
                })(
                  <Input
                    allowClear
                    disabled={!edit}
                    addonAfter={
                      <Icon
                        type="link"
                        style={{
                          color: "#1890ff"
                        }}
                        onClick={() => {
                          emitter.emit("showProjectSpotInfo", {
                            show: true,
                            edit: false,
                            from: "project",
                            id: pointItem.projectId
                          });
                        }}
                      />
                    }
                  />
                )}
              </Form.Item>
              <Form.Item label="描述" {...formItemLayout}>
                {getFieldDecorator("description", {
                  initialValue: pointItem.description
                })(<TextArea autosize={true} disabled={!edit} />)}
              </Form.Item>
              <Form.Item label="坐标" {...formItemLayout}>
                {getFieldDecorator("longitude", {
                  initialValue: pointSite.pointX
                })(
                  <Input
                    allowClear
                    placeholder="经度"
                    disabled={!edit}
                    style={{ width: 90 }}
                  />
                )}
                {getFieldDecorator("latitude", {
                  initialValue: pointSite.pointY
                })(
                  <Input
                    allowClear
                    placeholder="纬度"
                    disabled={!edit}
                    style={{ width: 130, position: "relative", top: -2 }}
                    addonAfter={
                      <Icon
                        type="compass"
                        style={{
                          color: "#1890ff"
                        }}
                        onClick={() => {
                          emitter.emit("showProjectDetail", {
                            show: false,
                            edit: false
                          });
                          this.props.form.validateFields((err, values) => {
                            if (!err) {
                              emitter.emit("siteLocation", {
                                state:
                                  values.longitude && values.latitude
                                    ? "end"
                                    : "begin",
                                Latitude: values.latitude,
                                Longitude: values.longitude
                              });
                            }
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
                <Button icon="check" style={{ marginTop: 20 }}>
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
                        console.log("OK");
                      },
                      onCancel() {
                        console.log("Cancel");
                      }
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
