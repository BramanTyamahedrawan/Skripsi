/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useCallback } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Spin,
  Alert,
  Typography,
  Statistic,
  Row,
  Col,
  Modal,
  Progress,
  Tooltip,
  Select,
  Input,
  message,
  List,
  Badge,
} from "antd";
import {
  EyeOutlined,
  BarChartOutlined,
  ExclamationCircleOutlined,
  UserOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  SearchOutlined,
  ReloadOutlined,
  UsergroupAddOutlined,
  DownloadOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { getUjian } from "@/api/ujian";
import { getHasilByUjian, getHasilUjian } from "@/api/hasilUjian";
import {
  getAnalysisByUjian,
  getAllAnalysis,
  generateAnalysis,
} from "@/api/ujianAnalysis";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;
const { Option } = Select;

const AnalisisUjian = () => {
  const [siswaData, setSiswaData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filterUjian, setFilterUjian] = useState(null);
  const [filterKelas, setFilterKelas] = useState(null);
  const [ujianList, setUjianList] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Detail modal states
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedDetailData, setSelectedDetailData] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const navigate = useNavigate();

  // Fetch ujian list for filter
  const fetchUjianList = useCallback(async () => {
    try {
      const response = await getUjian();
      setUjianList(response.data?.content || []);
    } catch (error) {
      console.error("Error fetching ujian list:", error);
    }
  }, []);

  // Fetch ujian analysis data (comprehensive analysis with violations) - FIXED TO USE ANALYSIS API
  const fetchHasilUjian = useCallback(
    async (page = 1, size = 10) => {
      setLoading(true);
      try {
        let result;

        if (filterUjian) {
          // Get analysis for specific ujian - USE ANALYSIS API
          console.log("🎯 Fetching analysis for specific ujian:", filterUjian);
          try {
            result = await getAnalysisByUjian(filterUjian, {
              page,
              size: 1000,
            }); // Get analysis with violations
            console.log("✅ Analysis API Response for ujian:", result);
            result._dataSource = "ujian-analysis"; // Mark data source
          } catch (ujianError) {
            console.error("Error fetching analysis by ujian:", ujianError);
            console.warn(
              "⚠️ FALLBACK: Using HasilUjian instead of UjianAnalysis - violations may be 0!"
            );
            // Fallback to hasil ujian if analysis not available
            try {
              result = await getHasilByUjian(filterUjian, true); // Include analytics
              result._dataSource = "hasil-ujian"; // Mark fallback data source
              console.log("Fallback to Hasil Ujian API:", result);
            } catch (fallbackError) {
              result = { data: { content: [] } };
              message.warning(
                "Gagal memuat data analisis untuk ujian yang dipilih"
              );
            }
          }
        } else {
          // Get all analysis data - USE ANALYSIS API
          console.log("📊 Fetching ALL analysis data from ujian-analysis API");
          try {
            result = await getAllAnalysis({ page, size: 1000 }); // Get all analysis
            console.log("✅ All Analysis API Response:", result);
            result._dataSource = "ujian-analysis"; // Mark data source
          } catch (allError) {
            console.error("Error fetching all analysis:", allError);
            console.warn(
              "⚠️ FALLBACK: Using HasilUjian instead of UjianAnalysis - violations will be 0!"
            );
            // Fallback to hasil ujian
            try {
              result = await getHasilUjian(1000);
              result._dataSource = "hasil-ujian"; // Mark fallback data source
              console.log("Fallback to All Hasil Ujian:", result);
            } catch (fallbackError) {
              result = { data: { content: [] } };
              message.warning("Gagal memuat semua data analisis");
            }
          }
        }

        console.log("Analysis API Response:", result);
        console.log(
          "API Endpoint used:",
          filterUjian
            ? `getAnalysisByUjian(${filterUjian})`
            : "getAllAnalysis()"
        );
        console.log("Data Source:", result._dataSource || "unknown");

        if (result.data?.content) {
          console.log("Found", result.data.content.length, "analysis records");
          console.log("Sample record structure:", result.data.content[0]);

          // Warning if using fallback data
          if (result._dataSource === "hasil-ujian") {
            message.warning(
              "⚠️ Menampilkan data hasil ujian - data pelanggaran mungkin tidak lengkap. Pastikan data analisis tersedia di database.",
              5
            );
          }

          // DEDUPLICATE ANALYSIS RECORDS - Get latest/best record per ujian
          let processedContent = result.data.content;

          if (processedContent.length > 1) {
            console.log(
              `🔍 Found ${processedContent.length} total analysis records`
            );

            // Group by ujian ID to handle duplicates
            const groupedByUjian = {};
            processedContent.forEach((item) => {
              const ujianId = item.idUjian || item.ujian?.idUjian;
              if (!groupedByUjian[ujianId]) {
                groupedByUjian[ujianId] = [];
              }
              groupedByUjian[ujianId].push(item);
            });

            // For each ujian, select the best record
            const deduplicatedContent = [];
            Object.entries(groupedByUjian).forEach(([ujianId, records]) => {
              if (records.length === 1) {
                deduplicatedContent.push(records[0]);
              } else {
                console.log(
                  `🔍 Found ${records.length} duplicate records for ujian ${ujianId}`
                );
                console.log(
                  "Records by status:",
                  records.map((item) => ({
                    id: item.idAnalysis,
                    status: item.ujian?.statusUjian,
                    generatedAt: item.generatedAt,
                    updatedAt: item.updatedAt,
                  }))
                );

                // Priority: SELESAI status > latest updatedAt/generatedAt
                const sortedRecords = records.sort((a, b) => {
                  // First priority: SELESAI status
                  if (
                    a.ujian?.statusUjian === "SELESAI" &&
                    b.ujian?.statusUjian !== "SELESAI"
                  )
                    return -1;
                  if (
                    b.ujian?.statusUjian === "SELESAI" &&
                    a.ujian?.statusUjian !== "SELESAI"
                  )
                    return 1;

                  // Second priority: latest timestamp
                  const aTime = new Date(a.updatedAt || a.generatedAt || 0);
                  const bTime = new Date(b.updatedAt || b.generatedAt || 0);
                  return bTime - aTime;
                });

                deduplicatedContent.push(sortedRecords[0]); // Take the best record
                console.log(`✅ Selected best record for ujian ${ujianId}:`, {
                  id: sortedRecords[0].idAnalysis,
                  status: sortedRecords[0].ujian?.statusUjian,
                  generatedAt: sortedRecords[0].generatedAt,
                  violations: sortedRecords[0].violationIds?.length || 0,
                });
              }
            });

            processedContent = deduplicatedContent;
            console.log(
              `✅ After deduplication: ${processedContent.length} unique ujian records`
            );
          }

          // Map analysis data to table format - COMPREHENSIVE DEBUGGING
          let allData = processedContent.map((item, index) => {
            // DEBUG: Log actual structure received
            console.log(`Item ${index} structure:`, item);

            // Smart extraction handling multiple API response structures
            let hasil,
              analysisData,
              isFromAnalysisAPI = false;

            if (item.idHasilUjian && !item.analysisData) {
              // Direct HasilUjian structure (fallback data)
              hasil = item;
              analysisData = item.analysisMetadata
                ? JSON.parse(item.analysisMetadata || "{}")
                : {};
              isFromAnalysisAPI = false;
            } else if (item.hasilUjian || item.idAnalysis) {
              // UjianAnalysis structure (preferred)
              hasil = item.hasilUjian || item;
              analysisData = item.analysisData || item;
              isFromAnalysisAPI = true;
            } else {
              // Fallback
              hasil = item;
              analysisData = item;
              isFromAnalysisAPI = !!item.analysisData;
            }

            console.log(
              `Item ${index} - From Analysis API: ${isFromAnalysisAPI}`,
              { hasil, analysisData }
            );

            // Extract participant and exam information safely
            // For UjianAnalysis, this is ujian-level data, not per-participant
            const participantName = "Semua Peserta"; // This is ujian-level analysis
            const ujianName =
              item.ujian?.namaUjian ||
              hasil.ujian?.namaUjian ||
              item.ujianNama ||
              "Ujian";

            // Log the actual structure we're working with
            console.log(`📊 Processing ujian-level analysis:`, {
              ujianId: item.idUjian,
              ujianName: ujianName,
              totalParticipants: item.totalParticipants,
              completedParticipants: item.completedParticipants,
              violationStructure: {
                violationIds: item.violationIds?.length,
                cheatDetections: item.cheatDetections?.length,
                suspiciousSubmissions: item.suspiciousSubmissions,
              },
            });

            // Extract REAL violation data with correct structure
            let violationCount = 0;
            let cheatingData = {};

            // Since we're getting UjianAnalysis data directly, extract from correct fields
            if (
              item.violationIds ||
              item.cheatDetections ||
              item.suspiciousSubmissions
            ) {
              // Direct UjianAnalysis structure - extract violation data
              cheatingData = {
                violationIds: item.violationIds || [],
                cheatDetections: item.cheatDetections || [],
                suspiciousSubmissions: item.suspiciousSubmissions || 0,
                flaggedParticipants: item.flaggedParticipants || 0,
                integrityScore: item.integrityScore || 0,
              };

              // Count violations from multiple sources
              violationCount = Math.max(
                (item.violationIds || []).length,
                (item.cheatDetections || []).length,
                item.suspiciousSubmissions || 0
              );

              console.log(`🔍 Analysis Data Violations for ${ujianName}:`, {
                violationIds: item.violationIds?.length || 0,
                cheatDetections: item.cheatDetections?.length || 0,
                suspiciousSubmissions: item.suspiciousSubmissions || 0,
                finalCount: violationCount,
              });
            } else if (isFromAnalysisAPI) {
              // Nested analysis data - look for violations in nested structure
              cheatingData =
                analysisData.cheating ||
                analysisData.violations ||
                analysisData.security ||
                {};
              violationCount =
                cheatingData.totalViolations ||
                cheatingData.violationCount ||
                cheatingData.count ||
                analysisData.securityMetrics?.violationCount ||
                analysisData.totalViolations ||
                analysisData.violationsCount ||
                0;
            } else {
              // HasilUjian fallback - try to find any violation data
              violationCount =
                hasil.violationCount || hasil.totalViolations || 0;

              console.warn(
                `⚠️ Using HasilUjian data for ${participantName} - violation data may be incomplete`
              );
            }

            console.log(
              `Violations for ${participantName}:`,
              violationCount,
              "from:",
              isFromAnalysisAPI ? "Analysis API" : "HasilUjian API",
              cheatingData
            );

            // Calculate risk level based on REAL violations and ujian-level metrics
            const score =
              item.averageScore || hasil.persentase || item.finalScore || 0;
            const integrityScore = item.integrityScore || 0;

            let riskLevel = "LOW";

            // Risk calculation for ujian-level analysis
            if (violationCount > 3 || integrityScore < 30 || score < 40) {
              riskLevel = "HIGH";
            } else if (
              violationCount > 1 ||
              integrityScore < 70 ||
              score < 60
            ) {
              riskLevel = "MEDIUM";
            }

            console.log(`🎯 Risk calculation for ${ujianName}:`, {
              violationCount,
              integrityScore,
              avgScore: score,
              riskLevel,
            });

            return {
              key: item.idAnalysis || hasil.idHasilUjian || `analysis-${index}`,

              // Student information - For ujian-level analysis, show summary
              pesertaId: "ALL", // This is ujian-level analysis
              pesertaNama: participantName, // "Semua Peserta"
              pesertaUsername: `${item.totalParticipants || 0} peserta`,

              // Exam information - Support both data structures
              ujianId: item.idUjian || hasil.idUjian || item.ujianId, // Use UjianAnalysis structure first
              ujianNama: ujianName,

              // Performance data - Ujian level averages
              nilai: score, // Average score
              totalSkor: item.highestScore || 0,
              skorMaksimal: 100,
              nilaiHuruf:
                score >= 80
                  ? "A"
                  : score >= 70
                  ? "B"
                  : score >= 60
                  ? "C"
                  : score >= 50
                  ? "D"
                  : "E",
              lulus: (item.passedCount || 0) > 0,

              // Question breakdown - Ujian level summary
              totalSoal: Object.keys(item.itemAnalysis || {}).length || 0,
              jumlahBenar: item.totalParticipants || 0, // Placeholder
              jumlahSalah: 0, // Ujian level doesn't have this detail
              jumlahKosong: 0,

              // Time metrics - Ujian level averages
              durasi: item.averageCompletionTime || 0,
              waktuMulai: item.generatedAt,
              waktuSelesai: item.updatedAt,
              statusPengerjaan: item.ujian?.statusUjian || "SELESAI",

              // Security & Analytics - USE REAL UJIAN-LEVEL DATA
              violationCount: violationCount,
              riskLevel: riskLevel,
              needsReview:
                riskLevel === "HIGH" ||
                integrityScore < 50 ||
                violationCount > 2,
              integrityScore: integrityScore,

              // Learning analytics - Extract from ujian analysis
              workingPattern: violationCount > 3 ? "Irregular" : "Normal",
              learningStyle: "Mixed",
              confidenceLevel:
                integrityScore > 70
                  ? "HIGH"
                  : integrityScore > 40
                  ? "MEDIUM"
                  : "LOW",

              // Class information - From ujian analysis
              kelas:
                Object.keys(item.performanceByKelas || {}).join(", ") ||
                "Semua Kelas",

              // School information
              school: item.school?.nameSchool || "Tidak Diketahui",

              // Full data for detail view
              fullData: hasil,
            };
          });

          // Apply search filter if needed
          if (searchText) {
            allData = allData.filter(
              (item) =>
                item.pesertaNama
                  .toLowerCase()
                  .includes(searchText.toLowerCase()) ||
                item.ujianNama.toLowerCase().includes(searchText.toLowerCase())
            );
          }

          // Apply pagination
          const startIndex = (page - 1) * size;
          const endIndex = startIndex + size;
          const paginatedData = allData.slice(startIndex, endIndex);

          setSiswaData(paginatedData);
          setPagination({
            current: page,
            pageSize: size,
            total: allData.length,
          });
        } else {
          setSiswaData([]);
          setPagination((prev) => ({ ...prev, total: 0 }));
        }
      } catch (error) {
        console.error("Error fetching hasil ujian:", error);
        setSiswaData([]);
        Modal.error({
          title: "Error",
          content: `Gagal mengambil data hasil ujian: ${error.message}`,
        });
      } finally {
        setLoading(false);
      }
    },
    [filterUjian, searchText]
  );

  useEffect(() => {
    fetchUjianList();
    fetchHasilUjian();
  }, [fetchUjianList, fetchHasilUjian]);

  // Handle table pagination
  const handleTableChange = (paginationInfo) => {
    fetchHasilUjian(paginationInfo.current, paginationInfo.pageSize);
  };

  // Handle generate analysis for specific student
  const handleGenerateAnalysis = (pesertaId, ujianId) => {
    Modal.confirm({
      title: "Generate Analysis",
      icon: <ExclamationCircleOutlined />,
      content:
        "Apakah Anda yakin ingin generate ulang analisis untuk siswa ini?",
      okText: "Ya, Generate",
      cancelText: "Batal",
      onOk: async () => {
        setGenerating(true);
        try {
          // Call backend API to regenerate analysis using proper API function
          console.log("🔄 Generating analysis with params:", {
            idUjian: ujianId,
            pesertaId: pesertaId,
          });

          await generateAnalysis({
            idUjian: ujianId, // Use idUjian instead of ujianId
            pesertaId: pesertaId,
          });

          await fetchHasilUjian(pagination.current, pagination.pageSize);
          Modal.success({
            title: "Berhasil",
            content: "Analisis berhasil di-generate ulang!",
          });
        } catch (error) {
          console.error("Generate analysis error:", error);
          Modal.error({
            title: "Gagal",
            content: "Gagal generate analisis. Silakan coba lagi.",
          });
        } finally {
          setGenerating(false);
        }
      },
    });
  };
  // Handle view detail for ujian analysis - Show comprehensive HBase-style modal
  const handleViewDetail = async (record) => {
    setDetailLoading(true);
    setDetailModalVisible(true);

    try {
      // Fetch full analysis data for this ujian
      const result = await getAnalysisByUjian(record.ujianId, {
        page: 1,
        size: 1000,
      });

      let analysisData = null;
      if (result.data?.content && result.data.content.length > 0) {
        // Use deduplication logic to get the best record
        const records = result.data.content;
        if (records.length > 1) {
          // Sort by SELESAI status and latest timestamp
          const sortedRecords = records.sort((a, b) => {
            if (
              a.ujian?.statusUjian === "SELESAI" &&
              b.ujian?.statusUjian !== "SELESAI"
            )
              return -1;
            if (
              b.ujian?.statusUjian === "SELESAI" &&
              a.ujian?.statusUjian !== "SELESAI"
            )
              return 1;

            const aTime = new Date(a.updatedAt || a.generatedAt || 0);
            const bTime = new Date(b.updatedAt || b.generatedAt || 0);
            return bTime - aTime;
          });
          analysisData = sortedRecords[0];
        } else {
          analysisData = records[0];
        }
      }

      setSelectedDetailData(analysisData);
    } catch (error) {
      console.error("Error fetching analysis detail:", error);
      message.error("Gagal memuat detail analisis");
    } finally {
      setDetailLoading(false);
    }
  };

  // Get risk level color
  const getRiskColor = (level) => {
    switch (level?.toUpperCase()) {
      case "HIGH":
        return "red";
      case "MEDIUM":
        return "orange";
      case "LOW":
        return "green";
      default:
        return "default";
    }
  }; // Table columns - Student focused
  const columns = [
    {
      title: "Siswa",
      dataIndex: "pesertaNama",
      key: "pesertaNama",
      render: (text, record) => (
        <div>
          <Text strong>{text || "Siswa"}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: "12px" }}>
            {record.pesertaUsername} ({record.pesertaId})
          </Text>
        </div>
      ),
      filterable: true,
    },
    {
      title: "Kelas",
      dataIndex: "kelas",
      key: "kelas",
      render: (text) => <Tag color="blue">{text || "Tidak Diketahui"}</Tag>,
    },
    {
      title: "Ujian",
      dataIndex: "ujianNama",
      key: "ujianNama",
      render: (text, record) => (
        <div>
          <Text strong>{text || "Ujian"}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: "12px" }}>
            Status: {record.statusPengerjaan}
          </Text>
        </div>
      ),
    },
    {
      title: "Nilai",
      key: "performance",
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <div>
            <TrophyOutlined
              style={{
                color:
                  record.nilai >= 80
                    ? "green"
                    : record.nilai >= 60
                    ? "orange"
                    : "red",
              }}
            />{" "}
            <Text strong>{record.nilai}</Text> / 100
          </div>
          <div>
            <Text type="secondary">
              {record.jumlahBenar}B {record.jumlahSalah}S {record.jumlahKosong}K
            </Text>
          </div>
          <div>
            <Tag color={record.lulus ? "green" : "red"}>
              {record.lulus ? "LULUS" : "TIDAK LULUS"}
            </Tag>
          </div>
        </Space>
      ),
    },
    {
      title: "Waktu",
      key: "timing",
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <div>
            <ClockCircleOutlined /> <Text>{record.durasi || 0} menit</Text>
          </div>
          <div>
            <Text type="secondary" style={{ fontSize: "12px" }}>
              {record.waktuMulai
                ? new Date(record.waktuMulai).toLocaleString("id-ID")
                : "Tidak ada data"}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Pelanggaran",
      dataIndex: "violationCount",
      key: "violations",
      render: (count, record) => (
        <Space direction="vertical" size="small">
          <Tag color={count === 0 ? "green" : count <= 2 ? "orange" : "red"}>
            {count} pelanggaran
          </Tag>
          <div>
            <Text type="secondary">Integritas: {record.integrityScore}%</Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Tingkat Risiko",
      dataIndex: "riskLevel",
      key: "riskLevel",
      render: (risk, record) => (
        <Space direction="vertical" size="small">
          <Tag color={getRiskColor(risk)}>{risk || "LOW"}</Tag>
          <div>
            <Text type="secondary">{record.confidenceLevel}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Status Review",
      dataIndex: "needsReview",
      key: "needsReview",
      render: (needsReview) => (
        <Tag color={needsReview ? "red" : "green"}>
          {needsReview ? "Perlu Review" : "Normal"}
        </Tag>
      ),
    },
    {
      title: "Aksi",
      key: "action",
      render: (_, record) => (
        <Space>
          <Tooltip title="Lihat Detail Siswa">
            <Button
              type="primary"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
          <Tooltip title="Generate Ulang Analisis">
            <Button
              icon={<BarChartOutlined />}
              size="small"
              loading={generating}
              onClick={() =>
                handleGenerateAnalysis(record.pesertaId, record.ujianId)
              }
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Calculate summary statistics from student results
  const summaryStats = {
    totalSiswa: siswaData.length,
    avgScore:
      siswaData.length > 0
        ? parseFloat(
            (
              siswaData.reduce((sum, item) => sum + (item.nilai || 0), 0) /
              siswaData.length
            ).toFixed(1)
          )
        : 0,
    totalViolations: siswaData.reduce(
      (sum, item) => sum + (item.violationCount || 0),
      0
    ),
    highRiskStudents: siswaData.filter((item) => item.riskLevel === "HIGH")
      .length,
    needsReview: siswaData.filter((item) => item.needsReview).length,
    avgIntegrityScore:
      siswaData.length > 0
        ? parseFloat(
            (
              siswaData.reduce(
                (sum, item) => sum + (item.integrityScore || 0),
                0
              ) / siswaData.length
            ).toFixed(1)
          )
        : 0,
    lulusCount: siswaData.filter((item) => item.lulus).length,
  };

  // Render detailed analysis modal in HBase style
  const renderDetailModal = () => {
    if (!selectedDetailData) return null;

    const data = selectedDetailData;

    return (
      <Modal
        title="📊 Data Analisis Ujian - Format HBase"
        visible={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        width={1200}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Tutup
          </Button>,
        ]}
        bodyStyle={{ maxHeight: "70vh", overflow: "auto" }}
      >
        {detailLoading ? (
          <div style={{ textAlign: "center", padding: "50px" }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>Memuat detail analisis...</div>
          </div>
        ) : (
          <div>
            {/* Header Info */}
            <Card
              title="📊 Informasi Utama (main)"
              style={{ marginBottom: 16 }}
            >
              <Row gutter={[16, 16]}>
                <Col span={8}>
                  <Statistic title="ID Analysis" value={data.idAnalysis} />
                </Col>
                <Col span={8}>
                  <Statistic title="ID Ujian" value={data.idUjian} />
                </Col>
                <Col span={8}>
                  <Statistic title="ID Sekolah" value={data.idSchool} />
                </Col>
                <Col span={8}>
                  <Statistic title="Tipe Analisis" value={data.analysisType} />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Versi Analisis"
                    value={data.analysisVersion}
                  />
                </Col>
                <Col span={8}>
                  <Statistic title="Generated By" value={data.generatedBy} />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Generated At"
                    value={new Date(data.generatedAt).toLocaleString("id-ID")}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Updated At"
                    value={new Date(data.updatedAt).toLocaleString("id-ID")}
                  />
                </Col>
              </Row>
            </Card>

            {/* Descriptive Statistics */}
            <Card
              title="📈 Statistik Deskriptif (descriptive)"
              style={{ marginBottom: 16 }}
            >
              <Row gutter={[16, 16]}>
                <Col span={8}>
                  <Statistic
                    title="Total Peserta"
                    value={data.totalParticipants}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Peserta Selesai"
                    value={data.completedParticipants}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Peserta Belum Selesai"
                    value={data.incompleteParticipants}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Rata-rata Skor"
                    value={data.averageScore?.toFixed(1)}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Skor Tertinggi"
                    value={data.highestScore?.toFixed(1)}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Skor Terendah"
                    value={data.lowestScore?.toFixed(1)}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Median Skor"
                    value={data.medianScore?.toFixed(1)}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Standar Deviasi"
                    value={data.standardDeviation?.toFixed(2)}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Variance"
                    value={data.variance?.toFixed(2)}
                  />
                </Col>
                <Col span={8}>
                  <Statistic title="Jumlah Lulus" value={data.passedCount} />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Jumlah Tidak Lulus"
                    value={data.failedCount}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Pass Rate"
                    value={`${data.passRate?.toFixed(1)}%`}
                  />
                </Col>
              </Row>

              {/* Grade Distribution */}
              <div style={{ marginTop: 16 }}>
                <Title level={5}>Distribusi Nilai:</Title>
                <Row gutter={16}>
                  {Object.entries(data.gradeDistribution || {}).map(
                    ([grade, count]) => (
                      <Col key={grade} span={6}>
                        <Card size="small">
                          <Statistic
                            title={`Nilai ${grade}`}
                            value={`${count} peserta`}
                            suffix={`(${data.gradePercentages?.[grade]?.toFixed(
                              1
                            )}%)`}
                          />
                        </Card>
                      </Col>
                    )
                  )}
                </Row>
              </div>
            </Card>

            {/* Time Analysis */}
            <Card
              title="📝 Analisis Waktu (analysis)"
              style={{ marginBottom: 16 }}
            >
              <Row gutter={[16, 16]}>
                <Col span={8}>
                  <Statistic
                    title="Waktu Rata-rata"
                    value={`${data.averageCompletionTime?.toFixed(2)} menit`}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Waktu Tercepat"
                    value={`${data.shortestCompletionTime?.toFixed(2)} menit`}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Waktu Terlama"
                    value={`${data.longestCompletionTime?.toFixed(2)} menit`}
                  />
                </Col>
              </Row>
            </Card>

            {/* Item Analysis */}
            <Card title="📊 Analisis Item Detail" style={{ marginBottom: 16 }}>
              <List
                dataSource={Object.entries(data.itemAnalysis || {})}
                renderItem={([soalId, soal]) => (
                  <List.Item>
                    <Card size="small" style={{ width: "100%" }}>
                      <Title level={5}>
                        Soal: &quot;{soal.pertanyaan}&quot;
                      </Title>
                      <Row gutter={16}>
                        <Col span={6}>
                          <Statistic title="ID" value={soal.idBankSoal} />
                        </Col>
                        <Col span={6}>
                          <Statistic title="Jenis" value={soal.jenisSoal} />
                        </Col>
                        <Col span={6}>
                          <Statistic
                            title="Total Respons"
                            value={soal.totalResponses}
                          />
                        </Col>
                        <Col span={6}>
                          <Statistic
                            title="Jawaban Benar"
                            value={`${
                              soal.correctResponses
                            } (${soal.correctPercentage?.toFixed(1)}%)`}
                          />
                        </Col>
                        <Col span={8}>
                          <Statistic
                            title="Difficulty Index"
                            value={soal.difficultyIndex?.toFixed(2)}
                          />
                        </Col>
                        <Col span={8}>
                          <Tag
                            color={
                              soal.difficultyLevel === "EASY"
                                ? "green"
                                : soal.difficultyLevel === "HARD"
                                ? "red"
                                : "orange"
                            }
                          >
                            {soal.difficultyLevel}
                          </Tag>
                        </Col>
                        <Col span={8}>
                          <Text type="secondary">{soal.recommendation}</Text>
                        </Col>
                      </Row>

                      {/* Option Distribution */}
                      <div style={{ marginTop: 8 }}>
                        <Text strong>Pilihan yang dipilih: </Text>
                        {Object.entries(soal.optionFrequency || {}).map(
                          ([option, count]) => (
                            <Tag key={option} color="blue">
                              {option}: {count} (
                              {soal.optionPercentage?.[option]?.toFixed(1)}%)
                            </Tag>
                          )
                        )}
                      </div>
                    </Card>
                  </List.Item>
                )}
              />
            </Card>

            {/* Performance by Class */}
            <Card
              title="👥 Performa Berdasarkan Kelas"
              style={{ marginBottom: 16 }}
            >
              <List
                dataSource={Object.entries(data.performanceByKelas || {})}
                renderItem={([kelas, performance]) => (
                  <List.Item>
                    <Card size="small" style={{ width: "100%" }}>
                      <Title level={5}>Kelas {kelas}:</Title>
                      <Row gutter={16}>
                        <Col span={6}>
                          <Statistic
                            title="Jumlah Peserta"
                            value={performance.participantCount}
                          />
                        </Col>
                        <Col span={6}>
                          <Statistic
                            title="Rata-rata Skor"
                            value={performance.averageScore?.toFixed(1)}
                          />
                        </Col>
                        <Col span={6}>
                          <Statistic
                            title="Skor Tertinggi"
                            value={performance.highestScore?.toFixed(1)}
                          />
                        </Col>
                        <Col span={6}>
                          <Statistic
                            title="Pass Rate"
                            value={`${performance.passRate?.toFixed(1)}%`}
                          />
                        </Col>
                      </Row>
                    </Card>
                  </List.Item>
                )}
              />
            </Card>

            {/* Cheating Detection */}
            <Card
              title="🚨 Deteksi Kecurangan (cheating)"
              style={{ marginBottom: 16 }}
            >
              <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col span={8}>
                  <Statistic
                    title="Integrity Score"
                    value={`${data.integrityScore?.toFixed(1)} ⚠️`}
                    valueStyle={{
                      color: data.integrityScore < 50 ? "#cf1322" : "#52c41a",
                    }}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Flagged Participants"
                    value={data.flaggedParticipants}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Suspicious Submissions"
                    value={data.suspiciousSubmissions}
                  />
                </Col>
              </Row>

              <Title level={5}>Pelanggaran yang Terdeteksi:</Title>
              <List
                dataSource={data.cheatDetections || []}
                renderItem={(violation, index) => (
                  <List.Item>
                    <Card size="small" style={{ width: "100%" }}>
                      <Title level={5}>
                        Violation {index + 1} - {violation.typeViolation}
                      </Title>
                      <Row gutter={16}>
                        <Col span={8}>
                          <Text>
                            <strong>ID Detection:</strong>{" "}
                            {violation.idDetection}
                          </Text>
                          <br />
                          <Text>
                            <strong>Session:</strong> {violation.sessionId}
                          </Text>
                          <br />
                          <Text>
                            <strong>Peserta:</strong> {violation.idPeserta}
                          </Text>
                        </Col>
                        <Col span={8}>
                          <Text>
                            <strong>Severity:</strong>{" "}
                            <Tag
                              color={
                                violation.severity === "HIGH" ? "red" : "orange"
                              }
                            >
                              {violation.severity}
                            </Tag>
                          </Text>
                          <br />
                          <Text>
                            <strong>Violation Count:</strong>{" "}
                            {violation.violationCount}
                          </Text>
                          <br />
                          <Text>
                            <strong>Critical:</strong>{" "}
                            {violation.critical ? "Ya" : "Tidak"}
                          </Text>
                        </Col>
                        <Col span={8}>
                          <Text>
                            <strong>Detected At:</strong>{" "}
                            {new Date(violation.detectedAt).toLocaleString(
                              "id-ID"
                            )}
                          </Text>
                          <br />
                          <Text>
                            <strong>Status:</strong>{" "}
                            <Tag color={violation.resolved ? "green" : "red"}>
                              {violation.resolved
                                ? "Resolved"
                                : "Belum Resolved"}
                            </Tag>
                          </Text>
                          <br />
                          <Text>
                            <strong>Source:</strong>{" "}
                            {violation.evidence?.source}{" "}
                            {violation.evidence?.detector}
                          </Text>
                        </Col>
                      </Row>
                    </Card>
                  </List.Item>
                )}
              />
            </Card>

            {/* Recommendations */}
            <Card
              title="💡 Rekomendasi (recommendation)"
              style={{ marginBottom: 16 }}
            >
              <div style={{ marginBottom: 16 }}>
                <Title level={5}>Rekomendasi Umum:</Title>
                <List
                  dataSource={data.recommendations || []}
                  renderItem={(rec) => (
                    <List.Item>
                      <Text>• {rec}</Text>
                    </List.Item>
                  )}
                />
              </div>

              <div>
                <Title level={5}>Saran Perbaikan:</Title>
                <List
                  dataSource={data.improvementSuggestions || []}
                  renderItem={(suggestion) => (
                    <List.Item>
                      <Text>• {suggestion}</Text>
                    </List.Item>
                  )}
                />
              </div>
            </Card>

            {/* School & Exam Info */}
            <Card title="🏫 Data Sekolah & Ujian" style={{ marginBottom: 16 }}>
              <Row gutter={[16, 16]}>
                <Col span={8}>
                  <Statistic title="ID Sekolah" value={data.school?.idSchool} />
                </Col>
                <Col span={16}>
                  <Statistic
                    title="Nama Sekolah"
                    value={data.school?.nameSchool}
                  />
                </Col>
                <Col span={8}>
                  <Statistic title="ID Ujian" value={data.ujian?.idUjian} />
                </Col>
                <Col span={8}>
                  <Statistic title="Nama Ujian" value={data.ujian?.namaUjian} />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Status Ujian"
                    value={data.ujian?.statusUjian}
                    prefix={data.ujian?.statusUjian === "SELESAI" ? "✅" : "🔄"}
                  />
                </Col>
              </Row>
            </Card>

            {/* Metadata */}
            <Card title="⚙️ Metadata">
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Statistic
                    title="Allow Duplicate"
                    value={
                      data.configurationUsed?.allowDuplicate ? "true" : "false"
                    }
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Auto Generated"
                    value={
                      data.configurationUsed?.autoGenerated ? "true" : "false"
                    }
                  />
                </Col>
              </Row>
            </Card>
          </div>
        )}
      </Modal>
    );
  };

  return (
    <div style={{ padding: "24px", background: "#f0f2f5", minHeight: "100vh" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <Title level={2} style={{ margin: 0 }}>
          📊 Dashboard Analisis Ujian
        </Title>
        <Space>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={() => message.info("Fitur ekspor akan tersedia segera")}
          >
            Ekspor Data
          </Button>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => fetchHasilUjian(1, pagination.pageSize)}
            loading={loading}
          >
            Refresh
          </Button>
        </Space>
      </div>
      {/* Enhanced Key Metrics - 2 Rows Layout */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        {/* Row 1: Primary Metrics */}
        <Col xs={24} sm={6}>
          <Card
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              border: "none",
            }}
          >
            <Statistic
              title="Total Peserta"
              value={summaryStats.totalSiswa}
              prefix={<UserOutlined />}
              valueStyle={{ color: "#fff" }}
              style={{ color: "#fff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card
            style={{
              background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
              border: "none",
            }}
          >
            <Statistic
              title="Rata-rata Nilai"
              value={summaryStats.avgScore}
              prefix={<TrophyOutlined />}
              precision={1}
              valueStyle={{ color: "#fff" }}
              style={{ color: "#fff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card
            style={{
              background:
                summaryStats.totalViolations > 0
                  ? "linear-gradient(135deg, #ff6b6b 0%, #ffa500 100%)"
                  : "linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)",
              border: "none",
            }}
          >
            <Statistic
              title="Total Pelanggaran"
              value={summaryStats.totalViolations}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: "#fff" }}
              style={{ color: "#fff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card
            style={{
              background: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
              border: "none",
            }}
          >
            <Statistic
              title="Tingkat Kelulusan"
              value={
                ((summaryStats.totalSiswa - summaryStats.highRiskStudents) /
                  Math.max(summaryStats.totalSiswa, 1)) *
                  100 || 0
              }
              prefix={<CheckCircleOutlined />}
              precision={1}
              suffix="%"
              valueStyle={{ color: "#d4691a" }}
            />
          </Card>
        </Col>

        {/* Row 2: Secondary Metrics */}
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Risiko Tinggi"
              value={summaryStats.highRiskStudents}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: "#cf1322" }}
            />
            <Progress
              percent={
                (summaryStats.highRiskStudents /
                  Math.max(summaryStats.totalSiswa, 1)) *
                  100 || 0
              }
              size="small"
              strokeColor="#ff4d4f"
              showInfo={false}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Perlu Review"
              value={summaryStats.needsReview}
              prefix={<EyeOutlined />}
              valueStyle={{ color: "#faad14" }}
            />
            <Progress
              percent={
                (summaryStats.needsReview /
                  Math.max(summaryStats.totalSiswa, 1)) *
                  100 || 0
              }
              size="small"
              strokeColor="#faad14"
              showInfo={false}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Skor Integritas"
              value={summaryStats.avgIntegrityScore}
              prefix={<BarChartOutlined />}
              precision={1}
              suffix="%"
              valueStyle={{
                color:
                  summaryStats.avgIntegrityScore >= 90
                    ? "#3f8600"
                    : summaryStats.avgIntegrityScore >= 70
                    ? "#faad14"
                    : "#cf1322",
              }}
            />
            <Progress
              percent={summaryStats.avgIntegrityScore || 0}
              size="small"
              strokeColor={
                summaryStats.avgIntegrityScore >= 90
                  ? "#52c41a"
                  : summaryStats.avgIntegrityScore >= 70
                  ? "#faad14"
                  : "#ff4d4f"
              }
              showInfo={false}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Ujian Aktif"
              value={
                ujianList.filter((ujian) => ujian.status === "ACTIVE").length ||
                ujianList.length
              }
              prefix={<ClockCircleOutlined />}
            />
            <div style={{ marginTop: "8px" }}>
              <Text type="secondary" style={{ fontSize: "12px" }}>
                Total {ujianList.length} ujian
              </Text>
            </div>
          </Card>
        </Col>
      </Row>
      {/* Enhanced Analytics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        {/* Performance Distribution */}
        <Col xs={24} lg={12}>
          <Card title="📈 Distribusi Performa" size="small">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <Text strong>Excellent (≥90): </Text>
                <Tag color="green">
                  {siswaData.filter((s) => s.nilai >= 90).length} siswa
                </Tag>
              </div>
              <Progress
                type="circle"
                percent={
                  (siswaData.filter((s) => s.nilai >= 90).length /
                    Math.max(siswaData.length, 1)) *
                    100 || 0
                }
                size={50}
                strokeColor="#52c41a"
              />
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: "12px",
              }}
            >
              <div>
                <Text strong>Good (75-89): </Text>
                <Tag color="blue">
                  {
                    siswaData.filter((s) => s.nilai >= 75 && s.nilai < 90)
                      .length
                  }{" "}
                  siswa
                </Tag>
              </div>
              <Progress
                type="circle"
                percent={
                  (siswaData.filter((s) => s.nilai >= 75 && s.nilai < 90)
                    .length /
                    Math.max(siswaData.length, 1)) *
                    100 || 0
                }
                size={50}
                strokeColor="#1890ff"
              />
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: "12px",
              }}
            >
              <div>
                <Text strong>Needs Improvement (&lt;75): </Text>
                <Tag color="red">
                  {siswaData.filter((s) => s.nilai < 75).length} siswa
                </Tag>
              </div>
              <Progress
                type="circle"
                percent={
                  (siswaData.filter((s) => s.nilai < 75).length /
                    Math.max(siswaData.length, 1)) *
                    100 || 0
                }
                size={50}
                strokeColor="#ff4d4f"
              />
            </div>
          </Card>
        </Col>

        {/* Security Overview */}
        <Col xs={24} lg={12}>
          <Card title="🔒 Ringkasan Keamanan" size="small">
            <Alert
              message={
                summaryStats.avgIntegrityScore >= 90
                  ? "Status Keamanan: AMAN"
                  : summaryStats.avgIntegrityScore >= 70
                  ? "Status Keamanan: PERLU PERHATIAN"
                  : "Status Keamanan: RISIKO TINGGI"
              }
              type={
                summaryStats.avgIntegrityScore >= 90
                  ? "success"
                  : summaryStats.avgIntegrityScore >= 70
                  ? "warning"
                  : "error"
              }
              showIcon
              style={{ marginBottom: "16px" }}
            />

            <Row gutter={[8, 8]}>
              <Col span={12}>
                <div
                  style={{
                    textAlign: "center",
                    padding: "8px",
                    backgroundColor: "#fff2f0",
                    borderRadius: "6px",
                  }}
                >
                  <Text type="danger" strong>
                    {summaryStats.totalViolations}
                  </Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    Total Pelanggaran
                  </Text>
                </div>
              </Col>
              <Col span={12}>
                <div
                  style={{
                    textAlign: "center",
                    padding: "8px",
                    backgroundColor: "#f6ffed",
                    borderRadius: "6px",
                  }}
                >
                  <Text type="success" strong>
                    {siswaData.filter((s) => s.integrityScore === 100).length}
                  </Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    Peserta Bersih
                  </Text>
                </div>
              </Col>
              <Col span={12}>
                <div
                  style={{
                    textAlign: "center",
                    padding: "8px",
                    backgroundColor: "#fff7e6",
                    borderRadius: "6px",
                  }}
                >
                  <Text style={{ color: "#fa8c16" }} strong>
                    {summaryStats.needsReview}
                  </Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    Perlu Review
                  </Text>
                </div>
              </Col>
              <Col span={12}>
                <div
                  style={{
                    textAlign: "center",
                    padding: "8px",
                    backgroundColor: "#f0f5ff",
                    borderRadius: "6px",
                  }}
                >
                  <Text style={{ color: "#1890ff" }} strong>
                    {(summaryStats.avgIntegrityScore || 0).toFixed(1)}%
                  </Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    Avg. Integritas
                  </Text>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
      {/* Recent Activity & Quick Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} lg={8}>
          <Card title="⚡ Aktivitas Terkini" size="small">
            <List
              size="small"
              dataSource={siswaData.slice(0, 5)}
              renderItem={(item) => (
                <List.Item>
                  <div style={{ width: "100%" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <Text strong>{item.pesertaNama}</Text>
                      <Tag color={item.nilai >= 75 ? "green" : "red"}>
                        {item.nilai}
                      </Tag>
                    </div>
                    <Text type="secondary" style={{ fontSize: "12px" }}>
                      {item.ujianNama} • {item.kelas}
                    </Text>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="🎯 Top Performers" size="small">
            <List
              size="small"
              dataSource={siswaData
                .filter((s) => s.nilai >= 85)
                .sort((a, b) => b.nilai - a.nilai)
                .slice(0, 5)}
              renderItem={(item, index) => (
                <List.Item>
                  <div style={{ width: "100%" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <Badge
                          count={index + 1}
                          style={{
                            backgroundColor: "#52c41a",
                            marginRight: "8px",
                          }}
                        />
                        <Text strong>{item.pesertaNama}</Text>
                      </div>
                      <Tag color="green">{item.nilai}</Tag>
                    </div>
                    <Text type="secondary" style={{ fontSize: "12px" }}>
                      {item.ujianNama}
                    </Text>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="⚠️ Butuh Perhatian" size="small">
            <List
              size="small"
              dataSource={siswaData
                .filter((s) => s.riskLevel === "HIGH" || s.nilai < 60)
                .sort((a, b) => a.nilai - b.nilai)
                .slice(0, 5)}
              renderItem={(item) => (
                <List.Item>
                  <div style={{ width: "100%" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Text strong>{item.pesertaNama}</Text>
                      <Space>
                        {item.violationCount > 0 && (
                          <Tag color="red" style={{ fontSize: "10px" }}>
                            {item.violationCount} pelanggaran
                          </Tag>
                        )}
                        <Tag color="red">{item.nilai}</Tag>
                      </Space>
                    </div>
                    <Text type="secondary" style={{ fontSize: "12px" }}>
                      {item.ujianNama}
                    </Text>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
      {/* Filters */}
      <Card style={{ marginBottom: "24px" }}>
        <Row gutter={16}>
          <Col span={6}>
            <Input
              placeholder="Cari nama peserta..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onPressEnter={() => fetchHasilUjian(1, pagination.pageSize)}
            />
          </Col>
          <Col span={6}>
            <Select
              placeholder="Filter by Ujian"
              style={{ width: "100%" }}
              allowClear
              value={filterUjian}
              onChange={(value) => setFilterUjian(value)}
              onClear={() => setFilterUjian(null)}
            >
              {ujianList.map((ujian) => (
                <Option key={ujian.idUjian} value={ujian.idUjian}>
                  {ujian.namaUjian}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={6}>
            {" "}
            <Select
              placeholder="Filter by Kelas"
              style={{ width: "100%" }}
              allowClear
              value={filterKelas}
              onChange={(value) => setFilterKelas(value)}
              onClear={() => setFilterKelas(null)}
            >
              <Option value="X">Kelas X</Option>
              <Option value="XI">Kelas XI</Option>
              <Option value="XII">Kelas XII</Option>
            </Select>
          </Col>
          <Col span={6}>
            <Space>
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={() => fetchHasilUjian(1, pagination.pageSize)}
              >
                Cari
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setSearchText("");
                  setFilterUjian(null);
                  setFilterKelas(null);
                  fetchHasilUjian(1, pagination.pageSize);
                }}
              >
                Reset
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>{" "}
      {/* Student Results Table */}
      <Card title="Daftar Hasil Ujian Siswa">
        <Table
          columns={columns}
          dataSource={siswaData}
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} dari ${total} siswa`,
          }}
          onChange={handleTableChange}
          rowKey={(record) => record.key}
          scroll={{ x: 1200 }}
          rowClassName={(record) => {
            if (record.riskLevel === "HIGH") return "high-risk-row";
            if (record.needsReview) return "needs-review-row";
            return "";
          }}
        />
      </Card>
      {/* Detail Modal */}
      {renderDetailModal()}
    </div>
  );
};

export default AnalisisUjian;
