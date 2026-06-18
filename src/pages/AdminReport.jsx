
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";
import api from "../services/api";
import socket from "../socket";
import Pagination from "../components/Pagination";
import MessageModal from "../components/MessageModal";
import {
  buildOrganizationSummary,
  flattenConfirmedBookings,
  groupParticipantRows,
  normalizeText,
} from "../utils/reportHelpers";

function StatCard({ num, label }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-3 sm:p-6 text-center hover:shadow-2xl hover:-translate-y-1 transition">
      <h2 className="text-xl sm:text-4xl font-bold text-purple-600 leading-tight">
        {num}
      </h2>
      <p className="text-[11px] sm:text-base text-gray-600 mt-1 sm:mt-2 leading-tight">
        {label}
      </p>
    </div>
  );
}

function SexBreakdownCard({ men, women }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-3 sm:p-6 text-center hover:shadow-2xl hover:-translate-y-1 transition">
      <div className="grid grid-cols-2 gap-3 items-center">
        <div>
          <h2 className="text-xl sm:text-4xl font-bold text-purple-600 leading-tight">
            {men}
          </h2>
          <p className="text-[11px] sm:text-base text-gray-600 mt-1 sm:mt-2 leading-tight">
            Men
          </p>
        </div>
        <div>
          <h2 className="text-xl sm:text-4xl font-bold text-purple-600 leading-tight">
            {women}
          </h2>
          <p className="text-[11px] sm:text-base text-gray-600 mt-1 sm:mt-2 leading-tight">
            Women
          </p>
        </div>
      </div>
      <p className="text-[11px] sm:text-base text-gray-600 mt-3 leading-tight">
        Total Men & Women
      </p>
    </div>
  );
}

