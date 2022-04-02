import { bold } from 'https://deno.land/std@0.133.0/fmt/colors.ts';
import GraphemeBreaker from 'https://taisukef.github.io/grapheme-breaker-mjs/src/GraphemeBreaker.mjs';

const EOL = Deno.build.os === 'windows' ? '\r\n' : '\n';

const EMOJI_TEST_REGEX = /\p{Extended_Pictographic}/gu;
function trueStringWidth(s: string) {
  // Get number of actual characters (don't count multiple codepoint emojis as multiple characters)
  const characterCount = GraphemeBreaker.break(s).length;
  // Get number of emojis (each emoji takes up the space of two characters in the terminal)
  const emojiCount = Array.from(s.matchAll(EMOJI_TEST_REGEX)).length;
  // Return the adjusted character count
  return characterCount + emojiCount;
}

export enum CellAlignment {
  LEFT,
  RIGHT,
  CENTER,
}
type CellValue = string | number | boolean | undefined;
interface FormattedCellContent {
  formatter?: (value: string) => string;
  alignment?: CellAlignment;
  value: CellValue | unknown;
}
export type CellContent = CellValue | FormattedCellContent;

export const NOOP_FORMATTER = (value: string) => value;
export const DEFAULT_HEADER_FORMATTER = bold;

enum RowType {
  TOP_BORDER,
  HEADER_ROW,
  SEPARATOR_ROW,
  DATA_ROW,
  BOTTOM_BORDER,
}

interface RowBorderStyleInner {
  fill: string;
  columnSeparator: string;
}
interface RowBorderStyleFull {
  fill: string;
  columnSeparator: string;
  left: string;
  right: string;
}

type RowBorderStyle = RowBorderStyleInner | RowBorderStyleFull;

interface BorderStyleInner {
  separatorRow?: RowBorderStyleInner;
  dataRow: RowBorderStyleInner;
}
interface BorderStyleFull {
  top: RowBorderStyleFull;
  bottom: RowBorderStyleFull;
  separatorRow?: RowBorderStyleFull;
  dataRow: RowBorderStyleFull;
}
type BorderStyle = BorderStyleInner | BorderStyleFull;

export const STANDARD_BORDERS: BorderStyleFull = {
  top: {
    fill: '─',
    columnSeparator: '┬',
    left: '┌',
    right: '┐',
  },

  bottom: {
    fill: '─',
    columnSeparator: '┴',
    left: '└',
    right: '┘',
  },

  separatorRow: {
    fill: '─',
    columnSeparator: '┼',
    left: '├',
    right: '┤',
  },

  dataRow: {
    fill: ' ',
    columnSeparator: '│',
    left: '│',
    right: '│',
  },
};

export const THICK_BORDERS: BorderStyleFull = {
  top: {
    fill: '━',
    columnSeparator: '┳',
    left: '┏',
    right: '┓',
  },

  bottom: {
    fill: '━',
    columnSeparator: '┻',
    left: '┗',
    right: '┛',
  },

  separatorRow: {
    fill: '━',
    columnSeparator: '╋',
    left: '┣',
    right: '┫',
  },

  dataRow: {
    fill: ' ',
    columnSeparator: '┃',
    left: '┃',
    right: '┃',
  },
};

export const SIMPLE_BORDERS: BorderStyleInner = {
  separatorRow: {
    fill: '-',
    columnSeparator: '|',
  },

  dataRow: {
    fill: ' ',
    columnSeparator: '|',
  },
};

function hasRowExterior(borderStyle: RowBorderStyle): borderStyle is RowBorderStyleFull {
  return 'left' in borderStyle;
}
function hasTableExterior(borderStyle: BorderStyle): borderStyle is BorderStyleFull {
  return 'top' in borderStyle;
}

interface TableInitializationParams {
  borderStyle?: BorderStyle;
  rows?: CellContent[][];
}

export class Table {
  private readonly padding = 1;
  private readonly borderStyle: BorderStyle;
  private readonly dataRows: CellContent[][];

  private headerRow: CellContent[] | undefined;

  public constructor(params: TableInitializationParams = {}) {
    this.dataRows = params.rows ?? [];
    this.borderStyle = params.borderStyle ?? STANDARD_BORDERS;
  }
  public header(...cells: CellContent[]): Table {
    this.headerRow = cells;
    return this;
  }
  public rows(...rows: CellContent[][]): Table {
    this.dataRows.push(...rows);
    return this;
  }

