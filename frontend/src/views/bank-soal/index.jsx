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
  Tooltip,
  Tag,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { getBankSoal, deleteBankSoal, addBankSoal } from "@/api/bankSoal";
import { Skeleton } from "antd";
import Highlighter from "react-highlight-words";
import TypingCard from "@/components/TypingCard";
import AddBankSoalForm from "./forms/add-bank-soal-form";
// import EditBankSoalForm from "./forms/edit-bankSoal-form";
import { useTableSearch } from "@/helper/tableSearchHelper.jsx";
import { reqUserInfo, getUserById } from "@/api/user";
import { set } from "nprogress";

const BankSoal = () => {
  const [bankSoals, setBankSoals] = useState([]);
  const [addBankSoalModalVisible, setAddBankSoalModalVisible] = useState(false);
  const [addBankSoalModalLoading, setAddBankSoalModalLoading] = useState(false);
  const [editBankSoalModalVisible, setEditBankSoalModalVisible] =
    useState(false);
  const [editBankSoalModalLoading, setEditBankSoalModalLoading] =
    useState(false);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [currentRowData, setCurrentRowData] = useState({});
  const [searchKeyword, setSearchKeyword] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Fungsi Helper Table Search
  const { getColumnSearchProps } = useTableSearch();

  const editBankSoalFormRef = useRef();
  const addBankSoalFormRef = useRef();

  const fetchBankSoals = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getBankSoal();
      const { content, statusCode } = result.data;
      if (statusCode === 200) {
        setBankSoals(content);
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
    fetchBankSoals();
  }, [fetchBankSoals]);

  const handleDeleteBankSoal = (row) => {
    const { idBankSoal } = row;
    Modal.confirm({
      title: "Konfirmasi",
      content: "Apakah Anda yakin ingin menghapus data ini?",
      okText: "Ya",
      okType: "danger",
      cancelText: "Tidak",
      onOk: async () => {
        try {
          await deleteBankSoal({ idBankSoal });
          message.success("Berhasil dihapus");
          fetchBankSoals();
        } catch (error) {
          message.error("Gagal menghapus: " + error.message);
        }
      },
    });
  };

  const handleEditBankSoal = (row) => {
    setCurrentRowData({ ...row });
    setEditBankSoalModalVisible(true);
  };

  const handleAddBankSoalOk = async (values) => {
    setAddBankSoalModalLoading(true);
    try {
      console.log("Data Bank Soal", values);
      await addBankSoal(values);
      setAddBankSoalModalVisible(false);
      message.success("Berhasil menambahkan");
      fetchBankSoals();
    } catch (error) {
      setAddBankSoalModalVisible(false);
      message.error("Gagal menambahkan: " + error.message);
    } finally {
      setAddBankSoalModalLoading(false);
    }
  };

  //   const handleEditBankSoalOk = async (values) => {
  //     setEditBankSoalModalLoading(true);
  //     try {
  //       const updatedData = {
  //         // idBankSoal: values.idBankSoal,
  //         // namaBankSoal: values.namaBankSoal,
  //         // deskripsiBankSoal: values.deskripsiBankSoal,
  //         // idSekolah: values.idSchool,
  //       };
  //       console.log("Updated Data:", updatedData);
  //       await editBankSoal(updatedData, currentRowData.idBankSoal);
  //       setEditBankSoalModalVisible(false);
  //       message.success("Berhasil mengedit");
  //       fetchBankSoals();
  //     } catch (error) {
  //       setEditBankSoalModalVisible(false);
  //       message.error("Gagal mengedit: " + error.message);
  //     } finally {
  //       setEditBankSoalModalLoading(false);
  //     }
  //   };

  const handleCancel = () => {
    setAddBankSoalModalVisible(false);
    setEditBankSoalModalVisible(false);
  };

  const handleSearch = (keyword) => {
    setSearchKeyword(keyword);
    getBankSoal();
  };

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
      title: "mapel",
      dataIndex: ["mapel", "name"],
      key: "name",
      align: "center",
      ...getColumnSearchProps("name", "mapel.name"),
      sorter: (a, b) => a.mapel.name.localeCompare(b.mapel.name),
    },
    {
      title: "ATP",
      dataIndex: ["atp", "namaAtp"],
      key: "namaAtp",
      align: "center",
      ...getColumnSearchProps("namaAtp", "atp.namaAtp"),
      sorter: (a, b) => a.atp.namaAtp.localeCompare(b.atp.namaAtp),
    },
    {
      title: "Operasi",
      key: "action",
      align: "center",
      render: (_, row) => (
        <span>
          <Button
            type="primary"
            shape="circle"
            icon={<EditOutlined />}
            onClick={() => handleEditBankSoal(row)}
          />
          <Divider type="vertical" />
          <Button
            type="primary"
            danger
            shape="circle"
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteBankSoal(row)}
          />
        </span>
      ),
    },
  ];

  const renderTable = () => (
    <Table
      rowKey="idBankSoal"
      dataSource={bankSoals}
      columns={renderColumns()}
      pagination={{ pageSize: 10 }}
    />
  );

  const renderButtons = () => (
    <Row gutter={[16, 16]} justify="start">
      <Col>
        <Button type="primary" onClick={() => setAddBankSoalModalVisible(true)}>
          Tambahkan BankSoal
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

  return (
    <div className="app-container">
      <TypingCard
        title="Manajemen BankSoal"
        source="Di sini, Anda dapat mengelola bankSoal di sistem."
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
                placeholder="Cari bankSoal..."
                allowClear
                enterButton
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: 300 }}
              />
            </Col>
          </Row>

          {/* Tabel */}
          {renderTable()}

          <AddBankSoalForm
            wrappedComponentRef={addBankSoalFormRef}
            visible={addBankSoalModalVisible}
            confirmLoading={addBankSoalModalLoading}
            onCancel={handleCancel}
            onOk={handleAddBankSoalOk}
          />

          {/* <EditBankSoalForm
            wrappedComponentRef={editBankSoalFormRef}
            currentRowData={currentRowData}
            visible={editBankSoalModalVisible}
            confirmLoading={editBankSoalModalLoading}
            onCancel={handleCancel}
            onOk={handleEditBankSoalOk}
          /> */}
        </Card>
      )}

      <Modal
        title="Import File"
        open={importModalVisible}
        onCancel={() => setImportModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setImportModalVisible(false)}>
            Cancel
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
          <Button>Pilih File</Button>
        </Upload>
      </Modal>
    </div>
  );
};

export default BankSoal;
