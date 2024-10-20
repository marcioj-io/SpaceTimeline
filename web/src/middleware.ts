import { NextRequest, NextResponse } from 'next/server'

const signInURL = `https://github.com/login/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID}`

export function middleware(request: NextRequest) {
  const token = request.cookies.get('tkk')?.value

  if (token === null || token === undefined) {
    return NextResponse.redirect(signInURL, {
      headers: {
        'Set-Cookie': `redirectTo=${request.url}; Path=/; HttpOnly; SameSite=Lax; max-age=20;`,
      },
    })
  }
  return NextResponse.next()
}

export const config = {
  matcher: '/memories/:path*',
}
