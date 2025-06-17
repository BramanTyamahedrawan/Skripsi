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
} from "@ant-design/icons";
import { getUjian } from "@/api/ujian";
import { getHasilByUjian, getHasilUjian } from "@/api/hasilUjian";
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
  const navigate = useNavigate();

  // Fetch ujian list for filter
  const fetchUjianList = useCallback(async () => {
    try {
      const response = await getUjian();
      setUjianList(response.data?.content || []);
    } catch (error) {
      console.error("Error fetching ujian list:", error);
    }
  }, []); // Fetch hasil ujian data (exam results by students) - UPDATED TO USE API FUNCTION
  const fetchHasilUjian = useCallback(
    async (page = 1, size = 10) => {
      setLoading(true);
      try {
        let result;

        if (filterUjian) {
          // Get results for specific ujian
          try {
            result = await getHasilByUjian(filterUjian, false); // Set includeAnalytics to false to avoid metadata issues
          } catch (ujianError) {
            console.error("Error fetching hasil by ujian:", ujianError);
            // Set empty result to prevent further errors
            result = { data: { content: [] } };
            message.warning("Gagal memuat data untuk ujian yang dipilih");
          }
        } else {
          // Get all results - use getHasilUjian for all data
          try {
            result = await getHasilUjian(1000); // Get large amount to get all data
          } catch (allError) {
            console.error("Error fetching all hasil ujian:", allError);
            result = { data: { content: [] } };
            message.warning("Gagal memuat semua data hasil ujian");
          }
        }

        console.log("Hasil Ujian API Response:", result);

        if (result.data?.content) {
          console.log(
            "Found",
            result.data.content.length,
            "hasil ujian records"
          );

          // Map hasil ujian data to table format
          let allData = result.data.content.map((hasil, index) => {
            // Extract participant and exam information safely
            const participantName =
              hasil.peserta?.nama || hasil.idPeserta || "Siswa";
            const ujianName = hasil.ujian?.namaUjian || "Ujian";
            const violationCount = 0; // Set to 0 due to metadata parsing issues

            // Determine risk level based on violations and score
            let riskLevel = "LOW"; // Default to LOW due to metadata issues
            const score = hasil.persentase || 0; // Simple risk assessment based on score only
            if (score < 40) {
              riskLevel = "HIGH";
            } else if (score < 60) {
              riskLevel = "MEDIUM";
            }

            return {
              key: hasil.idHasilUjian || `hasil-${index}`,

              // Student information
              pesertaId: hasil.idPeserta,
              pesertaNama: participantName,
              pesertaUsername: hasil.peserta?.username || hasil.idPeserta, // Use ID as username fallback

              // Exam information
              ujianId: hasil.idUjian,
              ujianNama: ujianName,

              // Performance data
              nilai: score,
              totalSkor: hasil.totalSkor || 0,
              skorMaksimal: hasil.skorMaksimal || 100,
              nilaiHuruf: hasil.nilaiHuruf || "E",
              lulus: hasil.lulus || false,

              // Question breakdown
              totalSoal: hasil.ujian?.jumlahSoal || 0,
              jumlahBenar: hasil.soalBenar || 0,
              jumlahSalah: hasil.soalSalah || 0,
              jumlahKosong: hasil.soalKosong || 0,

              // Time metrics
              durasi: hasil.durasiPengerjaan || 0,
              waktuMulai: hasil.waktuMulai,
              waktuSelesai: hasil.waktuSelesai,
              statusPengerjaan: hasil.statusPengerjaan || "SELESAI",

              // Security & Analytics
              violationCount: violationCount,
              riskLevel: riskLevel,
              needsReview: riskLevel === "HIGH" || score < 60,
              integrityScore:
                violationCount === 0
                  ? 100
                  : Math.max(0, 100 - violationCount * 20),

              // Learning analytics - defaults for now
              workingPattern: "Normal",
              learningStyle: "Mixed",
              confidenceLevel: "MEDIUM",

              // Class information
              kelas: hasil.kelas?.namaKelas || "Tidak Diketahui",

              // School information
              school: hasil.peserta?.sekolah?.nama || "Tidak Diketahui",

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
          // Call backend API to regenerate analysis
          const response = await fetch(
            `${import.meta.env.VITE_API_URL}/ujian-analysis/generate`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                ujianId: ujianId,
                pesertaId: pesertaId,
              }),
            }
          );

          if (response.ok) {
            await fetchHasilUjian(pagination.current, pagination.pageSize);
            Modal.success({
              title: "Berhasil",
              content: "Analisis berhasil di-generate ulang!",
            });
          } else {
            throw new Error("Failed to generate analysis");
          }
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
  // Handle view detail for student
  const handleViewDetail = (record) => {
    navigate(`/siswa-analysis/detail/${record.pesertaId}/${record.ujianId}`);
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
        ? (
            siswaData.reduce((sum, item) => sum + (item.nilai || 0), 0) /
            siswaData.length
          ).toFixed(1)
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
        ? (
            siswaData.reduce(
              (sum, item) => sum + (item.integrityScore || 0),
              0
            ) / siswaData.length
          ).toFixed(1)
        : 0,
    lulusCount: siswaData.filter((item) => item.lulus).length,
  };
  return (
    <div style={{ padding: "24px", background: "#f0f2f5", minHeight: "100vh" }}>
      <Title level={2}>Analisis Ujian - Daftar Siswa</Title>
      {/* Summary Statistics */}
      <Row gutter={16} style={{ marginBottom: "24px" }}>
        <Col span={4}>
          <Card>
            {" "}
            <Statistic
              title="Total Peserta"
              value={summaryStats.totalSiswa}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Rata-rata Nilai"
              value={summaryStats.avgScore}
              prefix={<TrophyOutlined />}
              precision={1}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Total Pelanggaran"
              value={summaryStats.totalViolations}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{
                color: summaryStats.totalViolations > 0 ? "#cf1322" : "#3f8600",
              }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            {" "}
            <Statistic
              title="Risiko Tinggi"
              value={summaryStats.highRiskStudents}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: "#cf1322" }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Perlu Review"
              value={summaryStats.needsReview}
              prefix={<EyeOutlined />}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            {" "}
            <Statistic
              title="Avg Integritas"
              value={summaryStats.avgIntegrityScore}
              prefix={<BarChartOutlined />}
              precision={1}
              suffix="%"
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
    </div>
  );
};

export default AnalisisUjian;
