import React, { PureComponent } from "react";
import { Table, Button, Input, Icon, LocaleProvider, Switch } from "antd";
import zhCN from "antd/lib/locale-provider/zh_CN";
import SiderMenu from "../../../components/SiderMenu";
import Highlighter from "react-highlight-words";
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
    const rowSelection = {};
    const data = [
      {
        entry_name: "广东",
        construction_unit: "广州建设单位",
        approval_number: "423",
        approval_organ: "广州批复机构",
        supervision_unit: "广州监管单位",
        red_line: "666",
        perturbation_plot: "666",
        related_counties: "666",
        address: "666",
        coordinate: "666",
        approval_time: "534654326",
        status: "已提交",
        approval_level: "部级",
        project_type: "公路工程",
        project_category: "建设类",
        project_nature: "新建",
        construct_state: "未开工",
        compliance: "合规"
      },
      {
        entry_name: "北京",
        construction_unit: "广州建设单位",
        approval_number: "41234",
        approval_time: "42315235",
        approval_organ: "广州批复机构",
        supervision_unit: "广州监管单位",
        red_line: "666",
        perturbation_plot: "666",
        related_counties: "666",
        address: "666",
        coordinate: "666",
        status: "已提交",
        approval_level: "省级",
        project_type: "铁路工程",
        project_category: "生产类",
        project_nature: "扩建",
        construct_state: "停工",
        compliance: "疑似未批先建"
      },
      {
        entry_name: "上海",
        construction_unit: "广州建设单位",
        approval_number: "976",
        approval_time: "2015325320",
        approval_organ: "海外批复机构",
        supervision_unit: "海外监管单位",
        red_line: "666",
        perturbation_plot: "666",
        related_counties: "666",
        address: "666",
        coordinate: "666",
        status: "已提交",
        approval_level: "市级",
        project_type: "涉水交通工程",
        project_category: "建设类",
        project_nature: "续建",
        construct_state: "施工",
        compliance: "未批先建"
      },
      {
        entry_name: "新建铁路广州至香港专线",
        construction_unit: "广州建设单位",
        approval_number: "643576",
        approval_time: "201921",
        approval_organ: "上海批复机构",
        supervision_unit: "上海监管单位",
        red_line: "666",
        perturbation_plot: "666",
        related_counties: "666",
        address: "666",
        coordinate: "666",
        status: "已提交",
        approval_level: "县级",
        project_type: "机场工程",
        project_category: "生产类",
        project_nature: "改建",
        construct_state: "完工",
        compliance: "疑似超出防治责任范围"
      },
      {
        entry_name: "111",
        construction_unit: "广州建设单位",
        approval_number: "5436",
        approval_time: "2019501",
        approval_organ: "北京批复机构",
        supervision_unit: "北京监管单位",
        red_line: "666",
        perturbation_plot: "666",
        related_counties: "666",
        address: "666",
        coordinate: "666",
        status: "已提交",
        approval_level: "部级",
        project_type: "火电工程",
        project_category: "建设类",
        project_nature: "新建",
        construct_state: "已验收",
        compliance: "超出防治责任范围"
      }
    ];
    const columns = [
      {
        title: "项目名称",
        dataIndex: "entry_name",
        key: "entry_name",
        fixed: "left",
        width: 120,
        ...this.getColumnSearchProps("entry_name")
      },
      {
        title: "建设单位",
        dataIndex: "construction_unit",
        key: "construction_unit",
        fixed: "left",
        width: 120,
        ...this.getColumnSearchProps("construction_unit")
      },
      {
        title: "批复机构",
        dataIndex: "approval_organ",
        key: "approval_organ",
        fixed: "left",
        width: 120,
        ...this.getColumnSearchProps("approval_organ")
      },
      {
        title: "操作",
        dataIndex: "entry_name",
        key: "entry_name",
        fixed: "left",
        width: 120
      },
      {
        title: "监管单位",
        dataIndex: "supervision_unit",
        key: "supervision_unit",
        width: 120,
        ...this.getColumnSearchProps("supervision_unit")
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
        dataIndex: "approval_number",
        key: "approval_number",
        width: 120,
        sorter: (a, b) => a.approval_number.length - b.approval_number.length
      },
      {
        title: "批复时间",
        dataIndex: "approval_time",
        key: "approval_time",
        width: 120,
        sorter: (a, b) => a.approval_time.length - b.approval_time.length
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
        onFilter: (value, record) =>
          record.project_category.indexOf(value) === 0
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
        dataIndex: "red_line",
        key: "red_line",
        width: 120,
        sorter: (a, b) => a.red_line.length - b.red_line.length
      },
      {
        title: "扰动图斑",
        dataIndex: "perturbation_plot",
        key: "perturbation_plot",
        width: 120,
        sorter: (a, b) =>
          a.perturbation_plot.length - b.perturbation_plot.length
      },
      {
        title: "涉及县",
        dataIndex: "related_counties",
        key: "related_counties",
        width: 120,
        sorter: (a, b) => a.related_counties.length - b.related_counties.length
      },
      {
        title: "地址",
        dataIndex: "address",
        key: "address",
        width: 120,
        sorter: (a, b) => a.address.length - b.address.length
      },
      {
        title: "坐标",
        dataIndex: "coordinate",
        key: "coordinate",
        width: 120,
        sorter: (a, b) => a.coordinate.length - b.coordinate.length
      }
    ];

    return (
      <div>
        <SiderMenu active="301" />
        <LocaleProvider locale={zhCN}>
          <div aaa="111" style={{ padding: "80px 30px 30px 30px" }}>
            {/* <div style={{ textAlign: "right", padding: "15px 25px" }}>
              <Switch checkedChildren="当前项目" unCheckedChildren="归档项目" />
              <Button style={{ marginLeft: 20 }}>重置</Button>
              <Button icon="shopping" style={{ marginLeft: 20 }}>
                工具箱
              </Button>
              <Button icon="desktop" style={{ marginLeft: 20 }}>
                控制台
              </Button>
            </div> */}
            <Table
              rowSelection={rowSelection}
              columns={columns}
              dataSource={data}
              onChange={this.handleChange}
              scroll={{ x: "2200px" }}
              style={{ padding: 20 }}
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
