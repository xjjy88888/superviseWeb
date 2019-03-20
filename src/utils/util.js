import moment from "moment";

const dateFormat = value => {
  return value ? moment(parseInt(value, 0)).format("YYYY-MM-DD") : "";
};

const dateTimeFormat = value => {
  return value ? moment(parseInt(value, 0)).format("YYYY-MM-DD HH:mm:ss") : "";
};

const numberFormat = (value, e) => {
  const times = e ? 10 ** e : 1;
  return Math.round(value * times) / times;
};

export { numberFormat, dateFormat, dateTimeFormat };
