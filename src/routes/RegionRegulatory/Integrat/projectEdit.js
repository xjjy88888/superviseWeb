import React, { PureComponent } from "react";
import {
  Menu,
  Icon,
  Button,
  Input,
  Radio,
  List,
  Avatar,
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
    title: "1新建铁路广州至香港专线",
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
      value: undefined,
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
        showDetail: data.show
      });
    });
    const { clientWidth, clientHeight } = this.refDom;
    this.setState({
      clientHeight: clientHeight
    });
  }

  onTreeSelectChange = value => {
    console.log(value);
    this.setState({ value });
  };

  submit = () => {
    const { edit } = this.state;
    this.setState({ edit: !edit });
    if (edit) {
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
          backgroundColor: "rgba(0,0,0,.3)",
          zIndex: 1000,
          position: "absolute",
          left: 0,
          top: 0,
          right: 0,
          bottom: 0,
          width: "100vw",
          height: "100vh"
        }}
        ref={this.saveRef}
      >
        <div
          style={{
            height: "80vh",
            width: "80vw",
            overflow: "auto",
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            background: "#fff",
            backgroundColor: "#fff",
            borderRadius: 5,
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
            onClick={() => {
              message.success("定位成功");
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
              <AutoComplete
                placeholder="请选择立项级别"
                defaultValue={`省级`}
                disabled={!edit}
                dataSource={config.approval_level}
                filterOption={(inputValue, option) =>
                  option.props.children
                    .toUpperCase()
                    .indexOf(inputValue.toUpperCase()) !== -1
                }
              />
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
                style={{ width: `100%` }}
              />
            </Form.Item>
            <Form.Item label="责任面积" {...formItemLayout}>
              <InputNumber
                defaultValue={`123`}
                disabled={!edit}
                formatter={value => `${value}平方米`}
                style={{ width: `100%` }}
              />
            </Form.Item>
            <Form.Item label="项目类型" {...formItemLayout}>
              <AutoComplete
                placeholder="请选择项目类型"
                defaultValue={`公路工程`}
                disabled={!edit}
                dataSource={config.project_type}
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
                disabled={!edit}
                dataSource={config.project_category}
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
                disabled={!edit}
                dataSource={config.project_nature}
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
                disabled={!edit}
                dataSource={config.construct_state}
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
                disabled={!edit}
                dataSource={config.compliance}
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
                disabled={!edit}
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
            <Form.Item label="所在地区" {...formItemLayout}>
              <Cascader
                disabled={!edit}
                placeholder="请选择所在地区"
                options={config.demo_location}
                changeOnSelect
              />
            </Form.Item>
            <Form.Item label="详细地址" {...formItemLayout}>
              <Input placeholder="请填写详细地址" disabled={!edit} />
            </Form.Item>
            <Form.Item label="坐标" {...formItemLayout}>
              <Input
                defaultValue={`123.423，29.543`}
                disabled={!edit}
                addonAfter={
                  <Icon
                    type="compass"
                    style={{
                      cursor: "point",
                      color: "#1890ff"
                    }}
                    onClick={() => {
                      if (edit) {
                        message.success("更新成功");
                      } else {
                        message.info("请先开始编辑");
                      }
                    }}
                  />
                }
              />
            </Form.Item>
            <Form.Item label="备注" {...formItemLayout}>
              <Input.TextArea
                autosize={true}
                defaultValue={`备注备注备注备注备注备注备注备注备注备注备注备注备注备注备注备注备注备注备注备注备注备注备注备注备注备注备注`}
                disabled={!edit}
              />
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
