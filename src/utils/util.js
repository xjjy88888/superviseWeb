import moment from "moment";

const dateFormat = v => {
  return v ? moment(new Date(v).getTime()).format("YYYY-MM-DD") : "";
};

const dateTimeFormat = v => {
  return v ? moment(new Date(v).getTime()).format("YYYY-MM-DD HH:mm:ss") : "";
};

export { dateFormat, dateTimeFormat };
