import React, { PureComponent } from "react";

import { Card, Tag, Row, Col, Divider, Empty, Button } from "antd";

import styles from "./index.less";

class Detail extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {}

  render() {
    const { list } = this.props;
    const {} = this.state;
    return (
      <div className={styles["supervise-detail-card"]}>
        {list && list.length ? (
          list.map((item, index) => (
            <div>
              <Card
                size="small"
                title={
                  <div>
                    <span>检查日期：</span>
                    <span>2020-12-22</span>
                  </div>
                }
                extra={<Tag color="#f50">未答复</Tag>}
                // style={{ width: 300 }}
              >
                <Row gutter={16}>
                  <Col className="gutter-row" span={6}>
                    <div className="gutter-box">
                      <span>检查单位：</span>
                      <span>贵州省水利厅</span>
                    </div>
                  </Col>
                  <Col className="gutter-row" span={6}>
                    <div className="gutter-box">
                      {" "}
                      <span>检查单位：</span>
                      <span>贵州省水利厅</span>
                    </div>
                  </Col>
                  <Col className="gutter-row" span={6}>
                    <div className="gutter-box">
                      {" "}
                      <span>检查单位：</span>
                      <span>贵州省水利厅</span>
                    </div>
                  </Col>
                  <Col className="gutter-row" span={6}>
                    <div className="gutter-box">
                      {" "}
                      <span>检查单位：</span>
                      <span>贵州省水利厅</span>
                    </div>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col className="gutter-row" span={6}>
                    <div className="gutter-box">
                      {" "}
                      <span>检查单位：</span>
                      <span>贵州省水利厅</span>
                    </div>
                  </Col>
                  <Col className="gutter-row" span={6}>
                    <div className="gutter-box">
                      {" "}
                      <span>检查单位：</span>
                      <span>贵州省水利厅</span>
                    </div>
                  </Col>
                  <Col className="gutter-row" span={6}>
                    <div className="gutter-box">
                      {" "}
                      <span>检查单位：</span>
                      <span>贵州省水利厅</span>
                    </div>
                  </Col>
                  <Col className="gutter-row" span={6}>
                    <div className="gutter-box">
                      {" "}
                      <span>检查单位：</span>
                      <span>贵州省水利厅</span>
                    </div>
                  </Col>
                </Row>

                <Row>
                  <Col span={6}>
                    <div className="gutter-box">
                      {" "}
                      <span>整改报告：</span>
                      <span>xxx</span>
                    </div>
                  </Col>
                  <Col style={{ textAlign: "right" }}>
                    <Button style={{ margin: "0 20px" }} disabled>
                      已接收
                    </Button>
                  </Col>
                </Row>
              </Card>

              {list && list.length ? <Divider dashed /> : null}
            </div>
          ))
        ) : (
          <Empty />
        )}
      </div>
    );
  }
}
export default Detail;
