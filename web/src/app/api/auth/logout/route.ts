import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const redirectURL = new URL('/', request.url)

  console.log("🚀 ~ GET ~ request:", request)

  console.log("🚀 ~ GET ~ request.url:", request.url)

  console.log("🚀 ~ GET ~ redirectURL:", redirectURL)

  return NextResponse.redirect(redirectURL, {
    headers: {
      'Set-Cookie': `token=; Path=/; max-age=0;`,
    },
  })
}
