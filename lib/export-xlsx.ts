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
      const groupKey = groupBy(item);
      if (!acc[groupKey]) acc[groupKey] = [];
      acc[groupKey].push(item);
      return acc;
    }, {} as Record<string, T[]>);

    let rowIndex = 2;

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

        worksheet.mergeCells(
          `A${rowIndex}:${String.fromCharCode(64 + columns.length)}${rowIndex}`
        );
        rowIndex++;

        // // second grouping inside each academic level
        // const nestedGroups = groups[level].reduce((acc, item) => {
        //   const sectionName = resolveKey(item, "section.name");
        //   if (!acc[sectionName]) acc[sectionName] = [];
        //   acc[sectionName].push(item);
        //   return acc;
        // }, {} as Record<string, T[]>);

        // let nestedGroups: Record<string, T[]> = {};

        // if (sortByKey === "section.name") {
        //   nestedGroups = groups[level].reduce((acc, item) => {
        //     const sectionName = resolveKey(item, "section.name");
        //     if (!acc[sectionName]) acc[sectionName] = [];
        //     acc[sectionName].push(item);
        //     return acc;
        //   }, {} as Record<string, T[]>);
        // } else if (sortByKey === "room.name") {
        //   nestedGroups = groups[level].reduce((acc, item) => {
        //     const roomName = resolveKey(item, "room.name");
        //     if (!acc[roomName]) acc[roomName] = [];
        //     acc[roomName].push(item);
        //     return acc;
        //   }, {} as Record<string, T[]>);
        // } else if (sortByKey === "instructor.name") {
        //   nestedGroups = groups[level].reduce((acc, item) => {
        //     const instructorName = resolveKey(item, "instructor.name");
        //     if (!acc[instructorName]) acc[instructorName] = [];
        //     acc[instructorName].push(item);
        //     return acc;
        //   }, {} as Record<string, T[]>);
        // } else {
        //   // FALLBACK: use the first column key
        //   const fallbackKey = columns[0].key as string;
        //   nestedGroups = groups[level].reduce((acc, item) => {
        //     const key = resolveKey(item, fallbackKey);
        //     if (!acc[key]) acc[key] = [];
        //     acc[key].push(item);
        //     return acc;
        //   }, {} as Record<string, T[]>);
        // }

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

            worksheet.mergeCells(
              `A${rowIndex}:${String.fromCharCode(
                64 + columns.length
              )}${rowIndex}`
            );
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
