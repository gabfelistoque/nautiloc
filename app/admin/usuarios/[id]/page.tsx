'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@prisma/client';

interface UserFormData {
  name: string;
  email: string;
  phone: string;
  password?: string;
  role: 'USER' | 'ADMIN';
}

export default function EditUserPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const isNew = params.id === 'novo';
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'USER',
  });
  const [loading, setLoading] = useState(!isNew);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const validateEmail = (email: string) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email);
  };

  const validatePassword = (password: string) => {
    if (!password) return true; // Senha é opcional na edição
    return password.length >= 8 && // Mínimo 8 caracteres
           /[A-Z]/.test(password) && // Pelo menos uma letra maiúscula
           /[a-z]/.test(password) && // Pelo menos uma letra minúscula
           /[0-9]/.test(password) && // Pelo menos um número
           /[^A-Za-z0-9]/.test(password); // Pelo menos um caractere especial
  };

  useEffect(() => {
    if (!isNew) {
      const fetchUser = async () => {
        try {
          const response = await fetch(`/api/admin/users/${params.id}`);
          if (!response.ok) {
            throw new Error('Falha ao carregar usuário');
          }
          const user = await response.json();
          setFormData({
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            role: user.role || 'USER',
          });
        } catch (error) {
          setError(error instanceof Error ? error.message : 'Erro ao carregar usuário');
        } finally {
          setLoading(false);
        }
      };

      fetchUser();
    }
  }, [isNew, params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    // Validar email
    if (!validateEmail(formData.email)) {
      setError('Email inválido');
      setIsSaving(false);
      return;
    }

    // Validar senha se fornecida
    if (formData.password && !validatePassword(formData.password)) {
      setError(
        'A senha deve ter no mínimo 8 caracteres, incluindo maiúsculas, minúsculas, números e caracteres especiais'
      );
      setIsSaving(false);
      return;
    }

    try {
      const url = isNew ? '/api/admin/users' : `/api/admin/users/${params.id}`;
      const method = isNew ? 'POST' : 'PUT';

      // Se não for uma nova senha, remova o campo
      const dataToSend = { ...formData };
      if (!isNew && !dataToSend.password) {
        delete dataToSend.password;
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        throw new Error('Falha ao salvar usuário');
      }

      router.push('/admin/usuarios');
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao salvar usuário');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/admin/users/${params.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Falha ao excluir usuário');
      }

      router.push('/admin/usuarios');
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao excluir usuário');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">
          {isNew ? 'Novo Usuário' : 'Editar Usuário'}
        </h1>
        {!isNew && (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Excluir Usuário
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl bg-white p-8 rounded-lg shadow">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-md">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Nome
          </label>
          <input
            type="text"
            name="name"
            id="name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="block w-full px-6 py-4 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            name="email"
            id="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="block w-full px-6 py-4 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            Telefone
          </label>
          <input
            type="tel"
            name="phone"
            id="phone"
            required
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="(00) 00000-0000"
            className="block w-full px-6 py-4 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Senha {!isNew && '(deixe em branco para manter a atual)'}
          </label>
          <input
            type="password"
            name="password"
            id="password"
            required={isNew}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="block w-full px-6 py-4 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="role" className="block text-sm font-medium text-gray-700">
            Papel
          </label>
          <select
            id="role"
            name="role"
            required
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value as 'USER' | 'ADMIN' })}
            className="block w-full px-6 py-4 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="USER">Usuário</option>
            <option value="ADMIN">Administrador</option>
          </select>
        </div>

        <div className="flex justify-end space-x-4 pt-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {isSaving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </form>

      {/* Modal de confirmação de exclusão */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Confirmar Exclusão
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-6 py-3 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="px-6 py-3 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Confirmar Exclusão
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
