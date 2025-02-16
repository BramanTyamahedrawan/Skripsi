/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useState, useEffect } from "react";
import { Form, Modal, Select, Tabs } from "antd";
import { HotTable } from "@handsontable/react";
import { registerAllModules } from "handsontable/registry";
import "handsontable/dist/handsontable.full.min.css";
import { getTahunAjaran } from "@/api/tahun-ajaran";
import { getKelas } from "@/api/kelas";
import { getStudents } from "@/api/student";
import { getJadwalPelajaran } from "@/api/jadwalPelajaran";
import { getLectures } from "@/api/lecture";
import { getBidangKeahlian } from "@/api/bidangKeahlian";
import { getProgramByBidang } from "@/api/programKeahlian";
import { getKonsentrasiByProgram } from "@/api/konsentrasiKeahlian";

const { Option } = Select;
const { TabPane } = Tabs;

registerAllModules();

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 6 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 18 },
  },
};

const hotTableDefaultConfig = {
  stretchH: "all",
  rowHeaders: true,
  manualColumnResize: true,
  height: "300",
  licenseKey: "non-commercial-and-evaluation",
};

const AddSeasonForm = ({ visible, onCancel, onOk, confirmLoading }) => {
  const [form] = Form.useForm();

  const [state, setState] = useState({
    tahunList: [],
    bidangList: [],
    filteredProgramList: [],
    filteredKonsentrasiList: [],
    kelasList: [],
    siswaList: [],
    jadwalPelajaranList: [],
    guruList: [],
    siswaData: [{ nisn: "", nama: "", alamat: "", jurusan: "" }],
    jadwalPelajaranData: [{ guru: "", jabatan: "", mapel: "", jmlJam: "" }],
  });

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
        programKeahlian_id: undefined,
        konsentrasiKeahlian_id: undefined,
      });
    } catch (error) {
      console.error("Error fetching program data:", error);
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
        konsentrasiKeahlian_id: undefined,
      });
    } catch (error) {
      console.error("Error fetching konsentrasi data:", error);
    }
  };

  const handleSiswaChange = (changes) => {
    if (!changes) return;

    changes.forEach(([row, prop, oldValue, newValue]) => {
      if (prop === "nisn" && oldValue !== newValue) {
        const selectedSiswa = state.siswaList.find(
          (siswa) => siswa.nisn === newValue
        );
        if (selectedSiswa) {
          setState((prev) => {
            const updatedTableData = [...prev.siswaData];
            updatedTableData[row] = {
              ...updatedTableData[row],
              id: selectedSiswa.id,
              nisn: selectedSiswa.nisn,
              nama: selectedSiswa.name,
              alamat: selectedSiswa.address,
              konsentrasi: selectedSiswa.konsentrasi,
            };
            if (row === updatedTableData.length - 1) {
              updatedTableData.push({
                nisn: "",
                nama: "",
                alamat: "",
                konsentrasi: "",
              });
            }
            return {
              ...prev,
              siswaData: updatedTableData,
            };
          });
          form.setFieldsValue({
            siswaData: updatedTableData,
          });
        }
      }
    });
  };

  const handleJadwalChange = (changes) => {
    if (!changes) return;

    changes.forEach(([row, prop, oldValue, newValue]) => {
      if (prop === "guru" && oldValue !== newValue) {
        const selectedJadwal = state.jadwalPelajaranList.find(
          (jadwal) => jadwal.guru === newValue
        );
        if (selectedJadwal) {
          setState((prev) => {
            const updatedTableData = [...prev.jadwalPelajaranData];
            updatedTableData[row] = {
              ...updatedTableData[row],
              idJadwal: selectedJadwal.idJadwal,
              guru: selectedJadwal.guru,
              jabatan: selectedJadwal.jabatan,
              mapel: selectedJadwal.mapel,
              jmlJam: selectedJadwal.jmlJam,
            };
            if (row === updatedTableData.length - 1) {
              updatedTableData.push({
                guru: "",
                jabatan: "",
                mapel: "",
                jmlJam: "",
              });
            }
            return {
              ...prev,
              jadwalPelajaranData: updatedTableData,
            };
          });
          setState((prev) => {
            const updatedTableData = [...prev.jadwalPelajaranData];
            form.setFieldsValue({
              jadwalPelajaranData: updatedTableData,
            });
            return {
              ...prev,
              jadwalPelajaranData: updatedTableData,
            };
          });
        }
      }
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          tahunResult,
          bidangResult,
          kelasResult,
          siswaResult,
          jadwalResult,
          guruResult,
        ] = await Promise.all([
          getTahunAjaran(),
          getBidangKeahlian(),
          getKelas(),
          getStudents(),
          getJadwalPelajaran(),
          getLectures(),
        ]);

        setState((prev) => ({
          ...prev,
          tahunList: tahunResult.data.content.map((t) => ({
            idTahun: t.idTahun,
            tahunAjaran: t.tahunAjaran,
          })),
          bidangList: bidangResult.data.content.map((b) => ({
            id: b.id,
            bidang: b.bidang,
          })),
          kelasList: kelasResult.data.content.map((k) => ({
            idKelas: k.idKelas,
            namaKelas: k.namaKelas,
          })),
          siswaList: siswaResult.data.content.map((s) => ({
            id: s.id,
            name: s.name,
            nisn: s.nisn,
            address: s.address,
            konsentrasi: s.konsentrasiKeahlian.konsentrasi,
          })),
          jadwalPelajaranList: jadwalResult.data.content.map((j) => ({
            idJadwal: j.idJadwal,
            guru: j.lecture.name,
            jabatan: j.jabatan,
            mapel: j.mapel.name,
            jmlJam: j.jmlJam,
          })),
          guruList: guruResult.data.content.map((g) => ({
            id: g.id,
            name: g.name,
            nidn: g.nidn,
          })),
        }));
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

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
      visible={visible}
      onCancel={onCancel}
      onOk={handleOk}
      confirmLoading={confirmLoading}
      width={900}
    >
      <Form form={form} {...formItemLayout}>
        <Form.Item
          name="tahunAjaran_id"
          label="Tahun Ajaran"
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
          name="bidangKeahlian_id"
          label="Bidang Keahlian"
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
          name="programKeahlian_id"
          label="Program Keahlian"
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
          name="konsentrasiKeahlian_id"
          label="Konsentrasi Keahlian"
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
          name="kelas_id"
          label="Kelas"
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
          name="semester"
          label="Semester"
          rules={[{ required: true, message: "Semester wajib diisi" }]}
        >
          <Select placeholder="Semester">
            <Option value="Ganjil">Ganjil</Option>
            <Option value="Genap">Genap</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="lecture_id"
          label="Wali Kelas"
          rules={[{ required: true, message: "Silahkan isi wali kelas" }]}
        >
          <Select placeholder="Pilih Wali Kelas">
            {state.guruList.map((guru) => (
              <Option key={guru.id} value={guru.id}>
                {guru.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Tabs defaultActiveKey="siswa">
          <TabPane tab="Siswa" key="siswa">
            <Form.Item name="student_id">
              <HotTable
                data={state.siswaData}
                colHeaders={["NISN", "Nama", "Alamat", "Jurusan"]}
                columns={[
                  {
                    data: "nisn",
                    type: "dropdown",
                    source: state.siswaList.map((s) => s.nisn),
                    allowInvalid: false,
                  },
                  { data: "nama", readOnly: true },
                  { data: "alamat", readOnly: true },
                  { data: "konsentrasi", readOnly: true },
                ]}
                afterChange={handleSiswaChange}
                {...hotTableDefaultConfig}
              />
            </Form.Item>
          </TabPane>

          <TabPane tab="Jadwal Pelajaran" key="jadwalPelajaran">
            <Form.Item name="jadwalPelajaran_id">
              <HotTable
                data={state.jadwalPelajaranData}
                colHeaders={[
                  "Guru Pengajar",
                  "Jabatan",
                  "Mata Pelajaran",
                  "Jumlah Jam",
                ]}
                columns={[
                  {
                    data: "guru",
                    type: "dropdown",
                    source: state.jadwalPelajaranList.map((j) => j.guru),
                    allowInvalid: false,
                  },
                  { data: "jabatan", readOnly: true },
                  { data: "mapel", readOnly: true },
                  { data: "jmlJam", readOnly: true },
                ]}
                afterChange={handleJadwalChange}
                {...hotTableDefaultConfig}
              />
            </Form.Item>
          </TabPane>
        </Tabs>
      </Form>
    </Modal>
  );
};

export default AddSeasonForm;
