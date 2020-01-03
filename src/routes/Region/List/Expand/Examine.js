/* eslint-disable array-callback-return */
import React, { PureComponent } from "react";
import { createForm } from "rc-form";
import { connect } from "dva";
import jQuery from "jquery";
import {
  Icon,
  Button,
  Input,
  Form,
  Modal,
  Typography,
  message,
  Upload,
  notification,
  Cascader,
  Radio
} from "antd";
import Spins from "../../../../components/Spins";
import config from "../../../../config";
import emitter from "../../../../utils/event";
import {
  getDictList,
  accessToken,
  getFile,
  getLabel,
  formErrorMsg
} from "../../../../utils/util";

let self;
const { Text } = Typography;

const formItemLayout = {
  labelCol: { span: 7 },
  wrapperCol: { span: 16 }
};

const list = [
  {
    label: "下达整改意见",
    value: "isIssueCorrectionOpinion",
    photoName: "整改意见",
    photo: "correctionOpinionId",
    fileSource: "CorrectionOpinion"
  },
  {
    label: "整改完成",
    value: "isIssueCorrectionCompleted",
    photoName: "整改报告",
    photo: "correctionReportId",
    fileSource: "CorrectionReport"
  },
  {
    label: "立案",
    value: "isRegister",
    photoName: "立案文件",
    photo: "registerFileId",
    fileSource: "RegisterFile"
  },
  {
    label: "结案",
    value: "isSettle",
    photoName: "结案文件",
    photo: "settleFileId",
    fileSource: "SettleFile"
  }
];

