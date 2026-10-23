import React, { useState, useEffect } from 'react';
import { 
  X, 
  ArrowRightLeft, 
  Building2, 
  User, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  PauseCircle,
  PlayCircle,
  FileText,
  Info
} from 'lucide-react';
import { Loan } from '../types';
import { BANGLADESH_ALL_80_PBS } from '../data/allPbsList';

interface TransferLoanModalProps {
  isOpen: boolean;
  onClose: () => void;
  loan: Loan | null;
  onSaveTransfer: (loanId: string, data: {
    isTransferredOut: boolean;
    transferredToPbs: string;
    transferredDate: string;
    payrollDeductionSuspended: boolean;
    transferRemarks: string;
  }) => Promise<void>;
  isProcessing: boolean;
  onOpenMultiRepayment?: (loanId: string) => void;
}

export const TransferLoanModal: React.FC<TransferLoanModalProps> = ({
  isOpen,
  onClose,
  loan,
  onSaveTransfer,
  isProcessing,
  onOpenMultiRepayment
}) => {
  const [isTransferred, setIsTransferred] = useState<boolean>(true);
  const [transferredToPbs, setTransferredToPbs] = useState<string>('ঢাকা পল্লী বিদ্যুৎ সমিতি-১');
  const [transferredDate, setTransferredDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [payrollSuspended, setPayrollSuspended] = useState<boolean>(true);
  const [transferRemarks, setTransferRemarks] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (loan) {
      setIsTransferred(loan.isTransferredOut ?? false);
      setTransferredToPbs(loan.transferredToPbs || 'ঢাকা পল্লী বিদ্যুৎ সমিতি-১');
      setTransferredDate(loan.transferredDate || new Date().toISOString().split('T')[0]);
      setPayrollSuspended(loan.payrollDeductionSuspended ?? (loan.isTransferredOut ?? true));
      setTransferRemarks(loan.transferRemarks || '');
      setError('');
    }
  }, [loan]);

  if (!isOpen || !loan) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isTransferred && !transferredToPbs) {
      setError('বদলিকৃত পবিসের নাম নির্বাচন করুন।');
      return;
    }

    try {
      setError('');
      await onSaveTransfer(loan.id, {
        isTransferredOut: isTransferred,
        transferredToPbs: isTransferred ? transferredToPbs : '',
        transferredDate,
        payrollDeductionSuspended: isTransferred ? payrollSuspended : false,
        transferRemarks
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'বদলি তথ্য সংরক্ষণ ব্যর্থ হয়েছে।');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 p-3 sm:p-4 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border-2 border-slate-300 w-full max-w-lg overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-5 py-4 border-b-2 border-slate-200 flex items-center justify-between bg-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-700 text-white flex items-center justify-center font-bold shadow-xs">
              <ArrowRightLeft className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-950 text-base">
                বদলি ব্যবস্থাপনা ও বেতন কর্তন স্থগিতকরণ
              </h3>
              <p className="text-xs font-semibold text-slate-700">
                অন্য পবিসে বদলিজনিত কারণে অত্র পবিস হতে বেতন কর্তন বন্ধের ব্যবস্থা
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="text-slate-500 hover:text-slate-900 p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Loan Summary Badge */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-900 font-black flex items-center justify-center text-xs font-num border border-emerald-300">
              {loan.payId}
            </div>
            <div>
              <div className="font-black text-slate-950 text-xs sm:text-sm">
                {loan.employeeNameBn}
              </div>
              <div className="text-slate-600 font-medium">
                {loan.employeeDesignation} · ঋণ নং: {loan.loanNo}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-slate-500 font-bold uppercase">বাকি আসল স্থিতি</div>
            <div className="font-black text-emerald-950 font-num text-sm">
              {loan.principalBalance.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-600 font-medium">
              কিস্তি: {loan.monthlyInstallment.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-red-100 border-2 border-red-300 text-red-950 flex items-center gap-2 font-bold">
              <AlertTriangle className="w-4 h-4 text-red-700 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Toggle Transfer Out Status */}
          <div className="p-4 rounded-xl bg-blue-50/80 border-2 border-blue-300 space-y-3">
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isTransferred}
                onChange={(e) => {
                  const val = e.target.checked;
                  setIsTransferred(val);
                  if (val) setPayrollSuspended(true);
                }}
                className="mt-0.5 rounded text-blue-700 focus:ring-blue-600 w-5 h-5 border-2 border-blue-400 cursor-pointer"
              />
              <div>
                <span className="font-black text-blue-950 text-xs sm:text-sm block">
                  কর্মকর্তা/কর্মচারী অন্য পবিসে বদলি হয়েছেন (বদলিকৃত)
                </span>
                <span className="text-blue-900 font-medium text-xs leading-relaxed block mt-0.5">
                  বদলি চিহ্নিত করা হলে অত্র পবিস হতে তার নিয়মিত বেতন বিল থেকে গৃহ ঋণ কিস্তি কর্তন বন্ধ থাকবে।
                </span>
              </div>
            </label>

            {isTransferred && (
              <div className="pt-2 border-t border-blue-200">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={payrollSuspended}
                    onChange={(e) => setPayrollSuspended(e.target.checked)}
                    className="rounded text-emerald-700 focus:ring-emerald-600 w-4 h-4 border-2 border-blue-400 cursor-pointer"
                  />
                  <span className="font-bold text-slate-900 text-xs">
                    অত্র সমিতির মাসিক ব্যাচ কর্তন হতে এই ঋণ বাদ রাখুন (বেতন কর্তন বন্ধ)
                  </span>
                </label>
              </div>
            )}
          </div>

          {/* Destination PBS Dropdown (All 80 PBS) */}
          {isTransferred && (
            <div className="space-y-3 animate-in fade-in duration-100">
              <div>
                <label className="block font-black text-slate-950 mb-1.5 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-blue-700" />
                  <span>কোন পবিসে বদলি হয়েছেন (বদলিকৃত প্রাপক পবিস) *</span>
                </label>
                <select
                  value={transferredToPbs}
                  onChange={(e) => setTransferredToPbs(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border-2 border-slate-300 font-bold text-slate-950 bg-white text-xs focus:outline-none focus:border-blue-600 shadow-2xs"
                  required
                >
                  <option value="">-- পবিস নির্বাচন করুন --</option>
                  {BANGLADESH_ALL_80_PBS.map((pbs) => (
                    <option key={pbs} value={pbs}>
                      {pbs}
                    </option>
                  ))}
                </select>
                <div className="text-[11px] text-slate-600 mt-1">
                  * ওই পবিসের হিসাব শাখা হতে বেতন কর্তনপূর্বক অত্র সমিতিতে ব্যাংক অ্যাডভাইস / রেমিট্যান্স প্রেরণ করবে।
                </div>
              </div>

              {/* Transfer Date & Remarks */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>বদলি / আদেশের তারিখ</span>
                  </label>
                  <input
                    type="date"
                    value={transferredDate}
                    onChange={(e) => setTransferredDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border-2 border-slate-300 font-num font-bold text-slate-900 bg-white text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-slate-500" />
                    <span>আদেশ নং / রেফারেন্স</span>
                  </label>
                  <input
                    type="text"
                    value={transferRemarks}
                    onChange={(e) => setTransferRemarks(e.target.value)}
                    placeholder="যেমন: স্মারক নং-২৪৫/বদলি"
                    className="w-full px-3 py-2 rounded-lg border-2 border-slate-300 font-bold text-slate-900 bg-white text-xs"
                  />
                </div>
              </div>

              {/* Informational Guidance Box */}
              <div className="p-3.5 rounded-xl bg-amber-50 border-2 border-amber-300 text-amber-950 text-xs flex items-start gap-2.5">
                <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong>কিস্তি পোস্টিং নির্দেশিকা:</strong> বদলিকৃত পবিস হতে যখন ব্যাংক ড্রাফট, চেকের মাধ্যমে বা BEFTN অ্যাডভাইস দিয়ে এক বা একাধিক মাসের কিস্তির টাকা প্রেরণ করবে, তখন সরাসরি <strong>"অন্য পবিস হতে প্রাপ্ত কিস্তি পোস্টিং"</strong> অপশন ব্যবহার করে সকল মাসের কিস্তি এক ক্লিকে পোস্টিং করতে পারবেন।
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="pt-3 border-t-2 border-slate-200 flex flex-wrap items-center justify-between gap-2">
            {isTransferred && onOpenMultiRepayment && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenMultiRepayment(loan.id);
                }}
                className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-black border-2 border-emerald-300 flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <span>রেমিট্যান্স পোস্টিংয়ে যান</span>
              </button>
            )}

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                disabled={isProcessing}
                className="px-4 py-2 rounded-xl border-2 border-slate-300 hover:bg-slate-100 text-slate-900 font-bold transition-colors"
              >
                বাতিল
              </button>

              <button
                type="submit"
                disabled={isProcessing}
                className="px-5 py-2 rounded-xl bg-blue-800 hover:bg-blue-900 text-white font-black transition-all shadow-xs flex items-center gap-1.5 active:scale-95 disabled:bg-slate-400"
              >
                {isProcessing ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>সংরক্ষণ হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>সংরক্ষণ করুন</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
