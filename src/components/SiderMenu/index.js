import React, { PureComponent } from "react";
import { Menu, Icon, Button, Popover, Dropdown } from "antd";
import { connect } from "dva";
import { withRouter, Link } from "dva/router";
import styles from "./index.less";

const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;

@connect(({ user }) => ({
  user
}))
export default class SiderMenu extends PureComponent {
  constructor(props) {
    super(props);
    const { active } = this.props;

    // 状态
    this.state = {
      openKeys: active ? [active.slice(0, 1)] : ["1"],
      defaultSelectedKeys: active ? [active] : ["101"]
    };
  }

  rootSubmenuKeys = ["1", "2", "3", "4"];

  onOpenChange = openKeys => {
    const latestOpenKey = openKeys.find(
      key => this.state.openKeys.indexOf(key) === -1
    );
    if (this.rootSubmenuKeys.indexOf(latestOpenKey) === -1) {
      this.setState({ openKeys });
    } else {
      this.setState({
        openKeys: latestOpenKey ? [latestOpenKey] : []
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
    const tabs = [
      {
        title: "首页",
        keys: "1",
        icon: "home",
        path: "/home/welcome",
        items: [
          {
            text: "首页",
            path: "/home/welcome",
            key: "101"
          }
          // {
          //   text: "首页2",
          //   path: "/home/home2",
          //   key: "102"
          // }
        ]
      },
      {
        title: "区域监管",
        keys: "2",
        icon: "environment",
        path: "/regionRegulatory/integrat",
        items: [
          {
            text: "天地一体化",
            path: "/regionRegulatory/integrat",
            key: "201"
          }
          // {
          //   text: "区域监管2",
          //   path: "/regionRegulatory/regionRegulatory2",
          //   key: "202"
          // }
        ]
      },
      {
        title: "项目监管",
        keys: "3",
        icon: "book",
        path: "/projectRegulatory/projectRegulatory1",
        items: [
          {
            text: "项目监管",
            path: "/projectRegulatory/projectRegulatory1",
            key: "301"
          }
          // {
          //   text: "项目监管2",
          //   path: "/projectRegulatory/projectRegulatory2",
          //   key: "302"
          // }
        ]
      }
      // {
      //   title: "责任追究",
      //   keys: "4",
      //   icon: "bell",
      //   items: [
      //     {
      //       text: "责任追究1",
      //       path: "/accountability/accountability1",
      //       key: "401"
      //     },
      //     {
      //       text: "责任追究2",
      //       path: "/accountability/accountability2",
      //       key: "402"
      //     }
      //   ]
      // },
      // {
      //   title: "目标考核",
      //   keys: "5",
      //   icon: "form",
      //   items: [
      //     {
      //       text: "目标考核1",
      //       path: "/assess/assess1",
      //       key: "501"
      //     },
      //     {
      //       text: "目标考核2",
      //       path: "/assess/assess2",
      //       key: "502"
      //     }
      //   ]
      // }
    ];
    return (
      <div className={styles.main}>
        <div className={styles.left}>
          <img src="./img/logo.png" />
          <Link
            className={styles.text}
            to="/regionRegulatory/integrat"
          >
            生产建设项目水土保持信息化监管系统
          </Link>
        </div>
        <Menu
          className={styles.menu}
          mode="horizontal"
          theme="dark"
          // openKeys={this.state.openKeys}
          onOpenChange={this.onOpenChange}
          defaultSelectedKeys={this.state.defaultSelectedKeys}
        >
          {tabs.map(item => (
            <Menu.Item key={item.keys}>
              <Link to={item.path}>{item.title}</Link>
            </Menu.Item>
            // <SubMenu
            //   key={item.keys}
            //   title={
            //     <span>
            //       <Icon type={item.icon} />
            //       <Link to={item.path}>
            //         <span>{item.title}</span>
            //       </Link>
            //     </span>
            //   }
            // >
            //   {/* {item.items.map(ite => (
            //     <Menu.Item key={ite.key}>
            //       <Link to={ite.path}>{ite.text}</Link>
            //     </Menu.Item>
            //   ))} */}
            // </SubMenu>
          ))}
        </Menu>
        <div className={styles.right} style={{ margin: "0 20px" }}>
          <Icon type="user" style={{ margin: "0 10px" }} />
          <Dropdown overlay={menu}>
            <span> {user ? username : "请登录"}</span>
          </Dropdown>
        </div>
      </div>
    );
  }
}
