import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutGrid, 
  Users, 
  FlaskConical, 
  Heart, 
  Settings, 
  Menu,
  X,
  Map,
  Scale,
  Sword,
  Sparkles
} from 'lucide-react';
import { useAppStore } from '../store';
import { useUserStore } from '../userStore';

const Sidebar = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const { favorites } = useAppStore();
  const { trainerName, trainerId, avatar, generateTrainerId } = useUserStore();

  const toggleSidebar = () => setIsOpen(!isOpen);

  // Generate ID on first load if default
  useEffect(() => {
    if (trainerId === '000000') {
      generateTrainerId();
    }
  }, [trainerId, generateTrainerId]);

  const navItems = [
    { to: '/', icon: LayoutGrid, label: 'Pokédex' },
    { to: '/team-builder', icon: Users, label: 'Team Builder' },
    { to: '/custom-lab', icon: FlaskConical, label: 'Custom Lab' },
    { to: '/move-dex', icon: Sword, label: 'Move Dex' },
    { to: '/ability-dex', icon: Sparkles, label: 'Ability Dex' },
    { to: '/cartograph', icon: Map, label: 'Cartograph' },
    { to: '/comparators', icon: Scale, label: 'Comparators' },
    { to: '/favorites', icon: Heart, label: 'Favorites', badge: favorites.length },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <>
      {/* Mobile Toggle */}
      <button 
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-slate-900 text-white rounded-lg shadow-lg"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-64 bg-slate-900 text-slate-100 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center shadow-red-500/50 shadow-lg border-2 border-white">
              <div className="w-8 h-1 bg-slate-900 absolute"></div>
              <div className="w-3 h-3 bg-white rounded-full z-10 border-2 border-slate-900"></div>
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">PokéCompanion</h1>
              <p className="text-xs text-slate-400">Ultimate Edition</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                ${isActive 
                  ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 font-medium' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
              `}
            >
              <item.icon size={20} />
              <span className="flex-1">{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="bg-slate-800 text-slate-200 text-xs px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="bg-slate-800 rounded-xl p-4 flex items-center gap-3">
             <div className="w-12 h-12 rounded-full bg-slate-700 flex-shrink-0 overflow-hidden border-2 border-slate-600">
               <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
             </div>
             <div className="overflow-hidden">
               <p className="text-sm font-bold text-white truncate">{trainerName}</p>
               <p className="text-xs text-slate-400 font-mono">ID: {trainerId}</p>
             </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
