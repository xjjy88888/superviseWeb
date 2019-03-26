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
        type: data.type
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
    const { show, type } = this.state;

    const toolItems = [
      {
        title: "导出当前列表数据",
        icon: "shopping"
      },
      {
        title: "模板下载",
        icon: "login"
      },
      {
        title: "模板说明",
        icon: "question-circle"
      },
      {
        title: "批量上传(Shapfile)",
        icon: "upload"
      },
      {
        title: "批量上传(Excel)",
        icon: "upload"
      },
      {
        title: "数据归档",
        icon: "cloud-download"
      }
    ];

    const project = [
      {
        label: "立项级别",
        value: "level"
      },
      {
        label: "合规性",
        value: "compliance"
      },
      {
        label: "项目类型",
        value: "type"
      },
      {
        label: "项目类别",
        value: "sort"
      },
      {
        label: "项目性质",
        value: "nature"
      },
      {
        label: "建设状态",
        value: "state"
      },
      {
        label: "矢量化类型",
        value: "vector"
      }
    ];

    const spot = [
      {
        label: "现场复核",
        value: "level"
      },
      {
        label: "合规性",
        value: "compliance"
      },
      {
        label: "扰动类型",
        value: "type"
      },
      {
        label: "建设状态",
        value: "nature"
      },
      {
        label: "扰动变化类型",
        value: "sort"
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
          {toolItems.map((item, index) => (
            <div key={index}>
              <Button className={styles.button} icon={item.icon}>
                {item.title}
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
          <p className={styles.title}>项目统计</p>
          <Radio.Group buttonStyle="solid" defaultValue={`level`}>
            {project.map((item, index) => (
              <Radio.Button key={index} value={item.value}>
                {item.label}
              </Radio.Button>
            ))}
          </Radio.Group>
          <p className={styles.title}>图斑统计</p>
          <Radio.Group buttonStyle="solid">
            {spot.map((item, index) => (
              <Radio.Button key={index} value={item.value}>
                {item.label}
              </Radio.Button>
            ))}
          </Radio.Group>
        </div>
      </div>
    );
  }
}
