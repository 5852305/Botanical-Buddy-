import React, { useState, useEffect } from 'react';
import { GardenPlant, PlantLog } from '../types';
import { getGarden, deletePlant, addLogToPlant, updatePlant } from '../services/garden';
import { MarkdownContent } from './MarkdownContent';

export const GardenView: React.FC = () => {
  const [plants, setPlants] = useState<GardenPlant[]>([]);
  const [selectedPlantId, setSelectedPlantId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'details' | 'logs' | 'settings'>('details');

  // Load plants on mount
  useEffect(() => {
    setPlants(getGarden());
  }, []);

  const handleRefresh = () => {
    setPlants(getGarden());
  };

  const selectedPlant = plants.find(p => p.id === selectedPlantId);

  // LOGGING
  const handleAddLog = (type: 'water' | 'fertilize' | 'note') => {
    if (!selectedPlant) return;
    
    let content = '';
    if (type === 'note') {
        const note = prompt("Enter your note:");
        if (!note) return;
        content = note;
    }

    const newLog: PlantLog = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      type,
      content
    };

    addLogToPlant(selectedPlant.id, newLog);
    handleRefresh();
  };

  // REMINDERS
  const handleUpdateReminder = (days: number, time: string, enabled: boolean) => {
    if (!selectedPlant) return;
    const updatedPlant = { 
        ...selectedPlant, 
        reminder: { 
            ...selectedPlant.reminder, 
            frequencyDays: days, 
            reminderTime: time,
            enabled: enabled 
        } 
    };
    updatePlant(updatedPlant);
    handleRefresh();
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to remove this plant from your garden?")) {
        deletePlant(id);
        setSelectedPlantId(null);
        handleRefresh();
    }
  };

  // RENDER LIST
  if (!selectedPlantId) {
    return (
        <div className="h-full bg-white rounded-xl shadow-sm border border-slate-100 overflow-y-auto p-4">
            <h2 className="text-2xl font-bold text-emerald-900 mb-6">My Garden</h2>
            
            {plants.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <p className="text-slate-500">Your garden is empty.</p>
                    <p className="text-sm text-slate-400 mt-1">Identify plants to add them here!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {plants.map(plant => (
                        <div 
                            key={plant.id} 
                            onClick={() => setSelectedPlantId(plant.id)}
                            className="flex gap-4 p-3 rounded-xl border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer bg-white"
                        >
                            <div className="w-20 h-20 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                                {plant.image ? (
                                    <img src={plant.image} alt={plant.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-emerald-200">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                                            <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 9a.75.75 0 00-1.5 0v2.25H9a.75.75 0 000 1.5h2.25V15a.75.75 0 001.5 0v-2.25H15a.75.75 0 000-1.5h-2.25V9z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-slate-800 truncate">{plant.name}</h3>
                                <p className="text-xs text-slate-500 mt-1">Added {new Date(plant.addedDate).toLocaleDateString()}</p>
                                {plant.reminder.enabled && (
                                    <div className="flex items-center gap-1 mt-2 text-xs text-emerald-600 bg-emerald-50 w-fit px-2 py-0.5 rounded-full">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                                            <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z" clipRule="evenodd" />
                                        </svg>
                                        Every {plant.reminder.frequencyDays} days
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
  }

  // RENDER DETAIL
  return (
    <div className="h-full bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
        {/* Detail Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
            <button 
                onClick={() => setSelectedPlantId(null)}
                className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M11.03 3.97a.75.75 0 010 1.06l-6.22 6.22H21a.75.75 0 010 1.5H4.81l6.22 6.22a.75.75 0 11-1.06 1.06l-7.5-7.5a.75.75 0 010-1.06l7.5-7.5a.75.75 0 011.06 0z" clipRule="evenodd" />
                </svg>
            </button>
            <h2 className="font-bold text-lg text-slate-800 truncate px-2">{selectedPlant?.name}</h2>
            <button 
                onClick={() => selectedPlant && handleDelete(selectedPlant.id)}
                className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.49 1.478l-.56 12.195a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.56 6.695a48.8 48.8 0 01-3.477-1.487.75.75 0 11.49-1.478 48.809 48.809 0 013.876-.512v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.945a.75.75 0 10-1.5.058l.347 9a.75.75 0 101.499-.058l-.346-9zm5.48.058a.75.75 0 10-1.498-.058l-.347 9a.75.75 0 001.5.058l.345-9z" clipRule="evenodd" />
                </svg>
            </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-100 bg-slate-50/50">
            {(['details', 'logs', 'settings'] as const).map(mode => (
                <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`flex-1 py-3 text-sm font-medium capitalize border-b-2 transition-colors ${
                        viewMode === mode 
                        ? 'border-emerald-500 text-emerald-700 bg-white' 
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                >
                    {mode}
                </button>
            ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 bg-white">
            {viewMode === 'details' && selectedPlant && (
                <div className="space-y-6">
                    {selectedPlant.image && (
                        <div className="rounded-xl overflow-hidden shadow-sm h-64 border border-slate-100">
                             <img src={selectedPlant.image} alt={selectedPlant.name} className="w-full h-full object-cover" />
                        </div>
                    )}
                    <div className="prose prose-sm prose-emerald max-w-none">
                        <MarkdownContent content={selectedPlant.careInfo} />
                    </div>
                </div>
            )}

            {viewMode === 'logs' && selectedPlant && (
                <div className="space-y-6">
                    {/* Action Buttons */}
                    <div className="grid grid-cols-3 gap-2">
                        <button 
                            onClick={() => handleAddLog('water')}
                            className="flex flex-col items-center justify-center p-3 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors border border-blue-100"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 mb-1">
                                <path fillRule="evenodd" d="M12.963 2.286a.75.75 0 00-1.071-.136 9.742 9.742 0 00-3.539 6.177 7.547 7.547 0 01-1.705 4.347 6 6 0 00-1.895 4.279A6.977 6.977 0 0012 21a6.977 6.977 0 007.247-4.048 6 6 0 00-1.895-4.279 7.547 7.547 0 01-1.705-4.347 9.742 9.742 0 00-2.684-6.04z" clipRule="evenodd" />
                            </svg>
                            <span className="text-xs font-semibold">Water</span>
                        </button>
                        <button 
                            onClick={() => handleAddLog('fertilize')}
                            className="flex flex-col items-center justify-center p-3 rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors border border-amber-100"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 mb-1">
                                <path fillRule="evenodd" d="M9.315 7.584C12.195 3.883 16.695 1.5 21.75 1.5a.75.75 0 01.75.75c0 5.056-2.383 9.555-6.084 12.436h.684a3 3 0 012.872 2.162l.848 3.5a1.125 1.125 0 01-1.092 1.39l-17.653.003a1.125 1.125 0 01-1.093-1.39l.848-3.5a3 3 0 012.872-2.162h.684zM16.486 11.23a8.97 8.97 0 001.075-1.603c.532-1.008.903-2.074 1.103-3.159A9.034 9.034 0 0013.916 9.58c-1.168.225-2.316.634-3.395 1.206.592.17 1.2.28 1.821.325.968.07 1.944.204 2.895.405a1.295 1.295 0 011.25 1.25V11.23z" clipRule="evenodd" />
                            </svg>
                            <span className="text-xs font-semibold">Fertilize</span>
                        </button>
                        <button 
                            onClick={() => handleAddLog('note')}
                            className="flex flex-col items-center justify-center p-3 rounded-xl bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors border border-purple-100"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 mb-1">
                                <path fillRule="evenodd" d="M4.125 3C3.089 3 2.25 3.84 2.25 4.875V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V4.875C21.75 3.84 20.91 3 19.875 3H4.125zM12 9.75a.75.75 0 000 1.5h1.5a.75.75 0 000-1.5H12zm-.75-2.25a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5H12a.75.75 0 01-.75-.75zM6 12.75a.75.75 0 000 1.5h7.5a.75.75 0 000-1.5H6zm-.75 3.75a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5H6a.75.75 0 01-.75-.75zM6 6.75a.75.75 0 00-.75.75v3c0 .414.336.75.75.75h3a.75.75 0 00.75-.75v-3A.75.75 0 009 6.75H6z" clipRule="evenodd" />
                                <path d="M18 9a.75.75 0 01.75.75V12a.75.75 0 01-1.5 0v-2.25A.75.75 0 0118 9z" />
                            </svg>
                            <span className="text-xs font-semibold">Note</span>
                        </button>
                    </div>

                    {/* Timeline */}
                    <div className="relative pl-6 border-l-2 border-slate-100 space-y-8 mt-6">
                        {selectedPlant.logs.length === 0 && (
                            <p className="text-sm text-slate-400 italic">No logs yet.</p>
                        )}
                        {selectedPlant.logs.map(log => (
                            <div key={log.id} className="relative">
                                <div className={`absolute -left-[31px] w-4 h-4 rounded-full border-2 border-white shadow-sm ${
                                    log.type === 'water' ? 'bg-blue-500' : 
                                    log.type === 'fertilize' ? 'bg-amber-500' : 'bg-purple-500'
                                }`}></div>
                                <div className="flex flex-col">
                                    <span className="text-xs text-slate-400">
                                        {new Date(log.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                    </span>
                                    <span className="font-medium text-slate-800 capitalize flex items-center gap-2">
                                        {log.type}
                                    </span>
                                    {log.content && (
                                        <p className="text-sm text-slate-600 mt-1 bg-slate-50 p-2 rounded-lg border border-slate-100">
                                            {log.content}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {viewMode === 'settings' && selectedPlant && (
                <div className="space-y-6">
                    <div className="bg-white rounded-xl border border-slate-200 p-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-slate-800">Watering Reminders</h3>
                            <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                                <input 
                                    type="checkbox" 
                                    name="toggle" 
                                    id="toggle" 
                                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer border-slate-300 checked:right-0 checked:border-emerald-500 transition-all duration-300 right-6"
                                    checked={selectedPlant.reminder.enabled}
                                    onChange={(e) => handleUpdateReminder(
                                        selectedPlant.reminder.frequencyDays, 
                                        selectedPlant.reminder.reminderTime,
                                        e.target.checked
                                    )}
                                />
                                <label 
                                    htmlFor="toggle" 
                                    className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${selectedPlant.reminder.enabled ? 'bg-emerald-500' : 'bg-slate-300'}`}
                                ></label>
                            </div>
                        </div>

                        {selectedPlant.reminder.enabled && (
                            <div className="space-y-4 animate-fade-in">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Frequency</label>
                                    <div className="flex items-center gap-2">
                                        <input 
                                            type="number" 
                                            min="1" 
                                            max="365"
                                            value={selectedPlant.reminder.frequencyDays}
                                            onChange={(e) => handleUpdateReminder(
                                                parseInt(e.target.value) || 7, 
                                                selectedPlant.reminder.reminderTime,
                                                true
                                            )}
                                            className="w-20 px-3 py-2 border border-slate-200 rounded-lg text-slate-800"
                                        />
                                        <span className="text-slate-600">days</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Preferred Time</label>
                                    <input 
                                        type="time" 
                                        value={selectedPlant.reminder.reminderTime}
                                        onChange={(e) => handleUpdateReminder(
                                            selectedPlant.reminder.frequencyDays, 
                                            e.target.value,
                                            true
                                        )}
                                        className="px-3 py-2 border border-slate-200 rounded-lg text-slate-800"
                                    />
                                </div>
                                <div className="p-3 bg-blue-50 text-blue-700 text-sm rounded-lg flex gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 flex-shrink-0">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                    <p>We'll notify you based on your last logged watering date.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};
