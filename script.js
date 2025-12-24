document.getElementById('solarForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const cidade = document.getElementById('cidade').value;
    const consumo = document.getElementById('consumo').value;
    
  function calcular(dados) {
    // Dados de irradiação solar por região (kWh/m²/dia)
    const irradiacaoPorRegiao = {
        'nordeste': 5.5,
        'norte': 4.8,
        'centro-oeste': 5.2,
        'sudeste': 4.5,
        'sul': 4.2
    };
    
    // Determina região aproximada pela cidade
    const regiao = determinarRegiao(dados.cidade);
    const irradiacao = irradiacaoPorRegiao[regiao] || 4.5;
    
    // Cálculos principais
    const eficiencia = 0.18; // 18% - eficiência média dos painéis
    const perdas = 0.14; // 14% de perdas no sistema
    
    // 1. Potência necessária baseada no consumo
    const consumoDiario = dados.consumo / 30;
    const potenciaNecessaria = consumoDiario / (irradiacao * (1 - perdas));
    
    // 2. Área necessária
    const areaNecessaria = potenciaNecessaria / eficiencia;
    
    // 3. Painéis necessários (considerando painél de 550W)
    const paineisNecessarios = Math.ceil((potenciaNecessaria * 1000) / 550);
    
    // 4. Verifica se área do telhado é suficiente
    const areaSuficiente = dados.area >= areaNecessaria;
    
    return {
        potencia: potenciaNecessaria.toFixed(2),
        areaNecessaria: areaNecessaria.toFixed(1),
        paineis: paineisNecessarios,
        geracaoMensal: (potenciaNecessaria * irradiacao * 30 * (1 - perdas)).toFixed(0),
        areaSuficiente: areaSuficiente,
        irradiacao: irradiacao
    };
}

// Função auxiliar para determinar região (simplificada)
function determinarRegiao(cidade) {
    cidade = cidade.toLowerCase();
    if (cidade.includes('salvador') || cidade.includes('fortaleza')) return 'nordeste';
    if (cidade.includes('manaus') || cidade.includes('belém')) return 'norte';
    if (cidade.includes('brasília') || cidade.includes('goiânia')) return 'centro-oeste';
    if (cidade.includes('são paulo') || cidade.includes('rio')) return 'sudeste';
    if (cidade.includes('porto alegre') || cidade.includes('florianópolis')) return 'sul';
    return 'sudeste'; // padrão
}
