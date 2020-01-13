import React, { PureComponent } from "react";
import { connect } from "dva";
import { createForm } from "rc-form";
import jQuery from "jquery";
import {
  Menu,
  Icon,
  Tag,
  Tree,
  Button,
  Row,
  Col,
  notification,
  Popover,
  Input,
  Radio,
  List,
  Select,
  Upload,
  Modal,
  TreeSelect,
  Cascader,
  Form,
  Switch,
  DatePicker,
  AutoComplete,
  Table,
  Collapse,
  Typography,
  Tooltip
} from "antd";
import locale from "antd/lib/date-picker/locale/zh_CN";
import "leaflet/dist/leaflet.css";
import emitter from "../../../utils/event";

import config from "../../../config";
import { Link } from "dva/router";
import data from "../../../data";
import {
  dateFormat,
  dateInitFormat,
  accessToken,
  getFile,
  unique,
  getUrl
} from "../../../utils/util";
import Spins from "../../../components/Spins";
import styles from "./style/sidebar.less";

let self;
let loading = false;
const { TreeNode } = Tree;
const formItemLayout = {
  labelCol: { span: 7 },
  wrapperCol: { span: 16 }
};

@connect(
  ({
    project,
    spot,
    point,
    other,
    user,
    annex,
    redLine,
    district,
    inspect,
    problemPoint,
    panorama,
    projectSupervise,
    videoMonitor,
    commonModel
  }) => ({
    project,
    spot,
    point,
    other,
    user,
    annex,
    redLine,
    district,
    inspect,
    problemPoint,
    panorama,
    projectSupervise,
    videoMonitor,
    commonModel
  })
)
@createForm()
export default class siderbar extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      hover: false,
      place: "",
      show: false,
      showCreateDepart: false,
      value: undefined,
      projectEdit: false,
      showProjectAllInfo: false,
      showCompany: false,
      showProblem: false,
      showQuery: false,
      isArchivalSpot: false,
      showCheck: false,
      checked: false,
      ParentId: 0,
      showSpin: true,
      isProjectUpdate: true,
      queryHighlight: false,
      ShowArchive: false,
      row_pro: 20,
      row_spot: 20,
      row_point: 20,
      query_pro: "",
      query_spot: "",
      query_point: "",
      key: "project",
      createDepartKey: "",
      sort_by: "",
      sort_key: "",
      queryInfo: {},
      inputDisabled: true,
      select: [],
      departList: [],
      problem: { title: "", records: [] },
      placeholder: "项目名称",
      listData: [],
      previewVisible: false,
      previewImage: "",
      fileList: [],
      projectFileList: [],
      showPlan: false,
      clickId: null,
      isProjectSupervise: false,
      TaskLevelAndInterBatch: null
    };
    this.map = null;
  }

  componentDidMount() {
    const { link } = this.props;
    link(this);
    self = this;

    const urlFrom = getUrl(`from`);
    const urlId = getUrl(`id`);
    const urlIsProject = getUrl(`isProject`);
    if (urlFrom === `project` && urlId) {
      this.queryProjectById(urlId);
      this.queryProjectInfo(urlId);
    }
    if (urlFrom === `project` && urlIsProject === `true`) {
      this.setState({ isProjectSupervise: true });
    }
    this.queryDistrict();
    this.queryDict();
    this.queryBasinOrgan();
    this.eventEmitter = emitter.addListener("spotRelate", v => {
      const len = v.spotId.length;
      if (v.status === "end" && len !== 0) {
        console.log(v);
        if (len === 1) {
          if (v.spotId[0].projectId && v.spotId[0].projectId === v.projectId) {
            notification["warning"]({
              message: `该图斑已关联该项目`
            });
          } else if (v.spotId[0].projectId) {
            Modal.confirm({
              title: "关联图斑",
              content: "该图斑已关联项目，是否确定更改关联项目？",
              okText: "确定",
              okType: "danger",
              cancelText: "取消",
              onOk() {
                self.spotRelate(v.spotId[0].spotId, v.projectId);
              },
              onCancel() {}
            });
          } else {
            this.spotRelate(v.spotId[0].spotId, v.projectId);
          }
        } else {
          notification["warning"]({
            message: `每次只能关联1个图斑，请重新选择`
          });
        }
      }
    });
    this.eventEmitter = emitter.addListener("projectInfoRefresh", v => {
      if (v.projectId) {
        this.queryProjectById(v.projectId);
        this.queryProjectInfo(v.projectId);
      }
    });
    this.eventEmitter = emitter.addListener("showCreateDepart", v => {
      console.log(v);
      this.setState({
        showCreateDepart: v.show,
        createDepartKey: v.key
      });
    });
    this.eventEmitter = emitter.addListener("siteLocationBack", data => {
      this.props.form.setFieldsValue({
        pointX: data.longitude, //经度
        pointY: data.latitude //维度
      });
    });
    this.eventEmitter = emitter.addListener("hideProjectDetail", data => {
      this.setState({
        showProjectAllInfo: !data.hide
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

  componentDidUpdate(prevProps) {
    const {
      project: { queryParams },
      commonModel: {
        siderBarPageInfo: { currentProjectId, currentSpotId }
      }
    } = this.props;
    if (
      prevProps.commonModel.siderBarPageInfo.currentProjectId !==
        currentProjectId &&
      currentProjectId !== ""
      // &&
      // prevProps.commonModel.siderBarPageInfo.currentProjectId !== ""
    ) {
      this.setState({ clickId: currentProjectId });
      this.queryProjectById(currentProjectId);
      this.queryProjectInfo(currentProjectId);
    } else if (
      prevProps.commonModel.siderBarPageInfo.currentSpotId !== currentSpotId &&
      currentSpotId !== ""
      // &&
      // prevProps.commonModel.siderBarPageInfo.currentSpotId !== ""
    ) {
      emitter.emit("showSiderbarDetail", {
        show: true,
        from: "spot",
        id: currentSpotId,
        edit: false,
        fromList: true,
        type: "edit"
      });
      this.setState({ clickId: currentSpotId });
    }
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: "commonModel/save",
      payload: {
        siderBarPageInfo: {
          activeMenu: "",
          currentProjectId: "",
          currentSpotId: ""
        }
      }
    });
    if (this.scrollDom) {
      this.scrollDom.removeEventListener("scroll", () => {
        this.onScroll(this);
      });
    }
  }

  show = id => {
    console.log("显示项目详情", id);
    this.setState({
      show: true,
      projectEdit: false,
      isProjectUpdate: true,
      previewVisible_min_left: false,
      projectFileList: []
    });
    this.queryProjectById(id);
    this.queryProjectInfo(id);
  };

  hide = () => {
    const {
      showInspect,
      showVideoMonitor,
      hideExamine,
      commonModel: { siderBarPageInfo }
    } = this.props;

    emitter.emit("emptyPoint");
    emitter.emit("showSiderbarDetail", {
      show: false
    });
    emitter.emit("showQuery", {
      show: false
    });
    emitter.emit("showTool", {
      show: false,
      type: "control"
    });
    emitter.emit("showChart", {
      show: false
    });
    emitter.emit("checkResult", {
      show: false,
      result: []
    });
    emitter.emit("showProblemPoint", {
      show: false
    });
    emitter.emit("showMeasurePoint", {
      show: false
    });
    emitter.emit("showProjectInfo", {
      show: false,
      edit: false
    });
    showInspect({
      show: false
    });
    showVideoMonitor({
      show: false
    });
    hideExamine();
  };

  returnList = () => {
    const { showList } = this.props;
    this.hide();
    this.setState({
      show: false
    });
    showList();
  };

  refreshSpotList = () => {
    this.querySpot({ SkipCount: 0 });
  };

  queryProjectInfo = id => {
    this.querySpotByProjectId(id);
    this.queryRedLineList(id);
    this.inspectList(id);
    this.panoramaList(id);
    this.videoMonitorList(id);
  };

  annexUploadBase64 = v => {
    const { dispatch } = this.props;
    const { ParentId, projectFileList } = this.state;
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
          this.setState({ projectFileList: [...projectFileList, obj] });
        } else {
          notification["error"]({
            message: `屏幕截图上传失败：${error.message}`
          });
        }
      }
    });
  };

  spotRelate = (spotId, projectId) => {
    const { dispatch } = this.props;
    dispatch({
      type: "spot/spotCreateUpdate",
      payload: {
        id: spotId,
        projectId: projectId
      },
      callback: success => {
        if (success) {
          notification["success"]({
            message: `关联扰动图斑成功`
          });
          this.querySpotByProjectId(projectId);
        }
      }
    });
  };

  showSpin = state => {
    this.setState({ showSpin: state });
  };

  queryDistrict = () => {
    const { dispatch } = this.props;
    dispatch({
      type: "district/districtTree",
      payload: {
        IsFilter: false
      }
    });
    dispatch({
      type: "district/districtTree",
      payload: {
        IsFilter: true
      }
    });
  };

  queryDict = () => {
    const { dispatch } = this.props;
    dispatch({
      type: "user/queryDict"
    });
  };

  queryBasinOrgan = () => {
    const { dispatch } = this.props;
    dispatch({
      type: "user/basinOrgan"
    });
  };

  dataFormat = v => {
    // console.log("dataFormat开始", v);
    for (let i in v) {
      if (Array.isArray(v[i])) {
        if (i === "ReplyTime" && v[i].length) {
          v.ReplyTimeBegin = dateFormat(v[i][0]);
          v.ReplyTimeEnd = dateFormat(v[i][1]);
        }
        v[i] = v[i].join(",");
      }
    }
    v.SkipCount = v.SkipCount || 0;
    v.MaxResultCount = v.MaxResultCount || 20;
    // console.log("dataFormat结束", v);
  };

  queryProjectById = id => {
    const { dispatch } = this.props;
    const { departList } = this.state;
    this.showSpin(true);
    this.setState({ isProjectUpdate: false });
    dispatch({
      type: "project/queryProjectById",
      payload: {
        id: id,
        refresh: true
      },
      callback: (result, success) => {
        this.showSpin(false);
        let arr = [];
        if (result.productDepartment) {
          arr.push(result.productDepartment);
        }
        if (result.supDepartment) {
          arr.push(result.supDepartment);
        }
        if (result.replyDepartment) {
          arr.push(result.replyDepartment);
        }

        this.setState({
          isProjectUpdate: true,
          departList: [...departList, ...arr],
          ParentId: result.attachment ? result.attachment.id : 0,
          showPlan: result.isNeedPlan ? true : false
        });

        if (result.attachment) {
          const data = result.attachment.child.filter(i => !i.fileSource);
          const list = data.map(item => {
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
          this.setState({ projectFileList: list });
        } else {
          this.setState({ projectFileList: [] });
        }
      }
    });
  };

  querySpotByProjectId = id => {
    const { dispatch } = this.props;
    this.showSpin(true);
    dispatch({
      type: "spot/querySpotByProjectId",
      payload: {
        ProjectId: id,
        MaxResultCount: 1000,
        SkipCount: 0,
        ShowArchive: this.state.isArchivalSpot
      },
      callback: success => {
        this.showSpin(false);
      }
    });
  };

  queryRedLineList = id => {
    const { dispatch } = this.props;
    this.showSpin(true);
    dispatch({
      type: "redLine/queryRedLineList",
      payload: {
        ProjectId: id
      },
      callback: success => {
        this.showSpin(false);
      }
    });
  };

  inspectList = id => {
    const { dispatch } = this.props;
    dispatch({
      type: "inspect/inspectList",
      payload: {
        ProjectId: id
      }
    });
  };

  panoramaList = id => {
    const { dispatch } = this.props;
    dispatch({
      type: "panorama/panoramaList",
      payload: {
        projectId: id,
        MaxResultCount: 1000
      }
    });
  };

  videoMonitorList = id => {
    const { dispatch } = this.props;
    dispatch({
      type: "videoMonitor/videoMonitorList",
      payload: {
        projectId: id,
        MaxResultCount: 1000
      }
    });
  };
  // 鼠标进入事件
  onMouseEnter = (val, e) => {
    // console.log("e==============", e);
    this.setState({
      hover: true,
      place: val
    });
  };
  // 鼠标离开事件
  onMouseLeave = (val, e) => {
    // console.log("e==============", e);
    this.setState({
      hover: false,
      place: val
    });
  };
  TreeOnSelect = e => {
    if (e.length) {
      const isRoot = isNaN(e[0].slice(0, 1));
      this.setState({ showProblem: true });
      emitter.emit("showProblem", {
        show: true
      });
      this.setState({ previewVisible: false });
      if (!isRoot) {
        const item = data[e[0].slice(0, 1)].data[e[0].slice(1, 2)];
        this.setState({ problem: item });
      }
    }
  };

  toColor = v => {
    if (v === "一般") {
      return "green";
    } else if (v === "较重") {
      return "orange";
    } else {
      return "magenta";
    }
  };

  getDepartKey = value => {
    const { departList } = this.state;
    if (value) {
      const filter = departList.filter(item => {
        return value === item.name;
      });
      return filter[0].id;
    } else {
      return "";
    }
  };

  getDepartList = key => {
    const {
      dispatch,
      form: { setFieldsValue }
    } = this.props;
    const { departSearch } = this.state;

    // const isAdd = key !== "supDepartmentId" && key !== "replyDepartmentId";
    if (departSearch) {
      dispatch({
        type: "user/departVaild",
        payload: {
          name: departSearch
        },
        callback: (isVaild, data) => {
          if (isVaild) {
            this.setState({
              departList: [{ label: data.name, value: data.id }]
            });
            setFieldsValue({ [key]: data.id });
          } else {
            // Modal.confirm({
            //   title: `查不到该单位，${isAdd ? "是否去新建单位" : "请重新输入"}`,
            //   content: "",
            //   onOk() {
            //     if (isAdd) {
            //       self.setState({
            //         showCreateDepart: true,
            //         createDepartKey: key
            //       });
            //     }
            //     setFieldsValue({ [key]: "" });
            //   },
            //   onCancel() {}
            // });
          }
        }
      });
    }
  };

  getDictValue = id => {
    const {
      user: { dictList }
    } = this.props;
    if (id) {
      const filter = dictList.filter(item => {
        return item.id === id;
      });
      return filter.map(item => item.dictTableValue).join(",");
    } else {
      return "";
    }
  };

  dictList = type => {
    const {
      user: { dictList }
    } = this.props;
    if (type) {
      return dictList.filter(item => {
        return item.dictTypeName === type;
      });
    } else {
      return [];
    }
  };

  getDepart = (obj, key) => {
    if (obj) {
      return obj[key];
    } else {
      return "";
    }
  };

  //删除
  projectDelete = id => {
    const { dispatch } = this.props;
    dispatch({
      type: "project/projectDelete",
      payload: {
        id: id
      },
      callback: success => {
        if (success) {
          emitter.emit("deleteSuccess", {
            success: true
          });
          emitter.emit("showProjectInfo", {
            show: false,
            edit: false
          });
        }
      }
    });
  };

  find = (arr, v, key) => {
    let result;
    if (!arr) {
      return;
    }
    // eslint-disable-next-line array-callback-return
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

  queryDepartList = (v, t) => {
    const { dispatch } = this.props;
    dispatch({
      type: "project/departList",
      payload: {
        name: v,
        kind: t
      }
    });
  };
  // 点击图标，展示项目列表表格页
  async onShowProjectList() {
    const { showProjectList } = this.props;
    this.setState({ hover: false });

    await showProjectList();
  }

  render() {
    const {
      showList,
      showExamine,
      // showProjectList,
      switchData,
      mapLocation,
      switchInterpret,
      showInspect,
      videoMonitorLocation,
      showVideoMonitor,
      dispatch,
      form: { getFieldDecorator, resetFields, setFieldsValue, getFieldValue },
      district: { districtTree, districtTreeFilter },
      user: { basinOrganList },
      project: { projectList, projectInfo, projectListAdd, departSelectList },
      spot: { spotList, projectInfoSpotList, interpretList },
      point: { pointList },
      redLine: { redLineList },
      inspect: { inspectList },
      panorama: { panoramaList },
      projectSupervise: { projectSuperviseList },
      videoMonitor: { videoMonitorList }
      // showProjectTableList
    } = this.props;

    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user && user.userId ? user.userId : null;

    const {
      hover,
      place,
      show,
      showSpin,
      queryHighlight,
      previewVisible_min,
      previewVisible_min_left,
      query_pro,
      query_spot,
      ParentId,
      query_point,
      showCompany,
      placeholder,
      sort,
      showProjectInfo,
      isProjectUpdate,
      key,
      projectEdit,
      clientHeight,
      previewVisible,
      previewImage,
      showCreateDepart,
      showCheck,
      showProblem,
      createDepartKey,
      showProjectAllInfo,
      fileList,
      problem,
      queryInfo,
      isArchivalSpot,
      sort_by,
      ShowArchive,
      sort_key,
      projectFileList,
      departList,
      showPlan,
      clickId,
      isProjectSupervise,
      TaskLevelAndInterBatch
    } = this.state;

    const departSelectListAll = unique(departSelectList.concat(departList));

    const projectItem = isProjectUpdate
      ? projectInfo
      : {
          projectBase: {},
          productDepartment: { name: "", id: "" },
          expand: {
            designStartTime: "",
            designCompTime: "",
            actStartTime: "",
            actCompTime: ""
          }
        };

    return (
      <div
        id="ProjectInfo"
        style={{
          left: show ? 0 : -350,
          zIndex: 1002
        }}
        className={styles.siderbar}
        ref={e => (this.refDom = e)}
      >
        <div
          style={{
            overflow: "auto",
            padding: 20,
            height: "100%",
            backgroundColor: "#fff"
          }}
        >
          <div
            style={{
              display: showCompany ? "block" : "none",
              position: "relation"
            }}
          >
            <p
              style={{
                position: "absolute",
                top: 62,
                left: 256
              }}
            >
              <Button
                icon="close"
                shape="circle"
                style={{
                  float: "right",
                  color: "#1890ff",
                  fontSize: 18,
                  zIndex: 1
                }}
                onClick={() => {
                  this.setState({ showCompany: false });
                }}
              />
              <Button
                icon="check"
                shape="circle"
                style={{
                  float: "right",
                  color: "#1890ff",
                  fontSize: 18,
                  zIndex: 1
                }}
                onClick={() => {
                  this.setState({ showProblem: false });
                  emitter.emit("showProblem", {
                    show: false
                  });
                  notification["success"]({
                    message: "编辑成功"
                  });
                }}
              />
            </p>
            <Tree defaultExpandAll onSelect={this.TreeOnSelect}>
              {data.map((item, index) => (
                <TreeNode
                  title={
                    <b
                      style={{
                        color: index === 7 ? "red" : "#000"
                      }}
                    >
                      {item.title}
                    </b>
                  }
                  key={item.key}
                >
                  {item.data.map((ite, idx) => (
                    <TreeNode
                      title={
                        <span>
                          <span style={{ marginRight: 10 }}>{ite.title}</span>
                        </span>
                      }
                      key={`${index}${idx}`}
                    />
                  ))}
                </TreeNode>
              ))}
            </Tree>
            <div
              style={{
                display: showProblem ? "block" : "none",
                position: "absolute",
                top: 48,
                left: 350,
                width: 430,
                bottom: 0,
                background: "#fff"
              }}
            >
              <Icon
                type={"left"}
                style={{
                  top: "48%"
                }}
                className={styles["show-project-list"]}
                onClick={() => {
                  this.setState({ showProblem: false });
                  emitter.emit("showProblem", {
                    show: false
                  });
                }}
              />
              <Button
                icon="check"
                shape="circle"
                style={{
                  color: "#1890ff",
                  fontSize: 18,
                  position: "absolute",
                  right: 30,
                  top: 15,
                  zIndex: 1
                }}
                onClick={() => {
                  this.setState({ showProblem: false });
                  emitter.emit("showProblem", {
                    show: false
                  });
                  notification["success"]({
                    message: "编辑成功"
                  });
                }}
              />
              <div
                style={{
                  overflow: "auto",
                  padding: "20px 10px 20px 20px",
                  height: "100%"
                }}
              >
                <p>{problem.title}</p>
                <div
                  style={{
                    display: previewVisible_min ? "block" : "none",
                    position: "fixed",
                    zIndex: 1,
                    width: 380
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
                {problem.records.map((item, index) => (
                  <div style={{ padding: 5 }} key={index}>
                    <div>
                      <Tag color={this.toColor(item.sort)}>{item.sort}</Tag>
                      {item.record}
                    </div>
                    <div style={{ margin: 0 }}>
                      <Radio.Group name="radiogroup">
                        <Radio value={1}>是</Radio>
                        <Radio value={0}>否</Radio>
                      </Radio.Group>
                    </div>
                    <Collapse
                      bordered={false}
                      style={{ position: "relative", left: -18 }}
                      onChange={() =>
                        this.setState({ previewVisible_min: false })
                      }
                    >
                      <Collapse.Panel header="附件" key="8">
                        <Input.TextArea
                          autosize
                          placeholder="问题描述"
                          style={{ marginBottom: 10 }}
                        />
                        <Upload
                          action="//jsonplaceholder.typicode.com/posts/"
                          listType="picture-card"
                          fileList={fileList}
                          onPreview={file => {
                            switch (file.fileExtend) {
                              case "pdf":
                              case "doc":
                              case "docx":
                              case "ppt":
                              case "pptx":
                                window.open(file.url);
                                break;
                              default:
                                this.setState({
                                  previewImage: file.url || file.thumbUrl,
                                  previewVisible_min: true
                                });
                                getFile(file.url);
                                break;
                            }
                          }}
                          onChange={({ fileList }) =>
                            this.setState({ fileList })
                          }
                        >
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
                        </Upload>
                      </Collapse.Panel>
                    </Collapse>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div
            style={{
              display: showCompany ? "none" : "block"
            }}
          >
            <Spins show={showSpin} />
            <p
              style={{
                width: 150,
                height: 0,
                left: 173,
                top: 62,
                zIndex: 1,
                position: "absolute"
              }}
            >
              <Button
                icon="rollback"
                shape="circle"
                style={{
                  float: "right",
                  color: "#1890ff",
                  fontSize: 18,
                  zIndex: 1
                }}
                onClick={() => {
                  emitter.emit("deleteDraw");
                  const { projectEdit } = this.state;
                  if (projectEdit) {
                    Modal.confirm({
                      title: `确定放弃填写的内容？`,
                      content: "",
                      onOk() {
                        self.returnList();
                      },
                      onCancel() {}
                    });
                  } else {
                    this.setState({
                      projectEdit: false
                    });
                    emitter.emit("showSiderbarDetail", {
                      show: false,
                      from: "spot"
                    });
                    emitter.emit("showProjectInfo", {
                      show: false,
                      edit: false
                    });
                    self.returnList();
                  }
                }}
              />
              <Button
                icon={projectEdit ? "check" : "edit"}
                shape="circle"
                style={{
                  float: "right",
                  color: "#1890ff",
                  fontSize: 18,
                  zIndex: 1
                }}
                onClick={() => {
                  if (projectEdit) {
                    // submit
                    this.props.form.validateFields((err, v) => {
                      if (!err) {
                        console.log(v);
                        if (v.districtCodes.length === 0) {
                          notification["warning"]({
                            message: "请选择涉及县"
                          });
                          return;
                        }
                        const data = {
                          ...v,
                          attachmentId: ParentId,
                          districtCodes: v.districtCodes.join(","),
                          districtCodeId:
                            v.districtCodeId && v.districtCodeId.length
                              ? v.districtCodeId.pop()
                              : "",
                          id: isProjectUpdate ? projectItem.id : "",
                          isNeedPlan: v.isNeedPlan ? true : false,
                          isReply: v.isReply ? true : false,
                          isProjectSupervise
                        };
                        emitter.emit("projectCreateUpdate", data);
                      } else {
                        notification["warning"]({
                          message: err.projectName.errors[0].message
                        });
                      }
                    });
                  } else {
                    this.setState({
                      projectEdit: !projectEdit
                    });
                    emitter.emit("showProjectInfo", {
                      show: true,
                      edit: true,
                      id: projectItem.id
                    });
                  }
                }}
              />
            </p>
            <div
              style={{
                display: previewVisible_min_left ? "block" : "none",
                position: "fixed",
                zIndex: 2,
                width: 305,
                height: 305
              }}
            >
              <Icon
                type="close"
                style={{
                  fontSize: 18,
                  position: "absolute",
                  top: 10,
                  right: 10
                }}
                onClick={() => {
                  this.setState({ previewVisible_min_left: false });
                  emitter.emit("imgLocation", {
                    Latitude: 0,
                    Longitude: 0,
                    show: false
                  });
                }}
              />
              <img
                alt="example"
                style={{ width: "100%", height: "100%", cursor: "pointer" }}
                src={previewImage}
                onClick={() => {
                  this.setState({
                    previewImage: previewImage,
                    previewVisible: true
                  });
                }}
              />
            </div>
            <div
              style={{
                display: projectEdit ? "none" : "block"
              }}
            >
              <p>
                <b>{projectItem.projectBase.name}</b>
              </p>
              <p
                style={{
                  position: "relative",
                  left: 10,
                  marginTop: 10
                  // borderBottom: "solid 1px #dedede",
                  // paddingBottom: 10
                }}
              >
                <span>位置：</span>
                <span>
                  {this.find(
                    districtTreeFilter,
                    projectItem.projectBase.districtCodeId,
                    "label"
                  )}
                  {projectItem.projectBase.addressInfo}
                </span>
                <Icon
                  type="environment"
                  style={{
                    float: "right",
                    color: "#1890ff",
                    fontSize: 18,
                    zIndex: 1
                  }}
                  onClick={() => {
                    mapLocation({
                      item: projectItem,
                      key: key
                    });
                  }}
                />
              </p>

              <List
                style={{
                  width: 310,
                  position: "relation",
                  paddingRight: 30
                }}
              >
                <Collapse bordered={false} defaultActiveKey={["1", "2"]}>
                  <Collapse.Panel header={<b>基本信息</b>} key="1">
                    <div
                      style={{
                        // borderBottom: "solid 1px #dedede",
                        // paddingBottom: 10,
                        position: "relative"
                      }}
                    >
                      <p style={{ marginBottom: 10 }}>
                        <span>建设单位：</span>
                        <span>
                          {this.getDepart(
                            projectItem.productDepartment,
                            "name"
                          )}
                        </span>
                        <span
                          style={{
                            display: this.getDepart(
                              projectItem.productDepartment,
                              "phone"
                            )
                              ? "inline"
                              : "none"
                          }}
                        >
                          （电话：
                          {this.getDepart(
                            projectItem.productDepartment,
                            "phone"
                          )}
                          ）
                        </span>
                      </p>
                      <p style={{ marginBottom: 10 }}>
                        <span>监管单位：</span>
                        <span>
                          {this.getDepart(projectItem.supDepartment, "name")}
                        </span>
                      </p>
                      <p style={{ marginBottom: 10 }}>
                        <span>流域管理机构：</span>
                        <span>
                          {projectItem.riverBasinOU
                            ? projectItem.riverBasinOU.name
                            : ""}
                        </span>
                      </p>
                      <p style={{ marginBottom: 10 }}>
                        <span>编报方案：</span>
                        <span>
                          {projectItem.isNeedPlan ? "需要" : "不需要"}
                        </span>
                      </p>

                      <div style={{ display: showPlan ? "block" : "none" }}>
                        <p style={{ marginBottom: 10 }}>
                          <span>批复机构：</span>
                          <span>
                            {this.getDepart(
                              projectItem.replyDepartment,
                              "name"
                            )}
                          </span>
                        </p>
                        <p style={{ marginBottom: 10 }}>
                          <span>批复文号：</span>
                          <span>{projectItem.replyNum}</span>
                        </p>
                        <p style={{ marginBottom: 10 }}>
                          <span>批复时间：</span>
                          <span>{projectItem.replyTime}</span>
                        </p>
                        <p style={{ marginBottom: 10 }}>
                          <span>责任面积：</span>
                          <span>{projectItem.expand.respArea}公顷</span>
                        </p>
                        <p style={{ marginBottom: 10 }}>
                          <span>立项级别：</span>
                          <span>
                            {this.getDictValue(projectItem.projectLevelId)}
                          </span>
                        </p>
                      </div>
                      <p style={{ marginBottom: 10 }}>
                        <span>扰动合规性：</span>
                        <span>
                          {this.getDictValue(projectItem.expand.complianceId)}
                        </span>
                      </p>
                      <p style={{ marginBottom: 10 }}>
                        <span>项目类别：</span>
                        <span>
                          {this.getDictValue(projectItem.expand.projectCateId)}
                        </span>
                      </p>
                      <p style={{ marginBottom: 10 }}>
                        <span>项目类型：</span>
                        <span>
                          {this.getDictValue(projectItem.expand.projectTypeId)}
                        </span>
                      </p>
                      <p style={{ marginBottom: 10 }}>
                        <span>建设状态：</span>
                        <span>
                          {this.getDictValue(projectItem.projectStatusId)}
                        </span>
                      </p>
                      <p style={{ marginBottom: 10 }}>
                        <span>项目性质：</span>
                        <span>
                          {this.getDictValue(projectItem.expand.projectNatId)}
                        </span>
                      </p>
                      <p style={{ marginBottom: 10 }}>
                        <span>涉及县：</span>
                        <span>
                          {(projectItem.projectBase.districtCodes || [])
                            .map(item => item.name)
                            .join("，")}
                        </span>
                      </p>
                      <p style={{ textAlign: "justify" }}>
                        <span>备注：</span>
                        <span>{projectItem.description}</span>
                      </p>
                      <a
                        style={{
                          position: "absolute",
                          right: 40,
                          bottom: 0,
                          userSelect: "none"
                        }}
                        onClick={() => {
                          this.setState({
                            showProjectAllInfo: !showProjectAllInfo
                          });
                          emitter.emit("showProjectInfo", {
                            show: !showProjectAllInfo,
                            edit: false,
                            id: projectItem.id
                          });
                        }}
                      >
                        详情
                      </a>
                      <a
                        style={{
                          display: isProjectUpdate ? "inherit" : "none",
                          position: "absolute",
                          right: 0,
                          bottom: 0,
                          userSelect: "none"
                        }}
                        onClick={() => {
                          Modal.confirm({
                            title: "是否确定要删除这条项目数据？",
                            content:
                              " 删除项目信息、项目关联的红线、项目关联的责任追究；删除项目关联的扰动图斑里的关联项目ID。 ",
                            okText: "确定",
                            okType: "danger",
                            cancelText: "取消",
                            onOk() {
                              self.projectDelete(projectItem.id);
                            },
                            onCancel() {}
                          });
                        }}
                      >
                        删除
                      </a>
                    </div>
                  </Collapse.Panel>
                  <Collapse.Panel
                    header={
                      <b
                        onClick={() => {
                          showExamine(projectItem);
                        }}
                      >
                        项目查处
                      </b>
                    }
                    key="2"
                  ></Collapse.Panel>
                  <Collapse.Panel
                    header={
                      <b>
                        检查表：{inspectList.length}
                        <Icon
                          type="plus"
                          style={{
                            marginLeft: 10,
                            fontSize: 16,
                            color: "#1890ff"
                          }}
                          onClick={e => {
                            e.stopPropagation();
                            showInspect({
                              show: true,
                              isEdit: true,
                              id: null,
                              projectId: projectItem.id,
                              from: "add"
                            });
                          }}
                        />
                      </b>
                    }
                    key="3"
                  >
                    {/* 检查表 */}
                    {inspectList.map((item, index) => (
                      <p
                        key={index}
                        onClick={() => {
                          if (userId !== item.creatorUserId) {
                            return;
                          }
                          this.hide();
                          showInspect({
                            show: true,
                            isEdit: false,
                            id: item.id,
                            projectId: projectItem.id,
                            from: "edit"
                          });
                        }}
                      >
                        <p style={{ margin: 0 }}>
                          <span
                            style={{
                              cursor:
                                userId === item.creatorUserId
                                  ? "pointer"
                                  : "no-drop"
                            }}
                          >
                            〔{item.numberYear}〕第{item.number}号
                          </span>
                          <div
                            style={{
                              display:
                                userId === item.creatorUserId
                                  ? "inline-block"
                                  : "none",
                              position: "relative",
                              top: 3,
                              left: 5
                            }}
                          >
                            <Icon
                              type="delete"
                              style={{
                                float: "right",
                                fontSize: 18,
                                color: "#1890ff",
                                marginLeft: 10
                              }}
                              onClick={e => {
                                e.stopPropagation();
                                Modal.confirm({
                                  title: "删除检查表",
                                  content: "是否确定要删除这条检查表？",
                                  okText: "确定",
                                  okType: "danger",
                                  cancelText: "取消",
                                  onOk() {
                                    self.showSpin(true);
                                    dispatch({
                                      type: "inspect/inspectDelete",
                                      payload: {
                                        id: item.id
                                      },
                                      callback: success => {
                                        self.showSpin(false);
                                        if (success) {
                                          self.hide();
                                          emitter.emit("projectInfoRefresh", {
                                            projectId: projectItem.id
                                          });
                                        }
                                      }
                                    });
                                  },
                                  onCancel() {}
                                });
                              }}
                            />
                            <Icon
                              type="environment"
                              style={{
                                display: item.problemPoints.length
                                  ? "block"
                                  : "none",
                                float: "right",
                                fontSize: 18,
                                color: "#1890ff",
                                marginLeft: 10
                              }}
                              onClick={e => {
                                e.stopPropagation();
                                if (item.problemPoints.length) {
                                  mapLocation({
                                    item: item.problemPoints,
                                    id: item.problemPoints[0].id,
                                    key: "problemPoint"
                                  });
                                }
                              }}
                            />
                            <Icon
                              type="picture"
                              style={{
                                display: item.attachment ? "block" : "none",
                                float: "right",
                                fontSize: 18,
                                color: "#1890ff",
                                marginLeft: 10
                              }}
                              onClick={e => {
                                e.stopPropagation();
                                emitter.emit("pictureLocation", {
                                  item: item.attachment.child
                                });
                              }}
                            />
                            <Icon
                              type="plus"
                              style={{
                                color: `#13c2c2`, //措施
                                float: "right",
                                fontSize: 18,
                                marginLeft: 10
                              }}
                              onClick={e => {
                                e.stopPropagation();
                                this.hide();
                                emitter.emit("showMeasurePoint", {
                                  show: true,
                                  id: null,
                                  inspectId: item.id,
                                  projectId: projectItem.id,
                                  from: "add"
                                });
                              }}
                            />
                            <Icon
                              type="plus"
                              style={{
                                color: `#eb2f96`, //问题
                                float: "right",
                                fontSize: 18
                              }}
                              onClick={e => {
                                e.stopPropagation();
                                this.hide();
                                emitter.emit("showProblemPoint", {
                                  show: true,
                                  id: null,
                                  inspectId: item.id,
                                  projectId: projectItem.id,
                                  from: "add"
                                });
                              }}
                            />
                          </div>
                        </p>
                        {/* 问题点 */}
                        {item.problemPoints.map((ite, idx) => (
                          <p
                            key={idx}
                            style={{
                              padding: 3,
                              margin: "5px 0 5px 15px",
                              overflow: "hidden",
                              border: "dashed 1px #dedede",
                              borderRadius: 5
                            }}
                          >
                            <span>
                              <span
                                onClick={e => {
                                  e.stopPropagation();
                                  this.hide();
                                  emitter.emit("showProblemPoint", {
                                    show: true,
                                    id: ite.id,
                                    inspectId: item.id,
                                    projectId: projectItem.id,
                                    from: "edit"
                                  });
                                }}
                              >
                                <Tag color="magenta" style={{ margin: 5 }}>
                                  问题
                                </Tag>
                                {ite.name}
                              </span>
                              <Icon
                                type="picture"
                                style={{
                                  display:
                                    ite.attachment &&
                                    ite.attachment.child.length
                                      ? "inline"
                                      : "none",
                                  fontSize: 18,
                                  color: "#1890ff",
                                  marginLeft: 15
                                }}
                                onClick={e => {
                                  e.stopPropagation();
                                  emitter.emit("pictureLocation", {
                                    item: ite.attachment.child
                                  });
                                }}
                              />
                              <Icon
                                type="environment"
                                style={{
                                  fontSize: 18,
                                  color: "#1890ff",
                                  marginLeft: 15
                                }}
                                onClick={e => {
                                  e.stopPropagation();
                                  mapLocation({
                                    item: item.problemPoints,
                                    id: ite.id,
                                    key: "problemPoint"
                                  });
                                }}
                              />
                              <Icon
                                type="delete"
                                style={{
                                  fontSize: 18,
                                  color: "#1890ff",
                                  marginLeft: 15
                                }}
                                onClick={e => {
                                  e.stopPropagation();
                                  Modal.confirm({
                                    title: "删除问题点",
                                    content: "是否确定要删除这个问题点？",
                                    okText: "确定",
                                    okType: "danger",
                                    cancelText: "取消",
                                    onOk() {
                                      self.showSpin(true);
                                      dispatch({
                                        type: "problemPoint/problemPointDelete",
                                        payload: {
                                          id: ite.id
                                        },
                                        callback: success => {
                                          self.showSpin(false);
                                          if (success) {
                                            self.hide();
                                            emitter.emit("projectInfoRefresh", {
                                              projectId: projectItem.id
                                            });
                                            emitter.emit(
                                              "deleteLocationPoint",
                                              {
                                                item: ite,
                                                key: "problemPoint"
                                              }
                                            );
                                          }
                                        }
                                      });
                                    },
                                    onCancel() {}
                                  });
                                }}
                              />
                            </span>
                          </p>
                        ))}
                        {/* 措施点 */}
                        {item.measurePoints.map((ite, idx) => (
                          <p
                            key={idx}
                            style={{
                              padding: 3,
                              margin: "5px 0 5px 15px",
                              overflow: "hidden",
                              border: "dashed 1px #dedede",
                              borderRadius: 5
                            }}
                          >
                            <span
                              onClick={e => {
                                e.stopPropagation();
                                this.hide();
                                emitter.emit("showMeasurePoint", {
                                  show: true,
                                  id: ite.id,
                                  inspectId: item.id,
                                  projectId: projectItem.id,
                                  from: "edit"
                                });
                              }}
                            >
                              <Tag color="cyan" style={{ margin: 5 }}>
                                措施
                              </Tag>
                              {ite.name}
                            </span>
                            <Icon
                              type="picture"
                              style={{
                                display:
                                  ite.attachment && ite.attachment.child.length
                                    ? "inline"
                                    : "none",
                                fontSize: 18,
                                color: "#1890ff",
                                marginLeft: 15
                              }}
                              onClick={e => {
                                e.stopPropagation();
                                emitter.emit("pictureLocation", {
                                  item: ite.attachment.child
                                });
                              }}
                            />
                            <Icon
                              type="environment"
                              style={{
                                fontSize: 18,
                                color: "#1890ff",
                                marginLeft: 15
                              }}
                              onClick={e => {
                                e.stopPropagation();
                                mapLocation({
                                  item: item.measurePoints,
                                  id: ite.id,
                                  key: "measurePoint"
                                });
                              }}
                            />
                            <Icon
                              type="delete"
                              style={{
                                fontSize: 18,
                                color: "#1890ff",
                                marginLeft: 15
                              }}
                              onClick={e => {
                                e.stopPropagation();
                                Modal.confirm({
                                  title: "删除措施点",
                                  content: "是否确定要删除这个措施点？",
                                  okText: "确定",
                                  okType: "danger",
                                  cancelText: "取消",
                                  onOk() {
                                    self.showSpin(true);
                                    dispatch({
                                      type: "measurePoint/measurePointDelete",
                                      payload: {
                                        id: ite.id
                                      },
                                      callback: success => {
                                        self.showSpin(false);
                                        if (success) {
                                          self.hide();
                                          emitter.emit("projectInfoRefresh", {
                                            projectId: projectItem.id
                                          });
                                          emitter.emit("deleteLocationPoint", {
                                            item: ite,
                                            key: "measurePoint"
                                          });
                                        }
                                      }
                                    });
                                  },
                                  onCancel() {}
                                });
                              }}
                            />
                          </p>
                        ))}
                      </p>
                    ))}
                  </Collapse.Panel>
                  <Collapse.Panel
                    header={
                      <b>
                        扰动图斑：{projectInfoSpotList.items.length}
                        <Icon
                          type="plus"
                          style={{
                            marginLeft: 10,
                            fontSize: 16,
                            color: "#1890ff"
                          }}
                          onClick={e => {
                            e.stopPropagation();
                            emitter.emit("drawGraphics", {
                              draw: true,
                              state: "add",
                              type: "spot",
                              fromList: false,
                              projectId: projectItem.id,
                              projectName: projectItem.projectBase.name
                            });
                            emitter.emit("showSiderbarDetail", {
                              show: false,
                              edit: true,
                              from: key,
                              type: "add"
                            });
                          }}
                        />
                        <Icon
                          type="block"
                          style={{
                            marginLeft: 10,
                            fontSize: 16,
                            color: "#1890ff"
                          }}
                          onClick={e => {
                            e.stopPropagation();
                            //图斑关联
                            emitter.emit("spotRelate", {
                              status: "start", //start：开始，end：结束
                              spotId: "",
                              projectId: projectItem.id
                            });
                          }}
                        />
                        <Switch
                          checkedChildren="归档图斑"
                          unCheckedChildren="现状数据"
                          style={{ position: "relative", left: 10, top: -2 }}
                          onChange={(v, e) => {
                            e.stopPropagation();
                            this.setState({ isArchivalSpot: v });
                            setTimeout(() => {
                              this.querySpotByProjectId(projectItem.id);
                            }, 100);
                          }}
                        />
                      </b>
                    }
                    key="4"
                  >
                    {projectInfoSpotList.items.map((item, index) => (
                      <p
                        key={index}
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                          this.hide();
                          emitter.emit("showSiderbarDetail", {
                            show: true,
                            edit: false,
                            from: "spot",
                            type: "edit",
                            id: item.id,
                            fromList: false,
                            projectId: projectItem.id
                          });
                        }}
                      >
                        {item.mapNum}
                        {isArchivalSpot ? item.archiveTime.slice(0, 10) : ""}
                        <Icon
                          type="disconnect"
                          style={{
                            float: "right",
                            fontSize: 18,
                            cursor: "point",
                            color: "#1890ff"
                          }}
                          onClick={e => {
                            e.stopPropagation();
                            dispatch({
                              type: "project/projectUnbindSpotApi",
                              payload: {
                                projectId: projectItem.id,
                                spotId: item.id
                              },
                              callback: (success, error, result) => {
                                notification[success ? "success" : "error"]({
                                  message: `取消关联扰动图斑${
                                    success ? "成功" : "失败"
                                  }${success ? "" : `：${error.message}`}`
                                });
                                if (success) {
                                  this.querySpotByProjectId(projectItem.id);
                                }
                              }
                            });
                          }}
                        />
                        <Icon
                          type="environment"
                          style={{
                            float: "right",
                            fontSize: 16,
                            cursor: "point",
                            color: "#1890ff",
                            marginRight: isArchivalSpot ? 0 : 10
                          }}
                          onClick={e => {
                            e.stopPropagation();
                            mapLocation({
                              item,
                              key: "spot"
                            });
                          }}
                        />
                      </p>
                    ))}
                  </Collapse.Panel>
                  <Collapse.Panel
                    header={
                      <b>
                        防治责任范围：{redLineList.items.length}
                        <Icon
                          type="plus"
                          style={{
                            marginLeft: 10,
                            fontSize: 16,
                            color: "#1890ff"
                          }}
                          onClick={e => {
                            e.stopPropagation();
                            emitter.emit("drawGraphics", {
                              draw: true,
                              state: "add",
                              type: "redLine",
                              projectId: projectItem.id,
                              fromList: false,
                              projectName: projectItem.projectBase.name
                            });
                            emitter.emit("showSiderbarDetail", {
                              show: false,
                              edit: true,
                              from: key,
                              type: "add"
                            });
                          }}
                        />
                      </b>
                    }
                    key="5"
                  >
                    {redLineList.items.map((item, index) => (
                      <p
                        key={index}
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                          this.hide();
                          emitter.emit("showSiderbarDetail", {
                            show: true,
                            edit: false,
                            from: "redLine",
                            type: "edit",
                            id: item.id,
                            projectId: projectItem.id
                          });
                        }}
                      >
                        {item.id}
                        <Icon
                          type="delete"
                          style={{
                            float: "right",
                            fontSize: 18,
                            cursor: "point",
                            color: "#1890ff"
                          }}
                          onClick={e => {
                            e.stopPropagation();
                            Modal.confirm({
                              title: "删除",
                              content: "是否确定要删除这条项目红线数据？",
                              okText: "确定",
                              okType: "danger",
                              cancelText: "取消",
                              onOk() {
                                dispatch({
                                  type: "redLine/redLineDelete",
                                  payload: {
                                    id: item.id
                                  },
                                  callback: success => {
                                    if (success) {
                                      emitter.emit("projectInfoRefresh", {
                                        projectId: projectItem.id
                                      });
                                    }
                                  }
                                });
                              },
                              onCancel() {}
                            });
                          }}
                        />
                        <Icon
                          type="environment"
                          style={{
                            float: "right",
                            fontSize: 16,
                            cursor: "point",
                            color: "#1890ff",
                            marginRight: 10
                          }}
                          onClick={e => {
                            e.stopPropagation();
                            mapLocation({
                              item,
                              key: "redLine"
                            });
                          }}
                        />
                      </p>
                    ))}
                  </Collapse.Panel>
                  <Collapse.Panel
                    header={
                      <b>
                        全景图：{panoramaList.totalCount}
                        <Icon
                          type="plus"
                          style={{
                            marginLeft: 10,
                            fontSize: 16,
                            color: "#1890ff"
                          }}
                          onClick={e => {
                            e.stopPropagation();
                            this.hide();
                            emitter.emit("showSiderbarDetail", {
                              from: "panorama",
                              show: true,
                              edit: true,
                              type: "add",
                              id: null,
                              projectId: projectItem.id,
                              item: {}
                            });
                          }}
                        />
                      </b>
                    }
                    key="6"
                  >
                    {panoramaList.items.map((item, index) => (
                      <p
                        key={index}
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                          this.hide();
                          emitter.emit("showSiderbarDetail", {
                            from: "panorama",
                            show: true,
                            edit: false,
                            type: "edit",
                            id: item.id,
                            projectId: projectItem.id,
                            item
                          });
                        }}
                      >
                        {item.name}
                        <Icon
                          type="delete"
                          style={{
                            float: "right",
                            fontSize: 18,
                            cursor: "point",
                            color: "#1890ff"
                          }}
                          onClick={e => {
                            e.stopPropagation();
                            Modal.confirm({
                              title: "删除",
                              content: "是否确定要删除？",
                              okText: "确定",
                              okType: "danger",
                              cancelText: "取消",
                              onOk() {
                                dispatch({
                                  type: "panorama/panoramaDelete",
                                  payload: {
                                    id: item.id
                                  },
                                  callback: success => {
                                    if (success) {
                                      emitter.emit("projectInfoRefresh", {
                                        projectId: projectItem.id
                                      });
                                    }
                                  }
                                });
                              },
                              onCancel() {}
                            });
                          }}
                        />
                        <Icon
                          type="environment"
                          style={{
                            float: "right",
                            fontSize: 16,
                            cursor: "point",
                            color: "#1890ff",
                            marginRight: 10
                          }}
                          onClick={e => {
                            e.stopPropagation();
                            emitter.emit("fullViewLocation", {
                              ...item
                            });
                          }}
                        />
                      </p>
                    ))}
                  </Collapse.Panel>
                  <Collapse.Panel
                    header={
                      <b>
                        视频监控：
                        {videoMonitorList.totalCount}
                        <Icon
                          type="plus"
                          style={{
                            marginLeft: 10,
                            fontSize: 16,
                            color: "#1890ff"
                          }}
                          onClick={e => {
                            e.stopPropagation();
                            this.hide();
                            showVideoMonitor({
                              show: true,
                              id: null,
                              projectId: projectItem.id
                            });
                          }}
                        />
                      </b>
                    }
                    key="7"
                  >
                    {videoMonitorList.items.map((item, index) => (
                      <p
                        key={index}
                        style={{ cursor: "pointer" }}
                        onClick={e => {
                          e.stopPropagation();
                          this.hide();
                          showVideoMonitor({
                            show: true,
                            id: item.id,
                            projectId: projectItem.id
                          });
                        }}
                      >
                        设备名称：{item.name}
                        <Icon
                          type="delete"
                          style={{
                            float: "right",
                            fontSize: 18,
                            cursor: "point",
                            color: "#1890ff"
                          }}
                          onClick={e => {
                            e.stopPropagation();
                            Modal.confirm({
                              title: "删除",
                              content: "是否确定要删除？",
                              okText: "确定",
                              okType: "danger",
                              cancelText: "取消",
                              onOk() {
                                dispatch({
                                  type: "videoMonitor/videoMonitorDelete",
                                  payload: {
                                    id: item.id
                                  },
                                  callback: success => {
                                    if (success) {
                                      emitter.emit("projectInfoRefresh", {
                                        projectId: projectItem.id
                                      });
                                    }
                                  }
                                });
                              },
                              onCancel() {}
                            });
                          }}
                        />
                        <Icon
                          type="environment"
                          style={{
                            float: "right",
                            fontSize: 16,
                            cursor: "point",
                            color: "#1890ff",
                            marginRight: 10
                          }}
                          onClick={e => {
                            e.stopPropagation();
                            videoMonitorLocation(item);
                          }}
                        />
                      </p>
                    ))}
                  </Collapse.Panel>
                </Collapse>
              </List>
            </div>
            <div
              style={{
                display: projectEdit ? "block" : "none",
                paddingTop: 30
              }}
            >
              <Form
                // layout="inline"
                style={{ position: "relative", paddingBottom: 10 }}
              >
                <Form.Item
                  label={
                    <span>
                      <b style={{ color: "red" }}>*</b>
                      项目名
                    </span>
                  }
                  {...formItemLayout}
                >
                  {getFieldDecorator("projectName", {
                    initialValue: projectItem.projectBase.name,
                    rules: [{ required: true, message: "项目名不能为空" }]
                  })(
                    <AutoComplete
                      style={{ width: 200 }}
                      dataSource={projectListAdd}
                      filterOption={(inputValue, option) =>
                        option.props.children
                          .toUpperCase()
                          .indexOf(inputValue.toUpperCase()) !== -1
                      }
                      onChange={v => {
                        dispatch({
                          type: "project/queryProjectAdd",
                          payload: {
                            SkipCount: 0,
                            MaxResultCount: 5,
                            ProjectName: v
                          }
                        });
                      }}
                      onBlur={() => {
                        const v = getFieldValue("projectName");
                        if (v) {
                          dispatch({
                            type: "project/projectVerify",
                            payload: {
                              name: v
                            },
                            callback: (success, result) => {
                              if (!result.isValid) {
                                setFieldsValue({
                                  projectName: ""
                                });
                                if (result.isArchive) {
                                  notification["warning"]({
                                    message: `该项目名已存在并且已归档，请重新输入`
                                  });
                                }
                                notification["warning"]({
                                  message: `该项目名已存在，请重新输入`
                                });
                              } else {
                                notification["success"]({
                                  message: `该项目名可用`
                                });
                              }
                            }
                          });
                        }
                      }}
                    />
                  )}
                </Form.Item>
                <Form.Item label="所在地区" {...formItemLayout}>
                  {getFieldDecorator("districtCodeId", {
                    initialValue: this.find(
                      districtTreeFilter,
                      projectItem.projectBase.districtCodeId,
                      "value"
                    )
                  })(
                    <Cascader
                      placeholder="请选择所在地区"
                      options={districtTreeFilter}
                      changeOnSelect
                    />
                  )}
                </Form.Item>
                <Form.Item label="详细地址" {...formItemLayout}>
                  {getFieldDecorator("addressInfo", {
                    initialValue: projectItem.projectBase.addressInfo
                  })(<Input />)}
                </Form.Item>
                <Form.Item label="坐标" {...formItemLayout}>
                  {getFieldDecorator("pointX", {
                    initialValue: projectItem.projectBase.pointX
                  })(<Input placeholder="经度" style={{ width: 72 }} />)}
                  {getFieldDecorator("pointY", {
                    initialValue: projectItem.projectBase.pointY
                  })(
                    <Input
                      placeholder="纬度"
                      style={{ width: 110, position: "relative", top: -2 }}
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
                              type: "project"
                            });
                          }}
                        />
                      }
                    />
                  )}
                </Form.Item>
                <Form.Item
                  label={
                    <span style={{ userSelect: "none" }}>
                      建设单位
                      <Icon
                        type="plus"
                        style={{
                          color: "#1890ff"
                        }}
                        onClick={() => {
                          this.setState({
                            showCreateDepart: true,
                            createDepartKey: "productDepartmentId"
                          });
                          setFieldsValue({ productDepartmentId: "" });
                        }}
                      />
                    </span>
                  }
                  {...formItemLayout}
                >
                  {getFieldDecorator("productDepartmentId", {
                    initialValue: this.getDepart(
                      projectItem.productDepartment,
                      "id"
                    )
                  })(
                    <Select
                      showSearch
                      allowClear={true}
                      optionFilterProp="children"
                      addonBefore="Http://"
                      addonAfter={<Icon type="setting" />}
                      // filterOption={(input, option) =>
                      //   option.props.children
                      //     .toLowerCase()
                      //     .indexOf(input.toLowerCase()) >= 0
                      // }
                      onSearch={v => {
                        this.setState({ departSearch: v, isSelect: false });
                        this.queryDepartList(v, 2);
                      }}
                      onBlur={() => {
                        this.getDepartList("productDepartmentId");
                      }}
                      onSelect={(v, e) => {
                        this.setState({ departSearch: e.props.children });
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
                <Form.Item label="监管单位" {...formItemLayout}>
                  {getFieldDecorator("supDepartmentId", {
                    initialValue: this.getDepart(
                      projectItem.supDepartment,
                      "id"
                    )
                  })(
                    <Select
                      showSearch
                      allowClear={true}
                      optionFilterProp="children"
                      // filterOption={(input, option) =>
                      //   option.props.children
                      //     .toLowerCase()
                      //     .indexOf(input.toLowerCase()) >= 0
                      // }
                      onSearch={v => {
                        this.setState({ departSearch: v, isSelect: false });
                        this.queryDepartList(v, 1);
                      }}
                      onBlur={() => {
                        this.getDepartList("supDepartmentId");
                      }}
                      onSelect={() => {
                        this.setState({ isSelect: true });
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
                <Form.Item label="流域管理机构" {...formItemLayout}>
                  {getFieldDecorator("riverBasinOUId", {
                    initialValue: projectItem.riverBasinOU
                      ? projectItem.riverBasinOU.id
                      : ""
                  })(
                    <Select
                      showSearch
                      allowClear={true}
                      optionFilterProp="children"
                    >
                      {basinOrganList.map(item => (
                        <Select.Option value={item.id} key={item.id}>
                          {item.name}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
                <Form.Item label="编报方案" {...formItemLayout}>
                  {getFieldDecorator("isNeedPlan", {
                    valuePropName: "checked",
                    initialValue: projectItem.isNeedPlan
                  })(
                    <Switch
                      checkedChildren="需要"
                      unCheckedChildren="不需要"
                      onChange={v => {
                        this.setState({ showPlan: v });
                      }}
                    />
                  )}
                </Form.Item>
                <div style={{ display: showPlan ? "block" : "none" }}>
                  <Form.Item label="批复机构" {...formItemLayout}>
                    {getFieldDecorator("replyDepartmentId", {
                      initialValue: this.getDepart(
                        projectItem.replyDepartment,
                        "id"
                      )
                    })(
                      <Select
                        allowClear={true}
                        showSearch
                        optionFilterProp="children"
                        // filterOption={(input, option) =>
                        //   option.props.children
                        //     .toLowerCase()
                        //     .indexOf(input.toLowerCase()) >= 0
                        // }
                        onSearch={v => {
                          this.setState({ departSearch: v, isSelect: false });
                          this.queryDepartList(v, 1);
                        }}
                        onBlur={() => {
                          this.getDepartList("supDepartmentId");
                        }}
                        onSelect={() => {
                          this.setState({ isSelect: true });
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
                  <Form.Item label="批复文号" {...formItemLayout}>
                    {getFieldDecorator("replyNum", {
                      initialValue: projectItem.replyNum
                    })(<Input />)}
                  </Form.Item>
                  <Form.Item label="批复时间" {...formItemLayout}>
                    {getFieldDecorator("replyTime", {
                      initialValue: dateInitFormat(projectItem.replyTime)
                    })(<DatePicker />)}
                  </Form.Item>
                  <Form.Item label="责任面积" {...formItemLayout}>
                    {getFieldDecorator("respArea", {
                      initialValue: projectItem.expand.respArea
                    })(<Input addonAfter="公顷" />)}
                  </Form.Item>
                  <Form.Item label="立项级别" {...formItemLayout}>
                    {getFieldDecorator("projectLevelId", {
                      initialValue: projectItem.projectLevelId
                    })(
                      <Select
                        showSearch
                        allowClear={true}
                        optionFilterProp="children"
                      >
                        {this.dictList("立项级别").map(item => (
                          <Select.Option value={item.id} key={item.id}>
                            {item.dictTableValue}
                          </Select.Option>
                        ))}
                      </Select>
                    )}
                  </Form.Item>
                </div>
                <Form.Item label="扰动合规性" {...formItemLayout}>
                  {getFieldDecorator("complianceId", {
                    initialValue: projectItem.expand.complianceId
                  })(
                    <Select
                      showSearch
                      allowClear={true}
                      optionFilterProp="children"
                      disabled={
                        projectInfoSpotList.items.length !== 0 &&
                        isProjectUpdate
                          ? true
                          : false
                      }
                    >
                      {this.dictList("扰动合规性").map(item => (
                        <Select.Option value={item.id} key={item.id}>
                          {item.dictTableValue}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
                <Form.Item label="项目类别" {...formItemLayout}>
                  {getFieldDecorator("projectCateId", {
                    initialValue: projectItem.expand.projectCateId
                  })(
                    <Select
                      showSearch
                      allowClear={true}
                      optionFilterProp="children"
                    >
                      {this.dictList("项目类别").map(item => (
                        <Select.Option value={item.id} key={item.id}>
                          {item.dictTableValue}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
                <Form.Item label="项目类型" {...formItemLayout}>
                  {getFieldDecorator("projectTypeId", {
                    initialValue: projectItem.expand.projectTypeId
                  })(
                    <Select
                      showSearch
                      allowClear={true}
                      optionFilterProp="children"
                    >
                      {this.dictList("项目类型").map(item => (
                        <Select.Option value={item.id} key={item.id}>
                          {item.dictTableValue}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
                <Form.Item label="建设状态" {...formItemLayout}>
                  {getFieldDecorator("projectStatusId", {
                    initialValue: projectItem.projectStatusId
                  })(
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
                <Form.Item label="项目性质" {...formItemLayout}>
                  {getFieldDecorator("projectNatId", {
                    initialValue: projectItem.expand.projectNatId
                  })(
                    <Select
                      showSearch
                      allowClear={true}
                      optionFilterProp="children"
                    >
                      {this.dictList("项目性质").map(item => (
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
                      涉及县
                    </span>
                  }
                  {...formItemLayout}
                >
                  {getFieldDecorator("districtCodes", {
                    valuePropName: "value",
                    initialValue: districtTree[0].children
                      ? (projectItem.projectBase.districtCodes || []).map(
                          item => item.id
                        )
                      : [districtTree[0].value]
                  })(
                    // <TreeSelect
                    //   treeData={districtTree}
                    //   multiple
                    //   filterTreeNode={(a, b) => {
                    //     if (b.props.label.indexOf(a) > -1) {
                    //       return true;
                    //     }
                    //   }}
                    // />
                    <TreeSelect
                      showSearch
                      allowClear={true}
                      multiple
                      dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
                      filterTreeNode={(a, b) => {
                        if (b.props.title.indexOf(a) > -1) {
                          return true;
                        }
                      }}
                    >
                      {districtTree.map(item => (
                        <TreeSelect.TreeNode
                          value={item.value}
                          title={item.label}
                          key={item.value}
                          disabled={item.children ? true : false}
                        >
                          {(item.children || []).map((ite, idx) => (
                            <TreeSelect.TreeNode
                              value={ite.value}
                              title={ite.label}
                              key={ite.value}
                              disabled={ite.children ? true : false}
                            >
                              {(ite.children || []).map((it, id) => (
                                <TreeSelect.TreeNode
                                  value={it.value}
                                  title={it.label}
                                  key={it.value}
                                  disabled={it.children ? true : false}
                                >
                                  {(it.children || []).map((i, j) => (
                                    <TreeSelect.TreeNode
                                      value={i.value}
                                      title={i.label}
                                      key={i.value}
                                    />
                                  ))}
                                </TreeSelect.TreeNode>
                              ))}
                            </TreeSelect.TreeNode>
                          ))}
                        </TreeSelect.TreeNode>
                      ))}
                    </TreeSelect>
                  )}
                </Form.Item>
                <Form.Item label="备注" {...formItemLayout}>
                  {getFieldDecorator("description", {
                    initialValue: projectItem.description
                  })(<Input.TextArea autosize />)}
                </Form.Item>
                <a
                  style={{
                    position: "absolute",
                    right: 40,
                    bottom: 0,
                    userSelect: "none"
                  }}
                  onClick={() => {
                    this.setState({
                      showProjectAllInfo: !showProjectAllInfo
                    });
                    emitter.emit("showProjectInfo", {
                      show: !showProjectAllInfo,
                      edit: true,
                      id: projectItem.id
                    });
                  }}
                >
                  详情
                </a>
                <a
                  style={{
                    display: isProjectUpdate ? "inherit" : "none",
                    position: "absolute",
                    right: 0,
                    bottom: 0,
                    userSelect: "none"
                  }}
                  onClick={() => {
                    Modal.confirm({
                      title: "是否确定要删除这条项目数据？",
                      content: (
                        <span>
                          删除项目信息、项目关联的红线、项目关联的责任追究；
                          删除项目关联的扰动图斑里的关联项目ID。
                        </span>
                      ),
                      okText: "确定",
                      okType: "danger",
                      cancelText: "取消",
                      onOk() {
                        self.projectDelete(projectItem.id);
                      },
                      onCancel() {
                        console.log("Cancel");
                      }
                    });
                  }}
                >
                  删除
                </a>
              </Form>
            </div>
            <div
              style={{
                minHeight: projectFileList.length ? 120 : 0,
                marginTop: 20
              }}
            >
              <Upload
                action={config.url.annexUploadUrl}
                headers={{ Authorization: `Bearer ${accessToken()}` }}
                data={{ Id: ParentId }}
                listType="picture-card"
                fileList={projectFileList}
                onSuccess={v => {
                  this.setState({
                    ParentId: v.result.id,
                    uid: v.result.child[0].id
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
                    projectFileList: [...projectFileList, obj]
                  });
                }}
                onError={(v, response) => {
                  notification["error"]({
                    message: `附件上传失败：${response.error.message}`
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
                        previewVisible_min_left: true
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
                    return { ...item, status: "done" };
                  });
                  this.setState({
                    projectFileList: data
                  });
                }}
                onRemove={file => {
                  console.log("onRemove", file);
                  return new Promise((resolve, reject) => {
                    if (projectEdit) {
                      dispatch({
                        type: "annex/annexDelete",
                        payload: {
                          FileId: file.uid,
                          Id: projectItem.attachment
                            ? projectItem.attachment.id
                            : ParentId
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
                        message: `请先开始编辑项目`
                      });
                    }
                  });
                }}
              >
                {projectEdit ? (
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
            <div>
              <Button
                icon="cloud-download"
                style={{
                  display:
                    projectItem.isArchive || projectEdit ? "none" : "block",
                  marginTop: 20
                }}
                onClick={() => {
                  this.setState({ archiveTime: "" });
                  Modal.confirm({
                    title: "项目归档",
                    content: (
                      <span>
                        <Typography.Text type="warning">
                          这个项目关联图斑也会同步归档！
                        </Typography.Text>
                        <br />
                        <br />
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
                      return new Promise((resolve, reject) => {
                        if (archiveTime) {
                          resolve();
                          dispatch({
                            type: "project/projectArchive",
                            payload: {
                              id: projectItem.id,
                              ArchiveTime: archiveTime
                            },
                            callback: success => {
                              if (success) {
                                emitter.emit("deleteSuccess");
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
                项目归档
              </Button>
              <Button
                icon="rollback"
                style={{
                  display:
                    projectItem.isArchive || projectEdit ? "block" : "none",
                  marginLeft: 20
                }}
                onClick={() => {
                  dispatch({
                    type: "project/projectUnArchive",
                    payload: {
                      id: projectItem.id
                    },
                    callback: success => {
                      if (success) {
                        emitter.emit("deleteSuccess");
                      }
                    }
                  });
                }}
              >
                撤销归档
              </Button>
            </div>
            <Modal
              title="新建单位"
              width="50%"
              visible={showCreateDepart}
              onOk={() => {
                this.props.form.validateFields((err, v) => {
                  console.log(v);
                  dispatch({
                    type: "project/departCreate",
                    payload: v,
                    callback: (success, result) => {
                      if (success) {
                        self.setState({ showCreateDepart: false });
                        setFieldsValue({ [createDepartKey]: result.id });
                        notification["success"]({
                          message: `单位新建成功`
                        });

                        emitter.emit("departNameReset", {
                          key: createDepartKey,
                          name: result.name,
                          id: result.id
                        });
                      }
                    }
                  });
                });
              }}
              onCancel={() => {
                this.setState({ showCreateDepart: false });
              }}
            >
              <Form>
                <Row gutter={24}>
                  <Col span={12}>
                    <Form.Item label="单位名" {...formItemLayout}>
                      {getFieldDecorator("name")(<Input />)}
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="单位类型" {...formItemLayout}>
                      {getFieldDecorator("depType")(
                        <Select style={{ width: "100%" }}>
                          <Select.Option value="1">建设单位</Select.Option>
                          <Select.Option value="2">方案编制单位</Select.Option>
                          <Select.Option value="3">设计单位</Select.Option>
                          <Select.Option value="4">施工单位</Select.Option>
                          <Select.Option value="5">监测单位</Select.Option>
                          <Select.Option value="6">监理单位</Select.Option>
                          <Select.Option value="7">
                            验收报告编制单位
                          </Select.Option>
                        </Select>
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="单位资质" {...formItemLayout}>
                      {getFieldDecorator("intelligence")(<Input />)}
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="法人" {...formItemLayout}>
                      {getFieldDecorator("legal")(<Input />)}
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="地址" {...formItemLayout}>
                      {getFieldDecorator("address")(<Input />)}
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="电话" {...formItemLayout}>
                      {getFieldDecorator("phone")(<Input />)}
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="邮编" {...formItemLayout}>
                      {getFieldDecorator("zipcode")(<Input />)}
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="传真" {...formItemLayout}>
                      {getFieldDecorator("fax")(<Input />)}
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="联系人id" {...formItemLayout}>
                      {getFieldDecorator("contactId")(<Input />)}
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="主要投资方1" {...formItemLayout}>
                      {getFieldDecorator("investors1")(<Input />)}
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="主要投资方2" {...formItemLayout}>
                      {getFieldDecorator("investors2")(<Input />)}
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="主要投资方3" {...formItemLayout}>
                      {getFieldDecorator("investors3")(<Input />)}
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="备注" {...formItemLayout}>
                      {getFieldDecorator("description")(<Input />)}
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            </Modal>
          </div>
        </div>
      </div>
    );
  }
}
