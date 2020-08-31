const fetch = require("node-fetch");

exports.getOrders = async (start_time, end_time) => {
  let _orders = [];
  const _pages = [1, 2, 3, 4, 5];

  //Read order Fix 5 page 
  const promise1 = _pages.map(async (pageNo, idx) => {
    var options = {
      method: "GET",
      headers: {
        cookie:
          " _page365_session=UC9VK05hRDJ4TzZSaTZodm1kWnd6V1FZRGhCNytiK1MrVitLQ01QdjRwb0twd0k1ZURyWWZyMjFmRXU1QXRTcDRIemFpaVMvQXB3SlhwckNwdEg2UWsyUXZxbDJQL3phUUY0c3ZyN0pVLzQ0RStkdEVmNWtUUnpCR2VKc1ZrTkdUVWhaZU5nMDZ5RkdGTGhkUGxlRFZDMDBnWnNqbWN0c2cvRUdrL0R2UDlSR1VqZlVHVXFWVWFFNUVhMzhDdm9xVHljbkY4STFTYnh4NjVTandEZXNKemhVREc3STl0ZXFUaDQvakNIMWZrRUtTbldtZU8xSjV0L0dPRGhsK2hMZi0tQ2kvcDlaY1pyZ015SHJ1NW40L1Rsdz09--4414ea7de50f46f7d52ba1524736038297a604a1"
      }
    };
    const response = await fetch(
      `https://page365.net/Thamturakit/orders.json?from=${start_time}&to=${end_time}&page=${pageNo}`,
      options
    );

    const result = await response.json();
    _orders = _orders.concat(result.orders);

  });
  await Promise.all(promise1); //รอจนครบ
 

// Read Each order detail
  let orders = [];
  const promise2 = _orders.map(async (order, idx) => {
    // console.log(order);
    try {
      var optionsDtl = {
        method: "GET",
        headers: {
          cookie:
            " _page365_session=UC9VK05hRDJ4TzZSaTZodm1kWnd6V1FZRGhCNytiK1MrVitLQ01QdjRwb0twd0k1ZURyWWZyMjFmRXU1QXRTcDRIemFpaVMvQXB3SlhwckNwdEg2UWsyUXZxbDJQL3phUUY0c3ZyN0pVLzQ0RStkdEVmNWtUUnpCR2VKc1ZrTkdUVWhaZU5nMDZ5RkdGTGhkUGxlRFZDMDBnWnNqbWN0c2cvRUdrL0R2UDlSR1VqZlVHVXFWVWFFNUVhMzhDdm9xVHljbkY4STFTYnh4NjVTandEZXNKemhVREc3STl0ZXFUaDQvakNIMWZrRUtTbldtZU8xSjV0L0dPRGhsK2hMZi0tQ2kvcDlaY1pyZ015SHJ1NW40L1Rsdz09--4414ea7de50f46f7d52ba1524736038297a604a1"
        }
      };
      const responseDtl = await fetch(
        `https://page365.net/Thamturakit/orders/${order.id}.json`,
        optionsDtl
      );

      const od = await responseDtl.json();
      orders.push(od);
    } catch (error) { }
  });
  await Promise.all(promise2);

  return orders;
};

exports.getOrderDetail = async (_orders) => {

}



