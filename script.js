document.getElementById('solarForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const cidade = document.getElementById('cidade').value;
    const consumo = document.getElementById('consumo').value;
    
    // Cálculo SIMPLIFICADO para demonstração
    const potencia = (consumo / 150).toFixed(1);
    const economia = (consumo * 0.8).toFixed(0);
    
    document.getElementById('resultado').innerHTML = `
        <h3>Resultado para ${cidade}:</h3>
        <p><strong>Sistema recomendado:</strong> ${potencia} kW</p>
        <p><strong>Geração mensal estimada:</strong> ${economia} kWh</p>
        <p><em>Cálculo acadêmico simplificado - para demonstração</em></p>
    `;
});
