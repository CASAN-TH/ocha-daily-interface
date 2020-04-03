const ocha = require("./libs/ocha");
const p356 = require("./libs/page365");
const xls = require("excel4node");

const run = async dateStr => {
  var wb = new xls.Workbook();
  
  var start = new Date(dateStr);
  start.setHours(0, 0, 0, 0);

  var end = new Date(dateStr);
  end.setHours(23, 59, 59, 0);
  let start_time = start / 1000;
  let end_time = end / 1000;
  const shops = await ocha.getOchaShopList();

  if (shops.error_code !== 0) {
    process.exit(0);
  }
  
  const orders = await ocha.getDailyOrdersByShop(
    shops.shops[0].shop_id,
    start_time,
    end_time
  );
  if (orders) {
    writeXLS(orders, wb, shops.shops[0].profile.shop_name);
  }

  const orders2 = await ocha.getDailyOrdersByShop(
    shops.shops[1].shop_id,
    start_time,
    end_time
  );
  if (orders2) {
    writeXLS(orders2, wb, shops.shops[1].profile.shop_name);
  }

  const orders3 = await ocha.getDailyOrdersByShop(
    shops.shops[2].shop_id,
    start_time,
    end_time
  );
  if (orders3) writeXLS(orders3, wb, shops.shops[2].profile.shop_name);

  const orders4 = await ocha.getDailyOrdersByShop(
    shops.shops[3].shop_id,
    start_time,
    end_time
  );
  if (orders4) writeXLS(orders4, wb, shops.shops[3].profile.shop_name);

  const orders5 = await ocha.getDailyOrdersByShop(
    shops.shops[4].shop_id,
    start_time,
    end_time
  );
  if (orders5)
    writeXLS(
      orders5,
      wb,
      shops.shops[4].profile.shop_name.replace(" (ร้านยักษ์กะโจน)", "")
    );

  const orders6 = await p356.getOrders(start_time, end_time);
  if (orders6) {
    write365XLS(orders6, wb, "page365");
  }

  wb.write(dateStr + ".xlsx");
  return true;
};

