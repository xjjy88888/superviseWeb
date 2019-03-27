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
  Checkbox
} from "antd";
import emitter from "../../../utils/event";
import styles from "./tool.less";
import "leaflet/dist/leaflet.css";
import echarts from "echarts/lib/echarts";
import "echarts";

const CheckboxGroup = Checkbox.Group;
const RadioGroup = Radio.Group;

export default class siderbarDetail extends PureComponent {
  constructor(props) {
    super(props);
    this.state = { show: false };
    this.charRef = ref => {
      this.chartDom = ref;
    };
  }

  componentDidMount() {
    this.eventEmitter = emitter.addListener("showTool", data => {
      this.setState({
        show: data.show,
        type: data.type,
        typeChild: data.typeChild
      });
    });
  }

  switchShow = () => {
    this.setState({ show: true });
  };

  onChange = checkedValues => {
    console.log("checked = ", checkedValues);
  };

  render() {
    const { show, type, typeChild } = this.state;

    const toolItems = [
      {
        label: "导出当前列表数据",
        value: "shopping",
        icon: "shopping"
      },
      {
        label: "模板下载",
        value: "login",
        icon: "login"
      },
      {
        label: "模板说明",
        value: "question-circle",
        icon: "question-circle"
      },
      {
        label: "批量上传(Shapfile)",
        value: "upload",
        icon: "upload"
      },
      {
        label: "批量上传(Excel)",
        value: "upload",
        icon: "upload"
      },
      {
        label: "数据归档",
        value: "cloud-download",
        icon: "cloud-download"
      }
    ];

    const project = [
      {
        label: "立项级别",
        value: "level",
        icon: "schedule"
      },
      {
        label: "合规性",
        value: "compliance",
        icon: "info-circle"
      },
      {
        label: "项目类型",
        value: "type",
        icon: "appstore"
      },
      {
        label: "项目类别",
        value: "sort",
        icon: "ant-design"
      },
      {
        label: "项目性质",
        value: "nature",
        icon: "project"
      },
      {
        label: "建设状态",
        value: "state",
        icon: "thunderbolt"
      },
      {
        label: "矢量化类型",
        value: "vector",
        icon: "profile"
      }
    ];

    const spot = [
      {
        label: "现场复核",
        value: "level",
        icon: "edit"
      },
      {
        label: "合规性",
        value: "compliance",
        icon: "info-circle"
      },
      {
        label: "扰动类型",
        value: "type",
        icon: "appstore"
      },
      {
        label: "建设状态",
        value: "nature",
        icon: "thunderbolt"
      },
      {
        label: "扰动变化类型",
        value: "sort",
        icon: "border-inner"
      }
    ];

    return (
      <div className={styles.sidebar} style={{ left: show ? 350 : -350 }}>
        <Icon
          className={styles.icon}
          type="left"
          style={{ fontSize: 30, display: show ? "block" : "none" }}
          onClick={this.switchShow}
        />
        <div style={{ display: type === "tool" ? "block" : "none" }}>
          <p className={styles.title}>工具箱</p>
          {toolItems.map((item, index) => (
            <div key={index}>
              <Button className={styles.button} icon={item.icon}>
                {item.label}
              </Button>
              <br />
            </div>
          ))}
        </div>
        <div
          style={{
            display: type === "tool" ? "none" : "block"
          }}
        >
          <div
            style={{
              display: typeChild === "project" ? "block" : "none"
            }}
          >
            <p className={styles.title}>控制台 - 项目统计</p>
            <Radio.Group buttonStyle="solid" defaultValue={`level`}>
              {project.map((item, index) => (
                <div key={index}>
                  <Button className={styles.button} icon={item.icon}>
                    {item.label}
                  </Button>
                  <br />
                </div>
              ))}
            </Radio.Group>
          </div>
          <div
            style={{
              display: typeChild === "project" ? "none" : "block"
            }}
          >
            <p className={styles.title}>控制台 - 图斑统计</p>
            <Radio.Group buttonStyle="solid">
              {spot.map((item, index) => (
                <div key={index}>
                  <Button className={styles.button} icon={item.icon}>
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
