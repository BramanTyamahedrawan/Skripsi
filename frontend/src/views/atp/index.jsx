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

  const searchInput = useRef(null);

  const editATPFormRef = useRef();
  const addATPFormRef = useRef();

  const { Step } = Steps;

  useEffect(() => {
    const initializeData = async () => {
      const userInfoResponse = await reqUserInfo();
      const { id: userId } = userInfoResponse.data;

      await getUserInfoJson(userId);
    };

    initializeData();
  }, []);

  const fetchATP = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getATP();
      const { content, statusCode } = result.data;
      if (statusCode === 200) {
        const filteredContent = content.filter(
          (item) => item.school?.idSchool === userIdJson
        );
        setATP(filteredContent);
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
      fetchATP();
    }
  }, [userIdJson, fetchATP]);

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

  const filteredData = atp
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
        (item?.namaAtp?.toLowerCase() || "").includes(query) ||
        (item?.nameSchool?.toLowerCase() || "").includes(query)
      );
    });

  useEffect(() => {
    if (selectedTahunAjaran && selectedKelas && selectedSemester) {
      // Ambil semua mapel yang sesuai dengan kelas dan semester terpilih
      const availableMapels = allMapelList.filter((mapel) => {
        return atp.some(
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
  }, [selectedTahunAjaran, selectedKelas, selectedSemester, atp, allMapelList]);

  const getUserInfoJson = async (userId) => {
    const result = await getUserById(userId);
    const { content, statusCode } = result.data;
    if (statusCode === 200) {
      setUserIdJson(content[0].school.idSchool); // Ubah dari userId ke schoolId
    }
  };

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

  const handleAddOk = async (values) => {
    setAddATPModalLoading(true);
    try {
      const updatedValues = {
        idAtp: null,
        namaAtp: values.namaAtp,
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
      await addATP(updatedValues);
      setAddATPModalVisible(false);
      message.success("Berhasil menambahkan");
      fetchATP();
    } catch (error) {
      setAddATPModalLoading(false);
      message.error("Gagal menambahkan: " + error.message);
    } finally {
      setAddATPModalLoading(false);
    }
  };

  const handleEditOk = async (values) => {
    setEditATPModalLoading(true);
    try {
      const updatedValues = {
        idAtp: values.idAtp,
        namaAtp: values.namaAtp,
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
      await editATP(updatedValues, currentRowData.idAtp);
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

  const handleEditATP = (row) => {
    setCurrentRowData({ ...row });
    setEditATPModalVisible(true);
  };

  const handleCancel = () => {
    setEditATPModalVisible(false);
    setAddATPModalVisible(false);
  };

  const handleAddATP = () => {
    setAddATPModalVisible(true);
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
    getATP();
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
      title: "Tujuan Pembelajaran",
      dataIndex: "namaAtp",
      key: "namaAtp",
      align: "center",
      ...getColumnSearchProps("namaAtp"),
      sorter: (a, b) => a.namaAtp.localeCompare(b.namaAtp),
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

  const renderTable = () => (
    <Table
      rowKey="idAtp"
      dataSource={filteredData}
      columns={renderColumns()}
      pagination={{ pageSize: 10 }}
    />
  );

  const renderButtons = () => (
    <Row gutter={[16, 16]} justify="start">
      <Col>
        <Button type="primary" onClick={() => setAddATPModalVisible(true)}>
          Tambahkan ATP
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
{
  /* <Modal
        title="Import File"
        visible={importModalVisible}
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
             
            }}
          >
            Upload
          </Button>,
        ]}
      >
        <Upload
          beforeUpload={() => {
           return false;
          }}
          accept=".csv,.xlsx,.xls"
        >
          <Button>Pilih File</Button>
        </Upload>
      </Modal> */
}
