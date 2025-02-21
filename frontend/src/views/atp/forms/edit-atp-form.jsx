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

const EditATPForm = ({
  visible,
  onCancel,
  onOk,
  confirmLoading,
  currentRowData,
}) => {
  const [atp, setATP] = useState([]);
  const [form] = Form.useForm();

  const [kelasList, setKelasList] = useState([]);
  const [tahunAjaranList, setTahunAjaranList] = useState([]);
  const [semesterList, setSemesterList] = useState([]);
  const [mapelList, setMapelList] = useState([]);
  const [konsentrasiKeahlianList, setKonsentrasiKeahlianList] = useState([]);
  const [elemenList, setElemenList] = useState([]);
  const [acpList, setACPList] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);

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

  const fetchACPList = async () => {
    try {
      const result = await getACP();
      const { content, statusCode } = result.data;
      if (statusCode === 200) {
        setACPList(content);
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
    fetchACPList();
    fetchATP();

    if (currentRowData) {
      form.setFieldsValue({
        idAtp: currentRowData.idAtp,
        namaAtp: currentRowData.namaAtp,
        idKelas: currentRowData.kelas?.idKelas,
        idTahun: currentRowData.tahunAjaran?.idTahun,
        idSemester: currentRowData.semester?.idSemester,
        idMapel: currentRowData.mapel?.idMapel,
        id: currentRowData.konsentrasiKeahlian?.id,
        idElemen: currentRowData.elemen?.idElemen,
        idAcp: currentRowData.acp?.idAcp,
      });
    }
  }, [currentRowData, form]);

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
      title="Edit Analisa Tujuan Pembelajaran"
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
              label="ID ATP:"
              name="idAtp"
              rules={[{ required: true, message: "Silahkan isi ID ATP" }]}
            >
              <Input placeholder="Masukkan ID ATP" />
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

export default EditATPForm;
