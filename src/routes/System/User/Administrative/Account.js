import React, { PureComponent } from "react";
import {
  Icon,
  Input,
  Button,
  Table,
  message,
  Tree,
  Typography,
  Layout,
  Modal
} from "antd";
import Highlighter from "react-highlight-words";
import emitter from "../../../../utils/event";
import Register from "../../../../components/Register";
import Systems from "../../../../components/Systems";

const { Title } = Typography;
const { Header, Footer, Sider, Content } = Layout;

const data = [
  {
    key: "1",
    name: "水利部",
    nickname: "水利部办事员",
    phone: "135 6666 9999",
    address: "广东省广州市天河区"
  },
  {
    key: "2",
    name: "水利部",
    nickname: "水利部办事员",
    phone: "135 6666 9999",
    address: "广东省广州市天河区"
  },
  {
    key: "3",
    name: "水利部",
    nickname: "水利部办事员",
    phone: "135 6666 9999",
    address: "广东省广州市天河区"
  },
  {
    key: "4",
    name: "水利部",
    nickname: "水利部办事员",
    phone: "135 6666 9999",
    address: "广东省广州市天河区"
  },
  {
    key: "5",
    name: "水利部",
    nickname: "水利部办事员",
    phone: "135 6666 9999",
    address: "广东省广州市天河区"
  },
  {
    key: "6",
    name: "水利部",
    nickname: "水利部办事员",
    phone: "135 6666 9999",
    address: "广东省广州市天河区"
  },
  {
    key: "7",
    name: "水利部",
    nickname: "水利部办事员",
    phone: "135 6666 9999",
    address: "广东省广州市天河区"
  },
  {
    key: "8",
    name: "水利部",
    nickname: "水利部办事员",
    phone: "135 6666 9999",
    address: "广东省广州市天河区"
  },
  {
    key: "9",
    name: "水利部",
    nickname: "水利部办事员",
    phone: "135 6666 9999",
    address: "广东省广州市天河区"
  },
  {
    key: "10",
    name: "水利部",
    nickname: "水利部办事员",
    phone: "135 6666 9999",
    address: "广东省广州市天河区"
  },
  {
    key: "11",
    name: "水利部",
    nickname: "水利部办事员",
    phone: "135 6666 9999",
    address: "广东省广州市天河区"
  },
  {
    key: "12",
    name: "水利部",
    nickname: "水利部办事员",
    phone: "135 6666 9999",
    address: "广东省广州市天河区"
  },
  {
    key: "13",
    name: "水利部",
    nickname: "水利部办事员",
    phone: "135 6666 9999",
    address: "广东省广州市天河区"
  },
  {
    key: "14",
    name: "水利部",
    nickname: "水利部办事员",
    phone: "135 6666 9999",
    address: "广东省广州市天河区"
  },
  {
    key: "15",
    name: "水利部",
    nickname: "水利部办事员",
    phone: "135 6666 9999",
    address: "广东省广州市天河区"
  },
  {
    key: "16",
    name: "水利部",
    nickname: "水利部办事员",
    phone: "135 6666 9999",
    address: "广东省广州市天河区"
  },
  {
    key: "17",
    name: "水利部",
    nickname: "水利部办事员",
    phone: "135 6666 9999",
    address: "广东省广州市天河区"
  },
  {
    key: "18",
    name: "水利部",
    nickname: "水利部办事员",
    phone: "135 6666 9999",
    address: "广东省广州市天河区"
  },
  {
    key: "19",
    name: "水利部",
    nickname: "水利部办事员",
    phone: "135 6666 9999",
    address: "广东省广州市天河区"
  },
  {
    key: "20",
    name: "水利部",
    nickname: "水利部办事员",
    phone: "135 6666 9999",
    address: "广东省广州市天河区"
  },
  {
    key: "21",
    name: "水利部",
    nickname: "水利部办事员",
    phone: "135 6666 9999",
    address: "广东省广州市天河区"
  }
];

