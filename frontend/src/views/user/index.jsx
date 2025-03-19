/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from "react";
import { Card, Button, Table, message, Col, Row, Divider } from "antd";
import { getUsers, deleteUser, editUser, addUser } from "@/api/user";
import TypingCard from "@/components/TypingCard";
import EditUserForm from "./forms/edit-user-form";
import AddUserForm from "./forms/add-user-form";
import {
  DeleteOutlined,
  EditOutlined,
  UploadOutlined,
  DownloadOutlined,
} from "@ant-design/icons";

const { Column } = Table;

const User = () => {
  const [users, setUsers] = useState([]);
  const [modalState, setModalState] = useState({
    editVisible: false,
    editLoading: false,
    addVisible: false,
    addLoading: false,
  });
  const [currentRowData, setCurrentRowData] = useState({});

  const editFormRef = useRef();
  const addFormRef = useRef();

  const fetchUsers = async () => {
    try {
      const result = await getUsers();
      if (result.data.statusCode === 200) {
        setUsers(result.data.content);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEditUser = (row) => {
    setCurrentRowData({ ...row });
    setModalState((prev) => ({ ...prev, editVisible: true }));
  };

  const handleDeleteUser = async (row) => {
    if (row.id === "admin") {
      message.error("Tidak dapat menghapus Admin!");
      return;
    }

    try {
      await deleteUser({ id: row.id });
      message.success("Berhasil dihapus");
      fetchUsers();
    } catch (error) {
      message.error("Gagal menghapus");
    }
  };

  const handleEditUserOk = () => {
    const form = editFormRef.current?.props.form;
    form?.validateFields(async (err, values) => {
      if (err) return;

      setModalState((prev) => ({ ...prev, editLoading: true }));
      try {
        await editUser(values);
        form.resetFields();
        setModalState((prev) => ({
          ...prev,
          editVisible: false,
          editLoading: false,
        }));
        message.success("Berhasil memperbarui pengguna!");
        fetchUsers();
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
    }));
  };

  const handleAddUser = () => {
    setModalState((prev) => ({ ...prev, addVisible: true }));
  };

  const handleAddUserOk = () => {
    const form = addFormRef.current?.props.form;
    form?.validateFields(async (err, values) => {
      if (err) return;

      setModalState((prev) => ({ ...prev, addLoading: true }));
      try {
        await addUser(values);
        form.resetFields();
        setModalState((prev) => ({
          ...prev,
          addVisible: false,
          addLoading: false,
        }));
        message.success("Berhasil menambahkan pengguna!");
        fetchUsers();
      } catch (error) {
        console.error(error.response?.data);
        message.error("Gagal menambahkan pengguna, silakan coba lagi!");
        setModalState((prev) => ({ ...prev, addLoading: false }));
      }
    });
  };

  const cardContent = `Di sini, Anda dapat mengelola pengguna di sistem, seperti menambahkan pengguna baru, atau mengubah pengguna yang sudah ada di sistem.`;

  const renderColumns = () => [
    { title: "Nama", dataIndex: "name", key: "name", align: "center" },
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
      align: "center",
    },
    { title: "Email", dataIndex: "email", key: "email", align: "center" },
    { title: "Peran", dataIndex: "roles", key: "roles", align: "center" },
    {
      title: "Sekolah",
      key: "school",
      align: "center",
      dataIndex: ["school", "nameSchool"],
    },
    {
      title: "Operasi",
      key: "action",
      width: 120,
      align: "center",
      render: (_, row) => (
        <span>
          <Button
            type="primary"
            shape="circle"
            icon={<EditOutlined />}
            onClick={() => handleEditUser(row)}
          />
          <Divider type="vertical" />
          <Button
            type="primary"
            danger
            shape="circle"
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteUser(row)}
          />
        </span>
      ),
    },
  ];

  const renderTable = () => (
    <Table
      rowKey="id"
      dataSource={users}
      bordered
      columns={renderColumns()}
      pagination={false}
    />
  );

  const renderButtons = () => (
    <Row gutter={[16, 16]} justify="start">
      <Col>
        <Button
          type="primary"
          onClick={() =>
            setModalState((prev) => ({ ...prev, addVisible: true }))
          }
          block
        >
          Tambah Pengguna
        </Button>
      </Col>
      <Col>
        <Button icon={<UploadOutlined />} block>
          Import File
        </Button>
      </Col>
      <Col>
        <Button icon={<DownloadOutlined />} block>
          Download Format CSV
        </Button>
      </Col>
    </Row>
  );

  return (
    <div className="app-container">
      <TypingCard
        title="Manajemen Pengguna"
        source="Di sini, Anda dapat mengelola daftar pengguna di sistem."
      />
      <br />
      <Card title={renderButtons()} style={{ overflowX: "scroll" }}>
        {renderTable()}
      </Card>
      <EditUserForm
        wrappedComponentRef={editFormRef}
        currentRowData={currentRowData}
        visible={modalState.editVisible}
        confirmLoading={modalState.editLoading}
        onCancel={() =>
          setModalState((prev) => ({ ...prev, editVisible: false }))
        }
        onOk={fetchUsers}
      />
      <AddUserForm
        wrappedComponentRef={addFormRef}
        visible={modalState.addVisible}
        confirmLoading={modalState.addLoading}
        onCancel={() =>
          setModalState((prev) => ({ ...prev, addVisible: false }))
        }
        onOk={fetchUsers}
      />
    </div>
  );
};

export default User;
