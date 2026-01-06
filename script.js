const url =
  "https://pvgis-proxy.yumenosakiko49.workers.dev" +
  `?lat=${lat}` +
  `&lon=${lon}` +
  `&peakpower=${potencia}` +
  `&loss=20` +
  `&angle=${inclinacao}` +
  `&aspect=${azimute}`;

// Confirma que o JavaScript está carregando
console.log("SCRIPT JS CARREGADO");

// Garante que o DOM está pronto antes de acessar elementos
document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("formSolar");
    const resultadoDiv = document.getElementById("resultado");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Captura dos valores do formulário
        const lat = document.getElementById("latitude").value;
        const lon = document.getElementById("longitude").value;
        const consumo = Number(document.getElementById("consumo").value);
        const area = Number(document.getElementById("area").value);
        const inclinacao = document.getElementById("inclinacao").value;
        const orientacao = document.getElementById("orientacao").value;

        // Conversão área -> potência instalada (kWp)
        // Regra prática: ~6 m² por kWp
        const potencia = area / 6;

        // Conversão da orientação para azimute no padrão PVGIS
        let azimute = 0;
        if (orientacao === "norte") azimute = 180;
        if (orientacao === "leste") azimute = -90;
        if (orientacao === "oeste") azimute = 90;
        if (orientacao === "sul") azimute = 0;

        resultadoDiv.innerHTML = "Consultando dados reais do PVGIS...";

        // Endpoint CORRETO para uso em frontend
        const url =
            "https://re.jrc.ec.europa.eu/api/v5_2/seriescalc" +
            `?lat=${lat}` +
            `&lon=${lon}` +
            `&peakpower=${potencia}` +
            `&loss=20` +
            `&angle=${inclinacao}` +
            `&aspect=${azimute}` +
            `&outputformat=json`;

        try {
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error("Falha ao acessar o PVGIS");
            }

            const data = await response.json();

            // Forma MAIS estável de obter produção anual (kWh/ano)
            const producaoAnual = data?.outputs?.totals?.fixed?.E_y;

            if (!producaoAnual) {
                throw new Error("Resposta inesperada do PVGIS");
            }

            // Conversão para média mensal
            const producaoMensal = producaoAnual / 12;

            // Percentual de cobertura do consumo
            const cobertura = (producaoMensal / consumo) * 100;

            // Exibição do resultado
            resultadoDiv.innerHTML = `
                <strong>Potência estimada do sistema:</strong> ${potencia.toFixed(2)} kWp<br>
                <strong>Geração média mensal:</strong> ${producaoMensal.toFixed(1)} kWh<br>
                <strong>Consumo informado:</strong> ${consumo} kWh/mês<br>
                <strong>Cobertura do consumo:</strong> ${cobertura.toFixed(1)}%<br><br>
                <em>Dados reais obtidos do PVGIS (Comissão Europeia).</em>
            `;

        } catch (erro) {
            console.error("Erro ao consultar o PVGIS:", erro);
            resultadoDiv.innerHTML =
                "Erro ao consultar o PVGIS. Verifique os dados ou veja o console.";
        }
    });
});
