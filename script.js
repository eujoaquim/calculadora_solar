// 1. Aguarda o carregamento da página
document.addEventListener('DOMContentLoaded', function() {
    // 2. Configura o evento do formulário
    document.getElementById('solarForm').addEventListener('submit', function(e) {
        e.preventDefault(); // Evita recarregar a página
        
        // 3. Coleta todos os dados do formulário
        const dados = {
            cidade: document.getElementById('cidade').value,
            consumo: parseFloat(document.getElementById('consumo').value),
            area: parseFloat(document.getElementById('area').value) || 20, // Valor padrão se vazio
            inclinacao: parseFloat(document.getElementById('inclinacao').value),
            orientacao: parseFloat(document.getElementById('orientacao').value)
        };
        
        // 4. Validação básica
        if (!dados.cidade || !dados.consumo || dados.consumo <= 0) {
            alert('Por favor, preencha pelo menos a cidade e um consumo válido.');
            return;
        }
        
        // 5. Executa o cálculo
        const resultado = calcular(dados);
        
        // 6. Exibe os resultados
        exibirResultado(resultado, dados);
    });
});

// 7. FUNÇÃO PRINCIPAL DE CÁLCULO
function calcular(dados) {
    // Dados de irradiação solar por região (kWh/m²/dia) - valores médios Brasil
    const irradiacaoPorRegiao = {
        'nordeste': 5.5,   // MA, PI, CE, RN, PB, PE, AL, SE, BA
        'norte': 4.8,      // AM, PA, AP, TO, RO, AC, RR
        'centro-oeste': 5.2, // DF, GO, MT, MS
        'sudeste': 4.5,    // SP, RJ, MG, ES
        'sul': 4.2         // PR, SC, RS
    };
    
    // 7.1 Determina região aproximada pela cidade
    const regiao = determinarRegiao(dados.cidade);
    const irradiacao = irradiacaoPorRegiao[regiao] || 4.5; // Padrão 4.5 se não identificar
    
    // 7.2 Parâmetros do sistema
    const eficiencia = 0.18; // 18% - eficiência média dos painéis
    const perdas = 0.14;     // 14% de perdas no sistema (inversor, cabos, etc.)
    const potenciaPainel = 550; // Watts por painel
    
    // 7.3 Ajuste por inclinação e orientação (fatores simplificados)
    const fatorInclinacao = 1 + ((dados.inclinacao - 20) * 0.01); // +1% por grau acima de 20
    const fatorOrientacao = Math.cos(dados.orientacao * Math.PI / 180); // Norte=1, Leste/Oeste=0
    
    // 7.4 Cálculos principais
    
    // a) Potência necessária baseada no consumo
    const consumoDiario = dados.consumo / 30; // kWh/dia
    const potenciaNecessaria = consumoDiario / (irradiacao * fatorInclinacao * Math.max(fatorOrientacao, 0.7) * (1 - perdas));
    
    // b) Área necessária
    const areaNecessaria = potenciaNecessaria / eficiencia;
    
    // c) Painéis necessários
    const paineisNecessarios = Math.ceil((potenciaNecessaria * 1000) / potenciaPainel);
    
    // d) Verifica se área do telhado é suficiente
    const areaSuficiente = dados.area >= areaNecessaria;
    
    // e) Geração mensal estimada
    const geracaoMensal = potenciaNecessaria * irradiacao * fatorInclinacao * Math.max(fatorOrientacao, 0.7) * 30 * (1 - perdas);
    
    // f) Autonomia do sistema (% do consumo que cobre)
    const autonomia = (geracaoMensal / dados.consumo) * 100;
    
    // 8. Retorna todos os resultados
    return {
        potencia: Math.max(potenciaNecessaria, 0.1).toFixed(2), // Mínimo 0.1 kW
        areaNecessaria: Math.max(areaNecessaria, 1).toFixed(1), // Mínimo 1 m²
        paineis: paineisNecessarios,
        geracaoMensal: geracaoMensal.toFixed(0),
        areaSuficiente: areaSuficiente,
        irradiacao: irradiacao,
        regiao: regiao,
        autonomia: autonomia.toFixed(0),
        inclinacao: dados.inclinacao,
        orientacao: dados.orientacao
    };
}

