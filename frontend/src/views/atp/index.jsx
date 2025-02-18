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
import { getATP, deleteATP, editATP, addATP } from "@/api/atp";
import TypingCard from "@/components/TypingCard";
import EditATPForm from "./forms/edit-atp-form";
import AddATPForm from "./forms/add-atp-form";
import { read, utils } from "xlsx";

const { Column } = Table;

const ATP = () => {
  const [jadwalPelajaran, setJadwalPelajaran] = useState([]);
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

  const editATPFormRef = useRef();
  const addATPFormRef = useRef();

  const fetchATP = async () => {
    try {
      const result = await getATP();
      const { content, statusCode } = result.data;

      if (statusCode === 200) {
        setJadwalPelajaran(content);
      } else {
        message.error("Gagal mengambil data");
      }
    } catch (error) {
      message.error("Terjadi kesalahan: " + error.message);
    }
  };

  const handleEditATP = (row) => {
    setCurrentRowData({ ...row });
    setEditATPModalVisible(true);
  };

  const handleDeleteATP = async (row) => {
    const { id } = row;
    if (id === "admin") {
      message.error("Tidak dapat menghapus Admin!");
      return;
    }

    try {
      await deleteATP({ id });
      message.success("Berhasil dihapus");
      fetchATP();
    } catch (error) {
      message.error("Gagal menghapus: " + error.message);
    }
  };

  const handleEditATPOk = () => {
    const form = editATPFormRef.current?.props.form;
    form.validateFields((err, values) => {
      if (err) {
        message.error("Harap isi semua field yang diperlukan");
        return;
      }

      setEditATPModalLoading(true);
      editATP(values, values.id)
        .then((response) => {
          if (response.data.statusCode === 200) {
            form.resetFields();
            setEditATPModalVisible(false);
            setEditATPModalLoading(false);
            message.success("Berhasil diubah!");
            fetchATP();
          } else {
            throw new Error(response.data.message);
          }
        })
        .catch((error) => {
          setEditATPModalLoading(false);
          message.error("Gagal mengubah: " + error.message);
        });
    });
  };

  const handleCancel = () => {
    setEditATPModalVisible(false);
    setAddATPModalVisible(false);
  };

  const handleAddATP = () => {
    setAddATPModalVisible(true);
  };

  const handleAddATPOk = () => {
    const form = addATPFormRef.current?.props.form;
    form.validateFields((err, values) => {
      if (err) {
        message.error("Harap isi semua field yang diperlukan");
        return;
      }

      setAddATPModalLoading(true);
      addATP(values)
        .then((response) => {
          if (response.data.statusCode === 200) {
            form.resetFields();
            setAddATPModalVisible(false);
            setAddATPModalLoading(false);
            message.success("Berhasil ditambahkan!");
            fetchATP();
          } else {
            throw new Error(response.data.message);
          }
        })
        .catch((error) => {
          setAddATPModalLoading(false);
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

  const saveImportedData = async (columnMapping) => {
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

        const existingATPIndex = jadwalPelajaran.findIndex(
          (p) => p.id === dataToSave.id
        );

        try {
          if (existingATPIndex > -1) {
            await editATP(dataToSave, dataToSave.id);
            setJadwalPelajaran((prev) => {
              const updated = [...prev];
              updated[existingATPIndex] = dataToSave;
              return updated;
            });
            successRecords.push(dataToSave);
          } else {
            await addATP(dataToSave);
            setJadwalPelajaran((prev) => [...prev, dataToSave]);
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
        fetchATP();
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
    saveImportedData(columnMapping)
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
    fetchATP();
  }, []);

  const title = (
    <Row gutter={[16, 16]} justify="start" style={{ paddingLeft: 9 }}>
      <Col xs={24} sm={12} md={8} lg={6} xl={6}>
        <Button type="primary" onClick={handleAddATP}>
          Tambahkan Alur Tujuan Pembelajaran
        </Button>
      </Col>
      <Col xs={30} sm={20} md={20} lg={20} xl={20}>
        <Button onClick={() => setImportModalVisible(true)}>Import File</Button>
      </Col>
    </Row>
  );

  const cardContent = `Di sini, Anda dapat mengelola Alur Tujuan Pembelajaran di sistem, seperti menambahkan Alur Tujuan Pembelajaran baru, atau mengubah Alur Tujuan Pembelajaran yang sudah ada di sistem.`;

  return (
    <div className="app-container">
      <TypingCard
        title="Manajemen Alur Tujuan Pembelajaran"
        source={cardContent}
      />
      <br />
      <Card title={title}>
        <Table
          variant
          rowKey="id"
          dataSource={jadwalPelajaran}
          pagination={{ pageSize: 10 }}
        >
          <Column
            title="Kode"
            dataIndex="lecture.name"
            key="lecture.name"
            align="center"
          />
          <Column
            title="Tahun Ajaran"
            dataIndex="jabatan"
            key="jabatan"
            align="center"
          />
          <Column
            title="Jurusan"
            dataIndex="mapel.name"
            key="mapel.name"
            align="center"
          />
          <Column
            title="Kelas"
            dataIndex="jmlJam"
            key="jmlJam"
            align="center"
          />
          <Column
            title="Semester"
            dataIndex="jmlJam"
            key="jmlJam"
            align="center"
          />
          <Column
            title="Mapel"
            dataIndex="jmlJam"
            key="jmlJam"
            align="center"
          />
          <Column
            title="Capaian Pembelajaran"
            dataIndex="jmlJam"
            key="jmlJam"
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
                  onClick={() => handleEditATP(row)}
                />
                <Divider type="vertical" />
                <Button
                  type="primary"
                  shape="circle"
                  icon="delete"
                  title="menghapus"
                  onClick={() => handleDeleteATP(row)}
                />
              </span>
            )}
          />
        </Table>
      </Card>

      <EditATPForm
        currentRowData={currentRowData}
        wrappedComponentRef={editATPFormRef}
        visible={editATPModalVisible}
        confirmLoading={editATPModalLoading}
        onCancel={handleCancel}
        onOk={handleEditATPOk}
      />

      <AddATPForm
        wrappedComponentRef={addATPFormRef}
        visible={addATPModalVisible}
        confirmLoading={addATPModalLoading}
        onCancel={handleCancel}
        onOk={handleAddATPOk}
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

export default ATP;
