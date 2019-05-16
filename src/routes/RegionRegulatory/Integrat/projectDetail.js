import React, { PureComponent } from "react";
import { connect } from "dva";
import { createForm } from "rc-form";
import {
  Icon,
  Button,
  Input,
  Radio,
  Upload,
  Divider,
  Form,
  Row,
  Col,
  DatePicker,
  AutoComplete
} from "antd";
import "leaflet/dist/leaflet.css";
import emitter from "../../../utils/event";
import styles from "./index.less";

let yearDataSource = [];

@connect(({ project }) => ({
  project
}))
@createForm()
export default class integrat extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      show: false,
      edit: false
    };
    this.map = null;
    this.saveRef = ref => {
      this.refDom = ref;
    };
  }

  componentDidMount() {
    const maxYear = new Date().getFullYear();
    for (let i = maxYear; i >= 1970; i--) {
      yearDataSource.push(`${i}年`);
    }
    this.eventEmitter = emitter.addListener("showProjectDetail", data => {
      this.setState({
        show: data.show,
        edit: data.edit
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
          </Form.Item>
        </Col>
      );
    }
    return children;
  }
  render() {
    const { show, edit } = this.state;

    const {
      project: { projectItem }
    } = this.props;

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
              <span>{projectItem.projectDepartment}</span>
            </p>
            <p style={{ margin: 10 }}>
              <span>监测单位：</span>
              <span>{projectItem.monitorDepartment}</span>
            </p>
            <p style={{ margin: 10 }}>
              <span>监理单位：</span>
              <span>{projectItem.expand.SupervisionDepartment}</span>
            </p>
            <p style={{ margin: 10 }}>
              <span>设计单位：</span>
              <span>{projectItem.designDepartment}</span>
            </p>
            <p style={{ margin: 10 }}>
              <span>施工单位：</span>
              <span>{projectItem.constructionDepartment}</span>
            </p>
            <p style={{ margin: 10 }}>
              <span>验收报告编制单位：</span>
              <span>{projectItem.expand.ReportDepartment}</span>
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
                  <Radio.Group
                    onChange={e => {
                      this.setState({
                        value: e.target.control_standard
                      });
                    }}
                    value={this.state.control_standard}
                  >
                    <Radio value={1}>一级</Radio>
                    <Radio value={2}>二级</Radio>
                    <Radio value={3}>三级</Radio>
                  </Radio.Group>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="总投资">
                  <Input addonAfter="万元" style={{ width: 150 }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="土建投资">
                  <Input addonAfter="万元" style={{ width: 150 }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="项目规模">
                  <Input addonAfter="m或m2" style={{ width: 150 }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="设计动工时间">
                  <DatePicker placeholder="" style={{ width: 130 }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="设计完工时间">
                  <DatePicker placeholder="" style={{ width: 130 }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="实际开工时间">
                  <DatePicker placeholder="" style={{ width: 130 }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="实际完工时间">
                  <DatePicker placeholder="" style={{ width: 130 }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="设计水平年">
                  <AutoComplete
                    allowClear
                    dataSource={yearDataSource}
                    filterOption={(inputValue, option) =>
                      option.props.children.indexOf(inputValue) !== -1
                    }
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="防治区类型（枚举）">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="防治区级别">
                  <Radio.Group
                    onChange={e => {
                      this.setState({
                        value: e.target.control_zone_level
                      });
                    }}
                    value={this.state.control_zone_level}
                  >
                    <Radio value={1}>国家</Radio>
                    <Radio value={2}>省级</Radio>
                  </Radio.Group>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="地貌类型（枚举）">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="土壤类型">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="植被类型">
                  <Input />
                </Form.Item>
              </Col>
              <Divider />
              <Col span={12}>
                <Form.Item label="项目建设区面积">
                  <Input addonAfter="m2" style={{ width: 150 }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="直接影响区面积">
                  <Input addonAfter="m2" style={{ width: 150 }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="扰动地表面积">
                  <Input addonAfter="m2" style={{ width: 150 }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="损坏水土保持设施面积">
                  <Input addonAfter="m2" style={{ width: 150 }} />
                </Form.Item>
              </Col>
              <Divider />
              <Col span={12}>
                <Form.Item label="原地貌土壤侵蚀模数">
                  <Input addonAfter="t/km2*a" style={{ width: 150 }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="土壤容许流失量">
                  <Input addonAfter="t/km2*a" style={{ width: 150 }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="水土流失预测总量">
                  <Input addonAfter="t" style={{ width: 150 }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="新增水土流失量">
                  <Input addonAfter="t" style={{ width: 150 }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="新增水土流失主要区域">
                  <Input />
                </Form.Item>
              </Col>
              <Divider />
              <Col span={12}>
                <Form.Item label="扰动土地整治率">
                  <Input addonAfter="%" style={{ width: 100 }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="水土流失总治理度">
                  <Input addonAfter="%" style={{ width: 100 }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="土壤流失控制比">
                  <Input addonAfter="%" style={{ width: 100 }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="拦渣率">
                  <Input addonAfter="%" style={{ width: 100 }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="植被恢复系数">
                  <Input addonAfter="%" style={{ width: 100 }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="林草覆盖率">
                  <Input addonAfter="%" style={{ width: 100 }} />
                </Form.Item>
              </Col>
              <Divider />
              <Col span={12}>
                <Form.Item label="水土保持总投资">
                  <Input addonAfter="万元" style={{ width: 150 }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="独立费用">
                  <Input addonAfter="万元" style={{ width: 150 }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="水土保持监理费">
                  <Input addonAfter="万元" style={{ width: 150 }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="水土保持监测费">
                  <Input addonAfter="万元" style={{ width: 150 }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="水土保持补偿费">
                  <Input addonAfter="万元" style={{ width: 150 }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="工程措施设计投资">
                  <Input addonAfter="万元" style={{ width: 150 }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="职位措施设计投资">
                  <Input addonAfter="万元" style={{ width: 150 }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="临时措施设计投资">
                  <Input addonAfter="万元" style={{ width: 150 }} />
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
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="监测单位">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="监理单位">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="设计单位">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="施工单位">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="验收报告编制单位">
                  <Input />
                </Form.Item>
              </Col>
              <Divider />
              <Col span={12}>
                <Form.Item label="项目变更信息">
                  <Input.TextArea autosize />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="变更原因">
                  <Input.TextArea autosize />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="变更时间">
                  <DatePicker placeholder="" style={{ width: 130 }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="原项目名称">
                  <Input />
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
