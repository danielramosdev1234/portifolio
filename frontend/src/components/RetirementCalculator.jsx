import React, { useState } from 'react';
import './RetirementCalculator.css';
import { useLanguage } from './LanguageContext';

const RetirementCalculator = () => {
  const { texts, formatCurrency, formatNumber, isPortuguese } = useLanguage();

  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [currentPatrimony, setCurrentPatrimony] = useState(''); // Patrimônio atual (já investido)
  const [targetPatrimony, setTargetPatrimony] = useState(''); // Patrimônio alvo para aposentadoria
  const [currentAge, setCurrentAge] = useState('');
  const [incomePercentage, setIncomePercentage] = useState('');
  const [retirementAge, setRetirementAge] = useState('');
  const [annualReturn, setAnnualReturn] = useState('');
  const [monthlyExpenses, setMonthlyExpenses] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState({});

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

  // Handlers para campos monetários
  const handleMonthlyIncomeChange = (e) => {
    setMonthlyIncome(formatCurrencyInput(e.target.value));
  };

  const handleCurrentPatrimonyChange = (e) => {
    setCurrentPatrimony(formatCurrencyInput(e.target.value));
  };

  const handleTargetPatrimonyChange = (e) => {
    setTargetPatrimony(formatCurrencyInput(e.target.value));
  };

  const handleMonthlyExpensesChange = (e) => {
    setMonthlyExpenses(formatCurrencyInput(e.target.value));
  };

  const handleCalculate = () => {
    const income = parseCurrencyToNumber(monthlyIncome);
    const patrimony = parseCurrencyToNumber(currentPatrimony);
    const targetValue = parseCurrencyToNumber(targetPatrimony);
    const age = parseInt(currentAge) || 0;
    const percentage = parseFloat(incomePercentage) / 100 || 0;
    const retAge = parseInt(retirementAge) || 0;
    const returnRate = parseFloat(annualReturn) / 100 || 0;
    const expenses = parseCurrencyToNumber(monthlyExpenses);

    if (!income || !age || !percentage || !retAge || !returnRate) {
      alert(texts.requiredFields);
      return;
    }

    if (age >= retAge) {
      alert(texts.ageError);
      return;
    }

    // Cálculos
    const yearsUntilRetirement = retAge - age;
    const monthsUntilRetirement = yearsUntilRetirement * 12;
    const monthlyContribution = income * percentage;
    const monthlyReturn = Math.pow(1 + returnRate, 1/12) - 1;

    // Valor acumulado até a aposentadoria (valor atual + aportes mensais com juros compostos)
    let totalAccumulated = patrimony;

    // Crescimento do patrimônio atual
    const currentPatrimonyGrowth = patrimony * Math.pow(1 + returnRate, yearsUntilRetirement);

    // Valor dos aportes mensais com juros compostos
    const monthlyContributionsValue = monthlyContribution *
      (Math.pow(1 + monthlyReturn, monthsUntilRetirement) - 1) / monthlyReturn;

    totalAccumulated = currentPatrimonyGrowth + monthlyContributionsValue;

    // Valor necessário para atingir meta (usa targetPatrimony se fornecido, senão calcula baseado na renda)
    let neededCapital;
    if (targetValue > 0) {
      neededCapital = targetValue;
    } else {
      // Renda mensal desejada na aposentadoria
      const desiredMonthlyIncome = income;
      // Valor necessário para gerar a renda desejada (considerando 0.5% ao mês de rendimento)
      const monthlyReturnConservative = 0.005; // 0.5% ao mês (~6% ao ano)
      neededCapital = desiredMonthlyIncome / monthlyReturnConservative;
    }

    // Valor que poderá gastar por mês com o valor acumulado
    const monthlyReturnConservative = 0.005; // 0.5% ao mês
    const possibleMonthlyIncome = totalAccumulated * monthlyReturnConservative;

    // Status da meta
    const goalAchieved = totalAccumulated >= neededCapital;
    const shortfall = goalAchieved ? 0 : neededCapital - totalAccumulated;

    // Expectativa de vida do dinheiro (considerando gastos mensais)
    const monthsOfExpenses = expenses > 0 ? totalAccumulated / expenses : 0;
    const yearsOfExpenses = monthsOfExpenses / 12;

    setResults({
      totalAccumulated,
      neededCapital,
      possibleMonthlyIncome,
      desiredMonthlyIncome: income,
      goalAchieved,
      shortfall,
      yearsUntilRetirement,
      monthlyContribution: monthlyContribution * yearsUntilRetirement * 12,
      yearsOfExpenses,
      currentPatrimonyGrowth,
      monthlyContributionsValue
    });

    setShowResults(true);
  };

  const handleReset = () => {
    setMonthlyIncome('');
    setCurrentPatrimony('');
    setTargetPatrimony('');
    setCurrentAge('');
    setIncomePercentage('');
    setRetirementAge('');
    setAnnualReturn('');
    setMonthlyExpenses('');
    setShowResults(false);
    setResults({});
  };

  return (
    <div className="retirement-calculator">
      <div className="retirement-header">
        <div className="page-info">
          <h1 className="page-title">{texts.retirementTitle}</h1>
          <p className="page-subtitle">{texts.retirementSubtitle}</p>
        </div>
      </div>

      <section className="retirement-form-section">
        <div className="section-header">
          <h2 className="section-title">{texts.simulationData}</h2>
        </div>

        <div className="retirement-form-grid">
          <div className="form-column">
            <div className="input-group">
              <label>{texts.monthlyIncome}</label>
              <input
                type="text"
                placeholder={texts.placeholderMoney}
                value={monthlyIncome}
                onChange={handleMonthlyIncomeChange}
                className="form-input"
              />
            </div>

            <div className="input-group">
              <label>{texts.targetPatrimony}</label>
              <input
                type="text"
                placeholder={texts.placeholderMoney}
                value={targetPatrimony}
                onChange={handleTargetPatrimonyChange}
                className="form-input"
              />
            </div>

            <div className="input-group">
              <label>{texts.currentAge}</label>
              <input
                type="number"
                placeholder="30"
                value={currentAge}
                onChange={(e) => setCurrentAge(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="input-group">
              <label>{texts.annualReturn}</label>
              <input
                type="number"
                step="0.1"
                placeholder="10"
                value={annualReturn}
                onChange={(e) => setAnnualReturn(e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-column">
            <div className="input-group">
              <label>{texts.currentPatrimony}</label>
              <input
                type="text"
                placeholder={texts.placeholderMoney}
                value={currentPatrimony}
                onChange={handleCurrentPatrimonyChange}
                className="form-input"
              />
            </div>

            <div className="input-group">
              <label>{texts.incomePercentage}</label>
              <input
                type="number"
                step="1"
                placeholder="20"
                value={incomePercentage}
                onChange={(e) => setIncomePercentage(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="input-group">
              <label>{texts.retirementAge}</label>
              <input
                type="number"
                placeholder="60"
                value={retirementAge}
                onChange={(e) => setRetirementAge(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="input-group">
              <label>{texts.monthlyExpenses}</label>
              <input
                type="text"
                placeholder={texts.placeholderMoney}
                value={monthlyExpenses}
                onChange={handleMonthlyExpensesChange}
                className="form-input"
              />
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
        <section className="retirement-results-section">
          <div className="section-header">
            <h2 className="section-title">{texts.simulationResults}</h2>
          </div>

          <div className="retirement-results">
            <div className={`status-message ${results.goalAchieved ? 'status-success' : 'status-warning'}`}>
              {results.goalAchieved
                ? texts.goalAchieved
                : texts.goalNotAchieved
              }
            </div>

            <div className="results-grid">
              <div className="result-card result-card-blue">
                <h3>{texts.retireWith}</h3>
                <div className="result-value blue">
                  {formatCurrency(results.totalAccumulated)}
                </div>
                <div className="result-subtitle">
                  {isPortuguese
                    ? `Aportando ${formatCurrency(parseCurrencyToNumber(monthlyIncome) * (parseFloat(incomePercentage) / 100))} por ${results.yearsUntilRetirement} anos`
                    : `Contributing ${formatCurrency(parseCurrencyToNumber(monthlyIncome) * (parseFloat(incomePercentage) / 100))} for ${results.yearsUntilRetirement} years`
                  }
                </div>
              </div>

              <div className="result-card result-card-orange">
                <h3>{texts.inheritance}</h3>
                <div className="result-value orange">
                  {formatCurrency(results.shortfall > 0 ? 0 : results.totalAccumulated - results.neededCapital)}
                </div>
                <div className="result-subtitle">
                  {texts.basedOnExpectancy}
                </div>
              </div>

              <div className="result-card result-card-green">
                <h3>{texts.monthlySpending}</h3>
                <div className="result-value green">
                  {formatCurrency(results.possibleMonthlyIncome)}
                </div>
                <div className="result-subtitle">
                  {texts.forMoneyNeverEnd}
                </div>
              </div>

              <div className="result-card result-card-purple">
                <h3>{texts.exceededGoal}</h3>
                <div className="result-value green">
                  {formatCurrency(results.goalAchieved ? results.totalAccumulated - results.neededCapital : 0)}
                </div>
                <div className="result-subtitle">
                  {texts.congratulations}
                </div>
              </div>
            </div>

            <div className="retirement-details">
              <h4>{texts.simulationDetails}</h4>
              <div className="details-grid">
                <div className="detail-item">
                  <div className="detail-label">{texts.yearsToRetirement}</div>
                  <div className="detail-value">{results.yearsUntilRetirement} {texts.years}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">{texts.totalInvestedPeriod}</div>
                  <div className="detail-value">{formatCurrency(results.monthlyContribution)}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">{texts.currentPatrimonyGrowth}</div>
                  <div className="detail-value">{formatCurrency(results.currentPatrimonyGrowth)}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">{texts.contributionsValue}</div>
                  <div className="detail-value">{formatCurrency(results.monthlyContributionsValue)}</div>
                </div>
                {parseCurrencyToNumber(monthlyExpenses) > 0 && (
                  <div className="detail-item">
                    <div className="detail-label">{texts.yearsCovered}</div>
                    <div className="detail-value">{results.yearsOfExpenses.toFixed(1)} {texts.years}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default RetirementCalculator;