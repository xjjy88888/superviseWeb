import React, { PureComponent } from "react";
import { createForm } from "rc-form";
import { connect } from "dva";
import {
  Icon,
  Button,
  Select,
  Input,
  InputNumber,
  Cascader,
  Switch,
  Checkbox,
  DatePicker,
  Form,
  AutoComplete
} from "antd";
import emitter from "../../../utils/event";
import "leaflet/dist/leaflet.css";
import config from "../../../config";

const { RangePicker } = DatePicker;
const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 15 }
};
const formItemLayoutlong = {
  labelCol: { span: 6 },
  wrapperCol: { span: 15 }
};

@createForm()
@connect(({ user }) => ({
  user
}))
export default class siderbarDetail extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      show: false,
      type: "project",
      dataSource: [],
      showVecType: false
    };
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

  handleSearch = value => {
    this.setState({
      dataSource: value ? this.searchResult(value) : []
    });
  };
  getDictList = type => {
    const {
      user: { dicList }
    } = this.props;
    if (type) {
      const filter = dicList.filter(item => {
        return item.dictTypeName === type;
      });
      return filter.map(item => item.value);
    } else {
      return [];
    }
  };

  render() {
    const { show, type, showVecType } = this.state;
    const {
      form: { getFieldDecorator, resetFields },
      user: { districtList }
    } = this.props;

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
        <div
          style={{
            position: "absolute",
            color: "#1890ff",
            right: 66,
            top: 42,
            width: "78%",
            height: 62,
            zIndex: 1
          }}
        >
          <Button
            icon="undo"
            style={{ margin: "20px 60px 0px 75px" }}
            onClick={() => {
              resetFields();
              emitter.emit("queryInfo", {
                from: type,
                info: {}
              });
            }}
          >
            重置
          </Button>
          <Button
            icon="search"
            onClick={() => {
              this.props.form.validateFields((err, v) => {
                if (!err) {
                  console.log("筛选信息", v);
                  const d = v.DistrictCodes;
                  emitter.emit("queryInfo", {
                    from: type,
                    info: { ...v, DistrictCodes: d[d.length - 1] }
                  });
                }
              });
            }}
          >
            查询
          </Button>
        </div>

        <Button
          icon="close"
          shape="circle"
          style={{
            position: "absolute",
            color: "#1890ff",
            right: 25,
            top: 60
          }}
          onClick={() => {
            this.setState({ show: false });
            emitter.emit("hideQuery", {
              hide: true
            });
          }}
        />
        <div
          style={{
            display: type === "project" ? "block" : "none",
            padding: "60px 0 10px 0",
            overflow: "auto",
            height: "100%"
          }}
        >
          <Form>
            <Form.Item label="所在地区" {...formItemLayout}>
              {getFieldDecorator("DistrictCodes", { initialValue: "" })(
                <Cascader
                  options={districtList}
                  changeOnSelect
                  placeholder="请选择所在地区"
                />
              )}
            </Form.Item>
            <Form.Item label="建设单位" {...formItemLayout}>
              {getFieldDecorator("ProductDepartment", { initialValue: "" })(
                <Input placeholder="请填写建设单位" allowClear />
              )}
            </Form.Item>
            <Form.Item label="监管单位" {...formItemLayout}>
              {getFieldDecorator("SupDepartment", { initialValue: "" })(
                <Input placeholder="请填写监管单位" allowClear />
              )}
            </Form.Item>
            <Form.Item label="立项级别" {...formItemLayoutlong}>
              {getFieldDecorator("ProjectLevel", { initialValue: [] })(
                <Checkbox.Group options={this.getDictList("立项级别")} />
              )}
            </Form.Item>
            <Form.Item label="批复机构" {...formItemLayout}>
              {getFieldDecorator("ReplyDepartment", { initialValue: "" })(
                <Input placeholder="请填写批复机构" allowClear />
              )}
            </Form.Item>
            <Form.Item label="批复文号" {...formItemLayout}>
              {getFieldDecorator("ReplyNum", { initialValue: "" })(
                <Input placeholder="请填写批复文号" allowClear />
              )}
            </Form.Item>
            <Form.Item label="批复时间" {...formItemLayout}>
              {getFieldDecorator("ReplyTime", { initialValue: [] })(
                <RangePicker style={{ width: "100%" }} />
              )}
            </Form.Item>
            <Form.Item label="项目类型" {...formItemLayout}>
              {getFieldDecorator("ProjectType", { initialValue: [] })(
                <Select
                  mode="multiple"
                  style={{ width: "100%" }}
                  placeholder="请选择项目类型"
                >
                  {this.getDictList("项目类型").map(item => (
                    <Select.Option key={item}>{item}</Select.Option>
                  ))}
                </Select>
              )}
            </Form.Item>
            <Form.Item label="项目类别" {...formItemLayout}>
              {getFieldDecorator("ProjectCate", { initialValue: [] })(
                <Checkbox.Group options={this.getDictList("项目类别")} />
              )}
            </Form.Item>
            <Form.Item label="项目性质" {...formItemLayoutlong}>
              {getFieldDecorator("ProjectNat", { initialValue: [] })(
                <Checkbox.Group options={this.getDictList("项目性质")} />
              )}
            </Form.Item>
            <Form.Item label="建设状态" {...formItemLayoutlong}>
              {getFieldDecorator("ProjectStatus", { initialValue: [] })(
                <Checkbox.Group options={this.getDictList("建设状态")} />
              )}
            </Form.Item>
            <Form.Item label="项目合规性" {...formItemLayout}>
              {getFieldDecorator("Compliance", { initialValue: [] })(
                <Select
                  mode="multiple"
                  style={{ width: "100%" }}
                  placeholder="请选择项目合规性"
                >
                  {this.getDictList("扰动合规性").map(item => (
                    <Select.Option key={item}>{item}</Select.Option>
                  ))}
                </Select>
              )}
            </Form.Item>
            <Form.Item label="有无红线" {...formItemLayoutlong}>
              {getFieldDecorator("HasScopes", {})(
                <Checkbox.Group
                  options={["有红线", "无红线"]}
                  onChange={v => {
                    this.setState({ showVecType: v.indexOf("有红线") > -1 });
                  }}
                />
              )}
            </Form.Item>
            <Form.Item
              label="矢量化类型"
              {...formItemLayoutlong}
              style={{ display: showVecType ? "block" : "none" }}
            >
              {getFieldDecorator("VecType", { initialValue: [] })(
                <Checkbox.Group options={this.getDictList("矢量化类型")} />
              )}
            </Form.Item>
            <Form.Item label="有无扰动图斑" {...formItemLayoutlong}>
              {getFieldDecorator("HasSpot", {})(
                <Checkbox.Group options={["有图斑", "无图斑"]} />
              )}
            </Form.Item>
            <Form.Item label="显示数据" {...formItemLayoutlong}>
              {getFieldDecorator("ShowArchive", {
                valuePropName: "checked",
                initialValue: false
              })(
                <Switch
                  checkedChildren="归档数据"
                  unCheckedChildren="现状数据"
                />
              )}
            </Form.Item>
          </Form>
        </div>
        <div
          style={{
            display: type === "project" ? "none" : "block",
            padding: "60px 0 10px 0",
            overflow: "auto",
            height: "100%"
          }}
        >
          <Form>
            <Form.Item label="所在地区" {...formItemLayout}>
              {getFieldDecorator("DistrictCodes", { initialValue: "" })(
                <Cascader
                  options={districtList}
                  changeOnSelect
                  placeholder="请选择所在地区"
                />
              )}
            </Form.Item>
            <Form.Item label="扰动面积" {...formItemLayoutlong}>
              {getFieldDecorator("InterferenceAreaMin", {})(
                <InputNumber min={0} />
              )}
              <Input
                style={{
                  width: 30,
                  borderLeft: 0,
                  pointerEvents: "none",
                  backgroundColor: "#fff"
                }}
                placeholder="-"
                disabled
              />
              {getFieldDecorator("InterferenceAreaMax", {})(
                <InputNumber min={0} />
              )}
            </Form.Item>
            <Form.Item label="扰动超出面积" {...formItemLayoutlong}>
              {getFieldDecorator("OverAreaOfResMin", {})(
                <InputNumber min={0} />
              )}
              <Input
                style={{
                  width: 30,
                  borderLeft: 0,
                  pointerEvents: "none",
                  backgroundColor: "#fff"
                }}
                placeholder="-"
                disabled
              />
              {getFieldDecorator("OverAreaOfResMax", {})(
                <InputNumber min={0} />
              )}
            </Form.Item>
            <Form.Item label="扰动类型" {...formItemLayoutlong}>
              {getFieldDecorator("InterferenceType", { initialValue: [] })(
                <Checkbox.Group options={this.getDictList("扰动类型")} />
              )}
            </Form.Item>
            <Form.Item label="扰动合规性" {...formItemLayout}>
              {getFieldDecorator("InterferenceCompliance", {
                initialValue: []
              })(
                <Select
                  mode="multiple"
                  style={{ width: "100%" }}
                  placeholder="请选择扰动合规性"
                >
                  {this.getDictList("扰动合规性").map(item => (
                    <Select.Option key={item}>{item}</Select.Option>
                  ))}
                </Select>
              )}
            </Form.Item>
            <Form.Item label="扰动变化类型" {...formItemLayoutlong}>
              {getFieldDecorator("InterferenceVaryType", { initialValue: [] })(
                <Checkbox.Group options={this.getDictList("扰动变化类型")} />
              )}
            </Form.Item>
            <Form.Item label="建设状态" {...formItemLayoutlong}>
              {getFieldDecorator("BuildStatus", { initialValue: [] })(
                <Checkbox.Group options={this.getDictList("建设状态")} />
              )}
            </Form.Item>
            <Form.Item label="归档数据" {...formItemLayoutlong}>
              {getFieldDecorator("ShowArchive", {
                valuePropName: "checked",
                initialValue: false
              })(
                <Switch
                  checkedChildren="归档数据"
                  unCheckedChildren="现状数据"
                />
              )}
            </Form.Item>
          </Form>
        </div>
      </div>
    );
  }
}
