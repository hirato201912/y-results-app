import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import type { NextRequest } from 'next/server';

// 型定義
interface WarningMailRequest {
  studentName: string;
  schoolName: string;
  gradeName: string;
  homeworkMeterCount: number; // bombCountから変更
  studentId: number;
}

// メール送信のための設定
const MAIL_CONFIG = {
  from: 'soroban.chiryu@gmail.com',
   to: 'meikai.yatsuhashi@gmail.com',
  companyName: '三河八橋駅前校',
  companyEmail: '',
  companyPhone: ''
} as const;

// トランスポーターの作成
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: MAIL_CONFIG.from,
      pass: process.env.GMAIL_APP_PASSWORD || 'qyyqohplpwtsepxo'
    }
  });
};

// メール本文の生成
const createMailBody = (data: WarningMailRequest) => {
  return `
宿題未提出が5回に達しましたので、お知らせいたします。

■ 生徒情報
氏名: ${data.studentName}
学校: ${data.schoolName}
学年: ${data.gradeName}
宿題忘れメーター: ${data.homeworkMeterCount}/5

ご確認の上、必要な対応をお願い申し上げます。

-----------------------
${MAIL_CONFIG.companyName}
-----------------------
`;
};

// リクエストの検証
const validateRequest = (data: any): data is WarningMailRequest => {
  return (
    typeof data.studentName === 'string' &&
    typeof data.schoolName === 'string' &&
    typeof data.gradeName === 'string' &&
    typeof data.homeworkMeterCount === 'number' && // bombCountから変更
    typeof data.studentId === 'number' &&
    data.studentName.length > 0 &&
    data.schoolName.length > 0 &&
    data.gradeName.length > 0 &&
    data.homeworkMeterCount > 0 && // bombCountから変更
    data.studentId > 0
  );
};

export async function POST(request: NextRequest) {
  try {
    // リクエストボディの解析
    const data = await request.json();

    // リクエストの検証
    if (!validateRequest(data)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid request data' 
        },
        { status: 400 }
      );
    }

    // トランスポーターの作成
    const transporter = createTransporter();

    // メールオプションの設定
    const mailOptions = {
      from: MAIL_CONFIG.from,
      to: MAIL_CONFIG.to,
      subject: '【通知】生徒の宿題未提出', // 「警告」から「通知」に変更
      text: createMailBody(data),
    };

    // メール送信
    await transporter.sendMail(mailOptions);

    // 成功レスポンス
    return NextResponse.json({
      success: true,
      message: 'Notification email sent successfully',
      sentTo: MAIL_CONFIG.to,
      studentId: data.studentId
    });

  } catch (error) {
    // エラーログの出力
    console.error('Notification email error:', error);

    // エラーレスポンス
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred while sending email' 
      },
      { status: 500 }
    );
  }
}

// OPTIONSリクエストのハンドリング
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}