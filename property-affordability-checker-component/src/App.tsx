import { useState, useCallback } from 'react';
import LeadCaptureModal from './components/LeadCaptureModal';
import AffordabilityChecker from './components/AffordabilityChecker';
import RentVsBuyCalculator from './components/RentVsBuyCalculator';
import EMICalculator from './components/EMICalculator';

const TABS = [
  {
    id: 'affordability',
    label: 'Affordability Checker',
    shortLabel: 'Affordability',
    icon: '🏠',
    step: 'Step 1',
    subtitle: 'What property valuation can I safely afford based on my income architecture?',
  },
  {
    id: 'rentvsbuy',
    label: 'Rent vs. Buy Analyzer',
    shortLabel: 'Rent vs. Buy',
    icon: '📊',
    step: 'Step 2',
    subtitle: 'Should I buy? What is the long-term wealth impact versus renting?',
  },
  {
    id: 'emi',
    label: 'EMI & Sensitivity Calculator',
    shortLabel: 'EMI Calculator',
    icon: '💰',
    step: 'Step 3',
    subtitle: 'What are my exact monthly commitments and interest optimization opportunities?',
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('affordability');
  const [showModal, setShowModal] = useState(false);
  const [pendingCallback, setPendingCallback] = useState<(() => void) | null>(null);
  const [userName, setUserName] = useState<string | null>(
    localStorage.getItem('propwealth_name')
  );
  const [userPhone, setUserPhone] = useState<string | null>(
    localStorage.getItem('propwealth_phone')
  );

  const onRequestGenerate = useCallback((callback: () => void) => {
    const storedName = localStorage.getItem('propwealth_name');
    const storedPhone = localStorage.getItem('propwealth_phone');
    if (storedName && storedPhone) {
      setUserName(storedName);
      setUserPhone(storedPhone);
      callback();
    } else {
      setPendingCallback(() => callback);
      setShowModal(true);
    }
  }, []);

  const handleLeadSubmit = (name: string, phone: string) => {
    localStorage.setItem('propwealth_name', name);
    localStorage.setItem('propwealth_phone', phone);
    setUserName(name);
    setUserPhone(phone);
    setShowModal(false);
    if (pendingCallback) {
      pendingCallback();
      setPendingCallback(null);
    }
  };

  const activeTabData = TABS.find((t) => t.id === activeTab)!;

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col">
      {/* ── Header ──────────────────────────── */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#0F5132] rounded-xl flex items-center justify-center">
                <span className="text-white text-lg font-bold">P</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-[#212529] leading-tight">
                  <span className="text-[#0F5132]">PropWealth</span> Analytics
                </h1>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest">
                  Real Estate Financial Intelligence
                </p>
              </div>
            </div>
            {userName && (
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-[#212529]">{userName}</p>
                <p className="text-[11px] text-gray-400">{userPhone}</p>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Tab Navigation ──────────────────── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex overflow-x-auto gap-2 py-3 no-scrollbar">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-[#0F5132] text-white shadow-lg shadow-[#0F5132]/25'
                      : 'bg-gray-50 text-gray-500 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <span className="mr-1.5">{tab.icon}</span>
                  <span className="hidden md:inline">{tab.label}</span>
                  <span className="md:hidden">{tab.shortLabel}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Tab Header ──────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 pt-6 pb-1 w-full">
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-bold text-[#0F5132] bg-[#d1e7dd] px-2.5 py-1 rounded-full uppercase tracking-wider">
            {activeTabData.step}
          </span>
          <div className="flex gap-1">
            {TABS.map((tab) => (
              <div
                key={tab.id}
                className={`w-8 h-1 rounded-full transition-all ${
                  activeTab === tab.id ? 'bg-[#0F5132]' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-[#212529] mt-3">
          {activeTabData.icon} {activeTabData.shortLabel}
        </h2>
        <p className="text-sm text-gray-400 mt-1 mb-2">{activeTabData.subtitle}</p>
      </div>

      {/* ── Content ─────────────────────────── */}
      <main className="max-w-4xl mx-auto px-4 pb-16 w-full flex-1">
        <div style={{ display: activeTab === 'affordability' ? 'block' : 'none' }}>
          <AffordabilityChecker
            onRequestGenerate={onRequestGenerate}
            userName={userName}
          />
        </div>
        <div style={{ display: activeTab === 'rentvsbuy' ? 'block' : 'none' }}>
          <RentVsBuyCalculator
            onRequestGenerate={onRequestGenerate}
            userName={userName}
          />
        </div>
        <div style={{ display: activeTab === 'emi' ? 'block' : 'none' }}>
          <EMICalculator
            onRequestGenerate={onRequestGenerate}
            userName={userName}
          />
        </div>
      </main>

      {/* ── Footer ──────────────────────────── */}
      <footer className="bg-white border-t border-gray-100 py-6 mt-auto">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-[11px] text-gray-400">
            © {new Date().getFullYear()} PropWealth Analytics. All calculations are
            estimates for informational purposes only. Not financial advice.
          </p>
        </div>
      </footer>

      {/* ── Lead Capture Modal ──────────────── */}
      <LeadCaptureModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleLeadSubmit}
      />
    </div>
  );
}
