import React, { PureComponent } from "react";

import { Carousel, Icon } from "antd";

import styles from "./index.less";

export default class MyCarousel extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {}

  gotoDetail = () => {};

  render() {
    const { list } = this.props;
    return (
      <div className={styles.carousel}>
        <Carousel autoplay dots={false}>
          {list &&
            list.length &&
            list.map((item, index) => (
              <div key={index}>
                <Icon
                  style={{
                    color: item.icon === "warn" ? "orange" : "red",
                    marginRight: 8
                  }}
                  type={
                    item.icon === "warn" ? "exclamation-circle" : "close-circle"
                  }
                />
                {item.text}
              </div>
            ))}
        </Carousel>
      </div>
    );
  }
}
