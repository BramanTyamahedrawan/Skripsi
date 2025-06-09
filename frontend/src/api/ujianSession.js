import request from "@/utils/request";

// Mulai session ujian
export function startUjianSession(data) {
  return request({
    url: "/ujian-session/start",
    method: "post",
    data,
  });
}

// Simpan jawaban individual
export function saveJawaban(data) {
  return request({
    url: "/ujian-session/save-jawaban",
    method: "post",
    data,
  });
}

// Submit ujian final
export function submitUjian(data) {
  return request({
    url: "/ujian-session/submit",
    method: "post",
    data,
  });
}

// Ambil progress ujian peserta (untuk resume session)
export function getUjianProgress(idUjian, idPeserta) {
  return request({
    url: `/ujian-session/progress/${idUjian}/${idPeserta}`,
    method: "get",
  });
}

// Ambil detail session ujian yang sedang berjalan
export function getActiveSession(idUjian, idPeserta) {
  return request({
    url: `/ujian-session/active/${idUjian}/${idPeserta}`,
    method: "get",
  });
}

// Auto save progress (save multiple answers at once)
export function autoSaveProgress(data) {
  return request({
    url: "/ujian-session/auto-save",
    method: "post",
    data,
  });
}

// Validasi apakah peserta bisa memulai ujian
export function validateCanStart(idUjian, idPeserta) {
  return request({
    url: `/ujian-session/validate-start/${idUjian}/${idPeserta}`,
    method: "get",
  });
}

// Ping untuk keep session alive
export function keepSessionAlive(idUjian, idPeserta) {
  return request({
    url: `/ujian-session/keep-alive/${idUjian}/${idPeserta}`,
    method: "post",
  });
}

// Ambil time remaining untuk session yang sudah dimulai
export function getTimeRemaining(idUjian, idPeserta) {
  return request({
    url: `/ujian-session/time-remaining/${idUjian}/${idPeserta}`,
    method: "get",
  });
}

// Update current soal index (untuk tracking progress)
export function updateCurrentSoal(idUjian, idPeserta, soalIndex) {
  return request({
    url: `/ujian-session/update-current-soal`,
    method: "post",
    data: {
      idUjian,
      idPeserta,
      currentSoalIndex: soalIndex,
    },
  });
}

// Export semua untuk kemudahan import
export default {
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
};
