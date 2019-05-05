import React, { PureComponent } from "react";
import { connect } from "dva";
import { createForm } from "rc-form";
import {
  Menu,
  Progress,
  Icon,
  Tag,
  Tree,
  Button,
  notification,
  Affix,
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
  Table,
  Collapse,
  message
} from "antd";
import moment from "moment";
import "leaflet/dist/leaflet.css";
import emitter from "../../../utils/event";
import config from "../../../config";
import data from "../../../data";
import { EXIF } from "exif-js";
import jQuery from "jquery";
// import {
//   ROOT_DIR_PATH,
//   resolveLocalFileSystemURL,
//   getDirectory,
//   copyTo,
//   getPicture,
//   getPictureExif,
// } from '../../../utils/fileUtil';

const { MonthPicker, RangePicker, WeekPicker } = DatePicker;
const dateFormat = "YYYY-MM-DD";
const { TreeNode } = Tree;
const CheckboxGroup = Checkbox.Group;
const formItemLayout = {
  labelCol: { span: 7 },
  wrapperCol: { span: 16 }
};
let scrollTop = 0;

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
      showProjectDetail: false,
      projectEdit: false,
      showCompany: false,
      showProblem: false,
      showCheck: false,
      checked: false,
      row_pro: 10,
      row_spot: 10,
      key: "project",
      inputDisabled: true,
      select: [],
      problem: { title: "", records: [] },
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
          url: "./img/logo2.jpg"
        }
      ]
    };
    this.map = null;
  }

  componentDidMount() {
    if (this.scrollDom) {
      this.scrollDom.addEventListener("scroll", () => {
        this.onScroll(this);
      });
    }
    this.eventEmitter = emitter.addListener("showCheck", data => {
      this.setState({
        showCheck: data.show
      });
    });
    this.eventEmitter = emitter.addListener("showProjectSpotInfo", data => {
      if (data.from === "project") {
        this.setState({
          showProjectDetail: data.show,
          projectEdit: data.edit
        });
        this.queryProjectById(data.id);
      }
    });
    this.eventEmitter = emitter.addListener("polygon", data => {
      this.queryProject(10);
      this.querySpot(10);
    });
    const { clientWidth, clientHeight } = this.refDom;
    this.setState({
      clientHeight: clientHeight
    });
  }
  componentWillUnmount() {
    if (this.scrollDom) {
      this.scrollDom.removeEventListener("scroll", () => {
        this.onScroll(this);
      });
    }
  }

  onScroll() {
    const { clientHeight, scrollHeight, scrollTop } = this.scrollDom;
    const { row_pro, row_spot, key } = this.state;
    const isBottom = clientHeight + scrollTop === scrollHeight;
    console.log(clientHeight, scrollHeight, scrollTop, isBottom);
    if (isBottom) {
      if (key === "project") {
        this.queryProject(row_pro + 10);
        this.setState({ row_pro: row_pro + 10 });
      } else {
        this.querySpot(row_spot + 10);
        this.setState({ row_spot: row_spot + 10 });
      }
    }
  }

  getFile = dom => {
    EXIF.getData(dom, function() {
      const allMetaData = EXIF.getAllTags(this);

      let Longitude;
      if (allMetaData.GPSLongitude) {
        const LongitudeArry = allMetaData.GPSLongitude;
        const longLongitude =
          LongitudeArry[0].numerator / LongitudeArry[0].denominator +
          LongitudeArry[1].numerator / LongitudeArry[1].denominator / 60 +
          LongitudeArry[2].numerator / LongitudeArry[2].denominator / 3600;
        Longitude = longLongitude.toFixed(8);
      }

      let Latitude;
      if (allMetaData.GPSLatitude) {
        const LatitudeArry = allMetaData.GPSLatitude;
        const longLatitude =
          LatitudeArry[0].numerator / LatitudeArry[0].denominator +
          LatitudeArry[1].numerator / LatitudeArry[1].denominator / 60 +
          LatitudeArry[2].numerator / LatitudeArry[2].denominator / 3600;
        Latitude = longLatitude.toFixed(8);
      }

      console.log(Longitude, Latitude);
      emitter.emit("imgLocation", {
        Latitude: Latitude,
        Longitude: Longitude
      });
    });
  };

  queryProjectById = id => {
    const { dispatch } = this.props;
    dispatch({
      type: "project/queryProjectById",
      payload: {
        id: id
      }
    });
  };

  queryProject = row => {
    const {
      dispatch,
      project: { projectList }
    } = this.props;
    dispatch({
      type: "project/queryProject",
      payload: {
        row: row,
        items: row === 10 ? [] : projectList.items
      }
    });
  };

  querySpot = row => {
    const {
      dispatch,
      project: { spotList }
    } = this.props;
    dispatch({
      type: "project/querySpot",
      payload: {
        row: row,
        items: row === 10 ? [] : spotList.items
      }
    });
  };

  handleCancel = () => this.setState({ previewVisible: false });

  handlePreview = file => {
    const dom = jQuery(`<img src=${file.url}></img>`);
    this.setState({
      previewImage: file.url || file.thumbUrl,
      previewVisible: true
    });
    this.getFile(dom[0]);
  };

  handleChange = ({ fileList }) => this.setState({ fileList });
  onTreeSelectChange = value => {
    this.setState({ value });
  };
  onTreeSelectChange = value => {
    this.setState({ value });
  };

  close = () => {
    const { showProjectDetail, projectEdit } = this.state;
    if (projectEdit) {
      this.setState({
        projectEdit: false
      });
      emitter.emit("showProjectDetail", {
        show: true,
        edit: false
      });
    } else {
      this.setState({
        showProjectDetail: false,
        projectEdit: false
      });
      emitter.emit("showSiderbarDetail", {
        show: false,
        from: "spot"
      });
      emitter.emit("showProjectDetail", {
        show: false,
        edit: false
      });
    }
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
    this.scrollDom.scrollTop = 0;
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

  TreeOnSelect = e => {
    if (e.length) {
      const isRoot = isNaN(e[0].slice(0, 1));
      this.setState({ showProblem: true });
      emitter.emit("showProblem", {
        show: true
      });
      this.handleCancel();
      if (!isRoot) {
        const item = data[e[0].slice(0, 1)].data[e[0].slice(1, 2)];
        this.setState({ problem: item });
      }
    }
  };

  toColor = v => {
    if (v === "一般") {
      return "green";
    } else if (v === "较重") {
      return "orange";
    } else {
      return "magenta";
    }
  };

  closeAll = () => {
    emitter.emit("showSiderbarDetail", {
      show: false,
      from: "spot",
      item: { id: "2017154_14848_4848" }
    });
    emitter.emit("showProjectDetail", {
      show: false,
      edit: false
    });
  };

  render() {
    const {
      show,
      showCompany,
      placeholder,
      sort,
      listData,
      showProjectDetail,
      key,
      projectEdit,
      clientHeight,
      inputDisabled,
      previewVisible,
      previewImage,
      showCheck,
      showProblem,
      fileList,
      select,
      checked,
      problem
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

    const list = key === "project" ? projectList.items : spotList.items;
    const dataSourceTable = list.map((item, index) => {
      return {
        ...item,
        key: index
      };
    });
    const columnsTable = [
      {
        title: (
          <span>
            <span>
              共有
              {key === "project" ? projectList.totalCount : spotList.totalCount}
              条
            </span>

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
              {showCheck ? "" : "工具箱"}
            </Button>
            <Button
              type="dashed"
              icon="dashboard"
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
              {showCheck ? "" : "仪表盘"}
            </Button>
          </span>
        ),
        dataIndex: "name",
        render: (v, item) => (
          <span>
            <p>
              <b
                style={{ cursor: "pointer" }}
                onClick={() => {
                  if (key === "project") {
                    this.setState({
                      showProjectDetail: true
                    });
                    this.queryProjectById(item.id);
                  } else if (key === "spot") {
                    emitter.emit("showSiderbarDetail", {
                      show: key === "spot",
                      from: key,
                      id: key === "project" ? item.id : item.spot_tbid
                    });
                  }
                  emitter.emit("showTool", {
                    show: false
                  });
                  emitter.emit("showQuery", {
                    show: false
                  });
                }}
              >
                {key === "project" ? item.projectName : item.mapNum}
              </b>
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
                  emitter.emit("mapLocation", {
                    item: item,
                    key: key
                  });
                }}
              />
            </p>
            <span>
              {" "}
              {key === "project"
                ? `建设单位：${item.productDepartmentName}`
                : `关联项目：${item.projectName}`}
            </span>
            <br />
            <span>
              {key === "project"
                ? `批复机构：${item.replyDepartmentName}`
                : `扰动合规性：${item.interferenceCompliance}`}
            </span>
          </span>
        )
      }
    ];

    const rowSelectionTable = {
      onChange: (selectedRowKeys, selectedRows) => {
        emitter.emit("checkResult", {
          result: selectedRows
        });
      }
    };

    return (
      <div
        style={{
          left: show ? 0 : "-350px",
          width: 350,
          backgroundColor: "#fff",
          position: "absolute",
          zIndex: 1001,
          height: "100%"
        }}
        ref={e => (this.refDom = e)}
      >
        <img
          src="./img/logo2.jpg"
          id="img1"
          style={{ width: 100, display: "none" }}
        />
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
          onClick={() => {
            this.setState({ show: !show, showProjectDetail: false });
            emitter.emit("showSiderbar", {
              show: !show
            });
          }}
        />
        <div
          style={{
            display: showProjectDetail ? "none" : "block",
            height: "100%",
            overflow: "hidden"
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
                notification["success"]({
                  message: `查询${v}成功！`
                });
              } else {
                notification["warning"]({
                  message: "请输入查询信息！"
                });
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
              <Radio.Button key={index} value={item.value} focus={() => {}}>
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
          {/* <p style={{ padding: "20px 20px 0 20px" }}>
            <span>
              <Checkbox
                style={{
                  display: showCheck ? "inline" : "none",
                  paddingRight: 10
                }}
                onChange={() => {
                  this.setState({ checked: !checked });
                }}
              />
              {`共有${
                key === "project" ? projectList.totalCount : spotList.totalCount
              }条记录`}
            </span>
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
                icon="dashboard"
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
                仪表盘
              </Button>
            </span>
          </p> */}
          <Spin
            style={{
              display: projectList.totalCount === 0 ? "block" : "none",
              padding: 100,
              position: "absolute",
              top: 300,
              left: 60,
              zIndex: 1001
            }}
          />
          <div
            ref={e => (this.scrollDom = e)}
            style={{
              overflow: "auto",
              height: clientHeight ? clientHeight - 202 : 500,
              width: 350
            }}
          >
            <Table
              rowSelection={showCheck ? rowSelectionTable : null}
              columns={columnsTable}
              dataSource={dataSourceTable}
              pagination={false}
            />
          </div>
          {/* <List
            style={{
              overflow: "auto",
              height: clientHeight ? clientHeight - 257 : 500,
              width: 350,
              padding: "10px 20px 10px 20px"
            }}
            itemLayout="horizontal"
            dataSource={key === "project" ? projectList.items : spotList.items}
            renderItem={item => (
              <List.Item>
                <List.Item.Meta
                  style={{
                    cursor: "pointer"
                  }}
                  title={
                    <p style={{ textAlign: "justify" }}>
                      <Checkbox
                        // checked={checked}
                        style={{ display: showCheck ? "inline" : "none" }}
                        onChange={e => {
                          if (e.target.checked) {
                            const data = [...select, item.id];
                            emitter.emit("checkResult", {
                              result: data
                            });
                            this.setState({ select: data });
                          } else {
                            select.map((ite, idx) => {
                              if (ite === item.id) {
                                const data = select.splice(idx, 1);
                                emitter.emit("checkResult", {
                                  result: select
                                });
                              }
                            });
                          }
                        }}
                      />
                      <span
                        onClick={() => {
                          if (key === "project") {
                            this.setState({
                              showProjectDetail: true
                            });
                            this.queryProjectById(item.id);
                          } else if (key === "spot") {
                            emitter.emit("showSiderbarDetail", {
                              show: key === "spot",
                              from: key,
                              id: key === "project" ? item.id : item.spot_tbid
                            });
                          }
                          emitter.emit("showTool", {
                            show: false
                          });
                          emitter.emit("showQuery", {
                            show: false
                          });
                        }}
                      >
                        {key === "project" ? item.projectName : item.mapNum}
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
                          emitter.emit("mapLocation", {
                            item: item,
                            key: key
                          });
                        }}
                      />
                    </p>
                  }
                  description={
                    <p>
                      <span>
                        <span style={{ wordBreak: "break-all" }}>
                          {key === "project"
                            ? `建设单位：${item.productDepartmentName}`
                            : `关联项目：${item.projectName}`}
                        </span>
                        <br />
                        <span style={{ wordBreak: "break-all" }}>
                          {key === "project"
                            ? `批复机构：${item.replyDepartmentName}`
                            : `扰动合规性：${item.interferenceCompliance}`}
                        </span>
                      </span>
                    </p>
                  }
                />
              </List.Item>
            )}
          /> */}
        </div>
        <div
          style={{
            display: showProjectDetail ? "block" : "none",
            overflow: "auto",
            padding: 20,
            height: "100%"
          }}
        >
          <div
            style={{
              display: showCompany ? "block" : "none",
              position: "relation"
            }}
          >
            <p
              style={{
                position: "fixed",
                top: 62,
                left: 256
              }}
            >
              <Button
                icon="close"
                shape="circle"
                style={{
                  float: "right",
                  color: "#1890ff",
                  fontSize: 18,
                  zIndex: 1
                }}
                onClick={() => {
                  this.setState({ showCompany: false });
                }}
              />
              <Button
                icon="check"
                shape="circle"
                style={{
                  float: "right",
                  color: "#1890ff",
                  fontSize: 18,
                  zIndex: 1
                }}
                onClick={() => {
                  this.setState({ showProblem: false });
                  emitter.emit("showProblem", {
                    show: false
                  });
                  notification["success"]({
                    message: "编辑成功"
                  });
                }}
              />
            </p>
            <Tree defaultExpandAll onSelect={this.TreeOnSelect}>
              {data.map((item, index) => (
                <TreeNode
                  title={
                    <b
                      style={{
                        color: index === 7 ? "red" : "#000"
                      }}
                    >
                      {item.title}
                    </b>
                  }
                  key={item.key}
                >
                  {item.data.map((ite, idx) => (
                    <TreeNode
                      title={
                        <span>
                          <span style={{ marginRight: 10 }}>{ite.title}</span>
                          {/* <Progress
                            type="circle"
                            percent={idx % 2 ? 0 : 50}
                            format={percent => percent}
                            width={20}
                          /> */}
                        </span>
                      }
                      key={`${index}${idx}`}
                    />
                  ))}
                </TreeNode>
              ))}
            </Tree>
            <div
              style={{
                display: showProblem ? "block" : "none",
                position: "absolute",
                top: 48,
                left: 350,
                width: 430,
                bottom: 0,
                background: "#fff"
              }}
            >
              <Icon
                type={"left"}
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
                onClick={() => {
                  this.setState({ showProblem: false });
                  emitter.emit("showProblem", {
                    show: false
                  });
                }}
              />
              <Button
                icon="check"
                shape="circle"
                style={{
                  color: "#1890ff",
                  fontSize: 18,
                  position: "absolute",
                  right: 30,
                  top: 15,
                  zIndex: 1
                }}
                onClick={() => {
                  this.setState({ showProblem: false });
                  emitter.emit("showProblem", {
                    show: false
                  });
                  notification["success"]({
                    message: "编辑成功"
                  });
                }}
              />
              <div
                style={{
                  overflow: "auto",
                  padding: "20px 10px 20px 20px",
                  height: "100%"
                }}
              >
                <p>{problem.title}</p>
                <div
                  style={{
                    display: previewVisible ? "block" : "none",
                    position: "fixed",
                    zIndex: 1,
                    width: 380
                  }}
                >
                  <Icon
                    type="close"
                    style={{
                      fontSize: 18,
                      position: "absolute",
                      top: 0,
                      right: 0
                    }}
                    onClick={this.handleCancel}
                  />
                  <img
                    alt="example"
                    style={{ width: "100%" }}
                    src={previewImage}
                  />
                </div>
                {problem.records.map((item, index) => (
                  <div style={{ padding: 5 }} key={index}>
                    <p>
                      <Tag color={this.toColor(item.sort)}>{item.sort}</Tag>
                      {item.record}
                    </p>
                    <p style={{ margin: 0 }}>
                      <Radio.Group name="radiogroup">
                        <Radio value={1}>是</Radio>
                        <Radio value={0}>否</Radio>
                      </Radio.Group>
                    </p>
                    <Collapse
                      bordered={false}
                      style={{ position: "relative", left: -18 }}
                      onChange={this.handleCancel}
                    >
                      <Collapse.Panel header="附件" key="1">
                        <Input.TextArea
                          autosize
                          placeholder="问题描述"
                          style={{ marginBottom: 10 }}
                        />
                        <Upload
                          action="//jsonplaceholder.typicode.com/posts/"
                          listType="picture-card"
                          fileList={fileList}
                          onPreview={this.handlePreview}
                          onChange={this.handleChange}
                        >
                          <Button type="div" icon="plus">
                            上传文件
                          </Button>
                          <Button
                            icon="picture"
                            onClick={e => {
                              e.stopPropagation();
                            }}
                          >
                            屏幕截图
                          </Button>
                        </Upload>
                      </Collapse.Panel>
                    </Collapse>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div
            style={{
              display: showCompany ? "none" : "block"
            }}
          >
            <p
              style={{
                width: 100,
                height: 0,
                left: 220,
                top: 62,
                zIndex: 1,
                position: "fixed"
              }}
            >
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
                  notification["success"]({
                    message: "定位成功"
                  });
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
                onClick={() => {
                  this.closeAll();
                  this.setState({ projectEdit: !projectEdit });
                  if (projectEdit) {
                    this.props.form.validateFields((err, values) => {
                      if (!err) {
                        console.log(values);
                      }
                    });
                    notification["success"]({
                      message: "编辑成功"
                    });
                    emitter.emit("showProjectDetail", {
                      show: true,
                      edit: false
                    });
                  } else {
                    emitter.emit("showProjectDetail", {
                      show: true,
                      edit: true
                    });
                  }
                }}
              />
            </p>
            <div
              style={{
                display: projectEdit ? "none" : "block"
              }}
            >
              <p>
                <b>{projectItem.projectBase.name}</b>
              </p>
              <p
                style={{
                  position: "relative",
                  left: 10
                  // borderBottom: "solid 1px #dedede",
                  // paddingBottom: 10
                }}
              >
                <span>位置：</span>
                <span>
                  {projectItem.projectBase.provinceCode}
                  {projectItem.projectBase.cityCode}
                  {projectItem.projectBase.districtCode}
                  {projectItem.projectBase.town}
                  {projectItem.projectBase.village}
                </span>
              </p>

              <List
                style={{
                  width: 310,
                  position: "relation",
                  paddingRight: 30
                }}
              >
                <Collapse bordered={false} defaultActiveKey={["0", "1", "2"]}>
                  <Collapse.Panel header={<b>基本信息</b>} key="0">
                    <div
                      style={{
                        // borderBottom: "solid 1px #dedede",
                        // paddingBottom: 10,
                        position: "relative"
                      }}
                    >
                      <p style={{ marginBottom: 10 }}>
                        <span>建设单位：</span>
                        <span>{projectItem.productDepartment}</span>
                      </p>
                      <p style={{ marginBottom: 10 }}>
                        <span>监管单位：</span>
                        <span>{projectItem.supDepartment}</span>
                      </p>
                      <p style={{ marginBottom: 10 }}>
                        <span>批复机构：</span>
                        <span>{projectItem.replyDepartment}</span>
                      </p>
                      <p style={{ marginBottom: 10 }}>
                        <span>流域管理机构：</span>
                        <span>{projectItem.riverBasinOU}</span>
                      </p>
                      <p style={{ marginBottom: 10 }}>
                        <span>批复文号：</span>
                        <span>{projectItem.replyNum}</span>
                      </p>
                      <p style={{ marginBottom: 10 }}>
                        <span>批复时间：</span>
                        <span>{projectItem.replyTime}</span>
                      </p>
                      <p style={{ marginBottom: 10 }}>
                        <span>责任面积：</span>
                        <span>{projectItem.respArea}m2</span>
                      </p>
                      <p style={{ marginBottom: 10 }}>
                        <span>立项级别：</span>
                        {/* （01：部级，02：省级，03：市级，04：县级） */}
                        <span>{projectItem.projectLevel}</span>
                      </p>
                      <p style={{ marginBottom: 10 }}>
                        <span>项目合规性：</span>
                        <span>空</span>
                      </p>
                      <p style={{ marginBottom: 10 }}>
                        <span>项目类别：</span>
                        <span>{projectItem.expand.projectCate}</span>
                      </p>
                      <p style={{ marginBottom: 10 }}>
                        <span>项目类型：</span>
                        <span>{projectItem.expand.projectType}</span>
                      </p>
                      <p style={{ marginBottom: 10 }}>
                        <span>建设状态：</span>
                        <span>空</span>
                      </p>
                      <p style={{ marginBottom: 10 }}>
                        <span>项目性质：</span>
                        <span>{projectItem.expand.projectNat}</span>
                      </p>
                      <p style={{ marginBottom: 10 }}>
                        <span>涉及县：</span>
                        <span>空</span>
                      </p>
                      <p style={{ textAlign: "justify" }}>
                        <span>备注：</span>
                        <span>空</span>
                      </p>
                      <a
                        style={{ position: "absolute", right: 0, bottom: 0 }}
                        onClick={() => {
                          emitter.emit("showProjectDetail", {
                            show: true,
                            edit: false
                          });
                        }}
                      >
                        详情
                      </a>
                    </div>
                  </Collapse.Panel>
                  <Collapse.Panel
                    header={
                      <b>
                        监督执法记录：2
                        <Icon
                          type="plus-circle"
                          style={{
                            marginLeft: 10,
                            fontSize: 16,
                            color: "#1890ff"
                          }}
                          onClick={e => {
                            e.stopPropagation();
                            notification["info"]({
                              message: "添加监督执法记录"
                            });
                          }}
                        />
                      </b>
                    }
                    key="1"
                  >
                    <p
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        this.setState({ showCompany: true });
                        this.closeAll();
                      }}
                    >
                      2019/3/22 检查记录
                      <Icon
                        type="delete"
                        style={{
                          float: "right",
                          fontSize: 18,
                          cursor: "point",
                          color: "#1890ff"
                        }}
                        onClick={e => {
                          e.stopPropagation();
                          notification["info"]({
                            message: "删除监督执法记录"
                          });
                        }}
                      />
                      <Icon
                        type="file-text"
                        style={{
                          float: "right",
                          fontSize: 16,
                          cursor: "point",
                          color: "#1890ff",
                          marginRight: 10
                        }}
                        onClick={e => {
                          e.stopPropagation();
                          notification["info"]({
                            message: "查看监督执法记录报告"
                          });
                        }}
                      />
                    </p>
                    <p
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        this.setState({ showCompany: true });
                        this.closeAll();
                      }}
                    >
                      2019/3/22 检查记录
                      <Icon
                        type="delete"
                        style={{
                          float: "right",
                          fontSize: 18,
                          cursor: "point",
                          color: "#1890ff"
                        }}
                        onClick={e => {
                          e.stopPropagation();
                          notification["info"]({
                            message: "删除监督执法记录"
                          });
                        }}
                      />
                      <Icon
                        type="file-text"
                        style={{
                          float: "right",
                          fontSize: 16,
                          cursor: "point",
                          color: "#1890ff",
                          marginRight: 10
                        }}
                        onClick={e => {
                          e.stopPropagation();
                          notification["info"]({
                            message: "查看监督执法记录报告"
                          });
                        }}
                      />
                    </p>
                  </Collapse.Panel>
                  <Collapse.Panel
                    header={
                      <b>
                        扰动图斑：2
                        <Icon
                          type="plus-circle"
                          style={{
                            marginLeft: 10,
                            fontSize: 16,
                            color: "#1890ff"
                          }}
                          onClick={e => {
                            e.stopPropagation();
                            // notification["info"]({
                            //   message: "添加扰动图斑"
                            // });
                            emitter.emit("drawSpot", {
                              draw: true,
                              project_id: "123"
                            });
                            emitter.emit("showSiderbarDetail", {
                              show: true,
                              edit: true,
                              from: "spot",
                              item: { id: "" }
                            });
                          }}
                        />
                        <Switch
                          checkedChildren="归档图斑"
                          unCheckedChildren="归档图斑"
                          defaultChecked
                          style={{ position: "relative", left: 10, top: -2 }}
                          onChange={(v, e) => {
                            e.stopPropagation();
                          }}
                        />
                      </b>
                    }
                    key="2"
                  >
                    <p
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        this.closeAll();
                        emitter.emit("showSiderbarDetail", {
                          show: true,
                          from: "spot",
                          item: { id: "2017154_14848_4848" }
                        });
                      }}
                    >
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
                    <p
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        this.closeAll();
                        emitter.emit("showSiderbarDetail", {
                          show: true,
                          from: "spot",
                          item: { id: "2017154_14848_4848" }
                        });
                      }}
                    >
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
                  <Collapse.Panel
                    header={
                      <b>
                        防治责任范围：2
                        <Icon
                          type="plus-circle"
                          style={{
                            marginLeft: 10,
                            fontSize: 16,
                            color: "#1890ff"
                          }}
                          onClick={e => {
                            e.stopPropagation();
                            notification["info"]({
                              message: "添加防治责任范围"
                            });
                            emitter.emit("drawDuty", {
                              draw: true,
                              project_id: "123"
                            });
                            emitter.emit("showSiderbarDetail", {
                              show: true,
                              edit: true,
                              from: "duty",
                              item: { id: "" }
                            });
                          }}
                        />
                      </b>
                    }
                    key="3"
                  >
                    <p
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        this.closeAll();
                        emitter.emit("showSiderbarDetail", {
                          show: true,
                          from: "duty",
                          item: { id: "2017154_14848_4848" }
                        });
                      }}
                    >
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
                    <p
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        this.closeAll();
                        emitter.emit("showSiderbarDetail", {
                          show: true,
                          from: "duty",
                          item: { id: "2017154_14848_4848" }
                        });
                      }}
                    >
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
                  </Collapse.Panel>
                  {/* <Collapse.Panel
                    header={
                      <b>
                        设计分区：5
                        <Icon
                          type="plus-circle"
                          style={{
                            marginLeft: 10,
                            fontSize: 16,
                            color: "#1890ff"
                          }}
                          onClick={e => {
                            e.stopPropagation();
                            notification["info"]({
                              message: "添加设计分区"
                            });
                          }}
                        />
                      </b>
                    }
                    key="4"
                  >
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
                  */}
                  {/* <Collapse.Panel
                    header={
                      <b>
                        设计措施：5
                        <Icon
                          type="plus-circle"
                          style={{
                            marginLeft: 10,
                            fontSize: 16,
                            color: "#1890ff"
                          }}
                          onClick={e => {
                            e.stopPropagation();
                            notification["info"]({
                              message: "添加设计措施"
                            });
                          }}
                        />
                      </b>
                    }
                    key="5"
                  >
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
                  */}
                  <Collapse.Panel
                    header={
                      <b>
                        责任点：5
                        <Icon
                          type="plus-circle"
                          style={{
                            marginLeft: 10,
                            fontSize: 16,
                            color: "#1890ff"
                          }}
                          onClick={e => {
                            e.stopPropagation();
                            notification["info"]({
                              message: "添加责任点"
                            });
                          }}
                        />
                      </b>
                    }
                    key="6"
                  >
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
                  {/* <Collapse.Panel
                    header={
                      <b>
                        实施措施：5
                        <Icon
                          type="plus-circle"
                          style={{
                            marginLeft: 10,
                            fontSize: 16,
                            color: "#1890ff"
                          }}
                          onClick={e => {
                            e.stopPropagation();
                            notification["info"]({
                              message: "添加实施措施"
                            });
                          }}
                        />
                      </b>
                    }
                    key="7"
                  >
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
                  */}
                  {/* <Collapse.Panel
                    header={
                      <b>
                        问题地块：5
                        <Icon
                          type="plus-circle"
                          style={{
                            marginLeft: 10,
                            fontSize: 16,
                            color: "#1890ff"
                          }}
                          onClick={e => {
                            e.stopPropagation();
                            notification["info"]({
                              message: "添加问题地块"
                            });
                          }}
                        />
                      </b>
                    }
                    key="8"
                  >
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
                */}
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
                <Button
                  type="dashed"
                  icon="rollback"
                  style={{ marginLeft: 20 }}
                >
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
                  {getFieldDecorator("project_name1", {
                    initialValue: projectItem.projectBase.name
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
                    <TreeSelect.TreeNode value="中国" title="中国" key="0-1">
                      <TreeSelect.TreeNode
                        value="广东"
                        title="广东"
                        key="0-1-1"
                      >
                        <TreeSelect.TreeNode
                          value="广州"
                          title="广州"
                          key="random"
                        />
                        <TreeSelect.TreeNode
                          value="中山"
                          title="中山"
                          key="random1"
                        />
                      </TreeSelect.TreeNode>
                      <TreeSelect.TreeNode
                        value="广西"
                        title="广西"
                        key="random2"
                      >
                        <TreeSelect.TreeNode
                          value="南宁"
                          title="南宁"
                          key="random3"
                        />
                      </TreeSelect.TreeNode>
                    </TreeSelect.TreeNode>
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
                    emitter.emit("showProjectDetail", {
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
          </div>{" "}
        </div>
      </div>
    );
  }
}
