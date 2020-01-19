import React, { PureComponent } from "react";
import { connect } from "dva";
import MyCarousel from "@/components/Carousel";
import MySteps from "@/components/Steps";

import Add from "./components/SuperviseAdd";
import Detail from "./components/SuperviseDetail";

import { Button, Badge, Icon } from "antd";

import styles from "./styles/AcceptanceFiling.less";

const list = [
  {
    id: 0,
    text: "2019年12月12日验收备案整改意见答复时间还剩2天！",
    icon: "warn"
  },
  {
    id: 0,
    text: "2020年12月12日验收备案整改意见答复时间还剩2天！",
    icon: "warn"
  },
  {
    id: 0,
    text: "2021年12月12日验收备案整改意见答复时间还剩2天！",
    icon: "warn"
  },
  {
    id: 0,
    text: "2022年12月12日验收备案整改意见答复时间还剩2天！",
    icon: "warn"
  },
  {
    id: 0,
    text: "2023年12月12日验收备案整改意见答复时间还剩2天！",
    icon: "warn"
  },
  {
    id: 0,
    text: "2019年12月12日验收备案整改意见答复时间还剩2天！",
    icon: "warn"
  },
  {
    id: 0,
    text: "2019年12月12日验收备案整改意见答复时间还剩2天！",
    icon: "warn"
  }
];

// 验收备案
@connect(({ waterKeep }) => ({
  waterKeep
}))
export default class Supervise extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      showAddComponent: false
    };
  }

  componentDidMount() {}
  // 新增一个验收备案项
  addNewAccept = status => {
    this.setState({ showAddComponent: status });
  };

  hide = () => {
    const { dispatch } = this.props;
    dispatch({
      type: "waterKeep/save",
      payload: {
        showwaterKeepPage: ""
      }
    });
  };

  render() {
    const { showAddComponent } = this.state;
    return (
      <div
        className={styles["accept-panel"]}
        style={{ width: window.innerWidth - 350 }}
      >
        <div className={styles.header}>
          <Icon type="left" onClick={this.hide} />
          <div className={styles.title}>
            验收备案<span>5</span>
          </div>
          <Button type="primary" onClick={this.addNewAccept.bind(this, true)}>
            新增
          </Button>
        </div>
        <div className={styles.container}>
          {/* {showAddComponent ? <Add addNewAccept={this.addNewAccept} /> : null} */}
          {list && list.length ? <MyCarousel list={list} /> : null}
          <MySteps />
          <Detail list={list} />
        </div>
      </div>
    );
  }
}
