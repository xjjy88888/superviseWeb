/* eslint-disable array-callback-return */
import React, { PureComponent } from "react";
import { createForm } from "rc-form";
import { connect } from "dva";
import jQuery from "jquery";
import { Icon, Button, Modal } from "antd";
import Spins from "../../../../components/Spins";
// 全景图
import Panorama from "./components/Panorama";
// 标注点
import Point from "./components/Point";
// 图斑
import Spot from "./components/Spot";
// 红线---防治范围
import RedLine from "./components/RedLine";
import emitter from "../../../../utils/event";

import styles from "../style/sidebar.less";

let self;

@connect(({ project, spot, point, user, annex, redLine, district }) => ({
  project,
  spot,
  point,
  user,
  annex,
  redLine,
  district
}))
@createForm()
export default class siderbarDetail extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      hover: false,
      show: false,
      from: "spot",
      ParentId: 0,
      edit: false,
      polygon: "",
      isSpotUpdate: true,
      item: { project_id: "" },
      fileList: [],
      fromList: false,
      spotHistoryId: "",
      panoramaUrlConfig: "",
      loading: false,
      showSpotReview: false,
      spotReviewId: null,
      spotReviewPhotoList: [],
      currentFromId: ""
    };
    this.map = null;
  }
  componentWillUnmount() {
    this.eventEmitter &&
      emitter.removeListener("showSiderbarDetail", this.showSiderbarDetail);
    this.eventEmitter &&
      emitter.removeListener("showProjectSpotInfo", this.showProjectSpotInfo);
  }
  componentDidMount() {
    self = this;
    this.eventEmitter = emitter.addListener(
      "showSiderbarDetail",
      this.showSiderbarDetail
    );
    this.eventEmitter = emitter.addListener(
      "showProjectSpotInfo",
      this.showProjectSpotInfo
    );
  }
  showProjectSpotInfo = data => {
    const {
      form: { resetFields }
    } = this.props;
    console.log("showProjectSpotInfo=============", data);
    emitter.emit("showSiderbar", {
      show: true
    });
    if (data.from !== "project") {
      resetFields();
      this.setState({
        show: data.show,
        edit: data.edit,
        isSpotUpdate: data.type === "edit",
        from: data.from, //spot  point
        item: data.item || {},
        type: data.type, //add  edit
        previewVisible_min: false,
        currentFromId: data.type === "add" ? "" : data.id
      });
      if (data.show && data.type !== "add" && data.id) {
        if (data.from === "spot") {
          // this.querySpotById(data.id);
        } else if (data.from === "point") {
          // this.queryPointById(data.id);
        }
      }
    }
  };
  showSiderbarDetail = data => {
    const {
      form: { resetFields }
    } = this.props;
    console.log("showSiderbarDetail---data===============", data);
    resetFields();
    this.setState({
      ParentId: 0,
      fileList: [],
      polygon: data.polygon,
      show: data.show,
      edit: data.edit,
      projectId: data.projectId,
      isSpotUpdate: data.type === "edit",
      from: data.from, //spot  point
      item: data.item || {},
      type: data.type, //add  edit
      previewVisible_min: false,
      fromList: data.fromList,
      panoramaUrlConfig: data.from === "panorama" ? data.item.urlConfig : "",
      showSpotReview: false,
      spotReviewId: null,
      currentFromId: data.type === "add" ? "" : data.id
    });
    if (data.projectId && data.projectName) {
      this.setState({
        relateProject: [{ label: data.projectName, value: data.projectId }]
      });
    }
  };

  dictList = type => {
    const {
      user: { dictList }
    } = this.props;
    if (type) {
      return dictList.filter(item => {
        return item.dictTypeName === type;
      });
    } else {
      return [];
    }
  };

  getDictKey = (value, type) => {
    const {
      user: { dictList }
    } = this.props;
    if (value) {
      const filter = dictList.filter(item => {
        return item.dictTypeName === type && item.dictTableValue === value;
      });
      return filter.map(item => item.id).join(",");
    } else {
      return "";
    }
  };

  find = (arr, v, key) => {
    let result;
    if (!arr) {
      return;
    }
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

  // 鼠标进入事件
  onMouseEnter = e => {
    this.setState({
      hover: true
    });
  };

  // 鼠标离开事件
  onMouseLeave = e => {
    this.setState({
      hover: false
    });
  };

  render() {
    const {
      mapLocation,
      project: { departSelectList },
      spot: { spotInfo, projectSelectListSpot },
      point: { projectSelectListPoint },
      redLine: { projectSelectListRedLine }
    } = this.props;

    const {
      hover,
      show,
      from,
      fromList,
      polygon,
      ParentId,
      type,
      projectId,
      edit,
      previewVisible,
      previewImage,
      previewVisible_min,
      relateProject,
      item,
      panoramaUrlConfig,
      loading,
      currentFromId
    } = this.state;

    const projectSelectListAll = [
      ...projectSelectListSpot,
      ...projectSelectListPoint
    ];

    const departSelectListAll = [
      ...departSelectList,
      ...projectSelectListRedLine
    ];
    const spotItem =
      type === "edit"
        ? spotInfo
        : {
            mapNum: "",
            provinceCityDistrict: [null, null, null],
            spotReviews: []
          };
    // const pointItem = isSpotUpdate ? pointInfo : {};

    // const redLineItem = isSpotUpdate ? redLineInfo : {};

    return (
      <div
        style={{
          left: show ? 350 : -4000,
          width: 400,
          backgroundColor: `#fff`,
          borderLeft: `solid 1px #ddd`,
          position: "absolute",
          zIndex: 1001,
          top: 0,
          paddingTop: 46,
          height: "100%"
        }}
      >
        <Spins show={loading} />
        <Icon
          type="left"
          className={`${styles["show-project-list"]} ${
            hover ? styles.spec : null
          }`}
          style={{
            display: show ? "block" : "none",
            top: hover ? "47.5%" : "48.5%"
          }}
          onMouseEnter={this.onMouseEnter.bind(this)}
          onMouseLeave={this.onMouseLeave.bind(this)}
          onClick={() => {
            if (jQuery("#ProjectList").position().left > 350) {
              jQuery("#ProjectList").animate({ left: 0 });
            }
            this.setState({ show: !show, showDetail: false, hover: false });
          }}
        />
        <p
          style={{
            float: "right",
            position: "absolute",
            top: 46,
            zIndex: 1,
            width: "100%",
            height: 40,
            backgroundColor: "white"
          }}
        >
          <Button
            icon={"close"}
            shape="circle"
            style={{
              float: "right",
              color: "#1890ff",
              top: 5,
              right: 18,
              marginLeft: 3
            }}
            onClick={() => {
              if (edit || type === "add") {
                Modal.confirm({
                  title:
                    from === "spot" || from === "redLine"
                      ? `确定放弃已绘制的图形和填写的属性并关闭当前页面吗？`
                      : "确定放弃填写并关闭当前页面吗",
                  content: "",
                  onOk() {
                    self.setState({ show: false });
                    if (jQuery("#ProjectList").position().left > 350) {
                      jQuery("#ProjectList").animate({
                        left: 0
                      });
                    }
                    emitter.emit("deleteDraw", {});
                  },
                  onCancel() {}
                });
              } else {
                self.setState({ show: false });
                if (jQuery("#ProjectList").position().left > 350) {
                  jQuery("#ProjectList").animate({
                    left: 0
                  });
                }
                emitter.emit("deleteDraw", {});
              }
            }}
          />
          {type !== "add" ? (
            <Button
              icon={type === "edit" && !edit ? "edit" : "rollback"}
              shape="circle"
              style={{
                float: "right",
                color: "#1890ff",
                top: 5,
                right: 18
              }}
              onClick={() => {
                if (type === "edit" && edit) {
                  this.setState({ edit: !edit });
                } else {
                  this.setState({
                    edit: !edit
                  });
                }
              }}
            />
          ) : null}
        </p>
        <div
          style={{
            height: "100%",
            overflow: `auto`,
            padding: "46px 12px"
          }}
        >
          <div
            style={{
              display: previewVisible_min ? "block" : "none",
              position: "fixed",
              zIndex: 2,
              width: 350
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
          <Modal
            width={"50vw"}
            visible={previewVisible}
            footer={null}
            onCancel={() => {
              this.setState({ previewVisible: false });
            }}
          >
            <img alt="example" style={{ width: "100%" }} src={previewImage} />
          </Modal>

          {/* 拆解--防治责任范围 */}
          {from === "redLine" && show ? (
            <RedLine
              type={type}
              edit={edit}
              departSelectListAll={departSelectListAll}
              ParentId={ParentId}
              spotItem={spotItem}
              projectId={projectId}
              relateProject={relateProject}
              fromList={fromList}
              mapLocation={mapLocation}
              currentFromId={currentFromId}
              polygon={polygon}
            />
          ) : null}

          {/* 拆解--图斑 */}
          {from === "spot" && show ? (
            <Spot
              // spotItem={spotItem}
              type={type}
              edit={edit}
              projectSelectListAll={projectSelectListAll}
              ParentId={ParentId}
              projectId={projectId}
              // querySpotById={this.querySpotById}
              relateProject={relateProject}
              fromList={fromList}
              mapLocation={mapLocation}
              currentFromId={currentFromId}
              polygon={polygon}
            />
          ) : null}

          {/* 拆解--标注点 */}
          {from === "point" && show ? (
            <Point
              // pointItem={pointItem}
              spotItem={spotItem}
              type={type}
              edit={edit}
              projectSelectListAll={projectSelectListAll}
              ParentId={ParentId}
              currentFromId={currentFromId}
            />
          ) : null}

          {/* 拆解--全景图 */}
          {from === "panorama" && show ? (
            <Panorama
              item={item}
              type={type}
              edit={edit}
              panoramaUrlConfig={panoramaUrlConfig}
              projectId={projectId}
            />
          ) : null}
        </div>
      </div>
    );
  }
}
