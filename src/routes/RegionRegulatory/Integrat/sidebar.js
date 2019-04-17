import React, { PureComponent } from "react";
import {
  Menu,
  Icon,
  Button,
  Input,
  Radio,
  List,
  Avatar,
  Upload,
  Modal,
  TreeSelect,
  Cascader,
  Carousel,
  Checkbox,
  Form,
  Switch,
  DatePicker,
  InputNumber,
  AutoComplete,
  message
} from "antd";
import moment from "moment";
import "leaflet/dist/leaflet.css";
import emitter from "../../../utils/event";
import config from "../../../config";

const { MonthPicker, RangePicker, WeekPicker } = DatePicker;
const dateFormat = "YYYY-MM-DD";
const TreeNode = TreeSelect.TreeNode;
const CheckboxGroup = Checkbox.Group;
const formItemLayout = {
  labelCol: { span: 7 },
  wrapperCol: { span: 16 }
};

const projectData = [
  {
    title:
      "1金秀瑶族自治县2018年第二批农网改造升级工程头排镇夏塘村古灯配电台区工程等12个项目",
    owner: "东莞市清溪房地产开发公司、东莞市荔园实业投资有限公司",
    reply: "广东省南粤交通云湛高速公路管理中心新阳管理处"
  },
  {
    title:
      "12金秀瑶族自治县2018年第二批农网改造升级工程头排镇夏塘村古灯配电台区工程等12个项目",
    owner: "东莞市清溪房地产开发公司、东莞市荔园实业投资有限公司",
    reply: "广东省南粤交通云湛高速公路管理中心新阳管理处"
  },
  {
    title:
      "123金秀瑶族自治县2018年第二批农网改造升级工程头排镇夏塘村古灯配电台区工程等12个项目",
    owner: "东莞市清溪房地产开发公司、东莞市荔园实业投资有限公司",
    reply: "广东省南粤交通云湛高速公路管理中心新阳管理处"
  },
  {
    title:
      "1234金秀瑶族自治县2018年第二批农网改造升级工程头排镇夏塘村古灯配电台区工程等12个项目",
    owner: "东莞市清溪房地产开发公司、东莞市荔园实业投资有限公司",
    reply: "广东省南粤交通云湛高速公路管理中心新阳管理处"
  },
  {
    title:
      "金秀瑶族自治县2018年第二批农网改造升级工程头排镇夏塘村古灯配电台区工程等12个项目",
    owner: "东莞市清溪房地产开发公司、东莞市荔园实业投资有限公司",
    reply: "广东省南粤交通云湛高速公路管理中心新阳管理处"
  },
  {
    title:
      "金秀瑶族自治县2018年第二批农网改造升级工程头排镇夏塘村古灯配电台区工程等12个项目",
    owner: "东莞市清溪房地产开发公司、东莞市荔园实业投资有限公司",
    reply: "广东省南粤交通云湛高速公路管理中心新阳管理处"
  },
  {
    title:
      "金秀瑶族自治县2018年第二批农网改造升级工程头排镇夏塘村古灯配电台区工程等12个项目",
    owner: "东莞市清溪房地产开发公司、东莞市荔园实业投资有限公司",
    reply: "广东省南粤交通云湛高速公路管理中心新阳管理处"
  },
  {
    title:
      "金秀瑶族自治县2018年第二批农网改造升级工程头排镇夏塘村古灯配电台区工程等12个项目",
    owner: "东莞市清溪房地产开发公司、东莞市荔园实业投资有限公司",
    reply: "广东省南粤交通云湛高速公路管理中心新阳管理处"
  }
];

const spotData = [
  {
    title: "2017_7897489_49687",
    project:
      "金秀瑶族自治县2018年第二批农网改造升级工程头排镇夏塘村古灯配电台区工程等12个项目",
    standard: "疑似超出防治责任范围"
  },
  {
    title: "2017_7897489_49687",
    project:
      "金秀瑶族自治县2018年第二批农网改造升级工程头排镇夏塘村古灯配电台区工程等12个项目",
    standard: "疑似超出防治责任范围"
  },
  {
    title: "2017_7897489_49687",
    project:
      "金秀瑶族自治县2018年第二批农网改造升级工程头排镇夏塘村古灯配电台区工程等12个项目",
    standard: "疑似超出防治责任范围"
  }
];

