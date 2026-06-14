import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const exportExcel = () => {
  const ws = XLSX.utils.json_to_sheet(report);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Report");

  const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  saveAs(new Blob([buffer]), "participants.xlsx");
};
