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
import { getMapel, deleteMapel, addMapel } from "@/api/mapel";
import TypingCard from "@/components/TypingCard";
import AddMapelForm from "./forms/add-mapel-form";
import EditMapelForm from "./forms/edit-mapel-form";

const Mapel = () => {
  const [mapel, setMapel] = useState([]);
  const [addMapelModalVisible, setAddMapelModalVisible] = useState(false);
  const [addMapelModalLoading, setAddMapelModalLoading] = useState(false);
  const [editMapelModalVisible, setEditMapelModalVisible] = useState(false);
  const [editMapelModalLoading, setEditMapelModalLoading] = useState(false);
  const [currentRowData, setCurrentRowData] = useState({});

  useEffect(() => {
    fetchMapel();
  }, []);

  const fetchMapel = async () => {
    try {
      const result = await getMapel();
      if (
        result.data.statusCode === 200 &&
        Array.isArray(result.data.content)
      ) {
        setMapel(result.data.content);
      } else {
        setMapel([]);
        message.error("Gagal mengambil data");
      }
    } catch (error) {
      setMapel([]);
      message.error("Terjadi kesalahan: " + error.message);
    }
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
          message.error("Gagal menghapus: " + error.message);
        }
      },
    });
  };

  const handleEditMapel = (row) => {
    setCurrentRowData({ ...row });
    setEditMapelModalVisible(true);
  };

  const handleAddMapel = () => {
    setAddMapelModalVisible(true);
  };

  const handleAddMapelOk = async (values) => {
    setAddMapelModalLoading(true);
    try {
      await addMapel(values);
      message.success("Berhasil menambahkan");
      fetchMapel();
      setAddMapelModalVisible(false);
    } catch (error) {
      message.error("Gagal menambahkan: " + error.message);
    } finally {
      setAddMapelModalLoading(false);
    }
  };

  const handleCancel = () => {
    setAddMapelModalVisible(false);
    setEditMapelModalVisible(false);
  };

  const renderColumns = () => [
    {
      title: "ID Mapel",
      dataIndex: "idMapel",
      key: "idMapel",
      align: "center",
    },
    {
      title: "Nama Mapel",
      dataIndex: "name",
      key: "name",
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
            onClick={() => handleEditMapel(row)}
          />
          <Divider type="vertical" />
          <Button
            type="primary"
            danger
            shape="circle"
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteMapel(row)}
          />
        </span>
      ),
    },
  ];

  return (
    <div className="app-container">
      <TypingCard
        title="Manajemen Mapel"
        source="Di sini, Anda dapat mengelola mapel di sistem."
      />
      <br />
      <Card
        title={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddMapel}
          >
            Tambah Mapel
          </Button>
        }
      >
        <Table
          rowKey="idMapel"
          dataSource={mapel}
          columns={renderColumns()}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <AddMapelForm
        visible={addMapelModalVisible}
        confirmLoading={addMapelModalLoading}
        onCancel={handleCancel}
        onOk={handleAddMapelOk}
      />

      <EditMapelForm
        currentRowData={currentRowData}
        visible={editMapelModalVisible}
        confirmLoading={editMapelModalLoading}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default Mapel;
