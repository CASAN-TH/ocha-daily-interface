var request = require("request");
const fetch = require("node-fetch");

const authKey =
  " TGS eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJjYWxsZXIiOiJsb2dpYy1jbGllbnQiLCJhZGRyZXNzIjowLCJzaG9wX2lkIjo2NjM0NCwiYXBwX3R5cGUiOjIsInVpZCI6Mjc2MjAxLCJjbGllbnRfdHlwZSI6NTEyLCJleHAiOjE1OTYzNDU0NTgsImRldmljZV9pZCI6MjM1MDN9.LO2hzLK-jOFG924I1xunZoszo0qIPyTUON_8wR5eg00fsFsW2JsZbXdHFIBt9o7qWVFG7gT-kMyOSNXbxkUa0Q6AJTMBqe-gZZ-H0-oxKLBCDuDV7nBy3u5XtU2mHsv7cEn84nVvrRPieW6MdOZ-nfC2UntQBIMp0K7xr4xX_iUA9ddZONwbheOZeipxM4aRNyG_BkhNrnxdcC3qMkJRRmp-NPQAT5js-OYNZIoptL0U1dsmvGl0U8zCLXv8qP4oZGF6cVs7FQhaDBuXd9TCycWvsuOC3Yf13Xc5i7Knn60hjdlX3tFDKs44Ln24DvFlZw_WLB44hGPWoLc_7v3d9w";
const cookie =
  " posocha=MTU5NjMzNDY5NnxOd3dBTkZSSFJrUkxXak5JVERKQlZFaEpVelZOVHpJMlZFczJNMUZQTkU5WFR6TlFTa2xOTkZNM1dUVlJSMGREV0ZaU1YwdFFWMEU9fFBG0gShagp_mpJ_Er544nu3ldUougVutm4nVv6yFgWy";

// 0. login for get cookie
exports.loginOcha = async () => {
  //https://live.ocha.in.th/api/auth/login/prepare/
  //Method Post
  var bodyLogin = {
    auth_type: 0,
    account_type: 101,
    account: "thamturakit",
    client_type: 512,
    client_version: 30000,
    shop_mobile_no: "66818548165"
  };
  var options = {
    method: "POST",
    headers: {
      Authorization: authKey,
      cookie: cookie
    },
    body: bodyLogin,
    json: true
  };
  const response = await fetch(
    "https://live.ocha.in.th/api/auth/login/prepare/",
    options
  );

  const result = await response.json();
  const posocha = response.headers
    .get("set-cookie")
    .split(";")[0]
    .replace("posocha=", "");

  return posocha;
};

//0.1 get token
//https://live.ocha.in.th/api/tgs/token/get/
exports.getOchaToken = async posocha => {
  var options = {
    method: "POST",
    headers: {
      Authorization: authKey,
      cookie: cookie
    },
    body: JSON.stringify({}),
    json: true
  };
  const response = await fetch(
    "https://live.ocha.in.th/api/tgs/token/get/",
    options
  );

  const result = await response.json();

  return result;
};

// 1. อ่านข้อมูลหน้าร้านทั้งหมดจาก ocha owner account
exports.getOchaShopList = async () => {
  var options = {
    method: "POST",
    headers: {
      Authorization: authKey,
      cookie: cookie
    },
    body: JSON.stringify({ branch_list_info_version: 0 }),
    json: true
  };

  const response = await fetch(
    "https://live.ocha.in.th/api/shop/branch/get/",
    options
  );
  try {
    const result = await response.json();
    return result;
  } catch (error) {
    return { error_code: 99, reason: 'cookie is expired', display_text: 'cookie is expired !!' }
  }
};

// 2. Auth เข้าทีละร้านเพื่ออ่าน  Set-Cookie ใน Response Header
// 3. อ่านข้อมูล Orders แต่ละร้านค้าจาก cookies param
exports.getDailyOrdersByShop = async (shopid, start_time, end_time) => {
  // console.log(shopid);
  var options = {
    method: "POST",
    headers: {
      Authorization: authKey,
      cookie: cookie
    },
    body: JSON.stringify({
      branch_shop_id: shopid
    }),
    json: true
  };
  const response = await fetch(
    "https://live.ocha.in.th/api/auth/branch/",
    options
  );

  const result = await response.json();
  const posocha = response.headers
    .get("set-cookie")
    .split(";")[0]
    .replace("posocha=", "");
  //   console.log(response.headers.get("set-cookie").split(";")[0].replace("posocha=", ""));
  const orders = await interfaceOcha(posocha, start_time, end_time);

  return orders;
  // .then(response => {
  //       const posocha = response.headers
  //         .get("set-cookie")
  //         .split(";")[0]
  //         .replace("posocha=", "");
  //       console.log(posocha);
  //       //   const orders = await interfaceOcha(posocha, start_time, end_time);

  //       return posocha;
  //     //   interfaceOcha(posocha, start_time, end_time).then(orders => {
  //     //     return orders;
  //     //   });
  //     }
  //   );

  //   const result = await response.headers.json();
  //   console.log(result)
  //   return result;
};

interfaceOcha = async (posocha, start_time, end_time) => {
  let orders = [];
  const url = "https://live.ocha.in.th/api/transaction/history/";
  const cookie = ` _ga=GA1.3.1500102785.1579786690; _fbp=fb.2.1579786691460.187124307; _gid=GA1.3.1076144380.1580998410; __utma=21896485.1500102785.1579786690.1580998410.1580998410.1; __utmc=21896485; __utmz=21896485.1580998410.1.1.utmcsr=google|utmccn=(organic)|utmcmd=organic|utmctr=(not%20provided); posocha=${posocha}`;

  let body = {
    column_filter: {
      uid_list: null,
      payment_type_list: null,
      status_list: [0, 1, 4, 64],
      dine_type_list: [1, 2],
      include_e_payment: true,
      payment_status_list: [0, 2, 6, 7]
    },
    filter: { start_time: start_time, end_time: end_time },
    pagination: {
      page_size: 15,
      pagination_result_count: 100,
      page_begin: null
    }
  };

  const options = {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      Authorization: authKey,
      cookie: cookie
    }
  };

  const response = await fetch(url, options);

  // 3.1. อ่านข้อมูลหน้าแรกเพื่อให้ได้ข้มูลเพจทั้งหมด json.pagination.page_begins
  const json1 = await response.json();
  if (!json1.pagination) return orders;
  const promise = json1.pagination.page_begins.map(async (pbg, idx) => {
    // 3.2. อ่านข้อมูล Orders แต่ละเพจ
    body.pagination.page_begin = pbg;
    const options = {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        Authorization: authKey,
        cookie: cookie
      }
    };
    const response = await fetch(url, options);
    const json = await response.json();
    // console.log(json.orders.length);

    // 3.3. Map ข้อมูล Orders ตามโครงสร้างของเรา
    const promiseOrd = json.orders.map(async (od, idx) => {
      if (od.order.status === 0) {
        orders.push(od);
      }
    });
    await Promise.all(promiseOrd);
  });

  // 3.4.  รอ loop อ่านข้อมูลจนครบตามสัญญา (promise)
  await Promise.all(promise);
    // console.log(JSON.stringify(orders));
  return orders;
};
