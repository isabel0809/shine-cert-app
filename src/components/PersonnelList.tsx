/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { LicenseEvent, Project, LicenseCategory } from '../types';
import { PROJECTS, CATEGORIES } from '../constants';
import { cn } from '../utils/cn';
import { Search, Filter, FileUp, ShieldCheck, Calendar as CalendarIcon, Trash2, Edit2, X, StickyNote, Paperclip } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';

interface PersonnelListProps {
  events: LicenseEvent[];
  onAdd: (event: Omit<LicenseEvent, 'id'>) => void;
  onUpdate: (event: LicenseEvent) => void;
  onDelete: (id: string) => void;
}

export const PersonnelList: React.FC<PersonnelListProps> = ({ events, onAdd, onUpdate, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState<Project | '全部'>('全部');
  const [editingEvent, setEditingEvent] = useState<LicenseEvent | Partial<LicenseEvent> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredData = events.filter(event => {
    const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          event.licenseName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProject = selectedProject === '全部' || event.project === selectedProject;
    return matchesSearch && matchesProject;
  });

  const projectsToList = selectedProject === '全部' 
    ? PROJECTS.filter(p => p !== '全部' && p !== '閒置人員') as Project[] 
    : [selectedProject as Project];

  // 【修正重點】這裡確保新增與編輯的邏輯正確觸發
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;

    if ('id' in editingEvent && editingEvent.id) {
      onUpdate(editingEvent as LicenseEvent);
    } else {
      // 確保傳給後端的資料格式正確
      onAdd({
        name: editingEvent.name || '',
        licenseName: editingEvent.licenseName || '',
        issueDate: editingEvent.issueDate || new Date(),
        expiryDate: editingEvent.expiryDate || new Date(),
        project: editingEvent.project || PROJECTS[1] as Project,
        category: editingEvent.category || CATEGORIES[1] as LicenseCategory,
        notes: editingEvent.notes || '',
        attachmentName: editingEvent.attachmentName || ''
      });
    }
    setEditingEvent(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editingEvent) {
      setEditingEvent({ ...editingEvent, attachmentName: file.name });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-black text-shine-dark">人員證照清冊</h1>
          <p className="text-gray-500 mt-1 font-bold">管理各專案工地之人員資格、檔案與備註</p>
        </div>
        <button 
          onClick={() => setEditingEvent({ 
            name: '', 
            licenseName: '', 
            issueDate: new Date(),
            expiryDate: new Date(), 
            project: PROJECTS[1] as Project, 
            category: CATEGORIES[1] as LicenseCategory,
            notes: '' 
          })}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-vivid-blue text-white rounded-xl font-black shadow-lg shadow-vivid-blue/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <FileUp size={20} />
          錄入人員檔案
        </button>
      </div>

      {/* 搜尋與篩選 (略...) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
         {/* ... (維持原樣) ... */}
         <div className="relative group">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-wood-secondary" size={18} />
           <input type="text" placeholder="搜尋..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 border rounded-2xl" />
         </div>
      </div>

      {/* Personnel Content */}
      <div className="space-y-12">
        {/* ... (其他內容維持原樣) ... */}
        {projectsToList.map(project => {
          const eventsInProject = filteredData.filter(e => e.project === project);
          if (eventsInProject.length === 0) return null;

          return (
            <motion.section key={project} className="space-y-4">
              <h2 className="text-xl font-serif font-black">{project}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {eventsInProject.map((person) => (
                  <PersonCard 
                    key={person.id} 
                    person={person} 
                    onEdit={() => setEditingEvent(person)}
                    onDelete={() => onDelete(person.id)}
                  />
                ))}
              </div>
            </motion.section>
          );
        })}
      </div>

      {/* Edit/Add Modal */}
      <AnimatePresence>
        {editingEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-shine-dark/30" onClick={() => setEditingEvent(null)} />
            <motion.div className="relative bg-white w-full max-w-lg p-8 rounded-[2rem] shadow-2xl">
              <form onSubmit={handleSave} className="space-y-6">
                {/* 表單欄位 (確保每個欄位都有 value 與 onChange) */}
                <div>
                  <label className="text-[10px] font-black uppercase">持證人姓名</label>
                  <input 
                    type="text" 
                    required
                    value={editingEvent.name || ''}
                    onChange={e => setEditingEvent({ ...editingEvent, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border" 
                  />
                </div>
                {/* ...其他欄位... */}
                <button type="submit" className="w-full py-4 bg-shine-red text-white rounded-2xl font-black">
                  確認儲存
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};