import React, { PureComponent } from "react";
import { createForm } from "rc-form";
import { connect } from "dva";
import moment from "moment";
import {
  Menu,
  Icon,
  Button,
  Input,
  Radio,
  Cascader,
  notification,
  List,
  Avatar,
  message,
  AutoComplete,
  LocaleProvider,
  InputNumber,
  Carousel,
  DatePicker,
  Form
} from "antd";
import emitter from "../../../utils/event";
import "leaflet/dist/leaflet.css";
import zhCN from "antd/lib/locale-provider/zh_CN";
import config from "../../../config";

const { TextArea } = Input;
const { MonthPicker, RangePicker, WeekPicker } = DatePicker;
const dateFormat = "YYYY-MM-DD";
const formItemLayout = {
  labelCol: { span: 7 },
  wrapperCol: { span: 16 }
};

@connect(({ project }) => ({
  project
}))
@createForm()
export default class siderbarDetail extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      show: false,
      from: "spot",
      edit: false,
      item: { project_id: "" }
    };
    this.map = null;
  }

  componentDidMount() {
    this.eventEmitter = emitter.addListener("showSiderbarDetail", data => {
      this.setState({
        show: data.show,
        from: data.from,
        item: data.item
      });
      if (data.from === "spot" && data.show) {
        this.querySpotById(data.id);
      }
    });
    this.eventEmitter = emitter.addListener("showProjectSpotInfo", data => {
      console.log(data);
      if (data.from === "spot") {
        this.setState({
          show: data.show,
          edit: data.edit
        });
        this.querySpotById(data.id);
      }
    });
  }

  querySpotById = id => {
    const { dispatch } = this.props;
    dispatch({
      type: "project/querySpotById",
      payload: {
        id: id
      }
    });
  };

  submit = () => {
    const { edit } = this.state;
    this.setState({ edit: !edit });
    if (edit) {
      notification["success"]({
        message: "编辑成功"
      });
    } else {
    }
  };

  goDuty = () => {
    emitter.emit("showSiderbarDetail", {
      show: true,
      from: "duty"
    });
    emitter.emit("showTool", {
      show: false
    });
    emitter.emit("showQuery", {
      show: false,
      type: 1
    });
  };

  switchShow = () => {
    this.setState({ show: !this.state.show, showDetail: false });
  };

  render() {
    const {
      dispatch,
      form: {
        getFieldProps,
        getFieldDecorator,
        getFieldError,
        validateFields,
        setFieldsValue,
        setFields
      },
      project: { spotItem }
    } = this.props;
    const { show, from, edit, item } = this.state;
    return (
      <div
        style={{
          left: show ? 350 : -4000,
          width: 400,
          backgroundColor: `#fff`,
          position: `absolute`,
          zIndex: 1000,
          borderLeft: `solid 1px #ddd`
        }}
      >
        <Icon
          type="left"
          style={{
            fontSize: 30,
            display: show ? "block" : "none",
            position: `absolute`,
            right: -50,
            top: `48%`,
            backgroundColor: `rgba(0, 0, 0, 0.3)`,
            borderRadius: `50%`,
            padding: 10,
            cursor: `pointer`
          }}
          onClick={this.switchShow}
        />
        <Button
          type="dashed"
          icon={edit ? "check" : "edit"}
          shape="circle"
          style={{
            float: "right",
            position: "absolute",
            color: "#1890ff",
            right: 20,
            top: 10
          }}
          onClick={this.submit}
        />
        <div style={{ height: "100%", overflow: `auto`, padding: 30 }}>
          <div
            style={{
              display: from === "duty" ? "block" : "none"
            }}
          >
            <Form>
              <p>
                <b>防治责任范围</b>
              </p>
              <Form.Item label="矢量化类型" {...formItemLayout}>
                <Input defaultValue={`矢量化类型`} disabled={!edit} />
              </Form.Item>
              <Form.Item label="面积" {...formItemLayout}>
                <InputNumber
                  defaultValue={`68`}
                  disabled={!edit}
                  formatter={value => `${value}公顷`}
                  style={{ width: `100%` }}
                />
              </Form.Item>
              <Form.Item label="组成部分" {...formItemLayout}>
                <Input defaultValue={`矢量化类型`} disabled={!edit} />
              </Form.Item>
              <Form.Item label="上图单位" {...formItemLayout}>
                <Input defaultValue={`矢量化类型`} disabled={!edit} />
              </Form.Item>
            </Form>
            <Carousel autoplay>
              <img src="./img/spot.jpg" />
              <img src="./img/spot2.jpg" />
              <img src="./img/spot.jpg" />
              <img src="./img/spot2.jpg" />
              <img src="./img/spot.jpg" />
            </Carousel>
          </div>
          <div
            style={{
              display: from === "spot" ? "block" : "none"
            }}
          >
            <Form>
              <Form.Item label="扰动图斑" {...formItemLayout}>
                {getFieldDecorator("spot_tbid", {
                  initialValue: spotItem.spot_tbid
                })(<Input disabled={!edit} />)}
              </Form.Item>
              <Form.Item label="关联项目" {...formItemLayout}>
                {getFieldDecorator("project_id", {
                  initialValue: spotItem.project_id
                })(
                  <Input
                    disabled={!edit}
                    addonAfter={
                      <Icon
                        type="link"
                        style={{
                          color: "#1890ff"
                        }}
                        onClick={() => {
                          emitter.emit("showProjectDetail", {
                            show: true,
                            id: spotItem.project_id
                          });
                        }}
                      />
                    }
                  />
                )}
              </Form.Item>
              <Form.Item label="扰动类型" {...formItemLayout}>
                {getFieldDecorator("qtype", {
                  initialValue: spotItem.qtype
                })(
                  <AutoComplete
                    placeholder="请选择扰动类型"
                    disabled={!edit}
                    dataSource={config.disturb_type}
                    filterOption={(inputValue, option) =>
                      option.props.children
                        .toUpperCase()
                        .indexOf(inputValue.toUpperCase()) !== -1
                    }
                  />
                )}
              </Form.Item>
              <Form.Item label="扰动面积" {...formItemLayout}>
                {getFieldDecorator("qarea", {
                  initialValue: spotItem.qarea
                })(<Input disabled={!edit} addonAfter="公顷" />)}
              </Form.Item>
              <Form.Item label="扰动超出面积" {...formItemLayout}>
                {getFieldDecorator("earea", {
                  initialValue: spotItem.earea
                })(<Input disabled={!edit} addonAfter="公顷" />)}
              </Form.Item>
              <Form.Item label="扰动合规性" {...formItemLayout}>
                {getFieldDecorator("byd", {
                  initialValue: spotItem.byd
                })(
                  <AutoComplete
                    placeholder="请选择扰动合规性"
                    disabled={!edit}
                    dataSource={config.compliance}
                    filterOption={(inputValue, option) =>
                      option.props.children
                        .toUpperCase()
                        .indexOf(inputValue.toUpperCase()) !== -1
                    }
                  />
                )}
              </Form.Item>
              <Form.Item label="扰动变化类型" {...formItemLayout}>
                {getFieldDecorator("qdtype", {
                  initialValue: spotItem.qdtype
                })(
                  <AutoComplete
                    placeholder="请选择扰动变化类型"
                    disabled={!edit}
                    dataSource={config.disturb_change_type}
                    filterOption={(inputValue, option) =>
                      option.props.children
                        .toUpperCase()
                        .indexOf(inputValue.toUpperCase()) !== -1
                    }
                  />
                )}
              </Form.Item>
              <Form.Item label="建设状态" {...formItemLayout}>
                {getFieldDecorator("qdcs", {
                  initialValue: spotItem.qdcs
                })(
                  <AutoComplete
                    placeholder="请选择建设状态"
                    disabled={!edit}
                    dataSource={config.construct_state}
                    filterOption={(inputValue, option) =>
                      option.props.children
                        .toUpperCase()
                        .indexOf(inputValue.toUpperCase()) !== -1
                    }
                  />
                )}
              </Form.Item>
              <Form.Item label="复核状态" {...formItemLayout}>
                {getFieldDecorator("isreview", {
                  initialValue: spotItem.isreview
                })(<Input disabled={!edit} />)}
              </Form.Item>
              <Form.Item label="地址" {...formItemLayout}>
                <Cascader
                  disabled={!edit}
                  placeholder="----"
                  options={config.demo_location}
                  changeOnSelect
                />
              </Form.Item>
              <Form.Item label="问题" {...formItemLayout}>
                <TextArea
                  autosize={true}
                  defaultValue={`----`}
                  disabled={!edit}
                />
              </Form.Item>
              <Form.Item label="建议" {...formItemLayout}>
                <TextArea
                  autosize={true}
                  defaultValue={`----`}
                  disabled={!edit}
                />
              </Form.Item>
              <Form.Item label="备注" {...formItemLayout}>
                <TextArea
                  autosize={true}
                  defaultValue={`----`}
                  disabled={!edit}
                />
              </Form.Item>
            </Form>
            <Carousel autoplay>
              <img src="./img/spot.jpg" />
              <img src="./img/spot2.jpg" />
              <img src="./img/spot.jpg" />
            </Carousel>
            <Button type="dashed" icon="swap" style={{ marginTop: 20 }}>
              历史查看
            </Button>
            <Button
              type="dashed"
              icon="cloud-download"
              style={{ marginLeft: 20 }}
            >
              数据归档
            </Button>
            <Button type="dashed" icon="rollback" style={{ marginTop: 20 }}>
              撤销归档
            </Button>
          </div>
          <div
            style={{
              display: from === "point" ? "block" : "none"
            }}
          >
            <Form>
              <p>
                <b>标注点详情</b>
              </p>
              <Form.Item label="标注时间" {...formItemLayout}>
                <DatePicker
                  disabled={!edit}
                  defaultValue={moment("2015/01/01", dateFormat)}
                />
              </Form.Item>
              <Form.Item label="关联项目" {...formItemLayout}>
                <Input
                  defaultValue={`其他扰动`}
                  disabled={!edit}
                  addonAfter={
                    <Icon
                      type="link"
                      style={{
                        color: "#1890ff"
                      }}
                      onClick={() => {
                        emitter.emit("showProjectDetail", {
                          show: true
                        });
                      }}
                    />
                  }
                />
              </Form.Item>
              <Form.Item label="描述" {...formItemLayout}>
                <TextArea
                  autosize={true}
                  defaultValue={`新建广州至香港铁路建设线标注描述,新建广州至香港铁路建设线标注描述,新建广州至香港铁路建设线标注描述,新建广州至香港铁路建设线标注描述`}
                  disabled={!edit}
                />
              </Form.Item>
              <Form.Item label="坐标" {...formItemLayout}>
                <Input
                  defaultValue={`123.423，29.543`}
                  disabled={!edit}
                  addonAfter={
                    <Icon
                      type="compass"
                      style={{
                        cursor: "point",
                        color: edit ? "#1890ff" : ""
                      }}
                      onClick={() => {
                        if (edit) {
                          notification["success"]({
                            message: "更新坐标成功"
                          });
                        } else {
                          notification["info"]({
                            message: "请先开始编辑"
                          });
                        }
                      }}
                    />
                  }
                />
              </Form.Item>
            </Form>
            <Carousel autoplay>
              <img src="./img/spot.jpg" />
              <img src="./img/spot2.jpg" />
              <img src="./img/spot.jpg" />
            </Carousel>
          </div>
        </div>
      </div>
    );
  }
}
