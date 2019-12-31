import React, { PureComponent } from "react";
import { connect } from "dva";
import jQuery from "jquery";
import { Modal, Steps, Button, Table, Input, Icon, Tooltip } from "antd";

// import styles from "./style/ProjectList.less";
const { Step } = Steps;

@connect(({}) => ({}))
export default class MergeProjectModal extends PureComponent {
  constructor(props) {
    super(props);
    this.state = { loading: false, visible: false };
  }

  handleOk = () => {
    this.setState({ loading: true });
    setTimeout(() => {
      this.setState({ loading: false, visible: false });
    }, 3000);
  };

  handleCancel = () => {
    this.setState({ visible: false });
  };
  componentDidMount() {}
  componentDidUpdate(prevProps) {
    // if (prevProps.modalVisible !== this.props.modalVisible) {
    //   this.setState({ visible: this.props.modalVisible });
    //   return true;
    // }
  }

  componentWillUnmount() {}
  render() {
    const { showModal } = this.props;
    const { visible, loading } = this.state;
    console.log(visible);
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
        title: "姓名",
        dataIndex: "name",
        key: "name"
      },
      {
        title: "年龄",
        dataIndex: "age",
        key: "age"
      },
      {
        title: "住址",
        dataIndex: "address",
        key: "address"
      }
    ];

    return (
      <Modal
        visible={this.props.modalVisible}
        title="项目合并"
        onOk={this.handleOk}
        onCancel={this.handleCancel}
        footer={[
          <Button key="back" onClick={() => showModal(false)}>
            Return
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={loading}
            onClick={this.handleOk}
          >
            Submit
          </Button>
        ]}
      >
        <div>
          <Steps current={1}>
            <Step description="首先，请确认需要合并的项目" />
            <Step description="然后，勾选需要保留的项目" />
            <Step description="确认" />
          </Steps>
        </div>
        <div>
          <Table dataSource={dataSource} columns={columns} />
        </div>
        <div>
          <p>Some contents...</p>
          <p>Some contents...</p>
          <p>Some contents...</p>
          <p>Some contents...</p>
          <p>Some contents...</p>
        </div>
      </Modal>
    );
  }
}
