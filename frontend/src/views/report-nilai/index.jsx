/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from "react";
import {
  Table,
  Card,
  Button,
  Select,
  Input,
  Space,
  Tag,
  Modal,
  Descriptions,
  Typography,
  Row,
  Col,
  Statistic,
  DatePicker,
  message,
  Spin,
  Badge,
  Avatar,
  Alert,
  Tooltip,
  Progress,
  Popconfirm,
  Divider,
} from "antd";
import {
  FileExcelOutlined,
  EyeOutlined,
  SearchOutlined,
  ReloadOutlined,
  UserOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  FileTextOutlined,
  WarningOutlined,
  ExclamationCircleOutlined,
  DatabaseOutlined, // Added this icon for the new feature
} from "@ant-design/icons";
import moment from "moment"; // Pastikan 'moment' terinstal: npm install moment
import dayjs from "dayjs"; // dayjs sudah diimpor dan dapat digunakan untuk format tanggal
import * as XLSX from "xlsx"; // Pastikan 'xlsx' terinstal: npm install xlsx

// --- IMPOR LOKAL ---
// Harap pastikan jalur impor ini benar di proyek Anda dan dependensi terinstal.
// Jika Anda menggunakan alias seperti '@/', pastikan dikonfigurasi di jsconfig.json/tsconfig.json Anda.
import { getUjian } from "@/api/ujian";
import { getHasilByUjian, getHasilUjian } from "@/api/hasilUjian";
import {
  getCheatDetectionByStudent,
  getViolations, // Used for fetching all violations
} from "@/api/cheatDetection";
import {
  safeGetHasilByUjian,
  safeGetAllHasilUjian,
  transformHasilUjianData,
  applySearchFilter,
} from "@/utils/safeHasilUjianApi";
import { deleteHasilUjian } from "@/api/hasilUjian";
import { useAuth } from "@/contexts/AuthContext";
import TypingCard from "@/components/TypingCard";
// -------------------

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const ReportNilaiSiswa = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  // Renamed `violation` to `allViolationsData` for clarity
  const [allViolationsData, setAllViolationsData] = useState([]);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [ujianList, setUjianList] = useState([]);
  const [kelasList, setKelasList] = useState([]);
  const [selectedUjian, setSelectedUjian] = useState(null);
  const [selectedKelas, setSelectedKelas] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [dateRange, setDateRange] = useState([]);
  const [detailModal, setDetailModal] = useState({
    visible: false,
    data: null,
  });
  const [violationModalVisible, setViolationModalVisible] = useState(false);
  const [violations, setViolations] = useState([]); // Violations for a specific student's exam session
  const [loadingViolations, setLoadingViolations] = useState(false);
  const [statistics, setStatistics] = useState({
    totalSiswa: 0,
    rataRataNilai: 0,
    siswaLulus: 0,
    siswaTidakLulus: 0,
  });

  // --- NEW STATE FOR GLOBAL VIOLATIONS MODAL ---
  const [showAllViolationsModal, setShowAllViolationsModal] = useState(false);
  const [loadingAllViolations, setLoadingAllViolations] = useState(false);
  // ---------------------------------------------

  // ...existing code...

  const handleDeleteHasilUjian = async (record) => {
    Modal.confirm({
      title: "Konfirmasi Hapus",
      content:
        "Apakah Anda yakin ingin menghapus hasil ujian ini? Aksi ini tidak dapat dibatalkan.",
      okText: "Ya, Hapus",
      okType: "danger",
      cancelText: "Batal",
      onOk: async () => {
        try {
          await deleteHasilUjian(record);
          message.success("Hasil ujian berhasil dihapus");
          fetchReportData();
        } catch (error) {
          message.error("Gagal menghapus hasil ujian: " + error.message);
        }
      },
    });
  };

  // Fetch ujian list for filter
  const fetchUjianList = useCallback(async () => {
    try {
      const response = await getUjian();
      if (response.data.statusCode === 200) {
        setUjianList(response.data.content || []);
      }
    } catch (error) {
      console.error("Error fetching ujian list:", error);
      message.error("Gagal memuat daftar ujian");
    }
  }, []);

  // Fetch kelas list for filter
  const fetchKelasList = useCallback(async () => {
    try {
      // For now, we set an empty class list as the API might not be available
      setKelasList([]);
    } catch (error) {
      console.error("Error fetching kelas list:", error);
      message.error("Gagal memuat daftar kelas");
    }
  }, []);

  const fetchAllViolationDetection = useCallback(async () => {
    setLoadingAllViolations(true);
    try {
      const response = await getViolations({
        limit: 10000,
        includeEvidence: true,
        includeActions: true,
        timeRange: "ALL",
      });

      // Perhatikan struktur response.data.data.violations
      const violations =
        response?.data?.data?.violations || response?.data?.violations || [];

      console.log("All Violations API response:", response);
      console.log("SET ALL VIOLATIONS DATA:", violations);

      if (violations.length > 0) {
        setAllViolationsData(violations);
        message.success(
          `Berhasil memuat ${violations.length} total pelanggaran.`
        );
      } else {
        setAllViolationsData([]);
        message.info("Tidak ada data pelanggaran di seluruh database.");
      }
    } catch (error) {
      console.error("Error fetching all violations:", error);
      message.error("Gagal memuat seluruh data pelanggaran");
      setAllViolationsData([]);
    } finally {
      setLoadingAllViolations(false);
    }
  }, []);
  // ---------------------------------------------------

  // Calculate statistics - IMPROVED with null checks
  const calculateStatistics = (data) => {
    if (!data || !Array.isArray(data)) {
      setStatistics({
        totalSiswa: 0,
        rataRataNilai: 0,
        siswaLulus: 0,
        siswaTidakLulus: 0,
      });
      return;
    }

    const total = data.length;
    const lulus = data.filter((item) => {
      const nilai = parseFloat(item.nilai || item.skor || 0);
      const minScore = parseFloat(
        item.ujian?.minPassingScore || item.ujian?.nilaiMinimal || 75
      );
      return nilai >= minScore;
    }).length;
    const tidakLulus = total - lulus;
    const rataRata =
      total > 0
        ? (
            data.reduce(
              (sum, item) => sum + (parseFloat(item.nilai || item.skor) || 0),
              0
            ) / total
          ).toFixed(2)
        : 0;

    setStatistics({
      totalSiswa: total,
      rataRataNilai: parseFloat(rataRata),
      siswaLulus: lulus,
      siswaTidakLulus: tidakLulus,
    });
  };

  // Get status color and icon
  const getStatusDisplay = (record) => {
    if (!record)
      return {
        color: "default",
        icon: <ExclamationCircleOutlined />,
        text: "BELUM DIKETAHUI",
      };

    // Check if exam is completed and has a valid score
    const nilai = parseFloat(
      record.nilai || record.skor || record.persentase || 0
    );
    const hasValidScore = nilai > 0 || record.lulus !== undefined;

    // If we have explicit lulus status, use it
    if (record.lulus !== undefined && hasValidScore) {
      if (record.lulus === true) {
        return {
          color: "success",
          icon: <CheckCircleOutlined />,
          text: "LULUS",
        };
      } else {
        return {
          color: "error",
          icon: <CloseCircleOutlined />,
          text: "TIDAK LULUS",
        };
      }
    }

    // Fallback to score-based logic if lulus field is not available
    if (hasValidScore) {
      const minScore = parseFloat(
        record.ujian?.minPassingScore || record.ujian?.nilaiMinimal || 75
      );

      if (nilai >= minScore) {
        return {
          color: "success",
          icon: <CheckCircleOutlined />,
          text: "LULUS",
        };
      } else {
        return {
          color: "error",
          icon: <CloseCircleOutlined />,
          text: "TIDAK LULUS",
        };
      }
    } else {
      return {
        color: "processing",
        icon: <ClockCircleOutlined />,
        text: "DALAM PROSES",
      };
    }
  };

  // Fetch report data for the main table
  const fetchReportData = useCallback(async () => {
    setLoading(true);
    try {
      let allReports = [];

      if (selectedUjian) {
        // Fetch results for specific ujian using safe API
        const result = await safeGetHasilByUjian(selectedUjian, {
          showErrorMessage: false,
        });

        if (result.success && result.data?.content) {
          // Transform using the same utility as history for consistency
          allReports = result.data.content.map((hasil, index) =>
            transformHasilUjianData(hasil, index)
          );
        } else {
          console.warn("Failed to fetch hasil by ujian:", result.error);
          message.warning("Gagal memuat data untuk ujian yang dipilih");
        }
      } else {
        // If no specific ujian selected, get all hasil ujian using safe API
        const result = await safeGetAllHasilUjian(1000, {
          showErrorMessage: false,
        });

        if (result.success && result.data?.content) {
          // Transform using the same utility as history for consistency
          allReports = result.data.content.map((hasil, index) =>
            transformHasilUjianData(hasil, index)
          );
        } else {
          console.warn("Failed to fetch all hasil ujian:", result.error);
          message.warning("Gagal memuat semua data hasil ujian");
        }
      }

      // Filter by date range if specified
      if (dateRange.length === 2) {
        allReports = allReports.filter((item) => {
          if (!item.waktuMulai) return false;
          const itemDate = dayjs(item.waktuMulai); // Menggunakan dayjs
          return itemDate.isBetween(dateRange[0], dateRange[1], "day", "[]");
        });
      }

      setData(allReports);
      setFilteredData(allReports);
      calculateStatistics(allReports);
    } catch (error) {
      console.error("Error fetching report data:", error);
      message.error("Gagal memuat data report nilai siswa");
    } finally {
      setLoading(false);
    }
  }, [selectedUjian, dateRange]);

  // Show violations modal (for specific student's exam)
  const showViolationsModal = (record) => {
    setDetailModal({
      visible: false, // Hide detail modal if it's open
      data: record, // Keep data for context in violations modal
    });
    setViolationModalVisible(true);

    // --- PEMBARUAN: Menggunakan sessionId untuk matching pelanggaran ---
    const sessionId = record.sessionId || record.fullData?.sessionId; // Ambil sessionId dari record atau fullData
    const pesertaId =
      record.peserta?.id ||
      record.idPeserta ||
      record.siswaId ||
      // Tambahkan log parameter untuk debugging yang lebih detail
      console.log("showViolationsModal called with:", {
        sessionId, // Log the derived sessionId
        pesertaId, // Log the derived pesertaId
        record, // Log the full record object
      });

    if (!sessionId || !pesertaId) {
      // Periksa sessionId dan pesertaId
      message.error(
        "Informasi sesi ujian atau peserta tidak lengkap untuk melihat pelanggaran."
      );
      setViolations([]);
      setLoadingViolations(false);
      return;
    }

    // Panggil fetchViolations dengan sessionId dan pesertaId
    fetchViolations(sessionId, pesertaId);
  };

  // Fetch violations for specific session and peserta
  const fetchViolations = async (sessionId, pesertaId) => {
    setLoadingViolations(true);
    try {
      console.log("Fetching violations for:", { sessionId, pesertaId });
      const response = await getCheatDetectionByStudent({
        sessionId: sessionId,
        idPeserta: pesertaId,
      });
      console.log("Violations API response (for single student):", response);

      if (!response || !response.data) {
        message.error("Gagal mendapatkan data pelanggaran dari server.");
        setViolations([]);
        return;
      }

      // --- FIX: Ambil dari response.data.data.violations ---
      let violationsArray = [];
      if (response.data.data && Array.isArray(response.data.data.violations)) {
        violationsArray = response.data.data.violations;
      } else if (
        response.data.violations &&
        Array.isArray(response.data.violations)
      ) {
        violationsArray = response.data.violations;
      } else if (
        response.data.content &&
        Array.isArray(response.data.content)
      ) {
        response.data.content.forEach((item) => {
          if (
            item.metadata?.violations &&
            Array.isArray(item.metadata.violations)
          ) {
            violationsArray = violationsArray.concat(item.metadata.violations);
          }
        });
      }
      // ----------------------------------------------------

      const cleanedViolations = violationsArray;

      console.log(
        "Setting violations for single student modal:",
        cleanedViolations
      );

      if (cleanedViolations.length === 0) {
        message.info("Tidak ada pelanggaran ditemukan untuk siswa ini.");
      }
      setViolations(cleanedViolations);
    } catch (error) {
      console.error("Error fetching violations:", error);
      message.error("Terjadi kesalahan saat mengambil data pelanggaran.");
      setViolations([]);
    } finally {
      setLoadingViolations(false);
    }
  };

  // --- Initial data fetches when component mounts ---
  useEffect(() => {
    fetchUjianList();
    fetchKelasList();
    // Call the new function to fetch ALL violations initially
    fetchAllViolationDetection();
  }, [fetchUjianList, fetchKelasList, fetchAllViolationDetection]);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  // Filter data based on search text for the main report table
  useEffect(() => {
    const filteredBySearch = applySearchFilter(data, searchText);
    setFilteredData(filteredBySearch);
  }, [searchText, data]);

  // Show detail modal (for main report table)
  const showDetail = async (record) => {
    let data = { ...record };

    // Cari id ujian dari beberapa kemungkinan field
    const idUjian =
      data.idUjian || data.ujianId || data.ujian?.idUjian || data.ujian_id;

    // Merge data ujian dari ujianList jika ada
    if (idUjian && ujianList.length > 0) {
      const found = ujianList.find((u) => u.idUjian === idUjian);
      if (found) {
        data.ujian = found;
      }
    }

    setDetailModal({
      visible: true,
      data,
    });
  };
  // --- NEW: Columns for All Violations Modal Table ---
  // These columns are designed to handle potential nulls from backend,
  // displaying "N/A" or "Tidak Diketahui" where data is missing.
  const allViolationsColumns = [
    {
      title: "No",
      key: "no",
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: "ID Deteksi",
      dataIndex: "idDetection",
      key: "idDetection",
      width: 150,
      ellipsis: true,
      render: (text) => (
        <Tooltip title={text || "N/A"}>
          {text ? `${text.substring(0, 8)}...` : "N/A"}
        </Tooltip>
      ),
    },
    {
      title: "Session ID",
      dataIndex: "sessionId",
      key: "sessionId",
      width: 150,
      ellipsis: true,
      render: (text) => (
        <Tooltip title={text || "N/A"}>
          {text ? `${text.substring(0, 8)}...` : "N/A"}
        </Tooltip>
      ),
    },
    {
      title: "Jenis Pelanggaran",
      dataIndex: "typeViolation",
      key: "typeViolation",
      render: (text) => <Tag color="red">{text || "Tidak Diketahui"}</Tag>,
    },
    {
      title: "Keparahan",
      dataIndex: "severity",
      key: "severity",
      render: (text) => {
        let color = "default";
        const severityText = text || "Tidak Diketahui";
        if (severityText === "HIGH") color = "red";
        else if (severityText === "MEDIUM") color = "orange";
        else if (severityText === "LOW") color = "yellow";
        return <Tag color={color}>{severityText}</Tag>;
      },
    },
    {
      title: "Waktu Deteksi",
      dataIndex: "detectedAt",
      key: "detectedAt",
      render: (text) =>
        text ? dayjs(text).format("DD/MM/YYYY HH:mm:ss") : "N/A",
    },
    // {
    //   title: "Peserta",
    //   key: "peserta",
    //   render: (_, record) => (
    //     <div>
    //       <Text strong>
    //         {record.idPeserta || record.peserta?.username || "Tidak diketahui"}
    //       </Text>
    //     </div>
    //   ),
    // },
    // {
    //   title: "Ujian",
    //   key: "ujian",
    //   render: (_, record) => (
    //     <div>
    //       <Text strong>
    //         {record.idUjian || record.ujian?.namaUjian || "Tidak diketahui"}
    //       </Text>
    //     </div>
    //   ),
    // },
    // {
    //   title: "Resolved",
    //   dataIndex: "resolved",
    //   key: "resolved",
    //   render: (text) => (
    //     <Tag color={text ? "green" : "volcano"}>
    //       {typeof text === "boolean" ? (text ? "Ya" : "Tidak") : "N/A"}
    //     </Tag>
    //   ),
    // },
  ];
  // ---------------------------------------------------

  // Export to Excel for the main report table
  const exportToExcel = () => {
    if (filteredData.length === 0) {
      message.warning("Tidak ada data untuk diekspor");
      return;
    }

    // Merge ujian detail ke setiap item, selalu update agar data terbaru
    const mergedData = filteredData.map((item) => {
      const idUjian =
        item.idUjian || item.ujianId || item.ujian?.idUjian || item.ujian_id;
      const found = ujianList.find((u) => u.idUjian === idUjian);
      return found ? { ...item, ujian: found } : item;
    });

    // Helper: Ambil pelanggaran dari record (jika ada di metadata/violations)
    const getViolationsList = (record) => {
      const sessionId = String(
        record.sessionId || record.fullData?.sessionId || ""
      );
      // Cek semua kemungkinan pesertaId
      const pesertaIdCandidates = [
        record.peserta?.id,
        record.idPeserta,
        record.siswaId,
        record.fullData?.idPeserta,
      ].map(String);

      // Debug log
      console.log("EXPORT VIOLATION CHECK:", {
        sessionId,
        pesertaIdCandidates,
        record,
      });

      const violationsArr = allViolationsData.filter(
        (v) =>
          String(v.sessionId) === sessionId &&
          pesertaIdCandidates.includes(String(v.idPeserta))
      );

      console.log("VIOLATIONS FOUND:", violationsArr);

      if (!violationsArr.length) return "";

      return violationsArr
        .map(
          (v) =>
            `[waktu deteksi: ${
              v.detectedAt
                ? dayjs(v.detectedAt).format("DD/MM/YYYY HH:mm:ss")
                : "-"
            }, type : ${v.typeViolation || "-"}]`
        )
        .join(", ");
    };
    const exportData = mergedData.map((item, index) => ({
      No: index + 1,
      NIM: item.username || item.nimSiswa || "-",
      "Nama Siswa": item.namaSiswa || item.nama || "-",
      Kelas:
        item.ujian?.kelas?.namaKelas || item.namaKelas || "Tidak Diketahui",
      Ujian: item.ujian?.namaUjian || item.namaUjian || "-",
      "Mata Pelajaran": item.ujian?.mapel?.name || item.mapelNama || "-",
      Semester: item.ujian?.semester?.namaSemester || item.semesterNama || "-",
      Nilai: item.nilai || item.skor || 0,
      Status: (() => {
        const { text } = getStatusDisplay(item);
        return text;
      })(),
      "Waktu Mulai": item.waktuMulai
        ? dayjs(item.waktuMulai).format("DD/MM/YYYY HH:mm")
        : "-",
      "Waktu Selesai": item.waktuSelesai
        ? dayjs(item.waktuSelesai).format("DD/MM/YYYY HH:mm")
        : "-",
      "Durasi (menit)": item.durasi || item.ujian?.durasiMenit || "-",
      "Jumlah Soal":
        item.jumlahSoal || item.totalSoal || item.ujian?.jumlahSoal || "-",
      "Soal Terjawab": item.soalTerjawab || item.jumlahTerjawab || "-",
      "Soal Benar": item.soalBenar || item.jumlahBenar || "-",
      "Soal Salah": item.soalSalah || item.jumlahSalah || "-",
      "Soal Kosong": item.soalKosong || item.jumlahKosong || "-",
      Pelanggaran: getViolationsList(item),
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report Nilai Siswa");

    // Auto-size columns
    const colWidths = [];
    Object.keys(exportData[0] || {}).forEach((key) => {
      const maxLength = Math.max(
        key.length,
        ...exportData.map((row) => String(row[key] || "").length)
      );
      colWidths.push({ wch: Math.min(maxLength + 2, 50) });
    });
    ws["!cols"] = colWidths;

    const fileName = `Report_Nilai_Siswa_${dayjs().format(
      "YYYY-MM-DD_HH-mm"
    )}.xlsx`;
    XLSX.writeFile(wb, fileName);
    message.success("Data berhasil diekspor ke Excel");
  };

  // Reset filters for the main report table
  const resetFilters = () => {
    setSelectedUjian(null);
    setSelectedKelas(null);
    setDateRange([]);
    setSearchText("");
  };

  // Table columns for the main report table
  const columns = [
    {
      title: "No",
      key: "no",
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: "Siswa",
      key: "siswa",
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: "bold" }}>
            {record.namaSiswa || record.nama || record.peserta?.name || "-"}
          </div>
          <Text type="secondary">
            {record.nimSiswa || record.nim || record.peserta?.username || "-"}
          </Text>
        </div>
      ),
    },
    {
      title: "Ujian",
      key: "ujian",
      render: (_, record) => (
        <div>
          <Text strong>
            {record.ujian?.namaUjian || record.namaUjian || "Tidak tersedia"}
          </Text>
          <br />
          <Text type="secondary" style={{ fontSize: "12px" }}>
            {record.ujian?.mapel?.name || record.mapelNama || "Mata Pelajaran"}
          </Text>
          <br />
          <Text type="secondary" style={{ fontSize: "11px" }}>
            {record.ujian?.kelas?.namaKelas || record.namaKelas || ""} -{" "}
            {record.ujian?.semester?.namaSemester || record.semesterNama || ""}
          </Text>
        </div>
      ),
    },
    {
      title: "Waktu Ujian",
      key: "waktu",
      render: (_, record) => (
        <div>
          <div>
            <Text type="secondary">Mulai: </Text>
            <Text>
              {record.waktuMulai
                ? dayjs(record.waktuMulai).format("DD/MM/YY HH:mm")
                : "-"}
            </Text>
          </div>
          <div>
            <Text type="secondary">Selesai: </Text>
            <Text>
              {record.waktuSelesai
                ? dayjs(record.waktuSelesai).format("DD/MM/YY HH:mm")
                : "-"}
            </Text>
          </div>
          {record.durasi && (
            <Text type="secondary">Durasi: {record.durasi} menit</Text>
          )}
        </div>
      ),
    },
    {
      title: "Nilai",
      key: "nilai",
      align: "center",
      sorter: (a, b) =>
        parseFloat(a.nilai || a.skor || 0) - parseFloat(b.nilai || b.skor || 0),
      render: (_, record) => {
        const ujian = record.ujian || record;
        const showNilai = ujian.tampilkanNilai !== false; // default true if no setting

        if (!showNilai) {
          return (
            <div style={{ textAlign: "center" }}>
              <Text type="secondary">Nilai Disembunyikan</Text>
            </div>
          );
        }

        const nilai = parseFloat(
          record.nilai || record.skor || record.persentase || 0
        );
        const nilaiMin = parseFloat(
          ujian.minPassingScore || ujian.nilaiMinimal || 0
        );

        return (
          <div>
            <div style={{ fontSize: "20px", fontWeight: "bold" }}>
              {nilai.toFixed(0)}
            </div>
            <div style={{ fontSize: "12px", color: "#666" }}>
              Min: {nilaiMin.toFixed(0)}
            </div>
            {nilai > 0 && (
              <Progress
                percent={(nilai / 100) * 100}
                size="small"
                status={nilai >= nilaiMin ? "success" : "exception"}
                showInfo={false}
              />
            )}
          </div>
        );
      },
    },
    {
      title: "Status",
      key: "status",
      align: "center",
      render: (_, record) => {
        const { color, icon, text } = getStatusDisplay(record);
        return (
          <Tag color={color} icon={icon}>
            {text}
          </Tag>
        );
      },
    },
    {
      title: "Pelanggaran",
      key: "violationCount",
      align: "center",
      render: (_, record) => {
        // Prioritize securityFlags.violationCount if available, otherwise fallback to metadata.violations.length
        const violationCount = parseInt(
          record.securityFlags?.violationCount ||
            record.metadata?.violations?.length ||
            0
        );

        if (violationCount > 0) {
          return (
            <Badge count={violationCount} overflowCount={99}>
              <Button
                type="text"
                icon={<WarningOutlined />}
                danger
                size="small"
                onClick={() => showViolationsModal(record)}
              >
                Lihat
              </Button>
            </Badge>
          );
        }

        return <Tag color="success">Bersih</Tag>;
      },
    },
    {
      title: "Aksi",
      key: "action",
      width: 100,
      render: (_, record) => (
        <Space>
          <Tooltip title="Lihat Detail">
            <Button
              type="primary"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => showDetail(record)}
            >
              Detail
            </Button>
          </Tooltip>
          <Popconfirm
            title="Hapus hasil ujian ini?"
            onConfirm={() => handleDeleteHasilUjian(record)}
            okText="Ya, Hapus"
            cancelText="Batal"
          >
            <Tooltip title="Hapus">
              <Button danger size="small" icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="app-container">
      <TypingCard title="Report Nilai Siswa" source="" />

      {/* Statistics Cards */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Siswa"
              value={statistics.totalSiswa}
              prefix={<UserOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Siswa Lulus"
              value={statistics.siswaLulus}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Siswa Tidak Lulus"
              value={statistics.siswaTidakLulus}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: "#ff4d4f" }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Rata-rata Nilai"
              value={statistics.rataRataNilai}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: "#faad14" }}
              precision={1}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Card */}
      <Card
        title={
          <Space>
            <TrophyOutlined />
            <span>Daftar Nilai Siswa</span>
          </Space>
        }
        extra={
          <Space>
            {/* --- NEW BUTTON TO SHOW ALL VIOLATIONS --- */}
            <Button
              icon={<DatabaseOutlined />}
              onClick={() => setShowAllViolationsModal(true)}
              loading={loadingAllViolations}
            >
              Lihat Semua Pelanggaran
            </Button>
            {/* ------------------------------------------- */}
            <Button
              type="primary"
              icon={<FileExcelOutlined />}
              onClick={exportToExcel}
              disabled={false}
            >
              Export Excel
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchReportData}
              loading={loading}
            >
              Refresh
            </Button>
          </Space>
        }
      >
        {/* Filters */}
        <Card size="small" style={{ marginBottom: "16px" }}>
          <Row gutter={16}>
            <Col span={6}>
              <Select
                placeholder="Pilih Ujian"
                value={selectedUjian}
                onChange={setSelectedUjian}
                allowClear
                style={{ width: "100%" }}
              >
                {ujianList.map((ujian) => (
                  <Option key={`ujian-${ujian.idUjian}`} value={ujian.idUjian}>
                    {ujian.namaUjian}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col span={6}>
              <Select
                placeholder="Pilih Kelas"
                value={selectedKelas}
                onChange={setSelectedKelas}
                allowClear
                style={{ width: "100%" }}
              >
                {kelasList.map((kelas, index) => (
                  <Option
                    key={kelas.id ? `kelas-${kelas.id}` : `kelas-${index}`}
                    value={kelas.id || `temp-${index}`}
                  >
                    {kelas.name || `Kelas ${index + 1}`}
                  </Option>
                ))}
              </Select>
            </Col>
            {/* <Col span={6}>
              <RangePicker
                value={dateRange}
                onChange={setDateRange}
                format="DD/MM/YYYY"
                placeholder={["Tanggal Mulai", "Tanggal Akhir"]}
                style={{ width: "100%" }}
              />
            </Col>
            <Col span={6}>
              <Input
                placeholder="Cari siswa, NIM, ujian..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
              />
            </Col> */}
          </Row>
          <Row style={{ marginTop: "16px" }}>
            <Col>
              <Button onClick={resetFilters}>Reset Filter</Button>
            </Col>
          </Row>
        </Card>

        {/* Table for main report data */}
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={filteredData}
            rowKey={(record) =>
              `${record.siswaId || record.idPeserta}-${
                record.ujianId || record.idUjian
              }-${record.waktuMulai || Math.random()}`
            }
            pagination={{
              total: filteredData.length,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} dari ${total} data`,
            }}
            size="small"
            locale={{
              emptyText: "Belum ada data hasil ujian",
            }}
          />
        </Spin>
      </Card>

      {/* Detail Modal (for individual student exam results) */}
      <Modal
        title={
          <Space>
            <Avatar icon={<UserOutlined />} />
            <span>Detail Hasil Ujian Siswa</span>
          </Space>
        }
        visible={detailModal.visible}
        onCancel={() => setDetailModal({ visible: false, data: null })}
        footer={[
          <Button
            key="close"
            onClick={() => setDetailModal({ visible: false, data: null })}
          >
            Tutup
          </Button>,
        ]}
        width={800}
      >
        {detailModal.data && (
          <div>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Nama Siswa" span={2}>
                <strong>
                  {detailModal.data.namaSiswa ||
                    detailModal.data.nama ||
                    detailModal.data.peserta?.name ||
                    "-"}
                </strong>
              </Descriptions.Item>
              <Descriptions.Item label="ID">
                {detailModal.data.nimSiswa ||
                  detailModal.data.nim ||
                  detailModal.data.peserta?.username ||
                  "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Kelas">
                {detailModal.data.ujian?.kelas?.namaKelas ||
                  detailModal.data.namaKelas ||
                  "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Ujian" span={2}>
                {detailModal.data.namaUjian ||
                  detailModal.data.ujian?.namaUjian ||
                  "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Mata Pelajaran">
                {detailModal.data.mapelNama ||
                  detailModal.data.ujian?.mapel?.name ||
                  "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Semester">
                {detailModal.data.semesterNama ||
                  detailModal.data.ujian?.semester?.namaSemester ||
                  "-"}
              </Descriptions.Item>
              {/* Display score only if allowed */}
              {detailModal.data.ujian?.tampilkanNilai !== false && (
                <>
                  <Descriptions.Item label="Waktu Mulai Pengerjaan">
                    {detailModal.data.waktuMulai
                      ? dayjs(detailModal.data.waktuMulai).format(
                          "DD/MM/YYYY HH:mm:ss"
                        )
                      : "-"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Waktu Selesai Pengerjaan">
                    {detailModal.data.waktuSelesai
                      ? dayjs(detailModal.data.waktuSelesai).format(
                          "DD/MM/YYYY HH:mm:ss"
                        )
                      : "-"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Durasi Ujian">
                    {detailModal.data.durasi ||
                      detailModal.data.ujian?.durasiMenit ||
                      "Tidak dibatasi"}{" "}
                    {detailModal.data.durasi ? "menit" : ""}
                  </Descriptions.Item>
                  <Descriptions.Item label="Jumlah Soal">
                    {detailModal.data.jumlahSoal ||
                      detailModal.data.totalSoal ||
                      detailModal.data.ujian?.jumlahSoal ||
                      "-"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Soal Terjawab">
                    {detailModal.data.soalTerjawab ||
                      detailModal.data.jumlahTerjawab ||
                      0}
                  </Descriptions.Item>
                  <Descriptions.Item label="Soal Benar">
                    {detailModal.data.soalBenar ||
                      detailModal.data.jumlahBenar ||
                      0}
                  </Descriptions.Item>
                  <Descriptions.Item label="Soal Salah">
                    {detailModal.data.soalSalah ||
                      detailModal.data.jumlahSalah ||
                      0}
                  </Descriptions.Item>
                  <Descriptions.Item label="Soal Kosong">
                    {detailModal.data.soalKosong ||
                      detailModal.data.jumlahKosong ||
                      0}
                  </Descriptions.Item>
                  <Descriptions.Item label="Nilai Akhir">
                    <div style={{ textAlign: "center" }}>
                      <div
                        style={{
                          fontSize: "24px",
                          fontWeight: "bold",
                          color:
                            parseFloat(
                              detailModal.data.nilai ||
                                detailModal.data.skor ||
                                0
                            ) >= 75
                              ? "#52c41a"
                              : "#ff4d4f",
                        }}
                      >
                        {parseFloat(
                          detailModal.data.nilai || detailModal.data.skor || 0
                        ).toFixed(1)}
                      </div>
                      <div style={{ fontSize: "14px", color: "#666" }}>
                        Persentase:{" "}
                        {parseFloat(detailModal.data.persentase || 0).toFixed(
                          1
                        )}{" "}
                        %
                      </div>
                      {detailModal.data.nilaiHuruf && (
                        <div style={{ fontSize: "12px", color: "#666" }}>
                          Grade: {detailModal.data.nilaiHuruf}
                        </div>
                      )}
                    </div>
                  </Descriptions.Item>
                  <Descriptions.Item label="Akurasi">
                    {(detailModal.data.soalTerjawab ||
                      detailModal.data.jumlahTerjawab) > 0
                      ? `${Math.round(
                          ((detailModal.data.soalBenar ||
                            detailModal.data.jumlahBenar) /
                            (detailModal.data.soalTerjawab ||
                              detailModal.data.jumlahTerjawab)) *
                            100
                        )}%`
                      : "0%"}
                  </Descriptions.Item>
                </>
              )}
              <Descriptions.Item label="Status">
                {(() => {
                  const { color, icon, text } = getStatusDisplay(
                    detailModal.data
                  );
                  return (
                    <Tag color={color} icon={icon}>
                      {text}
                    </Tag>
                  );
                })()}
              </Descriptions.Item>{" "}
              {detailModal.data.catatan && (
                <Descriptions.Item label="Catatan" span={2}>
                  {detailModal.data.catatan}
                </Descriptions.Item>
              )}
            </Descriptions>

            {/* Analytics Section */}
            {(detailModal.data.rataRataKelas ||
              detailModal.data.persentilSiswa ||
              detailModal.data.tingkatKesulitan) && (
              <>
                <Divider orientation="left">Analisis Kelas</Divider>
                <Row gutter={16}>
                  {detailModal.data.rataRataKelas && (
                    <Col span={8}>
                      <Card size="small">
                        <Statistic
                          title="Rata-rata Kelas"
                          value={parseFloat(
                            detailModal.data.rataRataKelas
                          ).toFixed(1)}
                          precision={1}
                        />
                      </Card>
                    </Col>
                  )}
                  {detailModal.data.persentilSiswa && (
                    <Col span={8}>
                      <Card size="small">
                        <Statistic
                          title="Persentil Siswa"
                          value={parseFloat(
                            detailModal.data.persentilSiswa
                          ).toFixed(0)}
                          suffix="%"
                        />
                      </Card>
                    </Col>
                  )}
                  {detailModal.data.tingkatKesulitan && (
                    <Col span={8}>
                      <Card size="small">
                        <Statistic
                          title="Tingkat Kesulitan"
                          value={detailModal.data.tingkatKesulitan}
                        />
                      </Card>
                    </Col>
                  )}
                </Row>
              </>
            )}

            {/* Notice for score and review */}
            {detailModal.data.ujian?.tampilkanNilai === false && (
              <Alert
                message="Nilai Disembunyikan"
                description="Pengajar telah mengatur agar nilai tidak ditampilkan untuk ujian ini."
                type="info"
                showIcon
                style={{ marginTop: 16 }}
              />
            )}
          </div>
        )}
      </Modal>

      {/* Violations Modal (for a specific student's exam session) */}
      <Modal
        title={
          <Space>
            <WarningOutlined style={{ color: "#ff4d4f" }} />
            <span>Rincian Pelanggaran</span>
          </Space>
        }
        visible={violationModalVisible}
        onCancel={() => setViolationModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setViolationModalVisible(false)}>
            Tutup
          </Button>,
        ]}
        width={700}
      >
        {detailModal.data && ( // Ensure detailModal.data is available for context
          <div>
            <Alert
              message={`Ditemukan ${violations.length} pelanggaran selama ujian`}
              type="warning"
              showIcon
              style={{ marginBottom: 16 }}
            />

            {loadingViolations ? (
              <div style={{ textAlign: "center", padding: "20px" }}>
                <Spin />
                <Text>Memuat data pelanggaran...</Text>
              </div>
            ) : violations.length > 0 ? (
              violations.map((violation, index) => (
                <Card
                  key={index}
                  size="small"
                  style={{ marginBottom: 8 }}
                  title={
                    <Space>
                      <WarningOutlined style={{ color: "#ff4d4f" }} />
                      <Text strong>Pelanggaran #{index + 1}</Text>
                    </Space>
                  }
                >
                  <Descriptions size="small" column={1}>
                    <Descriptions.Item label="Jenis Pelanggaran">
                      {/* Handle null typeViolation */}
                      <Tag color="red">
                        {violation.typeViolation || "Tidak diketahui"}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Tingkat Keparahan">
                      {/* Handle null severity */}
                      <Tag
                        color={
                          violation.severity === "HIGH"
                            ? "red"
                            : violation.severity === "MEDIUM"
                            ? "orange"
                            : violation.severity === "LOW"
                            ? "yellow"
                            : "default"
                        }
                      >
                        {violation.severity || "Tidak diketahui"}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Waktu">
                      {/* Handle null detectedAt */}
                      {violation.detectedAt
                        ? dayjs(violation.detectedAt).format(
                            "DD/MM/YYYY HH:mm:ss"
                          )
                        : "Tidak tersedia"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Jumlah Pelanggaran">
                      <Text strong>{violation.violationCount || 1}</Text>
                    </Descriptions.Item>
                    {(violation.details ||
                      Object.keys(violation.evidence || {}).length > 0) && (
                      <Descriptions.Item label="Detail">
                        <Text type="secondary">
                          {violation.details ||
                            (Object.keys(violation.evidence || {}).length > 0
                              ? JSON.stringify(violation.evidence, null, 2)
                              : "Tidak ada detail")}
                        </Text>
                      </Descriptions.Item>
                    )}
                  </Descriptions>
                </Card>
              ))
            ) : (
              <div style={{ textAlign: "center", padding: "20px" }}>
                <Text type="secondary">
                  Tidak ada data pelanggaran ditemukan
                </Text>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* --- NEW: Modal to Display All Cheat Detections --- */}

      <Modal
        title={
          <Space>
            <DatabaseOutlined />
            <span>Semua Data Pelanggaran</span>
          </Space>
        }
        visible={showAllViolationsModal}
        onCancel={() => setShowAllViolationsModal(false)}
        footer={[
          <Button key="close" onClick={() => setShowAllViolationsModal(false)}>
            Tutup
          </Button>,
        ]}
        width={1000}
        style={{ top: 20 }}
        bodyStyle={{ maxHeight: "calc(100vh - 200px)", overflowY: "auto" }}
      >
        {loadingAllViolations ? (
          <div style={{ textAlign: "center", padding: "50px" }}>
            <Spin size="large" />
            <Title level={4} style={{ marginTop: 20 }}>
              Memuat semua data pelanggaran...
            </Title>
            <Text type="secondary">
              Ini mungkin membutuhkan waktu jika datanya banyak.
            </Text>
          </div>
        ) : (
          <Table
            columns={allViolationsColumns}
            dataSource={allViolationsData}
            rowKey="idDetection"
            pagination={{
              total: allViolationsData.length,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} dari ${total} data`,
            }}
            size="small"
            locale={{
              emptyText: "Tidak ada data pelanggaran di database.",
            }}
          />
        )}
      </Modal>
      {/* --------------------------------------------------- */}
    </div>
  );
};

export default ReportNilaiSiswa;
