import React, { PureComponent } from "react";
import { connect } from "dva";
import { createForm } from "rc-form";
import { Link } from "dva/router";
import jQuery from "jquery";
import {
  Menu,
  Icon,
  Tag,
  Button,
  Popover,
  Input,
  Select,
  Table,
  Tooltip
} from "antd";
import data from "../../../data";
import Spins from "../../../components/Spins";
import emitter from "../../../utils/event";
import { dateFormat, getUrl } from "../../../utils/util";
import styles from "./style/sidebar.less";

let self;
let loading = false;

@connect(
  ({
    project,
    spot,
    point,
    other,
    user,
    annex,
    redLine,
    district,
    inspect,
    problemPoint,
    panorama,
    projectSupervise,
    videoMonitor,
    commonModel
  }) => ({
    project,
    spot,
    point,
    other,
    user,
    annex,
    redLine,
    district,
    inspect,
    problemPoint,
    panorama,
    projectSupervise,
    videoMonitor,
    commonModel
  })
)
@createForm()
export default class siderbar extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      hover: false,
      place: "",
      show: true,
      value: undefined,
      projectEdit: false,
      showProjectAllInfo: false,
      showCompany: false,
      showProblem: false,
      showQuery: false,
      isArchivalSpot: false,
      showCheck: false,
      checked: false,
      ParentId: 0,
      showSpin: true,
      isProjectUpdate: true,
      queryHighlight: false,
      ShowArchive: false,
      row_pro: 20,
      row_spot: 20,
      row_point: 20,
      query_pro: "",
      query_spot: "",
      query_point: "",
      key: "project",
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
      projectFileList: [],
      showPlan: false,
      clickId: null,
      isProjectSupervise: false,
      TaskLevelAndInterBatch: null
    };
    this.map = null;
  }

  componentDidMount() {
    const { link, dispatch } = this.props;
    link(this);
    self = this;

    const urlFrom = getUrl(`from`);
    const urlId = getUrl(`id`);
    const urlIsProject = getUrl(`isProject`);
    if (urlFrom === `project` && urlId) {
      this.setState({ show: false });
    }
    if (urlFrom === `project` && urlIsProject === `true`) {
      this.setState({ isProjectSupervise: true });
    }

    this.queryProject({ SkipCount: 0 });
    this.queryProjectSupervise({ SkipCount: 0 });
    this.interpretList();
    this.eventEmitter = emitter.addListener("deleteSuccess", () => {
      const { key, query_pro, query_spot, query_point } = this.state;
      const v =
        key === "project"
          ? query_pro
          : key === "spot"
          ? query_spot
          : query_point;
      this.search(v);
      this.interpretList();
    });
    this.eventEmitter = emitter.addListener("projectCreateUpdateBack", () => {
      this.hide();
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

    // 图表联动
    this.eventEmitter = emitter.addListener("chartLinkage", data => {
      if (this.scrollDom) {
        this.scrollDom.scrollTop = 0;
      }
      this.setState({
        polygon: data.polygon
      });
      if (self.state.key === "spot") {
        this.querySpot({
          SkipCount: 0,
          polygon: data.polygon
        });
      } else {
        this.queryProject({
          SkipCount: 0,
          polygon: data.polygon
        });
      }
    });

    //search
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
    const { clientHeight } = this.refDom;
    this.setState({
      clientHeight: clientHeight
    });
    this.saveCurrentPageInfo("project");

    this.eventEmitter = emitter.addListener("showProjectSpotInfo", data => {
      if (data.from === "project") {
        this.setState({ show: false });
      } else if (data.from === "spot") {
      } else {
      }
    });
    // 组件首次生成先清除queryParmas
    dispatch({
      type: "project/projectSave",
      payload: {
        queryParams: {}
      }
    });
  }

  componentDidUpdate(prevProps) {
    const {
      showProjectInfo,
      project: { queryParams },
      commonModel: {
        siderBarPageInfo: { currentProjectId, currentSpotId }
      }
    } = this.props;
    if (
      prevProps.project.queryParams !== queryParams &&
      queryParams.queryParamsChangeBy !== "sideBar"
    ) {
      console.log(
        "sideBar----componentDidUpdate--queryParams================",
        queryParams
      );
      if (queryParams.from && queryParams.from === "project") {
        this.queryProject({ ...queryParams });
      } else if (queryParams.from && queryParams.from === "spot") {
        this.querySpot({ ...queryParams });
      }
    }
    if (
      prevProps.commonModel.siderBarPageInfo.currentProjectId !==
        currentProjectId &&
      currentProjectId &&
      prevProps.commonModel.siderBarPageInfo.currentProjectId
    ) {
      console.log("componentDidUpdate,showProjectInfo");
      showProjectInfo({
        id: currentProjectId,
        isEdit: false,
        isProjectSupervise: false
      });
    } else if (
      prevProps.commonModel.siderBarPageInfo.currentSpotId !== currentSpotId &&
      currentSpotId &&
      prevProps.commonModel.siderBarPageInfo.currentSpotId
    ) {
      emitter.emit("showSiderbarDetail", {
        show: true,
        from: "spot",
        id: currentSpotId,
        edit: false,
        fromList: true,
        type: "edit"
      });
      this.setState({ clickId: currentSpotId });
    }
  }

  show = v => {
    console.log("显示列表", v);
    this.setState({ show: true });
  };

  refreshSpotList = () => {
    this.querySpot({ SkipCount: 0 });
  };

  // 将筛选内容保存到props中
  querySave = payload => {
    const {
      dispatch,
      project: { queryParams }
    } = this.props;
    const { query_pro, query_spot, TaskLevelAndInterBatch } = this.state;
    let obj = {};
    if (
      payload.from &&
      payload.from === "project" &&
      Object.keys(payload.queryParams).length === 0
    ) {
      obj = {
        SkipCount: 0,
        ProjectName: query_pro,
        from: payload.from,
        queryParamsChangeBy: "sideBar"
      };
    } else if (
      payload.from &&
      payload.from === "spot" &&
      Object.keys(payload.queryParams).length === 0
    ) {
      obj = {
        SkipCount: 0,
        MapNum: query_spot,
        TaskLevelAndInterBatch,
        from: payload.from,
        queryParamsChangeBy: "sideBar"
      };
    }
    dispatch({
      type: "project/projectSave",
      payload: {
        queryParams:
          Object.keys(obj).length === 0
            ? {
                ...queryParams,
                ...payload.queryParams,
                queryParamsChangeBy: "sideBar",
                from: payload.from
              }
            : obj
      }
    });
  };

  queryInfo = data => {
    console.log("列表筛选完成", data);
    if (this.scrollDom) {
      this.scrollDom.scrollTop = 0;
    }
    const { query_pro, query_spot, query_point } = this.state;

    emitter.emit("checkResult", {
      show: false,
      result: []
    });
    let queryHighlight = false;
    for (let i in data.queryParams) {
      if (
        data.queryParams[i] &&
        (data.queryParams[i].length ||
          typeof data.queryParams[i] === "number" ||
          typeof data.queryParams[i] === "boolean")
      ) {
        queryHighlight = true;
      }
    }
    this.setState({
      showCheck: false,
      sort_by: "",
      sort_key: "",
      queryInfo: data.queryParams,
      ShowArchive: data.ShowArchive,
      queryHighlight: queryHighlight
    });

    // 保存筛选数据到props
    this.querySave(data);
    if (data.from === "project") {
      this.setState({
        row_pro: 20
      });

      this.queryProject({
        ...data.queryParams,
        SkipCount: 0,
        ProjectName: query_pro
      });
    } else if (data.from === "spot") {
      this.setState({ row_spot: 20 });
      this.querySpot({
        ...data.queryParams,
        SkipCount: 0,
        MapNum: query_spot
      });
    } else {
      this.setState({ row_point: 20 });
      this.queryPoint({
        ...data.queryParams,
        SkipCount: 0,
        ProjectName: query_point
      });
    }
  };

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: "commonModel/save",
      payload: {
        siderBarPageInfo: {
          activeMenu: "",
          currentProjectId: "",
          currentSpotId: ""
        }
      }
    });
    if (this.scrollDom) {
      this.scrollDom.removeEventListener("scroll", () => {
        this.onScroll(this);
      });
    }
  }

  onScroll() {
    const {
      project: { projectList },
      spot: { spotList },
      point: { pointList },
      projectSupervise: { projectSuperviseList }
    } = this.props;

    const {
      row_pro,
      row_spot,
      row_point,
      query_pro,
      query_spot,
      query_point,
      key,
      Sorting,
      queryInfo,
      isProjectSupervise
    } = this.state;

    const { clientHeight, scrollHeight, scrollTop } = this.scrollDom;
    const isBottom = clientHeight + parseInt(scrollTop, 0) + 1 >= scrollHeight;
    if (isBottom) {
      if (loading) {
        return;
      }
      if (key === "project") {
        const pl = isProjectSupervise
          ? projectSuperviseList.items.length
          : projectList.items.length;
        const pt = isProjectSupervise
          ? projectSuperviseList.totalCount
          : projectList.totalCount;
        if (pl < pt) {
          const obj = {
            ...queryInfo,
            Count: pt,
            SkipCount: row_pro,
            Sorting: Sorting,
            ProjectName: query_pro
          };
          this.queryProject(obj);
          this.querySave({
            queryParams: obj,
            from: "project"
          });
          this.setState({ row_pro: row_pro + 20 });
        }
      } else if (key === "spot") {
        if (spotList.items.length < spotList.totalCount) {
          const obj = {
            ...queryInfo,
            Count: spotList.totalCount,
            SkipCount: row_spot,
            Sorting: Sorting,
            MapNum: query_spot
          };
          this.querySpot(obj);
          this.querySave({
            queryParams: obj,
            from: "spot"
          });
          this.setState({ row_spot: row_spot + 20 });
        }
      } else {
        if (pointList.items.length < pointList.totalCount) {
          this.queryPoint({
            ...queryInfo,
            SkipCount: row_point,
            Sorting: Sorting,
            MapNum: query_point
          });
          this.setState({ row_point: row_point + 20 });
        }
      }
    }
  }

  showSpin = state => {
    this.setState({ showSpin: state });
  };

  interpretList = () => {
    const {
      switchInterpret,
      dispatch,
      project: { queryParams }
    } = this.props;
    const { key } = this.state;
    dispatch({
      type: "spot/interpretList",
      callback: (success, result) => {
        if (success && result.length) {
          const TaskLevelAndInterBatch = result[0];
          this.setState({ TaskLevelAndInterBatch }, () => {
            this.querySave({ from: key, queryParams: { ...queryParams } });
          });
          // emitter.emit("sidebarQuery", {
          //   TaskLevelAndInterBatch
          // });

          switchInterpret(TaskLevelAndInterBatch);
        } else {
          switchInterpret(null);
        }
      }
    });
  };

  dataFormat = v => {
    // console.log("dataFormat开始", v);
    for (let i in v) {
      if (Array.isArray(v[i])) {
        if (i === "ReplyTime" && v[i].length) {
          v.ReplyTimeBegin = dateFormat(v[i][0]);
          v.ReplyTimeEnd = dateFormat(v[i][1]);
        }
        v[i] = v[i].join(",");
      }
    }
    v.SkipCount = v.SkipCount || 0;
    v.MaxResultCount = v.MaxResultCount || 20;
    // console.log("dataFormat结束", v);
  };

  queryProject = items => {
    items.queryParamsChangeBy && delete items.queryParamsChangeBy;
    loading = true;
    const { polygon, key, showCheck, isProjectSupervise } = this.state;
    const {
      dispatch,
      project: { projectList }
    } = this.props;
    items.from && delete items.from;
    this.dataFormat(items);
    if (isProjectSupervise) {
      this.queryProjectSupervise(items);
    } else {
      this.showSpin(true);
      dispatch({
        type: "project/queryProject",
        payload: {
          ...items,
          polygon: polygon,
          items: items.SkipCount === 0 ? [] : projectList.items
        },
        callback: (success, response) => {
          loading = false;
          this.showSpin(false);
          if (!showCheck && success && key === "project") {
            emitter.emit("checkResult", {
              show: false,
              result: response.items
            });
          }
        }
      });
    }
  };

  queryProjectSupervise = items => {
    const {
      queryProjectFilter,
      dispatch,
      projectSupervise: { projectSuperviseList }
    } = this.props;
    this.showSpin(true);
    const payload = {
      ...items,
      IsExclusive: true,
      IsShared: true,
      items: items.SkipCount === 0 ? [] : projectSuperviseList.items
    };
    dispatch({
      type: "projectSupervise/queryProjectSupervise",
      payload,
      callback: (success, response) => {
        this.showSpin(false);
        queryProjectFilter(payload);
      }
    });
  };

  querySpot = items => {
    items.queryParamsChangeBy && delete items.queryParamsChangeBy;
    loading = true;
    const { polygon, key, showCheck, TaskLevelAndInterBatch } = this.state;
    const {
      dispatch,
      spot: { spotList }
    } = this.props;
    this.showSpin(true);
    items.from && delete items.from;
    this.dataFormat(items);
    dispatch({
      type: "spot/querySpot",
      payload: {
        TaskLevelAndInterBatch,
        polygon: polygon,
        ...items,
        items: items.SkipCount === 0 ? [] : spotList.items
      },
      callback: (success, response) => {
        loading = false;
        this.showSpin(false);
        if (!showCheck && success && key === "spot") {
          emitter.emit("checkResult", {
            show: false,
            result: response.items
          });
        }
      }
    });
  };

  queryPoint = items => {
    items.queryParamsChangeBy && delete items.queryParamsChangeBy;
    loading = true;
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
        loading = false;
        this.showSpin(false);
      }
    });
  };

  // 鼠标进入事件
  onMouseEnter = (val, e) => {
    // console.log("e==============", e);
    this.setState({
      hover: true,
      place: val
    });
  };
  // 鼠标离开事件
  onMouseLeave = (val, e) => {
    // console.log("e==============", e);
    this.setState({
      hover: false,
      place: val
    });
  };

  hide = () => {
    const {
      hideProjectInfoMore,
      dispatch,
      commonModel: { siderBarPageInfo }
    } = this.props;
    dispatch({
      type: "commonModel/save",
      payload: {
        siderBarPageInfo: {
          ...siderBarPageInfo,
          currentProjectId: "",
          currentSpotId: ""
        }
      }
    });
    if (jQuery("#ProjectList").position().left >= 0) {
      jQuery("#ProjectList").animate({ left: -window.innerWidth });
    }

    emitter.emit("emptyPoint");
    emitter.emit("showSiderbarDetail", {
      show: false
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
    emitter.emit("showProblemPoint", {
      show: false
    });
    emitter.emit("showMeasurePoint", {
      show: false
    });
    hideProjectInfoMore();
  };

  // 保存当前活跃的menu的key等信息
  saveCurrentPageInfo = key => {
    const {
      dispatch,
      commonModel: { siderBarPageInfo }
    } = this.props;
    dispatch({
      type: "commonModel/save",
      payload: {
        siderBarPageInfo: {
          ...siderBarPageInfo,
          activeMenu: key
        }
      }
    });
  };

  switchMenu = e => {
    this.hide();
    this.scrollDom.scrollTop = 0;
    const k = e.key;
    let obj = { from: k, queryParams: {} };

    this.saveCurrentPageInfo(k);
    if (k === "project") {
      // 保存筛选数据到props
      this.querySave(obj);
      this.queryProject({
        SkipCount: 0
        // ProjectName: query_pro
      });
    } else if (k === "spot") {
      // 保存筛选数据到props
      this.querySave(obj);
      this.querySpot({
        SkipCount: 0
        // MapNum: query_spot
      });
    } else {
      this.queryPoint({ SkipCount: 0 });
    }
    this.setState({
      ProjectName: "",
      MapNum: "",
      showQuery: false,
      showCheck: false,
      ShowArchive: false,
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
                key: "LastModificationTime"
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
      form: { setFieldsValue }
    } = this.props;
    const { departSearch } = this.state;

    if (departSearch) {
      dispatch({
        type: "user/departVaild",
        payload: {
          name: departSearch
        },
        callback: (isVaild, data) => {
          if (isVaild) {
            this.setState({
              departList: [{ label: data.name, value: data.id }]
            });
            setFieldsValue({ [key]: data.id });
          } else {
          }
        }
      });
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
    const { dispatch, hideProjectInfoMore } = this.props;
    dispatch({
      type: "project/projectDelete",
      payload: {
        id: id
      },
      callback: success => {
        if (success) {
          emitter.emit("deleteSuccess", {
            success: true
          });
          hideProjectInfoMore();
        }
      }
    });
  };

  find = (arr, v, key) => {
    let result;
    if (!arr) {
      return;
    }
    // eslint-disable-next-line array-callback-return
    arr.map(item => {
      if (item.value === v) {
        result = [item[key]];
      } else {
        const child = this.find(item.children, v, key);
        if (child) {
          result = [item[key], ...child];
        }
      }
    });
    return result;
  };

  //search
  search = v => {
    const { key, queryInfo } = this.state;
    if (this.scrollDom) {
      this.scrollDom.scrollTop = 0;
    }
    emitter.emit("checkResult", {
      show: false,
      result: []
    });
    this.setState({
      showCheck: false,
      sort_by: "",
      sort_key: ""
    });
    // emitter.emit("sidebarQuery", {
    //   [key === "project" ? `projectName` : `mapNum`]: v
    // });
    if (key === "project") {
      this.setState({
        query_pro: v,
        row_pro: 20
      });
      const obj = {
        ...queryInfo,
        SkipCount: 0,
        ProjectName: v,
        from: "query"
      };
      this.querySave({
        queryParams: obj,
        from: "project"
      });
      this.queryProject(obj);
    } else if (key === "spot") {
      this.setState({ query_spot: v, row_spot: 20 });
      const obj = {
        ...queryInfo,
        SkipCount: 0,
        MapNum: v,
        from: "query",
        Sorting: ""
      };
      this.querySave({
        queryParams: obj,
        from: "spot"
      });
      this.querySpot(obj);
    } else {
      this.setState({ query_point: v, row_point: 20 });
      this.queryPoint({
        ...queryInfo,
        SkipCount: 0,
        ProjectName: v,
        from: "query"
      });
    }
  };

  queryDepartList = (v, t) => {
    const { dispatch } = this.props;
    dispatch({
      type: "project/departList",
      payload: {
        name: v,
        kind: t
      }
    });
  };

  // 点击图标，展示项目列表表格页
  async onShowProjectList() {
    const { showProjectList } = this.props;
    this.setState({ hover: false });

    await showProjectList();
  }

  render() {
    const {
      showProjectInfo,
      showProjectInfoMore,
      switchData,
      mapLocation,
      switchInterpret,
      dispatch,
      form: { resetFields },
      project: { projectList, queryParams },
      spot: { spotList, interpretList },
      point: { pointList },
      projectSupervise: { projectSuperviseList }
    } = this.props;

    const {
      hover,
      place,
      show,
      showSpin,
      queryHighlight,
      query_pro,
      query_spot,
      query_point,
      placeholder,
      sort,
      key,
      clientHeight,
      showCheck,
      queryInfo,
      sort_by,
      ShowArchive,
      sort_key,
      clickId,
      isProjectSupervise,
      TaskLevelAndInterBatch
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

    const tabsProject = [
      {
        title: "项目",
        key: ["project"]
      }
    ];

    const list = isProjectSupervise
      ? projectSuperviseList.items
      : key === "project"
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
              {isProjectSupervise
                ? projectSuperviseList.items.length
                : key === "project"
                ? projectList.items.length
                : key === "spot"
                ? spotList.items.length
                : pointList.items.length}
              /
              {isProjectSupervise
                ? projectSuperviseList.totalCount
                : key === "project"
                ? projectList.totalCount
                : key === "spot"
                ? spotList.totalCount
                : pointList.totalCount}
              条
            </span>
            <span
              style={{
                display: key !== "point" ? "inherit" : "none"
              }}
            >
              <Button
                icon={showCheck ? "shopping" : ""}
                style={{ marginLeft: 20 }}
                onClick={() => {
                  emitter.emit("showSiderbarDetail", {
                    show: false
                  });
                  emitter.emit("showTool", {
                    show: true,
                    type: "tool",
                    key: key,
                    ShowArchive: ShowArchive,
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
              <Button
                icon={showCheck ? "dashboard" : ""}
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
            </span>
          </span>
        ),
        dataIndex: "name",
        render: (v, item) => (
          <span>
            <p>
              <span
                style={{ cursor: "pointer" }}
                onClick={() => {
                  const {
                    commonModel: { siderBarPageInfo },
                    dispatch
                  } = this.props;
                  this.setState({ clickId: item.id });
                  if (key === "project" || key === "spot") {
                    dispatch({
                      type: "commonModel/save",
                      payload: {
                        siderBarPageInfo: {
                          ...siderBarPageInfo,
                          currentProjectId: key === "project" ? item.id : "",
                          currentSpotId: key === "spot" ? item.id : ""
                        }
                      }
                    });
                  }

                  resetFields();
                  //编辑
                  if (key === "project") {
                    showProjectInfo({
                      id: item.id,
                      isEdit: false,
                      isProjectSupervise
                    });
                    this.setState({ show: false });
                  } else {
                    emitter.emit("showSiderbarDetail", {
                      show: key !== "project",
                      from: key,
                      id: item.id,
                      edit: false,
                      fromList: true,
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
                <b
                  style={
                    item.id === clickId
                      ? {
                          color: "green"
                        }
                      : {}
                  }
                >
                  {key === "project" || isProjectSupervise
                    ? item.projectName
                    : key === "spot"
                    ? item.mapNum
                    : item.createTime + "  " + item.name}
                </b>
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
                  if (key === "point") {
                    dispatch({
                      type: "point/queryPointById",
                      payload: { id: item.id },
                      callback: v => {
                        mapLocation({
                          item: v,
                          key: key
                        });
                      }
                    });
                  } else {
                    mapLocation({
                      item,
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
        id="List"
        style={{
          left: show ? 0 : "-350px"
        }}
        className={styles.siderbar}
        ref={e => (this.refDom = e)}
      >
        <Tooltip title="展开列表">
          <Icon
            type="right"
            className={`${styles["show-project-list"]} ${
              hover && place === "top" ? styles.spec : null
            }`}
            style={{
              top: hover && place === "top" ? "11%" : "12%"
            }}
            onMouseEnter={this.onMouseEnter.bind(this, "top")}
            onMouseLeave={this.onMouseLeave.bind(this, "top")}
            onClick={this.onShowProjectList.bind(this)}
          />
        </Tooltip>
        <Tooltip title={`${show ? "收起" : "展开"}侧边栏`}>
          <Icon
            type={show ? "left" : "right"}
            className={`${styles["show-project-list"]} ${
              hover && place === "footer" ? styles.spec : null
            }`}
            style={{
              top: hover && place === "footer" ? "47.5%" : "48.5%"
            }}
            onMouseEnter={this.onMouseEnter.bind(this, "footer")}
            onMouseLeave={this.onMouseLeave.bind(this, "footer")}
            onClick={() => {
              this.setState({
                show: !show,
                hover: false
              });
              emitter.emit("showSiderbar", {
                show: !show
              });
            }}
          />
        </Tooltip>
        <div
          style={{
            height: "100%",
            overflow: "hidden",
            backgroundColor: "#fff"
          }}
        >
          <Link to="/project">
            <Icon
              type="menu-unfold"
              style={{
                display: isProjectSupervise ? "block" : "none",
                position: "absolute",
                right: 64,
                top: 60,
                fontSize: 20,
                color: "#1890ff"
              }}
            />
          </Link>
          <Tag
            color={isProjectSupervise ? "volcano" : "cyan"}
            style={{
              position: "absolute",
              right: 0,
              top: 49,
              userSelect: "none",
              cursor: "pointer"
            }}
            onClick={() => {
              this.hide();
              this.scrollDom.scrollTop = 0;
              this.setState({
                isProjectSupervise: !isProjectSupervise,
                key: `project`
              });
              switchData({
                state: isProjectSupervise
              });
            }}
          >
            {isProjectSupervise ? `区域` : `项目`}
            <br />
            监管
          </Tag>
          <Menu
            mode="horizontal"
            defaultSelectedKeys={["project"]}
            selectedKeys={[key]}
          >
            {(isProjectSupervise ? tabsProject : tabs).map(item => (
              <Menu.Item key={item.key} onClick={this.switchMenu}>
                {item.title}
              </Menu.Item>
            ))}
          </Menu>
          <Input.Search
            allowClear={true}
            placeholder={`${placeholder}`}
            onSearch={v => {
              this.search(v);
            }}
            style={{ padding: 20, width: 300 }}
            enterButton
          />
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
                  ? "border-inner"
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
                  this.props.dispatch({
                    type: "project/save",
                    payload: {
                      projectInfoMoreLeftShow: true
                    }
                  });
                  this.setState({
                    projectEdit: true,
                    isProjectUpdate: false,
                    previewVisible_min_left: false,
                    projectFileList: [],
                    ParentId: 0
                  });
                  resetFields();
                  showProjectInfo({
                    isEdit: true,
                    isProjectSupervise
                  });
                  showProjectInfoMore({ isEdit: true });
                } else if (key === "spot") {
                  emitter.emit("drawGraphics", {
                    draw: true,
                    state: "add",
                    type: "spot",
                    projectId: "",
                    fromList: true
                  });
                  emitter.emit("showSiderbarDetail", {
                    show: false,
                    edit: false,
                    from: key,
                    type: "add"
                  });
                } else {
                  emitter.emit("showSiderbarDetail", {
                    show: key !== "project",
                    edit: false,
                    from: key,
                    type: "add"
                  });
                }
              }}
            />
          </Popover>
          {key === `spot` ? (
            <Select
              allowClear={true}
              value={TaskLevelAndInterBatch}
              placeholder="解译期次"
              style={{ margin: "0 20px 20px 20px", width: 260 }}
              onChange={TaskLevelAndInterBatch => {
                switchInterpret(TaskLevelAndInterBatch);
                this.setState({ TaskLevelAndInterBatch }, () => {
                  this.querySave({
                    from: key,
                    queryParams: { ...queryParams }
                  });
                });
                this.querySpot({
                  ...queryInfo,
                  SkipCount: 0,
                  MapNum: query_spot,
                  from: "query",
                  TaskLevelAndInterBatch
                });
                // emitter.emit("sidebarQuery", {
                //   TaskLevelAndInterBatch
                // });
              }}
            >
              {interpretList.map(item => (
                <Select.Option key={item}>{item}</Select.Option>
              ))}
            </Select>
          ) : null}
          <Button.Group buttonstyle="solid" style={{ padding: "0px 15px" }}>
            {sort.map((item, index) => (
              <Button
                style={{
                  userSelect: "none",
                  border: "rgb(217, 217, 217) 1px solid",
                  color: sort_key === item.key && sort_by ? "#fff" : "#000",
                  backgroundColor:
                    sort_key === item.key && sort_by ? "#1890ff" : "#fff"
                }}
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
                  if (key === "project" || key === "spot") {
                  }
                  if (key === "project") {
                    this.setState({
                      row_pro: 20
                    });
                    const obj = {
                      ...queryInfo,
                      Sorting: Sorting_new,
                      SkipCount: 0,
                      ProjectName: query_pro
                    };
                    this.querySave({
                      queryParams: obj,
                      from: "project"
                    });
                    this.queryProject(obj);
                  } else if (key === "spot") {
                    this.setState({
                      row_spot: 20
                    });
                    const obj = {
                      ...queryInfo,
                      Sorting: Sorting_new,
                      SkipCount: 0,
                      ProjectName: query_spot
                    };
                    this.querySave({
                      queryParams: obj,
                      from: "spot"
                    });
                    this.querySpot(obj);
                  } else {
                    this.setState({
                      row_point: 20
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
                    fontSize: 12
                  }}
                />
              </Button>
            ))}
          </Button.Group>
          <Button
            type={queryHighlight ? "primary" : ""}
            style={{
              display: showPoint ? "none" : "inline"
            }}
            onClick={() => {
              this.hide();
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
                type: key,
                isProjectSupervise
              });
            }}
          >
            筛选
          </Button>
          <Spins show={showSpin} />
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
      </div>
    );
  }
}
