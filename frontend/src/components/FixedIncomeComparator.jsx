import React, { useState } from 'react';
import { useLanguage } from './LanguageContext';
import './CompoundCalculator.css'; // Reutilizando o CSS existente

const FixedIncomeComparator = () => {
  const { texts, formatCurrency, isPortuguese } = useLanguage();

  // Estados para o primeiro investimento
  const [investment1, setInvestment1] = useState({
    type: 'CDB',
    returnType: 'prefixado',
    rate: '',
    period: '',
    amount: ''
  });

  // Estados para o segundo investimento
  const [investment2, setInvestment2] = useState({
    type: 'LCI',
    returnType: 'cdi',
    rate: '',
    period: '',
    amount: ''
  });

  // Estados para taxas personalizadas
  const [useCustomRates, setUseCustomRates] = useState(false);
  const [customCDI, setCustomCDI] = useState('14.65');
  const [customIPCA, setCustomIPCA] = useState('4.5');

  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState({});

  // CDI e IPCA base (valores atuais aproximados)
  const CDI_BASE = 14.65; // %
  const IPCA_BASE = 4.5; // %

  // Valores efetivos (customizados ou padrão)
  const effectiveCDI = useCustomRates ? parseFloat(customCDI) || CDI_BASE : CDI_BASE;
  const effectiveIPCA = useCustomRates ? parseFloat(customIPCA) || IPCA_BASE : IPCA_BASE;

  // Tipos de investimento
  const investmentTypes = [
    { value: 'CDB', label: 'CDB', taxable: true },
    { value: 'LCI', label: 'LCI', taxable: false },
    { value: 'LCA', label: 'LCA', taxable: false },
    { value: 'LC', label: isPortuguese ? 'Letra de Câmbio' : 'Letter of Exchange', taxable: true },
    { value: 'TESOURO_SELIC', label: 'Tesouro Selic', taxable: true },
    { value: 'TESOURO_IPCA', label: 'Tesouro IPCA+', taxable: true },
    { value: 'TESOURO_PREFIXADO', label: isPortuguese ? 'Tesouro Prefixado' : 'Fixed Treasury', taxable: true },
    { value: 'DEBENTURES', label: 'Debêntures', taxable: true }
  ];

  // Tipos de rendimento
  const returnTypes = [
    { value: 'prefixado', label: isPortuguese ? 'Pré-fixado' : 'Fixed Rate' },
    { value: 'cdi', label: '% do CDI' },
    { value: 'ipca', label: isPortuguese ? 'Taxa fixa + IPCA' : 'Fixed Rate + IPCA' }
  ];

  // Função para calcular IR baseado no prazo
  const calculateIR = (period) => {
    if (period <= 180) return 0.225; // 22.5%
    if (period <= 360) return 0.20;  // 20%
    if (period <= 720) return 0.175; // 17.5%
    return 0.15; // 15%
  };

  // Função para calcular IOF (aplicado apenas nos primeiros 30 dias)
  const calculateIOF = (period) => {
    if (period <= 30) {
      const iofTable = [
        96, 93, 90, 86, 83, 80, 76, 73, 70, 66, 63, 60, 56, 53, 50, 46, 43, 40, 36, 33,
        30, 26, 23, 20, 16, 13, 10, 6, 3, 0
      ];
      const day = Math.min(Math.floor(period), 29);
      return iofTable[day] / 100 / 100; // Converter para decimal
    }
    return 0;
  };

  // Função para calcular rentabilidade
  const calculateReturn = (investment, baseAmount = 1000) => {
    const { type, returnType, rate, period } = investment;
    const investmentType = investmentTypes.find(t => t.value === type);
    const taxable = investmentType?.taxable || false;

    let annualRate = 0;
    const rateValue = parseFloat(rate) || 0;

    // Determinar taxa anual baseada no tipo de rendimento
    switch (returnType) {
      case 'prefixado':
        annualRate = rateValue;
        break;
      case 'cdi':
        annualRate = (rateValue / 100) * effectiveCDI;
        break;
      case 'ipca':
        annualRate = rateValue + effectiveIPCA;
        break;
      default:
        annualRate = rateValue;
    }

    // Calcular rendimento bruto
    const monthlyRate = Math.pow(1 + (annualRate / 100), 1/12) - 1;
    const grossReturn = baseAmount * (Math.pow(1 + monthlyRate, period) - 1);

    let netReturn = grossReturn;
    let irAmount = 0;
    let iofAmount = 0;

    // Aplicar impostos se o investimento for tributável
    if (taxable) {
      // Calcular IR
      const irRate = calculateIR(period);
      irAmount = grossReturn * irRate;

      // Calcular IOF
      const iofRate = calculateIOF(period);
      iofAmount = grossReturn * iofRate;

      netReturn = grossReturn - irAmount - iofAmount;
    }

    const finalAmount = baseAmount + netReturn;
    const liquidYield = (netReturn / baseAmount) * 100;

    return {
      grossReturn,
      netReturn,
      finalAmount,
      liquidYield,
      annualRate,
      irAmount,
      iofAmount,
      taxable,
      period,
      type: investmentType?.label || type,
      isExempt: !taxable
    };
  };

  const handleCalculate = () => {
    const amount = parseCurrencyToNumber(investment1.amount) || 10000; // Usar valor preenchido ou padrão

    if (!investment1.rate || !investment1.period || !investment2.rate || !investment2.period) {
      const message = isPortuguese
        ? 'Preencha todos os campos obrigatórios!'
        : 'Fill in all required fields!';
      alert(message);
      return;
    }

    const result1 = calculateReturn(investment1, amount);
    const result2 = calculateReturn(investment2, amount);

    setResults({
      investment1: result1,
      investment2: result2,
      baseAmount: amount,
      winner: result1.netReturn > result2.netReturn ? 1 : 2
    });

    setShowResults(true);
  };

  const handleReset = () => {
    setInvestment1({
      type: 'CDB',
      returnType: 'prefixado',
      rate: '',
      period: '',
      amount: ''
    });
    setInvestment2({
      type: 'LCI',
      returnType: 'cdi',
      rate: '',
      period: '',
      amount: ''
    });
    setUseCustomRates(false);
    setCustomCDI('14.65');
    setCustomIPCA('4.5');
    setShowResults(false);
    setResults({});
  };

  const formatCurrencyInput = (value) => {
    const numericValue = value.replace(/\D/g, '');
    if (!numericValue) return '';
    const number = parseFloat(numericValue) / 100;
    return formatCurrency(number);
  };

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

  return (
    <div className="compound-calculator">
      <div className="calculator-header">
        <div className="page-info">
          <h1 className="page-title">📊 {isPortuguese ? 'Comparador de Renda Fixa' : 'Fixed Income Comparator'}</h1>
          <p className="page-subtitle">
            {isPortuguese
              ? 'Compare diferentes investimentos de renda fixa e suas rentabilidades'
              : 'Compare different fixed income investments and their returns'
            }
          </p>
        </div>
      </div>

      <section className="calculator-form-section">
        <div className="section-header">
          <h2 className="section-title">💰 {isPortuguese ? 'Dados dos Investimentos' : 'Investment Data'}</h2>
        </div>

        <div className="form-grid">



          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>

            {/* Investimento 1 */}
            <div className="form-section">
              <div className="section-subtitle">📈 {isPortuguese ? 'Investimento 1' : 'Investment 1'}</div>

              <div className="input-group" style={{ marginBottom: '20px' }}>
                <label>{isPortuguese ? 'Tipo de investimento' : 'Investment type'}</label>
                <select
                  value={investment1.type}
                  onChange={(e) => setInvestment1({...investment1, type: e.target.value})}
                  className="form-input"
                >
                  {investmentTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div className="input-group" style={{ marginBottom: '20px' }}>
                <label>{isPortuguese ? 'Tipo de rendimento' : 'Return type'}</label>
                <select
                  value={investment1.returnType}
                  onChange={(e) => setInvestment1({...investment1, returnType: e.target.value})}
                  className="form-input"
                >
                  {returnTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div className="input-group" style={{ marginBottom: '20px' }}>
                <label>
                  {investment1.returnType === 'cdi'
                    ? '% do CDI'
                    : investment1.returnType === 'ipca'
                    ? (isPortuguese ? 'Taxa fixa (% a.a.)' : 'Fixed rate (% p.a.)')
                    : (isPortuguese ? 'Taxa (% a.a.)' : 'Rate (% p.a.)')
                  }
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder={investment1.returnType === 'cdi' ? "105" : "12.5"}
                  value={investment1.rate}
                  onChange={(e) => setInvestment1({...investment1, rate: e.target.value})}
                  className="form-input"
                />
              </div>

              <div className="input-group">
                <label>{isPortuguese ? 'Tempo (meses)' : 'Period (months)'}</label>
                <input
                  type="number"
                  placeholder="12"
                  value={investment1.period}
                  onChange={(e) => setInvestment1({...investment1, period: e.target.value})}
                  className="form-input"
                />
              </div>
            </div>

            {/* Investimento 2 */}
            <div className="form-section">
              <div className="section-subtitle">📊 {isPortuguese ? 'Investimento 2' : 'Investment 2'}</div>

              <div className="input-group" style={{ marginBottom: '20px' }}>
                <label>{isPortuguese ? 'Tipo de investimento' : 'Investment type'}</label>
                <select
                  value={investment2.type}
                  onChange={(e) => setInvestment2({...investment2, type: e.target.value})}
                  className="form-input"
                >
                  {investmentTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div className="input-group" style={{ marginBottom: '20px' }}>
                <label>{isPortuguese ? 'Tipo de rendimento' : 'Return type'}</label>
                <select
                  value={investment2.returnType}
                  onChange={(e) => setInvestment2({...investment2, returnType: e.target.value})}
                  className="form-input"
                >
                  {returnTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div className="input-group" style={{ marginBottom: '20px' }}>
                <label>
                  {investment2.returnType === 'cdi'
                    ? '% do CDI'
                    : investment2.returnType === 'ipca'
                    ? (isPortuguese ? 'Taxa fixa (% a.a.)' : 'Fixed rate (% p.a.)')
                    : (isPortuguese ? 'Taxa (% a.a.)' : 'Rate (% p.a.)')
                  }
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder={investment2.returnType === 'cdi' ? "102" : "10.8"}
                  value={investment2.rate}
                  onChange={(e) => setInvestment2({...investment2, rate: e.target.value})}
                  className="form-input"
                />
              </div>

              <div className="input-group">
                <label>{isPortuguese ? 'Tempo (meses)' : 'Period (months)'}</label>
                <input
                  type="number"
                  placeholder="12"
                  value={investment2.period}
                  onChange={(e) => setInvestment2({...investment2, period: e.target.value})}
                  className="form-input"
                />
              </div>
            </div>
          </div>

          {/* Valor do investimento */}
          <div className="form-row">
            <div className="input-group">
              <label>{isPortuguese ? 'Valor a investir' : 'Amount to invest'}</label>
              <input
                type="text"
                placeholder={formatCurrency(10000)}
                value={investment1.amount}
                onChange={(e) => {
                  const formatted = formatCurrencyInput(e.target.value);
                  setInvestment1({...investment1, amount: formatted});
                  setInvestment2({...investment2, amount: formatted});
                }}
                className="form-input"
              />
            </div>
          </div>


                    {/* Seção para taxas customizadas */}
                    <div className="form-section" style={{ marginBottom: '30px', backgroundColor: '#f7fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <div className="input-group" style={{ marginBottom: '15px' }}>
                        <label >
                          <input
                            type="checkbox"
                            checked={useCustomRates}
                            onChange={(e) => setUseCustomRates(e.target.checked)}
                            style={{ marginRight: '8px', transform: 'scale(1.2)' }}
                          />
                          ⚙️ {isPortuguese ? 'Quero preencher (CDI, IPCA) manualmente' : 'I want to fill (CDI, IPCA) manually'}
                        </label>
                      </div>

                       {useCustomRates && (
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '15px' }}>
                                      <div className="input-group">
                                        <label>CDI (% a.a.)</label>
                                        <input
                                          type="number"
                                          step="0.01"
                                          placeholder="14.65"
                                          value={customCDI}
                                          onChange={(e) => setCustomCDI(e.target.value)}
                                          className="form-input"
                                          style={{ backgroundColor: 'white' }}
                                        />
                                      </div>
                                      <div className="input-group">
                                        <label>IPCA (% a.a.)</label>
                                        <input
                                          type="number"
                                          step="0.01"
                                          placeholder="4.5"
                                          value={customIPCA}
                                          onChange={(e) => setCustomIPCA(e.target.value)}
                                          className="form-input"
                                          style={{ backgroundColor: 'white' }}
                                        />
                                      </div>
                                    </div>
                                  )}
                                </div>

          <div style={{ textAlign: 'center', color: '#718096', fontSize: '0.9em', margin: '10px 0' }}>
            {isPortuguese
              ? `Valores ${useCustomRates ? 'customizados' : 'padrão'} utilizados: CDI ${effectiveCDI}%, IPCA ${effectiveIPCA}%`
              : `${useCustomRates ? 'Custom' : 'Default'} values used: CDI ${effectiveCDI}%, IPCA ${effectiveIPCA}%`
            }
          </div>

          <div className="form-actions">
            <button onClick={handleCalculate} className="btn btn-primary">
              🧮 {isPortuguese ? 'Comparar' : 'Compare'}
            </button>
            <button onClick={handleReset} className="btn btn-secondary">
              🔄 {isPortuguese ? 'Limpar' : 'Clear'}
            </button>
          </div>
        </div>
      </section>

      {showResults && (
        <section className="results-summary-section">
          <div className="section-header">
            <h2 className="section-title">📊 {isPortuguese ? 'Resultado da Comparação' : 'Comparison Results'}</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '30px' }}>

            {/* Resultado Investimento 1 */}
            <div className={`form-section ${results.winner === 1 ? 'result-winner' : ''}`}
                 style={{
                   border: results.winner === 1 ? '3px solid #48bb78' : 'none',
                   position: 'relative'
                 }}>
              {results.winner === 1 && (
                <div style={{
                  position: 'absolute',
                  top: '-10px',
                  right: '20px',
                  background: '#48bb78',
                  color: 'white',
                  padding: '5px 15px',
                  borderRadius: '20px',
                  fontSize: '0.8em',
                  fontWeight: 'bold'
                }}>
                  {isPortuguese ? '🏆 MELHOR OPÇÃO' : '🏆 BEST OPTION'}
                </div>
              )}

              <div className="section-subtitle" style={{ color: '#667eea', marginBottom: '20px' }}>
                {results.investment1?.type}
              </div>

              <div className="results-grid" style={{ display: 'block' }}>
                <div style={{ marginBottom: '15px' }}>
                  <div style={{ fontSize: '1.8em', fontWeight: '700', color: '#48bb78' }}>
                    {results.investment1?.liquidYield.toFixed(2)}%
                  </div>
                  <div style={{ color: '#718096', fontSize: '0.9em' }}>
                    {isPortuguese ? 'Rentabilidade Líquida (a.a.)' : 'Net Return (p.a.)'}
                  </div>
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <div style={{ fontSize: '1.4em', fontWeight: '600', color: '#2d3748' }}>
                    {formatCurrency(results.investment1?.finalAmount)}
                  </div>
                  <div style={{ color: '#718096', fontSize: '0.9em' }}>
                    {isPortuguese ? 'Valor Final' : 'Final Amount'}
                  </div>
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <div style={{ fontSize: '1.2em', fontWeight: '600', color: '#667eea' }}>
                    {formatCurrency(results.investment1?.netReturn)}
                  </div>
                  <div style={{ color: '#718096', fontSize: '0.9em' }}>
                    {isPortuguese ? 'Rendimento Líquido' : 'Net Earnings'}
                  </div>
                </div>

                {results.investment1?.taxable && (
                  <div style={{ fontSize: '0.85em', color: '#d69e2e', marginTop: '10px' }}>
                    {isPortuguese ? '⚠️ Sujeito a IR' : '⚠️ Subject to Income Tax'}: {formatCurrency(results.investment1?.irAmount)}
                    {results.investment1?.iofAmount > 0 && (
                      <span> + IOF: {formatCurrency(results.investment1?.iofAmount)}</span>
                    )}
                  </div>
                )}

                {results.investment1?.isExempt && (
                  <div style={{ fontSize: '0.85em', color: '#48bb78', marginTop: '10px' }}>
                    {isPortuguese ? '✅ Isento de Imposto de Renda' : '✅ Income Tax Exempt'}
                  </div>
                )}
              </div>
            </div>

            {/* Resultado Investimento 2 */}
            <div className={`form-section ${results.winner === 2 ? 'result-winner' : ''}`}
                 style={{
                   border: results.winner === 2 ? '3px solid #48bb78' : 'none',
                   position: 'relative'
                 }}>
              {results.winner === 2 && (
                <div style={{
                  position: 'absolute',
                  top: '-10px',
                  right: '20px',
                  background: '#48bb78',
                  color: 'white',
                  padding: '5px 15px',
                  borderRadius: '20px',
                  fontSize: '0.8em',
                  fontWeight: 'bold'
                }}>
                  {isPortuguese ? '🏆 MELHOR OPÇÃO' : '🏆 BEST OPTION'}
                </div>
              )}

              <div className="section-subtitle" style={{ color: '#9f7aea', marginBottom: '20px' }}>
                {results.investment2?.type}
              </div>

              <div className="results-grid" style={{ display: 'block' }}>
                <div style={{ marginBottom: '15px' }}>
                  <div style={{ fontSize: '1.8em', fontWeight: '700', color: '#48bb78' }}>
                    {results.investment2?.liquidYield.toFixed(2)}%
                  </div>
                  <div style={{ color: '#718096', fontSize: '0.9em' }}>
                    {isPortuguese ? 'Rentabilidade Líquida (a.a.)' : 'Net Return (p.a.)'}
                  </div>
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <div style={{ fontSize: '1.4em', fontWeight: '600', color: '#2d3748' }}>
                    {formatCurrency(results.investment2?.finalAmount)}
                  </div>
                  <div style={{ color: '#718096', fontSize: '0.9em' }}>
                    {isPortuguese ? 'Valor Final' : 'Final Amount'}
                  </div>
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <div style={{ fontSize: '1.2em', fontWeight: '600', color: '#9f7aea' }}>
                    {formatCurrency(results.investment2?.netReturn)}
                  </div>
                  <div style={{ color: '#718096', fontSize: '0.9em' }}>
                    {isPortuguese ? 'Rendimento Líquido' : 'Net Earnings'}
                  </div>
                </div>

                {results.investment2?.taxable && (
                  <div style={{ fontSize: '0.85em', color: '#d69e2e', marginTop: '10px' }}>
                    {isPortuguese ? '⚠️ Sujeito a IR' : '⚠️ Subject to Income Tax'}: {formatCurrency(results.investment2?.irAmount)}
                    {results.investment2?.iofAmount > 0 && (
                      <span> + IOF: {formatCurrency(results.investment2?.iofAmount)}</span>
                    )}
                  </div>
                )}

                {results.investment2?.isExempt && (
                  <div style={{ fontSize: '0.85em', color: '#48bb78', marginTop: '10px' }}>
                    {isPortuguese ? '✅ Isento de Imposto de Renda' : '✅ Income Tax Exempt'}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Resumo da comparação */}
          <div className="form-section">
            <h4 style={{ color: '#2d3748', marginBottom: '15px' }}>
              📋 {isPortuguese ? 'Resumo da Comparação' : 'Comparison Summary'}
            </h4>
            <p style={{ fontSize: '1.1em', color: '#4a5568', lineHeight: '1.6' }}>
              {isPortuguese ? (
                <>
                  O investimento <strong>{results.winner === 1 ? results.investment1?.type : results.investment2?.type}</strong> apresenta
                  melhor rentabilidade líquida, com <strong>{(results.winner === 1 ? results.investment1?.liquidYield : results.investment2?.liquidYield).toFixed(2)}%</strong> ao ano.
                  A diferença de rendimento é de <strong>{formatCurrency(Math.abs(results.investment1?.netReturn - results.investment2?.netReturn))}</strong>
                  {results.investment1?.period === results.investment2?.period ?
                    ` em ${results.investment1?.period} meses` :
                    ' no período analisado'
                  }.
                </>
              ) : (
                <>
                  The <strong>{results.winner === 1 ? results.investment1?.type : results.investment2?.type}</strong> investment shows
                  better net return, with <strong>{(results.winner === 1 ? results.investment1?.liquidYield : results.investment2?.liquidYield).toFixed(2)}%</strong> per year.
                  The difference in earnings is <strong>{formatCurrency(Math.abs(results.investment1?.netReturn - results.investment2?.netReturn))}</strong>
                  {results.investment1?.period === results.investment2?.period ?
                    ` in ${results.investment1?.period} months` :
                    ' in the analyzed period'
                  }.
                </>
              )}
            </p>
          </div>
        </section>
      )}
    </div>
  );
};

export default FixedIncomeComparator;