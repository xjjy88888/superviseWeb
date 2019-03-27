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
    data: [
      "部级ggergerhery",
      "省级ggergerhery",
      "市级ggergerhery",
      "县级ggergerhery"
    ]
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
        { value: 35, name: "部级ggergerhery" },
        { value: 234, name: "省级ggergerhery" },
        { value: 310, name: "市级ggergerhery" },
        { value: 435, name: "县级ggergerhery" }
      ]
    }
  ]
};

const optionBar = {
  tooltip: {
    trigger: "axis",
    axisPointer: {
      type: "shadow"
    }
  },
  legend: {
    data: ["2011年", "2012年"]
  },
  xAxis: {
    type: "value",
    boundaryGap: [0, 0.01]
  },
  yAxis: {
    type: "category",
    axisLabel: {
      interval: 0,
      rotate: 30
    },
    data: [
      "1部级ggergerhery",
      "2省级ggergerhery",
      "3市级ggergerhery",
      "4县级ggergerhery",
      "5部级ggergerhery",
      "6省级ggergerhery",
      "7市级ggergerhery",
      "8县级ggergerhery",
      "9部级ggergerhery",
      "10省级ggergerhery",
      "11市级ggergerhery",
      "12县级ggergerhery",
      "13部级ggergerhery",
      "14省级ggergerhery",
      "15市级ggergerhery",
      "16县级ggergerhery",
      "17部级ggergerhery",
      "18省级ggergerhery",
      "19市级ggergerhery",
      "20县级ggergerhery",
      "21部级ggergerhery",
      "22省级ggergerhery",
      "23市级ggergerhery",
      "24县级ggergerhery",
      "25县级ggergerhery",
      "26县级ggergerhery",
      "27县级ggergerhery",
      "28县级ggergerhery",
      "29县级ggergerhery",
      "30县级ggergerhery",
      "31县级ggergerhery",
      "32县级ggergerhery",
      "33县级ggergerhery",
      "34县级ggergerhery",
      "35县级ggergerhery",
      "36县级ggergerhery"
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
          color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [
            { offset: 0, color: "#2378f7" },
            { offset: 0.7, color: "#2378f7" },
            { offset: 1, color: "#83bff6" }
          ])
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
    this.state = { show: false, type: "control" };
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
    myChart.setOption(optionBar);
  }

  close = () => {
    this.setState({ show: false });
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
        style={{
          display: show && type === "control" ? "block" : "none",
          width: "50vw",
          backgroundColor: "#fff",
          position: "absolute",
          zIndex: 1000,
          top: " 50%",
          borderRadius: 10,
          padding: "10px 10px 30px 20px",
          transform: "translate(0, -50%)",
          left: 700
        }}
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
          onClick={this.close}
        />

        <Radio.Group
          name="radiogroup"
          size="small"
          style={{ position: "relative", left: "47%", margin: 10 }}
          defaultValue={`bar`}
          onChange={e => {
            if (e.target.value === "pie") {
              myChart.setOption(optionPie, true);
            } else {
              myChart.setOption(optionBar, true);
            }
          }}
        >
          <Radio.Button value={`pie`}>
            <Icon type="pie-chart" />
          </Radio.Button>
          <Radio.Button value={`bar`}>
            <Icon type="bar-chart" />
          </Radio.Button>
        </Radio.Group>
        <div
          id="chart"
          ref={this.charRef}
          style={{ width: "50vw", height: "70vh" }}
        />
      </div>
    );
  }
}
