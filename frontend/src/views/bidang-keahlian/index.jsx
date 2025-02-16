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
  getBidangKeahlian,
  deleteBidangKeahlian,
  editBidangKeahlian,
  addBidangKeahlian,
} from "@/api/bidangKeahlian";
import TypingCard from "@/components/TypingCard";
import EditBidangKeahlianForm from "./forms/edit-bidang-keahlian-form";
import AddBidangKeahlianForm from "./forms/add-bidang-keahlian-form";
import { read, utils } from "xlsx";

const { Column } = Table;

const BidangKeahlian = () => {
  const [bidangKeahlians, setBidangKeahlians] = useState([]);
  const [editBidangKeahlianModalVisible, setEditBidangKeahlianModalVisible] =
    useState(false);
  const [editBidangKeahlianModalLoading, setEditBidangKeahlianModalLoading] =
    useState(false);
  const [currentRowData, setCurrentRowData] = useState({});
  const [addBidangKeahlianModalVisible, setAddBidangKeahlianModalVisible] =
    useState(false);
  const [addBidangKeahlianModalLoading, setAddBidangKeahlianModalLoading] =
    useState(false);
  const [importedData, setImportedData] = useState([]);
  const [columnTitles, setColumnTitles] = useState([]);
  const [fileName, setFileName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [columnMapping, setColumnMapping] = useState({});
  const [searchKeyword, setSearchKeyword] = useState("");

  const editBidangKeahlianFormRef = useRef();
  const addBidangKeahlianFormRef = useRef();

  const fetchBidangKeahlian = async () => {
    try {
      const result = await getBidangKeahlian();
      const { content, statusCode } = result.data;

      if (statusCode === 200) {
        setBidangKeahlians(content);
      } else {
        message.error("Gagal mengambil data");
      }
    } catch (error) {
      message.error("Terjadi kesalahan: " + error.message);
    }
  };

  const handleEditBidangKeahlian = (row) => {
    setCurrentRowData({ ...row });
    setEditBidangKeahlianModalVisible(true);
  };

  const handleDeleteBidangKeahlian = (row) => {
    const { id } = row;

    Modal.confirm({
      title: "Konfirmasi",
      content: "Apakah Anda yakin ingin menghapus data ini?",
      okText: "Ya",
      okType: "danger",
      cancelText: "Tidak",
      onOk: async () => {
        try {
          await deleteBidangKeahlian({ id });
          message.success("Berhasil dihapus");
          fetchBidangKeahlian();
        } catch (error) {
          message.error("Gagal menghapus: " + error.message);
        }
      },
    });
  };

  const handleEditBidangKeahlianOk = () => {
    const form = editBidangKeahlianFormRef.current?.props.form;
    form.validateFields((err, values) => {
      if (err) {
        message.error("Harap isi semua field yang diperlukan");
        return;
      }

      setEditBidangKeahlianModalLoading(true);
      editBidangKeahlian(values, values.id)
        .then((response) => {
          if (response.data.statusCode === 200) {
            form.resetFields();
            setEditBidangKeahlianModalVisible(false);
            setEditBidangKeahlianModalLoading(false);
            message.success("Berhasil diubah!");
            fetchBidangKeahlian();
          } else {
            throw new Error(response.data.message);
          }
        })
        .catch((error) => {
          setEditBidangKeahlianModalLoading(false);
          message.error("Gagal mengubah: " + error.message);
        });
    });
  };

  const handleCancel = () => {
    setEditBidangKeahlianModalVisible(false);
    setAddBidangKeahlianModalVisible(false);
  };

  const handleAddBidangKeahlian = () => {
    setAddBidangKeahlianModalVisible(true);
  };

  const handleAddBidangKeahlianOk = () => {
    const form = addBidangKeahlianFormRef.current?.props.form;
    form.validateFields((err, values) => {
      if (err) {
        message.error("Harap isi semua field yang diperlukan");
        return;
      }

      setAddBidangKeahlianModalLoading(true);
      addBidangKeahlian(values)
        .then((response) => {
          if (response.data.statusCode === 200) {
            form.resetFields();
            setAddBidangKeahlianModalVisible(false);
            setAddBidangKeahlianModalLoading(false);
            message.success("Berhasil ditambahkan!");
            fetchBidangKeahlian();
          } else {
            throw new Error(response.data.message);
          }
        })
        .catch((error) => {
          setAddBidangKeahlianModalLoading(false);
          message.error("Gagal menambahkan: " + error.message);
        });
    });
  };

  const handleFileImport = (file) => {
    const reader = new FileReader();
    const fileExtension = file.name.split(".").pop().toLowerCase();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        let newImportedData = [];
        let newColumnTitles = [];
        const newFileName = file.name.toLowerCase();

        if (fileExtension === "csv") {
          const text = new TextDecoder("utf-8").decode(data);
          const rows = text.split("\n").map((row) => row.split(","));
          newColumnTitles = rows[0];
          newImportedData = rows.slice(1);
        } else if (fileExtension === "xlsx") {
          const workbook = read(data, { type: "array" });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = utils.sheet_to_json(worksheet, { header: 1 });
          newColumnTitles = jsonData[0];
          newImportedData = jsonData.slice(1);
        } else {
          message.error(
            "Format file tidak didukung. Harap unggah file CSV atau Excel."
          );
          return;
        }

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
          id: row[columnMapping["ID Bidang"]],
          bidang: row[columnMapping["Nama Bidang Keahlian"]],
          school_id: row[columnMapping["ID Sekolah"]],
        };

        if (!dataToSave.id || !dataToSave.bidang || !dataToSave.school_id) {
          errorCount++;
          continue;
        }

        const existingBidangKeahlianIndex = bidangKeahlians.findIndex(
          (p) => p.id === dataToSave.id
        );

        try {
          if (existingBidangKeahlianIndex > -1) {
            await editBidangKeahlian(dataToSave, dataToSave.id);
            setBidangKeahlians((prev) => {
              const updated = [...prev];
              updated[existingBidangKeahlianIndex] = dataToSave;
              return updated;
            });
            successRecords.push(dataToSave);
          } else {
            await addBidangKeahlian(dataToSave);
            setBidangKeahlians((prev) => [...prev, dataToSave]);
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
        fetchBidangKeahlian();
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
    fetchBidangKeahlian();
  }, []);

  const title = (
    <Row gutter={[16, 16]} justify="start" style={{ paddingLeft: 9 }}>
      <Col xs={24} sm={12} md={8} lg={6} xl={6}>
        <Button type="primary" onClick={handleAddBidangKeahlian}>
          Tambahkan Bidang Keahlian
        </Button>
      </Col>
      <Col xs={24} sm={12} md={8} lg={6} xl={6}>
        <Button onClick={() => setImportModalVisible(true)}>Import File</Button>
      </Col>
    </Row>
  );

  const cardContent = `Di sini, Anda dapat mengelola bidang keahlian di sistem, seperti menambahkan bidang keahlian baru, atau mengubah bidang keahlian yang sudah ada di sistem.`;

  return (
    <div className="app-container">
      <TypingCard title="Manajemen Bidang Keahlian" source={cardContent} />
      <br />
      <Card title={title}>
        <Table
          bordered
          rowKey="id"
          dataSource={bidangKeahlians}
          pagination={{ pageSize: 10 }}
        >
          <Column
            title="Sekolah"
            dataIndex="school.name"
            key="school.name"
            align="center"
          />
          <Column
            title="ID Bidang Keahlian"
            dataIndex="id"
            key="id"
            align="center"
          />
          <Column
            title="Nama Bidang Keahlian"
            dataIndex="bidang"
            key="bidang"
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
                  onClick={() => handleEditBidangKeahlian(row)}
                />
                <Divider type="vertical" />
                <Button
                  type="primary"
                  shape="circle"
                  icon="delete"
                  title="menghapus"
                  onClick={() => handleDeleteBidangKeahlian(row)}
                />
              </span>
            )}
          />
        </Table>
      </Card>

      <EditBidangKeahlianForm
        currentRowData={currentRowData}
        wrappedComponentRef={editBidangKeahlianFormRef}
        visible={editBidangKeahlianModalVisible}
        confirmLoading={editBidangKeahlianModalLoading}
        onCancel={handleCancel}
        onOk={handleEditBidangKeahlianOk}
      />

      <AddBidangKeahlianForm
        wrappedComponentRef={addBidangKeahlianFormRef}
        visible={addBidangKeahlianModalVisible}
        confirmLoading={addBidangKeahlianModalLoading}
        onCancel={handleCancel}
        onOk={handleAddBidangKeahlianOk}
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
        <Upload beforeUpload={handleFileImport} accept=".csv,.xlsx,.xls">
          <Button>Pilih File</Button>
        </Upload>
      </Modal>
    </div>
  );
};

export default BidangKeahlian;
