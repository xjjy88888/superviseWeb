import React, { PureComponent } from "react";
import { Layout, Menu, Icon } from "antd";
import Layouts from "./Layouts";
import { Link } from "dva/router";

const { Sider, Content } = Layout;

const menuList = [
  {
    title: "用户管理",
    key: "/user",
    icon: "user",
    subMenu: [
      {
        title: "待审核账号",
        key: "/user/review"
      },
      {
        title: "社会用户",
        key: "/user/society"
      },
      {
        title: "行政用户",
        key: "/user/admin",
        subMenu: [
          {
            title: "账号管理",
            key: "/user/admin"
          },
          {
            title: "角色管理",
            key: "/user/role"
          }
        ]
      }
    ]
  },
  {
    title: "部门管理",
    key: "/departs",
    icon: "appstore",
    subMenu: []
  },
  {
    title: "数据字典",
    key: "/dict",
    icon: "book",
    subMenu: []
  },
  {
    title: "行政区划管理",
    key: "/district",
    icon: "global",
    subMenu: []
  },
  {
    title: "建设单位管理",
    key: "/company",
    icon: "bank",
    subMenu: []
  },
  {
    title: "水保行业单位管理",
    key: "/branch",
    icon: "solution",
    subMenu: []
  }
];
export default class system extends PureComponent {
  static defaultProps = {
    show: false
  };

  render() {
    const { children } = this.props;
    return (
      <Layouts>
        <Layout>
          <Sider width={240}>
            <Menu
              mode="inline"
              style={{
                height: window.innerHeight - 46
              }}
              selectedKeys={[localStorage.getItem("key")]}
              defaultOpenKeys={["/user"]}
              defaultSelectedKeys={["/user/review"]}
            >
              {menuList.map(item =>
                item.subMenu.length ? (
                  <Menu.SubMenu
                    defaultOpenKeys={["administrative"]}
                    key={item.key}
                    title={
                      <span>
                        <Icon type={item.icon || "setting"} />
                        <span>{item.title}</span>
                      </span>
                    }
                  >
                    {(item.subMenu || []).map(ite =>
                      ite.subMenu && ite.subMenu.length ? (
                        <Menu.SubMenu key={ite.key} title={ite.title}>
                          {(ite.subMenu || []).map(it => (
                            <Menu.Item key={it.key}>
                              <Link
                                to={`/system${it.key}`}
                                onClick={() => {
                                  console.log(it.key);
                                  localStorage.setItem("key", it.key);
                                }}
                              >
                                {it.title}
                              </Link>
                            </Menu.Item>
                          ))}
                        </Menu.SubMenu>
                      ) : (
                        <Menu.Item key={ite.key}>
                          <Link
                            to={`/system${ite.key}`}
                            onClick={() => {
                              console.log(ite.key);
                              localStorage.setItem("key", ite.key);
                            }}
                          >
                            {ite.title}
                          </Link>
                        </Menu.Item>
                      )
                    )}
                  </Menu.SubMenu>
                ) : (
                  <Menu.Item key={item.key}>
                    <Link
                      to={`/system${item.key}`}
                      onClick={() => {
                        console.log(item.key);
                        localStorage.setItem("key", item.key);
                      }}
                    >
                      <Icon type={item.icon} />
                      {item.title}
                    </Link>
                  </Menu.Item>
                )
              )}
            </Menu>
          </Sider>
          <Content style={{ padding: 30 }}>
            <div
              style={{
                padding: 20,
                backgroundColor: "#fff",
                borderRadius: 5
              }}
            >
              {children}
            </div>
          </Content>
        </Layout>
      </Layouts>
    );
  }
}
