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
  Divider,
  Upload,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { getSemester, deleteSemester, addSemester } from "@/api/semester";
import TypingCard from "@/components/TypingCard";
import AddSemesterForm from "./forms/add-semester-form";
import EditSemesterForm from "./forms/edit-semester-form";

const Semester = () => {
  const [semesters, setSemesters] = useState([]);
  const [addSemesterModalVisible, setAddSemesterModalVisible] = useState(false);
  const [addSemesterModalLoading, setAddSemesterModalLoading] = useState(false);
  const [editSemesterModalVisible, setEditSemesterModalVisible] =
    useState(false);
  const [editSemesterModalLoading, setEditSemesterModalLoading] =
    useState(false);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [currentRowData, setCurrentRowData] = useState({});

  useEffect(() => {
    fetchSemesters();
  }, []);

  const fetchSemesters = async () => {
    try {
      const result = await getSemester();
      if (
        result.data.statusCode === 200 &&
        Array.isArray(result.data.content)
      ) {
        setSemesters(result.data.content);
      } else {
        setSemesters([]);
        message.error("Gagal mengambil data");
      }
    } catch (error) {
      setSemesters([]);
      message.error("Terjadi kesalahan: " + error.message);
    }
  };

  const handleDeleteSemester = (row) => {
    const { idSemester } = row;
    Modal.confirm({
      title: "Konfirmasi",
      content: "Apakah Anda yakin ingin menghapus data ini?",
      okText: "Ya",
      okType: "danger",
      cancelText: "Tidak",
      onOk: async () => {
        try {
          await deleteSemester({ idSemester });
          message.success("Berhasil dihapus");
          fetchSemesters();
        } catch (error) {
          message.error("Gagal menghapus: " + error.message);
        }
      },
    });
  };

  const handleEditSemester = (row) => {
    setCurrentRowData({ ...row });
    setEditSemesterModalVisible(true);
  };

  const handleAddSemesterOk = async (values) => {
    setAddSemesterModalLoading(true);
    try {
      const updatedData = {
        idSemester: null,
        namaSemester: values.namaSemester,
      };
      await addSemester(updatedData);
      message.success("Berhasil menambahkan");
      fetchSemesters();
      setAddSemesterModalVisible(false);
    } catch (error) {
      message.error("Gagal menambahkan: " + error.message);
    } finally {
      setAddSemesterModalLoading(false);
    }
  };

  const handleCancel = () => {
    setAddSemesterModalVisible(false);
    setEditSemesterModalVisible(false);
  };

  const renderColumns = () => [
    {
      title: "ID Semester",
      dataIndex: "idSemester",
      key: "idSemester",
      align: "center",
    },
    {
      title: "Nama Semester",
      dataIndex: "namaSemester",
      key: "namaSemester",
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
            onClick={() => handleEditSemester(row)}
          />
          <Divider type="vertical" />
          <Button
            type="primary"
            danger
            shape="circle"
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteSemester(row)}
          />
        </span>
      ),
    },
  ];

  const renderTable = () => (
    <Table
      rowKey="idSemester"
      dataSource={semesters}
      columns={renderColumns()}
      pagination={{ pageSize: 10 }}
    />
  );

  const renderButtons = () => (
    <Row gutter={[16, 16]} justify="start">
      <Col>
        <Button type="primary" onClick={() => setAddSemesterModalVisible(true)}>
          Tambahkan Semester
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
        title="Manajemen Semester"
        source="Di sini, Anda dapat mengelola semester di sistem."
      />
      <br />
      <Card title={renderButtons()}>{renderTable()}</Card>

      <AddSemesterForm
        visible={addSemesterModalVisible}
        confirmLoading={addSemesterModalLoading}
        onCancel={handleCancel}
        onOk={handleAddSemesterOk}
      />

      <EditSemesterForm
        currentRowData={currentRowData}
        visible={editSemesterModalVisible}
        confirmLoading={editSemesterModalLoading}
        onCancel={handleCancel}
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
            onClick={() => {}}
          >
            Upload
          </Button>,
        ]}
      >
        <Upload beforeUpload={() => false} accept=".csv,.xlsx,.xls">
          <Button>Pilih File</Button>
        </Upload>
      </Modal>
    </div>
  );
};

export default Semester;
