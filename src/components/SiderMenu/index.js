import React, { PureComponent } from "react";
import { Menu, Icon, Dropdown, Avatar } from "antd";
import { connect } from "dva";
import { Link } from "dva/router";
import styles from "./index.less";

const menuList = [
  {
    title: "首页",
    index: "1",
    icon: "home",
    key: "home/welcome",
    subMenu: []
  },
  {
    title: "区域监管",
    index: "2",
    icon: "environment",
    subMenu: [
      {
        title: "天地一体化",
        key: "regionRegulatory/integrat",
        index: "201"
      },
      {
        title: "地图分屏",
        key: "regionRegulatory/splitScreen",
        index: "202"
      }
    ]
  },
  {
    title: "项目监管",
    index: "3",
    icon: "book",
    key: "projectRegulatory/projectRegulatory1",
    subMenu: []
  }
];

@connect(({ user }) => ({
  user
}))
export default class SiderMenu extends PureComponent {
  constructor(props) {
    super(props);
    const { active } = this.props;

    // 状态
    this.state = {
      openindex: active ? [active.slice(0, 1)] : ["1"],
      defaultSelectedindex: active ? [active] : ["101"]
    };
  }

  rootSubmenuindex = ["1", "2", "3", "4"];

  onOpenChange = openindex => {
    const latestOpenindex = openindex.find(
      index => this.state.openindex.indexOf(index) === -1
    );
    if (this.rootSubmenuindex.indexOf(latestOpenindex) === -1) {
      this.setState({ openindex });
    } else {
      this.setState({
        openindex: latestOpenindex ? [latestOpenindex] : []
      });
    }
  };

  render() {
    const menu = (
      <Menu>
        <Menu.Item>
          <Icon type="user" />
          个人中心
        </Menu.Item>
        <Menu.Item>
          <Icon type="setting" />
          个人设置
        </Menu.Item>
        <Menu.Item
          onClick={() => {
            this.props.dispatch({
              type: "user/loginOut"
            });
          }}
        >
          <Icon type="logout" />
          退出登录
        </Menu.Item>
      </Menu>
    );
    const user = JSON.parse(sessionStorage.getItem("user"));
    const username = user ? user.displayName : "请登录";

    return (
      <div className={styles.main}>
        {/* <div className={styles.left}>
          <img src="./img/logo.png" alt="" />
          <Link className={styles.title} to="/regionRegulatory/integrat">
            生产建设项目水土保持信息化监管系统
          </Link>
        </div> */}
        <span
          style={{
            lineHeight: "50px",
            margin: "0 30px"
          }}
        >
          <Avatar src="./img/logo.png" />
          <span
            style={{
              margin: "0 10px",
              color: "#fff"
            }}
          >
            生产建设项目水土保持信息化监管系统
          </span>
        </span>
        <Menu
          className={styles.menu}
          mode="horizontal"
          theme="dark"
          // openindex={this.state.openindex}
          onOpenChange={this.onOpenChange}
          defaultSelectedindex={this.state.defaultSelectedindex}
        >
          {menuList.map(item =>
            item.subMenu.length ? (
              <Menu.SubMenu
                defaultOpenindex={["administrative"]}
                key={item.index}
                title={
                  <span>
                    <Icon type={item.icon || "setting"} />
                    <span>{item.title}</span>
                  </span>
                }
              >
                {(item.subMenu || []).map(ite =>
                  ite.subMenu && ite.subMenu.length ? (
                    <Menu.SubMenu key={ite.index} title={ite.title}>
                      {(ite.subMenu || []).map(it => (
                        <Menu.Item key={it.index}>
                          <Link to={`/${it.key}`}>{it.title}</Link>
                        </Menu.Item>
                      ))}
                    </Menu.SubMenu>
                  ) : (
                    <Menu.Item key={ite.index}>
                      <Link to={`/${ite.key}`}>{ite.title}</Link>
                    </Menu.Item>
                  )
                )}
              </Menu.SubMenu>
            ) : (
              <Menu.Item key={item.index}>
                <Link to={`/${item.key}`}>
                  <Icon type={item.icon} />
                  {item.title}
                </Link>
              </Menu.Item>
            )
          )}
        </Menu>
        <div className={styles.right} style={{ margin: "0 20px" }}>
          {/* <Icon type="user" style={{ margin: "0 10px" }} /> */}
          <Avatar style={{ backgroundColor: "#00a2ae" }}>
            {user ? username.slice(0, 1) : ""}
          </Avatar>
          <Dropdown overlay={menu}>
            <span> {user ? username : "请登录"}</span>
          </Dropdown>
        </div>
      </div>
    );
  }
}
