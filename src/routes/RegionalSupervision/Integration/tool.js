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
  Spin
} from "antd";
import emitter from "../../../utils/event";
import "leaflet/dist/leaflet.css";
import "echarts";
import config from "../../../config";
import { dateFormat, accessToken } from "../../../utils/util";

const url = config.download;

@connect(({ project, spot, point, other, user }) => ({
  project,
  spot,
  point,
  other,
  user
}))
@createForm()
export default class siderbarDetail extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      show: false,
      checkResult: [],
      showCheck: false,
      ShowArchive: false,
      key: "project",
      showSpin: false
    };
    this.charRef = ref => {
      this.chartDom = ref;
    };
  }

  componentDidMount() {
    this.eventEmitter = emitter.addListener("showTool", data => {
      console.log(data);
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
  }

  render() {
    const {
      show,
      type,
      key,
      checkResult,
      showCheck,
      funcType,
      funcTypeText,
      ShowArchive,
      showSpin
    } = this.state;
    const { dispatch } = this.props;
    return (
      <div
        style={{
          left: show ? 350 : -350,
          width: 240,
          height: 610,
          backgroundColor: `#fff`,
          position: `absolute`,
          zIndex: 1000,
          top: 410,
          borderRadius: `0px 10px 10px 0`,
          padding: `10px 10px 30px 20px`,
          transform: `translate(0, -50%)`,
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
            backgroundColor: ` rgba(0, 0, 0, 0.5)`,
            borderRadius: ` 50%`,
            padding: 10,
            cursor: `pointer`
          }}
          onClick={() => {
            this.setState({ show: false });
            emitter.emit("showChart", {
              show: false
            });
          }}
        />
        <Spin
          size="large"
          style={{
            display: showSpin ? "block" : "none",
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
            key === "spot" &&
            (item.key === "upload_excel" ||
              item.key === "download_excel") ? null : (
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
                      //模板下载(Shapfile)
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
                      //导出数据-导出附件数据-归档数据-删除
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
                      //模板下载(Excel)
                      case "download_excel":
                        window.open(
                          `${url}Excel/项目红线范围（无图形）.xlsx`,
                          "_blank"
                        );
                        notification["success"]({
                          message: `下载项目模板(Excel)成功`
                        });
                        break;
                      //模板说明
                      case "template_description":
                        window.open(`${url}Shapefile/模板说明.docx`, "_blank");
                        notification["success"]({
                          message: `下载${
                            key === "project" ? "项目" : "图斑"
                          }模板说明成功`
                        });
                        break;
                      //数据抽稀
                      case "data_sparse":
                        emitter.emit("showSparse", {
                          show: true
                        });
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
                dispatch({
                  type: "annex/export",
                  payload: {
                    ids: checkResult.map(item => item.id),
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
                将要
                {funcTypeText}
                的数据有
                {checkResult.length}条：
                {checkResult
                  .map(item =>
                    key === "project" ? item.projectName : item.mapNum
                  )
                  .join("，")}
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
              this.setState({ showSpin: true });
            }}
            onSuccess={v => {
              console.log("onSuccess");
              this.setState({ showSpin: false });
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
              this.setState({ showSpin: false });
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
