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
  getKonsentrasiKeahlian,
  deleteKonsentrasiKeahlian,
  editKonsentrasiKeahlian,
  addKonsentrasiKeahlian,
} from "@/api/konsentrasiKeahlian";
import TypingCard from "@/components/TypingCard";
import EditKonsentrasiKeahlianForm from "./forms/edit-konsentrasi-keahlian-form";
import AddKonsentrasiKeahlianForm from "./forms/add-konsentrasi-keahlian-form";
import { read, utils } from "xlsx";

const { Column } = Table;

const KonsentrasiKeahlian = () => {
  const [konsentrasiKeahlians, setKonsentrasiKeahlians] = useState([]);
  const [
    editKonsentrasiKeahlianModalVisible,
    setEditKonsentrasiKeahlianModalVisible,
  ] = useState(false);
  const [
    editKonsentrasiKeahlianModalLoading,
    setEditKonsentrasiKeahlianModalLoading,
  ] = useState(false);
  const [currentRowData, setCurrentRowData] = useState({});
  const [
    addKonsentrasiKeahlianModalVisible,
    setAddKonsentrasiKeahlianModalVisible,
  ] = useState(false);
  const [
    addKonsentrasiKeahlianModalLoading,
    setAddKonsentrasiKeahlianModalLoading,
  ] = useState(false);
  const [importedData, setImportedData] = useState([]);
  const [columnTitles, setColumnTitles] = useState([]);
  const [fileName, setFileName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [columnMapping, setColumnMapping] = useState({});

  const editKonsentrasiKeahlianFormRef = useRef();
  const addKonsentrasiKeahlianFormRef = useRef();

  const fetchKonsentrasiKeahlian = async () => {
    try {
      const result = await getKonsentrasiKeahlian();
      const { content, statusCode } = result.data;

      if (statusCode === 200) {
        setKonsentrasiKeahlians(content);
      } else {
        message.error("Gagal mengambil data");
      }
    } catch (error) {
      message.error("Terjadi kesalahan: " + error.message);
    }
  };

  const handleEditKonsentrasiKeahlian = (row) => {
    setCurrentRowData({ ...row });
    setEditKonsentrasiKeahlianModalVisible(true);
  };

  const handleDeleteKonsentrasiKeahlian = async (row) => {
    const { id } = row;
    if (id === "admin") {
      message.error("Tidak dapat menghapus Admin!");
      return;
    }

    try {
      await deleteKonsentrasiKeahlian({ id });
      message.success("Berhasil dihapus");
      fetchKonsentrasiKeahlian();
    } catch (error) {
      message.error("Gagal menghapus: " + error.message);
    }
  };

  const handleEditKonsentrasiKeahlianOk = () => {
    const form = editKonsentrasiKeahlianFormRef.current?.props.form;
    form.validateFields((err, values) => {
      if (err) {
        message.error("Harap isi semua field yang diperlukan");
        return;
      }

      setEditKonsentrasiKeahlianModalLoading(true);
      editKonsentrasiKeahlian(values, values.id)
        .then((response) => {
          form.resetFields();
          setEditKonsentrasiKeahlianModalVisible(false);
          setEditKonsentrasiKeahlianModalLoading(false);
          message.success("Berhasil diubah!");
          fetchKonsentrasiKeahlian();
        })
        .catch((error) => {
          setEditKonsentrasiKeahlianModalLoading(false);
          message.error("Gagal mengubah: " + error.message);
        });
    });
  };

  const handleCancel = () => {
    setEditKonsentrasiKeahlianModalVisible(false);
    setAddKonsentrasiKeahlianModalVisible(false);
  };

  const handleAddKonsentrasiKeahlian = () => {
    setAddKonsentrasiKeahlianModalVisible(true);
  };

  const handleAddKonsentrasiKeahlianOk = () => {
    const form = addKonsentrasiKeahlianFormRef.current?.props.form;
    form.validateFields((err, values) => {
      if (err) {
        message.error("Harap isi semua field yang diperlukan");
        return;
      }

      setAddKonsentrasiKeahlianModalLoading(true);
      addKonsentrasiKeahlian(values)
        .then((response) => {
          form.resetFields();
          setAddKonsentrasiKeahlianModalVisible(false);
          setAddKonsentrasiKeahlianModalLoading(false);
          message.success("Berhasil ditambahkan!");
          fetchKonsentrasiKeahlian();
        })
        .catch((error) => {
          setAddKonsentrasiKeahlianModalLoading(false);
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

        const existingIndex = konsentrasiKeahlians.findIndex(
          (p) => p.id === dataToSave.id
        );

        try {
          if (existingIndex > -1) {
            await editKonsentrasiKeahlian(dataToSave, dataToSave.id);
            setKonsentrasiKeahlians((prev) => {
              const updated = [...prev];
              updated[existingIndex] = dataToSave;
              return updated;
            });
            successRecords.push(dataToSave);
          } else {
            await addKonsentrasiKeahlian(dataToSave);
            setKonsentrasiKeahlians((prev) => [...prev, dataToSave]);
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
        fetchKonsentrasiKeahlian();
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
    fetchKonsentrasiKeahlian();
  }, []);

  const title = (
    <Row gutter={[16, 16]} justify="start" style={{ paddingLeft: 9 }}>
      <Col xs={24} sm={12} md={8} lg={6} xl={6}>
        <Button type="primary" onClick={handleAddKonsentrasiKeahlian}>
          Tambahkan Konsentrasi Keahlian
        </Button>
      </Col>
      <Col xs={24} sm={12} md={8} lg={6} xl={6}>
        <Button onClick={() => setImportModalVisible(true)}>Import File</Button>
      </Col>
    </Row>
  );

  const cardContent = `Di sini, Anda dapat mengelola konsentrasi keahlian di sistem, seperti menambahkan konsentrasi keahlian baru, atau mengubah konsentrasi keahlian yang sudah ada di sistem.`;

  return (
    <div className="app-container">
      <TypingCard title="Manajemen Konsentrasi Keahlian" source={cardContent} />
      <br />
      <Card title={title}>
        <Table
          bordered
          rowKey="id"
          dataSource={konsentrasiKeahlians}
          pagination={{ pageSize: 10 }}
        >
          <Column
            title="Program Keahlian"
            dataIndex="programKeahlian.program"
            key="program"
            align="center"
          />
          <Column
            title="ID Konsentrasi Keahlian"
            dataIndex="id"
            key="id"
            align="center"
          />
          <Column
            title="Konsentrasi Keahlian"
            dataIndex="konsentrasi"
            key="konsentrasi"
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
                  onClick={() => handleEditKonsentrasiKeahlian(row)}
                />
                <Divider type="vertical" />
                <Button
                  type="primary"
                  shape="circle"
                  icon="delete"
                  title="menghapus"
                  onClick={() => handleDeleteKonsentrasiKeahlian(row)}
                />
              </span>
            )}
          />
        </Table>
      </Card>

      <EditKonsentrasiKeahlianForm
        currentRowData={currentRowData}
        wrappedComponentRef={editKonsentrasiKeahlianFormRef}
        visible={editKonsentrasiKeahlianModalVisible}
        confirmLoading={editKonsentrasiKeahlianModalLoading}
        onCancel={handleCancel}
        onOk={handleEditKonsentrasiKeahlianOk}
      />

      <AddKonsentrasiKeahlianForm
        wrappedComponentRef={addKonsentrasiKeahlianFormRef}
        visible={addKonsentrasiKeahlianModalVisible}
        confirmLoading={addKonsentrasiKeahlianModalLoading}
        onCancel={handleCancel}
        onOk={handleAddKonsentrasiKeahlianOk}
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

export default KonsentrasiKeahlian;
