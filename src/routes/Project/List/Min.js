/* eslint-disable array-callback-return */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { createForm } from 'rc-form';
import jQuery from 'jquery';
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
  Layout
} from 'antd';
import locale from 'antd/lib/date-picker/locale/zh_CN';
import 'leaflet/dist/leaflet.css';
import emitter from '../../../utils/event';
import config from '../../../config';
import data from '../../../data';
import {
  dateInitFormat,
  accessToken,
  getFile,
  guid,
  unique
} from '../../../utils/util';
import Spins from '../../../components/Spins';

const { Header, Footer, Sider, Content } = Layout;
const sortList = [
  {
    value: '名称',
    key: 'ProjectBase.Name'
  },
  {
    value: '操作时间',
    key: 'ProjectBase.ModifyTime'
  },
  {
    value: '立项级别',
    key: 'ProjectLevel.Key'
  }
];

@connect(({ projectSupervise }) => ({
  projectSupervise
}))
@createForm()
export default class listMin extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      show: true
    };
  }

  componentDidMount() {
    this.projectDataList({ SkipCount: 0, MaxResultCount: 10 });
    // this.eventEmitter = emitter.addListener(`showListMin`, v => {
    //   console.log(`showListMin`, v);
    //   if (v.projectId) {
    //   }
    // });
  }

  projectDataList = params => {
    const { dispatch } = this.props;
    this.setState({ loading: true });
    dispatch({
      type: 'projectSupervise/projectDataList',
      payload: { ...params, IsActive: true, UserType: 1 },
      callback: (success, result) => {
        this.setState({ loading: false });
      }
    });
  };

  render() {
    const {
      form: { resetFields },
      projectSupervise: { projectDataList }
    } = this.props;

    const {
      show,
      sort_key,
      sort_by,
      queryInfo,
      query_pro,
      loading,
      clientHeight,
      key
    } = this.state;

    const dataSourceTable = projectDataList.items.map((item, index) => {
      return {
        ...item,
        key: index
      };
    });

    const columnsTable = [
      {
        title: (
          <span>
            共有
            {projectDataList.items.length}/{projectDataList.totalCount}条
          </span>
        ),
        dataIndex: 'name',
        render: (v, item) => (
          <span>
            <p>
              <span
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  this.setState({ clickId: item.id });
                  resetFields();
                  //编辑
                  if (key === 'project') {
                    this.setState({
                      showProjectDetail: true,
                      projectEdit: false,
                      isProjectUpdate: true,
                      previewVisible_min_left: false,
                      projectFileList: []
                    });
                    this.queryProjectById(item.id);
                    this.queryProjectInfo(item.id);
                  } else {
                    emitter.emit('showSiderbarDetail', {
                      show: key !== 'project',
                      from: key,
                      id: item.id,
                      edit: false,
                      fromList: true,
                      type: 'edit'
                    });
                  }
                  emitter.emit('showTool', {
                    show: false
                  });
                  emitter.emit('showQuery', {
                    show: false
                  });
                }}
              >
                <b>{item.projectName}</b>
              </span>
              {/* 定位 */}
              <Icon
                type="environment"
                style={{
                  float: 'right',
                  fontSize: 18,
                  cursor: 'point',
                  color: '#1890ff'
                }}
                onClick={e => {
                  e.stopPropagation();
                  emitter.emit('mapLocation', {
                    item: item,
                    key: key
                  });
                }}
              />
            </p>
            <span>建设单位： {item.productDepartmentName || ''}</span>
            <br />
            <span>批复机构： {item.replyDepartmentName || ''}</span>
          </span>
        )
      }
    ];

    return (
      <Layout
        id="projectListMin"
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          zIndex: 1000,
          width: 350,
          height: '100%',
          paddingTop: 46,
          backgroundColor: '#fff'
        }}
        ref={e => (this.projectListMin = e)}
      >
        <Icon
          type={show ? 'left' : 'right'}
          style={{
            fontSize: 30,
            position: 'absolute',
            right: -50,
            top: '48%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            borderRadius: '50%',
            padding: 10,
            cursor: 'pointer'
          }}
          onClick={() => {
            this.setState({
              show: !show
            });
            console.log(show);
            jQuery('#projectListMin').animate({
              left: show ? -350 : 0 + 'px'
            });
          }}
        />
        <Content>
          <Spins show={loading} />
          <Input.Search
            allowClear
            placeholder={`请输入项目名查询`}
            onSearch={v => {
              this.search(v);
            }}
            style={{ padding: '20px 20px', width: 300 }}
            enterButton
          />
          <Button.Group buttonstyle="solid" style={{ padding: '0px 15px' }}>
            {sortList.map((item, index) => (
              <Button
                style={{
                  userSelect: 'none',
                  border: 'rgb(217, 217, 217) 1px solid',
                  color: sort_key === item.key && sort_by ? '#fff' : '#000',
                  backgroundColor:
                    sort_key === item.key && sort_by ? '#1890ff' : '#fff'
                }}
                key={item.key}
                value={item.key}
                onClick={() => {
                  const by =
                    item.key === sort_key && sort_by && sort_by === 'Desc'
                      ? 'Asc'
                      : 'Desc';
                  const Sorting_new = `${item.key} ${by}`;
                  this.setState({
                    sort_key: item.key,
                    sort_by: by,
                    Sorting: Sorting_new
                  });
                  this.scrollDom.scrollTop = 0;
                  this.setState({
                    row_pro: 10
                  });
                  this.queryProject({
                    ...queryInfo,
                    Sorting: Sorting_new,
                    SkipCount: 0,
                    ProjectName: query_pro
                  });
                }}
              >
                {item.value}
                <Icon
                  type={sort_by === 'Desc' ? 'caret-down' : 'caret-up'}
                  style={{
                    display:
                      sort_key === item.key && sort_by ? 'inherit  ' : 'none',
                    fontSize: 5
                  }}
                />
              </Button>
            ))}
          </Button.Group>
          <div
            ref={e => (this.scrollDom = e)}
            style={{
              overflow: 'auto',
              height: clientHeight ? clientHeight - 202 : 500,
              width: 350
            }}
          >
            <Table
              columns={columnsTable}
              dataSource={dataSourceTable}
              pagination={false}
            />
          </div>
        </Content>
      </Layout>
    );
  }
}
