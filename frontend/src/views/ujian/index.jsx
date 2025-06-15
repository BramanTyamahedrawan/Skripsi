/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Card,
  Button,
  Table,
  message,
  Upload,
  Row,
  Col,
  Divider,
  Modal,
  Input,
  Space,
  Tag,
  Tooltip,
  Badge,
  Descriptions,
  Typography,
  Popconfirm,
  Select,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  SearchOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  StopOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  SettingOutlined,
  UserOutlined,
  BookOutlined,
  ReloadOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import {
  getUjian,
  deleteUjian,
  addUjian,
  editUjian,
  activateUjian,
  startUjian,
  endUjian,
  cancelUjian,
  createAndActivateUjian,
  getUjianStatistics,
} from "@/api/ujian";
import { autoGenerateAnalysisForUjian } from "@/api/ujianAnalysis";
import { Skeleton } from "antd";
import Highlighter from "react-highlight-words";
import TypingCard from "@/components/TypingCard";
import AddUjianForm from "./forms/add-ujian-form";
// import EditUjianForm from "./forms/edit-ujian-form";
import { useTableSearch } from "@/helper/tableSearchHelper.jsx";
import { reqUserInfo, getUserById } from "@/api/user";
import moment from "moment";
import { useNavigate } from "react-router-dom";

const { Text, Title } = Typography;

