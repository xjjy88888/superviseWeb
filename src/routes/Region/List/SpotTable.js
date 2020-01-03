import React, { PureComponent } from "react";
import { connect } from "dva";
import jQuery from "jquery";
import { Button, Table, Input, Icon, Tooltip } from "antd";

import styles from "./style/ProjectList.less";

@connect(({ spot, commonModel }) => ({
  ...spot,
  ...commonModel
}))
export default class SpotListTable extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      tableHeight: document.body.scrollHeight,
      searchText: "",
      pagination: {
        showQuickJumper: true,
        showSizeChanger: true,
        defaultPageSize: 20,
        pageSizeOptions: ["20", "30", "40", "50"],
        total: "",
        showTotal: total => {
          return `共 ${total} 条`;
        }
      },
      filterObj: {},
      Sorting: "",
      selectedRows: []
    };
  }
  onWindowResize = () => {
    this.setState({
      // tableWidth: document.body.scrollWidth,
      tableHeight: document.body.scrollHeight
    });
  };
  componentDidMount() {
    window.addEventListener("resize", this.onWindowResize);
    this.getSpotTableList({ MaxResultCount: 20 });
  }
  // 获取图斑列表
  getSpotTableList = parmas => {
    const { dispatch } = this.props;
    dispatch({
      type: "spot/getSpotTableList",
      payload: parmas
    });
  };

  // 清除过滤条件
  clearFilters = () => {
    this.setState({ filteredInfo: null });
  };

  clearAll = () => {
    this.setState({
      filteredInfo: null,
      sortedInfo: null
    });
  };

  // 重置
  handleReset = clearFilters => {
    clearFilters();
    this.setState({ searchText: "" });
  };
  // 条件筛选
  handleSearch = (selectedKeys, confirm) => {
    confirm();
    this.setState({ searchText: selectedKeys[0] });
  };
  // 表格筛选内容变化时触发
  handleTableChange = (pagination, filters, sorter) => {
    // console.log(pagination);

    let Sorting = ``;
    if (sorter.columnKey) {
      Sorting =
        sorter.columnKey + (sorter.order === "descend" ? " desc" : " asc");
    }
    // console.log(Sorting, sorter);

    let filterObj = {
      Sorting,
      SkipCount: (pagination.current - 1) * pagination.pageSize,
      MaxResultCount: pagination.pageSize
    };
    this.getSpotTableList(filterObj);
    this.setState({
      pagination,
      filterObj,
      Sorting
    });
  };
  // 表头过滤筛选
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
    onFilter: (value, record) => {
      return (
        record[dataIndex] &&
        record[dataIndex]
          .toString()
          .toLowerCase()
          .includes(value.toLowerCase())
      );
    },
    onFilterDropdownVisibleChange: visible => {
      if (visible) {
        setTimeout(() => this.searchInput.select());
      }
    }
  });
  componentWillUnmount() {
    window.removeEventListener("resize", this.onWindowResize);
  }
  // 前往图斑详情页面
  gotoSpotDetail = (val, e) => {
    e.preventDefault();
    const { dispatch, siderBarPageInfo } = this.props;
    dispatch({
      type: "commonModel/save",
      payload: {
        siderBarPageInfo: { ...siderBarPageInfo, currentSpotId: val }
      }
    });
    jQuery("#ProjectList").css({ left: 750 });
    console.log(val);
  };
  render() {
    const {
      spotTableList,
      siderBarPageInfo: { currentSpotId }
    } = this.props;
    const { tableHeight, pagination } = this.state;
    // console.log(tableHeight);
    let tableY =
      tableHeight >= 1100
        ? "30vh"
        : tableHeight >= 1000 && tableHeight < 1100
        ? "33vh"
        : tableHeight >= 900 && tableHeight < 1000
        ? "36vh"
        : tableHeight >= 800 && tableHeight < 900
        ? "40vh"
        : tableHeight >= 750 && tableHeight < 800
        ? "43vh"
        : tableHeight >= 700 && tableHeight < 750
        ? "45vh"
        : tableHeight >= 650 && tableHeight < 700
        ? "48vh"
        : tableHeight >= 600 && tableHeight < 650
        ? "50vh"
        : "53vh";
    // console.log(tableY);
    const columns = [
      {
        title: "图斑编号",
        dataIndex: "mapNum",
        key: "mapNum",
        width: 180,
        fixed: "left",
        sorter: true,
        ...this.getColumnSearchProps("mapNum"),
        render: (text, record) => (
          <a
            href="#"
            onClick={this.gotoSpotDetail.bind(this, record.id)}
            style={{ color: currentSpotId === record.id && "green" }}
          >
            {text}
          </a>
        )
      },
      {
        title: "复核状态",
        dataIndex: "isReview",
        key: "isReview",
        width: 100,
        fixed: "left",
        filters: [
          {
            text: "已复核",
            value: "true"
          },
          {
            text: "未复核",
            value: "false"
          }
        ]
      },
      {
        title: "重点监管",
        dataIndex: "isFocus",
        key: "isFocus",
        width: 180
        // fixed: "left",
        // sorter: true,
        // ...this.getColumnSearchProps("isFocus")
      },

      {
        title: "关联项目",
        dataIndex: "projectName",
        key: "projectName",
        width: 180,
        ...this.getColumnSearchProps("projectName")
      },

      {
        title: "项目监管单位",
        dataIndex: "supDepartmentName",
        key: "supDepartmentName",
        width: 100
        // sorter: true
        // render: () => 1
      },
      {
        title: "照片数量",
        dataIndex: "photoCount",
        key: "photoCount",
        width: 100
        // sorter: true
        // render: () => 1
      },
      {
        title: "涉及县",
        dataIndex: "districtCodes",
        key: "districtCodes",
        width: 220
      },
      {
        title: "扰动合规性",
        dataIndex: "interferenceComplianceValue",
        key: "interferenceComplianceValue",
        width: 200
      },
      // {
      //   title: "扰动类型",
      //   dataIndex: "interferenceTypeId",
      //   key: "interferenceTypeId",
      //   width: 200
      // },
      {
        title: "扰动变化类型",
        dataIndex: "interferenceVaryTypeValue	",
        key: "interferenceVaryTypeValue	",
        width: 200
      },
      {
        title: "扰动面积",
        dataIndex: "interferenceArea",
        key: "interferenceArea",
        width: 200
      },
      {
        title: "超出防治责任范围面积（ha）",
        dataIndex: "overAreaOfRes",
        key: "overAreaOfRes",
        width: 200
      },
      {
        title: "建设状态",
        dataIndex: "buildStatusValue",
        key: "buildStatusValue",
        width: 200
      },
      {
        title: "土壤侵蚀强度",
        dataIndex: "soilErosionIntensity",
        key: "soilErosionIntensity",
        width: 200
      },
      {
        title: "创建时间",
        dataIndex: "creationTime",
        key: "creationTime",
        width: 200
      },
      {
        title: "修改时间",
        dataIndex: "lastModificationTime",
        key: "lastModificationTime",
        width: 200
      },
      {
        title: "问题",
        dataIndex: "problem",
        key: "problem",
        width: 200
      },
      {
        title: "建议",
        dataIndex: "proposal",
        key: "proposal",
        width: 200
      },
      {
        title: "备注",
        dataIndex: "description",
        key: "description",
        width: 200,
        fixed: "right"
      }
    ];
    const rowSelection = {
      onChange: (selectedRowKeys, selectedRows) => {
        console.log(selectedRowKeys, selectedRows);
        this.setState({ selectedRows: selectedRowKeys });
      }
    };
    return (
      <Table
        id="spotTable"
        size="middle"
        rowSelection={rowSelection}
        rowKey={record => record.id}
        onChange={this.handleTableChange}
        pagination={pagination}
        dataSource={
          (spotTableList && spotTableList.items && spotTableList.items) || []
        }
        columns={columns}
        scroll={{
          x: 3320,
          y: `calc(100vh - ${tableY})`
        }}
      />
    );
  }
}
