import React, { PureComponent } from "react";
import {
  Menu,
  Icon,
  Button,
  Input,
  Radio,
  List,
  Avatar,
  Carousel,
  notification,
  Alert,
  Modal,
  Checkbox
} from "antd";
import emitter from "../../../utils/event";
import "leaflet/dist/leaflet.css";
import echarts from "echarts/lib/echarts";
import "echarts";
import config from "../../../config";

const CheckboxGroup = Checkbox.Group;
const RadioGroup = Radio.Group;
const url = "http://aj.zkygis.cn/stbcSys/Template/";

export default class siderbarDetail extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      show: false,
      checkResult: [],
      showCheck: false,
      key: "project"
    };
    this.charRef = ref => {
      this.chartDom = ref;
    };
  }

  componentDidMount() {
    this.eventEmitter = emitter.addListener("showTool", data => {
      this.setState({
        show: data.show,
        type: data.type,
        key: data.from
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
    const { show, type, key, checkResult, showCheck, funcType } = this.state;
    return (
      <div
        style={{
          left: show ? 350 : -350,
          width: 240,
          height: 530,
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
                    console.log(item);
                    switch (item.key) {
                      //勾选管理
                      case "checklist":
                        emitter.emit("showCheck", {
                          show: !showCheck
                        });
                        this.setState({ showCheck: !showCheck });
                        break;
                      //模板下载(Shapfile)
                      case "download_shapfile":
                        window.open(
                          `${url}Shapefile/${
                            key === "project" ? "项目红线范围" : "扰动图斑"
                          }.zip`,
                          "_blank"
                        );
                        notification["success"]({
                          message: `下载${
                            key === "project" ? "项目" : "图斑"
                          }模板(Shapfile)成功`
                        });
                        break;
                      //导出数据-归档数据
                      case "export":
                      case "archiving":
                        if (showCheck && checkResult.length === 0) {
                          notification["warning"]({
                            message: `至少选择一条数据进行${item.label}`
                          });
                        } else {
                          this.setState({
                            visible: true
                          });
                        }
                        this.setState({ funcType: item.key });
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
                  {item.key === "archiving"
                    ? showCheck
                      ? "归档勾选数据"
                      : "归档列表数据"
                    : item.key === "export"
                    ? showCheck
                      ? "导出勾选数据"
                      : "导出列表数据"
                    : item.label}
                </Button>
                <br />
              </div>
            )
          )}
          <Modal
            title={`${funcType === "export" ? "导出" : "归档"}${
              key === "project" ? "项目" : "图斑"
            }数据`}
            visible={this.state.visible}
            onOk={() => {
              this.setState({
                visible: false
              });
            }}
            onCancel={() => {
              this.setState({
                visible: false
              });
            }}
          >
            <p>
              {showCheck ? (
                <span>
                  将要{funcType === "export" ? "导出" : "归档"}的数据有
                  {checkResult.length}条：
                  {checkResult
                    .map(item =>
                      key === "project" ? item.projectName : item.mapNum
                    )
                    .join("，")}
                </span>
              ) : (
                <span>
                  将要{funcType === "export" ? "导出" : "归档"}全部数据
                </span>
              )}
            </p>

            <Alert
              type="warning"
              message={`${
                funcType === "export" ? "" : "归档后的数据将不再显示和操作，"
              }是否确定${funcType === "export" ? "导出" : "归档"}？`}
              showIcon
            />
          </Modal>
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
            <Radio.Group buttonStyle="solid" defaultValue={`level`}>
              {config.console_project.map((item, index) => (
                <div key={index}>
                  <Button
                    style={{ margin: `15px 10px 0 10px` }}
                    icon={item.icon}
                    onClick={() => {
                      emitter.emit("showChart", {
                        show: true
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
            <Radio.Group buttonStyle="solid">
              {config.console_spot.map((item, index) => (
                <div key={index}>
                  <Button
                    style={{ margin: `15px 10px 0 10px` }}
                    icon={item.icon}
                    onClick={() => {
                      emitter.emit("showChart", {
                        show: true
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
