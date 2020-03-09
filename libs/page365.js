const fetch = require("node-fetch");

exports.getOrders = async (start_time, end_time) => {
  var options = {
    method: "GET",
    headers: {
      cookie:
        "_fbp=fb.1.1569845814208.956949072; optimizelyEndUserId=oeu1569845830832r0.12226426504562449; optimizelySegments=%7B%223018660153%22%3A%22false%22%2C%223023610332%22%3A%22referral%22%2C%223034940177%22%3A%22gc%22%7D; optimizelyBuckets=%7B%7D; page365_hotspot=%7B%22hotSpot%22%3A%5B%5D%7D; page365_intro=%7B%22intro%22%3A%5B%5D%7D; page365_started_list=%7B%22done_list%22%3A%5B%22account.nav.storefront.shippings%22%5D%7D; _fbc=fb.1.1576169081152.IwAR3Wywu80MZ8EPW5WA1FyeT7dFa_BSI5MKoUZYrpT2xRJ1HPNYftoFtHWx4; _gaexp=GAX1.2.gi4M1IwIQWioIA0pJbGs2A.18319.0; _gid=GA1.2.1535529046.1580875620; _ga_P7XXBKBEGW=GS1.1.1580875616.120.1.1580875716.0; _ga=GA1.2.934938265.1569845814; _gat=1; _page365_session=UC9VK05hRDJ4TzZSaTZodm1kWnd6V1FZRGhCNytiK1MrVitLQ01QdjRwb0twd0k1ZURyWWZyMjFmRXU1QXRTcDRIemFpaVMvQXB3SlhwckNwdEg2UWsyUXZxbDJQL3phUUY0c3ZyN0pVLzQ0RStkdEVmNWtUUnpCR2VKc1ZrTkdUVWhaZU5nMDZ5RkdGTGhkUGxlRFZDMDBnWnNqbWN0c2cvRUdrL0R2UDlSR1VqZlVHVXFWVWFFNUVhMzhDdm9xVHljbkY4STFTYnh4NjVTandEZXNKemhVREc3STl0ZXFUaDQvakNIMWZrRUtTbldtZU8xSjV0L0dPRGhsK2hMZi0tQ2kvcDlaY1pyZ015SHJ1NW40L1Rsdz09--4414ea7de50f46f7d52ba1524736038297a604a1"
    }
  };
  const response = await fetch(
    `https://page365.net/Thamturakit/orders.json?from=${start_time}&to=${end_time}`,
    options
  );

  const result = await response.json();
  let orders = [];
  const promise = result.orders.map(async (order, idx) => {
    // console.log(order);
    try {
      var optionsDtl = {
        method: "GET",
        headers: {
          cookie:
            "_fbp=fb.1.1569845814208.956949072; optimizelyEndUserId=oeu1569845830832r0.12226426504562449; optimizelySegments=%7B%223018660153%22%3A%22false%22%2C%223023610332%22%3A%22referral%22%2C%223034940177%22%3A%22gc%22%7D; optimizelyBuckets=%7B%7D; page365_hotspot=%7B%22hotSpot%22%3A%5B%5D%7D; page365_intro=%7B%22intro%22%3A%5B%5D%7D; page365_started_list=%7B%22done_list%22%3A%5B%22account.nav.storefront.shippings%22%5D%7D; _fbc=fb.1.1576169081152.IwAR3Wywu80MZ8EPW5WA1FyeT7dFa_BSI5MKoUZYrpT2xRJ1HPNYftoFtHWx4; _gaexp=GAX1.2.gi4M1IwIQWioIA0pJbGs2A.18319.0; _gid=GA1.2.1535529046.1580875620; _ga_P7XXBKBEGW=GS1.1.1580875616.120.1.1580875716.0; _ga=GA1.2.934938265.1569845814; _gat=1; _page365_session=UC9VK05hRDJ4TzZSaTZodm1kWnd6V1FZRGhCNytiK1MrVitLQ01QdjRwb0twd0k1ZURyWWZyMjFmRXU1QXRTcDRIemFpaVMvQXB3SlhwckNwdEg2UWsyUXZxbDJQL3phUUY0c3ZyN0pVLzQ0RStkdEVmNWtUUnpCR2VKc1ZrTkdUVWhaZU5nMDZ5RkdGTGhkUGxlRFZDMDBnWnNqbWN0c2cvRUdrL0R2UDlSR1VqZlVHVXFWVWFFNUVhMzhDdm9xVHljbkY4STFTYnh4NjVTandEZXNKemhVREc3STl0ZXFUaDQvakNIMWZrRUtTbldtZU8xSjV0L0dPRGhsK2hMZi0tQ2kvcDlaY1pyZ015SHJ1NW40L1Rsdz09--4414ea7de50f46f7d52ba1524736038297a604a1"
        }
      };
      const responseDtl = await fetch(
        `https://page365.net/Thamturakit/orders/${order.id}.json`,
        optionsDtl
      );

      const od = await responseDtl.json();
      orders.push(od);
    } catch (error) {}
  });
  await Promise.all(promise);

  return orders;
};
