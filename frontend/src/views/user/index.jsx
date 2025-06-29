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
  Space,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { getUsers, deleteUser, addUser, editUser } from "@/api/user";
import { Skeleton } from "antd";
import Highlighter from "react-highlight-words";
import TypingCard from "@/components/TypingCard";
import AddUserForm from "./forms/add-user-form";
import EditUserForm from "./forms/edit-user-form";
import { useTableSearch } from "@/helper/tableSearchHelper.jsx";
import { reqUserInfo, getUserById } from "@/api/user";
import { set } from "nprogress";
import * as XLSX from "xlsx";

const User = () => {
  const [users, setUsers] = useState([]);
  const [addUserModalVisible, setAddUserModalVisible] = useState(false);
  const [addUserModalLoading, setAddUserModalLoading] = useState(false);
  const [editUserModalVisible, setEditUserModalVisible] = useState(false);
  const [editUserModalLoading, setEditUserModalLoading] = useState(false);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [currentRowData, setCurrentRowData] = useState({});
  const [searchKeyword, setSearchKeyword] = useState("");
  const [userIdJson, setUserIdJson] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUserRole, setCurrentUserRole] = useState("");
  const [user, setUser] = useState(null);
  const [importFile, setImportFile] = useState(null);

  // Fungsi Helper Table Search
  const { getColumnSearchProps } = useTableSearch();

  const editUserFormRef = useRef();
  const addUserFormRef = useRef();

  const fetchUserInfo = async () => {
    try {
      const response = await reqUserInfo();
      if (response && response.data) {
        setUser(response.data);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Error fetching user info:", error);
      setUser(null);
    }
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getUsers();
      const { content, statusCode } = result.data;
      if (statusCode === 200) {
        let filteredUsers = content;
        // ✅ Ubah ID role menjadi nama
        const transformedUsers = filteredUsers.map((user) => ({
          ...user,
          roles: mapRoleToName(user.roles), // ubah ID jadi nama
        }));

        setUsers(transformedUsers);
      } else {
        message.error("Gagal mengambil data");
      }
    } catch (error) {
      message.error("Terjadi kesalahan: " + error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchUserInfo();
  }, [fetchUsers]);

  const handleDeleteUser = (row) => {
    const { id } = row;
    Modal.confirm({
      title: "Konfirmasi",
      content: "Apakah Anda yakin ingin menghapus data ini?",
      okText: "Ya",
      okType: "danger",
      cancelText: "Tidak",
      onOk: async () => {
        try {
          console.log("ID User yang akan dihapus:", id);
          await deleteUser({ id });
          message.success("Berhasil dihapus");
          fetchUsers();
        } catch (error) {
          message.error("Gagal menghapus: " + error.message);
        }
      },
    });
  };

  const handleImportFile = (file) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      // Ambil header dan data
      const [header, ...rows] = jsonData;
      // Index kolom sesuai header
      const idx = (col) => header.indexOf(col);

      // Loop dan masukkan satu-satu
      // filepath: e:\Skripsi\Skripsi\frontend\src\views\user\index.jsx
      for (const row of rows) {
        if (!row[idx("username")]) continue;
        const clean = (val) => (val ?? "").toString().replace(/['"`\s]/g, ""); // hapus petik satu, dua, backtick, dan spasi

        const userData = {
          name: clean(row[idx("name")]),
          username: clean(row[idx("username")]),
          email: row[idx("email")] === "-" ? "" : clean(row[idx("email")]),
          password: clean(row[idx("password")]),
          roles: clean(row[idx("roles")]),
          schoolId: user?.school_id, // Ambil ID sekolah dari user yang login
        };

        try {
          await handleAddUserOk(userData);
        } catch (err) {
          message.error(
            `Gagal tambah user ${userData.username}: ${err.message}`
          );
        }
      }
      message.success("Import selesai");
      setImportModalVisible(false);
      fetchUsers();
    };
    reader.readAsArrayBuffer(file);
    return false; // Supaya Upload tidak auto-upload ke server
  };

  const handleEditUser = (row) => {
    setCurrentRowData({ ...row });
    setEditUserModalVisible(true);
  };

  const handleAddUserOk = async (values) => {
    setAddUserModalLoading(true);
    try {
      const updatedData = {
        idUser: null,
        name: values.name,
        username: values.username,
        email: values.email,
        password: values.password,
        roles: values.roles,
        schoolId: values.schoolId,
      };
      // console.log("Updated Data:", updatedData);
      await addUser(updatedData);
      setAddUserModalVisible(false);
      message.success("Berhasil menambahkan");
      fetchUsers();
    } catch (error) {
      setAddUserModalVisible(false);
      message.error("Gagal menambahkan: " + error.message);
    } finally {
      setAddUserModalLoading(false);
    }
  };

  const handleEditUserOk = async (values) => {
    setEditUserModalLoading(true);
    try {
      const updatedData = {
        idUser: values.id || currentRowData.id,
        name: values.name,
        username: values.username,
        email: values.email,
        roles: values.roles,
        schoolId: values.idSchool,
      };

      // Tambahkan password jika ada
      if (values.password && values.password.trim() !== "") {
        updatedData.password = values.password;
      }

      console.log("Updated Data:", updatedData);
      await editUser(updatedData, updatedData.idUser);

      setEditUserModalVisible(false);
      message.success("Berhasil mengedit");
      fetchUsers();
    } catch (error) {
      setEditUserModalVisible(false);
      message.error("Gagal mengedit: " + error.message);
    } finally {
      setEditUserModalLoading(false);
    }
  };

  const handleCancel = () => {
    setAddUserModalVisible(false);
    setEditUserModalVisible(false);
  };

  const handleSearch = (keyword) => {
    setSearchKeyword(keyword);
    getUsers();
  };

  const mapRoleToName = (roleId) => {
    switch (roleId) {
      case "1":
        return "Administrator";
      case "2":
        return "Operator";
      case "3":
        return "Guru";
      case "4":
        return "Tidak Diketahui";
      case "5":
        return "Siswa";
      default:
        return "Tidak Diketahui";
    }
  };

  const renderColumns = () => [
    {
      title: "No",
      dataIndex: "index",
      key: "index",
      align: "center",
      render: (_, __, index) => index + 1,
    },
    ...(user?.roles === "ROLE_ADMINISTRATOR"
      ? [
          {
            title: "Sekolah",
            dataIndex: ["school", "nameSchool"],
            key: "nameSchool",
            align: "center",
            ...getColumnSearchProps("school", "school.nameSchool"),
            sorter: (a, b) =>
              a.school.nameSchool.localeCompare(b.school.nameSchool),
          },
        ]
      : []),
    {
      title: "Nama",
      dataIndex: "name",
      key: "name",
      align: "center",
      ...getColumnSearchProps("name"),
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
      align: "center",
      ...getColumnSearchProps("username"),
      sorter: (a, b) => a.username.localeCompare(b.username),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      align: "center",
      ...getColumnSearchProps("email"),
      sorter: (a, b) => a.email.localeCompare(b.email),
    },
    {
      title: "Roles",
      dataIndex: "roles",
      key: "roles",
      align: "center",
      ...getColumnSearchProps("roles"),
      sorter: (a, b) => a.roles.localeCompare(b.roles),
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
      columns={renderColumns()}
      pagination={{ pageSize: 10 }}
    />
  );

  const renderButtons = () => (
    <Row gutter={[16, 16]} justify="start">
      <Col>
        <Button type="primary" onClick={() => setAddUserModalVisible(true)}>
          Tambahkan User
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
        title="Manajemen User"
        source="Di sini, Anda dapat mengelola user di sistem."
      />
      <br />
      {loading ? (
        <Card>
          <Skeleton active paragraph={{ rows: 10 }} />
        </Card>
      ) : (
        <Card style={{ overflowX: "scroll" }}>
          {/* Baris untuk tombol dan pencarian */}
          <Row
            justify="space-between"
            align="middle"
            style={{ marginBottom: 16 }}
          >
            {/* Tombol Tambah & Import */}
            {renderButtons()}

            {/* Kolom Pencarian */}
            <Col>
              <Input.Search
                key="search"
                placeholder="Cari user..."
                allowClear
                enterButton
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: 300 }}
              />
            </Col>
          </Row>

          {/* Tabel */}
          {renderTable()}

          <AddUserForm
            wrappedComponentRef={addUserFormRef}
            visible={addUserModalVisible}
            confirmLoading={addUserModalLoading}
            onCancel={handleCancel}
            onOk={handleAddUserOk}
          />

          <EditUserForm
            wrappedComponentRef={editUserFormRef}
            currentRowData={currentRowData}
            visible={editUserModalVisible}
            confirmLoading={editUserModalLoading}
            onCancel={handleCancel}
            onOk={handleEditUserOk}
          />
        </Card>
      )}

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
              if (importFile) {
                handleImportFile(importFile);
              } else {
                message.warning("Pilih file terlebih dahulu!");
              }
            }}
          >
            Upload
          </Button>,
        ]}
      >
        <Upload
          beforeUpload={(file) => {
            setImportFile(file);
            return false; // Jangan auto-upload
          }}
          accept=".csv,.xlsx,.xls"
          showUploadList={false}
        >
          <Button>Pilih File</Button>
        </Upload>
        {importFile && (
          <div style={{ marginTop: 8 }}>
            <b>File terpilih:</b> {importFile.name}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default User;
