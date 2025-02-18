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
import { getMapel, deleteMapel, editMapel, addMapel } from "@/api/mapel";
import TypingCard from "@/components/TypingCard";
import EditMapelForm from "./forms/edit-mapel-form";
import AddMapelForm from "./forms/add-mapel-form";
import { read, utils } from "xlsx";

const { Column } = Table;

const Mapel = () => {
  const [mapels, setMapels] = useState([]);
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

  const fetchMapel = async () => {
    try {
      const result = await getMapel();
      if (result.data.statusCode === 200) {
        setMapels(result.data.content);
      }
    } catch (error) {
      console.error("Error fetching mapel:", error);
    }
  };

  useEffect(() => {
    fetchMapel();
  }, []);

  const handleEditMapel = (row) => {
    setCurrentRowData({ ...row });
    setModalState((prev) => ({ ...prev, editVisible: true }));
  };

  const handleDeleteMapel = (row) => {
    Modal.confirm({
      title: "Konfirmasi",
      content: "Apakah Anda yakin ingin menghapus data ini?",
      okText: "Ya",
      okType: "danger",
      cancelText: "Tidak",
      onOk: async () => {
        try {
          await deleteMapel({ id: row.id });
          message.success("Berhasil dihapus");
          fetchMapel();
        } catch (error) {
          message.error("Gagal menghapus");
        }
      },
    });
  };

  const handleEditMapelOk = () => {
    const form = editFormRef.current?.props.form;
    form?.validateFields(async (err, values) => {
      if (err) return;

      setModalState((prev) => ({ ...prev, editLoading: true }));
      try {
        await editMapel(values, values.id);
        form.resetFields();
        setModalState((prev) => ({
          ...prev,
          editVisible: false,
          editLoading: false,
        }));
        message.success("Berhasil diperbarui!");
        fetchMapel();
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

  const handleAddMapel = () => {
    setModalState((prev) => ({ ...prev, addVisible: true }));
  };

  const handleAddMapelOk = () => {
    const form = addFormRef.current?.props.form;
    form?.validateFields(async (err, values) => {
      if (err) return;

      setModalState((prev) => ({ ...prev, addLoading: true }));
      try {
        await addMapel(values);
        form.resetFields();
        setModalState((prev) => ({
          ...prev,
          addVisible: false,
          addLoading: false,
        }));
        message.success("Berhasil ditambahkan!");
        fetchMapel();
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
          id: row[importData.columnMapping["ID Bidang"]],
          bidang: row[importData.columnMapping["Nama Bidang Keahlian"]],
          school_id: row[importData.columnMapping["ID Sekolah"]],
        };

        const existingIdx = mapels.findIndex((p) => p.id === dataToSave.id);

        try {
          if (existingIdx > -1) {
            await editMapel(dataToSave, dataToSave.id);
            setMapels((prev) => {
              const updated = [...prev];
              updated[existingIdx] = dataToSave;
              return updated;
            });
          } else {
            await addMapel(dataToSave);
            setMapels((prev) => [...prev, dataToSave]);
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

  const cardContent = `Di sini, Anda dapat mengelola bidang keahlian di sistem, seperti menambahkan bidang keahlian baru, atau mengubah bidang keahlian yang sudah ada di sistem.`;

  return (
    <div className="app-container">
      <TypingCard title="Manajemen Mapel" source={cardContent} />
      <br />
      <Card
        title={
          <Row gutter={[16, 16]} justify="start" style={{ paddingLeft: 9 }}>
            <Col xs={24} sm={12} md={8} lg={6} xl={6}>
              <Button type="primary" onClick={handleAddMapel}>
                Tambahkan Mapel
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
          variant
          rowKey="id"
          dataSource={mapels}
          pagination={{ pageSize: 10 }}
        >
          <Column title="ID Mapel" dataIndex="idMapel" align="center" />
          <Column title="Nama Mapel" dataIndex="name" align="center" />
        </Table>
      </Card>

      <EditMapelForm
        wrappedComponentRef={editFormRef}
        currentRowData={currentRowData}
        visible={modalState.editVisible}
        confirmLoading={modalState.editLoading}
        onCancel={handleCancel}
        onOk={handleEditMapelOk}
      />

      <AddMapelForm
        wrappedComponentRef={addFormRef}
        visible={modalState.addVisible}
        confirmLoading={modalState.addLoading}
        onCancel={handleCancel}
        onOk={handleAddMapelOk}
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

export default Mapel;
