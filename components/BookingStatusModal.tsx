'use client';

import { Fragment, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface BookingStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: any;
  onStatusChange: (bookingId: string, newStatus: string) => Promise<void>;
}

const statusOptions = [
  { value: 'PENDENTE', label: 'Pendente' },
  { value: 'CONFIRMADO', label: 'Confirmado' },
  { value: 'CANCELADO', label: 'Cancelado' },
];

export default function BookingStatusModal({
  isOpen,
  onClose,
  booking,
  onStatusChange,
}: BookingStatusModalProps) {
  if (!booking) return null;

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === booking.status) return;
    
    try {
      await onStatusChange(booking.id, newStatus);
      onClose();
    } catch (error) {
      console.error('Erro ao alterar status:', error);
    }
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div>
                  <div className="mt-3 text-center sm:mt-5">
                    <Dialog.Title
                      as="h3"
                      className="text-2xl font-semibold leading-6 text-gray-900 mb-4"
                    >
                      Detalhes da Reserva
                    </Dialog.Title>
                    <div className="mt-4 text-left space-y-3">
                      <p className="text-gray-600">
                        <span className="font-semibold">Barco:</span> {booking.boat.name}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-semibold">Cliente:</span> {booking.user.name}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-semibold">Período:</span>{' '}
                        {format(new Date(booking.startDate), "dd 'de' MMMM", { locale: ptBR })} -{' '}
                        {format(new Date(booking.endDate), "dd 'de' MMMM", { locale: ptBR })}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-semibold">Status atual:</span>{' '}
                        {statusOptions.find(option => option.value === booking.status)?.label}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-6 space-y-2">
                  <p className="text-sm font-medium text-gray-700 mb-2">Alterar status para:</p>
                  <div className="grid grid-cols-3 gap-3">
                    {statusOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleStatusChange(option.value)}
                        disabled={option.value === booking.status}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                          option.value === booking.status
                            ? 'bg-blue-600 text-white cursor-default'
                            : 'bg-white text-gray-700 ring-1 ring-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mt-6">
                  <button
                    type="button"
                    className="w-full rounded-md bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-200"
                    onClick={onClose}
                  >
                    Fechar
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
