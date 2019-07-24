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
  Select,
  notification
} from "antd";
import emitter from "../../../utils/event";
import "leaflet/dist/leaflet.css";
import moment from "moment";
import Spins from "../../../components/Spins";

let self;
let yearSelect = [];

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
      showSpin: false
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
        id: v.id
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
      callback: () => {
        this.setState({ showSpin: false });
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
    const { show, id, projectId, showSpin } = this.state;
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
            icon="check"
            shape="circle"
            style={{
              color: "#1890ff",
              fontSize: 18
            }}
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
                if (!v.number || !v.numberYear) {
                  notification["warning"]({
                    message: `请输入编号`
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
                    numberYear: v.numberYear,
                    number: v.number,
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
          {id ? `编辑${id}` : `新增`}检查记录
        </b>
        <Form
          style={{
            height: window.innerHeight - 100,
            paddingTop: 10,
            overflow: "auto"
          }}
        >
          <Form.Item label="核查日期" {...formItemLayout}>
            {getFieldDecorator("checkDate", {
              initialValue: inspectInfo.checkDate
                ? moment(inspectInfo.checkDate)
                : ""
            })(<DatePicker style={{ width: 240 }} />)}
          </Form.Item>
          <Form.Item label="编号" {...formItemLayout}>
            {getFieldDecorator("number", { initialValue: inspectInfo.number })(
              <Input
                style={{ width: 240 }}
                addonBefore={getFieldDecorator("numberYear", {
                  initialValue: inspectInfo.numberYear
                })(
                  <Select style={{ width: 100 }}>
                    {yearSelect.map((item, index) => (
                      <Select.Option key={index} value={item}>
                        {item}年
                      </Select.Option>
                    ))}
                  </Select>
                )}
                addonAfter={`号`}
              />
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
        </Form>
      </div>
    );
  }
}
