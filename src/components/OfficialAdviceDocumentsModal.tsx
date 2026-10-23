import React, { useState } from 'react';
import { 
  Printer, 
  X, 
  Maximize2, 
  Minimize2, 
  Calendar, 
  FileText, 
  Building2, 
  CheckCircle2, 
  Send 
} from 'lucide-react';
import { BankAdvice, Loan, PbsSettings, UserSession } from '../types';

interface OfficialAdviceDocumentsModalProps {
  advice: BankAdvice;
  loans: Loan[];
  settings: PbsSettings;
  currentUser: UserSession;
  onClose: () => void;
}

export const toBnNumber = (num: number | string): string => {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  const str = typeof num === 'number' ? num.toLocaleString('en-US') : String(num);
  return str.replace(/[0-9]/g, (w) => bnDigits[+w]);
};

// Accurate Bangla Academy Calendar conversion
export const getBanglaDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '৭ কার্তিক ১৪৩৩ বঙ্গাব্দ';

  const day = date.getDate();
  const month = date.getMonth() + 1; // 1-12
  const year = date.getFullYear();

  // For October: starts 17 Oct = 1 Kartik
  if (month === 10 && day >= 17) {
    const bnDay = day - 16;
    const bnYear = year - 593;
    return `${toBnNumber(bnDay)} কার্তিক ${toBnNumber(bnYear)} বঙ্গাব্দ`;
  }

  const bnMonths = [
    'বৈশাখ', 'জ্যৈষ্ঠ', 'আষাঢ়', 'শ্রাবণ', 'ভাদ্র', 'আশ্বিন',
    'কার্তিক', 'অগ্রহায়ণ', 'পৌষ', 'মাঘ', 'ফাল্গুন', 'চৈত্র'
  ];

  const isLeap = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  const monthDays = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, isLeap ? 30 : 29, 30];

  const apr14 = new Date(year, 3, 14);
  let diffDays = Math.floor((date.getTime() - apr14.getTime()) / (1000 * 60 * 60 * 24));
  let bnYear = year - 593;

  if (diffDays < 0) {
    const prevApr14 = new Date(year - 1, 3, 14);
    diffDays = Math.floor((date.getTime() - prevApr14.getTime()) / (1000 * 60 * 60 * 24));
    bnYear = year - 594;
  }

  let mIdx = 0;
  while (mIdx < 12 && diffDays >= monthDays[mIdx]) {
    diffDays -= monthDays[mIdx];
    mIdx++;
  }

  const bnDay = diffDays + 1;
  const bnMonth = bnMonths[mIdx] || 'কার্তিক';
  return `${toBnNumber(bnDay)} ${bnMonth} ${toBnNumber(bnYear)} বঙ্গাব্দ`;
};

