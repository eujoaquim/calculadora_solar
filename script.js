console.log("SCRIPT JS CARREGADO");

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formSolar");
  const resultadoDiv = document.getElementById("resultado");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const lat = document.getElementById("latitude").value;
    const lon = document.getElementById("longitude").value;
    const consumo = Number(document.getElementById("consumo").value);
    const area = Number(document.getElementById("area").value);
    const inclinacao = document.getElementById("inclinacao").value;
    const orientacao = document.getElementById("orientacao").value;

    // Regra prática: 6 m² ≈ 1 kWp
    const potencia = area / 6;

    let azimute = 0;
    if (orientacao === "norte") azimute = 180;
    if (orientacao === "leste") azimute = -90;
    if (orientacao === "oeste") azimute = 90;
    if (orientacao === "sul") azimute = 0;

    resultadoDiv.innerHTML = "⏳ Consultando dados reais do PVGIS...";

    const url =
      "https://pvgis-proxy.yumenosakiko49.workers.dev" +
      `?lat=${lat}` +
      `&lon=${lon}` +
      `&peakpower=${potencia}` +
      `&loss=20` +
      `&angle=${inclinacao}` +
      `&aspect=${azimute}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      console.log("PVGIS RESPONSE:", data);

      // ✅ CAMINHO CORRETO (confirmado pelo JSON)
      const producaoAnual = data.outputs.totals.fixed.E_y;

      const producaoMensal = producaoAnual / 12;
      const cobertura = (producaoMensal / consumo) * 100;

      resultadoDiv.innerHTML = `
        <strong>Potência estimada:</strong> ${potencia.toFixed(2)} kWp<br>
        <strong>Geração média mensal:</strong> ${producaoMensal.toFixed(1)} kWh<br>
        <strong>Consumo informado:</strong> ${consumo} kWh/mês<br>
        <strong>Cobertura do consumo:</strong> ${cobertura.toFixed(1)}%<br><br>
        <em>Dados reais do PVGIS (Comissão Europeia).</em>
      `;
    } catch (err) {
      console.error("ERRO FINAL:", err);
      resultadoDiv.innerHTML =
        "❌ Erro ao calcular. Verifique o console.";
    }
  });
});
