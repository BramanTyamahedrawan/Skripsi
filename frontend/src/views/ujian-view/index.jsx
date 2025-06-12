/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  Button,
  Radio,
  Checkbox,
  Input,
  Row,
  Col,
  Typography,
  Tag,
  Space,
  Progress,
  Alert,
  Modal,
  Spin,
  Badge,
  Divider,
  Grid,
  message,
} from "antd";
import {
  ClockCircleOutlined,
  BookOutlined,
  CheckCircleOutlined,
  LoginOutlined,
  SendOutlined,
  LeftOutlined,
  RightOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  ExclamationCircleOutlined,
  PlayCircleOutlined,
  StopOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import moment from "moment";

// Import API functions - SIMPLIFIED
import { getUjian } from "@/api/ujian"; // Gunakan yang sudah ada
import {
  startUjianSession,
  saveJawaban,
  submitUjian,
  getUjianProgress,
  getActiveSession,
  autoSaveProgress,
  validateCanStart,
  keepSessionAlive,
  getTimeRemaining,
  updateCurrentSoal,
} from "@/api/ujianSession";
import { reqUserInfo } from "@/api/user";
import { getStudentByUser } from "@/api/student";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const UjianCATView = () => {
  const screens = useBreakpoint();
  const navigate = useNavigate();
  const { kodeUjian } = useParams();

  // State management
  const [ujianData, setUjianData] = useState(null);
  const [soalList, setSoalList] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [studentInfo, setStudentInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  // Session states
  const [sessionId, setSessionId] = useState(null);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);

  // Ujian states
  const [currentSoal, setCurrentSoal] = useState(0);
  const [jawaban, setJawaban] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [showSoalPanel, setShowSoalPanel] = useState(false);
  const [attemptNumber, setAttemptNumber] = useState(1);

  // Login states
  const [showLogin, setShowLogin] = useState(true);
  const [inputKodeUjian, setInputKodeUjian] = useState(kodeUjian || "");
  const [loginLoading, setLoginLoading] = useState(false);

  // Progress tracking
  const [autoSaveStatus, setAutoSaveStatus] = useState("idle");
  const [lastSaved, setLastSaved] = useState(null);

  const timerRef = useRef(null);
  const autoSaveRef = useRef(null);
  const keepAliveRef = useRef(null);

  // Fetch user info
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await reqUserInfo();
        setUserInfo(response.data);

        // Get student info
        const studentResponse = await getStudentByUser(response.data.id);
        if (studentResponse.data.statusCode === 200) {
          setStudentInfo(studentResponse.data.content[0]);
        }
      } catch (error) {
        message.error("Gagal mengambil informasi pengguna");
        navigate("/login");
      }
    };
    fetchUserInfo();
  }, [navigate]);

  // Handle login dengan kode ujian - SIMPLIFIED
  const handleLoginUjian = async () => {
    if (!inputKodeUjian.trim()) {
      message.error("Masukkan kode ujian");
      return;
    }

    setLoginLoading(true);
    try {
      // Gunakan API /ujian yang sudah ada
      const response = await getUjian();
      if (response.data.statusCode === 200) {
        const ujianList = response.data.content;

        // Cari ujian berdasarkan kode
        const ujian = ujianList.find(
          (u) => u.pengaturan?.kodeUjian === inputKodeUjian
        );

        if (!ujian) {
          message.error("Kode ujian tidak ditemukan");
          return;
        }

        // Validasi status ujian
        if (!["AKTIF", "BERLANGSUNG"].includes(ujian.statusUjian)) {
          message.error("Ujian tidak tersedia untuk dikerjakan");
          return;
        }

        // Validasi waktu ujian
        const now = moment();
        const mulai = moment(ujian.waktuMulaiDijadwalkan);
        const selesai = ujian.waktuSelesaiOtomatis
          ? moment(ujian.waktuSelesaiOtomatis)
          : null;

        if (now.isBefore(mulai) && !ujian.allowLateStart) {
          message.error(
            `Ujian belum dimulai. Waktu mulai: ${mulai.format(
              "DD/MM/YYYY HH:mm"
            )}`
          );
          return;
        }

        if (selesai && now.isAfter(selesai)) {
          message.error("Waktu ujian telah berakhir");
          return;
        }

        // Set data ujian dan soal sekaligus
        setUjianData(ujian);

        // Langsung set soal dari bankSoalList (tanpa jawabanBenar untuk keamanan)
        const soalFiltered = ujian.bankSoalList.map((soal) => {
          const { jawabanBenar, ...soalWithoutAnswer } = soal;
          return soalWithoutAnswer;
        });

        // Acak soal jika tipeSoal = "ACAK"
        if (ujian.tipeSoal === "ACAK") {
          setSoalList(shuffleArray(soalFiltered));
        } else {
          setSoalList(soalFiltered);
        }

        setTimeLeft(ujian.durasiMenit * 60);
        setShowLogin(false);

        // Check if user can start
        await checkCanStart(ujian.idUjian);
      } else {
        message.error("Gagal mengambil data ujian");
      }
    } catch (error) {
      message.error("Kode ujian tidak ditemukan");
    } finally {
      setLoginLoading(false);
    }
  };

  // Check if user can start ujian
  const checkCanStart = async (idUjian) => {
    try {
      if (!userInfo) return;

      const validateResponse = await validateCanStart(idUjian, userInfo.id);
      if (validateResponse.data.statusCode === 200) {
        const validation = validateResponse.data.content;

        if (!validation.canStart) {
          message.error(validation.reason || "Tidak dapat memulai ujian");
          return;
        }

        // Check for existing session
        await checkExistingSession(idUjian);
      }
    } catch (error) {
      console.error("Validation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  // Check existing session
  const checkExistingSession = async (idUjian) => {
    try {
      const activeResponse = await getActiveSession(idUjian, userInfo.id);
      if (
        activeResponse.data.statusCode === 200 &&
        activeResponse.data.content
      ) {
        // Resume existing session
        const sessionData = activeResponse.data.content;
        setSessionId(sessionData.sessionId);
        setSessionStarted(true);
        setSessionActive(true);
        setIsStarted(true);
        setJawaban(sessionData.answers || {});
        setCurrentSoal(sessionData.currentSoalIndex || 0);
        setAttemptNumber(sessionData.attemptNumber || 1);

        // Get remaining time
        const timeResponse = await getTimeRemaining(idUjian, userInfo.id);
        if (timeResponse.data.statusCode === 200) {
          setTimeLeft(timeResponse.data.content.remainingSeconds);
        }

        // Load soal
        await loadSoalUjian(idUjian);

        message.info("Melanjutkan session ujian yang ada");
      } else {
        // Load soal for new session
        await loadSoalUjian(idUjian);
      }
    } catch (error) {
      console.error("Failed to check existing session:", error);
      await loadSoalUjian(idUjian);
    }
  };

  // Load soal ujian - SIMPLIFIED (tidak perlu lagi karena sudah ada di bankSoalList)
  const loadSoalUjian = async (idUjian) => {
    // Soal sudah di-set di handleLoginUjian, fungsi ini hanya untuk fallback
    if (soalList.length === 0 && ujianData?.bankSoalList) {
      const soalFiltered = ujianData.bankSoalList.map((soal) => {
        const { jawabanBenar, ...soalWithoutAnswer } = soal;
        return soalWithoutAnswer;
      });

      if (ujianData.tipeSoal === "ACAK") {
        setSoalList(shuffleArray(soalFiltered));
      } else {
        setSoalList(soalFiltered);
      }
    }
  };

  // Helper function untuk mengacak array
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Start ujian session
  const handleStartUjian = async () => {
    try {
      setLoading(true);

      const startResponse = await startUjianSession({
        idUjian: ujianData.idUjian,
        kodeUjian: ujianData.pengaturan?.kodeUjian,
        idPeserta: userInfo.id,
      });

      if (startResponse.data.statusCode === 200) {
        const sessionData = startResponse.data.content;
        setSessionId(sessionData.sessionId);
        setSessionStarted(true);
        setSessionActive(true);
        setIsStarted(true);

        message.success("Ujian dimulai. Selamat mengerjakan!");

        // Start keep-alive mechanism
        startKeepAlive();
      }
    } catch (error) {
      message.error("Gagal memulai ujian: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Timer countdown
  useEffect(() => {
    if (isStarted && !isFinished && timeLeft > 0 && sessionActive) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isStarted, isFinished, timeLeft, sessionActive]);

  // Auto save mechanism
  useEffect(() => {
    if (isStarted && !isFinished && sessionActive) {
      autoSaveRef.current = setInterval(() => {
        handleAutoSave();
      }, 30000); // Auto save every 30 seconds

      return () => {
        if (autoSaveRef.current) {
          clearInterval(autoSaveRef.current);
        }
      };
    }
  }, [isStarted, isFinished, jawaban, sessionActive]);

  // Keep session alive
  const startKeepAlive = () => {
    keepAliveRef.current = setInterval(async () => {
      try {
        if (sessionActive && ujianData && userInfo) {
          await keepSessionAlive(ujianData.idUjian, userInfo.id);
        }
      } catch (error) {
        console.error("Keep alive failed:", error);
      }
    }, 60000); // Ping every minute
  };

  // Clean up intervals
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (autoSaveRef.current) clearInterval(autoSaveRef.current);
      if (keepAliveRef.current) clearInterval(keepAliveRef.current);
    };
  }, []);

  // Auto save function
  const handleAutoSave = async () => {
    if (!sessionActive || Object.keys(jawaban).length === 0) return;

    try {
      setAutoSaveStatus("saving");

      await autoSaveProgress({
        idUjian: ujianData.idUjian,
        idPeserta: userInfo.id,
        sessionId: sessionId,
        answers: jawaban,
        currentSoalIndex: currentSoal,
        timestamp: new Date().toISOString(),
      });

      setAutoSaveStatus("saved");
      setLastSaved(new Date());

      setTimeout(() => setAutoSaveStatus("idle"), 2000);
    } catch (error) {
      setAutoSaveStatus("error");
      console.error("Auto save failed:", error);
    }
  };

  // Handle manual save
  const handleManualSave = async () => {
    await handleAutoSave();
    message.success("Jawaban berhasil disimpan");
  };

  // Format waktu
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Warna timer
  const getTimerColor = () => {
    const percentage = (timeLeft / (ujianData?.durasiMenit * 60)) * 100;
    if (percentage <= 10) return "#ff4d4f";
    if (percentage <= 25) return "#fa8c16";
    return "#52c41a";
  };

  // Handle jawaban berdasarkan jenis soal
  const handleJawaban = async (soalId, jawaban_baru) => {
    const soal = soalList.find((s) => s.idBankSoal === soalId);
    let formattedJawaban = jawaban_baru;

    // Format jawaban berdasarkan jenis soal
    if (soal?.jenisSoal === "MULTI") {
      formattedJawaban = Array.isArray(jawaban_baru)
        ? jawaban_baru
        : [jawaban_baru];
    } else if (soal?.jenisSoal === "COCOK") {
      formattedJawaban = jawaban_baru;
    } else if (soal?.jenisSoal === "ISIAN") {
      formattedJawaban = jawaban_baru;
    } else {
      formattedJawaban = jawaban_baru;
    }

    setJawaban((prev) => ({
      ...prev,
      [soalId]: formattedJawaban,
    }));

    // Save individual answer immediately
    try {
      await saveJawaban({
        idUjian: ujianData.idUjian,
        idPeserta: userInfo.id,
        sessionId: sessionId,
        idBankSoal: soalId,
        jawaban: formattedJawaban,
        attemptNumber: attemptNumber,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Failed to save individual answer:", error);
    }
  };

  // Navigasi soal
  const goToSoal = async (index) => {
    setCurrentSoal(index);

    // Update current soal index on server
    try {
      await updateCurrentSoal(ujianData.idUjian, userInfo.id, index);
    } catch (error) {
      console.error("Failed to update current soal:", error);
    }

    if (screens.xs || screens.sm) {
      setShowSoalPanel(false);
    }
  };

  const nextSoal = () => {
    if (currentSoal < soalList.length - 1) {
      goToSoal(currentSoal + 1);
    }
  };

  const prevSoal = () => {
    if (currentSoal > 0 && ujianData.allowBacktrack) {
      goToSoal(currentSoal - 1);
    }
  };

  // Auto submit ketika waktu habis
  const handleAutoSubmit = async () => {
    await handleSubmitUjian(true);
  };

  // Submit ujian
  const handleSubmitUjian = async (isAutoSubmit = false) => {
    const submitAction = async () => {
      try {
        setLoading(true);

        // Final save before submit
        await handleAutoSave();

        // Submit ujian
        const submitResponse = await submitUjian({
          idUjian: ujianData.idUjian,
          idPeserta: userInfo.id,
          sessionId: sessionId,
          answers: jawaban,
          attemptNumber: attemptNumber,
          isAutoSubmit: isAutoSubmit,
          submittedAt: new Date().toISOString(),
        });

        if (submitResponse.data.statusCode === 200) {
          setIsFinished(true);
          setIsStarted(false);
          setSessionActive(false);

          message.success(
            isAutoSubmit
              ? "Waktu habis! Ujian otomatis dikumpulkan."
              : "Ujian berhasil dikumpulkan!"
          );

          // Clear all intervals
          if (timerRef.current) clearInterval(timerRef.current);
          if (autoSaveRef.current) clearInterval(autoSaveRef.current);
          if (keepAliveRef.current) clearInterval(keepAliveRef.current);
        }
      } catch (error) {
        message.error("Gagal mengumpulkan ujian: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    if (isAutoSubmit) {
      await submitAction();
    } else {
      Modal.confirm({
        title: "Konfirmasi Submit Ujian",
        content:
          "Apakah Anda yakin ingin mengumpulkan ujian? Jawaban tidak dapat diubah setelah dikumpulkan.",
        okText: "Ya, Kumpulkan",
        cancelText: "Batal",
        onOk: submitAction,
      });
    }
  };

  // Status soal
  const getSoalStatus = (index) => {
    const soalId = soalList[index]?.idBankSoal;
    if (jawaban[soalId]) return "answered";
    return "unanswered";
  };

  // Statistik jawaban
  const jawabanStats = {
    dijawab: Object.keys(jawaban).length,
    belumDijawab: Math.max(
      0,
      (soalList?.length || 0) - Object.keys(jawaban).length
    ),
  };

  // Render komponen jawaban berdasarkan jenis soal
  const renderSoalComponent = (soal) => {
    switch (soal.jenisSoal) {
      case "MULTI":
        return (
          <Checkbox.Group
            value={jawaban[soal.idBankSoal] || []}
            onChange={(checkedValues) =>
              handleJawaban(soal.idBankSoal, checkedValues)
            }
            style={{ width: "100%" }}
          >
            <Space direction="vertical" style={{ width: "100%" }}>
              {Object.entries(soal.opsi || {}).map(([key, value]) => (
                <Checkbox
                  key={key}
                  value={key}
                  style={{
                    padding: "12px",
                    border: "1px solid #d9d9d9",
                    borderRadius: "6px",
                    marginBottom: "8px",
                    width: "100%",
                    display: "block",
                  }}
                >
                  <strong>{key}.</strong> {value}
                </Checkbox>
              ))}
            </Space>
          </Checkbox.Group>
        );

      case "COCOK":
        return (
          <div>
            <Alert
              message="Instruksi"
              description="Cocokkan item di sebelah kiri dengan item di sebelah kanan yang sesuai."
              type="info"
              style={{ marginBottom: "16px" }}
            />
            <Row gutter={16}>
              <Col span={12}>
                <Text strong>Sisi Kiri:</Text>
                {Object.entries(soal.pasangan || {})
                  .filter(([key]) => key.includes("_kiri"))
                  .map(([key, value]) => (
                    <div
                      key={key}
                      style={{
                        margin: "8px 0",
                        padding: "8px",
                        border: "1px solid #d9d9d9",
                        borderRadius: "4px",
                      }}
                    >
                      {value}
                    </div>
                  ))}
              </Col>
              <Col span={12}>
                <Text strong>Sisi Kanan:</Text>
                {Object.entries(soal.pasangan || {})
                  .filter(([key]) => key.includes("_kanan"))
                  .map(([key, value]) => (
                    <div
                      key={key}
                      style={{
                        margin: "8px 0",
                        padding: "8px",
                        border: "1px solid #d9d9d9",
                        borderRadius: "4px",
                      }}
                    >
                      {value}
                    </div>
                  ))}
              </Col>
            </Row>
            <div style={{ marginTop: "16px" }}>
              <Text strong>Jawaban Anda:</Text>
              <Input.TextArea
                placeholder="Masukkan pasangan jawaban (contoh: a=f, b=e, c=d)"
                value={
                  Array.isArray(jawaban[soal.idBankSoal])
                    ? jawaban[soal.idBankSoal].join(", ")
                    : jawaban[soal.idBankSoal] || ""
                }
                onChange={(e) => {
                  const value = e.target.value;
                  const pairs = value
                    .split(",")
                    .map((p) => p.trim())
                    .filter((p) => p);
                  handleJawaban(soal.idBankSoal, pairs);
                }}
                rows={3}
              />
            </div>
          </div>
        );

      case "ISIAN":
        return (
          <Input
            placeholder="Masukkan jawaban Anda"
            value={jawaban[soal.idBankSoal] || ""}
            onChange={(e) => handleJawaban(soal.idBankSoal, e.target.value)}
            size="large"
          />
        );

      default:
        // Single choice (PG)
        return (
          <Radio.Group
            value={jawaban[soal.idBankSoal]}
            onChange={(e) => handleJawaban(soal.idBankSoal, e.target.value)}
            style={{ width: "100%" }}
          >
            <Space direction="vertical" style={{ width: "100%" }}>
              {Object.entries(soal.opsi || {}).map(([key, value]) => (
                <Radio
                  key={key}
                  value={key}
                  style={{
                    padding: "12px",
                    border: "1px solid #d9d9d9",
                    borderRadius: "6px",
                    marginBottom: "8px",
                    width: "100%",
                    display: "block",
                  }}
                >
                  <strong>{key}.</strong> {value}
                </Radio>
              ))}
            </Space>
          </Radio.Group>
        );
    }
  };

  // Auto save status indicator
  const renderAutoSaveStatus = () => {
    switch (autoSaveStatus) {
      case "saving":
        return (
          <Tag icon={<SaveOutlined />} color="processing">
            Menyimpan...
          </Tag>
        );
      case "saved":
        return (
          <Tag icon={<CheckCircleOutlined />} color="success">
            Tersimpan
          </Tag>
        );
      case "error":
        return (
          <Tag icon={<ExclamationCircleOutlined />} color="error">
            Error
          </Tag>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        <Spin size="large" />
        <div style={{ marginTop: "16px" }}>Memuat ujian...</div>
      </div>
    );
  }

  // Login screen
  if (showLogin) {
    return (
      <div style={{ padding: "24px", maxWidth: "500px", margin: "0 auto" }}>
        <Card>
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <LoginOutlined
              style={{
                fontSize: "64px",
                color: "#1890ff",
                marginBottom: "24px",
              }}
            />
            <Title level={2}>Masuk Ujian CAT</Title>
            <div style={{ marginBottom: "24px" }}>
              <Input
                placeholder="Masukkan kode ujian"
                value={inputKodeUjian}
                onChange={(e) => setInputKodeUjian(e.target.value)}
                size="large"
                onPressEnter={handleLoginUjian}
              />
            </div>
            <Button
              type="primary"
              size="large"
              loading={loginLoading}
              onClick={handleLoginUjian}
              style={{ width: "100%" }}
            >
              Masuk Ujian
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Pre-start screen
  if (!isStarted && !isFinished && ujianData && soalList.length > 0) {
    return (
      <div style={{ padding: "24px", maxWidth: "800px", margin: "0 auto" }}>
        <Card>
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <BookOutlined
              style={{
                fontSize: "64px",
                color: "#1890ff",
                marginBottom: "24px",
              }}
            />
            <Title level={2}>{ujianData.namaUjian}</Title>
            <Text
              type="secondary"
              style={{
                fontSize: "16px",
                display: "block",
                marginBottom: "24px",
              }}
            >
              Kode: {ujianData.pengaturan?.kodeUjian}
            </Text>

            <Card style={{ marginBottom: "24px", backgroundColor: "#f6ffed" }}>
              <Row gutter={[24, 16]}>
                <Col xs={24} sm={8}>
                  <div style={{ textAlign: "center" }}>
                    <ClockCircleOutlined
                      style={{ fontSize: "24px", color: "#52c41a" }}
                    />
                    <div style={{ marginTop: "8px" }}>
                      <Text strong>{ujianData.durasiMenit} Menit</Text>
                      <div>Waktu Ujian</div>
                    </div>
                  </div>
                </Col>
                <Col xs={24} sm={8}>
                  <div style={{ textAlign: "center" }}>
                    <BookOutlined
                      style={{ fontSize: "24px", color: "#1890ff" }}
                    />
                    <div style={{ marginTop: "8px" }}>
                      <Text strong>{soalList.length} Soal</Text>
                      <div>Total Soal</div>
                    </div>
                  </div>
                </Col>
                <Col xs={24} sm={8}>
                  <div style={{ textAlign: "center" }}>
                    <CheckCircleOutlined
                      style={{ fontSize: "24px", color: "#fa8c16" }}
                    />
                    <div style={{ marginTop: "8px" }}>
                      <Text strong>{ujianData.tipeSoal}</Text>
                      <div>Tipe Soal</div>
                    </div>
                  </div>
                </Col>
              </Row>
            </Card>

            {ujianData.deskripsi && (
              <Alert
                message="Deskripsi Ujian"
                description={ujianData.deskripsi}
                type="info"
                style={{ marginBottom: "24px" }}
              />
            )}

            <Alert
              message="Petunjuk Ujian"
              description={
                <ul style={{ textAlign: "left", paddingLeft: "20px" }}>
                  <li>Bacalah setiap soal dengan teliti sebelum menjawab</li>
                  <li>Pilih jawaban yang paling tepat untuk setiap soal</li>
                  {ujianData.allowBacktrack && (
                    <li>
                      Anda dapat kembali ke soal sebelumnya untuk mengubah
                      jawaban
                    </li>
                  )}
                  {ujianData.allowReview && (
                    <li>Anda dapat mereview jawaban sebelum mengumpulkan</li>
                  )}
                  <li>Jawaban akan tersimpan otomatis setiap 30 detik</li>
                  <li>Pastikan koneksi internet stabil selama ujian</li>
                  <li>Ujian akan otomatis terkumpul ketika waktu habis</li>
                  <li>Maksimal percobaan: {ujianData.maxAttempts} kali</li>
                </ul>
              }
              type="info"
              style={{ marginBottom: "32px" }}
            />

            <Button
              type="primary"
              size="large"
              icon={<PlayCircleOutlined />}
              onClick={handleStartUjian}
              loading={loading}
              style={{ padding: "8px 32px", height: "auto" }}
            >
              Mulai Ujian
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Finished screen
  if (isFinished) {
    return (
      <div style={{ padding: "24px", maxWidth: "800px", margin: "0 auto" }}>
        <Card>
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <CheckCircleOutlined
              style={{
                fontSize: "64px",
                color: "#52c41a",
                marginBottom: "24px",
              }}
            />
            <Title level={2}>Ujian Selesai!</Title>
            <Text
              type="secondary"
              style={{
                fontSize: "16px",
                display: "block",
                marginBottom: "32px",
              }}
            >
              Terima kasih telah mengerjakan ujian. Jawaban Anda telah
              tersimpan.
            </Text>

            <Card style={{ backgroundColor: "#f6ffed", marginBottom: "24px" }}>
              <Row gutter={[24, 16]}>
                <Col xs={24} sm={12}>
                  <div style={{ textAlign: "center" }}>
                    <Text strong style={{ fontSize: "24px", color: "#52c41a" }}>
                      {jawabanStats.dijawab}
                    </Text>
                    <div>Soal Dijawab</div>
                  </div>
                </Col>
                <Col xs={24} sm={12}>
                  <div style={{ textAlign: "center" }}>
                    <Text strong style={{ fontSize: "24px", color: "#fa8c16" }}>
                      {jawabanStats.belumDijawab}
                    </Text>
                    <div>Soal Kosong</div>
                  </div>
                </Col>
              </Row>
            </Card>

            <Alert
              message={
                ujianData.tampilkanNilai
                  ? "Hasil ujian akan diumumkan setelah semua peserta selesai mengerjakan."
                  : "Hasil ujian tidak akan ditampilkan."
              }
              type="success"
              style={{ marginBottom: "24px" }}
            />

            <Button
              type="primary"
              size="large"
              onClick={() => navigate("/dashboard")}
            >
              Kembali ke Dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Main exam interface
  return (
    <div
      style={{
        padding: screens.xs ? "12px" : "24px",
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
      }}
    >
      {/* Header */}
      <Card style={{ marginBottom: "16px" }}>
        <Row align="middle" justify="space-between">
          <Col xs={24} sm={12} md={8}>
            <div>
              <Text strong style={{ fontSize: "16px" }}>
                {ujianData.namaUjian}
              </Text>
              <div>
                <Text type="secondary">
                  Kode: {ujianData.pengaturan?.kodeUjian}
                </Text>
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  Session: {sessionId ? "Aktif" : "Tidak Aktif"}
                </Text>
              </div>
            </div>
          </Col>
          <Col xs={24} sm={12} md={8}>
            {ujianData.showTimerToParticipants && (
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: "bold",
                    color: getTimerColor(),
                  }}
                >
                  <ClockCircleOutlined /> {formatTime(timeLeft)}
                </div>
                <Progress
                  percent={(timeLeft / (ujianData.durasiMenit * 60)) * 100}
                  strokeColor={getTimerColor()}
                  showInfo={false}
                  size="small"
                />
              </div>
            )}
          </Col>
          <Col xs={24} sm={24} md={8}>
            <div style={{ textAlign: "right" }}>
              <Space>
                {renderAutoSaveStatus()}
                {screens.xs || screens.sm ? (
                  <Button
                    icon={
                      showSoalPanel ? <EyeInvisibleOutlined /> : <EyeOutlined />
                    }
                    onClick={() => setShowSoalPanel(!showSoalPanel)}
                  >
                    {showSoalPanel ? "Sembunyikan" : "Daftar Soal"}
                  </Button>
                ) : null}
                <Button icon={<SaveOutlined />} onClick={handleManualSave}>
                  Simpan
                </Button>
                <Button
                  type="primary"
                  danger
                  onClick={() => handleSubmitUjian(false)}
                >
                  <SendOutlined /> Kumpulkan
                </Button>
              </Space>
            </div>
          </Col>
        </Row>
      </Card>

      <Row gutter={16}>
        {/* Panel Soal */}
        {(!screens.xs && !screens.sm) || showSoalPanel ? (
          <Col xs={24} sm={24} md={6} style={{ marginBottom: "16px" }}>
            <Card
              title={`Daftar Soal (${jawabanStats.dijawab}/${soalList.length})`}
              size="small"
            >
              <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                <Row gutter={[8, 8]}>
                  {soalList.map((_, index) => (
                    <Col span={6} key={index}>
                      <Badge
                        dot={getSoalStatus(index) === "answered"}
                        color="#52c41a"
                      >
                        <Button
                          size="small"
                          type={currentSoal === index ? "primary" : "default"}
                          onClick={() => goToSoal(index)}
                          style={{
                            width: "100%",
                            backgroundColor:
                              getSoalStatus(index) === "answered"
                                ? "#f6ffed"
                                : undefined,
                          }}
                        >
                          {index + 1}
                        </Button>
                      </Badge>
                    </Col>
                  ))}
                </Row>
              </div>

              <Divider />

              <Row gutter={8}>
                <Col span={12}>
                  <div style={{ textAlign: "center" }}>
                    <Badge color="#52c41a" />
                    <Text style={{ fontSize: "12px" }}>
                      Dijawab: {jawabanStats.dijawab}
                    </Text>
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ textAlign: "center" }}>
                    <Badge color="#d9d9d9" />
                    <Text style={{ fontSize: "12px" }}>
                      Kosong: {jawabanStats.belumDijawab}
                    </Text>
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>
        ) : null}

        {/* Area Soal */}
        <Col xs={24} sm={24} md={!screens.xs && !screens.sm ? 18 : 24}>
          <Card>
            {soalList[currentSoal] && (
              <>
                <div style={{ marginBottom: "16px" }}>
                  <Tag color="blue">
                    Soal {currentSoal + 1} dari {soalList.length}
                  </Tag>
                  <Tag color="purple">
                    Jenis: {soalList[currentSoal].jenisSoal}
                  </Tag>
                  <Tag color="orange">Bobot: {soalList[currentSoal].bobot}</Tag>
                  {getSoalStatus(currentSoal) === "answered" && (
                    <Tag color="green">Sudah Dijawab</Tag>
                  )}
                  {lastSaved && (
                    <Text
                      type="secondary"
                      style={{ fontSize: "12px", marginLeft: "8px" }}
                    >
                      Terakhir disimpan: {moment(lastSaved).format("HH:mm:ss")}
                    </Text>
                  )}
                </div>

                <div
                  style={{
                    fontSize: "16px",
                    lineHeight: "1.6",
                    marginBottom: "24px",
                    fontWeight: "500",
                  }}
                >
                  {soalList[currentSoal].pertanyaan}
                </div>

                {renderSoalComponent(soalList[currentSoal])}
              </>
            )}

            <Divider />

            <Row justify="space-between" align="middle">
              <Col>
                <Button
                  icon={<LeftOutlined />}
                  onClick={prevSoal}
                  disabled={currentSoal === 0 || !ujianData.allowBacktrack}
                >
                  Sebelumnya
                </Button>
              </Col>
              <Col>
                <Text type="secondary">
                  {currentSoal + 1} / {soalList.length}
                </Text>
              </Col>
              <Col>
                <Button
                  type="primary"
                  icon={<RightOutlined />}
                  onClick={nextSoal}
                  disabled={currentSoal === soalList.length - 1}
                >
                  Selanjutnya
                </Button>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Warning untuk waktu hampir habis */}
      {timeLeft <= 300 && timeLeft > 0 && ujianData.showTimerToParticipants && (
        <Modal
          title={
            <span style={{ color: "#fa8c16" }}>
              <ExclamationCircleOutlined /> Peringatan!
            </span>
          }
          open={timeLeft <= 300 && timeLeft > 60}
          footer={null}
          closable={false}
          centered
        >
          <Alert
            message={`Waktu tersisa ${Math.floor(timeLeft / 60)} menit ${
              timeLeft % 60
            } detik!`}
            description="Segera selesaikan ujian Anda. Ujian akan otomatis terkumpul ketika waktu habis."
            type="warning"
            showIcon
          />
        </Modal>
      )}
    </div>
  );
};

export default UjianCATView;
