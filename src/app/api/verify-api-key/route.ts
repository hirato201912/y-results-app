import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const apiKey = searchParams.get('api_key');

  console.log('Request URL:', req.url);
  console.log('Search Params:', searchParams);
  console.log('API Key from URL:', apiKey);

  // 事前に決めたAPIキー
  const predefinedApiKey = 'your-predefined-api-key';

  if (apiKey === predefinedApiKey) {
    return NextResponse.json({ valid: true });
  } else {
    return NextResponse.json({ valid: false });
  }
}
