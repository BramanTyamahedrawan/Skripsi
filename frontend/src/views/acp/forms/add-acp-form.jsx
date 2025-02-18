/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { Form, Input, Modal, Select, Table, Tabs } from "antd";
import { getTahunAjaran } from "@/api/tahun-ajaran";
import { getKelas } from "@/api/kelas";
import { getMapel } from "@/api/mapel";
import { getBidangKeahlian } from "@/api/bidangKeahlian";
import { getProgramByBidang } from "@/api/programKeahlian";
import { getKonsentrasiByProgram } from "@/api/konsentrasiKeahlian";

const { Option } = Select;
const { TabPane } = Tabs;

const columns = [
  {
    title: "No",
    dataIndex: "no",
    key: "no",
  },
  {
    title: "Elemen",
    dataIndex: "elemen",
    key: "elemen",
  },
  {
    title: "Capaian Pembelajaran",
    dataIndex: "capaian",
    key: "capaian",
    width: "50%",
  },
];

const data = [
  {
    key: 1,
    no: "1",
    elemen: "Berpikir Komputasional (BK)",
    capaian:
      "Pada akhir fase E, peserta didik mampu" +
      " menerapkan strategi algoritmik standar untuk" +
      " menghasilkan beberapa solusi persoalan dengan" +
      " data diskrit bervolume tidak kecil pada" +
      " kehidupan sehari-hari maupun" +
      " implementasinya dalam program komputer.",
    children: [
      {
        key: 11,
        elemen: "Tujuan Pembelajaran",
      },
      {
        key: 12,
        elemen:
          "Peserta didik memahami algoritma pengambilan keputusan untuk pemecahan sebuah masalah.",
      },
      {
        key: 13,
        elemen:
          "Peserta didik mampu menerapkan strategi algoritmik untuk menemukan cara yang paling efisien dalam pemecahan sebuah masalah.",
      },
      {
        key: 14,
        elemen: "Siswa memahami beberapa algoritma proses sorting.",
      },
      {
        key: 15,
        elemen:
          "Siswa mampu menerapkan strategi algoritmik untuk menemukan cara yang paling efisien dalam proses sorting",
      },
      {
        key: 16,
        elemen:
          "Siswa memahami konsep struktur data stack dan queue serta operasi-operasi yang dapat dikenakan pada struktur data tersebut.",
      },
    ],
  },
  {
    key: 2,
    no: "2",
    elemen: "Teknologi Informasi dan Komunikasi (TIK)",
    capaian:
      "Pada akhir fase E, peserta didik mampu memanfaatkan berbagai aplikasi secara bersamaan dan" +
      " optimal untuk berkomunikasi, mencari sumber data yang akan diolah menjadi informasi, baik di dunia nyata maupun" +
      " di internet, serta mahir menggunakan fitur lanjut aplikasi perkantoran (pengolah kata, angka, dan presentasi) beserta otomasinya untuk mengintegrasikan dan menyajikan konten" +
      " aplikasi dalam berbagai representasi yang memudahkan analisis dan interpretasi konten tersebut",
    children: [
      {
        key: 21,
        elemen: "Tujuan Pembelajaran",
      },
      {
        key: 22,
        elemen:
          "Peserta didik mampu memahami serta menjelaskan tentang Teknologi Informasi dan Komunikasi serta pemanfaatannya",
      },
      {
        key: 23,
        elemen:
          "Peserta didik mampu memahami Aplikasi Video Conference (Google Meet)",
      },
      {
        key: 24,
        elemen:
          "Peserta didik mampu memahami konsep aplikasi peyimpanan Awan/Cloud (Google Drive)",
      },
      {
        key: 25,
        elemen:
          "Peserta didik mampu menggunakan Aplikasi Video Conference (Google Meet)",
      },
      {
        key: 26,
        elemen:
          "SPeserta didik mampu menggunakan Aplikasi Penyimpanan Awan (Google Drive)",
      },
    ],
  },
];

