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
  const [jadwalPelajaran, setJadwalPelajaran] = useState([]);
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

  const editACPFormRef = useRef();
  const addACPFormRef = useRef();

  useEffect(() => {
    fetchACP();
  }, []);

  const fetchACP = async () => {
    setTableLoading(true);
    try {
      const result = await getACP();
      if (result.data.statusCode === 200) {
        setJadwalPelajaran(result.data.content);
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

  const handleDeleteACP = async (row) => {
    const { id } = row;
    Modal.confirm({
      title: "Konfirmasi",
      content: "Apakah Anda yakin ingin menghapus data ini?",
      okText: "Ya",
      okType: "danger",
      cancelText: "Tidak",
      onOk: async () => {
        try {
          await deleteACP({ id });
          message.success("Berhasil dihapus");
          fetchACP();
        } catch (error) {
          message.error("Gagal menghapus: " + error.message);
        }
      },
    });
  };

  const handleCancel = () => {
    setEditACPModalVisible(false);
    setAddACPModalVisible(false);
  };

  const handleAddACP = () => {
    setAddACPModalVisible(true);
  };

  const handleFileImport = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = read(data, { type: "array" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = utils.sheet_to_json(worksheet, { header: 1 });

        if (jsonData.length < 2) {
          message.error("File tidak memiliki data yang valid");
          return;
        }

        setImportedData(jsonData.slice(1)); // Data tanpa header
        setColumnTitles(jsonData[0]); // Header kolom
        setFileName(file.name.toLowerCase());

        const newColumnMapping = {};
        jsonData[0].forEach((title, index) => {
          newColumnMapping[title] = index;
        });

        setColumnMapping(newColumnMapping);
      } catch (error) {
        message.error("Gagal membaca file: " + error.message);
      }
    };
    reader.readAsArrayBuffer(file);
    return false;
  };

  const handleUpload = async () => {
    if (importedData.length === 0) {
      message.error("Tidak ada data untuk diimpor");
      return;
    }

    setUploading(true);
    let errorCount = 0;

    try {
      for (const row of importedData) {
        const dataToSave = {
          id: row[columnMapping["ID Konsentrasi"]],
          konsentrasi: row[columnMapping["Nama Konsentrasi Keahlian"]],
          programKeahlian_id: row[columnMapping["ID Program"]],
        };

        if (
          !dataToSave.id ||
          !dataToSave.konsentrasi ||
          !dataToSave.programKeahlian_id
        ) {
          errorCount++;
          continue;
        }

        const existingACPIndex = jadwalPelajaran.findIndex(
          (p) => p.id === dataToSave.id
        );

        try {
          if (existingACPIndex > -1) {
            await editACP(dataToSave, dataToSave.id);
          } else {
            await addACP(dataToSave);
          }
        } catch (error) {
          errorCount++;
        }
      }

      message.success(
        `${importedData.length - errorCount} data berhasil diunggah.`
      );
      if (errorCount > 0) {
        message.warning(`${errorCount} data gagal diunggah.`);
      }

      fetchACP();
    } catch (error) {
      message.error("Terjadi kesalahan saat mengunggah data.");
    } finally {
      setUploading(false);
      setImportModalVisible(false);
      setImportedData([]);
      setColumnTitles([]);
      setColumnMapping({});
    }
  };

  const renderColumns = () => [
    {
      title: "Kode",
      dataIndex: ["lecture", "name"],
      key: "lecture.name",
      align: "center",
    },
    {
      title: "Tahun Ajaran",
      dataIndex: "jabatan",
      key: "jabatan",
      align: "center",
    },
    {
      title: "Jurusan",
      dataIndex: ["mapel", "name"],
      key: "mapel.name",
      align: "center",
    },
    {
      title: "Kelas",
      dataIndex: "jmlJam",
      key: "jmlJam",
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
            onClick={() => handleDeleteACP(row)}
          />
        </span>
      ),
    },
  ];

  return (
    <div className="app-container">
      <TypingCard
        title="Manajemen Analisa Capaian Pembelajaran"
        source="Di sini, Anda dapat mengelola ACP di sistem."
      />
      <br />
      <Card
        title={
          <Row gutter={[16, 16]}>
            <Col>
              <Button type="primary" onClick={handleAddACP}>
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
        }
      >
        <Table
          rowKey="id"
          dataSource={jadwalPelajaran}
          columns={renderColumns()}
          pagination={{ pageSize: 10 }}
          loading={tableLoading}
        />
      </Card>

      <EditACPForm
        visible={editACPModalVisible}
        confirmLoading={editACPModalLoading}
        onCancel={handleCancel}
      />
      <AddACPForm
        visible={addACPModalVisible}
        confirmLoading={addACPModalLoading}
        onCancel={handleCancel}
      />

      <Modal
        title="Import File"
        open={importModalVisible}
        onCancel={() => setImportModalVisible(false)}
        footer={null}
      >
        <Upload beforeUpload={handleFileImport} accept=".xlsx,.xls">
          <Button>Pilih File</Button>
        </Upload>
        <Button
          type="primary"
          loading={uploading}
          onClick={handleUpload}
          style={{ marginTop: 16 }}
        >
          Upload
        </Button>
      </Modal>
    </div>
  );
};

export default ACP;
