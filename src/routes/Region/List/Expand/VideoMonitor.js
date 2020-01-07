/* eslint-disable array-callback-return */
import React, { PureComponent } from "react";
import { createForm } from "rc-form";
import { connect } from "dva";
import { Icon, Button, Input, Form, Modal, Typography, message } from "antd";
import emitter from "../../../../utils/event";
import "leaflet/dist/leaflet.css";
import Spins from "../../../../components/Spins";
import styles from "../style/sidebar.less";

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
      hover: false,
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
      form: { getFieldDecorator, validateFields, getFieldValue },
      videoMonitor: { videoMonitorInfo }
    } = this.props;

    const { hover, show, id, loading, projectId } = this.state;

    return (
      <div
        style={{
          position: `absolute`,
          top: 0,
          left: show ? 350 : -1000,
          zIndex: 1001,
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
          className={`${styles["show-project-list"]} ${
            hover ? styles.spec : null
          }`}
          type="left"
          style={{
            display: show ? "block" : "none",
            top: hover ? "47.5%" : "48.5%"
          }}
          onClick={() => {
            this.setState({
              hover: false,
              show: false
            });
            emitter.emit("hideQuery", {
              hide: true
            });
          }}
          onMouseEnter={this.onMouseEnter.bind(this)}
          onMouseLeave={this.onMouseLeave.bind(this)}
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
            })(<Input allowClear={true} style={{ width: 240 }} />)}
          </Form.Item>
          <Form.Item label="设备序列号" {...formItemLayout}>
            {getFieldDecorator("deviceSerial", {
              initialValue: videoMonitorInfo.deviceSerial
            })(<Input allowClear={true} style={{ width: 240 }} />)}
          </Form.Item>
          <Form.Item label="视频接口" {...formItemLayout}>
            {getFieldDecorator("url", {
              initialValue: videoMonitorInfo.url
            })(
              <Input.TextArea
                allowClear={true}
                autosize
                style={{ width: 240 }}
              />
            )}
          </Form.Item>
          <Form.Item label="坐标" {...formItemLayout}>
            {getFieldDecorator("pointX", {
              initialValue: videoMonitorInfo.pointX
            })(
              <Input
                allowClear={true}
                placeholder="经度"
                style={{ width: 103 }}
              />
            )}
            {getFieldDecorator("pointY", {
              initialValue: videoMonitorInfo.pointY
            })(
              <Input
                allowClear={true}
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
          <Form.Item label="备注" {...formItemLayout}>
            {getFieldDecorator("description", {
              initialValue: videoMonitorInfo.description
            })(
              <Input.TextArea
                allowClear={true}
                autosize
                style={{ width: 240 }}
              />
            )}
          </Form.Item>
        </Form>
      </div>
    );
  }
}
