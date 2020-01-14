import React, { PureComponent } from "react";
import { connect } from "dva";
import { createForm } from "rc-form";
import {
  Icon,
  Button,
  Radio,
  notification,
  Alert,
  Modal,
  Upload,
  Spin,
  message
} from "antd";
import emitter from "../../../../utils/event";
import "leaflet/dist/leaflet.css";
import styles from "../style/sidebar.less";
import "echarts";
import config from "../../../../config";
import { accessToken, dateFormat } from "../../../../utils/util";

const url = config.download;
let self;

@connect(({ project, spot, point, other, user }) => ({
  project,
  spot,
  point,
  other,
  user
}))
@createForm()
export default class Tool extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      hover: false,
      show: false,
      checkResult: [],
      showCheck: false,
      ShowArchive: false,
      key: "project",
      loading: false,
      queryInfo: {}
    };
    this.charRef = ref => {
      this.chartDom = ref;
    };
  }

  componentDidMount() {
    const { link } = this.props;
    link(this);

    self = this;

    this.eventEmitter = emitter.addListener("showTool", data => {
      this.setState({
        show: data.show,
        type: data.type,
        key: data.key,
        ShowArchive: data.ShowArchive,
        checkResult: data.checkResult || []
      });
    });
    this.eventEmitter = emitter.addListener("checkResult", data => {
      this.setState({
        showCheck: data.show,
        checkResult: data.result
      });
    });
    // this.eventEmitter = emitter.addListener("sidebarQuery", v => {
    //   console.log("siderQuery", v);
    //   const queryInfo = { ...this.state.queryInfo, ...v };
    //   this.setState({
    //     queryInfo
    //   });
    // });
  }

  componentDidUpdate(prevProps) {
    const {
      project: { queryParams }
    } = this.props;
    if (prevProps.project.queryParams !== queryParams) {
      console.log("queryParams---chart============", queryParams);
      queryParams.from && delete queryParams.from;
      this.dataFormat(queryParams);
      this.setState({
        queryInfo: queryParams
      });
      // if (queryParams.from && queryParams.from === "project") {
      //   this.queryProject({ ...queryParams });
      // }
    }
  }

  queryInfo = v => {
    console.log("图表筛选完成", v);
    this.dataFormat(v.queryParams);
    this.setState({
      queryInfo: v.queryParams
    });
  };

  // 格式化查询数据
  dataFormat = v => {
    for (let i in v) {
      if (Array.isArray(v[i])) {
        if (i === "ReplyTime" && v[i].length) {
          v.ReplyTimeBegin = dateFormat(v[i][0]);
          v.ReplyTimeEnd = dateFormat(v[i][1]);
        }
        v[i] = v[i].join(",");
      }
    }
  };

  // 鼠标进入事件
  onMouseEnter = e => {
    this.setState({
      hover: true
    });
  };

  // 鼠标离开事件
  onMouseLeave = e => {
    this.setState({
      hover: false
    });
  };

  projectExamine = (url, payload) => {
    const { dispatch } = this.props;
    this.setState({ loading: true });
    dispatch({
      type: `project/${url}`,
      payload,
      callback: success => {
        this.setState({ loading: false });
        if (success) {
          this.setState({ showCheck: false });
          emitter.emit("showCheck", {
            show: false
          });
        }
      }
    });
  };

  render() {
    const { dispatch } = this.props;

    const {
      hover,
      show,
      type,
      key,
      checkResult,
      showCheck,
      funcType,
      funcTypeText,
      ShowArchive,
      loading,
      queryInfo
    } = this.state;

    return (
      <div
        style={{
          left: show ? 350 : -350,
          width: 240,
          backgroundColor: `#fff`,
          position: `absolute`,
          zIndex: 1001,
          top: 410,
          borderRadius: `0px 10px 10px 0`,
          padding: `10px 10px 30px 20px`,
          transform: `translate(0, -50%)`,
          borderLeft: `solid 1px #ddd`
        }}
      >
        <Icon
          className={`${styles["show-project-list"]} ${
            hover ? styles.spec : null
          }`}
          type="left"
          style={{
            display: show ? "block" : "none",
            top: hover ? "47.5%" : "48.5%"
          }}
          onClick={() => {
            this.setState({
              show: false,
              hover: false
            });
            emitter.emit("showChart", {
              show: false
            });
          }}
          onMouseEnter={this.onMouseEnter.bind(this)}
          onMouseLeave={this.onMouseLeave.bind(this)}
        />
        <Spin
          size="large"
          style={{
            display: loading ? "block" : "none",
            position: "absolute",
            top: 300,
            left: 100,
            zIndex: 1001
          }}
        />
        <div style={{ display: type === "tool" ? "block" : "none" }}>
          <p style={{ margin: `20px 0 10px 0` }}>工具箱</p>
          <span style={{ display: showCheck ? "block" : "none" }}>
            已选中{checkResult.length}条数据
          </span>
          {config.toolbox.map((item, index) =>
            (key === "spot" || !showCheck) &&
            (item.key === "isExamine" || item.key === "noExamine") ? null : (
              <div key={index}>
                <Button
                  style={{ margin: `15px 10px 0 10px` }}
                  icon={item.icon}
                  onClick={() => {
                    switch (item.key) {
                      //勾选管理
                      case "checklist":
                        emitter.emit("showCheck", {
                          show: !showCheck
                        });
                        this.setState({
                          showCheck: !showCheck,
                          checkResult: showCheck ? checkResult : []
                        });
                        break;
                      // 模板下载(Shapfile)
                      case "download_shapfile":
                        console.log(url);
                        window.open(
                          `${url}Shapefile/${
                            key === "project" ? "项目模板" : "图斑模板"
                          }.zip`,
                          "_blank"
                        );
                        notification["success"]({
                          message: `下载${
                            key === "project" ? "项目" : "图斑"
                          }模板(Shapfile)成功`
                        });
                        break;
                      // 拓扑检测工具下载
                      case "topologyCheck":
                        const topologyCheckUrl = config.topologyCheckUrl;
                        console.log(topologyCheckUrl);
                        window.open(topologyCheckUrl);
                        notification["success"]({
                          message: `下载拓扑检测工具成功`
                        });
                        break;
                      // 导出数据-导出附件数据-归档数据-删除
                      case "export":
                      case "attach":
                      case "archiving":
                      case "delete":
                        if (showCheck && checkResult.length === 0) {
                          notification["warning"]({
                            message: `至少选择一条数据进行${item.label}`
                          });
                        } else {
                          this.setState({
                            visible: true
                          });
                        }
                        this.setState({
                          funcType: item.key,
                          funcTypeText: item.label
                        });
                        break;
                      case "template_description":
                        window.open(config.templateDescription, "_blank");
                        notification["success"]({
                          message: `下载${
                            key === "project" ? "项目" : "图斑"
                          }模板说明成功`
                        });
                        break;
                      // 数据抽稀
                      case "data_sparse":
                        emitter.emit("showSparse", {
                          show: true
                        });
                        break;
                      // 设置待查处
                      case "isExamine":
                      case "noExamine":
                        const is = item.key === "isExamine";
                        if (checkResult.length) {
                          Modal.confirm({
                            title: `${is ? "设置" : "取消"}待查处`,
                            content: `确定要${is ? "设置" : "取消"}这 ${
                              checkResult.length
                            } 个项目为待查处吗？`,
                            okText: "确定",
                            cancelText: "取消",
                            okType: "danger",
                            onOk() {
                              const ids = checkResult.map(i => i.id);
                              self.projectExamine(
                                is
                                  ? "projectSetExamine"
                                  : "projectCancelExamine",
                                ids
                              );
                            }
                          });
                        } else {
                          message.warning("至少选择一个项目！");
                        }
                        break;
                      default:
                        break;
                    }
                  }}
                >
                  {item.key === "export" ||
                  item.key === "attach" ||
                  item.key === "archiving" ||
                  item.key === "delete"
                    ? `${item.label}${showCheck ? "勾选" : "列表"}${
                        item.key === "attach" ? "附件" : ""
                      }数据`
                    : item.label}
                </Button>
                <br />
              </div>
            )
          )}
          <Modal
            title={`${funcTypeText}${key === "project" ? "项目" : "图斑"}数据`}
            visible={this.state.visible}
            onOk={() => {
              this.setState({
                visible: false
              });
              if (funcType === "export" || funcType === "attach") {
                //导出
                const obj = showCheck
                  ? {
                      ids: checkResult.map(item => item.id)
                    }
                  : queryInfo;
                dispatch({
                  type: "annex/export",
                  payload: {
                    ...obj,
                    isArchive: ShowArchive,
                    key: key === "project" ? "Project" : "Spot",
                    isAttach: funcType === "attach"
                  },
                  callback: (success, error, result) => {
                    if (success) {
                      console.log(config.url.downloadUrl + result.fileId);
                      window.open(config.url.downloadUrl + result.fileId);
                    }
                  }
                });
              } else if (funcType === "delete") {
                //删除
                this.setState({
                  visibleDelete: true
                });
              }
            }}
            onCancel={() => {
              this.setState({
                visible: false
              });
            }}
          >
            <p>
              <span>
                {showCheck
                  ? `将要
                ${funcTypeText}
                的数据有
                ${checkResult.length}条：
                ${checkResult
                  .map(item =>
                    key === "project" ? item.projectName : item.mapNum
                  )
                  .join("，")}`
                  : `将要${funcTypeText}全部数据`}
              </span>
            </p>

            <Alert
              type="warning"
              message={`${
                funcType === "export" ? "" : "归档后的数据将不再显示和操作，"
              }是否确定${funcTypeText}？`}
              showIcon
            />
          </Modal>

          <Modal
            title={funcTypeText}
            visible={this.state.visibleDelete}
            onOk={() => {
              this.setState({ visibleDelete: false });
              if (funcTypeText === "删除") {
                dispatch({
                  type:
                    key === "project"
                      ? "project/projectDeleteMul"
                      : key === "spot"
                      ? "spot/spotDeleteMul"
                      : "point/pointDeleteMul",
                  payload: {
                    id: checkResult.map(item => item.id)
                  },
                  callback: success => {
                    if (success) {
                      emitter.emit("deleteSuccess", {
                        success: true
                      });
                    }
                  }
                });
              }
            }}
            onCancel={() => {
              this.setState({ visibleDelete: false });
            }}
          >
            <Alert
              type="error"
              message={
                funcTypeText === "删除" && key === "spot"
                  ? "将删除该图斑的图形、属性及附件信息，直接删除将不保存该图斑的历史版本，是否确定删除？"
                  : `确定要${funcTypeText}吗？`
              }
              showIcon
            />
          </Modal>
          <Upload
            showUploadList={false}
            action={
              key === "project"
                ? config.url.uploadProjectUrl
                : config.url.uploadSpotUrl
            }
            headers={{ Authorization: `Bearer ${accessToken()}` }}
            beforeUpload={() => {
              this.setState({ loading: true });
            }}
            onSuccess={v => {
              console.log("onSuccess");
              this.setState({ loading: false });
              if (v.success && v.result.length === 0) {
                notification["success"]({
                  message: `${key === "project" ? "项目" : "图斑"}附件上传成功`
                });
                emitter.emit("deleteSuccess", {
                  success: true
                });
              } else {
                notification["error"]({
                  message: (
                    <div>
                      <p>{key === "project" ? "项目" : "图斑"}附件上传失败：</p>
                      {v.result.map((item, index) => (
                        <p key={index}>{item}</p>
                      ))}
                    </div>
                  )
                });
              }
            }}
            onError={(response, v) => {
              console.log("onError", v);
              this.setState({ loading: false });
              notification["error"]({
                message: `${key === "project" ? "项目" : "图斑"}附件上传失败：${
                  v.error.message
                }`
              });
            }}
          >
            <Button style={{ margin: `15px 10px 0 10px` }}>
              <Icon type="upload" /> 批量上传
            </Button>
          </Upload>
        </div>
        <div
          style={{
            display: type === "tool" ? "none" : "block"
          }}
        >
          <div
            style={{
              display: key === "project" ? "block" : "none"
            }}
          >
            <p style={{ margin: `20px 0 10px 0` }}>控制台 - 项目统计</p>
            <Radio.Group buttonstyle="solid" defaultValue={`level`}>
              {config.console_project.map((item, index) => (
                <div key={index}>
                  <Button
                    style={{ margin: `15px 10px 0 10px` }}
                    icon={item.icon}
                    onClick={() => {
                      emitter.emit("showChart", {
                        show: true,
                        type: "project",
                        key: item.type,
                        title: item.label
                      });
                    }}
                  >
                    {item.label}
                  </Button>
                  <br />
                </div>
              ))}
            </Radio.Group>
          </div>
          <div
            style={{
              display: key === "project" ? "none" : "block"
            }}
          >
            <p style={{ margin: `20px 0 10px 0` }}>控制台 - 图斑统计</p>
            <Radio.Group buttonstyle="solid">
              {config.console_spot.map((item, index) => (
                <div key={index}>
                  <Button
                    style={{ margin: `15px 10px 0 10px` }}
                    icon={item.icon}
                    onClick={() => {
                      emitter.emit("showChart", {
                        show: true,
                        type: "spot",
                        key: item.type,
                        title: item.label
                      });
                    }}
                  >
                    {item.label}
                  </Button>
                  <br />
                </div>
              ))}
            </Radio.Group>
          </div>
        </div>
      </div>
    );
  }
}
