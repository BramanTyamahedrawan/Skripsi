/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import {
  Card,
  Spin,
  Alert,
  Typography,
  Divider,
  Tag,
  Table,
  Button,
} from "antd";
import { getAnalysisByUjian } from "@/api/ujianAnalysis";
import { getViolationsByUjian } from "@/api/cheatDetection";
import { getHasilByUjian } from "@/api/hasilUjian";
import { useParams, useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

const DetailAnalysis = () => {
  const { idUjian } = useParams();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [violations, setViolations] = useState([]);
  const [hasilUjian, setHasilUjian] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        console.log(
          `DetailAnalysis: Fetching analysis for ujian ID: ${idUjian}`
        );

        const res = await getAnalysisByUjian(idUjian);
        console.log("DetailAnalysis: API response:", res);

        if (res.data && res.data.content && res.data.content.length > 0) {
          // Sort by generatedAt to get the latest analysis
          const sortedAnalysis = res.data.content.sort((a, b) => {
            const dateA = new Date(a.generatedAt || 0);
            const dateB = new Date(b.generatedAt || 0);
            return dateB - dateA; // Latest first
          });

          const latestAnalysis = sortedAnalysis[0];
          console.log("DetailAnalysis: Using latest analysis:", latestAnalysis);
          setAnalysis(latestAnalysis);
        } else {
          console.log("DetailAnalysis: No analysis found in response");
          setAnalysis(null);
        }

        const vres = await getViolationsByUjian(idUjian);
        setViolations(vres.data?.content || []);
        const hres = await getHasilByUjian(idUjian, true);
        setHasilUjian(hres.data?.content || []);
      } catch (err) {
        console.error("DetailAnalysis: Error fetching data:", err);
        setAnalysis(null);
      } finally {
        setLoading(false);
      }
    };
    if (idUjian) fetchData();
  }, [idUjian]);
  if (loading) return <Spin tip="Memuat analisis..." />;

  if (!analysis) {
    return (
      <div style={{ maxWidth: 900, margin: "40px auto" }}>
        <Alert
          message="Analisis ujian belum tersedia"
          description={`Analisis untuk ujian ID ${idUjian} belum dibuat atau belum selesai diproses. Silakan periksa apakah ujian sudah selesai dan coba generate analisis melalui menu Analisis Ujian.`}
          type="info"
          showIcon
          action={
            <Button size="small" onClick={() => navigate(-1)}>
              Kembali
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: "40px auto" }}>
      <Card>
        <Title level={3}>Analisis Ujian</Title>
        <Divider />
        <p>
          <b>Rata-rata Nilai:</b> {analysis.averageScore?.toFixed(2) || "-"}
        </p>
        <p>
          <b>Pass Rate:</b> {analysis.passRate?.toFixed(2) || "-"}%
        </p>
        <p>
          <b>Integrity Score:</b> {analysis.integrityScore?.toFixed(2) || "-"}
        </p>
        <p>
          <b>Jumlah Pelanggaran:</b> {analysis.suspiciousSubmissions || 0}
        </p>
        <p>
          <b>Peserta Ter-flag:</b> {analysis.flaggedParticipants || 0}
        </p>
        <Divider>Rekomendasi</Divider>
        {analysis.recommendations && analysis.recommendations.length > 0 ? (
          <ul>
            {analysis.recommendations.map((rec, idx) => (
              <li key={idx}>{rec}</li>
            ))}
          </ul>
        ) : (
          <Text type="secondary">Tidak ada rekomendasi khusus.</Text>
        )}
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
        <Button style={{ marginTop: 24 }} onClick={() => navigate(-1)}>
          Kembali
        </Button>
      </Card>
    </div>
  );
};

export default DetailAnalysis;
