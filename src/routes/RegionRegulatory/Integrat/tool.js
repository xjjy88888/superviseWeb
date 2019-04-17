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
import "leaflet/dist/leaflet.css";
import echarts from "echarts/lib/echarts";
import "echarts";
import config from "../../../config";

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
    this.setState({ show: false });
    emitter.emit("showChart", {
      show: false
    });
  };

  onChange = checkedValues => {
    console.log("checked = ", checkedValues);
  };

  render() {
    const { show, type, typeChild } = this.state;

    return (
      <div
        style={{
          left: show ? 350 : -350,
          width: 240,
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
            backgroundColor: ` rgba(0, 0, 0, 0.3)`,
            borderRadius: ` 50%`,
            padding: 10,
            cursor: `pointer`
          }}
          onClick={this.switchShow}
        />
        <div style={{ display: type === "tool" ? "block" : "none" }}>
          <p style={{ margin: `20px 0 10px 0` }}>工具箱</p>
          {config.toolbox.map((item, index) => (
            <div key={index}>
              <Button
                style={{ margin: `15px 10px 0 10px` }}
                icon={item.icon}
                onClick={() => {
                  if (item.label === "数据抽稀") {
                    emitter.emit("showSparse", {
                      show: true
                    });
                  }
                }}
              >
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
              display: typeChild === "project" ? "none" : "block"
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
