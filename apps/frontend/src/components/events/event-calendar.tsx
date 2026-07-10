"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, MapPin, Tag } from "lucide-react";
import type { ContentItem } from "@/lib/api";
import { formatDate, formatPrice } from "@/lib/utils";

interface EventCalendarProps {
  events: ContentItem[];
  locale: string;
}

const translations: Record<string, any> = {
  en: {
    title: "Event Calendar",
    selectPrompt: "Select a highlighted date to view event details.",
    date: "Date",
    venue: "Venue",
    price: "Price",
    book: "Book Tickets",
    view: "View Invitation",
    allEvents: "Back to list",
  },
  am: {
    title: "የዝግጅት የቀን መቁጠሪያ",
    selectPrompt: "የዝግጅቱን ዝርዝር ለማየት ምልክት የተደረገበትን ቀን ይጫኑ።",
    date: "ቀን",
    venue: "ቦታ",
    price: "ዋጋ",
    book: "ቲኬት ይቁረጡ",
    view: "ግብዣውን ይመልከቱ",
    allEvents: "ወደ ዝርዝሩ ይመለሱ",
  },
  es: {
    title: "Calendario de Eventos",
    selectPrompt: "Selecciona una fecha destacada para ver los detalles del evento.",
    date: "Fecha",
    venue: "Lugar",
    price: "Precio",
    book: "Reservar Entradas",
    view: "Ver Invitación",
    allEvents: "Volver a la lista",
  },
  fr: {
    title: "Calendrier des Événements",
    selectPrompt: "Sélectionnez une date en surbrillance pour voir les détails de l'événement.",
    date: "Date",
    venue: "Lieu",
    price: "Prix",
    book: "Réserver des Billets",
    view: "Voir l'Invitation",
    allEvents: "Retour à la liste",
  }
};

