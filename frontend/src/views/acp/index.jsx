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
  UploadOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { getACP, deleteACP, editACP, addACP } from "@/api/acp";
import TypingCard from "@/components/TypingCard";
import EditACPForm from "./forms/edit-acp-form";
import AddACPForm from "./forms/add-acp-form";
import { Skeleton } from "antd";
import Highlighter from "react-highlight-words";
import { reqUserInfo, getUserById } from "@/api/user";
import { read, utils } from "xlsx";

const ACP = () => {
  const [acp, setACP] = useState([]);
  const [editACPModalVisible, setEditACPModalVisible] = useState(false);
  const [editACPModalLoading, setEditACPModalLoading] = useState(false);
  const [currentRowData, setCurrentRowData] = useState({});
  const [addACPModalVisible, setAddACPModalVisible] = useState(false);
  const [addACPModalLoading, setAddACPModalLoading] = useState(false);
  const [importedData, setImportedData] = useState([]);
  const [columnTitles, setColumnTitles] = useState([]);
  const [fileName, setFileName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [columnMapping, setColumnMapping] = useState({});
  const [tableLoading, setTableLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [userIdJson, setUserIdJson] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const searchInput = useRef(null);

  const editACPFormRef = useRef(null);
  const addACPFormRef = useRef(null);

  useEffect(() => {
    const initializeData = async () => {
      const userInfoResponse = await reqUserInfo();
      const { id: userId } = userInfoResponse.data;

      await getUserInfoJson(userId);
    };

    initializeData();
  }, []);

  const fetchACP = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getACP();
      const { content, statusCode } = result.data;
      if (statusCode === 200) {
        const filteredContent = content.filter(
          (item) => item.school?.idSchool === userIdJson
        );
        setACP(filteredContent);
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
      fetchACP();
    }
  }, [userIdJson, fetchACP]);

  const filteredData = acp.filter((item) => {
    const query = searchQuery.toLowerCase();
    return (
      (item?.namaAcp?.toLowerCase() || "").includes(query) ||
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

  const handleEditACP = (row) => {
    setCurrentRowData({ ...row });
    setEditACPModalVisible(true);
  };

  const handleCancel = () => {
    setEditACPModalVisible(false);
    setAddACPModalVisible(false);
  };

  const handleAddACP = () => {
    setAddACPModalVisible(true);
  };

  const handleDelete = (row) => {
    const { idAcp } = row;
    Modal.confirm({
      title: "Konfirmasi",
      content: "Apakah Anda yakin ingin menghapus data ini?",
      okText: "Ya",
      okType: "danger",
      cancelText: "Tidak",
      onOk: async () => {
        try {
          await deleteACP({ idAcp });
          message.success("Berhasil dihapus");
          fetchACP();
        } catch (error) {
          message.error("Gagal menghapus: " + error.message);
        }
      },
    });
  };

  const handleAddOk = async (values) => {
    setAddACPModalLoading(true);
    try {
      const updatedValues = {
        idAcp: null,
        namaAcp: values.namaAcp,
        idElemen: values.idElemen,
        idKonsentrasiSekolah: values.idKonsentrasiSekolah,
        idKelas: values.idKelas,
        idTahun: values.idTahun,
        idSemester: values.idSemester,
        idMapel: values.idMapel,
        idSchool: userIdJson,
      };
      console.log("respon data", updatedValues);
      await addACP(updatedValues);
      setAddACPModalVisible(false);
      setAddACPModalLoading(false);
      message.success("Berhasil menambahkan");
      fetchACP();
    } catch (error) {
      setAddACPModalLoading(false);
      message.error("Gagal menambahkan: " + error.message);
    }
  };

  const handleEditOk = async (values) => {
    setEditACPModalLoading(true);
    try {
      const updatedValues = {
        idAcp: values.idAcp,
        namaAcp: values.namaAcp,
        idElemen: values.idElemen,
        idKonsentrasiSekolah: values.idKonsentrasiSekolah,
        idKelas: values.idKelas,
        idTahun: values.idTahun,
        idSemester: values.idSemester,
        idMapel: values.idMapel,
      };

      console.log("respon data", updatedValues);
      await editACP(updatedValues, currentRowData.idAcp);
      setEditACPModalVisible(false);
      setEditACPModalLoading(false);
      message.success("Berhasil mengubah");
      fetchACP();
    } catch (error) {
      setEditACPModalLoading(false);
      message.error("Gagal mengubah: " + error.message);
    }
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
    getACP();
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
      title: "No.",
      dataIndex: "index",
      key: "index",
      align: "center",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Capaian Pembelajaran",
      dataIndex: "namaAcp",
      key: "namaAcp",
      align: "center",
      ...getColumnSearchProps("namaAcp"),
      sorter: (a, b) => a.namaAcp.localeCompare(b.namaAcp),
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
      title: "Elemen",
      dataIndex: ["elemen", "namaElemen"],
      key: "namaElemen",
      align: "center",
      ...getColumnSearchProps("namaElemen", "elemen.namaElemen"),
      sorter: (a, b) => a.elemen.namaElemen.localeCompare(b.elemen.namaElemen),
    },
    {
      title: "Mata Pelajaran",
      dataIndex: ["mapel", "name"],
      key: "name",
      align: "center",
      ...getColumnSearchProps("name", "mapel.name"),
      sorter: (a, b) => a.mapel.name.localeCompare(b.mapel.name),
    },
    {
      title: "Tahun Ajaran",
      dataIndex: ["tahunAjaran", "tahunAjaran"],
      key: "tahunAjaran",
      align: "center",
      ...getColumnSearchProps("tahunAjaran", "tahunAjaran.tahunAjaran"),
      sorter: (a, b) =>
        a.tahunAjaran.tahunAjaran.localeCompare(b.tahunAjaran.tahunAjaran),
    },
    {
      title: "Semester",
      dataIndex: ["semester", "namaSemester"],
      key: "namaSemester",
      align: "center",
      ...getColumnSearchProps("namaSemester", "semester.namaSemester"),
      sorter: (a, b) =>
        a.semester.namaSemester.localeCompare(b.semester.namaSemester),
    },
    {
      title: "Kelas",
      dataIndex: ["kelas", "namaKelas"],
      key: "namaKelas",
      align: "center",
      ...getColumnSearchProps("namaKelas", "kelas.namaKelas"),
      sorter: (a, b) => a.kelas.namaKelas.localeCompare(b.kelas.namaKelas),
    },
    {
      title: "Konsentrasi Keahlian Sekolah",
      dataIndex: ["konsentrasiKeahlianSekolah", "namaKonsentrasiSekolah"],
      key: "namaKonsentrasiSekolah",
      align: "center",
      ...getColumnSearchProps(
        "namaKonsentrasiSekolah",
        "konsentrasiKeahlianSekolah.namaKonsentrasiSekolah"
      ),
      sorter: (a, b) =>
        a.konsentrasiKeahlianSekolah.namaKonsentrasiSekolah.localeCompare(
          b.konsentrasiKeahlianSekolah.namaKonsentrasiSekolah
        ),
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
            onClick={() => handleEditACP(row)}
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
      rowKey="idAcp"
      dataSource={filteredData}
      columns={renderColumns()}
      pagination={{ pageSize: 10 }}
    />
  );

  const renderButtons = () => (
    <Row gutter={[16, 16]} justify="start">
      <Col>
        <Button type="primary" onClick={() => setAddACPModalVisible(true)}>
          Tambahkan ACP
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
        title="Manajemen Analisa Capaian Pembelajaran"
        source="Di sini, Anda dapat mengelola Analisa Capaian Pembelajaran di sistem."
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
                placeholder="Cari semester..."
                allowClear
                enterButton
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: 300 }}
              />
            </Col>
          </Row>

          {/* Tabel */}
          {renderTable()}
          <AddACPForm
            wrappedComponentRef={addACPFormRef}
            visible={addACPModalVisible}
            confirmLoading={addACPModalLoading}
            onCancel={handleCancel}
            onOk={handleAddOk}
          />

          <EditACPForm
            wrappedComponentRef={editACPFormRef}
            currentRowData={currentRowData}
            visible={editACPModalVisible}
            confirmLoading={editACPModalLoading}
            onCancel={handleCancel}
            onOk={handleEditOk}
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

export default ACP;
