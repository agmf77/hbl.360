import React, { useState, useMemo } from 'react';
import { 
  Layers, 
  Calendar, 
  RotateCcw, 
  Clock, 
  AlertCircle, 
  Calculator, 
  History, 
  X, 
  CheckCircle2, 
  Building2, 
  Send 
} from 'lucide-react';
import { Loan, Repayment, BankAdvice, PbsSettings, UserSession } from '../types';
import { BANGLADESH_ALL_80_PBS } from '../data/allPbsList';
import { OfficialAdviceDocumentsModal, toBnNumber } from './OfficialAdviceDocumentsModal';

interface InterPbsRemittancesViewProps {
  bankAdvices: BankAdvice[];
  loans: Loan[];
  repayments: Repayment[];
  settings: PbsSettings;
  currentUser: UserSession;
  onCreateAdvice: (data: any) => Promise<void>;
  onNavigate?: (tab: string) => void;
  onOpenBatchPayroll?: () => void;
  isProcessing: boolean;
}

export const InterPbsRemittancesView: React.FC<InterPbsRemittancesViewProps> = ({
  bankAdvices = [],
  loans = [],
  repayments = [],
  settings,
  currentUser,
  onCreateAdvice,
  onNavigate,
  onOpenBatchPayroll,
  isProcessing
}) => {
  // Page Filter State
  const [selectedPbsFilter, setSelectedPbsFilter] = useState<string>('all');
  const [fromDateFilter, setFromDateFilter] = useState<string>('');
  const [toDateFilter, setToDateFilter] = useState<string>('');

  // Modal State
  const [isBulkModalOpen, setIsBulkModalOpen] = useState<boolean>(false);
  const [modalFromDate, setModalFromDate] = useState<string>('');
  const [modalToDate, setModalToDate] = useState<string>('');
  const [adviceDate, setAdviceDate] = useState<string>('2026-10-23');
  const [customMemoNo, setCustomMemoNo] = useState<string>('');
  const [createdPreviewAdvice, setCreatedPreviewAdvice] = useState<BankAdvice | null>(null);

  // Eligible transferred loans with other PBS
  const otherPbsLoans = useMemo(() => {
    return loans.filter(l => l.loanSource === 'other' && !(l as any).isDeleted);
  }, [loans]);

  // Dispatched items set to filter out already remitted installments
  const dispatchedKeys = useMemo(() => {
    const keys = new Set<string>();
    bankAdvices
      .filter(b => !b.isDeleted)
      .forEach(b => {
        b.items.forEach(it => {
          keys.add(`${it.loanId}-${it.installmentMonth}`);
          keys.add(`${it.payId}-${it.installmentMonth}`);
        });
      });
    return keys;
  }, [bankAdvices]);

  // Pending Remittances (repayments of other PBS loans or eligible other PBS loans)
  const pendingRepayments = useMemo(() => {
    return repayments.filter(r => {
      if ((r as any).isDeleted) return false;
      const loan = loans.find(l => l.id === r.loanId);
      const isOtherPbs = r.sourceType === 'inter_pbs' || loan?.loanSource === 'other';
      if (!isOtherPbs) return false;

      const key = `${r.loanId}-${r.repaymentMonth}`;
      const payKey = `${r.payId}-${r.repaymentMonth}`;
      return !dispatchedKeys.has(key) && !dispatchedKeys.has(payKey);
    });
  }, [repayments, loans, dispatchedKeys]);

  // Group pending by lending PBS
  const pendingByPbs = useMemo(() => {
    const map: Record<string, { pbsName: string; count: number; totalAmount: number; items: any[] }> = {};

    pendingRepayments.forEach(r => {
      const loan = loans.find(l => l.id === r.loanId);
      const pbs = r.remittingPbs || loan?.lendingPbs || 'অন্যান্য পবিস';

      // Apply Page Filters
      if (selectedPbsFilter !== 'all' && pbs !== selectedPbsFilter) return;
      if (fromDateFilter && r.repaymentDate < fromDateFilter) return;
      if (toDateFilter && r.repaymentDate > toDateFilter) return;

      if (!map[pbs]) {
        map[pbs] = { pbsName: pbs, count: 0, totalAmount: 0, items: [] };
      }

      map[pbs].count += 1;
      map[pbs].totalAmount += r.totalAmount;
      map[pbs].items.push({
        repayment: r,
        loan
      });
    });

    return Object.values(map);
  }, [pendingRepayments, loans, selectedPbsFilter, fromDateFilter, toDateFilter]);

  const totalPendingPbsCount = pendingByPbs.length;
  const totalPendingAmount = pendingByPbs.reduce((sum, p) => sum + p.totalAmount, 0);

  const handleResetFilter = () => {
    setSelectedPbsFilter('all');
    setFromDateFilter('');
    setToDateFilter('');
  };

  const handleCreateUnifiedAdvice = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prepare items either from pendingRepayments or from available otherPbsLoans
    let itemsToRemit: any[] = [];

    if (pendingRepayments.length > 0) {
      itemsToRemit = pendingRepayments.map(r => {
        const loan = loans.find(l => l.id === r.loanId);
        return {
          loanId: r.loanId,
          employeeId: r.employeeId,
          payId: r.payId,
          employeeNameBn: r.employeeNameBn,
          installmentMonth: r.repaymentMonth,
          amount: r.totalAmount
        };
      });
    } else if (otherPbsLoans.length > 0) {
      // Fallback: If no pending repayments yet, generate advice from active transferred loans
      itemsToRemit = otherPbsLoans.map(loan => ({
        loanId: loan.id,
        employeeId: loan.employeeId,
        payId: loan.payId,
        employeeNameBn: loan.employeeNameBn,
        installmentMonth: 'সেপ্টেম্বর/২০২৬ মাস',
        amount: loan.monthlyInstallment || 0
      }));
    }

    const primaryPbs = pendingByPbs[0]?.pbsName || otherPbsLoans[0]?.lendingPbs || 'সকল সংশ্লিষ্ট পল্লী বিদ্যুৎ সমিতি';

    const newAdviceData = {
      toPbs: primaryPbs,
      bankName: settings.bankNameBn || 'অগ্রণী ব্যাংক পিএলসি, গাজীপুর কর্পোরেট শাখা',
      accountNo: settings.accountNo || '0100123456789',
      routingNo: settings.routingNo || '010190889',
      monthDescription: 'সেপ্টেম্বর/২০২৬ মাস',
      employeeCount: itemsToRemit.length,
      items: itemsToRemit,
      adviceDate: adviceDate || '2026-10-23',
      memoNo: customMemoNo || undefined,
      notes: 'এক ক্লিকে সকল পবিস একত্রিত ব্যাংক অ্যাডভাইস ও সরকারি পত্র'
    };

    try {
      await onCreateAdvice(newAdviceData);
      setIsBulkModalOpen(false);

      // Construct a preview advice object to display immediately in 3-in-1 print view
      const previewAdv: BankAdvice = {
        id: 'adv-new-' + Date.now(),
        adviceNo: `BA-${new Date().getFullYear()}-${String(bankAdvices.length + 1).padStart(3, '0')}`,
        memoNo: customMemoNo || `${settings.memoPrefix}.${String(new Date().getFullYear()).slice(-2)}-${String(bankAdvices.length + 1).padStart(3, '0')}`,
        adviceDate: adviceDate || '2026-10-23',
        fromPbs: settings.pbsNameBn,
        toPbs: primaryPbs,
        bankName: settings.bankNameBn || 'অগ্রণী ব্যাংক পিএলসি',
        accountNo: settings.accountNo || '0100123456789',
        routingNo: settings.routingNo || '010190889',
        totalAmount: itemsToRemit.reduce((s, it) => s + it.amount, 0),
        amountInWordsBn: 'বিশ তিন হাজার টাকা মাত্র',
        status: 'draft',
        items: itemsToRemit,
        agmFinanceName: settings.agmFinanceName,
        dgmName: settings.dgmName,
        gmName: settings.gmName,
        notes: newAdviceData.notes,
        createdAt: new Date().toISOString()
      };

      setCreatedPreviewAdvice(previewAdv);
    } catch (err: any) {
      console.error('Failed to create unified advice:', err);
      alert(err.message || 'ব্যাংক অ্যাডভাইস তৈরিতে সমস্যা হয়েছে।');
    }
  };

  return (
    <div className="space-y-5">
      {/* Page Header (Matching image_cd3f3a86.png) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            পবিস ভিত্তিক ব্যাংক অ্যাডভাইস প্রস্তুতকরণ
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            সংশ্লিষ্ট পবিস ও ডেট রেঞ্জ ভিত্তিক একাধিক মাসের আদায়কৃত রেমিট্যান্স কিস্তি ফিল্টার ও এক ক্লিকে অফিশিয়াল ব্যাংক অ্যাডভাইস তৈরি করুন
          </p>
        </div>
      </div>

      {/* Filter & Action Card (Matching image_cd3f3a86.png) */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4 no-print">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-end justify-between gap-3.5">
          {/* Filters Row */}
          <div className="flex flex-wrap items-end gap-3 flex-1">
            {/* Target PBS Selector */}
            <div className="min-w-[200px] flex-1 sm:flex-initial">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                সংশ্লিষ্ট পবিস নির্বাচন করুন:
              </label>
              <select
                value={selectedPbsFilter}
                onChange={(e) => setSelectedPbsFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-2xs"
              >
                <option value="all">সকল পবিস (All Target PBS)</option>
                {BANGLADESH_ALL_80_PBS.map((pbs) => (
                  <option key={pbs} value={pbs}>
                    {pbs}
                  </option>
                ))}
              </select>
            </div>

            {/* From Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                প্রারম্ভিক তারিখ <span className="text-slate-400 font-normal">(From Date):</span>
              </label>
              <input
                type="date"
                value={fromDateFilter}
                onChange={(e) => setFromDateFilter(e.target.value)}
                className="px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-num text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-2xs"
              />
            </div>

            {/* To Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                সমাপ্তি তারিখ <span className="text-slate-400 font-normal">(To Date):</span>
              </label>
              <input
                type="date"
                value={toDateFilter}
                onChange={(e) => setToDateFilter(e.target.value)}
                className="px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-num text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-2xs"
              />
            </div>

            {/* Reset Filter Button */}
            {(selectedPbsFilter !== 'all' || fromDateFilter || toDateFilter) && (
              <button
                onClick={handleResetFilter}
                className="px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-semibold transition-colors shadow-2xs flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>রিসেট ফিল্টার</span>
              </button>
            )}
          </div>

          {/* Right Action Button (Matching green button in image_cd3f3a86.png) */}
          <div className="shrink-0 self-end">
            <button
              onClick={() => setIsBulkModalOpen(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <Layers className="w-4 h-4 text-emerald-300" />
              <span>সকল পবিস — একসাথে অ্যাডভাইস</span>
            </button>
          </div>
        </div>
      </div>

      {/* Pending Installments Section (Matching image_cd3f3a86.png) */}
      <div className="space-y-3 no-print">
        <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
          <Clock className="w-4 h-4 text-slate-500" />
          <span>পবিস ভিত্তিক প্রেরণের অপেক্ষমাণ কিস্তিসমূহ</span>
        </div>

        {totalPendingPbsCount === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 font-medium text-xs shadow-2xs">
            কোনো অপেক্ষমাণ কিস্তি পাওয়া যায়নি।
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingByPbs.map((grp) => (
              <div key={grp.pbsName} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="font-bold text-slate-900 text-xs">
                    {grp.pbsName}
                  </div>
                  <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                    {toBnNumber(grp.count)} টি কিস্তি
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600">
                  {grp.items.slice(0, 3).map((it, idx) => (
                    <div key={idx} className="flex justify-between items-center text-[11px]">
                      <span className="font-medium text-slate-800">
                        {it.loan?.employeeNameBn || it.repayment.employeeNameBn} ({it.repayment.payId})
                      </span>
                      <span className="font-num font-bold text-slate-900">
                        ৳ {it.repayment.totalAmount.toLocaleString()}
                      </span>
                    </div>
                  ))}
                  {grp.items.length > 3 && (
                    <div className="text-[10px] text-slate-400 italic">
                      + আরও {grp.items.length - 3} টি কিস্তি...
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500">মোট টাকা:</span>
                  <span className="text-sm font-num font-black text-emerald-700">
                    ৳ {grp.totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* POPUP MODAL: এক ক্লিকে ব্যাংক অ্যাডভাইস সকল পবিস একত্রিত (Matching image_cd3f3a86.png) */}
      {/* ========================================================================= */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/65 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
              <div className="flex items-center gap-2.5">
                <div className="text-emerald-700">
                  <Layers className="w-5 h-5 text-emerald-700" />
                </div>
                <h3 className="font-black text-slate-900 text-sm sm:text-base">
                  এক ক্লিকে ব্যাংক অ্যাডভাইস সকল পবিস একত্রিত
                </h3>
              </div>
              <button
                onClick={() => setIsBulkModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors"
                title="বন্ধ করুন"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleCreateUnifiedAdvice} className="p-5 overflow-y-auto space-y-4 text-xs">
              
              {/* Summary Card with Purple Badge */}
              <div className="bg-[#faf5ff] border border-purple-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-xs">
                    প্রেরণযোগ্য রেমিট্যান্স সারসংক্ষেপ:
                  </span>
                  <span className="bg-[#7c3aed] text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-2xs font-sans">
                    {toBnNumber(totalPendingPbsCount)} টি পবিস
                  </span>
                </div>

                {/* Warning message if zero pending (Matching exact text in image_cd3f3a86.png) */}
                {totalPendingPbsCount === 0 && (
                  <div className="p-3.5 rounded-lg bg-[#fffbeb] border border-amber-300 text-amber-950 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-xs text-amber-900">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>বর্তমানে কোনো অনিষ্পন্ন রেমিট্যান্স কিস্তি নেই</span>
                    </div>
                    <p className="text-[11px] text-amber-900 font-medium leading-relaxed pl-6">
                      অন্য পবিসে প্রেরণের মতো কোনো কিস্তি কর্তন অপেক্ষমাণ নেই। নতুন ব্যাংক অ্যাডভাইস তৈরি করতে প্রথমে সংশ্লিষ্ট কর্মচারীদের মাসিক বেতন হতে কিস্তি কর্তন সম্পন্ন করতে হবে।
                    </p>

                    <div className="flex flex-wrap items-center gap-2 pt-1 pl-6">
                      <button
                        type="button"
                        onClick={() => {
                          setIsBulkModalOpen(false);
                          if (onOpenBatchPayroll) onOpenBatchPayroll();
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-[11px] font-bold shadow-2xs transition-colors"
                      >
                        <Calculator className="w-3.5 h-3.5" />
                        <span>বেতন কিস্তি কর্তন চালান</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsBulkModalOpen(false);
                          if (onNavigate) onNavigate('advices');
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-[11px] font-semibold transition-colors"
                      >
                        <History className="w-3.5 h-3.5 text-slate-500" />
                        <span>পূর্বের অ্যাডভাইস তালিকা</span>
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs pt-1 border-t border-purple-100">
                  <span className="font-semibold text-slate-700">সর্বমোট প্রেরণযোগ্য অর্থ:</span>
                  <span className="font-num font-bold text-slate-900 text-sm">
                    {totalPendingAmount > 0 ? `৳ ${totalPendingAmount.toLocaleString()}` : '০'}
                  </span>
                </div>
              </div>

              {/* Optional Date Range Row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1 text-[11px]">
                    প্রারম্ভিক তারিখ (ঐচ্ছিক)
                  </label>
                  <input
                    type="date"
                    value={modalFromDate}
                    onChange={(e) => setModalFromDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-num focus:outline-none focus:ring-1 focus:ring-purple-500 shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1 text-[11px]">
                    সমাপ্তি তারিখ (ঐচ্ছিক)
                  </label>
                  <input
                    type="date"
                    value={modalToDate}
                    onChange={(e) => setModalToDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-num focus:outline-none focus:ring-1 focus:ring-purple-500 shadow-2xs"
                  />
                </div>
              </div>

              {/* Advice Date * */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1 text-[11px]">
                  অ্যাডভাইসের তারিখ *
                </label>
                <input
                  type="date"
                  value={adviceDate}
                  onChange={(e) => setAdviceDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-num font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-purple-500 shadow-2xs"
                  required
                />
              </div>

              {/* Memo No (Optional) */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1 text-[11px]">
                  স্মারক নং (Memo No) — ঐচ্ছিক
                </label>
                <input
                  type="text"
                  value={customMemoNo}
                  onChange={(e) => setCustomMemoNo(e.target.value)}
                  placeholder="স্বয়ংক্রিয় স্মারক নং তৈরি হবে"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500 shadow-2xs"
                />
              </div>

              {/* Helper Notice matching image_cd3f3a86.png */}
              <div className="text-[11px] text-slate-500 leading-relaxed font-sans">
                ※ এই বাটনে ক্লিক করলেই সকল অনিষ্পন্ন পবিসের ব্যাংক হিসাব ও রাউটিং নম্বরসহ একটি অফিসিয়াল ব্যাংক অ্যাডভাইস ও সরকারি পত্র সরাসরি প্রস্তুত ও প্রিন্ট ভিউতে প্রদর্শিত হবে।
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsBulkModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold shadow-2xs transition-colors"
                >
                  বাতিল
                </button>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-5 py-2 rounded-xl bg-[#7c3aed] hover:bg-[#6d28d9] disabled:bg-slate-300 disabled:text-slate-500 text-white text-xs font-bold shadow-xs transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>{isProcessing ? 'প্রস্তুত হচ্ছে...' : 'একত্রিত অ্যাডভাইস প্রস্তুত করুন'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3-in-1 Document Preview Modal when Advice is created or viewed */}
      {createdPreviewAdvice && (
        <OfficialAdviceDocumentsModal
          advice={createdPreviewAdvice}
          loans={loans}
          settings={settings}
          currentUser={currentUser}
          onClose={() => setCreatedPreviewAdvice(null)}
        />
      )}
    </div>
  );
};
