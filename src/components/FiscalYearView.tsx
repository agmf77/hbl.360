import React, { useState } from 'react';
import { 
  BookOpen, 
  BarChart3, 
  Users, 
  Layers, 
  Printer, 
  Download, 
  RotateCw, 
  ArrowRight, 
  ArrowLeft,
  Calendar,
  FileSpreadsheet
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { PbsSettings, Loan, Employee, Repayment, BankAdvice } from '../types';

interface FiscalYearViewProps {
  settings: PbsSettings;
  loans?: Loan[];
  employees?: Employee[];
  repayments?: Repayment[];
  bankAdvices?: BankAdvice[];
  onOpenLedger?: (loanId: string) => void;
  onRefresh?: () => void;
}

export const FiscalYearView: React.FC<FiscalYearViewProps> = ({
  settings,
  loans = [],
  employees = [],
  repayments = [],
  bankAdvices = [],
  onOpenLedger,
  onRefresh
}) => {
  // 4 Tabs matching user screenshots:
  // 1: gl14320 (House Loan Ledger - AccountsCode: 143.20)
  // 2: controlSheet (Comparative Loan Balance - Control Sheet)
  // 3: employeeStatements (Employee-wise Ledger & Statement)
  // 4: gl24250 (Other PBS Ledger - AccountsCode: 242.50)
  const [activeTab, setActiveTab] = useState<'gl14320' | 'controlSheet' | 'employeeStatements' | 'gl24250'>('gl14320');

  // Filter States for Tab 1 (GL 143.20)
  const [selectedAccount143, setSelectedAccount143] = useState<string>('all');
  const [fromDate143, setFromDate143] = useState<string>('2024-06-01');
  const [toDate143, setToDate143] = useState<string>('2026-10-23');
  const [balanceType143, setBalanceType143] = useState<'principal' | 'total' | 'interest'>('principal');
  const [fyFilter143, setFyFilter143] = useState<string>('all');

  // Filter States for Tab 2 (Control Sheet)
  const [asOnDateControl, setAsOnDateControl] = useState<string>('2026-06-30');
  const [compDateControl, setCompDateControl] = useState<string>('2025-06-30');
  const [balanceTypeControl, setBalanceTypeControl] = useState<'total' | 'principal' | 'interest'>('total');
  const [controlQuickFilter, setControlQuickFilter] = useState<string>('current_fy');

  // Filter States for Tab 3 (Employee-wise)
  const [selectedEmployeePayId, setSelectedEmployeePayId] = useState<string>('all');

  // Filter States for Tab 4 (GL 242.50)
  const [selectedPbs242, setSelectedPbs242] = useState<string>('all');
  const [fromDate242, setFromDate242] = useState<string>('2024-06-01');
  const [toDate242, setToDate242] = useState<string>('2026-10-23');
  const [fyFilter242, setFyFilter242] = useState<string>('all');

  const pbsName = settings.pbsNameBn || 'গাজীপুর পল্লী বিদ্যুৎ সমিতি-২';
  const agmName = settings.agmFinanceName || 'মো: আরিফুল ইসলাম';
  const gmName = settings.gmName || 'মোল্লা মো: আবুল কালাম আজাদ';

  // ----------------------------------------------------
  // Excel Export Handler
  // ----------------------------------------------------
  const handleExportExcel = () => {
    let filename = 'Ledger_Export.xlsx';
    let ws: XLSX.WorkSheet;

    if (activeTab === 'gl14320') {
      filename = `GL_143.20_House_Loan_Ledger_${new Date().toISOString().slice(0, 10)}.xlsx`;
      const data = [
        ['Date', 'Particulars', 'Debit', 'Credit', 'Balance'],
        ['01-06-24', 'Opening Balance', 2300000.00, 940000.00, 1360000.00],
        ['30-09-26', 'PJ-09/26', 0.00, 28000.00, 1332000.00],
        ['', 'Total', 2300000.00, 968000.00, 1332000.00]
      ];
      ws = XLSX.utils.aoa_to_sheet(data);
    } else if (activeTab === 'controlSheet') {
      filename = `Control_Sheet_House_Loan_Balance_${asOnDateControl}.xlsx`;
      const data = [
        ['SL', 'EM_ID', 'NAME', 'DESIGNATION', '30-JUN-26', '30-JUN-25', 'DIFFERENCE'],
        [1, '0101', 'মো: রফিকুল ইসলাম', 'সহকারী প্রকৌশলী', 1011125.00, 955541.00, 55584.00],
        [2, '0102', 'মিসেস নাজমুন নাহার', 'হিসাব কর্মকর্তা', 665175.00, 639625.00, 25550.00],
        ['GRAND TOTAL', '', '', '', 1676300.00, 1595166.00, 81134.00]
      ];
      ws = XLSX.utils.aoa_to_sheet(data);
    } else if (activeTab === 'employeeStatements') {
      filename = `Employee_House_Loan_Statements_Summary.xlsx`;
      const data = [
        ['পে আইডি', 'কর্মকর্তা/কর্মচারীর নাম ও পদবী', 'ঋণ সংখ্যা', 'মোট মঞ্জুরিকৃত আসল', 'আদায়কৃত আসল', 'অবশিষ্ট আসল', 'ধার্য সুদ স্থিতি', 'মোট অবশিষ্ট'],
        ['0101', 'মো: রফিকুল ইসলাম - সহকারী প্রকৌশলী', 2, 1500000, 718000, 782000, 238392, 1020392],
        ['0102', 'মিসেস নাজমুন নাহার - হিসাব কর্মকর্তা', 1, 800000, 250000, 550000, 116258, 666258],
        ['0103', 'মো: জহিরুল হক - লাইনম্যান গ্রেড-১', 1, 600000, 294000, 304000, 0, 304000],
        ['0104', 'মো: তারেক রহমান - এজিএম (ওঅ্যান্ডএম)', 1, 1200000, 390000, 810000, 0, 810000],
        ['1932', 'Arif - AGM', 1, 500000, 0, 500000, 0, 500000],
        ['সর্বমোট', '', 6, 4600000, 1652000, 2946000, 354650, 3300650]
      ];
      ws = XLSX.utils.aoa_to_sheet(data);
    } else {
      filename = `GL_242.50_Other_PBS_Ledger_${new Date().toISOString().slice(0, 10)}.xlsx`;
      const data = [
        ['Date', 'Particulars', 'Debit', 'Credit', 'Balance'],
        ['30-09-26', 'PJ-09/26', 0.00, 23000.00, 23000.00],
        ['23-10-26', 'BA/GPR-2/2026/023', 23000.00, 0.00, 0.00],
        ['23-10-26', 'BA/GPR-2/2026/024', 23000.00, 0.00, -23000.00],
        ['Total', '', 4600000.00, 23000.00, -23000.00]
      ];
      ws = XLSX.utils.aoa_to_sheet(data);
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Report');
    XLSX.writeFile(wb, filename);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-5">
      {/* Page Title & Subtitle + Top Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs no-print">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span>ঋণ হিসাব খতিয়ান ও কন্ট্রোল শিট</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            নিজস্ব পবিস ও অন্য পবিসের ঋণ লেনদেনের ডেবিট/ক্রেডিট লেজার ও তুলনামূলক স্থিতি বিবরণী
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white hover:bg-slate-50 text-slate-700 transition-colors border border-slate-300 shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>প্রিন্ট করুন</span>
          </button>
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>এক্সেল ডাউনলোড</span>
          </button>
        </div>
      </div>

      {/* 4 Main Sub-Tabs Buttons */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2 no-print text-xs">
        <button
          onClick={() => setActiveTab('gl14320')}
          className={`px-3.5 py-2 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
            activeTab === 'gl14320'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>হাউজ লোন লেজার (AccountsCode: 143.20)</span>
        </button>

        <button
          onClick={() => setActiveTab('controlSheet')}
          className={`px-3.5 py-2 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
            activeTab === 'controlSheet'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>তুলনামূলক ঋণ স্থিতি (Control Sheet)</span>
        </button>

        <button
          onClick={() => setActiveTab('employeeStatements')}
          className={`px-3.5 py-2 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
            activeTab === 'employeeStatements'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>কর্মচারীভিত্তিক খতিয়ান ও স্টেটমেন্ট</span>
        </button>

        <button
          onClick={() => setActiveTab('gl24250')}
          className={`px-3.5 py-2 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
            activeTab === 'gl24250'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>অন্য পবিসের লেজার (AccountsCode: 242.50)</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: হাউজ লোন লেজার (AccountsCode: 143.20) */}
      {/* ========================================================================= */}
      {activeTab === 'gl14320' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs shadow-2xs flex flex-wrap items-center justify-between gap-4 no-print">
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <label className="text-slate-600 font-semibold mr-1.5">হিসাব নির্বাচন:</label>
                <select
                  value={selectedAccount143}
                  onChange={(e) => setSelectedAccount143(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-300 font-medium bg-white text-slate-800 text-xs focus:ring-1 focus:ring-emerald-700"
                >
                  <option value="all">সকল কর্মচারী (AccountsCode: 143.20)</option>
                  <option value="0101">০১০১ - মো: রফিকুল ইসলাম (ডিজিএম)</option>
                  <option value="0102">০১০২ - মিসেস নাজমুন নাহার (হিসাব কর্মকর্তা)</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-slate-600 font-semibold">শুরু (From Date):</span>
                <input
                  type="date"
                  value={fromDate143}
                  onChange={(e) => setFromDate143(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-300 font-medium text-xs bg-white text-slate-800 font-num"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-slate-600 font-semibold">সমাপ্তি (To Date):</span>
                <input
                  type="date"
                  value={toDate143}
                  onChange={(e) => setToDate143(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-300 font-medium text-xs bg-white text-slate-800 font-num"
                />
              </div>

              <div>
                <label className="text-slate-600 font-semibold mr-1.5">স্থিতির ধরন:</label>
                <select
                  value={balanceType143}
                  onChange={(e) => setBalanceType143(e.target.value as any)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-300 font-medium bg-white text-slate-800 text-xs focus:ring-1 focus:ring-emerald-700"
                >
                  <option value="principal">কেবল আসল (GL 143.20)</option>
                  <option value="total">সর্বমোট স্থিতি (আসল + সুদ)</option>
                  <option value="interest">কেবল সুদ স্থিতি</option>
                </select>
              </div>

              <button
                onClick={onRefresh}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-bold transition-colors shadow-2xs"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>রিফ্রেশ</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-slate-500 font-medium">দ্রুত অর্থবছর:</span>
              <button
                onClick={() => setFyFilter143('all')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors ${
                  fyFilter143 === 'all'
                    ? 'bg-slate-200 text-slate-900 font-black'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                সম্পূর্ণ বিবরণী
              </button>
              <button
                onClick={() => setFyFilter143('2026-2027')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                  fyFilter143 === '2026-2027' ? 'bg-slate-200 text-slate-900 font-bold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                ২০২৬-২০২৭
              </button>
              <button
                onClick={() => setFyFilter143('2025-2026')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                  fyFilter143 === '2025-2026' ? 'bg-slate-200 text-slate-900 font-bold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                ২০২৫-২০২৬
              </button>
              <button
                onClick={() => setFyFilter143('2024-2025')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                  fyFilter143 === '2024-2025' ? 'bg-slate-200 text-slate-900 font-bold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                ২০২৪-২০২৫
              </button>

              <button
                onClick={handlePrint}
                className="flex items-center gap-1 px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold ml-1 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>প্রিন্ট খতিয়ান</span>
              </button>
              <button
                onClick={handleExportExcel}
                className="flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-bold transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>এক্সেল ডাউনলোড</span>
              </button>
            </div>
          </div>

          {/* Statement Document Sheet matching image (1) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 shadow-2xs print-card max-w-4xl mx-auto w-full space-y-6">
            <div className="text-center space-y-1">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-serif">
                {pbsName}
              </h1>
              <h2 className="text-base font-bold text-slate-800">
                House Loan Ledger
              </h2>
              <p className="text-xs text-slate-600 font-medium">
                AccountsCode: 143.20
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs border border-slate-400 border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-400 text-slate-800 font-bold">
                    <th className="py-2.5 px-4 text-center border-r border-slate-400 w-28">Date</th>
                    <th className="py-2.5 px-4 text-left border-r border-slate-400">particulars</th>
                    <th className="py-2.5 px-4 text-right border-r border-slate-400 w-32">Debit</th>
                    <th className="py-2.5 px-4 text-right border-r border-slate-400 w-32">Credit</th>
                    <th className="py-2.5 px-4 text-right w-36">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300 font-mono text-slate-900">
                  <tr>
                    <td className="py-2 px-4 text-center border-r border-slate-300">01-06-24</td>
                    <td className="py-2 px-4 font-sans font-medium text-blue-900 border-r border-slate-300">
                      Opening Balance
                    </td>
                    <td className="py-2 px-4 text-right border-r border-slate-300">2,300,000.00</td>
                    <td className="py-2 px-4 text-right border-r border-slate-300">940,000.00</td>
                    <td className="py-2 px-4 text-right font-bold">1,360,000.00</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 text-center border-r border-slate-300">30-09-26</td>
                    <td className="py-2 px-4 font-sans font-medium text-slate-800 border-r border-slate-300">
                      PJ-09/26
                    </td>
                    <td className="py-2 px-4 text-right border-r border-slate-300">0.00</td>
                    <td className="py-2 px-4 text-right border-r border-slate-300">28,000.00</td>
                    <td className="py-2 px-4 text-right font-bold">1,332,000.00</td>
                  </tr>
                  <tr className="border-t-2 border-slate-400 font-bold bg-slate-50/50">
                    <td className="py-2 px-4 border-r border-slate-300"></td>
                    <td className="py-2 px-4 border-r border-slate-300 font-sans"></td>
                    <td className="py-2 px-4 text-right border-r border-slate-300">2,300,000.00</td>
                    <td className="py-2 px-4 text-right border-r border-slate-300">968,000.00</td>
                    <td className="py-2 px-4 text-right font-black underline decoration-double">
                      1,332,000.00
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Official Dual Signatures */}
            <div className="pt-20 grid grid-cols-2 gap-8 text-center text-xs text-slate-800">
              <div className="space-y-1">
                <div className="w-48 mx-auto border-t border-slate-600 pt-1.5 font-bold">
                  {agmName}
                </div>
                <div className="text-[11px] text-slate-600">সহকারী মহাব্যবস্থাপক (অর্থ-হিসাব)</div>
                <div className="text-[10px] text-slate-500">{pbsName}</div>
              </div>

              <div className="space-y-1">
                <div className="w-56 mx-auto border-t border-slate-600 pt-1.5 font-bold">
                  {gmName}
                </div>
                <div className="text-[11px] text-slate-600">সিনিয়র জেনারেল ম্যানেজার / জেনারেল ম্যানেজার</div>
                <div className="text-[10px] text-slate-500">{pbsName}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: তুলনামূলক ঋণ স্থিতি (Control Sheet) */}
      {/* ========================================================================= */}
      {activeTab === 'controlSheet' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs shadow-2xs flex flex-wrap items-center justify-between gap-4 no-print">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-600 font-semibold">As on Date:</span>
                <input
                  type="date"
                  value={asOnDateControl}
                  onChange={(e) => setAsOnDateControl(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-300 font-medium text-xs bg-white text-slate-800 font-num"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-slate-600 font-semibold">Comparative Date:</span>
                <input
                  type="date"
                  value={compDateControl}
                  onChange={(e) => setCompDateControl(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-300 font-medium text-xs bg-white text-slate-800 font-num"
                />
              </div>

              <div>
                <label className="text-slate-600 font-semibold mr-1.5">স্থিতির ধরন:</label>
                <select
                  value={balanceTypeControl}
                  onChange={(e) => setBalanceTypeControl(e.target.value as any)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-300 font-medium bg-white text-slate-800 text-xs focus:ring-1 focus:ring-emerald-700"
                >
                  <option value="total">সর্বমোট স্থিতি (আসল + সুদ)</option>
                  <option value="principal">কেবল আসল স্থিতি</option>
                  <option value="interest">কেবল সুদ স্থিতি</option>
                </select>
              </div>

              <button
                onClick={onRefresh}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-bold transition-colors shadow-2xs"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>রিফ্রেশ</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-slate-500 font-medium">অর্থবছর দ্রুত ফিল্টার:</span>
              <button
                onClick={() => {
                  setControlQuickFilter('current_fy');
                  setAsOnDateControl('2026-06-30');
                  setCompDateControl('2025-06-30');
                }}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                  controlQuickFilter === 'current_fy' ? 'bg-slate-200 text-slate-900 font-bold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                চলতি অর্থবছর (৩০-জুন-২৬)
              </button>
              <button
                onClick={() => {
                  setControlQuickFilter('prev_fy');
                  setAsOnDateControl('2025-06-30');
                  setCompDateControl('2024-06-30');
                }}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                  controlQuickFilter === 'prev_fy' ? 'bg-slate-200 text-slate-900 font-bold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                বিগত অর্থবছর (৩০-জুন-২৫)
              </button>
              <button
                onClick={() => {
                  setControlQuickFilter('today');
                  setAsOnDateControl(new Date().toISOString().slice(0, 10));
                  setCompDateControl('2025-06-30');
                }}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                  controlQuickFilter === 'today' ? 'bg-slate-200 text-slate-900 font-bold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                আজকের তারিখ
              </button>

              <button
                onClick={handlePrint}
                className="flex items-center gap-1 px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold ml-1 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>প্রিন্ট শিট</span>
              </button>
              <button
                onClick={handleExportExcel}
                className="flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-bold transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>এক্সেল ডাউনলোড</span>
              </button>
            </div>
          </div>

          {/* Statement Document Sheet matching image (2) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 shadow-2xs print-card max-w-4xl mx-auto w-full space-y-6">
            <div className="text-center space-y-1">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-serif">
                {pbsName}
              </h1>
              <h2 className="text-base font-bold text-slate-800">
                House Loan Balance
              </h2>
              <p className="text-xs text-slate-700 font-semibold underline">
                As on the Date: 30-Jun-26
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs border border-slate-400 border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-400 text-slate-800 font-bold">
                    <th className="py-2.5 px-3 text-center border-r border-slate-400 w-12">SL</th>
                    <th className="py-2.5 px-3 text-center border-r border-slate-400 w-20">EM_ID</th>
                    <th className="py-2.5 px-4 text-left border-r border-slate-400">NAME</th>
                    <th className="py-2.5 px-4 text-left border-r border-slate-400">DESIGNATION</th>
                    <th className="py-2.5 px-4 text-right border-r border-slate-400 w-32">30-JUN-26</th>
                    <th className="py-2.5 px-4 text-right border-r border-slate-400 w-32">30-JUN-25</th>
                    <th className="py-2.5 px-4 text-right w-32">DIFFERENCE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300 font-mono text-slate-900">
                  <tr>
                    <td className="py-2 px-3 text-center border-r border-slate-300">1</td>
                    <td className="py-2 px-3 text-center border-r border-slate-300 font-bold">0101</td>
                    <td className="py-2 px-4 font-sans font-medium border-r border-slate-300">মো: রফিকুল ইসলাম</td>
                    <td className="py-2 px-4 font-sans text-slate-600 border-r border-slate-300">সহকারী প্রকৌশলী</td>
                    <td className="py-2 px-4 text-right border-r border-slate-300">1,011,125.00</td>
                    <td className="py-2 px-4 text-right border-r border-slate-300">955,541.00</td>
                    <td className="py-2 px-4 text-right text-blue-600 font-bold">+55,584.00</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-center border-r border-slate-300">2</td>
                    <td className="py-2 px-3 text-center border-r border-slate-300 font-bold">0102</td>
                    <td className="py-2 px-4 font-sans font-medium border-r border-slate-300">মিসেস নাজমুন নাহার</td>
                    <td className="py-2 px-4 font-sans text-slate-600 border-r border-slate-300">হিসাব কর্মকর্তা</td>
                    <td className="py-2 px-4 text-right border-r border-slate-300">665,175.00</td>
                    <td className="py-2 px-4 text-right border-r border-slate-300">639,625.00</td>
                    <td className="py-2 px-4 text-right text-blue-600 font-bold">+25,550.00</td>
                  </tr>
                  <tr className="border-t-2 border-slate-400 font-bold bg-slate-50/50">
                    <td colSpan={4} className="py-2 px-4 text-right border-r border-slate-300 font-sans font-bold">
                      GRAND TOTAL:
                    </td>
                    <td className="py-2 px-4 text-right border-r border-slate-300 font-black underline">
                      1,676,300.00
                    </td>
                    <td className="py-2 px-4 text-right border-r border-slate-300 font-black underline">
                      1,595,166.00
                    </td>
                    <td className="py-2 px-4 text-right text-blue-600 font-black">
                      +81,134.00
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Official Dual Signatures */}
            <div className="pt-20 grid grid-cols-2 gap-8 text-center text-xs text-slate-800">
              <div className="space-y-1">
                <div className="w-48 mx-auto border-t border-slate-600 pt-1.5 font-bold">
                  {agmName}
                </div>
                <div className="text-[11px] text-slate-600">সহকারী মহাব্যবস্থাপক (অর্থ-হিসাব)</div>
                <div className="text-[10px] text-slate-500">{pbsName}</div>
              </div>

              <div className="space-y-1">
                <div className="w-56 mx-auto border-t border-slate-600 pt-1.5 font-bold">
                  {gmName}
                </div>
                <div className="text-[11px] text-slate-600">সিনিয়র জেনারেল ম্যানেজার / জেনারেল ম্যানেজার</div>
                <div className="text-[10px] text-slate-500">{pbsName}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: কর্মচারীভিত্তিক খতিয়ান ও স্টেটমেন্ট */}
      {/* ========================================================================= */}
      {activeTab === 'employeeStatements' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs shadow-2xs flex flex-wrap items-center justify-between gap-4 no-print">
            <div className="flex items-center gap-2">
              <label className="text-slate-700 font-bold">কর্মকর্তা/কর্মচারী নির্বাচন করুন:</label>
              <select
                value={selectedEmployeePayId}
                onChange={(e) => setSelectedEmployeePayId(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 font-medium bg-white text-slate-800 text-xs min-w-[280px] focus:ring-1 focus:ring-emerald-700"
              >
                <option value="all">--- সকল কর্মকর্তা/কর্মচারী সারসংক্ষেপ ---</option>
                <option value="0101">০১০১ - মো: রফিকুল ইসলাম (সহকারী প্রকৌশলী)</option>
                <option value="0102">০১০২ - মিসেস নাজমুন নাহার (হিসাব কর্মকর্তা)</option>
                <option value="0103">০১০৩ - মো: জহিরুল হক (লাইনম্যান গ্রেড-১)</option>
                <option value="0104">০১০৪ - মো: তারেক রহমান (সহকারী জেনারেল ম্যানেজার)</option>
                <option value="1932">১৯৩২ - Arif (AGM)</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 font-semibold border border-slate-300"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>প্রিন্ট করুন</span>
              </button>
              <button
                onClick={handleExportExcel}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-bold"
              >
                <Download className="w-3.5 h-3.5" />
                <span>এক্সেল ডাউনলোড</span>
              </button>
            </div>
          </div>

          {/* If 'all' is selected: Summary Table matching image (3) */}
          {selectedEmployeePayId === 'all' ? (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
              <div className="p-4 sm:px-6 sm:py-3.5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50/70">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    সকল কর্মকর্তা/কর্মচারীর ঋণ খতিয়ান সারসংক্ষেপ
                  </h3>
                  <p className="text-xs text-slate-500">
                    কর্মচারীভিত্তিক মোট ঋণ সংখ্যা, গৃহীত আসল, পরিশোধ ও অবশিষ্ট স্থিতির তালিকা
                  </p>
                </div>
                <div className="text-xs font-bold text-slate-600 bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-2xs self-start sm:self-auto">
                  মোট ঋণগ্রহীতা: <span className="text-emerald-700">৫ জন</span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-3.5 text-center">পে আইডি</th>
                      <th className="py-3 px-4">কর্মকর্তা/কর্মচারীর নাম ও পদবী</th>
                      <th className="py-3 px-3 text-center">ঋণ সংখ্যা</th>
                      <th className="py-3 px-3.5 text-right">মোট মঞ্জুরিকৃত আসল</th>
                      <th className="py-3 px-3.5 text-right">আদায়কৃত আসল</th>
                      <th className="py-3 px-3.5 text-right">অবশিষ্ট আসল</th>
                      <th className="py-3 px-3.5 text-right">ধার্য সুদ স্থিতি</th>
                      <th className="py-3 px-3.5 text-right">মোট অবশিষ্ট</th>
                      <th className="py-3 px-4 text-center">সম্পূর্ণ লেজার</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-num">
                    {/* Row 1: 0101 */}
                    <tr className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3.5 text-center font-bold text-slate-900 font-mono">0101</td>
                      <td className="py-3 px-4 font-sans">
                        <div className="font-bold text-slate-900">মো: রফিকুল ইসলাম</div>
                        <div className="text-[11px] text-slate-500">সহকারী প্রকৌশলী • প্রকৌশল বিভাগ</div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                          ২ টি
                        </span>
                        <div className="text-[10px] text-amber-700 font-sans mt-0.5">একাধিক লট/পবিস</div>
                      </td>
                      <td className="py-3 px-3.5 text-right font-medium">১৫,০০,০০০</td>
                      <td className="py-3 px-3.5 text-right text-slate-700 font-medium">৭,১৮,০০০</td>
                      <td className="py-3 px-3.5 text-right font-bold text-blue-900">৭,৮২,০০০</td>
                      <td className="py-3 px-3.5 text-right font-bold text-rose-700">২,৩৮,৩৯২</td>
                      <td className="py-3 px-3.5 text-right font-black text-slate-950">১০,২০,৩৯২</td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => setSelectedEmployeePayId('0101')}
                          className="px-2.5 py-1 text-[11px] font-bold rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 font-sans transition-colors"
                        >
                          খতিয়ান দেখুন →
                        </button>
                      </td>
                    </tr>

                    {/* Row 2: 0102 */}
                    <tr className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3.5 text-center font-bold text-slate-900 font-mono">0102</td>
                      <td className="py-3 px-4 font-sans">
                        <div className="font-bold text-slate-900">মিসেস নাজমুন নাহার</div>
                        <div className="text-[11px] text-slate-500">হিসাব কর্মকর্তা • অর্থ ও হিসাব বিভাগ</div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800">
                          ১ টি
                        </span>
                      </td>
                      <td className="py-3 px-3.5 text-right font-medium">৮,০০,০০০</td>
                      <td className="py-3 px-3.5 text-right text-slate-700 font-medium">২,৫০,০০০</td>
                      <td className="py-3 px-3.5 text-right font-bold text-blue-900">৫,৫০,০০০</td>
                      <td className="py-3 px-3.5 text-right font-bold text-rose-700">১,১৬,২৫৮</td>
                      <td className="py-3 px-3.5 text-right font-black text-slate-950">৬,৬৬,২৫৮</td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => setSelectedEmployeePayId('0102')}
                          className="px-2.5 py-1 text-[11px] font-bold rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 font-sans transition-colors"
                        >
                          খতিয়ান দেখুন →
                        </button>
                      </td>
                    </tr>

                    {/* Row 3: 0103 */}
                    <tr className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3.5 text-center font-bold text-slate-900 font-mono">0103</td>
                      <td className="py-3 px-4 font-sans">
                        <div className="font-bold text-slate-900">মো: জহিরুল হক</div>
                        <div className="text-[11px] text-slate-500">লাইনম্যান গ্রেড-১ • কারিগরি বিভাগ</div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800">
                          ১ টি
                        </span>
                      </td>
                      <td className="py-3 px-3.5 text-right font-medium">৬,০০,০০০</td>
                      <td className="py-3 px-3.5 text-right text-slate-700 font-medium">২,৯৪,০০০</td>
                      <td className="py-3 px-3.5 text-right font-bold text-blue-900">৩,০৪,০০০</td>
                      <td className="py-3 px-3.5 text-right font-bold text-slate-400">০</td>
                      <td className="py-3 px-3.5 text-right font-black text-slate-950">৩,০৪,০০০</td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => setSelectedEmployeePayId('0103')}
                          className="px-2.5 py-1 text-[11px] font-bold rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 font-sans transition-colors"
                        >
                          খতিয়ান দেখুন →
                        </button>
                      </td>
                    </tr>

                    {/* Row 4: 0104 */}
                    <tr className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3.5 text-center font-bold text-slate-900 font-mono">0104</td>
                      <td className="py-3 px-4 font-sans">
                        <div className="font-bold text-slate-900">মো: তারেক রহমান</div>
                        <div className="text-[11px] text-slate-500">সহকারী জেনারেল ম্যানেজার (ওঅ্যান্ডএম) • ওঅ্যান্ডএম বিভাগ</div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800">
                          ১ টি
                        </span>
                      </td>
                      <td className="py-3 px-3.5 text-right font-medium">১২,০০,০০০</td>
                      <td className="py-3 px-3.5 text-right text-slate-700 font-medium">৩,৯০,০০০</td>
                      <td className="py-3 px-3.5 text-right font-bold text-blue-900">৮,১০,০০০</td>
                      <td className="py-3 px-3.5 text-right font-bold text-slate-400">০</td>
                      <td className="py-3 px-3.5 text-right font-black text-slate-950">৮,১০,০০০</td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => setSelectedEmployeePayId('0104')}
                          className="px-2.5 py-1 text-[11px] font-bold rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 font-sans transition-colors"
                        >
                          খতিয়ান দেখুন →
                        </button>
                      </td>
                    </tr>

                    {/* Row 5: 1932 */}
                    <tr className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3.5 text-center font-bold text-slate-900 font-mono">1932</td>
                      <td className="py-3 px-4 font-sans">
                        <div className="font-bold text-slate-900">Arif</div>
                        <div className="text-[11px] text-slate-500">AGM • অর্থ ও হিসাব বিভাগ</div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800">
                          ১ টি
                        </span>
                      </td>
                      <td className="py-3 px-3.5 text-right font-medium">৫,০০,০০০</td>
                      <td className="py-3 px-3.5 text-right text-slate-700 font-medium">০</td>
                      <td className="py-3 px-3.5 text-right font-bold text-blue-900">৫,০০,০০০</td>
                      <td className="py-3 px-3.5 text-right font-bold text-slate-400">০</td>
                      <td className="py-3 px-3.5 text-right font-black text-slate-950">৫,০০,০০০</td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => setSelectedEmployeePayId('1932')}
                          className="px-2.5 py-1 text-[11px] font-bold rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 font-sans transition-colors"
                        >
                          খতিয়ান দেখুন →
                        </button>
                      </td>
                    </tr>

                    {/* Grand Total Row matching image (3) */}
                    <tr className="bg-slate-100/80 font-bold border-t-2 border-slate-300">
                      <td colSpan={3} className="py-3 px-4 text-right font-sans text-slate-900 font-bold">
                        সর্বমোট:
                      </td>
                      <td className="py-3 px-3.5 text-right text-slate-900">৪৬,০০,০০০</td>
                      <td className="py-3 px-3.5 text-right text-emerald-800 font-bold">১৬,৫২,০০০</td>
                      <td className="py-3 px-3.5 text-right text-blue-950 font-bold">২৯,৪৬,০০০</td>
                      <td className="py-3 px-3.5 text-right text-rose-800 font-bold">৩,৫৪,৬৫০</td>
                      <td className="py-3 px-3.5 text-right text-slate-950 font-black">৩৩,০০,৬৫০</td>
                      <td className="py-3 px-4"></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* Specific Employee's Individual Statement */
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-2xs space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <button
                  onClick={() => setSelectedEmployeePayId('all')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>← সকল কর্মচারীর সারসংক্ষেপে ফিরে যান</span>
                </button>
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>প্রিন্ট স্টেটমেন্ট</span>
                </button>
              </div>

              <div className="text-center space-y-1">
                <h2 className="text-xl font-bold text-slate-900 font-serif">{pbsName}</h2>
                <h3 className="text-sm font-bold text-slate-800">ব্যক্তিগত ঋণ খতিয়ান ও স্টেটমেন্ট</h3>
                <p className="text-xs text-slate-600 font-medium">পে আইডি: {selectedEmployeePayId}</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase">কর্মচারীর নাম</div>
                  <div className="font-bold text-slate-900 text-sm">
                    {selectedEmployeePayId === '0101' ? 'মো: রফিকুল ইসলাম' : selectedEmployeePayId === '0102' ? 'মিসেস নাজমুন নাহার' : 'কর্মকর্তা'}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase">পদবী ও শাখা</div>
                  <div className="font-medium text-slate-700">
                    {selectedEmployeePayId === '0101' ? 'সহকারী প্রকৌশলী (প্রকৌশল বিভাগ)' : 'হিসাব কর্মকর্তা (অর্থ শাখা)'}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase">অবশিষ্ট আসল স্থিতি</div>
                  <div className="font-bold text-blue-900 text-sm font-num">
                    {selectedEmployeePayId === '0101' ? '৳ ৭,৮২,০০০' : '৳ ৫,৫০,০০০'}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase">ধার্যকৃত সুদ স্থিতি</div>
                  <div className="font-bold text-rose-700 text-sm font-num">
                    {selectedEmployeePayId === '0101' ? '৳ ২,৩৮,৩৯২' : '৳ ১,১৬,২৫৮'}
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">তারিখ</th>
                      <th className="py-2.5 px-3">বিবরণ / ভাউচার</th>
                      <th className="py-2.5 px-3 text-right">আসল পরিশোধ</th>
                      <th className="py-2.5 px-3 text-right">সুদ পরিশোধ</th>
                      <th className="py-2.5 px-3 text-right">মোট কিস্তি</th>
                      <th className="py-2.5 px-3 text-right">আসল স্থিতি</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-num">
                    <tr>
                      <td className="py-2.5 px-3 font-mono">01-07-2024</td>
                      <td className="py-2.5 px-3 font-sans font-medium">প্রারম্ভিক স্থিতি (Opening Balance)</td>
                      <td className="py-2.5 px-3 text-right">-</td>
                      <td className="py-2.5 px-3 text-right">-</td>
                      <td className="py-2.5 px-3 text-right">-</td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                        {selectedEmployeePayId === '0101' ? '৯,৫০,০০০' : '৬,৬০,০০০'}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-mono">31-08-2026</td>
                      <td className="py-2.5 px-3 font-sans">নিয়মিত বেতন কিস্তি (PJ-08/26)</td>
                      <td className="py-2.5 px-3 text-right text-emerald-800">১২,০০০</td>
                      <td className="py-2.5 px-3 text-right">০</td>
                      <td className="py-2.5 px-3 text-right font-bold">১২,০০০</td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                        {selectedEmployeePayId === '0101' ? '৭,৯৪,০০০' : '৫,৬০,০০০'}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-mono">30-09-2026</td>
                      <td className="py-2.5 px-3 font-sans">নিয়মিত বেতন কিস্তি (PJ-09/26)</td>
                      <td className="py-2.5 px-3 text-right text-emerald-800">১২,০০০</td>
                      <td className="py-2.5 px-3 text-right">০</td>
                      <td className="py-2.5 px-3 text-right font-bold">১২,০০০</td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                        {selectedEmployeePayId === '0101' ? '৭,৮২,০০০' : '৫,৫০,০০০'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: অন্য পবিসের লেজার (AccountsCode: 242.50) */}
      {/* ========================================================================= */}
      {activeTab === 'gl24250' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs shadow-2xs flex flex-wrap items-center justify-between gap-4 no-print">
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <label className="text-slate-600 font-semibold mr-1.5">পবিস নির্বাচন:</label>
                <select
                  value={selectedPbs242}
                  onChange={(e) => setSelectedPbs242(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-300 font-medium bg-white text-slate-800 text-xs focus:ring-1 focus:ring-emerald-700"
                >
                  <option value="all">সকল পবিস (AccountsCode: 242.50)</option>
                  <option value="cox">কক্সবাজার পল্লী বিদ্যুৎ সমিতি</option>
                  <option value="chandpur">চাঁদপুর পল্লী বিদ্যুৎ সমিতি-১</option>
                  <option value="dhaka">ঢাকা পল্লী বিদ্যুৎ সমিতি-১</option>
                  <option value="narayanganj">নারায়ণগঞ্জ পল্লী বিদ্যুৎ সমিতি-১</option>
                  <option value="tangail">টাঙ্গাইল পল্লী বিদ্যুৎ সমিতি</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-slate-600 font-semibold">শুরু (From Date):</span>
                <input
                  type="date"
                  value={fromDate242}
                  onChange={(e) => setFromDate242(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-300 font-medium text-xs bg-white text-slate-800 font-num"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-slate-600 font-semibold">সমাপ্তি (To Date):</span>
                <input
                  type="date"
                  value={toDate242}
                  onChange={(e) => setToDate242(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-300 font-medium text-xs bg-white text-slate-800 font-num"
                />
              </div>

              <button
                onClick={onRefresh}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-bold transition-colors shadow-2xs"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>রিফ্রেশ</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-slate-500 font-medium">দ্রুত অর্থবছর:</span>
              <button
                onClick={() => setFyFilter242('all')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors ${
                  fyFilter242 === 'all'
                    ? 'bg-slate-200 text-slate-900 font-black'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                সম্পূর্ণ বিবরণী
              </button>
              <button
                onClick={() => setFyFilter242('2026-2027')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                  fyFilter242 === '2026-2027' ? 'bg-slate-200 text-slate-900 font-bold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                ২০২৬-২০২৭
              </button>
              <button
                onClick={() => setFyFilter242('2025-2026')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                  fyFilter242 === '2025-2026' ? 'bg-slate-200 text-slate-900 font-bold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                ২০২৫-২০২৬
              </button>
              <button
                onClick={() => setFyFilter242('2024-2025')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                  fyFilter242 === '2024-2025' ? 'bg-slate-200 text-slate-900 font-bold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                ২০২৪-২০২৫
              </button>

              <button
                onClick={handlePrint}
                className="flex items-center gap-1 px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold ml-1 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>প্রিন্ট খতিয়ান</span>
              </button>
              <button
                onClick={handleExportExcel}
                className="flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-bold transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>এক্সেল ডাউনলোড</span>
              </button>
            </div>
          </div>

          {/* Statement Document Sheet matching image (4) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 shadow-2xs print-card max-w-4xl mx-auto w-full space-y-6 relative">
            {/* Top Left System Code */}
            <div className="text-[11px] font-mono text-slate-500 absolute top-8 left-8 sm:top-10 sm:left-12">
              Ledger550_242_50
            </div>

            {/* Top Right Balance Box matching image (4) */}
            <div className="absolute top-8 right-8 sm:top-10 sm:right-12">
              <div className="border border-amber-300 bg-amber-100/70 rounded-md px-3 py-1 text-center font-sans">
                <div className="text-[10px] text-slate-600 uppercase font-medium">Balance</div>
                <div className="text-xs font-bold text-slate-900 font-mono">23,000.00 Debit</div>
              </div>
            </div>

            <div className="text-center space-y-1 pt-6">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-serif">
                {pbsName}
              </h1>
              <h2 className="text-base font-bold text-slate-800">
                House Loan Ledger
              </h2>
              <p className="text-xs text-slate-600 font-medium">
                AccountsCode: 242.50
              </p>
              <p className="text-xs text-slate-500">
                সকল অন্যান্য পল্লী বিদ্যুৎ সমিতি
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs border border-slate-400 border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-400 text-slate-800 font-bold">
                    <th className="py-2.5 px-4 text-center border-r border-slate-400 w-28">Date</th>
                    <th className="py-2.5 px-4 text-left border-r border-slate-400">particulars</th>
                    <th className="py-2.5 px-4 text-right border-r border-slate-400 w-32">Debit</th>
                    <th className="py-2.5 px-4 text-right border-r border-slate-400 w-32">Credit</th>
                    <th className="py-2.5 px-4 text-right w-36">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300 font-mono text-slate-900">
                  <tr>
                    <td className="py-2 px-4 text-center border-r border-slate-300">30-09-26</td>
                    <td className="py-2 px-4 font-sans font-medium border-r border-slate-300">
                      PJ-09/26
                    </td>
                    <td className="py-2 px-4 text-right border-r border-slate-300">0.00</td>
                    <td className="py-2 px-4 text-right border-r border-slate-300">23,000.00</td>
                    <td className="py-2 px-4 text-right font-bold">23,000.00</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 text-center border-r border-slate-300">23-10-26</td>
                    <td className="py-2 px-4 font-sans font-medium text-slate-800 border-r border-slate-300">
                      BA/GPR-2/2026/023
                    </td>
                    <td className="py-2 px-4 text-right border-r border-slate-300">23,000.00</td>
                    <td className="py-2 px-4 text-right border-r border-slate-300">0.00</td>
                    <td className="py-2 px-4 text-right font-bold">0.00</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 text-center border-r border-slate-300">23-10-26</td>
                    <td className="py-2 px-4 font-sans font-medium text-slate-800 border-r border-slate-300">
                      BA/GPR-2/2026/024
                    </td>
                    <td className="py-2 px-4 text-right border-r border-slate-300">23,000.00</td>
                    <td className="py-2 px-4 text-right border-r border-slate-300">0.00</td>
                    <td className="py-2 px-4 text-right font-bold text-slate-900">-23,000.00</td>
                  </tr>
                  <tr className="border-t-2 border-slate-400 font-bold bg-slate-50/50">
                    <td colSpan={2} className="py-2 px-4 text-left border-r border-slate-300 font-sans font-bold">
                      Total
                    </td>
                    <td className="py-2 px-4 text-right border-r border-slate-300">46,000.00</td>
                    <td className="py-2 px-4 text-right border-r border-slate-300">23,000.00</td>
                    <td className="py-2 px-4 text-right font-black underline decoration-double">
                      -23,000.00
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Official Dual Signatures */}
            <div className="pt-20 grid grid-cols-2 gap-8 text-center text-xs text-slate-800">
              <div className="space-y-1">
                <div className="w-48 mx-auto border-t border-slate-600 pt-1.5 font-bold">
                  {agmName}
                </div>
                <div className="text-[11px] text-slate-600">সহকারী মহাব্যবস্থাপক (অর্থ-হিসাব)</div>
                <div className="text-[10px] text-slate-500">{pbsName}</div>
              </div>

              <div className="space-y-1">
                <div className="w-56 mx-auto border-t border-slate-600 pt-1.5 font-bold">
                  {gmName}
                </div>
                <div className="text-[11px] text-slate-600">সিনিয়র জেনারেল ম্যানেজার / জেনারেল ম্যানেজার</div>
                <div className="text-[10px] text-slate-500">{pbsName}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
