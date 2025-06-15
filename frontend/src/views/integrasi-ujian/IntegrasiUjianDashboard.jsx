/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { Card, Table, Tag, Divider, Spin, Alert, Button, message } from "antd";
import { getUjian } from "@/api/ujian";
import { getHasilByUjian } from "@/api/hasilUjian";
import { getViolationsByUjian } from "@/api/cheatDetection";
import {
  getAnalysisByUjian,
  autoGenerateAnalysisForUjian,
  forceRegenerateAnalysis,
  cleanupDuplicatesForUjian,
  cleanupAllDuplicates,
} from "@/api/ujianAnalysis";
import { useNavigate } from "react-router-dom";

const IntegrasiUjianDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [ujians, setUjians] = useState([]);
  const [selectedUjian, setSelectedUjian] = useState(null);
  const [hasilUjian, setHasilUjian] = useState([]);
  const [violations, setViolations] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUjians = async () => {
      setLoading(true);
      try {
        const res = await getUjian();
        setUjians(res.data?.content || []);
      } catch (e) {
        setUjians([]);
      } finally {
        setLoading(false);
      }
    };
    fetchUjians();
  }, []);
  const handleSelectUjian = async (ujian) => {
    setSelectedUjian(ujian);
    setLoading(true);
    try {
      const [hres, vres, ares] = await Promise.all([
        getHasilByUjian(ujian.idUjian, true),
        getViolationsByUjian(ujian.idUjian),
        getAnalysisByUjian(ujian.idUjian),
      ]);
      console.log(
        "API Response - HasilUjian count:",
        hres.data?.content?.length || 0
      );
      console.log(
        "API Response - Violations count:",
        vres.data?.content?.length || 0
      );
      console.log(
        "API Response - Analysis count:",
        ares.data?.content?.length || 0
      );

      setHasilUjian(hres.data?.content || []);
      setViolations(vres.data?.content || []);

      // Get the latest analysis if multiple exist
      let analysisData = null;
      if (ares.data?.content && ares.data.content.length > 0) {
        // Sort by generatedAt descending to get the latest
        const sortedAnalyses = ares.data.content.sort(
          (a, b) => new Date(b.generatedAt) - new Date(a.generatedAt)
        );
        analysisData = sortedAnalyses[0];

        // Log if multiple analyses found
        if (ares.data.content.length > 1) {
          console.log(
            `Found ${ares.data.content.length} analyses for ujian ${ujian.idUjian}, using latest:`,
            analysisData.idAnalysis
          );
        }
      }

      // Auto-generate analysis if not available and there are results
      if (!analysisData && hres.data?.content && hres.data.content.length > 0) {
        try {
          console.log(
            "Analysis not found, auto-generating for ujian:",
            ujian.idUjian
          );
          await autoGenerateAnalysisForUjian(ujian.idUjian); // Fetch analysis again after generation
          const newAres = await getAnalysisByUjian(ujian.idUjian);
          if (newAres.data?.content && newAres.data.content.length > 0) {
            // Get the latest analysis
            const sortedAnalyses = newAres.data.content.sort(
              (a, b) => new Date(b.generatedAt) - new Date(a.generatedAt)
            );
            analysisData = sortedAnalyses[0];
          }
          console.log("Analysis generated successfully:", analysisData);
        } catch (genError) {
          console.error("Failed to auto-generate analysis:", genError);
        }
      }
      setAnalysis(analysisData);
      console.log("Final analysis data set to state:", analysisData);
      console.log(
        "Analysis state should now be:",
        analysisData ? "available" : "null/undefined"
      );
    } catch (e) {
      setHasilUjian([]);
      setViolations([]);
      setAnalysis(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCleanupDuplicates = async (ujianId) => {
    try {
      const result = await cleanupDuplicatesForUjian(ujianId);
      message.success(
        `Berhasil membersihkan ${result.data.cleanedCount} analisis duplikat`
      ); // Refresh data after cleanup
      if (selectedUjian && selectedUjian.idUjian === ujianId) {
        await handleSelectUjian(selectedUjian);
      }
    } catch (error) {
      console.error("Failed to cleanup duplicates:", error);
      message.error("Gagal membersihkan analisis duplikat");
    }
  };

  const handleCleanupAllDuplicates = async () => {
    try {
      const result = await cleanupAllDuplicates();
      message.success(
        `Berhasil membersihkan ${result.data.totalCleaned} analisis duplikat dari sistem`
      );
      // Refresh current ujian data if any selected
      if (selectedUjian) {
        await handleSelectUjian(selectedUjian);
      }
    } catch (error) {
      console.error("Failed to cleanup all duplicates:", error);
      message.error("Gagal membersihkan semua analisis duplikat");
    }
  };

  return (
    <div style={{ maxWidth: 1100, margin: "40px auto" }}>
      <Card title="Integrasi Ujian, Hasil, Cheat Detection, dan Analisis">
        <Divider>Daftar Ujian</Divider>
        <Table
          dataSource={ujians}
          rowKey="idUjian"
          size="small"
          columns={[
            { title: "Nama Ujian", dataIndex: "namaUjian", key: "namaUjian" },
            {
              title: "Kode",
              dataIndex: ["pengaturan", "kodeUjian"],
              key: "kodeUjian",
              render: (_, r) => r.pengaturan?.kodeUjian || "-",
            },
            {
              title: "Status",
              dataIndex: "statusUjian",
              key: "statusUjian",
              render: (s) => <Tag>{s}</Tag>,
            },
            {
              title: "Aksi",
              key: "aksi",
              render: (_, r) => (
                <Button onClick={() => handleSelectUjian(r)}>
                  Lihat Integrasi
                </Button>
              ),
            },
          ]}
          pagination={{ pageSize: 8 }}
        />
        <Divider>Detail Integrasi</Divider>
        {loading && selectedUjian && <Spin tip="Memuat data..." />}
        {!loading && selectedUjian && (
          <>
            {" "}
            <Card
              type="inner"
              title={`Analisis Ujian: ${selectedUjian.namaUjian}`}
              extra={
                <div>
                  {" "}
                  <Button
                    onClick={() =>
                      handleCleanupDuplicates(selectedUjian.idUjian)
                    }
                    size="small"
                    style={{ marginRight: 8 }}
                  >
                    Cleanup Duplikat
                  </Button>{" "}
                  <Button
                    onClick={async () => {
                      try {
                        await forceRegenerateAnalysis(selectedUjian.idUjian);
                        message.success("Analisis berhasil di-regenerate");
                        await handleSelectUjian(selectedUjian);
                      } catch (error) {
                        message.error(
                          "Gagal regenerate analisis: " + error.message
                        );
                      }
                    }}
                    size="small"
                    type="primary"
                    style={{ marginRight: 8 }}
                  >
                    Regenerate
                  </Button>
                  <Button
                    onClick={handleCleanupAllDuplicates}
                    size="small"
                    type="dashed"
                  >
                    Cleanup Semua
                  </Button>
                </div>
              }
            >
              {" "}
              {analysis ? (
                <>
                  <div
                    style={{
                      marginBottom: "10px",
                      fontSize: "12px",
                      color: "#666",
                    }}
                  >
                    Debug: Analysis ID: {analysis.idAnalysis} | Generated:{" "}
                    {analysis.generatedAt}
                  </div>
                  <p>
                    <b>Rata-rata Nilai:</b>{" "}
                    {analysis.averageScore?.toFixed(2) || "-"}
                  </p>
                  <p>
                    <b>Pass Rate:</b> {analysis.passRate?.toFixed(2) || "-"}%
                  </p>
                  <p>
                    <b>Integrity Score:</b>{" "}
                    {analysis.integrityScore?.toFixed(2) || "-"}
                  </p>
                  <p>
                    <b>Jumlah Pelanggaran:</b>{" "}
                    {analysis.suspiciousSubmissions || 0}
                  </p>
                  <p>
                    <b>Peserta Ter-flag:</b> {analysis.flaggedParticipants || 0}
                  </p>
                </>
              ) : (
                <Alert
                  message="Analisis belum tersedia"
                  description={
                    <div>
                      <p>
                        Analisis untuk ujian ini belum dibuat atau belum selesai
                        diproses.
                      </p>
                      <p>
                        Debug info: Hasil ujian: {hasilUjian.length}, Ujian ID:{" "}
                        {selectedUjian.idUjian}
                      </p>
                      {hasilUjian.length > 0 ? (
                        <p>
                          Ada {hasilUjian.length} hasil ujian. Analisis bisa
                          di-generate secara otomatis.
                        </p>
                      ) : (
                        <p>Belum ada hasil ujian untuk dianalisis.</p>
                      )}
                    </div>
                  }
                  type="info"
                  showIcon
                />
              )}
            </Card>
            <Divider>Pelanggaran (Cheat Detection)</Divider>
            <Table
              dataSource={violations}
              rowKey="idDetection"
              size="small"
              columns={[
                { title: "Peserta", dataIndex: "idPeserta", key: "idPeserta" },
                {
                  title: "Jenis Pelanggaran",
                  dataIndex: "typeViolation",
                  key: "typeViolation",
                },
                {
                  title: "Severity",
                  dataIndex: "severity",
                  key: "severity",
                  render: (sev) => (
                    <Tag
                      color={
                        sev === "CRITICAL"
                          ? "red"
                          : sev === "HIGH"
                          ? "orange"
                          : "blue"
                      }
                    >
                      {sev}
                    </Tag>
                  ),
                },
                {
                  title: "Waktu",
                  dataIndex: "detectedAt",
                  key: "detectedAt",
                  render: (t) => (t ? new Date(t).toLocaleString() : "-"),
                },
              ]}
              pagination={{ pageSize: 5 }}
            />
            <Divider>Distribusi Nilai Peserta</Divider>
            <Table
              dataSource={hasilUjian}
              rowKey="idHasilUjian"
              size="small"
              columns={[
                { title: "Peserta", dataIndex: "idPeserta", key: "idPeserta" },
                { title: "Nilai", dataIndex: "totalSkor", key: "totalSkor" },
                {
                  title: "Waktu Mulai",
                  dataIndex: "waktuMulai",
                  key: "waktuMulai",
                  render: (w) => (w ? new Date(w).toLocaleString() : "-"),
                },
                {
                  title: "Waktu Selesai",
                  dataIndex: "waktuSelesai",
                  key: "waktuSelesai",
                  render: (w) => (w ? new Date(w).toLocaleString() : "-"),
                },
                {
                  title: "Status",
                  dataIndex: "lulus",
                  key: "lulus",
                  render: (lulus) =>
                    lulus ? (
                      <Tag color="green">Lulus</Tag>
                    ) : (
                      <Tag color="red">Tidak Lulus</Tag>
                    ),
                },
                {
                  title: "Pelanggaran",
                  dataIndex: "violationIds",
                  key: "violationIds",
                  render: (v) =>
                    v && v.length > 0 ? (
                      <Tag color="red">{v.length} pelanggaran</Tag>
                    ) : (
                      <Tag color="green">Bersih</Tag>
                    ),
                },
              ]}
              pagination={{ pageSize: 10 }}
            />
            <Divider>Rekap Pelanggaran per Peserta</Divider>
            <Table
              dataSource={(() => {
                // Grouping: { idPeserta: { typeViolation: count } }
                const map = {};
                violations.forEach((v) => {
                  if (!map[v.idPeserta]) map[v.idPeserta] = {};
                  if (!map[v.idPeserta][v.typeViolation])
                    map[v.idPeserta][v.typeViolation] = 0;
                  map[v.idPeserta][v.typeViolation]++;
                });
                // Flatten to array
                const rows = [];
                Object.entries(map).forEach(([idPeserta, types]) => {
                  Object.entries(types).forEach(([typeViolation, count]) => {
                    rows.push({ idPeserta, typeViolation, count });
                  });
                });
                return rows;
              })()}
              rowKey={(r) => r.idPeserta + r.typeViolation}
              size="small"
              columns={[
                { title: "Peserta", dataIndex: "idPeserta", key: "idPeserta" },
                {
                  title: "Jenis Pelanggaran",
                  dataIndex: "typeViolation",
                  key: "typeViolation",
                },
                { title: "Jumlah", dataIndex: "count", key: "count" },
              ]}
              pagination={{ pageSize: 10 }}
            />
          </>
        )}
      </Card>
    </div>
  );
};

export default IntegrasiUjianDashboard;
