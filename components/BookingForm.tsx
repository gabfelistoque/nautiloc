'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import DatePicker from 'react-datepicker';
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
  const [guests, setGuests] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);

  const calculateTotalPrice = () => {
    if (!startDate || !endDate) return 0;
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays * price;
  };

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      setError("Por favor, faça login para fazer uma reserva");
      return;
    }
    
    if (!startDate || !endDate) {
      setError("Por favor, selecione as datas de início e término");
      return;
    }
    if (endDate <= startDate) {
      setError("A data de término deve ser posterior à data de início");
      return;
    }
    const price = calculateTotalPrice();
    setTotalPrice(price);
    setShowConfirmation(true);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      setError("Por favor, faça login para fazer uma reserva");
      return;
    }

    if (!startDate || !endDate) {
      setError("Por favor, selecione as datas de início e término");
      return;
    }

    if (endDate <= startDate) {
      setError("A data de término deve ser posterior à data de início");
      return;
    }

    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    if (start < now) {
      setError("A data de início deve ser futura");
      return;
    }

    // Calcula o preço total novamente para garantir consistência
    const calculatedPrice = calculateTotalPrice();
    if (calculatedPrice <= 0) {
      setError("Erro ao calcular o preço total");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          boatId,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          totalPrice: calculatedPrice,
          guests: Number(guests)
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar reserva');
      }

      // Limpar o formulário e mostrar sucesso
      setStartDate(null);
      setEndDate(null);
      setGuests(1);
      setTotalPrice(0);
      setShowConfirmation(true);
      
      // Mostrar mensagem de sucesso
      alert('Reserva criada com sucesso! Total: R$ ' + data.totalPrice.toLocaleString('pt-BR'));
    } catch (err: any) {
      console.error('Erro ao enviar reserva:', err);
      setError(err.message || 'Erro ao criar reserva');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={showConfirmation ? handleSubmit : handleCalculate} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Data de início
        </label>
        <DatePicker
          selected={startDate}
          onChange={(date) => {
            setStartDate(date);
            setShowConfirmation(false);
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

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Data de término
        </label>
        <DatePicker
          selected={endDate}
          onChange={(date) => {
            setEndDate(date);
            setShowConfirmation(false);
            setTotalPrice(0);
          }}
          selectsEnd
          startDate={startDate}
          endDate={endDate}
          minDate={startDate || new Date()}
          dateFormat="dd/MM/yyyy"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholderText="Selecione a data"
          required
        />
      </div>

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
            setShowConfirmation(false);
            setTotalPrice(0);
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      {showConfirmation && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Resumo da reserva</h3>
          <div className="space-y-2 text-sm text-blue-800">
            <p>Período: {startDate?.toLocaleDateString('pt-BR')} a {endDate?.toLocaleDateString('pt-BR')}</p>
            <p>Convidados: {guests} pessoas</p>
            <p className="text-lg font-bold">Total: R$ {totalPrice.toLocaleString('pt-BR')}</p>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className={`w-full py-3 px-4 rounded-md text-white font-medium ${
          isSubmitting
            ? 'bg-gray-400 cursor-not-allowed'
            : showConfirmation
            ? 'bg-green-600 hover:bg-green-700'
            : 'bg-blue-600 hover:bg-blue-700'
        } transition-colors`}
      >
        {isSubmitting
          ? 'Processando...'
          : showConfirmation
          ? 'Confirmar Reserva'
          : 'Calcular Total'}
      </button>
    </form>
  );
}
