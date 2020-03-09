var request = require("request");
const fetch = require("node-fetch");

const authKey =
  " TGS eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJjYWxsZXIiOiJsb2dpYy1jbGllbnQiLCJhZGRyZXNzIjowLCJzaG9wX2lkIjo2NjM0NCwiYXBwX3R5cGUiOjIsInVpZCI6Mjc2MjAxLCJjbGllbnRfdHlwZSI6NTEyLCJleHAiOjE1ODEwNzg2MTMsImRldmljZV9pZCI6MjM1MDN9.Oz1kTynYMkmSxOpc8wrPiAPSqE0AFqSFC7h1qSjsLTsBVXrQiPkSxxaqUiNTP16W5_9W_CU8kpGFNK1VrV_b7ZpSrn0QfLtUuozipyYqxcVklYn2WExV5x2y-bPKvju13Qtkyq7y9_L3Jyxkf54IC_O0z0Odv6kXi3TWh_-02jhOeoHnSH1c1ry0IgpLf7krFIEMvAxCCj4CvAFYwOjf9uYPd6hQ6evfuUNCNxfX5ZmK55cfi9bH2_8PQYYNmJ5AlYwLOvtgsA-Yku5ZgRxCIFqF3kdsy4kJbRfqGvx2zX_ZHnuoYXQZVrW6MorValugcUZ3HXBoQ0y9uNKdMoAYfQ";
const cookie =
  " _ga=GA1.3.1500102785.1579786690; _fbp=fb.2.1579786691460.187124307; _gcl_aw=GCL.1581779313.Cj0KCQiAyp7yBRCwARIsABfQsnS4uiFvfW-tLhfgawXRXKGw71FZmyMgZFqIe5jCNz066w3Vjty5zhQaArIlEALw_wcB; _gac_UA-XXXXX-X=1.1581779313.Cj0KCQiAyp7yBRCwARIsABfQsnS4uiFvfW-tLhfgawXRXKGw71FZmyMgZFqIe5jCNz066w3Vjty5zhQaArIlEALw_wcB; _gac_UA-91617479-4=1.1581779313.Cj0KCQiAyp7yBRCwARIsABfQsnS4uiFvfW-tLhfgawXRXKGw71FZmyMgZFqIe5jCNz066w3Vjty5zhQaArIlEALw_wcB; __utmc=21896485; _gid=GA1.3.617182161.1583643614; __utma=21896485.1500102785.1579786690.1583643614.1583718203.13; __utmz=21896485.1583718203.13.13.utmcsr=google|utmccn=(organic)|utmcmd=organic|utmctr=(not%20provided); posocha=MTU4MzcyNDIwNXxOd3dBTkVWSk0xbEdWbEJYUkRKTFVUSkNWVkpNUVUxR1VVVXpUVkZCUTBsRFQwYzBVVWMxUTFGU1YxWlFSVXhVUkV0TlRUVkZOa0U9fH8MQk1xVH4EUvLLQFbDcEAdLEQOIIZa-agfwVtafR35";

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

    // 3.3. Map ข้อมูล Orders ตามโครงสร้างของเรา
    const promiseOrd = json.orders.map(async (od, idx) => {
      orders.push(od);
      //   let ood = {
      //     no: od.payments[0].receipt_number_v2,
      //     createdAt: od.order.add_time,
      //     status: od.order.status,
      //     customerName: od.order.name,
      //     paymentProvider: "cash",
      //     subtotal: 0,
      //     discount: 0,
      //     total: od.order.money_payable,
      //     paidAt: od.payments[0].upd_time,
      //     paidAmount: od.payments[0].money_to_pay,
      //     note: od.order.note,
      //     items: [],
      //     discounts: [],
      //     voidedAt: od.voided ? od.voided.upd_time : null
      //   };
      //   od.items.forEach(item => {
      //     ood.subtotal += parseInt(item.money_nominal);
      //     ood.items.push({
      //       itemCode: item.item_cid,
      //       itemName: item.item_name,
      //       itemQty: item.quantity,
      //       itemPrice: item.item_price.unit_price,
      //       itemSubtotal: item.money_nominal
      //     });
      //   });
      //   if (od.discounts) {
      //     od.discounts.forEach(discount => {
      //       ood.discountAmount += parseInt(discount.discounted_value);
      //       ood.discounts.push({
      //         name: discount.name,
      //         value: discount.value,
      //         quantity: discount.quantity,
      //         amount: discount.discounted_value
      //       });
      //     });
      //   }
      if (od.order.status === 0) {
        // let ood = {};
        // od.items.forEach(item => {});
        orders.push(od);
      }
    });
    await Promise.all(promiseOrd);
  });

  // 3.4.  รอ loop อ่านข้อมูลจนครบตามสัญญา (promise)
  await Promise.all(promise);
  //   console.log(orders.length);
  return orders;
};