export function EventCalendar({ events, locale }: EventCalendarProps) {
  const t = translations[locale] || translations.en;

  // Initialize calendar view to the first event's date, or current date if none
  const initialDate = useMemo(() => {
    if (events.length > 0 && events[0].startsAt) {
      return new Date(events[0].startsAt);
    }
    return new Date();
  }, [events]);

  const [currentYear, setCurrentYear] = useState(initialDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth());
  const [selectedEvent, setSelectedEvent] = useState<ContentItem | null>(events[0] || null);

  const monthName = useMemo(() => {
    return new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(
      new Date(currentYear, currentMonth)
    );
  }, [currentYear, currentMonth, locale]);

  // Days of week localized
  const weekDays = useMemo(() => {
    const formatter = new Intl.DateTimeFormat(locale, { weekday: "short" });
    // Reference week starting on Sunday (Jan 4, 2026 is Sunday)
    return Array.from({ length: 7 }).map((_, i) =>
      formatter.format(new Date(2026, 0, 4 + i))
    );
  }, [locale]);

  // Helper to determine days in current month view
  const daysInMonth = useMemo(() => {
    const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    
    const days = [];
    // Prefix padding days
    for (let i = 0; i < firstDayIndex; i++) {
      days.push({ day: null, hasEvent: false, eventItems: [] });
    }
    
    // Month days
    for (let d = 1; d <= totalDays; d++) {
      const current = new Date(currentYear, currentMonth, d);
      current.setHours(12, 0, 0, 0); // avoid TZ offsets
      
      const dayEvents = events.filter((e) => {
        if (!e.startsAt) return false;
        const start = new Date(e.startsAt);
        const end = e.endsAt ? new Date(e.endsAt) : start;
        
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        
        return current >= start && current <= end;
      });
      
      days.push({
        day: d,
        hasEvent: dayEvents.length > 0,
        eventItems: dayEvents,
      });
    }
    
    return days;
  }, [currentYear, currentMonth, events]);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  const handleDayClick = (dayInfo: any) => {
    if (dayInfo.eventItems && dayInfo.eventItems.length > 0) {
      setSelectedEvent(dayInfo.eventItems[0]);
    }
  };

  return (
    <div className="bg-ink-950/60 border border-ink-800 rounded-3xl p-6 md:p-8 backdrop-blur-md">
      <div className="flex items-center justify-between mb-8">
        <h3 className="font-serif text-3xl text-white tracking-wide">{t.title}</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-2 border border-ink-800 rounded-full hover:border-gold-500/40 text-ink-300 hover:text-white transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="font-mono text-sm tracking-widest text-ink-200 uppercase min-w-[120px] text-center">
            {monthName}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-2 border border-ink-800 rounded-full hover:border-gold-500/40 text-ink-300 hover:text-white transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Calendar Grid */}
        <div className="lg:col-span-7">
          <div className="grid grid-cols-7 text-center mb-4 border-b border-ink-800/40 pb-2">
            {weekDays.map((day, i) => (
              <span key={i} className="text-[10px] font-mono tracking-widest text-ink-400 uppercase">
                {day}
              </span>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-y-3 gap-x-1 text-center">
            {daysInMonth.map((cell, idx) => {
              if (cell.day === null) {
                return <div key={`empty-${idx}`} />;
              }
              
              const isSelected = selectedEvent && cell.eventItems.some((e) => e.id === selectedEvent.id);
              
              return (
                <button
                  key={`day-${cell.day}`}
                  onClick={() => handleDayClick(cell)}
                  disabled={!cell.hasEvent}
                  className={`aspect-square flex flex-col items-center justify-center rounded-xl text-sm transition-all relative ${
                    cell.hasEvent
                      ? isSelected
                        ? "bg-gold-500/20 border border-gold-500/60 text-white font-medium shadow-[0_0_12px_rgba(212,149,32,0.15)]"
                        : "bg-ink-900/50 border border-ink-800 hover:border-gold-500/40 text-gold-400 font-semibold cursor-pointer"
                      : "text-ink-500 cursor-default"
                  }`}
                >
                  <span>{cell.day}</span>
                  {cell.hasEvent && !isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-gold-500 mt-0.5 absolute bottom-1.5" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Event Details */}
        <div className="lg:col-span-5 border-t lg:border-t-0 lg:border-l border-ink-800/60 pt-6 lg:pt-0 lg:pl-8 h-full flex flex-col justify-between">
          {selectedEvent ? (
            <div className="space-y-6 animate-fade-in">
              {selectedEvent.image?.url && (
                <div className="aspect-[16/10] w-full rounded-2xl overflow-hidden relative border border-ink-800">
                  <img
                    src={selectedEvent.image.url}
                    alt={selectedEvent.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-950/80 via-transparent to-transparent" />
                </div>
              )}
              
              <div>
                <h4 className="font-serif text-2xl text-white mb-2">{selectedEvent.title}</h4>
                {selectedEvent.subtitle && (
                  <p className="text-sm font-serif italic text-ink-300">{selectedEvent.subtitle}</p>
                )}
              </div>

              <div className="space-y-3 font-mono text-xs text-ink-300">
                {selectedEvent.startsAt && (
                  <div className="flex items-center gap-3">
                    <CalendarIcon size={14} className="text-gold-400 shrink-0" />
                    <span>
                      <strong className="text-ink-400 mr-2">{t.date}:</strong>
                      {formatDate(selectedEvent.startsAt, locale)}
                    </span>
                  </div>
                )}
                {selectedEvent.venue && (
                  <div className="flex items-center gap-3">
                    <MapPin size={14} className="text-gold-400 shrink-0" />
                    <span>
                      <strong className="text-ink-400 mr-2">{t.venue}:</strong>
                      {selectedEvent.venue}
                    </span>
                  </div>
                )}
                {selectedEvent.ticketPrice !== undefined && (
                  <div className="flex items-center gap-3">
                    <Tag size={14} className="text-gold-400 shrink-0" />
                    <span>
                      <strong className="text-ink-400 mr-2">{t.price}:</strong>
                      {selectedEvent.ticketPrice === 0 ? "Free" : formatPrice(selectedEvent.ticketPrice, selectedEvent.currency || "ETB")}
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-2">
                <Link
                  href={`/${locale}/events/${selectedEvent.slug}`}
                  className="btn-primary w-full text-center py-3 block text-sm tracking-wider"
                >
                  {t.view}
                </Link>
              </div>
            </div>
          ) : (
            <div className="h-48 flex flex-col items-center justify-center text-center text-ink-400 p-4 border border-dashed border-ink-800 rounded-2xl bg-ink-900/10">
              <CalendarIcon size={24} className="text-ink-500 mb-3" />
              <p className="text-sm leading-relaxed max-w-[240px]">{t.selectPrompt}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
