import React, { PureComponent } from "react";
import { Icon, Button, Radio, notification, Spin } from "antd";
import emitter from "../../../utils/event";
import "leaflet/dist/leaflet.css";
import echarts from "echarts/lib/echarts";
import "echarts";
import { connect } from "dva";
import config from "../../../config";

let myChart;

@connect(({ project }) => ({
  project
}))
export default class siderbarDetail extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      showTool: false,
      show: false,
      type: "control",
      state: "pie",
      chartData: [],
      queryInfo: {}
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
    this.eventEmitter = emitter.addListener("queryInfo", v => {
      this.setState({
        queryInfo: v.info
      });
    });
    this.eventEmitter = emitter.addListener("showChart", v => {
      this.setState({
        show: v.show,
        title: v.title
      });
      this.query(v.key, v.type);
    });
    myChart = echarts.init(this.chartDom);
    const { clientWidth, clientHeight } = this.refDom;
    this.setState({
      clientHeight: clientHeight,
      clientWidth: clientWidth
    });
  }

  query = (v, t) => {
    const { dispatch } = this.props;
    const { state, queryInfo } = this.state;
    this.setState({ showSpin: true });
    dispatch({
      type: `${t}/${t}Chart`,
      payload: {
        ...queryInfo,
        type: v,
        isChart: true
      },
      callback: (success, error, v) => {
        this.setState({ showSpin: false });
        if (success) {
          this.setState({ chartData: v });
          if (state === "pie") {
            this.drawPie(v);
          } else {
            this.drawBar(v);
          }
        } else {
          notification["error"]({
            message: `项目统计失败：${error.message}`
          });
        }
      }
    });
  };

  drawPie = v => {
    const { title } = this.state;

    const optionPie = {
      title: {
        text: title,
        left: "center"
      },
      tooltip: {
        trigger: "item",
        formatter: "{a}<br/>{b}: {c} ({d}%)"
      },
      legend: {
        orient: "vertical",
        x: "left",
        data: v.map(item => item.name)
      },
      series: [
        {
          name: title,
          type: "pie",
          radius: ["0%", "70%"],
          data: v
        }
      ]
    };

    myChart.setOption(optionPie, true);
  };

  drawBar = v => {
    const { title } = this.state;
    const optionBar = {
      title: {
        text: title,
        left: "center"
      },
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow"
        }
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
        data: v.map(item => item.name)
      },
      series: [
        {
          name: title,
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
          data: v.map(item => item.value)
        }
      ]
    };
    myChart.setOption(optionBar, true);
  };

  render() {
    const { show, showTool, type, chartData, showSpin } = this.state;
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
          left: 650,
          width: `52vw`,
          height: `80vh`,
          top: `50%`,
          transform: `translate(0,-47%)`
        }}
      >
        <Button
          icon="close"
          shape="circle"
          style={{
            float: "right",
            position: "absolute",
            color: "#1890ff",
            right: 10,
            top: 10
          }}
          onClick={() => {
            this.setState({ show: false });
          }}
        />

        <Radio.Group
          name="radiogroup"
          size="small"
          style={{ position: "relative", left: "45%", margin: 10 }}
          defaultValue={`pie`}
          onChange={e => {
            this.setState({ state: e.target.value });
            if (e.target.value === "pie") {
              this.drawPie(chartData);
            } else {
              this.drawBar(chartData);
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
            height: `72vh`
          }}
        />
        <Spin
          size="large"
          style={{
            display: showSpin ? "block" : "none",
            padding: 100,
            position: "absolute",
            top: "50%",
            left: "50%",
            zIndex: 1001,
            background: "transparent",
            transform: "translate(-50%,-50%)"
          }}
        />
      </div>
    );
  }
}
