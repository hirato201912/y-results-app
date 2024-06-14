import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const apiKey = searchParams.get('api_key');

  console.log('Request URL:', req.url);
  console.log('Search Params:', searchParams);
  console.log('API Key from URL:', apiKey);

  // ダミーデータベースの例（実際にはデータベースを使用）
  const sessionApiKey = 'セッションに保存されたAPIキー'; // 例：セッションまたはデータベースから取得
  const sessionApiKeyExpiry = 1622520000; // 例：セッションまたはデータベースから取得（Unixタイムスタンプ）

  if (!apiKey) {
    return NextResponse.json({ valid: false });
  }

  const currentTime = Math.floor(Date.now() / 1000);
  if (apiKey === sessionApiKey && currentTime < sessionApiKeyExpiry) {
    return NextResponse.json({ valid: true });
  } else {
    return NextResponse.json({ valid: false });
  }
}
