/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Table,
  message,
  Modal,
  Row,
  Col,
  Upload,
  Divider,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { getKelas, deleteKelas, addKelas } from "@/api/kelas";
import TypingCard from "@/components/TypingCard";
import AddKelasForm from "./forms/add-kelas-form";
import EditKelasForm from "./forms/edit-kelas-form";

const Kelas = () => {
  const [kelas, setKelas] = useState([]);
  const [addKelasModalVisible, setAddKelasModalVisible] = useState(false);
  const [addKelasModalLoading, setAddKelasModalLoading] = useState(false);
  const [editKelasModalVisible, setEditKelasModalVisible] = useState(false);
  const [editKelasModalLoading, setEditKelasModalLoading] = useState(false);
  const [currentRowData, setCurrentRowData] = useState({});

  useEffect(() => {
    fetchKelas();
  }, []);

  const fetchKelas = async () => {
    try {
      const result = await getKelas();
      if (
        result.data.statusCode === 200 &&
        Array.isArray(result.data.content)
      ) {
        setKelas(result.data.content);
      } else {
        setKelas([]);
        message.error("Gagal mengambil data");
      }
    } catch (error) {
      setKelas([]);
      message.error("Terjadi kesalahan: " + error.message);
    }
  };

  const handleDeleteKelas = (row) => {
    Modal.confirm({
      title: "Konfirmasi",
      content: "Apakah Anda yakin ingin menghapus data ini?",
      okText: "Ya",
      okType: "danger",
      cancelText: "Tidak",
      onOk: async () => {
        try {
          await deleteKelas({ id: row.id });
          message.success("Berhasil dihapus");
          fetchKelas();
        } catch (error) {
          message.error("Gagal menghapus: " + error.message);
        }
      },
    });
  };

  const handleEditKelas = (row) => {
    setCurrentRowData({ ...row });
    setEditKelasModalVisible(true);
  };

  const handleAddKelas = () => {
    setAddKelasModalVisible(true);
  };

  const handleAddKelasOk = async (values) => {
    setAddKelasModalLoading(true);
    try {
      await addKelas(values);
      message.success("Berhasil menambahkan");
      fetchKelas();
      setAddKelasModalVisible(false);
    } catch (error) {
      message.error("Gagal menambahkan: " + error.message);
    } finally {
      setAddKelasModalLoading(false);
    }
  };

  const handleCancel = () => {
    setAddKelasModalVisible(false);
    setEditKelasModalVisible(false);
  };

  const renderColumns = () => [
    {
      title: "ID Kelas",
      dataIndex: "idKelas",
      key: "idKelas",
      align: "center",
    },
    {
      title: "Nama Kelas",
      dataIndex: "namaKelas",
      key: "namaKelas",
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
            onClick={() => handleEditKelas(row)}
          />
          <Divider type="vertical" />
          <Button
            type="primary"
            danger
            shape="circle"
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteKelas(row)}
          />
        </span>
      ),
    },
  ];

  return (
    <div className="app-container">
      <TypingCard
        title="Manajemen Kelas"
        source="Di sini, Anda dapat mengelola kelas di sistem."
      />
      <br />
      <Card
        title={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddKelas}
          >
            Tambah Kelas
          </Button>
        }
      >
        <Table
          rowKey="idKelas"
          dataSource={kelas}
          columns={renderColumns()}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <AddKelasForm
        visible={addKelasModalVisible}
        confirmLoading={addKelasModalLoading}
        onCancel={handleCancel}
        onOk={handleAddKelasOk}
      />

      <EditKelasForm
        currentRowData={currentRowData}
        visible={editKelasModalVisible}
        confirmLoading={editKelasModalLoading}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default Kelas;
