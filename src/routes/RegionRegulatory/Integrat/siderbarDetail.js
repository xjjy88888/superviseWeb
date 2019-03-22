import React, { PureComponent } from "react";
import { Menu, Icon, Button, Input, Radio, List, Avatar ,Carousel} from "antd";
import emitter from "../../../utils/event";
import styles from "./sidebar.less";
import "leaflet/dist/leaflet.css";
export default class siderbarDetail extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      show: false,
      inputDisabled: true
    };
    this.map = null;
  }

  componentDidMount() {
    this.eventEmitter = emitter.addListener("showSiderbarDetail", data => {
      this.setState({
        show: data.isShow,
        from: data.from
      });
    });
  }

  // componentWillUnmount() {
  //   emitter.removeListener(this.eventEmitter);
  // }

  switchShow = () => {
    this.setState({ show: !this.state.show, showDetail: false });
  };

  render() {
    const { show, from, inputDisabled } = this.state;

    return (
      <div className={styles.sidebar} style={{ left: show ? 350 : -350 }}>
        <Icon
          className={styles.icon}
          type="left"
          style={{ fontSize: 30, display: show ? "block" : "none" }}
          onClick={this.switchShow}
        />
        <div
          style={{
            display: from === "duty" ? "block" : "none"
          }}
        >
          <List
            style={{
              padding: 20,
              overflow: "auto",
              height: "90vh",
              width: 350,
              position: "relation"
            }}
          >
            <List.Item>
              <b>防治责任范围</b>
            </List.Item>
            <List.Item>
              <Input
                addonAfter={
                  <Icon
                    type="edit"
                    theme="twoTone"
                    onClick={() => {
                      this.setState({
                        inputDisabled: !inputDisabled
                      });
                    }}
                  />
                }
                disabled={inputDisabled}
                defaultValue="设计阶段，可研"
              />
            </List.Item>
            <List.Item>矢量化类型：精确上图</List.Item>
            <List.Item>面积：55m2</List.Item>
            <List.Item>组成部分：广州铁路局</List.Item>
            <List.Item>上图单位：广州铁路局</List.Item>
            <Carousel autoplay>
              <img src="./img/spot.jpg" />
              <img src="./img/spot2.jpg" />
              <img src="./img/spot.jpg" />
              <img src="./img/spot2.jpg" />
              <img src="./img/spot.jpg" />
            </Carousel>
          </List>
        </div>
        <div
          style={{
            display: from === "spot" ? "block" : "none"
          }}
        >
          {" "}
          <List
            style={{
              padding: 20,
              overflow: "auto",
              height: "90vh",
              width: 350,
              position: "relation"
            }}
          >
            <List.Item>
              <b>扰动图斑</b>
            </List.Item>
            <List.Item>
              <Input
                addonAfter={
                  <Icon
                    type="edit"
                    theme="twoTone"
                    onClick={() => {
                      this.setState({
                        inputDisabled: !inputDisabled
                      });
                    }}
                  />
                }
                disabled={inputDisabled}
                defaultValue="2017154_14848_4848"
              />
            </List.Item>
            <List.Item
              style={{ cursor: "pointer" }}
              onClick={() => {
                emitter.emit("showProjectDetail", {
                  isShow: true
                });
              }}
            >
              关联项目：新建铁路广州至香港专线
            </List.Item>
            <List.Item>扰动类型：其他扰动</List.Item>
            <List.Item>扰动面积：9.48公顷</List.Item>
            <List.Item>扰动超出面积：5.48公顷</List.Item>
            <List.Item>扰动合规性：广州铁路局</List.Item>
            <List.Item>扰动变化类型：广州铁路局</List.Item>
            <List.Item>建设状态：广州铁路局</List.Item>
            <List.Item>复核状态：广州铁路局</List.Item>
            <List.Item>地址：</List.Item>
            <List.Item>问题：</List.Item>
            <List.Item>建议：</List.Item>
            <List.Item>备注：</List.Item>
            <Carousel autoplay>
              <img src="./img/spot.jpg" />
              <img src="./img/spot2.jpg" />
              <img src="./img/spot.jpg" />
            </Carousel>
            <Button type="dashed" icon="rollback" style={{ marginTop: 20 }}>
              历史查看
            </Button>
          </List>
        </div>
      </div>
    );
  }
}