const AddSeasonForm = ({ visible, onCancel, onOk, confirmLoading }) => {
  const [form] = Form.useForm();
  const [state, setState] = useState({
    mapelList: [],
    tahunList: [],
    bidangList: [],
    filteredProgramList: [],
    filteredKonsentrasiList: [],
    kelasList: [],
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [tahunResult, bidangResult, kelasResult, mapelResult] =
          await Promise.all([
            getTahunAjaran(),
            getBidangKeahlian(),
            getKelas(),
            getMapel(),
          ]);

        setState((prev) => ({
          ...prev,
          tahunList: tahunResult.data.content || [],
          bidangList: bidangResult.data.content || [],
          kelasList: kelasResult.data.content || [],
          mapelList: mapelResult.data.content || [],
        }));
      } catch (error) {
        console.error("Error fetching initial data:", error);
      }
    };

    fetchInitialData();
  }, []);

  const handleBidangChange = async (value) => {
    try {
      const result = await getProgramByBidang(value);
      setState((prev) => ({
        ...prev,
        filteredProgramList: result.data.content || [],
        filteredKonsentrasiList: [],
      }));
      form.setFieldsValue({
        programKeahlian_id: undefined,
        konsentrasiKeahlian_id: undefined,
      });
    } catch (error) {
      console.error("Error fetching program data: ", error);
    }
  };

  const handleProgramChange = async (value) => {
    try {
      const result = await getKonsentrasiByProgram(value);
      setState((prev) => ({
        ...prev,
        filteredKonsentrasiList: result.data.content || [],
      }));
      form.setFieldsValue({
        konsentrasiKeahlian_id: undefined,
      });
    } catch (error) {
      console.error("Error fetching konsentrasi data: ", error);
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onOk(values);
    } catch (error) {
      console.log("Validation failed:", error);
    }
  };

  return (
    <Modal
      title="Tambah Kelas Ajaran"
      open={visible}
      onCancel={onCancel}
      onOk={handleOk}
      confirmLoading={confirmLoading}
      width={900}
    >
      <Form form={form} layout="vertical">
        <Form.Item label="Kode:" name="id">
          <Input disabled placeholder="ACP001" />
        </Form.Item>

        <Form.Item
          label="Tahun Ajaran:"
          name="tahunAjaran_id"
          rules={[{ required: true, message: "Silahkan isi tahun ajaran" }]}
        >
          <Select placeholder="Pilih Tahun Ajaran">
            {state.tahunList.map((tahun) => (
              <Option key={tahun.idTahun} value={tahun.idTahun}>
                {tahun.tahunAjaran}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Bidang Keahlian:"
          name="bidangKeahlian_id"
          rules={[{ required: true, message: "Silahkan isi bidang keahlian" }]}
        >
          <Select
            placeholder="Pilih Bidang Keahlian"
            onChange={handleBidangChange}
          >
            {state.bidangList.map((bidang) => (
              <Option key={bidang.id} value={bidang.id}>
                {bidang.bidang}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Program Keahlian:"
          name="programKeahlian_id"
          rules={[{ required: true, message: "Silahkan isi program keahlian" }]}
        >
          <Select
            placeholder="Pilih Program Keahlian"
            onChange={handleProgramChange}
          >
            {state.filteredProgramList.map((program) => (
              <Option key={program.id} value={program.id}>
                {program.program}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Konsentrasi Keahlian:"
          name="konsentrasiKeahlian_id"
          rules={[
            { required: true, message: "Silahkan isi konsentrasi keahlian" },
          ]}
        >
          <Select placeholder="Pilih Konsentrasi Keahlian">
            {state.filteredKonsentrasiList.map((konsentrasi) => (
              <Option key={konsentrasi.id} value={konsentrasi.id}>
                {konsentrasi.konsentrasi}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Kelas:"
          name="kelas_id"
          rules={[{ required: true, message: "Silahkan isi kelas" }]}
        >
          <Select placeholder="Pilih Kelas">
            {state.kelasList.map((kelas) => (
              <Option key={kelas.idKelas} value={kelas.idKelas}>
                {kelas.namaKelas}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Semester:"
          name="semester"
          rules={[{ required: true, message: "Semester wajib diisi" }]}
        >
          <Select placeholder="Semester">
            <Option value="Ganjil">Ganjil</Option>
            <Option value="Genap">Genap</Option>
          </Select>
        </Form.Item>

        <Tabs defaultActiveKey="siswa">
          <TabPane tab="Capaian Pembelajaran" key="siswa">
            <Table columns={columns} dataSource={[]} />
          </TabPane>
        </Tabs>
      </Form>
    </Modal>
  );
};

export default AddSeasonForm;
