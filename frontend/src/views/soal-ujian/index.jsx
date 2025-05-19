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
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  SearchOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import {
  getSoalUjian,
  deleteSoalUjian,
  addSoalUjian,
  editSoalUjian,
} from "@/api/soalUjian";
import { Skeleton } from "antd";
import Highlighter from "react-highlight-words";
import TypingCard from "@/components/TypingCard";
import AddSoalUjianForm from "./forms/add-soal-ujian-form";
import EditSoalUjianForm from "./forms/edit-soal-ujian-form";
import { useTableSearch } from "@/helper/tableSearchHelper.jsx";
import { reqUserInfo, getUserById } from "@/api/user";

const SoalUjian = () => {
  const [soalUjians, setSoalUjians] = useState([]);
  const [addSoalUjianModalVisible, setAddSoalUjianModalVisible] =
    useState(false);
  const [addSoalUjianModalLoading, setAddSoalUjianModalLoading] =
    useState(false);
  const [editSoalUjianModalVisible, setEditSoalUjianModalVisible] =
    useState(false);
  const [editSoalUjianModalLoading, setEditSoalUjianModalLoading] =
    useState(false);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [currentRowData, setCurrentRowData] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [filteredData, setFilteredData] = useState([]);

  // Fungsi Helper Table Search
  const { getColumnSearchProps } = useTableSearch();

  const editSoalUjianFormRef = useRef();

  // Filter soal ujian berdasarkan search query
  useEffect(() => {
    if (searchQuery) {
      const filtered = soalUjians.filter(
        (item) =>
          item.namaUjian?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.pertanyaan?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredData(filtered);
    } else {
      setFilteredData(soalUjians);
    }
  }, [searchQuery, soalUjians]);

  const fetchSoalUjians = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getSoalUjian();
      const { content, statusCode } = result.data;
      if (statusCode === 200) {
        setSoalUjians(content);
        setFilteredData(content);
      } else {
        message.error("Gagal mengambil data");
      }
    } catch (error) {
      message.error("Terjadi kesalahan: " + error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSoalUjians();
  }, [fetchSoalUjians]);

  const handleDeleteSoalUjian = (row) => {
    const { idSoalUjian } = row;
    Modal.confirm({
      title: "Konfirmasi",
      content: "Apakah Anda yakin ingin menghapus data ini?",
      okText: "Ya",
      okType: "danger",
      cancelText: "Tidak",
      onOk: async () => {
        try {
          await deleteSoalUjian({ idSoalUjian });
          message.success("Berhasil dihapus");
          fetchSoalUjians();
        } catch (error) {
          message.error("Gagal menghapus: " + error.message);
        }
      },
    });
  };

  const handlePreviewSoalUjian = (row) => {
    setPreviewData(row);
    setPreviewModalVisible(true);
  };

  const handleEditSoalUjian = (row) => {
    setCurrentRowData({ ...row });
    setEditSoalUjianModalVisible(true);
  };

  const handleAddSoalUjianOk = async (values) => {
    setAddSoalUjianModalLoading(true);
    try {
      // Gunakan values langsung dari form AddSoalUjianForm
      await addSoalUjian(values);
      setAddSoalUjianModalVisible(false);
      message.success("Berhasil menambahkan soal ujian");
      fetchSoalUjians();
    } catch (error) {
      message.error("Gagal menambahkan: " + error.message);
    } finally {
      setAddSoalUjianModalLoading(false);
    }
  };

  const handleEditSoalUjianOk = async (values) => {
    setEditSoalUjianModalLoading(true);
    try {
      await editSoalUjian(values, currentRowData.idSoalUjian);
      setEditSoalUjianModalVisible(false);
      message.success("Berhasil mengedit");
      fetchSoalUjians();
    } catch (error) {
      message.error("Gagal mengedit: " + error.message);
    } finally {
      setEditSoalUjianModalLoading(false);
    }
  };

  const handleCancel = () => {
    setAddSoalUjianModalVisible(false);
    setEditSoalUjianModalVisible(false);
    setPreviewModalVisible(false);
  };

  // Render tag untuk jenis soal dengan warna yang berbeda
  const renderJenisSoalTag = (jenisSoal) => {
    let color = "blue";
    let text = "Pilihan Ganda";

    switch (jenisSoal) {
      case "PG":
        color = "blue";
        text = "Pilihan Ganda";
        break;
      case "MULTI":
        color = "green";
        text = "Multi Jawaban";
        break;
      case "COCOK":
        color = "orange";
        text = "Mencocokkan";
        break;
      case "ISIAN":
        color = "purple";
        text = "Isian";
        break;
      default:
        color = "default";
        text = jenisSoal || "Unknown";
    }

    return <Tag color={color}>{text}</Tag>;
  };

  const renderColumns = () => [
    {
      title: "No",
      dataIndex: "index",
      key: "index",
      align: "center",
      width: 70,
      render: (_, __, index) => index + 1,
    },
    {
      title: "Nama Ujian",
      dataIndex: "namaUjian",
      key: "namaUjian",
      align: "left",
      ...getColumnSearchProps("namaUjian"),
      sorter: (a, b) => (a.namaUjian || "").localeCompare(b.namaUjian || ""),
      render: (text) => (
        <Tooltip title={text}>
          <span>
            {text?.length > 30 ? `${text.substring(0, 30)}...` : text}
          </span>
        </Tooltip>
      ),
    },
    {
      title: "Pertanyaan",
      dataIndex: "pertanyaan",
      key: "pertanyaan",
      align: "left",
      ...getColumnSearchProps("pertanyaan"),
      render: (text) => (
        <Tooltip title={text}>
          <span>
            {text?.length > 40 ? `${text.substring(0, 40)}...` : text}
          </span>
        </Tooltip>
      ),
    },
    {
      title: "Jenis Soal",
      dataIndex: "jenisSoal",
      key: "jenisSoal",
      align: "center",
      width: 140,
      filters: [
        { text: "Pilihan Ganda", value: "PG" },
        { text: "Multi Jawaban", value: "MULTI" },
        { text: "Mencocokkan", value: "COCOK" },
        { text: "Isian", value: "ISIAN" },
      ],
      onFilter: (value, record) => record.jenisSoal === value,
      render: (jenisSoal) => renderJenisSoalTag(jenisSoal),
    },
    {
      title: "Bobot",
      dataIndex: "bobot",
      key: "bobot",
      align: "center",
      width: 90,
      sorter: (a, b) => Number(a.bobot) - Number(b.bobot),
    },
    {
      title: "Operasi",
      key: "action",
      align: "center",
      width: 150,
      render: (_, row) => (
        <Space>
          <Button
            type="primary"
            shape="circle"
            icon={<EyeOutlined />}
            onClick={() => handlePreviewSoalUjian(row)}
          />
          <Button
            type="primary"
            shape="circle"
            icon={<EditOutlined />}
            onClick={() => handleEditSoalUjian(row)}
          />
          <Button
            type="primary"
            danger
            shape="circle"
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteSoalUjian(row)}
          />
        </Space>
      ),
    },
  ];

  const renderTable = () => (
    <Table
      rowKey="idSoalUjian"
      dataSource={filteredData}
      columns={renderColumns()}
      pagination={{ pageSize: 10 }}
      loading={loading}
    />
  );

  const renderButtons = () => (
    <Row gutter={[16, 16]} justify="start">
      <Col>
        <Button
          type="primary"
          onClick={() => setAddSoalUjianModalVisible(true)}
        >
          Tambah Soal Ujian
        </Button>
      </Col>
      <Col>
        <Button
          icon={<UploadOutlined />}
          onClick={() => setImportModalVisible(true)}
        >
          Import File
        </Button>
      </Col>
    </Row>
  );

  // Fungsi untuk merender detail soal dalam preview
  const renderPreviewContent = () => {
    if (!previewData) return null;

    return (
      <div>
        <h3>{previewData.namaUjian}</h3>
        <p>
          <strong>Pertanyaan:</strong> {previewData.pertanyaan}
        </p>
        <p>
          <strong>Jenis Soal:</strong>{" "}
          {renderJenisSoalTag(previewData.jenisSoal)}
        </p>
        <p>
          <strong>Bobot:</strong> {previewData.bobot}
        </p>

        {/* Render options based on question type */}
        {(previewData.jenisSoal === "PG" ||
          previewData.jenisSoal === "MULTI") &&
          previewData.opsi && (
            <div>
              <p>
                <strong>Pilihan:</strong>
              </p>
              <ul>
                {Object.entries(previewData.opsi).map(([key, value]) => (
                  <li key={key}>
                    {key}: {value}
                    {previewData.jawabanBenar &&
                      previewData.jawabanBenar.includes(key) && (
                        <Tag color="green" style={{ marginLeft: 8 }}>
                          Jawaban Benar
                        </Tag>
                      )}
                  </li>
                ))}
              </ul>
            </div>
          )}

        {previewData.jenisSoal === "COCOK" && previewData.pasangan && (
          <div>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <p>
                  <strong>Sisi Kiri:</strong>
                </p>
                <ul>
                  {Object.entries(previewData.pasangan)
                    .filter(([key]) => key.includes("_kiri"))
                    .map(([key, value]) => (
                      <li key={key}>{value}</li>
                    ))}
                </ul>
              </Col>
              <Col span={12}>
                <p>
                  <strong>Sisi Kanan:</strong>
                </p>
                <ul>
                  {Object.entries(previewData.pasangan)
                    .filter(([key]) => key.includes("_kanan"))
                    .map(([key, value]) => (
                      <li key={key}>{value}</li>
                    ))}
                </ul>
              </Col>
            </Row>
            <Divider />
            <p>
              <strong>Pasangan Benar:</strong>
            </p>
            <ul>
              {previewData.jawabanBenar &&
                previewData.jawabanBenar.map((pair, index) => {
                  const [kiri, kanan] = pair.split("=");
                  const kiriValue = previewData.pasangan[kiri];
                  const kananValue = previewData.pasangan[kanan];
                  return (
                    <li key={index}>
                      {kiriValue} - {kananValue}
                    </li>
                  );
                })}
            </ul>
          </div>
        )}

        {previewData.jenisSoal === "ISIAN" && (
          <div>
            <p>
              <strong>Jawaban Benar:</strong>{" "}
              {previewData.jawabanBenar && previewData.jawabanBenar.join(", ")}
            </p>
            {previewData.toleransiTypo !== undefined && (
              <p>
                <strong>Toleransi Typo:</strong> {previewData.toleransiTypo}
              </p>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="app-container">
      <TypingCard
        title="Manajemen Soal Ujian"
        source="Di sini, Anda dapat mengelola soal ujian di sistem. Tambahkan, edit, atau hapus soal ujian sesuai kebutuhan."
      />
      <br />
      {loading ? (
        <Card>
          <Skeleton active paragraph={{ rows: 10 }} />
        </Card>
      ) : (
        <Card style={{ overflowX: "scroll" }}>
          {/* Baris untuk tombol dan pencarian */}
          <Row
            justify="space-between"
            align="middle"
            style={{ marginBottom: 16 }}
          >
            {/* Tombol Tambah & Import */}
            {renderButtons()}

            {/* Kolom Pencarian */}
            <Col>
              <Input.Search
                key="search"
                placeholder="Cari soal ujian..."
                allowClear
                enterButton
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: 300 }}
              />
            </Col>
          </Row>

          {/* Tabel */}
          {renderTable()}

          {/* Modal untuk tambah soal ujian */}
          <AddSoalUjianForm
            visible={addSoalUjianModalVisible}
            confirmLoading={addSoalUjianModalLoading}
            onCancel={handleCancel}
            onOk={handleAddSoalUjianOk}
          />

          {/* Modal untuk edit soal ujian */}
          {/* <EditSoalUjianForm
          wrappedComponentRef={editSoalUjianFormRef}
          currentRowData={currentRowData}
          visible={editSoalUjianModalVisible}
          confirmLoading={editSoalUjianModalLoading}
          onCancel={handleCancel}
          onOk={handleEditSoalUjianOk}
        /> */}

          {/* Modal untuk preview soal ujian */}
          <Modal
            title="Detail Soal Ujian"
            open={previewModalVisible}
            onCancel={handleCancel}
            footer={[
              <Button key="close" onClick={handleCancel}>
                Tutup
              </Button>,
            ]}
            width={700}
          >
            {renderPreviewContent()}
          </Modal>
        </Card>
      )}

      {/* Modal untuk import file */}
      <Modal
        title="Import File"
        open={importModalVisible}
        onCancel={() => setImportModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setImportModalVisible(false)}>
            Batal
          </Button>,
          <Button
            key="upload"
            type="primary"
            loading={uploading}
            onClick={() => {}}
          >
            Upload
          </Button>,
        ]}
      >
        <Upload beforeUpload={() => false} accept=".csv,.xlsx,.xls">
          <Button icon={<UploadOutlined />}>Pilih File</Button>
        </Upload>
      </Modal>
    </div>
  );
};

export default SoalUjian;
