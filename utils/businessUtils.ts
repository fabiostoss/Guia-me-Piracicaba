
import { WeekSchedule } from '../types';

export const isBusinessOpen = (schedule: WeekSchedule | undefined): boolean => {
  if (!schedule) return false;

  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 (Dom) a 6 (Sáb)
  const currentTime = now.getHours() * 60 + now.getMinutes();

  const dayConfig = schedule[dayOfWeek];

  if (!dayConfig || !dayConfig.enabled) return false;

  const [openH, openM] = dayConfig.open.split(':').map(Number);
  const [closeH, closeM] = dayConfig.close.split(':').map(Number);

  const openMinutes = openH * 60 + openM;
  const closeMinutes = closeH * 60 + closeM;

  // Trata casos onde fecha após a meia-noite
  if (closeMinutes < openMinutes) {
    return currentTime >= openMinutes || currentTime < closeMinutes;
  }

  return currentTime >= openMinutes && currentTime < closeMinutes;
};

export const formatScheduleSummary = (schedule: WeekSchedule): string => {
  const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const activeDays = Object.entries(schedule)
    .filter(([_, config]) => config.enabled)
    .map(([day, config]) => `${days[Number(day)]}: ${config.open}-${config.close}`);
  
  return activeDays.length > 0 ? activeDays.join(' | ') : 'Fechado temporariamente';
};

export const getDefaultSchedule = (): WeekSchedule => {
  const schedule: WeekSchedule = {};
  for (let i = 0; i < 7; i++) {
    schedule[i] = {
      enabled: i >= 1 && i <= 5, // Seg-Sex por padrão
      open: '08:00',
      close: '18:00'
    };
  }
  return schedule;
};
