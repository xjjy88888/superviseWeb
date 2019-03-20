import React, { PureComponent } from "react";
import { Menu, Icon, Button, Input } from "antd";
import styles from "./sidebar.less";
import "leaflet/dist/leaflet.css";

export default class integrat extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      show: true,
      key: "project",
      placeholder: "项目"
    };
    this.map = null;
  }

  switch = () => {
    this.setState({ show: !this.state.show });
  };

  getPlaceholder = value => {
    if (value === "project") {
      return "项目";
    } else if (value === "spot") {
      return "图斑";
    } else {
      return "标注点";
    }
  };

  render() {
    const { show, placeholder, key } = this.state;

    const tabs = [
      {
        title: "项目",
        key: ["project"]
      },
      {
        title: "图斑",
        key: ["spot"]
      },
      {
        title: "标注点",
        key: ["point"]
      }
    ];
    return (
      <div className={styles.sidebar} style={{ left: show ? 0 : "-300px" }}>
        <Menu mode="horizontal" defaultSelectedKeys={["project"]}>
          {tabs.map((item, index) => (
            <Menu.Item
              key={item.key}
              onClick={e => {
                this.setState({
                  key: e.key,
                  placeholder: this.getPlaceholder(e.key)
                });
              }}
            >
              {item.title}
            </Menu.Item>
          ))}
        </Menu>
        <Icon
          className={styles.icon}
          type={show ? "left" : "right"}
          style={{ fontSize: 30 }}
          onClick={this.switch}
        />
        <Input.Search
          placeholder={`${placeholder}名`}
          onSearch={value => console.log(value)}
          style={{ padding: 20, width: 300 }}
          enterButton
        />
      </div>
    );
  }
}