export default class account extends PureComponent {
  state = {
    state: 0,
    selectedRows: []
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
          style={{ width: 188, marginBottom: 8, display: "block" }}
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
      <Icon type="search" style={{ color: filtered ? "#1890ff" : undefined }} />
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
        highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
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
    this.setState({ searchText: "" });
  };

  render() {
    const { selectedRows } = this.state;

    const columns = [
      {
        title: "用户名称",
        dataIndex: "nickname",
        sorter: (a, b) => a.nickname.length - b.nickname.length,
        ...this.getColumnSearchProps("nickname")
      },
      {
        title: "登录名",
        dataIndex: "name",
        sorter: (a, b) => a.name.length - b.name.length,
        ...this.getColumnSearchProps("nickname")
      },
      {
        title: "联系电话",
        dataIndex: "phone",
        sorter: (a, b) => a.phone - b.phone,
        ...this.getColumnSearchProps("nickname")
      },
      {
        title: "住址",
        dataIndex: "address",
        sorter: (a, b) => a.address.length - b.address.length,
        ...this.getColumnSearchProps("nickname")
      },
      {
        title: "操作",
        key: "operation",
        render: (item, record) => (
          <span>
            <a
              style={{ marginRight: 20 }}
              onClick={() => {
                emitter.emit("showRegister", {
                  show: true
                });
              }}
            >
              修改
            </a>
            <a
              onClick={() => {
                Modal.confirm({
                  title: "删除",
                  content: "你是否确定要删除",
                  okText: "是",
                  cancelText: "否",
                  okType: "danger",
                  onOk() {
                    message.success(`删除1个账号成功`);
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
        <Register />
        <Layout>
          <Sider width={300} theme="light">
            <Title level={4}>部门</Title>
            <Tree.DirectoryTree
              multiple
              defaultExpandAll
              onSelect={(keys, event) => {
                console.log("Trigger Select", keys, event);
              }}
            >
              <Tree.TreeNode title="中华人民共和国水利部" key="0-0">
                <Tree.TreeNode title="贵州省水利厅" key="0-0-0">
                  <Tree.TreeNode
                    title="贵阳市水务管理局"
                    key="0-0-0-0"
                    isLeaf
                  />
                  <Tree.TreeNode title="遵义市水务局" key="0-0-0-1" isLeaf />
                  <Tree.TreeNode title="毕节市水务局" key="0-0-0-2" isLeaf />
                </Tree.TreeNode>
                <Tree.TreeNode title="广东省水利厅" key="0-0-1">
                  <Tree.TreeNode title="广州市水务局" key="0-0-1-0" isLeaf />
                </Tree.TreeNode>
                <Tree.TreeNode title="广西壮族自治区水利厅" key="0-0-2">
                  <Tree.TreeNode title="南宁市水务局" key="0-0-2-0" isLeaf />
                  <Tree.TreeNode title="北海市水务局" key="0-0-2-1" isLeaf />
                </Tree.TreeNode>
              </Tree.TreeNode>
            </Tree.DirectoryTree>
          </Sider>
          <Content
            style={{
              background: "#fff"
            }}
          >
            <Title level={4}>
              用户
              <span style={{ float: "right" }}>
                <Button
                  icon="plus"
                  style={{ margin: 10 }}
                  onClick={() => {
                    emitter.emit("showRegister", {
                      show: true
                    });
                  }}
                >
                  添加
                </Button>
                <Button
                  icon="delete"
                  disabled={!selectedRows.length}
                  style={{ marginLeft: 10 }}
                  onClick={() => {
                    const l = selectedRows.length;
                    if (l === 0) {
                      message.warning("请选择需要删除的账号");
                      return;
                    }
                    Modal.confirm({
                      title: "删除",
                      content: "你是否确定要删除",
                      okText: "是",
                      cancelText: "否",
                      okType: "danger",
                      onOk() {
                        message.success(`删除${l}个账号成功`);
                      },
                      onCancel() {}
                    });
                  }}
                >
                  删除
                </Button>
              </span>
            </Title>
            <Table
              columns={columns}
              dataSource={data}
              rowSelection={rowSelection}
            />
          </Content>
        </Layout>
      </Systems>
    );
  }
}
