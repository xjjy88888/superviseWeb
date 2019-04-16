import config from "../config";
import request from "../utils/request";
import CryptoJS from "crypto-js";

// 登录
export async function login(params) {
  const { username, password } = params;
  const passwordMd5 = CryptoJS.MD5(password).toString();
  return request(
    `${config.url.login}?username=${username}&password=${passwordMd5}`,
    {
      method: "GET"
    }
  );
}
