import React, { PureComponent } from 'react';
import { createForm } from 'rc-form';
import { connect } from 'dva';
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
  Form
} from 'antd';
import emitter from '../../../utils/event';
import 'leaflet/dist/leaflet.css';

const { RangePicker } = DatePicker;
const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 15 }
};
const formItemLayoutlong = {
  labelCol: { span: 6 },
  wrapperCol: { span: 15 }
};
let yearList = [];

@createForm()
@connect(({ user, district }) => ({
  user,
  district
}))
export default class Query extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      show: false,
      type: 'project',
      dataSource: [],
      showVecType: false,
      isProjectSupervise: false
    };
    this.saveRef = ref => {
      this.refDom = ref;
    };
  }

  componentDidMount() {
    const year = new Date().getFullYear();
    for (let i = 2015; i <= year; i++) {
      yearList.push(i);
    }
    this.eventEmitter = emitter.addListener('showQuery', v => {
      console.log(`showQuery`, v);
      this.setState({
        show: v.show
      });
      if (v.show) {
        this.setState({
          type: v.type,
          isProjectSupervise: v.isProjectSupervise
        });
      }
    });
  }

  getRandomInt = (max, min = 0) => {
    return Math.floor(Math.random() * (max - min + 1)) + min; // eslint-disable-line no-mixed-operators
  };

  searchResult = query => {
    return new Array(this.getRandomInt(5))
      .join('.')
      .split('.')
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
      return filter.map(item => item.dictTableValue);
    } else {
      return [];
    }
  };

  render() {
    const {
      form: { getFieldDecorator, resetFields },
      district: { districtTreeFilter }
    } = this.props;

    const { show, type, showVecType, isProjectSupervise } = this.state;

    return (
      <div
        style={{
          position: `absolute`,
          top: 0,
          left: show ? 350 : -550,
          zIndex: 1000,
          width: 450,
          height: `100%`,
          paddingTop: 46,
          borderLeft: 'solid 1px #ddd',
          backgroundColor: `#fff`
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
            this.setState({ show: false });
            emitter.emit('hideQuery', {
              hide: true
            });
          }}
        />
        <div
          style={{
            position: 'absolute',
            color: '#1890ff',
            left: 0,
            top: 42,
            width: 382,
            height: 62,
            zIndex: 1,
            padding: '0 78px',
            boxSizing: 'border-box',
            backgroundColor: `#fff`
          }}
        >
          <Button
            icon="undo"
            style={{ margin: '20px 40px 0px 20px' }}
            onClick={() => {
              resetFields();
              emitter.emit('queryInfo', {
                from: type,
                info: {},
                ProjectShowArchive: false,
                SpotShowArchive: false
              });
            }}
          >
            重置
          </Button>
          <Button
            icon="search"
            onClick={() => {
              // submit
              this.props.form.validateFields((err, v) => {
                if (!err) {
                  console.log('筛选信息', v);
                  const d1 = v.ProjectDistrictCodes;
                  const d2 = v.SpotDistrictCodes;
                  emitter.emit('queryInfo', {
                    from: type,
                    info: {
                      ...v,
                      ProjectDistrictCodes: d1[d1.length - 1],
                      SpotDistrictCodes: d2[d2.length - 1],
                      isNeedPlan: !v.isNeedPlan
                        ? ''
                        : v.isNeedPlan.length === 2
                        ? ''
                        : v.isNeedPlan.length === 1
                        ? v.isNeedPlan[0]
                        : '',
                      isReply: !v.isReply
                        ? ''
                        : v.isReply.length === 2
                        ? ''
                        : v.isReply.length === 1
                        ? v.isReply[0]
                        : '',
                      IsReview: v.IsReview.length === 1 ? v.IsReview[0] : '',
                      interBatch: (v.interBatch1 || '') + (v.interBatch2 || '')
                    }
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
            position: 'absolute',
            color: '#1890ff',
            right: 25,
            top: 60
          }}
          onClick={() => {
            this.setState({ show: false });
            emitter.emit('hideQuery', {
              hide: true
            });
          }}
        />
        <div
          style={{
            display: type === 'project' ? 'block' : 'none',
            padding: '60px 0 10px 0',
            overflow: 'auto',
            height: '100%'
          }}
        >
          <Form>
            <Form.Item label="所在地区" {...formItemLayout}>
              {getFieldDecorator('ProjectDistrictCodes', { initialValue: '' })(
                <Cascader
                  options={districtTreeFilter}
                  changeOnSelect
                  placeholder=""
                />
              )}
            </Form.Item>
            <Form.Item label="建设单位" {...formItemLayout}>
              {getFieldDecorator('ProductDepartment', { initialValue: '' })(
                <Input allowClear />
              )}
            </Form.Item>
            <Form.Item label="监管单位" {...formItemLayout}>
              {getFieldDecorator('SupDepartment', { initialValue: '' })(
                <Input allowClear />
              )}
            </Form.Item>
            <Form.Item label="批复机构" {...formItemLayout}>
              {getFieldDecorator('ReplyDepartment', { initialValue: '' })(
                <Input allowClear />
              )}
            </Form.Item>
            <Form.Item label="批复文号" {...formItemLayout}>
              {getFieldDecorator('ReplyNum', { initialValue: '' })(
                <Input allowClear />
              )}
            </Form.Item>
            <Form.Item label="项目类型" {...formItemLayout}>
              {getFieldDecorator('ProjectType', { initialValue: [] })(
                <Select mode="multiple" style={{ width: '100%' }}>
                  {this.getDictList('项目类型').map(item => (
                    <Select.Option key={item}>{item}</Select.Option>
                  ))}
                </Select>
              )}
            </Form.Item>
            <Form.Item label="项目合规性" {...formItemLayout}>
              {getFieldDecorator('Compliance', { initialValue: [] })(
                <Select mode="multiple" style={{ width: '100%' }}>
                  {this.getDictList('扰动合规性').map(item => (
                    <Select.Option key={item}>{item}</Select.Option>
                  ))}
                </Select>
              )}
            </Form.Item>
            <Form.Item label="批复时间" {...formItemLayout}>
              {getFieldDecorator('ReplyTime', { initialValue: [] })(
                <RangePicker style={{ width: '100%' }} />
              )}
            </Form.Item>
            <Form.Item label="编报方案" {...formItemLayoutlong}>
              {getFieldDecorator('isNeedPlan', {})(
                <Checkbox.Group
                  options={[
                    { label: '需要', value: true },
                    { label: '不需要', value: false }
                  ]}
                />
              )}
            </Form.Item>
            <Form.Item label="批复情况" {...formItemLayoutlong}>
              {getFieldDecorator('isReply', {})(
                <Checkbox.Group
                  options={[
                    { label: '已批复', value: true },
                    { label: '未批复', value: false }
                  ]}
                />
              )}
            </Form.Item>
            <Form.Item label="立项级别" {...formItemLayoutlong}>
              {getFieldDecorator('ProjectLevel', { initialValue: [] })(
                <Checkbox.Group options={this.getDictList('立项级别')} />
              )}
            </Form.Item>
            <Form.Item label="项目类别" {...formItemLayout}>
              {getFieldDecorator('ProjectCate', { initialValue: [] })(
                <Checkbox.Group options={this.getDictList('项目类别')} />
              )}
            </Form.Item>
            <Form.Item label="项目性质" {...formItemLayoutlong}>
              {getFieldDecorator('ProjectNat', { initialValue: [] })(
                <Checkbox.Group options={this.getDictList('项目性质')} />
              )}
            </Form.Item>
            <Form.Item label="建设状态" {...formItemLayoutlong}>
              {getFieldDecorator('ProjectStatus', { initialValue: [] })(
                <Checkbox.Group options={this.getDictList('建设状态')} />
              )}
            </Form.Item>
            <Form.Item label="有无红线" {...formItemLayoutlong}>
              {getFieldDecorator('HasScopes', {})(
                <Checkbox.Group
                  options={['有红线', '无红线']}
                  onChange={v => {
                    this.setState({ showVecType: v.indexOf('有红线') > -1 });
                  }}
                />
              )}
            </Form.Item>
            <Form.Item
              label="矢量化类型"
              {...formItemLayoutlong}
              style={{ display: showVecType ? 'block' : 'none' }}
            >
              {getFieldDecorator('VecType', { initialValue: [] })(
                <Checkbox.Group options={this.getDictList('矢量化类型')} />
              )}
            </Form.Item>
            <Form.Item label="有无扰动图斑" {...formItemLayoutlong}>
              {getFieldDecorator('HasSpot', {})(
                <Checkbox.Group options={['有图斑', '无图斑']} />
              )}
            </Form.Item>
            <Form.Item
              label="数据源"
              {...formItemLayoutlong}
              style={{ display: isProjectSupervise ? 'block' : 'none' }}
            >
              {getFieldDecorator('isShared', {})(
                <Checkbox.Group options={['共享', '独有']} />
              )}
            </Form.Item>
            <Form.Item label="显示数据" {...formItemLayoutlong}>
              {getFieldDecorator('ProjectShowArchive', {
                valuePropName: 'checked',
                initialValue: false
              })(
                <Switch
                  checkedChildren="归档数据"
                  unCheckedChildren="现状数据"
                />
              )}
            </Form.Item>
            <Form.Item
              label="回收站数据"
              {...formItemLayoutlong}
              style={{ display: isProjectSupervise ? 'block' : 'none' }}
            >
              {getFieldDecorator('isRecycleBin', {
                valuePropName: 'checked',
                initialValue: false
              })(<Switch checkedChildren="是" unCheckedChildren="否" />)}
            </Form.Item>
          </Form>
        </div>
        <div
          style={{
            display: type === 'project' ? 'none' : 'block',
            padding: '60px 0 10px 0',
            overflow: 'auto',
            height: '100%'
          }}
        >
          <Form>
            <Form.Item label="所在地区" {...formItemLayout}>
              {getFieldDecorator('SpotDistrictCodes', { initialValue: '' })(
                <Cascader
                  options={districtTreeFilter}
                  changeOnSelect
                  placeholder=""
                />
              )}
            </Form.Item>
            <Form.Item label="扰动合规性" {...formItemLayout}>
              {getFieldDecorator('InterferenceCompliance', {
                initialValue: []
              })(
                <Select mode="multiple" style={{ width: '100%' }}>
                  {this.getDictList('扰动合规性').map(item => (
                    <Select.Option key={item}>{item}</Select.Option>
                  ))}
                </Select>
              )}
            </Form.Item>
            <Form.Item label="扰动面积" {...formItemLayoutlong}>
              {getFieldDecorator('InterferenceAreaMin', {})(
                <InputNumber min={0} />
              )}
              <Input
                style={{
                  width: 30,
                  borderLeft: 0,
                  pointerEvents: 'none',
                  backgroundColor: '#fff'
                }}
                placeholder="-"
                disabled
              />
              {getFieldDecorator('InterferenceAreaMax', {})(
                <InputNumber min={0} />
              )}
            </Form.Item>
            <Form.Item label="扰动超出面积" {...formItemLayoutlong}>
              {getFieldDecorator('OverAreaOfResMin', {})(
                <InputNumber min={0} />
              )}
              <Input
                style={{
                  width: 30,
                  borderLeft: 0,
                  pointerEvents: 'none',
                  backgroundColor: '#fff'
                }}
                placeholder="-"
                disabled
              />
              {getFieldDecorator('OverAreaOfResMax', {})(
                <InputNumber min={0} />
              )}
            </Form.Item>
            <Form.Item label="解译期次" {...formItemLayout}>
              <Input.Group compact>
                {getFieldDecorator('interBatch1', {})(
                  <Select style={{ width: 80 }}>
                    {yearList.map(i => (
                      <Select.Option value={String(i)} key={i}>
                        {i}
                      </Select.Option>
                    ))}
                  </Select>
                )}
                {getFieldDecorator('interBatch2', {})(
                  <Select style={{ width: 80 }}>
                    {[
                      '01',
                      '02',
                      '03',
                      '04',
                      '05',
                      '06',
                      '07',
                      '08',
                      '09',
                      '10',
                      '11',
                      '12'
                    ].map(i => (
                      <Select.Option value={i} key={i}>
                        {i}
                      </Select.Option>
                    ))}
                  </Select>
                )}
              </Input.Group>
            </Form.Item>
            <Form.Item label="扰动类型" {...formItemLayoutlong}>
              {getFieldDecorator('InterferenceType', { initialValue: [] })(
                <Checkbox.Group options={this.getDictList('扰动类型')} />
              )}
            </Form.Item>
            <Form.Item label="扰动变化类型" {...formItemLayoutlong}>
              {getFieldDecorator('InterferenceVaryType', { initialValue: [] })(
                <Checkbox.Group options={this.getDictList('扰动变化类型')} />
              )}
            </Form.Item>
            <Form.Item label="建设状态" {...formItemLayoutlong}>
              {getFieldDecorator('BuildStatus', { initialValue: [] })(
                <Checkbox.Group options={this.getDictList('建设状态')} />
              )}
            </Form.Item>
            <Form.Item label="是否复核" {...formItemLayoutlong}>
              {getFieldDecorator('IsReview', {
                initialValue: []
              })(
                <Checkbox.Group
                  options={[
                    { label: '是', value: true },
                    { label: '否', value: false }
                  ]}
                />
              )}
            </Form.Item>
            <Form.Item label="显示数据" {...formItemLayoutlong}>
              {getFieldDecorator('SpotShowArchive', {
                valuePropName: 'checked',
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
