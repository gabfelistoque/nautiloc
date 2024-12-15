'use client';

import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import ptBR from 'date-fns/locale/pt-BR';
import { useState, useEffect, useMemo } from 'react';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '@/styles/calendar.css';
import BookingStatusModal from './BookingStatusModal';

const locales = {
  'pt-BR': ptBR,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date: Date) => startOfWeek(date, { locale: ptBR }),
  getDay,
  locales,
});

interface BaseBooking {
  id: string;
  status: string;
  boat: {
    id: string;
    name: string;
  };
  user: {
    name: string;
  };
}

interface Booking extends BaseBooking {
  startDate: string;
  endDate: string;
}

interface BookingDisplay extends BaseBooking {
  startDate: Date;
  endDate: Date;
}

interface BookingCalendarProps {
  bookings: Booking[];
}

const statusOptions = [
  { value: 'TODOS', label: 'Todos os status' },
  { value: 'PENDENTE', label: 'Pendente' },
  { value: 'CONFIRMADO', label: 'Confirmado' },
  { value: 'CANCELADO', label: 'Cancelado' },
];

export default function BookingCalendar({ bookings }: BookingCalendarProps) {
  const [selectedStatus, setSelectedStatus] = useState('TODOS');
  const [selectedBoat, setSelectedBoat] = useState('TODOS');
  const [filteredEvents, setFilteredEvents] = useState<any[]>([]);
  const [boats, setBoats] = useState<{ id: string; name: string; }[]>([]);
  const [date, setDate] = useState(new Date());
  const [view, setView] = useState<typeof Views[keyof typeof Views]>(Views.MONTH);
  const [selectedBooking, setSelectedBooking] = useState<BookingDisplay | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Extrair lista única de barcos dos bookings
  useEffect(() => {
    const uniqueBoats = Array.from(
      new Set(bookings.map(booking => JSON.stringify({ id: booking.boat.id, name: booking.boat.name })))
    ).map(str => JSON.parse(str));

    setBoats([{ id: 'TODOS', name: 'Todos os barcos' }, ...uniqueBoats]);
  }, [bookings]);

  // Filtrar eventos baseado nos filtros selecionados
  useEffect(() => {
    let filtered = bookings.map((booking) => ({
      id: booking.id,
      title: `${booking.boat.name} - ${booking.user.name}`,
      start: new Date(booking.startDate),
      end: new Date(booking.endDate),
      status: booking.status,
      boatId: booking.boat.id,
    }));

    if (selectedStatus !== 'TODOS') {
      filtered = filtered.filter((event) => event.status === selectedStatus);
    }

    if (selectedBoat !== 'TODOS') {
      filtered = filtered.filter((event) => event.boatId === selectedBoat);
    }

    setFilteredEvents(filtered);
  }, [bookings, selectedStatus, selectedBoat]);

  // Personalizar a aparência dos eventos baseado no status
  const eventStyleGetter = (event: any) => {
    let backgroundColor = '#fef08a'; // Amarelo claro (PENDING) como padrão
    let color = '#854d0e'; // Texto em marrom escuro para o amarelo claro
    let boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';

    switch (event.status) {
      case 'CONFIRMADO':
        backgroundColor = '#059669'; // Verde mais escuro
        color = 'white';
        break;
      case 'CANCELADO':
        backgroundColor = '#dc2626'; // Vermelho mais escuro
        color = 'white';
        break;
    }

    return {
      style: {
        backgroundColor,
        color,
        boxShadow,
        border: 'none',
        borderRadius: '6px',
        padding: '4px 8px',
        fontWeight: 500,
        fontSize: '0.75rem',
      },
    };
  };

  const messages = useMemo(() => ({
    today: 'Hoje',
    previous: 'Anterior',
    next: 'Próximo',
    month: 'Mês',
    week: 'Semana',
    day: 'Dia',
    agenda: 'Agenda',
    date: 'Data',
    time: 'Hora',
    event: 'Evento',
    noEventsInRange: 'Não há reservas neste período.',
    allDay: 'Dia inteiro',
    work_week: 'Semana de trabalho',
    yesterday: 'Ontem',
    tomorrow: 'Amanhã',
    showMore: (total: number) => `+ ${total} reservas`,
  }), []);

  const formats = useMemo(() => ({
    monthHeaderFormat: (date: Date) => format(date, 'MMMM yyyy', { locale: ptBR }),
    weekdayFormat: (date: Date) => format(date, 'EEE', { locale: ptBR }),
    dayHeaderFormat: (date: Date) => format(date, 'cccc, d MMMM', { locale: ptBR }),
    dayRangeHeaderFormat: ({ start, end }: { start: Date; end: Date }) =>
      `${format(start, 'd MMMM', { locale: ptBR })} - ${format(end, 'd MMMM', { locale: ptBR })}`,
    agendaDateFormat: (date: Date) => format(date, 'cccc, d MMMM', { locale: ptBR }),
    agendaHeaderFormat: ({ start, end }: { start: Date; end: Date }) =>
      `${format(start, 'd MMMM', { locale: ptBR })} - ${format(end, 'd MMMM', { locale: ptBR })}`,
    dayFormat: (date: Date) => format(date, "EEE, dd", { locale: ptBR }),
    timeGutterFormat: (date: Date) => format(date, 'HH:mm', { locale: ptBR }),
    eventTimeRangeFormat: ({ start, end }: { start: Date; end: Date }) =>
      `${format(start, 'HH:mm', { locale: ptBR })} - ${format(end, 'HH:mm', { locale: ptBR })}`,
    timeRangeFormat: ({ start, end }: { start: Date; end: Date }) =>
      `${format(start, 'HH:mm', { locale: ptBR })} - ${format(end, 'HH:mm', { locale: ptBR })}`,
  }), []);

  const handleNavigate = (newDate: Date) => {
    setDate(newDate);
  };

  const handleViewChange = (newView: any) => {
    setView(newView);
  };

  const handleEventClick = (event: any) => {
    const booking = bookings.find(b => b.id === event.id);
    if (booking) {
      setSelectedBooking({
        ...booking,
        startDate: new Date(booking.startDate),
        endDate: new Date(booking.endDate)
      } as BookingDisplay);
      setIsModalOpen(true);
    }
  };

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar status');
      }

      // Atualizar a lista de reservas localmente
      const updatedBookings = bookings.map(booking =>
        booking.id === bookingId
          ? { ...booking, status: newStatus }
          : booking
      );
      setFilteredEvents(updatedBookings.map(booking => ({
        id: booking.id,
        title: `${booking.boat.name} - ${booking.user.name}`,
        start: new Date(booking.startDate),
        end: new Date(booking.endDate),
        status: booking.status,
        boatId: booking.boat.id,
      })));

    } catch (error) {
      console.error('Error updating booking status:', error);
      alert('Erro ao atualizar status da reserva');
    }
  };

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex gap-4 p-4 bg-white rounded-lg shadow-sm">
        <div className="flex-1">
          <select
            id="status"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2.5"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <select
            id="boat"
            value={selectedBoat}
            onChange={(e) => setSelectedBoat(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2.5"
          >
            {boats.map((boat) => (
              <option key={boat.id} value={boat.id}>
                {boat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Calendário */}
      <div className="h-[700px] bg-white rounded-lg">
        <Calendar
          localizer={localizer}
          events={filteredEvents}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          eventPropGetter={eventStyleGetter}
          messages={messages}
          formats={formats}
          views={['month', 'week', 'day', 'agenda']}
          view={view}
          date={date}
          onNavigate={handleNavigate}
          onView={handleViewChange}
          onSelectEvent={handleEventClick}
        />
      </div>

      <BookingStatusModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        booking={selectedBooking}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