@createForm()
@connect(({ project, user }) => ({
  project,
  user
}))
export default class Examine extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      show: false,
      loading: false,
      InvestigateFileId: 0,
      photoList: [],
      record: {
        expand: {}
      }
    };
  }

  componentDidMount() {
    self = this;
    const {
      link,
      form: { setFieldsValue }
    } = this.props;

    link(this);

    this.eventEmitter = emitter.addListener("siteLocationBack", data => {
      setFieldsValue({
        pointX: data.longitude, //经度
        pointY: data.latitude //维度
      });
    });
  }

  show = record => {
    console.log("显示项目查处", record);
    const {
      form: { resetFields },
      user: { dictList }
    } = this.props;
    jQuery("#Examine").animate({ left: 350 });
    resetFields();
    this.setState({ record });
    const photo = record.expand.investigateFile;
    let photoList = [];
    if (photo) {
      photoList = photo.child.map(item => {
        return {
          uid: item.id,
          name: item.fileName,
          fileExtend: item.fileExtend,
          url: config.url.annexPreviewUrl + item.id,
          latitude: item.latitude,
          longitude: item.longitude,
          azimuth: item.azimuth,
          fileSource: item.fileSource,
          status: "done"
        };
      });
    }
    const laebl = getLabel(
      record.expand.investigationResultId,
      dictList,
      "dictTableValue",
      "id"
    );
    list.map(item => {
      this.setState({
        ["show" + item.value]: Boolean(record.expand[item.value])
      });
    });
    this.setState({
      InvestigateFileId: photo ? photo.id : 0,
      photoList,
      fileSource:
        laebl === "已编报方案"
          ? "SchemeApprovalFile"
          : laebl === "依法依规可不编报方案"
          ? "PolicySupportFile"
          : "不合规"
    });
  };

  hide = () => {
    jQuery("#Examine").animate({ left: -500 });
  };

  submit = payload => {
    const { dispatch } = this.props;
    const { record } = this.state;
    this.setState({ loading: true });
    dispatch({
      type: "project/projectExamine",
      payload,
      callback: success => {
        this.setState({ loading: false });
        if (success) {
          emitter.emit("projectInfoRefresh", {
            projectId: record.id
          });
          this.hide();
        }
      }
    });
  };

  domPhoto = (fileSource, photoName) => {
    const { dispatch } = this.props;
    const { photoList: photo, InvestigateFileId, record } = this.state;
    const photoList = photo.filter(i => i.fileSource === fileSource);
    // console.log(fileSource, photo, photoList);
    return (
      <div
        style={{
          minHeight: photoList.length ? 120 : 0,
          margin: "20px 30px 0 30px"
        }}
      >
        <Upload
          action={config.url.annexUploadUrl}
          headers={{ Authorization: `Bearer ${accessToken()}` }}
          data={{ Id: InvestigateFileId, fileSource }}
          listType="picture-card"
          fileList={photoList}
          onSuccess={v => {
            this.setState({
              InvestigateFileId: v.result.id
            });
            const item = v.result.child[0];
            const obj = {
              uid: item.id,
              name: item.fileName,
              url: config.url.annexPreviewUrl + item.id,
              latitude: item.latitude,
              longitude: item.longitude,
              azimuth: item.azimuth,
              fileExtend: item.fileExtend,
              fileSource: fileSource,
              status: "done"
            };
            this.setState({
              photoList: [...photo, obj]
            });
          }}
          onError={(v, response) => {
            notification["error"]({
              message: `附件上传失败：${response.error.message}`
            });
          }}
          onPreview={file => {
            console.log(file.fileExtend, file);
            switch (file.fileExtend) {
              case "pdf":
                window.open(file.url);
                break;
              case "doc":
              case "docx":
              case "xls":
              case "xlsx":
              case "ppt":
              case "pptx":
                window.open(file.url + "&isDown=true");
                break;
              default:
                this.setState({
                  previewImage: file.url || file.thumbUrl,
                  previewVisible_min: true
                });
                if (file.latitude || file.longitude) {
                  emitter.emit("imgLocation", {
                    Latitude: file.latitude,
                    Longitude: file.longitude,
                    direction: file.azimuth,
                    show: true
                  });
                } else {
                  getFile(file.url);
                }
                break;
            }
          }}
          onChange={({ fileList }) => {
            console.log("fileList", fileList);
            const photoList = fileList.map(item => {
              return {
                ...item,
                status: "done"
              };
            });
            this.setState({ photoList });
          }}
          onRemove={file => {
            return new Promise((resolve, reject) => {
              dispatch({
                type: "annex/annexDelete",
                payload: {
                  FileId: file.uid,
                  Id: record.expand.investigateFile
                    ? record.expand.investigateFile.id
                    : InvestigateFileId
                },
                callback: success => {
                  if (success) {
                    resolve();
                  } else {
                    reject();
                  }
                }
              });
            });
          }}
        >
          <div>
            <div className="ant-upload-text">
              <Button type="div" icon="plus">
                上传{photoName}
              </Button>
            </div>
          </div>
        </Upload>
      </div>
    );
  };

  resultInit = () => {
    const {
      user: { dictList }
    } = this.props;
    const { record } = this.state;
    const id = record.expand.investigationResultId;
    if (!id) {
      return [];
    }
    const upId = getLabel(
      record.expand.investigationResultId,
      dictList,
      "dictTypeName",
      "id"
    );
    return [upId, id];
  };

  render() {
    const {
      dispatch,
      form: { getFieldDecorator, validateFields },
      user: { dictList }
    } = this.props;

    const { record, loading, fileSource, InvestigateFileId } = this.state;

    const complianceOk = getDictList("查处结果-合规", dictList);
    const complianceNo = getDictList("查处结果-不合规", dictList);

    const examineResult = [
      { label: "合规", value: "查处结果-合规", children: complianceOk },
      { label: "不合规", value: "查处结果-不合规", children: complianceNo }
    ];

    return (
      <div
        id="Examine"
        style={{
          position: `absolute`,
          top: 0,
          left: -500,
          zIndex: 1000,
          width: 450,
          height: `100%`,
          paddingTop: 60,
          borderLeft: "solid 1px #ddd",
          backgroundColor: `#fff`
        }}
        ref={this.saveRef}
      >
        <Spins show={loading} />
        <Icon
          type="left"
          style={{
            fontSize: 30,
            // display: show ? "block" : "none",
            position: `absolute`,
            right: -50,
            top: `48%`,
            backgroundColor: `rgba(0, 0, 0, 0.5)`,
            borderRadius: `50%`,
            padding: 10,
            cursor: `pointer`
          }}
          onClick={() => {
            this.hide();
          }}
        />
        <span
          style={{
            position: "absolute",
            color: "#1890ff",
            right: 25,
            top: 60
          }}
        >
          <Button
            icon="check"
            shape="circle"
            style={{
              color: "#1890ff",
              fontSize: 18
            }}
            onClick={() => {
              // submit
              validateFields((error, v) => {
                console.log(error, v);
                if (error) {
                  formErrorMsg(error);
                } else {
                  const data = {
                    ...v,
                    id: record.id,
                    investigationResultId: v.investigationResultId[1],
                    InvestigateFileId,
                  };
                  this.submit(data);
                }
              });
            }}
          />
          <Button
            icon="rollback"
            shape="circle"
            style={{
              color: "#1890ff",
              fontSize: 18
            }}
            onClick={() => {
              Modal.confirm({
                title: `确定放弃填写项目查处吗？`,
                content: "",
                onOk() {
                  self.hide();
                },
                onCancel() {}
              });
            }}
          />
        </span>
        <b style={{ fontSize: 16, padding: "0 50px" }}>项目查处</b>
        <Form
          style={{
            height: window.innerHeight - 100,
            paddingTop: 20,
            overflow: "auto"
          }}
        >
          <Form.Item
            label={
              <span>
                查处结果 <Text type="danger">*</Text>
              </span>
            }
            {...formItemLayout}
          >
            {getFieldDecorator("investigationResultId", {
              rules: [{ required: true, message: "查处结果不能为空！" }],
              initialValue: this.resultInit()
            })(
              <Cascader
                showSearch
                options={examineResult}
                placeholder=""
                onChange={(value, label) => {
                  if (value.length) {
                    // console.log(label[1].label);
                    const l = label[1].label;
                    if (l === "已编报方案") {
                      this.setState({ fileSource: "SchemeApprovalFile" });
                    } else if (l === "依法依规可不编报方案") {
                      this.setState({ fileSource: "PolicySupportFile" });
                    } else {
                      this.setState({ fileSource: "不合规" });
                    }
                  } else {
                    this.setState({ fileSource: null });
                  }
                }}
              />
            )}
          </Form.Item>
          <div
            style={{
              display:
                fileSource === "SchemeApprovalFile" ||
                fileSource === "PolicySupportFile"
                  ? "block"
                  : "none"
            }}
          >
            {this.domPhoto(
              fileSource,
              fileSource === "SchemeApprovalFile"
                ? "方案批复文件"
                : fileSource === "PolicySupportFile"
                ? "政策支撑文件"
                : ""
            )}
          </div>
          <div
            style={{
              display:
                fileSource &&
                fileSource !== "SchemeApprovalFile" &&
                fileSource !== "PolicySupportFile"
                  ? "block"
                  : "none"
            }}
          >
            {list.map((item, index) => {
              return (
                <div style={{ margin: 10 }} key={index}>
                  <span style={{ margin: 10 }}>
                    {index + 1}、是否{item.label}：{record.expand[item.value]}
                  </span>
                  {getFieldDecorator(item.value, {
                    initialValue: record.expand[item.value]
                  })(
                    <Radio.Group
                      options={[
                        { label: "是", value: true },
                        { label: "否", value: false }
                      ]}
                      onChange={v => {
                        // console.log(v.target.value);
                        if (v.target.value) {
                        }
                        this.setState({
                          ["show" + item.value]: v.target.value
                        });
                      }}
                    />
                  )}
                  <div
                    style={{
                      height: this.state["show" + item.value] ? "auto" : 0,
                      overflow: "hidden"
                    }}
                  >
                    {this.domPhoto(item.fileSource, item.photoName)}
                  </div>
                </div>
              );
            })}
          </div>
        </Form>
      </div>
    );
  }
}
