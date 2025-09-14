import React, { createContext, useContext, useState, useEffect } from 'react';

// Contexto de idioma
const LanguageContext = createContext();

// Hook personalizado para usar o contexto
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Textos em português
const ptTexts = {
  // Header
  appTitle: "🚀 Sistema de Gestão",

  // Menu
  menuTitle: "Menu Principal",
  calculator: "Calculadora",
  retirement: "Calculadora de Aposentadoria",
  reports: "Relatórios",
  settings: "Configurações",
  comingSoon: "Em breve...",
  version: "Versão 1.0.0",

  // Compound Calculator
  compoundTitle: "📊 Calculadora de Juros Compostos",
  compoundSubtitle: "Calcule o crescimento do seu investimento ao longo do tempo",
  investmentData: "💰 Dados do Investimento",
  initialValue: "Valor Inicial",
  monthlyContribution: "Aporte Mensal",
  monthlyRate: "Taxa Mensal (%)",
  annualRate: "Ou Taxa Anual (%)",
  ipca: "IPCA Anual (%)",
  selic: "SELIC Anual (%)",
  period: "⏰ Período",
  months: "Prazo em Meses",
  years: "Ou em Anos",
  specificDate: "Ou até Data Específica",
  calculate: "🧮 Calcular Juros",
  clear: "🔄 Limpar Campos",

  // Results
  resultsTitle: "📊 Resumo dos Resultados",
  initialAmount: "Valor Inicial",
  totalInvested: "Total Investido",
  interestEarned: "Juros Ganhos",
  finalValue: "Valor Final",
  realValue: "Valor Real (corrigido IPCA)",
  selicValue: "Valor com SELIC",
  chartTitle: "📉 Evolução Gráfica",
  monthlyEvolution: "📋 Evolução Mensal",

  // Table headers
  month: "Mês",
  accumulatedContributions: "Aportes Acumulados",
  monthlyInterest: "Juros do Mês",
  totalInterest: "Juros Acumulados",
  totalBalance: "Saldo Total",
  ipcaCorrected: "Corrigido IPCA",
  selicProjection: "Projeção SELIC",

  // Retirement Calculator
  retirementTitle: "🏖️ Simulador de Aposentadoria",
  retirementSubtitle: "Planeje sua independência financeira e aposentadoria",
  simulationData: "📊 Dados para Simulação",
  monthlyIncome: "Quanto você ganha por mês?",
  targetPatrimony: "Com quanto de patrimônio você quer se aposentar?",
  currentAge: "Qual sua idade atual?",
  annualReturn: "Sua rentabilidade total anual projetada (%)",
  currentPatrimony: "Quanto você já tem investido?",
  incomePercentage: "Quantos % da sua renda você investe?",
  retirementAge: "Com quantos anos você deseja se aposentar?",
  monthlyExpenses: "Quanto você pretende gastar por mês aposentado?",

  // Retirement Results
  simulationResults: "📈 Resultado da Simulação",
  goalAchieved: "🎉 Parabéns! Você atingirá sua meta de aposentadoria com os investimentos atuais.",
  goalNotAchieved: "⚠️ Infelizmente, com seus gastos atuais, você não deixará nada de herança.",
  retireWith: "Você se aposentará com",
  inheritance: "Deixará de herança",
  monthlySpending: "Poderá gastar por mês",
  exceededGoal: "Você passou da sua meta",
  congratulations: "Parabéns!",
  simulationDetails: "📋 Detalhes da Simulação",
  yearsToRetirement: "Anos até aposentadoria",
  totalInvestedPeriod: "Total investido no período",
  currentPatrimonyGrowth: "Crescimento do patrimônio atual",
  contributionsValue: "Valor dos aportes + juros",
  yearsCovered: "Anos de gastos cobertos",

  // Form placeholders and messages
  placeholderMoney: "R$ 0,00",
  placeholderOptional: "R$ 0,00 (opcional)",
  requiredFields: "Preencha todos os campos obrigatórios!",
  ageError: "A idade de aposentadoria deve ser maior que a idade atual!",
  years: "anos",
  forMoneyNeverEnd: "Para seu dinheiro nunca acabar",
  basedOnExpectancy: "Baseado numa expectativa média de 72 anos"
};

