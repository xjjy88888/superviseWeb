import React, { PureComponent } from "react";
import { connect } from "dva";
import { createForm } from "rc-form";
import {
  Icon,
  Button,
  Input,
  Modal,
  notification,
  Upload,
  Divider,
  Form,
  Row,
  Select,
  Col,
  DatePicker,
  AutoComplete
} from "antd";
import "leaflet/dist/leaflet.css";
import emitter from "../../../utils/event";
import styles from "./index.less";
import moment from "moment";
import { dateInitFormat } from "../../../utils/util";

let self;
let yearDataSource = [];

@connect(({ project, user }) => ({
  project,
  user
}))
@createForm()
export default class integrat extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      show: false,
      edit: false,
      departList: []
    };
    this.map = null;
    this.saveRef = ref => {
      this.refDom = ref;
    };
  }

  componentDidMount() {
    const {
      form: { resetFields }
    } = this.props;
    self = this;
    const { dispatch } = this.props;
    const maxYear = new Date().getFullYear();
    for (let i = maxYear; i >= 1970; i--) {
      yearDataSource.push(`${i}年`);
    }
    this.eventEmitter = emitter.addListener("showProjectDetail", data => {
      resetFields();
      this.setState({
        show: data.show,
        edit: data.edit
      });
    });
    this.eventEmitter = emitter.addListener("projectCreateUpdate", data => {
      //submit
      this.props.form.validateFields((err, v) => {
        console.log(v);
        const values = {
          ...v,
          designStartTime: v.designStartTime ? v.designStartTime._i : null,
          designCompTime: v.designCompTime ? v.designCompTime._i : null,
          actStartTime: v.actStartTime ? v.actStartTime._i : null,
          actCompTime: v.actCompTime ? v.actCompTime._i : null
        };
        dispatch({
          type: "project/projectCreateUpdate",
          payload: { ...data, ...values },
          callback: (success, response) => {
            if (success) {
              emitter.emit("projectCreateUpdateBack", {});
              notification["success"]({
                message: `${data.id ? "编辑" : "新建"}项目成功`
              });
            }
          }
        });
      });
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
            })(<Input />)}
            )}
          </Form.Item>
        </Col>
      );
    }
    return children;
  }

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

  getDepartName = obj => {
    if (obj) {
      return obj.name;
    } else {
      return "";
    }
  };

  getDepartList = key => {
    const {
      dispatch,
      form: { validateFields, setFieldsValue }
    } = this.props;
    const { departList } = this.state;
    validateFields((err, v) => {
      if (v[key]) {
        dispatch({
          type: "user/departVaild",
          payload: {
            name: v[key]
          },
          callback: (isVaild, data) => {
            if (isVaild) {
              this.setState({ departList: [...departList, data] });
            } else {
              Modal.confirm({
                title: "查不到该单位，是否去新建单位",
                content: "",
                onOk() {
                  setFieldsValue({ [key]: "" });
                  emitter.emit("showCreateDepart", {
                    show: true
                  });
                },
                onCancel() {
                  console.log("Cancel");
                }
              });
            }
          }
        });
      }
    });
  };

  queryDepartList = v => {
    const { dispatch } = this.props;
    dispatch({
      type: "user/departList",
      payload: {
        name: v
      }
    });
  };

  render() {
    const { show, edit } = this.state;

    const {
      form: { getFieldDecorator },
      project: { projectInfo },
      user: { districtList, departSelectList, departUpdateId }
    } = this.props;

    const projectItem = projectInfo;

    return (
      <div
        style={{
          left: show ? 350 : -4000,
          width: 800,
          backgroundColor: `#fff`,
          position: `absolute`,
          zIndex: 1000,
          height: `100%`,
          borderLeft: `solid 1px #ddd`
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
            emitter.emit("hideProjectDetail", {
              hide: true
            });
            this.setState({
              show: false
            });
          }}
        />
        <div
          style={{
            padding: 30,
            display: edit ? "none" : "block",
            overflow: "auto",
            height: "100%"
          }}
        >
          <div style={{ float: "left", width: 350, padding: "0 30px" }}>
            <p style={{ margin: 10 }}>
              <span>防治标准：</span>
              {/* （一级/二级/三级） */}
              <span>{projectItem.expand.prevenStd}</span>
            </p>
            <p style={{ margin: 10 }}>
              <span>总投资：</span>
              <span>{projectItem.expand.totalInvest}万元</span>
            </p>
            <p style={{ margin: 10 }}>
              <span>土建投资：</span>
              <span>{projectItem.expand.civilEngInvest}万元</span>
            </p>
            <p style={{ margin: 10 }}>
              <span>项目规模：</span>
              <span>{projectItem.expand.projectSize}</span>
            </p>
            <p style={{ margin: 10 }}>
              <span>设计动工时间：</span>
              <span>{projectItem.expand.designStartTime}</span>
            </p>
            <p style={{ margin: 10 }}>
              <span>设计完工时间：</span>
              <span>{projectItem.expand.designCompTime}</span>
            </p>
            <p style={{ margin: 10 }}>
              <span>实际开工时间：</span>
              <span>{projectItem.expand.actStartTime}</span>
            </p>
            <p style={{ margin: 10 }}>
              <span>实际完工时间：</span>
              <span>{projectItem.expand.actCompTime}</span>
            </p>
            <p style={{ margin: 10 }}>
              <span>设计水平年：</span>
              <span>{projectItem.expand.designLevelYear}</span>
            </p>
            <p style={{ margin: 10 }}>
              <span>防治区类型：</span>
              {/* （01：预防保护区、02：重点治理区） */}
              <span>{projectItem.expand.prevenZoneType}</span>
            </p>
            <p style={{ margin: 10 }}>
              <span>防治区级别：</span>
              {/* （国家/省级） */}
              <span>{projectItem.expand.prevenZoneLevel}</span>
            </p>
            <p style={{ margin: 10 }}>
              <span>地貌类型：</span>
              {/* （01：山地、02：丘陵、03：平原） */}
              <span>{projectItem.expand.landType}</span>
            </p>
            <p style={{ margin: 10 }}>
              <span>土壤类型：</span>
              <span>{projectItem.expand.soilType}</span>
            </p>
            <p style={{ margin: 10 }}>
              <span>植被类型：</span>
              <span>{projectItem.expand.vegType}</span>
            </p>
            <p style={{ margin: 10 }}>
              <span>——</span>
              <span>——</span>
            </p>
            <p style={{ margin: 10 }}>
              <span>项目建设区面积：</span>
              <span>{projectItem.expand.consArea}m2</span>
            </p>
            <p style={{ margin: 10 }}>
              <span>直接影响区面积：</span>
              <span>{projectItem.expand.affeArea}m2</span>
            </p>
            <p style={{ margin: 10 }}>
              <span>扰动地表面积：</span>
              <span>{projectItem.expand.distSurfaceArea}m2</span>
            </p>
            <p style={{ margin: 10 }}>
              <span>损坏水土保持设施面积：</span>
              <span>{projectItem.expand.dmgArea}m2</span>
            </p>
            <p style={{ margin: 10 }}>
              <span>——</span>
              <span>——</span>
            </p>
            <p style={{ margin: 10 }}>
              <span>原地貌土壤侵蚀模数：</span>
              <span>{projectItem.expand.landErsn}t/km2*a</span>
            </p>
            <p style={{ margin: 10 }}>
              <span>土壤容许流失量：</span>
              <span>{projectItem.expand.soilLoss}t/km2*a</span>
            </p>
            <p style={{ margin: 10 }}>
              <span>水土流失预测总量：</span>
              <span>{projectItem.expand.ersnAmt}t</span>
            </p>
            <p style={{ margin: 10 }}>
              <span>新增水土流失量：</span>
              <span>{projectItem.expand.newErsnAmt}t</span>
            </p>
            <p style={{ margin: 10 }}>
              <span>新增水土流失主要区域：</span>
              <span>{projectItem.expand.newArea}</span>
            </p>
            <p style={{ margin: 10 }}>
              <span>——</span>
              <span>——</span>
            </p>
          </div>
          <div style={{ float: "left", width: 350, padding: "0 60px" }}>
            <p style={{ margin: 10 }}>
              <span>扰动土地整治率：</span>
              <span>{projectItem.expand.fixRate}%</span>
            </p>
            <p style={{ margin: 10 }}>
              <span>水土流失总治理度：</span>
              <span>{projectItem.expand.govern}%</span>
            </p>
            <p style={{ margin: 10 }}>
              <span>土壤流失控制比：</span>
              <span>{projectItem.expand.ctlRatio}%</span>
            </p>
            <p style={{ margin: 10 }}>
              <span>拦渣率：</span>
              <span>{projectItem.expand.blkRate}%</span>
            </p>
            <p style={{ margin: 10 }}>
              <span>植被恢复系数：</span>
              <span>{projectItem.expand.vegRec}%</span>
            </p>
            <p style={{ margin: 10 }}>
              <span>林草覆盖率：</span>
              <span>{projectItem.expand.forestGrassCover}%</span>
            </p>
            <p style={{ margin: 10 }}>
              <span>——</span>
              <span>——</span>
            </p>
            <p style={{ margin: 10 }}>
              <span>水土保持总投资：</span>
              <span>{projectItem.expand.waterSoilTotal}万元</span>
            </p>
            <p style={{ margin: 10 }}>
              <span>独立费用：</span>
              <span>{projectItem.expand.idptExp}万元</span>
            </p>
            <p style={{ margin: 10 }}>
              <span>水土保持监理费：</span>
              <span>{projectItem.expand.waterSoilSupervise}万元</span>
            </p>
            <p style={{ margin: 10 }}>
              <span>水土保持监测费：</span>
              <span>{projectItem.expand.waterSoilDetect}万元</span>
            </p>
            <p style={{ margin: 10 }}>
              <span>水土保持补偿费：</span>
              <span>{projectItem.expand.waterSoilCompensate}万元</span>
            </p>
            <p style={{ margin: 10 }}>
              <span>工程措施设计投资：</span>
              <span>{projectItem.expand.EngInvest}万元</span>
            </p>
            <p style={{ margin: 10 }}>
              <span>植物措施设计投资：</span>
              <span>{projectItem.expand.vegInvest}万元</span>
            </p>
            <p style={{ margin: 10 }}>
              <span>临时措施设计投资：</span>
              <span>{projectItem.expand.temInvest}万元</span>
            </p>
            <p style={{ margin: 10 }}>
              <span>附件(水保方案)：</span>
              <span>{projectItem.expand.AttachmentId}</span>
            </p>
            <p style={{ margin: 10 }}>
              <span>——</span>
              <span>——</span>
            </p>
            <p style={{ margin: 10 }}>
              <span>方案编制单位：</span>
              <span>{this.getDepartName(projectItem.projectDepartment)}</span>
            </p>
            <p style={{ margin: 10 }}>
              <span>监测单位：</span>
              <span>{this.getDepartName(projectItem.monitorDepartment)}</span>
            </p>
            <p style={{ margin: 10 }}>
              <span>监理单位：</span>
              <span>
                {this.getDepartName(projectItem.expand.SupervisionDepartment)}
              </span>
            </p>
            <p style={{ margin: 10 }}>
              <span>设计单位：</span>
              <span>{this.getDepartName(projectItem.designDepartment)}</span>
            </p>
            <p style={{ margin: 10 }}>
              <span>施工单位：</span>
              <span>
                {this.getDepartName(projectItem.constructionDepartment)}
              </span>
            </p>
            <p style={{ margin: 10 }}>
              <span>验收报告编制单位：</span>
              <span>
                {this.getDepartName(projectItem.expand.ReportDepartment)}
              </span>
            </p>
            <p style={{ margin: 10 }}>
              <span>——</span>
              <span>——</span>
            </p>
            <p style={{ margin: 10 }}>
              <span>项目变更信息：</span>
              <span>空</span>
            </p>
            <p style={{ margin: 10 }}>
              <span>变更原因：</span>
              <span>空</span>
            </p>
            <p style={{ margin: 10 }}>
              <span>变更时间：</span>
              <span>空</span>
            </p>
            <p style={{ margin: 10 }}>
              <span>原项目名称：</span>
              <span>空</span>
            </p>
            <p style={{ margin: 10 }}>
              <span>附件(变更依据)：</span>
              <span>空</span>
            </p>
          </div>
        </div>
        <div
          style={{
            display: edit ? "block" : "none",
            height: `100%`,
            padding: 30,
            overflow: "auto"
          }}
        >
          <Form
            layout="inline"
            className="ant-advanced-search-form"
            onSubmit={this.handleSearch}
          >
            <Row gutter={24}>
              <Col span={12}>
                <Form.Item label="防治标准">
                  {getFieldDecorator("prevenStdId", {
                    initialValue: projectItem.expand.prevenStd
                  })(
                    <AutoComplete
                      placeholder="请选择防治标准"
                      dataSource={this.getDictList("防治标准")}
                      filterOption={(inputValue, option) =>
                        option.props.children
                          .toUpperCase()
                          .indexOf(inputValue.toUpperCase()) !== -1
                      }
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="总投资">
                  {getFieldDecorator("totalInvest", {
                    initialValue: projectItem.expand.totalInvest
                  })(<Input addonAfter="万元" style={{ width: 150 }} />)}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="土建投资">
                  {getFieldDecorator("civilEngInvest", {
                    initialValue: projectItem.expand.civilEngInvest
                  })(<Input addonAfter="万元" style={{ width: 150 }} />)}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="项目规模">
                  {getFieldDecorator("projectSize", {
                    initialValue: projectItem.expand.projectSize
                  })(<Input addonAfter="m或m2" style={{ width: 150 }} />)}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="设计动工时间">
                  {getFieldDecorator("designStartTime", {
                    initialValue: dateInitFormat(
                      projectItem.expand.designStartTime
                    )
                  })(<DatePicker placeholder="" style={{ width: 130 }} />)}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="设计完工时间">
                  {getFieldDecorator("designCompTime", {
                    initialValue: dateInitFormat(
                      projectItem.expand.designCompTime
                    )
                  })(<DatePicker placeholder="" style={{ width: 130 }} />)}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="实际开工时间">
                  {getFieldDecorator("actStartTime", {
                    initialValue: dateInitFormat(
                      projectItem.expand.actStartTime
                    )
                  })(<DatePicker placeholder="" style={{ width: 130 }} />)}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="实际完工时间">
                  {getFieldDecorator("actCompTime", {
                    initialValue: dateInitFormat(projectItem.expand.actCompTime)
                  })(<DatePicker placeholder="" style={{ width: 130 }} />)}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="设计水平年">
                  {getFieldDecorator("designLevelYear", {
                    initialValue: projectItem.expand.designLevelYear
                  })(
                    <AutoComplete
                      allowClear
                      dataSource={yearDataSource}
                      filterOption={(inputValue, option) =>
                        option.props.children.indexOf(inputValue) !== -1
                      }
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="防治区类型">
                  {getFieldDecorator("prevenZoneTypeId", {
                    initialValue: projectItem.expand.prevenZoneType
                  })(
                    <AutoComplete
                      placeholder="请选择防治区类型"
                      dataSource={this.getDictList("防治区类型")}
                      filterOption={(inputValue, option) =>
                        option.props.children
                          .toUpperCase()
                          .indexOf(inputValue.toUpperCase()) !== -1
                      }
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="防治区级别">
                  {getFieldDecorator("prevenZoneLevelId", {
                    initialValue: projectItem.expand.prevenZoneLevel
                  })(
                    <AutoComplete
                      placeholder="请选择防治区级别"
                      dataSource={this.getDictList("防治区级别")}
                      filterOption={(inputValue, option) =>
                        option.props.children
                          .toUpperCase()
                          .indexOf(inputValue.toUpperCase()) !== -1
                      }
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="地貌类型">
                  {getFieldDecorator("landTypeId", {
                    initialValue: projectItem.expand.landType
                  })(
                    <AutoComplete
                      placeholder="请选择地貌类型"
                      dataSource={this.getDictList("地貌类型")}
                      filterOption={(inputValue, option) =>
                        option.props.children
                          .toUpperCase()
                          .indexOf(inputValue.toUpperCase()) !== -1
                      }
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="土壤类型">
                  {getFieldDecorator("soilTypeId", {
                    initialValue: projectItem.expand.soilType
                  })(
                    <AutoComplete
                      placeholder="请选择土壤类型"
                      dataSource={this.getDictList("土壤类型")}
                      filterOption={(inputValue, option) =>
                        option.props.children
                          .toUpperCase()
                          .indexOf(inputValue.toUpperCase()) !== -1
                      }
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="植被类型">
                  {getFieldDecorator("vegTypeId", {
                    initialValue: projectItem.expand.vegType
                  })(
                    <AutoComplete
                      placeholder="请选择植被类型"
                      dataSource={this.getDictList("植被类型")}
                      filterOption={(inputValue, option) =>
                        option.props.children
                          .toUpperCase()
                          .indexOf(inputValue.toUpperCase()) !== -1
                      }
                    />
                  )}
                </Form.Item>
              </Col>
              <Divider />
              <Col span={12}>
                <Form.Item label="项目建设区面积">
                  {getFieldDecorator("consArea", {
                    initialValue: projectItem.expand.consArea
                  })(<Input addonAfter="m2" style={{ width: 150 }} />)}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="直接影响区面积">
                  {getFieldDecorator("affeArea", {
                    initialValue: projectItem.expand.affeArea
                  })(<Input addonAfter="m2" style={{ width: 150 }} />)}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="扰动地表面积">
                  {getFieldDecorator("distSurfaceArea", {
                    initialValue: projectItem.expand.distSurfaceArea
                  })(<Input addonAfter="m2" style={{ width: 150 }} />)}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="损坏水土保持设施面积">
                  {getFieldDecorator("dmgArea", {
                    initialValue: projectItem.expand.dmgArea
                  })(<Input addonAfter="m2" style={{ width: 150 }} />)}
                </Form.Item>
              </Col>
              <Divider />
              <Col span={12}>
                <Form.Item label="原地貌土壤侵蚀模数">
                  {getFieldDecorator("landErsn", {
                    initialValue: projectItem.expand.landErsn
                  })(<Input addonAfter="t/km2*a" style={{ width: 150 }} />)}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="土壤容许流失量">
                  {getFieldDecorator("soilLoss", {
                    initialValue: projectItem.expand.soilLoss
                  })(<Input addonAfter="t/km2*a" style={{ width: 150 }} />)}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="水土流失预测总量">
                  {getFieldDecorator("ersnAmt", {
                    initialValue: projectItem.expand.ersnAmt
                  })(<Input addonAfter="t" style={{ width: 150 }} />)}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="新增水土流失量">
                  {getFieldDecorator("newErsnAmt", {
                    initialValue: projectItem.expand.newErsnAmt
                  })(<Input addonAfter="t" style={{ width: 150 }} />)}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="新增水土流失主要区域">
                  {getFieldDecorator("newArea", {
                    initialValue: projectItem.expand.newArea
                  })(<Input />)}
                </Form.Item>
              </Col>
              <Divider />
              <Col span={12}>
                <Form.Item label="扰动土地整治率">
                  {getFieldDecorator("fixRate", {
                    initialValue: projectItem.expand.fixRate
                  })(<Input addonAfter="%" style={{ width: 100 }} />)}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="水土流失总治理度">
                  {getFieldDecorator("govern", {
                    initialValue: projectItem.expand.govern
                  })(<Input addonAfter="%" style={{ width: 100 }} />)}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="土壤流失控制比">
                  {getFieldDecorator("ctlRatio", {
                    initialValue: projectItem.expand.ctlRatio
                  })(<Input addonAfter="%" style={{ width: 100 }} />)}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="拦渣率">
                  {getFieldDecorator("blkRate", {
                    initialValue: projectItem.expand.blkRate
                  })(<Input addonAfter="%" style={{ width: 100 }} />)}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="植被恢复系数">
                  {getFieldDecorator("vegRec", {
                    initialValue: projectItem.expand.vegRec
                  })(<Input addonAfter="%" style={{ width: 100 }} />)}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="林草覆盖率">
                  {getFieldDecorator("forestGrassCover", {
                    initialValue: projectItem.expand.forestGrassCover
                  })(<Input addonAfter="%" style={{ width: 100 }} />)}
                </Form.Item>
              </Col>
              <Divider />
              <Col span={12}>
                <Form.Item label="水土保持总投资">
                  {getFieldDecorator("waterSoilTotal", {
                    initialValue: projectItem.expand.waterSoilTotal
                  })(<Input addonAfter="万元" style={{ width: 150 }} />)}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="独立费用">
                  {getFieldDecorator("idptExp", {
                    initialValue: projectItem.expand.idptExp
                  })(<Input addonAfter="万元" style={{ width: 150 }} />)}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="水土保持监理费">
                  {getFieldDecorator("waterSoilSupervise", {
                    initialValue: projectItem.expand.waterSoilSupervise
                  })(<Input addonAfter="万元" style={{ width: 150 }} />)}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="水土保持监测费">
                  {getFieldDecorator("waterSoilDetect", {
                    initialValue: projectItem.expand.waterSoilDetect
                  })(<Input addonAfter="万元" style={{ width: 150 }} />)}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="水土保持补偿费">
                  {getFieldDecorator("waterSoilCompensate", {
                    initialValue: projectItem.expand.waterSoilCompensate
                  })(<Input addonAfter="万元" style={{ width: 150 }} />)}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="工程措施设计投资">
                  {getFieldDecorator("engInvest", {
                    initialValue: projectItem.expand.EngInvest
                  })(<Input addonAfter="万元" style={{ width: 150 }} />)}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="植物措施设计投资">
                  {getFieldDecorator("vegInvest", {
                    initialValue: projectItem.expand.vegInvest
                  })(<Input addonAfter="万元" style={{ width: 150 }} />)}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="临时措施设计投资">
                  {getFieldDecorator("temInvest", {
                    initialValue: projectItem.expand.temInvest
                  })(<Input addonAfter="万元" style={{ width: 150 }} />)}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="附件">
                  <Upload
                    listType="picture"
                    className={styles.upload_list_inline}
                  >
                    <Button>
                      <Icon type="upload" />
                      上传
                    </Button>
                  </Upload>
                </Form.Item>
              </Col>
              <Divider />
              <Col span={12}>
                <Form.Item label="方案编制单位">
                  {getFieldDecorator("projectDepartmentId", {
                    initialValue: this.getDepartName(
                      projectItem.projectDepartment
                    )
                  })(
                    <AutoComplete
                      dataSource={departSelectList}
                      filterOption={(inputValue, option) =>
                        option.props.children
                          .toUpperCase()
                          .indexOf(inputValue.toUpperCase()) !== -1
                      }
                      onChange={this.queryDepartList}
                      onBlur={() => {
                        this.getDepartList("projectDepartmentId");
                      }}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="监测单位">
                  {getFieldDecorator("monitorDepartmentId", {
                    initialValue: this.getDepartName(
                      projectItem.monitorDepartment
                    )
                  })(
                    <AutoComplete
                      dataSource={departSelectList}
                      filterOption={(inputValue, option) =>
                        option.props.children
                          .toUpperCase()
                          .indexOf(inputValue.toUpperCase()) !== -1
                      }
                      onChange={this.queryDepartList}
                      onBlur={() => {
                        this.getDepartList("monitorDepartmentId");
                      }}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="监理单位">
                  {getFieldDecorator("supervisionDepartmentId", {
                    initialValue: this.getDepartName(
                      projectItem.SupervisionDepartment
                    )
                  })(
                    <AutoComplete
                      dataSource={departSelectList}
                      filterOption={(inputValue, option) =>
                        option.props.children
                          .toUpperCase()
                          .indexOf(inputValue.toUpperCase()) !== -1
                      }
                      onChange={this.queryDepartList}
                      onBlur={() => {
                        this.getDepartList("supervisionDepartmentId");
                      }}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="设计单位">
                  {getFieldDecorator("designDepartmentId", {
                    initialValue: this.getDepartName(
                      projectItem.designDepartment
                    )
                  })(
                    <AutoComplete
                      dataSource={departSelectList}
                      filterOption={(inputValue, option) =>
                        option.props.children
                          .toUpperCase()
                          .indexOf(inputValue.toUpperCase()) !== -1
                      }
                      onChange={this.queryDepartList}
                      onBlur={() => {
                        this.getDepartList("designDepartmentId");
                      }}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="施工单位">
                  {getFieldDecorator("constructionDepartmentId", {
                    initialValue: this.getDepartName(
                      projectItem.constructionDepartment
                    )
                  })(
                    <AutoComplete
                      dataSource={departSelectList}
                      filterOption={(inputValue, option) =>
                        option.props.children
                          .toUpperCase()
                          .indexOf(inputValue.toUpperCase()) !== -1
                      }
                      onChange={this.queryDepartList}
                      onBlur={() => {
                        this.getDepartList("constructionDepartmentId");
                      }}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="验收报告编制单位">
                  {getFieldDecorator("reportDepartmentId", {
                    initialValue: this.getDepartName(
                      projectItem.ReportDepartment
                    )
                  })(
                    <AutoComplete
                      dataSource={departSelectList}
                      filterOption={(inputValue, option) =>
                        option.props.children
                          .toUpperCase()
                          .indexOf(inputValue.toUpperCase()) !== -1
                      }
                      onChange={this.queryDepartList}
                      onBlur={() => {
                        this.getDepartList("reportDepartmentId");
                      }}
                    />
                  )}
                </Form.Item>
              </Col>
              <Divider />
              <Col span={12}>
                <Form.Item label="项目变更信息">
                  {getFieldDecorator("ctn_code111", {
                    initialValue: ""
                  })(<Input.TextArea autosize />)}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="变更原因">
                  {getFieldDecorator("ctn_code1112", {
                    initialValue: ""
                  })(<Input.TextArea autosize />)}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="变更时间">
                  {getFieldDecorator("ctn_code1113", {})(
                    <DatePicker placeholder="" style={{ width: 130 }} />
                  )}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="原项目名称">
                  {getFieldDecorator("ctn_code1114", {
                    initialValue: ""
                  })(<Input />)}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="附件">
                  <Upload listType="picture">
                    <Button>
                      <Icon type="upload" />
                      上传
                    </Button>
                  </Upload>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </div>
      </div>
    );
  }
}
