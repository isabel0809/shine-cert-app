import React from 'react';
import { PROJECTS, CATEGORIES } from '../constants';
import { FilterState, Project, LicenseCategory } from '../types';
import { cn } from '../utils/cn';
import { Filter } from 'lucide-react';

interface FilterBarProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
}

export const FilterBar: React.FC<FilterBarProps> = ({ filters, setFilters }) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 p-6 bg-white rounded-3xl border border-gray-100 shadow-xl">
      <div className="flex items-center gap-2 text-shine-dark mb-2 md:mb-0">
        <Filter size={18} className="text-vivid-blue" />
        <span className="font-serif font-black text-xl">專案篩選</span>
      </div>
      
      <div className="flex flex-wrap gap-6 items-center flex-1">
        <div className="flex flex-col gap-1 min-w-[200px]">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">目標工地</label>
          <select 
            value={filters.project}
            onChange={(e) => setFilters(prev => ({ ...prev, project: e.target.value as Project | '全部' }))}
            className="bg-shine-light border border-gray-100 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-vivid-blue/20 transition-all cursor-pointer text-shine-dark font-bold hover:border-vivid-blue hover:bg-white"
          >
            {PROJECTS.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1 min-w-[200px]">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">證照分類</label>
          <select 
            value={filters.category}
            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value as LicenseCategory | '全部' }))}
            className="bg-shine-light border border-gray-100 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-vivid-blue/20 transition-all cursor-pointer text-shine-dark font-bold hover:border-vivid-blue hover:bg-white"
          >
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>
      
      <button 
        onClick={() => setFilters({ project: '全部', category: '全部' })}
        className="text-xs font-black text-vivid-blue hover:text-shine-red transition-colors self-end md:self-center px-4"
      >
        清除所有選領
      </button>
    </div>
  );
};
