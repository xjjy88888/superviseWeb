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

const { MonthPicker, RangePicker, WeekPicker } = DatePicker;
const dateFormat = "YYYY-MM-DD";
const { TreeNode } = Tree;
const CheckboxGroup = Checkbox.Group;
const formItemLayout = {
  labelCol: { span: 7 },
  wrapperCol: { span: 16 }
};
let scrollTop = 0;

@connect(({ project, spot }) => ({
  project,
  spot
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
      showProjectAllInfo: false,
      showCompany: false,
      showProblem: false,
      showQuery: false,
      showCheck: false,
      checked: false,
      row_pro: 10,
      row_spot: 10,
      key: "project",
      query_pro_ProjectName: "",
      query_pro_MapNum: "",
      sort_by: "",
      sort_key: "",
      queryInfo: {},
      inputDisabled: true,
      select: [],
      problem: { title: "", records: [] },
      placeholder: "项目名称",
      sort: [
        {
          value: "名称",
          key: "ProjectBase.Name"
        },
        {
          value: "操作时间",
          key: "ProjectBase.ModifyTime"
        },
        {
          value: "立项级别",
          key: "ProjectLevel.Key"
        }
      ],
      listData: [],
      previewVisible: false,
      previewImage: "",
      fileList: [
        {
          uid: "1",
          name: "xxx.png",
          status: "done",
          url: "./img/logo2.jpg"
        },
        {
          uid: "2",
          name: "xxx.png",
          status: "done",
          url: "./img/spot.jpg"
        }
      ]
    };
    this.map = null;
  }

  componentDidMount() {
    this.eventEmitter = emitter.addListener("showSiderbar", data => {
      this.setState({
        show: data.show
      });
    });
    this.eventEmitter = emitter.addListener("hideQuery", data => {
      this.setState({
        showQuery: !data.hide
      });
    });
    this.eventEmitter = emitter.addListener("hideProjectDetail", data => {
      this.setState({
        showProjectAllInfo: !data.hide
      });
    });
    this.eventEmitter = emitter.addListener("queryInfo", data => {
      this.scrollDom.scrollTop = 0;
      const {
        row_pro,
        row_spot,
        key,
        query_pro_ProjectName,
        Sorting,
        query_pro_MapNum
      } = this.state;
      this.setState({
        sort_by: "",
        sort_key: "",
        queryInfo: data.info
      });
      if (data.from === "project") {
        this.setState({
          row_pro: 10
        });
        this.queryProject({
          ...data.info,
          row: 10,
          ProjectName: query_pro_ProjectName
        });
      } else if (data.from === "spot") {
        this.setState({ row_spot: 10 });
        this.querySpot({
          ...data.info,
          row: 10,
          MapNum: query_pro_MapNum
        });
      }
    });
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
      this.queryProject({ row: 10 });
      this.querySpot({ row: 10 });
    });
    const { clientHeight } = this.refDom;
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
    const {
      row_pro,
      row_spot,
      key,
      Sorting,
      query_pro_ProjectName,
      query_pro_MapNum,
      queryInfo
    } = this.state;
    const { clientHeight, scrollHeight, scrollTop } = this.scrollDom;
    const isBottom = clientHeight + parseInt(scrollTop, 0) + 1 >= scrollHeight;
    const {
      project: { projectList, projectItem },
      spot: { spotList }
    } = this.props;
    console.log(
      clientHeight,
      scrollHeight,
      parseInt(scrollTop, 0) + 1,
      isBottom
    );
    if (isBottom) {
      if (key === "project") {
        const len = projectList.totalCount;
        if (row_pro < len) {
          const new_row = row_pro + 10 > len ? len : row_pro + 10;
          this.queryProject({
            ...queryInfo,
            row: new_row,
            Sorting: Sorting,
            ProjectName: query_pro_ProjectName
          });
          this.setState({ row_pro: new_row });
        }
      } else if (key === "spot") {
        const len = spotList.totalCount;
        if (row_spot < len) {
          const new_row = row_spot + 10 > len ? len : row_spot + 10;
          this.querySpot({
            ...queryInfo,
            row: new_row,
            Sorting: Sorting,
            MapNum: query_pro_MapNum
          });
          this.setState({ row_spot: new_row });
        }
      } else {
      }
    }
  }

  getFile = dom => {
    EXIF.getData(dom, function() {
      const allMetaData = EXIF.getAllTags(this);

      let direction;
      if (allMetaData.GPSImgDirection) {
        const directionArry = allMetaData.GPSImgDirection; // 方位角
        direction = directionArry.numerator / directionArry.denominator;
      }

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

      console.log(allMetaData);
      console.log(Longitude, Latitude, direction);
      emitter.emit("imgLocation", {
        Latitude: Latitude,
        Longitude: Longitude,
        direction: direction,
        show: true
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

  queryProject = items => {
    const {
      dispatch,
      project: { projectList }
    } = this.props;
    dispatch({
      type: "project/queryProject",
      payload: {
        ...items,
        items: items.row === 10 ? [] : projectList.items
      }
    });
  };

  querySpot = items => {
    const {
      dispatch,
      spot: { spotList }
    } = this.props;
    dispatch({
      type: "spot/querySpot",
      payload: {
        ...items,
        items: items.row === 10 ? [] : spotList.items
      }
    });
  };

  handleCancel = () => {
    this.setState({ previewVisible: false });
    emitter.emit("imgLocation", {
      Latitude: 0,
      Longitude: 0,
      show: false
    });
  };

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
    this.setState({ showQuery: false });
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

    const k = e.key;
    this.setState({
      placeholder:
        k === "project" ? "项目名称" : k === "spot" ? "图斑编号" : "关联项目",
      sort:
        k === "project"
          ? [
              {
                value: "名称",
                key: "ProjectBase.Name"
              },
              {
                value: "操作时间",
                key: "ProjectBase.ModifyTime"
              },
              {
                value: "立项级别",
                key: "ProjectLevel.Key"
              }
            ]
          : k === "spot"
          ? [
              {
                value: "编号",
                key: "MapNum"
              },
              {
                value: "操作时间",
                key: "ModifyTime"
              },
              {
                value: "复核状态",
                key: "IsReview"
              }
            ]
          : [
              {
                value: "描述",
                key: "ProjectBase.Name"
              },
              {
                value: "标注时间",
                key: "ProjectBase.ModifyTime"
              },
              {
                value: "关联项目",
                key: "ProjectLevel.Key"
              }
            ]
    });
    this.setState({
      key: k
    });
  };

  sort = e => {
    const v = e.target.value;
    const key = v.slice(0, v.length - 1);
    const type = v.charAt(v.length - 1);
  };

  TreeOnSelect = e => {
    if (e.length) {
      const isRoot = isNaN(e[0].slice(0, 1));
      this.setState({ showProblem: true });
      emitter.emit("showProblem", {
        show: true
      });
      this.setState({ previewVisible: false });
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
      Sorting,
      query_pro_ProjectName,
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
      showProjectAllInfo,
      fileList,
      select,
      checked,
      problem,
      row_pro,
      row_spot,
      queryInfo,
      sort_by,
      sort_key
    } = this.state;
    const {
      dispatch,
      project: { projectList, projectItem },
      spot: { spotList }
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
              {key === "project"
                ? row_pro < projectList.totalCount
                  ? row_pro
                  : projectList.totalCount
                : row_spot < spotList.totalCount
                ? row_spot
                : spotList.totalCount}
              /
              {key === "project" ? projectList.totalCount : spotList.totalCount}
              条
            </span>
            <Button
              type="dashed"
              icon="dashboard"
              style={{ float: "right" }}
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
            <Button
              type="dashed"
              icon="shopping"
              style={{ float: "right" }}
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
                      id: key === "project" ? item.id : item.id
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
          zIndex: 1000,
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
            backgroundColor: "rgba(0, 0, 0, 0.5)",
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
            placeholder={`${placeholder}`}
            onSearch={v => {
              this.scrollDom.scrollTop = 0;
              this.setState({
                sort_by: "",
                sort_key: "",
                query_pro_ProjectName: v,
                row_pro: 10
              });
              if (key === "project") {
                this.setState({
                  query_pro_ProjectName: v,
                  row_pro: 10
                });
                this.queryProject({
                  ...queryInfo,
                  row: 10,
                  ProjectName: v,
                  from: "query"
                });
              } else if (key === "spot") {
                this.setState({ query_pro_MapNum: v, row_spot: 10 });
                this.querySpot({
                  ...queryInfo,
                  row: 10,
                  MapNum: v,
                  from: "query"
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
            onClick={() => {
              if (key === "project") {
                this.setState({ showProjectDetail: true, projectEdit: true });
                emitter.emit("showProjectDetail", {
                  show: true,
                  edit: true
                });
              } else if (key === "spot") {
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
              }
            }}
          />
          <Radio.Group
            defaultValue="a"
            buttonStyle="solid"
            style={{ padding: "0px 15px" }}
            onClick={e => {
              const v = e.target.value;
              const key = v.slice(0, v.length - 1);
              const type = v.charAt(v.length - 1);
              console.log(v, key, type);
            }}
          >
            {sort.map((item, index) => (
              <Radio.Button
                style={{ userSelect: "none" }}
                key={item.key}
                value={item.key}
                onClick={() => {
                  const by =
                    item.key === sort_key && sort_by && sort_by === "Desc"
                      ? "Asc"
                      : "Desc";
                  const Sorting_new = `${item.key} ${by}`;
                  this.setState({
                    sort_key: item.key,
                    sort_by: by,
                    Sorting: Sorting_new
                  });
                  this.scrollDom.scrollTop = 0;
                  if (key === "project") {
                    this.setState({
                      row_pro: 10
                    });
                    this.queryProject({
                      ...queryInfo,
                      Sorting: Sorting_new,
                      row: 10,
                      ProjectName: query_pro_ProjectName
                    });
                  } else if (key === "spot") {
                    this.setState({
                      row_spot: 10
                    });
                    this.querySpot({
                      ...queryInfo,
                      Sorting: Sorting_new,
                      row: 10,
                      ProjectName: query_pro_ProjectName
                    });
                  }
                }}
              >
                {item.value}
                <Icon
                  type={sort_by === "Desc" ? "down" : "up"}
                  style={{
                    display:
                      sort_key === item.key && sort_by ? "inherit  " : "none",
                    fontSize: 5
                  }}
                />
              </Radio.Button>
            ))}
          </Radio.Group>
          <Button
            style={{
              display: showPoint ? "none" : "inline"
            }}
            onClick={() => {
              const { key, showQuery } = this.state;
              this.setState({ showQuery: !showQuery });
              emitter.emit("showSiderbarDetail", {
                show: false
              });
              emitter.emit("showTool", {
                show: false,
                type: "tool"
              });
              emitter.emit("showQuery", {
                show: !showQuery,
                type: key
              });
            }}
          >
            筛选
          </Button>
          <Spin
            style={{
              display: projectList.totalCount === "" ? "block" : "none",
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
                  backgroundColor: "rgba(0, 0, 0, 0.5)",
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
                <Collapse
                  bordered={false}
                  defaultActiveKey={["0", "1", "2", "3"]}
                >
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
                        style={{
                          position: "absolute",
                          right: 0,
                          bottom: 0,
                          userSelect: "none"
                        }}
                        onClick={() => {
                          this.setState({
                            showProjectAllInfo: !showProjectAllInfo
                          });
                          emitter.emit("showProjectDetail", {
                            show: !showProjectAllInfo,
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
                  style={{
                    position: "absolute",
                    right: 0,
                    bottom: 0,
                    userSelect: "none"
                  }}
                  onClick={() => {
                    this.setState({
                      showProjectAllInfo: !showProjectAllInfo
                    });
                    emitter.emit("showProjectDetail", {
                      show: !showProjectAllInfo,
                      edit: true
                    });
                  }}
                >
                  详情
                </a>
              </Form>
            </div>
            <div style={{ marginTop: 20 }}>
              <Upload
                action="//jsonplaceholder.typicode.com/posts/"
                listType="picture-card"
                fileList={fileList}
                onPreview={file => {
                  this.setState({
                    previewImage: file.url || file.thumbUrl,
                    previewVisible: true
                  });
                }}
                onChange={({ fileList }) => this.setState({ fileList })}
              >
                {projectEdit ? (
                  <div>
                    <Icon type="plus" />
                    <div className="ant-upload-text">上传</div>
                  </div>
                ) : null}
              </Upload>
            </div>
            <Modal
              visible={previewVisible}
              footer={null}
              onCancel={() => this.setState({ previewVisible: false })}
            >
              <img alt="example" style={{ width: "100%" }} src={previewImage} />
            </Modal>
            <div>
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
      </div>
    );
  }
}