const Ujian = () => {
  const [ujians, setUjians] = useState([]);
  const [addUjianModalVisible, setAddUjianModalVisible] = useState(false);
  const [addUjianModalLoading, setAddUjianModalLoading] = useState(false);
  const [editUjianModalVisible, setEditUjianModalVisible] = useState(false);
  const [editUjianModalLoading, setEditUjianModalLoading] = useState(false);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [currentRowData, setCurrentRowData] = useState({});
  const [searchKeyword, setSearchKeyword] = useState("");
  const [userIdJson, setUserIdJson] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statistics, setStatistics] = useState({});
  const [statusFilter, setStatusFilter] = useState("all");

  const navigate = useNavigate();

  // Fungsi Helper Table Search
  const { getColumnSearchProps } = useTableSearch();

  const editUjianFormRef = useRef();
  const addUjianFormRef = useRef();

  const fetchUjians = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getUjian();
      const { content, statusCode } = result.data;
      if (statusCode === 200) {
        setUjians(content);
      } else {
        message.error("Gagal mengambil data");
      }
    } catch (error) {
      message.error("Terjadi kesalahan: " + error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStatistics = useCallback(async () => {
    try {
      const result = await getUjianStatistics();
      if (result.data.success) {
        setStatistics(result.data.data);
      }
    } catch (error) {
      console.error("Gagal mengambil statistik:", error);
    }
  }, []);

  useEffect(() => {
    fetchUjians();
    fetchStatistics();

    // Auto refresh setiap 30 detik untuk ujian yang sedang berlangsung
    const interval = setInterval(() => {
      fetchUjians();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchUjians, fetchStatistics]);

  const handleDeleteUjian = (row) => {
    const { idUjian } = row;
    Modal.confirm({
      title: "Konfirmasi Hapus",
      content:
        "Apakah Anda yakin ingin menghapus ujian ini? Aksi ini tidak dapat dibatalkan.",
      okText: "Ya, Hapus",
      okType: "danger",
      cancelText: "Batal",
      onOk: async () => {
        try {
          await deleteUjian({ idUjian });
          message.success("Ujian berhasil dihapus");
          fetchUjians();
        } catch (error) {
          message.error("Gagal menghapus: " + error.message);
        }
      },
    });
  };

  const handleEditUjian = (row) => {
    setCurrentRowData({ ...row });
    setEditUjianModalVisible(true);
  };

  const handleViewDetail = (row) => {
    setCurrentRowData({ ...row });
    setDetailModalVisible(true);
  };

  const handleAddUjianOk = async (values) => {
    setAddUjianModalLoading(true);
    try {
      if (values.createAndActivate) {
        console.log("Creating and activating ujian with values:", values);
        await createAndActivateUjian(values);
        message.success("Ujian berhasil dibuat dan diaktifkan");
      } else {
        await addUjian(values);
        console.log("Adding ujian with values:", values);
        message.success("Ujian berhasil dibuat");
      }
      setAddUjianModalVisible(false);
      fetchUjians();
    } catch (error) {
      message.error("Gagal membuat ujian: " + error.message);
    } finally {
      setAddUjianModalLoading(false);
    }
  };

  const handleEditUjianOk = async (values) => {
    setEditUjianModalLoading(true);
    try {
      await editUjian(values, currentRowData.idUjian);
      setEditUjianModalVisible(false);
      message.success("Ujian berhasil diperbarui");
      fetchUjians();
    } catch (error) {
      message.error("Gagal memperbarui ujian: " + error.message);
    } finally {
      setEditUjianModalLoading(false);
    }
  };

  const handleCancel = () => {
    setAddUjianModalVisible(false);
    setEditUjianModalVisible(false);
    setDetailModalVisible(false);
  };

  // Fungsi untuk mengelola status ujian
  const handleActivateUjian = async (idUjian) => {
    try {
      await activateUjian(idUjian);
      message.success("Ujian berhasil diaktifkan");
      fetchUjians();
    } catch (error) {
      message.error("Gagal mengaktifkan ujian: " + error.message);
    }
  };

  const handleStartUjian = async (idUjian) => {
    try {
      await startUjian(idUjian);
      message.success("Ujian berhasil dimulai");
      fetchUjians();
    } catch (error) {
      message.error("Gagal memulai ujian: " + error.message);
    }
  };
  const handleEndUjian = async (idUjian) => {
    try {
      await endUjian(idUjian);
      message.success("Ujian berhasil diakhiri");

      // Auto-generate analysis when exam ends
      try {
        message.info("Generating final analysis...");
        await autoGenerateAnalysisForUjian(idUjian);
        message.success("Final analysis generated successfully");
      } catch (analysisError) {
        console.warn("Failed to generate analysis:", analysisError);
        message.warning(
          "Ujian berakhir, namun analisis belum dapat dibuat. Silakan coba lagi nanti."
        );
      }

      fetchUjians();
    } catch (error) {
      message.error("Gagal mengakhiri ujian: " + error.message);
    }
  };

  const handleCancelUjian = async (idUjian) => {
    try {
      await cancelUjian(idUjian);
      message.success("Ujian berhasil dibatalkan");
      fetchUjians();
    } catch (error) {
      message.error("Gagal membatalkan ujian: " + error.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "DRAFT":
        return "default";
      case "AKTIF":
        return "processing";
      case "BERLANGSUNG":
        return "success";
      case "SELESAI":
        return "success";
      case "DIBATALKAN":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusText = (ujian) => {
    const status = ujian.statusUjian;
    const isLive = ujian.isLive;

    if (status === "AKTIF" && isLive) {
      return "BERLANGSUNG";
    }
    return status;
  };

  // Filter ujian berdasarkan status
  const getFilteredUjians = () => {
    let filtered = ujians;

    if (statusFilter !== "all") {
      filtered = ujians.filter((ujian) => {
        const currentStatus = getStatusText(ujian);
        return currentStatus === statusFilter;
      });
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (ujian) =>
          ujian.namaUjian.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (ujian.pengaturan?.kodeUjian &&
            ujian.pengaturan.kodeUjian
              .toLowerCase()
              .includes(searchQuery.toLowerCase())) ||
          (ujian.deskripsi &&
            ujian.deskripsi.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    return filtered;
  };

  // Handler untuk lihat analisis
  const handleViewAnalysis = (row) => {
    navigate(`/ujian-analysis/${row.idUjian}`);
  };

  // Render action buttons berdasarkan status ujian
  const renderActionButtons = (record) => {
    const status = record.statusUjian;
    const isLive = record.isLive;
    const currentTime = moment();
    const scheduledStart = moment(record.waktuMulaiDijadwalkan);
    const scheduledEnd = record.waktuSelesaiOtomatis
      ? moment(record.waktuSelesaiOtomatis)
      : null;

    const buttons = [];

    // View Detail button - always available
    buttons.push(
      <Tooltip key="view" title="Lihat Detail">
        <Button
          type="primary"
          ghost
          size="small"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetail(record)}
        />
      </Tooltip>
    );

    // Edit button - only for DRAFT status
    if (status === "DRAFT") {
      buttons.push(
        <Tooltip key="edit" title="Edit Ujian">
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditUjian(record)}
          />
        </Tooltip>
      );
    }

    // Status management buttons
    if (status === "DRAFT") {
      buttons.push(
        <Tooltip key="activate" title="Aktifkan Ujian">
          <Button
            type="primary"
            size="small"
            icon={<PlayCircleOutlined />}
            onClick={() => handleActivateUjian(record.idUjian)}
            style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
          />
        </Tooltip>
      );
    } else if (status === "AKTIF" && !isLive) {
      buttons.push(
        <Tooltip key="start" title="Mulai Ujian">
          <Button
            type="primary"
            size="small"
            icon={<PlayCircleOutlined />}
            onClick={() => handleStartUjian(record.idUjian)}
            style={{ backgroundColor: "#1890ff", borderColor: "#1890ff" }}
          />
        </Tooltip>
      );
    } else if (status === "AKTIF" && isLive) {
      buttons.push(
        <Tooltip key="end" title="Akhiri Ujian">
          <Button
            type="primary"
            danger
            size="small"
            icon={<StopOutlined />}
            onClick={() => handleEndUjian(record.idUjian)}
          />
        </Tooltip>
      );
    }

    // Cancel button - available for DRAFT and AKTIF
    if (status === "DRAFT" || status === "AKTIF") {
      buttons.push(
        <Popconfirm
          key="cancel"
          title="Batalkan ujian ini?"
          description="Ujian yang dibatalkan tidak dapat diaktifkan kembali."
          onConfirm={() => handleCancelUjian(record.idUjian)}
          okText="Ya, Batalkan"
          cancelText="Tidak"
        >
          <Tooltip title="Batalkan Ujian">
            <Button danger size="small" icon={<StopOutlined />} />
          </Tooltip>
        </Popconfirm>
      );
    }

    // Delete button - only for DRAFT and DIBATALKAN
    if (status === "DRAFT" || status === "DIBATALKAN") {
      buttons.push(
        <Tooltip key="delete" title="Hapus Ujian">
          <Button
            type="primary"
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteUjian(record)}
          />
        </Tooltip>
      );
    }

    // Tombol Lihat Analisis - hanya untuk ujian selesai
    if (getStatusText(record) === "SELESAI") {
      buttons.push(
        <Tooltip key="analysis" title="Lihat Analisis Ujian">
          <Button
            type="default"
            size="small"
            icon={<BarChartOutlined />}
            onClick={() => handleViewAnalysis(record)}
            style={{ backgroundColor: "#f0f5ff", borderColor: "#adc6ff" }}
          >
            Analisis
          </Button>
        </Tooltip>
      );
    }

    return <Space size="small">{buttons}</Space>;
  };

  // Kolom tabel
  const columns = [
    {
      title: "No",
      dataIndex: "index",
      key: "index",
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: "Nama Ujian",
      dataIndex: "namaUjian",
      key: "namaUjian",
      ...getColumnSearchProps("namaUjian"),
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: "bold" }}>{text}</div>
          <div style={{ fontSize: "12px", color: "#666" }}>
            Kode: {record.pengaturan?.kodeUjian || "Tidak ada kode"}
          </div>
        </div>
      ),
    },
    {
      title: "Waktu",
      key: "waktu",
      width: 200,
      render: (_, record) => (
        <div>
          <div style={{ fontSize: "12px" }}>
            <ClockCircleOutlined /> Mulai:{" "}
            {moment(record.waktuMulaiDijadwalkan).format("DD/MM/YY HH:mm")}
          </div>
          {record.waktuSelesaiOtomatis && (
            <div style={{ fontSize: "12px" }}>
              <ClockCircleOutlined /> Selesai:{" "}
              {moment(record.waktuSelesaiOtomatis).format("DD/MM/YY HH:mm")}
            </div>
          )}
          <div style={{ fontSize: "12px", color: "#666" }}>
            Durasi: {record.durasiMenit} menit
          </div>
        </div>
      ),
    },
    {
      title: "Status",
      key: "status",
      width: 120,
      filters: [
        { text: "Draft", value: "DRAFT" },
        { text: "Aktif", value: "AKTIF" },
        { text: "Berlangsung", value: "BERLANGSUNG" },
        { text: "Selesai", value: "SELESAI" },
        { text: "Dibatalkan", value: "DIBATALKAN" },
      ],
      onFilter: (value, record) => getStatusText(record) === value,
      render: (_, record) => {
        const status = getStatusText(record);
        return <Tag color={getStatusColor(record.statusUjian)}>{status}</Tag>;
      },
    },
    {
      title: "Bank Soal",
      key: "bankSoal",
      width: 100,
      render: (_, record) => (
        <div style={{ textAlign: "center" }}>
          <Badge
            count={record.idBankSoalList ? record.idBankSoalList.length : 0}
            showZero
          >
            <BookOutlined style={{ fontSize: "16px" }} />
          </Badge>
          <div style={{ fontSize: "10px", color: "#666" }}>
            {record.jumlahSoal || 0} soal
          </div>
        </div>
      ),
    },
    {
      title: "Peserta",
      key: "peserta",
      width: 100,
      render: (_, record) => (
        <div style={{ textAlign: "center" }}>
          <Badge count={record.jumlahPeserta || 0} showZero>
            <UserOutlined style={{ fontSize: "16px" }} />
          </Badge>
          <div style={{ fontSize: "10px", color: "#666" }}>
            {record.jumlahSelesai || 0} selesai
          </div>
        </div>
      ),
    },
    {
      title: "Aksi",
      key: "action",
      width: 200,
      render: (_, record) => renderActionButtons(record),
    },
  ];

  // Statistik cards
  const StatisticsCards = () => (
    <Row gutter={16} style={{ marginBottom: 24 }}>
      <Col xs={24} sm={12} md={6}>
        <Card>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div
              style={{
                background: "#f0f0f0",
                borderRadius: "50%",
                padding: "12px",
                marginRight: "12px",
              }}
            >
              <BookOutlined style={{ fontSize: "24px", color: "#1890ff" }} />
            </div>
            <div>
              <div style={{ fontSize: "24px", fontWeight: "bold" }}>
                {statistics.totalUjian || 0}
              </div>
              <div style={{ color: "#666" }}>Total Ujian</div>
            </div>
          </div>
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div
              style={{
                background: "#f6ffed",
                borderRadius: "50%",
                padding: "12px",
                marginRight: "12px",
              }}
            >
              <PlayCircleOutlined
                style={{ fontSize: "24px", color: "#52c41a" }}
              />
            </div>
            <div>
              <div style={{ fontSize: "24px", fontWeight: "bold" }}>
                {statistics.aktifCount || 0}
              </div>
              <div style={{ color: "#666" }}>Ujian Aktif</div>
            </div>
          </div>
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div
              style={{
                background: "#fff2e8",
                borderRadius: "50%",
                padding: "12px",
                marginRight: "12px",
              }}
            >
              <ClockCircleOutlined
                style={{ fontSize: "24px", color: "#fa8c16" }}
              />
            </div>
            <div>
              <div style={{ fontSize: "24px", fontWeight: "bold" }}>
                {statistics.liveCount || 0}
              </div>
              <div style={{ color: "#666" }}>Berlangsung</div>
            </div>
          </div>
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div
              style={{
                background: "#f6ffed",
                borderRadius: "50%",
                padding: "12px",
                marginRight: "12px",
              }}
            >
              <CheckCircleOutlined
                style={{ fontSize: "24px", color: "#52c41a" }}
              />
            </div>
            <div>
              <div style={{ fontSize: "24px", fontWeight: "bold" }}>
                {statistics.selesaiCount || 0}
              </div>
              <div style={{ color: "#666" }}>Selesai</div>
            </div>
          </div>
        </Card>
      </Col>
    </Row>
  );

  const filteredUjians = getFilteredUjians();

  return (
    <div>
      <TypingCard
        title="Manajemen Ujian CAT"
        source="Sistem ujian computer-based test terintegrasi dengan bank soal dan monitoring real-time"
      />

      <StatisticsCards />

      <Card>
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={8} md={6}>
            <Button
              type="primary"
              icon={<SettingOutlined />}
              onClick={() => setAddUjianModalVisible(true)}
              style={{ width: "100%" }}
            >
              Tambah Ujian
            </Button>
          </Col>
          <Col xs={24} sm={8} md={6}>
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchUjians}
              style={{ width: "100%" }}
            >
              Refresh
            </Button>
          </Col>
          <Col xs={24} sm={8} md={6}>
            <Input
              placeholder="Cari ujian..."
              prefix={<SearchOutlined />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={8} md={6}>
            <Select
              style={{ width: "100%" }}
              value={statusFilter}
              onChange={setStatusFilter}
              placeholder="Filter Status"
            >
              <Select.Option value="all">Semua Status</Select.Option>
              <Select.Option value="DRAFT">Draft</Select.Option>
              <Select.Option value="AKTIF">Aktif</Select.Option>
              <Select.Option value="BERLANGSUNG">Berlangsung</Select.Option>
              <Select.Option value="SELESAI">Selesai</Select.Option>
              <Select.Option value="DIBATALKAN">Dibatalkan</Select.Option>
            </Select>
          </Col>
        </Row>

        <Table
          dataSource={filteredUjians}
          columns={columns}
          loading={loading}
          rowKey="idUjian"
          pagination={{
            total: filteredUjians.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} dari ${total} ujian`,
          }}
          scroll={{ x: 1200 }}
          size="middle"
        />
      </Card>

      {/* Modal Add Ujian */}
      <AddUjianForm
        visible={addUjianModalVisible}
        onCancel={handleCancel}
        onOk={handleAddUjianOk}
        confirmLoading={addUjianModalLoading}
        ref={addUjianFormRef}
      />

      {/* Modal Edit Ujian */}
      {/* <EditUjianForm
        visible={editUjianModalVisible}
        onCancel={handleCancel}
        onOk={handleEditUjianOk}
        confirmLoading={editUjianModalLoading}
        currentRowData={currentRowData}
        ref={editUjianFormRef}
      /> */}

      {/* Modal Detail */}
      <Modal
        title="Detail Ujian"
        open={detailModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={800}
      >
        {currentRowData && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Nama Ujian" span={2}>
              {currentRowData.namaUjian}
            </Descriptions.Item>
            <Descriptions.Item label="Kode Ujian">
              {currentRowData.pengaturan?.kodeUjian || "Tidak ada kode"}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={getStatusColor(currentRowData.statusUjian)}>
                {getStatusText(currentRowData)}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Waktu Mulai">
              {moment(currentRowData.waktuMulaiDijadwalkan).format(
                "DD MMMM YYYY, HH:mm"
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Waktu Selesai">
              {currentRowData.waktuSelesaiOtomatis
                ? moment(currentRowData.waktuSelesaiOtomatis).format(
                    "DD MMMM YYYY, HH:mm"
                  )
                : "Tidak ditentukan"}
            </Descriptions.Item>
            <Descriptions.Item label="Durasi">
              {currentRowData.durasiMenit} menit
            </Descriptions.Item>
            <Descriptions.Item label="Jumlah Soal">
              {currentRowData.jumlahSoal || 0} soal
            </Descriptions.Item>
            <Descriptions.Item label="Bank Soal">
              {currentRowData.idBankSoalList
                ? currentRowData.idBankSoalList.length
                : 0}{" "}
              bank soal
            </Descriptions.Item>
            <Descriptions.Item label="Peserta Terdaftar">
              {currentRowData.jumlahPeserta || 0} peserta
            </Descriptions.Item>
            <Descriptions.Item label="Deskripsi" span={2}>
              {currentRowData.deskripsi || "Tidak ada deskripsi"}
            </Descriptions.Item>
            <Descriptions.Item label="Pengaturan Waktu" span={2}>
              <div>
                {currentRowData.isFlexibleTiming && (
                  <Tag color="blue">Waktu Fleksibel</Tag>
                )}
                {currentRowData.allowLateStart && (
                  <Tag color="orange">Izin Terlambat</Tag>
                )}
                {currentRowData.isAutoStart && (
                  <Tag color="green">Auto Start</Tag>
                )}
                {currentRowData.isAutoEnd && <Tag color="red">Auto End</Tag>}
              </div>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default Ujian;
