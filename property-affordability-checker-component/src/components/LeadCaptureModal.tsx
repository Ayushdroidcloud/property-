import { useState } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, phone: string) => void;
}

export default function LeadCaptureModal({ isOpen, onClose, onSubmit }: Props) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || name.trim().length < 2) {
      setError('Please enter your full name (at least 2 characters).');
      return;
    }
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length < 10) {
      setError('Please enter a valid phone number (at least 10 digits).');
      return;
    }
    setError('');
    onSubmit(name.trim(), cleaned);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn"
      style={{ backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 animate-slideUp relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-all"
        >
          ✕
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-[#d1e7dd] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-[#0F5132]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-[#212529] mb-1">
            Unlock Your Financial Audit
          </h3>
          <p className="text-gray-400 text-sm">
            Your data stays private. We&apos;ll send your personalized report via WhatsApp.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl p-3 mb-4">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-[#212529] mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Rahul Sharma"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F5132] focus:border-transparent transition-all text-[#212529]"
              autoFocus
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-semibold text-[#212529] mb-1.5">
              WhatsApp / Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g., 9876543210"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F5132] focus:border-transparent transition-all text-[#212529]"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3.5 bg-[#0F5132] text-white font-bold rounded-xl hover:bg-[#0a3622] transition-all shadow-lg shadow-[#0F5132]/25 text-base"
          >
            Generate My Complete Report →
          </button>
        </form>

        <button
          onClick={onClose}
          className="w-full mt-3 py-2 text-gray-400 text-sm hover:text-gray-600 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
