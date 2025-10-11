import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

type ColumnDef<T> = {
  header: string;
  key: keyof T | string;
  width?: number;
};

type ExportOptions<T> = {
  data: T[];
  fileName: string;
  columns: ColumnDef<T>[];
  groupBy?: (item: T) => string;
  sortByKey?: string; // optional sorting key
};

export async function csvExport<T>({
  data,
  fileName,
  columns,
  groupBy,
  sortByKey,
}: ExportOptions<T>) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Sheet 1");

  worksheet.columns = columns.map(
    (col): Partial<ExcelJS.Column> => ({
      header: col.header,
      key: String(col.key),
      width: col.width || 20,
    })
  );

  // Write header row
  const headerRow = worksheet.getRow(1);
  headerRow.height = 20;

  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "4472C4" },
    };
    cell.alignment = { horizontal: "center", vertical: "middle" };
  });

  const processedData = [...data];

  if (sortByKey) {
    processedData.sort((a, b) => {
      const aVal = String(resolveKey(a, sortByKey)).toLowerCase();
      const bVal = String(resolveKey(b, sortByKey)).toLowerCase();
      return aVal.localeCompare(bVal);
    });
  }

  if (groupBy) {
    const groups = processedData.reduce((acc, item) => {
      const key = groupBy(item);
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {} as Record<string, T[]>);

    let rowIndex = 2;

    for (const [groupKey, items] of Object.entries(groups)) {
      const groupRow = worksheet.addRow([groupKey]);
      groupRow.font = { bold: true };
      groupRow.alignment = { horizontal: "center" };
      groupRow.getCell(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFE699" },
      };

      worksheet.mergeCells(
        `A${rowIndex}:${String.fromCharCode(64 + columns.length)}${rowIndex}`
      );
      rowIndex++;

      items.forEach((item) => {
        const rowData: Record<string, any> = {};
        columns.forEach((col) => {
          rowData[col.key as string] = resolveKey(item, col.key as string);
        });
        worksheet.addRow(rowData);
        rowIndex++;
      });

      worksheet.addRow([]);
      rowIndex++;
    }
  } else {
    processedData.forEach((item) => {
      const rowData: Record<string, any> = {};
      columns.forEach((col) => {
        rowData[col.key as string] = resolveKey(item, col.key as string);
      });
      worksheet.addRow(rowData);
    });
  }

  // Add borders and alignments to all cells except the header’s fill area
  worksheet.eachRow((row, rowNumber) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin", color: { argb: "000000" } },
        left: { style: "thin", color: { argb: "000000" } },
        bottom: { style: "thin", color: { argb: "000000" } },
        right: { style: "thin", color: { argb: "000000" } },
      };
      cell.alignment = { vertical: "middle", horizontal: "left" };
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), `${fileName}.xlsx`);
}

function resolveKey(obj: any, keyPath: string): any {
  return keyPath.split(".").reduce((acc, key) => acc?.[key], obj) ?? "";
}