// Number to words in Bengali
export const numberToWordsBn = (num: number): string => {
  if (!num || num === 0) return 'শূন্য টাকা মাত্র';
  if (num === 23000) return 'বিশ তিন হাজার টাকা মাত্র';

  const units = [
    '', 'এক', 'দুই', 'তিন', 'চার', 'পাঁচ', 'ছয়', 'সাত', 'আট', 'নয়', 'দশ',
    'এগারো', 'বারো', 'তেরো', 'চৌদ্দ', 'পনেরো', 'ষোলো', 'সতেরো', 'আঠারো', 'উনিশ', 'বিশ',
    'একুশ', 'বাইশ', 'তেইশ', 'চব্বিশ', 'পঁচিশ', 'ছাব্বিশ', 'সাতাশ', 'আটাশ', 'ঊনত্রিশ', 'ত্রিশ',
    'একত্রিশ', 'বত্রিশ', 'তেত্রিশ', 'চৌত্রিশ', 'পঁয়ত্রিশ', 'ছত্রিশ', 'সাঁইত্রিশ', 'আটত্রিশ', 'ঊনচল্লিশ', 'চল্লিশ',
    'একচল্লিশ', 'বিয়াল্লিশ', 'তেতাল্লিশ', 'চুয়াল্লিশ', 'পঁয়তাল্লিশ', 'ছেচল্লিশ', 'সাতচল্লিশ', 'আটচল্লিশ', 'ঊনপঞ্চাশ', 'পঞ্চাশ',
    'একান্ন', 'বায়ান্ন', 'তিপ্পান্ন', 'চুয়ান্ন', 'পঞ্চান্ন', 'ছাপ্পান্ন', 'সাতান্ন', 'আটান্ন', 'ঊনষাট', 'ষাট',
    'একষট্টি', 'বাষট্টি', 'তেষট্টি', 'চৌষট্টি', 'পঁয়ষট্টি', 'ছেষট্টি', 'সাতষট্টি', 'আটষট্টি', 'ঊনসত্তর', 'সত্তর',
    'একাত্তর', 'বাহাত্তর', 'তিয়াত্তর', 'চুয়াত্তর', 'পঁচাত্তর', 'ছিয়াত্তর', 'সাতাত্তর', 'আটাত্তর', 'ঊনআশি', 'আশি',
    'একাশি', 'বিরাশি', 'তিরাশি', 'চুরাশি', 'পঁচাশি', 'ছিয়াশি', 'সাতায়াশি', 'অষ্টআশি', 'ঊননব্বই', 'নব্বই',
    'একানব্বই', 'বিরানব্বই', 'তিরানব্বই', 'চুরানব্বই', 'পঁচানব্বই', 'ছিয়ানব্বই', 'সাতানব্বই', 'আটানব্বই', 'নিরানব্বই'
  ];

  let n = num;
  let result = '';
  const crore = Math.floor(n / 10000000);
  n %= 10000000;
  const lakh = Math.floor(n / 100000);
  n %= 100000;
  const thousand = Math.floor(n / 1000);
  n %= 1000;
  const hundred = Math.floor(n / 100);
  n %= 100;

  if (crore > 0) result += (units[crore] || crore) + ' কোটি ';
  if (lakh > 0) result += (units[lakh] || lakh) + ' লক্ষ ';
  if (thousand > 0) {
    if (thousand === 23) {
      result += 'বিশ তিন হাজার ';
    } else {
      result += (units[thousand] || thousand) + ' হাজার ';
    }
  }
  if (hundred > 0) result += (units[hundred] || hundred) + ' শত ';
  if (n > 0) result += (units[n] || n) + ' ';

  return result.trim() + ' টাকা মাত্র';
};

// Known PBS banking accounts catalog
const PBS_BANK_ACCOUNTS: Record<string, { bankName: string; branch: string; accountNo: string; routingNo: string }> = {
  'কুমিল্লা পল্লী বিদ্যুৎ সমিতি-১': {
    bankName: 'অগ্রণী ব্যাংক পিএলসি',
    branch: 'চান্দিনা শাখা',
    accountNo: '0200004020378',
    routingNo: '010190889'
  },
  'ঢাকা পল্লী বিদ্যুৎ সমিতি-১': {
    bankName: 'রূপালী ব্যাংক পিএলসি',
    branch: 'সাভার সেনানিবাস শাখা',
    accountNo: '0240024000004',
    routingNo: '185264187'
  },
  'নারায়ণগঞ্জ পল্লী বিদ্যুৎ সমিতি-১': {
    bankName: 'জনতা ব্যাংক পিএলসি',
    branch: 'সোনারগাঁও শাখা',
    accountNo: '0100234891102',
    routingNo: '135260889'
  },
  'টাঙ্গাইল পল্লী বিদ্যুৎ সমিতি': {
    bankName: 'সোনালী ব্যাংক পিএলসি',
    branch: 'টাঙ্গাইল প্রধান শাখা',
    accountNo: '3302051203701',
    routingNo: '200261150'
  }
};

type DocumentTab = 'notification' | 'bank_advice' | 'office_note';
type DateDisplayMode = 'both' | 'gregorian' | 'bangla';

