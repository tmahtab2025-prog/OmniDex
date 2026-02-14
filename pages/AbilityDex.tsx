import React, { useState, useEffect, useRef } from 'react';
import { Search, Sparkles, Loader2, Users } from 'lucide-react';
import { fetchAbilitiesList, fetchAbilityDetails } from '../services/pokeapi';
import { AbilityDetailed } from '../types';

const AbilityDex = () => {
  const [abilityList, setAbilityList] = useState<{name: string, url: string}[]>([]);
  const [displayedAbilities, setDisplayedAbilities] = useState<AbilityDetailed[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [search, setSearch] = useState('');
  
  const [page, setPage] = useState(1);
  const itemsPerPage = 20;
  const observerTarget = useRef<HTMLDivElement>(null);

  // Initial List Fetch
  useEffect(() => {
    const fetchList = async () => {
      setLoadingList(true);
      try {
        const list = await fetchAbilitiesList(1000, 0); // Fetch all to allow client search
        list.sort((a, b) => a.name.localeCompare(b.name));
        setAbilityList(list);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingList(false);
      }
    };
    fetchList();
  }, []);

  const filteredList = abilityList.filter(a => a.name.toLowerCase().includes(search.toLowerCase()));

  // Fetch Details
  useEffect(() => {
    const fetchDetails = async () => {
      if (filteredList.length === 0) return;
      
      setLoadingDetails(true);
      const start = (page - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      const slice = filteredList.slice(start, end);

      try {
        const detailsPromises = slice.map(a => fetchAbilityDetails(a.name));
        const newDetails = await Promise.all(detailsPromises);
        setDisplayedAbilities(prev => page === 1 ? newDetails : [...prev, ...newDetails]);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingDetails(false);
      }
    };

    const timer = setTimeout(fetchDetails, 100);
    return () => clearTimeout(timer);
  }, [page, abilityList, search]);

  useEffect(() => {
    setPage(1);
    setDisplayedAbilities([]);
  }, [search]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !loadingDetails && !loadingList) {
           if (displayedAbilities.length < filteredList.length) {
              setPage(prev => prev + 1);
           }
        }
      }, { threshold: 0.1 }
    );
    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [displayedAbilities.length, filteredList.length, loadingDetails]);

  return (
    <div className="p-6 h-full flex flex-col max-w-5xl mx-auto">
      <header className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Sparkles className="text-amber-500" /> Ability Dex
          </h1>
          <p className="text-slate-500 mt-1">Catalog of special innate skills.</p>
        </div>

        <div className="relative w-full md:w-64">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
           <input 
             type="text" 
             value={search}
             onChange={e => setSearch(e.target.value)}
             placeholder="Search abilities..."
             className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
           />
        </div>
      </header>

      <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
         <div className="overflow-y-auto p-4 custom-scrollbar flex-1 space-y-4">
            {loadingList && (
               <div className="flex items-center justify-center h-40 text-slate-500 gap-2">
                  <Loader2 className="animate-spin" /> Loading Abilities...
               </div>
            )}

            {!loadingList && displayedAbilities.map((ability) => (
               <div key={ability.id} className="p-5 rounded-xl border border-slate-100 hover:border-amber-200 hover:bg-amber-50/30 transition-all bg-white shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                     <h3 className="font-bold text-slate-800 text-lg capitalize">{ability.name.replace('-', ' ')}</h3>
                     <span className="px-2 py-1 bg-slate-100 text-slate-500 rounded text-xs font-bold">#{ability.id}</span>
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed mb-3">
                     {ability.effect}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                     <Users size={14} /> Available to {ability.pokemonCount} Pokémon
                  </div>
               </div>
            ))}
            
            <div ref={observerTarget} className="h-10 flex items-center justify-center">
               {loadingDetails && <Loader2 className="animate-spin text-slate-400" />}
            </div>
         </div>
      </div>
    </div>
  );
};

export default AbilityDex;
