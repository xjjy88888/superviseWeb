import React, { PureComponent } from "react";
import { Menu, Icon, Button, Input, Radio, List, Avatar } from "antd";
import styles from "./sidebar.less";
import "leaflet/dist/leaflet.css";
import emitter from "../../../utils/event";

const projectData = [
  {
    title: "新建铁路广州至香港专线",
    owner: "广州铁路局",
    reply: "广州水利局"
  },
  {
    title: "新建铁路广州至香港专线",
    owner: "广州铁路局",
    reply: "广州水利局"
  },
  {
    title: "新建铁路广州至香港专线",
    owner: "广州铁路局",
    reply: "广州水利局"
  },
  {
    title: "新建铁路广州至香港专线",
    owner: "广州铁路局",
    reply: "广州水利局"
  },
  {
    title: "新建铁路广州至香港专线",
    owner: "广州铁路局",
    reply: "广州水利局"
  },
  {
    title: "新建铁路广州至香港专线",
    owner: "广州铁路局",
    reply: "广州水利局"
  },
  {
    title: "新建铁路广州至香港专线",
    owner: "广州铁路局",
    reply: "广州水利局"
  },
  {
    title: "新建铁路广州至香港专线",
    owner: "广州铁路局",
    reply: "广州水利局"
  }
];

