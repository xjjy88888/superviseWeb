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

const project = [
  { TypeName: "项目类型", DictKey: "XMLX-01", DictValue: "公路工程" },
  { TypeName: "项目类型", DictKey: "XMLX-02", DictValue: "铁路工程" },
  { TypeName: "项目类型", DictKey: "XMLX-03", DictValue: "涉水交通工程" },
  { TypeName: "项目类型", DictKey: "XMLX-04", DictValue: "机场工程" },
  { TypeName: "项目类型", DictKey: "XMLX-05", DictValue: "火电工程" },
  { TypeName: "项目类型", DictKey: "XMLX-06", DictValue: "核电工程" },
  { TypeName: "项目类型", DictKey: "XMLX-07", DictValue: "风电工程" },
  { TypeName: "项目类型", DictKey: "XMLX-08", DictValue: "输变电工程" },
  { TypeName: "项目类型", DictKey: "XMLX-09", DictValue: "其他电力工程" },
  { TypeName: "项目类型", DictKey: "XMLX-10", DictValue: "水利枢纽工程" },
  { TypeName: "项目类型", DictKey: "XMLX-11", DictValue: "灌区工程" },
  { TypeName: "项目类型", DictKey: "XMLX-12", DictValue: "引调水工程" },
  { TypeName: "项目类型", DictKey: "XMLX-13", DictValue: "堤防工程" },
  { TypeName: "项目类型", DictKey: "XMLX-14", DictValue: "蓄滞洪区工程" },
  { TypeName: "项目类型", DictKey: "XMLX-15", DictValue: "其他小型水利工程" },
  { TypeName: "项目类型", DictKey: "XMLX-16", DictValue: "水电枢纽工程" },
  { TypeName: "项目类型", DictKey: "XMLX-17", DictValue: "露天煤矿" },
  { TypeName: "项目类型", DictKey: "XMLX-18", DictValue: "露天金属矿" },
  { TypeName: "项目类型", DictKey: "XMLX-19", DictValue: "露天非金属矿" },
  { TypeName: "项目类型", DictKey: "XMLX-20", DictValue: "井采煤矿" },
  { TypeName: "项目类型", DictKey: "XMLX-21", DictValue: "井采金属矿" },
  { TypeName: "项目类型", DictKey: "XMLX-22", DictValue: "井采非金属矿" },
  { TypeName: "项目类型", DictKey: "XMLX-23", DictValue: "油气开采工程" },
  { TypeName: "项目类型", DictKey: "XMLX-24", DictValue: "油气管道工程" },
  { TypeName: "项目类型", DictKey: "XMLX-25", DictValue: "油气储存于加工工程" },
  { TypeName: "项目类型", DictKey: "XMLX-26", DictValue: "工业园区工程" },
  { TypeName: "项目类型", DictKey: "XMLX-27", DictValue: "城市轨道交通工程" },
  { TypeName: "项目类型", DictKey: "XMLX-28", DictValue: "城市管网工程" },
  { TypeName: "项目类型", DictKey: "XMLX-29", DictValue: "房地产工程" },
  { TypeName: "项目类型", DictKey: "XMLX-30", DictValue: "其他城建工程" },
  { TypeName: "项目类型", DictKey: "XMLX-31", DictValue: "林浆纸一体化工程" },
  { TypeName: "项目类型", DictKey: "XMLX-32", DictValue: "农林开发工程" },
  { TypeName: "项目类型", DictKey: "XMLX-33", DictValue: "加工制造类项目" },
  { TypeName: "项目类型", DictKey: "XMLX-34", DictValue: "社会事业类项目" },
  { TypeName: "项目类型", DictKey: "XMLX-35", DictValue: "信息产业类项目" },
  { TypeName: "项目类型", DictKey: "XMLX-36", DictValue: "其他行业项目" }
];

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
    data: project.map(item => {
      return item.DictValue;
    })
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
