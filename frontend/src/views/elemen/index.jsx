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
  Steps,
  Tag,
  Alert,
  Select,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  SearchOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import {
  fetchInitialData,
  getAvailableSemesters,
  getAvailableKelas,
  getAvailableMapels,
  filterData,
  renderSelectionSteps,
  renderActiveFilters,
} from "@/helper/mapelSelectionHelper.jsx";
import { useTableSearch } from "@/helper/tableSearchHelper.jsx";
import { getElemen, deleteElemen, addElemen, editElemen } from "@/api/elemen";
import TypingCard from "@/components/TypingCard";
import AddElemenForm from "./forms/add-elemen-form";
import EditElemenForm from "./forms/edit-elemen-form";
import { Skeleton } from "antd";
import Highlighter from "react-highlight-words";
import { reqUserInfo, getUserById } from "@/api/user";

const Elemen = () => {
  const [elemen, setElemen] = useState([]);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [addModalLoading, setAddModalLoading] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editModalLoading, setEditModalLoading] = useState(false);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [currentRowData, setCurrentRowData] = useState({});
  const [searchKeyword, setSearchKeyword] = useState("");
  const [userIdJson, setUserIdJson] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Fungsi dari Helper
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTahunAjaran, setSelectedTahunAjaran] = useState(null);
  const [selectedKelas, setSelectedKelas] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [selectedMapel, setSelectedMapel] = useState(null);
  const [kelasList, setKelasList] = useState([]);
  const [semesterList, setSemesterList] = useState([]);
  const [tahunAjaranList, setTahunAjaranList] = useState([]);
  const [allMapelList, setAllMapelList] = useState([]);
  const [filteredMapelList, setFilteredMapelList] = useState([]);
  const [showTable, setShowTable] = useState(false);

  const { getColumnSearchProps } = useTableSearch();

  const searchInput = useRef(null);

  const addFormRef = useRef(null);
  const editFormRef = useRef(null);

  const { Step } = Steps;

  const fetchELemen = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getElemen();
      const { content, statusCode } = result.data;
      if (statusCode === 200) {
        setElemen(content);
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
    fetchELemen();
  }, [fetchELemen]);

  useEffect(() => {
    const loadData = async () => {
      const data = await fetchInitialData();
      setTahunAjaranList(data.tahunAjaranList);
      setSemesterList(data.semesterList);
      setKelasList(data.kelasList);
      setAllMapelList(data.allMapelList);
      setLoading(false);
    };
    loadData();
  }, []);

  // Hitung opsi yang tersedia
  const availableSemesters = getAvailableSemesters(
    selectedTahunAjaran,
    semesterList,
    allMapelList
  );
  const availableKelas = getAvailableKelas(
    selectedTahunAjaran,
    selectedSemester,
    kelasList,
    allMapelList
  );
  const availableMapels = getAvailableMapels(
    selectedTahunAjaran,
    selectedSemester,
    selectedKelas,
    allMapelList
  );

  // Handler functions
  const handleTahunAjaranChange = (value) => {
    setSelectedTahunAjaran(value);
    setSelectedSemester(null);
    setSelectedKelas(null);
    setSelectedMapel(null);
    setCurrentStep(2);
  };

  const handleSemesterChange = (value) => {
    setSelectedSemester(value);
    setSelectedKelas(null);
    setSelectedMapel(null);
    setCurrentStep(3);
  };

  const handleKelasChange = (value) => {
    setSelectedKelas(value);
    setSelectedMapel(null);
    setCurrentStep(4);
  };

  const handleMapelChange = (value) => {
    setSelectedMapel(value);
    setShowTable(true);
  };

  const handleStepBack = (step) => {
    setCurrentStep(step);
  };

  const handleBackClick = () => {
    setSelectedMapel(null);
    setCurrentStep(4);
  };

  // Filter data
  const filteredData = filterData(
    elemen,
    selectedTahunAjaran,
    selectedSemester,
    selectedKelas,
    selectedMapel
  );

  const handleDelete = (row) => {
    const { idElemen } = row;
    Modal.confirm({
      title: "Konfirmasi",
      content: "Apakah Anda yakin ingin menghapus data ini?",
      okText: "Ya",
      okType: "danger",
      cancelText: "Tidak",
      onOk: async () => {
        try {
          await deleteElemen({ idElemen });
          message.success("Berhasil dihapus");
          fetchELemen();
        } catch (error) {
          message.error("Gagal menghapus: " + error.message);
        }
      },
    });
  };

  const handleEdit = (row) => {
    setCurrentRowData({ ...row });
    setEditModalVisible(true);
  };

  const handleAddOk = async (values) => {
    setAddModalLoading(true);
    try {
      const updatedValues = {
        idElemen: null,
        namaElemen: values.namaElemen,
        idKonsentrasiSekolah: values.idKonsentrasiSekolah,
        idKelas: values.idKelas,
        idTahun: values.idTahun,
        idSemester: values.idSemester,
        idMapel: values.idMapel,
        idSekolah: values.idSchool,
      };
      console.log("respon data", updatedValues);
      await addElemen(updatedValues);
      setAddModalVisible(false);
      setAddModalLoading(false);
      message.success("Berhasil menambahkan");
      fetchELemen();
    } catch (error) {
      setAddModalLoading(false);
      message.error("Gagal menambahkan: " + error.message);
    } finally {
      setAddModalLoading(false);
    }
  };

  const handleEditOk = async (values) => {
    setEditModalLoading(true);
    try {
      const updatedValues = {
        idElemen: values.idElemen,
        namaElemen: values.namaElemen,
        idKonsentrasiSekolah: values.idKonsentrasiSekolah,
        idKelas: values.idKelas,
        idTahun: values.idTahun,
        idSemester: values.idSemester,
        idMapel: values.idMapel,
        idSekolah: values.idSchool,
      };

      console.log("respon data", updatedValues);
      await editElemen(updatedValues, currentRowData.idElemen);
      setEditModalVisible(false);
      setEditModalLoading(false);
      message.success("Berhasil mengubah");
      fetchELemen();
    } catch (error) {
      setEditModalLoading(false);
      message.error("Gagal mengubah: " + error.message);
    }
  };

  const handleCancel = () => {
    setAddModalVisible(false);
    setEditModalVisible(false);
  };

  const handleSearch = (keyword) => {
    setSearchKeyword(keyword);
    getElemen();
  };

  const renderColumns = () => [
    {
      title: "No",
      dataIndex: "index",
      key: "index",
      align: "center",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Elemen",
      dataIndex: "namaElemen",
      key: "namaElemen",
      align: "center",
      ...getColumnSearchProps("namaElemen"),
      sorter: (a, b) => a.namaElemen.localeCompare(b.namaElemen),
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
      rowKey="idElemen"
      dataSource={filteredData}
      columns={renderColumns()}
      pagination={{ pageSize: 10 }}
    />
  );

  const renderButtons = () => (
    <Row gutter={[16, 16]} justify="start">
      <Col>
        <Button type="primary" onClick={() => setAddModalVisible(true)}>
          Tambahkan Elemen
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
        title="Manajemen Elemen"
        source="Di sini, Anda dapat mengelola elemen  di sistem."
      />
      <br />
      {loading ? (
        <Card>
          <Skeleton active paragraph={{ rows: 10 }} />
        </Card>
      ) : (
        <>
          <Card style={{ marginBottom: 16 }}>{renderButtons()}</Card>

          {/* Tampilkan selection steps atau tabel */}
          {!selectedMapel ? (
            renderSelectionSteps({
              currentStep,
              tahunAjaranList,
              semesterList,
              kelasList,
              availableSemesters,
              availableKelas,
              availableMapels,
              selectedTahunAjaran,
              selectedSemester,
              selectedKelas,
              onTahunAjaranChange: handleTahunAjaranChange,
              onSemesterChange: handleSemesterChange,
              onKelasChange: handleKelasChange,
              onMapelChange: handleMapelChange,
              onStepBack: handleStepBack,
            })
          ) : (
            <>
              {renderActiveFilters({
                tahunAjaranList,
                semesterList,
                kelasList,
                filteredMapelList,
                selectedTahunAjaran,
                selectedSemester,
                selectedKelas,
                selectedMapel,
                onBackClick: handleBackClick,
              })}

              {/* Tabel Data */}
              <Card style={{ overflowX: "scroll" }}>{renderTable()}</Card>
            </>
          )}

          <AddElemenForm
            wrappedComponentRef={addFormRef}
            visible={addModalVisible}
            confirmLoading={addModalLoading}
            onCancel={handleCancel}
            onOk={handleAddOk}
          />

          <EditElemenForm
            wrappedComponentRef={editFormRef}
            currentRowData={currentRowData}
            visible={editModalVisible}
            confirmLoading={editModalLoading}
            onCancel={handleCancel}
            onOk={handleEditOk}
          />
        </>
      )}
    </div>
  );
};

export default Elemen;
