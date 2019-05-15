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
import { getFile } from "../../../utils/util";
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

@connect(({ project, spot, point, other }) => ({
  project,
  spot,
  point,
  other
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
      row_point: 10,
      query_pro: "",
      query_spot: "",
      query_point: "",
      key: "project",
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
    console.log("贵阳至黄平高速公路", "六枝特区平寨镇跃进砂石厂");
    this.queryProject({ SkipCount: 0 });
    this.querySpot({ SkipCount: 0 });
    this.queryPoint({ SkipCount: 0 });
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
    this.eventEmitter = emitter.addListener("chartLinkage", data => {
      this.setState({
        polygon: data.polygon
      });
      this.querySpot({
        SkipCount: 0,
        polygon: data.polygon
      });
    });
    this.eventEmitter = emitter.addListener("queryInfo", data => {
      this.scrollDom.scrollTop = 0;
      const {
        key,
        query_pro,
        Sorting,
        query_spot,
        query_point,
        polygon
      } = this.state;
      emitter.emit("checkResult", {
        show: false,
        result: []
      });
      this.setState({
        showCheck: false,
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
          SkipCount: 0,
          ProjectName: query_pro
        });
      } else if (data.from === "spot") {
        this.setState({ row_spot: 10 });
        this.querySpot({
          ...data.info,
          SkipCount: 0,
          MapNum: query_spot
        });
      } else {
        this.setState({ row_point: 10 });
        this.queryPoint({
          ...data.info,
          SkipCount: 0,
          ProjectName: query_point
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
        this.querySpotByProjectId(data.id);
        this.queryRedLineByProjectId(data.id);
      }
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
      row_point,
      query_pro,
      query_spot,
      query_point,
      polygon,
      key,
      Sorting,
      queryInfo
    } = this.state;
    const { clientHeight, scrollHeight, scrollTop } = this.scrollDom;
    const isBottom = clientHeight + parseInt(scrollTop, 0) + 1 >= scrollHeight;
    const {
      project: { projectList, projectItem },
      spot: { spotList },
      point: { pointList }
    } = this.props;
    console.log(
      clientHeight,
      scrollHeight,
      parseInt(scrollTop, 0) + 1,
      isBottom
    );
    if (isBottom) {
      if (key === "project") {
        if (projectList.items.length < projectList.totalCount) {
          this.queryProject({
            ...queryInfo,
            SkipCount: row_pro,
            Sorting: Sorting,
            ProjectName: query_pro
          });
          this.setState({ row_pro: row_pro + 10 });
        }
      } else if (key === "spot") {
        if (spotList.items.length < spotList.totalCount) {
          this.querySpot({
            ...queryInfo,
            SkipCount: row_spot,
            Sorting: Sorting,
            MapNum: query_spot
          });
          this.setState({ row_spot: row_spot + 10 });
        }
      } else {
        if (pointList.items.length < pointList.totalCount) {
          this.queryPoint({
            ...queryInfo,
            SkipCount: row_point,
            Sorting: Sorting,
            MapNum: query_point
          });
          this.setState({ row_point: row_point + 10 });
        }
      }
    }
  }

  queryProject = items => {
    const { polygon } = this.state;
    const {
      dispatch,
      project: { projectList }
    } = this.props;
    dispatch({
      type: "project/queryProject",
      payload: {
        ...items,
        polygon: polygon,
        items: items.SkipCount === 0 ? [] : projectList.items
      }
    });
  };

  querySpot = items => {
    const { polygon } = this.state;
    const {
      dispatch,
      spot: { spotList }
    } = this.props;
    dispatch({
      type: "spot/querySpot",
      payload: {
        polygon: polygon,
        ...items,
        items: items.SkipCount === 0 ? [] : spotList.items
      }
    });
  };

  queryPoint = items => {
    const {
      dispatch,
      point: { pointList }
    } = this.props;
    dispatch({
      type: "point/queryPoint",
      payload: {
        ...items,
        items: items.SkipCount === 0 ? [] : pointList.items
      }
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

  querySpotByProjectId = id => {
    const { dispatch } = this.props;
    dispatch({
      type: "spot/querySpotByProjectId",
      payload: {
        ProjectId: id,
        MaxResultCount: 1000,
        SkipCount: 0
      }
    });
  };

  queryRedLineByProjectId = id => {
    const { dispatch } = this.props;
    dispatch({
      type: "project/queryRedLineByProjectId",
      payload: {
        ProjectId: id
      }
    });
  };

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
    emitter.emit("checkResult", {
      show: false,
      result: []
    });
    const k = e.key;
    this.setState({
      showQuery: false,
      showCheck: false,
      key: k,
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
                key: "Description"
              },
              {
                value: "标注时间",
                key: "CreateTime"
              },
              {
                value: "关联项目",
                key: "Project.Id"
              }
            ]
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
      previewVisible_min,
      previewVisible_min_left,
      query_pro,
      query_spot,
      query_point,
      showCompany,
      placeholder,
      sort,
      listData,
      showProjectDetail,
      key,
      projectEdit,
      polygon,
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
      queryInfo,
      isArchivalSpot,
      sort_by,
      sort_key
    } = this.state;
    const {
      dispatch,
      project: { projectList, projectItem, projectInfoRedLineList },
      spot: { spotList, projectInfoSpotList },
      point: { pointList }
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

    const list =
      key === "project"
        ? projectList.items
        : key === "spot"
        ? spotList.items
        : pointList.items;
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
                ? projectList.items.length
                : key === "spot"
                ? spotList.items.length
                : pointList.items.length}
              /
              {key === "project"
                ? projectList.totalCount
                : key === "spot"
                ? spotList.totalCount
                : pointList.totalCount}
              条
            </span>
            <Button
              icon="dashboard"
              style={{ float: "right" }}
              onClick={() => {
                emitter.emit("showSiderbarDetail", {
                  show: false
                });
                emitter.emit("showTool", {
                  show: true,
                  type: "control",
                  from: key
                });
                emitter.emit("showQuery", {
                  show: false
                });
              }}
            >
              {showCheck ? "" : "仪表盘"}
            </Button>
            <Button
              icon="shopping"
              style={{ float: "right" }}
              onClick={() => {
                emitter.emit("showSiderbarDetail", {
                  show: false
                });
                emitter.emit("showTool", {
                  show: true,
                  type: "tool",
                  from: key
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
                      showProjectDetail: true,
                      previewVisible_min_left: false
                    });
                    this.queryProjectById(item.id);
                    this.querySpotByProjectId(item.id);
                    this.queryRedLineByProjectId(item.id);
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
                {key === "project"
                  ? item.projectName
                  : key === "spot"
                  ? item.mapNum
                  : item.createTime}
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
              {key === "project"
                ? `建设单位：${item.productDepartmentName || ""}`
                : key === "spot"
                ? `关联项目：${item.projectName || ""}`
                : `关联项目：${item.projectName || ""}`}
            </span>
            <br />
            <span>
              {key === "project"
                ? `批复机构：${item.replyDepartmentName || ""}`
                : key === "spot"
                ? `扰动合规性：${item.interferenceCompliance || ""}`
                : `描述：${item.description || ""}`}
            </span>
          </span>
        )
      }
    ];

    const rowSelectionTable = {
      onChange: (selectedRowKeys, selectedRows) => {
        console.log(selectedRows);
        emitter.emit("checkResult", {
          show: true,
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
              emitter.emit("checkResult", {
                show: false,
                result: []
              });
              this.setState({
                showCheck: false,
                sort_by: "",
                sort_key: ""
              });
              if (key === "project") {
                this.setState({
                  query_pro: v,
                  row_pro: 10
                });
                this.queryProject({
                  ...queryInfo,
                  SkipCount: 0,
                  ProjectName: v,
                  from: "query"
                });
              } else if (key === "spot") {
                this.setState({ query_spot: v, row_spot: 10 });
                this.querySpot({
                  ...queryInfo,
                  SkipCount: 0,
                  MapNum: v,
                  from: "query"
                });
              } else {
                this.setState({ query_point: v, row_point: 10 });
                this.queryPoint({
                  ...queryInfo,
                  SkipCount: 0,
                  ProjectName: v,
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
                this.setState({
                  showProjectDetail: true,
                  projectEdit: true,
                  previewVisible_min_left: false
                });
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
                      SkipCount: 0,
                      ProjectName: query_pro
                    });
                  } else if (key === "spot") {
                    this.setState({
                      row_spot: 10
                    });
                    this.querySpot({
                      ...queryInfo,
                      Sorting: Sorting_new,
                      SkipCount: 0,
                      ProjectName: query_spot
                    });
                  } else {
                    this.setState({
                      row_point: 10
                    });
                    this.queryPoint({
                      ...queryInfo,
                      Sorting: Sorting_new,
                      SkipCount: 0,
                      ProjectName: query_point
                    });
                  }
                }}
              >
                {item.value}
                <Icon
                  type={sort_by === "Desc" ? "caret-down" : "caret-up"}
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
                    display: previewVisible_min ? "block" : "none",
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
                    onClick={() => {
                      this.setState({ previewVisible_min: false });
                      emitter.emit("imgLocation", {
                        Latitude: 0,
                        Longitude: 0,
                        show: false
                      });
                    }}
                  />
                  <img
                    alt="example"
                    style={{ width: "100%", cursor: "pointer" }}
                    src={previewImage}
                    onClick={() => {
                      this.setState({
                        previewImage: previewImage,
                        previewVisible: true
                      });
                    }}
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
                      onChange={() =>
                        this.setState({ previewVisible_min: false })
                      }
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
                          onPreview={file => {
                            const dom = jQuery(`<img src=${file.url}></img>`);
                            this.setState({
                              previewImage: file.url || file.thumbUrl,
                              previewVisible_min: true
                            });
                            getFile(dom[0]);
                          }}
                          onChange={({ fileList }) =>
                            this.setState({ fileList })
                          }
                        >
                          <Button type="div" icon="plus">
                            上传文件
                          </Button>
                          <Button
                            icon="picture"
                            onClick={e => {
                              e.stopPropagation();
                              emitter.emit("screenshot", {
                                show: true
                              });
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
                width: 150,
                height: 0,
                left: 173,
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
                display: previewVisible_min_left ? "block" : "none",
                position: "fixed",
                zIndex: 1,
                width: 305
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
                onClick={() => {
                  this.setState({ previewVisible_min_left: false });
                  emitter.emit("imgLocation", {
                    Latitude: 0,
                    Longitude: 0,
                    show: false
                  });
                }}
              />
              <img
                alt="example"
                style={{ width: "100%", cursor: "pointer" }}
                src={previewImage}
                onClick={() => {
                  this.setState({
                    previewImage: previewImage,
                    previewVisible: true
                  });
                }}
              />
            </div>
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
                          right: 40,
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
                      <a
                        style={{
                          position: "absolute",
                          right: 0,
                          bottom: 0,
                          userSelect: "none"
                        }}
                        onClick={() => {
                          Modal.confirm({
                            title: "是否确定要删除这条项目数据？",
                            content:
                              "删除之后，项目关联的监督执法记录、防治责任范围、责任点都将被删除，扰动图斑保留。 ",
                            okText: "是",
                            okType: "danger",
                            cancelText: "否",
                            onOk() {
                              console.log("OK");
                            },
                            onCancel() {
                              console.log("Cancel");
                            }
                          });
                        }}
                      >
                        删除
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
                        扰动图斑：{projectInfoSpotList.items.length}
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
                              type: "add"
                            });
                          }}
                        />
                        <Icon
                          type="block"
                          style={{
                            marginLeft: 10,
                            fontSize: 16,
                            color: "#1890ff"
                          }}
                          onClick={e => {
                            e.stopPropagation();
                            //图斑关联
                            emitter.emit("spotRelate", {
                              status: "start", //start：开始，end：结束
                              mapNum: ""
                            });
                          }}
                        />
                        <Switch
                          checkedChildren="归档图斑"
                          unCheckedChildren="归档图斑"
                          style={{ position: "relative", left: 10, top: -2 }}
                          onChange={(v, e) => {
                            e.stopPropagation();
                            console.log(v);
                            this.setState({ isArchivalSpot: v });
                          }}
                        />
                      </b>
                    }
                    key="2"
                  >
                    {projectInfoSpotList.items.map((item, index) => (
                      <p
                        key={index}
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                          this.closeAll();
                          emitter.emit("showSiderbarDetail", {
                            show: true,
                            edit: false,
                            from: "spot",
                            type: "edit",
                            id: item.id
                          });
                        }}
                      >
                        {item.mapNum} {isArchivalSpot ? "2019-05-08" : ""}
                        <Icon
                          type="disconnect"
                          style={{
                            float: "right",
                            fontSize: 18,
                            cursor: "point",
                            color: "#1890ff"
                          }}
                          onClick={e => {
                            e.stopPropagation();
                            notification["info"]({
                              message: "解绑图斑"
                            });
                          }}
                        />
                        <Icon
                          type="environment"
                          style={{
                            float: "right",
                            fontSize: 16,
                            cursor: "point",
                            color: "#1890ff",
                            marginRight: 10
                          }}
                          onClick={e => {
                            e.stopPropagation();
                            emitter.emit("mapLocation", {
                              item: item,
                              key: "spot"
                            });
                          }}
                        />
                      </p>
                    ))}
                  </Collapse.Panel>
                  <Collapse.Panel
                    header={
                      <b>
                        防治责任范围：{projectInfoRedLineList.items.length}
                        <Icon
                          type="plus-circle"
                          style={{
                            marginLeft: 10,
                            fontSize: 16,
                            color: "#1890ff"
                          }}
                          onClick={e => {
                            e.stopPropagation();
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
                    {projectInfoRedLineList.items.map((item, index) => (
                      <p
                        key={index}
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                          this.closeAll();
                          emitter.emit("showSiderbarDetail", {
                            show: true,
                            from: "duty",
                            id: item.id
                          });
                        }}
                      >
                        {item.id}
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
                              message: "删除防治责任范围"
                            });
                          }}
                        />
                        <Icon
                          type="environment"
                          style={{
                            float: "right",
                            fontSize: 16,
                            cursor: "point",
                            color: "#1890ff",
                            marginRight: 10
                          }}
                          onClick={e => {
                            e.stopPropagation();
                            emitter.emit("mapLocation", {
                              item: item,
                              key: "redLine"
                            });
                          }}
                        />
                      </p>
                    ))}
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
                    right: 40,
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
                <a
                  style={{
                    position: "absolute",
                    right: 0,
                    bottom: 0,
                    userSelect: "none"
                  }}
                  onClick={() => {
                    Modal.confirm({
                      title: "是否确定要删除这条项目数据？",
                      content: (
                        <span>
                          删除之后，项目关联的监督执法记录、防治责任范围、责任点都将被删除，扰动图斑保留。
                        </span>
                      ),
                      okText: "是",
                      okType: "danger",
                      cancelText: "否",
                      onOk() {
                        console.log("OK");
                      },
                      onCancel() {
                        console.log("Cancel");
                      }
                    });
                  }}
                >
                  删除
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
                    previewVisible_min_left: true
                  });
                  const dom = jQuery(`<img src=${file.url}></img>`);
                  getFile(dom[0]);
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
              onCancel={() => {
                this.setState({ previewVisible: false });
              }}
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
