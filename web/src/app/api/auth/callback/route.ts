import { api } from '@/lib/api'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')

  const redirectTo = request.cookies.get('redirectTo')?.value

  try {
    const registerResponse = await api.post('/register', {
      code,
    })

    const { token } = registerResponse.data

    if (!token) {
      return new NextResponse('Token não encontrado', { status: 400 })
    }

    const redirectURL = redirectTo ?? new URL('/', request.url)
    const cookieExpiresInSeconds = 60 * 60 * 24 * 30

    return NextResponse.redirect(redirectURL, {
      headers: {
        'Set-Cookie': `token=${token}; Path=/; max-age=${cookieExpiresInSeconds}`,
      },
    })
  } catch (error) {
    console.error('Erro ao registrar o token:', error)
    return new NextResponse('Falha ao registrar token', { status: 500 })
  }
}
