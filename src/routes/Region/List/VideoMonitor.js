/* eslint-disable array-callback-return */
import React, { PureComponent } from "react";
import { createForm } from "rc-form";
import { connect } from "dva";
import { Icon, Button, Input, Form, Modal, Typography, message } from "antd";
import emitter from "../../../utils/event";
import "leaflet/dist/leaflet.css";
import Spins from "../../../components/Spins";

let self;
const { Text } = Typography;

const formItemLayout = {
  labelCol: { span: 7 },
  wrapperCol: { span: 16 }
};

@createForm()
@connect(({ videoMonitor }) => ({
  videoMonitor
}))
export default class VideoMonitor extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      show: false,
      id: null,
      projectId: null,
      loading: false
    };
  }

  componentDidMount() {
    self = this;
    const {
      link,
      form: { setFieldsValue }
    } = this.props;

    link(this);

    this.eventEmitter = emitter.addListener("siteLocationBack", data => {
      setFieldsValue({
        pointX: data.longitude, //经度
        pointY: data.latitude //维度
      });
    });
  }

  show = v => {
    console.log("显示视频监控: ", v);
    const {
      form: { resetFields }
    } = this.props;

    this.setState(v);

    if (v.show) {
      resetFields();
      this.videoMonitorById(v.id);
    }
  };

  videoMonitorById = payload => {
    const { dispatch } = this.props;
    this.setState({ loading: true });
    dispatch({
      type: "videoMonitor/videoMonitorById",
      payload,
      callback: (success, error, result) => {
        this.setState({ loading: false });
      }
    });
  };

  submit = payload => {
    const { dispatch } = this.props;
    const { projectId } = this.state;
    this.setState({ loading: true });
    dispatch({
      type: "videoMonitor/videoMonitorCreateUpdate",
      payload,
      callback: (success, error, result) => {
        this.setState({ loading: false });
        if (success) {
          emitter.emit("projectInfoRefresh", {
            projectId
          });
          this.setState({ show: false });
        }
      }
    });
  };

  render() {
    const {
      form: { getFieldDecorator, validateFields, getFieldValue },
      videoMonitor: { videoMonitorInfo }
    } = this.props;

    const { show, id, loading, projectId } = this.state;

    return (
      <div
        style={{
          position: `absolute`,
          top: 0,
          left: show ? 350 : -1000,
          zIndex: 1000,
          width: 500,
          height: `100%`,
          paddingTop: 60,
          borderLeft: "solid 1px #ddd",
          backgroundColor: `#fff`
        }}
        ref={this.saveRef}
      >
        <Spins show={loading} />
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
            icon="check"
            shape="circle"
            style={{
              color: "#1890ff",
              fontSize: 18
            }}
            onClick={() => {
              // submit
              validateFields((error, v) => {
                console.log(error, v);
                if (!v.name) {
                  message.warning("请填写设备名称");
                  return;
                }
                const data = {
                  ...v,
                  id,
                  projectId
                };
                this.submit(data);
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
                title: `确定放弃填写视频监控吗？`,
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
          {id ? `视频监控详情` : `新建视频监控`}
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
                设备名称 <Text type="danger">*</Text>
              </span>
            }
            {...formItemLayout}
          >
            {getFieldDecorator("name", {
              initialValue: videoMonitorInfo.name
            })(<Input allowClear style={{ width: 240 }} />)}
          </Form.Item>
          <Form.Item label="坐标" {...formItemLayout}>
            {getFieldDecorator("pointX", {
              initialValue: videoMonitorInfo.pointX
            })(<Input allowClear placeholder="经度" style={{ width: 103 }} />)}
            {getFieldDecorator("pointY", {
              initialValue: videoMonitorInfo.pointY
            })(
              <Input
                allowClear
                placeholder="纬度"
                style={{ width: 140, position: "relative", top: -2 }}
                addonAfter={
                  <Icon
                    type="environment"
                    style={{
                      color: "#1890ff"
                    }}
                    onClick={() => {
                      const x = getFieldValue("pointX");
                      const y = getFieldValue("pointY");
                      emitter.emit("siteLocation", {
                        state: "position",
                        Longitude: x,
                        Latitude: y,
                        type: "videoMonitor"
                      });
                    }}
                  />
                }
              />
            )}
          </Form.Item>
          <Form.Item label="视频接口" {...formItemLayout}>
            {getFieldDecorator("url", {
              initialValue: videoMonitorInfo.url
            })(<Input.TextArea allowClear autosize />)}
          </Form.Item>
          <Form.Item label="备注" {...formItemLayout}>
            {getFieldDecorator("description", {
              initialValue: videoMonitorInfo.description
            })(<Input.TextArea allowClear autosize />)}
          </Form.Item>
        </Form>
      </div>
    );
  }
}
