import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const id = body?.id;
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    const envPath = path.join(process.cwd(), '.env.local');

    let content = '';
    try {
      content = await fs.readFile(envPath, 'utf8');
    } catch (e) {
      // file may not exist yet
      content = '';
    }

    const replaceOrAppend = (key: string, value: string, src: string) => {
      const re = new RegExp(`^${key}=.*$`, 'm');
      if (re.test(src)) return src.replace(re, `${key}=${value}`);
      return src + (src.endsWith('\n') || src === '' ? '' : '\n') + `${key}=${value}\n`;
    };

    // Update both private and public variants
    content = replaceOrAppend('YOUTUBE_CHANNEL_ID', id, content);


    await fs.writeFile(envPath, content, 'utf8');

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Failed to update .env.local', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