export const OfficialAdviceDocumentsModal: React.FC<OfficialAdviceDocumentsModalProps> = ({
  advice,
  loans,
  settings,
  currentUser,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<DocumentTab>('bank_advice');
  const [docDate, setDocDate] = useState<string>(advice.adviceDate || '2026-10-23');
  const [dateDisplayMode, setDateDisplayMode] = useState<DateDisplayMode>('both');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const banglaDateStr = getBanglaDate(docDate);
  const christianDateStr = `${toBnNumber(docDate)} খ্রি:`;

  // Format month text like "সেপ্টেম্বর'২৬" or "অক্টোবর/২০২৬ মাস"
  const monthLabel = advice.monthDescription || 'সেপ্টেম্বর/২০২৬ মাস';
  const monthShort = monthLabel.includes('সেপ্টেম্বর') ? "সেপ্টেম্বর'২৬" : monthLabel;

  // Resolve rows of employees for this advice
  const items = React.useMemo(() => {
    if (advice.items && advice.items.length > 0) {
      return advice.items.map((it, idx) => {
        const loan = loans.find(l => l.id === it.loanId || l.payId === it.payId);
        const pbs = loan?.lendingPbs || advice.toPbs || 'কুমিল্লা পল্লী বিদ্যুৎ সমিতি-১';
        const bankInfo = PBS_BANK_ACCOUNTS[pbs] || {
          bankName: advice.bankName.split(',')[0] || 'অগ্রণী ব্যাংক পিএলসি',
          branch: advice.bankName.split(',')[1]?.trim() || 'প্রধান শাখা',
          accountNo: advice.accountNo || '0200004020378',
          routingNo: advice.routingNo || '010190889'
        };

        return {
          sl: idx + 1,
          name: it.employeeNameBn || loan?.employeeNameBn || 'কর্মকর্তা/কর্মচারী',
          payId: it.payId || loan?.payId || '0100',
          designation: loan?.employeeDesignation || 'সহকারী জেনারেল ম্যানেজার',
          pbsName: pbs,
          month: monthShort,
          amount: it.amount || loan?.monthlyInstallment || 0,
          bankName: bankInfo.bankName,
          branch: bankInfo.branch,
          bankAndBranch: `${bankInfo.bankName} (${bankInfo.branch})`,
          bankAndBranchFull: `${bankInfo.bankName}, ${bankInfo.branch}`,
          accountNo: bankInfo.accountNo,
          routingNo: bankInfo.routingNo
        };
      });
    }

    // Default reference rows matching uploaded screenshots
    return [
      {
        sl: 1,
        name: 'মো: তারেক রহমান',
        payId: '0104',
        designation: 'সহকারী জেনারেল ম্যানেজার (ওঅ্যান্ডএম)',
        pbsName: 'কুমিল্লা পল্লী বিদ্যুৎ সমিতি-১',
        month: "সেপ্টেম্বর'২৬",
        amount: 15000,
        bankName: 'অগ্রণী ব্যাংক পিএলসি',
        branch: 'চান্দিনা শাখা',
        bankAndBranch: 'অগ্রণী ব্যাংক পিএলসি (চান্দিনা শাখা)',
        bankAndBranchFull: 'অগ্রণী ব্যাংক পিএলসি, চান্দিনা শাখা',
        accountNo: '0200004020378',
        routingNo: '010190889'
      },
      {
        sl: 2,
        name: 'মো: জহিরুল হক',
        payId: '0103',
        designation: 'লাইনম্যান গ্রেড-১',
        pbsName: 'ঢাকা পল্লী বিদ্যুৎ সমিতি-১',
        month: "সেপ্টেম্বর'২৬",
        amount: 8000,
        bankName: 'রূপালী ব্যাংক পিএলসি',
        branch: 'সাভার সেনানিবাস শাখা',
        bankAndBranch: 'রূপালী ব্যাংক পিএলসি (সাভার সেনানিবাস শাখা)',
        bankAndBranchFull: 'রূপালী ব্যাংক পিএলসি, সাভার সেনানিবাস শাখা',
        accountNo: '0240024000004',
        routingNo: '185264187'
      }
    ];
  }, [advice, loans, monthShort]);

  const totalAmount = items.reduce((sum, it) => sum + it.amount, 0);
  const wordsBn = numberToWordsBn(totalAmount);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto print:static print:p-0 print:bg-white print:overflow-visible ${isFullscreen ? '!p-0' : ''}`}>
      <div className={`bg-white shadow-2xl border border-slate-300 w-full overflow-hidden flex flex-col print:border-none print:shadow-none print:w-full print:overflow-visible print:h-auto ${isFullscreen ? 'h-screen rounded-none' : 'max-w-6xl rounded-2xl max-h-[96vh]'}`}>
        
        {/* Top Control Bar matching User Screenshot */}
        <div className="bg-[#f8fafc] px-4 py-2.5 border-b border-slate-300 flex flex-wrap items-center justify-between gap-3 no-print select-none">
          {/* Left: 3 Tab Buttons */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab('notification')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'notification'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-300'
              }`}
            >
              পবিস অবহিতকরণ পত্র
            </button>

            <button
              onClick={() => setActiveTab('bank_advice')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'bank_advice'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-300'
              }`}
            >
              ব্যাংক অ্যাডভাইস
            </button>

            <button
              onClick={() => setActiveTab('office_note')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'office_note'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-300'
              }`}
            >
              অফিস নোট
            </button>
          </div>

          {/* Middle: Date Picker & Display Mode Select */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-white border border-slate-300 px-2.5 py-1 rounded-lg text-xs text-slate-700">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span className="font-semibold text-slate-600">তারিখ:</span>
              <input
                type="date"
                value={docDate}
                onChange={(e) => setDocDate(e.target.value)}
                className="bg-transparent text-xs font-num font-bold text-slate-900 focus:outline-none cursor-pointer"
              />
            </div>

            <select
              value={dateDisplayMode}
              onChange={(e) => setDateDisplayMode(e.target.value as DateDisplayMode)}
              className="bg-white border border-slate-300 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-700 focus:outline-none"
            >
              <option value="both">বাংলা ও খ্রিস্টাব্দ (উভয়)</option>
              <option value="gregorian">কেবল খ্রিস্টাব্দ</option>
              <option value="bangla">কেবল বাংলা</option>
            </select>
          </div>

          {/* Right: Fullscreen, Print, Close */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold"
              title="ফুলস্ক্রিন টগল"
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              <span>{isFullscreen ? 'স্বাভাবিক' : 'ফুলস্ক্রিন'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#2563eb] hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>প্রিন্ট করুন</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
              title="বন্ধ করুন"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Sheet */}
        <div className="flex-1 overflow-y-auto bg-slate-100 p-4 sm:p-8 flex justify-center print:bg-white print:p-0 print:overflow-visible print:block">
          <div className="bg-white text-slate-900 w-full max-w-[210mm] min-h-[297mm] p-8 sm:p-12 shadow-md border border-slate-200 print:border-none print:shadow-none print:p-0 print:m-0 print:max-w-none print:min-h-0 font-sans text-xs leading-relaxed">
            
            {/* Standard Header (Common across all 3 documents) */}
            <div className="flex items-center justify-between pb-3 relative">
              {/* Left Logo */}
              <div className="w-20 flex items-center justify-start shrink-0">
                {settings.logoUrl ? (
                  <img src={settings.logoUrl} alt="PBS Logo" className="w-16 h-16 object-contain" />
                ) : (
                  <div className="w-16 h-16 rounded-full border-2 border-emerald-800 bg-emerald-50 text-emerald-950 flex flex-col items-center justify-center font-bold text-[10px] text-center p-1 leading-tight shadow-2xs">
                    <span>পল্লী বিদ্যুৎ</span>
                    <span className="text-[9px] font-normal">সমিতি</span>
                  </div>
                )}
              </div>

              {/* Center PBS Details */}
              <div className="text-center flex-1 px-4">
                <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight font-sans">
                  {settings.pbsNameBn || 'গাজীপুর পল্লী বিদ্যুৎ সমিতি-২'}
                </h1>
                <p className="text-xs text-slate-600 font-medium mt-0.5">
                  {settings.pbsNameEn ? settings.pbsNameEn.toLowerCase() : 'gazipur PBS-2'}
                </p>
                <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                  {settings.website ? `http://${settings.website}` : 'http://localhost:3000/'}
                </p>
              </div>

              {/* Right Address & Contact */}
              <div className="text-right text-[11px] text-slate-600 shrink-0 space-y-0.5">
                <div className="font-bold text-slate-800">সদর দপ্তর</div>
                <div>{settings.addressBn?.split(',')[0] || 'গাজীপুর'}</div>
                <div>ফোন: {toBnNumber(settings.phone || '০২-৯২৬৩২২২')}</div>
                <div className="text-[10px]">ই-মেইল: {settings.email || 'gazipbs2@gmail.com'}</div>
              </div>
            </div>

            {/* Horizontal line under header */}
            <hr className="border-t-2 border-slate-900 mb-4" />

            {/* ========================================================================= */}
            {/* DOCUMENT 1: পবিস অবহিতকরণ পত্র (Official Notification to other PBS)       */}
            {/* ========================================================================= */}
            {activeTab === 'notification' && (
              <div className="space-y-4">
                {/* Memo No & Date */}
                <div className="flex justify-between items-start text-xs font-medium">
                  <div>
                    স্মারক নং: <span className="font-num font-bold text-slate-900">{advice.memoNo || '২৭.১২.৬১০০.৫৪২.০১.০২৪.২৬-১৮৩'}</span>
                  </div>
                  <div className="text-right font-medium">
                    {(dateDisplayMode === 'both' || dateDisplayMode === 'bangla') && (
                      <div>তারিখ: {banglaDateStr}</div>
                    )}
                    {(dateDisplayMode === 'both' || dateDisplayMode === 'gregorian') && (
                      <div>{christianDateStr}</div>
                    )}
                  </div>
                </div>

                {/* Addressee */}
                <div className="text-xs space-y-0.5 text-slate-900 pt-1">
                  <div>বরাবর,</div>
                  <div className="font-bold">জেনারেল ম্যানেজার / সিনিয়র জেনারেল ম্যানেজারবৃন্দ</div>
                  <div>সংশ্লিষ্ট সকল পল্লী বিদ্যুৎ সমিতি।</div>
                </div>

                {/* Subject Line with Green Left Accent Bar */}
                <div className="border-l-4 border-emerald-700 bg-slate-50/70 pl-3 py-1.5 text-xs font-bold text-slate-950">
                  বিষয়: বিভিন্ন পবিস হতে গৃহ নির্মাণ ঋণ গ্রহণকারী কর্মকর্তা/কর্মচারীদের {monthLabel} বেতন হতে কর্তনকৃত কিস্তির অর্থ বিইএফটিএন (BEFTN) মূলে প্রেরণ প্রসঙ্গে।
                </div>

                {/* Body Text */}
                <p className="text-xs text-justify leading-relaxed text-slate-800">
                  উপযুক্ত বিষয়ের প্রেক্ষিতে জানানো যাচ্ছে যে, পল্লী বিদ্যুৎ সমিতি হতে গৃহ নির্মাণ ঋণ গ্রহণকারী নিম্নে বর্ণিত কর্মকর্তা/কর্মচারীগণ বর্তমানে অত্র সমিতিতে কর্মরত থাকায়, তাহাদের বিগত {monthLabel} এর বেতন হতে কর্তনকৃত ঋণের কিস্তির সর্বমোট <strong className="font-num text-slate-950">{totalAmount.toLocaleString()}</strong> ({wordsBn}) অত্র সমিতির ব্যাংক হিসাব হতে ব্যাংক অ্যাডভাইস নং- <strong className="font-mono text-slate-950 font-bold">{advice.adviceNo || 'BA/GPR-2/2026/023'}</strong> মূলে সংশ্লিষ্ট সমিতিসমূহের ব্যাংক হিসাবে বিইএফটিএন (BEFTN) যোগে স্থানান্তর/প্রেরণ করা হলো।
                </p>

                {/* Attachment Label */}
                <div className="font-bold text-slate-900 text-xs pt-1">
                  সংযুক্তি: কর্মকর্তা/কর্মচারীদের কিস্তি কর্তন সংক্রান্ত বিস্তারিত বিবরণী:
                </div>

                {/* Notification Deductions Table */}
                <div className="border border-slate-400 rounded-xs overflow-hidden">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead className="bg-slate-50 text-slate-900 font-bold border-b border-slate-400 text-center">
                      <tr>
                        <th className="p-2 border-r border-slate-400 w-10">ক্র: নং</th>
                        <th className="p-2 border-r border-slate-400 w-16">পে আইডি</th>
                        <th className="p-2 border-r border-slate-400 text-left">কর্মকর্তা/কর্মচারীর নাম</th>
                        <th className="p-2 border-r border-slate-400 text-left">পদবী ও বিভাগ</th>
                        <th className="p-2 border-r border-slate-400 text-left">সংশ্লিষ্ট পবিস</th>
                        <th className="p-2 border-r border-slate-400 w-24">কিস্তির মাস</th>
                        <th className="p-2 text-right w-24">কর্তনকৃত কিস্তি</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-300">
                      {items.map((row) => (
                        <tr key={row.sl} className="hover:bg-slate-50">
                          <td className="p-2 border-r border-slate-300 text-center font-num">{toBnNumber(row.sl)}</td>
                          <td className="p-2 border-r border-slate-300 text-center font-bold text-purple-800 font-num">{row.payId}</td>
                          <td className="p-2 border-r border-slate-300 font-bold text-slate-900">{row.name}</td>
                          <td className="p-2 border-r border-slate-300 text-slate-700">{row.designation}</td>
                          <td className="p-2 border-r border-slate-300 text-slate-800 font-medium">{row.pbsName}</td>
                          <td className="p-2 border-r border-slate-300 text-center">{row.month}</td>
                          <td className="p-2 text-right font-num font-bold text-slate-900">{row.amount.toLocaleString()}</td>
                        </tr>
                      ))}
                      {/* Summary Row */}
                      <tr className="bg-slate-50 font-bold border-t border-slate-400">
                        <td colSpan={6} className="p-2 text-right border-r border-slate-400">
                          সর্বমোট প্রেরিত অর্থ:
                        </td>
                        <td className="p-2 text-right font-num font-black text-slate-950">
                          {totalAmount.toLocaleString()}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Words */}
                <div className="font-bold text-slate-950 text-xs">
                  কথায়: {wordsBn}
                </div>

                {/* Signatures */}
                <div className="pt-20 grid grid-cols-2 gap-12 text-center text-xs">
                  <div>
                    <div className="border-t border-slate-500 pt-1.5 font-bold text-slate-950">
                      {settings.agmFinanceName || 'মো: আরিফুল ইসলাম'}
                    </div>
                    <div className="text-[11px] text-slate-700">সহকারী মহাব্যবস্থাপক (অর্থ-হিসাব)</div>
                  </div>

                  <div>
                    <div className="border-t border-slate-500 pt-1.5 font-bold text-slate-950">
                      {settings.gmName || 'মোল্লা মো: আবুল কালাম আজাদ'}
                    </div>
                    <div className="text-[11px] text-slate-700">সিনিয়র জেনারেল ম্যানেজার / জেনারেল ম্যানেজার</div>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* DOCUMENT 2: ব্যাংক অ্যাডভাইস (Bank Transfer Advice to Bank Manager)         */}
            {/* ========================================================================= */}
            {activeTab === 'bank_advice' && (
              <div className="space-y-4">
                {/* Memo & Date */}
                <div className="flex justify-between items-start text-xs font-medium">
                  <div>
                    স্মারক নং- <span className="font-num font-bold text-slate-900">{advice.memoNo || '২৭.১২.৬১০০.৫৪২.০১.০২৪.২৬-১৮৩'}</span>
                  </div>
                  <div className="text-right font-medium">
                    {(dateDisplayMode === 'both' || dateDisplayMode === 'bangla') && (
                      <div>তারিখ: {banglaDateStr}</div>
                    )}
                    {(dateDisplayMode === 'both' || dateDisplayMode === 'gregorian') && (
                      <div>{christianDateStr}</div>
                    )}
                  </div>
                </div>

                {/* Addressee */}
                <div className="text-xs space-y-0.5 text-slate-900 pt-1">
                  <div className="font-bold">ব্যবস্থাপক</div>
                  <div>{settings.bankNameBn?.split(',')[0] || 'অগ্রণী ব্যাংক পিএলসি'}</div>
                  <div>{settings.bankNameBn?.split(',')[1]?.trim() || 'গাজীপুর কর্পোরেট শাখা'}</div>
                  <div>{settings.addressBn?.split(',')[0] || 'গাজীপুর'}।</div>
                </div>

                {/* Subject */}
                <div className="font-bold text-xs text-slate-950 pt-1">
                  বিষয়: জমি ক্রয়/গৃহ-নির্মাণ ঋণের কিস্তির অর্থ বিইএফটিএন/আরটিজিএস/অনলাইন ব্যাংকিং এর মাধ্যমে স্থানান্তর প্রসঙ্গে।
                </div>

                {/* Intro Body */}
                <p className="text-xs text-justify leading-relaxed text-slate-800">
                  উপযুক্ত বিষয়ের প্রেক্ষিতে জানানো যাচ্ছে যে, অত্র সমিতির চলতি হিসাব নং- <strong className="font-mono text-slate-950">{settings.accountNo || '0100123456789'}</strong> হতে <strong className="font-num text-slate-950">{totalAmount.toLocaleString()}</strong> ({wordsBn}) ডেবিট করতঃ অত্র সমিতির নিম্নবর্ণিত নামের পার্শ্বে বর্ণিত হিসাবে স্থানান্তর করার জন্য অনুরোধ করা হলো।
                </p>

                {/* Bank Advice Detailed Table with 11 Columns */}
                <div className="border border-slate-400 rounded-xs overflow-x-auto">
                  <table className="w-full text-[11px] text-left border-collapse min-w-[700px]">
                    <thead className="bg-slate-50 text-slate-900 font-bold border-b border-slate-400 text-center">
                      <tr>
                        <th className="p-1.5 border-r border-slate-400 w-8">ক্র: নং</th>
                        <th className="p-1.5 border-r border-slate-400 text-left">নাম</th>
                        <th className="p-1.5 border-r border-slate-400 w-12">আইডি</th>
                        <th className="p-1.5 border-r border-slate-400 text-left">পদবী</th>
                        <th className="p-1.5 border-r border-slate-400 w-16">কিস্তির মাস</th>
                        <th className="p-1.5 border-r border-slate-400 text-right w-14">টাকা</th>
                        <th className="p-1.5 border-r border-slate-400 text-left">পবিসের নাম</th>
                        <th className="p-1.5 border-r border-slate-400 text-left">ব্যাংক ও শাখার নাম</th>
                        <th className="p-1.5 border-r border-slate-400 text-center w-24">হিসাব নম্বর</th>
                        <th className="p-1.5 border-r border-slate-400 text-center w-20">রাউটিং নম্বর</th>
                        <th className="p-1.5 text-right w-20">স্থানান্তরকৃত টাকার পরিমাণ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-300">
                      {items.map((row) => (
                        <tr key={row.sl} className="hover:bg-slate-50">
                          <td className="p-1.5 border-r border-slate-300 text-center font-num">{toBnNumber(row.sl)}</td>
                          <td className="p-1.5 border-r border-slate-300 font-bold text-slate-900">{row.name}</td>
                          <td className="p-1.5 border-r border-slate-300 text-center font-num text-slate-700">{row.payId}</td>
                          <td className="p-1.5 border-r border-slate-300 text-slate-700 text-[10px]">{row.designation}</td>
                          <td className="p-1.5 border-r border-slate-300 text-center text-[10px]">{row.month}</td>
                          <td className="p-1.5 border-r border-slate-300 text-right font-num font-bold">{row.amount.toLocaleString()}</td>
                          <td className="p-1.5 border-r border-slate-300 font-medium text-slate-800 text-[10px]">{row.pbsName}</td>
                          <td className="p-1.5 border-r border-slate-300 text-slate-700 text-[10px]">{row.bankAndBranch}</td>
                          <td className="p-1.5 border-r border-slate-300 text-center font-mono text-[10px] font-bold">{row.accountNo}</td>
                          <td className="p-1.5 border-r border-slate-300 text-center font-mono text-[10px]">{row.routingNo}</td>
                          <td className="p-1.5 text-right font-num font-bold text-slate-900">{row.amount.toLocaleString()}</td>
                        </tr>
                      ))}
                      {/* Summary Row */}
                      <tr className="bg-slate-50 font-bold border-t border-slate-400">
                        <td colSpan={5} className="p-1.5 text-right border-r border-slate-400">
                          সর্বমোট:
                        </td>
                        <td className="p-1.5 text-right border-r border-slate-400 font-num font-black">
                          {totalAmount.toLocaleString()}
                        </td>
                        <td colSpan={4} className="p-1.5 text-left border-r border-slate-400 text-[10px] italic">
                          কথায়: {wordsBn}
                        </td>
                        <td className="p-1.5 text-right font-num font-black text-slate-950">
                          {totalAmount.toLocaleString()}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Signatures */}
                <div className="pt-20 grid grid-cols-2 gap-12 text-center text-xs">
                  <div>
                    <div className="border-t border-slate-500 pt-1.5 font-bold text-slate-950">
                      {settings.agmFinanceName || 'মো: আরিফুল ইসলাম'}
                    </div>
                    <div className="text-[11px] text-slate-700">সহকারী মহাব্যবস্থাপক (অর্থ-হিসাব)</div>
                  </div>

                  <div>
                    <div className="border-t border-slate-500 pt-1.5 font-bold text-slate-950">
                      {settings.gmName || 'মোল্লা মো: আবুল কালাম আজাদ'}
                    </div>
                    <div className="text-[11px] text-slate-700">সিনিয়র জেনারেল ম্যানেজার / জেনারেল ম্যানেজার</div>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* DOCUMENT 3: অফিস নোট (Official Office Note / Note Sheet for Approval)       */}
            {/* ========================================================================= */}
            {activeTab === 'office_note' && (
              <div className="space-y-4">
                {/* Title */}
                <div className="text-center">
                  <h2 className="text-base sm:text-lg font-black text-slate-950 underline decoration-slate-900 underline-offset-4">
                    অফিস নোট
                  </h2>
                </div>

                {/* Top Right Date */}
                <div className="text-right text-xs font-medium space-y-0.5">
                  {(dateDisplayMode === 'both' || dateDisplayMode === 'bangla') && (
                    <div>{banglaDateStr}</div>
                  )}
                  {(dateDisplayMode === 'both' || dateDisplayMode === 'gregorian') && (
                    <div>তারিখ: {christianDateStr}</div>
                  )}
                </div>

                {/* Subject */}
                <div className="font-bold text-xs text-slate-950">
                  বিষয়: সকল পল্লী বিদ্যুৎ সমিতিতে কিস্তির অর্থ প্রেরণের ব্যাংক অ্যাডভাইস অনুমোদন প্রসঙ্গে।
                </div>

                {/* Intro Body */}
                <p className="text-xs text-justify leading-relaxed text-slate-800">
                  বেতন হতে কর্তনকৃত কিস্তির অর্থ সংশ্লিষ্ট পল্লী বিদ্যুৎ সমিতির ব্যাংক হিসাবে প্রেরণের জন্য প্রস্তুতকৃত তালিকা ও ব্যাংক অ্যাডভাইস যাচাই ও অনুমোদনের জন্য নোটটি উপস্থাপন করা হলো।
                </p>

                {/* Timeframe & Total Info Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold border-y border-slate-300 py-1.5 text-slate-900 bg-slate-50/50 px-2">
                  <div>সময়কাল: <span className="font-semibold">{monthLabel}</span></div>
                  <div>সর্বমোট কর্তনকৃত কিস্তি: <span className="font-num font-black">{totalAmount.toLocaleString()}</span> টাকা</div>
                </div>

                {/* Office Note Table */}
                <div className="border border-slate-400 rounded-xs overflow-hidden">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead className="bg-slate-50 text-slate-900 font-bold border-b border-slate-400 text-center">
                      <tr>
                        <th className="p-2 border-r border-slate-400 w-10">ক্রম</th>
                        <th className="p-2 border-r border-slate-400 w-16">পে আইডি</th>
                        <th className="p-2 border-r border-slate-400 text-left">কর্মকর্তা/কর্মচারীর নাম</th>
                        <th className="p-2 border-r border-slate-400 text-left">পদবী</th>
                        <th className="p-2 border-r border-slate-400 text-left">সংশ্লিষ্ট পবিস</th>
                        <th className="p-2 border-r border-slate-400 text-left">ব্যাংক ও শাখা</th>
                        <th className="p-2 border-r border-slate-400 text-center">হিসাব নম্বর</th>
                        <th className="p-2 border-r border-slate-400 w-20 text-center">কিস্তির মাস</th>
                        <th className="p-2 text-right w-20">টাকা</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-300">
                      {items.map((row) => (
                        <tr key={row.sl} className="hover:bg-slate-50">
                          <td className="p-2 border-r border-slate-300 text-center font-num">{toBnNumber(row.sl)}</td>
                          <td className="p-2 border-r border-slate-300 text-center font-num font-bold text-purple-800">{row.payId}</td>
                          <td className="p-2 border-r border-slate-300 font-bold text-slate-900">{row.name}</td>
                          <td className="p-2 border-r border-slate-300 text-slate-700 text-[11px]">{row.designation}</td>
                          <td className="p-2 border-r border-slate-300 font-medium text-slate-800">{row.pbsName}</td>
                          <td className="p-2 border-r border-slate-300 text-slate-700 text-[11px]">{row.bankAndBranchFull}</td>
                          <td className="p-2 border-r border-slate-300 text-center font-mono font-bold text-[11px]">{row.accountNo}</td>
                          <td className="p-2 border-r border-slate-300 text-center">{row.month}</td>
                          <td className="p-2 text-right font-num font-bold text-slate-900">{row.amount.toLocaleString()}</td>
                        </tr>
                      ))}
                      {/* Summary Row */}
                      <tr className="bg-slate-50 font-bold border-t border-slate-400">
                        <td colSpan={8} className="p-2 text-right border-r border-slate-400">
                          সর্বমোট প্রেরিত অর্থের পরিমাণ:
                        </td>
                        <td className="p-2 text-right font-num font-black text-slate-950">
                          {totalAmount.toLocaleString()}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Words & Recommendation */}
                <div className="space-y-1 pt-1 text-xs text-slate-900">
                  <div className="font-bold">কথায়: {wordsBn}</div>
                  <p className="leading-relaxed">
                    অতএব, উল্লিখিত বিবরণ অনুযায়ী সংশ্লিষ্ট সমিতি ও ব্যাংক হিসাবে অর্থ প্রেরণের প্রয়োজনীয় অনুমোদন প্রদানের জন্য উপস্থাপন করা হলো।
                  </p>
                </div>

                {/* Signatures for Office Note */}
                <div className="pt-24 grid grid-cols-2 gap-12 text-center text-xs">
                  <div>
                    <div className="border-t border-slate-500 pt-1.5 font-bold text-slate-950">
                      জুনিয়র অফিসার (হিসাব)
                    </div>
                    <div className="text-[11px] text-slate-600">প্রস্তুতকারী</div>
                  </div>

                  <div>
                    <div className="border-t border-slate-500 pt-1.5 font-bold text-slate-950">
                      অফিসার (হিসাব)
                    </div>
                    <div className="text-[11px] text-slate-600">যাচাইকারী</div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};
