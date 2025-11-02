// src/print/hiprint-ez.ts
export type TextAlign = 'left' | 'center' | 'right';

export interface TextStyle {
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: 'normal' | 'bold' | 'bolder';
  textAlign?: TextAlign;
  lineHeight?: number;
}

export interface HpElement {
  options: Record<string, any>;
  printElementType: { title?: string; type: 'text'|'hline'|'image'|string };
}

export const EZ = {
  // 样式令牌（统一在这里调）
  style: {
    title: { fontSize: 20.25, fontFamily: 'STKaiti', fontWeight: 'bolder', textAlign: 'center' } as TextStyle,
    h6:    { fontSize: 12 } as TextStyle,
    body:  { fontSize: 9 } as TextStyle,
    bold:  { fontWeight: 'bold' } as TextStyle,
    right: { textAlign: 'right' as TextAlign } as TextStyle,
    center:{ textAlign: 'center' as TextAlign } as TextStyle,
  },

  // 工具：合并样式
  mix(...s: TextStyle[]): TextStyle {
    return Object.assign({}, ...s);
  },

  text(x: number, y: number, w: number, h: number, title: string, style: TextStyle = {}, extra: Record<string, any> = {}): HpElement {
    return {
      options: {
        left: x, top: y, width: w, height: h, title,
        coordinateSync: false, widthHeightSync: false,
        ...style, ...extra
      },
      printElementType: { type: 'text' }
    };
  },

  hline(x: number, y: number, w: number, borderStyle: 'solid'|'dashed' = 'solid', borderWidth = '0.75'): HpElement {
    return {
      options: {
        left: x, top: y, width: w, height: 9,
        borderStyle, borderWidth,
        coordinateSync: false, widthHeightSync: false,
      },
      printElementType: { type: 'hline' }
    };
  },

  // 账单四列表头/行（项目/数量/单价/小计）
  row4(top: number, widths = [58.5, 67.5, 27, 28.5], left = 6, height = 9.75, titles: [string,string,string,string], isHeader = false): HpElement[] {
    const [w0,w1,w2,w3] = widths;
    const els: HpElement[] = [];
    let x = left;

    const mk = (w: number, title: string, align: TextAlign) => {
      const s = isHeader ? EZ.mix(EZ.style.h6, EZ.style.bold, { textAlign: align }) : EZ.mix(EZ.style.body, { textAlign: align });
      els.push(EZ.text(x, top, w, height, title, s));
      x += w; // 无列间隙，如需间隙自行在 widths 中留
    };

    mk(w0, titles[0] ?? '', 'left');
    mk(w1, titles[1] ?? '', 'right');
    mk(w2, titles[2] ?? '', 'right');
    mk(w3, titles[3] ?? '', 'right');
    return els;
  },
};

// 一些固定数值（面板与内容区宽度）
export const PANEL = {
  contentLeft: 4.5,
  contentWidth: 216,
};
