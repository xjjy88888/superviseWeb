import React, { PureComponent } from "react";
import { createForm } from "rc-form";
import moment from "moment";
import {
  Menu,
  Icon,
  Button,
  Input,
  Radio,
  Cascader,
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

@createForm()
export default class siderbarDetail extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      show: false,
      from: "spot",
      edit: false
    };
    this.map = null;
  }

  componentDidMount() {
    this.eventEmitter = emitter.addListener("showSiderbarDetail", data => {
      this.setState({
        show: data.show,
        from: data.from
      });
    });
  }

  // componentWillUnmount() {
  //   emitter.removeListener(this.eventEmitter);
  // }

  submit = () => {
    const { edit } = this.state;
    this.setState({ edit: !edit });
    if (edit) {
      message.success("编辑成功");
    } else {
      message.info("开始编辑");
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
    const { show, from, edit } = this.state;

    return (
      <div
        style={{
          left: show ? 350 : -4000,
          width: 400,
          backgroundColor: `#fff`,
          position: `absolute`,
          zIndex: 1000,
          height: `95vh`,
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
              <p>
                <b>扰动图斑详情</b>
              </p>
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
              <Form.Item label="扰动类型" {...formItemLayout}>
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
              </Form.Item>
              <Form.Item label="扰动面积" {...formItemLayout}>
                <InputNumber
                  defaultValue={`68`}
                  disabled={!edit}
                  formatter={value => `${value}公顷`}
                  style={{ width: `100%` }}
                />
              </Form.Item>
              <Form.Item label="扰动超出面积" {...formItemLayout}>
                <InputNumber
                  defaultValue={`68`}
                  disabled={!edit}
                  formatter={value => `${value}公顷`}
                  style={{ width: `100%` }}
                />
              </Form.Item>
              <Form.Item label="扰动合规性" {...formItemLayout}>
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
              </Form.Item>
              <Form.Item label="扰动变化类型" {...formItemLayout}>
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
              </Form.Item>
              <Form.Item label="建设状态" {...formItemLayout}>
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
              </Form.Item>
              <Form.Item label="复核状态" {...formItemLayout}>
                <Input defaultValue={`复核状态`} disabled={!edit} />
              </Form.Item>
              <Form.Item label="地址" {...formItemLayout}>
                <Cascader
                  disabled={!edit}
                  placeholder="请选择所在地区"
                  options={config.demo_location}
                  changeOnSelect
                />
              </Form.Item>
              <Form.Item label="问题" {...formItemLayout}>
                <TextArea
                  autosize={true}
                  defaultValue={`问题问题问题问题问题问题问题问题问题问题问题问题问题`}
                  disabled={!edit}
                />
              </Form.Item>
              <Form.Item label="建议" {...formItemLayout}>
                <TextArea
                  autosize={true}
                  defaultValue={`建议建议建议建议建议建议建议建议建议建议建议建议建议建议建议建议建议建议建议建议建议建议建议建议建议建议建议建议建议`}
                  disabled={!edit}
                />
              </Form.Item>
              <Form.Item label="备注" {...formItemLayout}>
                <TextArea
                  autosize={true}
                  defaultValue={`备注备注备注备注备注备注备注备注备注备注备注备注备注备注备注备注备注备注备注备注备注备注备注备注备注备注备注`}
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
                          message.success("更新坐标成功");
                        } else {
                          message.info("请先开始编辑");
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
