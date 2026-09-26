// Cloudflare Pages Function: /api/submit
// Receives form responses and forwards to Google Apps Script Webhook on Cloudflare Edge

interface Env {
  GOOGLE_SHEET_WEBHOOK_URL?: string;
}

const DEFAULT_WEBHOOK_URL =
  'https://script.google.com/macros/s/AKfycbxpi8z5usCBwIThD8SAg1KmUkqWr1t6mQZyrZlf-EQBoBDdfnCOFJiHfLqirNhyj3et/exec';

export const onRequestPost = async (context: { request: Request; env: Env }) => {
  try {
    const body: any = await context.request.json();
    const submissionId = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const timestamp = new Date().toLocaleString();

    const achieveSoonest = Array.isArray(body.achieveSoonest)
      ? body.achieveSoonest.join(', ') + (body.otherAchieve ? ` (Other: ${body.otherAchieve})` : '')
      : (body.achieveSoonest || '');

    const payload = {
      timestamp,
      submissionId,
      fullName: body.fullName || '',
      contactNumber: body.contactNumber || '',
      city: body.city || '',
      achieveSoonest,
      challenges: body.challenges || '',
      expectations: body.expectations || '',
      additionalInfo: body.additionalInfo || '',
    };

    const targetUrl = context.env.GOOGLE_SHEET_WEBHOOK_URL || DEFAULT_WEBHOOK_URL;
    let sheetSynced = false;
    let sheetError: string | null = null;

    if (targetUrl && targetUrl.startsWith('https://script.google.com')) {
      try {
        const resp = await fetch(targetUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload),
          redirect: 'follow',
        });

        if (resp.ok || resp.status === 200 || resp.status === 302) {
          sheetSynced = true;
        } else {
          sheetError = `HTTP ${resp.status}`;
        }
      } catch (err: any) {
        sheetError = err?.message || 'Sync error';
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        submissionId,
        sheetSynced,
        sheetError,
        message: 'Your reflection has been submitted successfully!',
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        success: false,
        error: err?.message || 'Submission error',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
};

export const onRequestOptions = async () => {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};