function write365XLS(orders, wb, filename) {
  var result = [];
  orders.forEach(order => {
    // console.log(order.items)
    order.items.forEach(value => {
      result.push({
        item_cid: value.name,
        item_name: value.name,
        subtotal: value.price * value.quantity,
        quantity: value.quantity
      });
    });
  });
  // console.log(result);
  resultSum = [];
  result.reduce(function(res, value) {
    if (!res[value.item_cid]) {
      res[value.item_cid] = {
        item_cid: value.item_cid,
        item_name: value.item_name,
        subtotal: value.subtotal,
        vat_rate: 7,
        quantity: value.quantity
      };
      resultSum.push(res[value.item_cid]);
    } else {
      res[value.item_cid].quantity += value.quantity;
      res[value.item_cid].subtotal += value.subtotal;
    }

    return res;
  }, {});
  // console.log(resultSum);
  var ws = wb.addWorksheet(filename);
  var numStyle = wb.createStyle({
    numberFormat: "#,##0.00; (#,##0.00); -"
  });

  ws.cell(1, 1).string("รายการที่ต้องจ่ายภาษี");
  //ลำดับ	ชื่อสินค้า	จำนวน	น้ำหนัก	ยอดขาย
  ws.cell(2, 1).string("ลำดับ");
  ws.cell(2, 2).string("ชื่อสินค้า");
  ws.cell(2, 3).string("จำนวน");
  // ws.cell(2, 4).string("ราคาต่อหน่วย");
  ws.cell(2, 4).string("vat(%)");
  ws.cell(2, 5).string("จำนวนเงิน");
  ws.cell(2, 6).string("ภาษี");
  ws.cell(2, 7).string("รวม");

  var i = 3;
  var j = 1;
  resultSum.forEach(detail => {
    if (isVat(detail.item_name)) {
      // console.log(detail.item_name + ":" + isVat(detail.item_name));
      var vat_rate = isVat(detail.item_name) ? 1.07 : 1;
      // console.log(vat_rate);
      ws.cell(i, 1).number(j);
      ws.cell(i, 2).string(detail.item_name);
      ws.cell(i, 3)
        .number(detail.quantity || 0)
        .style(numStyle);
      // ws.cell(i, 4)
      //   .number(detail.unit_price || 0)
      //   .style(numStyle);
      ws.cell(i, 4)
        .number((vat_rate - 1) * 100)
        .style(numStyle);
      ws.cell(i, 5)
        .number(detail.subtotal / vat_rate)
        .style(numStyle);
      ws.cell(i, 6)
        .number(detail.subtotal - detail.subtotal / vat_rate)
        .style(numStyle);
      ws.cell(i, 7)
        .number(detail.subtotal)
        .style(numStyle);
      i++;
      j++;
    }
  });
  i++;
  ws.cell(i, 1).string("รายการที่ไม่ต้องจ่ายภาษี");
  i++;
  //ลำดับ	ชื่อสินค้า	จำนวน	น้ำหนัก	ยอดขาย
  ws.cell(i, 1).string("ลำดับ");
  ws.cell(i, 2).string("ชื่อสินค้า");
  ws.cell(i, 3).string("จำนวน");
  // ws.cell(i, 4).string("ราคาต่อหน่วย");
  ws.cell(i, 4).string("vat(%)");
  ws.cell(i, 5).string("จำนวนเงิน");
  ws.cell(i, 6).string("ภาษี");
  ws.cell(i, 7).string("รวม");
  i++;
  j = 1;
  resultSum.forEach(detail => {
    if (!isVat(detail.item_name)) {
      // console.log(detail.item_name + ":" + isVat(detail.item_name));
      var vat_rate = isVat(detail.item_name) ? 1.07 : 1;
      // console.log(vat_rate);
      ws.cell(i, 1).number(j);
      ws.cell(i, 2).string(detail.item_name);
      ws.cell(i, 3)
        .number(detail.quantity || 0)
        .style(numStyle);
      // ws.cell(i, 4)
      //   .number(detail.unit_price || 0)
      // .style(numStyle);
      ws.cell(i, 4)
        .number((vat_rate - 1) * 100)
        .style(numStyle);
      ws.cell(i, 5)
        .number(detail.subtotal / vat_rate)
        .style(numStyle);
      ws.cell(i, 6)
        .number(detail.subtotal - detail.subtotal / vat_rate)
        .style(numStyle);
      ws.cell(i, 7)
        .number(detail.subtotal)
        .style(numStyle);
      i++;
      j++;
    }
  });
}

