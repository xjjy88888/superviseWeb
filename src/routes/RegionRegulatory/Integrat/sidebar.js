import React, { PureComponent } from "react";
import {
  Menu,
  Icon,
  Button,
  Input,
  Radio,
  List,
  Avatar,
  Carousel,
  Form,
  Switch,
  DatePicker,
  message
} from "antd";
import moment from "moment";
import "leaflet/dist/leaflet.css";
import emitter from "../../../utils/event";

const { MonthPicker, RangePicker, WeekPicker } = DatePicker;
const dateFormat = "YYYY-MM-DD";
const formItemLayout = {
  labelCol: { span: 7 },
  wrapperCol: { span: 16 }
};
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

const pointData = [
  {
    title: "2018-02-03 08:00",
    project: "新建铁路广州至香港专线",
    desc: "该处存在明显水土流失"
  }
];

export default class integrat extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      show: true,
      showDetail: false,
      edit: false,
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
        }
      ],
      listData: projectData
    };
    this.map = null;
    this.saveRef = ref => {
      this.refDom = ref;
    };
  }

  componentDidMount() {
    this.eventEmitter = emitter.addListener("showProjectDetail", data => {
      this.setState({
        showDetail: data.isShow
      });
    });
    const { clientWidth, clientHeight } = this.refDom;
    this.setState({
      clientHeight: clientHeight
    });
  }

  submit = () => {
    const { edit } = this.state;
    this.setState({ edit: !edit });
    if (edit) {
      message.success("编辑成功");
    } else {
      message.info("开始编辑");
    }
  };

  switchShow = () => {
    this.setState({ show: !this.state.show, showDetail: false });
  };

  close = () => {
    this.setState({
      showDetail: false
    });
    emitter.emit("showSiderbarDetail", {
      show: false,
      from: "spot"
    });
  };

  switchShowDetail = () => {
    const { key, showDetail } = this.state;
    this.setState({
      showDetail: key === "project"
    });
    emitter.emit("showSiderbarDetail", {
      show: key !== "project",
      from: key
    });
    emitter.emit("showTool", {
      show: false
    });
    emitter.emit("showQuery", {
      show: false,
      type: 1
    });
  };

  getIconByType = key => {
    if (key === "project") {
      return "plus";
    } else if (key === "spot") {
      return "radius-upright";
    } else {
      return "compass";
    }
  };

  switchMenu = e => {
    emitter.emit("showSiderbarDetail", {
      show: false,
      from: "spot"
    });
    emitter.emit("showQuery", {
      show: false,
      type: 1
    });
    emitter.emit("showTool", {
      show: false,
      type: "control"
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
            value: "time"
          },
          {
            title: "立项级别",
            value: "level"
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
            value: "numb"
          },
          {
            title: "操作时间",
            value: "time"
          },
          {
            title: "复核状态",
            value: "state"
          }
        ]
      });
    } else {
      this.setState({
        placeholder: "标注点",
        listData: pointData,
        sort: [
          {
            title: "描述",
            value: "desc"
          },
          {
            title: "标注时间",
            value: "time"
          },
          {
            title: "关联项目",
            value: "proj"
          }
        ]
      });
    }
    this.setState({
      key: e.key
    });
  };

  sort = e => {
    const v = e.target.value;
    const key = v.slice(0, v.length - 1);
    const type = v.charAt(v.length - 1);
    console.log(key, type);
  };

  query = () => {
    const { key } = this.state;
    emitter.emit("showSiderbarDetail", {
      show: false
    });
    emitter.emit("showTool", {
      show: false,
      type: "tool"
    });
    emitter.emit("showQuery", {
      show: true,
      type: key
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
      edit,
      clientHeight,
      inputDisabled
    } = this.state;

    const showPoint = key === "point";

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
      <div
        style={{
          left: show ? 0 : "-400px",
          width: 400,
          backgroundColor: "#fff",
          position: "absolute",
          zIndex: 1000,
          height: "95vh"
        }}
        ref={this.saveRef}
      >
        <Icon
          type={show ? "left" : "right"}
          style={{
            fontSize: 30,
            position: "absolute",
            right: -50,
            top: "48%",
            backgroundColor: "rgba(0, 0, 0, 0.3)",
            borderRadius: "50%",
            padding: 10,
            cursor: "pointer"
          }}
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
            allowClear
            placeholder={`${placeholder}名`}
            onSearch={v => {
              if (v) {
                message.success(`查询${v}成功！`);
              } else {
                message.warning(`请输入查询信息！`);
              }
            }}
            style={{ padding: "20px 20px", width: 300 }}
            enterButton
          />
          <Icon
            type={this.getIconByType(key)}
            style={{
              fontSize: 20,
              position: "relative",
              top: 23,
              cursor: "pointer",
              color: "#1890ff"
            }}
          />

          <Radio.Group
            defaultValue="a"
            buttonStyle="solid"
            style={{ padding: "0px 20px" }}
            onClick={this.sort}
          >
            {sort.map((item, index) => (
              <Radio.Button
                key={index}
                value={item.value}
                focus={() => {
                  console.log(111);
                }}
              >
                {item.title}
              </Radio.Button>
            ))}
          </Radio.Group>
          <Button
            style={{
              display: showPoint ? "none" : "inline"
            }}
            onClick={this.query}
          >
            筛选
          </Button>
          <p style={{ padding: "20px 40px 0 20px" }}>
            <span>{`共有${listData.length}条记录`}</span>
            <span
              style={{
                float: "right",
                position: "relative",
                top: -5,
                display: showPoint ? "none" : "inline"
              }}
            >
              <Button
                type="dashed"
                icon="shopping"
                onClick={() => {
                  emitter.emit("showSiderbarDetail", {
                    show: false
                  });
                  emitter.emit("showTool", {
                    show: true,
                    type: "tool"
                  });
                  emitter.emit("showQuery", {
                    show: false,
                    type: 1
                  });
                }}
              >
                工具箱
              </Button>
              <Button
                type="dashed"
                icon="desktop"
                onClick={() => {
                  emitter.emit("showSiderbarDetail", {
                    show: false
                  });
                  emitter.emit("showTool", {
                    show: true,
                    type: "control",
                    typeChild: key
                  });
                  emitter.emit("showQuery", {
                    show: false,
                    type: 1
                  });
                }}
              >
                控制台
              </Button>
            </span>
          </p>
          <List
            style={{
              overflow: "auto",
              height: clientHeight ? clientHeight - 207 : 500,
              padding: "10px 20px 10px 20px"
            }}
            itemLayout="horizontal"
            dataSource={listData}
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
                        style={{
                          float: "right",
                          fontSize: 18,
                          cursor: "point",
                          color: "#1890ff"
                        }}
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
                          display: key === "spot" ? "block" : "none"
                        }}
                      >
                        <span>关联项目：{item.project}</span>
                        <br />
                        <span>扰动合规性：{item.standard}</span>
                      </span>
                      <span
                        style={{
                          display: key === "point" ? "block" : "none"
                        }}
                      >
                        <span>关联项目：{item.project}</span>
                        <br />
                        <span>描述：{item.desc}</span>
                      </span>
                    </p>
                  }
                  onClick={this.switchShowDetail}
                />
              </List.Item>
            )}
          />
        </div>
        <div
          style={{
            display: showDetail ? "block" : "none",
            height: "95vh",
            overflow: "auto",
            padding: 30
          }}
        >
          <Button
            type="dashed"
            icon="rollback"
            shape="circle"
            style={{
              float: "right",
              position: "absolute",
              color: "#1890ff",
              right: 20,
              zIndex: 1,
              top: 10
            }}
            onClick={this.close}
          />
          <Button
            type="dashed"
            icon={edit ? "check" : "edit"}
            shape="circle"
            style={{
              float: "right",
              position: "absolute",
              color: "#1890ff",
              right: 55,
              zIndex: 1,
              top: 10
            }}
            onClick={this.submit}
          />
          <Button
            type="dashed"
            icon="environment"
            shape="circle"
            style={{
              float: "right",
              position: "absolute",
              color: "#1890ff",
              right: 90,
              zIndex: 1,
              top: 10
            }}
          />
          <Form>
            <p>
              <b>项目详情</b>
            </p>
            <Form.Item label="项目名" {...formItemLayout}>
              <Input defaultValue={`矢量化类型`} disabled={!edit} />
            </Form.Item>
            <Form.Item label="建设单位" {...formItemLayout}>
              <Input defaultValue={`矢量化类型`} disabled={!edit} />
            </Form.Item>
            <Form.Item label="监管单位" {...formItemLayout}>
              <Input defaultValue={`矢量化类型`} disabled={!edit} />
            </Form.Item>
            <Form.Item label="批复机构" {...formItemLayout}>
              <Input defaultValue={`矢量化类型`} disabled={!edit} />
            </Form.Item>
            <Form.Item label="管理机构" {...formItemLayout}>
              <Input defaultValue={`矢量化类型`} disabled={!edit} />
            </Form.Item>
            <Form.Item label="立项级别" {...formItemLayout}>
              <Input defaultValue={`矢量化类型`} disabled={!edit} />
            </Form.Item>
            <Form.Item label="批复文号" {...formItemLayout}>
              <Input defaultValue={`矢量化类型`} disabled={!edit} />
            </Form.Item>
            <Form.Item label="批复机构" {...formItemLayout}>
              <Input defaultValue={`矢量化类型`} disabled={!edit} />
            </Form.Item>
            <Form.Item label="批复时间" {...formItemLayout}>
              <DatePicker
                disabled={!edit}
                defaultValue={moment("2019/01/01", dateFormat)}
              />
            </Form.Item>
            <Form.Item label="责任面积" {...formItemLayout}>
              <Input
                defaultValue={`矢量化类型`}
                disabled={!edit}
                addonAfter={`公顷`}
              />
            </Form.Item>
            <Form.Item label="项目类型" {...formItemLayout}>
              <Input defaultValue={`矢量化类型`} disabled={!edit} />
            </Form.Item>
            <Form.Item label="项目类别" {...formItemLayout}>
              <Input defaultValue={`矢量化类型`} disabled={!edit} />
            </Form.Item>
            <Form.Item label="项目性质" {...formItemLayout}>
              <Input defaultValue={`矢量化类型`} disabled={!edit} />
            </Form.Item>
            <Form.Item label="建设状态" {...formItemLayout}>
              <Input defaultValue={`矢量化类型`} disabled={!edit} />
            </Form.Item>
            <Form.Item label="项目合规性" {...formItemLayout}>
              <Input defaultValue={`矢量化类型`} disabled={!edit} />
            </Form.Item>
            <Form.Item label="涉及县" {...formItemLayout}>
              <Input defaultValue={`矢量化类型`} disabled={!edit} />
            </Form.Item>
            <Form.Item label="位置" {...formItemLayout}>
              <Input defaultValue={`矢量化类型`} disabled={!edit} />
            </Form.Item>
            <Form.Item label="备注" {...formItemLayout}>
              <Input defaultValue={`矢量化类型`} disabled={!edit} />
            </Form.Item>
            <Form.Item label="设计阶段" {...formItemLayout}>
              <Input defaultValue={`可研`} disabled={!edit} />
            </Form.Item>
          </Form>
          <List
            style={{
              width: 350,
              position: "relation",
              padding: "0 20px"
            }}
          >
            <List.Item>
              <List.Item.Meta
                title={
                  <span>
                    防治责任范围：1
                    <Icon
                      type="plus"
                      style={{
                        padding: 10,
                        fontSize: 18,
                        cursor: "point",
                        color: "#1890ff"
                      }}
                    />
                  </span>
                }
                description={
                  <p onClick={() => {}} style={{ cursor: "pointer" }}>
                    <span>
                      设计阶段:可研
                      <Icon
                        type="environment"
                        style={{
                          float: "right",
                          fontSize: 18,
                          cursor: "point",
                          color: "#1890ff"
                        }}
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
                    <Icon
                      type="link"
                      style={{
                        padding: 10,
                        fontSize: 18,
                        cursor: "point",
                        color: "#1890ff"
                      }}
                    />
                    <Icon
                      type="plus"
                      style={{
                        paddingRight: 10,
                        fontSize: 18,
                        cursor: "point",
                        color: "#1890ff"
                      }}
                    />
                    <Switch
                      checkedChildren="归档图斑"
                      unCheckedChildren="非归档图斑"
                    />
                  </span>
                }
                description={
                  <p
                    onClick={() => {
                      emitter.emit("showSiderbarDetail", {
                        show: true,
                        from: "spot"
                      });
                      emitter.emit("showTool", {
                        show: false
                      });
                      emitter.emit("showQuery", {
                        show: false,
                        type: 1
                      });
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    <span>
                      2017154_14848_4848
                      <Icon
                        type="environment"
                        style={{
                          float: "right",
                          fontSize: 18,
                          cursor: "point",
                          color: "#1890ff"
                        }}
                      />
                    </span>
                    <br />
                    <span>
                      2017154_14848_4848
                      <Icon
                        type="environment"
                        style={{
                          float: "right",
                          fontSize: 18,
                          cursor: "point",
                          color: "#1890ff"
                        }}
                      />
                    </span>
                    <br />
                    <span>
                      2017154_14848_4848
                      <Icon
                        type="environment"
                        style={{
                          float: "right",
                          fontSize: 18,
                          cursor: "point",
                          color: "#1890ff"
                        }}
                      />
                    </span>
                  </p>
                }
              />
            </List.Item>
            <Carousel autoplay>
              <img src="./img/spot.jpg" />
              <img src="./img/spot2.jpg" />
              <img src="./img/spot.jpg" />
              <img src="./img/spot2.jpg" />
            </Carousel>
            <Button
              type="dashed"
              icon="cloud-download"
              style={{ marginTop: 20 }}
            >
              项目归档
            </Button>
            <Button type="dashed" icon="rollback" style={{ marginLeft: 20 }}>
              撤销归档
            </Button>
          </List>
        </div>
      </div>
    );
  }
}
