import React, { PureComponent } from "react";
import { connect } from "dva";
import { createForm } from "rc-form";
import {
  Menu,
  Icon,
  Tag,
  Tree,
  Button,
  Row,
  Col,
  notification,
  Popover,
  Input,
  Radio,
  List,
  Spin,
  Select,
  Upload,
  Modal,
  TreeSelect,
  Cascader,
  Form,
  Switch,
  DatePicker,
  AutoComplete,
  Table,
  Collapse
} from "antd";
import locale from "antd/lib/date-picker/locale/zh_CN";
import moment from "moment";
import "leaflet/dist/leaflet.css";
import emitter from "../../../utils/event";
import config from "../../../config";
import data from "../../../data";
import { getFile } from "../../../utils/util";
import jQuery from "jquery";
import { dateInitFormat, accessToken } from "../../../utils/util";

let self;
const { TreeNode } = Tree;
const formItemLayout = {
  labelCol: { span: 7 },
  wrapperCol: { span: 16 }
};

@connect(({ project, spot, point, other, user, annex, redLine }) => ({
  project,
  spot,
  point,
  other,
  user,
  annex,
  redLine
}))
@createForm()
export default class integrat extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      show: true,
      showCreateDepart: false,
      value: undefined,
      showProjectDetail: false,
      projectEdit: false,
      showProjectAllInfo: false,
      showCompany: false,
      showProblem: false,
      showQuery: false,
      showCheck: false,
      checked: false,
      ParentId: 0,
      showSpin: true,
      isProjectUpdate: true,
      queryHighlight: false,
      row_pro: 10,
      row_spot: 10,
      row_point: 10,
      query_pro: "",
      query_spot: "",
      query_point: "",
      key: "project",
      createDepartKey: "",
      sort_by: "",
      sort_key: "",
      queryInfo: {},
      inputDisabled: true,
      select: [],
      departList: [],
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
      fileList: [],
      projectFileList: []
    };
    this.map = null;
  }

  componentDidMount() {
    self = this;
    console.log("贵阳至黄平高速公路", "六枝特区平寨镇跃进砂石厂");
    this.queryProject({ SkipCount: 0 });
    this.querySpot({ SkipCount: 0 });
    this.queryPoint({ SkipCount: 0 });
    this.queryDistrict();
    this.queryDict();
    this.eventEmitter = emitter.addListener("deleteSuccess", () => {
      const { key, query_pro, query_spot, query_point } = this.state;
      const v =
        key === "project"
          ? query_pro
          : key === "spot"
          ? query_spot
          : query_point;
      this.search(v);
    });
    this.eventEmitter = emitter.addListener("projectInfoRefresh", v => {
      this.queryRedLineList(v.projectId);
    });
    this.eventEmitter = emitter.addListener("showCreateDepart", v => {
      console.log(v);
      this.setState({
        showCreateDepart: v.show,
        createDepartKey: v.key
      });
    });
    this.eventEmitter = emitter.addListener("projectCreateUpdateBack", () => {
      this.closeAll();
      this.setState({
        showProjectDetail: false
      });
    });
    this.eventEmitter = emitter.addListener("siteLocationBack", data => {
      this.props.form.setFieldsValue({
        pointX: data.longitude, //经度
        pointY: data.latitude //维度
      });
    });
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
    this.eventEmitter = emitter.addListener("screenshotBack", data => {
      console.log("屏幕截图", data);
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
    //search
    this.eventEmitter = emitter.addListener("queryInfo", data => {
      this.scrollDom.scrollTop = 0;
      const { query_pro, query_spot, query_point } = this.state;
      emitter.emit("checkResult", {
        show: false,
        result: []
      });
      let queryHighlight = false;
      for (let i in data.info) {
        if (
          data.info[i] &&
          (data.info[i].length || typeof data.info[i] === "number")
        ) {
          queryHighlight = true;
          console.log(data.info[i]);
        }
      }
      this.setState({
        showCheck: false,
        sort_by: "",
        sort_key: "",
        queryInfo: data.info,
        queryHighlight: queryHighlight
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
          showProjectDetail: data.show, //地图跳转到项目详情
          projectEdit: data.edit
        });
        this.queryProjectById(data.id);
        this.querySpotByProjectId(data.id);
        this.queryRedLineList(data.id);
      } else if (data.from === "spot") {
      } else {
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
      key,
      Sorting,
      queryInfo
    } = this.state;
    const { clientHeight, scrollHeight, scrollTop } = this.scrollDom;
    const isBottom = clientHeight + parseInt(scrollTop, 0) + 1 >= scrollHeight;
    const {
      project: { projectList },
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

  showSpin = state => {
    this.setState({ showSpin: state });
  };

  queryDistrict = () => {
    const { dispatch } = this.props;
    dispatch({
      type: "user/queryDistrict"
    });
  };

  queryDict = () => {
    const { dispatch } = this.props;
    dispatch({
      type: "user/queryDict"
    });
  };

  queryProject = items => {
    const { polygon } = this.state;
    const {
      dispatch,
      project: { projectList }
    } = this.props;
    this.showSpin(true);
    dispatch({
      type: "project/queryProject",
      payload: {
        ...items,
        polygon: polygon,
        items: items.SkipCount === 0 ? [] : projectList.items
      },
      callback: (success, response) => {
        this.showSpin(false);
        if (success) {
          emitter.emit("checkResult", {
            show: false,
            result: response.items
          });
        }
      }
    });
  };

  querySpot = items => {
    const { polygon } = this.state;
    const {
      dispatch,
      spot: { spotList }
    } = this.props;
    this.showSpin(true);
    dispatch({
      type: "spot/querySpot",
      payload: {
        polygon: polygon,
        ...items,
        items: items.SkipCount === 0 ? [] : spotList.items
      },
      callback: (success, response) => {
        this.showSpin(false);
        if (success) {
          emitter.emit("checkResult", {
            show: false,
            result: response.items
          });
        }
      }
    });
  };

  queryPoint = items => {
    const {
      dispatch,
      point: { pointList }
    } = this.props;
    this.showSpin(true);
    dispatch({
      type: "point/queryPoint",
      payload: {
        ...items,
        items: items.SkipCount === 0 ? [] : pointList.items
      },
      callback: (success, response) => {
        this.showSpin(false);
        if (success) {
          emitter.emit("checkResult", {
            show: false,
            result: response.items
          });
        }
      }
    });
  };

  queryProjectById = id => {
    const { dispatch } = this.props;
    const { departList } = this.state;
    this.showSpin(true);
    dispatch({
      type: "project/queryProjectById",
      payload: {
        id: id,
        refresh: true
      },
      callback: (result, success) => {
        this.showSpin(false);
        this.setState({ showProjectDetail: success });
        let arr = [];
        if (result.productDepartment) {
          arr.push(result.productDepartment);
        }
        if (result.supDepartment) {
          arr.push(result.supDepartment);
        }
        if (result.replyDepartment) {
          arr.push(result.replyDepartment);
        }
        this.setState({
          departList: [...departList, ...arr],
          ParentId: result.attachment ? result.attachment.id : 0
        });

        if (result.attachment) {
          const list = result.attachment.child.map(item => {
            return {
              uid: item.id,
              name: item.fileName,
              status: "done",
              url: config.url.annexPreviewUrl + item.id
            };
          });
          this.setState({ projectFileList: list });
        } else {
          this.setState({ projectFileList: [] });
        }
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

  queryRedLineList = id => {
    console.log("项目红线列表1");
    const { dispatch } = this.props;
    dispatch({
      type: "redLine/queryRedLineList",
      payload: {
        ProjectId: id
      }
    });
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

  getDepartKey = value => {
    const { departList } = this.state;
    if (value) {
      const filter = departList.filter(item => {
        return value === item.name;
      });
      return filter[0].id;
    } else {
      return "";
    }
  };

  getDepartList = key => {
    const {
      dispatch,
      form: { validateFields, setFieldsValue }
    } = this.props;
    const { departList, departSearch } = this.state;

    const isAdd = key !== "supDepartmentId" && key !== "replyDepartmentId";
    if (departSearch) {
      dispatch({
        type: "user/departVaild",
        payload: {
          name: departSearch
        },
        callback: (isVaild, data) => {
          if (isVaild) {
            this.setState({ departList: [...departList, data] });
          } else {
            Modal.confirm({
              title: `查不到该单位，${isAdd ? "是否去新建单位" : "请重新输入"}`,
              content: "",
              onOk() {
                if (isAdd) {
                  self.setState({
                    showCreateDepart: true,
                    createDepartKey: key
                  });
                }
                setFieldsValue({ [key]: "" });
              },
              onCancel() {}
            });
          }
        }
      });
    }
  };

  getDictValue = id => {
    const {
      user: { dicList }
    } = this.props;
    if (id) {
      const filter = dicList.filter(item => {
        return item.id === id;
      });
      return filter.map(item => item.value).join(",");
    } else {
      return "";
    }
  };

  dictList = type => {
    const {
      user: { dicList }
    } = this.props;
    if (type) {
      return dicList.filter(item => {
        return item.dictTypeName === type;
      });
    } else {
      return [];
    }
  };

  getDepart = (obj, key) => {
    if (obj) {
      return obj[key];
    } else {
      return "";
    }
  };

  //删除
  projectDelete = id => {
    const { dispatch } = this.props;
    dispatch({
      type: "project/projectDelete",
      payload: {
        id: id
      },
      callback: success => {
        if (success) {
          this.setState({ showProjectDetail: false });
          emitter.emit("deleteSuccess", {
            success: true
          });
          emitter.emit("showProjectDetail", {
            show: false,
            edit: false
          });
        }
      }
    });
  };

  //search
  search = v => {
    const { key, queryInfo } = this.state;
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
  };

  queryDepartList = v => {
    const { dispatch } = this.props;
    dispatch({
      type: "project/departList",
      payload: {
        name: v
      }
    });
  };

  render() {
    const {
      show,
      showSpin,
      queryHighlight,
      previewVisible_min,
      previewVisible_min_left,
      query_pro,
      query_spot,
      ParentId,
      query_point,
      showCompany,
      placeholder,
      sort,
      showProjectDetail,
      isProjectUpdate,
      key,
      projectEdit,
      clientHeight,
      previewVisible,
      previewImage,
      showCreateDepart,
      showCheck,
      showProblem,
      createDepartKey,
      showProjectAllInfo,
      fileList,
      problem,
      queryInfo,
      isArchivalSpot,
      sort_by,
      sort_key,
      projectFileList
    } = this.state;
    const {
      dispatch,
      form: {
        getFieldDecorator,
        resetFields,
        setFieldsValue,
        getFieldValue,
        setFieldValue
      },
      user: { districtList },
      project: { projectList, projectInfo, projectListAdd, departSelectList },
      spot: { spotList, projectInfoSpotList },
      point: { pointList },
      redLine: { redLineList }
    } = this.props;

    const projectItem = isProjectUpdate
      ? projectInfo
      : {
          projectBase: {},
          productDepartment: { name: "", id: "" },
          expand: {
            designStartTime: "",
            designCompTime: "",
            actStartTime: "",
            actCompTime: ""
          }
        };

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
            <span style={{ display: key !== "point" ? "inherit" : "none" }}>
              <Button
                icon={showCheck ? "dashboard" : ""}
                style={{ float: "right" }}
                onClick={() => {
                  emitter.emit("showSiderbarDetail", {
                    show: false
                  });
                  emitter.emit("showTool", {
                    show: true,
                    type: "control",
                    key: key
                  });
                  emitter.emit("showQuery", {
                    show: false
                  });
                }}
              >
                {showCheck ? "" : "仪表盘"}
              </Button>
              <Button
                icon={showCheck ? "shopping" : ""}
                style={{ float: "right" }}
                onClick={() => {
                  emitter.emit("showSiderbarDetail", {
                    show: false
                  });
                  emitter.emit("showTool", {
                    show: true,
                    type: "tool",
                    key: key,
                    checkResult:
                      key === "project"
                        ? projectList.items
                        : key === "spot"
                        ? spotList.items
                        : pointList.items
                  });
                  emitter.emit("showQuery", {
                    show: false
                  });
                }}
              >
                {showCheck ? "" : "工具箱"}
              </Button>
            </span>
          </span>
        ),
        dataIndex: "name",
        render: (v, item) => (
          <span>
            <p>
              <b
                style={{ cursor: "pointer" }}
                onClick={() => {
                  resetFields();
                  //编辑
                  if (key === "project") {
                    this.setState({
                      showProjectDetail: true,
                      isProjectUpdate: true,
                      projectEdit: false,
                      previewVisible_min_left: false
                    });
                    this.queryProjectById(item.id);
                    this.querySpotByProjectId(item.id);
                    this.queryRedLineList(item.id);
                  } else {
                    emitter.emit("showSiderbarDetail", {
                      show: key !== "project",
                      from: key,
                      id: item.id,
                      edit: false,
                      type: "edit"
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
                  if (key === "point") {
                    dispatch({
                      type: "point/queryPointSiteById",
                      payload: { id: item.id },
                      callback: data => {
                        emitter.emit("mapLocation", {
                          item: data,
                          key: key
                        });
                      }
                    });
                  } else {
                    emitter.emit("mapLocation", {
                      item: item,
                      key: key
                    });
                  }
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
              this.search(v);
            }}
            style={{ padding: "20px 20px", width: 300 }}
            enterButton
          />
          {/* 新建 */}
          <Popover
            content={
              key === "project"
                ? "新建项目"
                : key === "spot"
                ? "新建图斑，第一步：绘制图形"
                : "新建标注点"
            }
            title=""
            trigger="hover"
          >
            <Icon
              type={
                key === "project"
                  ? "plus"
                  : key === "spot"
                  ? "radius-upright"
                  : "compass"
              }
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
                    previewVisible_min_left: false,
                    isProjectUpdate: false
                  });
                  resetFields();
                  emitter.emit("showProjectDetail", {
                    show: true,
                    edit: true,
                    id: ""
                  });
                } else if (key === "spot") {
                  emitter.emit("drawGraphics", {
                    draw: true,
                    state: "add",
                    type: "spot",
                    project_id: ""
                  });
                  // emitter.emit("showSiderbarDetail", {
                  //   show: false,
                  //   edit: true,
                  //   from: key,
                  //   type: "add"
                  // });
                } else {
                  emitter.emit("showSiderbarDetail", {
                    show: key !== "project",
                    edit: true,
                    from: key,
                    type: "add"
                  });
                }
              }}
            />
          </Popover>
          <Radio.Group
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
            type={queryHighlight ? "primary" : ""}
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
            size="large"
            style={{
              display: showSpin ? "block" : "none",
              padding: 100,
              position: "absolute",
              top: 300,
              left: 50,
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
                    <div>
                      <Tag color={this.toColor(item.sort)}>{item.sort}</Tag>
                      {item.record}
                    </div>
                    <div style={{ margin: 0 }}>
                      <Radio.Group name="radiogroup">
                        <Radio value={1}>是</Radio>
                        <Radio value={0}>否</Radio>
                      </Radio.Group>
                    </div>
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
                            getFile(file.url);
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
            <Spin
              size="large"
              style={{
                display: showSpin ? "block" : "none",
                padding: 100,
                position: "absolute",
                top: 300,
                left: 45,
                zIndex: 1001
              }}
            />
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
                onClick={() => {
                  const { projectEdit } = this.state;
                  if (projectEdit) {
                    Modal.confirm({
                      title: `确定放弃填写的内容？`,
                      content: "",
                      onOk() {
                        self.setState({ showProjectDetail: false });
                        emitter.emit("showProjectDetail", {
                          show: false,
                          edit: false
                        });
                      },
                      onCancel() {}
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
                }}
              />
              <Button
                icon={projectEdit ? "check" : "edit"}
                shape="circle"
                style={{
                  float: "right",
                  color: "#1890ff",
                  fontSize: 18,
                  zIndex: 1
                }}
                onClick={() => {
                  if (projectEdit) {
                    //submit
                    this.props.form.validateFields((err, values) => {
                      if (!err) {
                        console.log(values);
                        const data = {
                          ...values,
                          attachmentId: ParentId,
                          districtCodes: values.districtCodes.join(","),
                          id: isProjectUpdate ? projectItem.id : ""
                        };
                        emitter.emit("projectCreateUpdate", data);
                      } else {
                        notification["warning"]({
                          message: err.projectName.errors[0].message
                        });
                      }
                    });
                  } else {
                    this.setState({
                      projectEdit: !projectEdit
                    });
                    emitter.emit("showProjectDetail", {
                      show: true,
                      edit: true,
                      id: projectItem.id
                    });
                  }
                }}
              />
            </p>
            <div
              style={{
                display: previewVisible_min_left ? "block" : "none",
                position: "fixed",
                zIndex: 2,
                width: 305
              }}
            >
              <Icon
                type="close"
                style={{
                  fontSize: 18,
                  position: "absolute",
                  top: 10,
                  right: 10
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
                  left: 10,
                  marginTop: 10
                  // borderBottom: "solid 1px #dedede",
                  // paddingBottom: 10
                }}
              >
                <span>位置：</span>
                <span>
                  {projectItem.projectBase.provinceCityDistrictName}
                  {projectItem.projectBase.addressInfo}
                </span>
                <Icon
                  type="environment"
                  style={{
                    float: "right",
                    color: "#1890ff",
                    fontSize: 18,
                    zIndex: 1
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
                <Collapse bordered={false} defaultActiveKey={["0", "2", "3"]}>
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
                        <span>
                          {this.getDepart(
                            projectItem.productDepartment,
                            "name"
                          )}
                        </span>
                      </p>
                      <p style={{ marginBottom: 10 }}>
                        <span>监管单位：</span>
                        <span>
                          {this.getDepart(projectItem.supDepartment, "name")}
                        </span>
                      </p>
                      <p style={{ marginBottom: 10 }}>
                        <span>批复机构：</span>
                        <span>
                          {this.getDepart(projectItem.replyDepartment, "name")}
                        </span>
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
                        <span>
                          {this.getDictValue(projectItem.projectLevelId)}
                        </span>
                      </p>
                      <p style={{ marginBottom: 10 }}>
                        <span>扰动合规性：</span>
                        <span>
                          {this.getDictValue(projectItem.expand.complianceId)}
                        </span>
                      </p>
                      <p style={{ marginBottom: 10 }}>
                        <span>项目类别：</span>
                        <span>
                          {this.getDictValue(projectItem.expand.projectCateId)}
                        </span>
                      </p>
                      <p style={{ marginBottom: 10 }}>
                        <span>项目类型：</span>
                        <span>
                          {this.getDictValue(projectItem.expand.projectTypeId)}
                        </span>
                      </p>
                      <p style={{ marginBottom: 10 }}>
                        <span>建设状态：</span>
                        <span>
                          {this.getDictValue(projectItem.projectStatusId)}
                        </span>
                      </p>
                      <p style={{ marginBottom: 10 }}>
                        <span>项目性质：</span>
                        <span>
                          {this.getDictValue(projectItem.expand.projectNatId)}
                        </span>
                      </p>
                      <p style={{ marginBottom: 10 }}>
                        <span>涉及县：</span>
                        <span>
                          {(projectItem.projectBase.districtCodes || [])
                            .map(item => item.name)
                            .join("，")}
                        </span>
                      </p>
                      <p style={{ textAlign: "justify" }}>
                        <span>备注：</span>
                        <span>{projectItem.description}</span>
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
                            edit: false,
                            id: projectItem.id
                          });
                        }}
                      >
                        详情
                      </a>
                      <a
                        style={{
                          display: isProjectUpdate ? "inherit" : "none",
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
                              self.projectDelete(projectItem.id);
                            },
                            onCancel() {}
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
                            emitter.emit("drawGraphics", {
                              draw: true,
                              state: "add",
                              type: "spot",
                              projectId: projectItem.id
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
                            id: item.id,
                            projectId: projectItem.id
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
                        防治责任范围：{redLineList.items.length}
                        <Icon
                          type="plus-circle"
                          style={{
                            marginLeft: 10,
                            fontSize: 16,
                            color: "#1890ff"
                          }}
                          onClick={e => {
                            e.stopPropagation();
                            emitter.emit("drawGraphics", {
                              draw: true,
                              state: "add",
                              type: "redLine",
                              projectId: projectItem.id
                            });
                          }}
                        />
                      </b>
                    }
                    key="3"
                  >
                    {redLineList.items.map((item, index) => (
                      <p
                        key={index}
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                          this.closeAll();
                          emitter.emit("showSiderbarDetail", {
                            show: true,
                            edit: false,
                            from: "redLine",
                            type: "edit",
                            id: item.id,
                            projectId: projectItem.id
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
                            Modal.confirm({
                              title: "删除",
                              content: "是否确定要删除这条项目红线数据？",
                              okText: "是",
                              okType: "danger",
                              cancelText: "否",
                              onOk() {
                                dispatch({
                                  type: "redLine/redLineDelete",
                                  payload: {
                                    id: item.id
                                  },
                                  callback: success => {
                                    if (success) {
                                      emitter.emit("projectInfoRefresh", {
                                        projectId: projectItem.id
                                      });
                                    }
                                  }
                                });
                              },
                              onCancel() {}
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
                <Form.Item
                  label={
                    <span>
                      <b style={{ color: "red" }}>*</b>
                      项目名
                    </span>
                  }
                  {...formItemLayout}
                >
                  {getFieldDecorator("projectName", {
                    initialValue: projectItem.projectBase.name,
                    rules: [{ required: true, message: "项目名不能为空" }]
                  })(
                    <AutoComplete
                      style={{ width: 200 }}
                      dataSource={projectListAdd}
                      filterOption={(inputValue, option) =>
                        option.props.children
                          .toUpperCase()
                          .indexOf(inputValue.toUpperCase()) !== -1
                      }
                      onChange={v => {
                        dispatch({
                          type: "project/queryProjectAdd",
                          payload: {
                            SkipCount: 0,
                            MaxResultCount: 5,
                            ProjectName: v
                          }
                        });
                      }}
                      onBlur={() => {
                        const v = getFieldValue("projectName");
                        dispatch({
                          type: "project/projectVerify",
                          payload: {
                            name: v
                          },
                          callback: (success, result) => {
                            if (!result.isValid) {
                              setFieldsValue({
                                projectName: ""
                              });
                              if (result.isArchive) {
                                notification["warning"]({
                                  message: `该项目名已存在并且已归档，请重新输入`
                                });
                              }
                              notification["warning"]({
                                message: `该项目名已存在，请重新输入`
                              });
                            } else {
                              notification["success"]({
                                message: `该项目名可用`
                              });
                            }
                          }
                        });
                      }}
                    />
                  )}
                </Form.Item>
                <Form.Item label="所在地区" {...formItemLayout}>
                  {getFieldDecorator("districtCodeId", {
                    initialValue: projectItem.provinceCityDistrict
                  })(
                    <Cascader
                      placeholder="请选择所在地区"
                      options={districtList}
                      changeOnSelect
                    />
                  )}
                </Form.Item>
                <Form.Item label="详细地址" {...formItemLayout}>
                  {getFieldDecorator("town", {
                    initialValue: projectItem.product_department_id1
                  })(<Input />)}
                </Form.Item>
                <Form.Item label="坐标" {...formItemLayout}>
                  {getFieldDecorator("pointX", {})(
                    <Input placeholder="经度" style={{ width: 72 }} />
                  )}
                  {getFieldDecorator("pointY", {})(
                    <Input
                      placeholder="纬度"
                      style={{ width: 110, position: "relative", top: -2 }}
                      addonAfter={
                        <Icon
                          type="environment"
                          style={{
                            color: "#1890ff"
                          }}
                          onClick={() => {
                            // emitter.emit("showProjectDetail", {
                            //   show: false,
                            //   edit: false
                            // });
                            this.props.form.validateFields((err, values) => {
                              if (!err) {
                                emitter.emit("siteLocation", {
                                  state:
                                    values.pointX && values.pointY
                                      ? "end"
                                      : "begin",
                                  Longitude: values.pointX,
                                  Latitude: values.pointY
                                });
                              }
                            });
                          }}
                        />
                      }
                    />
                  )}
                </Form.Item>
                <Form.Item label="建设单位" {...formItemLayout}>
                  {getFieldDecorator("productDepartmentId", {
                    initialValue: this.getDepart(
                      projectItem.productDepartment,
                      "id"
                    )
                  })(
                    <Select
                      showSearch
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        option.props.children
                          .toLowerCase()
                          .indexOf(input.toLowerCase()) >= 0
                      }
                      onSearch={v => {
                        this.setState({ departSearch: v });
                        this.queryDepartList(v);
                      }}
                      onBlur={() => {
                        if (departSelectList.length === 0) {
                          this.getDepartList("productDepartmentId");
                        }
                      }}
                    >
                      {departSelectList.map(item => (
                        <Select.Option value={item.value} key={item.value}>
                          {item.label}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
                <Form.Item label="监管单位" {...formItemLayout}>
                  {getFieldDecorator("supDepartmentId", {
                    initialValue: this.getDepart(
                      projectItem.supDepartment,
                      "id"
                    )
                  })(
                    <Select
                      showSearch
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        option.props.children
                          .toLowerCase()
                          .indexOf(input.toLowerCase()) >= 0
                      }
                      onSearch={v => {
                        this.setState({ departSearch: v });
                        this.queryDepartList(v);
                      }}
                      onBlur={() => {
                        if (departSelectList.length === 0) {
                          this.getDepartList("supDepartmentId");
                        }
                      }}
                    >
                      {departSelectList.map(item => (
                        <Select.Option value={item.value} key={item.value}>
                          {item.label}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
                <Form.Item label="批复机构" {...formItemLayout}>
                  {getFieldDecorator("replyDepartmentId", {
                    initialValue: this.getDepart(
                      projectItem.replyDepartment,
                      "id"
                    )
                  })(
                    <Select
                      showSearch
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        option.props.children
                          .toLowerCase()
                          .indexOf(input.toLowerCase()) >= 0
                      }
                      onSearch={v => {
                        this.setState({ departSearch: v });
                        this.queryDepartList(v);
                      }}
                      onBlur={() => {
                        if (departSelectList.length === 0) {
                          this.getDepartList("supDepartmentId");
                        }
                      }}
                    >
                      {departSelectList.map(item => (
                        <Select.Option value={item.value} key={item.value}>
                          {item.label}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
                <Form.Item label="流域管理机构" {...formItemLayout}>
                  {getFieldDecorator("ctn_code111", {
                    initialValue: projectItem.riverBasinOU
                  })(
                    <Select showSearch allowClear optionFilterProp="children">
                      {this.dictList("流域管理机构").map(item => (
                        <Select.Option value={item.id} key={item.id}>
                          {item.value}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
                <Form.Item label="批复文号" {...formItemLayout}>
                  {getFieldDecorator("replyNum", {
                    initialValue: projectItem.replyNum
                  })(<Input />)}
                </Form.Item>
                <Form.Item label="批复时间" {...formItemLayout}>
                  {getFieldDecorator("replyTime", {
                    initialValue: dateInitFormat(projectItem.replyTime)
                  })(<DatePicker />)}
                </Form.Item>
                <Form.Item label="责任面积" {...formItemLayout}>
                  {getFieldDecorator("area", {
                    initialValue: projectItem.respArea
                  })(<Input addonAfter="m2" />)}
                </Form.Item>
                <Form.Item label="立项级别" {...formItemLayout}>
                  {getFieldDecorator("projectLevelId", {
                    initialValue: projectItem.projectLevelId
                  })(
                    <Select showSearch allowClear optionFilterProp="children">
                      {this.dictList("立项级别").map(item => (
                        <Select.Option value={item.id} key={item.id}>
                          {item.value}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
                <Form.Item label="扰动合规性" {...formItemLayout}>
                  {getFieldDecorator("complianceId", {
                    initialValue: projectItem.expand.complianceId
                  })(
                    <Select showSearch allowClear optionFilterProp="children">
                      {this.dictList("扰动合规性").map(item => (
                        <Select.Option value={item.id} key={item.id}>
                          {item.value}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
                <Form.Item label="项目类别" {...formItemLayout}>
                  {getFieldDecorator("projectCateId", {
                    initialValue: projectItem.expand.projectCateId
                  })(
                    <Select showSearch allowClear optionFilterProp="children">
                      {this.dictList("项目类别").map(item => (
                        <Select.Option value={item.id} key={item.id}>
                          {item.value}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
                <Form.Item label="项目类型" {...formItemLayout}>
                  {getFieldDecorator("projectTypeId", {
                    initialValue: projectItem.expand.projectTypeId
                  })(
                    <Select showSearch allowClear optionFilterProp="children">
                      {this.dictList("项目类型").map(item => (
                        <Select.Option value={item.id} key={item.id}>
                          {item.value}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
                <Form.Item label="建设状态" {...formItemLayout}>
                  {getFieldDecorator("projectStatusId", {
                    initialValue: projectItem.projectStatusId
                  })(
                    <Select showSearch allowClear optionFilterProp="children">
                      {this.dictList("建设状态").map(item => (
                        <Select.Option value={item.id} key={item.id}>
                          {item.value}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
                <Form.Item label="项目性质" {...formItemLayout}>
                  {getFieldDecorator("projectNatId", {
                    initialValue: projectItem.expand.projectNatId
                  })(
                    <Select showSearch allowClear optionFilterProp="children">
                      {this.dictList("项目性质").map(item => (
                        <Select.Option value={item.id} key={item.id}>
                          {item.value}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
                <Form.Item
                  label={
                    <span>
                      <b style={{ color: "red" }}>*</b>
                      涉及县
                    </span>
                  }
                  {...formItemLayout}
                >
                  {getFieldDecorator("districtCodes", {
                    valuePropName: "value",
                    initialValue: (
                      projectItem.projectBase.districtCodes || []
                    ).map(item => item.id)
                  })(
                    <TreeSelect
                      showSearch
                      style={{ width: "100%" }}
                      dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
                      placeholder="请选择涉及县"
                      allowClear
                      multiple
                      treeDefaultExpandAll
                    >
                      {districtList.map(item => (
                        <TreeSelect.TreeNode
                          value={item.value}
                          title={item.label}
                          key={item.value}
                          disabled
                        >
                          {(item.children || []).map(ite => (
                            <TreeSelect.TreeNode
                              value={ite.value}
                              title={ite.label}
                              key={ite.value}
                              disabled
                            >
                              {(ite.children || []).map(i => (
                                <TreeSelect.TreeNode
                                  value={i.value}
                                  title={i.label}
                                  key={i.value}
                                />
                              ))}
                            </TreeSelect.TreeNode>
                          ))}
                        </TreeSelect.TreeNode>
                      ))}
                    </TreeSelect>
                  )}
                </Form.Item>
                <Form.Item label="备注" {...formItemLayout}>
                  {getFieldDecorator("description", { initialValue: "" })(
                    <Input.TextArea autosize />
                  )}
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
                      edit: true,
                      id: projectItem.id
                    });
                  }}
                >
                  详情
                </a>
                <a
                  style={{
                    display: isProjectUpdate ? "inherit" : "none",
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
                        self.projectDelete(projectItem.id);
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
            <div
              style={{
                minHeight: projectFileList.length ? 120 : 0,
                marginTop: 20
              }}
            >
              <Upload
                action={config.url.annexUploadUrl}
                headers={{ Authorization: `Bearer ${accessToken()}` }}
                data={{ Id: ParentId }}
                listType="picture-card"
                fileList={projectFileList}
                onSuccess={v => {
                  if (v.success) {
                    this.setState({ ParentId: v.result.id });
                  } else {
                    notification["error"]({
                      message: `附件上传失败：${v.error.message}`
                    });
                  }
                }}
                onPreview={file => {
                  this.setState({
                    previewImage: file.url || file.thumbUrl,
                    previewVisible_min_left: true
                  });
                  getFile(file.url);
                }}
                onChange={({ fileList }) => {
                  const data = fileList.map(item => {
                    return {
                      ...item,
                      status: "done"
                    };
                  });
                  this.setState({ projectFileList: data });
                }}
                onRemove={file => {
                  return new Promise((resolve, reject) => {
                    if (projectEdit) {
                      dispatch({
                        type: "annex/annexDelete",
                        payload: {
                          FileId: file.uid,
                          Id: projectItem.attachment.id
                        },
                        callback: success => {
                          if (success) {
                            resolve();
                          } else {
                            reject();
                          }
                        }
                      });
                    } else {
                      reject();
                      notification["info"]({
                        message: `请先开始编辑项目`
                      });
                    }
                  });
                }}
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
                icon="cloud-download"
                style={{
                  display: projectItem.isArchive ? "none" : "block",
                  marginTop: 20
                }}
                onClick={() => {
                  this.setState({ archiveTime: "" });
                  Modal.confirm({
                    title: "项目归档",
                    content: (
                      <span>
                        归档时间：
                        <DatePicker
                          locale={locale}
                          onChange={(date, dateString) => {
                            console.log(date, dateString);
                            this.setState({ archiveTime: dateString });
                          }}
                        />
                      </span>
                    ),
                    onOk() {
                      const { archiveTime } = self.state;
                      return new Promise((resolve, reject) => {
                        if (archiveTime) {
                          resolve();
                          dispatch({
                            type: "project/projectArchive",
                            payload: {
                              id: projectItem.id,
                              ArchiveTime: archiveTime
                            },
                            callback: success => {
                              if (success) {
                                self.setState({ showProjectDetail: false });
                                emitter.emit("deleteSuccess", {});
                              }
                            }
                          });
                        } else {
                          notification["warning"]({
                            message: `请选择归档时间`
                          });
                          reject();
                        }
                      });
                    },
                    onCancel() {}
                  });
                }}
              >
                项目归档
              </Button>
              <Button
                icon="rollback"
                style={{
                  display: projectItem.isArchive ? "block" : "none",
                  marginLeft: 20
                }}
                onClick={() => {
                  dispatch({
                    type: "project/projectUnArchive",
                    payload: {
                      id: projectItem.id
                    },
                    callback: success => {
                      if (success) {
                        self.setState({ showProjectDetail: false });
                        emitter.emit("deleteSuccess", {});
                      }
                    }
                  });
                }}
              >
                撤销归档
              </Button>
            </div>
            <Modal
              title="新建单位"
              visible={showCreateDepart}
              onOk={() => {
                this.props.form.validateFields((err, v) => {
                  console.log(v);
                  dispatch({
                    type: "project/departCreate",
                    payload: v,
                    callback: (success, result) => {
                      if (success) {
                        self.setState({ showCreateDepart: false });
                        setFieldsValue({ [createDepartKey]: result.id });
                        notification["success"]({
                          message: `单位新建成功`
                        });

                        emitter.emit("departNameReset", {
                          key: createDepartKey,
                          name: result.name,
                          id: result.id
                        });
                      }
                    }
                  });
                });
              }}
              onCancel={() => {
                this.setState({ showCreateDepart: false });
              }}
            >
              <Form>
                <Row gutter={24}>
                  <Col span={12}>
                    <Form.Item label="单位名称" {...formItemLayout}>
                      {getFieldDecorator("name", {})(<Input />)}
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="单位地址" {...formItemLayout}>
                      {getFieldDecorator("address", {})(<Input />)}
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="单位类型" {...formItemLayout}>
                      {getFieldDecorator("depType", {})(
                        <Select style={{ width: 120 }}>
                          <Select.Option value="1">生产建设单位</Select.Option>
                          <Select.Option value="2">方案编制单位</Select.Option>
                          <Select.Option value="3">设计单位</Select.Option>
                          <Select.Option value="4">施工单位</Select.Option>
                          <Select.Option value="5">监测单位</Select.Option>
                          <Select.Option value="6">监理单位</Select.Option>
                          <Select.Option value="7">
                            验收报告编制单位
                          </Select.Option>
                        </Select>
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="单位描述" {...formItemLayout}>
                      {getFieldDecorator("description", {})(<Input />)}
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="联系电话" {...formItemLayout}>
                      {getFieldDecorator("phone", {})(<Input />)}
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="单位邮编" {...formItemLayout}>
                      {getFieldDecorator("zipcode", {})(<Input />)}
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="联系人id" {...formItemLayout}>
                      {getFieldDecorator("contactId", {})(<Input />)}
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="单位资质" {...formItemLayout}>
                      {getFieldDecorator("intelligence", {})(<Input />)}
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="法人代表" {...formItemLayout}>
                      {getFieldDecorator("legal", {})(<Input />)}
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="传真" {...formItemLayout}>
                      {getFieldDecorator("fax", {})(<Input />)}
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="主要投资方1" {...formItemLayout}>
                      {getFieldDecorator("investors1", {})(<Input />)}
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="主要投资方2" {...formItemLayout}>
                      {getFieldDecorator("investors2", {})(<Input />)}
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="主要投资方3" {...formItemLayout}>
                      {getFieldDecorator("investors3", {})(<Input />)}
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            </Modal>
          </div>
        </div>
      </div>
    );
  }
}