// Textos em inglês
const enTexts = {
  // Header
  appTitle: "🚀 Management System",

  // Menu
  menuTitle: "Main Menu",
  calculator: "Calculator",
  retirement: "Retirement Calculator",
  reports: "Reports",
  settings: "Settings",
  comingSoon: "Coming soon...",
  version: "Version 1.0.0",

  // Compound Calculator
  compoundTitle: "📊 Compound Interest Calculator",
  compoundSubtitle: "Calculate your investment growth over time",
  investmentData: "💰 Investment Data",
  initialValue: "Initial Value",
  monthlyContribution: "Monthly Contribution",
  monthlyRate: "Monthly Rate (%)",
  annualRate: "Or Annual Rate (%)",
  ipca: "Annual IPCA (%)",
  selic: "Annual SELIC (%)",
  period: "⏰ Period",
  months: "Period in Months",
  years: "Or in Years",
  specificDate: "Or until Specific Date",
  calculate: "🧮 Calculate Interest",
  clear: "🔄 Clear Fields",

  // Results
  resultsTitle: "📊 Results Summary",
  initialAmount: "Initial Amount",
  totalInvested: "Total Invested",
  interestEarned: "Interest Earned",
  finalValue: "Final Value",
  realValue: "Real Value (IPCA adjusted)",
  selicValue: "Value with SELIC",
  chartTitle: "📉 Graphic Evolution",
  monthlyEvolution: "📋 Monthly Evolution",

  // Table headers
  month: "Month",
  accumulatedContributions: "Accumulated Contributions",
  monthlyInterest: "Monthly Interest",
  totalInterest: "Total Interest",
  totalBalance: "Total Balance",
  ipcaCorrected: "IPCA Corrected",
  selicProjection: "SELIC Projection",

  // Retirement Calculator
  retirementTitle: "🏖️ Retirement Simulator",
  retirementSubtitle: "Plan your financial independence and retirement",
  simulationData: "📊 Simulation Data",
  monthlyIncome: "How much do you earn per month?",
  targetPatrimony: "How much wealth do you want to retire with?",
  currentAge: "What is your current age?",
  annualReturn: "Your projected total annual return (%)",
  currentPatrimony: "How much do you already have invested?",
  incomePercentage: "What % of your income do you invest?",
  retirementAge: "At what age do you want to retire?",
  monthlyExpenses: "How much do you plan to spend per month in retirement?",

  // Retirement Results
  simulationResults: "📈 Simulation Results",
  goalAchieved: "🎉 Congratulations! You will achieve your retirement goal with current investments.",
  goalNotAchieved: "⚠️ Unfortunately, with your current expenses, you won't leave any inheritance.",
  retireWith: "You will retire with",
  inheritance: "Will leave as inheritance",
  monthlySpending: "Can spend per month",
  exceededGoal: "You exceeded your goal",
  congratulations: "Congratulations!",
  simulationDetails: "📋 Simulation Details",
  yearsToRetirement: "Years to retirement",
  totalInvestedPeriod: "Total invested in the period",
  currentPatrimonyGrowth: "Current wealth growth",
  contributionsValue: "Contributions value + interest",
  yearsCovered: "Years of expenses covered",

  // Form placeholders and messages
  placeholderMoney: "$0.00",
  placeholderOptional: "$0.00 (optional)",
  requiredFields: "Fill in all required fields!",
  ageError: "Retirement age must be greater than current age!",
  years: "years",
  forMoneyNeverEnd: "For your money to never run out",
  basedOnExpectancy: "Based on an average life expectancy of 72 years"
};

// Provider do contexto de idioma
export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('pt');
  const [texts, setTexts] = useState(ptTexts);

  // Carregar idioma do localStorage na inicialização
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || 'pt';
    setLanguage(savedLanguage);
    setTexts(savedLanguage === 'en' ? enTexts : ptTexts);
  }, []);

  // Função para trocar idioma
  const changeLanguage = (newLanguage) => {
    setLanguage(newLanguage);
    setTexts(newLanguage === 'en' ? enTexts : ptTexts);
    localStorage.setItem('language', newLanguage);
  };

  // Função para formatar moeda baseada no idioma
  const formatCurrency = (value, currency = null) => {
    const numericValue = typeof value === 'string' ? value.replace(/\D/g, '') : value;
    if (!numericValue) return '';

    const number = typeof value === 'string' ? parseFloat(numericValue) / 100 : parseFloat(value);

    if (language === 'en') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency || 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(number);
    } else {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: currency || 'BRL',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(number);
    }
  };

  // Função para formatar números baseada no idioma
  const formatNumber = (number) => {
    const n = parseFloat(number) || 0;
    if (language === 'en') {
      return n.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    } else {
      return n.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    }
  };

  const value = {
    language,
    texts,
    changeLanguage,
    formatCurrency,
    formatNumber,
    isPortuguese: language === 'pt',
    isEnglish: language === 'en'
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};