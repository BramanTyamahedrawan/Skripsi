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
import { getKelas, deleteKelas, editKelas, addKelas } from "@/api/kelas";
import TypingCard from "@/components/TypingCard";
import EditKelasForm from "./forms/edit-kelas-form";
import AddKelasForm from "./forms/add-kelas-form";
import { read, utils } from "xlsx";

const { Column } = Table;

const Kelas = () => {
  const [kelas, setKelas] = useState([]);
  const [editKelasModalVisible, setEditKelasModalVisible] = useState(false);
  const [editKelasModalLoading, setEditKelasModalLoading] = useState(false);
  const [currentRowData, setCurrentRowData] = useState({});
  const [addKelasModalVisible, setAddKelasModalVisible] = useState(false);
  const [addKelasModalLoading, setAddKelasModalLoading] = useState(false);
  const [importedData, setImportedData] = useState([]);
  const [columnTitles, setColumnTitles] = useState([]);
  const [fileName, setFileName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [columnMapping, setColumnMapping] = useState({});

  const editKelasFormRef = useRef();
  const addKelasFormRef = useRef();

  const fetchKelas = async () => {
    try {
      const result = await getKelas();
      const { content, statusCode } = result.data;

      if (statusCode === 200) {
        setKelas(content);
      } else {
        message.error("Gagal mengambil data");
      }
    } catch (error) {
      message.error("Terjadi kesalahan: " + error.message);
    }
  };

  const handleEditKelas = (row) => {
    setCurrentRowData({ ...row });
    setEditKelasModalVisible(true);
  };

  const handleDeleteKelas = async (row) => {
    const { id } = row;
    if (id === "admin") {
      message.error("Tidak dapat menghapus Admin!");
      return;
    }

    try {
      await deleteKelas({ id });
      message.success("Berhasil dihapus");
      fetchKelas();
    } catch (error) {
      message.error("Gagal menghapus: " + error.message);
    }
  };

  const handleEditKelasOk = () => {
    const form = editKelasFormRef.current?.props.form;
    form.validateFields((err, values) => {
      if (err) {
        message.error("Harap isi semua field yang diperlukan");
        return;
      }

      setEditKelasModalLoading(true);
      editKelas(values, values.id)
        .then((response) => {
          form.resetFields();
          setEditKelasModalVisible(false);
          setEditKelasModalLoading(false);
          message.success("Berhasil diubah!");
          fetchKelas();
        })
        .catch((error) => {
          setEditKelasModalLoading(false);
          message.error("Gagal mengubah: " + error.message);
        });
    });
  };

  const handleCancel = () => {
    setEditKelasModalVisible(false);
    setAddKelasModalVisible(false);
  };

  const handleAddKelas = () => {
    setAddKelasModalVisible(true);
  };

  const handleAddKelasOk = () => {
    const form = addKelasFormRef.current?.props.form;
    form.validateFields((err, values) => {
      if (err) {
        message.error("Harap isi semua field yang diperlukan");
        return;
      }

      setAddKelasModalLoading(true);
      addKelas(values)
        .then((response) => {
          form.resetFields();
          setAddKelasModalVisible(false);
          setAddKelasModalLoading(false);
          message.success("Berhasil ditambahkan!");
          fetchKelas();
        })
        .catch((error) => {
          setAddKelasModalLoading(false);
          message.error("Gagal menambahkan: " + error.message);
        });
    });
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

        const newImportedData = jsonData.slice(1);
        const newColumnTitles = jsonData[0];
        const newFileName = file.name.toLowerCase();

        const newColumnMapping = {};
        newColumnTitles.forEach((title, index) => {
          newColumnMapping[title] = index;
        });

        setImportedData(newImportedData);
        setColumnTitles(newColumnTitles);
        setFileName(newFileName);
        setColumnMapping(newColumnMapping);
      } catch (error) {
        message.error("Gagal membaca file: " + error.message);
      }
    };
    reader.onerror = () => {
      message.error("Gagal membaca file");
    };
    reader.readAsArrayBuffer(file);

    return false;
  };

  const saveImportedData = async () => {
    let errorCount = 0;
    const successRecords = [];

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

        const existingKelasIndex = kelas.findIndex(
          (p) => p.id === dataToSave.id
        );

        try {
          if (existingKelasIndex > -1) {
            await editKelas(dataToSave, dataToSave.id);
            setKelas((prev) => {
              const updated = [...prev];
              updated[existingKelasIndex] = dataToSave;
              return updated;
            });
            successRecords.push(dataToSave);
          } else {
            await addKelas(dataToSave);
            setKelas((prev) => [...prev, dataToSave]);
            successRecords.push(dataToSave);
          }
        } catch (error) {
          errorCount++;
          console.error("Gagal menyimpan data:", error);
        }
      }

      if (errorCount === 0) {
        message.success(`${successRecords.length} data berhasil disimpan.`);
      } else {
        message.warning(
          `${successRecords.length} data berhasil disimpan. ${errorCount} data gagal disimpan.`
        );
      }

      if (successRecords.length > 0) {
        fetchKelas();
      }
    } catch (error) {
      console.error("Gagal memproses data:", error);
      message.error("Terjadi kesalahan saat memproses data");
    } finally {
      setImportedData([]);
      setColumnTitles([]);
      setColumnMapping({});
    }
  };

  const handleUpload = () => {
    if (importedData.length === 0) {
      message.error("Tidak ada data untuk diimpor");
      return;
    }

    setUploading(true);
    saveImportedData()
      .then(() => {
        setUploading(false);
        setImportModalVisible(false);
      })
      .catch((error) => {
        console.error("Gagal mengunggah data:", error);
        setUploading(false);
        message.error("Gagal mengunggah data, harap coba lagi.");
      });
  };

  useEffect(() => {
    fetchKelas();
  }, []);

  const title = (
    <Row gutter={[16, 16]} justify="start" style={{ paddingLeft: 9 }}>
      <Col xs={24} sm={12} md={8} lg={6} xl={6}>
        <Button type="primary" onClick={handleAddKelas}>
          Tambahkan Kelas
        </Button>
      </Col>
      <Col xs={24} sm={12} md={8} lg={6} xl={6}>
        <Button onClick={() => setImportModalVisible(true)}>Import File</Button>
      </Col>
    </Row>
  );

  const cardContent = `Di sini, Anda dapat mengelola kelas di sistem, seperti menambahkan kelas baru, atau mengubah kelas yang sudah ada di sistem.`;

  return (
    <div className="app-container">
      <TypingCard title="Manajemen Kelas" source={cardContent} />
      <br />
      <Card title={title}>
        <Table
          variant
          rowKey="id"
          dataSource={kelas}
          pagination={{ pageSize: 10 }}
        >
          <Column
            title="ID Kelas"
            dataIndex="idKelas"
            key="idKelas"
            align="center"
          />
          <Column
            title="Nama Kelas"
            dataIndex="namaKelas"
            key="namaKelas"
            align="center"
          />
          <Column
            title="Operasi"
            key="action"
            width={195}
            align="center"
            render={(text, row) => (
              <span>
                <Button
                  type="primary"
                  shape="circle"
                  icon="edit"
                  title="mengedit"
                  onClick={() => handleEditKelas(row)}
                />
                <Divider type="vertical" />
                <Button
                  type="primary"
                  shape="circle"
                  icon="delete"
                  title="menghapus"
                  onClick={() => handleDeleteKelas(row)}
                />
              </span>
            )}
          />
        </Table>
      </Card>

      <EditKelasForm
        currentRowData={currentRowData}
        wrappedComponentRef={editKelasFormRef}
        visible={editKelasModalVisible}
        confirmLoading={editKelasModalLoading}
        onCancel={handleCancel}
        onOk={handleEditKelasOk}
      />

      <AddKelasForm
        wrappedComponentRef={addKelasFormRef}
        visible={addKelasModalVisible}
        confirmLoading={addKelasModalLoading}
        onCancel={handleCancel}
        onOk={handleAddKelasOk}
      />

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
            onClick={handleUpload}
          >
            Upload
          </Button>,
        ]}
      >
        <Upload beforeUpload={handleFileImport} accept=".xlsx,.xls">
          <Button>Pilih File</Button>
        </Upload>
      </Modal>
    </div>
  );
};

export default Kelas;
