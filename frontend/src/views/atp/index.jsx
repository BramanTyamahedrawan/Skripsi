/* eslint-disable react/no-unknown-property */
/* eslint-disable react/prop-types */
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
  UploadOutlined,
  EditOutlined,
  DeleteOutlined,
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
import { getATP, deleteATP, editATP, addATP } from "@/api/atp";
import { getMapel } from "@/api/mapel";
import { getKelas } from "@/api/kelas";
import { getSemester } from "@/api/semester";
import { getTahunAjaran } from "@/api/tahun-ajaran";
import TypingCard from "@/components/TypingCard";
import EditATPForm from "./forms/edit-atp-form";
import AddATPForm from "./forms/add-atp-form";
import { Skeleton } from "antd";
import Highlighter from "react-highlight-words";
import { reqUserInfo, getUserById } from "@/api/user";
import { useTableSearch } from "@/helper/tableSearchHelper.jsx";
import { read, utils } from "xlsx";

const { Column } = Table;

const ATP = () => {
  const [atp, setATP] = useState([]);
  const [editATPModalVisible, setEditATPModalVisible] = useState(false);
  const [editATPModalLoading, setEditATPModalLoading] = useState(false);
  const [currentRowData, setCurrentRowData] = useState({});
  const [addATPModalVisible, setAddATPModalVisible] = useState(false);
  const [addATPModalLoading, setAddATPModalLoading] = useState(false);
  const [importedData, setImportedData] = useState([]);
  const [columnTitles, setColumnTitles] = useState([]);
  const [fileName, setFileName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [columnMapping, setColumnMapping] = useState({});
  const [searchKeyword, setSearchKeyword] = useState("");
  const [tableLoading, setTableLoading] = useState(false);
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

  // Fungsi Helper Table Search
  const { getColumnSearchProps } = useTableSearch();

  const [currentGroupData, setCurrentGroupData] = useState(null);
  const [editGroupModalVisible, setEditGroupModalVisible] = useState(false);

  const editATPFormRef = useRef();
  const addATPFormRef = useRef();

  const { Step } = Steps;

  const fetchATP = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getATP();
      const { content, statusCode } = result.data;
      if (statusCode === 200) {
        setATP(content);
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
    fetchATP();
  }, [fetchATP]);

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
    atp,
    selectedTahunAjaran,
    selectedSemester,
    selectedKelas,
    selectedMapel
  );

  const handleAddOk = async (values) => {
    setAddATPModalLoading(true);
    try {
      // Jika kita menerima data dalam format baru (array atpList)
      if (values.atpList && values.atpList.length > 0) {
        // Opsi 1: Kirim satu per satu ATP ke server
        const promises = values.atpList.map((atpItem) => {
          const atpData = {
            idAtp: null,
            namaAtp: atpItem.namaAtp,
            jumlahJpl: atpItem.jumlahJpl,
            idAcp: values.idAcp,
            idElemen: values.idElemen,
            idKonsentrasiSekolah: values.idKonsentrasiSekolah,
            idKelas: values.idKelas,
            idTahun: values.idTahun,
            idSemester: values.idSemester,
            idMapel: values.idMapel,
            idSekolah: values.idSchool,
          };
          console.log("Mengirim data ATP:", atpData);
          return addATP(atpData); // Uncomment jika API mendukung
        });

        await Promise.all(promises);
        message.success(
          `Berhasil menambahkan ${values.atpList.length} Tujuan Pembelajaran`
        );
      }
      // Fallback ke format lama jika tidak ada atpList
      else {
        const updatedValues = {
          idAtp: null,
          namaAtp: values.namaAtp,
          jumlahJpl: values.jumlahJpl,
          idAcp: values.idAcp,
          idElemen: values.idElemen,
          idKonsentrasiSekolah: values.idKonsentrasiSekolah,
          idKelas: values.idKelas,
          idTahun: values.idTahun,
          idSemester: values.idSemester,
          idMapel: values.idMapel,
          idSekolah: values.idSchool,
        };
        console.log("Mengirim data ATP tunggal:", updatedValues);
        await addATP(updatedValues); // Uncomment untuk menjalankan API call
        message.success("Berhasil menambahkan Tujuan Pembelajaran");
      }

      setAddATPModalVisible(false);
      fetchATP();
    } catch (error) {
      message.error("Gagal menambahkan: " + error.message);
    } finally {
      setAddATPModalLoading(false);
    }
  };

  const handleEditOk = async (values) => {
    setEditATPModalLoading(true);
    try {
      const idAtp = values.idAtp || currentRowData.idAtp;

      if (!idAtp) {
        throw new Error(
          "ID ATP tidak ditemukan. Tidak dapat melakukan update."
        );
      }
      const updatedValues = {
        idAtp: idAtp,
        namaAtp: values.namaAtp,
        jumlahJpl: values.jumlahJpl,
        idAcp: values.idAcp,
        idElemen: values.idElemen,
        idKonsentrasiSekolah: values.idKonsentrasiSekolah,
        idKelas: values.idKelas,
        idTahun: values.idTahun,
        idSemester: values.idSemester,
        idMapel: values.idMapel,
        idSekolah: values.idSchool,
      };

      console.log("respon data", updatedValues);
      await editATP(updatedValues, idAtp);
      setEditATPModalVisible(false);
      message.success("Berhasil mengubah");
      fetchATP();
    } catch (error) {
      setEditATPModalLoading(false);
      message.error("Gagal mengubah: " + error.message);
    } finally {
      setEditATPModalLoading(false);
    }
  };

  const handleCancel = () => {
    setEditATPModalVisible(false);
    setAddATPModalVisible(false);
  };

  const handleAddATP = () => {
    setAddATPModalVisible(true);
  };

  const handleSearch = (keyword) => {
    setSearchKeyword(keyword);
    getATP();
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
      title: "Tujuan Pembelajaran",
      dataIndex: "namaAtp",
      key: "namaAtp",
      align: "center",
      ...getColumnSearchProps("namaAtp"),
      sorter: (a, b) => a.namaAtp.localeCompare(b.namaAtp),
    },
    {
      title: "Jumlah JPL",
      dataIndex: "jumlahJpl",
      key: "jumlahJpl",
      align: "center",
      ...getColumnSearchProps("jumlahJpl"),
      sorter: (a, b) => a.jumlahJpl.localeCompare(b.jumlahJpl),
    },
    {
      title: "Capaian Pembelajaran",
      dataIndex: ["acp", "namaAcp"],
      key: "namaAcp",
      align: "center",
      ...getColumnSearchProps("namaAcp", "acp.namaAcp"),
      sorter: (a, b) => a.acp.namaAcp.localeCompare(b.acp.namaAcp),
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
      title: "Konsentrasi Keahlian Sekolah",
      dataIndex: ["konsentrasiKeahlianSekolah", "namaKonsentrasiSekolah"],
      key: "namaKonsentrasiSekolah",
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
            onClick={() => handleEditATP(row)}
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

  // Handler untuk mengedit item ATP
  const handleEditATP = (row) => {
    setCurrentRowData({ ...row });
    setEditATPModalVisible(true);
  };

  // Handler untuk menghapus item ATP
  const handleDelete = (row) => {
    const { idAtp } = row;
    Modal.confirm({
      title: "Konfirmasi",
      content: "Apakah Anda yakin ingin menghapus data ini?",
      okText: "Ya",
      okType: "danger",
      cancelText: "Tidak",
      onOk: async () => {
        try {
          await deleteATP({ idAtp });
          message.success("Berhasil dihapus");
          fetchATP();
        } catch (error) {
          message.error("Gagal menghapus: " + error.message);
        }
      },
    });
  };

  // Fungsi untuk menyusun data dalam format hierarkis sesuai tabel yang diminta
  const prepareHierarchicalData = (data) => {
    // Kelompokkan data berdasarkan Elemen dan ACP
    const groupedData = {};

    data.forEach((item) => {
      const atpId = item.idAtp;
      const elemenId = item.elemen.idElemen;
      const elemenName = item.elemen.namaElemen;
      const acpId = item.acp.idAcp;
      const acpName = item.acp.namaAcp;
      const konsentrasiSekolah =
        item.konsentrasiKeahlianSekolah?.namaKonsentrasiSekolah || "";

      // Buat kunci unik untuk kombinasi Elemen-ACP
      const key = `${elemenId}-${acpId}`;

      if (!groupedData[key]) {
        groupedData[key] = {
          elemenName,
          acpName,
          konsentrasiSekolah,
          atpItems: [],
        };
      }

      // Tambahkan ATP ke grup
      groupedData[key].atpItems.push({
        ...item,
        idElemen: elemenId,
        idAcp: acpId,
        atpId,
      });
    });

    // Konversi ke format array
    return Object.values(groupedData).map((group, index) => ({
      ...group,
      no: index + 1, // Nomor urut sesuai index + 1
    }));
  };

  // Komponen untuk menampilkan tabel hierarkis sesuai layout yang diberikan
  const HierarchicalAtpTable = ({ data }) => {
    const hierarchicalData = prepareHierarchicalData(data);

    return (
      <table className="hierarchical-table">
        <thead>
          <tr>
            <th rowSpan="2">No</th>
            <th rowSpan="2">Konsentrasi Sekolah</th>
            <th colSpan="3">Master Data</th>
            <th rowSpan="2">Jumlah JPL</th>
            <th rowSpan="2">Operasi</th>
          </tr>
          <tr>
            <th>Elemen</th>
            <th>ACP</th>
            <th>ATP</th>
          </tr>
        </thead>
        <tbody>
          {hierarchicalData.map((entry) => {
            const rowCount = entry.atpItems.length;

            return entry.atpItems.map((atpItem, atpIndex) => {
              if (atpIndex === 0) {
                // Baris pertama dengan no, konsentrasi sekolah, elemen, dan acp
                return (
                  <tr key={`${entry.no}-${atpIndex}`}>
                    <td rowSpan={rowCount}>{entry.no}</td>
                    <td rowSpan={rowCount}>{entry.konsentrasiSekolah}</td>
                    <td rowSpan={rowCount}>{entry.elemenName}</td>
                    <td rowSpan={rowCount}>{entry.acpName}</td>
                    <td>{atpItem.namaAtp}</td>
                    <td>{atpItem.jumlahJpl}</td>
                    <td>
                      <Button
                        type="primary"
                        shape="circle"
                        icon={<EditOutlined />}
                        onClick={() => handleEditATP(atpItem)}
                        style={{ marginRight: "8px" }}
                      />
                      <Button
                        type="primary"
                        danger
                        shape="circle"
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(atpItem)}
                      />
                    </td>
                  </tr>
                );
              } else {
                // Baris selanjutnya hanya dengan ATP
                return (
                  <tr key={`${entry.no}-${atpIndex}`}>
                    <td>{atpItem.namaAtp}</td>
                    <td>{atpItem.jumlahJpl}</td>
                    <td>
                      <Button
                        type="primary"
                        shape="circle"
                        icon={<EditOutlined />}
                        onClick={() => handleEditATP(atpItem)}
                        style={{ marginRight: "8px" }}
                      />
                      <Button
                        type="primary"
                        danger
                        shape="circle"
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(atpItem)}
                      />
                    </td>
                  </tr>
                );
              }
            });
          })}
        </tbody>
      </table>
    );
  };

  // Ganti fungsi renderTable dengan tabel hierarkis yang sudah diperbaiki
  const renderTable = () => {
    return (
      <div className="table-container">
        <style jsx>{`
          .hierarchical-table {
            width: 100%;
            border-collapse: collapse;
            text-align: center;
          }

          .hierarchical-table th,
          .hierarchical-table td {
            border: 1px solid #ddd;
            padding: 8px;
            vertical-align: middle;
          }

          .hierarchical-table th {
            background-color: #f5f5f5;
            font-weight: bold;
          }
        `}</style>

        <HierarchicalAtpTable data={filteredData} />
      </div>
    );
  };

  const renderButtons = () => (
    <Row gutter={[16, 16]} justify="start">
      <Col>
        <Button type="primary" onClick={() => setAddATPModalVisible(true)}>
          Tambahkan ATP
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
        title="Manajemen Analisa Tujuan Pembelajaran"
        source="Di sini, Anda dapat mengelola Analisa Tujuan Pembelajaran di sistem."
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

          <AddATPForm
            wrappedComponentRef={addATPFormRef}
            visible={addATPModalVisible}
            confirmLoading={addATPModalLoading}
            onCancel={handleCancel}
            onOk={handleAddOk}
          />

          <EditATPForm
            wrappedComponentRef={editATPFormRef}
            currentRowData={currentRowData}
            visible={editATPModalVisible}
            confirmLoading={editATPModalLoading}
            onCancel={handleCancel}
            onOk={handleEditOk}
          />
        </>
      )}
    </div>
  );
};

export default ATP;
