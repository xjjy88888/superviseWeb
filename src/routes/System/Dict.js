import React, { PureComponent } from 'react';
import { connect } from 'dva';
import {
  Form,
  Icon,
  Input,
  Button,
  Table,
  message,
  Modal,
  Tabs,
  Select,
  notification
} from 'antd';
import { createForm } from 'rc-form';
import Systems from '../../components/Systems';
import Highlighter from 'react-highlight-words';
let self;

@createForm()
@connect(({ dict }) => ({ dict }))
export default class dict extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      state: 0,
      visibleType: false,
      visibleData: false,
      selectedRowsType: [],
      selectedRowsData: [],
      id: null,
      selectDefaultValue: null,
      isEdit: false
    };
  }

  componentDidMount() {
    self = this;
    this.dictTypeList();
  }

  dictTypeList = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'dict/dictTypeList',
      callback: (success, error, result) => {
        if (success && result.items) {
          this.dictDataList(result.items[0].id);
          this.setState({ selectDefaultValue: result.items[0].id });
        }
      }
    });
  };

  dictDataList = id => {
    const { dispatch } = this.props;
    dispatch({ type: 'dict/dictDataList', payload: id || '' });
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

  render() {
    const {
      dispatch,
      form: { getFieldDecorator, resetFields },
      dict: { dictTypeList, dictDataList }
    } = this.props;

    const {
      visibleType,
      visibleData,
      selectedRowsType,
      selectedRowsData,
      id,
      selectDefaultValue,
      isEdit
    } = this.state;

    const dataSourceType = dictTypeList.items.map(item => {
      return { ...item, key: item.id };
    });

    const dataSourceData = dictDataList.items.map(item => {
      return { ...item, key: item.id };
    });

    const columnsType = [
      {
        title: '分组名称',
        dataIndex: 'dictTypeName',
        ...this.getColumnSearchProps('dictTypeName')
      },
      {
        title: '分组编码',
        dataIndex: 'dictTypeKey',
        ...this.getColumnSearchProps('dictTypeKey')
      },
      {
        title: '分组描述',
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
                this.props.form.setFieldsValue({
                  dictTypeName: record.dictTypeName,
                  dictTypeKey: record.dictTypeKey,
                  description: record.description
                });
                this.setState({
                  visibleType: true,
                  id: record.id
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
                    dispatch({
                      type: 'dict/dictTypeDelete',
                      payload: record.id,
                      callback: (success, error, result) => {
                        if (success) {
                          self.setState({
                            visibleType: false
                          });
                          self.dictTypeList();
                        }
                        notification[success ? 'success' : 'error']({
                          message: `删除1条字典类型${
                            success ? '成功' : '失败'
                          }${success ? '' : `：${error.message}`}`
                        });
                      }
                    });
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
    const columnsData = [
      {
        title: '字典名称',
        dataIndex: 'dictTableValue',
        ...this.getColumnSearchProps('dictTableValue')
      },
      {
        title: '字典编码',
        dataIndex: 'dictTableKey',
        ...this.getColumnSearchProps('dictTableKey')
      },
      {
        title: '字典分组',
        dataIndex: 'dictTypeName',
        ...this.getColumnSearchProps('dictTypeName')
      },
      {
        title: '字典描述',
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
                this.props.form.setFieldsValue({
                  dictTypeId: record.dictTypeId,
                  dictTableValue: record.dictTableValue,
                  dictTableKey: record.dictTableKey,
                  description: record.description
                });
                this.setState({
                  visibleData: true,
                  id: record.id,
                  isEdit: true
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
                    dispatch({
                      type: 'dict/dictDataDelete',
                      payload: record.id,
                      callback: (success, error, result) => {
                        if (success) {
                          self.setState({
                            visibleType: false
                          });
                          self.dictDataList(selectDefaultValue);
                        }
                        notification[success ? 'success' : 'error']({
                          message: `删除1条字典数据${
                            success ? '成功' : '失败'
                          }${success ? '' : `：${error.message}`}`
                        });
                      }
                    });
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

    const rowSelectionType = {
      onChange: (selectedRowKeys, selectedRows) => {
        console.log(selectedRows);
        this.setState({ selectedRowsType: selectedRows });
      }
    };
    const rowSelectionData = {
      onChange: (selectedRowKeys, selectedRows) => {
        console.log(selectedRows);
        this.setState({ selectedRowsData: selectedRows });
      }
    };

    return (
      <Systems>
        <Tabs defaultActiveKey="1">
          <Tabs.TabPane tab="字典分组" key="1">
            <span>
              <Button
                icon="plus"
                style={{ margin: 10 }}
                onClick={() => {
                  resetFields();
                  this.setState({
                    visibleType: true,
                    id: null
                  });
                }}
              >
                新建
              </Button>
              <Button
                icon="delete"
                disabled={!selectedRowsType.length}
                style={{ margin: 10 }}
                onClick={() => {
                  const l = selectedRowsType.length;
                  if (l === 0) {
                    message.warning('请选择需要删除的字典类型');
                    return;
                  }
                  Modal.confirm({
                    title: '删除',
                    content: '是否确定要删除',
                    okText: '是',
                    cancelText: '否',
                    okType: 'danger',
                    onOk() {
                      dispatch({
                        type: 'dict/dictTypeDeleteMul',
                        payload: { id: selectedRowsType.map(item => item.id) },
                        callback: (success, error, result) => {
                          if (success) {
                            self.setState({
                              visibleType: false,
                              selectedRowsType: []
                            });
                            self.dictTypeList();
                          }
                          notification[success ? 'success' : 'error']({
                            message: `删除${l}条字典类型${
                              success ? '成功' : '失败'
                            }${success ? '' : `：${error.message}`}`
                          });
                        }
                      });
                    },
                    onCancel() {}
                  });
                }}
              >
                删除
              </Button>
            </span>
            <Table
              columns={columnsType}
              dataSource={dataSourceType}
              rowSelection={rowSelectionType}
            />
            <Modal
              title="新建字典分组"
              visible={visibleType}
              onOk={() => {
                this.props.form.validateFields((err, v) => {
                  console.log('新建字典类型', v);
                  if (!v.dictTypeName) {
                    message.warning('请填写分组名称');
                    return;
                  }
                  if (!v.dictTypeKey) {
                    message.warning('请填写分组编码');
                    return;
                  }
                  dispatch({
                    type: 'dict/dictTypeCreateUpdate',
                    payload: { ...v, id: id },
                    callback: (success, error, result) => {
                      if (success) {
                        this.setState({
                          visibleType: false
                        });
                        notification['success']({
                          message: `${id ? '编辑' : '新建'}字典类型成功`
                        });
                        this.dictTypeList();
                      } else {
                        notification['error']({
                          message: `${id ? '编辑' : '新建'}字典类型失败：${
                            error.message
                          }`
                        });
                      }
                    }
                  });
                });
              }}
              onCancel={() => {
                this.setState({
                  visibleType: false
                });
              }}
            >
              <Form
                onSubmit={this.handleSubmit}
                layout="inline"
                style={{ textAlign: 'center' }}
              >
                <Form.Item
                  label={
                    <span>
                      <b style={{ color: 'red' }}>*</b>分组名称
                    </span>
                  }
                  hasFeedback
                >
                  {getFieldDecorator('dictTypeName', {})(<Input />)}
                </Form.Item>
                <Form.Item
                  label={
                    <span>
                      <b style={{ color: 'red' }}>*</b>分组编码
                    </span>
                  }
                  hasFeedback
                >
                  {getFieldDecorator('dictTypeKey', {})(<Input />)}
                </Form.Item>
                <Form.Item
                  label={
                    <span>
                      <b style={{ color: '#fff' }}>*</b>分组描述
                    </span>
                  }
                  hasFeedback
                >
                  {getFieldDecorator('description', {})(
                    <Input.TextArea autosize style={{ width: 180 }} />
                  )}
                </Form.Item>
              </Form>
            </Modal>
          </Tabs.TabPane>
          <Tabs.TabPane tab="字典数据" key="2">
            <Select
              showSearch
              allowClear
              value={selectDefaultValue}
              optionFilterProp="children"
              style={{ width: 200, margin: 10 }}
              onChange={v => {
                this.dictDataList(v || '');
                this.setState({ selectDefaultValue: v });
              }}
            >
              {dataSourceType.map((item, index) => (
                <Select.Option value={item.id} key={index}>
                  {item.dictTypeName}
                </Select.Option>
              ))}
            </Select>
            <span>
              <Button
                icon="plus"
                style={{ margin: 10 }}
                onClick={() => {
                  resetFields();
                  this.setState({
                    visibleData: true,
                    id: null,
                    isEdit: false
                  });
                }}
              >
                新建
              </Button>
              <Button
                icon="delete"
                disabled={!selectedRowsData.length}
                style={{ margin: 10 }}
                onClick={() => {
                  const l = selectedRowsData.length;
                  if (l === 0) {
                    message.warning('请选择需要删除的数组字典');
                    return;
                  }
                  Modal.confirm({
                    title: '删除',
                    content: '是否确定要删除',
                    okText: '是',
                    cancelText: '否',
                    okType: 'danger',
                    onOk() {
                      dispatch({
                        type: 'dict/dictDataDeleteMul',
                        payload: { id: selectedRowsData.map(item => item.id) },
                        callback: (success, error, result) => {
                          if (success) {
                            self.setState({
                              visibleType: false,
                              selectedRowsData: []
                            });
                            self.dictDataList(selectDefaultValue);
                          }
                          notification[success ? 'success' : 'error']({
                            message: `删除${l}条字典数据${
                              success ? '成功' : '失败'
                            }${success ? '' : `：${error.message}`}`
                          });
                        }
                      });
                    },
                    onCancel() {}
                  });
                }}
              >
                删除
              </Button>
            </span>
            <Table
              columns={columnsData}
              dataSource={dataSourceData}
              rowSelection={rowSelectionData}
            />

            <Modal
              title="新建字典数据"
              visible={visibleData}
              onOk={() => {
                this.props.form.validateFields((err, v) => {
                  console.log('新建数组字典', v);
                  if (!v.dictTypeId) {
                    message.warning('请选择分组名称');
                    return;
                  }
                  if (!v.dictTableValue) {
                    message.warning('请填写字典名称');
                    return;
                  }
                  if (!v.dictTableKey) {
                    message.warning('请填写字典编码');
                    return;
                  }
                  dispatch({
                    type: 'dict/dictDataCreateUpdate',
                    payload: { ...v, id: id },
                    callback: (success, error, result) => {
                      if (success) {
                        this.setState({
                          visibleData: false
                        });
                        notification['success']({
                          message: `${id ? '编辑' : '新建'}字典数据成功`
                        });
                        this.dictDataList(selectDefaultValue);
                      } else {
                        notification['error']({
                          message: `${id ? '编辑' : '新建'}字典数据失败：${
                            error.message
                          }`
                        });
                      }
                    }
                  });
                });
              }}
              onCancel={() => {
                this.dictDataList(selectDefaultValue);
                this.setState({
                  visibleData: false
                });
              }}
            >
              <Form
                onSubmit={this.handleSubmit}
                layout="inline"
                style={{ textAlign: 'center' }}
              >
                <Form.Item
                  label={
                    <span>
                      <b style={{ color: 'red' }}>*</b>分组名称
                    </span>
                  }
                  hasFeedback
                >
                  {getFieldDecorator('dictTypeId', {
                    initialValue: selectDefaultValue
                  })(
                    <Select
                      showSearch
                      allowClear
                      optionFilterProp="children"
                      disabled={isEdit}
                      style={{ width: 180 }}
                      onChange={v => {
                        this.setState({ selectDefaultValue: v });
                      }}
                    >
                      {dataSourceType.map((item, index) => (
                        <Select.Option value={item.id} key={index}>
                          {item.dictTypeName}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
                <Form.Item
                  label={
                    <span>
                      <b style={{ color: 'red' }}>*</b>字典名称
                    </span>
                  }
                  hasFeedback
                >
                  {getFieldDecorator('dictTableValue', {})(<Input />)}
                </Form.Item>
                <Form.Item
                  label={
                    <span>
                      <b style={{ color: 'red' }}>*</b>字典编码
                    </span>
                  }
                  hasFeedback
                >
                  {getFieldDecorator('dictTableKey', {})(<Input />)}
                </Form.Item>
                <Form.Item
                  label={
                    <span>
                      <b style={{ color: '#fff' }}>*</b>字典描述
                    </span>
                  }
                  hasFeedback
                >
                  {getFieldDecorator('description', {})(
                    <Input.TextArea autosize style={{ width: 180 }} />
                  )}
                </Form.Item>
              </Form>
            </Modal>
          </Tabs.TabPane>
        </Tabs>
      </Systems>
    );
  }
}
