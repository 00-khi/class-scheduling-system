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

export async function xlsxExport<T>({
  data,
  fileName,
  columns,
  groupBy,
  sortByKey,
}: ExportOptions<T>) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Sheet 1");

  // set columns (this creates the header row initially at row 1)
  worksheet.columns = columns.map(
    (col): Partial<ExcelJS.Column> => ({
      header: col.header,
      key: String(col.key),
      width: col.width || 20,
    })
  );

  // move header down so column headers end up at row 4
  // insert rows at the top: 1 -> title, 2 -> datetime, 3 -> blank
  worksheet.insertRow(1, ["STI College Legazpi"]);
  const generatedDateStr = new Date().toLocaleString("en-PH", {
    timeZone: "Asia/Manila",
  });
  worksheet.insertRow(2, [generatedDateStr]);
  worksheet.insertRow(3, []); // blank row

  const headerRowIndex = 4;
  const headerRow = worksheet.getRow(headerRowIndex);
  headerRow.height = 20;

  // style the column header row
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "4472C4" },
    };
    cell.alignment = { horizontal: "center", vertical: "middle" };
  });

  // style the main title (row 1) and merge across columns
  const lastColLetter = columnNumberToName(columns.length);
  worksheet.mergeCells(`A1:${lastColLetter}1`);
  const titleRow = worksheet.getRow(1);
  titleRow.getCell(1).font = { bold: true, size: 14 };
  titleRow.getCell(1).alignment = { horizontal: "center", vertical: "middle" };

  // style the generated datetime row (row 2) and merge across columns
  worksheet.mergeCells(`A2:${lastColLetter}2`);
  const dateRow = worksheet.getRow(2);
  dateRow.getCell(1).alignment = { horizontal: "right", vertical: "middle" };

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
      const groupKey = groupBy(item);
      if (!acc[groupKey]) acc[groupKey] = [];
      acc[groupKey].push(item);
      return acc;
    }, {} as Record<string, T[]>);

    let rowIndex = headerRowIndex + 1; // start after the header row

    Object.keys(groups)
      .sort()
      .forEach((level) => {
        const mainRow = worksheet.addRow([level]);
        mainRow.font = { bold: true };
        mainRow.alignment = { horizontal: "center" };
        mainRow.getCell(1).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFD966" },
        };

        worksheet.mergeCells(`A${rowIndex}:${lastColLetter}${rowIndex}`);
        rowIndex++;

        const fallbackKey = columns[0].key as string;
        const nestedGroups = groups[level].reduce((acc, item) => {
          const key = resolveKey(item, fallbackKey);
          if (!acc[key]) acc[key] = [];
          acc[key].push(item);
          return acc;
        }, {} as Record<string, T[]>);

        Object.keys(nestedGroups)
          .sort()
          .forEach((sub) => {
            const subRow = worksheet.addRow([sub]);
            subRow.font = { bold: true };
            subRow.getCell(1).fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "FFF2CC" },
            };

            worksheet.mergeCells(`A${rowIndex}:${lastColLetter}${rowIndex}`);
            rowIndex++;

            nestedGroups[sub].forEach((item) => {
              const rowData: Record<string, any> = {};
              columns.forEach((col) => {
                rowData[col.key as string] = resolveKey(
                  item,
                  col.key as string
                );
              });
              worksheet.addRow(rowData);
              rowIndex++;
            });

            worksheet.addRow([]);
            rowIndex++;
          });

        worksheet.addRow([]);
        rowIndex++;
      });
  } else {
    processedData.forEach((item) => {
      const rowData: Record<string, any> = {};
      columns.forEach((col) => {
        rowData[col.key as string] = resolveKey(item, col.key as string);
      });
      worksheet.addRow(rowData);
    });
  }

  // Add borders and alignments to all cells
  worksheet.eachRow((row) => {
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

function columnNumberToName(num: number) {
  let s = "";
  while (num > 0) {
    const mod = (num - 1) % 26;
    s = String.fromCharCode(65 + mod) + s;
    num = Math.floor((num - mod) / 26);
  }
  return s;
}
