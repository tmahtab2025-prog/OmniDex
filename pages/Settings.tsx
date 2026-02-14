import React, { useState } from 'react';
import { useUserStore } from '../userStore';
import { User, Check, Ruler, Weight, Download, Trash2, Moon, Database } from 'lucide-react';

const Settings = () => {
  const { trainerName, avatar, trainerHeight, trainerWeight, setTrainerName, setAvatar, setTrainerStats } = useUserStore();
  const [nameInput, setNameInput] = useState(trainerName);
  const [heightInput, setHeightInput] = useState(trainerHeight);
  const [weightInput, setWeightInput] = useState(trainerWeight);

  const avatars = [
    'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png', // Pikachu
    'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png', // Bulbasaur
    'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png', // Charmander
    'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/7.png', // Squirtle
    'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/133.png', // Eevee
    'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/150.png', // Mewtwo
    'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/94.png', // Gengar
    'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/448.png', // Lucario
  ];

  const handleSaveName = () => {
    if (nameInput.trim()) {
      setTrainerName(nameInput.trim());
    }
  };

  const handleSaveStats = () => {
    setTrainerStats(Number(heightInput), Number(weightInput));
  };

  const handleExportData = () => {
    const appData = localStorage.getItem('poke-companion-storage');
    const userData = localStorage.getItem('poke-companion-user');
    
    if (!appData && !userData) {
       alert('No data to export.');
       return;
    }

    const exportObj = {
       appData: appData ? JSON.parse(appData) : null,
       userData: userData ? JSON.parse(userData) : null,
       exportDate: new Date().toISOString()
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `poke_companion_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-3xl font-bold text-slate-900 mb-6">Settings</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Profile Section */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <User size={20} className="text-purple-500" />
            Trainer Profile
          </h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Trainer Name</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  placeholder="Enter your name"
                />
                <button 
                  onClick={handleSaveName}
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
                  disabled={nameInput === trainerName}
                >
                  Save
                </button>
              </div>
            </div>

            <div>
               <label className="block text-sm font-medium text-slate-700 mb-2">Physical Stats</label>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1 text-xs text-slate-500">
                       <Ruler size={14} /> Height (cm)
                    </div>
                    <input 
                      type="number"
                      value={heightInput}
                      onChange={(e) => setHeightInput(Number(e.target.value))}
                      onBlur={handleSaveStats}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1 text-xs text-slate-500">
                       <Weight size={14} /> Weight (kg)
                    </div>
                    <input 
                      type="number"
                      value={weightInput}
                      onChange={(e) => setWeightInput(Number(e.target.value))}
                      onBlur={handleSaveStats}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    />
                  </div>
               </div>
               <p className="text-xs text-slate-400 mt-2">Used for size comparisons in the Lab.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">Avatar</label>
              <div className="grid grid-cols-4 gap-3">
                {avatars.map((url) => (
                  <button
                    key={url}
                    onClick={() => setAvatar(url)}
                    className={`
                      relative aspect-square rounded-xl overflow-hidden border-2 transition-all
                      ${avatar === url ? 'border-purple-500 ring-2 ring-purple-500/20' : 'border-slate-100 hover:border-slate-300'}
                    `}
                  >
                    <img src={url} alt="Avatar option" className="w-full h-full object-contain p-2" />
                    {avatar === url && (
                      <div className="absolute inset-0 bg-purple-500/10 flex items-center justify-center">
                        <div className="bg-purple-500 text-white rounded-full p-1 shadow-sm">
                          <Check size={12} strokeWidth={3} />
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* App Settings */}
        <div className="space-y-6">
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
             <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Database size={20} className="text-blue-500" /> Data Management
             </h2>
             <div className="space-y-4">
                <button 
                  onClick={handleExportData}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-100 font-bold flex items-center justify-center gap-2 transition-all"
                >
                   <Download size={18} /> Export Data JSON
                </button>
                <p className="text-xs text-slate-400 text-center">
                   Downloads a backup of your teams, custom mons, and settings.
                </p>
             </div>
          </section>

          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
             <h2 className="text-xl font-bold text-slate-800 mb-4 text-red-600 flex items-center gap-2">
                <Trash2 size={20} /> Danger Zone
             </h2>
             <div className="space-y-4">
                <p className="text-sm text-slate-500">
                  Once you delete your data, there is no going back. Please be certain.
                </p>
                <button 
                  onClick={() => {
                    if(window.confirm('Are you sure you want to delete all data? This cannot be undone.')) {
                      localStorage.clear();
                      window.location.reload();
                    }
                  }}
                  className="px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 text-sm font-medium w-full"
                >
                  Clear All Data
                </button>
             </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Settings;