function ParticipantTable({ rows, columns = [], emptyMessage = "No data" }) {
  return (
    <div className="w-full max-w-full overflow-x-auto overflow-y-hidden pb-2 [scrollbar-gutter:stable]">
      <table className="min-w-[1100px] w-max bg-white rounded-xl shadow">
        <thead className="bg-purple-100">
          <tr>
            {columns.map((column) => (
              <th key={column.key} className="p-2 text-left text-xs md:text-sm">
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="p-4 text-center text-sm text-gray-500"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row, index) => (
              <tr
                key={`${row.bookingId || row.organization || "row"}-${row.role || "main"}-${index}-${row.name || "name"}`}
                className="border-b hover:bg-purple-50 transition"
              >
                {columns.map((column) => (
                  <td
                    key={`${column.key}-${index}`}
                    className="p-2 text-xs md:text-sm align-top"
                  >
                    {column.render ? column.render(row, index) : row[column.key] ?? "—"}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function safeFilePart(value) {
  return normalizeText(value || "report").replace(/[\\/:*?"<>|]+/g, "_");
}

function addHyperlinkCell(worksheet, cellAddress, url, label = "View payment") {
  const cell = worksheet[cellAddress];
  if (!cell) return;
  cell.v = label;
  cell.l = { Target: url, Tooltip: "View payment proof" };
}

function chunkArray(items = [], size = 15) {
  if (!Array.isArray(items) || items.length === 0) return [];
  const chunks = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

function createSheetFromRows(title, headers, rows, generatedAt) {
  const aoa = [
    [title],
    ["Generated", generatedAt],
    [],
    headers,
    ...rows,
  ];

  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } }];
  ws["!rows"] = [{ hpt: 26 }, { hpt: 18 }, { hpt: 12 }, { hpt: 20 }];
  ws["!autofilter"] = {
    ref: XLSX.utils.encode_range({
      s: { r: 3, c: 0 },
      e: { r: Math.max(3, rows.length + 3), c: headers.length - 1 },
    }),
  };
  return ws;
}

function ExportPage({ page, pageIndex, totalPages, generatedAt }) {
  return (
    <div
      className="w-[794px] h-[1123px] bg-white text-[#1f2937] px-10 py-8 box-border flex flex-col overflow-hidden"
      style={{
        fontFamily: "Arial, Helvetica, sans-serif",
        pageBreakAfter: "always",
      }}
    >
      <div className="rounded-[26px] bg-purple-600 text-white px-8 py-6">
        <h1 className="text-[28px] font-bold leading-tight">{page.reportTitle}</h1>
        <p className="text-[13px] mt-1 opacity-95">{page.reportSubtitle}</p>
      </div>

      <div className="mt-5 flex items-start justify-between gap-4 text-[12px] text-gray-600">
        <div>
          <p>
            <span className="font-semibold">Generated:</span> {generatedAt}
          </p>
          <p className="mt-1">
            <span className="font-semibold">Section:</span> {page.sectionTitle}
          </p>
        </div>
        <div className="text-right">
          <p>
            <span className="font-semibold">Page:</span> {pageIndex + 1} / {totalPages}
          </p>
          <p className="mt-1">
            <span className="font-semibold">Rows:</span> {page.rows.length}
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-2xl bg-purple-50 px-4 py-3">
        <h2 className="text-[20px] font-bold text-purple-700">{page.sectionTitle}</h2>
        {page.sectionSubtitle ? (
          <p className="mt-1 text-[12px] text-gray-600">{page.sectionSubtitle}</p>
        ) : null}
      </div>

      <div className="mt-4 flex-1 overflow-hidden">
        <table className="w-full border-separate border-spacing-0">
          <thead>
            <tr className="bg-purple-100">
              {page.columns.map((col) => (
                <th
                  key={col.key}
                  className="border-b border-purple-200 px-2 py-2 text-left text-[12px] font-bold text-[#312e81]"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {page.rows.map((row, index) => (
              <tr key={`${page.sectionKey}-${index}`} className="align-top">
                {page.columns.map((col) => {
                  const isProof = col.key === "paymentProof";
                  const text = col.renderText
                    ? col.renderText(row, index)
                    : row[col.key] ?? "—";
                  return (
                    <td
                      key={`${col.key}-${index}`}
                      className="border-b border-gray-200 px-2 py-2 text-[11px]"
                    >
                      {isProof && row.paymentProof ? (
                        <a
                          href={row.paymentProof}
                          data-pdf-link="1"
                          className="font-semibold text-purple-700 underline"
                        >
                          {text}
                        </a>
                      ) : (
                        text
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 border-t border-gray-200 pt-3 text-[11px] text-gray-500 flex items-center justify-between">
        <span>Qine Economy Family Travel Payment Report</span>
        <span>Powered by MuluTilaCodeComp</span>
      </div>
    </div>
  );
}

function buildPdfPages(flatRows, summaryRows, groupedByOrganization, groupedBySubCity) {
  const detailCols = [
    { key: "serial", label: "ID", renderText: (row) => String(row.serial) },
    { key: "name", label: "Name" },
    { key: "organization", label: "Organization" },
    { key: "phone", label: "Phone" },
    { key: "sex", label: "Sex" },
    { key: "subCity", label: "Sub City" },
    { key: "paymentProof", label: "Payment Proof", renderText: () => "View payment" },
    {
      key: "submittedAt",
      label: "Submitted",
      renderText: (row) =>
        row.submittedAt ? new Date(row.submittedAt).toLocaleString() : "—",
    },
  ];

  const summaryCols = [
    { key: "id", label: "ID" },
    { key: "organization", label: "Organization" },
    { key: "totalParticipants", label: "Participants" },
    { key: "men", label: "Men" },
    { key: "women", label: "Women" },
    { key: "subCitiesCount", label: "Sub Cities" },
  ];

  const pages = [];

  chunkArray(flatRows, 18).forEach((rows, index, arr) => {
    pages.push({
      reportTitle: "Confirmed Booking Report",
      reportSubtitle: "Professional export in standard A4 layout",
      sectionTitle: "All Confirmed Participants",
      sectionSubtitle: `Participant records ${index + 1} of ${arr.length}`,
      sectionKey: `confirmed-${index + 1}`,
      columns: detailCols,
      rows,
    });
  });

  chunkArray(summaryRows, 22).forEach((rows, index, arr) => {
    pages.push({
      reportTitle: "Confirmed Booking Report",
      reportSubtitle: "Professional export in standard A4 layout",
      sectionTitle: "Organization Participant Summary",
      sectionSubtitle: `Summary records ${index + 1} of ${arr.length}`,
      sectionKey: `summary-${index + 1}`,
      columns: summaryCols,
      rows,
    });
  });

  groupedByOrganization.forEach((group) => {
    chunkArray(group.rows, 18).forEach((rows, index, arr) => {
      pages.push({
        reportTitle: "Confirmed Booking Report",
        reportSubtitle: "Professional export in standard A4 layout",
        sectionTitle: "Grouped by Organization",
        sectionSubtitle: `${group.key} · page ${index + 1} of ${arr.length}`,
        sectionKey: `org-${group.key}-${index + 1}`,
        columns: detailCols,
        rows,
      });
    });
  });

  groupedBySubCity.forEach((group) => {
    chunkArray(group.rows, 18).forEach((rows, index, arr) => {
      pages.push({
        reportTitle: "Confirmed Booking Report",
        reportSubtitle: "Professional export in standard A4 layout",
        sectionTitle: "Grouped by Sub City",
        sectionSubtitle: `${group.key} · page ${index + 1} of ${arr.length}`,
        sectionKey: `sub-${group.key}-${index + 1}`,
        columns: detailCols,
        rows,
      });
    });
  });

  return pages;
}

async function exportPagesToPdf(pageNodes = [], fileName = "report.pdf") {
  if (!pageNodes.length) {
    throw new Error("No printable pages found.");
  }

  const pdf = new jsPDF("p", "pt", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  for (let i = 0; i < pageNodes.length; i += 1) {
    const node = pageNodes[i];
    if (!node) continue;

    const canvas = await html2canvas(node, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
      windowWidth: node.scrollWidth,
      windowHeight: node.scrollHeight,
    });

    const imgData = canvas.toDataURL("image/png");
    if (i > 0) pdf.addPage();
    pdf.addImage(imgData, "PNG", 0, 0, pageWidth, pageHeight);

    const nodeRect = node.getBoundingClientRect();
    const links = Array.from(node.querySelectorAll("a[data-pdf-link='1']"));
    links.forEach((link) => {
      const href = link.getAttribute("href");
      if (!href) return;
      const rect = link.getBoundingClientRect();
      const x = ((rect.left - nodeRect.left) / nodeRect.width) * pageWidth;
      const y = ((rect.top - nodeRect.top) / nodeRect.height) * pageHeight;
      const w = (rect.width / nodeRect.width) * pageWidth;
      const h = (rect.height / nodeRect.height) * pageHeight;
      pdf.link(x, y, w, h, { url: href });
    });
  }

  pdf.save(fileName);
}


function buildSheet(ws, widths) {
  ws["!cols"] = widths.map((wch) => ({ wch }));
  ws["!rows"] = [{ hpt: 24 }, { hpt: 18 }, { hpt: 10 }, { hpt: 20 }];
  return ws;
}

export default function AdminReport() {
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [report, setReport] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  const [modal, setModal] = useState({
    open: false,
    title: "",
    message: "",
    type: "info",
    onConfirm: null,
    confirmLabel: "እሺ",
    cancelLabel: "አይ",
  });

  const [search, setSearch] = useState("");
  const [orgFilter, setOrgFilter] = useState("All");
  const [subCityFilter, setSubCityFilter] = useState("All");

  const [mainPage, setMainPage] = useState(1);
  const [summaryPage, setSummaryPage] = useState(1);

  const [groupOrgPages, setGroupOrgPages] = useState({});
  const [groupSubCityPages, setGroupSubCityPages] = useState({});
  const [expandedBookingIds, setExpandedBookingIds] = useState({});

  const mainPerPage = 7;
  const summaryPerPage = 7;
  const groupPerPage = 7;

  const exportPageRefs = useRef([]);
  const groupPageRefs = useRef({});

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) navigate("/");
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  }, [navigate]);

  useEffect(() => {
    if (!sidebarOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [sidebarOpen]);

  const showModal = (
    title,
    message,
    type = "info",
    onConfirm = null,
    confirmLabel = "እሺ",
    cancelLabel = "አይ",
  ) =>
    setModal({
      open: true,
      title,
      message,
      type,
      onConfirm,
      confirmLabel,
      cancelLabel,
    });

  const closeModal = () =>
    setModal({
      open: false,
      title: "",
      message: "",
      type: "info",
      onConfirm: null,
      confirmLabel: "እሺ",
      cancelLabel: "አይ",
    });

  const refreshStats = async () => {
    try {
      const statRes = await api.get("/admin/stats");
      setStats(statRes.data || {});
    } catch (err) {
      console.error("Stats error:", err.response?.data || err.message);
      setStats({
        totalParticipants: 0,
        pendingPayments: 0,
        organizationBreakdown: {},
        totalBookings: 0,
      });
    }
  };

  const fetchReport = async () => {
    try {
      await refreshStats();

      const res = await api.get("/reports/confirmed");
      const data = Array.isArray(res.data)
        ? res.data
        : res.data?.data || res.data?.results || res.data?.reports || [];

      const sorted = (data || []).sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      );

      setReport(sorted);
    } catch (err) {
      console.error("Report fetch error:", err.response?.data || err.message);
      setReport([]);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  useEffect(() => {
    const onNewBooking = () => {
      setNotifCount((c) => c + 1);
      fetchReport();
    };

    socket.on("newBooking", onNewBooking);
    socket.on("bookingUpdated", fetchReport);

    return () => {
      socket.off("newBooking", onNewBooking);
      socket.off("bookingUpdated", fetchReport);
    };
  }, []);

  useEffect(() => {
    setMainPage(1);
    setSummaryPage(1);
    setGroupOrgPages({});
    setGroupSubCityPages({});
  }, [search, orgFilter, subCityFilter]);

  const menu = [
    { id: "dashboard", label: "Booking Overview", path: "/admin-dashboard" },
    { id: "report", label: "Booking Report", path: "/admin-report" },
    { id: "history", label: "History Log", path: "/admin-history" },
    { id: "logout", label: "LOGOUT", action: "logout" },
  ];

  const handleMenu = (item) => {
    setSidebarOpen(false);
    if (item.action === "logout") {
      localStorage.removeItem("adminToken");
      navigate("/admin-login");
      return;
    }
    if (item.path) navigate(item.path);
  };

  const orgOptions = useMemo(() => {
    const set = new Set();
    report.forEach((item) => {
      const org = normalizeText(item.organization);
      if (org) set.add(org);
      (item.participantDetails || []).forEach((participant) => {
        const subOrg = normalizeText(participant.organization);
        if (subOrg) set.add(subOrg);
      });
    });
    return ["All", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [report]);

  const subCityOptions = useMemo(() => {
    const set = new Set();
    report.forEach((item) => {
      const subCity = normalizeText(item.subCity);
      if (subCity) set.add(subCity);
      (item.participantDetails || []).forEach((participant) => {
        const value = normalizeText(participant.subCity) || subCity;
        if (value) set.add(value);
      });
    });
    return ["All", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [report]);

  const filteredBookings = useMemo(() => {
    const q = normalizeText(search).toLowerCase();

    return report.filter((booking) => {
      const bookingOrg = normalizeText(booking.organization);
      const bookingSubCity = normalizeText(booking.subCity) || "Unknown";

      const orgOk = orgFilter === "All" ? true : bookingOrg === orgFilter;
      const subCityOk =
        subCityFilter === "All" ? true : bookingSubCity === subCityFilter;

      const haystack = [
        booking.name,
        booking.organization,
        booking.phone,
        booking.sex,
        booking.subCity,
        ...(booking.participantDetails || []).flatMap((participant) => [
          participant.name,
          participant.phone,
          participant.organization,
          participant.sex,
          participant.subCity,
        ]),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const qOk = !q || haystack.includes(q);
      return orgOk && subCityOk && qOk;
    });
  }, [report, search, orgFilter, subCityFilter]);

  const flatRows = useMemo(
    () => flattenConfirmedBookings(filteredBookings),
    [filteredBookings],
  );

  const summaryRows = useMemo(
    () => buildOrganizationSummary(flatRows),
    [flatRows],
  );

  const groupedByOrganization = useMemo(
    () => groupParticipantRows(flatRows, "organization"),
    [flatRows],
  );

  const groupedBySubCity = useMemo(
    () => groupParticipantRows(flatRows, "subCity"),
    [flatRows],
  );

  const generatedAt = useMemo(() => new Date().toLocaleString(), [filteredBookings]);

  const pdfPages = useMemo(
    () => buildPdfPages(flatRows, summaryRows, groupedByOrganization, groupedBySubCity),
    [flatRows, summaryRows, groupedByOrganization, groupedBySubCity],
  );

  const mainTotalPages = Math.ceil(filteredBookings.length / mainPerPage) || 1;
  const summaryTotalPages = Math.ceil(summaryRows.length / summaryPerPage) || 1;

  const paginatedBookings = useMemo(() => {
    const start = (mainPage - 1) * mainPerPage;
    return filteredBookings.slice(start, start + mainPerPage);
  }, [filteredBookings, mainPage]);

  const paginatedSummaryRows = useMemo(() => {
    const start = (summaryPage - 1) * summaryPerPage;
    return summaryRows.slice(start, start + summaryPerPage);
  }, [summaryRows, summaryPage]);

  const visibleOrgGroups = groupedByOrganization;
  const visibleSubCityGroups = groupedBySubCity;

  const summaryStats = useMemo(() => {
    let totalMen = 0;
    let totalWomen = 0;

    flatRows.forEach((row) => {
      const sex = normalizeText(row.sex).toLowerCase();
      if (sex === "ወንድ" || sex === "male") totalMen += 1;
      if (sex === "ሴት" || sex === "female") totalWomen += 1;
    });

    return {
      totalParticipants: flatRows.length,
      totalOrganizations: summaryRows.length,
      totalSubCities: groupedBySubCity.length,
      totalMen,
      totalWomen,
    };
  }, [flatRows, groupedBySubCity.length, summaryRows.length]);

  const toggleExpanded = (bookingId) => {
    setExpandedBookingIds((prev) => ({
      ...prev,
      [bookingId]: !prev[bookingId],
    }));
  };

  const getGroupPage = (pages, key) => pages[key] || 1;
  const setGroupPage = (setter, key, value) => {
    setter((prev) => ({ ...prev, [key]: value }));
  };

  const orgGroupColumns = [
    {
      key: "serial",
      label: "ID",
      render: (row) => row.serial,
    },
    { key: "name", label: "Name" },
    { key: "organization", label: "Organization" },
    { key: "phone", label: "Phone" },
    { key: "sex", label: "Sex" },
    { key: "subCity", label: "Sub City" },
    {
      key: "paymentProof",
      label: "Payment Proof",
      render: (row) =>
        row.paymentProof ? (
          <a
            href={row.paymentProof}
            target="_blank"
            rel="noreferrer"
            className="text-purple-700 underline font-semibold"
          >
            View payment
          </a>
        ) : (
          "—"
        ),
    },
    {
      key: "submittedAt",
      label: "Submitted",
      render: (row) =>
        row.submittedAt ? new Date(row.submittedAt).toLocaleString() : "—",
    },
  ];

  const summaryColumns = [
    { key: "id", label: "ID" },
    { key: "organization", label: "Organization" },
    { key: "totalParticipants", label: "Participants" },
    { key: "men", label: "Men" },
    { key: "women", label: "Women" },
    { key: "subCitiesCount", label: "Sub Cities" },
  ];

  const exportRowsToExcel = (fileName, rows, sheetName = "Confirmed") => {
    const generated = new Date().toLocaleString();
    const dataRows = rows.map((row, index) => [
      index + 1,
      row.name || "",
      row.role === "sub" ? row.participantLabel : "Main participant",
      row.sourceBooking?.name || "",
      row.organization || "",
      row.phone || "",
      row.sex || "",
      row.subCity || "",
      row.sourceBooking?.participants || "",
      row.submittedAt ? new Date(row.submittedAt).toLocaleString() : "",
      row.paymentProof || "",
      row.paymentProof ? "View payment" : "",
    ]);

    const ws = createSheetFromRows(
      `${sheetName} Export`,
      [
        "ID",
        "Participant Name",
        "Participant Type",
        "Booking Name",
        "Organization",
        "Phone",
        "Sex",
        "Sub City",
        "Participants in Booking",
        "Submitted",
        "Payment Proof URL",
        "Payment Proof",
      ],
      dataRows,
      generated,
    );
    buildSheet(ws, [8, 28, 18, 28, 34, 18, 12, 22, 18, 24, 48, 18]);
    dataRows.forEach((row, index) => {
      if (row[10]) addHyperlinkCell(ws, `L${index + 5}`, row[10]);
    });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, fileName);
  };

  const exportFullExcelFile = () => {
    const wb = XLSX.utils.book_new();
    const generated = new Date().toLocaleString();

    const overviewWs = createSheetFromRows(
      "Confirmed Booking Report",
      ["Metric", "Value"],
      [
        ["Total Participants", summaryStats.totalParticipants],
        ["Total Organizations", summaryStats.totalOrganizations],
        ["Total Sub Cities", summaryStats.totalSubCities],
        ["Men", summaryStats.totalMen],
        ["Women", summaryStats.totalWomen],
      ],
      generated,
    );
    buildSheet(overviewWs, [28, 18]);
    XLSX.utils.book_append_sheet(wb, overviewWs, "Overview");

    const confirmedRows = flatRows.map((row) => [
      row.serial,
      row.role === "sub" ? row.participantLabel : "Main participant",
      row.name || "",
      row.sourceBooking?.name || "",
      row.organization || "",
      row.phone || "",
      row.sex || "",
      row.subCity || "",
      row.submittedAt ? new Date(row.submittedAt).toLocaleString() : "",
      row.paymentProof || "",
      row.paymentProof ? "View payment" : "",
    ]);
    const confirmedWs = createSheetFromRows(
      "All Confirmed Participants",
      [
        "ID",
        "Participant Type",
        "Name",
        "Booking Name",
        "Organization",
        "Phone",
        "Sex",
        "Sub City",
        "Submitted",
        "Payment Proof URL",
        "Payment Proof",
      ],
      confirmedRows,
      generated,
    );
    buildSheet(confirmedWs, [8, 18, 26, 26, 34, 18, 12, 22, 24, 48, 18]);
    confirmedRows.forEach((row, index) => {
      if (row[9]) addHyperlinkCell(confirmedWs, `K${index + 5}`, row[9]);
    });
    XLSX.utils.book_append_sheet(wb, confirmedWs, "Confirmed Participants");

    const summaryDataRows = summaryRows.map((row) => [
      row.id,
      row.organization,
      row.totalParticipants,
      row.men,
      row.women,
      row.subCitiesCount,
    ]);
    const summaryWs = createSheetFromRows(
      "Organization Participant Summary",
      ["ID", "Organization", "Participants", "Men", "Women", "Sub Cities"],
      summaryDataRows,
      generated,
    );
    buildSheet(summaryWs, [8, 36, 16, 12, 12, 16]);
    XLSX.utils.book_append_sheet(wb, summaryWs, "Organization Summary");

    const byOrgRows = groupedByOrganization.flatMap((group) =>
      group.rows.map((row, index) => [
        group.key,
        index + 1,
        row.name || "",
        row.organization || "",
        row.phone || "",
        row.sex || "",
        row.subCity || "",
        row.submittedAt ? new Date(row.submittedAt).toLocaleString() : "",
        row.paymentProof || "",
        row.paymentProof ? "View payment" : "",
      ]),
    );
    const byOrgWs = createSheetFromRows(
      "Grouped by Organization",
      [
        "Group",
        "Group Row",
        "Name",
        "Organization",
        "Phone",
        "Sex",
        "Sub City",
        "Submitted",
        "Payment Proof URL",
        "Payment Proof",
      ],
      byOrgRows,
      generated,
    );
    buildSheet(byOrgWs, [36, 12, 24, 34, 18, 12, 22, 24, 48, 18]);
    byOrgRows.forEach((row, index) => {
      if (row[8]) addHyperlinkCell(byOrgWs, `J${index + 5}`, row[8]);
    });
    XLSX.utils.book_append_sheet(wb, byOrgWs, "Grouped by Organization");

    const bySubCityRows = groupedBySubCity.flatMap((group) =>
      group.rows.map((row, index) => [
        group.key,
        index + 1,
        row.name || "",
        row.organization || "",
        row.phone || "",
        row.sex || "",
        row.subCity || "",
        row.submittedAt ? new Date(row.submittedAt).toLocaleString() : "",
        row.paymentProof || "",
        row.paymentProof ? "View payment" : "",
      ]),
    );
    const bySubCityWs = createSheetFromRows(
      "Grouped by Sub City",
      [
        "Group",
        "Group Row",
        "Name",
        "Organization",
        "Phone",
        "Sex",
        "Sub City",
        "Submitted",
        "Payment Proof URL",
        "Payment Proof",
      ],
      bySubCityRows,
      generated,
    );
    buildSheet(bySubCityWs, [30, 12, 24, 34, 18, 12, 22, 24, 48, 18]);
    bySubCityRows.forEach((row, index) => {
      if (row[8]) addHyperlinkCell(bySubCityWs, `J${index + 5}`, row[8]);
    });
    XLSX.utils.book_append_sheet(wb, bySubCityWs, "Grouped by Sub City");

    XLSX.writeFile(wb, "confirmed-report.xlsx");
  };

  const exportAllExcel = async () => {
    try {
      exportFullExcelFile();
      showModal("ተሳክቷል", "የኤክሴል ሪፖርቱ በተሳካ ሁኔታ ተዘጋጅቶ ተወርዷል።", "success");
    } catch (error) {
      console.error(error);
      showModal("ስህተት", "የኤክሴል ሪፖርቱን መላክ አልተቻለም።", "error");
    }
  };

  const exportGroupExcel = async (type, group) => {
    try {
      exportRowsToExcel(
        `${type}-${safeFilePart(group.key)}-confirmed.xlsx`,
        group.rows,
        type === "organization" ? "Organization Group" : "Sub City Group",
      );
      showModal("ተሳክቷል", "የኤክሴል ፋይሉ በተሳካ ሁኔታ ተዘጋጅቶ ተወርዷል።", "success");
    } catch (error) {
      console.error(error);
      showModal("ስህተት", "የኤክሴል ፋይሉን መላክ አልተቻለም።", "error");
    }
  };

  const exportAllPdf = async () => {
    try {
      const nodes = exportPageRefs.current.filter(Boolean);
      await exportPagesToPdf(nodes, "confirmed-report.pdf");
      showModal("ተሳክቷል", "የፒዲኤፍ ሪፖርቱ በተሳካ ሁኔታ ተዘጋጅቶ ተወርዷል።", "success");
    } catch (error) {
      console.error(error);
      showModal("ስህተት", "የፒዲኤፍ ሪፖርቱን መላክ አልተቻለም።", "error");
    }
  };

  const exportGroupPdf = async (type, group) => {
    try {
      const key = `${type}:${group.key}`;
      const nodes = (groupPageRefs.current[key] || []).filter(Boolean);
      await exportPagesToPdf(
        nodes,
        `${type}-${safeFilePart(group.key)}-confirmed.pdf`,
      );
      showModal("ተሳክቷል", "የፒዲኤፍ ፋይሉ በተሳካ ሁኔታ ተዘጋጅቶ ተወርዷል።", "success");
    } catch (error) {
      console.error(error);
      showModal("ስህተት", "የፒዲኤፍ ፋይሉን መላክ አልተቻለም።", "error");
    }
  };

  const groupPdfPagesByOrg = useMemo(() => {
    const map = {};
    groupedByOrganization.forEach((group) => {
      map[`organization:${group.key}`] = chunkArray(group.rows, 18).map(
        (rows, index, arr) => ({
          reportTitle: "Confirmed Booking Report",
          reportSubtitle: "Professional export in standard A4 layout",
          sectionTitle: "Grouped by Organization",
          sectionSubtitle: `${group.key} · page ${index + 1} of ${arr.length}`,
          sectionKey: `organization:${group.key}:${index + 1}`,
          columns: [
            { key: "serial", label: "ID", renderText: (row) => String(row.serial) },
            { key: "name", label: "Name" },
            { key: "organization", label: "Organization" },
            { key: "phone", label: "Phone" },
            { key: "sex", label: "Sex" },
            { key: "subCity", label: "Sub City" },
            { key: "paymentProof", label: "Payment Proof", renderText: () => "View payment" },
            { key: "submittedAt", label: "Submitted", renderText: (row) => row.submittedAt ? new Date(row.submittedAt).toLocaleString() : "—" },
          ],
          rows,
        }),
      );
    });
    return map;
  }, [groupedByOrganization]);

  const groupPdfPagesBySubCity = useMemo(() => {
    const map = {};
    groupedBySubCity.forEach((group) => {
      map[`subcity:${group.key}`] = chunkArray(group.rows, 18).map(
        (rows, index, arr) => ({
          reportTitle: "Confirmed Booking Report",
          reportSubtitle: "Professional export in standard A4 layout",
          sectionTitle: "Grouped by Sub City",
          sectionSubtitle: `${group.key} · page ${index + 1} of ${arr.length}`,
          sectionKey: `subcity:${group.key}:${index + 1}`,
          columns: [
            { key: "serial", label: "ID", renderText: (row) => String(row.serial) },
            { key: "name", label: "Name" },
            { key: "organization", label: "Organization" },
            { key: "phone", label: "Phone" },
            { key: "sex", label: "Sex" },
            { key: "subCity", label: "Sub City" },
            { key: "paymentProof", label: "Payment Proof", renderText: () => "View payment" },
            { key: "submittedAt", label: "Submitted", renderText: (row) => row.submittedAt ? new Date(row.submittedAt).toLocaleString() : "—" },
          ],
          rows,
        }),
      );
    });
    return map;
  }, [groupedBySubCity]);

  return (
    <div className="flex min-h-screen bg-gray-200 min-w-0 overflow-x-hidden">
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="md:hidden fixed top-4 right-4 z-50 bg-purple-600 text-white w-11 h-11 rounded-xl shadow-lg flex items-center justify-center transition-all duration-300"
        aria-label="Toggle menu"
      >
        <div className="relative w-6 h-6">
          <span
            className={`absolute left-0 top-1 w-6 h-[2px] bg-white transition-all duration-300 ${
              sidebarOpen ? "rotate-45 top-3" : ""
            }`}
          />
          <span
            className={`absolute left-0 top-3 w-6 h-[2px] bg-white transition-all duration-300 ${
              sidebarOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`absolute left-0 top-5 w-6 h-[2px] bg-white transition-all duration-300 ${
              sidebarOpen ? "-rotate-45 top-3" : ""
            }`}
          />
        </div>
      </button>

      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 z-30 bg-black/40 backdrop-blur-[1px]"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed md:sticky md:top-0 self-start z-40 h-screen w-64 bg-purple-400 text-white pt-16 md:pt-6 p-6 shadow-xl transform transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <h2 className="text-2xl font-bold mb-10">Admin Panel</h2>

        <ul className="space-y-4">
          {menu.map((item) => (
            <li
              key={item.id}
              onClick={() => handleMenu(item)}
              className={`cursor-pointer p-3 rounded-xl transition-all duration-300 ${
                item.id === "report"
                  ? "bg-white text-purple-600 font-bold shadow"
                  : "hover:bg-white/20 hover:backdrop-blur hover:scale-105 hover:shadow-lg"
              }`}
            >
              {item.label}
            </li>
          ))}
        </ul>
      </aside>

      <main className="flex-1 min-w-0 p-4 md:p-8 pt-20 md:pt-8 overflow-x-hidden">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6">
          <h1 className="text-2xl md:text-4xl font-bold text-purple-600">
            Report Overview
          </h1>
          <button
            onClick={() => setNotifCount(0)}
            className="relative bg-white text-purple-700 px-4 py-2 rounded-full shadow hover:shadow-xl hover:-translate-y-[1px] transition font-semibold"
            title="New bookings"
          >
            🔔
            <span className="absolute -top-2 -right-2 min-w-[22px] h-[22px] px-1 rounded-full bg-red-500 text-white text-xs flex items-center justify-center shadow">
              {notifCount}
            </span>
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between mb-6">
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={exportAllPdf}
              className="bg-purple-600 text-white px-6 py-2 rounded-full shadow hover:bg-purple-700 transition hover:scale-105 disabled:opacity-40"
            >
              Export to PDF
            </button>
            <button
              onClick={exportAllExcel}
              className="bg-purple-600 text-white px-6 py-2 rounded-full shadow hover:bg-purple-700 transition hover:scale-105 disabled:opacity-40"
            >
              Export to Excel
            </button>
          </div>

          <button
            onClick={fetchReport}
            className="bg-white text-purple-700 px-6 py-2 rounded-full shadow hover:shadow-xl hover:-translate-y-[1px] transition font-semibold"
          >
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6">
          <StatCard num={summaryStats.totalParticipants} label="Total Participants" />
          <StatCard num={summaryStats.totalOrganizations} label="Total Organizations" />
          <StatCard num={summaryStats.totalSubCities} label="Total Sub Cities" />
          <SexBreakdownCard men={summaryStats.totalMen} women={summaryStats.totalWomen} />
        </div>

        <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between mb-4">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name / org / phone / sub city..."
            className="w-full lg:w-[420px] bg-white rounded-full px-5 py-2 shadow focus:outline-none focus:ring-2 focus:ring-purple-300"
          />

          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={orgFilter}
              onChange={(e) => setOrgFilter(e.target.value)}
              className="bg-white rounded-full px-5 py-2 shadow focus:outline-none focus:ring-2 focus:ring-purple-300"
            >
              {orgOptions.map((option) => (
                <option key={option} value={option}>
                  {option === "All" ? "All Organizations" : option}
                </option>
              ))}
            </select>

            <select
              value={subCityFilter}
              onChange={(e) => setSubCityFilter(e.target.value)}
              className="bg-white rounded-full px-5 py-2 shadow focus:outline-none focus:ring-2 focus:ring-purple-300"
            >
              {subCityOptions.map((option) => (
                <option key={option} value={option}>
                  {option === "All" ? "All Sub Cities" : option}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="w-full max-w-full overflow-x-auto overflow-y-hidden pb-2 [scrollbar-gutter:stable]">
          <table className="min-w-[1100px] w-max bg-white rounded-xl shadow">
            <thead className="bg-purple-400 text-white">
              <tr>
                <th className="p-2">Name</th>
                <th className="p-2">Organization</th>
                <th className="p-2">Phone</th>
                <th className="p-2">Sex</th>
                <th className="p-2">Sub City</th>
                <th className="p-2">Participants</th>
                <th className="p-2">Payment Proof</th>
                <th className="p-2">Submitted</th>
              </tr>
            </thead>

            <tbody>
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-6 text-gray-500 text-center">
                    No confirmed data
                  </td>
                </tr>
              ) : (
                paginatedBookings.map((booking) => (
                  <Fragment key={booking._id}>
                    <tr
                      className="text-center border-b hover:bg-purple-50 transition"
                    >
                      <td className="p-2 text-xs md:text-sm">
                        <button
                          onClick={() => toggleExpanded(String(booking._id))}
                          className="text-left text-purple-700 font-semibold hover:underline"
                        >
                          {booking.name || "—"}{" "}
                          {Array.isArray(booking.participantDetails) &&
                          booking.participantDetails.length > 0 ? (
                            <span className="text-xs text-purple-500">
                              {expandedBookingIds[booking._id]
                                ? "▲ Hide participants"
                                : "▼ Show participants"}
                            </span>
                          ) : null}
                        </button>
                      </td>
                      <td className="p-2 text-xs md:text-sm">{booking.organization || "—"}</td>
                      <td className="p-2 text-xs md:text-sm">{booking.phone || "—"}</td>
                      <td className="p-2 text-xs md:text-sm">{booking.sex || "—"}</td>
                      <td className="p-2 text-xs md:text-sm">{booking.subCity || "—"}</td>
                      <td className="p-2 text-xs md:text-sm">{booking.participants ?? 0}</td>
                      <td className="p-2 text-xs md:text-sm">
                        {booking.paymentProof ? (
                          <a
                            href={booking.paymentProof}
                            target="_blank"
                            rel="noreferrer"
                            className="text-purple-700 underline font-semibold"
                          >
                            View payment
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="p-2 text-xs md:text-sm">
                        {booking.createdAt
                          ? new Date(booking.createdAt).toLocaleString()
                          : "—"}
                      </td>
                    </tr>

                    {expandedBookingIds[booking._id] &&
                      Array.isArray(booking.participantDetails) &&
                      booking.participantDetails.map((participant, index) => (
                        <tr
                          key={`${booking._id}-sub-${index}`}
                          className="bg-purple-50 text-center border-b"
                        >
                          <td className="p-2 text-xs md:text-sm text-purple-700">
                            Participant {index + 2}: {participant.name || "—"}
                          </td>
                          <td className="p-2 text-xs md:text-sm">
                            {participant.organization || booking.organization || "—"}
                          </td>
                          <td className="p-2 text-xs md:text-sm">{participant.phone || "—"}</td>
                          <td className="p-2 text-xs md:text-sm">{participant.sex || "—"}</td>
                          <td className="p-2 text-xs md:text-sm">
                            {participant.subCity || booking.subCity || "—"}
                          </td>
                          <td className="p-2 text-xs md:text-sm">Sub participant</td>
                          <td className="p-2 text-xs md:text-sm">
                            {booking.paymentProof ? (
                              <a
                                href={booking.paymentProof}
                                target="_blank"
                                rel="noreferrer"
                                className="text-purple-700 underline font-semibold"
                              >
                                View payment
                              </a>
                            ) : (
                              "—"
                            )}
                          </td>
                          <td className="p-2 text-xs md:text-sm">
                            {booking.createdAt
                              ? new Date(booking.createdAt).toLocaleString()
                              : "—"}
                          </td>
                        </tr>
                      ))}
                  </Fragment>
                ))
              )}
            </tbody>
          </table>

          <Pagination
            page={mainPage}
            totalPages={mainTotalPages}
            onChange={setMainPage}
          />
        </div>

        <div className="mt-10 bg-white rounded-2xl shadow p-4 md:p-5">
          <h2 className="text-lg md:text-2xl font-bold text-purple-700 mb-4">
            Organization Participant Summary
          </h2>
          <ParticipantTable
            rows={paginatedSummaryRows}
            columns={summaryColumns}
            emptyMessage="No organization summary available"
          />
          <Pagination
            page={summaryPage}
            totalPages={summaryTotalPages}
            onChange={setSummaryPage}
          />
        </div>

        <div className="mt-10 space-y-8">
          <h2 className="text-2xl md:text-4xl font-bold text-purple-600">
            Grouped by Organization
          </h2>

          {visibleOrgGroups.map((group) => {
            const currentPage = getGroupPage(groupOrgPages, group.key);
            const totalPages = Math.ceil(group.rows.length / groupPerPage) || 1;
            const pagedRows = group.rows.slice(
              (currentPage - 1) * groupPerPage,
              currentPage * groupPerPage,
            );

            return (
              <div
                key={`org-${group.key}`}
                className="bg-white rounded-2xl shadow p-3 md:p-4"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                  <div>
                    <h3 className="text-base md:text-xl font-bold text-purple-700">
                      {group.key}
                    </h3>
                    <p className="text-xs md:text-sm text-gray-500">
                      Total Confirmed Records: {group.rows.length}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => exportGroupPdf("organization", group)}
                      className="bg-red-500 text-white px-4 py-2 rounded-full shadow hover:bg-red-600 transition"
                    >
                      Export to PDF
                    </button>
                    <button
                      onClick={() => exportGroupExcel("organization", group)}
                      className="bg-green-500 text-white px-4 py-2 rounded-full shadow hover:bg-green-600 transition"
                    >
                      Export to Excel
                    </button>
                  </div>
                </div>

                <ParticipantTable
                  rows={pagedRows}
                  columns={orgGroupColumns}
                  emptyMessage="No participant rows in this organization"
                />

                <Pagination
                  page={currentPage}
                  totalPages={totalPages}
                  onChange={(nextPage) =>
                    setGroupPage(setGroupOrgPages, group.key, nextPage)
                  }
                />
              </div>
            );
          })}
        </div>

        <div className="mt-10 space-y-8">
          <h2 className="text-2xl md:text-4xl font-bold text-purple-600">
            Grouped by Sub City
          </h2>

          {visibleSubCityGroups.map((group) => {
            const currentPage = getGroupPage(groupSubCityPages, group.key);
            const totalPages = Math.ceil(group.rows.length / groupPerPage) || 1;
            const pagedRows = group.rows.slice(
              (currentPage - 1) * groupPerPage,
              currentPage * groupPerPage,
            );

            return (
              <div
                key={`sub-${group.key}`}
                className="bg-white rounded-2xl shadow p-3 md:p-4"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                  <div>
                    <h3 className="text-base md:text-xl font-bold text-purple-700">
                      {group.key}
                    </h3>
                    <p className="text-xs md:text-sm text-gray-500">
                      Total Confirmed Records: {group.rows.length}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => exportGroupPdf("subcity", group)}
                      className="bg-red-500 text-white px-4 py-2 rounded-full shadow hover:bg-red-600 transition"
                    >
                      Export to PDF
                    </button>
                    <button
                      onClick={() => exportGroupExcel("subcity", group)}
                      className="bg-green-500 text-white px-4 py-2 rounded-full shadow hover:bg-green-600 transition"
                    >
                      Export to Excel
                    </button>
                  </div>
                </div>

                <ParticipantTable
                  rows={pagedRows}
                  columns={orgGroupColumns}
                  emptyMessage="No participant rows in this sub city"
                />

                <Pagination
                  page={currentPage}
                  totalPages={totalPages}
                  onChange={(nextPage) =>
                    setGroupPage(setGroupSubCityPages, group.key, nextPage)
                  }
                />
              </div>
            );
          })}
        </div>

        <div className="fixed -left-[20000px] top-0 z-[-1]">
          {pdfPages.map((page, index) => (
            <div
              key={`pdf-page-${page.sectionKey}`}
              ref={(node) => {
                exportPageRefs.current[index] = node;
              }}
            >
              <ExportPage
                page={page}
                pageIndex={index}
                totalPages={pdfPages.length}
                generatedAt={generatedAt}
              />
            </div>
          ))}

          {Object.entries(groupPdfPagesByOrg).map(([key, pages]) =>
            pages.map((page, index) => (
              <div
                key={`hidden-${key}-${index}`}
                ref={(node) => {
                  if (!groupPageRefs.current[key]) groupPageRefs.current[key] = [];
                  groupPageRefs.current[key][index] = node;
                }}
              >
                <ExportPage
                  page={page}
                  pageIndex={index}
                  totalPages={pages.length}
                  generatedAt={generatedAt}
                />
              </div>
            )),
          )}

          {Object.entries(groupPdfPagesBySubCity).map(([key, pages]) =>
            pages.map((page, index) => (
              <div
                key={`hidden-${key}-${index}`}
                ref={(node) => {
                  if (!groupPageRefs.current[key]) groupPageRefs.current[key] = [];
                  groupPageRefs.current[key][index] = node;
                }}
              >
                <ExportPage
                  page={page}
                  pageIndex={index}
                  totalPages={pages.length}
                  generatedAt={generatedAt}
                />
              </div>
            )),
          )}
        </div>

        <MessageModal
          open={modal.open}
          title={modal.title}
          message={modal.message}
          type={modal.type}
          onClose={closeModal}
          onConfirm={modal.onConfirm}
          confirmLabel={modal.confirmLabel}
          cancelLabel={modal.cancelLabel}
        />
      </main>
    </div>
  );
}
