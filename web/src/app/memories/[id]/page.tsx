// src/app/memories/[id]/page.tsx
import { api } from '@/lib/api'
import { cookies } from 'next/headers'
import dayjs from 'dayjs'
import ptBR from 'dayjs/locale/pt-br'
import Image from 'next/image'
import { EmptyMemories } from '@/components/EmptyMemories'

dayjs.locale(ptBR)

interface Memory {
    id: string
    coverUrl: string
    excerpt: string
    createdAt: string
}

export default async function MemorieId({ params }: { params: { id: string } }) {
    const isAuthenticated = cookies().has('tkk')

    if (!isAuthenticated) {
        return <EmptyMemories />
    }

    const token = cookies().get('tkk')?.value

    try {
        const response = await api.get(`/memories/${params.id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })

        const memorie: Memory = response.data

        return (
            <div className="flex flex-col gap-10 p-8">
                <div key={memorie.id} className="space-y-4">
                    <time className="-ml-8 flex items-center gap-2 text-sm text-gray-100 before:h-px before:w-5 before:bg-gray-50">
                        {dayjs(memorie.createdAt).format('D[ de ]MMMM[, ]YYYY')}
                    </time>
                    <Image
                        src={memorie.coverUrl}
                        alt=""
                        width={592}
                        height={280}
                        quality={100}
                        className="aspect-video w-full rounded-lg object-cover"
                    />
                    <p className="text-lg leading-relaxed text-gray-100">
                        {memorie.excerpt}
                    </p>
                </div>
            </div>
        )
    } catch (error) {
        console.error('Erro ao buscar memória:', error)
        return <EmptyMemories />
    }
}
