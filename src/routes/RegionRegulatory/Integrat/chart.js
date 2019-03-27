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
    data: config.project_type
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
    this.state = {
      showTool: false,
      show: false,
      type: "control"
    };
    this.charRef = ref => {
      this.chartDom = ref;
    };
    this.saveRef = ref => {
      this.refDom = ref;
    };
  }

  componentDidMount() {
    this.eventEmitter = emitter.addListener("showTool", data => {
      this.setState({
        showTool: data.show,
        type: data.type
      });
    });
    this.eventEmitter = emitter.addListener("showChart", data => {
      this.setState({
        show: data.show
      });
    });
    myChart = echarts.init(this.chartDom);
    myChart.setOption(optionBar);
    const { clientWidth, clientHeight } = this.refDom;
    this.setState({
      clientHeight: clientHeight,
      clientWidth: clientWidth
    });
  }

  close = () => {
    this.setState({ show: false });
  };

  onChange = checkedValues => {
    console.log("checked = ", checkedValues);
  };

  render() {
    const { show, showTool, type, clientWidth, clientHeight } = this.state;
    return (
      <div
        ref={this.saveRef}
        style={{
          display: show && showTool && type === "control" ? "block" : "none",
          backgroundColor: "#fff",
          position: "absolute",
          zIndex: 1000,
          borderRadius: 10,
          padding: "10px 00px 10px 30px",
          minWidth: 600,
          minHeight: 500,
          left: 700,
          width: `50vw`,
          height: `80vh`,
          top: `50%`,
          transform: `translate(0,-47%)`
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
          style={{
            width: `50vw`,
            height: `75vh`
          }}
        />
      </div>
    );
  }
}
