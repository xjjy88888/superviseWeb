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
    key: "/homePage",
    subMenu: []
  },
  {
    title: "区域监管",
    icon: "radar-chart",
    key: "/regionalSupervision",
    subMenu: [
      {
        title: "天地一体化",
        key: "/regionalSupervision/integration"
      },
      {
        title: "地图分屏",
        key: "/regionalSupervision/splitScreen"
      }
    ]
  },
  {
    title: "项目监管",
    icon: "book",
    key: "/projectSupervision",
    subMenu: []
  },
  {
    title: "系统管理",
    icon: "setting",
    key: "/system",
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
        <Menu.Item>
          <Link to="/login">
            <Icon type="logout" style={{ marginRight: 10 }} />
            退出登录
          </Link>
        </Menu.Item>
      </Menu>
    );
    const user = JSON.parse(sessionStorage.getItem("user"));
    const displayName = user ? user.displayName : "";
    const departmentName = user ? user.departmentName : "";

    return (
      <LocaleProvider locale={zh_CN}>
        <Layout>
          <Header style={{ position: "relative", height: 46, zIndex: 1001 }}>
            <span
              style={{
                lineHeight: "43px",
                // margin: "0 30px",
                float: "left",
                height: "100%"
              }}
            >
              <Avatar src="./img/logo.png" />/
              <Link
                to="/regionalSupervision/integration"
                style={{
                  margin: "0 10px",
                  color: "#fff"
                }}
              >
                生产建设项目水土保持信息化监管系统
              </Link>
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
                              <Link to={it.key}>{it.title}</Link>
                            </Menu.Item>
                          ))}
                        </Menu.SubMenu>
                      ) : (
                        <Menu.Item key={ite.key}>
                          <Link to={ite.key}>{ite.title}</Link>
                        </Menu.Item>
                      )
                    )}
                  </Menu.SubMenu>
                ) : (
                  <Menu.Item key={item.key}>
                    <Link to={item.key}>
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
                right: 0,
                top: -10,
                color: "#fff"
              }}
            >
              <Avatar style={{ backgroundColor: "#00a2ae" }}>
                {user ? displayName.slice(0, 1) : ""}
              </Avatar>
              <Dropdown overlay={menu}>
                <span> {user ? displayName : "请登录"}</span>
              </Dropdown>
              <span> {user ? `（${departmentName}）` : ""}</span>
            </span>
          </Header>
          <Content>{children}</Content>
        </Layout>
      </LocaleProvider>
    );
  }
}
