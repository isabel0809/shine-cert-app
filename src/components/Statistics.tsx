import React from 'react';
import { PROJECTS, CATEGORIES } from '../constants';
import { LicenseEvent } from '../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { Shield, Users, AlertTriangle, CheckCircle2, TrendingUp, MapPin, ClipboardList, Timer } from 'lucide-react';
import { differenceInDays, isFuture, format, addMonths, startOfMonth, isAfter, isBefore } from 'date-fns';
import { cn } from '../utils/cn';

interface StatisticsProps {
  events: LicenseEvent[];
}

export const Statistics: React.FC<StatisticsProps> = ({ events }) => {
  // 1. Project Distribution
  const projectStats = PROJECTS.filter(p => p !== '全部').map(project => ({
    name: project,
    count: events.filter(e => e.project === project).length,
    expiring: events.filter(e => e.project === project && differenceInDays(e.expiryDate, new Date()) <= 30 && isFuture(e.expiryDate)).length
  }));

  // 2. Category Share
  const categoryStats = CATEGORIES.filter(c => c !== '全部').map(cat => ({
    name: cat,
    value: events.filter(e => e.category === cat).length
  })).filter(s => s.value > 0);

  // 3. Expiry Timeline (Next 6 Months)
  const next6Months = Array.from({ length: 6 }).map((_, i) => {
    const monthDate = addMonths(startOfMonth(new Date()), i);
    const monthLabel = format(monthDate, 'MM月');
    const startOfThisMonth = monthDate;
    const endOfThisMonth = addMonths(monthDate, 1);
    
    return {
      month: monthLabel,
      expiryCount: events.filter(e => {
        const d = e.expiryDate;
        return (isAfter(d, startOfThisMonth) || d.getTime() === startOfThisMonth.getTime()) && isBefore(d, endOfThisMonth);
      }).length
    };
  });

  const COLORS = ['#0984E3', '#00B894', '#E17055', '#6C5CE7', '#FDCB6E', '#FF4D4D'];

  const totalPersonnel = new Set(events.map(e => e.name)).size;
  const expiredCount = events.filter(e => !isFuture(e.expiryDate)).length;
  const warningCount = events.filter(e => differenceInDays(e.expiryDate, new Date()) <= 30 && isFuture(e.expiryDate)).length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-4xl font-serif font-bold text-shine-dark tracking-tight">工地數據 <span className="text-vivid-blue">合規看板</span></h1>
        <p className="text-gray-500 mt-2 font-medium italic">即時監控證照效期，確保工程各階段安全無虞</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard 
          icon={<Users className="text-vivid-blue" size={24} />} 
          label="總管理持證人員" 
          value={totalPersonnel.toString()} 
          subValue="跨工地專案統計"
          color="bg-vivid-blue/5 border-vivid-blue/10"
          valueColor="text-vivid-blue"
        />
        <StatCard 
          icon={<ClipboardList className="text-vivid-orange" size={24} />} 
          label="待補訓任務" 
          value={warningCount.toString()} 
          subValue="一個月內到期"
          color="bg-vivid-orange/5 border-vivid-orange/10"
          valueColor="text-vivid-orange"
        />
        <StatCard 
          icon={<Timer className="text-vivid-purple" size={24} />} 
          label="已過期證照" 
          value={expiredCount.toString()} 
          subValue="處於失效狀態"
          color="bg-vivid-purple/5 border-vivid-purple/10"
          valueColor="text-vivid-purple"
        />
        <StatCard 
          icon={<CheckCircle2 className="text-vivid-green" size={24} />} 
          label="整體合規率" 
          value={events.length === 0 ? "0%" : Math.round(((events.length - expiredCount) / events.length) * 100) + "%"} 
          subValue="品質管理指標"
          color="bg-vivid-green/5 border-vivid-green/10"
          valueColor="text-vivid-green"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl">
          <div className="flex items-center gap-3 mb-8">
            <MapPin className="text-vivid-blue" size={20} />
            <h2 className="text-xl font-serif font-black text-shine-dark">各工地證照分佈比較</h2>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={projectStats} margin={{ top: 20, right: 30, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EFE9E1" opacity={0.5} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#4A3B31', fontSize: 13, fontWeight: 900 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#A39382', fontSize: 11 }} />
                <Tooltip 
                  cursor={{ fill: '#F7EFE0', opacity: 0.5 }}
                  contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #F0F2F5', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Legend iconType="circle" />
                <Bar dataKey="count" name="持證總數" fill="#54A0FF" radius={[6, 6, 0, 0]} barSize={40} />
                <Bar dataKey="expiring" name="告警任務" fill="#FF7F50" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-vivid-orange p-8 rounded-[2.5rem] shadow-2xl text-white">
          <div className="flex items-center gap-3 mb-8">
            <TrendingUp className="text-white opacity-90" size={22} />
            <h2 className="text-xl font-serif font-black">未來 6 個月到期預測</h2>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={next6Months}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FFFFFF" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#FFFFFF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#FFFFFF', fontSize: 12, opacity: 0.7 }} />
                <Area type="monotone" dataKey="expiryCount" name="預計到期" stroke="#FFFFFF" strokeWidth={4} fillOpacity={1} fill="url(#colorCount)" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#FFFFFF', border: 'none', borderRadius: '12px', color: '#1A1A1A' }}
                  itemStyle={{ color: '#E50012' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-8 text-sm text-white/70 leading-relaxed font-light">
            * 系統數據庫分析：預計未來六個月內將有部分證照面臨效期審查。
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl">
          <div className="flex items-center gap-3 mb-8">
            <Shield className="text-vivid-green" size={20} />
            <h2 className="text-xl font-serif font-black text-shine-dark">證照類別佔比</h2>
          </div>
          <div className="flex flex-col md:flex-row items-center">
            <div className="h-[280px] w-full md:w-1/2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryStats}
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {categoryStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full md:w-1/2 space-y-3 px-4">
              {categoryStats.map((item, i) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-sm font-black text-shine-dark">{item.name}</span>
                  </div>
                  <span className="text-sm font-black text-gray-400">
                    {Math.round((item.value / events.length) * 100)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden min-h-[400px]">
          <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-shine-light/30">
              <div className="flex items-center gap-3">
                <ClipboardList className="text-vivid-purple" size={20} />
                <h2 className="text-xl font-serif font-black text-shine-dark">工地合規狀態</h2>
              </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-shine-light/20">
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-left">工地名稱</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">持證數</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">風險數</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">健康狀態</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {PROJECTS.filter(p => p !== '全部').map(project => {
                  const projectEvents = events.filter(e => e.project === project);
                  const warningCount = projectEvents.filter(e => differenceInDays(e.expiryDate, new Date()) <= 30).length;
                  const score = projectEvents.length === 0 ? 100 : Math.round(((projectEvents.length - warningCount) / projectEvents.length) * 100);

                  return (
                    <tr key={project} className="hover:bg-shine-light/10 transition-colors">
                      <td className="px-6 py-5 text-left text-shine-dark font-serif font-black">{project}</td>
                      <td className="px-6 py-5 text-center text-shine-dark font-mono font-bold">{projectEvents.length}</td>
                      <td className="px-6 py-5 text-center text-vivid-orange font-mono font-black">{warningCount}</td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-2 text-xs font-black">
                           <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div 
                                className={cn("h-full rounded-full transition-all duration-1000", score < 80 ? "bg-vivid-orange" : "bg-vivid-green")} 
                                style={{ width: `${score}%` }} 
                              />
                           </div>
                           <span className={score < 80 ? "text-vivid-orange" : "text-vivid-green"}>{score}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, subValue, color, valueColor }: { icon: React.ReactNode, label: string, value: string, subValue: string, color: string, valueColor?: string }) => (
  <div className={cn("p-8 rounded-[2rem] border border-gray-100 shadow-xl flex flex-col gap-5 transition-all hover:-translate-y-1 hover:shadow-2xl bg-white", color)}>
    <div className="flex items-center gap-3">
        <div className="p-3 bg-white rounded-2xl shadow-md border border-gray-100 group-hover:scale-110 transition-transform">{icon}</div>
        <span className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">{label}</span>
    </div>
    <div>
      <p className={cn("text-6xl font-serif font-black tracking-tighter", valueColor || "text-shine-dark")}>{value}</p>
      <p className="text-xs font-black text-gray-400 mt-2 flex items-center gap-1.5">
        {subValue}
      </p>
    </div>
  </div>
);
