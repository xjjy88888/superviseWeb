import React, { PureComponent } from "react";

import { Steps } from "antd";

import styles from "./index.less";

const { Step } = Steps;

export default class MySteps extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {}

  gotoDetail = () => {};

  render() {
    const {} = this.props;
    return (
      <div className={styles.steps}>
        <Steps current={1}>
          <Step title="Finished" description="This is a description." />
          <Step
            title="In Progress"
            subTitle="Left 00:00:08"
            description="This is a description."
          />
          <Step title="Waiting" description="This is a description." />
        </Steps>
      </div>
    );
  }
}
