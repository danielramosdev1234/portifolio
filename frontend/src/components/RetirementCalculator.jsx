import React, { useState } from 'react';
import './RetirementCalculator.css';

const RetirementCalculator = () => {
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

  // Função para formatar como moeda brasileira
  const formatCurrency = (value) => {
    const numericValue = value.replace(/\D/g, '');
    if (!numericValue) return '';
    const number = parseFloat(numericValue) / 100;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(number);
  };

  // Função para converter moeda formatada para número
  const parseCurrencyToNumber = (value) => {
    if (!value) return 0;
    const numericString = value
      .replace(/R\$\s?/g, '')
      .replace(/\./g, '')
      .replace(',', '.');
    return parseFloat(numericString) || 0;
  };

  // Handlers para campos monetários
  const handleMonthlyIncomeChange = (e) => {
    setMonthlyIncome(formatCurrency(e.target.value));
  };

  const handleCurrentPatrimonyChange = (e) => {
    setCurrentPatrimony(formatCurrency(e.target.value));
  };

  const handleTargetPatrimonyChange = (e) => {
    setTargetPatrimony(formatCurrency(e.target.value));
  };

  const handleMonthlyExpensesChange = (e) => {
    setMonthlyExpenses(formatCurrency(e.target.value));
  };

  const formatToBRL = (number) => {
    const n = parseFloat(number) || 0;
    return n.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
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
      alert('Preencha todos os campos obrigatórios!');
      return;
    }

    if (age >= retAge) {
      alert('A idade de aposentadoria deve ser maior que a idade atual!');
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
          <h1 className="page-title">🖏️ Simulador de Aposentadoria</h1>
          <p className="page-subtitle">Planeje sua independência financeira e aposentadoria</p>
        </div>
      </div>

      <section className="retirement-form-section">
        <div className="section-header">
          <h2 className="section-title">📊 Dados para Simulação</h2>
        </div>

        <div className="retirement-form-grid">
          <div className="form-column">
            <div className="input-group">
              <label>Quanto você ganha por mês?</label>
              <input
                type="text"
                placeholder="R$ 0,00"
                value={monthlyIncome}
                onChange={handleMonthlyIncomeChange}
                className="form-input"
              />
            </div>

            <div className="input-group">
              <label>Com quanto de patrimônio você quer se aposentar?</label>
              <input
                type="text"
                placeholder="R$ 0,00"
                value={targetPatrimony}
                onChange={handleTargetPatrimonyChange}
                className="form-input"
              />
            </div>

            <div className="input-group">
              <label>Qual sua idade atual?</label>
              <input
                type="number"
                placeholder="30"
                value={currentAge}
                onChange={(e) => setCurrentAge(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="input-group">
              <label>Sua rentabilidade total anual projetada (%)</label>
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
              <label>Quanto você já tem investido?</label>
              <input
                type="text"
                placeholder="R$ 0,00"
                value={currentPatrimony}
                onChange={handleCurrentPatrimonyChange}
                className="form-input"
              />
            </div>

            <div className="input-group">
              <label>Quantos % da sua renda você investe?</label>
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
              <label>Com quantos anos você deseja se aposentar?</label>
              <input
                type="number"
                placeholder="60"
                value={retirementAge}
                onChange={(e) => setRetirementAge(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="input-group">
              <label>Quanto você pretende gastar por mês aposentado?</label>
              <input
                type="text"
                placeholder="R$ 0,00"
                value={monthlyExpenses}
                onChange={handleMonthlyExpensesChange}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-actions">
            <button onClick={handleCalculate} className="btn btn-primary">
              🧮 Calcular
            </button>
            <button onClick={handleReset} className="btn btn-secondary">
              🔄 Limpar
            </button>
          </div>
        </div>
      </section>

      {showResults && (
        <section className="retirement-results-section">
          <div className="section-header">
            <h2 className="section-title">📈 Resultado da Simulação</h2>
          </div>

          <div className="retirement-results">
            <div className={`status-message ${results.goalAchieved ? 'status-success' : 'status-warning'}`}>
              {results.goalAchieved
                ? `🎉 Parabéns! Você atingirá sua meta de aposentadoria com os investimentos atuais.`
                : `⚠️ Infelizmente, com seus gastos atuais, você não deixará nada de herança.`
              }
            </div>

            <div className="results-grid">
              <div className="result-card result-card-blue">
                <h3>Você se aposentará com</h3>
                <div className="result-value blue">
                  R$ {formatToBRL(results.totalAccumulated)}
                </div>
                <div className="result-subtitle">
                  Aportando R$ {formatToBRL(parseCurrencyToNumber(monthlyIncome) * (parseFloat(incomePercentage) / 100))} por {results.yearsUntilRetirement} anos
                </div>
              </div>

              <div className="result-card result-card-orange">
                <h3>Deixará de herança</h3>
                <div className="result-value orange">
                  R$ {results.shortfall > 0 ? '0,00' : formatToBRL(results.totalAccumulated - results.neededCapital)}
                </div>
                <div className="result-subtitle">
                  Baseado numa expectativa média de 72 anos
                </div>
              </div>

              <div className="result-card result-card-green">
                <h3>Poderá gastar por mês</h3>
                <div className="result-value green">
                  R$ {formatToBRL(results.possibleMonthlyIncome)}
                </div>
                <div className="result-subtitle">
                  Para seu dinheiro nunca acabar
                </div>
              </div>

              <div className="result-card result-card-purple">
                <h3>Você passou da sua meta</h3>
                <div className="result-value green">
                  R$ {formatToBRL(results.goalAchieved ? results.totalAccumulated - results.neededCapital : 0)}
                </div>
                <div className="result-subtitle">
                  Parabéns!
                </div>
              </div>
            </div>

            <div className="retirement-details">
              <h4>📋 Detalhes da Simulação</h4>
              <div className="details-grid">
                <div className="detail-item">
                  <div className="detail-label">Anos até aposentadoria</div>
                  <div className="detail-value">{results.yearsUntilRetirement} anos</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Total investido no período</div>
                  <div className="detail-value">R$ {formatToBRL(results.monthlyContribution)}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Crescimento do patrimônio atual</div>
                  <div className="detail-value">R$ {formatToBRL(results.currentPatrimonyGrowth)}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Valor dos aportes + juros</div>
                  <div className="detail-value">R$ {formatToBRL(results.monthlyContributionsValue)}</div>
                </div>
                {parseCurrencyToNumber(monthlyExpenses) > 0 && (
                  <div className="detail-item">
                    <div className="detail-label">Anos de gastos cobertos</div>
                    <div className="detail-value">{results.yearsOfExpenses.toFixed(1)} anos</div>
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