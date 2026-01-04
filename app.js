const reportForm = document.getElementById("reportForm");
const resetButton = document.getElementById("resetButton");
const saveToggle = document.getElementById("saveToggle");
const exportButton = document.getElementById("exportButton");
const gate = document.getElementById("gate");
const gateForm = document.getElementById("gateForm");
const gateCode = document.getElementById("gateCode");
const lockButton = document.getElementById("lockButton");
const salesInput = document.getElementById("salesInput");
const visitorsInput = document.getElementById("visitorsInput");
const peakInput = document.getElementById("peakInput");
const targetRateInput = document.getElementById("targetRateInput");
const visitorTotal = document.getElementById("visitorTotal");
const averageSpend = document.getElementById("averageSpend");
const salesTotal = document.getElementById("salesTotal");
const visitorsTotal = document.getElementById("visitorsTotal");
const avgSpendTotal = document.getElementById("avgSpendTotal");
const targetRateTotal = document.getElementById("targetRateTotal");
const summaryText = document.getElementById("summaryText");
const storageKey = "nippo-chouchou-report";
const gateKey = "nippo-chouchou-gate";

const formatCurrency = (value) => `¥${Number(value || 0).toLocaleString("ja-JP")}`;

const hashCode = async (value) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(value);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
};

const showGate = () => {
  gate.classList.remove("hidden");
  gateCode.focus();
};

const hideGate = () => {
  gate.classList.add("hidden");
  gateCode.value = "";
};

const verifyGate = async (event) => {
  event.preventDefault();
  const code = gateCode.value.trim();
  if (code.length < 4 || code.length > 12) {
    alert("パスコードは4〜12桁で設定してください。");
    return;
  }
  const stored = localStorage.getItem(gateKey);
  const hashed = await hashCode(code);
  if (!stored) {
    localStorage.setItem(gateKey, hashed);
    hideGate();
    return;
  }
  if (stored === hashed) {
    hideGate();
    return;
  }
  alert("パスコードが違います。");
};

const updateSummary = () => {
  const sales = Number(salesInput.value || 0);
  const visitors = Number(visitorsInput.value || 0);
  const avgSpend = visitors > 0 ? Math.round(sales / visitors) : 0;
  const targetRate = targetRateInput.value ? `${targetRateInput.value}%` : "--";

  salesTotal.textContent = formatCurrency(sales);
  visitorsTotal.textContent = `${visitors}`;
  avgSpendTotal.textContent = formatCurrency(avgSpend);
  targetRateTotal.textContent = targetRate;
  visitorTotal.textContent = `${visitors}`;
  averageSpend.textContent = formatCurrency(avgSpend);

  const peak = peakInput.value || "未入力";
  summaryText.textContent = `総売上は${formatCurrency(sales)}、来客数は${visitors}人、客単価は${formatCurrency(avgSpend)}です。ピーク時間帯は「${peak}」。明日の施策に反映しましょう。`;
};

const loadForm = () => {
  const saved = localStorage.getItem(storageKey);
  if (!saved) return;
  const data = JSON.parse(saved);
  Array.from(reportForm.elements).forEach((field) => {
    if (field.name && data[field.name]) {
      field.value = data[field.name];
    }
  });
  if (data.sales) salesInput.value = data.sales;
  if (data.visitors) visitorsInput.value = data.visitors;
  if (data.peak) peakInput.value = data.peak;
  if (data.targetRate) targetRateInput.value = data.targetRate;
  updateSummary();
};

const saveForm = (event) => {
  event.preventDefault();
  if (!saveToggle.checked) {
    alert("保存をオフにしているため、この端末には保存されません。");
    return;
  }
  const formData = new FormData(reportForm);
  const data = Object.fromEntries(formData.entries());
  data.sales = salesInput.value;
  data.visitors = visitorsInput.value;
  data.peak = peakInput.value;
  data.targetRate = targetRateInput.value;
  localStorage.setItem(storageKey, JSON.stringify(data));
  alert("日報を保存しました。お疲れさまでした！");
};

const resetForm = () => {
  reportForm.reset();
  salesInput.value = "";
  visitorsInput.value = "";
  peakInput.value = "";
  targetRateInput.value = "";
  localStorage.removeItem(storageKey);
  updateSummary();
};

const exportReport = () => {
  const formData = new FormData(reportForm);
  const data = Object.fromEntries(formData.entries());
  const payload = {
    ...data,
    sales: Number(salesInput.value || 0),
    visitors: Number(visitorsInput.value || 0),
    peak: peakInput.value,
    targetRate: targetRateInput.value,
    createdAt: new Date().toISOString(),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "nippo-report.json";
  link.click();
  URL.revokeObjectURL(url);
};

reportForm.addEventListener("submit", saveForm);
resetButton.addEventListener("click", resetForm);
exportButton.addEventListener("click", exportReport);
gateForm.addEventListener("submit", verifyGate);
lockButton.addEventListener("click", showGate);
[salesInput, visitorsInput, peakInput, targetRateInput].forEach((input) => {
  input.addEventListener("input", updateSummary);
});

loadForm();
updateSummary();
showGate();
