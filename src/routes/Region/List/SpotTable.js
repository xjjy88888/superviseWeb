import React, { PureComponent } from "react";
import { connect } from "dva";
import jQuery from "jquery";
import { Button, Table, Input, Icon, Tooltip, DatePicker } from "antd";

import styles from "./style/ProjectList.less";

const { RangePicker } = DatePicker;

@connect(({ spot, commonModel, user, project }) => ({
  ...spot,
  ...commonModel,
  ...user,
  ...project
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
  // 格式化查询数据
  dataFormat = v => {
    for (let i in v) {
      if (Array.isArray(v[i])) {
        // if (i === "ReplyTime" && v[i].length) {
        //   v.ReplyTimeBegin = dateFormat(v[i][0]);
        //   v.ReplyTimeEnd = dateFormat(v[i][1]);
        // }
        v[i] = v[i].join(",");
      }
    }
  };
  componentDidMount() {
    window.addEventListener("resize", this.onWindowResize);
    this.getSpotTableList({ MaxResultCount: 20 });
  }
  componentDidUpdate(prevProps) {
    const { queryParams } = this.props;
    if (
      prevProps.queryParams !== queryParams &&
      queryParams.from &&
      queryParams.from === "spot"
    ) {
      console.log(queryParams);
      this.dataFormat(queryParams);
      this.getSpotTableList({ ...queryParams, MaxResultCount: 20 });
    }
  }
  // 获取图斑列表
  getSpotTableList = parmas => {
    const { dispatch } = this.props;
    dispatch({
      type: "spot/getSpotTableList",
      payload: parmas,
      callback: (success, res) => {
        if (success) {
          this.setState({
            pagination: { ...this.state.pagination, total: res.totalCount }
          });
        }
        this.setState({
          loading: false
        });
      }
    });
  };
  // 获取字典对应数据
  getDictList = type => {
    const { dictList } = this.props;
    const filter = dictList.filter(item => item.dictTypeName === type);
    const result = filter.map(i => {
      return {
        text: i.dictTableValue,
        value: i.dictTableValue
      };
    });
    return result;
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
    const { dispatch, queryParams } = this.props;

    let Sorting = ``;
    if (sorter.columnKey) {
      const key =
        sorter.columnKey === "creationTime"
          ? "CreationTime"
          : sorter.columnKey === "lastModificationTime"
          ? "LastModificationTime"
          : sorter.columnKey;

      Sorting = key + (sorter.order === "descend" ? " desc" : " asc");
    }
    // console.log(Sorting, sorter);

    let filterObj = {
      Sorting,
      SkipCount: (pagination.current - 1) * pagination.pageSize,
      MaxResultCount: pagination.pageSize,
      mapNum: filters.mapNum && filters.mapNum.length ? filters.mapNum[0] : ``,
      projectName:
        filters.projectName && filters.projectName.length
          ? filters.projectName[0]
          : ``,
      isReview:
        filters.isReview && filters.isReview.length
          ? filters.isReview.join(",")
          : ``,
      buildStatusValue:
        filters.buildStatusValue && filters.buildStatusValue.length
          ? filters.buildStatusValue.join(",")
          : ``,
      CreationTimeMin:
        filters.creationTime && filters.creationTime.length
          ? filters.creationTime[0]
          : ``,
      CreationTimeMax:
        filters.creationTime && filters.creationTime.length > 1
          ? filters.creationTime[1]
          : ``,
      LastModificationTimeMin:
        filters.lastModificationTime && filters.lastModificationTime.length
          ? filters.lastModificationTime[0]
          : ``,
      LastModificationTimeMax:
        filters.lastModificationTime && filters.lastModificationTime.length > 1
          ? filters.lastModificationTime[1]
          : ``
    };
    if (pagination && pagination.current > 1) {
      filterObj.Count = pagination.total;
    } else {
      filterObj.Count && delete filterObj.Count;
    }
    this.getSpotTableList({ ...queryParams, ...filterObj });
    this.setState({
      pagination,
      filterObj,
      Sorting
    });
    dispatch({
      type: "project/projectSave",
      payload: {
        queryParams: { ...queryParams, ...filterObj, from: "spot" }
      }
    });
  };

  // 表头过滤筛选
  getColumnSearchProps = dataIndex => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters
    }) =>
      dataIndex === "creationTime" || dataIndex === "lastModificationTime" ? (
        <div style={{ padding: 8 }}>
          <RangePicker
            placeholder={["时间区间起", "时间区间止"]}
            style={{ width: 225, display: "block" }}
            ref={node => {
              this.searchInput = node;
            }}
            onChange={(date, dateString) =>
              setSelectedKeys(dateString ? dateString : [])
            }
            onPressEnter={() => confirm()}
          />
          <Button
            type="primary"
            onClick={() => confirm()}
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
      ) : (
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
        dataIndex === "creationTime" || dataIndex === "lastModificationTime"
          ? null
          : setTimeout(() => this.searchInput.select());
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
        width: 270,
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
        width: 120,
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
      // {
      //   title: "重点监管",
      //   dataIndex: "isFocus",
      //   key: "isFocus",
      //   width: 180
      //   // fixed: "left",
      //   // sorter: true,
      //   // ...this.getColumnSearchProps("isFocus")
      // },

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
        width: 200,
        sorter: true
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
        width: 200,
        filters: this.getDictList(`建设状态`)
      },
      // {
      //   title: "土壤侵蚀强度",
      //   dataIndex: "soilErosionIntensity",
      //   key: "soilErosionIntensity",
      //   width: 200
      // },
      {
        title: "创建时间",
        dataIndex: "creationTime",
        key: "creationTime",
        width: 200,
        sorter: true,
        ...this.getColumnSearchProps("creationTime")
      },
      {
        title: "修改时间",
        dataIndex: "lastModificationTime",
        key: "lastModificationTime",
        width: 200,
        sorter: true,
        ...this.getColumnSearchProps("lastModificationTime")
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
          x: 3050,
          y: `calc(100vh - ${tableY})`
        }}
      />
    );
  }
}
