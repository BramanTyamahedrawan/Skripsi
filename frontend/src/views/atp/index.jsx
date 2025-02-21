/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from "react";
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
} from "antd";
import {
  UploadOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { getATP, deleteATP, editATP, addATP } from "@/api/atp";
import TypingCard from "@/components/TypingCard";
import EditATPForm from "./forms/edit-atp-form";
import AddATPForm from "./forms/add-atp-form";
import { read, utils } from "xlsx";

const { Column } = Table;

const ATP = () => {
  const [atp, setATP] = useState([]);
  const [editATPModalVisible, setEditATPModalVisible] = useState(false);
  const [editATPModalLoading, setEditATPModalLoading] = useState(false);
  const [currentRowData, setCurrentRowData] = useState({});
  const [addATPModalVisible, setAddATPModalVisible] = useState(false);
  const [addATPModalLoading, setAddATPModalLoading] = useState(false);
  const [importedData, setImportedData] = useState([]);
  const [columnTitles, setColumnTitles] = useState([]);
  const [fileName, setFileName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [columnMapping, setColumnMapping] = useState({});
  const [searchKeyword, setSearchKeyword] = useState("");
  const [tableLoading, setTableLoading] = useState(false);

  const editATPFormRef = useRef();
  const addATPFormRef = useRef();

  useEffect(() => {
    fetchATP();
  }, []);

  const fetchATP = async () => {
    setTableLoading(true);
    try {
      const result = await getATP();
      if (result.data.statusCode === 200) {
        setATP(result.data.content);
      } else {
        message.error("Gagal mengambil data");
      }
    } catch (error) {
      message.error("Terjadi kesalahan: " + error.message);
    } finally {
      setTableLoading(false);
    }
  };

  const handleDelete = (row) => {
    const { idAtp } = row;
    Modal.confirm({
      title: "Konfirmasi",
      content: "Apakah Anda yakin ingin menghapus data ini?",
      okText: "Ya",
      okType: "danger",
      cancelText: "Tidak",
      onOk: async () => {
        try {
          await deleteATP({ idAtp });
          message.success("Berhasil dihapus");
          fetchATP();
        } catch (error) {
          message.error("Gagal menghapus: " + error.message);
        }
      },
    });
  };

  const handleEditOk = async (values) => {
    setEditATPModalLoading(true);
    try {
      const updatedValues = {
        idAtp: values.idAtp,
        namaAtp: values.namaAtp,
        idAcp: values.idAcp,
        idElemen: values.idElemen,
        idKonsentrasi: values.id,
        idKelas: values.idKelas,
        idTahun: values.idTahun,
        idSemester: values.idSemester,
        idMapel: values.idMapel,
      };

      console.log("respon data", updatedValues);
      await editATP(updatedValues, currentRowData.idAtp);
      setEditATPModalVisible(false);
      setEditATPModalLoading(false);
      message.success("Berhasil mengubah");
      fetchATP();
    } catch (error) {
      setEditATPModalLoading(false);
      message.error("Gagal mengubah: " + error.message);
    }
  };

  const handleEditATP = (row) => {
    setCurrentRowData({ ...row });
    setEditATPModalVisible(true);
  };

  const handleCancel = () => {
    setEditATPModalVisible(false);
    setAddATPModalVisible(false);
  };

  const handleAddATP = () => {
    setAddATPModalVisible(true);
  };
  const handleAddOk = async (values) => {
    setAddATPModalLoading(true);
    try {
      const updatedValues = {
        idAtp: values.idAtp,
        namaAtp: values.namaAtp,
        idAcp: values.idAcp,
        idElemen: values.idElemen,
        idKonsentrasi: values.id,
        idKelas: values.idKelas,
        idTahun: values.idTahun,
        idSemester: values.idSemester,
        idMapel: values.idMapel,
      };
      console.log("respon data", updatedValues);
      await addATP(updatedValues);
      setAddATPModalVisible(false);
      setAddATPModalLoading(false);
      message.success("Berhasil menambahkan");
      fetchATP();
    } catch (error) {
      setAddATPModalLoading(false);
      message.error("Gagal menambahkan: " + error.message);
    }
  };

  const renderColumns = () => [
    {
      title: "No.",
      dataIndex: "index",
      key: "index",
      align: "center",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Tujuan Pembelajaran",
      dataIndex: "namaAtp",
      key: "namaAtp",
      align: "center",
    },
    {
      title: "Capaian Pembelajaran",
      dataIndex: ["acp", "namaAcp"],
      key: "namaAcp",
      align: "center",
    },
    {
      title: "Elemen",
      dataIndex: ["elemen", "namaElemen"],
      key: "namaElemen",
      align: "center",
    },
    {
      title: "Mata Pelajaran",
      dataIndex: ["mapel", "name"],
      key: "name",
      align: "center",
    },
    {
      title: "Tahun Ajaran",
      dataIndex: ["tahunAjaran", "tahunAjaran"],
      key: "tahunAjaran",
      align: "center",
    },
    {
      title: "Semester",
      dataIndex: ["semester", "namaSemester"],
      key: "namaSemester",
      align: "center",
    },
    {
      title: "Kelas",
      dataIndex: ["kelas", "namaKelas"],
      key: "namaKelas",
      align: "center",
    },
    {
      title: "Konsentrasi Keahlian",
      dataIndex: ["konsentrasiKeahlian", "konsentrasi"],
      key: "konsentrasi",
      align: "center",
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
            onClick={() => handleEditATP(row)}
          />
          <Divider type="vertical" />
          <Button
            type="primary"
            danger
            shape="circle"
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(row)}
          />
        </span>
      ),
    },
  ];

  const renderTable = () => (
    <Table
      rowKey="id"
      dataSource={atp}
      columns={renderColumns()}
      pagination={{ pageSize: 10 }}
    />
  );

  const renderButtons = () => (
    <Row gutter={[16, 16]} justify="start">
      <Col>
        <Button type="primary" onClick={() => setAddATPModalVisible(true)}>
          Tambahkan ATP
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
        title="Manajemen Analisa Tujuan Pembelajaran"
        source="Di sini, Anda dapat mengelola Analisa Tujuan Pembelajaran di sistem."
      />
      <br />
      <Card title={renderButtons()}>{renderTable()}</Card>

      <AddATPForm
        wrappedComponentRef={addATPFormRef}
        visible={addATPModalVisible}
        confirmLoading={addATPModalLoading}
        onCancel={handleCancel}
        onOk={handleAddOk}
      />

      <EditATPForm
        wrappedComponentRef={editATPFormRef}
        currentRowData={currentRowData}
        visible={editATPModalVisible}
        confirmLoading={editATPModalLoading}
        onCancel={handleCancel}
        onOk={handleEditOk}
      />

      <Modal
        title="Import File"
        visible={importModalVisible}
        onCancel={() => setImportModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setImportModalVisible(false)}>
            Cancel
          </Button>,
          <Button
            key="upload"
            type="primary"
            loading={uploading}
            onClick={() => {
              /* Implementasi Upload */
            }}
          >
            Upload
          </Button>,
        ]}
      >
        <Upload
          beforeUpload={() => {
            /* Implementasi File Upload */ return false;
          }}
          accept=".csv,.xlsx,.xls"
        >
          <Button>Pilih File</Button>
        </Upload>
      </Modal>
    </div>
  );
};

export default ATP;
