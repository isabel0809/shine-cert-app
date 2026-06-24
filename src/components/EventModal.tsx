import React from 'react';
import { LicenseEvent } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, User, Briefcase, Award, History, AlertCircle } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { cn } from '../utils/cn';

interface EventModalProps {
  event: LicenseEvent | null;
  onClose: () => void;
}

export const EventModal: React.FC<EventModalProps> = ({ event, onClose }) => {
  if (!event) return null;

  const daysToExpiry = differenceInDays(event.expiryDate, new Date());
  const isWarning = daysToExpiry <= 30;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-shine-dark/30"
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-gray-100"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-white">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={cn(
                  "px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider",
                  isWarning ? "bg-vivid-orange/20 text-vivid-orange" : "bg-vivid-green/20 text-vivid-green"
                )}>
                  {event.category}
                </span>
                {isWarning && (
                  <span className="flex items-center gap-1 text-[10px] font-black text-vivid-orange">
                    <AlertCircle size={12} />
                    效期預警
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-serif font-black text-shine-dark">{event.licenseName}</h2>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-shine-light rounded-full transition-colors text-gray-400"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-8 space-y-6 bg-white">
            <div className="grid grid-cols-2 gap-6">
              <DetailItem icon={<User className="text-vivid-blue" size={18} />} label="持證人" value={event.name} />
              <DetailItem icon={<Award className="text-vivid-green" size={18} />} label="證照類別" value={event.category} />
              
              <DetailItem 
                icon={<Calendar className="text-vivid-yellow" size={18} />} 
                label="發照日期" 
                value={event.issueDate ? format(event.issueDate, 'yyyy / MM / dd') : '尚無紀錄'} 
                valueClassName="font-black text-shine-dark"
              />
              <DetailItem 
                icon={<Calendar className="text-vivid-orange" size={18} />} 
                label="到期日期" 
                value={format(event.expiryDate, 'yyyy / MM / dd')} 
                valueClassName={isWarning ? "text-vivid-orange font-black" : "font-black text-shine-dark"}
              />

              <div className="col-span-2 pt-2 border-t border-gray-100/50">
                <DetailItem icon={<Briefcase className="text-vivid-purple" size={18} />} label="所屬專案/工地" value={event.project} />
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 space-y-4">
              <div className="flex items-start gap-3">
                <div className="mt-1 text-vivid-blue">
                  <History size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-1">上次回訓紀錄</h4>
                  <p className="text-sm text-shine-dark font-medium leading-relaxed">
                    {event.previousRecertification || '尚無紀錄'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1 text-vivid-purple">
                  <AlertCircle size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-1">管理備註</h4>
                  <p className="text-sm text-shine-dark leading-relaxed bg-shine-light/50 p-4 rounded-2xl italic border border-gray-100">
                    {event.notes || '無備註資訊'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 bg-gray-50 border-t border-gray-100 text-center">
            <button 
              onClick={onClose}
              className="w-full py-3 bg-vivid-blue text-white rounded-xl font-black hover:bg-shine-dark transition-all shadow-lg shadow-vivid-blue/20"
            >
              確定並關閉
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

const DetailItem = ({ icon, label, value, valueClassName }: { icon: React.ReactNode, label: string, value: string, valueClassName?: string }) => (
  <div className="flex gap-3">
    <div className="mt-0.5">{icon}</div>
    <div>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">{label}</p>
      <p className={cn("text-shine-dark font-black", valueClassName)}>{value}</p>
    </div>
  </div>
);
