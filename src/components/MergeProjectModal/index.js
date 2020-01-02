import React, { PureComponent, Fragment } from "react";
import { connect } from "dva";
import jQuery from "jquery";
import {
  Modal,
  Steps,
  Button,
  Table,
  Input,
  Icon,
  Tooltip,
  message
} from "antd";

import styles from "./index.less";
const { Step } = Steps;

@connect(({ commonModel, district }) => ({ ...commonModel, ...district }))
export default class MergeProjectModal extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      visible: true,
      current: 0,
      selectedRows: [],
      selectedRowKeysForSave: [],
      active: false
    };
  }
  // 获取对应行政区划数据
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
  // 上一步或者取消
  handleBack = () => {
    const { current } = this.state;
    this.setState({
      current: current - 1,
      selectedRowKeysForSave: [],
      active: (current === 1 && false) || this.state.active
    });
  };
  // 下一步或确认
  handleOk = () => {
    const { current } = this.state;
    const { showModal } = this.props;
    this.setState({
      loading: current >= 2 && true,
      current: current < 2 ? current + 1 : current
    });
    setTimeout(() => {
      if (current === 2) {
        message.success("点击了确认合并项目按钮，等待后台将对应项目合并");
        this.setState({ loading: false });
        showModal(false);
      }
    }, 1000);
  };

  componentDidMount() {}
  componentDidUpdate(prevProps) {}

  componentWillUnmount() {}
  render() {
    const { showModal, tableHeight, mergeProjectModalInfo } = this.props;
    const {
      visible,
      loading,
      current,
      selectedRows,
      selectedRowKeysForSave,
      active
    } = this.state;

    const rowSelection = {
      onChange: (selectedRowKeys, selectedRows) => {
        console.log(selectedRows);
        this.setState({ selectedRows, active: true });
      },
      getCheckboxProps: record => ({
        defaultChecked: mergeProjectModalInfo.tableSelectedRowKeys.includes(
          record.id
        )
      })
    };
    const rowSelectionForSave = {
      type: "radio",
      onChange: (selectedRowKeys, selectedRows) => {
        console.log(selectedRowKeys);
        this.setState({ selectedRowKeysForSave: selectedRowKeys, current: 2 });
      },
      selectedRowKeys: selectedRowKeysForSave
    };
    const columns = [
      {
        title: "项目名称",
        dataIndex: "projectName",
        key: "projectName",
        width: 250,
        fixed: "left"
      },
      {
        title: "生产建设单位",
        dataIndex: "productDepartmentName",
        key: "productDepartmentName",
        width: 200,
        fixed: "left"
      },
      {
        title: "批复机构",
        dataIndex: "replyDepartmentName",
        key: "replyDepartmentName",
        width: 200
      },
      {
        title: "有无项目红线",
        dataIndex: "hasScope",
        key: "hasScope",
        width: 120,
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
      },

      {
        title: "立项级别",
        dataIndex: "projectLevel",
        key: "projectLevel",
        width: 100
      },

      {
        title: "批复文号",
        dataIndex: "replyNum",
        key: "replyNum",
        width: 180
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
        width: 100
      },

      {
        title: "项目合规性",
        dataIndex: "compliance",
        key: "compliance",
        width: 120
      },
      {
        title: "项目类型",
        dataIndex: "projectType",
        key: "projectType",
        width: 150
      },
      {
        title: "项目类别",
        dataIndex: "projectCate",
        key: "projectCate",
        width: 150
      },
      {
        title: "水保工程状况",
        dataIndex: "projectStatus",
        key: "projectStatus",
        width: 100
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
        width: 160
      },
      {
        title: "监管单位",
        dataIndex: "supDepartmentName",
        key: "supDepartmentName",
        width: 160
      }
    ];

    return (
      <Modal
        className={styles["merge-modal"]}
        zIndex={1001}
        visible={visible}
        title="项目合并"
        onOk={this.handleOk}
        onCancel={() => showModal(false)}
        width={"88%"}
        footer={[
          current > 0 ? (
            <Button key="back" onClick={this.handleBack}>
              上一步
            </Button>
          ) : null,
          <Button
            disabled={
              current >= 1
                ? selectedRowKeysForSave.length
                  ? false
                  : true
                : false
            }
            key="submit"
            type="primary"
            loading={loading}
            onClick={this.handleOk}
          >
            {current < 1 ? "下一步" : "确认"}
          </Button>
        ]}
      >
        <Steps current={current} className={styles.steps}>
          <Step
            title="确认项目"
            description={
              <span>
                请确认需要
                <span style={{ color: current === 0 && "red" }}>合并</span>
                的项目
              </span>
            }
          />
          <Step
            title="保留项目"
            description={
              <span>
                请<span style={{ color: current === 1 && "red" }}>勾选</span>
                需要
                <span style={{ color: current === 1 && "red" }}>保留</span>
                的项目
              </span>
            }
          />
          <Step title="确认" description="请点击确认" />
        </Steps>
        <div>
          <h3>
            {current === 0 ? `确认合并` : `勾选保留`}项目（共
            {selectedRows.length
              ? selectedRows.length
              : mergeProjectModalInfo.tableDataSource.length}
            个项目）
          </h3>
          {current === 0 ? (
            <Table
              style={{ height: tableHeight / 2 - 80 }}
              dataSource={mergeProjectModalInfo.tableDataSource}
              columns={columns}
              size="middle"
              rowSelection={rowSelection}
              rowKey={record => record.id}
              pagination={false}
              scroll={{
                x: 3720,
                y: tableHeight / 2 - 130
              }}
            />
          ) : null}
          {current >= 1 ? (
            <Table
              style={{ height: tableHeight / 2 - 80 }}
              dataSource={
                active ? selectedRows : mergeProjectModalInfo.tableDataSource
              }
              columns={columns}
              size="middle"
              rowSelection={rowSelectionForSave}
              rowKey={record => record.id}
              pagination={false}
              scroll={{
                x: 3780,
                y: tableHeight / 2 - 130
              }}
            />
          ) : null}
        </div>

        <div className={styles.footer}>
          <b>说明：</b>
          {current === 1 && (
            <div>选择保留的项目没有图形，但是合并的其他项目有图形的时候：</div>
          )}

          <ol>
            {current === 0 ? (
              <>
                <li>
                  被合并的项目的项目信息、监管图形、监管信息、存在问题、整改意见以及相关附件等都会被直接删除；
                </li>
                <li>
                  保留的项目不会被删除，被合并的项目的关联图斑都会转移到该保留项目下。
                </li>
              </>
            ) : (
              <>
                <li>
                  如果选中合并项目中只有1个项目有图形，将保留该图形至无图形项目（保留项目）中；
                </li>
                <li>
                  如果选中合并项目中有多个项目包含图形，需要先将有图形项目合并，然后再进一步合并。
                </li>
              </>
            )}
          </ol>
        </div>
      </Modal>
    );
  }
}
