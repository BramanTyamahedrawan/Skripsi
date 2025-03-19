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
import { getBidangSekolah } from "@/api/bidangKeahlianSekolah";
import { getSchool } from "@/api/school";
import { getBidangKeahlian } from "@/api/bidangKeahlian";

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
    title: "Sekolah",
    dataIndex: ["school", "nameSchool"],
    key: "nameSchool",
    align: "center",
  },
  {
    title: "Bidang Keahlian",
    dataIndex: ["bidangKeahlian", "bidang"],
    key: "bidang",
    align: "center",
  },
  {
    title: "Bidang Keahlian Sekolah",
    dataIndex: "namaBidangSekolah",
    key: "namaBidangSekolah",
    align: "center",
  },
];

const AddBidangSekolahForm = ({ visible, onCancel, onOk, confirmLoading }) => {
  const [bidangSekolah, setBidangSekolah] = useState([]);
  const [form] = Form.useForm();

  const [schoolList, setSchoolList] = useState([]);
  const [bidangKeahlianList, setBidangKeahlianList] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);

  const fetchBidangSekolah = async () => {
    setTableLoading(true);
    try {
      const result = await getBidangSekolah();
      if (result.data.statusCode === 200) {
        setBidangSekolah(result.data.content);
      } else {
        message.error("Gagal mengambil data");
      }
    } catch (error) {
      message.error("Terjadi kesalahan: " + error.message);
    } finally {
      setTableLoading(false);
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

  const fetchBidangKeahlianList = async () => {
    try {
      const result = await getBidangKeahlian();
      if (result.data.statusCode === 200) {
        setBidangKeahlianList(result.data.content);
      } else {
        message.error("Gagal mengambil data");
      }
    } catch (error) {
      message.error("Terjadi kesalahan: " + error.message);
    }
  };

  useEffect(() => {
    fetchBidangSekolah();
    fetchSchoolList();
    fetchBidangKeahlianList();
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
      title="Tambah Kelas Analisa Bidang Keahlian Sekolah"
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
              <Select placeholder="Pilih Sekolah">
                {schoolList.map(({ idSchool, nameSchool }, index) => (
                  <Option key={idSchool || `option-${index}`} value={idSchool}>
                    {nameSchool}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={12}>
            <Form.Item
              label="Bidang Keahlian:"
              name="idBidangKeahlian"
              rules={[
                { required: true, message: "Silahkan pilih Bidang Keahlian" },
              ]}
            >
              <Select placeholder="Pilih Bidang Keahlian">
                {bidangKeahlianList.map(
                  ({ idBidangKeahlian, bidang }, index) => (
                    <Option
                      key={idBidangKeahlian || `option-${index}`}
                      value={idBidangKeahlian}
                    >
                      {bidang}
                    </Option>
                  )
                )}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={12}>
            <Form.Item
              label="Nama Bidang Keahlian Sekolah:"
              name="namaBidangSekolah"
              rules={[
                {
                  required: true,
                  message: "Silahkan isi Nama Bidang Keahlian Sekolah",
                },
              ]}
            >
              <Input placeholder="Masukkan Nama Bidang Keahlian Sekolah" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default AddBidangSekolahForm;
