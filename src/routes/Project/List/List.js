import React, { PureComponent } from 'react';
import { createForm } from 'rc-form';
import { connect } from 'dva';
import { Table, Button, Input, Icon, Layout, Radio, Checkbox, Tag } from 'antd';
// import Highlighter from 'react-highlight-words';
import config from '../../../config';
import Layouts from '../../../components/Layouts';
import Add from './Add';

const { Content } = Layout;

@connect(({ projectSupervise }) => ({
  projectSupervise
}))
@createForm()
export default class projectSupervision extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      filteredInfo: null,
      sortedInfo: null,
      searchText: '',
      pagination: {
        showQuickJumper: true,
        showSizeChanger: true,
        pageSizeOptions: ['10', '20', '30', '40', '50']
      },
      loading: false,
      dataSource: [],
      showAdd: false,
      IsShared: true,
      IsExclusive: true,
      ProjectShowArchive: false,
      isRecycleBin: false
    };
  }

  componentDidMount() {
    this.refresh();
  }

  refresh = () => {
    this.projectDataList({ SkipCount: 0, MaxResultCount: 10 });
  };

  projectDataList = params => {
    const { dispatch } = this.props;
    const {
      IsShared,
      IsExclusive,
      ProjectShowArchive,
      isRecycleBin
    } = this.state;
    this.setState({ loading: true });
    dispatch({
      type: 'projectSupervise/projectDataList',
      payload: {
        ...params,
        IsShared,
        IsExclusive,
        ProjectShowArchive,
        isRecycleBin
      },
      callback: (success, result) => {
        const pagination = { ...this.state.pagination };
        pagination.total = result.totalCount;
        this.setState({
          loading: false,
          dataSource: result.items,
          pagination
        });
      }
    });
  };

  projectSuperviseDelete = payload => {
    const { dispatch } = this.props;
    this.setState({ loading: true });
    dispatch({
      type: 'projectSupervise/projectSuperviseDelete',
      payload,
      callback: (success, result) => {
        this.setState({ loading: false });
        if (success) {
          this.refresh();
        }
      }
    });
  };

  handleTableChange = (pagination, filters, sorter) => {
    console.log(pagination, filters, sorter);
    const Sorting = `${
      sorter.columnKey
        ? `${sorter.columnKey === 'name' ? 'userName' : sorter.columnKey} ${
            sorter.order === 'descend' ? 'desc' : 'asc'
          }`
        : ``
    }`;
    this.setState({
      pagination: pagination
    });
    this.projectDataList({
      SkipCount: (pagination.current - 1) * pagination.pageSize,
      MaxResultCount: pagination.pageSize,
      Sorting
    });
  };

  clearFilters = () => {
    this.setState({ filteredInfo: null });
  };

  clearAll = () => {
    this.setState({
      filteredInfo: null,
      sortedInfo: null
    });
  };

  setAgeSort = () => {
    this.setState({
      sortedInfo: {
        order: 'descend',
        columnKey: 'age'
      }
    });
  };

  getColumnSearchProps = dataIndex => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters
    }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={node => {
            this.searchInput = node;
          }}
          // placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={e =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => this.handleSearch(selectedKeys, confirm)}
          style={{ width: 188, marginBottom: 8, display: 'block' }}
        />
        <Button
          type="primary"
          onClick={() => this.handleSearch(selectedKeys, confirm)}
          icon="search"
          size="small"
          style={{ width: 90, marginRight: 8 }}
        >
          确定
        </Button>
        <Button
          onClick={() => this.handleReset(clearFilters)}
          size="small"
          style={{ width: 90 }}
        >
          重置
        </Button>
      </div>
    ),
    filterIcon: filtered => (
      <Icon type="search" style={{ color: filtered ? '#1890ff' : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex]
        .toString()
        .toLowerCase()
        .includes(value.toLowerCase()),
    onFilterDropdownVisibleChange: visible => {
      if (visible) {
        setTimeout(() => this.searchInput.select());
      }
    }
    // render: text => (
    //   <Highlighter
    //     highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
    //     searchWords={[this.state.searchText]}
    //     autoEscape
    //     textToHighlight={text.toString()}
    //   />
    // )
  });

  handleSearch = (selectedKeys, confirm) => {
    confirm();
    this.setState({ searchText: selectedKeys[0] });
  };

  handleReset = clearFilters => {
    clearFilters();
    this.setState({ searchText: '' });
  };

  render() {
    const {
      dataSource,
      pagination,
      loading,
      showAdd,
      isRecycleBin
    } = this.state;

    const rowSelection = {};

    const columns = [
      {
        title: '项目名称',
        dataIndex: 'projectName',
        key: 'projectName',
        fixed: 'left',
        width: 420,
        ...this.getColumnSearchProps('projectName'),
        render: i => <a>{i}</a>
      },
      {
        title: '建设单位',
        dataIndex: 'productDepartmentName',
        key: 'productDepartmentName',
        // fixed: 'left',
        width: 300,
        ...this.getColumnSearchProps('productDepartmentName')
      },
      {
        title: '批复机构',
        dataIndex: 'replyDepartmentName',
        key: 'replyDepartmentName',
        // fixed: 'left',
        width: 120,
        ...this.getColumnSearchProps('replyDepartmentName')
      },
      {
        title: '监管单位',
        dataIndex: 'supervision_unit',
        key: 'supervision_unit',
        width: 120,
        ...this.getColumnSearchProps('supervision_unit')
      },
      {
        title: '立项级别',
        dataIndex: 'approval_level',
        width: 120,
        filters: config.approval_level.map(item => {
          return {
            text: item,
            value: item
          };
        }),
        onFilter: (value, record) => record.approval_level.indexOf(value) === 0
      },
      {
        title: '批复文号',
        dataIndex: 'approval_number',
        key: 'approval_number',
        width: 120,
        sorter: (a, b) => a.approval_number.length - b.approval_number.length
      },
      {
        title: '批复时间',
        dataIndex: 'approval_time',
        key: 'approval_time',
        width: 120,
        sorter: (a, b) => a.approval_time.length - b.approval_time.length
      },
      {
        title: '项目合规性',
        dataIndex: 'compliance',
        key: 'compliance',
        width: 130,
        filters: config.compliance.map(item => {
          return {
            text: item,
            value: item
          };
        }),
        onFilter: (value, record) => record.compliance.indexOf(value) === 0
      },
      {
        title: '项目类型',
        dataIndex: 'project_type',
        key: 'project_type',
        width: 120,
        filters: config.project_type.map(item => {
          return {
            text: item,
            value: item
          };
        }),
        onFilter: (value, record) => record.project_type.indexOf(value) === 0
      },
      {
        title: '项目类别',
        dataIndex: 'project_category',
        key: 'project_category',
        width: 120,
        filters: config.project_category.map(item => {
          return {
            text: item,
            value: item
          };
        }),
        onFilter: (value, record) =>
          record.project_category.indexOf(value) === 0
      },
      {
        title: '项目性质',
        dataIndex: 'project_nature',
        key: 'project_nature',
        width: 120,
        filters: config.project_nature.map(item => {
          return {
            text: item,
            value: item
          };
        }),
        onFilter: (value, record) => record.project_nature.indexOf(value) === 0
      },
      {
        title: '建设状态',
        dataIndex: 'construct_state',
        key: 'construct_state',
        width: 120,
        filters: config.construct_state.map(item => {
          return {
            text: item,
            value: item
          };
        }),
        onFilter: (value, record) => record.construct_state.indexOf(value) === 0
      },
      {
        title: '红线数据',
        dataIndex: 'red_line',
        key: 'red_line',
        width: 120,
        sorter: (a, b) => a.red_line.length - b.red_line.length
      },
      {
        title: '扰动图斑',
        dataIndex: 'perturbation_plot',
        key: 'perturbation_plot',
        width: 120,
        sorter: (a, b) =>
          a.perturbation_plot.length - b.perturbation_plot.length
      },
      {
        title: '涉及县',
        dataIndex: 'related_counties',
        key: 'related_counties',
        width: 120,
        sorter: (a, b) => a.related_counties.length - b.related_counties.length
      },
      {
        title: '地址',
        dataIndex: 'address',
        key: 'address',
        width: 120,
        sorter: (a, b) => a.address.length - b.address.length
      },
      {
        title: '坐标',
        dataIndex: 'coordinate',
        key: 'coordinate',
        width: 120,
        sorter: (a, b) => a.coordinate.length - b.coordinate.length
      },
      {
        title: '项目源',
        dataIndex: 'isShared',
        key: 'isShared',
        fixed: 'right',
        width: 50,
        render: i => (
          <Tag color={i ? 'volcano' : 'cyan'}> {i ? '共享' : '独有'}</Tag>
        )
      },
      {
        title: '操作',
        dataIndex: 'entry_name',
        key: 'entry_name',
        fixed: 'right',
        width: 130,
        render: (i, record) =>
          record.isShared ? (
            <span>
              <a style={{ margin: 10 }} onClick={() => {}}>
                移除
              </a>
            </span>
          ) : (
            <span>
              <a
                style={{ margin: 10 }}
                onClick={() => this.projectSuperviseDelete(record.id)}
              >
                删除
              </a>
              <a style={{ margin: 10 }}>共享</a>
            </span>
          )
      }
    ];

    return (
      <Layouts avtive="projectSupervision">
        <Layout style={{ margin: 20, backgroundColor: '#fff' }}>
          <Add
            show={showAdd}
            hide={success => {
              this.setState({ showAdd: false });
              if (success) {
                this.refresh();
              }
            }}
            onThis={v => (this.add = v)}
          ></Add>
          <Content
            style={{ backgroundColor: '#fff', padding: '30px 30px 20px 30px' }}
          >
            <span>
              <Button icon="download">共享导入</Button>
              <Button
                icon="plus"
                style={{ marginLeft: 20 }}
                onClick={() => {
                  this.setState({ showAdd: true });
                  this.add.reset();
                }}
              >
                新建项目
              </Button>
            </span>
            <span style={{ float: 'right' }}>
              <span style={{ marginRight: 30 }}>
                数据源：
                <Checkbox.Group
                  options={['共享', '独有']}
                  defaultValue={['共享', '独有']}
                  onChange={v => {
                    console.log(v);
                    this.setState({
                      IsShared: v.indexOf('共享') !== -1,
                      IsExclusive: v.indexOf('独有') !== -1
                    });
                    setTimeout(() => this.refresh(), 100);
                  }}
                />
              </span>
              <Radio.Group
                defaultValue={false}
                buttonStyle="solid"
                onChange={v => {
                  console.log(v.target.value);
                  this.setState({
                    ProjectShowArchive: v.target.value
                  });
                  setTimeout(() => this.refresh(), 100);
                }}
              >
                <Radio.Button value={false}>当前项目</Radio.Button>
                <Radio.Button value={true}>归档项目</Radio.Button>
              </Radio.Group>
              <Button
                type={isRecycleBin ? `primary` : ``}
                icon="delete"
                style={{ marginLeft: 20 }}
                onClick={() => {
                  this.setState({ isRecycleBin: !isRecycleBin });
                  setTimeout(() => this.refresh(), 100);
                }}
              >
                回收站
              </Button>
              <Button icon="reload" style={{ marginLeft: 20 }}>
                重置
              </Button>
              <Button icon="shopping" style={{ marginLeft: 20 }}>
                工具箱
              </Button>
              <Button icon="desktop" style={{ marginLeft: 20 }}>
                控制台
              </Button>
            </span>
          </Content>
          <Content>
            <Table
              columns={columns}
              dataSource={dataSource}
              rowSelection={rowSelection}
              rowKey={record => record.id}
              onChange={this.handleTableChange}
              pagination={pagination}
              loading={loading}
              scroll={{ x: 2800 }}
              style={{ padding: 20 }}
            />
          </Content>
        </Layout>
      </Layouts>
    );
  }
}