function writeXLS(orders, wb, filename) {
  var result = [];
  orders.forEach(order => {
    // console.log(order.items);
    order.items.forEach(value => {
      result.push({
        item_cid: value.item_name,
        item_name: value.item_name,
        subtotal: parseInt(value.money_nominal),
        // unit_price: parseInt(value.money_nominal) / value.quantity,
        quantity: value.quantity
      });
    });
  });
  // console.log(result);

  resultSum = [];
  result.reduce(function(res, value) {
    if (!res[value.item_cid]) {
      res[value.item_cid] = {
        item_cid: value.item_cid,
        item_name: value.item_name,
        vat_rate: 7,
        subtotal: value.subtotal,
        // unit_price: value.unit_price,
        quantity: value.quantity
      };

      resultSum.push(res[value.item_cid]);
    } else {
      res[value.item_cid].quantity += value.quantity;
      res[value.item_cid].subtotal += value.subtotal;
      // if (value.item_name === "โค้กCoke") console.log(res[value.item_cid]);
      // console.log(res[value.item_cid])
    }

    return res;
  }, {});
  // console.log(resultSum);
  var ws = wb.addWorksheet(filename);
  var numStyle = wb.createStyle({
    numberFormat: "#,##0.00; (#,##0.00); -"
  });

  ws.cell(1, 1).string("รายการที่ต้องจ่ายภาษี");
  //ลำดับ	ชื่อสินค้า	จำนวน	น้ำหนัก	ยอดขาย
  ws.cell(2, 1).string("ลำดับ");
  ws.cell(2, 2).string("ชื่อสินค้า");
  ws.cell(2, 3).string("จำนวน");
  // ws.cell(2, 4).string("ราคาต่อหน่วย");
  ws.cell(2, 4).string("vat(%)");
  ws.cell(2, 5).string("ยอดขาย");
  ws.cell(2, 6).string("ภาษี");
  ws.cell(2, 7).string("รวม");

  var i = 3;
  var j = 1;
  resultSum.forEach(detail => {
    if (isVat(detail.item_name)) {
      // console.log(detail.item_name + ":" + isVat(detail.item_name));
      // if(detail.item_name==="โค้กCoke") console.log(detail)
      var vat_rate = isVat(detail.item_name) ? 1.07 : 1;
      // console.log(vat_rate);
      ws.cell(i, 1).number(j);
      ws.cell(i, 2).string(detail.item_name);
      ws.cell(i, 3)
        .number(detail.quantity || 0)
        .style(numStyle);
      // ws.cell(i, 4)
      //   .number(detail.unit_price || 0)
      //   .style(numStyle);
      ws.cell(i, 4)
        .number((vat_rate - 1) * 100)
        .style(numStyle);
      ws.cell(i, 5)
        .number(detail.subtotal / vat_rate)
        .style(numStyle);
      ws.cell(i, 6)
        .number(detail.subtotal - detail.subtotal / vat_rate)
        .style(numStyle);
      ws.cell(i, 7)
        .number(detail.subtotal)
        .style(numStyle);
      i++;
      j++;
    }
  });
  i++;
  ws.cell(i, 1).string("รายการที่ไม่ต้องจ่ายภาษี");
  i++;
  //ลำดับ	ชื่อสินค้า	จำนวน	น้ำหนัก	ยอดขาย
  ws.cell(i, 1).string("ลำดับ");
  ws.cell(i, 2).string("ชื่อสินค้า");
  ws.cell(i, 3).string("จำนวน");
  // ws.cell(i, 4).string("ราคาต่อหน่วย");
  ws.cell(i, 4).string("vat(%)");
  ws.cell(i, 5).string("ยอดขาย");
  ws.cell(i, 6).string("ภาษี");
  ws.cell(i, 7).string("รวม");
  i++;
  j = 1;
  resultSum.forEach(detail => {
    if (!isVat(detail.item_name)) {
      // console.log(detail.item_name + ":" + isVat(detail.item_name));
      var vat_rate = isVat(detail.item_name) ? 1.07 : 1;
      // console.log(vat_rate);
      ws.cell(i, 1).number(j);
      ws.cell(i, 2).string(detail.item_name);
      ws.cell(i, 3)
        .number(detail.quantity || 0)
        .style(numStyle);
      // ws.cell(i, 4)
      //   .number(detail.unit_price || 0)
      //   .style(numStyle);
      ws.cell(i, 4)
        .number((vat_rate - 1) * 100)
        .style(numStyle);
      ws.cell(i, 5)
        .number(detail.subtotal / vat_rate)
        .style(numStyle);
      ws.cell(i, 6)
        .number(detail.subtotal - detail.subtotal / vat_rate)
        .style(numStyle);
      ws.cell(i, 7)
        .number(detail.subtotal)
        .style(numStyle);
      i++;
      j++;
    }
  });
}

