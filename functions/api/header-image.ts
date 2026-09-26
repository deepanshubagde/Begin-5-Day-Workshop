// Cloudflare Pages Function: /api/header-image
// Redirects to the static custom-header.png

export const onRequestGet = async (context: { request: Request }) => {
  const url = new URL('/custom-header.png', context.request.url);
  return Response.redirect(url.toString(), 302);
};
