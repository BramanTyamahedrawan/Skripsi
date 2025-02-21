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
} from "antd";
import {
  UploadOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { getACP, deleteACP, editACP, addACP } from "@/api/acp";
import TypingCard from "@/components/TypingCard";
import EditACPForm from "./forms/edit-acp-form";
import AddACPForm from "./forms/add-acp-form";
import { read, utils } from "xlsx";

const ACP = () => {
  const [acp, setACP] = useState([]);
  const [editACPModalVisible, setEditACPModalVisible] = useState(false);
  const [editACPModalLoading, setEditACPModalLoading] = useState(false);
  const [currentRowData, setCurrentRowData] = useState({});
  const [addACPModalVisible, setAddACPModalVisible] = useState(false);
  const [addACPModalLoading, setAddACPModalLoading] = useState(false);
  const [importedData, setImportedData] = useState([]);
  const [columnTitles, setColumnTitles] = useState([]);
  const [fileName, setFileName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [columnMapping, setColumnMapping] = useState({});
  const [tableLoading, setTableLoading] = useState(false);

  const editACPFormRef = useRef(null);
  const addACPFormRef = useRef(null);

  useEffect(() => {
    fetchACP();
  }, []);

  const fetchACP = async () => {
    setTableLoading(true);
    try {
      const result = await getACP();
      if (result.data.statusCode === 200) {
        setACP(result.data.content);
      } else {
        message.error("Gagal mengambil data");
      }
    } catch (error) {
      message.error("Terjadi kesalahan: " + error.message);
    } finally {
      setTableLoading(false);
    }
  };

  const handleEditACP = (row) => {
    setCurrentRowData({ ...row });
    setEditACPModalVisible(true);
  };

  const handleCancel = () => {
    setEditACPModalVisible(false);
    setAddACPModalVisible(false);
  };

  const handleAddACP = () => {
    setAddACPModalVisible(true);
  };

  const handleDelete = (row) => {
    const { idAcp } = row;
    Modal.confirm({
      title: "Konfirmasi",
      content: "Apakah Anda yakin ingin menghapus data ini?",
      okText: "Ya",
      okType: "danger",
      cancelText: "Tidak",
      onOk: async () => {
        try {
          await deleteACP({ idAcp });
          message.success("Berhasil dihapus");
          fetchACP();
        } catch (error) {
          message.error("Gagal menghapus: " + error.message);
        }
      },
    });
  };

  const handleAddOk = async (values) => {
    setAddACPModalLoading(true);
    try {
      const updatedValues = {
        idAcp: values.idAcp,
        namaAcp: values.namaAcp,
        idElemen: values.idElemen,
        idKonsentrasi: values.id,
        idKelas: values.idKelas,
        idTahun: values.idTahun,
        idSemester: values.idSemester,
        idMapel: values.idMapel,
      };
      console.log("respon data", updatedValues);
      await addACP(updatedValues);
      setAddACPModalVisible(false);
      setAddACPModalLoading(false);
      message.success("Berhasil menambahkan");
      fetchACP();
    } catch (error) {
      setAddACPModalLoading(false);
      message.error("Gagal menambahkan: " + error.message);
    }
  };

  const handleEditOk = async (values) => {
    setEditACPModalLoading(true);
    try {
      const updatedValues = {
        idAcp: values.idAcp,
        namaAcp: values.namaAcp,
        idElemen: values.idElemen,
        idKonsentrasi: values.id,
        idKelas: values.idKelas,
        idTahun: values.idTahun,
        idSemester: values.idSemester,
        idMapel: values.idMapel,
      };

      console.log("respon data", updatedValues);
      await editACP(updatedValues, currentRowData.idAcp);
      setEditACPModalVisible(false);
      setEditACPModalLoading(false);
      message.success("Berhasil mengubah");
      fetchACP();
    } catch (error) {
      setEditACPModalLoading(false);
      message.error("Gagal mengubah: " + error.message);
    }
  };

  // const handleFileImport = (file) => {
  //   const reader = new FileReader();
  //   reader.onload = (e) => {
  //     try {
  //       const data = new Uint8Array(e.target.result);
  //       const workbook = read(data, { type: "array" });
  //       const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  //       const jsonData = utils.sheet_to_json(worksheet, { header: 1 });

  //       if (jsonData.length < 2) {
  //         message.error("File tidak memiliki data yang valid");
  //         return;
  //       }

  //       setImportedData(jsonData.slice(1)); // Data tanpa header
  //       setColumnTitles(jsonData[0]); // Header kolom
  //       setFileName(file.name.toLowerCase());

  //       const newColumnMapping = {};
  //       jsonData[0].forEach((title, index) => {
  //         newColumnMapping[title] = index;
  //       });

  //       setColumnMapping(newColumnMapping);
  //     } catch (error) {
  //       message.error("Gagal membaca file: " + error.message);
  //     }
  //   };
  //   reader.readAsArrayBuffer(file);
  //   return false;
  // };

  // const handleUpload = async () => {
  //   if (importedData.length === 0) {
  //     message.error("Tidak ada data untuk diimpor");
  //     return;
  //   }

  //   setUploading(true);
  //   let errorCount = 0;

  //   try {
  //     for (const row of importedData) {
  //       const dataToSave = {
  //         id: row[columnMapping["ID Konsentrasi"]],
  //         konsentrasi: row[columnMapping["Nama Konsentrasi Keahlian"]],
  //         programKeahlian_id: row[columnMapping["ID Program"]],
  //       };

  //       if (
  //         !dataToSave.id ||
  //         !dataToSave.konsentrasi ||
  //         !dataToSave.programKeahlian_id
  //       ) {
  //         errorCount++;
  //         continue;
  //       }

  //       const existingACPIndex = jadwalPelajaran.findIndex(
  //         (p) => p.id === dataToSave.id
  //       );

  //       try {
  //         if (existingACPIndex > -1) {
  //           await editACP(dataToSave, dataToSave.id);
  //         } else {
  //           await addACP(dataToSave);
  //         }
  //       } catch (error) {
  //         errorCount++;
  //       }
  //     }

  //     message.success(
  //       `${importedData.length - errorCount} data berhasil diunggah.`
  //     );
  //     if (errorCount > 0) {
  //       message.warning(`${errorCount} data gagal diunggah.`);
  //     }

  //     fetchACP();
  //   } catch (error) {
  //     message.error("Terjadi kesalahan saat mengunggah data.");
  //   } finally {
  //     setUploading(false);
  //     setImportModalVisible(false);
  //     setImportedData([]);
  //     setColumnTitles([]);
  //     setColumnMapping({});
  //   }
  // };

  const renderColumns = () => [
    {
      title: "No.",
      dataIndex: "index",
      key: "index",
      align: "center",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Capaian Pembelajaran",
      dataIndex: "namaAcp",
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
            onClick={() => handleEditACP(row)}
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
      dataSource={acp}
      columns={renderColumns()}
      pagination={{ pageSize: 10 }}
    />
  );

  const renderButtons = () => (
    <Row gutter={[16, 16]} justify="start">
      <Col>
        <Button type="primary" onClick={() => setAddACPModalVisible(true)}>
          Tambahkan ACP
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
        title="Manajemen Analisa Capaian Pembelajaran"
        source="Di sini, Anda dapat mengelola Analisa Capaian Pembelajaran di sistem."
      />
      <br />
      <Card title={renderButtons()}>{renderTable()}</Card>

      <AddACPForm
        wrappedComponentRef={addACPFormRef}
        visible={addACPModalVisible}
        confirmLoading={addACPModalLoading}
        onCancel={handleCancel}
        onOk={handleAddOk}
      />

      <EditACPForm
        wrappedComponentRef={editACPFormRef}
        currentRowData={currentRowData}
        visible={editACPModalVisible}
        confirmLoading={editACPModalLoading}
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

export default ACP;