  public render(): string {
    const columnWidths = calculateColumnWidths([this.headerRow ?? [], ...this.dataRows]);
    const buffer: string[] = [];
    const baseParams = { columnWidths, padding: this.padding };

    if (hasTableExterior(this.borderStyle)) {
      buffer.push(renderRow({ rowType: RowType.TOP_BORDER, borderStyle: this.borderStyle.top, ...baseParams }));
    }

    if (this.headerRow != null) {
      buffer.push(
        renderRow({
          rowType: RowType.HEADER_ROW,
          data: this.headerRow,
          borderStyle: this.borderStyle.dataRow,
          ...baseParams,
        }),
      );
    }

    if (this.borderStyle.separatorRow != null) {
      buffer.push(
        renderRow({ rowType: RowType.SEPARATOR_ROW, borderStyle: this.borderStyle.separatorRow, ...baseParams }),
      );
    }

    for (const row of this.dataRows) {
      buffer.push(
        renderRow({ rowType: RowType.DATA_ROW, data: row, borderStyle: this.borderStyle.dataRow, ...baseParams }),
      );
    }

    if (hasTableExterior(this.borderStyle)) {
      buffer.push(renderRow({ rowType: RowType.BOTTOM_BORDER, borderStyle: this.borderStyle.bottom, ...baseParams }));
    }

    return buffer.join(EOL);
  }
}

interface RenderRowParams {
  borderStyle: RowBorderStyle;
  columnWidths: number[];
  padding: number;
  rowType: RowType;
  data?: CellContent[];
}

interface RenderCellParams {
  content: CellContent;
  rowType: RowType;
  width: number;
  paddingChar: string;
  padding: number;
}

function renderRow(params: RenderRowParams): string {
  const buffer: string[] = [];
  const padding = Math.max(params.padding, 0);
  if (hasRowExterior(params.borderStyle)) {
    buffer.push(params.borderStyle.left);
  }
  for (let i = 0; i < params.columnWidths.length; i++) {
    const prefix = i === 0 ? '' : params.borderStyle.columnSeparator;
    const width = params.columnWidths[i];
    const cellData = params.data == null ? undefined : params.data[i];
    const content = renderCell({
      content: cellData,
      rowType: params.rowType,
      paddingChar: params.borderStyle.fill,
      width,
      padding,
    });
    buffer.push(prefix + content);
  }
  if (hasRowExterior(params.borderStyle)) {
    buffer.push(params.borderStyle.right);
  }
  return buffer.join('');
}

function renderCell(cell: RenderCellParams): string {
  let { text, alignmentDisposition } = renderValue(cell.content);
  const formatting = isFormattedContent(cell.content) ? cell.content : undefined;
  const alignment = formatting?.alignment ?? alignmentDisposition ?? CellAlignment.LEFT;
  const availableWidth = cell.width; // Cell width does not include padding
  const textLength = trueStringWidth(text);
  if (textLength > availableWidth) {
    text = text.substring(0, availableWidth - 1) + '…';
  }
  const extraPadding = cell.width - textLength;
  let leftPadding = cell.padding;
  let rightPadding = cell.padding;
  switch (alignment) {
    case CellAlignment.LEFT:
      rightPadding += extraPadding;
      break;
    case CellAlignment.RIGHT:
      leftPadding += extraPadding;
      break;
    case CellAlignment.CENTER:
      leftPadding += Math.floor(extraPadding / 2);
      rightPadding += Math.ceil(extraPadding / 2);
      break;
  }
  text = cell.paddingChar.repeat(leftPadding) + text + cell.paddingChar.repeat(rightPadding);
  const formatter = formatting?.formatter ??
    (cell.rowType === RowType.HEADER_ROW ? DEFAULT_HEADER_FORMATTER : undefined);
  if (formatter == null) {
    return text;
  } else {
    return formatter(text);
  }
}

function calculateColumnWidths(dataRows: CellContent[][]): number[] {
  const columnWidths: number[] = [];
  for (const row of dataRows) {
    for (let i = 0; i < row.length; i++) {
      const oldWidth = columnWidths[i];
      const newWidth = trueStringWidth(renderValue(row[i]).text);
      if (oldWidth == null || oldWidth < newWidth) {
        columnWidths[i] = newWidth;
      }
    }
  }
  return columnWidths;
}

interface RenderedText {
  text: string;
  alignmentDisposition?: CellAlignment;
}

function isFormattedContent(content: CellContent): content is FormattedCellContent {
  return typeof content === 'object' && content.value != null;
}
function renderValue(content: CellContent): RenderedText {
  let value: CellValue | unknown;
  if (isFormattedContent(content)) {
    value = content.value;
  } else {
    value = content;
  }
  if (typeof value === 'string') {
    return { text: value };
  } else if (typeof value === 'number') {
    return { text: String(value), alignmentDisposition: CellAlignment.RIGHT };
  } else if (typeof value === 'boolean') {
    const text = value ? '✅' : '❌';
    return { text, alignmentDisposition: CellAlignment.CENTER };
  } else if (value == null) {
    return { text: '' };
  } else {
    return { text: String(value) };
  }
}
