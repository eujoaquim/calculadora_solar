console.log("SCRIPT JS CARREGADO");

document.getElementById("formSolar").addEventListener("submit", async function (e) {
    e.preventDefault();

    const lat = document.getElementById("latitude").value;
    const lon = document.getElementById("longitude").value;
    const consumo = Number(document.getElementById("consumo").value);
    const area = Number(document.getElementById("area").value);
    const inclinacao = document.getElementById("inclinacao").value;
    const orientacao = document.getElementById("orientacao").value;

    const resultadoDiv = document.getElementById("resultado");

    // Área -> potência (kWp)
    const potencia = area / 6;

    // Orientação -> azimute PVGIS
    let azimute = 0;
    if (orientacao === "norte") azimute = 180;
    if (orientacao === "leste") azimute = -90;
    if (orientacao === "oeste") azimute = 90;
    if (orientacao === "sul") azimute = 0;

    resultadoDiv.innerHTML = "Consultando dados reais do PVGIS...";

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
        if (!response.ok) throw new Error("Falha na API");

        const data = await response.json();

        // Forma MAIS estável de obter produção anual
        const anual = data?.outputs?.totals?.fixed?.E_y;

        if (!anual) {
            throw new Error("Resposta inesperada do PVGIS");
        }

        const mensal = anual / 12;
        const cobertura = (mensal / consumo) * 100;

        resultadoDiv.innerHTML = `
            <strong>Potência estimada:</strong> ${potencia.toFixed(2)} kWp<br>
            <strong>Geração média mensal:</strong> ${mensal.toFixed(1)} kWh<br>
            <strong>Consumo informado:</strong> ${consumo} kWh/mês<br>
            <strong>Cobertura do consumo:</strong> ${cobertura.toFixed(1)}%<br><br>
            <em>Dados reais do PVGIS (Comissão Europeia).</em>
        `;
    } catch (erro) {
        console.error("Erro PVGIS:", erro);
        resultadoDiv.innerHTML =
            "Erro ao consultar o PVGIS. Veja o console para detalhes.";
    }
});
