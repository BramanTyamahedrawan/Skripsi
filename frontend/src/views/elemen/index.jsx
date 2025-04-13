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
import { getElemen, deleteElemen, addElemen, editElemen } from "@/api/elemen";
import { getMapel } from "@/api/mapel";
import { getKelas } from "@/api/kelas";
import { getSemester } from "@/api/semester";
import { getTahunAjaran } from "@/api/tahun-ajaran";
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

  const addFormRef = useRef(null);
  const editFormRef = useRef(null);

  const { Step } = Steps;

  useEffect(() => {
    const initializeData = async () => {
      const userInfoResponse = await reqUserInfo();
      const { id: userId } = userInfoResponse.data;

      await getUserInfoJson(userId);
    };

    initializeData();
  }, []);

  const fetchELemen = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getElemen();
      const { content, statusCode } = result.data;
      if (statusCode === 200) {
        const filteredContent = content.filter(
          (item) => item.school?.idSchool === userIdJson
        );
        setElemen(filteredContent);
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
      fetchELemen();
    }
  }, [userIdJson, fetchELemen]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [tahunAjaranRes, kelasRes, semesterRes, mapelRes] =
          await Promise.all([
            getTahunAjaran(),
            getKelas(),
            getSemester(),
            getMapel(),
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

  const filteredData = elemen
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
        (item?.namaElemen?.toLowerCase() || "").includes(query) ||
        (item?.nameSchool?.toLowerCase() || "").includes(query)
      );
    });

  useEffect(() => {
    if (selectedTahunAjaran && selectedKelas && selectedSemester) {
      // Ambil semua mapel yang sesuai dengan kelas dan semester terpilih
      const availableMapels = allMapelList.filter((mapel) => {
        return elemen.some(
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
  }, [
    selectedTahunAjaran,
    selectedKelas,
    selectedSemester,
    elemen,
    allMapelList,
  ]);

  const getUserInfoJson = async (userId) => {
    const result = await getUserById(userId);
    const { content, statusCode } = result.data;
    if (statusCode === 200) {
      setUserIdJson(content[0].school.idSchool); // Ubah dari userId ke schoolId
    }
  };

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
    getElemen();
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
      title: "Elemen",
      dataIndex: "namaElemen",
      key: "namaElemen",
      align: "center",
      ...getColumnSearchProps("namaElemen"),
      sorter: (a, b) => a.namaElemen.localeCompare(b.namaElemen),
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
