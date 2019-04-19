import React, { PureComponent } from "react";
import { connect } from "dva";
import { createForm } from "rc-form";
import {
  Menu,
  Icon,
  Button,
  Input,
  Radio,
  List,
  Skeleton,
  Spin,
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
  Collapse,
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

@connect(({ project }) => ({
  project
}))
@createForm()
export default class integrat extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      show: true,
      value: undefined,
      showDetail: false,
      projectEdit: false,
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
      listData: [],
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
    this.eventEmitter = emitter.addListener("showProjectSpotInfo", data => {
      if (data.from === "project") {
        this.setState({
          showDetail: data.show,
          projectEdit: data.edit
        });
        this.queryProjectById(data.id);
      }
    });
    this.eventEmitter = emitter.addListener("polygon", data => {
      //console.log(data);
      this.props.dispatch({
        type: "project/queryProject",
        payload: {
          polygon: data.polygon
        }
      });
      this.props.dispatch({
        type: "project/querySpot",
        payload: {
          polygon: data.polygon
        }
      });
    });
    const { clientWidth, clientHeight } = this.refDom;
    this.setState({
      clientHeight: clientHeight
    });
  }

  queryProjectById = id => {
    const { dispatch } = this.props;
    dispatch({
      type: "project/queryProjectById",
      payload: {
        project_id: id
      }
    });
  };

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

  submit_project = () => {
    const { projectEdit } = this.state;
    this.setState({ projectEdit: !projectEdit });
    if (projectEdit) {
      this.props.form.validateFields((err, values) => {
        if (!err) {
          console.log(values);
        }
      });
      message.success("编辑成功");
      emitter.emit("showEdit", {
        show: true,
        edit: false
      });
    } else {
      message.info("开始编辑");
      emitter.emit("showEdit", {
        show: true,
        edit: true
      });
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
    emitter.emit("showEdit", {
      show: false,
      edit: false
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
      projectEdit,
      clientHeight,
      inputDisabled,
      previewVisible,
      previewImage,
      fileList
    } = this.state;
    const {
      dispatch,
      project: { projectList, spotList, projectItem }
    } = this.props;
    const { getFieldDecorator } = this.props.form;

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
          <p style={{ padding: "20px 20px 0 20px" }}>
            <span>{`共有${
              key === "project" ? projectList.length : spotList.length
            }条记录`}</span>
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
          <Spin
            style={{
              display: projectList.length <= 1 ? "block" : "none",
              padding: 100,
              position: "absolute",
              top: 300,
              left: 60
            }}
          />
          <List
            style={{
              overflow: "auto",
              height: clientHeight ? clientHeight - 207 : 500,
              width: 350,
              padding: "10px 20px 10px 20px"
            }}
            itemLayout="horizontal"
            dataSource={key === "project" ? projectList : spotList}
            renderItem={item => (
              <List.Item>
                <List.Item.Meta
                  style={{
                    cursor: "pointer"
                  }}
                  title={
                    <p style={{ textAlign: "justify" }}>
                      <span
                        style={{
                          display: key === "project" ? "block" : "none"
                        }}
                      >
                        {item.project_name}
                      </span>
                      <span
                        style={{
                          display: key === "spot" ? "block" : "none"
                        }}
                      >
                        {item.spot_tbid}
                      </span>
                      <Icon
                        type="environment"
                        style={{
                          float: "right",
                          fontSize: 18,
                          cursor: "point",
                          color: "#1890ff"
                        }}
                        onClick={e => {
                          e.stopPropagation();
                          console.log(item.project_id);
                          emitter.emit("mapLocation", {
                            project_id: item.project_id
                          });
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
                        <span style={{ wordBreak: "break-all" }}>
                          建设单位：{item.product_department_id}
                        </span>
                        <br />
                        <span style={{ wordBreak: "break-all" }}>
                          批复机构：{item.project_rp_id}
                        </span>
                      </span>
                      <span
                        style={{
                          display: key === "spot" ? "block" : "none"
                        }}
                      >
                        <span style={{ wordBreak: "break-all" }}>
                          关联项目：{item.project_id}
                        </span>
                        <br />
                        <span style={{ wordBreak: "break-all" }}>
                          扰动合规性：{item.byd}
                        </span>
                      </span>
                      <span
                        style={{
                          display: key === "point" ? "block" : "none"
                        }}
                      >
                        <span style={{ wordBreak: "break-all" }}>
                          关联项目：{item.project}
                        </span>
                        <br />
                        <span style={{ wordBreak: "break-all" }}>
                          描述：{item.desc}
                        </span>
                      </span>
                    </p>
                  }
                  onClick={() => {
                    this.setState({
                      showDetail: key === "project"
                    });
                    this.queryProjectById(item.project_id);
                    emitter.emit("showSiderbarDetail", {
                      show: key !== "project",
                      from: key,
                      id: key === "project" ? item.project_id : item.spot_tbid
                    });
                    emitter.emit("showTool", {
                      show: false
                    });
                    emitter.emit("showQuery", {
                      show: false
                    });
                  }}
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
              icon={projectEdit ? "check" : "edit"}
              shape="circle"
              htmlType="submit"
              style={{
                float: "right",
                color: "#1890ff",
                fontSize: 18,
                zIndex: 1
              }}
              onClick={this.submit_project}
            />
          </p>
          <div
            style={{
              display: projectEdit ? "none" : "block"
            }}
          >
            <p>
              <b>{projectItem.project_name}</b>
            </p>
            <p
              style={
                {
                  // borderBottom: "solid 1px #dedede",
                  // paddingBottom: 10
                }
              }
            >
              <span>位置：</span>
              <span>
                {projectItem.project_province}
                {projectItem.project_city}
                {projectItem.project_district}
                {projectItem.project_town}
                {projectItem.project_village}
              </span>
            </p>

            <List
              style={{
                width: 310,
                position: "relation",
                paddingRight: 30
              }}
            >
              <Collapse defaultActiveKey={["0"]}>
                <Collapse.Panel header="基本信息" key="0">
                  <div
                    style={{
                      // borderBottom: "solid 1px #dedede",
                      paddingBottom: 10,
                      position: "relative"
                    }}
                  >
                    <p style={{ margin: 10 }}>
                      <span>建设单位：</span>
                      <span>{projectItem.product_department_id}</span>
                    </p>
                    <p style={{ margin: 10 }}>
                      <span>监管单位：</span>
                      <span>{projectItem.project_sup_id}</span>
                    </p>
                    <p style={{ margin: 10 }}>
                      <span>批复机构：</span>
                      <span>{projectItem.project_rp_id}</span>
                    </p>
                    <p style={{ margin: 10 }}>
                      <span>流域管理机构：</span>
                      <span>{projectItem.ctn_code}</span>
                    </p>
                    <p style={{ margin: 10 }}>
                      <span>批复文号：</span>
                      <span>{projectItem.project_rp_num}</span>
                    </p>
                    <p style={{ margin: 10 }}>
                      <span>批复时间：</span>
                      <span>{projectItem.project_rp_time}</span>
                    </p>
                    <p style={{ margin: 10 }}>
                      <span>责任面积：</span>
                      <span>{projectItem.area}m2</span>
                    </p>
                    <p style={{ margin: 10 }}>
                      <span>立项级别：</span>
                      <span>{projectItem.project_level}</span>
                    </p>
                    <p style={{ margin: 10 }}>
                      <span>项目合规性：</span>
                      <span>----</span>
                    </p>
                    <p style={{ margin: 10 }}>
                      <span>项目类别：</span>
                      <span>----</span>
                    </p>
                    <p style={{ margin: 10 }}>
                      <span>项目类型：</span>
                      <span>----</span>
                    </p>
                    <p style={{ margin: 10 }}>
                      <span>建设状态：</span>
                      <span>----</span>
                    </p>
                    <p style={{ margin: 10 }}>
                      <span>项目性质：</span>
                      <span>----</span>
                    </p>
                    <p style={{ margin: 10 }}>
                      <span>涉及县：</span>
                      <span>----</span>
                    </p>
                    <p style={{ margin: 10, textAlign: "justify" }}>
                      <span>备注：</span>
                      <span>----</span>
                    </p>
                    <a
                      style={{ position: "absolute", right: 0, bottom: 0 }}
                      onClick={() => {
                        emitter.emit("showEdit", {
                          show: true,
                          edit: false
                        });
                      }}
                    >
                      详情
                    </a>
                  </div>
                </Collapse.Panel>
                <Collapse.Panel header="监督执法记录：2" key="1">
                  <p>
                    2019/3/22 检查记录
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
                  <p>
                    2019/3/22 检查记录
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
                </Collapse.Panel>
                <Collapse.Panel header="扰动图斑：5" key="2">
                  <p>
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
                  </p>
                  <p>
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
                  </p>
                  <p>
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
                  </p>
                  <p>
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
                  </p>
                </Collapse.Panel>
                <Collapse.Panel header="防治责任范围：2" key="3">
                  <p>
                    红线第一部分
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
                  <p>
                    红线第二部分
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
                </Collapse.Panel>
                <Collapse.Panel header="设计分区：5" key="4">
                  <p>
                    主体功能区
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
                  <p>
                    生产生活区
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
                  <p>
                    连接道路区
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
                  <p>
                    弃渣场
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
                  <p>
                    取土场
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
                </Collapse.Panel>
                <Collapse.Panel header="设计措施：5" key="5">
                  <p>
                    截排水沟
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
                  <p>
                    沉沙池
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
                  <p>
                    植树
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
                  <p>
                    种草
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
                  <p>
                    浆砌石拦挡
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
                </Collapse.Panel>
                <Collapse.Panel header="责任点：5" key="6">
                  <p>
                    某渣场坡面
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
                  <p>
                    某大型坡面
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
                  <p>
                    施工区东北侧
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
                  <p>
                    临时道路
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
                  <p>
                    隧道出口
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
                </Collapse.Panel>
                <Collapse.Panel header="实施措施：5" key="7">
                  <p>
                    截排水沟
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
                  <p>
                    沉沙池
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
                  <p>
                    植树
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
                  <p>
                    种草
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
                  <p>
                    浆砌石拦挡
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
                </Collapse.Panel>
                <Collapse.Panel header="问题地块：5" key="8">
                  <p>
                    某渣场坡面
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
                  <p>
                    某大型坡面
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
                  <p>
                    施工区东北侧
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
                  <p>
                    临时道路
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
                  <p>
                    隧道出口
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
                </Collapse.Panel>
              </Collapse>
              {/* <List.Item>
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
              </List.Item> */}
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
              display: projectEdit ? "block" : "none"
            }}
          >
            <Form style={{ position: "relative", paddingBottom: 10 }}>
              <Form.Item label="项目名" {...formItemLayout}>
                {getFieldDecorator("project_name", {
                  initialValue: projectItem.project_name
                })(<Input.TextArea autosize />)}
              </Form.Item>
              <Form.Item label="所在地区" {...formItemLayout}>
                <Cascader
                  placeholder="请选择所在地区"
                  options={config.demo_location}
                  changeOnSelect
                />
              </Form.Item>
              <Form.Item label="详细地址" {...formItemLayout}>
                {getFieldDecorator("product_department_id1", {
                  initialValue: projectItem.product_department_id1
                })(<Input />)}
              </Form.Item>
              <Form.Item label="建设单位" {...formItemLayout}>
                {getFieldDecorator("product_department_id", {
                  initialValue: projectItem.product_department_id
                })(<Input.TextArea autosize />)}
              </Form.Item>
              <Form.Item label="监管单位" {...formItemLayout}>
                {getFieldDecorator("project_sup_id", {
                  initialValue: projectItem.project_sup_id
                })(<Input.TextArea autosize />)}
              </Form.Item>
              <Form.Item label="批复机构" {...formItemLayout}>
                {getFieldDecorator("project_rp_id", {
                  initialValue: projectItem.project_rp_id
                })(<Input.TextArea autosize />)}
              </Form.Item>
              <Form.Item label="流域管理机构" {...formItemLayout}>
                {getFieldDecorator("ctn_code", {
                  initialValue: projectItem.ctn_code
                })(<Input.TextArea autosize />)}
              </Form.Item>
              <Form.Item label="批复文号" {...formItemLayout}>
                {getFieldDecorator("project_rp_num", {
                  initialValue: projectItem.project_rp_num
                })(<Input />)}
              </Form.Item>
              <Form.Item label="批复时间" {...formItemLayout}>
                {getFieldDecorator("project_rp_time", {})(<DatePicker />)}
              </Form.Item>
              <Form.Item label="责任面积" {...formItemLayout}>
                {getFieldDecorator("area", {
                  initialValue: projectItem.area
                })(<Input addonAfter="m2" />)}
              </Form.Item>
              <Form.Item label="立项级别" {...formItemLayout}>
                {getFieldDecorator("project_level", {})(
                  <AutoComplete
                    placeholder="请选择立项级别"
                    dataSource={config.approval_level}
                    filterOption={(inputValue, option) =>
                      option.props.children
                        .toUpperCase()
                        .indexOf(inputValue.toUpperCase()) !== -1
                    }
                  />
                )}
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
                  defaultValue={`东莞市清溪房地产开发公司、`}
                  autosize
                />
              </Form.Item>
              <a
                style={{ position: "absolute", right: 0, bottom: 0 }}
                onClick={() => {
                  emitter.emit("showEdit", {
                    show: true,
                    edit: true
                  });
                }}
              >
                详情
              </a>
            </Form>
            <div className="clearfix">
              <Upload listType="picture">
                <Button>
                  <Icon type="upload" />
                  上传附件
                </Button>
              </Upload>
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
          </div>
        </div>
      </div>
    );
  }
}
