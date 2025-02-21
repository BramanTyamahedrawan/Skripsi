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
import { getKelas } from "@/api/kelas";
import { getTahunAjaran } from "@/api/tahun-ajaran";
import { getSemester } from "@/api/semester";
import { getMapel } from "@/api/mapel";
import { getKonsentrasiKeahlian } from "@/api/konsentrasiKeahlian";
import { getElemen } from "@/api/elemen";
import { getACP } from "@/api/acp";

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
    dataIndex: "namaAcp",
    key: "namaAcp",
    align: "center",
  },
];

const AddACPForm = ({ visible, onCancel, onOk, confirmLoading }) => {
  const [acp, setACP] = useState([]);
  const [form] = Form.useForm();
  const [kelasList, setKelasList] = useState([]);
  const [tahunAjaranList, setTahunAjaranList] = useState([]);
  const [semesterList, setSemesterList] = useState([]);
  const [mapelList, setMapelList] = useState([]);
  const [konsentrasiKeahlianList, setKonsentrasiKeahlianList] = useState([]);
  const [elemenList, setElemenList] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);

  const fetchACP = async () => {
    setTableLoading(true);
    try {
      const result = await getACP();
      if (result.data.statusCode === 200) {
        setACP(result.data.content);
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
      const { content, statusCode } = result.data;
      if (statusCode === 200) {
        setKelasList(content);
      } else {
        console.log("Error: ", result.data.message);
      }
    } catch (error) {
      console.log("Error: ", error);
    }
  };

  const fetchTahunAjaranList = async () => {
    try {
      const result = await getTahunAjaran();
      const { content, statusCode } = result.data;
      if (statusCode === 200) {
        setTahunAjaranList(content);
      } else {
        console.log("Error: ", result.data.message);
      }
    } catch (error) {
      console.log("Error: ", error);
    }
  };

  const fetchSemesterList = async () => {
    try {
      const result = await getSemester();
      const { content, statusCode } = result.data;
      if (statusCode === 200) {
        setSemesterList(content);
      } else {
        console.log("Error: ", result.data.message);
      }
    } catch (error) {
      console.log("Error: ", error);
    }
  };

  const fetchMapelList = async () => {
    try {
      const result = await getMapel();
      const { content, statusCode } = result.data;
      if (statusCode === 200) {
        setMapelList(content);
      } else {
        console.log("Error: ", result.data.message);
      }
    } catch (error) {
      console.log("Error: ", error);
    }
  };

  const fetchKonsentrasiKeahlianList = async () => {
    try {
      const result = await getKonsentrasiKeahlian();
      const { content, statusCode } = result.data;
      if (statusCode === 200) {
        setKonsentrasiKeahlianList(content);
      } else {
        console.log("Error: ", result.data.message);
      }
    } catch (error) {
      console.log("Error: ", error);
    }
  };

  const fetchElemenList = async () => {
    try {
      const result = await getElemen();
      const { content, statusCode } = result.data;
      if (statusCode === 200) {
        setElemenList(content);
      } else {
        console.log("Error: ", result.data.message);
      }
    } catch (error) {
      console.log("Error: ", error);
    }
  };

  useEffect(() => {
    fetchKelasList();
    fetchTahunAjaranList();
    fetchSemesterList();
    fetchMapelList();
    fetchKonsentrasiKeahlianList();
    fetchElemenList();
    fetchACP();
  }, []);

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
      title="Tambah Kelas Analisa Capaian Pembelajaran"
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
              label="ID ACP:"
              name="idAcp"
              rules={[{ required: true, message: "Silahkan isi ID ACP" }]}
            >
              <Input placeholder="Masukkan ID ACP" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={12}>
            <Form.Item
              label="Nama Capaian Pembelajaran:"
              name="namaAcp"
              rules={[
                {
                  required: true,
                  message: "Silahkan isi Nama Capaian Pembelajaran",
                },
              ]}
            >
              <Input placeholder="Masukkan Nama ACP" />
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
              label="Konsentrasi Keahlian:"
              name="id"
              rules={[{ required: true, message: "Silahkan pilih Mapel" }]}
            >
              <Select placeholder="Pilih Konsetrasi Keahlian">
                {konsentrasiKeahlianList.map(({ id, konsentrasi }) => (
                  <Option key={id} value={id}>
                    {konsentrasi}
                  </Option>
                ))}
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
          <Tabs
            defaultActiveKey="id"
            style={{ width: "100%" }}
            items={[
              {
                key: "id",
                label: "Capaian Pembelajaran",
                children: (
                  <Table
                    rowKey="id"
                    dataSource={acp}
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

export default AddACPForm;
