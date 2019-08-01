import React, { PureComponent } from "react";
import { createForm } from "rc-form";
import { connect } from "dva";
import {
  Icon,
  Button,
  Input,
  Checkbox,
  Form,
  Radio,
  Modal,
  DatePicker,
  Typography,
  notification,
  Upload
} from "antd";
import emitter from "../../../utils/event";
import "leaflet/dist/leaflet.css";
import moment from "moment";
import Spins from "../../../components/Spins";
import config from "../../../config";
import { getFile, accessToken } from "../../../utils/util";

let self;
let yearSelect = [];
const { Text } = Typography;

const year = new Date().getFullYear();

const formItemLayout = {
  labelCol: { span: 7 },
  wrapperCol: { span: 16 }
};

@createForm()
@connect(({ user, district, project, inspect }) => ({
  user,
  district,
  project,
  inspect
}))
export default class problemPoint extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      show: false,
      id: null,
      projectId: null,
      showSpin: false,
      fileList: [],
      ParentId: 0
    };
  }

  componentDidMount() {
    self = this;
    const {
      form: { resetFields }
    } = this.props;
    this.eventEmitter = emitter.addListener("showProblemPoint", v => {
      this.setState({
        show: v.show,
        id: v.id
      });
      if (v.show) {
        resetFields();
      }
    });
  }

  render() {
    const { show, id, projectId, showSpin, fileList, ParentId } = this.state;
    const {
      dispatch,
      form: { getFieldDecorator, validateFields },
      inspect: { inspectForm, inspectInfo }
    } = this.props;

    return (
      <div
        style={{
          position: `absolute`,
          top: 0,
          left: show ? 350 : -1000,
          zIndex: 1000,
          width: 400,
          height: `100%`,
          paddingTop: 60,
          borderLeft: "solid 1px #ddd",
          backgroundColor: `#fff`
        }}
        ref={this.saveRef}
      >
        <Spins show={showSpin} />
        <Icon
          type="left"
          style={{
            fontSize: 30,
            display: show ? "block" : "none",
            position: `absolute`,
            right: -50,
            top: `48%`,
            backgroundColor: `rgba(0, 0, 0, 0.5)`,
            borderRadius: `50%`,
            padding: 10,
            cursor: `pointer`
          }}
          onClick={() => {
            this.setState({ show: false });
            emitter.emit("hideQuery", {
              hide: true
            });
          }}
        />
        <span
          style={{
            position: "absolute",
            color: "#1890ff",
            right: 25,
            top: 60
          }}
        >
          <Button
            icon="download"
            shape="circle"
            style={{
              color: "#1890ff",
              fontSize: 18
            }}
            onClick={() => {
              this.setState({ showSpin: true });
              dispatch({
                type: "inspect/inspectExport",
                payload: {
                  id: id
                },
                callback: (success, error, result) => {
                  this.setState({ showSpin: false });
                  if (success) {
                    window.open(`${config.export}?fileName=${result}`, `_self`);
                  }
                }
              });
            }}
          />
          <Button
            icon="check"
            shape="circle"
            style={{
              color: "#1890ff",
              fontSize: 18
            }}
            // 提交
            onClick={() => {
              let data = [];
              validateFields((error, v) => {
                console.log(v);
                if (!v.checkDate) {
                  notification["warning"]({
                    message: `请选择核查日期`
                  });
                  return;
                }
                if (!v.numberYear) {
                  notification["warning"]({
                    message: `请输入编号年份`
                  });
                  return;
                }
                if (!v.number) {
                  notification["warning"]({
                    message: `请输入编号序号`
                  });
                  return;
                }
                if (!v.monitorCheckPeopleName) {
                  notification["warning"]({
                    message: `请输入监督检查人员`
                  });
                  return;
                }
                for (let i in v) {
                  if (v[i]) {
                    const type = i.split("_")[0];
                    if (type === "checkbox") {
                      data = data.concat(v[i]);
                    } else if (type === "radio") {
                      if (v[i].length !== 0) {
                        data.push(v[i]);
                      }
                    }
                  }
                }
                const checkInfoLists = data.map(item => {
                  return {
                    checkInfoItemId: item
                  };
                });
                this.setState({ showSpin: true });
                dispatch({
                  type: "inspect/inspectCreateUpdate",
                  payload: {
                    id: id,
                    projectId: projectId,
                    attachmentId: ParentId,
                    numberYear: v.numberYear,
                    number: v.number,
                    monitorCheckPeopleName: v.monitorCheckPeopleName,
                    description: v.description,
                    checkDate: v.checkDate
                      ? v.checkDate.format("YYYY-MM-DD")
                      : "",
                    checkInfoLists: checkInfoLists
                  },
                  callback: (success, error, result) => {
                    if (success) {
                      emitter.emit("projectInfoRefresh", {
                        projectId: projectId
                      });
                      this.setState({ show: false, showSpin: false });
                    }
                  }
                });
              });
            }}
          />
          <Button
            icon="rollback"
            shape="circle"
            style={{
              color: "#1890ff",
              fontSize: 18
            }}
            onClick={() => {
              Modal.confirm({
                title: `确定放弃填写检查表吗？`,
                content: "",
                onOk() {
                  self.setState({ show: false });
                  emitter.emit("deleteDraw", {});
                },
                onCancel() {}
              });
            }}
          />
        </span>
        <b style={{ fontSize: 16, padding: "0 50px" }}>
          {id ? `检查表详情` : `新增检查表`}
        </b>
        <Form
          style={{
            height: window.innerHeight - 100,
            paddingTop: 20,
            overflow: "auto"
          }}
        >
          <Form.Item
            label={
              <span>
                编号年份 <Text type="danger">*</Text>
              </span>
            }
            {...formItemLayout}
          >
            {getFieldDecorator("numberYear", {
              initialValue: inspectInfo.numberYear
            })(<Input style={{ width: 240 }} addonAfter={`年`} />)}
          </Form.Item>
          <div
            style={{ minHeight: fileList.length ? 120 : 0, margin: "0 30px" }}
          >
            <Upload
              action={config.url.annexUploadUrl}
              headers={{ Authorization: `Bearer ${accessToken()}` }}
              data={{ Id: ParentId }}
              listType="picture-card"
              fileList={fileList}
              onSuccess={v => {
                this.setState({
                  ParentId: v.result.id
                });
                const item = v.result.child[0];
                const obj = {
                  uid: item.id,
                  name: item.fileName,
                  url: config.url.annexPreviewUrl + item.id,
                  latitude: item.latitude,
                  longitude: item.longitude,
                  azimuth: item.azimuth,
                  fileExtend: item.fileExtend,
                  status: "done"
                };
                this.setState({
                  fileList: [...fileList, obj]
                });
              }}
              onError={(v, response) => {
                notification["error"]({
                  message: `图斑附件上传失败：${response.error.message}`
                });
              }}
              onPreview={file => {
                console.log(file.fileExtend, file);
                switch (file.fileExtend) {
                  case "pdf":
                    window.open(file.url);
                    break;
                  case "doc":
                  case "docx":
                  case "xls":
                  case "xlsx":
                  case "ppt":
                  case "pptx":
                    window.open(file.url + "&isDown=true");
                    break;
                  default:
                    this.setState({
                      previewImage: file.url || file.thumbUrl,
                      previewVisible_min: true
                    });
                    if (file.latitude || file.longitude) {
                      emitter.emit("imgLocation", {
                        Latitude: file.latitude,
                        Longitude: file.longitude,
                        direction: file.azimuth,
                        show: true
                      });
                    } else {
                      getFile(file.url);
                    }
                    break;
                }
              }}
              onChange={({ fileList }) => {
                const data = fileList.map(item => {
                  return {
                    ...item,
                    status: "done"
                  };
                });
                this.setState({ fileList: data });
              }}
              onRemove={file => {
                return new Promise((resolve, reject) => {
                  dispatch({
                    type: "annex/annexDelete",
                    payload: {
                      FileId: file.uid,
                      Id: inspectInfo.attachment
                        ? inspectInfo.attachment.id
                        : ParentId
                    },
                    callback: success => {
                      if (success) {
                        resolve();
                      } else {
                        reject();
                      }
                    }
                  });
                });
              }}
            >
              <div>
                <div className="ant-upload-text">
                  <Button type="div" icon="plus">
                    上传文件
                  </Button>
                  {/* <Button
                    icon="picture"
                    onClick={e => {
                      e.stopPropagation();
                      emitter.emit("screenshot", {
                        show: true
                      });
                    }}
                  >
                    屏幕截图1
                  </Button> */}
                </div>
              </div>
            </Upload>
          </div>
        </Form>
      </div>
    );
  }
}
