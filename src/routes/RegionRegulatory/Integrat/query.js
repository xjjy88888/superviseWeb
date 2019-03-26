import React, { PureComponent } from "react";
import { createForm } from "rc-form";
import {
  Menu,
  Icon,
  Button,
  Input,
  Radio,
  Avatar,
  Carousel,
  LocaleProvider,
  Checkbox,
  DatePicker,
  Form,
  AutoComplete
} from "antd";
import zhCN from "antd/lib/locale-provider/zh_CN";
import emitter from "../../../utils/event";
import styles from "./query.less";
import "leaflet/dist/leaflet.css";

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

@createForm()
export default class siderbarDetail extends PureComponent {
  constructor(props) {
    super(props);
    this.state = { show: false, type: "project", dataSource: [] };
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
    console.log(clientWidth, clientHeight, this.refDom);
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

  onChange = checkedValues => {
    console.log("checked = ", checkedValues);
  };
  dateOnChange = (date, dateString) => {
    console.log(date, dateString);
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

  render() {
    const { show, type, dataSource } = this.state;
    const { getFieldDecorator } = this.props.form;

    const projectTypeData = [
      { TypeName: "项目类型", DictKey: "XMLX-01", DictValue: "公路工程" },
      { TypeName: "项目类型", DictKey: "XMLX-02", DictValue: "铁路工程" },
      { TypeName: "项目类型", DictKey: "XMLX-03", DictValue: "涉水交通工程" },
      { TypeName: "项目类型", DictKey: "XMLX-04", DictValue: "机场工程" },
      { TypeName: "项目类型", DictKey: "XMLX-05", DictValue: "火电工程" },
      { TypeName: "项目类型", DictKey: "XMLX-06", DictValue: "核电工程" },
      { TypeName: "项目类型", DictKey: "XMLX-07", DictValue: "风电工程" },
      { TypeName: "项目类型", DictKey: "XMLX-08", DictValue: "输变电工程" },
      { TypeName: "项目类型", DictKey: "XMLX-09", DictValue: "其他电力工程" },
      { TypeName: "项目类型", DictKey: "XMLX-10", DictValue: "水利枢纽工程" },
      { TypeName: "项目类型", DictKey: "XMLX-11", DictValue: "灌区工程" },
      { TypeName: "项目类型", DictKey: "XMLX-12", DictValue: "引调水工程" },
      { TypeName: "项目类型", DictKey: "XMLX-13", DictValue: "堤防工程" },
      { TypeName: "项目类型", DictKey: "XMLX-14", DictValue: "蓄滞洪区工程" },
      {
        TypeName: "项目类型",
        DictKey: "XMLX-15",
        DictValue: "其他小型水利工程"
      },
      { TypeName: "项目类型", DictKey: "XMLX-16", DictValue: "水电枢纽工程" },
      { TypeName: "项目类型", DictKey: "XMLX-17", DictValue: "露天煤矿" },
      { TypeName: "项目类型", DictKey: "XMLX-18", DictValue: "露天金属矿" },
      { TypeName: "项目类型", DictKey: "XMLX-19", DictValue: "露天非金属矿" },
      { TypeName: "项目类型", DictKey: "XMLX-20", DictValue: "井采煤矿" },
      { TypeName: "项目类型", DictKey: "XMLX-21", DictValue: "井采金属矿" },
      { TypeName: "项目类型", DictKey: "XMLX-22", DictValue: "井采非金属矿" },
      { TypeName: "项目类型", DictKey: "XMLX-23", DictValue: "油气开采工程" },
      { TypeName: "项目类型", DictKey: "XMLX-24", DictValue: "油气管道工程" },
      {
        TypeName: "项目类型",
        DictKey: "XMLX-25",
        DictValue: "油气储存于加工工程"
      },
      { TypeName: "项目类型", DictKey: "XMLX-26", DictValue: "工业园区工程" },
      {
        TypeName: "项目类型",
        DictKey: "XMLX-27",
        DictValue: "城市轨道交通工程"
      },
      { TypeName: "项目类型", DictKey: "XMLX-28", DictValue: "城市管网工程" },
      { TypeName: "项目类型", DictKey: "XMLX-29", DictValue: "房地产工程" },
      { TypeName: "项目类型", DictKey: "XMLX-30", DictValue: "其他城建工程" },
      {
        TypeName: "项目类型",
        DictKey: "XMLX-31",
        DictValue: "林浆纸一体化工程"
      },
      { TypeName: "项目类型", DictKey: "XMLX-32", DictValue: "农林开发工程" },
      { TypeName: "项目类型", DictKey: "XMLX-33", DictValue: "加工制造类项目" },
      { TypeName: "项目类型", DictKey: "XMLX-34", DictValue: "社会事业类项目" },
      { TypeName: "项目类型", DictKey: "XMLX-35", DictValue: "信息产业类项目" },
      { TypeName: "项目类型", DictKey: "XMLX-36", DictValue: "其他行业项目" }
    ];

    const projectTypeDataSource = projectTypeData.map(item => {
      return item.DictValue;
    });

    const projectCompliantDataSource = [
      "合规",
      "疑似未批先建",
      "未批先建",
      "疑似超出防治责任范围",
      "超出防治责任范围",
      "疑似建设地点变更",
      "建设地点变更",
      "已批",
      "可不编报方案"
    ];

    return (
      <LocaleProvider locale={zhCN}>
        <div
          className={styles.sidebar}
          style={{ left: show ? 350 : -550 }}
          ref={this.saveRef}
        >
          <Icon
            className={styles.icon}
            type="left"
            style={{ fontSize: 30, display: show ? "block" : "none" }}
            onClick={this.switchShow}
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
              <Form.Item label="建设单位" {...formItemLayout}>
                <AutoComplete
                  dataSource={dataSource.map(this.renderOption)}
                  onSearch={this.handleSearch}
                  optionLabelProp="text"
                />
              </Form.Item>
              <Form.Item label="监管单位" {...formItemLayout}>
                <AutoComplete
                  dataSource={dataSource.map(this.renderOption)}
                  onSearch={this.handleSearch}
                  optionLabelProp="text"
                />
              </Form.Item>
              <Form.Item label="立项级别" {...formItemLayoutlong}>
                <RadioGroup name="radiogroup">
                  <Radio value={1}>部级</Radio>
                  <Radio value={2}>省级</Radio>
                  <Radio value={3}>市级</Radio>
                  <Radio value={4}>县级</Radio>
                </RadioGroup>
              </Form.Item>
              <Form.Item label="批复机构" {...formItemLayout}>
                <AutoComplete
                  dataSource={dataSource.map(this.renderOption)}
                  onSearch={this.handleSearch}
                  optionLabelProp="text"
                />
              </Form.Item>
              <Form.Item label="批复文号" {...formItemLayout}>
                <Input />
              </Form.Item>
              <Form.Item label="批复时间" {...formItemLayout}>
                <RangePicker onChange={this.dateOnChange} />
              </Form.Item>
              <Form.Item label="项目类型" {...formItemLayout}>
                <AutoComplete
                  dataSource={projectTypeDataSource}
                  filterOption={(inputValue, option) =>
                    option.props.children
                      .toUpperCase()
                      .indexOf(inputValue.toUpperCase()) !== -1
                  }
                >
                  <Input allowClear />
                </AutoComplete>
              </Form.Item>
              <Form.Item label="项目类别" {...formItemLayout}>
                <RadioGroup name="radiogroup">
                  <Radio value={1}>建设类</Radio>
                  <Radio value={2}>生产类</Radio>
                </RadioGroup>
              </Form.Item>
              <Form.Item label="项目性质" {...formItemLayoutlong}>
                <RadioGroup name="radiogroup">
                  <Radio value={1}>新建</Radio>
                  <Radio value={2}>扩建</Radio>
                  <Radio value={3}>续建</Radio>
                  <Radio value={4}>改建</Radio>
                </RadioGroup>
              </Form.Item>
              <Form.Item label="建设状态" {...formItemLayoutlong}>
                <RadioGroup name="radiogroup">
                  <Radio value={1}>未开工</Radio>
                  <Radio value={2}>停工</Radio>
                  <Radio value={3}>施工</Radio>
                  <Radio value={4}>完工</Radio>
                  <Radio value={5}>已验收</Radio>
                </RadioGroup>
              </Form.Item>
              <Form.Item label="项目合规性" {...formItemLayout}>
                <AutoComplete
                  dataSource={projectCompliantDataSource}
                  filterOption={(inputValue, option) =>
                    option.props.children
                      .toUpperCase()
                      .indexOf(inputValue.toUpperCase()) !== -1
                  }
                >
                  <Input allowClear />
                </AutoComplete>
              </Form.Item>
              {/* <Form.Item label="项目合规性" {...formItemLayout}>
                <RadioGroup name="radiogroup">
                  {projectCompliantDataSource.map((item, index) => (
                    <Radio value={index} key={index}>{item}</Radio>
                  ))}
                </RadioGroup>
              </Form.Item> */}
              <Form.Item label="矢量化类型" {...formItemLayoutlong}>
                <RadioGroup name="radiogroup">
                  <Radio value={1}>防治责任范围</Radio>
                  <Radio value={2}>示意性范围</Radio>
                </RadioGroup>
              </Form.Item>
            </Form>
          </div>
          <div style={{ display: type === "project" ? "none" : "block" }} />
        </div>
      </LocaleProvider>
    );
  }
}
