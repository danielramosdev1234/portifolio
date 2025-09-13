import React, { useState, useEffect } from 'react';
import './CompoundCalculator.css';

const CompoundCalculator = () => {
  const [montante, setMontante] = useState('');
  const [aporte, setAporte] = useState('');
  const [taxa, setTaxa] = useState('');
  const [taxaAno, setTaxaAno] = useState('');
  const [prazo, setPrazo] = useState('');
  const [prazoAno, setPrazoAno] = useState('');
  const [ateVencer, setAteVencer] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState({
    apIn: 0,
    apOut: 0,
    apJu: 0,
    apTot: 0,
    detailedRows: []
  });

  // Formatador de números para formato brasileiro
  const formatToBRL = (number) => {
    const n = parseFloat(number) || 0;
    return n.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Conversão da taxa anual para mensal
  useEffect(() => {
    if (taxaAno) {
      const taxaAnual = parseFloat(taxaAno);
      const taxaMensal = ((Math.pow((taxaAnual / 100 + 1), (1 / 12)) - 1) * 100);
      setTaxa(taxaMensal);
    }
  }, [taxaAno]);

  // Conversão do prazo
  useEffect(() => {
    if (prazoAno) {
      const prazoMeses = parseFloat(prazoAno) * 12;
      setPrazo(prazoMeses);
    } else if (ateVencer) {
      const compDateParse = Date.parse(ateVencer);
      const currentDate = new Date();
      const currentParse = Date.parse(currentDate);
      const daysDiff = (compDateParse - currentParse) / (1000 * 60 * 60 * 24 * 30);
      setPrazo(daysDiff);
    }
  }, [prazoAno, ateVencer]);

  const handleCalculate = () => {
    const valorInicial = parseFloat(montante) || 0;
    const aporteValue = parseFloat(aporte) || 0;
    const prazoValue = parseFloat(prazo) || 0;
    const taxaValue = parseFloat(taxa) / 100 || 0;

    if (!valorInicial || !prazoValue || !taxaValue) {
      alert('Por favor, preencha todos os campos obrigatórios: Valor Inicial, Taxa e Prazo');
      return;
    }

    // Cálculo Mensal
    let acuPush = valorInicial;
    let detailedRows = [];

    // Primeira linha (mês 0)
    detailedRows.push({
      mes: 0,
      aportes: formatToBRL(valorInicial),
      jurosNoMes: formatToBRL(0),
      jurosTotal: formatToBRL(0),
      acumulado: formatToBRL(valorInicial)
    });

    let aportePush = valorInicial;
    let jurosPush = 0;

    for (let i = 1; i <= prazoValue; i++) {
      // Aplica juros sobre o valor acumulado
      const tempJuros = Math.floor((acuPush * taxaValue) * 100) / 100;
      acuPush = Math.floor((acuPush + tempJuros + aporteValue) * 100) / 100;

      // Calcula acumulado de aportes
      aportePush = valorInicial + aporteValue * i;

      // Calcula os juros acumulados
      jurosPush = Math.floor((acuPush - aportePush) * 100) / 100;

      // Adiciona linha à tabela detalhada
      detailedRows.push({
        mes: i,
        aportes: formatToBRL(aportePush),
        jurosNoMes: formatToBRL(tempJuros),
        jurosTotal: formatToBRL(jurosPush),
        acumulado: formatToBRL(acuPush)
      });
    }

    // Define os resultados
    setResults({
      apIn: valorInicial,
      apOut: valorInicial + aporteValue * prazoValue,
      apJu: jurosPush,
      apTot: acuPush,
      detailedRows: detailedRows
    });

    setShowResults(true);
  };

  const handleReset = () => {
    setMontante('');
    setAporte('');
    setTaxa('');
    setTaxaAno('');
    setPrazo('');
    setPrazoAno('');
    setAteVencer('');
    setShowResults(false);
    setResults({
      apIn: 0,
      apOut: 0,
      apJu: 0,
      apTot: 0,
      detailedRows: []
    });
  };

  return (
    <div className="compound-calculator">
      <div className="calculator-header">
        <div className="page-info">
          <h1 className="page-title">📊 Calculadora de Juros Compostos</h1>
          <p className="page-subtitle">Calcule o crescimento do seu investimento ao longo do tempo</p>
        </div>
      </div>

      {/* Formulário */}
      <section className="calculator-form-section">
        <div className="section-header">
          <h2 className="section-title">💰 Dados do Investimento</h2>
        </div>

        <div className="form-grid">
          <div className="form-row">
            <div className="input-group">
              <label>Valor Inicial (R$)</label>
              <input
                type="number"
                placeholder="Ex: 1000"
                value={montante}
                onChange={(e) => setMontante(e.target.value)}
                className="form-input"
              />
            </div>
            <div className="input-group">
              <label>Aporte Mensal (R$)</label>
              <input
                type="number"
                placeholder="Ex: 100 (opcional)"
                value={aporte}
                onChange={(e) => setAporte(e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-section">
            <div className="section-subtitle">📈 Taxa de Juros</div>
            <div className="form-row">
              <div className="input-group">
                <label>Taxa Mensal (%)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Ex: 0.5"
                  value={taxa}
                  onChange={(e) => setTaxa(e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="input-group">
                <label>Ou Taxa Anual (%)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Ex: 6.17 (converte automaticamente)"
                  value={taxaAno}
                  onChange={(e) => setTaxaAno(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="section-subtitle">⏰ Período</div>
            <div className="form-row">
              <div className="input-group">
                <label>Prazo em Meses</label>
                <input
                  type="number"
                  placeholder="Ex: 12"
                  value={prazo}
                  onChange={(e) => setPrazo(e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="input-group">
                <label>Ou em Anos</label>
                <input
                  type="number"
                  placeholder="Ex: 1 (converte automaticamente)"
                  value={prazoAno}
                  onChange={(e) => setPrazoAno(e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="input-group">
                <label>Ou até Data Específica</label>
                <input
                  type="date"
                  value={ateVencer}
                  onChange={(e) => setAteVencer(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button onClick={handleCalculate} className="btn btn-primary">
              🧮 Calcular Juros
            </button>
            <button onClick={handleReset} className="btn btn-secondary">
              🔄 Limpar Campos
            </button>
          </div>
        </div>
      </section>

      {/* Resultados */}
      {showResults && (
        <>
          <section className="results-summary-section">
            <div className="section-header">
              <h2 className="section-title">📊 Resumo dos Resultados</h2>
            </div>

            <div className="results-grid">
              <div className="result-card result-card-blue">
                <div className="result-icon">💸</div>
                <div className="result-content">
                  <div className="result-value">R$ {formatToBRL(results.apIn)}</div>
                  <div className="result-label">Valor Inicial</div>
                </div>
              </div>

              <div className="result-card result-card-green">
                <div className="result-icon">💰</div>
                <div className="result-content">
                  <div className="result-value">R$ {formatToBRL(results.apOut)}</div>
                  <div className="result-label">Total Investido</div>
                </div>
              </div>

              <div className="result-card result-card-purple">
                <div className="result-icon">📈</div>
                <div className="result-content">
                  <div className="result-value">R$ {formatToBRL(results.apJu)}</div>
                  <div className="result-label">Juros Ganhos</div>
                </div>
              </div>

              <div className="result-card result-card-success">
                <div className="result-icon">🎯</div>
                <div className="result-content">
                  <div className="result-value">R$ {formatToBRL(results.apTot)}</div>
                  <div className="result-label">Valor Final</div>
                </div>
              </div>
            </div>
          </section>

          <section className="detailed-results-section">
            <div className="section-header">
              <h2 className="section-title">📋 Evolução Mensal</h2>
            </div>

            <div className="table-container">
              <table className="results-table">
                <thead>
                  <tr>
                    <th>Mês</th>
                    <th>Aportes Acumulados</th>
                    <th>Juros do Mês</th>
                    <th>Juros Acumulados</th>
                    <th>Saldo Total</th>
                  </tr>
                </thead>
                <tbody>
                  {results.detailedRows.map((row, index) => (
                    <tr key={index}>
                      <td>{row.mes}</td>
                      <td>R$ {row.aportes}</td>
                      <td>R$ {row.jurosNoMes}</td>
                      <td>R$ {row.jurosTotal}</td>
                      <td className="highlight">R$ {row.acumulado}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default CompoundCalculator;