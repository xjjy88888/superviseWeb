import React, { PureComponent } from "react";
import jQuery from "jquery";
import { Button, Table, Row, Col, Input, Select, PageHeader, Icon } from "antd";

import styles from "./style/ProjectList.less";

const { Option } = Select;

export default class ProjectList extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      showScreen: false
    };
  }
  componentDidMount() {
    const { link } = this.props;
    link(this);
    this.showScreen(1);
  }

  show = () => {
    jQuery("#ProjectList").animate({ left: 0 });
  };
  showScreen = v => {
    const { showScreen } = this.state;
    if (showScreen || (v && v === 1)) {
      jQuery("#gutter").slideUp(1000);
    } else {
      jQuery("#gutter").slideDown(1000);
    }
    this.setState({
      showScreen: v && v === 1 ? showScreen : !showScreen
    });
  };

  render() {
    const { showScreen } = this.state;
    const dataSource = [
      {
        key: "1",
        name: "胡彦斌",
        age: 32,
        address: "西湖区湖底公园1号"
      },
      {
        key: "2",
        name: "胡彦祖",
        age: 42,
        address: "西湖区湖底公园1号"
      }
    ];

    const columns = [
      {
        title: "项目名称",
        dataIndex: "name",
        key: "name",
        fixed: "left"
      },
      {
        title: "建设单位",
        dataIndex: "age",
        key: "age",
        sorter: (a, b) => a.age - b.age,
        fixed: "left"
      },
      {
        title: "批复机构",
        dataIndex: "address",
        key: "address",
        fixed: "left"
      },
      {
        title: "有无图形",
        dataIndex: "name",
        key: "name"
      },
      {
        title: "项目附件",
        dataIndex: "age",
        key: "age"
      },
      {
        title: "关联图斑数",
        dataIndex: "address",
        key: "address"
      },
      {
        title: "可不编报说明",
        dataIndex: "name",
        key: "name"
      },
      {
        title: "方案报批文件",
        dataIndex: "age",
        key: "age"
      },
      {
        title: "整改意见",
        dataIndex: "address",
        key: "address"
      },
      {
        title: "整改报告",
        dataIndex: "name",
        key: "name"
      },
      {
        title: "立案文件",
        dataIndex: "age",
        key: "age"
      },
      {
        title: "结案文件",
        dataIndex: "address",
        key: "address"
      },
      {
        title: "查处结果",
        dataIndex: "name",
        key: "name"
      },
      {
        title: "处置方式",
        dataIndex: "age",
        key: "age"
      },
      {
        title: "项目合规性",
        dataIndex: "address",
        key: "address"
      },
      {
        title: "立项级别",
        dataIndex: "address",
        key: "address",
        fixed: "right"
      }
    ];
    const routes = [
      {
        path: "",
        breadcrumbName: "区域监管"
      },
      {
        path: "/",
        breadcrumbName: "项目管理"
      }
    ];
    return (
      <div
        id="ProjectList"
        className={styles["project-list-panel"]}
        style={{
          left: -window.innerWidth,
          width: window.innerWidth
        }}
      >
        <PageHeader
          className={styles["page-header"]}
          title="项目列表"
          breadcrumb={{ routes }}
          subTitle=""
          backIcon={<Icon type="arrow-left" style={{ color: "#1890ff" }} />}
          onBack={() => {
            jQuery("#ProjectList").animate({ left: -window.innerWidth });
          }}
          extra={[
            <Button key="2" type="primary">
              查询
            </Button>,
            <Button key="1" type="primary">
              重置
            </Button>,
            <Button key="1" type="primary" onClick={this.showScreen.bind(this)}>
              {showScreen ? "收起" : "展开"}
            </Button>
          ]}
        >
          <div
            className={styles["gutter-panel"]}

            //  style={{ height: "10%" }}
          >
            <Row gutter={16}>
              <Col className="gutter-row" span={6}>
                <div className="gutter-box">
                  <label htmlFor="name">项目名称：</label>
                  <Input id="name " />
                </div>
              </Col>
              <Col className="gutter-row" span={6}>
                <div className="gutter-box">
                  {" "}
                  <label htmlFor="approvalOrgan">批复机构：</label>
                  <Input id="approvalOrgan" />
                </div>
              </Col>
              <Col className="gutter-row" span={6}>
                <div className="gutter-box">
                  {" "}
                  <label htmlFor="isChart">有无图形：</label>
                  <Select
                    id="isChart"
                    defaultValue=""
                    style={{ width: 120 }}
                    // onChange={handleChange}
                  >
                    <Option value="jack">Jack</Option>
                    <Option value="lucy">Lucy</Option>
                    <Option value="disabled" disabled>
                      Disabled
                    </Option>
                    <Option value="Yiminghe">yiminghe</Option>
                  </Select>
                </div>
              </Col>
              <Col className="gutter-row" span={6}>
                <div className="gutter-box">
                  {" "}
                  <label htmlFor="correlationMapSpot">是否关联图斑：</label>
                  <Select
                    id="correlationMapSpot"
                    defaultValue=""
                    style={{ width: 120 }}
                    // onChange={handleChange}
                  >
                    <Option value="jack">Jack</Option>
                    <Option value="lucy">Lucy</Option>
                    <Option value="disabled" disabled>
                      Disabled
                    </Option>
                    <Option value="Yiminghe">yiminghe</Option>
                  </Select>
                </div>
              </Col>
            </Row>
            <div id="gutter">
              <Row gutter={16}>
                <Col className="gutter-row" span={6}>
                  <div className="gutter-box">
                    <label htmlFor="name">批复文号：</label>
                    <Input id="name" />
                  </div>
                </Col>
                <Col className="gutter-row" span={6}>
                  <div className="gutter-box">
                    {" "}
                    <label htmlFor="approvalOrgan">立项级别：</label>
                    <Input id="approvalOrgan" />
                  </div>
                </Col>
                <Col className="gutter-row" span={6}>
                  <div className="gutter-box">
                    {" "}
                    <label htmlFor="isChart">建设状态：</label>
                    <Select
                      id="isChart"
                      defaultValue=""
                      style={{ width: 120 }}
                      // onChange={handleChange}
                    >
                      <Option value="jack">Jack</Option>
                      <Option value="lucy">Lucy</Option>
                      <Option value="disabled" disabled>
                        Disabled
                      </Option>
                      <Option value="Yiminghe">yiminghe</Option>
                    </Select>
                  </div>
                </Col>
                <Col className="gutter-row" span={6}>
                  <div className="gutter-box">
                    {" "}
                    <label htmlFor="correlationMapSpot">项目合规性：</label>
                    <Select
                      id="correlationMapSpot"
                      defaultValue=""
                      style={{ width: 120 }}
                      // onChange={handleChange}
                    >
                      <Option value="jack">Jack</Option>
                      <Option value="lucy">Lucy</Option>
                      <Option value="disabled" disabled>
                        Disabled
                      </Option>
                      <Option value="Yiminghe">yiminghe</Option>
                    </Select>
                  </div>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col className="gutter-row" span={6}>
                  <div className="gutter-box">
                    <label htmlFor="name">项目类型：</label>
                    <Input id="name" />
                  </div>
                </Col>
                <Col className="gutter-row" span={6}>
                  <div className="gutter-box">
                    {" "}
                    <label htmlFor="approvalOrgan">项目类别：</label>
                    <Input id="approvalOrgan" />
                  </div>
                </Col>
                <Col className="gutter-row" span={6}>
                  <div className="gutter-box">
                    {" "}
                    <label htmlFor="isChart">项目性质：</label>
                    <Select
                      id="isChart"
                      defaultValue=""
                      style={{ width: 120 }}
                      // onChange={handleChange}
                    >
                      <Option value="jack">Jack</Option>
                      <Option value="lucy">Lucy</Option>
                      <Option value="disabled" disabled>
                        Disabled
                      </Option>
                      <Option value="Yiminghe">yiminghe</Option>
                    </Select>
                  </div>
                </Col>
                <Col className="gutter-row" span={6}>
                  <div className="gutter-box">
                    {" "}
                    <label htmlFor="correlationMapSpot">批复时间：</label>
                    <Select
                      id="correlationMapSpot"
                      defaultValue=""
                      style={{ width: 120 }}
                      // onChange={handleChange}
                    >
                      <Option value="jack">Jack</Option>
                      <Option value="lucy">Lucy</Option>
                      <Option value="disabled" disabled>
                        Disabled
                      </Option>
                      <Option value="Yiminghe">yiminghe</Option>
                    </Select>
                  </div>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col className="gutter-row" span={6}>
                  <div className="gutter-box">
                    <label htmlFor="name">矢量化类型：</label>
                    <Input id="name" />
                  </div>
                </Col>
                <Col className="gutter-row" span={6}>
                  <div className="gutter-box">
                    {" "}
                    <label htmlFor="approvalOrgan">行政区划：</label>
                    <Input id="approvalOrgan" />
                  </div>
                </Col>
                <Col className="gutter-row" span={6}>
                  <div className="gutter-box">
                    {" "}
                    <label htmlFor="isChart">
                      是否有与关联图斑的合规性冲突：
                    </label>
                    <Select
                      id="isChart"
                      defaultValue=""
                      style={{ width: 120 }}
                      // onChange={handleChange}
                    >
                      <Option value="jack">Jack</Option>
                      <Option value="lucy">Lucy</Option>
                      <Option value="disabled" disabled>
                        Disabled
                      </Option>
                      <Option value="Yiminghe">yiminghe</Option>
                    </Select>
                  </div>
                </Col>
                <Col className="gutter-row" span={6}>
                  <div className="gutter-box">
                    {" "}
                    <label htmlFor="correlationMapSpot">
                      是否有与关联图斑的建设状态冲突：
                    </label>
                    <Select
                      id="correlationMapSpot"
                      defaultValue=""
                      style={{ width: 120 }}
                      // onChange={handleChange}
                    >
                      <Option value="jack">Jack</Option>
                      <Option value="lucy">Lucy</Option>
                      <Option value="disabled" disabled>
                        Disabled
                      </Option>
                      <Option value="Yiminghe">yiminghe</Option>
                    </Select>
                  </div>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col className="gutter-row" span={4}>
                  <div className="gutter-box">
                    <label htmlFor="name">有无照片：</label>
                    <Select
                      id="isChart"
                      defaultValue=""
                      style={{ width: 120 }}
                      // onChange={handleChange}
                    >
                      <Option value="jack">Jack</Option>
                      <Option value="lucy">Lucy</Option>
                    </Select>
                  </div>
                </Col>
                <Col className="gutter-row" span={4}>
                  <div className="gutter-box">
                    {" "}
                    <label htmlFor="approvalOrgan">有无核查相关文件：</label>
                    <Select
                      id="isChart"
                      defaultValue=""
                      style={{ width: 120 }}
                      // onChange={handleChange}
                    >
                      <Option value="jack">Jack</Option>
                      <Option value="lucy">Lucy</Option>
                    </Select>
                  </div>
                </Col>
                <Col className="gutter-row" span={4}>
                  <div className="gutter-box">
                    {" "}
                    <label htmlFor="isChart">有无方案报批文件：</label>
                    <Select
                      id="isChart"
                      defaultValue=""
                      style={{ width: 120 }}
                      // onChange={handleChange}
                    >
                      <Option value="jack">Jack</Option>
                      <Option value="lucy">Lucy</Option>
                    </Select>
                  </div>
                </Col>
                <Col className="gutter-row" span={4}>
                  <div className="gutter-box">
                    {" "}
                    <label htmlFor="correlationMapSpot">有无整改意见：</label>
                    <Select
                      id="correlationMapSpot"
                      defaultValue=""
                      style={{ width: 120 }}
                      // onChange={handleChange}
                    >
                      <Option value="jack">Jack</Option>
                      <Option value="lucy">Lucy</Option>
                      <Option value="disabled" disabled>
                        Disabled
                      </Option>
                      <Option value="Yiminghe">yiminghe</Option>
                    </Select>
                  </div>
                </Col>
                <Col className="gutter-row" span={4}>
                  <div className="gutter-box">
                    {" "}
                    <label htmlFor="correlationMapSpot">有无整改报告：</label>
                    <Select
                      id="correlationMapSpot"
                      defaultValue=""
                      style={{ width: 120 }}
                      // onChange={handleChange}
                    >
                      <Option value="jack">Jack</Option>
                      <Option value="lucy">Lucy</Option>
                      <Option value="disabled" disabled>
                        Disabled
                      </Option>
                      <Option value="Yiminghe">yiminghe</Option>
                    </Select>
                  </div>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col className="gutter-row" span={6}>
                  <div className="gutter-box">
                    <label htmlFor="name">有无立案文件：</label>
                    <Input id="name" />
                  </div>
                </Col>
                <Col className="gutter-row" span={6}>
                  <div className="gutter-box">
                    {" "}
                    <label htmlFor="approvalOrgan">有无结案文件：</label>
                    <Input id="approvalOrgan" />
                  </div>
                </Col>
                <Col className="gutter-row" span={6}>
                  <div className="gutter-box">
                    {" "}
                    <label htmlFor="isChart">查处结果：</label>
                    <Select
                      id="isChart"
                      defaultValue=""
                      style={{ width: 120 }}
                      // onChange={handleChange}
                    >
                      <Option value="jack">Jack</Option>
                      <Option value="lucy">Lucy</Option>
                      <Option value="disabled" disabled>
                        Disabled
                      </Option>
                      <Option value="Yiminghe">yiminghe</Option>
                    </Select>
                  </div>
                </Col>
                <Col className="gutter-row" span={6}>
                  <div className="gutter-box">
                    {" "}
                    <label htmlFor="correlationMapSpot">处置方式：</label>
                    <Select
                      id="correlationMapSpot"
                      defaultValue=""
                      style={{ width: 120 }}
                      // onChange={handleChange}
                    >
                      <Option value="jack">Jack</Option>
                      <Option value="lucy">Lucy</Option>
                      <Option value="666">666</Option>
                      <Option value="123">123</Option>
                    </Select>
                  </div>
                </Col>
              </Row>
            </div>
          </div>
        </PageHeader>
        <Table
          title={() => (
            <div>
              <Icon type="plus" />
              新增
            </div>
          )}
          dataSource={dataSource}
          columns={columns}
        />
      </div>
    );
  }
}
