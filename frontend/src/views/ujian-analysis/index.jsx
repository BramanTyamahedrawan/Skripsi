/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
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
} from "antd";
import {
  EyeOutlined,
  BarChartOutlined,
  ExclamationCircleOutlined,
  UsergroupAddOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import {
  getAllAnalysis,
  generateAnalysis,
  autoGenerateAnalysisForUjian,
} from "@/api/ujianAnalysis";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

const UjianAnalysis = () => {
  const [analysisData, setAnalysisData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const navigate = useNavigate();
  // Fetch analysis data
  const fetchAnalysis = async (page = 1, size = 10) => {
    setLoading(true);
    try {
      const response = await getAllAnalysis({
        page: page - 1,
        size,
      });

      if (response.data && response.data.content) {
        // Format data untuk kompatibilitas dengan UI
        const formattedData = response.data.content.map((item, index) => ({
          ...item,
          key: item.idAnalysis || index,
          ujianNama: item.ujian?.namaUjian || `Ujian ${item.idUjian}`,
          ujianId: item.idUjian,
          totalPeserta:
            item.totalParticipants || item.completedParticipants || 0,
          avgScore: item.averageScore || 0,
          avgDuration: item.averageCompletionTime
            ? Math.round(item.averageCompletionTime)
            : 0,
          difficultyLevel: item.difficultyLevel || "Belum dianalisis",
          passRate:
            item.passRate ||
            (item.passedCount && item.totalParticipants
              ? (item.passedCount / item.totalParticipants) * 100
              : 0),
          totalViolations:
            item.suspiciousSubmissions || item.flaggedParticipants || 0,
          status: item.status || "Selesai",
        }));

        setAnalysisData(formattedData);
        setPagination({
          current: page,
          pageSize: size,
          total: response.data.totalElements || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching analysis:", error);
      setAnalysisData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
  }, []);

  // Handle table pagination
  const handleTableChange = (paginationInfo) => {
    fetchAnalysis(paginationInfo.current, paginationInfo.pageSize);
  };
  // Handle generate new analysis
  const handleGenerateAnalysis = (ujianId) => {
    Modal.confirm({
      title: "Generate Analysis",
      icon: <ExclamationCircleOutlined />,
      content: "Apakah Anda yakin ingin generate analisis untuk ujian ini?",
      okText: "Ya, Generate",
      cancelText: "Batal",
      onOk: async () => {
        setGenerating(true);
        try {
          // Use auto-generate endpoint for simpler trigger
          await autoGenerateAnalysisForUjian(ujianId);
          await fetchAnalysis(pagination.current, pagination.pageSize);
          Modal.success({
            title: "Berhasil",
            content: "Analisis berhasil di-generate!",
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
  // Handle view detail
  const handleViewDetail = (record) => {
    navigate(`/ujian-analysis/detail/${record.ujianId}`);
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "selesai":
        return "green";
      case "processing":
      case "proses":
        return "blue";
      case "failed":
      case "gagal":
        return "red";
      default:
        return "default";
    }
  };

  // Get difficulty level color
  const getDifficultyColor = (level) => {
    switch (level?.toLowerCase()) {
      case "mudah":
      case "easy":
        return "green";
      case "sedang":
      case "medium":
        return "orange";
      case "sulit":
      case "hard":
        return "red";
      default:
        return "default";
    }
  };

  // Table columns
  const columns = [
    {
      title: "Ujian",
      dataIndex: "ujianNama",
      key: "ujianNama",
      render: (text, record) => (
        <div>
          <Text strong>{text || "Ujian"}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: "12px" }}>
            ID: {record.ujianId}
          </Text>
        </div>
      ),
    },
    {
      title: "Statistik Dasar",
      key: "basicStats",
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <div>
            <UsergroupAddOutlined />{" "}
            <Text>Peserta: {record.totalPeserta || 0}</Text>
          </div>
          <div>
            <TrophyOutlined />{" "}
            <Text>Avg: {record.avgScore?.toFixed(1) || "0.0"}</Text>
          </div>
          <div>
            <ClockCircleOutlined />{" "}
            <Text>Durasi: {record.avgDuration || "0"} menit</Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Tingkat Kesulitan",
      dataIndex: "difficultyLevel",
      key: "difficultyLevel",
      render: (level) => (
        <Tag color={getDifficultyColor(level)}>
          {level || "Belum dianalisis"}
        </Tag>
      ),
    },
    {
      title: "Pass Rate",
      dataIndex: "passRate",
      key: "passRate",
      render: (rate) => (
        <Progress
          percent={rate ? Math.round(rate) : 0}
          size="small"
          status={rate >= 70 ? "success" : rate >= 50 ? "normal" : "exception"}
        />
      ),
    },
    {
      title: "Pelanggaran",
      dataIndex: "totalViolations",
      key: "totalViolations",
      render: (violations) => (
        <Tag color={violations > 0 ? "red" : "green"}>
          {violations || 0} pelanggaran
        </Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={getStatusColor(status)}>{status || "Belum diproses"}</Tag>
      ),
    },
    {
      title: "Aksi",
      key: "action",
      render: (_, record) => (
        <Space>
          <Tooltip title="Lihat Detail">
            <Button
              type="primary"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
          <Tooltip title="Generate Ulang">
            <Button
              icon={<BarChartOutlined />}
              size="small"
              loading={generating}
              onClick={() => handleGenerateAnalysis(record.ujianId)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Calculate summary statistics
  const summaryStats = {
    totalAnalysis: analysisData.length,
    avgPassRate:
      analysisData.length > 0
        ? (
            analysisData.reduce((sum, item) => sum + (item.passRate || 0), 0) /
            analysisData.length
          ).toFixed(1)
        : 0,
    totalViolations: analysisData.reduce(
      (sum, item) => sum + (item.totalViolations || 0),
      0
    ),
    completedAnalysis: analysisData.filter(
      (item) =>
        item.status?.toLowerCase() === "completed" ||
        item.status?.toLowerCase() === "selesai"
    ).length,
  };

  return (
    <div style={{ padding: "24px", background: "#f0f2f5", minHeight: "100vh" }}>
      <Title level={2}>Analisis Ujian</Title>

      {/* Summary Statistics */}
      <Row gutter={16} style={{ marginBottom: "24px" }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Analisis"
              value={summaryStats.totalAnalysis}
              prefix={<BarChartOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Rata-rata Pass Rate"
              value={summaryStats.avgPassRate}
              suffix="%"
              prefix={<TrophyOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
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
        <Col span={6}>
          <Card>
            <Statistic
              title="Analisis Selesai"
              value={summaryStats.completedAnalysis}
              prefix={<UsergroupAddOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Analysis Table */}
      <Card title="Daftar Analisis Ujian">
        <Table
          columns={columns}
          dataSource={analysisData}
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} dari ${total} analisis`,
          }}
          onChange={handleTableChange}
          rowKey={(record) => record.idAnalysis || record.key}
          scroll={{ x: 1000 }}
        />
      </Card>
    </div>
  );
};

export default UjianAnalysis;
