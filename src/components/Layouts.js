import React, { PureComponent } from "react";
import { Menu, Icon, Dropdown, Avatar, Layout, Typography } from "antd";
import { connect } from "dva";
import { Link } from "dva/router";
import { LocaleProvider } from "antd";
import zh_CN from "antd/lib/locale-provider/zh_CN";

const { Header, Footer, Sider, Content } = Layout;
const { Text, Paragraph, Title } = Typography;

const menuList = [
  {
    title: "首页",
    icon: "home",
    key: "homePage",
    subMenu: []
  },
  {
    title: "区域监管",
    icon: "radar-chart",
    key: "regionalSupervision",
    subMenu: [
      {
        title: "天地一体化",
        key: "regionalSupervision/integration",
        index: "201"
      },
      {
        title: "地图分屏",
        key: "regionalSupervision/splitScreen",
        index: "202"
      }
    ]
  },
  {
    title: "项目监管",
    icon: "book",
    key: "projectSupervision",
    subMenu: []
  },
  {
    title: "系统管理",
    icon: "setting",
    key: "system",
    subMenu: []
  }
];

@connect(({ user }) => ({
  user
}))
export default class layouts extends PureComponent {
  constructor(props) {
    super(props);
    const { active } = this.props;

    // 状态
    this.state = {
      current: active ? active : "product"
    };
  }

  render() {
    const { children } = this.props;
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
      <LocaleProvider locale={zh_CN}>
        <Layout>
          <Header style={{ position: "relative", height: 46 }}>
            <span
              style={{
                lineHeight: "43px",
                // margin: "0 30px",
                float: "left",
                height: "100%"
              }}
            >
              <Avatar src="./img/logo.png" />/
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
              mode="horizontal"
              theme="dark"
              selectedKeys={[this.state.current]}
            >
              {menuList.map((item, index) =>
                item.subMenu.length ? (
                  <Menu.SubMenu
                    key={item.key}
                    title={
                      <span>
                        <Icon type={item.icon || "setting"} />
                        <span>{item.title}</span>
                      </span>
                    }
                  >
                    {(item.subMenu || []).map((ite, ind) =>
                      ite.subMenu && ite.subMenu.length ? (
                        <Menu.SubMenu key={ite.key} title={ite.title}>
                          {(ite.subMenu || []).map((it, id) => (
                            <Menu.Item key={it.key}>
                              <Link to={`/${it.key}`}>{it.title}</Link>
                            </Menu.Item>
                          ))}
                        </Menu.SubMenu>
                      ) : (
                        <Menu.Item key={ite.key}>
                          <Link to={`/${ite.key}`}>{ite.title}</Link>
                        </Menu.Item>
                      )
                    )}
                  </Menu.SubMenu>
                ) : (
                  <Menu.Item key={item.key}>
                    <Link to={`/${item.key}`}>
                      <Icon type={item.icon} />
                      {item.title}
                    </Link>
                  </Menu.Item>
                )
              )}
            </Menu>
            <span
              // className={styles.right}
              style={{
                margin: "0 20px",
                position: "absolute",
                right: 30,
                top: -10,
                color: "#fff"
              }}
            >
              <Avatar style={{ backgroundColor: "#00a2ae" }}>
                {user ? username.slice(0, 1) : ""}
              </Avatar>
              <Dropdown overlay={menu}>
                <span> {user ? username : "请登录"}</span>
              </Dropdown>
            </span>
          </Header>
          <Content>{children}</Content>
        </Layout>
      </LocaleProvider>
    );
  }
}
