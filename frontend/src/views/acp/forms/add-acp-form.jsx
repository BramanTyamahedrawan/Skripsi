/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { Form, Input, Modal, Select, Table, Tabs } from "antd";
import ReactSelect from "react-select";
import { HotTable } from "@handsontable/react";
import { registerAllModules } from "handsontable/registry";
import "handsontable/dist/handsontable.full.min.css";
import { getTahunAjaran } from "@/api/tahun-ajaran";
import { getKelas } from "@/api/kelas";
import { getStudents } from "@/api/student";
import { getJadwalPelajaran } from "@/api/jadwalPelajaran";
import { getLectures } from "@/api/lecture";
import { getMapel } from "@/api/mapel";
import { getBidangKeahlian } from "@/api/bidangKeahlian";
import { getProgramByBidang } from "@/api/programKeahlian";
import { getKonsentrasiByProgram } from "@/api/konsentrasiKeahlian";

const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

registerAllModules();

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
    key: "age",
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
    siswaList: [],
    jadwalPelajaranList: [],
    guruList: [],
    activeTab: "siswa",
  });

  const formItemLayout = {
    labelCol: { xs: { span: 24 }, sm: { span: 6 } },
    wrapperCol: { xs: { span: 24 }, sm: { span: 18 } },
  };

  const fetchMapelList = async () => {
    try {
      const result = await getMapel();
      const { content, statusCode } = result.data;
      if (statusCode === 200) {
        const mapelList = content.map((mapel) => ({
          idMapel: mapel.idMapel,
          name: mapel.name,
        }));
        setState((prev) => ({ ...prev, mapelList }));
      }
    } catch (error) {
      console.error("Error fetching mapel data: ", error);
    }
  };

  const handleTabChange = (activeKey) => {
    this.setState({ activeTab: activeKey });
  };

  const fetchTahunAjaranList = async () => {
    try {
      const result = await getTahunAjaran();
      const { content, statusCode } = result.data;
      if (statusCode === 200) {
        const tahunList = content.map((tahun) => ({
          idTahun: tahun.idTahun,
          tahunAjaran: tahun.tahunAjaran,
        }));
        this.setState({ tahunList });
      }
    } catch (error) {
      // Handle error if any
      console.error("Error fetching tahun data: ", error);
    }
  };

  const fetchBidangKeahlianList = async () => {
    try {
      const result = await getBidangKeahlian();
      const { content, statusCode } = result.data;
      if (statusCode === 200) {
        const bidangList = content.map((bidang) => ({
          id: bidang.id,
          bidang: bidang.bidang,
        }));
        this.setState({ bidangList });
      }
    } catch (error) {
      console.error("Error fetching bidang data: ", error);
    }
  };

  const handleBidangChange = async (value) => {
    try {
      const result = await getProgramByBidang(value);
      const { content, statusCode } = result.data;

      if (statusCode === 200) {
        setState((prev) => ({
          ...prev,
          filteredProgramList: content,
          filteredKonsentrasiList: [],
        }));
      }

      form.setFieldsValue({
        programkeahlian_id: undefined,
        konsentrasikeahlian_id: undefined,
      });
    } catch (error) {
      console.error("Error fetching program data: ", error);
    }
  };

  const handleProgramChange = async (value) => {
    try {
      const result = await getKonsentrasiByProgram(value);
      const { content, statusCode } = result.data;

      if (statusCode === 200) {
        setState((prev) => ({
          ...prev,
          filteredKonsentrasiList: content,
        }));
      }

      form.setFieldsValue({
        konsentrasikeahlian_id: undefined,
      });
    } catch (error) {
      console.error("Error fetching konsentrasi data: ", error);
    }
  };

  const fetchKelasList = async () => {
    try {
      const result = await getKelas();
      const { content, statusCode } = result.data;
      if (statusCode === 200) {
        const kelasList = content.map((kelas) => ({
          idKelas: kelas.idKelas,
          namaKelas: kelas.namaKelas,
        }));
        this.setState({ kelasList });
      }
    } catch (error) {
      // Handle error if any
      console.error("Error fetching kelas data: ", error);
    }
  };

  const fetchSiswaList = async () => {
    try {
      const result = await getStudents();
      const { content, statusCode } = result.data;
      if (statusCode === 200) {
        const siswaList = content.map((student) => ({
          id: student.id,
          name: student.name,
          nisn: student.nisn,
          address: student.address,
          konsentrasi: student.konsentrasiKeahlian.konsentrasi,
        }));
        this.setState({ siswaList });
      }
    } catch (error) {
      console.error("Error fetching siswa data: ", error);
    }
  };

  const fetchJadwalPelajaranList = async () => {
    try {
      const result = await getJadwalPelajaran();
      const { content, statusCode } = result.data;
      if (statusCode === 200) {
        const jadwalPelajaranList = content.map((jadwalPelajaran) => ({
          idJadwal: jadwalPelajaran.idJadwal,
          guru: jadwalPelajaran.lecture.name,
          jabatan: jadwalPelajaran.jabatan,
          mapel: jadwalPelajaran.mapel.name,
          jmlJam: jadwalPelajaran.jmlJam,
        }));
        this.setState({ jadwalPelajaranList });
      }
    } catch (error) {
      // Handle error if any
      console.error("Error fetching jadwalPelajaran data: ", error);
    }
  };

  const fetchGuruList = async () => {
    try {
      const result = await getLectures();
      const { content, statusCode } = result.data;
      if (statusCode === 200) {
        const guruList = content.map((guru) => ({
          id: guru.id,
          name: guru.name,
          nidn: guru.nidn,
        }));
        this.setState({ guruList });
      }
    } catch (error) {
      // Handle error if any
      console.error("Error fetching kelas data: ", error);
    }
  };

  const fetchInitialData = async () => {
    try {
      const [tahunResult, bidangResult, kelasResult, guruResult, mapelResult] =
        await Promise.all([
          getTahunAjaran(),
          getBidangKeahlian(),
          getKelas(),
          getLectures(),
          getMapel(),
        ]);

      setState((prev) => ({
        ...prev,
        tahunList: tahunResult.data.content,
        bidangList: bidangResult.data.content,
        kelasList: kelasResult.data.content,
        guruList: guruResult.data.content,
        mapelList: mapelResult.data.content,
      }));
    } catch (error) {
      console.error("Error fetching initial data:", error);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onOk(values);
    } catch (error) {
      console.log("Validation failed:", error);
    }
  };

  const {
    tahunList,
    bidangList,
    filteredProgramList,
    filteredKonsentrasiList,
    kelasList,
    siswaList,
    jadwalPelajaranList,
    mapelList,
    guruList,
    activeTab,
    siswaData,
    jadwalPelajaranData,
  } = state;
  const { getFieldDecorator } = form;
  const mapToSelectOptions = (list) =>
    list.map((item) => ({
      value: item.id || item.idKelas || item.idJadwalPelajaran || item.id, // Use unique ids from the objects
      label:
        item.name ||
        item.namaKelas ||
        item.bidang ||
        item.program ||
        item.konsentrasi,
    }));
  return (
    <Modal
      title="Tambah Kelas Ajaran"
      visible={visible}
      onCancel={onCancel}
      onOk={handleOk}
      confirmLoading={confirmLoading}
      width={900}
    >
      <Form form={form} {...formItemLayout}>
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
        <Form.Item label="Bidang Keahlian:" htmlFor="bidangkeahlian_id">
          {getFieldDecorator("bidangKeahlian_id", {
            rules: [
              { required: true, message: "Silahkan isi konsentrasi keahlian" },
            ],
          })(
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
          )}
        </Form.Item>
        <Form.Item label="Program Keahlian:" htmlFor="programkeahlian_id">
          {getFieldDecorator("programKeahlian_id", {
            rules: [
              { required: true, message: "Silahkan isi konsentrasi keahlian" },
            ],
          })(
            <Select
              placeholder="Pilih Program Keahlian"
              onChange={handleProgramChange}
            >
              {filteredProgramList.map((program) => (
                <Option key={program.id} value={program.id}>
                  {program.program}
                </Option>
              ))}
            </Select>
          )}
        </Form.Item>

        <Form.Item
          label="Konsentrasi Keahlian:"
          htmlFor="konsentrasikeahlian_id"
        >
          {getFieldDecorator("konsentrasiKeahlian_id", {
            rules: [
              { required: true, message: "Silahkan isi konsentrasi keahlian" },
            ],
          })(
            <Select placeholder="Pilih Konsentrasi Keahlian">
              {filteredKonsentrasiList.map((konsentrasi) => (
                <Option key={konsentrasi.id} value={konsentrasi.id}>
                  {konsentrasi.konsentrasi}
                </Option>
              ))}
            </Select>
          )}
        </Form.Item>
        <Form.Item label="Kelas:">
          {getFieldDecorator("kelas_id", {
            rules: [{ required: true, message: "Silahkan isi kelas" }],
          })(
            <Select placeholder="Pilih Kelas">
              {kelasList.map((kelas) => (
                <Option key={kelas.idKelas} value={kelas.idKelas}>
                  {kelas.namaKelas}
                </Option>
              ))}
            </Select>
          )}
        </Form.Item>
        <Form.Item label="Semester:">
          {getFieldDecorator("semester", {
            rules: [{ required: true, message: "Semester wajib diisi" }],
          })(
            <Select style={{ width: 120 }} placeholder="Semester">
              <Select.Option value="Ganjil">Ganjil</Select.Option>
              <Select.Option value="Genap">Genap</Select.Option>
            </Select>
          )}
        </Form.Item>
        <Form.Item label="Mata Pelajaran:">
          {getFieldDecorator("mapel_id", {
            rules: [{ required: true, message: "Silahkan isi mapel" }],
          })(
            <Select placeholder="Pilih Mata Pelajaran">
              {mapelList.map((mapel) => (
                <Option key={mapel.idMapel} value={mapel.idMapel}>
                  {mapel.name}
                </Option>
              ))}
            </Select>
          )}
        </Form.Item>
        <Tabs defaultActiveKey="siswa">
          <TabPane tab="Capaian Pembelajaran" key="siswa">
            <Table columns={columns} dataSource={data} />
          </TabPane>
        </Tabs>
      </Form>
    </Modal>
  );
};

export default AddSeasonForm;
