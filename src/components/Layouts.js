import React, { PureComponent } from 'react';
import { Menu, Icon, Dropdown, Avatar, Layout, Typography } from 'antd';
import { connect } from 'dva';
import { Link } from 'dva/router';
import { LocaleProvider } from 'antd';
import zh_CN from 'antd/lib/locale-provider/zh_CN';

const { Header, Footer, Sider, Content } = Layout;
const { Text, Paragraph, Title } = Typography;

const menuList = [
  {
    title: '首页',
    icon: 'home',
    key: '/index',
    subMenu: []
  },
  {
    title: '区域监管',
    icon: 'radar-chart',
    key: '/region',
    subMenu: []
  },
  {
    title: '项目监管',
    icon: 'book',
    key: '/project',
    subMenu: [
      {
        title: '项目列表',
        key: '/project/list'
      },
      {
        title: '二维地图',
        key: '/project/map'
      },
      {
        title: '三维地图',
        key: '/project/cesiummap'
      }
    ]
  },
  {
    title: '系统管理',
    icon: 'setting',
    key: '/system',
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

    this.state = {
      current: active ? active : 'product'
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
        <Menu.Item
          onClick={() => {
            window.open('https://docs.qq.com/doc/DTEV2TGRsU0RNQUV0');
          }}
        >
          <Icon type="question-circle" />
          使用手册
        </Menu.Item>
        <Menu.Item>
          <Link
            to="/login"
            onClick={() => {
              localStorage.removeItem(`user`);
            }}
          >
            <Icon type="logout" style={{ marginRight: 10 }} />
            退出登录
          </Link>
        </Menu.Item>
      </Menu>
    );
    const user = JSON.parse(localStorage.getItem('user'));
    const displayName = user ? user.displayName : '';
    const departmentName = user ? user.departmentName : '';

    return (
      <LocaleProvider locale={zh_CN}>
        <Layout>
          <Header style={{ position: 'relative', height: 46, zIndex: 1001 }}>
            <span
              style={{
                lineHeight: '43px',
                // margin: "0 30px",
                float: 'left',
                height: '100%'
              }}
            >
              <Avatar src="./img/logo.png" />/
              <Link
                to="/region"
                style={{
                  margin: '0 10px',
                  color: '#fff'
                }}
              >
                水土保持监督管理信息移动采集系统管理端
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
                        <Icon type={item.icon || 'setting'} />
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
                margin: '0 20px',
                position: 'absolute',
                right: 0,
                top: -10,
                color: '#fff'
              }}
            >
              <Avatar style={{ backgroundColor: '#00a2ae' }}>
                {user ? displayName.slice(0, 1) : ''}
              </Avatar>
              <Dropdown overlay={menu}>
                <span> {user ? displayName : '请登录'}</span>
              </Dropdown>
              <span> {user ? `（${departmentName}）` : ''}</span>
            </span>
          </Header>
          <Content>{children}</Content>
        </Layout>
      </LocaleProvider>
    );
  }
}
