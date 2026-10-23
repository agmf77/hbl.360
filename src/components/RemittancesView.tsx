import React, { useState, useMemo } from 'react';
import { 
  Send, 
  Plus, 
  Printer, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Building2, 
  Eye, 
  X,
  AlertCircle,
  RefreshCw,
  Trash2,
  ChevronDown
} from 'lucide-react';
import { BankAdvice, Loan, Repayment, PbsSettings, UserSession } from '../types';
import { OfficialAdviceDocumentsModal } from './OfficialAdviceDocumentsModal';

interface RemittancesViewProps {
  bankAdvices: BankAdvice[];
  loans: Loan[];
  repayments: Repayment[];
  settings: PbsSettings;
  currentUser: UserSession;
  onCreateAdvice: (data: any) => Promise<void>;
  onUpdateStatus: (id: string, status: BankAdvice['status']) => void;
  onDeleteAdvice?: (id: string) => Promise<void>;
  onRefresh?: () => void;
  isProcessing: boolean;
}

// Helper to convert English numerals to Bengali
export const toBnNumber = (num: number | string): string => {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  const str = typeof num === 'number' ? num.toLocaleString('en-US') : String(num);
  return str.replace(/[0-9]/g, (w) => bnDigits[+w]);
};

export const RemittancesView: React.FC<RemittancesViewProps> = ({
  bankAdvices = [],
  loans = [],
  repayments = [],
  settings,
  currentUser,
  onCreateAdvice,
  onUpdateStatus,
  onDeleteAdvice,
  onRefresh,
  isProcessing
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [previewAdvice, setPreviewAdvice] = useState<BankAdvice | null>(null);

  // Pagination state matching screenshot
  const [pageSize, setPageSize] = useState<number>(4);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Form State for creating new advice
  const [targetPbs, setTargetPbs] = useState('কুমিল্লা পল্লী বিদ্যুৎ সমিতি-১');
  const [bankName, setBankName] = useState('জনতা ব্যাংক পিএলসি, চান্দিনা শাখা');
  const [accountNo, setAccountNo] = useState('২৪০০-১১৯২০২-৭');
  const [routingNo, setRoutingNo] = useState('১৩৫২৬০৭৭৮');
  const [monthDescInput, setMonthDescInput] = useState('অক্টোবর/২০২৬ মাস');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  // Eligible transferred loans with other PBS
  const transferredLoans = useMemo(() => {
    return loans.filter(l => l.loanSource === 'other');
  }, [loans]);

  const [selectedLoanIds, setSelectedLoanIds] = useState<{ [key: string]: boolean }>({});

  const handleOpenCreate = () => {
    setError('');
    // Pre-select all transferred loans by default
    const preselected: { [key: string]: boolean } = {};
    transferredLoans.forEach(l => {
      preselected[l.id] = true;
    });
    setSelectedLoanIds(preselected);
    setShowCreateModal(true);
  };

  const handleToggleLoan = (loanId: string) => {
    setSelectedLoanIds(prev => {
      const next = { ...prev, [loanId]: !prev[loanId] };
      if (Object.values(next).some(Boolean)) {
        setError('');
      }
      return next;
    });
  };

  const handleToggleSelectAll = () => {
    const allSelected = transferredLoans.length > 0 && transferredLoans.every(l => selectedLoanIds[l.id]);
    const next: { [key: string]: boolean } = {};
    if (!allSelected) {
      transferredLoans.forEach(l => {
        next[l.id] = true;
      });
      setError('');
    }
    setSelectedLoanIds(next);
  };

  const selectedLoansCount = useMemo(() => {
    return transferredLoans.filter(l => selectedLoanIds[l.id]).length;
  }, [transferredLoans, selectedLoanIds]);

  const selectedLoansTotalAmount = useMemo(() => {
    return transferredLoans
      .filter(l => selectedLoanIds[l.id])
      .reduce((sum, l) => sum + (l.monthlyInstallment || 0), 0);
  }, [transferredLoans, selectedLoanIds]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedLoansList = transferredLoans.filter(l => selectedLoanIds[l.id]);

    if (selectedLoansList.length === 0) {
      setError('দয়া করে অন্তত একজন কর্মচারীর কিস্তি নির্বাচন করুন।');
      return;
    }

    const items = selectedLoansList.map(loan => ({
      loanId: loan.id,
      employeeId: loan.employeeId,
      payId: loan.payId,
      employeeNameBn: loan.employeeNameBn,
      installmentMonth: monthDescInput || 'অক্টোবর/২০২৬ মাস',
      amount: loan.monthlyInstallment || 0
    }));

    try {
      setError('');
      await onCreateAdvice({
        toPbs: targetPbs,
        bankName,
        accountNo,
        routingNo,
        monthDescription: monthDescInput,
        employeeCount: items.length,
        items,
        notes
      });
      setShowCreateModal(false);
    } catch (err: any) {
      setError(err.message || 'ব্যাংক অ্যাডভাইস তৈরি ব্যর্থ হয়েছে।');
    }
  };

  const handleDelete = async (id: string) => {
    if (onDeleteAdvice) {
      await onDeleteAdvice(id);
    } else {
      if (!confirm('আপনি কি এই প্রস্তুতকৃত ব্যাংক অ্যাডভাইসটি বাতিল করতে চান?')) return;
      try {
        const res = await fetch(`/api/remittances/${id}?user=${currentUser.nameBn}`, {
          method: 'DELETE'
        });
        const data = await res.json();
        if (data.success && onRefresh) {
          onRefresh();
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Helper to determine the Month display text
  const getMonthDisplayText = (adv: BankAdvice): string => {
    if (adv.monthDescription) return adv.monthDescription;
    if (adv.items && adv.items.length > 0) {
      const distinctMonths = Array.from(new Set(adv.items.map(i => i.installmentMonth)));
      if (distinctMonths.length === 1) {
        return `${distinctMonths[0]} মাস`;
      } else if (distinctMonths.length > 1) {
        return `${distinctMonths[0]} হতে ${distinctMonths[distinctMonths.length - 1]} পর্যন্ত (${toBnNumber(distinctMonths.length)} মাস)`;
      }
    }
    return 'অক্টোবর/২০২৬ মাস';
  };

  // Helper to determine employee count
  const getEmployeeCount = (adv: BankAdvice): number => {
    if (adv.employeeCount) return adv.employeeCount;
    if (adv.items && adv.items.length > 0) {
      return new Set(adv.items.map(i => i.payId)).size || adv.items.length;
    }
    return 1;
  };

  // Filter non-deleted bank advices
  const nonDeletedAdvices = useMemo(() => {
    return bankAdvices.filter(b => !b.isDeleted);
  }, [bankAdvices]);

  // Pagination calculation
  const totalCount = nonDeletedAdvices.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedAdvices = nonDeletedAdvices.slice(startIndex, endIndex);

  return (
    <div className="space-y-5">
      {/* Page Header (Exactly matching reference screenshot image_e1893524.png) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            প্রস্তুতকৃত ব্যাংক অ্যাডভাইস ও সরকারি পত্রসমূহ
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            তৈরি করা ব্যাংক অ্যাডভাইস ও পবিসে প্রেরিত সরকারি পত্র দেখুন, প্রিন্ট করুন বা বাতিল করুন
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {currentUser.role !== 'employee' && (
            <button
              onClick={handleOpenCreate}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-2xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>নতুন ব্যাংক অ্যাডভাইস</span>
            </button>
          )}

          <button
            onClick={() => onRefresh && onRefresh()}
            disabled={isProcessing}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isProcessing ? 'animate-spin' : ''}`} />
            <span>রিফ্রেশ</span>
          </button>
        </div>
      </div>

      {/* Main Table Container (Exact columns, layout, and styling matching image_e1893524.png) */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs no-print">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left min-w-[840px] border-collapse">
            <thead className="bg-white border-b border-slate-200 text-slate-700 font-bold">
              <tr>
                <th className="py-3.5 px-4 font-semibold text-slate-700">অ্যাডভাইস নং ও তারিখ</th>
                <th className="py-3.5 px-3 font-semibold text-slate-700">স্মারক নং (Memo No)</th>
                <th className="py-3.5 px-3 font-semibold text-slate-700">প্রাপক পবিস</th>
                <th className="py-3.5 px-3 font-semibold text-slate-700">মাস</th>
                <th className="py-3.5 px-3 font-semibold text-slate-700 text-center">কর্মচারী সংখ্যা</th>
                <th className="py-3.5 px-3 font-semibold text-slate-700 text-center">সর্বমোট টাকা</th>
                <th className="py-3.5 px-4 font-semibold text-slate-700 text-center">প্রিন্ট / পত্র দেখুন</th>
                <th className="py-3.5 px-3 font-semibold text-slate-700 text-center">অ্যাকশন</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {paginatedAdvices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-medium">
                    কোনো প্রস্তুতকৃত ব্যাংক অ্যাডভাইস পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                paginatedAdvices.map((adv) => {
                  const empCount = getEmployeeCount(adv);
                  const monthText = getMonthDisplayText(adv);

                  return (
                    <tr key={adv.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* অ্যাডভাইস নং ও তারিখ */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#5b21b6] font-mono text-xs tracking-tight">
                          {adv.adviceNo}
                        </div>
                        <div className="text-[11px] text-slate-400 font-num mt-0.5">
                          {toBnNumber(adv.adviceDate)}
                        </div>
                      </td>

                      {/* স্মারক নং (Memo No) */}
                      <td className="py-3.5 px-3">
                        <div className="text-xs text-slate-700 font-num">
                          {adv.memoNo}
                        </div>
                      </td>

                      {/* প্রাপক পবিস */}
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-slate-800 text-xs">
                          {adv.toPbs}
                        </div>
                      </td>

                      {/* মাস */}
                      <td className="py-3.5 px-3">
                        <div className="text-xs text-slate-700">
                          {monthText}
                        </div>
                      </td>

                      {/* কর্মচারী সংখ্যা */}
                      <td className="py-3.5 px-3 text-center">
                        <div className="font-bold text-slate-800 text-xs">
                          {toBnNumber(empCount)} জন
                        </div>
                      </td>

                      {/* সর্বমোট টাকা */}
                      <td className="py-3.5 px-3 text-center">
                        <div className="font-bold text-slate-900 font-num text-xs">
                          {toBnNumber(adv.totalAmount)}
                        </div>
                      </td>

                      {/* প্রিন্ট / পত্র দেখুন */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => setPreviewAdvice(adv)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#ecfdf5] hover:bg-emerald-100 text-[#065f46] font-semibold text-xs border border-emerald-200/80 transition-colors shadow-2xs"
                        >
                          <Printer className="w-3.5 h-3.5 text-emerald-600" />
                          <span>পত্র / অ্যাডভাইস</span>
                        </button>
                      </td>

                      {/* অ্যাকশন */}
                      <td className="py-3.5 px-3 text-center">
                        <button
                          onClick={() => handleDelete(adv.id)}
                          title="অ্যাডভাইস বাতিল করুন"
                          className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer / Pagination Bar (Matching image_e1893524.png) */}
        <div className="px-4 py-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 bg-white">
          {/* Left: Page Size Selector & Count */}
          <div className="flex items-center gap-2 text-xs">
            <span>প্রতি পৃষ্ঠায়:</span>
            <div className="relative">
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="appearance-none pl-2.5 pr-7 py-1 rounded-md border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-2xs"
              >
                <option value={4}>সর্বশেষ ৪</option>
                <option value={10}>সর্বশেষ ১০</option>
                <option value={20}>সর্বশেষ ২০</option>
                <option value={50}>সর্বশেষ ৫০</option>
              </select>
              <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-2.5 pointer-events-none" />
            </div>
            <span className="text-slate-500 font-num">
              {totalCount > 0 ? (
                <>
                  {toBnNumber(startIndex + 1)}-{toBnNumber(Math.min(endIndex, totalCount))} / {toBnNumber(totalCount)} টি অ্যাডভাইস
                </>
              ) : (
                '০ টি অ্যাডভাইস'
              )}
            </span>
          </div>

          {/* Right: Previous / Page Number / Next */}
          <div className="flex items-center gap-2 text-xs font-medium">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={validCurrentPage <= 1}
              className="px-3 py-1 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs transition-colors"
            >
              আগের
            </button>

            <span className="px-2 font-num text-slate-700 font-medium">
              পৃষ্ঠা {toBnNumber(validCurrentPage)} / {toBnNumber(totalPages)}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={validCurrentPage >= totalPages}
              className="px-3 py-1 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs transition-colors"
            >
              পরের
            </button>
          </div>
        </div>
      </div>

      {/* 3-in-1 Official Document Viewer & Print Modal (পবিস অবহিতকরণ পত্র, ব্যাংক অ্যাডভাইস, অফিস নোট) */}
      {previewAdvice && (
        <OfficialAdviceDocumentsModal
          advice={previewAdvice}
          loans={loans}
          settings={settings}
          currentUser={currentUser}
          onClose={() => setPreviewAdvice(null)}
        />
      )}

      {/* Create New Advice Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/65 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border-2 border-slate-300 w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]">
            <div className="px-6 py-4.5 border-b-2 border-slate-200 flex items-center justify-between bg-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold shadow-xs">
                  <Plus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-950 text-base sm:text-lg">
                    নতুন ব্যাংক অ্যাডভাইস ও সরকারি পত্র প্রস্তুত
                  </h3>
                  <p className="text-xs font-semibold text-slate-700">
                    অন্যান্য পবিসের কর্মকর্তা-কর্মচারীদের কর্তিত কিস্তির ব্যাংক ট্রান্সফার অ্যাডভাইস
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowCreateModal(false)} 
                className="text-slate-500 hover:text-slate-900 p-2 rounded-lg hover:bg-slate-200 transition-colors border border-transparent hover:border-slate-300"
                title="বন্ধ করুন"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
              {error && (
                <div className="p-3.5 rounded-xl bg-red-50 border-2 border-red-300 text-red-900 flex items-center gap-2.5 font-bold animate-in fade-in">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block font-extrabold text-slate-900 mb-1">প্রাপক পবিসের নাম *</label>
                <input
                  type="text"
                  value={targetPbs}
                  onChange={(e) => setTargetPbs(e.target.value)}
                  placeholder="উদা: কুমিল্লা পল্লী বিদ্যুৎ সমিতি-১ বা সকল পবিস"
                  className="w-full px-3.5 py-2.5 rounded-lg border-2 border-slate-300 font-semibold text-slate-950 text-xs sm:text-sm focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 shadow-2xs"
                  required
                />
              </div>

              <div>
                <label className="block font-extrabold text-slate-900 mb-1">কর্তন মাসের বিবরণ</label>
                <input
                  type="text"
                  value={monthDescInput}
                  onChange={(e) => setMonthDescInput(e.target.value)}
                  placeholder="উদা: অক্টোবর/২০২৬ মাস বা অক্টোবর হতে নভেম্বর পর্যন্ত (২ মাস)"
                  className="w-full px-3.5 py-2.5 rounded-lg border-2 border-slate-300 font-semibold text-slate-950 text-xs sm:text-sm focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 shadow-2xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-extrabold text-slate-900 mb-1">প্রাপকের ব্যাংক ও শাখা</label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg border-2 border-slate-300 font-semibold text-slate-950 text-xs sm:text-sm shadow-2xs focus:border-emerald-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-extrabold text-slate-900 mb-1">প্রাপকের ব্যাংক হিসাব নং</label>
                  <input
                    type="text"
                    value={accountNo}
                    onChange={(e) => setAccountNo(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg border-2 border-slate-300 font-num font-bold text-slate-950 text-xs sm:text-sm shadow-2xs focus:border-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-extrabold text-slate-900 mb-1">ব্যাংক রাউটিং নম্বর</label>
                <input
                  type="text"
                  value={routingNo}
                  onChange={(e) => setRoutingNo(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border-2 border-slate-300 font-num font-bold text-slate-950 text-xs sm:text-sm shadow-2xs focus:border-emerald-600 focus:outline-none"
                />
              </div>

              {/* Eligible Transferred Deductions */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block font-extrabold text-slate-900">
                    অ্যাডভাইসে অন্তর্ভুক্ত করার জন্য কর্মকর্তা/কর্মচারীর কিস্তি নির্বাচন করুন:
                  </label>
                  <button
                    type="button"
                    onClick={handleToggleSelectAll}
                    className="text-xs text-emerald-800 hover:text-emerald-950 font-black hover:underline"
                  >
                    {transferredLoans.length > 0 && transferredLoans.every(l => selectedLoanIds[l.id]) ? 'সকল নির্বাচন বাতিল' : 'সকল নির্বাচন করুন'}
                  </button>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto border-2 border-slate-200 p-2.5 rounded-xl bg-slate-50">
                  {transferredLoans.length === 0 ? (
                    <div className="text-center py-6 text-slate-500 font-medium">
                      কোনো বদলিকৃত কর্মকর্তা/কর্মচারীর ঋণ হিসাব পাওয়া যায়নি।
                    </div>
                  ) : (
                    transferredLoans.map(loan => {
                      const isChecked = !!selectedLoanIds[loan.id];

                      return (
                        <label 
                          key={loan.id} 
                          className={`flex items-center justify-between p-2.5 rounded-lg border-2 transition-all cursor-pointer ${
                            isChecked 
                              ? 'bg-emerald-50 border-emerald-400 shadow-2xs' 
                              : 'bg-white border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleToggleLoan(loan.id)}
                              className="rounded text-emerald-700 focus:ring-emerald-600 w-4 h-4 cursor-pointer"
                            />
                            <div>
                              <div className="font-extrabold text-slate-950 text-xs sm:text-sm">
                                {loan.employeeNameBn} ({loan.payId})
                              </div>
                              <div className="text-[11px] text-slate-600 font-medium">
                                {loan.lendingPbs} · ঋণ নং {loan.loanNo}
                              </div>
                            </div>
                          </div>
                          <div className="font-num font-black text-slate-950 text-xs sm:text-sm">
                            ৳ {loan.monthlyInstallment.toLocaleString()}
                          </div>
                        </label>
                      );
                    })
                  )}
                </div>

                {/* Live Selection Summary */}
                <div className="mt-2.5 p-3 rounded-xl bg-emerald-100/90 border-2 border-emerald-400 text-emerald-950 flex items-center justify-between text-xs sm:text-sm font-bold">
                  <span>নির্বাচিত কর্মকর্তা/কর্মচারী: <strong>{toBnNumber(selectedLoansCount)}</strong> জন</span>
                  <span className="font-num font-black text-sm sm:text-base">সর্বমোট: ৳ {selectedLoansTotalAmount.toLocaleString()}</span>
                </div>
              </div>

              <div>
                <label className="block font-extrabold text-slate-900 mb-1">মন্তব্য (ঐচ্ছিক)</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="ব্যাংক অ্যাডভাইসের বিশেষ দ্রষ্টব্য..."
                  className="w-full px-3.5 py-2 rounded-lg border-2 border-slate-300 font-medium text-slate-950 text-xs sm:text-sm shadow-2xs"
                />
              </div>

              <div className="pt-4 border-t-2 border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-5 py-2.5 rounded-xl border-2 border-slate-300 hover:bg-slate-100 text-slate-900 text-xs sm:text-sm font-bold transition-colors shadow-2xs"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isProcessing || selectedLoansCount === 0}
                  className="px-6 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 disabled:bg-slate-300 disabled:text-slate-500 text-white text-xs sm:text-sm font-black shadow-xs transition-all active:scale-95 disabled:active:scale-100 cursor-pointer disabled:cursor-not-allowed"
                >
                  {isProcessing ? 'প্রস্তুত হচ্ছে...' : 'অ্যাডভাইস প্রস্তুত সম্পন্ন করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
