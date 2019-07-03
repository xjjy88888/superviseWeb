import React, { PureComponent } from "react";
import {
  Steps,
  Form,
  Icon,
  Input,
  Button,
  Table,
  TreeSelect,
  Select,
  message,
  DatePicker,
  Radio,
  Avatar,
  Tree,
  Typography,
  Layout
} from "antd";
import moment from "moment";
import Systems from "../../../../components/Systems";

const { Title } = Typography;
const { Header, Footer, Sider, Content } = Layout;

export default class review extends PureComponent {
  state = {
    state: 0,
    showAdd: false
  };

  next = v => {
    this.setState({ state: v });
  };

  showAdd = v => {
    this.setState({ showAdd: v });
  };

  render() {
    const { state, showAdd } = this.state;
    const columns = [
      {
        title: "序号",
        dataIndex: "key"
      },
      {
        title: "用户名称",
        dataIndex: "name"
      },
      {
        title: "登录名",
        dataIndex: "login"
      },
      {
        title: "联系电话",
        dataIndex: "phone"
      },
      {
        title: "住址",
        dataIndex: "address"
      },
      {
        title: "操作",
        key: "operation",
        render: (item, record) => (
          <span>
            <a style={{ marginRight: 20 }}>编辑</a>
            <a>删除</a>
          </span>
        )
      }
    ];

    const data = [
      {
        key: "1",
        name: "水利部",
        login: "水利部办事员",
        phone: "135 6666 9999",
        address: "广东省广州市天河区"
      },
      {
        key: "2",
        name: "水利部",
        login: "水利部办事员",
        phone: "135 6666 9999",
        address: "广东省广州市天河区"
      },
      {
        key: "3",
        name: "水利部",
        login: "水利部办事员",
        phone: "135 6666 9999",
        address: "广东省广州市天河区"
      }
    ];

    const rowSelection = {
      onChange: (selectedRowKeys, selectedRows) => {
        console.log(selectedRows);
      }
    };

    return (
      <Systems>
        <span style={{ float: "right" }}>
          <Button
            type="primary"
            shape="circle"
            icon="plus"
            style={{ marginLeft: 10 }}
            onClick={() => {
              this.props.next(0);
              this.props.showAdd(true);
            }}
          />
          <Button
            type="primary"
            shape="circle"
            icon="delete"
            style={{ marginLeft: 10 }}
            onClick={() => {
              message.info("开始删除");
            }}
          />
        </span>
        <Table
          columns={columns}
          dataSource={data}
          rowSelection={rowSelection}
        />
      </Systems>
    );
  }
}
