'use client'

import { EmptyMemories } from '@/components/EmptyMemories';
import { api } from '@/lib/api';
import dayjs from 'dayjs';
import ptBR from 'dayjs/locale/pt-br';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';

dayjs.locale(ptBR);

interface Memory {
  id: string;
  coverUrl: string;
  excerpt: string;
  createdAt: string;
}

export default function Home() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [token, setToken] = useState<string | undefined>();

  // UseEffect para obter o token do cookie no lado do cliente
  useEffect(() => {
    const cookieToken = document.cookie
      .split('; ')
      .find((row) => row.startsWith('tkk='))
      ?.split('=')[1];
    setToken(cookieToken);
  }, []);

  // UseEffect para buscar memórias
  useEffect(() => {
    const fetchMemories = async () => {
      if (token) {
        try {
          const response = await api.get('/memories', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setMemories(response.data);
        } catch (error) {
          console.error('Erro ao buscar memórias:', error);
        }
      }
    };

    fetchMemories();
  }, [token]);

  if (memories.length === 0) {
    return <EmptyMemories />;
  }

  return (
    <div className="flex flex-col gap-10 p-8">
      {memories.map((memory: Memory) => (
        <div key={memory.id} className="space-y-4">
          <time className="-ml-8 flex items-center gap-2 text-sm text-gray-100 before:h-px before:w-5 before:bg-gray-50">
            {dayjs(memory.createdAt).format('D[ de ]MMMM[, ]YYYY')}
          </time>
          <Image
            src={memory.coverUrl}
            alt=""
            width={592}
            height={280}
            quality={100}
            className="aspect-video w-full rounded-lg object-cover"
          />
          <p className="text-lg leading-relaxed text-gray-100">
            {memory.excerpt}
          </p>
          <Link
            href={`/memories/${memory.id}`}
            className="flex items-center gap-2 text-sm text-gray-200 hover:text-gray-100"
          >
            Ler mais
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ))}
    </div>
  );
}
