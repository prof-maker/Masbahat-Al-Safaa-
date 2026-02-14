
import React from 'react';
import { Zekr } from '../types';
import { Icons } from '../constants';

interface ZekrCardProps {
  zekr: Zekr;
  onClick: (zekr: Zekr) => void;
  onEdit: (zekr: Zekr) => void;
  onDelete: (zekr: Zekr) => void;
}

export const ZekrCard: React.FC<ZekrCardProps> = ({ zekr, onClick, onEdit, onDelete }) => {
  return (
    <div 
      className="group bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl p-5 mb-4 shadow-sm hover:shadow-md transition-all flex items-center justify-between cursor-pointer"
      onClick={() => onClick(zekr)}
    >
      <div className="flex-grow">
        <span className="block text-lg font-bold text-slate-800 dark:text-white mb-1 group-hover:text-amber-600 transition-colors">
          {zekr.name}
        </span>
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
          <span>الإنجاز الكلي: <b className="text-amber-600 font-bold">{zekr.lifetime}</b></span>
          <span className="opacity-50">|</span>
          <span>
            {zekr.isFixed 
              ? (zekr.target > 0 ? `هدف: ${zekr.target}` : 'دخول مباشر') 
              : 'تحديد يدوي'}
          </span>
        </div>
      </div>
      
      <div className="flex items-center gap-3 mr-4">
        <span className="text-2xl font-black text-amber-500 font-amiri min-w-[3rem] text-center">
          {zekr.currentCount}
        </span>
        <div className="flex flex-col gap-2">
          <button 
            className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors"
            onClick={(e) => { e.stopPropagation(); onEdit(zekr); }}
          >
            <Icons.Edit />
          </button>
          <button 
            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-colors"
            onClick={(e) => { e.stopPropagation(); onDelete(zekr); }}
          >
            <Icons.Delete />
          </button>
        </div>
      </div>
    </div>
  );
};
