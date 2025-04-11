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
  message,
} from "antd";
import { getSchool } from "@/api/school";
import { reqUserInfo } from "@/api/user";
import { getKelas } from "@/api/kelas";
import { getTahunAjaran } from "@/api/tahun-ajaran";
import { getSemester } from "@/api/semester";
import { getMapel } from "@/api/mapel";
import { getKonsentrasiKeahlianSekolah } from "@/api/konsentrasiKeahlianSekolah";
import { getElemen } from "@/api/elemen";
import { getACP } from "@/api/acp";
import { getATP } from "@/api/atp";

const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

const renderColumns = () => [
  {
    title: "No.",
    dataIndex: "index",
    key: "index",
    align: "center",
    render: (_, __, index) => index + 1,
  },
  {
    title: "Elemen",
    dataIndex: ["elemen", "namaElemen"],
    key: "namaElemen",
    align: "center",
  },
  {
    title: "Capaian Pembelajaran",
    dataIndex: ["acp", "namaAcp"],
    key: "namaAcp",
    align: "center",
  },
  {
    title: "Tujuan Pembelajaran",
    dataIndex: "namaAtp",
    key: "namaAtp",
    align: "center",
  },
];

const AddATPForm = ({ visible, onCancel, onOk, confirmLoading }) => {
  const [atp, setATP] = useState([]);
  const [form] = Form.useForm();

  const [userSchoolId, setUserSchoolId] = useState([]); // State untuk menyimpan ID sekolah user
  const [schoolList, setSchoolList] = useState([]);
  const [kelasList, setKelasList] = useState([]);
  const [tahunAjaranList, setTahunAjaranList] = useState([]);
  const [semesterList, setSemesterList] = useState([]);
  const [mapelList, setMapelList] = useState([]);
  const [konsentrasiKeahlianSekolahList, setKonsentrasiKeahlianSekolahList] =
    useState([]);
  const [elemenList, setElemenList] = useState([]);
  const [acpList, setACPList] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);

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

  const fetchATP = async () => {
    setTableLoading(true);
    try {
      const result = await getATP();
      if (result.data.statusCode === 200) {
        setATP(result.data.content);
      } else {
        message.error("Gagal mengambil data");
      }
    } catch (error) {
      message.error("Terjadi kesalahan: " + error.message);
    } finally {
      setTableLoading(false);
    }
  };

  const fetchKelasList = async () => {
    try {
      const result = await getKelas();
      if (result.data.statusCode === 200) {
        setKelasList(result.data.content);
      } else {
        message.error("Gagal mengambil data");
      }
    } catch (error) {
      message.error("Terjadi kesalahan: " + error.message);
    }
  };

  const fetchTahunAjaranList = async () => {
    try {
      const result = await getTahunAjaran();
      if (result.data.statusCode === 200) {
        setTahunAjaranList(result.data.content);
      } else {
        message.error("Gagal mengambil data");
      }
    } catch (error) {
      message.error("Terjadi kesalahan: " + error.message);
    }
  };

  const fetchSemesterList = async () => {
    try {
      const result = await getSemester();
      if (result.data.statusCode === 200) {
        setSemesterList(result.data.content);
      } else {
        message.error("Gagal mengambil data");
      }
    } catch (error) {
      message.error("Terjadi kesalahan: " + error.message);
    }
  };

  const fetchMapelList = async () => {
    try {
      const result = await getMapel();
      if (result.data.statusCode === 200) {
        setMapelList(result.data.content);
      } else {
        message.error("Gagal mengambil data");
      }
    } catch (error) {
      message.error("Terjadi kesalahan: " + error.message);
    }
  };

  const fetchKonsentrasiKeahlianSekolahList = async () => {
    try {
      const result = await getKonsentrasiKeahlianSekolah();
      if (result.data.statusCode === 200) {
        setKonsentrasiKeahlianSekolahList(result.data.content);
      } else {
        message.error("Gagal mengambil data");
      }
    } catch (error) {
      message.error("Terjadi kesalahan: " + error.message);
    }
  };

  const fetchElemenList = async () => {
    try {
      const result = await getElemen();
      if (result.data.statusCode === 200) {
        setElemenList(result.data.content);
      } else {
        message.error("Gagal mengambil data");
      }
    } catch (error) {
      message.error("Terjadi kesalahan: " + error.message);
    }
  };

  const fetchACPList = async () => {
    try {
      const result = await getACP();
      if (result.data.statusCode === 200) {
        setACPList(result.data.content);
      } else {
        message.error("Gagal mengambil data");
      }
    } catch (error) {
      message.error("Terjadi kesalahan: " + error.message);
    }
  };

  useEffect(() => {
    fetchUserInfo();
    fetchSchoolList();
    fetchKelasList();
    fetchTahunAjaranList();
    fetchSemesterList();
    fetchMapelList();
    fetchKonsentrasiKeahlianSekolahList();
    fetchElemenList();
    fetchACPList();
    fetchATP();
  }, []);

  useEffect(() => {
    if (userSchoolId) {
      form.setFieldsValue({ idSchool: userSchoolId });
    }
  }, [userSchoolId, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      onOk(values);
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  return (
    <Modal
      title="Tambah Kelas Analisa Tujuan Pembelajaran"
      open={visible}
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      onOk={handleSubmit}
      confirmLoading={confirmLoading}
      okText="Simpan"
      width={1000} // Mengatur lebar modal agar lebih luas
    >
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col xs={24} sm={24} md={12}>
            <Form.Item
              label="Sekolah:"
              name="idSchool"
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
          <Col xs={24} sm={24} md={12}>
            <Form.Item
              label="Nama Tujuan Pembelajaran:"
              name="namaAtp"
              rules={[
                {
                  required: true,
                  message: "Silahkan isi Nama Tujuan Pembelajaran",
                },
              ]}
            >
              <Input placeholder="Masukkan Nama ATP" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={12}>
            <Form.Item
              label="Kelas:"
              name="idKelas"
              rules={[{ required: true, message: "Silahkan pilih Kelas" }]}
            >
              <Select placeholder="Pilih Kelas">
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
              label="Tahun Ajaran:"
              name="idTahun"
              rules={[
                { required: true, message: "Silahkan pilih Tahun Ajaran" },
              ]}
            >
              <Select placeholder="Pilih Tahun Ajaran">
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
              rules={[{ required: true, message: "Silahkan pilih Semester" }]}
            >
              <Select placeholder="Pilih Semester">
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
              label="Mapel:"
              name="idMapel"
              rules={[{ required: true, message: "Silahkan pilih Mapel" }]}
            >
              <Select placeholder="Pilih Mapel">
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
              label="Konsentrasi Keahlian Sekolah:"
              name="idKonsentrasiSekolah"
              rules={[
                {
                  required: true,
                  message: "Silahkan pilih Konsentrasi Keahlian Sekolah",
                },
              ]}
            >
              <Select placeholder="Pilih Konsentrasi Keahlian Sekolah">
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
              label="Elemen:"
              name="idElemen"
              rules={[{ required: true, message: "Silahkan pilih Elemen" }]}
            >
              <Select placeholder="Pilih Elemen">
                {elemenList.map(({ idElemen, namaElemen }) => (
                  <Option key={idElemen} value={idElemen}>
                    {namaElemen}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={12}>
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
              <Select placeholder="Pilih Capaian Pembelajaran">
                {acpList.map(({ idAcp, namaAcp }) => (
                  <Option key={idAcp} value={idAcp}>
                    {namaAcp}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Tabs
            defaultActiveKey="id"
            style={{ width: "100%" }}
            items={[
              {
                key: "id",
                label: "Tujuan Pembelajaran",
                children: (
                  <Table
                    rowKey="id"
                    dataSource={atp}
                    columns={renderColumns()}
                    pagination={{ pageSize: 10 }}
                    style={{ width: "100%" }}
                  />
                ),
              },
            ]}
          />
        </Row>
      </Form>
    </Modal>
  );
};

export default AddATPForm;
