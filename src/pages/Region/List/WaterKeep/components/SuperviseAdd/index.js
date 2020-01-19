import React, { PureComponent } from "react";

import {
  Form,
  Input,
  DatePicker,
  Icon,
  Select,
  Row,
  Col,
  Button,
  Divider,
  Upload,
  message
} from "antd";
import moment from "moment";

import styles from "./index.less";
const { Option } = Select;
const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 9 }
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 15 }
  }
};

class Add extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {}

  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (err) {
        console.log("err================= ", err);
        return;
      }
      console.log("form-values==============: ", values);
      const rangeCheckdata =
        values["checkdata"] && values["checkdata"].format("YYYY-MM-DD");
      const rangeBacktime =
        values["backtime"] && values["backtime"].format("YYYY-MM-DD");
      values.checkdata = rangeCheckdata;
      values.backtime = rangeBacktime;
      console.log("Received values of form: ", values);
    });
  };
  // 取消
  close = () => {
    const {
      form: { resetFields },
      addNewInspect
    } = this.props;
    resetFields();
    addNewInspect(false);
  };

  render() {
    const {
      form: { getFieldDecorator }
    } = this.props;
    const respon = {
      lg: 12,
      xl: 10,
      xxl: 8
    };
    const uploadProps = {
      name: "file",
      action: "https://www.mocky.io/v2/5cc8019d300000980a055e76",
      headers: {
        authorization: "authorization-text"
      },
      onChange(info) {
        if (info.file.status !== "uploading") {
          console.log(info.file, info.fileList);
        }
        if (info.file.status === "done") {
          message.success(`${info.file.name} file uploaded successfully`);
        } else if (info.file.status === "error") {
          message.error(`${info.file.name} file upload failed.`);
        }
      }
    };

    return (
      <div className={styles["supervise-add-form"]}>
        <Form onSubmit={this.handleSubmit} {...formItemLayout}>
          <Row gutter={8}>
            <Col {...respon}>
              <Form.Item label="检查日期">
                {getFieldDecorator("checkdata", {
                  rules: [{ required: true }]
                })(<DatePicker style={{ width: "100%" }} />)}
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={8}>
            <Col {...respon}>
              <Form.Item label="检查单位">
                {getFieldDecorator("p", {
                  rules: []
                })(<Input />)}
              </Form.Item>
            </Col>
            <Col {...respon}>
              <Form.Item label="检查级别">
                {getFieldDecorator("level", {
                  initialValue: "lucy",
                  rules: []
                })(
                  <Select>
                    <Option value="lucy">Lucy</Option>
                    <Option value="lucy2">Lucy2</Option>
                    <Option value="lucy3">Lucy3</Option>
                  </Select>
                )}
              </Form.Item>
            </Col>
            <Col {...respon}>
              <Form.Item label="检查方式">
                {getFieldDecorator("ways", {
                  rules: []
                })(<Input />)}
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={8}>
            <Col {...respon}>
              <Form.Item label="参与人员">
                {getFieldDecorator("people", {
                  rules: []
                })(<Input />)}
              </Form.Item>
            </Col>
            <Col {...respon}>
              <Form.Item label="检查事项">
                {getFieldDecorator("things", {
                  rules: []
                })(<Input />)}
              </Form.Item>
            </Col>
            <Col {...respon}>
              <Form.Item label="整改意见预计答复时间">
                {getFieldDecorator("backtime", {
                  rules: []
                })(<DatePicker style={{ width: "100%" }} />)}
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={8}>
            <Col {...respon}>
              <Form.Item label="检查日通知书">
                {getFieldDecorator("notic", {
                  rules: []
                })(<Input />)}
              </Form.Item>
            </Col>
            <Col {...respon}>
              <Form.Item label="检查意见">
                {getFieldDecorator("des", {
                  rules: []
                })(<Input />)}
              </Form.Item>
            </Col>
            <Col {...respon}>
              <Form.Item label="存在的主要问题">
                {getFieldDecorator("problm", {
                  rules: []
                })(<Input />)}
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={8}>
            <Col {...respon}>
              <Form.Item label="整改报告">
                {getFieldDecorator("report", {
                  rules: []
                })(
                  <Upload {...uploadProps}>
                    <Button type="primary">
                      <Icon type="upload" /> 上传文件
                    </Button>
                  </Upload>
                )}
              </Form.Item>
            </Col>
          </Row>

          <Row>
            <Col style={{ textAlign: "right" }}>
              <Button type="primary" htmlType="submit">
                提交
              </Button>
              <Button style={{ marginLeft: 8 }} onClick={this.close}>
                取消
              </Button>
            </Col>
          </Row>
        </Form>
        <Divider dashed />
      </div>
    );
  }
}
const WrappedAddForm = Form.create({ name: "add" })(Add);
export default WrappedAddForm;
