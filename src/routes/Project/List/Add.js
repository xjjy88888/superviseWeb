import React, { PureComponent } from 'react';
import { createForm } from 'rc-form';
import { connect } from 'dva';
import {
  Menu,
  Icon,
  Tag,
  Tree,
  Button,
  Row,
  Col,
  notification,
  Popover,
  Input,
  Radio,
  List,
  Select,
  Upload,
  Modal,
  TreeSelect,
  Cascader,
  Form,
  Switch,
  DatePicker,
  AutoComplete,
  Table,
  Collapse,
  Typography,
  message
} from 'antd';
import Highlighter from 'react-highlight-words';
import config from '../../../config';
import MustFill from '../../../components/MustFill';
import emitter from '../../../utils/event';
import {
  dateInitFormat,
  accessToken,
  getFile,
  guid,
  unique
} from '../../../utils/util';

const formItemLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 }
};

@connect(({ projectSupervise, district, user, project }) => ({
  projectSupervise,
  district,
  user,
  project
}))
@createForm()
export default class homePage extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      show: false,
      sortedInfo: null,
      searchText: '',
      loading: false,
      dataSource: [],
      showAdd: true,
      departList: []
    };
  }

  componentDidMount() {
    const { onThis } = this.props;
    this.basinOrgan();
    this.districtTree();
    this.queryDict();
    onThis(this);
  }

  districtTree = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'district/districtTree',
      payload: {
        IsFilter: true
      }
    });
    dispatch({
      type: 'district/districtTree',
      payload: {
        IsFilter: false
      }
    });
  };

  find = (arr, v, key) => {
    let result;
    if (!arr) {
      return;
    }
    arr.map(item => {
      if (item.value === v) {
        result = [item[key]];
      } else {
        const child = this.find(item.children, v, key);
        if (child) {
          result = [item[key], ...child];
        }
      }
    });
    return result;
  };

  getDepart = (obj, key) => {
    if (obj) {
      return obj[key];
    } else {
      return '';
    }
  };

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

  departList = (v, t) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'project/departList',
      payload: {
        name: v,
        kind: t
      }
    });
  };

  basinOrgan = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'user/basinOrgan'
    });
  };

  queryDict = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'user/queryDict'
    });
  };

  projectSuperviseCreateUpdate = payload => {
    const { hide, dispatch } = this.props;
    dispatch({
      type: 'projectSupervise/projectSuperviseCreateUpdate',
      payload,
      callback: success => {
        if (success) {
          hide(true);
        }
      }
    });
  };

  reset() {
    const {
      form: { resetFields }
    } = this.props;
    resetFields();
  }

  render() {
    const {
      show,
      hide,
      dispatch,
      form: {
        getFieldDecorator,
        resetFields,
        setFieldsValue,
        getFieldValue,
        validateFields
      },
      projectSupervise: { projectItem },
      district: { districtTree, districtTreeFilter },
      user: { basinOrganList },
      project: { projectList, projectInfo, projectListAdd, departSelectList }
    } = this.props;

    const {
      dataSource,
      pagination,
      loading,
      showAdd,
      departList,
      showPlan,
      showReply
    } = this.state;

    const departSelectListAll = unique(departSelectList.concat(departList));

    return (
      <Modal
        title="新建项目"
        visible={show}
        onOk={() => {
          // submit
          validateFields((err, v) => {
            if (!v.projectName) {
              message.warning('请填写项目名');
              return;
            }
            if (v.districtCodes.length === 0) {
              message.warning('请选择涉及县');
              return;
            }
            const data = {
              ...v,
              districtCodes: v.districtCodes.join(','),
              districtCodeId:
                v.districtCodeId && v.districtCodeId.length
                  ? v.districtCodeId.pop()
                  : '',
              id: projectItem.id,
              isNeedPlan: v.isNeedPlan ? true : false
            };
            console.log(`项目监管新建`, data);
            this.projectSuperviseCreateUpdate(data);
          });
        }}
        onCancel={() => hide(false)}
        width={window.innerWidth * 0.6}
      >
        <Form
          // layout="inline"
          style={{ margin: '0 20px' }}
        >
          <Row>
            <Col span={12}>
              <Form.Item
                label={
                  <span>
                    <MustFill />
                    项目名
                  </span>
                }
                {...formItemLayout}
              >
                {getFieldDecorator('projectName', {
                  initialValue: projectItem.projectBase.name
                })(<Input />)}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="所在地区" {...formItemLayout}>
                {getFieldDecorator('districtCodeId', {
                  initialValue: this.find(
                    districtTreeFilter,
                    projectItem.projectBase.districtCodeId,
                    'value'
                  )
                })(
                  <Cascader
                    placeholder=""
                    options={districtTreeFilter}
                    changeOnSelect
                  />
                )}
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={12}>
              <Form.Item label="详细地址" {...formItemLayout}>
                {getFieldDecorator('addressInfo', {
                  initialValue: projectItem.projectBase.addressInfo
                })(<Input />)}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="坐标" {...formItemLayout}>
                {getFieldDecorator('pointX', {
                  initialValue: projectItem.projectBase.pointX
                })(<Input placeholder="经度" style={{ width: 120 }} />)}
                {getFieldDecorator('pointY', {
                  initialValue: projectItem.projectBase.pointY
                })(<Input placeholder="纬度" style={{ width: 120 }} />)}
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={12}>
              <Form.Item label={'建设单位'} {...formItemLayout}>
                {getFieldDecorator('productDepartmentId', {
                  initialValue: this.getDepart(
                    projectItem.productDepartment,
                    'id'
                  )
                })(
                  <Select
                    showSearch
                    allowClear
                    optionFilterProp="children"
                    onSearch={v => {
                      this.departList(v, 2);
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
              <Form.Item label="监管单位" {...formItemLayout}>
                {getFieldDecorator('supDepartmentId', {
                  initialValue: this.getDepart(projectItem.supDepartment, 'id')
                })(
                  <Select
                    showSearch
                    allowClear
                    optionFilterProp="children"
                    onSearch={v => {
                      this.departList(v, 1);
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
          </Row>
          <Row>
            <Col span={12}>
              <Form.Item label="流域管理机构" {...formItemLayout}>
                {getFieldDecorator('riverBasinOUId', {
                  initialValue: projectItem.riverBasinOU
                    ? projectItem.riverBasinOU.id
                    : ''
                })(
                  <Select showSearch allowClear optionFilterProp="children">
                    {basinOrganList.map(item => (
                      <Select.Option value={item.id} key={item.id}>
                        {item.name}
                      </Select.Option>
                    ))}
                  </Select>
                )}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="编报方案" {...formItemLayout}>
                {getFieldDecorator('isNeedPlan', {
                  valuePropName: 'checked',
                  initialValue: projectItem.isNeedPlan
                })(
                  <Switch
                    checkedChildren="需要"
                    unCheckedChildren="不需要"
                    onChange={v => {
                      this.setState({ showPlan: v });
                    }}
                  />
                )}
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={12}>
              <Form.Item label="批复机构" {...formItemLayout}>
                {getFieldDecorator('replyDepartmentId', {
                  initialValue: this.getDepart(
                    projectItem.replyDepartment,
                    'id'
                  )
                })(
                  <Select
                    allowClear
                    showSearch
                    optionFilterProp="children"
                    onSearch={v => {
                      this.departList(v, 1);
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
              <Form.Item label="批复日期" {...formItemLayout}>
                {getFieldDecorator('replyTime', {
                  initialValue: dateInitFormat(projectItem.replyTime)
                })(<DatePicker placeholder="" />)}
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={12}>
              <Form.Item label="批复文号" {...formItemLayout}>
                {getFieldDecorator('replyNum', {
                  initialValue: projectItem.replyNum
                })(<Input />)}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="责任面积" {...formItemLayout}>
                {getFieldDecorator('respArea', {
                  initialValue: projectItem.expand.respArea
                })(<Input addonAfter="公顷" />)}
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={12}>
              <Form.Item label="项目性质" {...formItemLayout}>
                {getFieldDecorator('projectNatId', {
                  initialValue: projectItem.expand.projectNatId
                })(
                  <Select showSearch allowClear optionFilterProp="children">
                    {this.dictList('项目性质').map(item => (
                      <Select.Option value={item.id} key={item.id}>
                        {item.dictTableValue}
                      </Select.Option>
                    ))}
                  </Select>
                )}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="立项级别" {...formItemLayout}>
                {getFieldDecorator('projectLevelId', {
                  initialValue: projectItem.projectLevelId
                })(
                  <Select showSearch allowClear optionFilterProp="children">
                    {this.dictList('立项级别').map(item => (
                      <Select.Option value={item.id} key={item.id}>
                        {item.dictTableValue}
                      </Select.Option>
                    ))}
                  </Select>
                )}
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={12}>
              <Form.Item label="扰动合规性" {...formItemLayout}>
                {getFieldDecorator('complianceId', {
                  initialValue: projectItem.expand.complianceId
                })(
                  <Select showSearch allowClear optionFilterProp="children">
                    {this.dictList('扰动合规性').map(item => (
                      <Select.Option value={item.id} key={item.id}>
                        {item.dictTableValue}
                      </Select.Option>
                    ))}
                  </Select>
                )}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="项目类别" {...formItemLayout}>
                {getFieldDecorator('projectCateId', {
                  initialValue: projectItem.expand.projectCateId
                })(
                  <Select showSearch allowClear optionFilterProp="children">
                    {this.dictList('项目类别').map(item => (
                      <Select.Option value={item.id} key={item.id}>
                        {item.dictTableValue}
                      </Select.Option>
                    ))}
                  </Select>
                )}
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={12}>
              <Form.Item label="项目类型" {...formItemLayout}>
                {getFieldDecorator('projectTypeId', {
                  initialValue: projectItem.expand.projectTypeId
                })(
                  <Select showSearch allowClear optionFilterProp="children">
                    {this.dictList('项目类型').map(item => (
                      <Select.Option value={item.id} key={item.id}>
                        {item.dictTableValue}
                      </Select.Option>
                    ))}
                  </Select>
                )}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="建设状态" {...formItemLayout}>
                {getFieldDecorator('projectStatusId', {
                  initialValue: projectItem.projectStatusId
                })(
                  <Select showSearch allowClear optionFilterProp="children">
                    {this.dictList('建设状态').map(item => (
                      <Select.Option value={item.id} key={item.id}>
                        {item.dictTableValue}
                      </Select.Option>
                    ))}
                  </Select>
                )}
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={12}>
              <Form.Item
                label={
                  <span>
                    <MustFill />
                    涉及县
                  </span>
                }
                {...formItemLayout}
              >
                {getFieldDecorator('districtCodes', {
                  valuePropName: 'value',
                  initialValue: districtTree[0].children
                    ? (projectItem.projectBase.districtCodes || []).map(
                        item => item.id
                      )
                    : [districtTree[0].value]
                })(
                  <TreeSelect
                    showSearch
                    style={{ width: '100%' }}
                    dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                    allowClear
                    multiple
                    maxTagCount={5}
                  >
                    {districtTree.map((item, index) => (
                      <TreeSelect.TreeNode
                        value={item.value}
                        title={item.label}
                        key={item.value}
                        disabled={item.children ? true : false}
                      >
                        {(item.children || []).map((ite, idx) => (
                          <TreeSelect.TreeNode
                            value={ite.value}
                            title={ite.label}
                            key={ite.value}
                            disabled={ite.children ? true : false}
                          >
                            {(ite.children || []).map((it, id) => (
                              <TreeSelect.TreeNode
                                value={it.value}
                                title={it.label}
                                key={it.value}
                                disabled={it.children ? true : false}
                              >
                                {(it.children || []).map((i, j) => (
                                  <TreeSelect.TreeNode
                                    value={i.value}
                                    title={i.label}
                                    key={i.value}
                                  />
                                ))}
                              </TreeSelect.TreeNode>
                            ))}
                          </TreeSelect.TreeNode>
                        ))}
                      </TreeSelect.TreeNode>
                    ))}
                  </TreeSelect>
                )}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="备注" {...formItemLayout}>
                {getFieldDecorator('description', {
                  initialValue: projectItem.description
                })(<Input.TextArea autosize />)}
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    );
  }
}
