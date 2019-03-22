import React, { PureComponent } from "react";
import { Menu, Icon, Button, Input, Radio, List, Avatar, Carousel } from "antd";
import SiderMenu from "../../../components/SiderMenu";
import styles from "./index.less";

export default class welcome extends PureComponent {
  render() {
    const imgs1 = [
      {
        title: "区域监管"
      },
      {
        title: "项目监管"
      },
      {
        title: "拍照"
      },
      {
        title: "外业复核"
      },
      {
        title: "责任追究"
      },
      {
        title: "监督检查"
      }
    ];
    const imgs2 = [
      {
        title: "水库督查"
      }
    ];
    const imgs3 = [
      {
        title: "水政监察"
      }
    ];
    return (
      <div>
        <SiderMenu active="101" />
        <Carousel autoplay className={styles.carousel}>
          <div className={styles.cont1}>
            <p>
              <span>生产建设项目水土保持信息化监管系统</span>
              <span>V1.0</span>
              <span>V2.0</span>
              <span>管理后台</span>
            </p>
            <div className={styles.code}>
              {imgs1.map((item, index) => (
                <dl key={index}>
                  <dt>
                    <img src="./img/code.png" />
                  </dt>
                  <dd>{item.title}APP</dd>
                </dl>
              ))}
            </div>
          </div>
          <div className={styles.cont2}>
            <p>
              <span>小水库督查系统</span>
            </p>
            <div className={styles.code}>
              {imgs2.map((item, index) => (
                <dl key={index}>
                  <dt>
                    <img src="./img/code.png" />
                  </dt>
                  <dd>{item.title}APP</dd>
                </dl>
              ))}
            </div>
          </div>
          <div className={styles.cont3}>
            <p>
              <span>水政动态监管平台</span>
            </p>
            <div className={styles.code}>
              {imgs3.map((item, index) => (
                <dl key={index}>
                  <dt>
                    <img src="./img/code.png" />
                  </dt>
                  <dd>{item.title}APP</dd>
                </dl>
              ))}
            </div>
          </div>
        </Carousel>
        <footer className={styles.footer}>
          <p>
            <b>珠江水利科学研究院</b>
          </p>
          <p>
            <b>珠江流域水土保持监测中心站</b>
          </p>
          <p>致力于水土保持、水政、安检等水行政管理的信息化技术支撑</p>
          <p>以遥感、GIS技术的集成为特色</p>
        </footer>
      </div>
    );
  }
}
