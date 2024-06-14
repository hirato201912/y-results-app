import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const apiKey = searchParams.get('api_key');

  // クッキーからAPIキーを取得
  const cookies = req.headers.get('cookie');
  console.log('Cookies from Request Headers:', cookies);
  const sessionApiKey = cookies ? cookies.split('; ').find(row => row.startsWith('api_key='))?.split('=')[1] : null;

  // デバッグ用のログ
  console.log('Request URL:', req.url);
  console.log('Search Params:', Array.from(searchParams.entries()));
  console.log('API Key from URL:', apiKey);
  console.log('API Key from Cookie:', sessionApiKey);

  if (apiKey === sessionApiKey) {
    return NextResponse.json({ valid: true }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });
  } else {
    return NextResponse.json({ valid: false }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });
  }
}
