import React, { PureComponent } from "react";
import { connect } from "dva";
import jQuery from "jquery";
import { Button, Table, Input, Icon, Tooltip } from "antd";

import styles from "./style/ProjectList.less";

@connect(({ project, spot, district, user }) => ({
  ...project,
  ...spot,
  ...district,
  ...user
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
        pageSizeOptions: ["20", "30", "40", "50"]
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
  render() {
    const { spotTableList } = this.props;
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
        ...this.getColumnSearchProps("mapNum")
      },
      {
        title: "创建方式",
        dataIndex: "createType",
        key: "createType",
        width: 100,
        fixed: "left",
        sorter: true
        // render: () => 1
      },
      {
        // 点击出现列表面板
        title: "图斑历史",
        dataIndex: "spotReview",
        key: "spotReview",
        width: 100,
        fixed: "left",
        sorter: true
        // render: () => 1
      },
      {
        title: "所属项目",
        dataIndex: "projectId",
        key: "projectId",
        width: 180,
        fixed: "left",
        ...this.getColumnSearchProps("mapNum")
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
        title: "扰动合规性",
        dataIndex: "interferenceComplianceId",
        key: "interferenceComplianceId",
        width: 200
      },
      {
        title: "扰动类型",
        dataIndex: "interferenceTypeId",
        key: "interferenceTypeId",
        width: 200
      },
      {
        title: "扰动变化类型",
        dataIndex: "projectDepartmentId",
        key: "projectDepartmentId",
        width: 200
      },
      {
        title: "扰动面积",
        dataIndex: "interferenceArea",
        key: "interferenceArea",
        width: 200,
        ...this.getColumnSearchProps("interferenceArea")
      },
      {
        title: "超出防治责任范围面积（ha）",
        dataIndex: "overAreaOfRes",
        key: "overAreaOfRes",
        width: 200
      },
      {
        title: "解译批次",
        dataIndex: "interBatch",
        key: "interBatch",
        width: 200
      },
      {
        title: "任务级别",
        dataIndex: "taskLevel",
        key: "taskLevel",
        width: 200,
        render: () => 1
      },
      {
        title: "解译时间",
        dataIndex: "interTime",
        key: "interTime",
        width: 200
      },
      {
        title: "归档时间",
        dataIndex: "archiveTime",
        key: "archiveTime",
        width: 200
      },
      {
        title: "空间数据",
        dataIndex: "geom",
        key: "geom",
        width: 300,
        onCell: () => {
          return {
            style: {
              maxWidth: 260,
              overflow: "hidden",
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
              cursor: "pointer"
            }
          };
        },
        render: text => (
          <Tooltip placement="topLeft" title={text}>
            {text}
          </Tooltip>
        )
      },
      {
        title: "建设状态",
        dataIndex: "buildStatusId",
        key: "buildStatusId",
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
        title: "图斑所在省市县",
        dataIndex: "districtCodeId",
        key: "districtCodeId",
        width: 220
        // render: (v, record) => {
        //   const { district } = this.props;
        //   let districtValue = [];
        //   district &&
        //     district.length > 0 &&
        //     district.map(item => {
        //       const res = item.children.filter(it => it.value === v);
        //       if (res.length) {
        //         districtValue = item.label + "/" + res[0].label;
        //       } else {
        //         item.children.map(ite => {
        //           const res = ite.children.filter(it => it.value === v);
        //           if (res.length) {
        //             districtValue =
        //               item.label + "/" + ite.label + "/" + res[0].label;
        //           }
        //         });
        //       }
        //     });
        //   return districtValue;
        // }
      },

      {
        title: "详细地址",
        dataIndex: "addressInfo",
        key: "addressInfo",
        width: 200
        // sorter: (a, b) => a.age - b.age,
        // fixed: "left"
        // filters: [1, 2, 3, 1, 1, 1, 1, 1]
      },

      {
        title: "解译单位",
        dataIndex: "interpretationDepartmentId",
        key: "interpretationDepartmentId",
        width: 200
        // filters: [1, 2, 3, 1, 1, 1, 1, 1]
      },
      {
        title: "解译影像分辨率",
        dataIndex: "imgResolution",
        key: "imgResolution",
        width: 200
        // filters: [1, 2, 3, 1, 1, 1, 1, 1]
      },

      {
        title: "标记图斑是否结束",
        dataIndex: "isEnd",
        key: "isEnd",
        width: 200
      },

      {
        title: "未知项目简称",
        dataIndex: "unknownProjectShortName",
        key: "unknownProjectShortName",
        width: 200
      },
      {
        title: "未知项目所属行业",
        dataIndex: "unknownProjectIndustry",
        key: "unknownProjectIndustry",
        width: 200
      },
      {
        title: "未知项目所在地址",
        dataIndex: "unknownProjectAddress",
        key: "unknownProjectAddress",
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
        title={() => (
          <div>
            <Icon type="plus" />
            新增
          </div>
        )}
        dataSource={
          (spotTableList && spotTableList.items && spotTableList.items) || []
        }
        columns={columns}
        scroll={{
          x: 5200,
          y: `calc(100vh - ${tableY})`
        }}
      />
    );
  }
}
