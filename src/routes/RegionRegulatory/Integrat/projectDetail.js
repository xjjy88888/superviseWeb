import React, { PureComponent } from "react";
import { createForm } from "rc-form";
import {
  Menu,
  Icon,
  Button,
  Input,
  Radio,
  Upload,
  Modal,
  List,
  Avatar,
  TreeSelect,
  Cascader,
  Affix,
  Carousel,
  Checkbox,
  Form,
  Row,
  Col,
  Switch,
  DatePicker,
  InputNumber,
  AutoComplete,
  message
} from "antd";
import moment from "moment";
import "leaflet/dist/leaflet.css";
import emitter from "../../../utils/event";
import config from "../../../config";

const { MonthPicker, RangePicker, WeekPicker } = DatePicker;
const dateFormat = "YYYY-MM-DD";
const TreeNode = TreeSelect.TreeNode;
const CheckboxGroup = Checkbox.Group;
const formItemLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 12 }
};

@createForm()
export default class integrat extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      show: true,
      edit: true
    };
    this.map = null;
    this.saveRef = ref => {
      this.refDom = ref;
    };
  }

  componentDidMount() {
    this.eventEmitter = emitter.addListener("showProjectDetail", data => {
      this.setState({
        showDetail: data.show
      });
    });
    const { clientWidth, clientHeight } = this.refDom;
    this.setState({
      clientHeight: clientHeight
    });
  }

  getFields() {
    const count = this.state.expand ? 10 : 6;
    const { getFieldDecorator } = this.props.form;
    const children = [];
    for (let i = 0; i < 10; i++) {
      children.push(
        <Col span={4} key={i} style={{ display: i < count ? "block" : "none" }}>
          <Form.Item label={`Field ${i}`}>
            {getFieldDecorator(`field-${i}`, {
              rules: [
                {
                  required: true,
                  message: "Input something!"
                }
              ]
            })(<Input placeholder="placeholder" />)}
          </Form.Item>
        </Col>
      );
    }
    return children;
  }
  render() {
    const { show, edit } = this.state;

    return (
      <div
        style={{
          left: show ? 350 : -4000,
          width: 1000,
          backgroundColor: `#fff`,
          position: `absolute`,
          zIndex: 1000,
          height: `95vh`,
          borderLeft: `solid 1px #ddd`,
          padding: 30
          // overflow: "auto"
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
            backgroundColor: `rgba(0, 0, 0, 0.3)`,
            borderRadius: `50%`,
            padding: 10,
            cursor: `pointer`
          }}
          onClick={this.switchShow}
        />
        <div
          style={{
            display: edit ? "none" : "block"
          }}
        >
          <div style={{ float: "left", width: 400 }}>
            <p style={{ margin: 0 }}>
              <span>防治标准（一级/二级/三级）：</span>
              <span>一级</span>
            </p>
            <p style={{ margin: 0 }}>
              <span>总投资：</span>
              <span>123</span>
            </p>
            <p style={{ margin: 0 }}>
              <span>土建投资：</span>
              <span>123</span>
            </p>
            <p style={{ margin: 0 }}>
              <span>项目规模（长度或面积）：</span>
              <span>123</span>
            </p>
            <p style={{ margin: 0 }}>
              <span>设计动工时间：</span>
              <span>123</span>
            </p>
            <p style={{ margin: 0 }}>
              <span>设计完工时间：</span>
              <span>123</span>
            </p>
            <p style={{ margin: 0 }}>
              <span>实际开工时间：</span>
              <span>123</span>
            </p>
            <p style={{ margin: 0 }}>
              <span>实际完工时间：</span>
              <span>123</span>
            </p>
            <p style={{ margin: 0 }}>
              <span>设计水平年：</span>
              <span>123</span>
            </p>
            <p style={{ margin: 0 }}>
              <span>防治区类型（枚举）：</span>
              <span>123</span>
            </p>
            <p style={{ margin: 0 }}>
              <span>防治区级别（国家/省级）：</span>
              <span>123</span>
            </p>
            <p style={{ margin: 0 }}>
              <span>地貌类型（枚举）：</span>
              <span>123</span>
            </p>
            <p style={{ margin: 0 }}>
              <span>土壤类型：</span>
              <span>123</span>
            </p>
            <p style={{ margin: 0 }}>
              <span>植被类型：</span>
              <span>123</span>
            </p>
            <p style={{ margin: 0 }}>
              <span>——</span>
              <span>——</span>
            </p>
            <p style={{ margin: 0 }}>
              <span>项目建设区面积：</span>
              <span>123</span>
            </p>
            <p style={{ margin: 0 }}>
              <span>直接影响区面积：</span>
              <span>123</span>
            </p>
            <p style={{ margin: 0 }}>
              <span>扰动地表面积：</span>
              <span>123</span>
            </p>
            <p style={{ margin: 0 }}>
              <span>损坏水土保持设施面积：</span>
              <span>123</span>
            </p>
            <p style={{ margin: 0 }}>
              <span>——</span>
              <span>——</span>
            </p>
            <p style={{ margin: 0 }}>
              <span>原地貌土壤侵蚀模数（t/km2*a)：</span>
              <span>123</span>
            </p>
            <p style={{ margin: 0 }}>
              <span>土壤容许流失量（t/km2*a)：</span>
              <span>123</span>
            </p>
            <p style={{ margin: 0 }}>
              <span>水土流失预测总量（t）：</span>
              <span>123</span>
            </p>
            <p style={{ margin: 0 }}>
              <span>新增水土流失量：</span>
              <span>123</span>
            </p>
            <p style={{ margin: 0 }}>
              <span>新增水土流失主要区域：</span>
              <span>123</span>
            </p>
            <p style={{ margin: 0 }}>
              <span>——</span>
              <span>——</span>
            </p>
          </div>
          <div style={{ float: "left", width: 400 }}>
            <p style={{ margin: 0 }}>
              <span>扰动土地整治率（%）：</span>
              <span>一级</span>
            </p>
            <p style={{ margin: 0 }}>
              <span>水土流失总治理度：</span>
              <span>123</span>
            </p>
            <p style={{ margin: 0 }}>
              <span>土壤流失控制比：</span>
              <span>123</span>
            </p>
            <p style={{ margin: 0 }}>
              <span>拦渣率：</span>
              <span>123</span>
            </p>
            <p style={{ margin: 0 }}>
              <span>植被恢复系数：</span>
              <span>123</span>
            </p>
            <p style={{ margin: 0 }}>
              <span>林草覆盖率：</span>
              <span>123</span>
            </p>
            <p style={{ margin: 0 }}>
              <span>——</span>
              <span>——</span>
            </p>
            <p style={{ margin: 0 }}>
              <span>水土保持总投资（万元）：</span>
              <span>123</span>
            </p>
            <p style={{ margin: 0 }}>
              <span>独立费用：</span>
              <span>123</span>
            </p>
            <p style={{ margin: 0 }}>
              <span>水土保持监理费：</span>
              <span>123</span>
            </p>
            <p style={{ margin: 0 }}>
              <span>水土保持监测费：</span>
              <span>123</span>
            </p>
            <p style={{ margin: 0 }}>
              <span>水土保持补偿费：</span>
              <span>123</span>
            </p>
            <p style={{ margin: 0 }}>
              <span>工程措施设计投资：</span>
              <span>123</span>
            </p>
            <p style={{ margin: 0 }}>
              <span>职位措施设计投资：</span>
              <span>123</span>
            </p>
            <p style={{ margin: 0 }}>
              <span>临时措施设计投资：</span>
              <span>123</span>
            </p>
            <p style={{ margin: 0 }}>
              <span>附件：</span>
              <span>水保方案</span>
            </p>
            <p style={{ margin: 0 }}>
              <span>——</span>
              <span>——</span>
            </p>
            <p style={{ margin: 0 }}>
              <span>方案编制单位ID：</span>
              <span>123</span>
            </p>
            <p style={{ margin: 0 }}>
              <span>监测单位ID：</span>
              <span>123</span>
            </p>
            <p style={{ margin: 0 }}>
              <span>监理单位ID：</span>
              <span>123</span>
            </p>
            <p style={{ margin: 0 }}>
              <span>设计单位ID：</span>
              <span>123</span>
            </p>
            <p style={{ margin: 0 }}>
              <span>施工单位ID：</span>
              <span>123</span>
            </p>
            <p style={{ margin: 0 }}>
              <span>验收报告编制单位ID：</span>
              <span>123</span>
            </p>
            <p style={{ margin: 0 }}>
              <span>——</span>
              <span>——</span>
            </p>
            <p style={{ margin: 0 }}>
              <span>项目变更信息：</span>
              <span>123</span>
            </p>
            <p style={{ margin: 0 }}>
              <span>变更原因：</span>
              <span>123</span>
            </p>
            <p style={{ margin: 0 }}>
              <span>变更时间：</span>
              <span>123</span>
            </p>
            <p style={{ margin: 0 }}>
              <span>原项目名称：</span>
              <span>123</span>
            </p>
            <p style={{ margin: 0 }}>
              <span>附件：</span>
              <span>123</span>
            </p>
          </div>
        </div>
        <div
          style={{
            display: edit ? "block" : "none"
          }}
        >
          <Form
            className="ant-advanced-search-form"
            onSubmit={this.handleSearch}
          >
            <Row gutter={24}>
              <Col span={4}>
                <Form.Item label={`Field1`}>
                  <Input placeholder="placeholder" />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item label={`Field1`}>
                  <Input placeholder="placeholder" />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item label={`Field1`}>
                  <Input placeholder="placeholder" />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item label={`Field1`}>
                  <Input placeholder="placeholder" />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item label={`Field1`}>
                  <Input placeholder="placeholder" />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </div>
      </div>
    );
  }
}
