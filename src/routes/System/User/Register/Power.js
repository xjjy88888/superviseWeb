/* eslint-disable array-callback-return */
import React, { PureComponent } from "react";
import {
  Form,
  Button,
  Table,
  Select,
  DatePicker,
  Layout,
  Checkbox,
  Row,
  Col
} from "antd";
import { connect } from "dva";
import moment from "moment";
import emitter from "../../../../utils/event";
import Spins from "../../../../components/Spins";

const { Footer, Sider, Content } = Layout;
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

@connect(({ user, role }) => ({
  user,
  role
}))
class Power extends PureComponent {
  state = {
    value: 1,
    permissions: [],
    userType: 0, //0:行政  1:社会  2:角色  3:其他
    companyType: "",
    dataSource: [],
    loading: false
  };

  componentDidMount() {
    const {
      form: { resetFields, setFieldsValue }
    } = this.props;

    this.powerList(0);
    this.powerList(1);
    this.roleList();
    this.eventEmitter = emitter.addListener("showRegister", v => {
      resetFields();
      console.log(v);
      if (v.status === "add") {
        this.setState({
          permissions: []
        });
      } else {
        this.setState({ id: v.item.id });
        if (v.type === "role") {
          this.setState({
            permissions: v.item.permissions.map(i => i.permission)
          });
        } else if (v.type === "society") {
          if (v.item.id) {
            this.userInfo(v.item.id, result => {
              setFieldsValue({
                projectId: result.projectId,
                socialDepartmentId: result.socialDepartmentId,
                companyType: result.permissions.length
                  ? result.permissions[0].permission
                  : "",
                endTime: result.permissions.length
                  ? moment(result.permissions[0].endTime)
                  : ""
              });
            });
          }
        } else if (v.type === "admin") {
          if (v.item.id) {
            this.userInfo(v.item.id, result => {
              const { dataSource } = this.state;
              this.setState({
                permissions: result.permissions.map(i => i.permission),
                dataSource: dataSource.map(item => {
                  const resu = result.permissions.filter(
                    i => i.permission === item.name
                  );
                  return {
                    ...item,
                    endTime: resu.length ? resu[0].endTime : ""
                  };
                })
              });
            });
          }
        }
      }
    });
    this.eventEmitter = emitter.addListener("setUserType", v => {
      console.log(v);
      this.setState({ userType: v.type });
    });
  }

  componentWillUnmount() {}

  userInfo = (id, fn) => {
    const { dispatch } = this.props;
    dispatch({
      type: "user/userInfo",
      payload: { id },
      callback: (success, error, result) => {
        if (success) {
          fn(result);
        }
      }
    });
  };

  roleList = () => {
    const { dispatch } = this.props;
    dispatch({
      type: "role/roleList",
      payload: { SkipCount: 0, MaxResultCount: 100 }
    });
  };

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
      },
      callback: (success, error, result) => {
        if (success && v === 0) {
          this.setState({
            dataSource: result.items.map(item => {
              return { ...item, key: item.name, endTime: "" };
            })
          });
        }
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
    const {
      form: { validateFields }
    } = this.props;
    const { permissions, userType } = this.state;

    e.preventDefault();
    validateFields((err, v) => {
      if (!err) {
        console.log("权限分配", v, permissions);
        const result =
          userType === 0
            ? permissions.map(i => {
                return {
                  permission: i,
                  endTime: v[this.getLabel(i) + "_endTime"]
                };
              })
            : userType === 1
            ? [
                {
                  permission: v.companyType,
                  endTime: v.endTime
                }
              ]
            : userType === 2
            ? permissions.map(i => {
                return {
                  permission: i,
                  endTime: v[this.getLabel(i) + "_endTime"]
                };
              })
            : [];
        console.log(result);
        this.props.submit({ ...v, permissions: result });
      }
    });
  };

  getLabel = value => {
    const { dataSource } = this.state;
    console.log(dataSource);
    const result = dataSource.filter(i => i.name === value);
    console.log(result);
    return result.length ? result[0].displayName : "";
  };

  render() {
    const {
      form: { getFieldDecorator, validateFields },
      role: { companyTypeList, roleList },
      user: { userProjectList, userCompanyList }
    } = this.props;

    const {
      permissions,
      userType,
      companyType,
      dataSource,
      loading
    } = this.state;

    let columns = [
      {
        title: "模块名",
        dataIndex: "displayName"
      }
    ];
    if (userType === 0) {
      columns[1] = {
        title: "有效期",
        dataIndex: "endTime",
        render: (item, record) => (
          <span>
            {getFieldDecorator(record.displayName + "_endTime", {
              initialValue: record.endTime ? moment(record.endTime) : ""
            })(
              <DatePicker
                onChange={v => {
                  console.log(v);
                }}
              />
            )}
          </span>
        )
      };
    }

    const rowSelection = {
      selectedRowKeys: permissions,
      onChange: permissions => {
        console.log(permissions);
        validateFields((err, v) => {
          console.log(v);
        });
        this.setState({
          permissions
        });
      }
    };

    return (
      <Layout style={{ backgroundColor: "#fff" }}>
        <Spins show={loading} />
        <Sider
          theme="light"
          style={{
            display: userType === 0 ? "block" : "none"
          }}
        >
          <Checkbox.Group
            onChange={v => {
              let data = [];
              v.map(item => {
                // console.log(item);
                data = data.concat(item);
              });
              console.log(v, data);
              this.setState({ permissions: data.map(i => i.permission) });
            }}
          >
            <Row>
              {roleList.items.map((item, index) => (
                <Col span={24} key={index}>
                  <Checkbox value={item.permissions}>
                    {item.displayName}
                  </Checkbox>
                  <br />
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
                  allowClear={true}
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
