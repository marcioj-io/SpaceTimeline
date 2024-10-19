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
      return new NextResponse('Token not found', { status: 400 })
    }

    const redirectURL = redirectTo ?? '/'
    const cookieExpiresInSeconds = 60 * 60 * 24 * 30 // 30 days

    return NextResponse.redirect(redirectURL, {
      headers: {
        'Set-Cookie': `token=${token}; Path=/; HttpOnly; SameSite=Lax; max-age=${cookieExpiresInSeconds}`,
      },
    })
  } catch (error) {
    console.error('Error registering token:', error)
    return new NextResponse('Failed to register token', { status: 500 })
  }
}
