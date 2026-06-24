import { useState, useRef } from 'react';
import SliderInput from './SliderInput';
import {
  calculateAffordability,
  formatINR,
  formatINRFull,
  AGENT_PHONE,
} from '../utils/calculations';

interface Props {
  onRequestGenerate: (callback: () => void) => void;
  userName: string | null;
}

export default function AffordabilityChecker({ onRequestGenerate, userName }: Props) {
  const [income, setIncome] = useState(150000);
  const [debts, setDebts] = useState(20000);
  const [downPayment, setDownPayment] = useState(1500000);
  const [rate, setRate] = useState(8.5);
  const [tenure, setTenure] = useState(20);
  const [showResults, setShowResults] = useState(false);
  const [copied, setCopied] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  const result = calculateAffordability(income, debts, downPayment, rate, tenure);

  const handleGenerate = () => {
    onRequestGenerate(() => {
      setShowResults(true);
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
    });
  };

  const zoneConfig = {
    optimal: { label: '✅ Optimal Comfort Zone', color: '#0F5132', bg: '#d1e7dd' },
    stretch: { label: '⚠️ Stretch Zone', color: '#856404', bg: '#fff3cd' },
    highrisk: { label: '🚨 High Risk Alert', color: '#dc3545', bg: '#f8d7da' },
  };

  const zone = zoneConfig[result.zone];

  const generateReportText = () => {
    const zoneLabel =
      result.zone === 'optimal'
        ? 'Optimal Comfort Zone'
        : result.zone === 'stretch'
        ? 'Stretch Zone'
        : 'High Risk Alert';

    return `══════════════════════════════════════════
  PROPERTY AFFORDABILITY AUDIT REPORT
══════════════════════════════════════════

📊 INPUT PARAMETERS
──────────────────
Monthly Net Household Income:  ${formatINRFull(income)}
Existing Monthly Debts/EMIs:   ${formatINRFull(debts)}
Available Down Payment:        ${formatINRFull(downPayment)}
Interest Rate:                 ${rate}%
Loan Tenure:                   ${tenure} Years

📈 CALCULATED RESULTS
─────────────────────
Monthly Housing Surplus (40% DTI):  ${formatINRFull(result.monthlySurplus)}
Maximum Affordable Loan:            ${formatINRFull(result.maxLoan)}
Total Affordable Property Price:    ${formatINRFull(result.totalAffordable)}
Housing Cost Ratio:                 ${(result.housingRatio * 100).toFixed(1)}%

🏷️  Budget Zone: ${zoneLabel}

📋 COMPONENT BREAKDOWN
─────────────────────
| Component           | Amount              | Share   |
|---------------------|---------------------|---------|
| Max Loan Principal  | ${formatINRFull(result.maxLoan).padEnd(19)}| ${(result.loanToValue * 100).toFixed(1)}%   |
| Down Payment Cash   | ${formatINRFull(downPayment).padEnd(19)}| ${(result.downPaymentPct * 100).toFixed(1)}%   |
| TOTAL               | ${formatINRFull(result.totalAffordable).padEnd(19)}| 100.0%  |

🤖 AI ANALYSIS VERDICT
─────────────────────
${userName ? `Excellent balance, ${userName}. ` : ''}Based on your net monthly baseline of ${formatINR(income)}, with existing obligations of ${formatINR(debts)}, your safe housing surplus stands at ${formatINR(result.monthlySurplus)} per month (applying the conservative 40% debt-to-income safety threshold).

Keeping your loan capped at ${formatINR(result.maxLoan)} guarantees you retain a healthy household cash buffer while building lifelong property equity. Your total affordable property valuation is ${formatINR(result.totalAffordable)}, placing you firmly in the ${zoneLabel}.

This framework ensures long-term financial stability while maximizing your real estate investment potential. The 40% DTI guardrail protects against over-leveraging while ensuring comfortable monthly cash flow management.
`;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generateReportText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      /* fallback */
    }
  };

  const handleWhatsApp = () => {
    const msg = encodeURIComponent(
      `Hi! I just ran my Property Affordability Analysis:\n\n` +
        `• Monthly Income: ${formatINR(income)}\n` +
        `• Max Affordable Property: ${formatINR(result.totalAffordable)}\n` +
        `• Loan Component: ${formatINR(result.maxLoan)}\n` +
        `• Budget Zone: ${zone.label.replace(/[^\w\s]/g, '').trim()}\n\n` +
        `I'd like to discuss properties in my budget range.`
    );
    window.open(`https://wa.me/${AGENT_PHONE}?text=${msg}`, '_blank');
  };

  return (
    <div>
      {/* ── Input Section ─────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mb-6">
        <h3 className="text-lg font-bold text-[#212529] mb-1">
          Configure Your Financial Profile
        </h3>
        <p className="text-xs text-gray-400 mb-6">
          Adjust the sliders to map your exact income architecture.
        </p>

        <SliderInput
          label="Monthly Net Household Income"
          value={income}
          onChange={setIncome}
          min={30000}
          max={1000000}
          step={5000}
          formatDisplay={(v) => formatINR(v)}
        />

        <SliderInput
          label="Existing Monthly Debt Commitments / EMIs"
          value={debts}
          onChange={setDebts}
          min={0}
          max={300000}
          step={5000}
          formatDisplay={(v) => formatINR(v)}
        />

        {/* Down Payment — Text Input */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2.5">
            <label className="text-sm font-semibold text-[#212529]">
              Available Liquid Down Payment
            </label>
            <span className="text-sm font-bold text-[#0F5132] bg-[#d1e7dd] px-3 py-1 rounded-full">
              {formatINR(downPayment)}
            </span>
          </div>
          <input
            type="number"
            value={downPayment || ''}
            onChange={(e) => setDownPayment(Number(e.target.value) || 0)}
            placeholder="e.g., 1500000"
            min={0}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F5132] focus:border-transparent text-[#212529] font-medium text-lg"
          />
          <p className="text-[11px] text-gray-400 mt-1">
            Enter amount in ₹&nbsp; (e.g., 1500000 = ₹15.00 L)
          </p>
        </div>

        <SliderInput
          label="Interest Rate Estimate"
          value={rate}
          onChange={setRate}
          min={5}
          max={15}
          step={0.1}
          formatDisplay={(v) => `${v.toFixed(1)}%`}
        />

        {/* Tenure Buttons */}
        <div className="mb-8">
          <label className="block text-sm font-semibold text-[#212529] mb-3">
            Target Loan Tenure
          </label>
          <div className="flex gap-3">
            {[10, 15, 20, 30].map((y) => (
              <button
                key={y}
                onClick={() => setTenure(y)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  tenure === y
                    ? 'bg-[#0F5132] text-white shadow-md shadow-[#0F5132]/25'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {y} Years
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleGenerate}
          className="w-full py-4 bg-[#0F5132] text-white font-bold rounded-xl hover:bg-[#0a3622] transition-all shadow-lg shadow-[#0F5132]/20 text-base"
        >
          Generate Complete Financial Audit &amp; AI Verdict
        </button>
      </div>

      {/* ── Results Section ───────────────── */}
      {showResults && (
        <div ref={resultsRef} className="animate-slideUp space-y-6">
          {/* Safe Buying Zone */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 text-center">
            <p className="text-sm text-gray-400 mb-1 uppercase tracking-wide">
              Your Safe Buying Zone
            </p>
            <h2 className="text-3xl md:text-5xl font-extrabold text-[#0F5132] mb-3">
              {formatINR(result.totalAffordable)}
            </h2>
            <span
              className="inline-block px-5 py-2 rounded-full text-sm font-bold"
              style={{ backgroundColor: zone.bg, color: zone.color }}
            >
              {zone.label}
            </span>
            <p className="text-xs text-gray-400 mt-3">
              Housing cost ratio:{' '}
              <strong>{(result.housingRatio * 100).toFixed(1)}%</strong> of monthly
              income &nbsp;|&nbsp; Monthly surplus:{' '}
              <strong>{formatINR(result.monthlySurplus)}</strong>
            </p>
          </div>

          {/* Loan vs Down Payment Bar */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            <h4 className="text-sm font-bold text-[#212529] mb-4">
              Payment Structure Breakdown
            </h4>

            {/* Stacked Bar */}
            <div className="flex rounded-full overflow-hidden h-10 mb-2">
              <div
                className="bg-[#0F5132] flex items-center justify-center text-white text-xs font-bold transition-all duration-700 min-w-[40px]"
                style={{ width: `${result.loanToValue * 100}%` }}
              >
                {(result.loanToValue * 100).toFixed(0)}%
              </div>
              <div
                className="bg-[#d1e7dd] flex items-center justify-center text-[#0F5132] text-xs font-bold transition-all duration-700 min-w-[40px]"
                style={{ width: `${result.downPaymentPct * 100}%` }}
              >
                {(result.downPaymentPct * 100).toFixed(0)}%
              </div>
            </div>
            <div className="flex justify-between text-xs text-gray-400 mb-6">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-[#0F5132] inline-block" />
                Loan Component
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-[#d1e7dd] inline-block" />
                Down Payment
              </span>
            </div>

            {/* Comparison Table */}
            <div className="overflow-hidden rounded-xl border border-gray-100">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#F8F9FA]">
                    <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Component
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Share
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-[#212529]">
                      Maximum Loan Principal
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-[#212529] text-right">
                      {formatINR(result.maxLoan)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400 text-right">
                      {(result.loanToValue * 100).toFixed(1)}%
                    </td>
                  </tr>
                  <tr className="border-t border-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-[#212529]">
                      Down Payment Cash
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-[#212529] text-right">
                      {formatINR(downPayment)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400 text-right">
                      {(result.downPaymentPct * 100).toFixed(1)}%
                    </td>
                  </tr>
                  <tr className="border-t-2 border-[#0F5132]/30 bg-[#d1e7dd]/20">
                    <td className="px-4 py-3 text-sm font-extrabold text-[#0F5132]">
                      Total Affordable Property
                    </td>
                    <td className="px-4 py-3 text-sm font-extrabold text-[#0F5132] text-right">
                      {formatINR(result.totalAffordable)}
                    </td>
                    <td className="px-4 py-3 text-sm font-extrabold text-[#0F5132] text-right">
                      100%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* AI Narrative */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 bg-[#d1e7dd] rounded-full flex items-center justify-center">
                <span className="text-base">🤖</span>
              </div>
              <h4 className="text-sm font-bold text-[#212529]">AI Analysis Verdict</h4>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              {userName ? (
                <strong className="text-[#212529]">Excellent balance, {userName}. </strong>
              ) : null}
              Based on your net monthly baseline of{' '}
              <strong className="text-[#212529]">{formatINR(income)}</strong>, with existing
              obligations of <strong className="text-[#212529]">{formatINR(debts)}</strong>, your
              safe housing surplus stands at{' '}
              <strong className="text-[#0F5132]">{formatINR(result.monthlySurplus)}</strong> per
              month (applying the conservative 40% DTI safety threshold). Keeping your loan capped
              at <strong className="text-[#212529]">{formatINR(result.maxLoan)}</strong> guarantees
              you retain a healthy household cash buffer while building lifelong property equity.
              Your total affordable property valuation is{' '}
              <strong className="text-[#0F5132]">{formatINR(result.totalAffordable)}</strong>,
              placing you firmly in the{' '}
              <span style={{ color: zone.color, fontWeight: 700 }}>
                {zone.label.replace(/[^\w\s]/g, '').trim()}
              </span>
              . This framework ensures long-term financial stability while maximizing your real
              estate investment potential.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center pb-4">
            <button
              onClick={handleCopy}
              className={`px-6 py-3 font-semibold rounded-xl transition-all shadow-md flex items-center gap-2 justify-center ${
                copied
                  ? 'bg-[#198754] text-white'
                  : 'bg-[#0F5132] text-white hover:bg-[#0a3622]'
              }`}
            >
              {copied ? '✅ Copied to Clipboard!' : '📋 Copy Full Audit to Clipboard'}
            </button>
            <button
              onClick={handleWhatsApp}
              className="px-6 py-3 bg-[#25D366] text-white font-semibold rounded-xl hover:bg-[#1da851] transition-all shadow-md flex items-center gap-2 justify-center"
            >
              💬 Discuss with Agent via WhatsApp
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
