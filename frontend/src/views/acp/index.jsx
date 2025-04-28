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
import { getACP, deleteACP, editACP, addACP } from "@/api/acp";
import { getMapel } from "@/api/mapel";
import { getKelas } from "@/api/kelas";
import { getSemester } from "@/api/semester";
import { getTahunAjaran } from "@/api/tahun-ajaran";
import TypingCard from "@/components/TypingCard";
import EditACPForm from "./forms/edit-acp-form";
import AddACPForm from "./forms/add-acp-form";
import { Skeleton } from "antd";
import Highlighter from "react-highlight-words";
import { reqUserInfo, getUserById } from "@/api/user";
import { useTableSearch } from "@/helper/tableSearchHelper.jsx";
import { read, utils } from "xlsx";
import { set } from "nprogress";

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

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTahunAjaran, setSelectedTahunAjaran] = useState(null);
  const [selectedKelas, setSelectedKelas] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [selectedMapel, setSelectedMapel] = useState(null);
  const [kelasList, setKelasList] = useState([]);
  const [semesterList, setSemesterList] = useState([]);
  const [tahunAjaranList, setTahunAjaranList] = useState([]);
  const [allMapelList, setAllMapelList] = useState([]); // Semua data mapel
  const [filteredMapelList, setFilteredMapelList] = useState([]); // Mapel setelah difilter
  const [showTable, setShowTable] = useState(false); // State to control table visibility

  // Fungsi Helper Table Search
  const { getColumnSearchProps } = useTableSearch();

  const editACPFormRef = useRef(null);
  const addACPFormRef = useRef(null);

  const { Step } = Steps;

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

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Ambil semua data yang diperlukan
        const [tahunAjaranRes, kelasRes, semesterRes, mapelRes] =
          await Promise.all([
            getTahunAjaran(),
            getKelas(),
            getSemester(),
            getMapel(), // Endpoint untuk semua mapel
          ]);

        setTahunAjaranList(tahunAjaranRes.data.content || []);
        setKelasList(kelasRes.data.content || []);
        setSemesterList(semesterRes.data.content || []);
        setAllMapelList(mapelRes.data.content || []);
      } catch (error) {
        message.error("Gagal memuat data awal");
      }
    };

    fetchInitialData();
  }, []);

  const filteredData = acp
    .filter(
      (item) =>
        item?.tahunAjaran?.idTahun === selectedTahunAjaran &&
        item?.kelas?.idKelas === selectedKelas &&
        item?.semester?.idSemester === selectedSemester &&
        (!selectedMapel || item?.mapel?.idMapel === selectedMapel) // Optional jika ingin bisa tampilkan semua mapel
    )
    .filter((item) => {
      const query = searchQuery.toLowerCase();
      return (
        (item?.namaAcp?.toLowerCase() || "").includes(query) ||
        (item?.nameSchool?.toLowerCase() || "").includes(query)
      );
    });

  useEffect(() => {
    if (selectedTahunAjaran && selectedKelas && selectedSemester) {
      // Ambil semua mapel yang sesuai dengan kelas dan semester terpilih
      const availableMapels = allMapelList.filter((mapel) => {
        return acp.some(
          (item) =>
            item.mapel?.idMapel === mapel.idMapel &&
            item.semester?.idSemester === selectedSemester &&
            item.kelas?.idKelas === selectedKelas &&
            item.tahunAjaran?.idTahun === selectedTahunAjaran
        );
      });

      setFilteredMapelList(
        availableMapels.length > 0 ? availableMapels : allMapelList
      );
    } else {
      setFilteredMapelList(allMapelList);
    }
  }, [selectedTahunAjaran, selectedKelas, selectedSemester, acp, allMapelList]);

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

  const handleSearch = (keyword) => {
    setSearchKeyword(keyword);
    getACP();
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
      title: "Capaian Pembelajaran",
      dataIndex: "namaAcp",
      key: "namaAcp",
      align: "center",
      ...getColumnSearchProps("namaAcp"),
      sorter: (a, b) => a.namaAcp.localeCompare(b.namaAcp),
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

  const renderSelectionSteps = () => (
    <Card style={{ maxWidth: 600, margin: "20px auto" }}>
      <Steps current={currentStep - 1} style={{ marginBottom: 24 }}>
        <Step title="Tahun Ajaran" />
        <Step title="Kelas" />
        <Step title="Semester" />
        <Step title="Mata Pelajaran" />
      </Steps>

      <div style={{ minHeight: 150 }}>
        {/* Step 1: Pilih Tahun Ajaran */}
        {currentStep === 1 && (
          <Select
            style={{ width: "100%" }}
            placeholder="Pilih Tahun Ajaran"
            onChange={(value) => {
              setSelectedTahunAjaran(value);
              setCurrentStep(2);
            }}
            options={tahunAjaranList.map((tahunAjaran) => ({
              value: tahunAjaran.idTahun,
              label: tahunAjaran.tahunAjaran,
            }))}
          />
        )}

        {/* Step 2: Pilih Kelas */}
        {currentStep === 2 && (
          <Space direction="vertical" style={{ width: "100%" }}>
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => setCurrentStep(1)} // Kembali ke step 1
              style={{ marginBottom: 16 }}
            >
              Kembali ke Pilih Tahun Ajaran
            </Button>
            <Select
              style={{ width: "100%" }}
              placeholder="Pilih Kelas"
              onChange={(value) => {
                setSelectedKelas(value);
                setCurrentStep(3);
              }}
              options={kelasList.map((kelas) => ({
                value: kelas.idKelas,
                label: kelas.namaKelas,
              }))}
            />
          </Space>
        )}

        {/* Step 3: Pilih Semester */}
        {currentStep === 3 && (
          <Space direction="vertical" style={{ width: "100%" }}>
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => setCurrentStep(2)} // Kembali ke step 2
              style={{ marginBottom: 16 }}
            >
              Kembali ke Pilih Kelas
            </Button>
            <Select
              style={{ width: "100%" }}
              placeholder="Pilih Semester"
              onChange={(value) => {
                setSelectedSemester(value);
                setCurrentStep(4);
              }}
              options={semesterList.map((semester) => ({
                value: semester.idSemester,
                label: semester.namaSemester,
              }))}
            />
          </Space>
        )}

        {/* Step 4: Pilih Mata Pelajaran */}
        {currentStep === 4 && (
          <Space direction="vertical" style={{ width: "100%" }}>
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => setCurrentStep(3)} // Kembali ke step 3
              style={{ marginBottom: 16 }}
            >
              Kembali ke Pilih Semester
            </Button>
            {filteredMapelList.length > 0 ? (
              <Select
                style={{ width: "100%" }}
                placeholder="Pilih Mata Pelajaran"
                onChange={(value) => {
                  setSelectedMapel(value);
                  setShowTable(true);
                }}
                options={allMapelList.map((mapel) => ({
                  value: mapel.idMapel,
                  label: mapel.name,
                }))}
              />
            ) : (
              <Alert
                message="Tidak ada mata pelajaran tersedia"
                type="info"
                showIcon
              />
            )}
          </Space>
        )}
      </div>
    </Card>
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
        <>
          <Card style={{ marginBottom: 16 }}>{renderButtons()}</Card>

          {/* Tampilkan selection steps atau tabel */}
          {!selectedMapel ? (
            renderSelectionSteps() // Tampilkan alur pemilihan 3 langkah
          ) : (
            <>
              {/* Info Filter Aktif */}
              <Card style={{ marginBottom: 16 }}>
                <Row justify="space-between" align="middle">
                  <Col>
                    <Button
                      type="text"
                      icon={<ArrowLeftOutlined />}
                      onClick={() => {
                        setSelectedMapel(null);
                        setCurrentStep(4);
                      }}
                    >
                      Kembali
                    </Button>
                  </Col>
                  <Col>
                    <Space>
                      <Tag color="purple">
                        Tahun Ajaran:{" "}
                        {tahunAjaranList.find(
                          (k) => k.idTahun === selectedTahunAjaran
                        )?.tahunAjaran || "-"}
                      </Tag>
                      <Tag color="blue">
                        Kelas:{" "}
                        {kelasList.find((k) => k.idKelas === selectedKelas)
                          ?.namaKelas || "-"}
                      </Tag>
                      <Tag color="geekblue">
                        Semester:{" "}
                        {semesterList.find(
                          (s) => s.idSemester === selectedSemester
                        )?.namaSemester || "-"}
                      </Tag>
                      <Tag color="red">
                        Mapel:{" "}
                        {allMapelList.find((m) => m.idMapel === selectedMapel)
                          ?.name || "-"}
                      </Tag>
                    </Space>
                  </Col>
                </Row>
              </Card>

              {/* Tabel Data */}
              <Card style={{ overflowX: "scroll" }}>{renderTable()}</Card>
            </>
          )}

          {/* Modal Forms */}
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
        </>
      )}
    </div>
  );
};

export default ACP;
