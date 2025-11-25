import { GardenPlant, PlantLog } from '../types';

const STORAGE_KEY = 'botanical-buddy-garden';

export const getGarden = (): GardenPlant[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to load garden", error);
    return [];
  }
};

export const savePlant = (plant: GardenPlant): void => {
  const garden = getGarden();
  garden.unshift(plant); // Add to beginning
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(garden));
  } catch (e) {
    alert("Storage full! Please delete some plants or images to save new ones.");
  }
};

export const updatePlant = (updatedPlant: GardenPlant): void => {
  const garden = getGarden();
  const index = garden.findIndex(p => p.id === updatedPlant.id);
  if (index !== -1) {
    garden[index] = updatedPlant;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(garden));
  }
};

export const deletePlant = (id: string): void => {
  const garden = getGarden().filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(garden));
};

export const addLogToPlant = (plantId: string, log: PlantLog): GardenPlant | null => {
  const garden = getGarden();
  const plantIndex = garden.findIndex(p => p.id === plantId);
  
  if (plantIndex === -1) return null;

  const plant = garden[plantIndex];
  plant.logs.unshift(log);

  // Auto-update last watered date if log is water
  if (log.type === 'water') {
    plant.reminder.lastWateredDate = log.date;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(garden));
  return plant;
};

// Helper to check for reminders
export const checkReminders = (): GardenPlant[] => {
  const garden = getGarden();
  const duePlants: GardenPlant[] = [];
  const now = new Date();

  garden.forEach(plant => {
    if (plant.reminder.enabled && plant.reminder.lastWateredDate) {
      const lastWatered = new Date(plant.reminder.lastWateredDate);
      const nextDue = new Date(lastWatered);
      nextDue.setDate(lastWatered.getDate() + plant.reminder.frequencyDays);
      
      // If due date is today or in past
      if (nextDue <= now) {
        duePlants.push(plant);
      }
    }
  });

  return duePlants;
};
