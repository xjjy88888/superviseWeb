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
    this.state = { show: true };
  }

  componentDidMount() {
    this.eventEmitter = emitter.addListener("showTool", data => {
      this.setState({
        show: data.show,
        type: data.type
      });
    }); // 基于准备好的dom，初始化echarts实例
    const myChart = echarts.init(document.getElementById("main"));
    // const myChart2 = echarts.init(document.getElementById("main2"));
    // 绘制图表
    myChart.setOption({
      tooltip: {
        trigger: "item",
        formatter: "{a} <br/>{b}: {c} ({d}%)"
      },
      legend: {
        orient: "vertical",
        x: "left",
        data: ["直接访问", "邮件营销", "联盟广告", "视频广告", "搜索引擎"]
      },
      series: [
        {
          name: "访问来源",
          type: "pie",
          radius: ["0%", "70%"],
          avoidLabelOverlap: false,
          label: {
            normal: {
              show: false,
              position: "center"
            },
            emphasis: {
              show: false,
              textStyle: {
                fontSize: "30",
                fontWeight: "bold"
              }
            }
          },
          labelLine: {
            normal: {
              show: false
            }
          },
          data: [
            { value: 335, name: "直接访问" },
            { value: 310, name: "邮件营销" },
            { value: 234, name: "联盟广告" },
            { value: 135, name: "视频广告" },
            { value: 1548, name: "搜索引擎" }
          ]
        }
      ]
    });
    // myChart2.setOption({
    //   title: { text: "ECharts 入门示例" },
    //   tooltip: {},
    //   xAxis: {
    //     data: ["衬衫", "羊毛衫", "雪纺衫", "裤子", "高跟鞋", "袜子"]
    //   },
    //   yAxis: {},
    //   series: [
    //     {
    //       name: "销量",
    //       type: "bar",
    //       data: [5, 20, 36, 10, 10, 20]
    //     }
    //   ]
    // });
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
          <CheckboxGroup options={project} onChange={this.onChange} />
          <Radio.Group buttonStyle="solid">
            <Radio.Button value={1}>饼图</Radio.Button>
            <Radio.Button value={2}>柱状图</Radio.Button>
          </Radio.Group>
          <p className={styles.title}>图斑统计</p>
          <CheckboxGroup options={spot} onChange={this.onChange} />
          <Radio.Group
            buttonStyle="solid"
            name="radiogroup"
            style={{ marginTop: 30 }}
            defaultValue={1}
            onChange={e => {
              console.log(e.target.value);
              if (e.target.value === 1) {
                this.setState({ type: "pie" });
              } else {
                this.setState({ type: "pie" });
              }
            }}
          >
            <Radio.Button value={1}>饼图</Radio.Button>
            <Radio.Button value={2}>柱状图</Radio.Button>
          </Radio.Group>
          <div id="main" style={{ width: 300, height: 400, paddingTop: 10 }} />
          {/* <div id="main2" style={{ width: 400, height: 400 }} /> */}
        </div>
      </div>
    );
  }
}
