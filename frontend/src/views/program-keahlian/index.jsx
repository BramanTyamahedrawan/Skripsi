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
  getProgramKeahlian,
  deleteProgramKeahlian,
  editProgramKeahlian,
  addProgramKeahlian,
} from "@/api/programKeahlian";
import TypingCard from "@/components/TypingCard";
import EditProgramKeahlianForm from "./forms/edit-program-keahlian-form";
import AddProgramKeahlianForm from "./forms/add-program-keahlian-form";
import { read, utils } from "xlsx";

const { Column } = Table;

const ProgramKeahlian = () => {
  const [programKeahlians, setProgramKeahlians] = useState([]);
  const [editProgramKeahlianModalVisible, setEditProgramKeahlianModalVisible] =
    useState(false);
  const [editProgramKeahlianModalLoading, setEditProgramKeahlianModalLoading] =
    useState(false);
  const [currentRowData, setCurrentRowData] = useState({});
  const [addProgramKeahlianModalVisible, setAddProgramKeahlianModalVisible] =
    useState(false);
  const [addProgramKeahlianModalLoading, setAddProgramKeahlianModalLoading] =
    useState(false);
  const [importedData, setImportedData] = useState([]);
  const [columnTitles, setColumnTitles] = useState([]);
  const [fileName, setFileName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [columnMapping, setColumnMapping] = useState({});

  const editProgramKeahlianFormRef = useRef();
  const addProgramKeahlianFormRef = useRef();

  const fetchProgramKeahlian = async () => {
    try {
      const result = await getProgramKeahlian();
      const { content, statusCode } = result.data;

      if (statusCode === 200) {
        setProgramKeahlians(content);
      } else {
        message.error("Gagal mengambil data");
      }
    } catch (error) {
      message.error("Terjadi kesalahan: " + error.message);
    }
  };

  const handleEditProgramKeahlian = (row) => {
    setCurrentRowData({ ...row });
    setEditProgramKeahlianModalVisible(true);
  };

  const handleDeleteProgramKeahlian = async (row) => {
    const { id } = row;
    if (id === "admin") {
      message.error("Tidak dapat menghapus Admin!");
      return;
    }

    try {
      await deleteProgramKeahlian({ id });
      message.success("Berhasil dihapus");
      fetchProgramKeahlian();
    } catch (error) {
      message.error("Gagal menghapus: " + error.message);
    }
  };

  const handleEditProgramKeahlianOk = () => {
    const form = editProgramKeahlianFormRef.current?.props.form;
    form.validateFields((err, values) => {
      if (err) {
        message.error("Harap isi semua field yang diperlukan");
        return;
      }

      setEditProgramKeahlianModalLoading(true);
      editProgramKeahlian(values, values.id)
        .then((response) => {
          form.resetFields();
          setEditProgramKeahlianModalVisible(false);
          setEditProgramKeahlianModalLoading(false);
          message.success("Berhasil diubah!");
          fetchProgramKeahlian();
        })
        .catch((error) => {
          setEditProgramKeahlianModalLoading(false);
          message.error("Gagal mengubah: " + error.message);
        });
    });
  };

  const handleCancel = () => {
    setEditProgramKeahlianModalVisible(false);
    setAddProgramKeahlianModalVisible(false);
  };

  const handleAddProgramKeahlian = () => {
    setAddProgramKeahlianModalVisible(true);
  };

  const handleAddProgramKeahlianOk = () => {
    const form = addProgramKeahlianFormRef.current?.props.form;
    form.validateFields((err, values) => {
      if (err) {
        message.error("Harap isi semua field yang diperlukan");
        return;
      }

      setAddProgramKeahlianModalLoading(true);
      addProgramKeahlian(values)
        .then((response) => {
          form.resetFields();
          setAddProgramKeahlianModalVisible(false);
          setAddProgramKeahlianModalLoading(false);
          message.success("Berhasil ditambahkan!");
          fetchProgramKeahlian();
        })
        .catch((error) => {
          setAddProgramKeahlianModalLoading(false);
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
          id: row[columnMapping["ID Program"]],
          program: row[columnMapping["Nama Program Keahlian"]],
          bidangKeahlian_id: row[columnMapping["ID Bidang"]],
        };

        if (
          !dataToSave.id ||
          !dataToSave.program ||
          !dataToSave.bidangKeahlian_id
        ) {
          errorCount++;
          continue;
        }

        const existingIndex = programKeahlians.findIndex(
          (p) => p.id === dataToSave.id
        );

        try {
          if (existingIndex > -1) {
            await editProgramKeahlian(dataToSave, dataToSave.id);
            setProgramKeahlians((prev) => {
              const updated = [...prev];
              updated[existingIndex] = dataToSave;
              return updated;
            });
            successRecords.push(dataToSave);
          } else {
            await addProgramKeahlian(dataToSave);
            setProgramKeahlians((prev) => [...prev, dataToSave]);
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
        fetchProgramKeahlian();
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
    fetchProgramKeahlian();
  }, []);

  const title = (
    <Row gutter={[16, 16]} justify="start" style={{ paddingLeft: 9 }}>
      <Col xs={24} sm={12} md={8} lg={6} xl={6}>
        <Button type="primary" onClick={handleAddProgramKeahlian}>
          Tambahkan Program Keahlian
        </Button>
      </Col>
      <Col xs={24} sm={12} md={8} lg={6} xl={6}>
        <Button onClick={() => setImportModalVisible(true)}>Import File</Button>
      </Col>
    </Row>
  );

  const cardContent = `Di sini, Anda dapat mengelola program keahlian di sistem, seperti menambahkan program keahlian baru, atau mengubah program keahlian yang sudah ada di sistem.`;

  return (
    <div className="app-container">
      <TypingCard title="Manajemen Program Keahlian" source={cardContent} />
      <br />
      <Card title={title}>
        <Table
          bordered
          rowKey="id"
          dataSource={programKeahlians}
          pagination={{ pageSize: 10 }}
        >
          <Column
            title="Bidang Keahlian"
            dataIndex="bidangKeahlian.bidang"
            key="bidangKeahlian.bidang"
            align="center"
          />
          <Column
            title="ID Program Keahlian"
            dataIndex="id"
            key="id"
            align="center"
          />
          <Column
            title="Program Keahlian"
            dataIndex="program"
            key="program"
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
                  onClick={() => handleEditProgramKeahlian(row)}
                />
                <Divider type="vertical" />
                <Button
                  type="primary"
                  shape="circle"
                  icon="delete"
                  title="menghapus"
                  onClick={() => handleDeleteProgramKeahlian(row)}
                />
              </span>
            )}
          />
        </Table>
      </Card>

      <EditProgramKeahlianForm
        currentRowData={currentRowData}
        wrappedComponentRef={editProgramKeahlianFormRef}
        visible={editProgramKeahlianModalVisible}
        confirmLoading={editProgramKeahlianModalLoading}
        onCancel={handleCancel}
        onOk={handleEditProgramKeahlianOk}
      />

      <AddProgramKeahlianForm
        wrappedComponentRef={addProgramKeahlianFormRef}
        visible={addProgramKeahlianModalVisible}
        confirmLoading={addProgramKeahlianModalLoading}
        onCancel={handleCancel}
        onOk={handleAddProgramKeahlianOk}
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

export default ProgramKeahlian;
