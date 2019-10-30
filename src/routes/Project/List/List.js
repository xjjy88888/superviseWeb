import React, { PureComponent } from 'react';
import { createForm } from 'rc-form';
import { connect } from 'dva';
import {
  Table,
  Button,
  Input,
  Icon,
  Layout,
  Radio,
  Checkbox,
  Tag,
  Modal
} from 'antd';
import Layouts from '../../../components/Layouts';
import { Link } from 'dva/router';

const { Content } = Layout;
let self;

@connect(({ projectSupervise, project, user, district }) => ({
  projectSupervise,
  project,
  user,
  district
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
      IsShared: true,
      IsExclusive: true,
      ProjectShowArchive: false,
      isRecycleBin: false,
      isImport: false,
      selectedRows: []
    };
  }

  componentDidMount() {
    self = this;
    this.refresh();
    this.queryDict();
    this.districtTree();
  }

  refresh = () => {
    this.projectSuperviseList({ SkipCount: 0, MaxResultCount: 10 });
  };

  projectSuperviseList = params => {
    const { dispatch } = this.props;
    const {
      IsShared,
      IsExclusive,
      ProjectShowArchive,
      isRecycleBin,
      isImport
    } = this.state;
    this.setState({ loading: true });
    dispatch({
      type: 'projectSupervise/projectSuperviseList',
      payload: {
        ...params,
        IsShared,
        IsExclusive,
        ProjectShowArchive,
        isRecycleBin,
        isImport,
        isRegulationShared: isImport
      },
      callback: (success, result) => {
        const pagination = { ...this.state.pagination };
        pagination.total = result.totalCount;
        this.setState({
          loading: false,
          dataSource: result.items.map(i => {
            return {
              ...i,
              productDepartmentName: i.productDepartmentName || ``,
              replyDepartmentName: i.replyDepartmentName || ``,
              supDepartmentName: i.supDepartmentName || ``,
              replyNum: i.replyNum || ``
            };
          }),
          pagination
        });
      }
    });
  };

  queryDict = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'user/queryDict'
    });
  };

  districtTree = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'district/districtTree',
      payload: {
        IsFilter: false
      }
    });
  };

  projectSuperviseModels = (url, payload) => {
    const { dispatch } = this.props;
    this.setState({ loading: true });
    dispatch({
      type: 'projectSupervise/' + url,
      payload,
      callback: (success, result) => {
        this.setState({ loading: false });
        if (success) {
          this.refresh();
          this.setState({ selectedRows: [] });
        }
      }
    });
  };

  handleTableChange = (pagination, filters, sorter) => {
    console.log(pagination, filters, sorter);
    this.setState({
      pagination: pagination
    });
    this.projectSuperviseList({
      SkipCount: (pagination.current - 1) * pagination.pageSize,
      MaxResultCount: pagination.pageSize,
      ProjectLevel: filters.projectLevelId || [],
      Compliance: filters.complianceId || [],
      ProjectType: filters.projectTypeId || [],
      ProjectCate: filters.projectCateId || [],
      ProjectNat: filters.projectNatId || [],
      ProjectStatus: filters.projectStatusId || [],
      projectName:
        filters.projectName && filters.projectName.length
          ? filters.projectName[0]
          : ``,
      productDepartment:
        filters.productDepartmentName && filters.productDepartmentName.length
          ? filters.productDepartmentName[0]
          : ``,
      replyDepartment:
        filters.replyDepartmentName && filters.replyDepartmentName.length
          ? filters.replyDepartmentName[0]
          : ``,
      supDepartment:
        filters.supDepartmentName && filters.supDepartmentName.length
          ? filters.supDepartmentName[0]
          : ``,
      replyNum:
        filters.replyNum && filters.replyNum.length ? filters.replyNum[0] : ``
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
  });

  handleSearch = (selectedKeys, confirm) => {
    confirm();
    this.setState({ searchText: selectedKeys[0] });
  };

  handleReset = clearFilters => {
    clearFilters();
    this.setState({ searchText: '' });
  };

  getDictLabel = id => {
    const {
      user: { dicList }
    } = this.props;
    let result = ``;
    if (id) {
      const filter = dicList.filter(item => item.id === id);
      result = filter.map(item => item.dictTableValue).join(',');
    }
    return result;
  };

  getDictList = type => {
    const {
      user: { dicList }
    } = this.props;
    const filter = dicList.filter(item => item.dictTypeName === type);
    const result = filter.map(i => {
      return {
        text: i.dictTableValue,
        value: i.dictTableValue
      };
    });
    return result;
  };

  getDistrictLabel = ids => {
    const {
      district: { districtList }
    } = this.props;
    let result = ``;
    const arr = ids ? ids.split(`,`) : [];
    if (arr.length) {
      const filter = districtList.filter(item => arr.indexOf(item.id) !== -1);
      result = filter.map(item => item.name).join(',');
    }
    return result;
  };

  render() {
    const {
      dataSource,
      pagination,
      loading,
      isRecycleBin,
      isImport,
      selectedRows,
      ProjectShowArchive
    } = this.state;

    const rowSelection = {
      onChange: (selectedRowKeys, selectedRows) => {
        console.log(selectedRowKeys, selectedRows);
        this.setState({ selectedRows: selectedRowKeys });
      }
    };

    const columns = [
      {
        title: '项目名称',
        dataIndex: 'projectName',
        key: 'projectName',
        fixed: 'left',
        width: 430,
        ...this.getColumnSearchProps('projectName'),
        render: (i, item) => (
          <Link to={'/region?from=project&id=' + item.id}>
            <a>{i}</a>
          </Link>
        )
      },
      {
        title: '建设单位',
        dataIndex: 'productDepartmentName',
        key: 'productDepartmentName',
        width: 300,
        ...this.getColumnSearchProps('productDepartmentName')
      },
      {
        title: '批复机构',
        dataIndex: 'replyDepartmentName',
        key: 'replyDepartmentName',
        width: 120,
        ...this.getColumnSearchProps('replyDepartmentName')
      },
      {
        title: '监管单位',
        dataIndex: 'supDepartmentName',
        key: 'supDepartmentName',
        width: 120,
        ...this.getColumnSearchProps('supDepartmentName')
      },
      {
        title: '批复文号',
        dataIndex: 'replyNum',
        key: 'replyNum',
        width: 200,
        ...this.getColumnSearchProps('replyNum')
      },
      {
        title: '批复时间',
        dataIndex: 'replyTime',
        key: 'replyTime',
        width: 120
      },
      {
        title: '立项级别',
        dataIndex: 'projectLevelId',
        key: 'projectLevelId',
        width: 120,
        filters: this.getDictList(`立项级别`),
        render: i => this.getDictLabel(i)
      },
      {
        title: '扰动合规性',
        dataIndex: 'complianceId',
        key: 'complianceId',
        width: 150,
        filters: this.getDictList(`扰动合规性`),
        render: i => this.getDictLabel(i)
      },
      {
        title: '项目类型',
        dataIndex: 'projectTypeId',
        key: 'projectTypeId',
        width: 130,
        filters: this.getDictList(`项目类型`),
        render: i => this.getDictLabel(i)
      },
      {
        title: '项目类别',
        dataIndex: 'projectCateId',
        key: 'projectCateId',
        width: 120,
        filters: this.getDictList(`项目类别`),
        render: i => this.getDictLabel(i)
      },
      {
        title: '项目性质',
        dataIndex: 'projectNatId',
        key: 'projectNatId',
        width: 120,
        filters: this.getDictList(`项目性质`),
        render: i => this.getDictLabel(i)
      },
      {
        title: '建设状态',
        dataIndex: 'projectStatusId',
        key: 'projectStatusId',
        width: 120,
        filters: this.getDictList(`建设状态`),
        render: i => this.getDictLabel(i)
      },
      {
        title: '涉及县',
        dataIndex: 'districtCodes',
        key: 'districtCodes',
        width: 240,
        render: i => {
          const text = this.getDistrictLabel(i);
          return (
            <span title={text}>
              {text.slice(0, 11)}
              {text.length > 11 ? `...` : ``}
            </span>
          );
        }
      },
      {
        title: '地址',
        dataIndex: 'addressInfo',
        key: 'addressInfo',
        width: 120
      },
      {
        title: '坐标',
        dataIndex: 'coordinate',
        key: 'coordinate',
        width: 260,
        render: (i, item) =>
          item.pointX &&
          item.pointY &&
          item.pointX !== `0` &&
          item.pointY !== `0`
            ? item.pointX + `，` + item.pointY
            : ``
      },
      {
        title: '检查记录',
        dataIndex: 'monitorCheckNum',
        key: 'monitorCheckNum',
        width: 100,
        render: (i, item) => (
          <Link to={'/region?from=project&id=' + item.id}>
            <a>{i}</a>
          </Link>
        )
      },
      !isImport
        ? {
            title: '项目源',
            dataIndex: 'isShared',
            fixed: 'right',
            width: 50,
            render: i => (
              <Tag color={i ? 'volcano' : 'cyan'}> {i ? '共享' : '独有'}</Tag>
            )
          }
        : {},
      !isImport
        ? {
            title: '操作',
            dataIndex: 'entry_name',
            key: 'entry_name',
            fixed: 'right',
            width: isRecycleBin ? 200 : 150,
            render: (i, record) => {
              const text = isRecycleBin
                ? `永久删除`
                : record.isShared
                ? `移除`
                : `删除`;
              return (
                <span>
                  {record.isShared || isRecycleBin ? null : (
                    <a
                      style={{ margin: 8 }}
                      onClick={() => {
                        Modal.confirm({
                          title: `共享`,
                          content: `是否确定要共享吗？`,
                          okText: '是',
                          cancelText: '否',
                          okType: 'danger',
                          onOk() {
                            self.projectSuperviseModels(
                              `projectShare`,
                              record.id
                            );
                          }
                        });
                      }}
                    >
                      共享
                    </a>
                  )}
                  {isRecycleBin ? (
                    <a
                      style={{ margin: 8 }}
                      onClick={() => {
                        Modal.confirm({
                          title: `恢复`,
                          content: `是否确定要恢复吗？`,
                          okText: '是',
                          cancelText: '否',
                          okType: 'danger',
                          onOk() {
                            self.projectSuperviseModels(
                              `projectSuperviseCancelDelete`,
                              [record.id]
                            );
                          }
                        });
                      }}
                    >
                      恢复
                    </a>
                  ) : null}
                  <a
                    style={{ margin: 8 }}
                    onClick={() => {
                      Modal.confirm({
                        title: text,
                        content: `是否确定要${text}吗？`,
                        okText: '是',
                        cancelText: '否',
                        okType: 'danger',
                        onOk() {
                          if (isRecycleBin) {
                            self.projectSuperviseModels(
                              `projectSuperviseForeverDelete`,
                              [record.id]
                            );
                          } else {
                            self.projectSuperviseModels(
                              `projectSuperviseDelete`,
                              record.id
                            );
                          }
                        }
                      });
                    }}
                  >
                    {text}
                  </a>
                </span>
              );
            }
          }
        : {}
    ];

    return (
      <Layouts avtive="projectSupervision">
        <Layout style={{ margin: 20, backgroundColor: '#fff' }}>
          <Content
            style={{ backgroundColor: '#fff', padding: '30px 30px 20px 30px' }}
          >
            <span>
              <Link to="/region?from=project&isProject=true">
                <Icon
                  type="menu-fold"
                  style={{
                    fontSize: 20,
                    color: '#1890ff',
                    marginRight: 20
                  }}
                />
              </Link>
              <Button
                type={isImport ? `primary` : ``}
                icon="download"
                onClick={() => {
                  this.setState({ isImport: !isImport, isRecycleBin: false });
                  setTimeout(() => this.refresh(), 100);
                }}
              >
                共享导入
              </Button>
              <Button
                style={{
                  display: isImport ? 'inline' : 'none',
                  marginLeft: 30
                }}
                disabled={!selectedRows.length}
                icon="check"
                onClick={() => {
                  Modal.confirm({
                    title: `导入`,
                    content: `是否确定要导入吗？`,
                    okText: '是',
                    cancelText: '否',
                    okType: 'danger',
                    onOk() {
                      self.projectSuperviseModels(
                        `projectImport`,
                        selectedRows
                      );
                    }
                  });
                }}
              >
                确定导入
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
                defaultValue={ProjectShowArchive}
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
                  this.setState({
                    isRecycleBin: !isRecycleBin,
                    isImport: false
                  });
                  setTimeout(() => this.refresh(), 100);
                }}
              >
                回收站
              </Button>
              <Button
                icon="reload"
                style={{ marginLeft: 20 }}
                onClick={() => {
                  window.location.reload(false);
                }}
              >
                重置
              </Button>
            </span>
          </Content>
          <Content>
            <Table
              columns={columns}
              dataSource={dataSource}
              rowSelection={isImport ? rowSelection : null}
              rowKey={record => record.id}
              onChange={this.handleTableChange}
              pagination={pagination}
              loading={loading}
              scroll={{ x: 3000 }}
              style={{ padding: 20 }}
            />
          </Content>
        </Layout>
      </Layouts>
    );
  }
}
