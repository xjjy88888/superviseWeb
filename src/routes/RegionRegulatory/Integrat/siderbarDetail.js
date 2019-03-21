import React, { PureComponent } from "react";
import { Menu, Icon, Button, Input, Radio, List, Avatar } from "antd";
import emitter from "../../../utils/event";
import styles from "./sidebar.less";
import "leaflet/dist/leaflet.css";

const list = [
  {
    title: "新建铁路广州至香港专线",
    owner: "广州铁路局",
    reply: "广州水利局"
  },
  {
    title: "新建铁路广州至香港专线",
    owner: "广州铁路局",
    reply: "广州水利局"
  },
  {
    title: "新建铁路广州至香港专线",
    owner: "广州铁路局",
    reply: "广州水利局"
  },
  {
    title: "新建铁路广州至香港专线",
    owner: "广州铁路局",
    reply: "广州水利局"
  },
  {
    title: "新建铁路广州至香港专线",
    owner: "广州铁路局",
    reply: "广州水利局"
  },
  {
    title: "新建铁路广州至香港专线",
    owner: "广州铁路局",
    reply: "广州水利局"
  },
  {
    title: "新建铁路广州至香港专线",
    owner: "广州铁路局",
    reply: "广州水利局"
  },
  {
    title: "新建铁路广州至香港专线",
    owner: "广州铁路局",
    reply: "广州水利局"
  }
];
export default class siderbarDetail extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      show:false,
      showDetail: false,
      key: "project",
      inputDisabled: true,
      placeholder: "项目",
      sort: [
        {
          title: "名称",
          value: "name"
        },
        {
          title: "操作时间",
          value: "time1"
        },
        {
          title: "立项级别",
          value: "level"
        },
        {
          title: "筛选",
          value: "search1"
        }
      ],
      listData: list
    };
    this.map = null;
  }
  componentDidMount() {
    this.eventEmitter = emitter.addListener("showSiderbarDetail", isShow => {
      this.setState({
        show:isShow
      });
    });
  }

  componentWillUnmount() {
    emitter.removeListener(this.eventEmitter);
  }

  switchShow = () => {
    this.setState({ show: !this.state.show, showDetail: false });
  };

  switchShowDetail = () => {
    this.setState({ showDetail: !this.state.showDetail });
  };

  switchMenu = e => {
    if (e.key === "project") {
      this.setState({
        placeholder: "项目",
        listData: list,
        sort: [
          {
            title: "名称",
            value: "name"
          },
          {
            title: "操作时间",
            value: "time1"
          },
          {
            title: "立项级别",
            value: "level"
          },
          {
            title: "筛选",
            value: "search1"
          }
        ]
      });
    } else if (e.key === "spot") {
      this.setState({
        placeholder: "图斑",
        listData: list.slice(0, 3),
        sort: [
          {
            title: "编号",
            value: "number"
          },
          {
            title: "操作时间",
            value: "time2"
          },
          {
            title: "复核状态",
            value: "state"
          },
          {
            title: "筛选",
            value: "search2"
          }
        ]
      });
    } else {
      this.setState({
        placeholder: "标注点",
        listData: list.slice(0, 1),
        sort: [
          {
            title: "标注点",
            value: "point"
          },
          {
            title: "筛选",
            value: "search3"
          }
        ]
      });
    }
    this.setState({
      key: e.key
    });
  };

  render() {
    const {
      show,
      placeholder,
      sort,
      listData,
      showDetail,
      inputDisabled
    } = this.state;

    const tabs = [
      {
        title: "项目",
        key: ["project"]
      },
      {
        title: "图斑",
        key: ["spot"]
      },
      {
        title: "标注点",
        key: ["point"]
      }
    ];

    return (
      <div className={styles.sidebar} style={{ left: show ? 350 : -350 }}>
        <Icon
          className={styles.icon}
          type="left"
          style={{ fontSize: 30, display: show ? "block" : "none" }}
          onClick={this.switchShow}
        />
        <div>
          {this.state.msg}
          我是非嵌套 1 号
        </div>
      </div>
    );
  }
}
