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
import {
  getTahunAjaran,
  deleteTahunAjaran,
  addTahunAjaran,
  editTahunAjaran,
} from "@/api/tahun-ajaran";
import TypingCard from "@/components/TypingCard";
import Highlighter from "react-highlight-words";
import AddTahunAjaranForm from "./forms/add-tahun-ajaran-form";
import EditTahunAjaranForm from "./forms/edit-tahun-ajaran-form";
import { reqUserInfo, getUserById } from "@/api/user";
import { Skeleton } from "antd";
import { use } from "react";

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
  const [searchKeyword, setSearchKeyword] = useState("");
  const [userIdJson, setUserIdJson] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const searchInput = useRef(null);

  const editTahunAjaranFormRef = useRef();
  const addTahunAjaranFormRef = useRef();

  useEffect(() => {
    const initializeData = async () => {
      const userInfoResponse = await reqUserInfo();
      const { id: userId } = userInfoResponse.data;

      await getUserInfoJson(userId);
    };

    initializeData();
  }, []);

  const fetchTahunAjaran = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getTahunAjaran();
      const { content, statusCode } = response.data;
      if (statusCode === 200) {
        const filteredContent = content.filter(
          (item) => item.school?.idSchool == userIdJson
        );
        setTahunAjaran(filteredContent);
      } else {
        message.error("Gagal mendapatkan data: " + response.message);
      }
    } catch (error) {
      message.error("Terjadi Kesalahan: " + error.message);
    } finally {
      setLoading(false);
    }
  }, [userIdJson]);

  useEffect(() => {
    if (userIdJson) {
      fetchTahunAjaran();
    }
  }, [userIdJson, fetchTahunAjaran]);

  const filteredData = tahunAjaran.filter((item) => {
    const query = searchQuery.toLowerCase();
    return (
      (item?.tahun?.toLowerCase() || "").includes(query) ||
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

  const handleDeleteTahunAjaran = (row) => {
    const { idTahun } = row;
    Modal.confirm({
      title: "Konfirmasi",
      content: "Apakah Anda yakin ingin menghapus data ini?",
      okText: "Ya",
      okType: "danger",
      cancelText: "Tidak",
      onOk: async () => {
        try {
          await deleteTahunAjaran({ idTahun });
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
      const updatedData = {
        idTahun: null,
        tahun: values.tahun,
        idSekolah: values.idSchool,
      };
      await addTahunAjaran(updatedData);
      setAddTahunAjaranModalVisible(false);
      message.success("Berhasil menambahkan");
      fetchTahunAjaran();
    } catch (error) {
      setAddTahunAjaranModalVisible(false);
      message.error("Gagal menambahkan: " + error.message);
    } finally {
      setAddTahunAjaranModalLoading(false);
    }
  };

  const handleEditTahunAjaranOk = async (values) => {
    setEditTahunAjaranModalLoading(true);
    try {
      const updatedData = {
        idTahun: values.idTahun,
        tahun: values.tahun,
        idSekolah: values.idSchool,
      };
      console.log("Updated Data:", updatedData);
      await editTahunAjaran(updatedData);
      setEditTahunAjaranModalVisible(false);
      setEditTahunAjaranModalLoading(false);
      message.success("Berhasil mengedit");
      fetchTahunAjaran();
    } catch (error) {
      setEditTahunAjaranModalVisible(false);
      setEditTahunAjaranModalLoading(false);
      message.error("Gagal mengedit: " + error.message);
    } finally {
      setEditTahunAjaranModalLoading(false);
    }
  };

  const handleCancel = () => {
    setAddTahunAjaranModalVisible(false);
    setEditTahunAjaranModalVisible(false);
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
    getTahunAjaran();
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
      title: "Tahun Ajaran",
      dataIndex: "tahunAjaran",
      key: "tahunAjaran",
      align: "center",
      ...getColumnSearchProps("tahun"),
      sorter: (a, b) => a.tahun.localeCompare(b.tahun),
    },
    {
      title: "Sekolah",
      dataIndex: ["school", "nameSchool"],
      key: "nameSchool",
      align: "center",
      ...getColumnSearchProps("nameSchool", "school.nameSchool"),
      sorter: (a, b) => a.school.nameSchool.localeCompare(b.school.nameSchool),
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

  const renderTable = () => (
    <Table
      rowKey="idTahun"
      dataSource={filteredData}
      columns={renderColumns()}
      pagination={{ pageSize: 10 }}
    />
  );

  const renderButtons = () => (
    <Row gutter={[16, 16]} justify="start">
      <Col>
        <Button
          type="primary"
          onClick={() => setAddTahunAjaranModalVisible(true)}
        >
          Tambahkan Tahun Ajaran
        </Button>
      </Col>
      {/* <Col>
        <Button
          icon={<UploadOutlined />}
          onClick={() => setImportModalVisible(true)}
        >
          Import File
        </Button>
      </Col> */}
    </Row>
  );

  return (
    <div className="app-container">
      <TypingCard
        title="Manajemen Tahun Ajaran"
        source="Di sini, Anda dapat mengelola tahun ajaran di sistem."
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
                placeholder="Cari bidang tahun ajaran..."
                allowClear
                enterButton
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: 300 }}
              />
            </Col>
          </Row>

          {/* Tabel */}
          {renderTable()}
        </Card>
      )}

      <AddTahunAjaranForm
        wrappedComponentRef={addTahunAjaranFormRef}
        visible={addTahunAjaranModalVisible}
        confirmLoading={addTahunAjaranModalLoading}
        onCancel={handleCancel}
        onOk={handleAddTahunAjaranOk}
      />

      <EditTahunAjaranForm
        wrappedComponentRef={editTahunAjaranFormRef}
        currentRowData={currentRowData}
        visible={editTahunAjaranModalVisible}
        confirmLoading={editTahunAjaranModalLoading}
        onCancel={handleCancel}
        onOk={handleEditTahunAjaranOk}
      />
    </div>
  );
};

export default TahunAjaran;
