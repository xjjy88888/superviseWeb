/* eslint-disable no-unused-vars */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { createForm } from 'rc-form';
import {
  Icon,
  Input,
  notification,
  Upload,
  Divider,
  Form,
  Row,
  Select,
  Col,
  DatePicker
} from 'antd';
import 'leaflet/dist/leaflet.css';
import emitter from '../../../utils/event';
import config from '../../../config';
import { getFile, unique } from '../../../utils/util';
import { dateInitFormat, dateFormat, accessToken } from '../../../utils/util';

let yearDataSource = [];
let self;

@connect(({ project, user, district }) => ({
  project,
  user,
  district
}))
@createForm()
export default class projectDetail extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      show: false,
      edit: false,
      departList: [],
      expandFileList: [],
      changeFileList: [],
      expandParentId: 0,
      changeParentId: 0
    };
    this.map = null;
    this.saveRef = ref => {
      this.refDom = ref;
    };
  }

  componentDidMount() {
    const {
      form: { resetFields, setFieldsValue }
    } = this.props;
    self = this;
    const { dispatch } = this.props;
    const maxYear = new Date().getFullYear();
    for (let i = maxYear; i >= 1970; i--) {
      yearDataSource.push({
        label: `${i}年`,
        value: i
      });
    }
    this.eventEmitter = emitter.addListener('departNameReset', v => {
      console.log(v);
      setFieldsValue({ [v.key]: v.id });
    });
    this.eventEmitter = emitter.addListener('showProjectDetail', data => {
      resetFields();
      this.setState({
        show: data.show,
        edit: data.edit
      });
      if (data.id) {
        this.queryProjectById(data.id);
      }
    });
    this.eventEmitter = emitter.addListener('projectCreateUpdate', data => {
      const { expandParentId, changeParentId } = this.state;
      //submit
      this.props.form.validateFields((err, v) => {
        console.log(v);
        const values = {
          ...data,
          ...v,
          expandAttachmentId: expandParentId,
          changeAttachmentId: changeParentId,
          designStartTime: v.designStartTime
            ? dateFormat(v.designStartTime._d)
            : null,
          designCompTime: v.designCompTime
            ? dateFormat(v.designCompTime._d)
            : null,
          actStartTime: v.actStartTime ? dateFormat(v.actStartTime._d) : null,
          actCompTime: v.actCompTime ? dateFormat(v.actCompTime._d) : null
        };
        dispatch({
          type: 'project/projectCreateUpdate',
          payload: values,
          callback: success => {
            if (success) {
              emitter.emit('deleteSuccess', {});
              this.setState({ show: false, });
            }
          }
        });
      });
    });
  }

  queryProjectById = id => {
    const { dispatch } = this.props;
    dispatch({
      type: 'project/queryProjectById',
      payload: {
        id: id,
        refresh: true
      },
      callback: (result, success) => {
        this.setState({
          expandParentId: result.expand.attachment
            ? result.expand.attachment.id
            : 0,
          changeParentId: result.expand.changeAttachment
            ? result.expand.changeAttachment.id
            : 0
        });

        if (result.expand.attachment) {
          const list = result.expand.attachment.child.map(item => {
            return {
              uid: item.id,
              name: item.fileName,
              status: 'done',
              url: config.url.annexPreviewUrl + item.id
            };
          });
          this.setState({ expandFileList: list });
        } else {
          this.setState({ expandFileList: [] });
        }
        if (result.expand.changeAttachment) {
          const list = result.expand.changeAttachment.child.map(item => {
            return {
              uid: item.id,
              name: item.fileName,
              status: 'done',
              url: config.url.annexPreviewUrl + item.id
            };
          });
          this.setState({ changeFileList: list });
        } else {
          this.setState({ changeFileList: [] });
        }
      }
    });
  };

  getFields() {
    const count = this.state.expand ? 10 : 6;
    const { getFieldDecorator } = this.props.form;
    const children = [];
    for (let i = 0; i < 10; i++) {
      children.push(
        <Col span={4} key={i} style={{ display: i < count ? 'block' : 'none' }}>
          <Form.Item label={`Field ${i}`}>
            {getFieldDecorator(`field-${i}`, {
              rules: [
                {
                  required: true,
                  message: 'Input something!'
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

  dictList = type => {
    const {
      user: { dicList }
    } = this.props;
    if (type) {
      return dicList.filter(item => {
        return item.dictTypeName === type;
      });
    } else {
      return [];
    }
  };

  getDepart = (obj, key) => {
    if (obj) {
      return obj[key];
    } else {
      return '';
    }
  };

  getDepartList = key => {
    const {
      dispatch,
      form: { setFieldsValue }
    } = this.props;
    const { departSearch } = this.state;
    if (departSearch) {
      dispatch({
        type: 'user/departVaild',
        payload: {
          name: departSearch
        },
        callback: (isVaild, data) => {
          if (isVaild) {
            this.setState({
              departList: [{ label: data.name, value: data.id }]
            });
            setFieldsValue({ [key]: data.id });
          } else {
            // Modal.confirm({
            //   title: "查不到该单位，是否去新建单位",
            //   content: "",
            //   onOk() {
            //     setFieldsValue({ [key]: "" });
            //     emitter.emit("showCreateDepart", {
            //       show: true,
            //       key: key
            //     });
            //   },
            //   onCancel() {}
            // });
          }
        }
      });
    }
  };

  queryDepartList = v => {
    const { dispatch } = this.props;
    dispatch({
      type: 'project/departList',
      payload: {
        name: v,
        kind: 2
      }
    });
  };

  getDictValue = id => {
    const {
      user: { dicList }
    } = this.props;
    if (id) {
      const filter = dicList.filter(item => {
        return item.id === id;
      });
      return filter.map(item => item.dictTableValue).join(',');
    } else {
      return '';
    }
  };

  domUpload = isChange => {
    const {
      dispatch,
      project: { projectInfo }
    } = this.props;
    const {
      expandFileList,
      changeFileList,
      changeParentId,
      expandParentId,
      edit
    } = this.state;
    const projectItem = projectInfo;
    const fileList = isChange ? changeFileList : expandFileList;
    const parentId = isChange ? changeParentId : expandParentId;
    return (
      <div style={{ minHeight: fileList.length ? 120 : 0 }}>
        <Upload
          action={config.url.annexUploadUrl}
          headers={{ Authorization: `Bearer ${accessToken()}` }}
          data={{ Id: parentId }}
          listType="picture-card"
          fileList={fileList}
          onSuccess={v => {
            if (v.success) {
              if (isChange) {
                this.setState({
                  changeParentId: v.result.id
                });
              } else {
                this.setState({
                  expandParentId: v.result.id
                });
              }
            } else {
              notification['error']({
                message: `水保方案附件上传失败：${v.error.message}`
              });
            }
          }}
          onPreview={file => {
            this.setState({
              previewImage: file.url || file.thumbUrl,
              previewVisible_min: true
            });
            getFile(file.url);
          }}
          onChange={({ fileList }) => {
            const data = fileList.map(item => {
              return {
                ...item,
                status: 'done'
              };
            });
            if (isChange) {
              this.setState({
                changeFileList: data
              });
            } else {
              this.setState({
                expandFileList: data
              });
            }
          }}
          onRemove={(file, is) => {
            return new Promise((resolve, reject) => {
              if (edit) {
                dispatch({
                  type: 'annex/annexDelete',
                  payload: {
                    FileId: file.uid,
                    Id: is
                      ? projectItem.expand.changeAttachment.id
                      : projectItem.expand.attachment.id
                  },
                  callback: success => {
                    if (success) {
                      resolve();
                    } else {
                      reject();
                    }
                  }
                });
              } else {
                reject();
                notification['info']({
                  message: `请先开始编辑项目`
                });
              }
            });
          }}
        >
          {edit ? (
            <div>
              <Icon type="plus" />
              <div className="ant-upload-text">
                {isChange ? '变更依据' : '水保方案'}上传
              </div>
            </div>
          ) : null}
        </Upload>
      </div>
    );
  };

  render() {
    const { show, edit, departList } = this.state;
    const {
      form: { getFieldDecorator, setFieldsValue },
      project: { projectInfo, departSelectList }
    } = this.props;

    const projectItem = projectInfo;
    const departSelectListAll = unique(departSelectList.concat(departList));

    return (
      <div
        style={{
          position: 'absolute',
          left: show ? 350 : -4000,
          top: 0,
          zIndex: 1000,
          width: 800,
          height: '100%',
          paddingTop: 46,
          backgroundColor: `#fff`,
          borderLeft: `solid 1px #ddd`
        }}
        ref={this.saveRef}
      >
        <Icon
          type="left"
          style={{
            fontSize: 30,
            display: show ? 'block' : 'none',
            position: `absolute`,
            right: -50,
            top: `48%`,
            backgroundColor: `rgba(0, 0, 0, 0.5)`,
            borderRadius: `50%`,
            padding: 10,
            cursor: `pointer`
          }}
          onClick={() => {
            emitter.emit('hideProjectDetail', {
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
            display: edit ? 'none' : 'block',
            overflow: 'auto',
            height: '100%'
          }}
        >
          <div style={{ float: 'left', width: 350, padding: '0 30px' }}>
            <p style={{ margin: 10 }}>
              <span>防治标准：</span>
              <span>{this.getDictValue(projectItem.expand.prevenStdId)}</span>
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
              <span>{projectItem.expand.projectSize}米或公顷</span>
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
              <span>
                {this.getDictValue(projectItem.expand.prevenZoneTypeId)}
              </span>
            </p>
            <p style={{ margin: 10 }}>
              <span>防治区级别：</span>
              <span>
                {this.getDictValue(projectItem.expand.prevenZoneLevelId)}
              </span>
            </p>
            <p style={{ margin: 10 }}>
              <span>地貌类型：</span>
              {/* （01：山地、02：丘陵、03：平原） */}
              <span>{this.getDictValue(projectItem.expand.landTypeId)}</span>
            </p>
            <p style={{ margin: 10 }}>
              <span>土壤类型：</span>
              <span>{this.getDictValue(projectItem.expand.soilTypeId)}</span>
            </p>
            <p style={{ margin: 10 }}>
              <span>植被类型：</span>
              <span>{this.getDictValue(projectItem.expand.vegTypeId)}</span>
            </p>
            <p style={{ margin: 10 }}>
              <span>——</span>
              <span>——</span>
            </p>
            <p style={{ margin: 10 }}>
              <span>项目建设区面积：</span>
              <span>{projectItem.expand.consArea}公顷</span>
            </p>
            <p style={{ margin: 10 }}>
              <span>直接影响区面积：</span>
              <span>{projectItem.expand.affeArea}公顷</span>
            </p>
            <p style={{ margin: 10 }}>
              <span>扰动地表面积：</span>
              <span>{projectItem.expand.distSurfaceArea}公顷</span>
            </p>
            <p style={{ margin: 10 }}>
              <span>损坏水土保持设施面积：</span>
              <span>{projectItem.expand.dmgArea}公顷</span>
            </p>
            <p style={{ margin: 10 }}>
              <span>——</span>
              <span>——</span>
            </p>
            <p style={{ margin: 10 }}>
              <span>原地貌土壤侵蚀模数：</span>
              <span>{projectItem.expand.landErsn}t/km²*a</span>
            </p>
            <p style={{ margin: 10 }}>
              <span>土壤容许流失量：</span>
              <span>{projectItem.expand.soilLoss}t/km²*a</span>
            </p>
            <p style={{ margin: 10 }}>
              <span>水土流失预测总量：</span>
              <span>{projectItem.expand.ersnAmt}t</span>
            </p>
            <p style={{ margin: 10 }}>
              <span>新建水土流失量：</span>
              <span>{projectItem.expand.newErsnAmt}t</span>
            </p>
            <p style={{ margin: 10 }}>
              <span>新建水土流失主要区域：</span>
              <span>{projectItem.expand.newArea}</span>
            </p>
            <p style={{ margin: 10 }}>
              <span>——</span>
              <span>——</span>
            </p>
          </div>
          <div style={{ float: 'left', width: 350, padding: '0 60px' }}>
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
            {this.domUpload(false)}
            <p style={{ margin: 10 }}>
              <span>——</span>
              <span>——</span>
            </p>
            <p style={{ margin: 10 }}>
              <span>方案编制单位：</span>
              <span>
                {this.getDepart(projectItem.projectDepartment, 'name')}
              </span>
            </p>
            <p style={{ margin: 10 }}>
              <span>监测单位：</span>
              <span>
                {this.getDepart(projectItem.monitorDepartment, 'name')}
              </span>
            </p>
            <p style={{ margin: 10 }}>
              <span>监理单位：</span>
              <span>
                {this.getDepart(
                  projectItem.expand.SupervisionDepartment,
                  'name'
                )}
              </span>
            </p>
            <p style={{ margin: 10 }}>
              <span>设计单位：</span>
              <span>
                {this.getDepart(projectItem.designDepartment, 'name')}
              </span>
            </p>
            <p style={{ margin: 10 }}>
              <span>施工单位：</span>
              <span>
                {this.getDepart(projectItem.constructionDepartment, 'name')}
              </span>
            </p>
            <p style={{ margin: 10 }}>
              <span>验收报告单位：</span>
              <span>
                {this.getDepart(projectItem.expand.ReportDepartment, 'name')}
              </span>
            </p>
            <p style={{ margin: 10 }}>
              <span>——</span>
              <span>——</span>
            </p>
            <p style={{ margin: 10 }}>
              <span>项目变更信息：</span>
              <span>{projectItem.expand.changeInfo}</span>
            </p>
            <p style={{ margin: 10 }}>
              <span>变更原因：</span>
              <span>{projectItem.expand.changeReason}</span>
            </p>
            <p style={{ margin: 10 }}>
              <span>变更时间：</span>
              <span>{projectItem.expand.changeTime}</span>
            </p>
            <p style={{ margin: 10 }}>
              <span>原项目名称：</span>
              <span>{projectItem.expand.originalProjectName}</span>
            </p>
            {this.domUpload(true)}
          </div>
        </div>
        <div
          style={{
            display: edit ? 'block' : 'none',
            height: '100%',
            padding: 30,
            overflow: 'auto'
          }}
        >
          <Form
            layout="inline"
            // className="ant-advanced-search-form"
            onSubmit={this.handleSearch}
          >
            <Row gutter={24}>
              <Col span={12}>
                <Form.Item label="防治标准">
                  {getFieldDecorator('prevenStdId', {
                    initialValue: projectItem.expand.prevenStdId
                  })(
                    <Select
                      style={{ width: 150 }}
                      showSearch
                      allowClear
                      optionFilterProp="children"
                    >
                      {this.dictList('防治标准').map(item => (
                        <Select.Option value={item.id} key={item.id}>
                          {item.dictTableValue}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="总投资">
                  {getFieldDecorator('totalInvest', {
                    initialValue: projectItem.expand.totalInvest
                  })(<Input addonAfter="万元" style={{ width: 150 }} />)}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="土建投资">
                  {getFieldDecorator('civilEngInvest', {
                    initialValue: projectItem.expand.civilEngInvest
                  })(<Input addonAfter="万元" style={{ width: 150 }} />)}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="项目规模">
                  {getFieldDecorator('projectSize', {
                    initialValue: projectItem.expand.projectSize
                  })(<Input addonAfter="米或公顷" style={{ width: 150 }} />)}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="设计动工时间">
                  {getFieldDecorator('designStartTime', {
                    initialValue: dateInitFormat(
                      projectItem.expand.designStartTime
                    )
                  })(<DatePicker placeholder="" style={{ width: 130 }} />)}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="设计完工时间">
                  {getFieldDecorator('designCompTime', {
                    initialValue: dateInitFormat(
                      projectItem.expand.designCompTime
                    )
                  })(<DatePicker placeholder="" style={{ width: 130 }} />)}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="实际开工时间">
                  {getFieldDecorator('actStartTime', {
                    initialValue: dateInitFormat(
                      projectItem.expand.actStartTime
                    )
                  })(<DatePicker placeholder="" style={{ width: 130 }} />)}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="实际完工时间">
                  {getFieldDecorator('actCompTime', {
                    initialValue: dateInitFormat(projectItem.expand.actCompTime)
                  })(<DatePicker placeholder="" style={{ width: 130 }} />)}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="设计水平年">
                  {getFieldDecorator('designLevelYear', {
                    initialValue: projectItem.expand.designLevelYear
                  })(
                    <Select
                      showSearch
                      style={{ width: 150 }}
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        option.props.children
                          .toLowerCase()
                          .indexOf(input.toLowerCase()) >= 0
                      }
                      onSearch={v => {
                        console.log(v);
                      }}
                    >
                      {yearDataSource.map(item => (
                        <Select.Option value={item.value} key={item.value}>
                          {item.label}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="防治区类型">
                  {getFieldDecorator('prevenZoneTypeId', {
                    initialValue: projectItem.expand.prevenZoneTypeId
                  })(
                    <Select
                      style={{ width: 150 }}
                      showSearch
                      allowClear
                      optionFilterProp="children"
                    >
                      {this.dictList('防治区类型').map(item => (
                        <Select.Option value={item.id} key={item.id}>
                          {item.dictTableValue}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="防治区级别">
                  {getFieldDecorator('prevenZoneLevelId', {
                    initialValue: projectItem.expand.prevenZoneLevelId
                  })(
                    <Select
                      style={{ width: 150 }}
                      showSearch
                      allowClear
                      optionFilterProp="children"
                    >
                      {this.dictList('防治区级别').map(item => (
                        <Select.Option value={item.id} key={item.id}>
                          {item.dictTableValue}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="地貌类型">
                  {getFieldDecorator('landTypeId', {
                    initialValue: projectItem.expand.landTypeId
                  })(
                    <Select
                      style={{ width: 150 }}
                      showSearch
                      allowClear
                      optionFilterProp="children"
                    >
                      {this.dictList('地貌类型').map(item => (
                        <Select.Option value={item.id} key={item.id}>
                          {item.dictTableValue}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="土壤类型">
                  {getFieldDecorator('soilTypeId', {
                    initialValue: projectItem.expand.soilTypeId
                  })(
                    <Select
                      style={{ width: 150 }}
                      showSearch
                      allowClear
                      optionFilterProp="children"
                    >
                      {this.dictList('土壤类型').map(item => (
                        <Select.Option value={item.id} key={item.id}>
                          {item.dictTableValue}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="植被类型">
                  {getFieldDecorator('vegTypeId', {
                    initialValue: projectItem.expand.vegTypeId
                  })(
                    <Select
                      style={{ width: 150 }}
                      showSearch
                      allowClear
                      optionFilterProp="children"
                    >
                      {this.dictList('植被类型').map(item => (
                        <Select.Option value={item.id} key={item.id}>
                          {item.dictTableValue}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Divider />
              <Col span={12}>
                <Form.Item label="项目建设区面积">
                  {getFieldDecorator('consArea', {
                    initialValue: projectItem.expand.consArea
                  })(<Input addonAfter="公顷" style={{ width: 150 }} />)}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="直接影响区面积">
                  {getFieldDecorator('affeArea', {
                    initialValue: projectItem.expand.affeArea
                  })(<Input addonAfter="公顷" style={{ width: 150 }} />)}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="扰动地表面积">
                  {getFieldDecorator('distSurfaceArea', {
                    initialValue: projectItem.expand.distSurfaceArea
                  })(<Input addonAfter="公顷" style={{ width: 150 }} />)}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="损坏水土保持设施面积">
                  {getFieldDecorator('dmgArea', {
                    initialValue: projectItem.expand.dmgArea
                  })(<Input addonAfter="公顷" style={{ width: 150 }} />)}
                </Form.Item>
              </Col>
              <Divider />
              <Col span={12}>
                <Form.Item label="原地貌土壤侵蚀模数">
                  {getFieldDecorator('landErsn', {
                    initialValue: projectItem.expand.landErsn
                  })(<Input addonAfter="t/km²*a" style={{ width: 150 }} />)}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="土壤容许流失量">
                  {getFieldDecorator('soilLoss', {
                    initialValue: projectItem.expand.soilLoss
                  })(<Input addonAfter="t/km²*a" style={{ width: 150 }} />)}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="水土流失预测总量">
                  {getFieldDecorator('ersnAmt', {
                    initialValue: projectItem.expand.ersnAmt
                  })(<Input addonAfter="t" style={{ width: 150 }} />)}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="新建水土流失量">
                  {getFieldDecorator('newErsnAmt', {
                    initialValue: projectItem.expand.newErsnAmt
                  })(<Input addonAfter="t" style={{ width: 150 }} />)}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="新建水土流失主要区域">
                  {getFieldDecorator('newArea', {
                    initialValue: projectItem.expand.newArea
                  })(<Input />)}
                </Form.Item>
              </Col>
              <Divider />
              <Col span={12}>
                <Form.Item label="扰动土地整治率">
                  {getFieldDecorator('fixRate', {
                    initialValue: projectItem.expand.fixRate
                  })(<Input addonAfter="%" style={{ width: 100 }} />)}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="水土流失总治理度">
                  {getFieldDecorator('govern', {
                    initialValue: projectItem.expand.govern
                  })(<Input addonAfter="%" style={{ width: 100 }} />)}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="土壤流失控制比">
                  {getFieldDecorator('ctlRatio', {
                    initialValue: projectItem.expand.ctlRatio
                  })(<Input addonAfter="%" style={{ width: 100 }} />)}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="拦渣率">
                  {getFieldDecorator('blkRate', {
                    initialValue: projectItem.expand.blkRate
                  })(<Input addonAfter="%" style={{ width: 100 }} />)}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="植被恢复系数">
                  {getFieldDecorator('vegRec', {
                    initialValue: projectItem.expand.vegRec
                  })(<Input addonAfter="%" style={{ width: 100 }} />)}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="林草覆盖率">
                  {getFieldDecorator('forestGrassCover', {
                    initialValue: projectItem.expand.forestGrassCover
                  })(<Input addonAfter="%" style={{ width: 100 }} />)}
                </Form.Item>
              </Col>
              <Divider />
              <Col span={12}>
                <Form.Item label="水土保持总投资">
                  {getFieldDecorator('waterSoilTotal', {
                    initialValue: projectItem.expand.waterSoilTotal
                  })(<Input addonAfter="万元" style={{ width: 150 }} />)}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="独立费用">
                  {getFieldDecorator('idptExp', {
                    initialValue: projectItem.expand.idptExp
                  })(<Input addonAfter="万元" style={{ width: 150 }} />)}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="水土保持监理费">
                  {getFieldDecorator('waterSoilSupervise', {
                    initialValue: projectItem.expand.waterSoilSupervise
                  })(<Input addonAfter="万元" style={{ width: 150 }} />)}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="水土保持监测费">
                  {getFieldDecorator('waterSoilDetect', {
                    initialValue: projectItem.expand.waterSoilDetect
                  })(<Input addonAfter="万元" style={{ width: 150 }} />)}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="水土保持补偿费">
                  {getFieldDecorator('waterSoilCompensate', {
                    initialValue: projectItem.expand.waterSoilCompensate
                  })(<Input addonAfter="万元" style={{ width: 150 }} />)}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="工程措施设计投资">
                  {getFieldDecorator('engInvest', {
                    initialValue: projectItem.expand.EngInvest
                  })(<Input addonAfter="万元" style={{ width: 150 }} />)}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="植物措施设计投资">
                  {getFieldDecorator('vegInvest', {
                    initialValue: projectItem.expand.vegInvest
                  })(<Input addonAfter="万元" style={{ width: 150 }} />)}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="临时措施设计投资">
                  {getFieldDecorator('temInvest', {
                    initialValue: projectItem.expand.temInvest
                  })(<Input addonAfter="万元" style={{ width: 150 }} />)}
                </Form.Item>
              </Col>
              {this.domUpload(false)}
              <Divider />
              <Col span={12}>
                <Form.Item
                  label={
                    <span style={{ userSelect: 'none' }}>
                      方案编制单位
                      <Icon
                        type="plus"
                        style={{
                          color: '#1890ff'
                        }}
                        onClick={() => {
                          emitter.emit('showCreateDepart', {
                            show: true,
                            key: 'projectDepartmentId'
                          });
                          setFieldsValue({ projectDepartmentId: '' });
                        }}
                      />
                    </span>
                  }
                >
                  {getFieldDecorator('projectDepartmentId', {
                    initialValue: this.getDepart(
                      projectItem.projectDepartment,
                      'id'
                    )
                  })(
                    <Select
                      showSearch
                      allowClear
                      style={{ width: 220 }}
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        option.props.children
                          .toLowerCase()
                          .indexOf(input.toLowerCase()) >= 0
                      }
                      onSearch={v => {
                        this.setState({ departSearch: v, isSelect: false });
                        this.queryDepartList(v);
                      }}
                      onBlur={() => {
                        this.getDepartList('projectDepartmentId');
                      }}
                      onSelect={() => {
                        this.setState({ isSelect: true });
                      }}
                    >
                      {departSelectListAll.map(item => (
                        <Select.Option value={item.value} key={item.value}>
                          {item.label}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={
                    <span style={{ userSelect: 'none' }}>
                      监测单位
                      <Icon
                        type="plus"
                        style={{
                          color: '#1890ff'
                        }}
                        onClick={() => {
                          emitter.emit('showCreateDepart', {
                            show: true,
                            key: 'monitorDepartmentId'
                          });
                          setFieldsValue({ monitorDepartmentId: '' });
                        }}
                      />
                    </span>
                  }
                >
                  {getFieldDecorator('monitorDepartmentId', {
                    initialValue: this.getDepart(
                      projectItem.monitorDepartment,
                      'id'
                    )
                  })(
                    <Select
                      showSearch
                      allowClear
                      style={{ width: 220 }}
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        option.props.children
                          .toLowerCase()
                          .indexOf(input.toLowerCase()) >= 0
                      }
                      onSearch={v => {
                        this.setState({ departSearch: v, isSelect: false });
                        this.queryDepartList(v);
                      }}
                      onBlur={() => {
                        this.getDepartList('monitorDepartmentId');
                      }}
                      onSelect={() => {
                        this.setState({ isSelect: true });
                      }}
                    >
                      {departSelectListAll.map(item => (
                        <Select.Option value={item.value} key={item.value}>
                          {item.label}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={
                    <span style={{ userSelect: 'none' }}>
                      监理单位
                      <Icon
                        type="plus"
                        style={{
                          color: '#1890ff'
                        }}
                        onClick={() => {
                          emitter.emit('showCreateDepart', {
                            show: true,
                            key: 'supervisionDepartmentId'
                          });
                          setFieldsValue({ supervisionDepartmentId: '' });
                        }}
                      />
                    </span>
                  }
                >
                  {getFieldDecorator('supervisionDepartmentId', {
                    initialValue: this.getDepart(
                      projectItem.supervisionDepartment,
                      'id'
                    )
                  })(
                    <Select
                      showSearch
                      allowClear
                      style={{ width: 220 }}
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        option.props.children
                          .toLowerCase()
                          .indexOf(input.toLowerCase()) >= 0
                      }
                      onSearch={v => {
                        this.setState({ departSearch: v, isSelect: false });
                        this.queryDepartList(v);
                      }}
                      onBlur={() => {
                        this.getDepartList('supervisionDepartmentId');
                      }}
                      onSelect={() => {
                        this.setState({ isSelect: true });
                      }}
                    >
                      {departSelectListAll.map(item => (
                        <Select.Option value={item.value} key={item.value}>
                          {item.label}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={
                    <span style={{ userSelect: 'none' }}>
                      设计单位
                      <Icon
                        type="plus"
                        style={{
                          color: '#1890ff'
                        }}
                        onClick={() => {
                          emitter.emit('showCreateDepart', {
                            show: true,
                            key: 'designDepartmentId'
                          });
                          setFieldsValue({ designDepartmentId: '' });
                        }}
                      />
                    </span>
                  }
                >
                  {getFieldDecorator('designDepartmentId', {
                    initialValue: this.getDepart(
                      projectItem.designDepartment,
                      'id'
                    )
                  })(
                    <Select
                      showSearch
                      allowClear
                      style={{ width: 220 }}
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        option.props.children
                          .toLowerCase()
                          .indexOf(input.toLowerCase()) >= 0
                      }
                      onSearch={v => {
                        this.setState({ departSearch: v, isSelect: false });
                        this.queryDepartList(v);
                      }}
                      onBlur={() => {
                        this.getDepartList('designDepartmentId');
                      }}
                      onSelect={() => {
                        this.setState({ isSelect: true });
                      }}
                    >
                      {departSelectListAll.map(item => (
                        <Select.Option value={item.value} key={item.value}>
                          {item.label}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={
                    <span style={{ userSelect: 'none' }}>
                      施工单位
                      <Icon
                        type="plus"
                        style={{
                          color: '#1890ff'
                        }}
                        onClick={() => {
                          emitter.emit('showCreateDepart', {
                            show: true,
                            key: 'constructionDepartmentId'
                          });
                          setFieldsValue({ constructionDepartmentId: '' });
                        }}
                      />
                    </span>
                  }
                >
                  {getFieldDecorator('constructionDepartmentId', {
                    initialValue: this.getDepart(
                      projectItem.constructionDepartment,
                      'id'
                    )
                  })(
                    <Select
                      showSearch
                      allowClear
                      style={{ width: 220 }}
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        option.props.children
                          .toLowerCase()
                          .indexOf(input.toLowerCase()) >= 0
                      }
                      onSearch={v => {
                        this.setState({ departSearch: v, isSelect: false });
                        this.queryDepartList(v);
                      }}
                      onBlur={() => {
                        this.getDepartList('constructionDepartmentId');
                      }}
                      onSelect={() => {
                        this.setState({ isSelect: true });
                      }}
                    >
                      {departSelectListAll.map(item => (
                        <Select.Option value={item.value} key={item.value}>
                          {item.label}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={
                    <span style={{ userSelect: 'none' }}>
                      验收报告单位
                      <Icon
                        type="plus"
                        style={{
                          color: '#1890ff'
                        }}
                        onClick={() => {
                          emitter.emit('showCreateDepart', {
                            show: true,
                            key: 'reportDepartmentId'
                          });
                          setFieldsValue({ reportDepartmentId: '' });
                        }}
                      />
                    </span>
                  }
                >
                  {getFieldDecorator('reportDepartmentId', {
                    initialValue: this.getDepart(
                      projectItem.reportDepartment,
                      'id'
                    )
                  })(
                    <Select
                      showSearch
                      allowClear
                      style={{ width: 220 }}
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        option.props.children
                          .toLowerCase()
                          .indexOf(input.toLowerCase()) >= 0
                      }
                      onSearch={v => {
                        this.setState({ departSearch: v, isSelect: false });
                        this.queryDepartList(v);
                      }}
                      onBlur={() => {
                        this.getDepartList('reportDepartmentId');
                      }}
                      onSelect={() => {
                        this.setState({ isSelect: true });
                      }}
                    >
                      {departSelectListAll.map(item => (
                        <Select.Option value={item.value} key={item.value}>
                          {item.label}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Divider />
              <Col span={12}>
                <Form.Item label="项目变更信息">
                  {getFieldDecorator('changeInfo', {
                    initialValue: projectItem.expand.changeInfo
                  })(<Input.TextArea autosize />)}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="变更原因">
                  {getFieldDecorator('changeReason', {
                    initialValue: projectItem.expand.changeReason
                  })(<Input.TextArea autosize />)}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="变更时间">
                  {getFieldDecorator('changeTime', {
                    initialValue: dateInitFormat(projectItem.expand.changeTime)
                  })(<DatePicker placeholder="" style={{ width: 130 }} />)}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="原项目名称">
                  {getFieldDecorator('originalProjectName', {
                    initialValue: projectItem.expand.originalProjectName
                  })(<Input />)}
                </Form.Item>
              </Col>
              {this.domUpload(true)}
            </Row>
          </Form>
        </div>
      </div>
    );
  }
}
