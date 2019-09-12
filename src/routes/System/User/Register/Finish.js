import React, { PureComponent } from "react";
import { Button, Avatar, Layout } from "antd";

const { Footer, Content } = Layout;

//完成
export default class finish extends PureComponent {
  render() {
    const { show, data } = this.props;
    return (
      <Layout
        style={{ display: show ? "block" : "none", backgroundColor: "#fff" }}
      >
        <Content style={{ textAlign: "center" }}>
          <Avatar
            style={{ backgroundColor: "#87d068" }}
            icon="check"
            size={80}
          />
          <p style={{ margin: 30, fontSize: 30 }}>成功</p>
          <div>
            {data.map((item, index) => (
              <p key={index}>
                <b>{item.name}：</b>
                <span>{item.cont}</span>
              </p>
            ))}
          </div>
        </Content>
        <Footer
          style={{
            backgroundColor: "transparent",
            position: "absolute",
            bottom: 20,
            left: "50%",
            transform: "translateX(-50%)"
          }}
        >
          <Button
            type="primary"
            style={{ marginRight: 20 }}
            onClick={() => {
              this.props.saveState({ show: false });
            }}
          >
            完成
          </Button>
        </Footer>
      </Layout>
    );
  }
}
