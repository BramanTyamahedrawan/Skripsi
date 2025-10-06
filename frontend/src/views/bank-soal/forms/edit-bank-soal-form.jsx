/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Modal,
  Select,
  Table,
  Tabs,
  Row,
  Col,
  Button,
  message,
  InputNumber,
} from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { getSchool } from "@/api/school";
import { reqUserInfo } from "@/api/user";
import { getKelas } from "@/api/kelas";
import { getTahunAjaran } from "@/api/tahun-ajaran";
import { getSemester } from "@/api/semester";
import { getMapel } from "@/api/mapel";
import { getKonsentrasiSekolah } from "@/api/konsentrasiKeahlianSekolah";
import { getElemen } from "@/api/elemen";
import { getACP } from "@/api/acp";
import { getATP } from "@/api/atp";
import { getTaksonomi } from "@/api/taksonomi";
const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

const EditBankSoalForm = ({
  visible,
  onCancel,
  onOk,
  confirmLoading,
  currentRowData,
}) => {
  const [form] = Form.useForm();
  const [jenisSoal, setJenisSoal] = useState("PG");
  const [options, setOptions] = useState(["A", "B"]); // Default to 2 options: A and B

  const [userSchoolId, setUserSchoolId] = useState([]); // State untuk menyimpan ID sekolah user
  const [schoolList, setSchoolList] = useState([]);
  const [konsentrasiKeahlianSekolahList, setKonsentrasiKeahlianSekolahList] =
    useState([]);
  const [taksonomiList, setTaksonomiList] = useState([]);
  const [tahunAjaranList, setTahunAjaranList] = useState([]);
  const [semesterList, setSemesterList] = useState([]);
  const [kelasList, setKelasList] = useState([]);
  const [mapelList, setMapelList] = useState([]);
  const [elemenList, setElemenList] = useState([]);
  const [acpList, setAcpList] = useState([]);
  const [atpList, setAtpList] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);

  const addOption = () => {
    if (options.length < 5) {
      const nextOption = String.fromCharCode(65 + options.length); // 65 is ASCII for 'A'
      setOptions([...options, nextOption]);
    }
  };

  const removeOption = () => {
    if (options.length > 2) {
      // Check if removed option is selected as correct answer
      const currentAnswer = form.getFieldValue("jawabanBenar");
      const optionToRemove = options[options.length - 1];

      // If removing the selected answer, reset the answer
      if (currentAnswer === optionToRemove) {
        form.setFieldsValue({ jawabanBenar: undefined });
      }

      // Remove the option
      setOptions(options.slice(0, -1));
    }
  };

  const fetchUserInfo = async () => {
    try {
      const response = await reqUserInfo(); // Ambil data user dari API
      setUserSchoolId(response.data.school_id); // Simpan ID sekolah user ke state
      console.log("User School ID: ", response.data.school_id);
    } catch (error) {
      message.error("Gagal mengambil informasi pengguna");
    }
  };

  const fetchSchoolList = async () => {
    try {
      const result = await getSchool();
      if (result.data.statusCode === 200) {
        setSchoolList(result.data.content);
      } else {
        message.error("Gagal mengambil data");
      }
    } catch (error) {
      message.error("Terjadi kesalahan: " + error.message);
    }
  };

  const fetchKonsentrasiKeahlianSekolahList = async () => {
    try {
      const result = await getKonsentrasiSekolah();
      if (result.data.statusCode === 200) {
        setKonsentrasiKeahlianSekolahList(result.data.content);
      } else {
        message.error("Gagal mengambil data");
      }
    } catch (error) {
      message.error("Terjadi kesalahan: " + error.message);
    }
  };

  const fetchTaksonomiList = async () => {
    try {
      const result = await getTaksonomi();
      if (result.data.statusCode === 200) {
        setTaksonomiList(result.data.content);
      }
    } catch (error) {
      message.error("Gagal mengambil data taksonomi");
    }
  };

  const fetchTahunAjaranList = async () => {
    try {
      const result = await getTahunAjaran();
      if (result.data.statusCode === 200) {
        setTahunAjaranList(result.data.content);
      }
    } catch (error) {
      message.error("Gagal mengambil data tahun ajaran");
    }
  };

  const fetchSemesterList = async () => {
    try {
      const result = await getSemester();
      if (result.data.statusCode === 200) {
        setSemesterList(result.data.content);
      }
    } catch (error) {
      message.error("Gagal mengambil data semester");
    }
  };

  const fetchKelasList = async () => {
    try {
      const result = await getKelas();
      if (result.data.statusCode === 200) {
        setKelasList(result.data.content);
      }
    } catch (error) {
      message.error("Gagal mengambil data kelas");
    }
  };

  const fetchMapelList = async () => {
    try {
      const result = await getMapel();
      if (result.data.statusCode === 200) {
        setMapelList(result.data.content);
      }
    } catch (error) {
      message.error("Gagal mengambil data mapel");
    }
  };

  const fetchElemenList = async () => {
    try {
      const result = await getElemen();
      if (result.data.statusCode === 200) {
        setElemenList(result.data.content);
      }
    } catch (error) {
      message.error("Gagal mengambil data elemen");
    }
  };

  const fetchAcpList = async () => {
    try {
      const result = await getACP();
      if (result.data.statusCode === 200) {
        setAcpList(result.data.content);
      }
    } catch (error) {
      message.error("Gagal mengambil data ACP");
    }
  };

  const fetchAtpList = async () => {
    try {
      const result = await getATP();
      if (result.data.statusCode === 200) {
        setAtpList(result.data.content);
      }
    } catch (error) {
      message.error("Gagal mengambil data ATP");
    }
  };

  // Fetch data awal
  useEffect(() => {
    const fetchData = async () => {
      try {
        setTableLoading(true);
        await Promise.all([
          fetchUserInfo(),
          fetchSchoolList(),
          fetchKonsentrasiKeahlianSekolahList(),
          fetchTaksonomiList(),
          fetchTahunAjaranList(),
          fetchSemesterList(),
          fetchKelasList(),
          fetchMapelList(),
          fetchElemenList(),
          fetchAcpList(),
          fetchAtpList(),
        ]);
      } catch (error) {
        message.error("Gagal memuat data");
      } finally {
        setTableLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (currentRowData) {
      const { jenisSoal, jawabanBenar, opsi, pasangan } = currentRowData;
      const pasanganKiri = Object.fromEntries(
        Object.entries(pasangan || {}).filter(([key]) => key.includes("_kiri"))
      );
      const pasanganKanan = Object.fromEntries(
        Object.entries(pasangan || {}).filter(([key]) => key.includes("_kanan"))
      );

      form.setFieldsValue({
        idBankSoal: currentRowData.idBankSoal,
        namaUjian: currentRowData.namaUjian,
        pertanyaan: currentRowData.pertanyaan,
        bobot: currentRowData.bobot,
        jenisSoal: currentRowData.jenisSoal,
        idKelas: currentRowData.kelas?.idKelas,
        idTahun: currentRowData.tahunAjaran?.idTahun,
        idSemester: currentRowData.semester?.idSemester,
        idMapel: currentRowData.mapel?.idMapel,
        idKonsentrasiSekolah:
          currentRowData.konsentrasiKeahlianSekolah?.idKonsentrasiSekolah,
        idElemen: currentRowData.elemen?.idElemen,
        idAcp: currentRowData.acp?.idAcp,
        idAtp: currentRowData.atp?.idAtp,
        idTaksonomi: currentRowData.taksonomi?.idTaksonomi,
        idSchool: currentRowData.school?.idSchool,
        opsiA: currentRowData.opsi?.A,
        opsiB: currentRowData.opsi?.B,
        opsiC: currentRowData.opsi?.C,
        opsiD: currentRowData.opsi?.D,
        opsiE: currentRowData.opsi?.E,
        opsiF: currentRowData.opsi?.F,
        opsiG: currentRowData.opsi?.G,
        opsiH: currentRowData.opsi?.H,
        jawabanBenar:
          jenisSoal === "PG" || jenisSoal === "ISIAN"
            ? jawabanBenar?.[0]
            : jawabanBenar, // PG & ISIAN pakai string, lainnya array
        jawabanBenarMulti: jawabanBenar, // untuk checkbox (MULTI)
        pasanganKiri: Object.values(pasanganKiri),
        pasanganKanan: Object.values(pasanganKanan),
        pasanganJawaban: jawabanBenar,
        jawabanIsian: Array.isArray(currentRowData.jawabanBenar)
          ? currentRowData.jawabanBenar[0]
          : currentRowData.jawabanBenar,
        toleransiTypo: currentRowData.toleransiTypo || null,
      });

      console.log(
        "Setting jawabanIsian to:",
        Array.isArray(currentRowData.jawabanBenar)
          ? currentRowData.jawabanBenar[0]
          : currentRowData.jawabanBenar
      );
      console.log("currentRowData.jawabanBenar:", currentRowData.jawabanBenar);

      setJenisSoal(currentRowData.jenisSoal);
      setOptions(Object.keys(currentRowData.opsi || {})); // Set options based on existing data
    }
  }, [currentRowData, form]);

  // Separate useEffect to ensure jawabanIsian gets the correct value
  useEffect(() => {
    if (
      currentRowData &&
      currentRowData.jenisSoal === "ISIAN" &&
      currentRowData.jawabanBenar
    ) {
      const jawabanValue = Array.isArray(currentRowData.jawabanBenar)
        ? currentRowData.jawabanBenar[0]
        : currentRowData.jawabanBenar;

      // Only set if current form value is empty or undefined
      const currentValue = form.getFieldValue("jawabanIsian");
      if (!currentValue) {
        console.log("Explicitly setting jawabanIsian to:", jawabanValue);
        form.setFieldsValue({ jawabanIsian: jawabanValue });
      }
    }
  }, [currentRowData, form, jenisSoal]);

  useEffect(() => {
    if (userSchoolId) {
      form.setFieldsValue({ idSchool: userSchoolId });
    }
  }, [userSchoolId, form]);

  // Handler for changing question type
  const handleJenisSoalChange = (value) => {
    const previousJenisSoal = jenisSoal;

    // Only reset if question type actually changes
    if (previousJenisSoal !== value) {
      setJenisSoal(value);

      // Reset options to default when changing to PG or MULTI
      if (value === "PG" || value === "MULTI") {
        setOptions(["A", "B"]);
      }

      // Only reset answer fields that are not relevant to the new question type
      const fieldsToReset = {};

      // Reset PG/MULTI specific fields if not switching to PG/MULTI
      if (value !== "PG" && value !== "MULTI") {
        fieldsToReset.opsiA = undefined;
        fieldsToReset.opsiB = undefined;
        fieldsToReset.opsiC = undefined;
        fieldsToReset.opsiD = undefined;
        fieldsToReset.opsiE = undefined;
        fieldsToReset.jawabanBenar = undefined;
        fieldsToReset.jawabanBenarMulti = undefined;
      }

      // Reset COCOK specific fields if not switching to COCOK
      if (value !== "COCOK") {
        fieldsToReset.pasanganKiri = undefined;
        fieldsToReset.pasanganKanan = undefined;
        fieldsToReset.pasanganJawaban = undefined;
      }

      // Reset ISIAN specific fields if not switching to ISIAN
      if (value !== "ISIAN") {
        fieldsToReset.jawabanIsian = undefined;
        fieldsToReset.toleransiTypo = null;
      }

      // Only reset fields that need to be reset
      if (Object.keys(fieldsToReset).length > 0) {
        form.setFieldsValue(fieldsToReset);
      }
    }
  };

  // Submit handler
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      console.log("Form values before transformation:", values);

      // Transform form values to match backend BankSoalRequest
      const payload = {
        idBankSoal: values.idBankSoal,
        idSoalUjian: currentRowData?.idSoalUjian,
        namaUjian: values.namaUjian,
        pertanyaan: values.pertanyaan,
        bobot: values.bobot?.toString(),
        jenisSoal: values.jenisSoal,
        idKelas: values.idKelas,
        idTahun: values.idTahun,
        idSemester: values.idSemester,
        idMapel: values.idMapel,
        idKonsentrasiSekolah: values.idKonsentrasiSekolah,
        idElemen: values.idElemen,
        idAcp: values.idAcp,
        idAtp: values.idAtp,
        idTaksonomi: values.idTaksonomi,
        idSchool: values.idSchool,
      };

      // Transform based on question type
      switch (values.jenisSoal) {
        case "PG": {
          // Build opsi object
          const opsiPG = {};
          options.forEach((opt) => {
            if (values[`opsi${opt}`]) {
              opsiPG[opt] = values[`opsi${opt}`];
            }
          });
          payload.opsi = opsiPG;
          payload.jawabanBenar = [values.jawabanBenar];
          break;
        }

        case "MULTI": {
          // Build opsi object
          const opsiMulti = {};
          options.forEach((opt) => {
            if (values[`opsi${opt}`]) {
              opsiMulti[opt] = values[`opsi${opt}`];
            }
          });
          payload.opsi = opsiMulti;
          payload.jawabanBenar = values.jawabanBenarMulti || [];
          break;
        }

        case "COCOK": {
          // Build pasangan object
          const pasangan = {};
          if (values.pasanganKiri && values.pasanganKanan) {
            values.pasanganKiri.forEach((item, index) => {
              if (item && item.trim()) {
                pasangan[`${index + 1}_kiri`] = item.trim();
              }
            });
            values.pasanganKanan.forEach((item, index) => {
              if (item && item.trim()) {
                pasangan[`${index + 1}_kanan`] = item.trim();
              }
            });
          }
          payload.pasangan = pasangan;
          payload.jawabanBenar = values.pasanganJawaban || {};
          break;
        }

        case "ISIAN": {
          // Transform jawabanIsian to jawabanBenar
          let jawabanIsian = values.jawabanIsian;
          if (!jawabanIsian && currentRowData?.jawabanBenar) {
            jawabanIsian = Array.isArray(currentRowData.jawabanBenar)
              ? currentRowData.jawabanBenar[0]
              : currentRowData.jawabanBenar;
          }
          payload.jawabanBenar = [jawabanIsian || ""];
          payload.toleransiTypo = values.toleransiTypo || null;
          break;
        }
      }

      console.log("Transformed payload:", payload);
      onOk(payload);
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  // Render form based on question type
  const renderQuestionForm = () => {
    switch (jenisSoal) {
      case "PG":
        return (
          <Row gutter={16}>
            {options.map((option) => (
              <Col xs={24} sm={12} md={12} key={option}>
                <Form.Item
                  label={`Opsi ${option}`}
                  name={`opsi${option}`}
                  rules={[
                    {
                      required: true,
                      message: `Opsi ${option} wajib diisi`,
                    },
                  ]}
                >
                  <Input placeholder={`Masukkan opsi ${option}`} />
                </Form.Item>
              </Col>
            ))}
            <Col xs={24} sm={24} md={24}>
              <div style={{ marginBottom: 16 }}>
                <Button
                  type="dashed"
                  onClick={addOption}
                  disabled={options.length >= 5}
                  style={{ marginRight: 8 }}
                  icon={<PlusOutlined />}
                >
                  Tambah Opsi
                </Button>
                <Button
                  type="dashed"
                  onClick={removeOption}
                  disabled={options.length <= 2}
                  danger
                  icon={<DeleteOutlined />}
                >
                  Hapus Opsi
                </Button>
              </div>
            </Col>
            <Col xs={24} sm={24} md={24}>
              <Form.Item
                label="Jawaban Benar"
                name="jawabanBenar"
                rules={[
                  {
                    required: true,
                    message: "Jawaban benar wajib dipilih",
                  },
                ]}
              >
                <Select placeholder="Pilih jawaban benar">
                  {options.map((option) => (
                    <Option key={option} value={option}>
                      {option}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
        );

      case "MULTI":
        return (
          <Row gutter={16}>
            {options.map((option) => (
              <Col xs={24} sm={12} md={12} key={option}>
                <Form.Item
                  label={`Opsi ${option}`}
                  name={`opsi${option}`}
                  rules={[
                    {
                      required: true,
                      message: `Opsi ${option} wajib diisi`,
                    },
                  ]}
                >
                  <Input placeholder={`Masukkan opsi ${option}`} />
                </Form.Item>
              </Col>
            ))}
            <Col xs={24} sm={24} md={24}>
              <div style={{ marginBottom: 16 }}>
                <Button
                  type="dashed"
                  onClick={addOption}
                  disabled={options.length >= 5}
                  style={{ marginRight: 8 }}
                  icon={<PlusOutlined />}
                >
                  Tambah Opsi
                </Button>
                <Button
                  type="dashed"
                  onClick={removeOption}
                  disabled={options.length <= 2}
                  danger
                  icon={<DeleteOutlined />}
                >
                  Hapus Opsi
                </Button>
              </div>
            </Col>
            <Col xs={24} sm={24} md={24}>
              <Form.Item
                label="Jawaban Benar (Pilih Lebih dari Satu)"
                name="jawabanBenarMulti"
                rules={[
                  {
                    required: true,
                    message: "Minimal satu jawaban benar harus dipilih",
                  },
                ]}
              >
                <Select
                  mode="multiple"
                  placeholder="Pilih jawaban benar (bisa lebih dari satu)"
                >
                  {options.map((option) => (
                    <Option key={option} value={option}>
                      {option}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
        );

      case "COCOK":
        return (
          <Row gutter={16}>
            <Col xs={24} sm={12} md={12}>
              <Form.Item
                label="Kolom Kiri"
                name="pasanganKiri"
                rules={[
                  {
                    required: true,
                    message: "Kolom kiri wajib diisi",
                  },
                ]}
              >
                <Form.List name="pasanganKiri">
                  {(fields, { add, remove }) => (
                    <>
                      {fields.map(({ key, name, ...restField }) => (
                        <div
                          key={key}
                          style={{
                            display: "flex",
                            marginBottom: 8,
                            alignItems: "center",
                          }}
                        >
                          <Form.Item
                            {...restField}
                            name={[name]}
                            rules={[
                              {
                                required: true,
                                message: "Item tidak boleh kosong",
                              },
                            ]}
                            style={{ flex: 1, marginBottom: 0 }}
                          >
                            <Input placeholder={`Item ${name + 1}`} />
                          </Form.Item>
                          {fields.length > 2 && (
                            <Button
                              type="link"
                              danger
                              onClick={() => remove(name)}
                              icon={<DeleteOutlined />}
                              style={{ marginLeft: 8 }}
                            />
                          )}
                        </div>
                      ))}
                      {fields.length < 8 && (
                        <Form.Item>
                          <Button
                            type="dashed"
                            onClick={() => add()}
                            block
                            icon={<PlusOutlined />}
                          >
                            Tambah Item Kiri
                          </Button>
                        </Form.Item>
                      )}
                    </>
                  )}
                </Form.List>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={12}>
              <Form.Item
                label="Kolom Kanan"
                name="pasanganKanan"
                rules={[
                  {
                    required: true,
                    message: "Kolom kanan wajib diisi",
                  },
                ]}
              >
                <Form.List name="pasanganKanan">
                  {(fields, { add, remove }) => (
                    <>
                      {fields.map(({ key, name, ...restField }) => (
                        <div
                          key={key}
                          style={{
                            display: "flex",
                            marginBottom: 8,
                            alignItems: "center",
                          }}
                        >
                          <Form.Item
                            {...restField}
                            name={[name]}
                            rules={[
                              {
                                required: true,
                                message: "Item tidak boleh kosong",
                              },
                            ]}
                            style={{ flex: 1, marginBottom: 0 }}
                          >
                            <Input placeholder={`Item ${name + 1}`} />
                          </Form.Item>
                          {fields.length > 2 && (
                            <Button
                              type="link"
                              danger
                              onClick={() => remove(name)}
                              icon={<DeleteOutlined />}
                              style={{ marginLeft: 8 }}
                            />
                          )}
                        </div>
                      ))}
                      {fields.length < 8 && (
                        <Form.Item>
                          <Button
                            type="dashed"
                            onClick={() => add()}
                            block
                            icon={<PlusOutlined />}
                          >
                            Tambah Item Kanan
                          </Button>
                        </Form.Item>
                      )}
                    </>
                  )}
                </Form.List>
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={24}>
              <Form.Item
                label="Pasangan Jawaban"
                name="pasanganJawaban"
                extra="Format: {'1': '2', '3': '1'} - angka kiri untuk kolom kiri, angka kanan untuk kolom kanan"
              >
                <TextArea
                  rows={3}
                  placeholder='Contoh: {"1": "2", "2": "1", "3": "3"}'
                />
              </Form.Item>
            </Col>
          </Row>
        );

      case "ISIAN":
        return (
          <Row gutter={16}>
            <Col xs={24} sm={24} md={24}>
              <Form.Item
                label="Jawaban yang Benar"
                name="jawabanIsian"
                key={`jawabanIsian-${currentRowData?.idBankSoal || "new"}`}
                initialValue={
                  currentRowData && Array.isArray(currentRowData.jawabanBenar)
                    ? currentRowData.jawabanBenar[0]
                    : currentRowData?.jawabanBenar
                }
                rules={[
                  {
                    required: true,
                    message: "Jawaban isian wajib diisi",
                  },
                ]}
              >
                <Input placeholder="Masukkan jawaban yang benar" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={24}>
              <Form.Item
                label="Toleransi Typo (%)"
                name="toleransiTypo"
                help="Masukkan persentase toleransi kesalahan pengetikan (0-100), kosongkan jika tidak ada toleransi"
              >
                <InputNumber
                  min={0}
                  max={100}
                  placeholder="Contoh: 5 untuk toleransi 5%"
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
          </Row>
        );

      default:
        return null;
    }
  };

  return (
    <Modal
      title="Edit Bank Soal"
      open={visible}
      onCancel={() => {
        form.resetFields();
        setOptions(["A", "B"]); // Reset options when closing modal
        onCancel();
      }}
      onOk={handleSubmit}
      confirmLoading={confirmLoading}
      okText="Simpan"
      width={1000}
    >
      <Form form={form} layout="vertical">
        <Tabs defaultActiveKey="1">
          <TabPane tab="Informasi ATP" key="1">
            <Row gutter={16}>
              <Col xs={24} sm={24} md={24}>
                <Form.Item name="idBankSoal" style={{ display: "none" }}>
                  <Input type="hidden" />
                </Form.Item>

                <Form.Item
                  label="Sekolah:"
                  name="idSchool"
                  style={{ display: "none" }}
                  rules={[
                    { required: true, message: "Silahkan pilih Sekolah" },
                  ]}
                >
                  <Select defaultValue={userSchoolId} disabled>
                    {schoolList
                      .filter(({ idSchool }) => idSchool === userSchoolId) // Hanya menampilkan sekolah user
                      .map(({ idSchool, nameSchool }) => (
                        <Option key={idSchool} value={idSchool}>
                          {nameSchool}
                        </Option>
                      ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={12}>
                <Form.Item
                  label="Konsentrasi Keahlian Sekolah:"
                  name="idKonsentrasiSekolah"
                  rules={[
                    {
                      required: true,
                      message: "Silahkan pilih Konsentrasi Keahlian Sekolah",
                    },
                  ]}
                >
                  <Select
                    placeholder="Pilih Konsentrasi Keahlian Sekolah"
                    showSearch
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      option.children
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                  >
                    {konsentrasiKeahlianSekolahList.map(
                      ({ idKonsentrasiSekolah, namaKonsentrasiSekolah }) => (
                        <Option
                          key={idKonsentrasiSekolah}
                          value={idKonsentrasiSekolah}
                        >
                          {namaKonsentrasiSekolah}
                        </Option>
                      )
                    )}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={12}>
                <Form.Item
                  label="Tahun Ajaran:"
                  name="idTahun"
                  rules={[
                    {
                      required: true,
                      message: "Silahkan pilih Tahun Ajaran",
                    },
                  ]}
                >
                  <Select
                    placeholder="Pilih Tahun Ajaran"
                    showSearch
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      option.children
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                  >
                    {tahunAjaranList.map(({ idTahun, tahunAjaran }) => (
                      <Option key={idTahun} value={idTahun}>
                        {tahunAjaran}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={12}>
                <Form.Item
                  label="Semester:"
                  name="idSemester"
                  rules={[
                    {
                      required: true,
                      message: "Silahkan pilih Semester",
                    },
                  ]}
                >
                  <Select
                    placeholder="Pilih Semester"
                    showSearch
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      option.children
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                  >
                    {semesterList.map(({ idSemester, namaSemester }) => (
                      <Option key={idSemester} value={idSemester}>
                        {namaSemester}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={12}>
                <Form.Item
                  label="Kelas:"
                  name="idKelas"
                  rules={[
                    {
                      required: true,
                      message: "Silahkan pilih Kelas",
                    },
                  ]}
                >
                  <Select
                    placeholder="Pilih Kelas"
                    showSearch
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      option.children
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                  >
                    {kelasList.map(({ idKelas, namaKelas }) => (
                      <Option key={idKelas} value={idKelas}>
                        {namaKelas}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={12}>
                <Form.Item
                  label="Mata Pelajaran:"
                  name="idMapel"
                  rules={[
                    {
                      required: true,
                      message: "Silahkan pilih Mata Pelajaran",
                    },
                  ]}
                >
                  <Select
                    placeholder="Pilih Mata Pelajaran"
                    showSearch
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      option.children
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                  >
                    {mapelList.map(({ idMapel, name }) => (
                      <Option key={idMapel} value={idMapel}>
                        {name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={12}>
                <Form.Item
                  label="Elemen:"
                  name="idElemen"
                  rules={[
                    {
                      required: true,
                      message: "Silahkan pilih Elemen",
                    },
                  ]}
                >
                  <Select
                    placeholder="Pilih Elemen"
                    showSearch
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      option.children
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                  >
                    {elemenList.map(({ idElemen, namaElemen }) => (
                      <Option key={idElemen} value={idElemen}>
                        {namaElemen}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={24}>
                <Form.Item
                  label="Capaian Pembelajaran:"
                  name="idAcp"
                  rules={[
                    {
                      required: true,
                      message: "Silahkan pilih Capaian Pembelajaran",
                    },
                  ]}
                >
                  <Select
                    placeholder="Pilih Capaian Pembelajaran"
                    showSearch
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      option.children
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                  >
                    {acpList.map(({ idAcp, namaAcp }) => (
                      <Option key={idAcp} value={idAcp}>
                        {namaAcp.length > 100
                          ? `${namaAcp.substring(0, 100)}...`
                          : namaAcp}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={24}>
                <Form.Item
                  label="Tujuan Pembelajaran:"
                  name="idAtp"
                  rules={[
                    {
                      required: true,
                      message: "Silahkan pilih Tujuan Pembelajaran",
                    },
                  ]}
                >
                  <Select
                    placeholder="Pilih Tujuan Pembelajaran"
                    showSearch
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      option.children
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                  >
                    {atpList.map(({ idAtp, namaAtp }) => (
                      <Option key={idAtp} value={idAtp}>
                        {namaAtp.length > 100
                          ? `${namaAtp.substring(0, 100)}...`
                          : namaAtp}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </TabPane>
          <TabPane tab="Informasi Soal" key="2">
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  label="Jenis Soal"
                  name="jenisSoal"
                  rules={[
                    { required: true, message: "Jenis soal wajib dipilih" },
                  ]}
                >
                  <Select onChange={handleJenisSoalChange}>
                    <Option value="PG">Pilihan Ganda</Option>
                    <Option value="MULTI">Multi Jawaban</Option>
                    <Option value="COCOK">Mencocokkan</Option>
                    <Option value="ISIAN">Isian</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  label="Nama Ujian"
                  name="namaUjian"
                  rules={[
                    { required: true, message: "Nama ujian wajib diisi" },
                  ]}
                >
                  <Input placeholder="Nama Ujian" />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  label="Pertanyaan"
                  name="pertanyaan"
                  rules={[
                    { required: true, message: "Pertanyaan wajib diisi" },
                  ]}
                >
                  <TextArea rows={4} placeholder="Tulis pertanyaan di sini" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Bobot"
                  name="bobot"
                  rules={[{ required: true, message: "Bobot wajib diisi" }]}
                >
                  <InputNumber min={1} max={100} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Taksonomi"
                  name="idTaksonomi"
                  rules={[{ required: true, message: "Taksonomi wajib diisi" }]}
                >
                  <Select placeholder="Pilih Taksonomi">
                    {taksonomiList.map(({ idTaksonomi, namaTaksonomi }) => (
                      <Option key={idTaksonomi} value={idTaksonomi}>
                        {namaTaksonomi}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </TabPane>
          <TabPane tab="Pilihan & Jawaban" key="3">
            {renderQuestionForm()}
          </TabPane>
        </Tabs>
      </Form>
    </Modal>
  );
};

export default EditBankSoalForm;
