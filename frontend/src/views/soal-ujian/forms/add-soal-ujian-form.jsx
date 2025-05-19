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
  Space,
  Radio,
  Checkbox,
  Divider,
} from "antd";
import { PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";
import { getSoalUjian } from "@/api/soalUjian";
import { getSchool } from "@/api/school";
import { reqUserInfo } from "@/api/user";
import { getTaksonomi } from "@/api/taksonomi";
import { getATP } from "@/api/atp";

const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

const AddSoalUjianForm = ({ visible, onCancel, onOk, confirmLoading }) => {
  const [form] = Form.useForm();
  const [soalUjian, setSoalUjian] = useState([]);
  const [jenisSoal, setJenisSoal] = useState("PG");
  const [tableLoading, setTableLoading] = useState(false);
  const [userSchoolId, setUserSchoolId] = useState(null);
  const [userId, setUserId] = useState(null);
  const [schoolList, setSchoolList] = useState([]);
  const [taksonomiList, setTaksonomiList] = useState([]);
  const [atpList, setAtpList] = useState([]);
  const [options, setOptions] = useState(["A", "B"]); // Default to 2 options: A and B

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
      setUserId(response.data.id); // Simpan ID user ke state
      console.log("User School ID: ", response.data.school_id);
      console.log("User ID: ", response.data.id);
    } catch (error) {
      message.error("Gagal mengambil informasi pengguna");
    }
  };

  const fetchSchoolList = async () => {
    try {
      const result = await getSchool();
      if (result.data.statusCode === 200) {
        setSchoolList(result.data.content);
      }
    } catch (error) {
      message.error("Gagal mengambil data sekolah");
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

  const fetchSoalUjian = async () => {
    setTableLoading(true);
    try {
      const result = await getSoalUjian();
      if (result.data.statusCode === 200) {
        setSoalUjian(result.data.content);
      }
    } catch (error) {
      message.error("Gagal mengambil data soal ujian");
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    fetchUserInfo();
    fetchSchoolList();
    fetchSoalUjian();
    fetchTaksonomiList();
    fetchAtpList();
  }, []);

  useEffect(() => {
    if (userSchoolId) {
      form.setFieldsValue({
        idSchool: userSchoolId,
        jenisSoal: "PG",
      });
    }
  }, [userSchoolId, form]);

  // Handler for changing question type
  const handleJenisSoalChange = (value) => {
    setJenisSoal(value);

    // Reset options to default when changing to PG or MULTI
    if (value === "PG" || value === "MULTI") {
      setOptions(["A", "B"]);
    }

    // Reset answer fields when changing question type
    form.setFieldsValue({
      opsiA: undefined,
      opsiB: undefined,
      opsiC: undefined,
      opsiD: undefined,
      opsiE: undefined,
      jawabanBenar: undefined,
      jawabanBenarMulti: undefined,
      pasanganKiri: undefined,
      pasanganKanan: undefined,
      pasanganJawaban: undefined,
      jawabanIsian: undefined,
      toleransiTypo: undefined,
    });
  };

  // Submit handler
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      // Basic payload structure
      const payload = {
        idSoalUjian: values.idSoalUjian || null,
        namaUjian: values.namaUjian,
        pertanyaan: values.pertanyaan,
        bobot: values.bobot?.toString(),
        jenisSoal: values.jenisSoal,
        idUser: userId,
        idTaksonomi: values.idTaksonomi,
        idAtp: values.idAtp,
        idSchool: values.idSchool,
      };

      // Build payload based on question type
      switch (values.jenisSoal) {
        case "PG": {
          const opsi = {};
          options.forEach((option) => {
            opsi[option] = values[`opsi${option}`];
          });
          payload.opsi = opsi;
          payload.jawabanBenar = [values.jawabanBenar];
          break;
        }

        case "MULTI": {
          const opsi = {};
          options.forEach((option) => {
            opsi[option] = values[`opsi${option}`];
          });
          payload.opsi = opsi;
          payload.jawabanBenar = values.jawabanBenarMulti;
          break;
        }

        case "COCOK": {
          // Process left side items
          const kiri = {};
          values.pasanganKiri.forEach((item, index) => {
            kiri[`${index + 1}_kiri`] = item;
          });

          // Process right side items
          const kanan = {};
          values.pasanganKanan.forEach((item, index) => {
            kanan[`${index + values.pasanganKiri.length + 1}_kanan`] = item;
          });

          payload.pasangan = { ...kiri, ...kanan };

          // Process pairings
          payload.jawabanBenar = values.pasanganJawaban.map((pair) => {
            const [kiriIdx, kananIdx] = pair.split("-");
            return `${parseInt(kiriIdx) + 1}_kiri=${
              parseInt(kananIdx) + values.pasanganKiri.length + 1
            }_kanan`;
          });
          break;
        }

        case "ISIAN":
          payload.jawabanBenar = [values.jawabanIsian];
          payload.toleransiTypo = values.toleransiTypo?.toString() || "0";
          break;
      }

      console.log("Payload:", payload);
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
          <>
            <Row gutter={16}>
              {options.map((option) => (
                <Col span={24} key={option}>
                  <Form.Item
                    label={`Pilihan ${option}`}
                    name={`opsi${option}`}
                    rules={[
                      {
                        required: true,
                        message: `Pilihan ${option} wajib diisi`,
                      },
                    ]}
                  >
                    <Input placeholder={`Pilihan ${option}`} />
                  </Form.Item>
                </Col>
              ))}
            </Row>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 16,
              }}
            >
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={addOption}
                disabled={options.length >= 5}
              >
                Tambah Pilihan
              </Button>
              <Button
                danger
                icon={<MinusCircleOutlined />}
                onClick={removeOption}
                disabled={options.length <= 2}
              >
                Hapus Pilihan
              </Button>
            </div>
            <Divider orientation="left">Jawaban</Divider>
            <Form.Item
              name="jawabanBenar"
              label="Jawaban Benar"
              rules={[{ required: true, message: "Pilih jawaban yang benar" }]}
            >
              <Radio.Group>
                {options.map((option) => (
                  <Radio key={option} value={option}>
                    {option}
                  </Radio>
                ))}
              </Radio.Group>
            </Form.Item>
          </>
        );

      case "MULTI":
        return (
          <>
            <Row gutter={16}>
              {options.map((option) => (
                <Col span={12} key={option}>
                  <Form.Item
                    label={`Pilihan ${option}`}
                    name={`opsi${option}`}
                    rules={[
                      {
                        required: true,
                        message: `Pilihan ${option} wajib diisi`,
                      },
                    ]}
                  >
                    <Input placeholder={`Pilihan ${option}`} />
                  </Form.Item>
                </Col>
              ))}
            </Row>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 16,
              }}
            >
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={addOption}
                disabled={options.length >= 5}
              >
                Tambah Pilihan
              </Button>
              <Button
                danger
                icon={<MinusCircleOutlined />}
                onClick={removeOption}
                disabled={options.length <= 2}
              >
                Hapus Pilihan
              </Button>
            </div>
            <Divider orientation="left">Jawaban</Divider>
            <Form.Item
              name="jawabanBenarMulti"
              label="Jawaban Benar (Pilih satu atau lebih)"
              rules={[
                {
                  required: true,
                  message: "Pilih minimal satu jawaban yang benar",
                },
              ]}
            >
              <Checkbox.Group>
                <Space direction="vertical">
                  {options.map((option) => (
                    <Checkbox key={option} value={option}>
                      {option}
                    </Checkbox>
                  ))}
                </Space>
              </Checkbox.Group>
            </Form.Item>
          </>
        );

      case "COCOK":
        return (
          <>
            <Divider orientation="left">Sisi Kiri</Divider>
            <Form.List
              name="pasanganKiri"
              initialValue={["", "", ""]} // Default 3 items
              rules={[
                {
                  validator: async (_, values) => {
                    if (!values || values.length < 2) {
                      return Promise.reject(
                        new Error("Minimal 2 item di sisi kiri")
                      );
                    }
                  },
                },
              ]}
            >
              {(fields, { add, remove }) => (
                <>
                  {fields.map((field, index) => (
                    <Form.Item
                      required={false}
                      key={field.key}
                      label={`Item ${index + 1}`}
                    >
                      <Form.Item
                        {...field}
                        rules={[
                          {
                            required: true,
                            message: "Item tidak boleh kosong",
                          },
                        ]}
                        noStyle
                      >
                        <Input
                          style={{ width: "85%" }}
                          placeholder={`Item ${index + 1}`}
                        />
                      </Form.Item>
                      {fields.length > 2 ? (
                        <MinusCircleOutlined
                          className="dynamic-delete-button"
                          style={{ margin: "0 8px" }}
                          onClick={() => remove(field.name)}
                        />
                      ) : null}
                    </Form.Item>
                  ))}
                  <Form.Item>
                    <Button
                      type="dashed"
                      onClick={() => add()}
                      icon={<PlusOutlined />}
                    >
                      Tambah Item Kiri
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>

            <Divider orientation="left">Sisi Kanan</Divider>
            <Form.List
              name="pasanganKanan"
              initialValue={["", "", ""]} // Default 3 items
              rules={[
                {
                  validator: async (_, values) => {
                    if (!values || values.length < 2) {
                      return Promise.reject(
                        new Error("Minimal 2 item di sisi kanan")
                      );
                    }
                  },
                },
              ]}
            >
              {(fields, { add, remove }) => (
                <>
                  {fields.map((field, index) => (
                    <Form.Item
                      required={false}
                      key={field.key}
                      label={`Item ${index + 1}`}
                    >
                      <Form.Item
                        {...field}
                        rules={[
                          {
                            required: true,
                            message: "Item tidak boleh kosong",
                          },
                        ]}
                        noStyle
                      >
                        <Input
                          style={{ width: "85%" }}
                          placeholder={`Item ${index + 1}`}
                        />
                      </Form.Item>
                      {fields.length > 2 ? (
                        <MinusCircleOutlined
                          className="dynamic-delete-button"
                          style={{ margin: "0 8px" }}
                          onClick={() => remove(field.name)}
                        />
                      ) : null}
                    </Form.Item>
                  ))}
                  <Form.Item>
                    <Button
                      type="dashed"
                      onClick={() => add()}
                      icon={<PlusOutlined />}
                    >
                      Tambah Item Kanan
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>

            <Divider orientation="left">Pasangan Jawaban</Divider>
            <Form.List
              name="pasanganJawaban"
              initialValue={["0-0", "1-1", "2-2"]} // Default pairing
              rules={[
                {
                  validator: async (_, values) => {
                    if (!values || values.length < 1) {
                      return Promise.reject(
                        new Error("Harus ada minimal 1 pasangan")
                      );
                    }
                  },
                },
              ]}
            >
              {(fields, { add, remove }) => (
                <>
                  {fields.map((field, index) => (
                    <Form.Item
                      required={false}
                      key={field.key}
                      label={`Pasangan ${index + 1}`}
                    >
                      <Form.Item
                        {...field}
                        rules={[
                          { required: true, message: "Pasangan harus dipilih" },
                        ]}
                        noStyle
                      >
                        <Select style={{ width: "85%" }}>
                          {form
                            .getFieldValue("pasanganKiri")
                            ?.map((kiri, kiriIdx) =>
                              form
                                .getFieldValue("pasanganKanan")
                                ?.map((kanan, kananIdx) => (
                                  <Option
                                    key={`${kiriIdx}-${kananIdx}`}
                                    value={`${kiriIdx}-${kananIdx}`}
                                  >
                                    {kiri || `Item Kiri ${kiriIdx + 1}`} -{" "}
                                    {kanan || `Item Kanan ${kananIdx + 1}`}
                                  </Option>
                                ))
                            )}
                        </Select>
                      </Form.Item>
                      {fields.length > 1 ? (
                        <MinusCircleOutlined
                          className="dynamic-delete-button"
                          style={{ margin: "0 8px" }}
                          onClick={() => remove(field.name)}
                        />
                      ) : null}
                    </Form.Item>
                  ))}
                  <Form.Item>
                    <Button
                      type="dashed"
                      onClick={() => add()}
                      icon={<PlusOutlined />}
                    >
                      Tambah Pasangan
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          </>
        );

      case "ISIAN":
        return (
          <>
            <Form.Item
              name="jawabanIsian"
              label="Jawaban Benar"
              rules={[{ required: true, message: "Jawaban harus diisi" }]}
            >
              <Input placeholder="Jawaban yang benar" />
            </Form.Item>
            <Form.Item
              name="toleransiTypo"
              label="Toleransi Typo"
              tooltip="Berapa banyak kesalahan ketik yang diperbolehkan (0 berarti harus persis sama)"
              initialValue={0}
            >
              <InputNumber min={0} max={10} />
            </Form.Item>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Modal
      title="Tambah Soal Ujian"
      open={visible}
      onCancel={() => {
        form.resetFields();
        setOptions(["A", "B"]); // Reset options when closing modal
        onCancel();
      }}
      onOk={handleSubmit}
      confirmLoading={confirmLoading}
      okText="Simpan"
      width={700}
    >
      <Form form={form} layout="vertical">
        <Tabs defaultActiveKey="1">
          <TabPane tab="Informasi Soal" key="1">
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  label="Jenis Soal"
                  name="jenisSoal"
                  rules={[
                    { required: true, message: "Jenis soal wajib dipilih" },
                  ]}
                  initialValue="PG"
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
                  initialValue={10}
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
              <Col span={12}>
                <Form.Item
                  label="ATP"
                  name="idAtp"
                  rules={[{ required: true, message: "ATP wajib diisi" }]}
                >
                  <Select placeholder="Pilih ATP">
                    {atpList.map(({ idAtp, namaAtp }) => (
                      <Option key={idAtp} value={idAtp}>
                        {namaAtp}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  label="Sekolah:"
                  name="idSchool"
                  style={{ display: "none" }}
                  rules={[{ required: true, message: "Silahkan pilih Kelas" }]}
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
            </Row>
          </TabPane>
          <TabPane tab="Pilihan & Jawaban" key="2">
            {renderQuestionForm()}
          </TabPane>
        </Tabs>
      </Form>
    </Modal>
  );
};

export default AddSoalUjianForm;
