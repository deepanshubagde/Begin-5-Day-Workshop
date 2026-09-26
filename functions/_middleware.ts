// Cloudflare Pages Middleware
// Automatically converts relative preview images to absolute URLs
// so WhatsApp, Facebook, LinkedIn, Twitter, and Telegram crawlers
// can fetch and render the rich link preview card.

interface PagesContext {
  request: Request;
  next: () => Promise<Response>;
}

export const onRequest = async (context: PagesContext) => {
  const response = await context.next();
  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('text/html')) {
    const url = new URL(context.request.url);
    const origin = url.origin;
    let html = await response.text();

    // Replace relative paths with absolute URLs for social bots
    html = html
      .replace(/content="\/custom-header\.png"/g, `content="${origin}/custom-header.png"`)
      .replace(/href="\/custom-header\.png"/g, `href="${origin}/custom-header.png"`);

    // Ensure canonical og:url is present
    if (!html.includes('property="og:url"')) {
      html = html.replace(
        '<meta property="og:type" content="website" />',
        `<meta property="og:type" content="website" />\n    <meta property="og:url" content="${url.href}" />`
      );
    }

    return new Response(html, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  }

  return response;
};
