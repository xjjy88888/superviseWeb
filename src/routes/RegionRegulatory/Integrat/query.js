import React, { PureComponent } from "react";
import { createForm } from "rc-form";
import {
  Menu,
  Icon,
  Button,
  Select,
  Input,
  Radio,
  Avatar,
  Carousel,
  message,
  notification,
  Cascader,
  Slider,
  Switch,
  Checkbox,
  DatePicker,
  Form,
  AutoComplete
} from "antd";
import emitter from "../../../utils/event";
import "leaflet/dist/leaflet.css";
import config from "../../../config";

const CheckboxGroup = Checkbox.Group;
const RadioGroup = Radio.Group;
const { MonthPicker, RangePicker, WeekPicker } = DatePicker;
const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 15 }
};
const formItemLayoutlong = {
  labelCol: { span: 6 },
  wrapperCol: { span: 15 }
};

const marks = {
  0: "0",
  200: "200",
  400: "400",
  600: "600",
  800: "800",
  1000: "1000"
};

@createForm()
export default class siderbarDetail extends PureComponent {
  constructor(props) {
    super(props);
    this.state = { show: false, type: "spot", dataSource: [] };
    this.saveRef = ref => {
      this.refDom = ref;
    };
  }

  componentDidMount() {
    this.eventEmitter = emitter.addListener("showQuery", data => {
      this.setState({
        show: data.show,
        type: data.type
      });
    });
    const { clientWidth, clientHeight } = this.refDom;
  }

  getRandomInt = (max, min = 0) => {
    return Math.floor(Math.random() * (max - min + 1)) + min; // eslint-disable-line no-mixed-operators
  };

  searchResult = query => {
    return new Array(this.getRandomInt(5))
      .join(".")
      .split(".")
      .map((item, idx) => ({
        query,
        category: `${query}${idx}`,
        count: this.getRandomInt(200, 100)
      }));
  };
  switchShow = () => {
    this.setState({ show: false });
  };

  renderOption = item => {
    return (
      <AutoComplete.Option key={item.category} text={item.category}>
        {item.query} 在
        <a
          href={`https://s.taobao.com/search?q=${item.query}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {item.category}
        </a>
        区块中
        <span className="global-search-item-count">约 {item.count} 个结果</span>
      </AutoComplete.Option>
    );
  };

  handleSearch = value => {
    this.setState({
      dataSource: value ? this.searchResult(value) : []
    });
  };

  displayRender = label => {
    return label[label.length - 1];
  };

  render() {
    const { show, type, dataSource } = this.state;
    const { getFieldDecorator } = this.props.form;

    return (
      <div
        style={{
          left: show ? 350 : -550,
          borderLeft: "solid 1px #ddd",
          width: 450,
          backgroundColor: `#fff`,
          position: `absolute`,
          zIndex: 1001,
          height: `100%`
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
        <Button
          type="dashed"
          icon="check"
          shape="circle"
          style={{
            position: "absolute",
            color: "#1890ff",
            right: 20,
            top: 10
          }}
          onClick={() => {
            message.success(`筛选成功！`);
            this.setState({ show: false });
          }}
        />
        <div
          style={{
            display: type === "project" ? "block" : "none",
            padding: "30px 0",
            overflow: "auto",
            height: "100%"
          }}
        >
          <Form>
            <Form.Item label="所在地区" {...formItemLayout}>
              <Cascader
                options={config.demo_location}
                changeOnSelect
                placeholder="请选择所在地区"
              />
            </Form.Item>
            <Form.Item label="建设单位" {...formItemLayout}>
              <AutoComplete
                dataSource={dataSource.map(this.renderOption)}
                onSearch={this.handleSearch}
                optionLabelProp="text"
                placeholder="请填写建设单位"
              />
            </Form.Item>
            <Form.Item label="监管单位" {...formItemLayout}>
              <AutoComplete
                dataSource={dataSource.map(this.renderOption)}
                onSearch={this.handleSearch}
                optionLabelProp="text"
                placeholder="请填写监管单位"
              />
            </Form.Item>
            <Form.Item label="立项级别" {...formItemLayoutlong}>
              <CheckboxGroup options={config.approval_level} />
            </Form.Item>
            <Form.Item label="批复机构" {...formItemLayout}>
              <AutoComplete
                dataSource={dataSource.map(this.renderOption)}
                onSearch={this.handleSearch}
                optionLabelProp="text"
                placeholder="请填写批复机构"
              />
            </Form.Item>
            <Form.Item label="批复文号" {...formItemLayout}>
              <Input placeholder="请填写批复文号" />
            </Form.Item>
            <Form.Item label="批复时间" {...formItemLayout}>
              <RangePicker style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item label="项目类型" {...formItemLayout}>
              <Select
                mode="multiple"
                style={{ width: "100%" }}
                placeholder="请选择项目类型"
                onChange={() => {}}
              >
                {config.project_type.map(item => (
                  <Select.Option key={item}>{item}</Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item label="项目类别" {...formItemLayout}>
              <CheckboxGroup options={config.project_category} />
            </Form.Item>
            <Form.Item label="项目性质" {...formItemLayoutlong}>
              <CheckboxGroup options={config.project_nature} />
            </Form.Item>
            <Form.Item label="建设状态" {...formItemLayoutlong}>
              <CheckboxGroup options={config.construct_state} />
            </Form.Item>
            <Form.Item label="项目合规性" {...formItemLayout}>
              <Select
                mode="multiple"
                style={{ width: "100%" }}
                placeholder="请选择项目合规性"
                onChange={() => {}}
              >
                {config.compliance.map(item => (
                  <Select.Option key={item}>{item}</Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item label="矢量化类型" {...formItemLayoutlong}>
              <CheckboxGroup options={config.vectorization_type} />
            </Form.Item>
            <Form.Item label="显示归档数据" {...formItemLayoutlong}>
              <Switch checkedChildren="是" unCheckedChildren="否" />
            </Form.Item>
          </Form>
        </div>
        <div
          style={{
            display: type === "project" ? "none" : "block",
            padding: "30px 0",
            overflow: "auto",
            height: "100%"
          }}
        >
          <Form>
            <Form.Item label="所在地区" {...formItemLayout}>
              <Cascader
                placeholder="请选择所在地区"
                options={config.demo_location}
                changeOnSelect
              />
            </Form.Item>
            <Form.Item label="扰动面积" {...formItemLayoutlong}>
              <Slider marks={marks} range max={1000} defaultValue={[0, 1000]} />
            </Form.Item>
            <Form.Item label="扰动超出面积" {...formItemLayoutlong}>
              <Slider marks={marks} range max={1000} defaultValue={[0, 1000]} />
            </Form.Item>
            <Form.Item label="扰动类型" {...formItemLayoutlong}>
              <CheckboxGroup options={config.disturb_type} />
            </Form.Item>
            <Form.Item label="扰动合规性" {...formItemLayout}>
              <Select
                mode="multiple"
                style={{ width: "100%" }}
                placeholder="请选择扰动合规性"
                onChange={() => {}}
              >
                {config.compliance.map(item => (
                  <Select.Option key={item}>{item}</Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item label="扰动变化类型" {...formItemLayoutlong}>
              <CheckboxGroup options={config.disturb_change_type} />
            </Form.Item>
            <Form.Item label="建设状态" {...formItemLayoutlong}>
              <CheckboxGroup options={config.construct_state} />
            </Form.Item>
            <Form.Item label="显示归档数据" {...formItemLayoutlong}>
              <Switch checkedChildren="是" unCheckedChildren="否" />
            </Form.Item>
          </Form>
        </div>
      </div>
    );
  }
}
