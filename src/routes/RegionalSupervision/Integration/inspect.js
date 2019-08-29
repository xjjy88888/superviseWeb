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
export default class Inspect extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      show: false,
      id: null,
      projectId: null,
      showSpin: false,
      fileList: [],
      attachmentId: 0,
      previewImage: null,
      previewVisible_min: false,
      previewVisible: false
    };
  }

  componentDidMount() {
    self = this;
    const {
      form: { resetFields }
    } = this.props;
    this.eventEmitter = emitter.addListener("showInspect", v => {
      this.setState({
        show: v.show,
        projectId: v.projectId,
        id: v.id,
        attachmentId: 0
      });
      if (v.show) {
        resetFields();
        this.setState({ showSpin: true });
        this.inspectForm({ ...v });
      }
    });
    for (let i = year; i > year - 30; i--) {
      yearSelect.push(String(i));
    }
  }

  inspectForm = params => {
    const { dispatch } = this.props;
    dispatch({
      type: "inspect/inspectForm",
      payload: { region: params.region },
      callback: (success, error, result) => {
        if (success) {
          this.inspectById(params);
        } else {
          this.setState({ showSpin: false });
        }
      }
    });
  };

  inspectById = params => {
    const { dispatch } = this.props;
    dispatch({
      type: "inspect/inspectById",
      payload: params,
      callback: (success, error, result) => {
        this.setState({ showSpin: false, fileList: [] });
        if (success && result.attachment) {
          const list = result.attachment.child.map(item => {
            return {
              uid: item.id,
              name: item.fileName,
              fileExtend: item.fileExtend,
              url: config.url.annexPreviewUrl + item.id,
              latitude: item.latitude,
              longitude: item.longitude,
              azimuth: item.azimuth,
              status: "done"
            };
          });
          this.setState({ fileList: list, attachmentId: result.attachment.id });
        }
      }
    });
  };

  getInitialValue = (type, key) => {
    const {
      inspect: { inspectInfo }
    } = this.props;
    if (inspectInfo.checkInfoLists) {
      const list = inspectInfo.checkInfoLists.filter(
        item => item.checkTypeId === key
      );
      if (list.length !== 0) {
        if (type === "checkbox") {
          const initialValue = list[0].value.map(item => {
            return item.checkInfoItemId;
          });
          return initialValue;
        } else if (type === "radio") {
          return list[0].value[0].checkInfoItemId;
        }
      }
    }
  };

  render() {
    const {
      show,
      id,
      projectId,
      showSpin,
      fileList,
      attachmentId,
      previewImage,
      previewVisible_min,
      previewVisible
    } = this.state;
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
          width: 800,
          height: `100%`,
          paddingTop: 60,
          borderLeft: "solid 1px #ddd",
          backgroundColor: `#fff`
        }}
        ref={this.saveRef}
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
                    message: `请选择核查日期`,
                    duration: 1
                  });
                  return;
                }
                if (!v.numberYear) {
                  notification["warning"]({
                    message: `请输入编号年份`,
                    duration: 1
                  });
                  return;
                }
                if (!v.number) {
                  notification["warning"]({
                    message: `请输入编号序号`,
                    duration: 1
                  });
                  return;
                }
                // if (!v.monitorCheckPeopleName) {
                //   notification["warning"]({
                //     message: `请输入监督检查人员`,
                //     duration: 1
                //   });
                //   return;
                // }
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
                    attachmentId: attachmentId,
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
                核查日期 <Text type="danger">*</Text>
              </span>
            }
            {...formItemLayout}
          >
            {getFieldDecorator("checkDate", {
              initialValue: inspectInfo.checkDate
                ? moment(inspectInfo.checkDate)
                : ""
            })(<DatePicker style={{ width: 240 }} />)}
          </Form.Item>
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
          <Form.Item
            label={
              <span>
                编号序号 <Text type="danger">*</Text>
              </span>
            }
            {...formItemLayout}
          >
            {getFieldDecorator("number", { initialValue: inspectInfo.number })(
              <Input style={{ width: 240 }} addonAfter={`号`} />
            )}
          </Form.Item>
          {inspectForm.map((item, index) => (
            <Form.Item label={item.title} {...formItemLayout} key={index}>
              {item.type === "input"
                ? getFieldDecorator(`input_${item.key}`)(<Input allowClear />)
                : item.type === "textArea"
                ? getFieldDecorator(`textArea_${item.key}`)(
                    <Input.TextArea autosize />
                  )
                : item.type === "radio"
                ? getFieldDecorator(`radio_${item.key}`, {
                    initialValue: this.getInitialValue("radio", item.key)
                  })(
                    <Radio.Group name="radiogroup">
                      {item.data.map((item, index) => (
                        <Radio value={item.value} key={index}>
                          {item.key}
                        </Radio>
                      ))}
                    </Radio.Group>
                  )
                : item.type === "checkbox"
                ? getFieldDecorator(`checkbox_${item.key}`, {
                    initialValue: this.getInitialValue("checkbox", item.key)
                  })(
                    <Checkbox.Group
                      options={item.data.map(item => {
                        return {
                          label: item.key,
                          value: item.value
                        };
                      })}
                    />
                  )
                : getFieldDecorator(item.key)(<div>无数据</div>)}
            </Form.Item>
          ))}
          <Form.Item label={`监督检查人员`} {...formItemLayout}>
            {getFieldDecorator("monitorCheckPeopleName", {
              initialValue: inspectInfo.monitorCheckPeopleName
            })(<Input style={{ width: 240 }} />)}
          </Form.Item>
          <Form.Item label="备注" {...formItemLayout}>
            {getFieldDecorator("description", {
              initialValue: inspectInfo.description
            })(<Input.TextArea autosize />)}
          </Form.Item>
          <div
            style={{ minHeight: fileList.length ? 120 : 0, margin: "0 30px" }}
          >
            <Upload
              action={config.url.annexUploadUrl}
              headers={{ Authorization: `Bearer ${accessToken()}` }}
              data={{ Id: attachmentId }}
              listType="picture-card"
              fileList={fileList}
              onSuccess={v => {
                this.setState({
                  attachmentId: v.result.id
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
                  message: `图斑附件上传失败：${response.error.message}`,
                  duration: 1
                });
              }}
              onPreview={file => {
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
                        : attachmentId
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
