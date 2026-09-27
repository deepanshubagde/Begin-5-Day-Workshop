// Cloudflare Pages Function: /api/config
// Supplies runtime configuration (Google Sheet Webhook URL, Header Image)

interface Env {
  GOOGLE_SHEET_WEBHOOK_URL?: string;
}

const DEFAULT_WEBHOOK_URL =
  'https://script.google.com/macros/s/AKfycbxpi8z5usCBwIThD8SAg1KmUkqWr1t6mQZyrZlf-EQBoBDdfnCOFJiHfLqirNhyj3et/exec';

export const onRequestGet = async (context: { env: Env }) => {
  const targetUrl = context.env.GOOGLE_SHEET_WEBHOOK_URL || DEFAULT_WEBHOOK_URL;

  return new Response(
    JSON.stringify({
      googleSheetWebhookUrl: targetUrl,
      headerImageUrl: '/form-header.png',
      syncToGoogleForm: false,
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    }
  );
};
