import React, { PureComponent } from "react";
import { Table, Button, Input, Icon, LocaleProvider } from "antd";
import zhCN from "antd/lib/locale-provider/zh_CN";
import SiderMenu from "../../../components/SiderMenu";
import Highlighter from "react-highlight-words";
import styles from "./index.less";
import config from "../../../config";

export default class projectRegulatory extends PureComponent {
  state = {
    filteredInfo: null,
    sortedInfo: null,
    searchText: ""
  };
  handleChange = (pagination, filters, sorter) => {
    console.log("sort", pagination, filters, sorter);
    this.setState({
      filteredInfo: filters,
      sortedInfo: sorter
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
        order: "descend",
        columnKey: "age"
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
          style={{ width: 188, marginBottom: 8, display: "block" }}
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
    let { sortedInfo, filteredInfo } = this.state;
    const rowSelection = {};
    const data = [
      {
        r_name: "111",
        status: "已提交",
        approval_level: "部级",
        project_type: "公路工程",
        project_category: "建设类",
        project_nature: "新建",
        construct_state: "未开工",
        compliance: "合规"
      },
      {
        r_name: "111",
        status: "已提交",
        approval_level: "省级",
        project_type: "铁路工程",
        project_category: "生产类",
        project_nature: "扩建",
        construct_state: "停工",
        compliance: "疑似未批先建"
      },
      {
        r_name: "111",
        status: "已提交",
        approval_level: "市级",
        project_type: "涉水交通工程",
        project_category: "建设类",
        project_nature: "续建",
        construct_state: "施工",
        compliance: "未批先建"
      },
      {
        r_name: "111",
        status: "已提交",
        approval_level: "县级",
        project_type: "机场工程",
        project_category: "生产类",
        project_nature: "改建",
        construct_state: "完工",
        compliance: "疑似超出防治责任范围"
      },
      {
        r_name: "111",
        status: "已提交",
        approval_level: "部级",
        project_type: "火电工程",
        project_category: "建设类",
        project_nature: "新建",
        construct_state: "已验收",
        compliance: "超出防治责任范围"
      },
    ];
    const columns = [
      {
        title: "项目名称",
        dataIndex: "r_name",
        key: "r_name",
        fixed: "left",
        width: 120,
        ...this.getColumnSearchProps("r_name")
      },
      {
        title: "建设单位",
        dataIndex: "r_name",
        key: "r_name",
        fixed: "left",
        width: 120,
        ...this.getColumnSearchProps("r_name")
      },
      {
        title: "批复机构",
        dataIndex: "r_name",
        key: "r_name",
        fixed: "left",
        width: 120,
        ...this.getColumnSearchProps("r_name")
      },
      {
        title: "操作",
        dataIndex: "r_name",
        key: "r_name",
        fixed: "left",
        width: 120
      },
      {
        title: "监管单位",
        dataIndex: "r_name",
        key: "r_name",
        width: 120,
        ...this.getColumnSearchProps("r_name")
      },
      {
        title: "立项级别",
        dataIndex: "approval_level",
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
        title: "批复文号",
        dataIndex: "name",
        key: "name",
        width: 120,
        sorter: (a, b) => a.name.length - b.name.length
      },
      {
        title: "批复时间",
        dataIndex: "r_munit",
        key: "r_munit",
        width: 120,
        sorter: (a, b) => a.name.length - b.name.length
      },
      {
        title: "项目合规性",
        dataIndex: "compliance",
        key: "compliance",
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
        title: "项目类型",
        dataIndex: "project_type",
        key: "project_type",
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
        title: "项目类别",
        dataIndex: "project_category",
        key: "project_category",
        width: 120,
        filters: config.project_category.map(item => {
          return {
            text: item,
            value: item
          };
        }),
        onFilter: (value, record) => record.project_category.indexOf(value) === 0
      },
      {
        title: "项目性质",
        dataIndex: "project_nature",
        key: "project_nature",
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
        title: "建设状态",
        dataIndex: "construct_state",
        key: "construct_state",
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
        title: "红线数据",
        dataIndex: "r_munit",
        key: "r_munit",
        width: 120,
        sorter: (a, b) => a.name.length - b.name.length
      },
      {
        title: "扰动图斑",
        dataIndex: "r_munit",
        key: "r_munit",
        width: 120,
        sorter: (a, b) => a.name.length - b.name.length
      },
      {
        title: "涉及县",
        dataIndex: "r_munit",
        key: "r_munit",
        width: 120,
        sorter: (a, b) => a.name.length - b.name.length
      },
      {
        title: "地址",
        dataIndex: "r_munit",
        key: "r_munit",
        width: 120,
        sorter: (a, b) => a.name.length - b.name.length
      },
      {
        title: "坐标",
        dataIndex: "r_munit",
        key: "r_munit",
        width: 120,
        sorter: (a, b) => a.name.length - b.name.length
      }
    ];

    return (
      <div>
        <SiderMenu active="301" />
        <LocaleProvider locale={zhCN}>
          <div aaa="111" style={{ padding: 30 }}>
            <Table
              rowSelection={rowSelection}
              columns={columns}
              dataSource={data}
              onChange={this.handleChange}
              scroll={{ x: "2200px" }}
              pagination={{
                showQuickJumper: true,
                showSizeChanger: true,
                pageSizeOptions: ["10", "20", "30", "40", "50"]
              }}
            />
          </div>
        </LocaleProvider>
      </div>
    );
  }
}
