import React, { PureComponent } from "react";
import { createForm } from "rc-form";
import { connect } from "dva";
import { Icon, Button, Input, Checkbox, Form, Radio, Modal } from "antd";
import emitter from "../../../utils/event";
import "leaflet/dist/leaflet.css";

let self;

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 15 }
};

const data = [
  {
    type: "input",
    title: "项目名称",
    name: "project"
  },
  {
    type: "textArea",
    title: "备注",
    name: "mark"
  },
  {
    type: "radio",
    title: "是否复核",
    name: "fuhe",
    data: ["是", "否"]
  },
  {
    type: "checkbox",
    title: "建设状态",
    name: "state",
    data: ["未开工", "已完工"]
  }
];

@createForm()
@connect(({ user, district }) => ({
  user,
  district
}))
export default class Inspect extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      show: false
    };
  }

  componentDidMount() {
    self = this;
    this.eventEmitter = emitter.addListener("showInspect", data => {
      this.setState({
        show: data.show
      });
    });
  }

  render() {
    const { show } = this.state;
    const {
      form: { getFieldDecorator }
    } = this.props;

    return (
      <div
        style={{
          position: `absolute`,
          top: 0,
          left: show ? 350 : -550,
          zIndex: 1000,
          width: 450,
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
            onClick={() => {
              this.setState({ show: false });
            }}
          />
          <Button
            icon="rollback"
            shape="circle"
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
        <Form>
          {data.map((item, index) => (
            <Form.Item label={item.title} {...formItemLayout} key={index}>
              {item.type === "input"
                ? getFieldDecorator(item.name)(<Input allowClear />)
                : item.type === "textArea"
                ? getFieldDecorator(item.name)(<Input.TextArea autosize />)
                : item.type === "radio"
                ? getFieldDecorator(item.name)(
                    <Radio.Group name="radiogroup">
                      {item.data.map((item, index) => (
                        <Radio value={item} key={index}>
                          {item}
                        </Radio>
                      ))}
                    </Radio.Group>
                  )
                : item.type === "checkbox"
                ? getFieldDecorator(item.name)(
                    <Checkbox.Group options={item.data} />
                  )
                : getFieldDecorator(item.name)(<Input allowClear />)}
            </Form.Item>
          ))}
        </Form>
      </div>
    );
  }
}
