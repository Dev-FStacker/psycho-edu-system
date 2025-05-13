import { format, parseISO, startOfDay } from "date-fns";

export const formatDate = (date, pattern = "yyyy-MM-dd") => {
  return format(new Date(date), pattern);
};

export const getTimeFromSlotId = (slotId) => {
  const slotMap = {
    1: "08:00",
    2: "09:00",
    3: "10:00",
    4: "11:00",
    5: "13:00",
    6: "14:00",
    7: "15:00",
    8: "16:00",
  };
  return slotMap[slotId] || "Unknown";
};

export const parseDateString = (dateStr) => {
  const parsed = parseISO(dateStr.split("/").reverse().join("-"));
  return isNaN(parsed) ? startOfDay(new Date()) : startOfDay(parsed);
};
