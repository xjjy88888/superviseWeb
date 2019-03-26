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
import styles from "./chart.less";
import "leaflet/dist/leaflet.css";
import echarts from "echarts/lib/echarts";
import "echarts";

const CheckboxGroup = Checkbox.Group;
const RadioGroup = Radio.Group;

const optionPie = {
  tooltip: {
    trigger: "item",
    formatter: "{a} <br/>{b}: {c} ({d}%)"
  },
  legend: {
    orient: "vertical",
    x: "left",
    data: ["部级", "省级", "市级", "县级"]
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
        { value: 35, name: "部级" },
        { value: 234, name: "省级" },
        { value: 310, name: "市级" },
        { value: 435, name: "县级" }
      ]
    }
  ]
};

const optionLine = {
  tooltip: {
    trigger: "axis",
    axisPointer: {
      type: "shadow"
    }
  },
  legend: {
    data: ["2011年", "2012年"]
  },
  grid: {
    left: "3%",
    right: "4%",
    bottom: "3%",
    containLabel: true
  },
  xAxis: {
    type: "value",
    boundaryGap: [0, 0.01]
  },
  yAxis: {
    type: "category",
    data: [
      "部级",
      "省级",
      "市级",
      "县级",
      "部级",
      "省级",
      "市级",
      "县级",
      "部级",
      "省级",
      "市级",
      "县级",
      "部级",
      "省级",
      "市级",
      "县级",
      "部级",
      "省级",
      "市级",
      "县级",
      "部级",
      "省级",
      "市级",
      "县级"
    ]
  },
  series: [
    {
      name: "立项级别",
      type: "bar",
      itemStyle: {
        normal: {
          color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [
            { offset: 0, color: "#83bff6" },
            { offset: 0.5, color: "#188df0" },
            { offset: 1, color: "#188df0" }
          ])
        },
        emphasis: {
            color: new echarts.graphic.LinearGradient(
                1, 0, 0, 0,
                [
                    {offset: 0, color: '#2378f7'},
                    {offset: 0.7, color: '#2378f7'},
                    {offset: 1, color: '#83bff6'}
                ]
            )
        }
      },
      data: [
        35,
        234,
        310,
        435,
        35,
        234,
        310,
        435,
        35,
        234,
        310,
        435,
        35,
        234,
        310,
        435,
        35,
        234,
        310,
        435,
        35,
        234,
        310,
        435
      ]
    }
  ]
};

let myChart;

export default class siderbarDetail extends PureComponent {
  constructor(props) {
    super(props);
    this.state = { show: false, type: "tool" };
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
    myChart = echarts.init(this.chartDom);
    myChart.setOption(optionPie);
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
      <div
        className={styles.sidebar}
        style={{ display: show && type === "control" ? "block" : "none" }}
      >
        <Button
          type="dashed"
          icon="close"
          shape="circle"
          style={{
            float: "right",
            position: "absolute",
            color: "#1890ff",
            right: 10,
            top: 10
          }}
          onClick={this.switchShow}
        />

        <Radio.Group
          name="radiogroup"
          size="small"
          style={{ position: "relative", left: "47%", margin: 10 }}
          defaultValue={`pie`}
          onChange={e => {
            if (e.target.value === "pie") {
              myChart.setOption(optionPie, true);
            } else {
              myChart.setOption(optionLine, true);
            }
          }}
        >
          <Radio.Button value={`pie`}>
            <Icon type="pie-chart" />
          </Radio.Button>
          <Radio.Button value={`line`}>
            <Icon type="line-chart" />
          </Radio.Button>
        </Radio.Group>
        <div
          id="chart"
          ref={this.charRef}
          style={{ width: "50vw", height: "50vh" }}
        />
      </div>
    );
  }
}