const pointData = [
  {
    title: "2018-02-03 08:00",
    project:
      "金秀瑶族自治县2018年第二批农网改造升级工程头排镇夏塘村古灯配电台区工程等12个项目",
    desc: "该处存在明显水土流失"
  }
];

export default class integrat extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      show: true,
      value: undefined,
      showDetail: true,
      showProjectEdit: false,
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
      listData: projectData,
      previewVisible: false,
      previewImage: "",
      fileList: [
        {
          uid: "-1",
          name: "xxx.png",
          status: "done",
          url:
            "https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"
        }
      ]
    };
    this.map = null;
    this.saveRef = ref => {
      this.refDom = ref;
    };
  }

  componentDidMount() {
    this.eventEmitter = emitter.addListener("showProjectDetail", data => {
      this.setState({
        showDetail: data.show
      });
    });
    const { clientWidth, clientHeight } = this.refDom;
    this.setState({
      clientHeight: clientHeight
    });
  }
  handleCancel = () => this.setState({ previewVisible: false });

  handlePreview = file => {
    this.setState({
      previewImage: file.url || file.thumbUrl,
      previewVisible: true
    });
  };

  handleChange = ({ fileList }) => this.setState({ fileList });
  onTreeSelectChange = value => {
    console.log(value);
    this.setState({ value });
  };
  onTreeSelectChange = value => {
    console.log(value);
    this.setState({ value });
  };

  submit = () => {
    const { showProjectEdit } = this.state;
    this.setState({ showProjectEdit: !showProjectEdit });
    if (showProjectEdit) {
      message.success("编辑成功");
    } else {
      message.info("开始编辑");
    }
  };

  goSiderbarDetail = from => {
    emitter.emit("showSiderbarDetail", {
      show: true,
      from: from
    });
    emitter.emit("showTool", {
      show: false
    });
    emitter.emit("showQuery", {
      show: false
    });
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
      show: false
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
      show: false
    });
    emitter.emit("showTool", {
      show: false,
      type: "control"
    });
    emitter.emit("showChart", {
      show: false
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
        placeholder: "关联项目",
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
      showProjectEdit,
      clientHeight,
      inputDisabled,
      previewVisible,
      previewImage,
      fileList
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
          left: show ? 0 : "-350px",
          width: 350,
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
                    show: false
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
                    show: false
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
                    <p style={{ textAlign: "justify" }}>
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
            padding: 20
          }}
        >
          <p>
            <Button
              icon="rollback"
              shape="circle"
              style={{
                float: "right",
                color: "#1890ff",
                fontSize: 18,
                zIndex: 1
              }}
              onClick={this.close}
            />
            <Button
              icon="environment"
              shape="circle"
              style={{
                float: "right",
                color: "#1890ff",
                fontSize: 18,
                zIndex: 1
              }}
              onClick={() => {
                message.success("定位成功");
              }}
            />
            <Button
              icon={showProjectEdit ? "check" : "edit"}
              shape="circle"
              style={{
                float: "right",
                color: "#1890ff",
                fontSize: 18,
                zIndex: 1
              }}
              onClick={this.submit}
            />
          </p>
          <div
            style={{
              display: showProjectEdit ? "none" : "block"
            }}
          >
            <p>
              <b>
                金秀瑶族自治县2018年第二批农网改造升级工程头排镇夏塘村古灯配电台区工程等12个项目
              </b>
            </p>
            <p style={{ borderBottom: "solid 1px #dedede", paddingBottom: 10 }}>
              <span>位置：</span>
              <span>
                新疆维吾尔自治区克孜勒苏柯尔克孜自治州阿图什市某某路##号某某大厦1901
              </span>
            </p>
            <div
              style={{
                borderBottom: "solid 1px #dedede",
                paddingBottom: 10,
                position: "relative"
              }}
            >
              <p style={{ margin: 0 }}>
                <span>建设单位：</span>
                <span>广东省南粤交通云湛高速公路管理中心新阳管理处</span>
              </p>
              <p style={{ margin: 0 }}>
                <span>监管单位：</span>
                <span>湛江市经济技术开发区农业事务管理局</span>
              </p>
              <p style={{ margin: 0 }}>
                <span>批复机构：</span>
                <span>湛江市经济技术开发区农业事务管理局</span>
              </p>
              <p style={{ margin: 0 }}>
                <span>流域管理机构：</span>
                <span>珠江水利委员会</span>
              </p>
              <p style={{ margin: 0 }}>
                <span>批复文号：</span>
                <span>粤水水保[2017]6号</span>
              </p>
              <p style={{ margin: 0 }}>
                <span>批复时间：</span>
                <span>2017/01/25</span>
                <span style={{ float: "right" }}>123509m2</span>
                <span style={{ float: "right" }}>责任面积：</span>
              </p>
              <p style={{ margin: 0 }}>
                <span>立项级别：</span>
                <span>省级</span>
                <span style={{ float: "right" }}>疑似未批先建</span>
                <span style={{ float: "right" }}>项目合规性：</span>
              </p>
              <p style={{ margin: 0 }}>
                <span>项目类别：</span>
                <span>建设类</span>
                <span style={{ float: "right" }}>铁路工程</span>
                <span style={{ float: "right" }}>项目类型：</span>
              </p>
              <p style={{ margin: 0 }}>
                <span>建设状态：</span>
                <span>在建</span>
                <span style={{ float: "right" }}>新建</span>
                <span style={{ float: "right" }}>项目性质：</span>
              </p>
              <p style={{ margin: 0 }}>
                <span>涉及县：</span>
                <span>增城区，惠城区，惠阳区，博罗县，天河区</span>
              </p>
              <p style={{ margin: 0, textAlign: "justify" }}>
                <span>备注：</span>
                <span>
                  东莞市清溪房地产开发公司、
                  <a style={{ float: "right" }}>详情</a>
                </span>
              </p>
            </div>
            <List
              style={{
                width: 310,
                position: "relation",
                paddingRight: 30
              }}
            >
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
                        this.goSiderbarDetail("spot");
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
              <List.Item>
                <List.Item.Meta
                  title={
                    <span>
                      <span>设计阶段：可研</span>
                      <br />
                      <span> 防治责任范围：1</span>
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
                    <p
                      onClick={() => {
                        this.goSiderbarDetail("duty");
                      }}
                      style={{ cursor: "pointer" }}
                    >
                      <span>
                        道路主题红线
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
          <div
            style={{
              display: showProjectEdit ? "block" : "none"
            }}
          >
            <Form verticalGap={100}>
              <Form.Item label="项目名" {...formItemLayout}>
                <Input.TextArea
                  autosize={true}
                  defaultValue={`金秀瑶族自治县2018年第二批农网改造升级工程头排镇夏塘村古灯配电台区工程等12个项目`}
                />
              </Form.Item>
              <Form.Item label="位置" {...formItemLayout}>
                <Cascader
                  placeholder="请选择所在地区"
                  options={config.demo_location}
                  changeOnSelect
                />
              </Form.Item>
              <Form.Item label="建设单位" {...formItemLayout}>
                <Input.TextArea
                  autosize={true}
                  defaultValue={`东莞市清溪房地产开发公司、东莞市荔园实业投资有限公司`}
                />
              </Form.Item>
              <Form.Item label="监管单位" {...formItemLayout}>
                <Input.TextArea
                  autosize={true}
                  defaultValue={`湛江市经济技术开发区农业事务管理局`}
                />
              </Form.Item>
              <Form.Item label="批复机构" {...formItemLayout}>
                <Input.TextArea
                  autosize={true}
                  defaultValue={`湛江市经济技术开发区农业事务管理局`}
                />
              </Form.Item>
              <Form.Item label="流域管理机构" {...formItemLayout}>
                <Input.TextArea
                  autosize={true}
                  defaultValue={`珠江水利委员会`}
                />
              </Form.Item>
              <Form.Item label="批复文号" {...formItemLayout}>
                <Input defaultValue={`粤水水保[2017]6号`} />
              </Form.Item>
              <Form.Item label="批复时间" {...formItemLayout}>
                <DatePicker
                  defaultValue={moment("2017/01/25", dateFormat)}
                  style={{ width: `100%` }}
                />
              </Form.Item>
              <Form.Item label="责任面积" {...formItemLayout}>
                <InputNumber
                  defaultValue={`123509`}
                  formatter={value => `${value}m2`}
                  style={{ width: `100%` }}
                />
              </Form.Item>
              <Form.Item label="立项级别" {...formItemLayout}>
                <AutoComplete
                  placeholder="请选择立项级别"
                  defaultValue={`省级`}
                  dataSource={config.approval_level}
                  filterOption={(inputValue, option) =>
                    option.props.children
                      .toUpperCase()
                      .indexOf(inputValue.toUpperCase()) !== -1
                  }
                />
              </Form.Item>
              <Form.Item label="项目合规性" {...formItemLayout}>
                <AutoComplete
                  placeholder="请选择项目合规性"
                  defaultValue={`疑似未批先建`}
                  dataSource={config.compliance}
                  filterOption={(inputValue, option) =>
                    option.props.children
                      .toUpperCase()
                      .indexOf(inputValue.toUpperCase()) !== -1
                  }
                />
              </Form.Item>
              <Form.Item label="项目类别" {...formItemLayout}>
                <AutoComplete
                  placeholder="请选择项目类别"
                  defaultValue={`建设类`}
                  dataSource={config.project_category}
                  filterOption={(inputValue, option) =>
                    option.props.children
                      .toUpperCase()
                      .indexOf(inputValue.toUpperCase()) !== -1
                  }
                />
              </Form.Item>
              <Form.Item label="项目类型" {...formItemLayout}>
                <AutoComplete
                  placeholder="请选择项目类型"
                  defaultValue={`铁路工程`}
                  dataSource={config.project_type}
                  filterOption={(inputValue, option) =>
                    option.props.children
                      .toUpperCase()
                      .indexOf(inputValue.toUpperCase()) !== -1
                  }
                />
              </Form.Item>
              <Form.Item label="建设状态" {...formItemLayout}>
                <AutoComplete
                  placeholder="请选择建设状态"
                  defaultValue={`未开工`}
                  dataSource={config.construct_state}
                  filterOption={(inputValue, option) =>
                    option.props.children
                      .toUpperCase()
                      .indexOf(inputValue.toUpperCase()) !== -1
                  }
                />
              </Form.Item>
              <Form.Item label="项目性质" {...formItemLayout}>
                <AutoComplete
                  placeholder="请选择项目性质"
                  defaultValue={`新建`}
                  dataSource={config.project_nature}
                  filterOption={(inputValue, option) =>
                    option.props.children
                      .toUpperCase()
                      .indexOf(inputValue.toUpperCase()) !== -1
                  }
                />
              </Form.Item>
              <Form.Item label="涉及县" {...formItemLayout}>
                <TreeSelect
                  showSearch
                  style={{ width: "100%" }}
                  value={this.state.value}
                  dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
                  placeholder="请选择涉及县"
                  allowClear
                  multiple
                  treeDefaultExpandAll
                  onChange={this.onTreeSelectChange}
                >
                  <TreeNode value="中国" title="中国" key="0-1">
                    <TreeNode value="广东" title="广东" key="0-1-1">
                      <TreeNode value="广州" title="广州" key="random" />
                      <TreeNode value="中山" title="中山" key="random1" />
                    </TreeNode>
                    <TreeNode value="广西" title="广西" key="random2">
                      <TreeNode value="南宁" title="南宁" key="random3" />
                    </TreeNode>
                  </TreeNode>
                </TreeSelect>
              </Form.Item>
              <Form.Item label="备注" {...formItemLayout}>
                <Input.TextArea
                  autosize={true}
                  defaultValue={`东莞市清溪房地产开发公司、`}
                />
              </Form.Item>
            </Form>
            <List
              style={{
                width: 310,
                paddingRight: 30,
                margin: "0 auto"
              }}
            >
              <List.Item>
                <List.Item.Meta
                  title={
                    <span>
                      <span>设计阶段：可研</span>
                      <br />
                      <span> 防治责任范围：1</span>
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
                    <p
                      onClick={() => {
                        this.goSiderbarDetail("duty");
                      }}
                      style={{ cursor: "pointer" }}
                    >
                      <span>
                        道路主题红线
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
                        this.goSiderbarDetail("spot");
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
              <div className="clearfix">
                <Upload
                  action="//jsonplaceholder.typicode.com/posts/"
                  listType="picture-card"
                  fileList={fileList}
                  onPreview={this.handlePreview}
                  onChange={this.handleChange}
                >
                  <div>
                    <Icon type="plus" />
                    <div style={{ margintop: 8, color: "#666" }}>Upload</div>
                  </div>
                </Upload>
                <Modal
                  visible={previewVisible}
                  footer={null}
                  onCancel={this.handleCancel}
                >
                  <img
                    alt="example"
                    style={{ width: "100%" }}
                    src={previewImage}
                  />
                </Modal>
              </div>
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
      </div>
    );
  }
}
