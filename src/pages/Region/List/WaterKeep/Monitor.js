import React, { PureComponent } from "react";
import { connect } from "dva";

import { Button, Icon, PageHeader, Descriptions, Alert, Upload } from "antd";

// 项目监测
@connect(({ waterKeep }) => ({
  waterKeep
}))
export default class Monitor extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      show: false,
      isEdit: false,
      fileList: [
        {
          uid: "1",
          name: "2019年第一季度报告.pdf    2019-12-31",
          status: "done",
          time: "2019-12-31",
          url:
            "https://www.xiaopiu.com/web/byId?type=project&id=5c37260418269b0f6c3ba430"
        },
        {
          uid: "2",
          name: "2019年第二季度报告.pdf    2019-12-31",
          status: "done",
          time: "2019-12-31",
          url:
            "https://www.xiaopiu.com/web/byId?type=project&id=5c37260418269b0f6c3ba430"
        },
        {
          uid: "3",
          name: "2019年第三季度报告.pdf    2019-12-31",
          status: "done",
          time: "2019-12-31",
          url:
            "https://www.xiaopiu.com/web/byId?type=project&id=5c37260418269b0f6c3ba430"
        }
      ],
      ruleList: [
        {
          uid: "1",
          name: "监测实施细则1.pdf",
          status: "done",
          url:
            "https://www.xiaopiu.com/web/byId?type=project&id=5c37260418269b0f6c3ba430"
        },
        {
          uid: "2",
          name: "监测实施细则2.pdf",
          status: "done",
          url:
            "https://www.xiaopiu.com/web/byId?type=project&id=5c37260418269b0f6c3ba430"
        }
      ]
    };
  }

  componentDidMount() {}

  hide = () => {
    const { dispatch } = this.props;
    dispatch({
      type: "waterKeep/save",
      payload: {
        showwaterKeepPage: ""
      }
    });
  };

  render() {
    const { isEdit, fileList, ruleList } = this.state;
    const AlertList = [
      {
        type: "error",
        msg: "项目监测 第二季度报告 距离提交报告已过期90日"
      },
      {
        type: "warning",
        msg: "项目监测 第三季度报告 距离报告提交还有3日"
      }
    ];
    return (
      <div
        style={{
          position: "absolute",
          left: 350,
          top: 46,
          zIndex: 1002,
          width: window.innerWidth - 350,
          height: "100%",
          backgroundColor: `#fff`,
          padding: 20
        }}
      >
        <PageHeader
          onBack={this.hide}
          title="项目监测"
          subTitle="项目监测"
          extra={[
            <Button
              key="1"
              onClick={() => {
                this.setState({ isEdit: false });
              }}
            >
              查看
            </Button>,
            <Button
              key="2"
              type="primary"
              onClick={() => {
                this.setState({ isEdit: true });
              }}
            >
              编辑
            </Button>
          ]}
        >
          {AlertList.map((item, index) => (
            <Alert
              key={index}
              message={item.msg}
              type={item.type}
              showIcon
              banner
            />
          ))}
        </PageHeader>
        <div style={{ margin: "0 20px" }}>
          <Descriptions>
            <Descriptions.Item label="监测单位">花都区水务局</Descriptions.Item>
            <Descriptions.Item label="备注">
              这是个备注， 这是个备注， 这是个备注， 这是个备注， 这是个备注
            </Descriptions.Item>
          </Descriptions>
        </div>
        <div style={{ margin: 20 }}>
          <Upload
            action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
            onChange={({ file, fileList }) => {}}
            fileList={ruleList}
          >
            {isEdit ? (
              <Button>
                <Icon type="upload" />
                上传监测实施细则
              </Button>
            ) : null}
          </Upload>
        </div>
        <div style={{ margin: 20 }}>
          <Upload
            action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
            onChange={({ file, fileList }) => {}}
            fileList={fileList}
          >
            {isEdit ? (
              <Button>
                <Icon type="upload" />
                上传季报、年报
              </Button>
            ) : null}
          </Upload>
        </div>
      </div>
    );
  }
}
