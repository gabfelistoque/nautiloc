'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import DatePicker from 'react-datepicker';
import { CalendarDays, CalendarRange } from 'lucide-react';
import "react-datepicker/dist/react-datepicker.css";

interface BookingFormProps {
  boatId: string;
  boatName: string;
  price: number;
}

export default function BookingForm({ boatId, boatName, price }: BookingFormProps) {
  const { data: session, status } = useSession();
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isMultipleDays, setIsMultipleDays] = useState(false);
  const [guests, setGuests] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [totalPrice, setTotalPrice] = useState(0);
  const [previewCalculation, setPreviewCalculation] = useState<{
    days: number;
    subtotal: number;
    cleaningFee: number;
    total: number;
  } | null>(null);

  const calculateTotalPrice = () => {
    if (!startDate) return 0;
    
    // Se for apenas um dia ou se não tiver data de término
    if (!isMultipleDays || !endDate) {
      const subtotal = price;
      const cleaningFee = subtotal * 0.1;
      return subtotal + cleaningFee;
    }

    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const subtotal = diffDays * price;
    const cleaningFee = subtotal * 0.1;
    return subtotal + cleaningFee;
  };

  useEffect(() => {
    if (startDate) {
      let days = 1;
      if (isMultipleDays && endDate) {
        const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
        days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }
      
      const subtotal = days * price;
      const cleaningFee = subtotal * 0.1;
      
      setPreviewCalculation({
        days,
        subtotal,
        cleaningFee,
        total: subtotal + cleaningFee
      });
    } else {
      setPreviewCalculation(null);
    }
  }, [startDate, endDate, isMultipleDays, price]);

  // Quando desativa múltiplos dias, limpa a data de término
  useEffect(() => {
    if (!isMultipleDays) {
      setEndDate(null);
    }
  }, [isMultipleDays]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      setError("Por favor, faça login para fazer uma reserva");
      return;
    }
    
    if (!startDate) {
      setError("Por favor, selecione a data de início");
      return;
    }

    if (isMultipleDays) {
      if (!endDate) {
        setError("Por favor, selecione a data de término");
        return;
      }

      if (endDate <= startDate) {
        setError("A data de término deve ser posterior à data de início");
        return;
      }
    }

    try {
      setIsSubmitting(true);
      setError(null);
      setSuccess(null);

      // Se for apenas um dia, usa a mesma data para início e fim
      // Sabemos que startDate não é null neste ponto
      const effectiveEndDate = (isMultipleDays ? endDate : startDate) as Date;
      
      // Se não tiver data de término quando necessário, retorna
      if (isMultipleDays && !endDate) {
        setError("Por favor, selecione a data de término");
        return;
      }

      const response = await fetch('/api/bookings/check-availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          boatId,
          startDate: startDate.toISOString(),
          endDate: effectiveEndDate.toISOString(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao verificar disponibilidade');
      }

      const bookingResponse = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          boatId,
          startDate: startDate.toISOString(),
          endDate: effectiveEndDate.toISOString(),
          totalPrice: calculateTotalPrice(),
          guests: Number(guests)
        }),
      });

      if (!bookingResponse.ok) {
        const data = await bookingResponse.json();
        throw new Error(data.error || 'Erro ao processar reserva');
      }

      setStartDate(null);
      setEndDate(null);
      setGuests(1);
      setTotalPrice(0);
      setError(null);
      setSuccess('Reserva realizada com sucesso! Você receberá um e-mail com mais detalhes.');
    } catch (err) {
      console.error('Erro:', err);
      setError(err instanceof Error ? err.message : 'Erro ao processar reserva');
      setSuccess(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-md text-sm">
          {success}
        </div>
      )}
      
      <div className="space-y-3">
        <div className="flex w-full bg-gray-50 rounded-xl p-1">
          <button
            type="button"
            onClick={() => setIsMultipleDays(false)}
            className={`flex-1 py-2.5 text-sm font-medium transition-all duration-200 ${
              !isMultipleDays
                ? 'bg-white text-blue-600 rounded-lg shadow-sm ring-1 ring-gray-200'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            Um dia
          </button>
          <button
            type="button"
            onClick={() => setIsMultipleDays(true)}
            className={`flex-1 py-2.5 text-sm font-medium transition-all duration-200 ${
              isMultipleDays
                ? 'bg-white text-blue-600 rounded-lg shadow-sm ring-1 ring-gray-200'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            Mais de um dia
          </button>
        </div>

        <label className="block text-sm font-medium text-gray-700">
          Quando
        </label>
        <DatePicker
          selected={startDate}
          onChange={(date) => {
            setStartDate(date);
            setTotalPrice(0);
          }}
          selectsStart
          startDate={startDate}
          endDate={endDate}
          minDate={new Date()}
          dateFormat="dd/MM/yyyy"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholderText="Selecione a data"
          required
        />
      </div>

      {isMultipleDays && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Data de término
          </label>
          <DatePicker
            selected={endDate}
            onChange={(date) => {
              setEndDate(date);
              setTotalPrice(0);
            }}
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            minDate={startDate || new Date()}
            dateFormat="dd/MM/yyyy"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholderText="Selecione a data"
            required={isMultipleDays}
          />
        </div>
      )}

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Número de convidados
        </label>
        <input
          type="number"
          min="1"
          value={guests}
          onChange={(e) => {
            setGuests(Number(e.target.value));
            setTotalPrice(0);
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className={`w-full py-3 px-4 rounded-md text-white font-medium ${
          isSubmitting
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
        } transition-colors`}
      >
        {isSubmitting ? 'Processando...' : 'Reservar'}
      </button>

      <p className="text-gray-500 text-xs mt-2 text-center">Você ainda não será cobrado. O pagamento será processado após a confirmação de nossa plataforma.</p>

      {previewCalculation && (
        <div className="mt-6 space-y-2.5">
          <div className="flex justify-between text-gray-600 text-sm">
            <span>R$ {price.toLocaleString('pt-BR')} x {previewCalculation.days} {previewCalculation.days === 1 ? 'dia' : 'dias'}</span>
            <span>R$ {previewCalculation.subtotal.toLocaleString('pt-BR')}</span>
          </div>
          <div className="flex justify-between text-gray-600 text-sm">
            <span>Taxa de limpeza</span>
            <span>R$ {previewCalculation.cleaningFee.toLocaleString('pt-BR')}</span>
          </div>
          <div className="flex justify-between font-semibold text-gray-900 border-t pt-3 text-sm">
            <span>Total</span>
            <span>R$ {previewCalculation.total.toLocaleString('pt-BR')}</span>
          </div>
        </div>
      )}
    </form>
  );
}
