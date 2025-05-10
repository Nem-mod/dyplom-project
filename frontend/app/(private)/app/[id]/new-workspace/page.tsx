'use client';

import { useState } from 'react';
import { Input, Textarea, Button, Avatar } from '@heroui/react';
import { useRouter } from 'next/navigation';
import { PlusCircle } from 'lucide-react';

export default function NewWorkspacePage() {
  const [form, setForm] = useState({ name: '', description: '' });
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('Створення робочого простору:', form);
    // TODO: API запит (наприклад, POST /api/workspaces)
    router.push('/dashboard'); // після створення
  };

  return (
    <div className="flex items-center justify-center mt-16">
      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-xl">
        <div className="flex items-center gap-4 mb-6">
          <Avatar name="W" size="lg" isBordered />
          <div>
            <h1 className="text-2xl font-semibold">Новий робочий простір</h1>
            <p className="text-sm text-gray-500">Налаштуйте основні параметри</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            name="name"
            label="Назва робочого простору"
            placeholder="Наприклад: Команда Маркетингу"
            value={form.name}
            onChange={handleChange}
            isRequired
          /> 
          <Button type="submit" color="primary" fullWidth startContent={<PlusCircle size={18} />}>
            Створити простір
          </Button>
        </form>
      </div>
    </div>
  );
}