// 9. FUNÇÃO AUXILIAR: Determina região pela cidade (simplificado)
function determinarRegiao(cidade) {
    if (!cidade) return 'sudeste';
    
    cidade = cidade.toLowerCase();
    
    // Nordeste
    if (cidade.includes('salvador') || cidade.includes('fortaleza') || 
        cidade.includes('recife') || cidade.includes('natal') ||
        cidade.includes('joão pessoa') || cidade.includes('maceió') ||
        cidade.includes('aracaju') || cidade.includes('teresina') ||
        cidade.includes('são luís')) {
        return 'nordeste';
    }
    
    // Norte
    if (cidade.includes('manaus') || cidade.includes('belém') ||
        cidade.includes('porto velho') || cidade.includes('rio branco') ||
        cidade.includes('macapá') || cidade.includes('boa vista') ||
        cidade.includes('palmas')) {
        return 'norte';
    }
    
    // Centro-Oeste
    if (cidade.includes('brasília') || cidade.includes('goiânia') ||
        cidade.includes('cuiabá') || cidade.includes('campo grande')) {
        return 'centro-oeste';
    }
    
    // Sul
    if (cidade.includes('porto alegre') || cidade.includes('florianópolis') ||
        cidade.includes('curitiba') || cidade.includes('foz do iguaçu') ||
        cidade.includes('blumenau') || cidade.includes('joinville')) {
        return 'sul';
    }
    
    // Sudeste (padrão)
    return 'sudeste';
}

// 10. FUNÇÃO DE EXIBIÇÃO DOS RESULTADOS
function exibirResultado(resultado, dados) {
    const div = document.getElementById('resultado');
    
    // 10.1 Cabeçalho
    let html = `<h3>📊 Resultado da Simulação</h3>`;
    
    // 10.2 Informações de localização
    html += `<div class="result-item">
                <strong>📍 Localização:</strong> ${dados.cidade}<br>
                <small class="dica">Região: ${resultado.regiao.toUpperCase()} | 
                Irradiação solar: ${resultado.irradiacao} kWh/m²/dia</small>
             </div>`;
    
    // 10.3 Sistema recomendado
    html += `<div class="result-item">
                <strong>💡 Sistema Recomendado:</strong><br>
                • Potência do sistema: <strong>${resultado.potencia} kW</strong><br>
                • Painéis necessários: <strong>${resultado.paineis} unidades</strong> (550W cada)<br>
                • Área necessária: <strong>${resultado.areaNecessaria} m²</strong>
             </div>`;
    
    // 10.4 Análise do telhado
    const statusTelhado = resultado.areaSuficiente ? 'sucesso' : 'alerta';
    const mensagemTelhado = resultado.areaSuficiente 
        ? '✅ Área suficiente para instalação' 
        : `⚠️ Área insuficiente (necessário ${resultado.areaNecessaria} m²)`;
    
    html += `<div class="result-item ${statusTelhado}">
                <strong>🏠 Análise do Telhado:</strong><br>
                • Área disponível: <strong>${dados.area} m²</strong><br>
                • Inclinação: <strong>${dados.inclinacao}°</strong><br>
                • Orientação: <strong>${dados.orientacao}°</strong><br>
                • ${mensagemTelhado}
             </div>`;
    
    // 10.5 Projeção de geração
    html += `<div class="result-item">
                <strong>⚡ Projeção de Geração:</strong><br>
                • Geração mensal: <strong>${resultado.geracaoMensal} kWh</strong><br>
                • Geração anual: <strong>${(resultado.geracaoMensal * 12).toLocaleString()} kWh</strong><br>
                <small class="dica">Cobre aproximadamente <strong>${resultado.autonomia}%</strong> do seu consumo mensal</small>
             </div>`;
    
    // 10.6 Estimativa financeira (bônus)
    const economiaMensal = (resultado.geracaoMensal * 0.75).toFixed(2); // R$ 0,75 por kWh
    const paybackAnos = (15000 / (economiaMensal * 12)).toFixed(1); // Investimento de R$ 15.000
    
    html += `<div class="result-item">
                <strong>💰 Estimativa Financeira:</strong><br>
                • Economia mensal: <strong>R$ ${economiaMensal}</strong><br>
                • Payback aproximado: <strong>${paybackAnos} anos</strong><br>
                <small class="dica">Baseado em investimento médio de R$ 15.000</small>
             </div>`;
    
    // 10.7 Notas técnicas
    html += `<div class="metodologia">
                <strong>📝 Notas Técnicas:</strong><br>
                • Eficiência considerada: 18%<br>
                • Perdas do sistema: 14%<br>
                • <em>Cálculo acadêmico simplificado - para fins didáticos</em>
             </div>`;
    
    // 10.8 Atualiza a página
    div.innerHTML = html;
}

// 11. FUNÇÃO PARA PREENCHIMENTO AUTOMÁTICO (OPCIONAL - para testes)
function preencherExemplo() {
    document.getElementById('cidade').value = 'São Paulo, SP';
    document.getElementById('consumo').value = 300;
    document.getElementById('area').value = 25;
    // Os selects já têm valores padrão
}

// 12. Executa exemplo ao carregar (OPCIONAL - remova se não quiser)
// window.onload = preencherExemplo;
