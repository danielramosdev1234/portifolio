import React, { useState, useEffect } from 'react';
import './CompoundCalculator.css';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const CompoundCalculator = () => {
  const [montante, setMontante] = useState('');
  const [aporte, setAporte] = useState('');
  const [taxa, setTaxa] = useState('');
  const [taxaAno, setTaxaAno] = useState('');
  const [prazo, setPrazo] = useState('');
  const [prazoAno, setPrazoAno] = useState('');
  const [ateVencer, setAteVencer] = useState('');
  const [ipca, setIpca] = useState('');
  const [selic, setSelic] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState({
    apIn: 0,
    apOut: 0,
    apJu: 0,
    apTot: 0,
    finalIpca: 0,
    finalSelic: 0,
    detailedRows: []
  });

  const formatToBRL = (number) => {
    const n = parseFloat(number) || 0;
    return n.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  useEffect(() => {
    if (taxaAno) {
      const taxaAnual = parseFloat(taxaAno);
      const taxaMensal = ((Math.pow((taxaAnual / 100 + 1), (1 / 12)) - 1) * 100);
      setTaxa(taxaMensal);
    }
  }, [taxaAno]);

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
    const ipcaValue = parseFloat(ipca) / 100 || 0;
    const selicValue = parseFloat(selic) / 100 || 0;

    const ipcaMensal = Math.pow(1 + ipcaValue, 1/12) - 1;
    const selicMensal = Math.pow(1 + selicValue, 1/12) - 1;

    if (!valorInicial || !prazoValue || (!taxaValue && !ipcaValue && !selicValue)) {
      alert('Preencha: Valor Inicial, Taxa, IPCA ou SELIC e o Prazo');
      return;
    }

    // Simulação padrão (taxa informada)
    let acuTaxa = valorInicial;
    let jurosTaxa = 0;

    // Simulação IPCA
    let acuIpca = valorInicial;
    let jurosIpca = 0;

    // Simulação SELIC
    let acuSelic = valorInicial;
    let jurosSelic = 0;

    let detailedRows = [];

    detailedRows.push({
      mes: 0,
      aportes: formatToBRL(valorInicial),
      jurosNoMes: formatToBRL(0),
      jurosTotal: formatToBRL(0),
      acumulado: formatToBRL(valorInicial),
      corrigidoIpca: formatToBRL(valorInicial),
      comSelic: formatToBRL(valorInicial),
      // valores numéricos para o gráfico
        acumuladoNum: acuTaxa,
        ipcaNum: acuIpca,
        selicNum: acuSelic
    });

    for (let i = 1; i <= prazoValue; i++) {
      const aporteAcumulado = valorInicial + aporteValue * i;

      // --- Taxa informada
      const tempJurosTaxa = acuTaxa * taxaValue;
      acuTaxa = acuTaxa + tempJurosTaxa + aporteValue;
      jurosTaxa = acuTaxa - aporteAcumulado;

      // --- IPCA
      const tempJurosIpca = acuIpca * ipcaMensal;
      acuIpca = acuIpca + tempJurosIpca + aporteValue;
      jurosIpca = acuIpca - aporteAcumulado;

      // --- SELIC
      const tempJurosSelic = acuSelic * selicMensal;
      acuSelic = acuSelic + tempJurosSelic + aporteValue;
      jurosSelic = acuSelic - aporteAcumulado;

        console.log(detailedRows);

      // --- Adiciona linha detalhada
      detailedRows.push({
        mes: i,
        aportes: formatToBRL(aporteAcumulado),
        jurosNoMes: formatToBRL(tempJurosTaxa),
        jurosTotal: formatToBRL(jurosTaxa),
        acumulado: formatToBRL(acuTaxa),
        corrigidoIpca: formatToBRL(acuIpca),
        comSelic: formatToBRL(acuSelic),
        acumuladoNum: acuTaxa,
          ipcaNum: acuIpca,
          selicNum: acuSelic
      });
  console.log(detailedRows);


    }

    setResults({
      apIn: valorInicial,
      apOut: valorInicial + aporteValue * prazoValue,
      apJu: jurosTaxa,
      apTot: acuTaxa,
      finalIpca: acuIpca,
      finalSelic: acuSelic,
      detailedRows
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
    setIpca('');
    setSelic('');
    setShowResults(false);
    setResults({
      apIn: 0,
      apOut: 0,
      apJu: 0,
      apTot: 0,
      finalIpca: 0,
      finalSelic: 0,
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
            <div className="section-subtitle">📈 Taxas</div>
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
                  placeholder="Ex: 6.17"
                  value={taxaAno}
                  onChange={(e) => setTaxaAno(e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="input-group">
                <label>IPCA Anual (%)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Ex: 4.5"
                  value={ipca}
                  onChange={(e) => setIpca(e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="input-group">
                <label>SELIC Anual (%)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Ex: 13.75"
                  value={selic}
                  onChange={(e) => setSelic(e.target.value)}
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
                  placeholder="Ex: 1"
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

              <div className="result-card result-card-green">
                <div className="result-icon">📉</div>
                <div className="result-content">
                  <div className="result-value">R$ {formatToBRL(results.finalIpca)}</div>
                  <div className="result-label">Valor Real (corrigido IPCA)</div>
                </div>
              </div>

              <div className="result-card result-card-purple">
                <div className="result-icon">🏦</div>
                <div className="result-content">
                  <div className="result-value">R$ {formatToBRL(results.finalSelic)}</div>
                  <div className="result-label">Valor com SELIC</div>
                </div>
              </div>
            </div>
          </section>
          <section className="results-chart-section">
            <div className="section-header">
              <h2 className="section-title">📉 Evolução Gráfica</h2>
            </div>

            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={results.detailedRows}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip formatter={(value) =>
                  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
                } />
                <Legend />
                <Line type="monotone" dataKey="acumuladoNum" stroke="#667eea" name="Taxa Informada" dot={false} />
                <Line type="monotone" dataKey="ipcaNum" stroke="#48bb78" name="IPCA" dot={false} />
                <Line type="monotone" dataKey="selicNum" stroke="#9f7aea" name="SELIC" dot={false} />
              </LineChart>
            </ResponsiveContainer>
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
                              <th>Corrigido IPCA</th>
                              <th>Projeção SELIC</th>
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
                                <td>R$ {row.corrigidoIpca}</td>
                                <td>R$ {row.comSelic}</td>
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
