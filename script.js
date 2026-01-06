// Confirma que o JS carregou
console.log("SCRIPT JS CARREGADO");

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("formSolar");
    const resultadoDiv = document.getElementById("resultado");

    if (!form || !resultadoDiv) {
        console.error("Formulário ou div de resultado não encontrados");
        return;
    }

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Captura dos valores
        const lat = document.getElementById("latitude").value;
        const lon = document.getElementById("longitude").value;
        const consumo = Number(document.getElementById("consumo").value);
        const area = Number(document.getElementById("area").value);
        const inclinacao = document.getElementById("inclinacao").value;
        const orientacao = document.getElementById("orientacao").value;

        console.log("FORM DATA:", {
            lat, lon, consumo, area, inclinacao, orientacao
        });

        // Regra prática: 6 m² ≈ 1 kWp
        const potencia = area / 6;

        // Conversão orientação → azimute (padrão PVGIS)
        let azimute = 0;
        if (orientacao === "norte") azimute = 180;
        if (orientacao === "leste") azimute = -90;
        if (orientacao === "oeste") azimute = 90;
        if (orientacao === "sul") azimute = 0;

        resultadoDiv.innerHTML = "⏳ Consultando dados reais do PVGIS...";

        // URL do proxy (CORS resolvido)
        const url =
            "https://pvgis-proxy.yumenosakiko49.workers.dev" +
            `?lat=${lat}` +
            `&lon=${lon}` +
            `&peakpower=${potencia}` +
            `&loss=20` +
            `&angle=${inclinacao}` +
            `&aspect=${azimute}`;

        console.log("FETCH URL:", url);

        try {
            const response = await fetch(url);
            console.log("RESPONSE STATUS:", response.status);

            if (!response.ok) {
                throw new Error("Falha na resposta do proxy");
            }

            const data = await response.json();
            console.log("PVGIS RESPONSE:", data);

            // >>> PONTO CRÍTICO CORRETO <<<
            // seriescalc retorna PRODUÇÃO MENSAL
            const meses = data?.outputs?.series?.[0]?.month;

            if (!Array.isArray(meses)) {
                console.error("Resposta inesperada do PVGIS:", data);
                throw new Error("Dados mensais não encontrados");
            }

            // Soma dos 12 meses
            const producaoAnual = meses.reduce((total, v) => total + v, 0);
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
                "❌ Erro ao calcular. Abra o console (F12) para ver detalhes.";
        }
    });
});
