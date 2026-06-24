import { useState, useRef } from 'react';
import SliderInput from './SliderInput';
import {
  calculateRentVsBuy,
  formatINR,
  formatINRFull,
  AGENT_PHONE,
} from '../utils/calculations';

interface Props {
  onRequestGenerate: (callback: () => void) => void;
  userName: string | null;
}

export default function RentVsBuyCalculator({ onRequestGenerate, userName }: Props) {
  const [rent, setRent] = useState(30000);
  const [rentInflation, setRentInflation] = useState(7);
  const [propertyPrice, setPropertyPrice] = useState(8000000);
  const [appreciation, setAppreciation] = useState(6);
  const [years, setYears] = useState(10);
  const [showResults, setShowResults] = useState(false);
  const [copied, setCopied] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  const result = calculateRentVsBuy(rent, rentInflation, propertyPrice, appreciation, years);

  const handleGenerate = () => {
    onRequestGenerate(() => {
      setShowResults(true);
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
    });
  };

  const maxBarVal = Math.max(result.cumulativeRent, result.equityAtN, 1);

  const generateReportText = () => {
    const tableRows = result.yearlyData
      .map(
        (d) =>
          `| ${String(d.year).padEnd(4)} | ${formatINRFull(d.cumulativeRent).padEnd(20)} | ${formatINRFull(d.equityValue).padEnd(20)} |`
      )
      .join('\n');

    return `══════════════════════════════════════════
  RENT VS. BUY ANALYSIS REPORT
══════════════════════════════════════════

📊 INPUT PARAMETERS
──────────────────
Current Monthly Rent:              ${formatINRFull(rent)}
Expected Annual Rent Inflation:    ${rentInflation}%
Intended Property Purchase Price:  ${formatINRFull(propertyPrice)}
Projected Annual Appreciation:     ${appreciation}%
Comparison Time Horizon:           ${years} Years

📈 KEY METRICS
──────────────
Total Rent Outflow (${years} yrs):     ${formatINRFull(result.cumulativeRent)}
Property Value at Year ${years}:       ${formatINRFull(result.propertyValueAtN)}
Property Equity at Year ${years}:      ${formatINRFull(result.equityAtN)}
Remaining Loan Balance:               ${formatINRFull(result.remainingBalance)}
Total Interest Paid (${years} yrs):    ${formatINRFull(result.interestPaid)}
Maintenance Costs (${years} yrs):      ${formatINRFull(result.maintenanceCost)}

💰 NET ADVANTAGE: ${result.buyingAdvantage >= 0 ? 'Buying' : 'Renting'} is better by ${formatINRFull(Math.abs(result.buyingAdvantage))} over ${years} years.

Assumed loan: 80% LTV at 8.5% for 20 years | Maintenance: 1% of property value/year

📋 YEAR-BY-YEAR BREAKDOWN
─────────────────────────
| Year | Cumulative Rent      | Property Equity      |
|------|----------------------|----------------------|
${tableRows}

🤖 AI ANALYSIS VERDICT
─────────────────────
${userName ? `${userName}, ` : ''}numbers don't lie. At your current rent inflation rate of ${rentInflation}%, you will spend ${formatINR(result.cumulativeRent)} in pure unrecoverable expenses over the next ${years} ${years === 1 ? 'year' : 'years'}. Transitioning that liquidity into a home asset at ${formatINR(propertyPrice)} traps that wealth inside an appreciating asset worth ${formatINR(result.propertyValueAtN)} by year ${years}.

${result.buyingAdvantage >= 0 ? `Buying creates a net wealth advantage of ${formatINR(result.buyingAdvantage)} compared to continuing as a tenant. That's wealth that stays in your family, not your landlord's.` : `In this specific scenario, the numbers suggest renting may currently hold a marginal advantage. Adjusting your property price or timeline could shift the calculus.`}
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
      `Hi! I just completed my Rent vs. Buy Analysis:\n\n` +
        `• Monthly Rent: ${formatINR(rent)}\n` +
        `• Property Price: ${formatINR(propertyPrice)}\n` +
        `• ${years}-Year Net Advantage: ${formatINR(Math.abs(result.buyingAdvantage))}\n` +
        `• Property Value at Year ${years}: ${formatINR(result.propertyValueAtN)}\n\n` +
        `I'd like expert guidance on making the transition.`
    );
    window.open(`https://wa.me/${AGENT_PHONE}?text=${msg}`, '_blank');
  };

  return (
    <div>
      {/* ── Input Section ─────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mb-6">
        <h3 className="text-lg font-bold text-[#212529] mb-1">
          Configure Rent vs. Buy Analysis
        </h3>
        <p className="text-xs text-gray-400 mb-6">
          See the long-term wealth impact of transitioning from tenant to homeowner.
        </p>

        <SliderInput
          label="Current Monthly Rent Paid"
          value={rent}
          onChange={setRent}
          min={10000}
          max={200000}
          step={1000}
          formatDisplay={(v) => formatINR(v)}
        />

        <SliderInput
          label="Expected Annual Rent Inflation"
          value={rentInflation}
          onChange={setRentInflation}
          min={3}
          max={12}
          step={0.5}
          formatDisplay={(v) => `${v.toFixed(1)}%`}
        />

        <SliderInput
          label="Intended Property Purchase Price"
          value={propertyPrice}
          onChange={setPropertyPrice}
          min={2000000}
          max={50000000}
          step={100000}
          formatDisplay={(v) => formatINR(v)}
        />

        <SliderInput
          label="Projected Real Estate Annual Appreciation"
          value={appreciation}
          onChange={setAppreciation}
          min={3}
          max={12}
          step={0.5}
          formatDisplay={(v) => `${v.toFixed(1)}%`}
        />

        <SliderInput
          label="Comparison Time Horizon"
          value={years}
          onChange={setYears}
          min={3}
          max={25}
          step={1}
          formatDisplay={(v) => `${v} Years`}
        />

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
          {/* Highlight Box */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 text-center">
            <p className="text-sm text-gray-400 mb-1 uppercase tracking-wide">
              {result.buyingAdvantage >= 0
                ? 'Buying saves you'
                : 'Renting currently saves you'}
            </p>
            <h2 className="text-3xl md:text-5xl font-extrabold text-[#0F5132] mb-1">
              {formatINR(Math.abs(result.buyingAdvantage))}
            </h2>
            <p className="text-sm text-gray-400">
              over {years} years compared to{' '}
              {result.buyingAdvantage >= 0 ? 'renting' : 'buying'}
            </p>
          </div>

          {/* Comparison Bar Chart */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            <h4 className="text-sm font-bold text-[#212529] mb-5">
              Rent Expense vs. Property Equity Creation
            </h4>

            {/* Rent Bar */}
            <div className="mb-5">
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-gray-500 font-medium">Cumulative Rent Outflow</span>
                <span className="font-bold text-[#dc3545]">
                  {formatINR(result.cumulativeRent)}
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-7 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#dc3545] to-[#e74c3c] animate-grow"
                  style={{
                    width: `${Math.max(2, (result.cumulativeRent / maxBarVal) * 100)}%`,
                  }}
                />
              </div>
            </div>

            {/* Equity Bar */}
            <div className="mb-2">
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-gray-500 font-medium">
                  Property Equity at Year {years}
                </span>
                <span className="font-bold text-[#0F5132]">
                  {formatINR(result.equityAtN)}
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-7 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#0F5132] to-[#198754] animate-grow"
                  style={{
                    width: `${Math.max(2, (result.equityAtN / maxBarVal) * 100)}%`,
                  }}
                />
              </div>
            </div>

            <div className="flex justify-between text-xs text-gray-400 mt-3">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-[#dc3545] inline-block" />
                Pure Expense (No Asset)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-[#0F5132] inline-block" />
                Asset-Backed Equity
              </span>
            </div>
          </div>

          {/* Key Metrics Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Rent Outflow', value: formatINR(result.cumulativeRent), color: '#dc3545' },
              { label: 'Property Value', value: formatINR(result.propertyValueAtN), color: '#0F5132' },
              { label: 'Loan Balance', value: formatINR(result.remainingBalance), color: '#856404' },
              { label: 'Net Equity', value: formatINR(result.equityAtN), color: '#0F5132' },
            ].map((item) => (
              <div
                key={item.label}
                className="bg-white rounded-xl border border-gray-100 p-4 text-center"
              >
                <p className="text-[11px] text-gray-400 uppercase tracking-wide mb-1">
                  {item.label}
                </p>
                <p className="text-sm font-bold" style={{ color: item.color }}>
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          {/* Year-by-Year Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            <h4 className="text-sm font-bold text-[#212529] mb-4">
              Year-by-Year Breakdown
            </h4>
            <div className="overflow-x-auto -mx-2">
              <table className="w-full min-w-[420px]">
                <thead>
                  <tr className="bg-[#F8F9FA]">
                    <th className="text-left px-4 py-2.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Year
                    </th>
                    <th className="text-right px-4 py-2.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Cumulative Rent
                    </th>
                    <th className="text-right px-4 py-2.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Property Equity
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {result.yearlyData.map((d) => (
                    <tr key={d.year} className="border-t border-gray-50 hover:bg-gray-50/50">
                      <td className="px-4 py-2.5 text-sm font-medium text-[#212529]">
                        Year {d.year}
                      </td>
                      <td className="px-4 py-2.5 text-sm text-[#dc3545] text-right font-medium">
                        {formatINR(d.cumulativeRent)}
                      </td>
                      <td className="px-4 py-2.5 text-sm text-[#0F5132] text-right font-bold">
                        {formatINR(d.equityValue)}
                      </td>
                    </tr>
                  ))}
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
                <strong className="text-[#212529]">{userName}, </strong>
              ) : null}
              numbers don&apos;t lie. At your current rent inflation rate of{' '}
              <strong className="text-[#212529]">{rentInflation}%</strong>, you will spend{' '}
              <strong className="text-[#dc3545]">
                {formatINR(result.cumulativeRent)}
              </strong>{' '}
              in pure unrecoverable expenses over the next {years}{' '}
              {years === 1 ? 'year' : 'years'}. Transitioning that liquidity into a home asset
              at <strong className="text-[#212529]">{formatINR(propertyPrice)}</strong> traps
              that wealth inside an appreciating asset worth{' '}
              <strong className="text-[#0F5132]">
                {formatINR(result.propertyValueAtN)}
              </strong>{' '}
              by year {years}.{' '}
              {result.buyingAdvantage >= 0 ? (
                <>
                  Buying creates a net wealth advantage of{' '}
                  <strong className="text-[#0F5132]">
                    {formatINR(result.buyingAdvantage)}
                  </strong>{' '}
                  compared to continuing as a tenant. That&apos;s wealth that stays in your
                  family, not your landlord&apos;s.
                </>
              ) : (
                <>
                  In this specific scenario, the short-term numbers slightly favor renting.
                  However, extending your timeline or adjusting the property budget could
                  significantly shift the calculus in favor of buying.
                </>
              )}
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
              {copied ? '✅ Copied to Clipboard!' : '📋 Copy Full Report to Clipboard'}
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
