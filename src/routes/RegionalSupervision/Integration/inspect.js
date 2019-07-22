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
  notification
} from "antd";
import emitter from "../../../utils/event";
import "leaflet/dist/leaflet.css";

let self;

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
      projectId: null
    };
  }

  componentDidMount() {
    self = this;
    const {
      form: { resetFields }
    } = this.props;
    this.eventEmitter = emitter.addListener("showInspect", v => {
      resetFields();
      this.inspectForm({ region: "长沙", id: v.id });
      this.setState({
        show: v.show,
        projectId: v.projectId,
        id: v.id
      });
    });
  }

  inspectForm = params => {
    const { dispatch } = this.props;
    dispatch({
      type: "inspect/inspectForm",
      payload: { region: params.region },
      callback: (success, error, result) => {
        if (success) {
          this.inspectById(params.id);
        }
      }
    });
  };

  inspectById = id => {
    const { dispatch } = this.props;
    dispatch({ type: "inspect/inspectById", payload: { id: id } });
  };

  getInitialValue = (type, key) => {
    const {
      inspect: { inspectInfo }
    } = this.props;
    if (inspectInfo.checkInfoLists) {
      if (type === "checkbox") {
        const list = inspectInfo.checkInfoLists.filter(
          item => item.checkTypeId === key
        );
        if (list.length !== 0) {
          const initialValue = list[0].value.map(item => {
            return item.checkInfoItemId;
          });
          return initialValue;
        }
        return [];
      }
    }
  };

  render() {
    const { show, id, projectId } = this.state;
    const {
      dispatch,
      form: { getFieldDecorator, validateFields },
      inspect: { inspectForm }
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
          paddingTop: 100,
          borderLeft: "solid 1px #ddd",
          backgroundColor: `#fff`
        }}
        ref={this.saveRef}
      >
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
              validateFields((err, v) => {
                console.log(v);
                for (let i in v) {
                  if (v[i]) {
                    const type = i.split("_")[0];
                    if (type === "checkbox") {
                      data = data.concat(v[i]);
                    } else if (type === "radio") {
                      data.push(v[i]);
                    }
                  }
                }
                console.log(data);
                const checkInfoLists = data.map(item => {
                  return {
                    checkInfoItemId: item
                  };
                });
                dispatch({
                  type: "inspect/inspectCreateUpdate",
                  payload: {
                    id: id,
                    projectId: projectId,
                    checkInfoLists: checkInfoLists
                  },
                  callback: (success, error, result) => {
                    if (success) {
                      emitter.emit("projectInfoRefresh", {
                        projectId: projectId
                      });
                      this.setState({ show: false });
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
        <Form
          style={{
            height: window.innerHeight - 100,
            overflow: "auto"
          }}
        >
          {inspectForm.map((item, index) => (
            <Form.Item label={item.title} {...formItemLayout} key={index}>
              {item.type === "input"
                ? getFieldDecorator(`input_${item.key}`)(<Input allowClear />)
                : item.type === "textArea"
                ? getFieldDecorator(`textArea_${item.key}`)(
                    <Input.TextArea autosize />
                  )
                : item.type === "radio"
                ? getFieldDecorator(`radio_${item.key}`, {})(
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
