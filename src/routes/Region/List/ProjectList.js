import React, { PureComponent, ReactDOM } from "react";
import { connect } from "dva";
import { Link } from "dva/router";
import jQuery from "jquery";
import { Button, Table, PageHeader, Icon, Input, message } from "antd";
import Spins from "../../../components/Spins";
import SpotTable from "./SpotTable";
import MergeProjectModal from "../../../components/MergeProjectModal";

import styles from "./style/ProjectList.less";

@connect(({ project, district, dict, commonModel, user }) => ({
  ...project,
  ...district,
  ...dict,
  ...commonModel,
  ...user
}))
export default class ProjectListTable extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      modalVisible: false,
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
    const { link, districtTree } = this.props;
    console.log(districtTree);
    link(this);

    this.getProjectTableList({ MaxResultCount: 20 });
  }
  componentWillUnmount() {
    this.onWindowResize &&
      window.removeEventListener("resize", this.onWindowResize);
  }
  // 获取项目列表
  getProjectTableList = parmas => {
    this.setState({
      loading: true
    });
    const { dispatch } = this.props;
    dispatch({
      type: "project/getProjectTableList",
      payload: parmas,
      callback: (success, res) => {
        if (success) {
          this.setState({
            loading: false,
            pagination: { ...this.state.pagination, total: res.totalCount }
          });
        }
      }
    });
  };
  // 隐藏页面
  show = () => {
    jQuery("#ProjectList").animate({ left: 0 });
  };
  // 整个表格重置
  async reset() {
    const { dispatch } = this.props;
    await dispatch({
      type: "project/save",
      payload: {
        showProjectBigTable: false
      }
    });

    await dispatch({
      type: "project/save",
      payload: {
        showProjectBigTable: true
      }
    });
    jQuery("#ProjectList").css({ left: 0 });
  }
  getDictLabel = id => {
    const { dicList } = this.props;
    let result = ``;
    if (id) {
      const filter = dicList.filter(item => item.id === id);
      result = filter.map(item => item.dictTableValue).join(",");
    }
    return result;
  };

  getDictList = type => {
    const { dicList } = this.props;
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
    const { districtList } = this.props;
    let result = ``;
    const arr = ids ? ids.split(`,`) : [];
    if (arr.length) {
      const filter = districtList.filter(item => arr.indexOf(item.id) !== -1);
      result = filter.map(item => item.name).join(",");
    }
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
      Sorting =
        sorter.columnKey + (sorter.order === "descend" ? " desc" : " asc");
    }
    console.log(filters);

    let filterObj = {
      Count: pagination.total,
      Sorting,
      SkipCount: (pagination.current - 1) * pagination.pageSize,
      MaxResultCount: pagination.pageSize,
      ProjectStatus:
        filters.projectStatusId && filters.projectStatusId.length
          ? filters.projectStatusId.map(v => v).join(",")
          : "",
      ProjectName:
        filters.projectName && filters.projectName.length
          ? filters.projectName[0]
          : ``,
      ProductDepartment:
        filters.productDepartmentName && filters.productDepartmentName.length
          ? filters.productDepartmentName[0]
          : ``,
      ReplyDepartment:
        filters.replyDepartmentName && filters.replyDepartmentName.length
          ? filters.replyDepartmentName[0]
          : ``,
      ReplyNum:
        filters.replyNum && filters.replyNum.length ? filters.replyNum[0] : ``,
      Compliance:
        filters.compliance && filters.compliance.length
          ? filters.compliance[0]
          : ``,
      ProjectDistrictCodes:
        filters.districtCodes && filters.districtCodes.length
          ? filters.districtCodes[0]
          : ``,
      SupDepartment:
        filters.supDepartmentName && filters.supDepartmentName.length
          ? filters.supDepartmentName[0]
          : ``,
      HasScopes:
        filters.hasScope && filters.hasScope.length
          ? filters.hasScope.join(",")
          : ``,
      ProjectLevel:
        filters.projectLevel && filters.projectLevel.length
          ? filters.projectLevel.join(",")
          : ``,
      ProjectType:
        filters.projectType && filters.projectType.length
          ? filters.projectType.join(",")
          : ``,
      ProjectCate:
        filters.projectCate && filters.projectCate.length
          ? filters.projectCate.join(",")
          : ``,
      ProjectNat:
        filters.projectNat && filters.projectNat.length
          ? filters.projectNat.join(",")
          : ``

      // checkDate:
      //   filters.checkDate && filters.checkDate.length
      //     ? filters.checkDate[0]
      //     : ``
    };
    console.log(filterObj);
    // 先将filterObj存到props中，供两表关联查询
    dispatch({
      type: "project/projectSave",
      payload: { queryParams: { ...queryParams, ...filterObj } }
    });
    this.getProjectTableList(filterObj);
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
      // console.log(value, dataIndex, record);
      if (dataIndex === "checkDate") {
        let v = false;
        if (record.projectChecks.length > 0) {
          record.projectChecks.map(item => {
            if (
              item[dataIndex] &&
              item[dataIndex]
                .toString()
                .toLowerCase()
                .includes(value.toLowerCase())
            ) {
              v = true;
            }
          });
          return v;
        }
      } else {
        console.log(6666);
        return (
          record[dataIndex] &&
          record[dataIndex]
            .toString()
            .toLowerCase()
            .includes(value.toLowerCase())
        );
      }
    },
    onFilterDropdownVisibleChange: visible => {
      if (visible) {
        setTimeout(() => this.searchInput.select());
      }
    }
  });

  // 项目合并按钮
  mergeProject = () => {
    console.log("筛选页面参数", this.props.queryParams);
    const { selectedRows } = this.state;
    if (selectedRows.length >= 2) {
      this.showModal(true);
    } else if (selectedRows.length === 0) {
      message.warn("请先选择要合并的项目！");
      return;
    } else if (selectedRows.length === 1) {
      message.warn("必须要两个以上项目才能进行合并！");
      return;
    }
  };
  // 项目合并modal框
  showModal = status => {
    this.setState({
      modalVisible: status
    });
  };
  // 前往项目详情页面
  gotoProjectDetail = (val, e) => {
    const { showProjectDetail } = this.props;
    // e.preventDefault();
    jQuery("#ProjectList").css({ left: 351 });
    showProjectDetail(val.id);
    console.log(val);
  };

  queryReset = () => {
    console.log("筛选页面重置");
  };

  render() {
    const {
      projectTableList,
      siderBarPageInfo: { activeMenu }
    } = this.props;
    const {
      loading,
      tableHeight,
      pagination,
      modalVisible,
      selectedRows
    } = this.state;
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

    const columns = [
      {
        title: "项目名称",
        dataIndex: "projectName",
        key: "projectName",
        width: 260,
        fixed: "left",
        sorter: true,
        ...this.getColumnSearchProps("projectName"),
        render: (text, record) => (
          <a
            // href="#"
            onClick={this.gotoProjectDetail.bind(this, record)}
          >
            {text}
          </a>
        )
      },
      {
        title: "生产建设单位",
        dataIndex: "productDepartmentName",
        key: "productDepartmentName",
        width: 200,
        fixed: "left",
        ...this.getColumnSearchProps("productDepartmentName")
      },
      {
        title: "批复机构",
        dataIndex: "replyDepartmentName",
        key: "replyDepartmentName",
        width: 200,
        ...this.getColumnSearchProps("replyDepartmentName")
      },
      {
        title: "有无项目红线",
        dataIndex: "hasScope",
        key: "hasScope",
        width: 120,
        filters: [
          { text: "有红线", value: "有红线" },
          { text: "无红线", value: "无红线" }
        ],
        render: val => (val === false ? "无红线" : val === true ? "有红线" : "")
      },
      {
        title: "关联图斑数",
        dataIndex: "spotCount",
        key: "spotCount",
        width: 100
      },
      {
        title: "项目附件",
        dataIndex: "projectFiles",
        key: "projectFiles",
        width: 100
      },
      {
        title: "可不编报证明",
        dataIndex: "noReportCertRequired",
        key: "noReportCertRequired",
        width: 100
      },
      {
        title: "方案报批文件",
        dataIndex: "schemeApprovalDocument",
        key: "schemeApprovalDocument",
        width: 100
      },
      {
        title: "整改意见",
        dataIndex: "correctionOpinion",
        key: "correctionOpinion",
        width: 100
      },
      {
        title: "整改报告",
        dataIndex: "correctionReport",
        key: "correctionReport",
        width: 100
      },
      {
        title: "立案文件",
        dataIndex: "registerFile",
        key: "registerFile",
        width: 100
      },
      {
        title: "结案文件",
        dataIndex: "settleFile",
        key: "settleFile",
        width: 100
      },
      {
        title: "查处结果",
        dataIndex: "investigationResult",
        key: "investigationResult",
        width: 200
      },
      {
        title: "处置方式",
        dataIndex: "disposalMethod",
        key: "disposalMethod",
        width: 200
        // sorter: true
      },

      {
        title: "立项级别",
        dataIndex: "projectLevel",
        key: "projectLevel",
        width: 100,
        filters: [
          { text: "部级", value: "部级" },
          { text: "县级", value: "县级" },
          { text: "市级", value: "市级" },
          { text: "省级", value: "省级" }
        ]
      },

      {
        title: "批复文号",
        dataIndex: "replyNum",
        key: "replyNum",
        width: 180,
        ...this.getColumnSearchProps("replyNum")
      },
      {
        title: "批复时间",
        dataIndex: "replyTime",
        key: "replyTime",
        width: 180
      },
      {
        title: "项目性质",
        dataIndex: "projectNat",
        key: "projectNat",
        width: 100,
        filters: [
          { text: "新建", value: "新建" },
          { text: "扩建", value: "扩建" }
        ]
      },

      {
        title: "项目合规性",
        dataIndex: "compliance",
        key: "compliance",
        width: 120,
        ...this.getColumnSearchProps("compliance")
      },
      {
        title: "项目类型",
        dataIndex: "projectType",
        key: "projectType",
        width: 150,
        filters: this.getDictList(`项目类型`)
      },
      {
        title: "项目类别",
        dataIndex: "projectCate",
        key: "projectCate",
        width: 150,
        filters: [
          { text: "建设类", value: "建设类" },
          { text: "开发类", value: "开发类" }
        ]
      },
      {
        title: "水保工程状况",
        dataIndex: "projectStatus",
        key: "projectStatus",
        width: 100,
        filters: this.getDictList(`建设状态`)
        // render: i => this.getDictLabel(i)
      },

      {
        title: "矢量化类型(示意性/精确)",
        dataIndex: "vecType",
        key: "vecType",
        width: 150
      },
      {
        title: "涉及区县",
        dataIndex: "districtCodes",
        key: "districtCodes",
        width: 150,
        ...this.getColumnSearchProps("districtCodes"),
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
        title: "上图单位",
        dataIndex: "upmapDepartmentName",
        key: "upmapDepartmentName",
        width: 180
      },
      {
        title: "监管单位",
        dataIndex: "supDepartmentName",
        key: "supDepartmentName",
        width: 180,
        ...this.getColumnSearchProps("supDepartmentName")
      }
    ];

    const rowSelection = {
      onChange: (selectedRowKeys, selectedRows) => {
        this.setState({ selectedRows: selectedRowKeys });
        this.props.dispatch({
          type: "commonModel/save",
          payload: {
            mergeProjectModalInfo: {
              tableDataSource: selectedRows,
              tableSelectedRowKeys: selectedRowKeys
            }
          }
        });
      }
    };
    return (
      <div
        id="ProjectList"
        className={styles["project-list-panel"]}
        style={{
          left: -window.innerWidth,
          width: window.innerWidth
        }}
      >
        <Spins show={loading} />
        {modalVisible ? (
          <MergeProjectModal
            showModal={this.showModal.bind(this)}
            tableHeight={tableHeight}
          />
        ) : null}

        <PageHeader
          className={styles["page-header"]}
          title={activeMenu === "spot" ? "图斑列表" : "项目列表"}
          // breadcrumb={{ routes }}
          subTitle=""
          backIcon={<Icon type="arrow-left" style={{ color: "#1890ff" }} />}
          onBack={() => {
            jQuery("#ProjectList").animate({ left: -window.innerWidth });
          }}
          extra={[
            <Button key="2" type="primary">
              查询
            </Button>,
            <Button key="1" type="primary" onClick={this.reset.bind(this)}>
              重置
            </Button>,
            <Button
              key="3"
              type="primary"
              style={{ marginLeft: "10px" }}
              onClick={this.mergeProject}
            >
              项目合并
            </Button>
          ]}
        />
        {activeMenu === "spot" ? (
          <SpotTable />
        ) : (
          <Table
            id="projectTable"
            size="middle"
            rowSelection={rowSelection}
            rowKey={record => record.id}
            onChange={this.handleTableChange}
            pagination={pagination}
            dataSource={
              (projectTableList &&
                projectTableList.items &&
                projectTableList.items) ||
              []
            }
            columns={columns}
            scroll={{
              x: 3780,
              y: `calc(100vh - ${tableY})`
            }}
          />
        )}
      </div>
    );
  }
}
