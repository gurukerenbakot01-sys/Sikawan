import React from 'react';
import { Submission, Teacher } from '../types';
import { FileCheck, CalendarDays, CheckCircle2, TrendingUp, UserCheck } from 'lucide-react';

interface StatsBarProps {
  submissions: Submission[];
  teachers: Teacher[];
  onSelectFilterType?: (type: string) => void;
}

export const StatsBar: React.FC<StatsBarProps> = ({
  submissions,
  teachers,
  onSelectFilterType
}) => {
  const totalSubmissions = submissions.length;
  
  // Count Harian submissions (either purely harian or keduanya)
  const harianCount = submissions.filter(
    s => s.reportType === 'harian' || s.reportType === 'keduanya'
  ).length;

  // Count Bulanan submissions (either purely bulanan or keduanya)
  const bulananCount = submissions.filter(
    s => s.reportType === 'bulanan' || s.reportType === 'keduanya'
  ).length;

  // Unique teachers who submitted
  const uniqueTeachersSubmitted = new Set(submissions.map(s => s.teacherId)).size;
  const verifiedCount = submissions.filter(s => s.status === 'Diverifikasi').length;
  const verifiedRate = totalSubmissions > 0 ? Math.round((verifiedCount / totalSubmissions) * 100) : 100;

  return (
    <div id="sikawan-stats-bar" className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
      
      {/* Stat 1: Total Pengiriman */}
      <div 
        onClick={() => onSelectFilterType && onSelectFilterType('all')}
        className="bg-white rounded-xl p-3.5 sm:p-4 border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Laporan Terkirim
            </p>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 group-hover:text-emerald-700 transition-colors">
              {totalSubmissions}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <FileCheck className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-2.5 flex items-center text-[11px] text-emerald-700 font-medium">
          <TrendingUp className="w-3.5 h-3.5 mr-1 text-emerald-500" />
          <span>Tahun Anggaran 2026</span>
        </div>
      </div>

      {/* Stat 2: Laporan Harian */}
      <div 
        onClick={() => onSelectFilterType && onSelectFilterType('harian')}
        className="bg-white rounded-xl p-3.5 sm:p-4 border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Kinerja Harian
            </p>
            <h3 className="text-xl sm:text-2xl font-bold text-emerald-700 mt-1">
              {harianCount}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition-colors">
            <CalendarDays className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-2.5 flex items-center text-[11px] text-slate-600">
          <span className="text-slate-500">Laporan Aktivitas Harian Guru</span>
        </div>
      </div>

      {/* Stat 3: Laporan Bulanan */}
      <div 
        onClick={() => onSelectFilterType && onSelectFilterType('bulanan')}
        className="bg-white rounded-xl p-3.5 sm:p-4 border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Kinerja Bulanan
            </p>
            <h3 className="text-xl sm:text-2xl font-bold text-indigo-700 mt-1">
              {bulananCount}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-2.5 flex items-center text-[11px] text-slate-600">
          <span className="text-slate-500">Rekap Capaian Bulanan</span>
        </div>
      </div>

      {/* Stat 4: Guru Aktif & Kepatuhan */}
      <div className="bg-white rounded-xl p-3.5 sm:p-4 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Guru Melapor
            </p>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              {uniqueTeachersSubmitted} <span className="text-xs font-normal text-slate-500">/ {teachers.length} Guru</span>
            </h3>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-600">
          <span>Verifikasi: <strong className="text-emerald-700 font-semibold">{verifiedRate}%</strong></span>
          <span className="text-emerald-600 font-medium">{verifiedCount} Diverifikasi</span>
        </div>
      </div>

    </div>
  );
};
