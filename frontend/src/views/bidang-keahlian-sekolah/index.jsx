/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef, useCallback } from "react";
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
  UploadOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import {
  getBidangSekolah,
  deleteBidangSekolah,
  editBidangSekolah,
  addBidangSekolah,
} from "@/api/bidangKeahlianSekolah";
import { useSelector } from "react-redux";
import TypingCard from "@/components/TypingCard";
import EditBidangSekolahForm from "./forms/edit-bidang-keahlian-sekolah-form";
import AddBidangSekolahForm from "./forms/add-bidang-keahlian-sekolah-form";
import { reqUserInfo, getUserById } from "@/api/user";
import { read, utils } from "xlsx";

const { Column } = Table;

const BidangSekolah = () => {
  const [bidangSekolah, setBidangSekolah] = useState([]);
  const [editBidangSekolahModalVisible, setEditBidangSekolahModalVisible] =
    useState(false);
  const [editBidangSekolahModalLoading, setEditBidangSekolahModalLoading] =
    useState(false);
  const [currentRowData, setCurrentRowData] = useState({});
  const [addBidangSekolahModalVisible, setAddBidangSekolahModalVisible] =
    useState(false);
  const [addBidangSekolahModalLoading, setAddBidangSekolahModalLoading] =
    useState(false);
  const [importedData, setImportedData] = useState([]);
  const [columnTitles, setColumnTitles] = useState([]);
  const [fileName, setFileName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [columnMapping, setColumnMapping] = useState({});
  const [searchKeyword, setSearchKeyword] = useState("");
  const [tableLoading, setTableLoading] = useState(false);
  const [userIdJson, setUserIdJson] = useState("");

  const editBidangSekolahFormRef = useRef();
  const addBidangSekolahFormRef = useRef();

  useEffect(() => {
    const initializeData = async () => {
      const userInfoResponse = await reqUserInfo();
      const { id: userId } = userInfoResponse.data;

      await getUserInfoJson(userId);
    };

    initializeData();
  }, []);

  const fetchBidangSekolah = useCallback(async () => {
    setTableLoading(true);
    try {
      const result = await getBidangSekolah();
      const { content, statusCode } = result.data;
      if (statusCode === 200) {
        const filteredContent = content.filter(
          (item) => item.school?.idSchool === userIdJson
        );
        setBidangSekolah(filteredContent);
      } else {
        message.error("Gagal mengambil data");
      }
    } catch (error) {
      message.error("Terjadi kesalahan: " + error.message);
    } finally {
      setTableLoading(false);
    }
  }, [userIdJson]);

  useEffect(() => {
    if (userIdJson) {
      fetchBidangSekolah();
    }
  }, [userIdJson, fetchBidangSekolah]);

  const getUserInfoJson = async (userId) => {
    const result = await getUserById(userId);
    const { content, statusCode } = result.data;
    if (statusCode === 200) {
      setUserIdJson(content[0].school.idSchool); // Ubah dari userId ke schoolId
    }
  };

  const handleDelete = (row) => {
    const { idBidangSekolah } = row;
    Modal.confirm({
      title: "Konfirmasi",
      content: "Apakah Anda yakin ingin menghapus data ini?",
      okText: "Ya",
      okType: "danger",
      cancelText: "Tidak",
      onOk: async () => {
        try {
          await deleteBidangSekolah({ idBidangSekolah });
          message.success("Berhasil dihapus");
          fetchBidangSekolah();
        } catch (error) {
          message.error("Gagal menghapus: " + error.message);
        }
      },
    });
  };

  const handleEditOk = async (values) => {
    setEditBidangSekolahModalLoading(true);
    try {
      const updatedValues = {
        idBidangSekolah: values.idBidangSekolah,
        namaBidangSekolah: values.namaBidangSekolah,
        idSekolah: values.idSchool,
        idBidangKeahlian: values.id,
      };

      console.log("respon data", updatedValues);
      await editBidangSekolah(updatedValues, currentRowData.idBidangSekolah);
      setEditBidangSekolahModalVisible(false);
      setEditBidangSekolahModalLoading(false);
      message.success("Berhasil mengubah");
      fetchBidangSekolah();
    } catch (error) {
      setEditBidangSekolahModalLoading(false);
      message.error("Gagal mengubah: " + error.message);
    }
  };

  const handleEdit = (row) => {
    setCurrentRowData({ ...row });
    setEditBidangSekolahModalVisible(true);
  };

  const handleCancel = () => {
    setEditBidangSekolahModalVisible(false);
    setAddBidangSekolahModalVisible(false);
  };

  const handleAdd = () => {
    setAddBidangSekolahModalVisible(true);
  };
  const handleAddOk = async (values) => {
    setAddBidangSekolahModalLoading(true);
    try {
      const updatedValues = {
        idBidangSekolah: null,
        namaBidangSekolah: values.namaBidangSekolah,
        idSekolah: values.idSchool,
        idBidangKeahlian: values.id,
      };
      console.log("respon data", updatedValues);
      await addBidangSekolah(updatedValues);
      setAddBidangSekolahModalLoading(false);
      setAddBidangSekolahModalLoading(false);
      message.success("Berhasil menambahkan");
      fetchBidangSekolah();
    } catch (error) {
      setAddBidangSekolahModalLoading(false);
      message.error("Gagal menambahkan: " + error.message);
    } finally {
      setAddBidangSekolahModalVisible(false);
    }
  };

  const renderColumns = () => [
    {
      title: "No.",
      dataIndex: "index",
      key: "index",
      align: "center",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Bidang Keahlian Sekolah",
      dataIndex: "namaBidangSekolah",
      key: "namaBidangSekolah",
      align: "center",
    },
    {
      title: "Sekolah",
      dataIndex: ["school", "nameSchool"],
      key: "nameSchool",
      align: "center",
    },
    {
      title: "Bidang Keahlian",
      dataIndex: ["bidangKeahlian", "bidang"],
      key: "bidang",
      align: "center",
    },
    {
      title: "Operasi",
      key: "action",
      align: "center",
      render: (_, row) => (
        <span>
          <Button
            type="primary"
            shape="circle"
            icon={<EditOutlined />}
            onClick={() => handleEdit(row)}
          />
          <Divider type="vertical" />
          <Button
            type="primary"
            danger
            shape="circle"
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(row)}
          />
        </span>
      ),
    },
  ];

  const renderTable = () => (
    <Table
      rowKey="id"
      dataSource={bidangSekolah}
      columns={renderColumns()}
      pagination={{ pageSize: 10 }}
    />
  );

  const renderButtons = () => (
    <Row gutter={[16, 16]} justify="start">
      <Col>
        <Button
          type="primary"
          onClick={() => setAddBidangSekolahModalVisible(true)}
        >
          Tambahkan Bidang Keahlian Sekolah
        </Button>
      </Col>
      <Col>
        <Button
          icon={<UploadOutlined />}
          onClick={() => setImportModalVisible(true)}
        >
          Import File
        </Button>
      </Col>
    </Row>
  );

  return (
    <div className="app-container">
      <TypingCard
        title="Manajemen Analisa Bidang Keahlian Sekolah"
        source="Di sini, Anda dapat mengelola Analisa Bidang Keahlian Sekolah di sistem."
      />
      <br />
      <Card title={renderButtons()}>{renderTable()}</Card>

      <AddBidangSekolahForm
        wrappedComponentRef={addBidangSekolahFormRef}
        visible={addBidangSekolahModalVisible}
        confirmLoading={addBidangSekolahModalLoading}
        onCancel={handleCancel}
        onOk={handleAddOk}
      />

      <EditBidangSekolahForm
        wrappedComponentRef={editBidangSekolahFormRef}
        currentRowData={currentRowData}
        visible={editBidangSekolahModalVisible}
        confirmLoading={editBidangSekolahModalLoading}
        onCancel={handleCancel}
        onOk={handleEditOk}
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
            onClick={() => {
              /* Implementasi Upload */
            }}
          >
            Upload
          </Button>,
        ]}
      >
        <Upload
          beforeUpload={() => {
            /* Implementasi File Upload */ return false;
          }}
          accept=".csv,.xlsx,.xls"
        >
          <Button>Pilih File</Button>
        </Upload>
      </Modal>
    </div>
  );
};

export default BidangSekolah;
