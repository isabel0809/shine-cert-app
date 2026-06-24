import React, { useState, useRef } from 'react';
import { LicenseEvent, Project, LicenseCategory } from '../types';
import { PROJECTS, CATEGORIES } from '../constants';
import { cn } from '../utils/cn';
import { Search, Filter, FileUp, MoreVertical, ShieldCheck, Calendar as CalendarIcon, Trash2, Edit2, X, StickyNote, Paperclip } from 'lucide-react';
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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;

    if ('id' in editingEvent) {
      onUpdate(editingEvent as LicenseEvent);
    } else {
      onAdd(editingEvent as Omit<LicenseEvent, 'id'>);
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

      {/* Filters Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-wood-secondary group-focus-within:text-wood-primary transition-colors" size={18} />
          <input 
            type="text"
            placeholder="搜尋姓名或證照名稱..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-vivid-blue/20 hover:border-vivid-blue transition-all"
          />
        </div>
        
        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-wood-secondary" size={18} />
          <select 
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value as Project | '全部')}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl outline-none appearance-none cursor-pointer hover:border-vivid-blue transition-all text-shine-dark font-bold"
          >
            {PROJECTS.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Personnel Content */}
      <div className="space-y-12">
        {/* 閒置人員專區 (列出一排) */}
        {selectedProject === '全部' && (
          <div className="bg-gradient-to-r from-amber-50/60 to-orange-50/60 border border-amber-200/40 p-6 rounded-3xl shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-vivid-orange rounded-full animate-pulse" />
                <h2 className="text-xl font-serif font-black text-shine-dark">當前閒置人員</h2>
                <span className="text-xs font-black px-3 py-1 bg-vivid-orange/10 text-vivid-orange border border-vivid-orange/20 rounded-full">
                  {filteredData.filter(e => e.project === '閒置人員').length} 位待命派遣
                </span>
              </div>
              <p className="text-xs font-bold text-gray-400">💡 暫無固定派駐工地，可自由調度支援新項目</p>
            </div>

            {filteredData.filter(e => e.project === '閒置人員').length === 0 ? (
              <div className="bg-white/40 p-10 rounded-2xl border border-dashed border-gray-200 text-center">
                <p className="text-sm font-bold text-gray-400 italic">目前無相符的閒置待命人員</p>
              </div>
            ) : (
              <div className="flex gap-6 overflow-x-auto pb-4 snap-x">
                {filteredData.filter(e => e.project === '閒置人員').map(person => (
                  <div 
                    key={person.id}
                    className="min-w-[300px] max-w-[320px] bg-white rounded-2xl border border-gray-100 p-5 shadow-sm snap-start flex-shrink-0 hover:shadow-lg transition-all group relative"
                  >
                    <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        type="button" 
                        onClick={() => setEditingEvent(person)} 
                        className="p-1.5 text-gray-400 hover:text-vivid-blue bg-gray-50 rounded-lg shadow-sm"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button 
                        type="button" 
                        onClick={() => onDelete(person.id)} 
                        className="p-1.5 text-red-400 hover:text-red-600 bg-red-100/50 rounded-lg shadow-sm"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>

                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-orange-50 text-vivid-orange flex items-center justify-center font-serif font-black text-lg border border-orange-100">
                        {person.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-sm text-shine-dark">{person.name}</h3>
                        <span className={cn(
                          "mt-1 inline-block text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider",
                          person.category === '工安職安衛' ? "bg-vivid-blue/10 text-vivid-blue" :
                          person.category === '作業主管' ? "bg-vivid-orange/10 text-vivid-orange" :
                          person.category === '機具操作' ? "bg-vivid-purple/10 text-vivid-purple" :
                          "bg-vivid-green/10 text-vivid-green"
                        )}>
                          {person.category}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4 text-xs font-bold">
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-vivid-blue/5 rounded-lg text-vivid-blue">
                          <ShieldCheck size={14} />
                        </div>
                        <span className="text-shine-dark truncate">{person.licenseName}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-vivid-orange/5 rounded-lg text-vivid-orange">
                          <CalendarIcon size={14} />
                        </div>
                        <div className="flex flex-col text-[10px]">
                          {person.issueDate && (
                            <span className="text-gray-400">發照：{format(person.issueDate, 'yyyy / MM / dd')}</span>
                          )}
                          <span className="text-shine-dark italic">到期：{format(person.expiryDate, 'yyyy / MM / dd')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-gray-50 flex justify-between items-center text-[10px]">
                      <span className="text-gray-400 select-all">#{person.id.substring(0, 8)}</span>
                      <button 
                        type="button" 
                        onClick={() => setEditingEvent(person)} 
                        className="text-vivid-blue font-black hover:underline cursor-pointer"
                      >
                        編輯詳情
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {projectsToList.map(project => {
          const eventsInProject = filteredData.filter(e => e.project === project);
          if (eventsInProject.length === 0 && selectedProject !== '全部') {
             return (
               <div key={project} className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                 <p className="text-gray-400 italic text-lg font-serif font-bold">此工地目前無相符的人員資料</p>
               </div>
             );
          }
          if (eventsInProject.length === 0) return null;

          return (
            <motion.section 
              key={project}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3 px-2">
                <div className={cn("h-4 w-1 rounded-full", project === '閒置人員' ? "bg-gray-400" : "bg-vivid-orange")} />
                <h2 className="text-xl font-serif font-black text-shine-dark">{project}</h2>
                <span className={cn(
                  "text-xs font-black px-3 py-1 rounded-full border text-mono",
                  project === '閒置人員' 
                    ? "bg-gray-100 text-gray-500 border-gray-200" 
                    : "bg-vivid-blue/10 text-vivid-blue border-vivid-blue/20"
                )}>
                  {eventsInProject.length} {project === '閒置人員' ? '位人員待命' : '份檔案'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                  {eventsInProject.map((person) => (
                    <PersonCard 
                      key={person.id} 
                      person={person} 
                      onEdit={() => setEditingEvent(person)}
                      onDelete={() => onDelete(person.id)}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </motion.section>
          );
        })}
      </div>

      {/* Edit/Add Modal */}
      <AnimatePresence>
        {editingEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-shine-dark/30"
              onClick={() => setEditingEvent(null)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-lg p-8 rounded-[2rem] shadow-2xl border border-gray-100"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-serif font-black text-shine-dark">
                  {'id' in editingEvent ? '修改證照資料' : '新增證照資料'}
                </h3>
                <button onClick={() => setEditingEvent(null)} className="p-2 text-gray-400 hover:bg-shine-light rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-1">
                    <label className="text-[10px] font-black text-wood-secondary uppercase tracking-widest pl-1 mb-1 block">持證人姓名</label>
                    <input 
                      type="text" 
                      required
                      value={editingEvent.name || ''}
                      onChange={e => setEditingEvent({ ...editingEvent, name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-wood-accent bg-white outline-none focus:ring-2 focus:ring-wood-secondary/20" 
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="text-[10px] font-black text-wood-secondary uppercase tracking-widest pl-1 mb-1 block">所屬工地</label>
                    <select 
                      value={editingEvent.project}
                      onChange={e => setEditingEvent({ ...editingEvent, project: e.target.value as Project })}
                      className="w-full px-4 py-2.5 rounded-xl border border-wood-accent bg-white outline-none focus:ring-2 focus:ring-wood-secondary/20"
                    >
                      {PROJECTS.filter(p => p !== '全部').map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-wood-secondary uppercase tracking-widest pl-1 mb-1 block">證照完整名稱</label>
                  <input 
                    type="text" 
                    required
                    value={editingEvent.licenseName || ''}
                    onChange={e => setEditingEvent({ ...editingEvent, licenseName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-wood-accent bg-white outline-none focus:ring-2 focus:ring-wood-secondary/20" 
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-wood-secondary uppercase tracking-widest pl-1 mb-1 block col-span-1">證照類別</label>
                    <select 
                      value={editingEvent.category}
                      onChange={e => setEditingEvent({ ...editingEvent, category: e.target.value as LicenseCategory })}
                      className="w-full px-3 py-2.5 rounded-xl border border-wood-accent bg-white outline-none focus:ring-2 focus:ring-wood-secondary/20 text-xs font-black"
                    >
                      {CATEGORIES.filter(c => c !== '全部').map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-wood-secondary uppercase tracking-widest pl-1 mb-1 block col-span-1">證照發放日期</label>
                    <input 
                      type="date" 
                      value={editingEvent.issueDate ? format(editingEvent.issueDate, 'yyyy-MM-dd') : ''}
                      onChange={e => setEditingEvent({ ...editingEvent, issueDate: e.target.value ? new Date(e.target.value) : undefined })}
                      className="w-full px-3 py-2.5 rounded-xl border border-wood-accent bg-white outline-none focus:ring-2 focus:ring-wood-secondary/20 text-xs font-black" 
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-wood-secondary uppercase tracking-widest pl-1 mb-1 block col-span-1">效期到期日</label>
                    <input 
                      type="date" 
                      required
                      value={editingEvent.expiryDate ? format(editingEvent.expiryDate, 'yyyy-MM-dd') : ''}
                      onChange={e => setEditingEvent({ ...editingEvent, expiryDate: new Date(e.target.value) })}
                      className="w-full px-3 py-2.5 rounded-xl border border-wood-accent bg-white outline-none focus:ring-2 focus:ring-wood-secondary/20 text-xs font-black" 
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-wood-secondary uppercase tracking-widest pl-1 mb-1 block">備註事項 (Notes)</label>
                  <textarea 
                    rows={3}
                    placeholder="例：正本已送工地主任簽核、需安排下月復訓..."
                    value={editingEvent.notes || ''}
                    onChange={e => setEditingEvent({ ...editingEvent, notes: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-wood-accent bg-white outline-none focus:ring-2 focus:ring-wood-secondary/20 resize-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-wood-secondary uppercase tracking-widest pl-1 mb-1 block">上傳證照附件 (PDF/Image)</label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-wood-accent/50 rounded-2xl p-6 flex flex-col items-center justify-center bg-wood-light/10 hover:bg-wood-light/30 transition-all cursor-pointer group"
                  >
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                    {editingEvent.attachmentName ? (
                      <div className="flex items-center gap-2 text-wood-primary font-medium">
                        <Paperclip size={18} className="text-wood-secondary" />
                        <span>{editingEvent.attachmentName}</span>
                      </div>
                    ) : (
                      <>
                        <FileUp size={24} className="text-wood-secondary group-hover:scale-110 transition-transform mb-2" />
                        <p className="text-xs text-wood-secondary font-bold">點擊選擇檔案上傳</p>
                      </>
                    )}
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    type="submit"
                    className="w-full py-4 bg-shine-red text-white rounded-2xl font-black text-lg hover:bg-shine-dark transition-all shadow-xl shadow-shine-red/20"
                  >
                    確認儲存更新
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const PersonCard = ({ person, onEdit, onDelete }: { person: LicenseEvent, onEdit: () => void, onDelete: () => void, key?: string }) => {
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="bg-white rounded-3xl border border-gray-100 p-6 hover:shadow-2xl transition-all group relative min-h-[300px] flex flex-col justify-between"
    >
      <div className="absolute top-2 right-2 p-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={onEdit} className="p-2 text-gray-400 hover:text-vivid-blue bg-gray-50 rounded-lg shadow-sm">
          <Edit2 size={14} />
        </button>
        <button onClick={onDelete} className="p-2 text-red-400 hover:text-red-600 bg-red-50 rounded-lg shadow-sm">
          <Trash2 size={14} />
        </button>
      </div>

      <div>
        <div className="flex items-start gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-shine-light flex items-center justify-center text-shine-red font-serif font-black text-xl shadow-inner border border-gray-100">
            {person.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-serif font-black text-xl text-shine-dark truncate">{person.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={cn(
                "text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider",
                person.category === '工安職安衛' ? "bg-vivid-blue/20 text-vivid-blue" :
                person.category === '作業主管' ? "bg-vivid-orange/20 text-vivid-orange" :
                person.category === '機具操作' ? "bg-vivid-purple/20 text-vivid-purple" :
                "bg-vivid-green/20 text-vivid-green"
              )}>
                {person.category}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2.5 mb-4">
          <div className="flex items-center gap-3 text-sm font-bold">
            <div className="p-1.5 bg-vivid-blue/5 rounded-lg text-vivid-blue">
              <ShieldCheck size={14} />
            </div>
            <span className="text-shine-dark truncate">{person.licenseName}</span>
          </div>
          <div className="flex items-center gap-3 text-sm font-bold">
            <div className="p-1.5 bg-vivid-orange/5 rounded-lg text-vivid-orange shrink-0">
              <CalendarIcon size={14} />
            </div>
            <div className="flex flex-col text-xs">
              {person.issueDate && (
                <span className="text-gray-400 font-bold">發照：{format(person.issueDate, 'yyyy / MM / dd')}</span>
              )}
              <span className="text-shine-dark italic">到期：{format(person.expiryDate, 'yyyy / MM / dd')}</span>
            </div>
          </div>
          
          {person.attachmentName && (
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl border border-gray-100 text-gray-500 hover:bg-white hover:border-vivid-blue transition-all cursor-pointer">
              <Paperclip size={12} className="shrink-0" />
              <span className="text-[10px] font-black truncate max-w-[150px]">{person.attachmentName}</span>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <div className="p-4 bg-shine-light/30 rounded-2xl border border-gray-100 min-h-[4.5rem] group-hover:bg-white transition-all">
          <div className="flex items-center gap-1.5 mb-1.5">
            <StickyNote size={12} className="text-vivid-orange" />
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">備註</span>
          </div>
          <p className="text-xs text-shine-dark/70 line-clamp-2 leading-relaxed font-medium">
            {person.notes || '尚無備註'}
          </p>
        </div>

        <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
          <span className="text-[10px] font-bold text-gray-300 italic">ID #{person.id.substr(0,8)}</span>
          <button onClick={onEdit} className="text-[10px] font-black text-vivid-blue hover:text-shine-red underline underline-offset-2 transition-colors">詳情與修改</button>
        </div>
      </div>
    </motion.div>
  );
};
