const EOL = Deno.build.os === 'windows' ? '\r\n' : '\n';

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
    fill: "─",
    columnSeparator: "┬",
    left: "┌",
    right: "┐"
  },

  bottom: {
    fill: "─",
    columnSeparator: "┴",
    left: "└",
    right: "┘"
  },

  separatorRow: {
    fill: "─",
    columnSeparator: "┼",
    left: "├",
    right: "┤"
  },

  dataRow: {
    fill: " ",
    columnSeparator: "│",
    left: "│",
    right: "│"
  },
}

export const THICK_BORDERS: BorderStyleFull = {
  top: {
    fill: "━",
    columnSeparator: "┳",
    left: "┏",
    right: "┓"
  },

  bottom: {
    fill: "━",
    columnSeparator: "┻",
    left: "┗",
    right: "┛"
  },

  separatorRow: {
    fill: "━",
    columnSeparator: "╋",
    left: "┣",
    right: "┫"
  },

  dataRow: {
    fill: " ",
    columnSeparator: "┃",
    left: "┃",
    right: "┃"
  },
};

export const SIMPLE_BORDERS: BorderStyleInner = {
  separatorRow: {
    fill: "-",
    columnSeparator: "|",
  },

  dataRow: {
    fill: " ",
    columnSeparator: "|",
  },
}

function hasRowExterior(borderStyle: RowBorderStyle): borderStyle is RowBorderStyleFull {
  return 'left' in borderStyle;
}
function hasTableExterior(borderStyle: BorderStyle): borderStyle is BorderStyleFull {
  return 'top' in borderStyle;
}

interface TableInitializationParams {
  borderStyle?: BorderStyle;
  rows?: string[][];
}

export class Table {
  private readonly padding = 1;
  private readonly borderStyle: BorderStyle;
  private readonly dataRows: string[][];

  private headingRow: string[] | undefined;

  public constructor(params: TableInitializationParams = {}) {
    this.dataRows = params.rows ?? [];
    this.borderStyle = params.borderStyle ?? STANDARD_BORDERS;
  }
  public heading(...cells: string[]): Table {
    this.headingRow = cells;
    return this;
  }
  public rows(...rows: string[][]): Table {
    this.dataRows.push(...rows);
    return this;
  }

  public render(): string {
    const columnWidths = calculateColumnWidths([this.headingRow ?? [], ...this.dataRows]);
    const buffer: string[] = [];
    const baseParams = { columnWidths, padding: this.padding };

    if (hasTableExterior(this.borderStyle)) {
      buffer.push(renderRow({ borderStyle: this.borderStyle.top, ...baseParams }));
    }

    if (this.headingRow != null) {
      buffer.push(renderRow({ data: this.headingRow, borderStyle: this.borderStyle.dataRow, ...baseParams }));
    }

    if (this.borderStyle.separatorRow != null) {
      buffer.push(renderRow({ borderStyle: this.borderStyle.separatorRow, ...baseParams }));
    }

    for (const row of this.dataRows) {
      buffer.push(renderRow({ data: row, borderStyle: this.borderStyle.dataRow, ...baseParams }));
    }

    if (hasTableExterior(this.borderStyle)) {
      buffer.push(renderRow({ borderStyle: this.borderStyle.bottom, ...baseParams }));
    }

    return buffer.join(EOL);
  }
}

interface RenderRowParams {
  borderStyle: RowBorderStyle;
  columnWidths: number[];
  padding: number;
  data?: string[];
}

function renderRow(params: RenderRowParams): string {
  const buffer: string[] = [];
  const padding = params.padding <= 0 ? '' : params.borderStyle.fill.repeat(params.padding);
  if (hasRowExterior(params.borderStyle)) {
    buffer.push(params.borderStyle.left);
  }
  for (let i = 0; i < params.columnWidths.length; i++) {
    const prefix = i === 0 ? '' : params.borderStyle.columnSeparator;
    const width = params.columnWidths[i];
    const content = params.data == null ? '' : params.data[i];
    buffer.push(prefix + padding + content + params.borderStyle.fill.repeat(width - content.length) + padding);
  }
  if (hasRowExterior(params.borderStyle)) {
    buffer.push(params.borderStyle.right);
  }
  return buffer.join('');
}

function calculateColumnWidths(dataRows: string[][]): number[] {
  const columnWidths: number[] = [];
  for (const row of dataRows) {
    for (let i = 0; i < row.length; i++) {
      const oldWidth = columnWidths[i];
      const newWidth = row[i].length;
      if (oldWidth == null || oldWidth < newWidth) {
        columnWidths[i] = newWidth;
      }
    }
  }
  return columnWidths;
}