const spotData = [
  {
    title: "2017_7897489_49687",
    project: "新建铁路广州至香港专线",
    standard: "疑似超出防治责任范围"
  },
  {
    title: "2017_7897489_49687",
    project: "新建铁路广州至香港专线",
    standard: "疑似超出防治责任范围"
  },
  {
    title: "2017_7897489_49687",
    project: "新建铁路广州至香港专线",
    standard: "疑似超出防治责任范围"
  }
];
export default class integrat extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      show: true,
      siderbarDetail: false,
      showDetail: false,
      key: "project",
      inputDisabled: true,
      placeholder: "项目",
      sort: [
        {
          title: "名称",
          value: "name"
        },
        {
          title: "操作时间",
          value: "time1"
        },
        {
          title: "立项级别",
          value: "level"
        },
        {
          title: "筛选",
          value: "search1"
        }
      ],
      listData: projectData
    };
    this.map = null;
  }

  switchShow = () => {
    this.setState({ show: !this.state.show, showDetail: false });
  };

  close = () => {
    this.setState({
      showDetail: false,
      siderbarDetail: false
    });
    emitter.emit("showSiderbarDetail", {
      isShow: false,
      from: "spot"
    });
  };

  switchShowDetail = () => {
    const { key, siderbarDetail, showDetail } = this.state;
    if (key === "project") {
      this.setState({
        showDetail: !showDetail,
        siderbarDetail: !siderbarDetail
      });
      emitter.emit("showSiderbarDetail", {
        isShow: siderbarDetail,
        from: "spot"
      });
    } else {
      this.setState({
        siderbarDetail: !siderbarDetail
      });
      emitter.emit("showSiderbarDetail", {
        isShow: !siderbarDetail,
        from: "spot"
      });
    }
  };

  switchMenu = e => {
    this.setState({
      siderbarDetail: false
    });
    emitter.emit("showSiderbarDetail", {
      isShow: false,
      from: "spot"
    });
    if (e.key === "project") {
      this.setState({
        placeholder: "项目",
        listData: projectData,
        sort: [
          {
            title: "名称",
            value: "name"
          },
          {
            title: "操作时间",
            value: "time1"
          },
          {
            title: "立项级别",
            value: "level"
          },
          {
            title: "筛选",
            value: "search1"
          }
        ]
      });
    } else if (e.key === "spot") {
      this.setState({
        placeholder: "图斑",
        listData: spotData,
        sort: [
          {
            title: "编号",
            value: "number"
          },
          {
            title: "操作时间",
            value: "time2"
          },
          {
            title: "复核状态",
            value: "state"
          },
          {
            title: "筛选",
            value: "search2"
          }
        ]
      });
    } else {
      this.setState({
        placeholder: "标注点",
        listData: projectData.slice(0, 1),
        sort: [
          {
            title: "标注点",
            value: "point"
          },
          {
            title: "筛选",
            value: "search3"
          }
        ]
      });
    }
    this.setState({
      key: e.key
    });
  };

  render() {
    const {
      show,
      placeholder,
      sort,
      listData,
      showDetail,
      key,
      inputDisabled,
      siderbarDetail
    } = this.state;

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
      <div className={styles.sidebar} style={{ left: show ? 0 : "-350px" }}>
        <Icon
          className={styles.icon}
          type={show ? "left" : "right"}
          style={{ fontSize: 30 }}
          onClick={this.switchShow}
        />
        <div
          style={{
            display: showDetail ? "none" : "block"
          }}
        >
          <Menu mode="horizontal" defaultSelectedKeys={["project"]}>
            {tabs.map(item => (
              <Menu.Item key={item.key} onClick={this.switchMenu}>
                {item.title}
              </Menu.Item>
            ))}
          </Menu>
          <Input.Search
            placeholder={`${placeholder}名`}
            onSearch={value => console.log(value)}
            style={{ padding: "20px 20px", width: 300 }}
            enterButton
          />
          <Radio.Group
            defaultValue="a"
            buttonStyle="solid"
            style={{ padding: "0px 20px" }}
          >
            {sort.map((item, index) => (
              <Radio.Button key={index} value={item.value}>
                {item.title}
              </Radio.Button>
            ))}
          </Radio.Group>
          <List
            style={{
              overflow: "auto",
              height: "75vh",
              padding: "20px 20px 10px 20px"
            }}
            itemLayout="horizontal"
            dataSource={listData}
            header={
              <p>
                <span>{`共有${listData.length}条数据`}</span>
                <span style={{ float: "right", position: "relative", top: -5 }}>
                  <Button type="dashed" icon="shopping">
                    工具箱
                  </Button>
                  <Button type="dashed" icon="desktop">
                    控制台
                  </Button>
                </span>
              </p>
            }
            renderItem={item => (
              <List.Item>
                <List.Item.Meta
                  style={{
                    cursor: "pointer"
                  }}
                  title={
                    <p>
                      <span>{item.title}</span>
                      <Icon
                        type="environment"
                        theme="twoTone"
                        style={{ float: "right" }}
                      />
                    </p>
                  }
                  description={
                    <p>
                      <span
                        style={{
                          display: key === "project" ? "block" : "none"
                        }}
                      >
                        <span>建设单位：{item.owner}</span>
                        <br />
                        <span>批复机构：{item.reply}</span>
                      </span>
                      <span
                        style={{
                          display: key !== "project" ? "block" : "none"
                        }}
                      >
                        <span>关联项目：{item.project}</span>
                        <br />
                        <span>扰动合规性：{item.standard}</span>
                      </span>
                    </p>
                  }
                  onClick={this.switchShowDetail}
                />
              </List.Item>
            )}
          />
        </div>
        <div style={{ display: showDetail ? "block" : "none" }}>
          <List
            style={{
              padding: 20,
              overflow: "auto",
              height: "90vh",
              width: 350,
              position: "relation"
            }}
          >
            <Button
              type="dashed"
              icon="close"
              shape="circle"
              style={{
                float: "right",
                position: "absolute",
                right: -10,
                top: -10
              }}
              onClick={this.close}
            />
            <List.Item style={{ paddingTop: 30 }}>
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
                defaultValue="新建铁路广州至香港专线"
              />
            </List.Item>
            <List.Item>
              <List.Item.Meta
                title={
                  <span>
                    防治责任范围：1
                    <Icon type="tags" theme="twoTone" style={{ padding: 10 }} />
                  </span>
                }
                description={
                  <p
                    onClick={() => {
                      this.setState({
                        siderbarDetail: !siderbarDetail
                      });
                      emitter.emit("showSiderbarDetail", {
                        isShow: siderbarDetail,
                        from: "duty"
                      });
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    <span>
                      设计阶段:可研
                      <Icon
                        type="environment"
                        theme="twoTone"
                        style={{ float: "right" }}
                      />
                    </span>
                  </p>
                }
              />
            </List.Item>
            <List.Item>
              <List.Item.Meta
                title={
                  <span>
                    扰动图斑：3
                    <Icon type="tags" theme="twoTone" style={{ padding: 10 }} />
                  </span>
                }
                description={
                  <p
                    onClick={() => {
                      this.setState({
                        siderbarDetail: !siderbarDetail
                      });
                      emitter.emit("showSiderbarDetail", {
                        isShow: siderbarDetail,
                        from: "spot"
                      });
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    <span>
                      2017154_14848_4848
                      <Icon
                        type="environment"
                        theme="twoTone"
                        style={{ float: "right" }}
                      />
                    </span>
                    <br />
                    <span>
                      2017154_14848_4848
                      <Icon
                        type="environment"
                        theme="twoTone"
                        style={{ float: "right" }}
                      />
                    </span>
                    <br />
                    <span>
                      2017154_14848_4848
                      <Icon
                        type="environment"
                        theme="twoTone"
                        style={{ float: "right" }}
                      />
                    </span>
                  </p>
                }
              />
            </List.Item>
            <List.Item>建设单位：</List.Item>
            <List.Item>监管单位：</List.Item>
            <List.Item>批复机构：</List.Item>
            <List.Item>立项级别：</List.Item>
            <List.Item>批复文号：</List.Item>
            <List.Item>批复时间：</List.Item>
            <List.Item>项目类型：</List.Item>
            <List.Item>项目类别：</List.Item>
            <List.Item>项目性质：</List.Item>
            <List.Item>建设状态：</List.Item>
            <List.Item>项目合规性：</List.Item>
            <List.Item>涉及县：</List.Item>
            <List.Item>
              <List.Item.Meta
                title={
                  <div>
                    位置：
                    <Icon
                      type="environment"
                      theme="twoTone"
                      style={{ float: "right" }}
                    />
                  </div>
                }
              />
            </List.Item>
            <List.Item>备注：</List.Item>
            <img
              style={{ width: 90 }}
              src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png"
            />
            <img
              style={{ width: 90 }}
              src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png"
            />
            <img
              style={{ width: 90 }}
              src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png"
            />
            <img
              style={{ width: 90 }}
              src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png"
            />
            <img
              style={{ width: 90 }}
              src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png"
            />
          </List>
        </div>
      </div>
    );
  }
}
