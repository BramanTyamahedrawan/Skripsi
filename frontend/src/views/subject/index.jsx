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
import { getMapel, deleteMapel, addMapel, editMapel } from "@/api/mapel";
import TypingCard from "@/components/TypingCard";
import AddMapelForm from "./forms/add-mapel-form";
import EditMapelForm from "./forms/edit-mapel-form";
import { Skeleton } from "antd";
import Highlighter from "react-highlight-words";
import { reqUserInfo, getUserById } from "@/api/user";
import { render } from "less";

const Mapel = () => {
  const [mapel, setMapel] = useState([]);
  const [addMapelModalVisible, setAddMapelModalVisible] = useState(false);
  const [addMapelModalLoading, setAddMapelModalLoading] = useState(false);
  const [editMapelModalVisible, setEditMapelModalVisible] = useState(false);
  const [editMapelModalLoading, setEditMapelModalLoading] = useState(false);
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

  const editMapelFormRef = useRef();
  const addMapelFormRef = useRef();

  useEffect(() => {
    const initializeData = async () => {
      const userInfoResponse = await reqUserInfo();
      const { id: userId } = userInfoResponse.data;

      await getUserInfoJson(userId);
    };

    initializeData();
  }, []);

  const fetchMapel = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getMapel();
      const { content, statusCode } = result.data;
      if (statusCode === 200) {
        const filteredContent = content.filter(
          (item) => item.school?.idSchool === userIdJson
        );
        setMapel(filteredContent);
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
      fetchMapel();
    }
  }, [userIdJson, fetchMapel]);

  const filteredData = mapel.filter((item) => {
    const query = searchQuery.toLowerCase();
    return (
      (item?.name?.toLowerCase() || "").includes(query) ||
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

  const handleDeleteMapel = (row) => {
    const { idMapel } = row;
    Modal.confirm({
      title: "Konfirmasi",
      content: "Apakah Anda yakin ingin menghapus data ini?",
      okText: "Ya",
      okType: "danger",
      cancelText: "Tidak",
      onOk: async () => {
        try {
          await deleteMapel({ idMapel });
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
      const updatedData = {
        idMapel: null,
        name: values.name,
        idSekolah: values.idSchool,
      };
      await addMapel(updatedData);
      setAddMapelModalVisible(false);
      message.success("Berhasil menambahkan");
      fetchMapel();
    } catch (error) {
      setAddMapelModalVisible(false);
      message.error("Gagal menambahkan: " + error.message);
    } finally {
      setAddMapelModalLoading(false);
    }
  };

  const handleEditMapelOk = async (values) => {
    setEditMapelModalLoading(true);
    try {
      const updatedData = {
        idMapel: values.idMapel,
        name: values.name,
        idSekolah: values.idSchool,
      };
      await editMapel(updatedData, currentRowData.idMapel);
      setEditMapelModalVisible(false);
      setEditMapelModalLoading(false);
      message.success("Berhasil mengedit");
      fetchMapel();
    } catch (error) {
      setEditMapelModalVisible(false);
      message.error("Gagal mengedit: " + error.message);
    } finally {
      setEditMapelModalLoading(false);
    }
  };

  const handleCancel = () => {
    setAddMapelModalVisible(false);
    setEditMapelModalVisible(false);
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
    getMapel();
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
      title: "ID Mapel",
      dataIndex: "idMapel",
      key: "idMapel",
      align: "center",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Nama Mapel",
      dataIndex: "name",
      key: "name",
      align: "center",
      ...getColumnSearchProps("name"),
      sorter: (a, b) => a.name.localeCompare(b.name),
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

  const renderTable = () => (
    <Table
      rowKey="idMapel"
      dataSource={filteredData}
      columns={renderColumns()}
      pagination={{ pageSize: 10 }}
    />
  );

  const renderButtons = () => (
    <Row gutter={[16, 16]} justify="start">
      <Col>
        <Button type="primary" onClick={() => setAddMapelModalVisible(true)}>
          Tambahkan Mapel
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
        title="Manajemen Mapel"
        source="Di sini, Anda dapat mengelola mapel di sistem."
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
                placeholder="Cari mapel..."
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

      <AddMapelForm
        wrappedComponentRef={addMapelFormRef}
        visible={addMapelModalVisible}
        confirmLoading={addMapelModalLoading}
        onCancel={handleCancel}
        onOk={handleAddMapelOk}
      />

      <EditMapelForm
        wrappedComponentRef={editMapelFormRef}
        currentRowData={currentRowData}
        visible={editMapelModalVisible}
        confirmLoading={editMapelModalLoading}
        onCancel={handleCancel}
        onOk={handleEditMapelOk}
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

export default Mapel;
