
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Zekr, Screen } from './types';
import { Icons, COLORS } from './constants';
import { ZekrCard } from './components/ZekrCard';
import { Modal } from './components/Modal';

const DEFAULT_AZKAR: Zekr[] = [
  { id: '1', name: "أستغفر الله", currentCount: 0, lifetime: 0, target: 100, isFixed: false },
  { id: '2', name: "سبحان الله وبحمده", currentCount: 0, lifetime: 0, target: 33, isFixed: true },
  { id: '3', name: "اللهم صلِ على محمد", currentCount: 0, lifetime: 0, target: 0, isFixed: false },
];

const App: React.FC = () => {
  // State
  const [azkar, setAzkar] = useState<Zekr[]>(() => {
    const saved = localStorage.getItem('safaa_react_v1');
    return saved ? JSON.parse(saved) : DEFAULT_AZKAR;
  });
  const [screen, setScreen] = useState<Screen>('HOME');
  const [activeZekrId, setActiveZekrId] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
           (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  // Modal States
  const [editModal, setEditModal] = useState<{ isOpen: boolean; zekr: Zekr | null }>({ isOpen: false, zekr: null });
  const [targetModal, setTargetModal] = useState<{ isOpen: boolean; zekr: Zekr | null }>({ isOpen: false, zekr: null });
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; zekr: Zekr | null }>({ isOpen: false, zekr: null });
  const [successModal, setSuccessModal] = useState<{ isOpen: boolean; msg: string }>({ isOpen: false, msg: '' });

  // Persistence
  useEffect(() => {
    localStorage.setItem('safaa_react_v1', JSON.stringify(azkar));
  }, [azkar]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Derived State
  const activeZekr = useMemo(() => azkar.find(z => z.id === activeZekrId), [azkar, activeZekrId]);

  // Actions
  const handleZekrClick = (zekr: Zekr) => {
    if (zekr.isFixed) {
      setActiveZekrId(zekr.id);
      setScreen('COUNTER');
    } else {
      setTargetModal({ isOpen: true, zekr });
    }
  };

  const startWithTarget = (target: number, isFixed: boolean) => {
    if (!targetModal.zekr) return;
    const updated = azkar.map(z => z.id === targetModal.zekr?.id ? { ...z, target, isFixed } : z);
    setAzkar(updated);
    setActiveZekrId(targetModal.zekr.id);
    setTargetModal({ isOpen: false, zekr: null });
    setScreen('COUNTER');
  };

  const hit = useCallback(() => {
    if (!activeZekrId) return;
    
    setAzkar(prev => prev.map(z => {
      if (z.id === activeZekrId) {
        if (z.target > 0 && z.currentCount >= z.target) return z;
        const newCount = z.currentCount + 1;
        const newLifetime = z.lifetime + 1;
        
        if (navigator.vibrate) navigator.vibrate(40);

        if (z.target > 0 && newCount === z.target) {
          setSuccessModal({ isOpen: true, msg: `أتممت ورد "${z.name}" بنجاح (${z.target})` });
        }
        
        return { ...z, currentCount: newCount, lifetime: newLifetime };
      }
      return z;
    }));
  }, [activeZekrId]);

  const resetCounter = () => {
    if (!activeZekrId) return;
    setAzkar(prev => prev.map(z => z.id === activeZekrId ? { ...z, currentCount: 0 } : z));
  };

  const saveZekr = (data: Partial<Zekr>) => {
    if (editModal.zekr) {
      // Edit
      setAzkar(prev => prev.map(z => z.id === editModal.zekr?.id ? { ...z, ...data } : z));
    } else {
      // Add
      const newZekr: Zekr = {
        id: Date.now().toString(),
        name: data.name || 'ذكر جديد',
        currentCount: 0,
        lifetime: 0,
        target: data.target || 0,
        isFixed: data.isFixed || false,
      };
      setAzkar(prev => [...prev, newZekr]);
    }
    setEditModal({ isOpen: false, zekr: null });
  };

  const deleteZekr = () => {
    if (!deleteModal.zekr) return;
    setAzkar(prev => prev.filter(z => z.id !== deleteModal.zekr?.id));
    setDeleteModal({ isOpen: false, zekr: null });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-0 md:p-6 bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-md h-[100dvh] md:h-[850px] bg-white dark:bg-slate-900 md:rounded-[3rem] shadow-2xl flex flex-col overflow-hidden relative border border-slate-100 dark:border-slate-800 transition-all">
        
        {/* Screen: HOME */}
        {screen === 'HOME' && (
          <>
            <div className="bg-slate-800 dark:bg-slate-950 p-8 pt-10 rounded-b-[2.5rem] shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
              <div className="flex justify-between items-center relative z-10">
                <div>
                  <h1 className="text-3xl font-black text-white mb-1 tracking-tight">مسبحة الصفاء</h1>
                  <p className="text-slate-400 text-sm font-medium">اجعل لسانك رطباً بذكر الله</p>
                </div>
                <button 
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition-all"
                >
                  {isDarkMode ? <Icons.Sun /> : <Icons.Moon />}
                </button>
              </div>
            </div>

            <div className="flex-grow overflow-y-auto px-6 py-6 custom-scrollbar">
              {azkar.map(z => (
                <ZekrCard 
                  key={z.id}
                  zekr={z}
                  onClick={handleZekrClick}
                  onEdit={(zekr) => setEditModal({ isOpen: true, zekr })}
                  onDelete={(zekr) => setDeleteModal({ isOpen: true, zekr })}
                />
              ))}
              {azkar.length === 0 && (
                <div className="text-center py-20">
                  <p className="text-slate-400">لا توجد أذكار حالياً، ابدأ بإضافة ذكرك المفضل.</p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-100 dark:border-slate-800">
              <button 
                className="w-full bg-slate-800 dark:bg-amber-600 hover:bg-slate-700 dark:hover:bg-amber-500 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95"
                onClick={() => setEditModal({ isOpen: true, zekr: null })}
              >
                <Icons.Plus />
                إضافة ذكر جديد
              </button>
            </div>
          </>
        )}

        {/* Screen: COUNTER */}
        {screen === 'COUNTER' && activeZekr && (
          <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 animate-in slide-in-from-left duration-300">
            <div className="p-6 flex justify-between items-center">
              <button 
                onClick={() => setScreen('HOME')}
                className="flex items-center gap-2 text-slate-600 dark:text-slate-400 font-bold hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <Icons.Back />
                عودة
              </button>
              <button 
                onClick={resetCounter}
                className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all flex items-center gap-1 text-sm font-bold"
              >
                <Icons.Reset />
                تصفير
              </button>
            </div>

            <div className="flex-grow flex flex-col items-center justify-center p-6 text-center">
              <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-12 max-w-xs leading-relaxed font-amiri">
                {activeZekr.name}
              </h2>

              <div 
                className="w-72 h-72 rounded-full bg-white dark:bg-slate-800 border-[12px] border-slate-200 dark:border-slate-700 shadow-2xl flex items-center justify-center cursor-pointer select-none active:scale-95 active:border-amber-500 dark:active:border-amber-500 transition-all"
                onClick={hit}
              >
                <span className="text-7xl font-black text-slate-800 dark:text-white font-amiri">
                  {activeZekr.currentCount}
                </span>
              </div>

              <div className="mt-16 w-full max-w-xs bg-white dark:bg-slate-800 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-700">
                {activeZekr.target > 0 ? (
                  <>
                    <p className="text-slate-500 dark:text-slate-400 font-bold text-sm mb-1">الهدف: {activeZekr.target}</p>
                    <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden mb-3">
                      <div 
                        className="bg-amber-500 h-full transition-all duration-300" 
                        style={{ width: `${Math.min(100, (activeZekr.currentCount / activeZekr.target) * 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-rose-500 font-black">المتبقي: {Math.max(0, activeZekr.target - activeZekr.currentCount)}</p>
                  </>
                ) : (
                  <p className="text-slate-400 font-medium">بدون هدف محدد</p>
                )}
              </div>
            </div>
            
            <div className="p-8 text-center text-slate-400 text-xs font-medium">
              اضغط على الدائرة للمتابعة
            </div>
          </div>
        )}

        {/* Modals */}
        
        {/* Modal: Target Setup */}
        <Modal 
          isOpen={targetModal.isOpen} 
          onClose={() => setTargetModal({ isOpen: false, zekr: null })}
          title="تحديد الهدف"
        >
          <div className="space-y-4">
            <p className="text-slate-500 text-sm text-center mb-4">اترك الحقل فارغاً للبدء بدون هدف محدد.</p>
            <input 
              id="targetInput"
              type="number" 
              placeholder="أدخل الرقم هنا..." 
              className="w-full p-4 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl text-center text-xl font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <label className="flex items-center gap-3 cursor-pointer select-none py-2 px-1">
              <input 
                id="saveAlwaysCheckbox"
                type="checkbox" 
                className="w-5 h-5 rounded border-slate-300 text-amber-600 focus:ring-amber-500" 
              />
              <span className="text-slate-600 dark:text-slate-300 text-sm font-medium">تثبيت هذا الخيار دائماً لهذه الذكر</span>
            </label>
            <button 
              className="w-full bg-slate-800 dark:bg-amber-600 text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-slate-700 transition-all mt-4"
              onClick={() => {
                const target = parseInt((document.getElementById('targetInput') as HTMLInputElement).value) || 0;
                const isFixed = (document.getElementById('saveAlwaysCheckbox') as HTMLInputElement).checked;
                startWithTarget(target, isFixed);
              }}
            >
              البدء الآن
            </button>
            <button 
              className="w-full py-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-medium transition-colors"
              onClick={() => setTargetModal({ isOpen: false, zekr: null })}
            >
              إلغاء
            </button>
          </div>
        </Modal>

        {/* Modal: Add/Edit Zekr */}
        <Modal 
          isOpen={editModal.isOpen} 
          onClose={() => setEditModal({ isOpen: false, zekr: null })}
          title={editModal.zekr ? 'تعديل الذكر' : 'إضافة ذكر جديد'}
        >
          <div className="space-y-5">
            <div>
              <label className="block text-slate-400 text-xs font-bold mb-2 mr-1 uppercase tracking-wider">اسم الذكر</label>
              <input 
                id="nameInput"
                type="text" 
                defaultValue={editModal.zekr?.name || ''}
                placeholder="مثلاً: سبحان الله..." 
                className="w-full p-4 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 text-xs font-bold mb-2 mr-1 uppercase tracking-wider">الهدف الافتراضي</label>
              <input 
                id="editTargetInput"
                type="number" 
                defaultValue={editModal.zekr?.target || ''}
                placeholder="0 للبدء بدون هدف..." 
                className="w-full p-4 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <label className="flex items-center gap-3 cursor-pointer select-none py-2">
              <input 
                id="editIsFixedCheckbox"
                type="checkbox" 
                defaultChecked={editModal.zekr?.isFixed || false}
                className="w-5 h-5 rounded border-slate-300 text-amber-600 focus:ring-amber-500" 
              />
              <span className="text-slate-600 dark:text-slate-300 text-sm font-medium">تثبيت الهدف (دخول سريع للعداد)</span>
            </label>
            <button 
              className="w-full bg-slate-800 dark:bg-amber-600 text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-slate-700 transition-all mt-2"
              onClick={() => {
                const name = (document.getElementById('nameInput') as HTMLInputElement).value.trim();
                const target = parseInt((document.getElementById('editTargetInput') as HTMLInputElement).value) || 0;
                const isFixed = (document.getElementById('editIsFixedCheckbox') as HTMLInputElement).checked;
                if (name) saveZekr({ name, target, isFixed });
              }}
            >
              حفظ التغييرات
            </button>
            <button 
              className="w-full py-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-medium transition-colors"
              onClick={() => setEditModal({ isOpen: false, zekr: null })}
            >
              إلغاء
            </button>
          </div>
        </Modal>

        {/* Modal: Delete Confirmation */}
        <Modal 
          isOpen={deleteModal.isOpen} 
          onClose={() => setDeleteModal({ isOpen: false, zekr: null })}
          title="تأكيد الحذف"
        >
          <div className="text-center py-4">
            <p className="text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
              هل أنت متأكد من رغبتك في حذف <b className="text-slate-900 dark:text-white">"{deleteModal.zekr?.name}"</b>؟<br/>
              سيتم مسح جميع الإحصائيات الخاصة به.
            </p>
            <div className="flex gap-4">
              <button 
                className="flex-1 bg-rose-600 hover:bg-rose-500 text-white py-4 rounded-2xl font-bold transition-all shadow-md active:scale-95"
                onClick={deleteZekr}
              >
                نعم، احذف
              </button>
              <button 
                className="flex-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 py-4 rounded-2xl font-bold transition-all hover:bg-slate-200 dark:hover:bg-slate-600"
                onClick={() => setDeleteModal({ isOpen: false, zekr: null })}
              >
                تراجع
              </button>
            </div>
          </div>
        </Modal>

        {/* Modal: Success Feedback */}
        <Modal 
          isOpen={successModal.isOpen} 
          onClose={() => setSuccessModal({ isOpen: false, msg: '' })}
          title="ما شاء الله!"
        >
          <div className="text-center py-6">
            <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/40 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
              ✨
            </div>
            <p className="text-xl font-bold text-slate-800 dark:text-white mb-8">{successModal.msg}</p>
            <button 
              className="w-full bg-slate-800 dark:bg-amber-600 text-white py-4 rounded-2xl font-bold shadow-lg transition-all"
              onClick={() => setSuccessModal({ isOpen: false, msg: '' })}
            >
              متابعة
            </button>
          </div>
        </Modal>

      </div>
    </div>
  );
};

export default App;
