import request from "../utils/request";

// Get all analysis (with optional pagination & filter)
export function getAllAnalysis(params = {}) {
  return request({
    url: "/ujian-analysis",
    method: "get",
    params,
  });
}

// Get analysis by ujian ID
export function getAnalysisByUjian(ujianId, params = {}) {
  return request({
    url: `/ujian-analysis/ujian/${ujianId}`,
    method: "get",
    params,
  });
}

// Get analysis by type
export function getAnalysisByType(analysisType, params = {}) {
  return request({
    url: `/ujian-analysis/type/${analysisType}`,
    method: "get",
    params,
  });
}

// Get single analysis by ID
export function getAnalysisById(analysisId) {
  return request({
    url: `/ujian-analysis/${analysisId}`,
    method: "get",
  });
}

// Generate comprehensive analysis
export function generateAnalysis(data) {
  return request({
    url: "/ujian-analysis/generate",
    method: "post",
    data,
  });
}

// Update existing analysis
export function updateAnalysis(analysisId, data) {
  return request({
    url: `/ujian-analysis/${analysisId}`,
    method: "put",
    data,
  });
}

// Delete analysis by ID
export function deleteAnalysis(analysisId) {
  return request({
    url: `/ujian-analysis/${analysisId}`,
    method: "delete",
  });
}

// Compare multiple analyses
export function compareAnalyses(data) {
  return request({
    url: "/ujian-analysis/compare",
    method: "post",
    data,
  });
}

// Export analysis (POST)
export function exportAnalysis(data) {
  return request({
    url: "/ujian-analysis/export",
    method: "post",
    data,
  });
}

// Export analysis by ID (GET)
export function exportAnalysisById(
  analysisId,
  format,
  templateType = "STANDARD"
) {
  return request({
    url: `/ujian-analysis/${analysisId}/export/${format}`,
    method: "get",
    params: { templateType },
  });
}

// Get dashboard statistics
export function getAnalysisStatistics() {
  return request({
    url: "/ujian-analysis/statistics",
    method: "get",
  });
}

// Quick descriptive analysis
export function quickDescriptiveAnalysis(ujianId) {
  return request({
    url: "/ujian-analysis/quick-descriptive",
    method: "post",
    params: { ujianId },
  });
}

// Quick item analysis
export function quickItemAnalysis(ujianId) {
  return request({
    url: "/ujian-analysis/quick-item",
    method: "post",
    params: { ujianId },
  });
}

// Validate ujian for analysis
export function validateUjianForAnalysis(ujianId) {
  return request({
    url: `/ujian-analysis/validate/${ujianId}`,
    method: "get",
  });
}
