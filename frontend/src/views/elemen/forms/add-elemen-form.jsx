/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useState, useEffect } from "react";
import { Form, Input, Modal, Select, Row, Col } from "antd";
import { getKelas } from "@/api/kelas";
import { getTahunAjaran } from "@/api/tahun-ajaran";
import { getSemester } from "@/api/semester";
import { getMapel } from "@/api/mapel";
import { getKonsentrasiKeahlian } from "@/api/konsentrasiKeahlian";

const { Option } = Select;

const AddElemen = ({ visible, onCancel, onOk, confirmLoading }) => {
  const [form] = Form.useForm();
  const [kelasList, setKelasList] = useState([]);
  const [tahunAjaranList, setTahunAjaranList] = useState([]);
  const [semesterList, setSemesterList] = useState([]);
  const [mapelList, setMapelList] = useState([]);
  const [konsentrasiKeahlianList, setKonsentrasiKeahlianList] = useState([]);

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

  useEffect(() => {
    fetchKelasList();
    fetchTahunAjaranList();
    fetchSemesterList();
    fetchMapelList();
    fetchKonsentrasiKeahlianList();
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
      title="Tambah Konsentrasi Keahlian"
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
              label="ID Elemen:"
              name="idElemen"
              rules={[{ required: true, message: "Silahkan isi ID Elemen" }]}
            >
              <Input placeholder="Masukkan ID Elemen" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={12}>
            <Form.Item
              label="Nama Elemen:"
              name="namaElemen"
              rules={[{ required: true, message: "Silahkan isi Nama Elemen" }]}
            >
              <Input placeholder="Masukkan Nama Elemen" />
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
        </Row>
      </Form>
    </Modal>
  );
};

export default AddElemen;
