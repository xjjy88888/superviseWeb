import React, { PureComponent } from 'react';
import { Icon, Input, Button, Table, message, Modal } from 'antd';
import { createForm } from 'rc-form';
import { connect } from 'dva';
import Systems from '../../../components/Systems';
import emitter from '../../../utils/event';
import Highlighter from 'react-highlight-words';

let self;

@createForm()
@connect(({ role }) => ({ role }))
export default class role extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      state: 0,
      visible: false,
      selectedRows: [],
      pagination: {},
      loading: false,
      dataSource: []
    };
  }

  componentDidMount() {
    self = this;
    this.refresh();
    this.powerList();

    this.eventEmitter = emitter.addListener('refreshSystem', v => {
      this.refresh();
    });
  }

  powerList = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'role/powerList',
      payload: {
        userType: '0'
      }
    });
  };

  getPowerLabel = value => {
    const {
      role: { powerList }
    } = this.props;
    const result = powerList.filter(item => item.name === value);
    return result.length ? result[0].displayName : '';
  };

  roleList = payload => {
    const { dispatch } = this.props;
    this.setState({ loading: true });
    dispatch({
      type: 'role/roleList',
      payload,
      callback: (success, error, result) => {
        const pagination = { ...this.state.pagination };
        pagination.total = result.totalCount;
        const dataSource = result.items.map((item, index) => {
          const permissions = item.permissions.map(item =>
            this.getPowerLabel(item.permission)
          );
          const power = permissions.filter(i => i !== '');
          return {
            ...item,
            key: index,
            power: power.join('，')
          };
        });
        this.setState({
          loading: false,
          dataSource,
          pagination
        });
      }
    });
  };

  refresh = () => {
    this.roleList({ SkipCount: 0, MaxResultCount: 10 });
  };

  handleTableChange = (pagination, filters, sorter) => {
    console.log(filters, sorter);
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
    this.roleList({
      SkipCount: (pagination.current - 1) * pagination.pageSize,
      MaxResultCount: pagination.pageSize,
      Sorting
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
          查询
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
    },
    render: text => (
      <Highlighter
        highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
        searchWords={[this.state.searchText]}
        autoEscape
        textToHighlight={text.toString()}
      />
    )
  });

  handleSearch = (selectedKeys, confirm) => {
    confirm();
    this.setState({ searchText: selectedKeys[0] });
  };

  handleReset = clearFilters => {
    clearFilters();
    this.setState({ searchText: '' });
  };

  roleDelete = v => {
    const { dispatch } = this.props;
    this.setState({ loading: true });
    dispatch({
      type: 'role/roleDelete',
      payload: { ids: v.map(i => i.id) },
      callback: success => {
        if (success) {
          this.setState({
            loading: false
          });
          this.refresh();
        }
      }
    });
  };

  render() {
    const { selectedRows, dataSource, pagination, loading } = this.state;

    const columns = [
      {
        title: '角色标识',
        dataIndex: 'name',
        sorter: (a, b) => a.name.length - b.name.length,
        ...this.getColumnSearchProps('name')
      },
      {
        title: '角色名',
        dataIndex: 'displayName',
        sorter: (a, b) => a.displayName.length - b.displayName.length,
        ...this.getColumnSearchProps('displayName')
      },
      {
        title: '权限',
        dataIndex: 'power'
      },
      {
        title: '描述',
        dataIndex: 'description'
      },
      {
        title: '操作',
        key: 'operation',
        render: (item, record) => (
          <span>
            <a
              style={{ marginRight: 20 }}
              onClick={() => {
                emitter.emit('showRegister', {
                  show: true,
                  type: 'role',
                  status: 'edit',
                  item
                });
              }}
            >
              编辑
            </a>
            <a
              onClick={() => {
                Modal.confirm({
                  title: '删除',
                  content: '是否确定要删除',
                  okText: '是',
                  cancelText: '否',
                  okType: 'danger',
                  onOk() {
                    self.roleDelete([{ id: item.id }]);
                  },
                  onCancel() {}
                });
              }}
            >
              删除
            </a>
          </span>
        )
      }
    ];

    const rowSelection = {
      onChange: (selectedRowKeys, selectedRows) => {
        console.log(selectedRows);
        this.setState({ selectedRows: selectedRows });
      }
    };

    return (
      <Systems>
        <span>
          <Button
            icon="plus"
            style={{ margin: 10 }}
            onClick={() => {
              emitter.emit('showRegister', {
                show: true,
                type: 'role',
                status: 'add',
                item: {}
              });
            }}
          >
            新建
          </Button>
          <Button
            icon="delete"
            disabled={!selectedRows.length}
            style={{ margin: 10 }}
            onClick={() => {
              const l = selectedRows.length;
              if (l === 0) {
                message.warning('请选择需要删除的角色');
                return;
              }
              Modal.confirm({
                title: '删除',
                content: '是否确定要删除',
                okText: '是',
                cancelText: '否',
                okType: 'danger',
                onOk() {
                  self.roleDelete(selectedRows);
                },
                onCancel() {}
              });
            }}
          >
            删除
          </Button>
        </span>
        <Table
          columns={columns}
          rowSelection={rowSelection}
          rowKey={record => record.id}
          dataSource={dataSource}
          pagination={pagination}
          loading={loading}
          onChange={this.handleTableChange}
        />
      </Systems>
    );
  }
}
