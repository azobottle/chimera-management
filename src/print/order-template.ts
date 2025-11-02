// src/print/receipt-template.ts
import empty_head from '@/assets/printEmpty_head.json';
import empty_tail from '@/assets/printEmpty_tail.json';
import type { Order, DeliveryInfo } from '@/client/types.gen';
import { EZ, PANEL } from './hiprint-ez';

const H = {
  row: 15,        // 明细行步进
  cell: 9.75,     // 单元格高度
};

function clone<T>(x: T): T { return JSON.parse(JSON.stringify(x)); }

function getLastFourDigits(number: string): string {
  const trimmed = number.replace(/\D/g, '');
  return trimmed.slice(-4);
}

function getAddress(deliveryInfo?: DeliveryInfo | null): string {
  const school = deliveryInfo?.school || '';
  const address = deliveryInfo?.address || '';
  const combined = `${school} ${address}`.trim();
  return combined || '地址未提供';
}

function formatSendTime(time?: string): string {
  if (!time) return 'N/A';
  const d = new Date(time);
  if (isNaN(d.getTime())) return '无效时间';
  const p = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

export function buildOrderTemplate(
  finalItemDetails: Array<{ projectName: string; quantity: number; price: number; itemTotal: number; }>,
  totalInfo: { totalQuantity: number; totalItemTotal: number; },
  discountAmount: number,
  order_time: string,
  order: Order
) {
  const template = clone(empty_head);
  const elements = template.panels[0].printElements as any[];

  // —— 表头横线（保持你原布局）——
  // elements.push(EZ.hline(PANEL.contentLeft, 46.5, PANEL.contentWidth, 'solid'));

  // “时间”文本（右对齐，值来自 printData.time）
  // elements.push(
  //   EZ.text(85.5, 51, 133.5, 9.75, '', EZ.mix({ fontSize: 11, textAlign: 'right' }), {
  //     field: 'time',
  //     testData: '2024-10-26 13:32',
  //   })
  // );

  // “订单号”文本（居中，值来自 printData.orderNum）
  elements.push(
    EZ.text(PANEL.contentLeft, 60, PANEL.contentWidth, 28, '', EZ.mix({ fontSize: 56, fontWeight: 'bolder', textAlign: 'center' }), {
      field: 'orderNum',
      testData: '45',
    })
  );


  // 表头线
  elements.push(EZ.hline(6, 86, PANEL.contentWidth, 'solid')); // 注意这里使用 left=6 以和你原始横线对齐

  // 列标题
  elements.push(...EZ.row4(90.5, [163.5, 50, 0, 0], 6, H.cell, ['项目名称','数量','',''], true));

  // 表体前的虚线
  elements.push(EZ.hline(PANEL.contentLeft, 105.5, PANEL.contentWidth, 'dashed'));

  // —— 明细行 ——
  let top = 113; // 你的初始 top
  for (const it of finalItemDetails) {
    elements.push(...EZ.row4(
      top,
      [163.5, 50, 0, 0], // 你的明细列宽（与原 JSON 一致）
      6,
      H.cell,
      [
        it.projectName,
        String(it.quantity),
        '',
        '',
      ],
      false
    ));
    top += H.row;
  }

  // 偏移量
  const offsetTop = finalItemDetails.length * H.row;

  // —— 合计区 ——
  // elements.push(
  //   EZ.text(136.5, 104 + offsetTop, 18, H.cell, String(totalInfo.totalQuantity), EZ.style.body, { textAlign: 'right' }),
  //   EZ.text(186,   104 + offsetTop, 33, H.cell, (totalInfo.totalItemTotal/100).toFixed(1), EZ.style.body, { textAlign: 'right' }),
  //   EZ.text(186,   118 + offsetTop, 33, H.cell, '-' + (discountAmount/100).toFixed(1),     EZ.style.body, { textAlign: 'right' }),
  //   EZ.text(186,   138 + offsetTop, 33, H.cell, ((totalInfo.totalItemTotal - discountAmount)/100).toFixed(1), EZ.style.body, { textAlign: 'right' }),
  // );

  // —— 配送/备注区 + 尾巴 ——
  let printData: Record<string,string> = {};
  const orderId = order.orderNum.toString();

  // 明细循环结束后的 top 就是下一行起点，再加一点缝隙
  const sectionTop = top + 6;                 // 让配送信息紧贴明细行（6 可调）
  const y = (i: number) => sectionTop + i * H.row; // 行步进：15

  // 工具：把分隔线画在页底（paperFooter 上方一点点）
  const drawBottomSeparator = (tpl: any, padding = 6) => {
    const sepY = tpl.panels[0].paperFooter - H.cell - padding; // 贴底
    elements.push(
      EZ.text(3, sepY, 219, H.cell, '************************************', EZ.mix(EZ.style.h6, EZ.style.center))
    );
  };

  if (order.deliveryInfo) {
    const remark = order.remark?.toString() ?? '';

    elements.push(EZ.hline(PANEL.contentLeft, sectionTop - 6, PANEL.contentWidth, 'dashed'));

    elements.push(
      // 订单号：左标签 + 右值(绑定 orderNum)
      EZ.text(4.5,   y(0), 69,      H.cell, '订单号', EZ.mix(EZ.style.h6, EZ.style.bold)),
      EZ.text(109.5, y(0), 108,     H.cell, '',         EZ.mix(EZ.style.h6, EZ.style.bold, EZ.style.right), { field: 'orderNum' }),

      // 联系方式：左标签 + 右值(绑定 userNum)
      EZ.text(4.5,   y(1), 69,      H.cell, '手机尾号', EZ.mix(EZ.style.h6, EZ.style.bold)),
      EZ.text(109.5, y(1), 108,     H.cell, '',         EZ.mix(EZ.style.h6, EZ.style.bold,  EZ.style.right), { field: 'userNum' }),


      // 配送时间：左标签 + 右值(绑定 sendTime)
      EZ.text(4.5,   y(2), 69,      H.cell, '配送时间', EZ.mix(EZ.style.h6, EZ.style.bold)),
      EZ.text(109.5, y(2), 108,     H.cell, '',         EZ.mix(EZ.style.h6, EZ.style.bold, EZ.style.right), { field: 'sendTime' }),

      // 配送地址：左标签 + 右值(绑定 addr)
      EZ.text(4.5,   y(3), 69,      H.cell, '配送地址', EZ.mix(EZ.style.h6, EZ.style.bold)),
      EZ.text(75,    y(3), 145.5,   H.cell, '',         EZ.mix(EZ.style.h6, EZ.style.bold, EZ.style.right),                  { field: 'addr' }),

      // 备注（多行）
      EZ.text(4.5,   y(4), 216,     20,     remark,     EZ.mix(EZ.style.h6, EZ.style.bold, { lineHeight: 18 }))
    );

    // tail：如果需要，维持你原逻辑（也可以直接删掉 tail）
    const tailCloned = clone(empty_tail.printElements) as any[];
    const tailShift = sectionTop - (163.5 + (finalItemDetails.length * H.row));
    tailCloned.forEach(el => { el.options.top += tailShift; });
    elements.push(...tailCloned);

    // 计算整页高度（内容最底部 + 额外留白）
    const contentBottom = y(4) + 40;     // 备注块高度大约 40
    const footerBottom  = contentBottom + 40; // 10 额外留白
    template.panels[0].paperFooter = Math.max(220, footerBottom);

    // **现在再画“贴底分隔线”**
    drawBottomSeparator(template);

    const d = order.deliveryInfo;
    printData = {
      orderNum: orderId,
      time: order_time,
      userNum: d?.number ? getLastFourDigits(d.number) : 'N/A',
      addr: getAddress(d),
      sendTime: d?.time ? formatSendTime(d.time) : 'N/A',
    };

  } else {
    const remark = `【${order.scene}】 ${order.remark ?? ''}`;

    elements.push(EZ.hline(PANEL.contentLeft, sectionTop - 6, PANEL.contentWidth, 'dashed'));

    elements.push(
      EZ.text(4.5, y(0), 216, H.cell, remark, EZ.mix(EZ.style.h6, EZ.style.bold))
    );

    const tailCloned = clone(empty_tail.printElements) as any[];
    const tailShift = sectionTop - (163.5 + (finalItemDetails.length * H.row));
    tailCloned.forEach(el => { el.options.top += tailShift; });
    elements.push(...tailCloned);

    // 计算整页高度：备注一行 + 留白
    const contentBottom = y(0) + 40;
    const footerBottom  = contentBottom + 10;
    template.panels[0].paperFooter = Math.max(220, footerBottom);

    // **贴底分隔线**
    drawBottomSeparator(template);

    printData = { orderNum: orderId, time: order_time };
  }

  // 把“{time} / {orderNum}”占位的两处值交给 printData（保持你既有数据注入方式）
  return { template, printData };
}
