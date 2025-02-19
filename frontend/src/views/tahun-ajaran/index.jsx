/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { Card, Button, Table, message, Modal, Row, Col, Upload } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import {
  getTahunAjaran,
  deleteTahunAjaran,
  addTahunAjaran,
} from "@/api/tahun-ajaran";
import TypingCard from "@/components/TypingCard";
import AddTahunAjaranForm from "./forms/add-tahun-ajaran-form";
import EditTahunAjaranForm from "./forms/edit-tahun-ajaran-form";

const TahunAjaran = () => {
  const [tahunAjaran, setTahunAjaran] = useState([]);
  const [addTahunAjaranModalVisible, setAddTahunAjaranModalVisible] =
    useState(false);
  const [addTahunAjaranModalLoading, setAddTahunAjaranModalLoading] =
    useState(false);
  const [editTahunAjaranModalVisible, setEditTahunAjaranModalVisible] =
    useState(false);
  const [editTahunAjaranModalLoading, setEditTahunAjaranModalLoading] =
    useState(false);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [currentRowData, setCurrentRowData] = useState({});

  useEffect(() => {
    fetchTahunAjaran();
  }, []);

  const fetchTahunAjaran = async () => {
    try {
      const result = await getTahunAjaran();
      if (
        result.data.statusCode === 200 &&
        Array.isArray(result.data.content)
      ) {
        setTahunAjaran(result.data.content);
      } else {
        setTahunAjaran([]);
        message.error("Gagal mengambil data");
      }
    } catch (error) {
      setTahunAjaran([]);
      message.error("Terjadi kesalahan: " + error.message);
    }
  };

  const handleDeleteTahunAjaran = (row) => {
    Modal.confirm({
      title: "Konfirmasi",
      content: "Apakah Anda yakin ingin menghapus data ini?",
      okText: "Ya",
      okType: "danger",
      cancelText: "Tidak",
      onOk: async () => {
        try {
          await deleteTahunAjaran({ id: row.id });
          message.success("Berhasil dihapus");
          fetchTahunAjaran();
        } catch (error) {
          message.error("Gagal menghapus: " + error.message);
        }
      },
    });
  };

  const handleEditTahunAjaran = (row) => {
    setCurrentRowData({ ...row });
    setEditTahunAjaranModalVisible(true);
  };

  const handleAddTahunAjaran = () => {
    setAddTahunAjaranModalVisible(true);
  };

  const handleAddTahunAjaranOk = async (values) => {
    setAddTahunAjaranModalLoading(true);
    try {
      await addTahunAjaran(values);
      message.success("Berhasil menambahkan");
      fetchTahunAjaran();
      setAddTahunAjaranModalVisible(false);
    } catch (error) {
      message.error("Gagal menambahkan: " + error.message);
    } finally {
      setAddTahunAjaranModalLoading(false);
    }
  };

  const handleCancel = () => {
    setAddTahunAjaranModalVisible(false);
    setEditTahunAjaranModalVisible(false);
  };

  const renderColumns = () => [
    {
      title: "ID Tahun Ajaran",
      dataIndex: "idTahun",
      key: "idTahun",
      align: "center",
    },
    {
      title: "Tahun Ajaran",
      dataIndex: "tahunAjaran",
      key: "tahunAjaran",
      align: "center",
    },
    {
      title: "Operasi",
      key: "action",
      align: "center",
      render: (text, row) => (
        <span>
          <Button
            type="primary"
            shape="circle"
            icon={<EditOutlined />}
            onClick={() => handleEditTahunAjaran(row)}
          />
          <Button
            type="primary"
            danger
            shape="circle"
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteTahunAjaran(row)}
          />
        </span>
      ),
    },
  ];

  return (
    <div className="app-container">
      <TypingCard
        title="Manajemen Tahun Ajaran"
        source="Di sini, Anda dapat mengelola tahun ajaran di sistem."
      />
      <br />
      <Card
        title={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddTahunAjaran}
          >
            Tambah Tahun Ajaran
          </Button>
        }
      >
        <Table
          rowKey="idTahun"
          dataSource={tahunAjaran}
          columns={renderColumns()}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <AddTahunAjaranForm
        visible={addTahunAjaranModalVisible}
        confirmLoading={addTahunAjaranModalLoading}
        onCancel={handleCancel}
        onOk={handleAddTahunAjaranOk}
      />

      <EditTahunAjaranForm
        currentRowData={currentRowData}
        visible={editTahunAjaranModalVisible}
        confirmLoading={editTahunAjaranModalLoading}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default TahunAjaran;
