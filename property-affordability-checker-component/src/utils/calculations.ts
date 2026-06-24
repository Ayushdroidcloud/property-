// ═══════════════════════════════════════════
// PROPWEALTH ANALYTICS — Financial Math Engine
// ═══════════════════════════════════════════

export const AGENT_PHONE = '919876543210';

// ── Formatting Helpers ──────────────────────

export function formatINR(value: number): string {
  const absVal = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  if (absVal >= 10000000) {
    return sign + '₹' + (absVal / 10000000).toFixed(2) + ' Cr';
  }
  if (absVal >= 100000) {
    return sign + '₹' + (absVal / 100000).toFixed(2) + ' L';
  }
  return sign + '₹' + Math.round(absVal).toLocaleString('en-IN');
}

export function formatINRFull(value: number): string {
  const absVal = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  return sign + '₹' + Math.round(absVal).toLocaleString('en-IN');
}

// ── Affordability Checker ───────────────────

export interface AffordabilityResult {
  monthlySurplus: number;
  maxLoan: number;
  totalAffordable: number;
  zone: 'optimal' | 'stretch' | 'highrisk';
  housingRatio: number;
  loanToValue: number;
  downPaymentPct: number;
}

export function calculateAffordability(
  monthlyIncome: number,
  existingDebts: number,
  downPayment: number,
  interestRate: number,
  tenureYears: number
): AffordabilityResult {
  const monthlySurplus = Math.max(0, (monthlyIncome - existingDebts) * 0.40);
  const r = interestRate / 12 / 100;
  const n = tenureYears * 12;

  let maxLoan: number;
  if (r === 0) {
    maxLoan = monthlySurplus * n;
  } else {
    maxLoan = monthlySurplus * ((1 - Math.pow(1 + r, -n)) / r);
  }
  maxLoan = Math.max(0, maxLoan);

  const totalAffordable = maxLoan + downPayment;
  const housingRatio = monthlyIncome > 0 ? monthlySurplus / monthlyIncome : 0;

  let zone: AffordabilityResult['zone'];
  if (housingRatio <= 0.30) zone = 'optimal';
  else if (housingRatio <= 0.40) zone = 'stretch';
  else zone = 'highrisk';

  return {
    monthlySurplus,
    maxLoan,
    totalAffordable,
    zone,
    housingRatio,
    loanToValue: totalAffordable > 0 ? maxLoan / totalAffordable : 0,
    downPaymentPct: totalAffordable > 0 ? downPayment / totalAffordable : 0,
  };
}

// ── EMI Calculator ──────────────────────────

export interface EMIResult {
  emi: number;
  totalPayment: number;
  totalInterest: number;
  interestPct: number;
  principalPct: number;
}

export function calculateEMI(principal: number, annualRate: number, years: number): EMIResult {
  const r = annualRate / 12 / 100;
  const n = years * 12;

  let emi: number;
  if (r === 0) {
    emi = principal / n;
  } else {
    emi = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  }

  const totalPayment = emi * n;
  const totalInterest = totalPayment - principal;

  return {
    emi,
    totalPayment,
    totalInterest,
    interestPct: totalPayment > 0 ? (totalInterest / totalPayment) * 100 : 0,
    principalPct: totalPayment > 0 ? (principal / totalPayment) * 100 : 0,
  };
}

// ── Remaining Balance ───────────────────────

export function getRemainingBalance(
  principal: number,
  annualRate: number,
  tenureYears: number,
  afterYears: number
): number {
  const r = annualRate / 12 / 100;
  const n = tenureYears * 12;
  const p = afterYears * 12;

  if (p >= n) return 0;
  if (r === 0) return Math.max(0, principal * (1 - p / n));

  return Math.max(
    0,
    principal * (Math.pow(1 + r, n) - Math.pow(1 + r, p)) / (Math.pow(1 + r, n) - 1)
  );
}

// ── Rent vs. Buy Analyzer ───────────────────

export interface RentVsBuyResult {
  cumulativeRent: number;
  yearlyData: Array<{
    year: number;
    annualRent: number;
    cumulativeRent: number;
    propertyValue: number;
    equityValue: number;
  }>;
  propertyValueAtN: number;
  equityAtN: number;
  remainingBalance: number;
  loanAmount: number;
  downPaymentMade: number;
  totalPaymentsMade: number;
  interestPaid: number;
  maintenanceCost: number;
  buyingAdvantage: number;
  emi: number;
}

export function calculateRentVsBuy(
  monthlyRent: number,
  rentInflationPct: number,
  propertyPrice: number,
  appreciationPct: number,
  years: number
): RentVsBuyResult {
  const loanRate = 8.5;
  const loanTenure = 20;
  const loanAmount = propertyPrice * 0.80;
  const downPaymentMade = propertyPrice * 0.20;

  const emiResult = calculateEMI(loanAmount, loanRate, loanTenure);

  let cumulativeRent = 0;
  const yearlyData: RentVsBuyResult['yearlyData'] = [];

  for (let y = 1; y <= years; y++) {
    const annualRent = monthlyRent * 12 * Math.pow(1 + rentInflationPct / 100, y - 1);
    cumulativeRent += annualRent;

    const propVal = propertyPrice * Math.pow(1 + appreciationPct / 100, y);
    const remBal = getRemainingBalance(loanAmount, loanRate, loanTenure, y);
    const equity = propVal - remBal;

    yearlyData.push({ year: y, annualRent, cumulativeRent, propertyValue: propVal, equityValue: equity });
  }

  const propertyValueAtN = propertyPrice * Math.pow(1 + appreciationPct / 100, years);
  const remainingBalance = getRemainingBalance(loanAmount, loanRate, loanTenure, years);
  const equityAtN = propertyValueAtN - remainingBalance;

  const effectiveYears = Math.min(years, loanTenure);
  const totalPaymentsMade = emiResult.emi * effectiveYears * 12;
  const principalPaid = loanAmount - remainingBalance;
  const interestPaid = totalPaymentsMade - principalPaid;
  const maintenanceCost = propertyPrice * 0.01 * years;

  // Buying advantage = (equity you build) - (all buying costs) + (rent you avoid paying)
  const buyingAdvantage =
    equityAtN - downPaymentMade - totalPaymentsMade - maintenanceCost + cumulativeRent;

  return {
    cumulativeRent,
    yearlyData,
    propertyValueAtN,
    equityAtN,
    remainingBalance,
    loanAmount,
    downPaymentMade,
    totalPaymentsMade,
    interestPaid,
    maintenanceCost,
    buyingAdvantage,
    emi: emiResult.emi,
  };
}