function isVat(productName) {
  var noVate = [
    "มะนาว(ลูก)",
    "มะนาว(ลูก)",
    "มะนาว(ลูก)",
    "สะตอ",
    "ฟักทอง",
    "ฟักทอง",
    "มะเขือเปราะ",
    "หอมหัวใหญ่",
    "หอมหัวใหญ่",
    "มะเขือยาวเขียว",
    "มะกรูด(ลูก)",
    "มะกรูด(ลูก)",
    "บวบหอม",
    "แตงกวา",
    "หอมแดง",
    "กระเทึยม",
    "มันเทศแครอท",
    "มันเทศแครอท",
    "มะเขือเทศ",
    "ตะไคร้",
    "กะหล่ำปลี",
    "กะหล่ำปลี",
    "ฟักแฟง",
    "ถั่วลิสงต้ม",
    "กระเจี๊ยบแดง",
    "กระเจี๊ยบแดง",
    "ข้าวโพดหวาน",
    "ข้าวโพดหวาน",
    "บวบเหลี่ยม",
    "เบบี้แครอท",
    "หัวปลี",
    "หัวปลี",
    "หัวปลี",
    "มะเขือม่วง",
    "ฟักหอม",
    "ฟักหอม",
    "ข้าวโพดข้าวเหนียว",
    "ข่าเหลือง",
    "ถั่วแระ",
    "ถั่วแระ",
    "มะเขือพวง",
    "ถั่วฝักยาว",
    "ข่าแดงอ่อน",
    "มันม่วง",
    "มะนาว(กก)",
    "ฟักเขียว",
    "ข้าวโพดอ่อน",
    "มะเขือเทศพวง",
    "ขมิ้นชัน",
    "น้ำเต้า",
    "หน่อไม้สด",
    "ถั่วแปป",
    "ข้าวโพดม่วงหวานกินสด",
    "มะระ",
    "ไพล",
    "พริกเขียว",
    "พริกแดง",
    "ถั่วลิสงฝัก",
    "พริกกะเหรี่ยง",
    "หัวไชเท้า",
    "กระเจี๊ยบเขียว",
    "มะนาว",
    "ขิง",
    "มะเขือลาย",
    "พริกขี้หนู",
    "มะรุม",
    "มะเขือยาวม่วง",
    "บวบสาลี",
    "พริกหนุ่ม",
    "ไข่ไก่",
    "รากบัว",
    "รากบัว",
    "รากบัวเชื่อม",
    "พริกแห้ง",
    "ผักบุ้ง",
    "ผักบุ้ง",
    "คะน้า",
    "ตำลึง",
    "ผักเชียงดา",
    "กวางตุ้ง",
    "ผักสลัด",
    "ชายา",
    "ผักกาดขาว",
    "ผักโขม",
    "ต้นหอม",
    "คื่นช่าย",
    "ผักกาดเขียว",
    "วอเตอร์เครส",
    "กะเพรา",
    "ผักชี",
    "โหระพา",
    "กวางตุ้งฮ่องเต้",
    "ผักปลัง",
    "ชะอม",
    "กุ๋ยช่าย",
    "ใบเหลียง",
    "ใบมะกรูด",
    "ใบเตย",
    "ผักบุ้งนา",
    "ใบกระเจี๊ยบ",
    "ยอดมะระขี้นก",
    "ผักกาดหิ่น",
    "ดอกแค",
    "ใบบัวบก",
    "จิงจุงฉ่าย",
    "ดอกชมจันทร์",
    "ผักชีลาว",
    "ใบแมงลัก",
    "ใบโกสน",
    "ดอกเล็บครุฑ",
    "ผักชีฝรั่ง",
    "ผักหวานบ้าน",
    "ชะพลู",
    "ยอดฟักข้าว",
    "ผักกูด",
    "ยอดมะกอก",
    "อ่อมแซบ",
    "ดอกข่า",
    "ยอดมะรุม",
    "สะระแหน่",
    "แตงโม",
    "แตงโม",
    "กล้วยน้ำว้า",
    "กล้วยน้ำว้า",
    "กล้วยน้ำว้า",
    "กล้วยน้ำว้า",
    "มะละกอสุก",
    "มะละกอสุก",
    "แตงไทย",
    "แตงไทย",
    "แคนตาลูป",
    "แคนตาลูป",
    "ทุเรียนชะนี",
    "ทุเรียนชะนี",
    "ทุเรียนหมอนทอง",
    "มังคุด",
    "มะม่วงโชคอนันต์",
    "ทุเรียนพวงมณี",
    "มะม่วงน้ำดอกไม้",
    "ฝรั่ง",
    "ฝรั่ง",
    "มะม่วงห่าว มะนาวโห่",
    "กระท้อน",
    "มะม่วงแก้ว",
    "มะม่วงเขียวใหญ่",
    "กล้วยหอมทอง",
    "กล้วยหอมทอง",
    "กล้วยหอมทอง",
    "มะม่วงอกร่อง",
    "มะม่วงอกร่อง",
    "มะปราง",
    "กล้วยหักมุก",
    "กล้วยหักมุก",
    "มะยงชิด",
    "ชมพู่",
    "ส้มโอ",
    "กล้วยนางเห็น",
    "กล้วยเทพรส",
    "เห็ดหูหนูดำ",
    "เห็ดนางนวล",
    "เห็ดหูหนูขาว",
    "เห็ดขอนขาว",
    "มะขามเปียก",
    "มะนาว(กก)",
    "มะละกอบดิบ",
    "มะละกอบดิบ",
    "มะละกอบดิบ",
    "มะกรูด",
    "กะหล่ำดอก",
    "ฟักข้าว",
    "ตะลิงปลิง",
    "ถั่วดาบ",
    "ขนุนอ่อน",
    "มะแว้ง",
    "เพกา",
    "มะขามอ่อน",
    "มะระขี้นก",
    "ถั่วพู",
    "ยอดฟักทอง",
    "ดอกกระเจียว",
    "ผักแพว",
    "ใบหูเสือ",
    "ใบมะตูมแขก",
    "ใบมะม่วงหิมพานต์",
    "ดอกสะเดา",
    "ผักอีหล้ำ",
    "ชีล้อม",
    "หน่อไม้ฝรั่ง",
    "ยอดกฐิน",
    "โสมไทย",
    "ลำไย",
    "แก้วมังกร",
    "เผือก",
    "กล้วยเทพรส",
    "กล้วยเทพรส",
    "มะกอก",
    "เสาวรส",
    "กล้วยไข่",
    "ปลาข้างทอง",
    "ดอกปทุมมา",
    "ดอกปทุมมา",
    "ดอกปทุมมา",
    "กุนเชียงปลา",
    "ว่านหางจระเข้",
    "ถั่วงอก",
    "ปลาส้ม",
    "ปลากระโทง",
    "ปลาสีเสียด",
    "ต้นปทุมมา",
    "มะเขือเทศ",
    "มะเขือเทศ",
    "กะหล่ำปลี",
    "แตงกวา",
    "มะเขือเปราะ",
    "มะเขือยาวเขียว",
    "ฟักทอง",
    "หอมแดง",
    "หอมแดง",
    "กะหล่ำดอก",
    "กะหล่ำดอก",
    "มะเขือม่วง",
    "ถั่วพุ่ม",
    "มันม่วง",
    "ตะไคร้",
    "มะเขือเทศราชินี",
    "ถั่วฝักยาว",
    "มันเทศแครอท",
    "บวบเหลี่ยม",
    "บวบหอม",
    "ฟักแฟง",
    "หอมหัวใหญ่",
    "พริกกะเหรี่ยง",
    "ข้าวโพดหวาน",
    "ฟักเขียว",
    "มะเขือเทศเชอรี่",
    "มะเขือไข่เต่า",
    "มะเขือไข่เต่า",
    "ขมิ้นขาว",
    "มะรุม(ถุง)",
    "ข่าแดงอ่อน",
    "พริกแดง",
    "ผักสลัด",
    "คะน้า",
    "ผักชี",
    "ต้นหอม",
    "กวางตุ้ง",
    "กวางตุ้งฮ่องเต้",
    "กวางตุ้งฮ่องเต้",
    "ผักบุ้ง",
    "คื่นช่าย",
    "ผักปลัง",
    "กะเพรา",
    "ชายา",
    "สลัดแก้ว",
    "ผักชีฝรั่ง",
    "ถั่วพู",
    "ผักเชียงดา",
    "ผักกาดขาว",
    "ผักชีลาว",
    "ดอกหอม",
    "ดอกหอม",
    "วอเตอร์เครส",
    "ผักกาดหิ่น",
    "ตั้งโอ๋",
    "ใบมันปู",
    "ดอกอัญชัน",
    "มะละกอสุก",
    "แตงไทย",
    "กล้วยเบา",
    "กล้วยเบา",
    "ละมุด",
    "ต้นกล้ามะพร้าวพันธ์ุมาว่า",
    "ต้นชายา",
    "ดอกงิ้ว",
    "เลมอน",
    "ต้นขมิ้น",
    "ตันเคล",
    "ตันชายา",
    "บร๊อคโคลี่",
    "ข้าวกล้องเหนียว 1 กก.",
    "ข้าวกล้องเหนียว 5 กก.",
    "ข้าวกล้องเหนียวธรรมชาติ 1 กก.",
    "ข้าวกล้องเหนียวธรรมชาติ 1 กก.",
    "ข้าวกล้องเหนียวธรรมชาติ 5 กก",
    "ข้าวหอมมะลิ 5 กก",
    "ข้าวหอมมะลิ 1 กก",
    "ข้าวหอมมะลิ 1 กก",
    "ข้าวกล้องเหนียวธรรมชาติ 2 กก",
    "ข้าวเหนียวธรรมชาติ 1 กก",
    "ข้าวกล้องหอมมะลิ 1 กก",
    "ข้าวกล้องดอกมะขาม 1 กก",
    "ข้าวเหนียวธรรมชาติ 5 กก",
    "ข้าวไรซ์เบอรี่ 1 กก",
    "ปลายข้าวกล้อง 15 กก.",
    "ถั่วเหลือง 0.5 กก",
    "ถั่วลิสง 0.5 กก",
    "ถั่วเขียว 0.5 กก",
    "ถั่วดำ 0.5 กก",
    "ถั่วแดง 0.5 กก",
    "งาขาว 0.5 กก",
    "งาดำ 0.5 กก",
    "น้ำผึ้งดอกไม้ป่า",
    "ถ่านไม้",
    "ผักกาดเขียวปลี",
    "มะม่วงเบา",
    "ข้าวกล้องเหนียวธรรมชาติ 5 กก.",
    "ข้าวกล้องเหนียวธรรมชาติ 1 กก",
    "ข้าวหอมมะลิ 1 กก.",
    "ข้าวหอมมะลิ 5 กก.",
    "ปุ๋ยน้ำบำรุงดิน 1 ลิตร",
    "ปุ๋ยเม็ดบำรุงดิน 701(1กก)",
    "ปุ๋ยเม็ดเร่งดอกผล 702(1กก)",
    "น้ำส้มควันไม้",
    "ปุ๋ยมูลไส้เดือน",
    "ปุ๋ยน้ำไวต้า",
    "ปุ๋ยเม็ดบำรุงดิน 701(25กก)",
    "ปุ๋ยอินทรีย์น้ำเพชร 202",
    "ปุ๋ยเม็ดเร่งดอกผล 702(50กก)",
    "ปุ๋ยอินทรีย์น้ำเพชร 204",
    "ปุ๋ยอินทรีย์น้ำเพชร 201"
  ];
  return noVate.indexOf(productName) === -1;
}


run("2020-03-01");
