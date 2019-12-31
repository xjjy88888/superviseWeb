import React, { PureComponent, ReactDOM } from "react";
import { connect } from "dva";
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
    const { link, districtTree } = this.props;
    console.log(districtTree);
    link(this);

    this.getProjectTableList({ MaxResultCount: 20 });
  }
  componentWillUnmount() {
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
      payload: parmas
    });
    this.setState({
      loading: false
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
    // console.log(pagination);

    let Sorting = ``;
    if (sorter.columnKey) {
      Sorting =
        sorter.columnKey + (sorter.order === "descend" ? " desc" : " asc");
    }
    console.log(filters);

    let filterObj = {
      Sorting,
      SkipCount: (pagination.current - 1) * pagination.pageSize,
      MaxResultCount: pagination.pageSize,
      ProjectStatus:
        filters.projectStatusId && filters.projectStatusId.length
          ? filters.projectStatusId.map(v => v).join(",")
          : ""
    };
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
      console.log(value, dataIndex, record);
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

  queryReset = () => {
    console.log("筛选页面重置");
  };
  
  render() {
    const {
      projectTableList,
      siderBarPageInfo: { activeMenu }
    } = this.props;
    const { loading, tableHeight, pagination, modalVisible } = this.state;
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
        dataIndex: "name",
        key: "name",
        width: 260,
        fixed: "left",
        sorter: true,
        ...this.getColumnSearchProps("name")
      },
      {
        title: "项目所在省市县",
        dataIndex: "districtCodeId",
        key: "districtCodeId",
        width: 200,
        fixed: "left"
        // filters: this.getDictList(`districtCodeId`),
        // render: (v = "2158", record) => {
        //   const { districtTree } = this.props;
        //   let districtValue = [];
        //   districtTree &&
        //     districtTree.length > 0 &&
        //     districtTree.map(item => {
        //       const res =
        //         (item.children && item.children.filter(it => it.value === v)) ||
        //         [];
        //       if (res.length) {
        //         districtValue = item.label + "/" + res[0].label;
        //       } else {
        //         item.children &&
        //           item.children.map(ite => {
        //             const res =
        //               (ite.children &&
        //                 ite.children.filter(it => it.value === v)) ||
        //               [];
        //             if (res.length) {
        //               districtValue =
        //                 item.label + "/" + ite.label + "/" + res[0].label;
        //             }
        //           });
        //       }
        //     });
        //   return districtValue;
        // }
      },
      {
        title: "详细地址",
        dataIndex: "addressInfo",
        key: "addressInfo",
        width: 200,
        fixed: "left"
        // sorter: true
      },
      {
        title: "生产建设单位",
        dataIndex: "productDepartmentId",
        key: "productDepartmentId",
        width: 200
        // sorter: (a, b) => a.age - b.age,
        // fixed: "left"
        // filters: [1, 2, 3, 1, 1, 1, 1, 1]
      },

      {
        title: "生产建设单位联系人",
        dataIndex: "productDepContactPeople",
        key: "productDepContactPeople",
        width: 200
        // render: text =>
        // (text && text.name && text.name + " / " + text.phoneNumber) || ""
      },
      {
        title: "监测单位",
        dataIndex: "monitorDepartmentId",
        key: "monitorDepartmentId",
        width: 200
        // filters: [1, 2, 3, 1, 1, 1, 1, 1]
      },
      {
        title: "监测单位联系人",
        dataIndex: "monitorDepContactPeople",
        key: "monitorDepContactPeople",
        width: 200
        // render: text =>
        // (text && text.name && text.name + " / " + text.phoneNumber) || ""
      },
      {
        title: "监理单位",
        dataIndex: "supervisionDepartmentId",
        key: "supervisionDepartmentId",
        width: 200
      },
      {
        title: "监理单位联系人",
        dataIndex: "superDepContactPeople",
        key: "superDepContactPeople",
        width: 200
        // render: text =>
        // (text && text.name && text.name + " / " + text.phoneNumber) || ""
      },
      {
        title: "方案编制单位",
        dataIndex: "projectDepartmentId",
        key: "projectDepartmentId",
        width: 200
      },
      {
        title: "监管单位",
        dataIndex: "supDepartmentId",
        key: "supDepartmentId",
        width: 200
      },
      {
        title: "流域机构Id",
        dataIndex: "riverBasinOUId",
        key: "riverBasinOUId",
        width: 200
      },
      {
        title: "是否需要编报方案",
        dataIndex: "isNeedPlan",
        key: "isNeedPlan",
        width: 200
      },
      {
        title: "批复机构",
        dataIndex: "replyDepartmentId",
        key: "replyDepartmentId",
        width: 200
      },
      {
        title: "批复文号",
        dataIndex: "replyNum",
        key: "replyNum",
        width: 150
      },
      {
        title: "批复时间",
        dataIndex: "replyTime",
        key: "replyTime",
        width: 150
      },
      {
        title: "防治责任范围面积(m²)",
        dataIndex: "respArea",
        key: "respArea",
        width: 240
      },
      {
        title: "项目类型",
        dataIndex: "projectTypeId",
        key: "projectTypeId",
        width: 200
      },
      {
        title: "项目类别",
        dataIndex: "projectCateId",
        key: "projectCateId",
        width: 300
      },
      {
        title: "水保工程状况",
        dataIndex: "projectStatusId",
        key: "projectStatusId",
        width: 200,
        filters: this.getDictList(`建设状态`),
        render: i => this.getDictLabel(i)
      },
      {
        title: "项目性质",
        dataIndex: "projectNatId",
        key: "projectNatId",
        width: 300
      },

      {
        title: "项目合规性",
        dataIndex: "complianceId",
        key: "complianceId",
        width: 200
      },
      {
        title: "涉及区县",
        dataIndex: "districtCodes",
        key: "districtCodes",
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
        // render: (v = "442", record) => {
        //   let districtValue = [];
        //   district &&
        //     district.length > 0 &&
        //     district.map(item => {
        //       const res = item.children.filter(it => it.value === v);
        //       if (res.length) {
        //         districtValue = res[0].label;
        //       } else {
        //         item.children.map(ite => {
        //           const res = ite.children.filter(it => it.value === v);
        //           if (res.length) {
        //             districtValue = res[0].label;
        //           }
        //         });
        //       }
        //     });
        //   return districtValue;
        // }
      },
      {
        title: "经纬度(X)",
        dataIndex: "pointX",
        key: "pointX",
        fixed: "right",
        width: 180
      },
      {
        title: "经纬度(Y)",
        dataIndex: "pointY",
        key: "pointY",
        fixed: "right",
        width: 180
      }
    ];

    const rowSelection = {
      onChange: (selectedRowKeys, selectedRows) => {
        console.log(selectedRowKeys, selectedRows);
        this.setState({ selectedRows: selectedRowKeys });
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
        <MergeProjectModal
          modalVisible={modalVisible}
          showModal={this.showModal.bind(this)}
        />
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
            title={() => (
              <div>
                <Icon type="plus" />
                新增
              </div>
            )}
            dataSource={
              (projectTableList &&
                projectTableList.items &&
                projectTableList.items) ||
              []
            }
            columns={columns}
            scroll={{
              x: 5260,
              y: `calc(100vh - ${tableY})`
            }}
          />
        )}
      </div>
    );
  }
}
