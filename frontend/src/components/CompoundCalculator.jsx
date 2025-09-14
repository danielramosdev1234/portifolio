import React, { useState, useEffect } from 'react';
import './CompoundCalculator.css';
import { useLanguage } from './LanguageContext';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const CompoundCalculator = () => {
  const { texts, formatCurrency, formatNumber, isPortuguese } = useLanguage();

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

  // Função para formatar como moeda usando o contexto
  const formatCurrencyInput = (value) => {
    const numericValue = value.replace(/\D/g, '');
    if (!numericValue) return '';
    const number = parseFloat(numericValue) / 100;
    return formatCurrency(number);
  };

  // Função para converter moeda formatada para número
  const parseCurrencyToNumber = (value) => {
    if (!value) return 0;
    if (isPortuguese) {
      const numericString = value
        .replace(/R\$\s?/g, '')
        .replace(/\./g, '')
        .replace(',', '.');
      return parseFloat(numericString) || 0;
    } else {
      const numericString = value
        .replace(/\$\s?/g, '')
        .replace(/,/g, '');
      return parseFloat(numericString) || 0;
    }
  };

  // Handlers para os campos monetários
  const handleMontanteChange = (e) => {
    const formatted = formatCurrencyInput(e.target.value);
    setMontante(formatted);
  };

  const handleAporteChange = (e) => {
    const formatted = formatCurrencyInput(e.target.value);
    setAporte(formatted);
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
    const valorInicial = parseCurrencyToNumber(montante);
    const aporteValue = parseCurrencyToNumber(aporte);
    const prazoValue = parseFloat(prazo) || 0;
    const taxaValue = parseFloat(taxa) / 100 || 0;
    const ipcaValue = parseFloat(ipca) / 100 || 0;
    const selicValue = parseFloat(selic) / 100 || 0;

    const ipcaMensal = Math.pow(1 + ipcaValue, 1/12) - 1;
    const selicMensal = Math.pow(1 + selicValue, 1/12) - 1;

    const requiredFieldsText = isPortuguese
      ? 'Preencha: Valor Inicial, Taxa, IPCA ou SELIC e o Prazo'
      : 'Fill in: Initial Value, Rate, IPCA or SELIC and Term';

    if (!valorInicial || !prazoValue || (!taxaValue && !ipcaValue && !selicValue)) {
      alert(requiredFieldsText);
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
      aportes: formatNumber(valorInicial),
      jurosNoMes: formatNumber(0),
      jurosTotal: formatNumber(0),
      acumulado: formatNumber(valorInicial),
      corrigidoIpca: formatNumber(valorInicial),
      comSelic: formatNumber(valorInicial),
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

      // --- Adiciona linha detalhada
      detailedRows.push({
        mes: i,
        aportes: formatNumber(aporteAcumulado),
        jurosNoMes: formatNumber(tempJurosTaxa),
        jurosTotal: formatNumber(jurosTaxa),
        acumulado: formatNumber(acuTaxa),
        corrigidoIpca: formatNumber(acuIpca),
        comSelic: formatNumber(acuSelic),
        acumuladoNum: acuTaxa,
        ipcaNum: acuIpca,
        selicNum: acuSelic
      });
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
          <h1 className="page-title">{texts.compoundTitle}</h1>
          <p className="page-subtitle">{texts.compoundSubtitle}</p>
        </div>
      </div>

      <section className="calculator-form-section">
        <div className="section-header">
          <h2 className="section-title">{texts.investmentData}</h2>
        </div>

        <div className="form-grid">
          <div className="form-row">
            <div className="input-group">
              <label>{texts.initialValue}</label>
              <input
                type="text"
                placeholder={texts.placeholderMoney}
                value={montante}
                onChange={handleMontanteChange}
                className="form-input"
              />
            </div>
            <div className="input-group">
              <label>{texts.monthlyContribution}</label>
              <input
                type="text"
                placeholder={texts.placeholderOptional}
                value={aporte}
                onChange={handleAporteChange}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-section">
            <div className="section-subtitle">📈 {isPortuguese ? 'Taxas' : 'Rates'}</div>
            <div className="form-row">
              <div className="input-group">
                <label>{texts.monthlyRate}</label>
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
                <label>{texts.annualRate}</label>
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
                <label>{texts.ipca}</label>
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
                <label>{texts.selic}</label>
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
            <div className="section-subtitle">{texts.period}</div>
            <div className="form-row">
              <div className="input-group">
                <label>{texts.months}</label>
                <input
                  type="number"
                  placeholder="Ex: 12"
                  value={prazo}
                  onChange={(e) => setPrazo(e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="input-group">
                <label>{texts.years}</label>
                <input
                  type="number"
                  placeholder="Ex: 1"
                  value={prazoAno}
                  onChange={(e) => setPrazoAno(e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="input-group">
                <label>{texts.specificDate}</label>
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
              {texts.calculate}
            </button>
            <button onClick={handleReset} className="btn btn-secondary">
              {texts.clear}
            </button>
          </div>
        </div>
      </section>

      {showResults && (
        <>
          <section className="results-summary-section">
            <div className="section-header">
              <h2 className="section-title">{texts.resultsTitle}</h2>
            </div>

            <div className="results-grid">
              <div className="result-card result-card-blue">
                <div className="result-icon">💸</div>
                <div className="result-content">
                  <div className="result-value">{formatCurrency(results.apIn)}</div>
                  <div className="result-label">{texts.initialAmount}</div>
                </div>
              </div>

              <div className="result-card result-card-green">
                <div className="result-icon">💰</div>
                <div className="result-content">
                  <div className="result-value">{formatCurrency(results.apOut)}</div>
                  <div className="result-label">{texts.totalInvested}</div>
                </div>
              </div>

              <div className="result-card result-card-purple">
                <div className="result-icon">📈</div>
                <div className="result-content">
                  <div className="result-value">{formatCurrency(results.apJu)}</div>
                  <div className="result-label">{texts.interestEarned}</div>
                </div>
              </div>

              <div className="result-card result-card-success">
                <div className="result-icon">🎯</div>
                <div className="result-content">
                  <div className="result-value">{formatCurrency(results.apTot)}</div>
                  <div className="result-label">{texts.finalValue}</div>
                </div>
              </div>

              <div className="result-card result-card-green">
                <div className="result-icon">📉</div>
                <div className="result-content">
                  <div className="result-value">{formatCurrency(results.finalIpca)}</div>
                  <div className="result-label">{texts.realValue}</div>
                </div>
              </div>

              <div className="result-card result-card-purple">
                <div className="result-icon">🏦</div>
                <div className="result-content">
                  <div className="result-value">{formatCurrency(results.finalSelic)}</div>
                  <div className="result-label">{texts.selicValue}</div>
                </div>
              </div>
            </div>
          </section>

          <section className="results-chart-section">
            <div className="section-header">
              <h2 className="section-title">{texts.chartTitle}</h2>
            </div>

            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={results.detailedRows}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="acumuladoNum"
                  stroke="#667eea"
                  name={isPortuguese ? "Taxa Informada" : "Informed Rate"}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="ipcaNum"
                  stroke="#48bb78"
                  name="IPCA"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="selicNum"
                  stroke="#9f7aea"
                  name="SELIC"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </section>

          <section className="detailed-results-section">
            <div className="section-header">
              <h2 className="section-title">{texts.monthlyEvolution}</h2>
            </div>

            <div className="table-container">
              <table className="results-table">
                <thead>
                  <tr>
                    <th>{texts.month}</th>
                    <th>{texts.accumulatedContributions}</th>
                    <th>{texts.monthlyInterest}</th>
                    <th>{texts.totalInterest}</th>
                    <th>{texts.totalBalance}</th>
                    <th>{texts.ipcaCorrected}</th>
                    <th>{texts.selicProjection}</th>
                  </tr>
                </thead>
                <tbody>
                  {results.detailedRows.map((row, index) => (
                    <tr key={index}>
                      <td>{row.mes}</td>
                      <td>{formatCurrency(parseCurrencyToNumber(row.aportes))}</td>
                      <td>{formatCurrency(parseCurrencyToNumber(row.jurosNoMes))}</td>
                      <td>{formatCurrency(parseCurrencyToNumber(row.jurosTotal))}</td>
                      <td className="highlight">{formatCurrency(parseCurrencyToNumber(row.acumulado))}</td>
                      <td>{formatCurrency(parseCurrencyToNumber(row.corrigidoIpca))}</td>
                      <td>{formatCurrency(parseCurrencyToNumber(row.comSelic))}</td>
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