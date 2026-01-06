console.log("SCRIPT JS CARREGADO");
document.getElementById("formSolar").addEventListener("submit", async function (e) {
    e.preventDefault();

    const lat = document.getElementById("latitude").value;
    const lon = document.getElementById("longitude").value;
    const consumo = Number(document.getElementById("consumo").value);
    const area = Number(document.getElementById("area").value);
    const inclinacao = document.getElementById("inclinacao").value;
    const orientacao = document.getElementById("orientacao").value;

    // Conversão área -> potência instalada (kWp)
    const potencia = area / 6;

    // Conversão de orientação para azimute PVGIS
    let azimute = 0;
    if (orientacao === "norte") azimute = 180;
    if (orientacao === "leste") azimute = -90;
    if (orientacao === "oeste") azimute = 90;
    if (orientacao === "sul") azimute = 0;

    // Montagem da URL da API PVGIS
    const url = `
https://re.jrc.ec.europa.eu/api/v5_2/PVcalc
?lat=${lat}
&lon=${lon}
&peakpower=${potencia}
&loss=20
&angle=${inclinacao}
&aspect=${azimute}
&outputformat=json
`.replace(/\s/g, "");

    const resultadoDiv = document.getElementById("resultado");
    resultadoDiv.innerHTML = "Calculando com dados reais do PVGIS...";

    try {
        const response = await fetch(url);
        const data = await response.json();

        // Produção anual estimada (kWh)
        const producaoAnual = data.outputs.totals.fixed.E_y;

        // Conversão para mensal
        const producaoMensal = producaoAnual / 12;

        const cobertura = (producaoMensal / consumo) * 100;

        resultadoDiv.innerHTML = `
            <strong>Potência estimada do sistema:</strong> ${potencia.toFixed(2)} kWp<br>
            <strong>Geração média mensal:</strong> ${producaoMensal.toFixed(1)} kWh<br>
            <strong>Consumo informado:</strong> ${consumo} kWh/mês<br>
            <strong>Cobertura do consumo:</strong> ${cobertura.toFixed(1)}%<br><br>

            <em>Dados reais obtidos do PVGIS (Comissão Europeia).</em>
        `;
    } catch (erro) {
        resultadoDiv.innerHTML = "Erro ao consultar o PVGIS. Verifique os dados.";
        console.error(erro);
    }
});
