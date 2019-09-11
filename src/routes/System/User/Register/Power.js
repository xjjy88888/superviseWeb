import React, { PureComponent } from "react";
import {
  Steps,
  Form,
  Input,
  Button,
  Table,
  TreeSelect,
  Select,
  DatePicker,
  Avatar,
  Layout,
  Checkbox,
  Row,
  Col
} from "antd";
import { connect } from "dva";
import moment from "moment";
import emitter from "../../../../utils/event";
import { LocaleProvider } from "antd";
import { createForm } from "rc-form";
import zh_CN from "antd/lib/locale-provider/zh_CN";

const { Header, Footer, Sider, Content } = Layout;
const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 8 }
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 16 }
  }
};

//权限分配
@connect(({ user, role }) => ({
  user,
  role
}))
class Power extends PureComponent {
  state = {
    value: 1,
    permissions: [],
    userType: 1, //0:行政  1:社会  2:角色
    companyType: ""
  };

  componentDidMount() {
    this.powerList(0);
    this.powerList(1);
    this.eventEmitter = emitter.addListener("showRegister", v => {
      console.log(v);
      if (v.status === "add") {
        this.setState({
          permissions: []
        });
      } else {
        this.setState({ id: v.item.id });
        if (v.type === "role") {
          this.setState({
            permissions: v.item.permissions
          });
        }
      }
    });
    this.eventEmitter = emitter.addListener("setUserType", v => {
      console.log(v);
      this.setState({ userType: v.type });
    });
  }

  userProject = payload => {
    const { dispatch } = this.props;
    dispatch({
      type: "user/userProject",
      payload
    });
  };

  userCompany = payload => {
    const { dispatch } = this.props;
    dispatch({
      type: "user/userCompany",
      payload
    });
  };

  powerList = v => {
    const { dispatch } = this.props;
    dispatch({
      type: "role/powerList",
      payload: {
        userType: v
      }
    });
  };

  onChange = e => {
    console.log("radio checked", e.target.value);
    this.setState({
      value: e.target.value
    });
  };

  handleSubmit = e => {
    const { permissions } = this.state;

    e.preventDefault();

    this.props.form.validateFields((err, v) => {
      if (!err) {
        console.log("权限分配", v, permissions);
        this.props.submit({ ...v, permissions });
      }
    });
  };

  render() {
    const {
      form: { getFieldDecorator },
      role: { powerList, companyTypeList },
      user: { userProjectList, userCompanyList }
    } = this.props;

    const { permissions, userType, companyType } = this.state;

    const dataSource = powerList.map(item => {
      return { ...item, key: item.name, time: "2019-08-08" };
    });

    const columns = [
      {
        title: "模块名",
        dataIndex: "displayName"
      },
      {
        title: "有效期",
        dataIndex: "time",
        render: (text, record) => (
          <span
            onClick={() => {
              console.log(record);
            }}
          >
            <DatePicker
              defaultValue={moment(
                new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1e3),
                "YYYY-MM-DD"
              )}
            />
          </span>
        )
      },
      {
        title: "描述",
        dataIndex: "description"
      }
    ];

    const rowSelection = {
      selectedRowKeys: permissions,
      onChange: permissions => {
        console.log(permissions);
        this.setState({
          permissions
        });
      }
    };

    return (
      <Layout style={{ backgroundColor: "#fff" }}>
        <Sider
          theme="light"
          style={{
            display: userType === 0 ? "block" : "none"
          }}
        >
          <Checkbox.Group>
            <Row>
              {[
                "Web端试用角色",
                "Web端付费角色",
                "移动端试用角色",
                "移动端付费角色",
                "管理员",
                "超级管理员"
              ].map((item, index) => (
                <Col span={24} key={index}>
                  <Checkbox value={item}>{item}</Checkbox>
                  <br />
                </Col>
              ))}
            </Row>
          </Checkbox.Group>
        </Sider>
        <Content>
          <Form
            onSubmit={this.handleSubmit}
            {...formItemLayout}
            style={{ width: 600, margin: "0 auto" }}
          >
            <Form.Item
              label="单位名称"
              hasFeedback
              style={{ display: userType === 1 ? "block" : "none" }}
            >
              {getFieldDecorator("socialDepartmentId", {
                rules: [
                  {
                    required: userType === 1,
                    message: "请输入单位名称"
                  }
                ]
              })(
                <Select
                  showSearch
                  placeholder="至少输入4个关键字"
                  optionFilterProp="children"
                  onSearch={v => {
                    if (v.length < 4) {
                      return;
                    }
                    this.userCompany({ name: v });
                  }}
                >
                  {userCompanyList.map((item, index) => (
                    <Select.Option value={item.id} key={index}>
                      {item.name}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </Form.Item>
            <Form.Item
              label="单位类型"
              hasFeedback
              style={{ display: userType === 1 ? "block" : "none" }}
            >
              {getFieldDecorator("companyType", {
                rules: [
                  {
                    required: userType === 1,
                    message: "请选择单位类型"
                  }
                ]
              })(
                <Select
                  showSearch
                  allowClear
                  optionFilterProp="children"
                  onChange={companyType => {
                    this.setState({ companyType });
                  }}
                >
                  {companyTypeList.map((item, index) => (
                    <Select.Option value={item.name} key={index}>
                      {item.displayName}单位
                    </Select.Option>
                  ))}
                </Select>
              )}
            </Form.Item>
            <Form.Item
              label="所属项目"
              hasFeedback
              style={{ display: userType === 1 ? "block" : "none" }}
            >
              {getFieldDecorator("projectId", {
                rules: [
                  {
                    required: companyType === "Social.Product",
                    message: "请输入所属项目"
                  }
                ]
              })(
                <Select
                  showSearch
                  placeholder="至少输入4个关键字"
                  optionFilterProp="children"
                  onSearch={v => {
                    if (v.length < 4) {
                      return;
                    }
                    this.userProject({ name: v });
                  }}
                >
                  {userProjectList.map((item, index) => (
                    <Select.Option value={item.id} key={index}>
                      {item.name}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </Form.Item>
            <Form.Item
              label="有效期至"
              hasFeedback
              style={{ display: userType === 1 ? "block" : "none" }}
            >
              {getFieldDecorator("endTime", {
                rules: [
                  {
                    type: "object",
                    required: userType === 1,
                    message: "请选择有效期"
                  }
                ]
              })(<DatePicker />)}
            </Form.Item>
            <Footer
              style={{
                backgroundColor: "transparent",
                position: "absolute",
                bottom: 0,
                left: "50%",
                transform: "translateX(-50%)"
              }}
            >
              <Button
                type="primary"
                style={{ marginRight: 20 }}
                onClick={() => {
                  this.props.saveState({ state: 0 });
                }}
              >
                上一步
              </Button>
              <Button type="primary" htmlType="submit">
                下一步
              </Button>
            </Footer>
          </Form>

          <Table
            style={{
              display: userType !== 1 ? "block" : "none"
            }}
            rowSelection={rowSelection}
            columns={columns}
            dataSource={dataSource}
            size="small"
            selection={["SuperAdmin"]}
          />
        </Content>
      </Layout>
    );
  }
}
const Dom = Form.create({ name: "Power" })(Power);

export default class register extends PureComponent {
  render() {
    const { show, ...rest } = this.props;
    return (
      <div style={{ display: show ? "block" : "none" }}>
        <Dom {...rest}></Dom>
      </div>
    );
  }
}
