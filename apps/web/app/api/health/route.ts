import { NextResponse } from 'next/server';

export async function GET() {
  const checks = {
    uptime: process.uptime(),
    timestamp: Date.now(),
    status: 'ok'
  };

  return NextResponse.json(checks, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store'
    }
  });
}
