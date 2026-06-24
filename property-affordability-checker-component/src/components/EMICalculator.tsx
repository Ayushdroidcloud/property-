import { useState, useRef } from 'react';
import SliderInput from './SliderInput';
import {
  calculateEMI,
  formatINR,
  formatINRFull,
  AGENT_PHONE,
} from '../utils/calculations';

interface Props {
  onRequestGenerate: (callback: () => void) => void;
  userName: string | null;
}

export default function EMICalculator({ onRequestGenerate, userName }: Props) {
  const [principal, setPrincipal] = useState(5000000);
  const [rate, setRate] = useState(8.5);
  const [tenure, setTenure] = useState(20);
  const [showResults, setShowResults] = useState(false);
  const [copied, setCopied] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  const result = calculateEMI(principal, rate, tenure);
  const sensitivityRate = Math.max(rate - 0.5, 0.1);
  const sensitivityResult = calculateEMI(principal, sensitivityRate, tenure);
  const totalSavings = result.totalInterest - sensitivityResult.totalInterest;
  const monthlySavings = result.emi - sensitivityResult.emi;

  const handleGenerate = () => {
    onRequestGenerate(() => {
      setShowResults(true);
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
    });
  };

  const generateReportText = () => {
    return `══════════════════════════════════════════
  EMI & SENSITIVITY ANALYSIS REPORT
══════════════════════════════════════════

📊 INPUT PARAMETERS
──────────────────
Loan Principal Amount:     ${formatINRFull(principal)}
Annual Interest Rate:      ${rate}%
Loan Tenure:               ${tenure} Years (${tenure * 12} Months)

📈 EMI BREAKDOWN
────────────────
Monthly EMI:               ${formatINRFull(Math.round(result.emi))}
Total Principal Paid:      ${formatINRFull(principal)}
Total Interest Paid:       ${formatINRFull(Math.round(result.totalInterest))}
Cumulative Bank Payback:   ${formatINRFull(Math.round(result.totalPayment))}
Interest as % of Total:    ${result.interestPct.toFixed(1)}%
Principal as % of Total:   ${result.principalPct.toFixed(1)}%
Interest-to-Principal:     ${(result.totalInterest / principal).toFixed(2)}x

💡 INTEREST SENSITIVITY ANALYSIS (Rate - 0.5%)
──────────────────────────────────────────────
If your rate were ${sensitivityRate.toFixed(1)}% instead of ${rate}%:
  → New Monthly EMI:        ${formatINRFull(Math.round(sensitivityResult.emi))}
  → Monthly Savings:        ${formatINRFull(Math.round(monthlySavings))}
  → Total Interest Savings: ${formatINRFull(Math.round(totalSavings))}
  → New Total Payback:      ${formatINRFull(Math.round(sensitivityResult.totalPayment))}

🤖 AI ANALYSIS VERDICT
─────────────────────
${userName ? `${userName}, ` : ''}your monthly obligation of ${formatINR(Math.round(result.emi))} is well within baseline targets for a ${formatINR(principal)} loan over ${tenure} years. Over the full tenure, you will pay ${formatINR(Math.round(result.totalInterest))} in interest, bringing your total bank payback to ${formatINR(Math.round(result.totalPayment))}.

💡 Pro Tip: Negotiating your bank rate down by just 0.5% to ${sensitivityRate.toFixed(1)}% saves you ${formatINR(Math.round(totalSavings))} over your loan lifespan. That's ${formatINR(Math.round(monthlySavings))} of extra cash freed up every single month — money better deployed into investments or family priorities.
`;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generateReportText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      /* */
    }
  };

  const handleWhatsApp = () => {
    const msg = encodeURIComponent(
      `Hi! I'd like to discuss my EMI analysis:\n\n` +
        `• Loan: ${formatINR(principal)}\n` +
        `• Rate: ${rate}% | Tenure: ${tenure} years\n` +
        `• Monthly EMI: ${formatINR(Math.round(result.emi))}\n` +
        `• Total Interest: ${formatINR(Math.round(result.totalInterest))}\n` +
        `• 0.5% rate negotiation saves: ${formatINR(Math.round(totalSavings))}\n\n` +
        `Can you help me get the best rate?`
    );
    window.open(`https://wa.me/${AGENT_PHONE}?text=${msg}`, '_blank');
  };

  return (
    <div>
      {/* ── Input Section ─────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mb-6">
        <h3 className="text-lg font-bold text-[#212529] mb-1">
          Configure EMI &amp; Sensitivity Analysis
        </h3>
        <p className="text-xs text-gray-400 mb-6">
          Get absolute clarity over your monthly commitments and interest optimization.
        </p>

        <SliderInput
          label="Desired Loan Principal Amount"
          value={principal}
          onChange={setPrincipal}
          min={1000000}
          max={30000000}
          step={100000}
          formatDisplay={(v) => formatINR(v)}
        />

        <SliderInput
          label="Annual Bank Interest Rate"
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
            Loan Tenure Horizon
          </label>
          <div className="flex gap-2">
            {[5, 10, 15, 20, 25, 30].map((y) => (
              <button
                key={y}
                onClick={() => setTenure(y)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  tenure === y
                    ? 'bg-[#0F5132] text-white shadow-md shadow-[#0F5132]/25'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {y}Y
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
          {/* EMI Highlight */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 text-center">
            <p className="text-sm text-gray-400 mb-1 uppercase tracking-wide">
              Your Monthly Commitment
            </p>
            <h2 className="text-3xl md:text-5xl font-extrabold text-[#0F5132]">
              {formatINR(Math.round(result.emi))}
              <span className="text-lg font-normal text-gray-300"> / month</span>
            </h2>
            <p className="text-xs text-gray-400 mt-2">
              For {tenure} years ({tenure * 12} installments) at {rate}% p.a.
            </p>
          </div>

          {/* Pie Chart + Summary Table */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Pie Chart */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center">
              <h4 className="text-sm font-bold text-[#212529] mb-5">
                Payment Distribution
              </h4>
              <div className="relative w-48 h-48">
                <div
                  className="w-full h-full rounded-full shadow-inner"
                  style={{
                    background: `conic-gradient(#0F5132 0% ${result.principalPct}%, #d1e7dd ${result.principalPct}% 100%)`,
                  }}
                />
                <div className="absolute inset-5 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <div className="text-center">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider">
                      Total
                    </p>
                    <p className="text-sm font-extrabold text-[#212529]">
                      {formatINR(result.totalPayment)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex gap-6 mt-5">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#0F5132]" />
                  <span className="text-xs text-gray-600">
                    Principal ({result.principalPct.toFixed(1)}%)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#d1e7dd]" />
                  <span className="text-xs text-gray-600">
                    Interest ({result.interestPct.toFixed(1)}%)
                  </span>
                </div>
              </div>
            </div>

            {/* Summary Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h4 className="text-sm font-bold text-[#212529] mb-4">Loan Summary</h4>
              <div className="space-y-0">
                {[
                  {
                    label: 'Principal Amount',
                    value: formatINR(principal),
                    color: '#212529',
                  },
                  {
                    label: 'Total Interest Paid',
                    value: formatINR(Math.round(result.totalInterest)),
                    color: '#dc3545',
                  },
                  {
                    label: 'Cumulative Bank Payback',
                    value: formatINR(Math.round(result.totalPayment)),
                    color: '#0F5132',
                  },
                  {
                    label: 'Interest-to-Principal Ratio',
                    value: `${(result.totalInterest / principal).toFixed(2)}x`,
                    color: '#212529',
                  },
                  {
                    label: 'Monthly EMI',
                    value: `${formatINR(Math.round(result.emi))}`,
                    color: '#0F5132',
                  },
                ].map((item, idx) => (
                  <div
                    key={item.label}
                    className={`flex justify-between py-3 ${
                      idx < 4 ? 'border-b border-gray-100' : ''
                    }`}
                  >
                    <span className="text-sm text-gray-500">{item.label}</span>
                    <span
                      className="text-sm font-bold"
                      style={{ color: item.color }}
                    >
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Principal vs Interest Progress Bar */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h4 className="text-sm font-bold text-[#212529] mb-4">
              Principal vs. Interest Over {tenure} Years
            </h4>
            <div className="flex rounded-full overflow-hidden h-8 mb-2">
              <div
                className="bg-[#0F5132] flex items-center justify-center text-white text-xs font-bold transition-all duration-700 min-w-[30px]"
                style={{ width: `${result.principalPct}%` }}
              >
                {result.principalPct.toFixed(0)}%
              </div>
              <div
                className="bg-[#d1e7dd] flex items-center justify-center text-[#0F5132] text-xs font-bold transition-all duration-700 min-w-[30px]"
                style={{ width: `${result.interestPct}%` }}
              >
                {result.interestPct.toFixed(0)}%
              </div>
            </div>
            <div className="flex justify-between text-xs text-gray-400">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-[#0F5132] inline-block" />
                Principal — {formatINR(principal)}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-[#d1e7dd] inline-block" />
                Interest — {formatINR(Math.round(result.totalInterest))}
              </span>
            </div>
          </div>

          {/* Interest Sensitivity Card */}
          <div className="bg-gradient-to-br from-[#d1e7dd] to-[#e8f5e9] rounded-2xl border border-[#0F5132]/20 p-6 md:p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#0F5132] rounded-full flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#0F5132]/20">
                <span className="text-white text-xl">💡</span>
              </div>
              <div className="flex-1">
                <h4 className="text-base font-bold text-[#0F5132] mb-2">
                  Negotiation Leverage Insight
                </h4>
                <p className="text-sm text-[#212529] leading-relaxed mb-4">
                  Securing a rate just{' '}
                  <strong className="text-[#0F5132]">0.5% lower</strong> at{' '}
                  <strong>{sensitivityRate.toFixed(1)}%</strong> saves you exactly{' '}
                  <strong className="text-[#0F5132] text-base">
                    {formatINR(Math.round(totalSavings))}
                  </strong>{' '}
                  over your {tenure}-year loan term. That&apos;s{' '}
                  <strong>{formatINR(Math.round(monthlySavings))}/month</strong> back in
                  your pocket — money better deployed into investments or family priorities.
                </p>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-white/60 rounded-xl p-3 text-center">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide">
                      At {rate}%
                    </p>
                    <p className="text-sm font-bold text-[#212529]">
                      {formatINR(Math.round(result.emi))}/mo
                    </p>
                  </div>
                  <div className="bg-white/60 rounded-xl p-3 text-center">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide">
                      At {sensitivityRate.toFixed(1)}%
                    </p>
                    <p className="text-sm font-bold text-[#0F5132]">
                      {formatINR(Math.round(sensitivityResult.emi))}/mo
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleWhatsApp}
                  className="px-5 py-2.5 bg-[#0F5132] text-white text-sm font-semibold rounded-xl hover:bg-[#0a3622] transition-all shadow-md"
                >
                  💬 Tap to Share This Baseline with Our Agent
                </button>
              </div>
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
                <strong className="text-[#212529]">{userName}, </strong>
              ) : null}
              your monthly obligation of{' '}
              <strong className="text-[#0F5132]">
                {formatINR(Math.round(result.emi))}
              </strong>{' '}
              is well within baseline targets for a{' '}
              <strong className="text-[#212529]">{formatINR(principal)}</strong> loan over{' '}
              {tenure} years. Over the full tenure, you will pay{' '}
              <strong className="text-[#dc3545]">
                {formatINR(Math.round(result.totalInterest))}
              </strong>{' '}
              in interest, bringing your total bank payback to{' '}
              <strong className="text-[#212529]">
                {formatINR(Math.round(result.totalPayment))}
              </strong>
              .{' '}
              <em>
                Tip: Negotiating your bank rate down by just 0.5% saves you a total of{' '}
                <strong className="text-[#0F5132]">
                  {formatINR(Math.round(totalSavings))}
                </strong>{' '}
                over your loan lifespan. Every basis point counts.
              </em>
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
              {copied
                ? '✅ Copied Amortisation Report!'
                : '📋 Copy Full Amortisation Report'}
            </button>
            <button
              onClick={handleWhatsApp}
              className="px-6 py-3 bg-[#25D366] text-white font-semibold rounded-xl hover:bg-[#1da851] transition-all shadow-md flex items-center gap-2 justify-center"
            >
              💬 Connect Directly via WhatsApp
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
