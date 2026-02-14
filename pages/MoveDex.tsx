import React, { useState, useEffect, useRef } from 'react';
import { Search, Sword, Zap, Activity, Loader2, Target, Crosshair } from 'lucide-react';
import { fetchMovesByDamageClass, fetchMoveDetails } from '../services/pokeapi';
import { MoveDetailed } from '../types';
import { TYPE_COLORS } from '../constants';

const MoveDex = () => {
  const [activeTab, setActiveTab] = useState<'physical' | 'special' | 'status'>('physical');
  const [moveList, setMoveList] = useState<{name: string, url: string}[]>([]);
  const [displayedMoves, setDisplayedMoves] = useState<MoveDetailed[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [search, setSearch] = useState('');
  
  // Pagination / Infinite Scroll
  const [page, setPage] = useState(1);
  const itemsPerPage = 20;
  const observerTarget = useRef<HTMLDivElement>(null);

  // Tab config
  const tabs = [
    { id: 'physical', label: 'Physical', icon: Sword, classId: 2, color: 'bg-red-500' },
    { id: 'special', label: 'Special', icon: Zap, classId: 3, color: 'bg-indigo-500' },
    { id: 'status', label: 'Status', icon: Activity, classId: 1, color: 'bg-slate-500' },
  ];

  // Fetch List when tab changes
  useEffect(() => {
    const fetchList = async () => {
      setLoadingList(true);
      setMoveList([]);
      setDisplayedMoves([]);
      setPage(1);

      try {
        const tab = tabs.find(t => t.id === activeTab)!;
        const list = await fetchMovesByDamageClass(tab.classId);
        // Sort alphabetically
        list.sort((a, b) => a.name.localeCompare(b.name));
        setMoveList(list);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingList(false);
      }
    };
    fetchList();
  }, [activeTab]);

  // Filter list
  const filteredList = moveList.filter(m => m.name.toLowerCase().includes(search.toLowerCase()));

  // Fetch Details for current page
  useEffect(() => {
    const fetchDetails = async () => {
      if (filteredList.length === 0) return;
      
      setLoadingDetails(true);
      const start = (page - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      const slice = filteredList.slice(start, end);

      try {
        const detailsPromises = slice.map(m => fetchMoveDetails(m.name));
        const newDetails = await Promise.all(detailsPromises);
        setDisplayedMoves(prev => page === 1 ? newDetails : [...prev, ...newDetails]);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingDetails(false);
      }
    };

    // Debounce slightly or just run
    const timer = setTimeout(fetchDetails, 100);
    return () => clearTimeout(timer);

  }, [page, moveList, search]); // Re-run when list loaded, search changes, or page increments

  // Reset page on search change
  useEffect(() => {
    setPage(1);
    setDisplayedMoves([]);
  }, [search]);

  // Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !loadingDetails && !loadingList) {
           // check if we have more
           if (displayedMoves.length < filteredList.length) {
              setPage(prev => prev + 1);
           }
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [displayedMoves.length, filteredList.length, loadingDetails, loadingList]);

  return (
    <div className="p-6 h-full flex flex-col max-w-6xl mx-auto">
      <header className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Sword className="text-red-500" /> Move Dex
          </h1>
          <p className="text-slate-500 mt-1">Comprehensive battle data database.</p>
        </div>

        <div className="relative w-full md:w-64">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
           <input 
             type="text" 
             value={search}
             onChange={e => setSearch(e.target.value)}
             placeholder="Search moves..."
             className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
           />
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
         {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
               <button
                 key={tab.id}
                 onClick={() => setActiveTab(tab.id as any)}
                 className={`
                    flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap
                    ${isActive ? `${tab.color} text-white shadow-lg shadow-${tab.color.replace('bg-', '')}/30` : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'}
                 `}
               >
                  <tab.icon size={18} /> {tab.label}
               </button>
            )
         })}
      </div>

      {/* List */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
         <div className="overflow-y-auto p-4 custom-scrollbar flex-1 space-y-3">
            {loadingList && (
               <div className="flex items-center justify-center h-40 text-slate-500 gap-2">
                  <Loader2 className="animate-spin" /> Loading Move List...
               </div>
            )}

            {!loadingList && displayedMoves.map((move) => (
               <div key={move.id} className="p-4 rounded-xl border border-slate-100 hover:border-slate-300 hover:shadow-md transition-all bg-slate-50/50">
                  <div className="flex items-start justify-between mb-2">
                     <div className="flex items-center gap-3">
                        <span 
                           className="px-2 py-1 rounded text-[10px] uppercase font-bold text-white tracking-wider"
                           style={{ backgroundColor: TYPE_COLORS[move.type] || '#777' }}
                        >
                           {move.type}
                        </span>
                        <h3 className="font-bold text-slate-800 text-lg capitalize">{move.name.replace('-', ' ')}</h3>
                     </div>
                     <span className="text-xs font-mono text-slate-400">#{move.id}</span>
                  </div>
                  
                  <p className="text-slate-600 text-sm mb-4 leading-relaxed">
                     {move.flavorText}
                  </p>

                  <div className="flex gap-6 text-sm">
                     <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1">
                           <Sword size={12} /> Power
                        </span>
                        <span className="font-bold text-slate-700 text-lg">{move.power || '-'}</span>
                     </div>
                     <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1">
                           <Crosshair size={12} /> Acc
                        </span>
                        <span className="font-bold text-slate-700 text-lg">{move.accuracy ? `${move.accuracy}%` : '-'}</span>
                     </div>
                     <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1">
                           <Target size={12} /> PP
                        </span>
                        <span className="font-bold text-slate-700 text-lg">{move.pp}</span>
                     </div>
                  </div>
               </div>
            ))}

            {/* Sentinel */}
            <div ref={observerTarget} className="h-10 flex items-center justify-center">
               {loadingDetails && <Loader2 className="animate-spin text-slate-400" />}
            </div>
         </div>
      </div>
    </div>
  );
};

export default MoveDex;
