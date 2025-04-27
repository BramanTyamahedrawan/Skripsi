/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef, useCallback } from "react";
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
  Input,
  Space,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { getKelas, deleteKelas, addKelas, editKelas } from "@/api/kelas";
import TypingCard from "@/components/TypingCard";
import AddKelasForm from "./forms/add-kelas-form";
import EditKelasForm from "./forms/edit-kelas-form";
import { Skeleton } from "antd";
import Highlighter from "react-highlight-words";
import { reqUserInfo, getUserById } from "@/api/user";

const Kelas = () => {
  const [kelas, setKelas] = useState([]);
  const [addKelasModalVisible, setAddKelasModalVisible] = useState(false);
  const [addKelasModalLoading, setAddKelasModalLoading] = useState(false);
  const [editKelasModalVisible, setEditKelasModalVisible] = useState(false);
  const [editKelasModalLoading, setEditKelasModalLoading] = useState(false);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [currentRowData, setCurrentRowData] = useState({});
  const [searchKeyword, setSearchKeyword] = useState("");
  const [userIdJson, setUserIdJson] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const searchInput = useRef(null);

  const editKelasFormRef = useRef();
  const addKelasFormRef = useRef();

  useEffect(() => {
    const initializeData = async () => {
      const userInfoResponse = await reqUserInfo();
      const { id: userId } = userInfoResponse.data;

      await getUserInfoJson(userId);
    };

    initializeData();
  }, []);

  const fetchKelas = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getKelas();
      const { content, statusCode } = result.data;
      if (statusCode === 200) {
        const filteredContent = content.filter(
          (item) => item.school?.idSchool === userIdJson
        );
        setKelas(filteredContent);
      } else {
        message.error("Gagal mengambil data");
      }
    } catch (error) {
      message.error("Terjadi kesalahan: " + error.message);
    } finally {
      setLoading(false);
    }
  }, [userIdJson]);

  useEffect(() => {
    if (userIdJson) {
      fetchKelas();
    }
  }, [userIdJson, fetchKelas]);

  const filteredData = kelas.filter((item) => {
    const query = searchQuery.toLowerCase();
    return (
      (item?.namaKelas?.toLowerCase() || "").includes(query) ||
      (item?.nameSchool?.toLowerCase() || "").includes(query)
    );
  });

  const getUserInfoJson = async (userId) => {
    const result = await getUserById(userId);
    const { content, statusCode } = result.data;
    if (statusCode === 200) {
      setUserIdJson(content[0].school.idSchool); // Ubah dari userId ke schoolId
    }
  };

  const handleDeleteKelas = (row) => {
    const { idKelas } = row;
    Modal.confirm({
      title: "Konfirmasi",
      content: "Apakah Anda yakin ingin menghapus data ini?",
      okText: "Ya",
      okType: "danger",
      cancelText: "Tidak",
      onOk: async () => {
        try {
          await deleteKelas({ idKelas });
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
      const updatedData = {
        idKelas: null,
        namaKelas: values.namaKelas,
        idSekolah: values.idSchool,
      };
      await addKelas(updatedData);
      setAddKelasModalVisible(false);
      message.success("Berhasil menambahkan");
      fetchKelas();
    } catch (error) {
      setAddKelasModalVisible(false);
      message.error("Gagal menambahkan: " + error.message);
    } finally {
      setAddKelasModalLoading(false);
    }
  };

  const handleEditKelasOk = async (values) => {
    setEditKelasModalLoading(true);
    try {
      const updatedData = {
        idKelas: values.idKelas,
        namaKelas: values.namaKelas,
        idSekolah: values.idSchool,
      };
      console.log("Updated Data:", updatedData);
      await editKelas(updatedData, currentRowData.idKelas);
      setEditKelasModalVisible(false);
      setEditKelasModalLoading(false);
      message.success("Berhasil mengedit");
      fetchKelas();
    } catch (error) {
      setEditKelasModalVisible(false);
      message.error("Gagal mengedit: " + error.message);
    } finally {
      setEditKelasModalLoading(false);
    }
  };

  const handleCancel = () => {
    setAddKelasModalVisible(false);
    setEditKelasModalVisible(false);
  };

  const handleSearchTable = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText("");
  };

  const handleSearch = (keyword) => {
    setSearchKeyword(keyword);
    getKelas();
  };

  const getColumnSearchProps = (dataIndex, nestedPath) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() =>
            handleSearchTable(selectedKeys, confirm, dataIndex)
          }
          style={{ marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearchTable(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({ closeDropdown: false });
              setSearchText(selectedKeys[0]);
              setSearchedColumn(dataIndex);
            }}
          >
            Filter
          </Button>
          <Button type="link" size="small" onClick={() => close()}>
            Close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />
    ),
    onFilter: (value, record) => {
      if (nestedPath) {
        const nestedValue = nestedPath
          .split(".")
          .reduce((obj, key) => obj?.[key], record);
        return nestedValue
          ?.toString()
          .toLowerCase()
          .includes(value.toLowerCase());
      }
      return record[dataIndex]
        ?.toString()
        .toLowerCase()
        .includes(value.toLowerCase());
    },
    filterDropdownProps: {
      onOpenChange(open) {
        if (open) setTimeout(() => searchInput.current?.select(), 100);
      },
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text?.toString() || ""}
        />
      ) : (
        text
      ),
  });

  const renderColumns = () => [
    {
      title: "No",
      dataIndex: "index",
      key: "index",
      align: "center",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Nama Kelas",
      dataIndex: "namaKelas",
      key: "namaKelas",
      align: "center",
      ...getColumnSearchProps("namaKelas"),
      sorter: (a, b) => a.namaKelas.localeCompare(b.namaKelas),
    },
    {
      title: "Operasi",
      key: "action",
      align: "center",
      render: (__, row) => (
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

  const renderTable = () => (
    <Table
      rowKey="idKelas"
      dataSource={filteredData}
      columns={renderColumns()}
      pagination={{ pageSize: 10 }}
    />
  );

  const renderButtons = () => (
    <Row gutter={[16, 16]} justify="start">
      <Col>
        <Button type="primary" onClick={() => setAddKelasModalVisible(true)}>
          Tambahkan Kelas
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
        title="Manajemen Kelas"
        source="Di sini, Anda dapat mengelola kelas di sistem."
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
                placeholder="Cari kelas..."
                allowClear
                enterButton
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: 300 }}
              />
            </Col>
          </Row>

          {/* Tabel */}
          {renderTable()}

          <AddKelasForm
            wrappedComponentRef={addKelasFormRef}
            visible={addKelasModalVisible}
            confirmLoading={addKelasModalLoading}
            onCancel={handleCancel}
            onOk={handleAddKelasOk}
          />

          <EditKelasForm
            wrappedComponentRef={editKelasFormRef}
            currentRowData={currentRowData}
            visible={editKelasModalVisible}
            confirmLoading={editKelasModalLoading}
            onCancel={handleCancel}
            onOk={handleEditKelasOk}
          />
        </Card>
      )}
    </div>
  );
};

export default Kelas;
