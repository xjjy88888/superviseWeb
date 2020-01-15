import React, { PureComponent } from "react";
import {
  Icon,
  Button,
  Input,
  Cascader,
  Select,
  Upload,
  notification,
  Modal,
  DatePicker,
  Form,
  Collapse,
  Tag,
  List
} from "antd";
import { connect } from "dva";
import { createForm } from "rc-form";
import moment from "moment";
import locale from "antd/lib/date-picker/locale/zh_CN";

import config from "@/config";
import emitter from "../../../../../../utils/event";
import {
  getFile,
  accessToken,
  dateFormat,
  photoFormat
} from "../../../../../../utils/util";

const { TextArea } = Input;
const { Panel } = Collapse;

const formItemLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 }
};
let yearList = [];
let self;

@createForm()
@connect(({ spot, district, user, annex }) => ({
  ...spot,
  ...district,
  ...user,
  ...annex
}))
export default class Spot extends PureComponent {
  constructor(props) {
    super(props);
    console.log("props===========", props);
    this.state = {
      loading: false,
      fileList: [],
      archiveTime: "",
      archiveTimeSpot: "",
      showSpotReview: false,
      spotReviewId: null,
      spotReviewPhotoList: [],
      spotHistoryId: "",
      polygon: props.polygon
    };
  }
  componentDidUpdate(prevProps, prevState) {
    const { type, currentFromId } = this.props;
    if (
      prevProps.currentFromId !== "" &&
      currentFromId !== prevProps.currentFromId &&
      type === "edit"
    ) {
      this.querySpotById(currentFromId);
    }
  }
  componentDidMount() {
    self = this;
    const {
      type,
      currentFromId,
      projectId,
      form: { setFieldsValue, resetFields }
    } = this.props;
    const year = new Date().getFullYear();
    if (projectId) {
      setFieldsValue({ projectIdSpot: projectId });
    }
    for (let i = 2015; i <= year; i++) {
      yearList.push(i);
    }
    if (type !== "add" && currentFromId) {
      this.querySpotById(currentFromId);
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
  domUpload = fileListKey => {
    const { dispatch } = this.props;
    const { ParentId } = this.state;
    const photoList = this.state[fileListKey];
    return (
      <Upload
        action={config.url.annexUploadUrl}
        headers={{ Authorization: `Bearer ${accessToken()}` }}
        data={{ Id: ParentId }}
        listType="picture-card"
        fileList={photoList}
        onSuccess={v => {
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
            ParentId: v.result.id,
            [fileListKey]: [...photoList, obj]
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
          this.setState({ [fileListKey]: data });
        }}
        onRemove={file => {
          return new Promise((resolve, reject) => {
            dispatch({
              type: "annex/annexDelete",
              payload: {
                FileId: file.uid,
                Id: ParentId
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
        <div className="ant-upload-text">
          <Button type="div" icon="plus">
            上传文件
          </Button>
        </div>
      </Upload>
    );
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
  querySpotById = (id, isHistory) => {
    const { dispatch } = this.props;
    this.queryDetail(id, "spot/querySpotById");
    if (!isHistory) {
      this.setState({ spotHistoryId: id });
      dispatch({
        type: "spot/spotHistory",
        payload: { id: id }
      });
    }
  };
  spotReviewCreateUpdate = payload => {
    const { dispatch, spotInfo } = this.props;
    this.setState({ loading: true });
    dispatch({
      type: "spot/spotReviewCreateUpdate",
      payload,
      callback: success => {
        this.setState({ loading: false });
        if (success) {
          this.setState({ showSpotReview: false });
          this.querySpotById(spotInfo.id);
        }
      }
    });
  };

  spotReviewDelete = payload => {
    const { dispatch, spotInfo } = this.props;
    this.setState({ loading: true });
    dispatch({
      type: "spot/spotReviewDelete",
      payload,
      callback: success => {
        this.setState({ loading: false });
        if (success) {
          this.setState({ showSpotReview: false });
          this.querySpotById(spotInfo.id);
        }
      }
    });
  };

  spotReviewCreateUpdate = payload => {
    const { dispatch, spotInfo } = this.props;
    this.setState({ loading: true });
    dispatch({
      type: "spot/spotReviewCreateUpdate",
      payload,
      callback: success => {
        this.setState({ loading: false });
        if (success) {
          this.setState({ showSpotReview: false });
          this.querySpotById(spotInfo.id);
        }
      }
    });
  };
  find = (arr, v, key) => {
    let result;
    if (!arr) {
      return;
    }
    arr.map(item => {
      if (item.value === v) {
        result = [item[key]];
      } else {
        const child = this.find(item.children, v, key);
        if (child) {
          result = [item[key], ...child];
        }
      }
    });
    return result;
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
  submit = isArchive => {
    const {
      dispatch,
      type,
      spotInfo,
      form: { resetFields }
    } = this.props;
    const { polygon, archiveTime, ParentId, fromList, projectId } = this.state;
    console.log(this.state);
    this.props.form.validateFields((err, v) => {
      if (!err) {
        console.log("spotCreateUpdate=============", v);
        dispatch({
          type: "spot/spotCreateUpdate",
          payload: {
            ...v,
            projectId: v.projectIdSpot,
            archiveTime: isArchive ? archiveTime : null,
            attachmentId: ParentId,
            polygon: polygon,
            districtCodeId:
              v.districtCodeId && v.districtCodeId.length
                ? v.districtCodeId.pop()
                : "",
            id: type === "edit" ? spotInfo.id : "",
            interBatch:
              String(v.interBatch1 || ``) + String(v.interBatch2 || ``),
            taskLevel: isNaN(v.taskLevel) ? null : v.taskLevel,
            description: v.description_spot
          },
          callback: success => {
            emitter.emit("deleteDraw", {});
            if (success) {
              notification["success"]({
                message: `${type === "edit" ? "编辑" : "新建"}图斑成功`
              });

              if (fromList) {
                emitter.emit("deleteSuccess", {
                  success: true
                });
              } else {
                resetFields();
                emitter.emit("projectInfoRefresh", {
                  projectId: projectId
                });
              }
              emitter.emit("showSiderbarDetail", {
                show: false
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
      districtTree,
      type,
      edit,
      form: { getFieldDecorator, validateFields, resetFields, setFieldsValue },
      projectSelectListAll,
      ParentId,
      // spotItem,
      querySpotById,
      relateProject,
      spotInfo,
      spotHistoryList,
      fromList,
      projectId,
      mapLocation
    } = this.props;
    const {
      archiveTime,
      showSpotReview,
      spotReviewId,
      archiveTimeSpot,
      spotHistoryId,
      fileList
    } = this.state;
    const spotItem =
      type === "edit"
        ? spotInfo
        : {
            mapNum: "",
            provinceCityDistrict: [null, null, null],
            spotReviews: []
          };
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
          {edit ? (
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
        <Form
          style={{
            marginBottom: 20
          }}
        >
          <Collapse defaultActiveKey={["1"]}>
            <Panel header={<b>基本信息</b>} key="1">
              <Form.Item
                label={
                  <span>
                    <b style={{ color: "red" }}>*</b>
                    图斑编号
                  </span>
                }
                {...formItemLayout}
                hasFeedback
              >
                {getFieldDecorator("mapNum", {
                  initialValue: spotItem.mapNum,
                  rules: [{ required: true, message: "图斑编号不能为空" }]
                })(<Input disabled={type === "edit" && !edit} />)}
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
                {getFieldDecorator("projectIdSpot", {
                  initialValue: spotItem.projectId
                })(
                  <Select
                    allowClear={true}
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
                        type: "spot/queryProjectSelect",
                        payload: {
                          ProjectName: v,
                          MaxResultCount: 5
                        }
                      });
                    }}
                  >
                    {(relateProject
                      ? relateProject.concat(projectSelectListAll)
                      : projectSelectListAll
                    ).map(item => (
                      <Select.Option value={item.value} key={item.value}>
                        {item.label}
                      </Select.Option>
                    ))}
                  </Select>
                )}
              </Form.Item>
              <Form.Item label="所在地区" {...formItemLayout}>
                {getFieldDecorator("districtCodeId", {
                  initialValue: this.find(
                    districtTree,
                    String(spotItem.districtCodeId),
                    "value"
                  )
                })(
                  <Cascader
                    disabled={type === "edit" && !edit}
                    placeholder="请选择所在地区"
                    options={districtTree}
                    changeOnSelect
                  />
                )}
              </Form.Item>
              <Form.Item label="详细地址" {...formItemLayout}>
                {getFieldDecorator("addressInfo", {
                  initialValue: spotItem.addressInfo
                })(<Input disabled={type === "edit" && !edit} />)}
              </Form.Item>
              <Form.Item label="扰动面积" {...formItemLayout}>
                {getFieldDecorator("interferenceArea", {
                  initialValue: spotItem.interferenceArea
                })(
                  <Input
                    disabled={type === "edit" && !edit}
                    addonAfter="公顷"
                  />
                )}
              </Form.Item>
              <Form.Item label="扰动超出面积" {...formItemLayout}>
                {getFieldDecorator("overAreaOfRes", {
                  initialValue: spotItem.overAreaOfRes
                })(
                  <Input
                    disabled={type === "edit" && !edit}
                    addonAfter="公顷"
                  />
                )}
              </Form.Item>
              <Form.Item label="备注" {...formItemLayout}>
                {getFieldDecorator("description_spot", {
                  initialValue: spotItem.description
                })(
                  <TextArea
                    autosize={true}
                    disabled={type === "edit" && !edit}
                  />
                )}
              </Form.Item>
              <Form.Item label="问题" {...formItemLayout}>
                {getFieldDecorator("problem", {
                  initialValue: spotItem.problem
                })(
                  <TextArea
                    autosize={true}
                    disabled={type === "edit" && !edit}
                  />
                )}
              </Form.Item>
              <Form.Item label="建议" {...formItemLayout}>
                {getFieldDecorator("proposal", {
                  initialValue: spotItem.proposal
                })(
                  <TextArea
                    autosize={true}
                    disabled={type === "edit" && !edit}
                  />
                )}
              </Form.Item>
            </Panel>
            <Panel header={<b>解译信息</b>} key="2">
              <Form.Item label="解译期次" {...formItemLayout}>
                <Input.Group compact>
                  {getFieldDecorator("interBatch1", {
                    initialValue: spotItem.interBatch
                      ? String(spotItem.interBatch).slice(0, 4)
                      : ""
                  })(
                    <Select
                      allowClear={true}
                      disabled={type === "edit" && !edit}
                      style={{ width: 80 }}
                    >
                      {yearList.map(i => (
                        <Select.Option value={String(i)} key={i}>
                          {i}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                  {getFieldDecorator("interBatch2", {
                    initialValue: spotItem.interBatch
                      ? String(spotItem.interBatch).slice(4)
                      : ""
                  })(
                    <Select
                      allowClear={true}
                      disabled={type === "edit" && !edit}
                      style={{ width: 80 }}
                    >
                      {[
                        "01",
                        "02",
                        "03",
                        "04",
                        "05",
                        "06",
                        "07",
                        "08",
                        "09",
                        "10",
                        "11",
                        "12"
                      ].map(i => (
                        <Select.Option value={i} key={i}>
                          {i}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                </Input.Group>
              </Form.Item>
              <Form.Item label="任务级别" {...formItemLayout}>
                {getFieldDecorator("taskLevel", {
                  initialValue: spotItem.taskLevel
                })(
                  <Select
                    showSearch
                    allowClear={true}
                    disabled={type === "edit" && !edit}
                    optionFilterProp="children"
                  >
                    {[
                      {
                        label: "部级",
                        value: 0
                      },
                      {
                        label: "省级",
                        value: 1
                      },
                      {
                        label: "市级",
                        value: 2
                      },
                      {
                        label: "县级",
                        value: 3
                      }
                    ].map(item => (
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
                    allowClear={true}
                    disabled={type === "edit" && !edit}
                    optionFilterProp="children"
                  >
                    {this.dictList("扰动类型").map(item => (
                      <Select.Option value={item.id} key={item.id}>
                        {item.dictTableValue}
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
                    allowClear={true}
                    disabled={type === "edit" && !edit}
                    optionFilterProp="children"
                  >
                    {this.dictList("扰动变化类型").map(item => (
                      <Select.Option value={item.id} key={item.id}>
                        {item.dictTableValue}
                      </Select.Option>
                    ))}
                  </Select>
                )}
              </Form.Item>
              <Form.Item label="扰动合规性" {...formItemLayout}>
                {getFieldDecorator("interferenceComplianceId", {
                  initialValue: spotItem.interferenceComplianceId
                })(
                  <Select
                    showSearch
                    allowClear={true}
                    disabled={type === "edit" && !edit}
                    optionFilterProp="children"
                  >
                    {this.dictList("扰动合规性").map(item => (
                      <Select.Option value={item.id} key={item.id}>
                        {item.dictTableValue}
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
                    allowClear={true}
                    disabled={type === "edit" && !edit}
                    optionFilterProp="children"
                  >
                    {this.dictList("建设状态").map(item => (
                      <Select.Option value={item.id} key={item.id}>
                        {item.dictTableValue}
                      </Select.Option>
                    ))}
                  </Select>
                )}
              </Form.Item>
            </Panel>
            <Panel
              header={
                <b>
                  复核信息：
                  {spotItem &&
                    spotItem.spotReviews &&
                    spotItem.spotReviews.length}
                  <Icon
                    type="plus"
                    style={{
                      marginLeft: 20,
                      fontSize: 16,
                      color: "#1890ff"
                    }}
                    onClick={e => {
                      e.stopPropagation();
                      this.setState({
                        showSpotReview: true,
                        spotReviewId: null,
                        spotReviewPhotoList: [],
                        ParentId: 0
                      });
                      resetFields();
                      setFieldsValue({
                        reviewTime: moment(new Date())
                      });
                    }}
                  />
                  <Icon
                    type="check"
                    style={{
                      display: showSpotReview ? "inline-block" : "none",
                      marginLeft: 20,
                      fontSize: 16,
                      color: "#1890ff"
                    }}
                    onClick={e => {
                      e.stopPropagation();
                      this.setState({ showSpotReview: true, edit: true });
                      validateFields((error, v) => {
                        console.log("图斑复核编辑", v);
                        const data = {
                          id: spotReviewId,
                          spotId: spotInfo.id,
                          interferenceTypeId: v.review_interferenceTypeId,
                          interferenceVaryTypeId:
                            v.review_interferenceVaryTypeId,
                          interferenceComplianceId:
                            v.review_interferenceComplianceId,
                          buildStatusId: v.review_buildStatusId,
                          reviewTime: dateFormat(v.reviewTime),
                          reviewDepartment: v.reviewDepartment,
                          photoId: ParentId
                        };
                        this.spotReviewCreateUpdate(data);
                      });
                    }}
                  />
                </b>
              }
              key="3"
            >
              <List
                size="small"
                bordered
                dataSource={
                  (spotItem && spotItem.spotReviews && spotItem.spotReviews) ||
                  []
                }
                renderItem={(item, index) => (
                  <List.Item
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      this.setState({
                        showSpotReview: true,
                        spotReviewId: item.id,
                        ParentId: item.photo ? item.photo.id : 0,
                        spotReviewPhotoList: photoFormat(item.photo)
                      });
                      setFieldsValue({
                        review_interferenceTypeId: item.interferenceTypeId,
                        review_interferenceVaryTypeId:
                          item.interferenceVaryTypeId,
                        review_interferenceComplianceId:
                          item.interferenceComplianceId,
                        review_buildStatusId: item.buildStatusId,
                        reviewTime: item.reviewTime
                          ? moment(item.reviewTime)
                          : "",
                        reviewDepartment: item.reviewDepartment
                      });
                    }}
                  >
                    {index + 1}、<Tag color="cyan">{item.reviewTime}</Tag>
                    {item.reviewDepartment}
                    <Icon
                      type="delete"
                      style={{
                        marginLeft: 20,
                        fontSize: 16,
                        color: "#1890ff"
                      }}
                      onClick={e => {
                        e.stopPropagation();
                        Modal.confirm({
                          title: "删除",
                          content: "确定要删除这条图斑复核吗？",
                          okText: "确定",
                          cancelText: "取消",
                          okType: "danger",
                          onOk: () => this.spotReviewDelete(item.id)
                        });
                      }}
                    />
                  </List.Item>
                )}
              />
              <div
                style={{
                  display: showSpotReview ? "block" : "none",
                  marginTop: 20
                }}
              >
                <Form.Item label="扰动类型" {...formItemLayout}>
                  {getFieldDecorator("review_interferenceTypeId")(
                    <Select
                      showSearch
                      allowClear={true}
                      optionFilterProp="children"
                    >
                      {this.dictList("扰动类型").map(item => (
                        <Select.Option value={item.id} key={item.id}>
                          {item.dictTableValue}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
                <Form.Item label="扰动变化类型" {...formItemLayout}>
                  {getFieldDecorator("review_interferenceVaryTypeId")(
                    <Select
                      showSearch
                      allowClear={true}
                      optionFilterProp="children"
                    >
                      {this.dictList("扰动变化类型").map(item => (
                        <Select.Option value={item.id} key={item.id}>
                          {item.dictTableValue}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
                <Form.Item label="扰动合规性" {...formItemLayout}>
                  {getFieldDecorator("review_interferenceComplianceId")(
                    <Select
                      showSearch
                      allowClear={true}
                      optionFilterProp="children"
                    >
                      {this.dictList("扰动合规性").map(item => (
                        <Select.Option value={item.id} key={item.id}>
                          {item.dictTableValue}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
                <Form.Item label="建设状态" {...formItemLayout}>
                  {getFieldDecorator("review_buildStatusId")(
                    <Select
                      showSearch
                      allowClear={true}
                      optionFilterProp="children"
                    >
                      {this.dictList("建设状态").map(item => (
                        <Select.Option value={item.id} key={item.id}>
                          {item.dictTableValue}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
                <Form.Item label="复核日期" {...formItemLayout}>
                  {getFieldDecorator("reviewTime")(<DatePicker />)}
                </Form.Item>
                <Form.Item label="复核单位" {...formItemLayout}>
                  {getFieldDecorator("reviewDepartment")(<Input allowClear />)}
                </Form.Item>
                {this.domUpload("spotReviewPhotoList")}
              </div>
            </Panel>
            <Panel header={<b>历史查看：{spotHistoryList.length}</b>} key="4">
              <List
                size="small"
                bordered
                dataSource={spotHistoryList}
                renderItem={(item, index) => (
                  <List.Item
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      querySpotById(item.id, true);
                    }}
                  >
                    {index + 1}、<Tag color="cyan">{item.archiveTime}</Tag>
                    {item.mapNum}
                    <Icon
                      type="environment"
                      style={{
                        fontSize: 16,
                        cursor: "point",
                        color: "#1890ff",
                        position: "absolute",
                        top: 11,
                        right: 10
                      }}
                      onClick={e => {
                        e.stopPropagation();
                        mapLocation({
                          item: item,
                          key: "spot"
                        });
                      }}
                    />
                  </List.Item>
                )}
              />
              <div
                style={{
                  display: showSpotReview ? "block" : "none",
                  marginTop: 20
                }}
              >
                <Form.Item label="扰动类型" {...formItemLayout}>
                  {getFieldDecorator("review_interferenceTypeId")(
                    <Select
                      showSearch
                      allowClear={true}
                      optionFilterProp="children"
                    >
                      {this.dictList("扰动类型").map(item => (
                        <Select.Option value={item.id} key={item.id}>
                          {item.dictTableValue}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
                <Form.Item label="扰动变化类型" {...formItemLayout}>
                  {getFieldDecorator("review_interferenceVaryTypeId")(
                    <Select
                      showSearch
                      allowClear={true}
                      optionFilterProp="children"
                    >
                      {this.dictList("扰动变化类型").map(item => (
                        <Select.Option value={item.id} key={item.id}>
                          {item.dictTableValue}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
                <Form.Item label="扰动合规性" {...formItemLayout}>
                  {getFieldDecorator("review_interferenceComplianceId")(
                    <Select
                      showSearch
                      allowClear={true}
                      optionFilterProp="children"
                    >
                      {this.dictList("扰动合规性").map(item => (
                        <Select.Option value={item.id} key={item.id}>
                          {item.dictTableValue}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
                <Form.Item label="建设状态" {...formItemLayout}>
                  {getFieldDecorator("review_buildStatusId")(
                    <Select
                      showSearch
                      allowClear={true}
                      optionFilterProp="children"
                    >
                      {this.dictList("建设状态").map(item => (
                        <Select.Option value={item.id} key={item.id}>
                          {item.dictTableValue}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
                <Form.Item label="复核日期" {...formItemLayout}>
                  {getFieldDecorator("reviewTime")(<DatePicker />)}
                </Form.Item>
                <Form.Item label="复核单位" {...formItemLayout}>
                  {getFieldDecorator("reviewDepartment")(<Input allowClear />)}
                </Form.Item>
                {this.domUpload("spotReviewPhotoList")}
              </div>
            </Panel>
          </Collapse>
        </Form>
        {domUpload}
        {edit || type === "add" ? (
          <span>
            <Button
              icon="check"
              style={{
                display: !spotItem.isArchive ? "inline-block" : "none",
                marginTop: 20
              }}
              onClick={() => {
                this.submit(false);
              }}
            >
              保存
            </Button>
            <Button
              icon="check-circle"
              style={{
                display:
                  type !== "add" && !spotItem.isArchive ? "inherit" : "none",
                marginLeft: 20
              }}
              onClick={() => {
                this.props.form.validateFields((err, v) => {
                  if (err) {
                    notification["warning"]({
                      message: err.mapNum.errors[0].message
                    });
                  } else {
                    this.setState({ archiveTime: "" });
                    console.log("spotItem", spotItem);
                    Modal.confirm({
                      title: "归档保存",
                      content: (
                        <div>
                          {spotItem.archiveTimes.map((item, index) => (
                            <p key={index} style={{ margin: "5px 0" }}>
                              {item}
                            </p>
                          ))}
                          <p>
                            <span>归档时间：</span>
                            <DatePicker
                              locale={locale}
                              onChange={(date, dateString) => {
                                console.log(date, dateString);
                                this.setState({ archiveTime: dateString });
                              }}
                            />
                          </p>
                        </div>
                      ),
                      onOk() {
                        return new Promise((resolve, reject) => {
                          if (archiveTime) {
                            const t = spotItem.archiveTimes;
                            console.log(archiveTime, spotItem.archiveTimes[0]);
                            if (
                              t.length &&
                              new Date(archiveTime).getTime() <=
                                new Date(spotItem.archiveTimes[0]).getTime()
                            ) {
                              notification["warning"]({
                                message: `归档时间早于该图斑上次归档时间，用户重新选择时间`
                              });
                              reject();
                            } else {
                              this.submit(true);
                              resolve();
                            }
                          } else {
                            notification["warning"]({
                              message: `请选择归档时间`
                            });
                            reject();
                          }
                        });
                      },
                      onCancel() {}
                    });
                  }
                });
              }}
            >
              归档保存
            </Button>
          </span>
        ) : (
          <span>
            <Button
              icon="play-square"
              style={{ marginRight: 15 }}
              onClick={() => {
                if (spotHistoryList.length > 0) {
                  emitter.emit("showHistoryPlay", {
                    show: true,
                    hisPlayURL:
                      "./timelinejs/spaceTimeSpot.html?spotHistoryId=" +
                      spotHistoryId
                  });
                  localStorage.setItem(
                    "spotHistoryList",
                    JSON.stringify(spotHistoryList.concat([spotInfo]))
                  );
                } else {
                  notification["warning"]({
                    message: `当前图斑没有图斑归档历史数据`
                  });
                }
              }}
            >
              历史播放
            </Button>
            <Button
              icon="cloud-download"
              style={{
                display:
                  type !== "add" && !spotItem.isArchive
                    ? "inline-block"
                    : "none",
                marginTop: 20
              }}
              onClick={() => {
                this.setState({ archiveTimeSpot: "" });
                Modal.confirm({
                  title: "图斑归档",
                  content: (
                    <span>
                      归档时间：
                      <DatePicker
                        locale={locale}
                        onChange={(date, dateString) => {
                          this.setState({ archiveTimeSpot: dateString });
                        }}
                      />
                    </span>
                  ),
                  onOk() {
                    const { archiveTimeSpot } = self.state;
                    return new Promise((resolve, reject) => {
                      if (archiveTimeSpot) {
                        resolve();
                        dispatch({
                          type: "spot/spotArchive",
                          payload: {
                            id: spotItem.id,
                            ArchiveTime: archiveTimeSpot
                          },
                          callback: success => {
                            if (success) {
                              emitter.emit("showSiderbarDetail", {
                                show: false
                              });
                              emitter.emit("deleteSuccess", {});
                            }
                          }
                        });
                      } else {
                        notification["warning"]({
                          message: `请选择归档时间`
                        });
                        reject();
                      }
                    });
                  },
                  onCancel() {}
                });
              }}
            >
              图斑归档
            </Button>
            <Button
              icon="rollback"
              style={{
                display:
                  type !== "add" && spotItem.isArchive
                    ? "inline-block"
                    : "none",
                marginTop: 20
              }}
              onClick={() => {
                dispatch({
                  type: "spot/spotUnArchive",
                  payload: {
                    id: spotItem.id
                  },
                  callback: success => {
                    if (success) {
                      // self.setState({ show: false });
                      emitter.emit("deleteSuccess", {});
                    }
                  }
                });
              }}
            >
              撤销归档
            </Button>
            <Button
              icon="delete"
              style={{
                display:
                  type !== "add" && !spotItem.isArchive
                    ? "inline-block"
                    : "none",
                marginLeft: 15
              }}
              onClick={() => {
                Modal.confirm({
                  title: "删除",
                  content:
                    "将删除该图斑的图形、属性及附件信息，直接删除将不保存该图斑的历史版本，是否确定删除？",
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
                          emitter.emit("showSiderbarDetail", {
                            show: false
                          });
                          emitter.emit("deleteDraw", {});
                          if (fromList) {
                            emitter.emit("deleteSuccess", {
                              success: true
                            });
                          } else {
                            emitter.emit("projectInfoRefresh", {
                              projectId: projectId
                            });
                          }
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
            <Button
              icon="retweet"
              style={{
                marginTop: 20
              }}
              onClick={() => {
                dispatch({
                  type: "spot/spotOldImg",
                  payload: {
                    id: spotItem.id
                  },
                  callback: (success, error, result) => {
                    notification[success ? "success" : "error"]({
                      message: `同步旧系统附件${success ? "成功" : "失败"}${
                        success ? "" : `：${error.message}`
                      }`
                    });
                    if (success) {
                      querySpotById(spotItem.id);
                    }
                  }
                });
              }}
            >
              同步旧系统附件
            </Button>
          </span>
        )}
      </div>
    );
  }
}
