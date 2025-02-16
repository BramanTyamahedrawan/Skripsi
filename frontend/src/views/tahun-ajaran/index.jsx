/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from "react";
import { Card, Button, Table, message, Upload, Row, Col, Modal } from "antd";
import {
  getTahunAjaran,
  deleteTahunAjaran,
  editTahunAjaran,
  addTahunAjaran,
} from "@/api/tahun-ajaran";
import TypingCard from "@/components/TypingCard";
import EditTahunAjaranForm from "./forms/edit-tahun-ajaran-form";
import AddTahunAjaranForm from "./forms/add-tahun-ajaran-form";
import { read, utils } from "xlsx";

const { Column } = Table;

const TahunAjaran = () => {
  const [tahunAjaran, setTahunAjaran] = useState([]);
  const [modalState, setModalState] = useState({
    editVisible: false,
    editLoading: false,
    addVisible: false,
    addLoading: false,
    importVisible: false,
  });
  const [currentRowData, setCurrentRowData] = useState({});
  const [importData, setImportData] = useState({
    data: [],
    columnTitles: [],
    fileName: "",
    columnMapping: {},
  });
  const [uploading, setUploading] = useState(false);

  const editFormRef = useRef();
  const addFormRef = useRef();

  const fetchTahunAjaran = async () => {
    try {
      const result = await getTahunAjaran();
      if (result.data.statusCode === 200) {
        setTahunAjaran(result.data.content);
      }
    } catch (error) {
      console.error("Error fetching tahun ajaran:", error);
    }
  };

  useEffect(() => {
    fetchTahunAjaran();
  }, []);

  const handleEditTahunAjaran = (row) => {
    setCurrentRowData({ ...row });
    setModalState((prev) => ({ ...prev, editVisible: true }));
  };

  const handleDeleteTahunAjaran = async (row) => {
    if (row.id === "admin") {
      message.error("Tidak dapat menghapus Admin!");
      return;
    }

    try {
      await deleteTahunAjaran({ id: row.id });
      message.success("Berhasil dihapus");
      fetchTahunAjaran();
    } catch (error) {
      message.error("Gagal menghapus");
    }
  };

  const handleEditTahunAjaranOk = () => {
    const form = editFormRef.current?.props.form;
    form?.validateFields(async (err, values) => {
      if (err) return;

      setModalState((prev) => ({ ...prev, editLoading: true }));
      try {
        await editTahunAjaran(values, values.id);
        form.resetFields();
        setModalState((prev) => ({
          ...prev,
          editVisible: false,
          editLoading: false,
        }));
        message.success("Berhasil diperbarui!");
        fetchTahunAjaran();
      } catch (error) {
        message.error("Gagal memperbarui");
        setModalState((prev) => ({ ...prev, editLoading: false }));
      }
    });
  };

  const handleCancel = () => {
    setModalState((prev) => ({
      ...prev,
      editVisible: false,
      addVisible: false,
      importVisible: false,
    }));
  };

  const handleAddTahunAjaran = () => {
    setModalState((prev) => ({ ...prev, addVisible: true }));
  };

  const handleAddTahunAjaranOk = () => {
    const form = addFormRef.current?.props.form;
    form?.validateFields(async (err, values) => {
      if (err) return;

      setModalState((prev) => ({ ...prev, addLoading: true }));
      try {
        await addTahunAjaran(values);
        form.resetFields();
        setModalState((prev) => ({
          ...prev,
          addVisible: false,
          addLoading: false,
        }));
        message.success("Berhasil ditambahkan!");
        fetchTahunAjaran();
      } catch (error) {
        message.error("Gagal menambahkan, coba lagi!");
        setModalState((prev) => ({ ...prev, addLoading: false }));
      }
    });
  };

  const handleFileImport = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = read(data, { type: "array" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = utils.sheet_to_json(worksheet, { header: 1 });

      const columnTitles = jsonData[0];
      const columnMapping = {};
      columnTitles.forEach((title, index) => {
        columnMapping[title] = index;
      });

      setImportData({
        data: jsonData.slice(1),
        columnTitles,
        fileName: file.name.toLowerCase(),
        columnMapping,
      });
    };
    reader.readAsArrayBuffer(file);
  };

  const handleUpload = async () => {
    if (importData.data.length === 0) {
      message.error("Tidak ada data untuk diimpor");
      return;
    }

    setUploading(true);
    let errorCount = 0;

    try {
      for (const row of importData.data) {
        const dataToSave = {
          id: row[importData.columnMapping["ID Konsentrasi"]],
          konsentrasi:
            row[importData.columnMapping["Nama Konsentrasi Keahlian"]],
          programKeahlian_id: row[importData.columnMapping["ID Program"]],
        };

        const existingIdx = tahunAjaran.findIndex(
          (p) => p.id === dataToSave.id
        );

        try {
          if (existingIdx > -1) {
            await editTahunAjaran(dataToSave, dataToSave.id);
            setTahunAjaran((prev) => {
              const updated = [...prev];
              updated[existingIdx] = dataToSave;
              return updated;
            });
          } else {
            await addTahunAjaran(dataToSave);
            setTahunAjaran((prev) => [...prev, dataToSave]);
          }
        } catch (error) {
          errorCount++;
          console.error("Gagal menyimpan data:", error);
        }
      }

      if (errorCount === 0) {
        message.success("Semua data berhasil disimpan");
      } else {
        message.error(`${errorCount} data gagal disimpan`);
      }
    } catch (error) {
      console.error("Gagal memproses data:", error);
      message.error("Gagal memproses data");
    } finally {
      setUploading(false);
      setModalState((prev) => ({ ...prev, importVisible: false }));
      setImportData({
        data: [],
        columnTitles: [],
        fileName: "",
        columnMapping: {},
      });
    }
  };

  const cardContent = `Di sini, Anda dapat mengelola tahun ajaran di sistem, seperti menambahkan tahun ajaran baru, atau mengubah tahun ajaran yang sudah ada di sistem.`;

  return (
    <div className="app-container">
      <TypingCard title="Manajemen Tahun Ajaran" source={cardContent} />
      <br />
      <Card
        title={
          <Row gutter={[16, 16]} justify="start" style={{ paddingLeft: 9 }}>
            <Col xs={24} sm={12} md={8} lg={6} xl={6}>
              <Button type="primary" onClick={handleAddTahunAjaran}>
                Tambahkan Tahun Ajaran
              </Button>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6} xl={6}>
              <Button
                onClick={() =>
                  setModalState((prev) => ({ ...prev, importVisible: true }))
                }
              >
                Import File
              </Button>
            </Col>
          </Row>
        }
      >
        <Table
          bordered
          rowKey="id"
          dataSource={tahunAjaran}
          pagination={{ pageSize: 10 }}
        >
          <Column title="ID Tahun Ajaran" dataIndex="idTahun" align="center" />
          <Column title="Tahun Ajaran" dataIndex="tahunAjaran" align="center" />
        </Table>
      </Card>

      <EditTahunAjaranForm
        wrappedComponentRef={editFormRef}
        currentRowData={currentRowData}
        visible={modalState.editVisible}
        confirmLoading={modalState.editLoading}
        onCancel={handleCancel}
        onOk={handleEditTahunAjaranOk}
      />

      <AddTahunAjaranForm
        wrappedComponentRef={addFormRef}
        visible={modalState.addVisible}
        confirmLoading={modalState.addLoading}
        onCancel={handleCancel}
        onOk={handleAddTahunAjaranOk}
      />

      <Modal
        title="Import File"
        visible={modalState.importVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
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
        <Upload beforeUpload={handleFileImport}>
          <Button>Pilih File</Button>
        </Upload>
      </Modal>
    </div>
  );
};

export default TahunAjaran;
