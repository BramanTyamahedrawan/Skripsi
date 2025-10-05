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
  Spin,
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
import { getACP } from "@/api/acp";
import { getKonsentrasiSekolah } from "@/api/konsentrasiKeahlianSekolah";
import TypingCard from "@/components/TypingCard";
import EditATPForm from "./forms/edit-atp-form";
import AddATPForm from "./forms/add-atp-form";
import { Skeleton } from "antd";
import Highlighter from "react-highlight-words";
import { reqUserInfo, getUserById } from "@/api/user";
import { useTableSearch } from "@/helper/tableSearchHelper.jsx";
import * as XLSX from "xlsx";
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
  const [importFile, setImportFile] = useState(null);
  const [mappingData, setMappingData] = useState({
    semesterList: [],
    mapelList: [],
    tahunAjaranList: [],
    elemenList: [],
    kelasList: [],
    acpList: [],
    konsentrasiSekolahList: [],
  });

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
    fetchMappingData();
  }, []);

  const fetchMappingData = async () => {
    try {
      const [
        semesterRes,
        mapelRes,
        tahunAjaranRes,
        kelasRes,
        acpRes,
        konsentrasiSekolahRes,
      ] = await Promise.all([
        getSemester(),
        getMapel(),
        getTahunAjaran(),
        getKelas(),
        getACP(),
        getKonsentrasiSekolah(),
      ]);

      // Extract Elemen data from ACP response
      const acpData = acpRes.data.content || [];
      const elemenData = acpData
        .filter((acp) => acp.elemen && acp.elemen.valid)
        .map((acp) => acp.elemen)
        .filter(
          (elemen, index, self) =>
            index === self.findIndex((e) => e.idElemen === elemen.idElemen)
        ); // Remove duplicates

      console.log("=== DEBUG: Extracted Elemen data from ACP ===");
      console.log("📊 Total ACP entries:", acpData.length);
      console.log("📊 Unique Elemen entries found:", elemenData.length);
      console.log("📊 Sample Elemen data:", elemenData.slice(0, 3));

      setMappingData({
        semesterList: semesterRes.data.content || [],
        mapelList: mapelRes.data.content || [],
        tahunAjaranList: tahunAjaranRes.data.content || [],
        elemenList: elemenData,
        kelasList: kelasRes.data.content || [],
        acpList: acpData,
        konsentrasiSekolahList: konsentrasiSekolahRes.data.content || [],
      });
    } catch (error) {
      console.error("Error fetching mapping data:", error);
      message.error("Gagal mengambil data mapping");
    }
  };

  // Normalize string untuk fuzzy matching (hapus spasi dan karakter khusus)
  const normalizeString = (str) => {
    if (!str) return "";
    return str
      .toString()
      .toLowerCase()
      .replace(/[\s\-_.,!@#$%^&*()]/g, "");
  };

  // Mapping functions to convert names to IDs dengan fuzzy matching
  const mapNameToId = (name, list, nameField, idField) => {
    if (!name || !list || list.length === 0) return null;

    const normalizedName = normalizeString(name);

    // First try exact match
    let item = list.find(
      (item) => normalizeString(item[nameField]) === normalizedName
    );

    // If no exact match for ACP, try partial match (untuk menangani deskripsi ACP yang panjang)
    if (!item && nameField === "namaAcp") {
      // Try to find if the search term is contained in any ACP description
      item = list.find(
        (item) =>
          normalizeString(item[nameField]).includes(normalizedName) ||
          normalizedName.includes(normalizeString(item[nameField]))
      );

      // If still not found, try matching first 100 characters (untuk ACP panjang)
      if (!item) {
        const shortName = normalizeString(name.substring(0, 100));
        item = list.find(
          (item) =>
            normalizeString(item[nameField].substring(0, 100)) === shortName
        );
      }
    }

    return item ? item[idField] : null;
  };

  const mapSemesterNameToId = (name) =>
    mapNameToId(name, mappingData.semesterList, "namaSemester", "idSemester");
  const mapMapelNameToId = (name) =>
    mapNameToId(name, mappingData.mapelList, "name", "idMapel");
  const mapTahunAjaranToId = (tahun) =>
    mapNameToId(tahun, mappingData.tahunAjaranList, "tahunAjaran", "idTahun");
  const mapElemenNameToId = (name) => {
    console.log(`🔍 Searching for Elemen: "${name}"`);
    console.log(
      `📊 Available Elemen data:`,
      mappingData.elemenList?.map((e) => e.namaElemen).slice(0, 5)
    );
    const result = mapNameToId(
      name,
      mappingData.elemenList,
      "namaElemen",
      "idElemen"
    );
    console.log(`✅ Elemen mapping result: "${name}" -> ${result}`);
    return result;
  };
  const mapKelasNameToId = (name) =>
    mapNameToId(name, mappingData.kelasList, "namaKelas", "idKelas");
  const mapAcpNameToId = (name) => {
    console.log(`🔍 Searching for ACP: "${name}"`);
    console.log(
      `📊 Available ACP data:`,
      mappingData.acpList?.map((a) => a.namaAcp?.substring(0, 50)).slice(0, 3)
    );
    const result = mapNameToId(name, mappingData.acpList, "namaAcp", "idAcp");
    console.log(`✅ ACP mapping result: "${name}" -> ${result}`);
    return result;
  };
  const mapKonsentrasiNameToId = (name) =>
    mapNameToId(
      name,
      mappingData.konsentrasiSekolahList,
      "namaKonsentrasiSekolah",
      "idKonsentrasiSekolah"
    );

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
    const { idAtp, namaAtp } = row;
    Modal.confirm({
      title: "Konfirmasi Hapus ATP",
      content: (
        <div>
          <p>
            Menghapus ATP <strong>&quot;{namaAtp}&quot;</strong>
          </p>
          <p>
            <strong>ℹ️ Info:</strong> Hanya ATP yang akan dihapus. Elemen dan
            ACP terkait tetap ada.
          </p>
          <p>
            <strong>Apakah Anda yakin ingin melanjutkan?</strong>
          </p>
        </div>
      ),
      okText: "Ya, Hapus ATP",
      okType: "danger",
      cancelText: "Batal",
      width: 450,
      onOk: async () => {
        try {
          console.log("🗑️ Deleting ATP only:", namaAtp);
          await deleteATP({ idAtp });
          message.success(`Berhasil menghapus ATP &quot;${namaAtp}&quot;`);
          fetchATP();
        } catch (error) {
          message.error("Gagal menghapus: " + error.message);
          console.error("ATP delete error:", error);
        }
      },
    });
  };

  const handleImportFile = (file) => {
    return new Promise((resolve, reject) => {
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

        let successCount = 0;
        let errorCount = 0;
        let errorMessages = [];

        // Loop dan masukkan satu-satu
        for (const row of rows) {
          if (!row[idx("namaAtp")] || !row[idx("jumlahJpl")]) continue;

          const cleanText = (val) => (val ?? "").toString();

          try {
            // Map names to IDs using the mapping functions
            const tahunAjaranId = mapTahunAjaranToId(row[idx("tahunAjaran")]);
            const semesterId = mapSemesterNameToId(row[idx("namaSemester")]);
            const kelasId = mapKelasNameToId(row[idx("namaKelas")]);
            const mapelId = mapMapelNameToId(row[idx("namaMapel")]);
            const elemenId = mapElemenNameToId(row[idx("namaElemen")]);
            const acpId = mapAcpNameToId(row[idx("namaAcp")]);
            const konsentrasiId = mapKonsentrasiNameToId(
              row[idx("namaKonsentrasiSekolah")]
            );

            // Validate required fields
            if (!row[idx("namaAtp")] || !row[idx("jumlahJpl")]) {
              throw new Error("Field wajib kosong: namaAtp atau jumlahJpl");
            }

            // Validasi khusus untuk Elemen dan ACP
            if (!elemenId) {
              const errorMsg = `ATP "${cleanText(
                row[idx("namaAtp")]
              )}" dengan Elemen "${cleanText(
                row[idx("namaElemen")]
              )}" gagal diimpor karena data Elemen tidak ditemukan`;
              errorMessages.push(errorMsg);
              console.warn(errorMsg);
              errorCount++;
              continue; // Skip ke data berikutnya
            }

            if (!acpId) {
              const errorMsg = `ATP "${cleanText(
                row[idx("namaAtp")]
              )}" dengan ACP "${cleanText(
                row[idx("namaAcp")]
              )}" gagal diimpor karena data ACP tidak ditemukan`;
              errorMessages.push(errorMsg);
              console.warn(errorMsg);
              errorCount++;
              continue; // Skip ke data berikutnya
            }

            // Validasi field lainnya
            if (
              !tahunAjaranId ||
              !semesterId ||
              !kelasId ||
              !mapelId ||
              !konsentrasiId
            ) {
              const missingFields = [];
              if (!tahunAjaranId) missingFields.push("Tahun Ajaran");
              if (!semesterId) missingFields.push("Semester");
              if (!kelasId) missingFields.push("Kelas");
              if (!mapelId) missingFields.push("Mapel");
              if (!konsentrasiId) missingFields.push("Konsentrasi Sekolah");

              const errorMsg = `ATP "${cleanText(
                row[idx("namaAtp")]
              )}" gagal diimpor karena data tidak ditemukan: ${missingFields.join(
                ", "
              )}`;
              errorMessages.push(errorMsg);
              console.warn(errorMsg);
              errorCount++;
              continue;
            }

            // Buat data ATP
            const atpData = {
              idAtp: null,
              namaAtp: cleanText(row[idx("namaAtp")]),
              jumlahJpl: cleanText(row[idx("jumlahJpl")]),
              idAcp: acpId,
              idElemen: elemenId,
              idKonsentrasiSekolah: konsentrasiId,
              idKelas: kelasId,
              idTahun: tahunAjaranId,
              idSemester: semesterId,
              idMapel: mapelId,
              idSekolah: row[idx("idSchool")] || "RWK001",
            };

            console.log("=== DEBUG: Mengirim data ATP ===");
            console.log("📤 PAYLOAD IMPORT ATP:");
            console.log("  namaAtp:", atpData.namaAtp);
            console.log("  jumlahJpl:", atpData.jumlahJpl);
            console.log("  idElemen:", atpData.idElemen);
            console.log("  idAcp:", atpData.idAcp);
            console.log(
              "  idKonsentrasiSekolah:",
              atpData.idKonsentrasiSekolah
            );

            await addATP(atpData);
            successCount++;
          } catch (error) {
            console.error(
              `Gagal import ATP: ${row[idx("namaAtp")] || "Unknown"}`,
              error
            );
            const errorMsg = `ATP "${cleanText(
              row[idx("namaAtp")]
            )}" gagal diimpor: ${error.message}`;
            errorMessages.push(errorMsg);
            errorCount++;
          }
        }

        // Tampilkan hasil import
        if (successCount > 0) {
          message.success(
            `Import berhasil! ${successCount} ATP berhasil ditambahkan.`
          );
        }

        if (errorCount > 0) {
          // Tampilkan beberapa error pertama saja
          const displayErrors = errorMessages.slice(0, 5);
          const moreErrors =
            errorMessages.length > 5
              ? `\n... dan ${errorMessages.length - 5} error lainnya`
              : "";

          message.error({
            content: `${errorCount} ATP gagal diimpor:\n${displayErrors.join(
              "\n"
            )}${moreErrors}`,
            duration: 10,
          });
        }

        // Refresh data
        fetchATP();
        setImportModalVisible(false);
        setImportFile(null);
        resolve();
      };
      reader.readAsArrayBuffer(file);
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
        <style>
          {`
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
          `}
        </style>

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
      <Col>
        <Button
          icon={<UploadOutlined />}
          onClick={() => setImportModalVisible(true)}
        >
          Import ATP
        </Button>
      </Col>
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

          {/* Modal Import ATP */}
          <Modal
            title="Import ATP"
            open={importModalVisible}
            closable={!uploading}
            maskClosable={!uploading}
            onCancel={() => {
              if (!uploading) {
                setImportModalVisible(false);
                setImportFile(null);
              }
            }}
            footer={[
              <Button
                key="cancel"
                disabled={uploading}
                onClick={() => {
                  if (!uploading) {
                    setImportModalVisible(false);
                    setImportFile(null);
                  }
                }}
              >
                Cancel
              </Button>,
              <Button
                key="upload"
                type="primary"
                loading={uploading}
                onClick={async () => {
                  if (importFile) {
                    setUploading(true);
                    await handleImportFile(importFile);
                    setUploading(false);
                  } else {
                    message.warning("Pilih file terlebih dahulu!");
                  }
                }}
              >
                Import
              </Button>,
            ]}
            width={600}
          >
            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  display: "block",
                  marginBottom: 8,
                  fontWeight: "bold",
                }}
              >
                Upload File CSV/Excel:
              </label>
              <Upload
                beforeUpload={(file) => {
                  if (!uploading) {
                    setImportFile(file);
                  }
                  return false; // Jangan auto-upload
                }}
                accept=".csv,.xlsx,.xls"
                showUploadList={false}
                maxCount={1}
                disabled={uploading}
              >
                <Button icon={<UploadOutlined />} disabled={uploading}>
                  Pilih File
                </Button>
              </Upload>
              {importFile && (
                <div
                  style={{
                    marginTop: 8,
                    padding: 8,
                    backgroundColor: "#f0f2f5",
                    borderRadius: 4,
                  }}
                >
                  <strong>File terpilih:</strong> {importFile.name}
                </div>
              )}
            </div>

            <div
              style={{
                padding: 12,
                backgroundColor: "#e6f7ff",
                borderRadius: 4,
                fontSize: "12px",
              }}
            >
              <strong>
                💡 Disarankan menggunakan format CSV untuk menghindari file
                corrupt!
              </strong>
              <br />
              <br />
              <strong>Format CSV/Excel yang diperlukan:</strong>
              <br />
              <strong>Kolom Wajib:</strong> namaAtp, jumlahJpl, tahunAjaran,
              namaSemester, namaKelas, namaMapel, namaElemen, namaAcp,
              namaKonsentrasiSekolah, idSchool
              <br />
              <br />
              <strong>Pencocokan Data (Fuzzy Matching):</strong>
              <br />• Sistem mengabaikan spasi, tanda hubung, dan karakter
              khusus
              <br />• Tidak case-sensitive (tidak membedakan huruf besar/kecil)
              <br />• Contoh: &quot;Geometri&quot; = &quot;geometri&quot; =
              &quot;Geo-metri&quot;
              <br />
              <br />
              <strong>Validasi Khusus:</strong>
              <br />• Jika Elemen tidak ditemukan, ATP akan dilewati dengan
              pesan error
              <br />• Jika ACP tidak ditemukan, ATP akan dilewati dengan pesan
              error
              <br />• Import akan berlanjut ke data berikutnya tanpa berhenti
              <br />
              <br />
              <strong>Contoh isi data:</strong>
              <br />• <strong>namaAtp:</strong> &quot;Kongruen&quot;,
              &quot;Operasi Pythagoras&quot;
              <br />• <strong>jumlahJpl:</strong> &quot;2&quot;, &quot;4&quot;
              <br />• <strong>tahunAjaran:</strong> &quot;2025/2026&quot;
              <br />• <strong>namaSemester:</strong> &quot;Ganjil&quot; atau
              &quot;Genap&quot;
              <br />• <strong>namaKelas:</strong> &quot;X&quot;, &quot;XI&quot;,
              atau &quot;XII&quot;
              <br />• <strong>namaMapel:</strong> &quot;Matematika&quot;,
              &quot;Bahasa Indonesia&quot;, dll.
              <br />• <strong>namaElemen:</strong> &quot;Geometri&quot;,
              &quot;Bilangan&quot;, dll.
              <br />• <strong>namaAcp:</strong> &quot;Peserta didik dapat
              menyelesaikan...&quot;
              <br />• <strong>namaKonsentrasiSekolah:</strong> &quot;Desain
              Komunikasi Visual&quot;, dll.
              <br />• <strong>idSchool:</strong> &quot;RWK001&quot; (nilai
              tetap/paten)
              <br />
              <br />
              <strong>Download Template:</strong>
              <br />
              <div style={{ marginTop: 8 }}>
                <a
                  href="/templates/import-template-ATP.csv"
                  download
                  style={{ color: "#1890ff" }}
                >
                  📄 Template ATP (CSV)
                </a>
              </div>
            </div>
          </Modal>

          {/* Loading Overlay untuk Import */}
          {uploading && (
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 9999,
                flexDirection: "column",
              }}
            >
              <Spin size="large" />
              <div
                style={{
                  color: "white",
                  marginTop: 16,
                  fontSize: "16px",
                  fontWeight: "bold",
                }}
              >
                Sedang mengimpor ATP...
              </div>
              <div
                style={{
                  color: "white",
                  marginTop: 8,
                  fontSize: "14px",
                }}
              >
                Mohon tunggu, jangan menutup halaman ini
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ATP;
