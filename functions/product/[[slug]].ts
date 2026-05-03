interface Env {
  TURSO_URL: string;
  TURSO_AUTH_TOKEN: string;
}

export const onRequest = async (context: { request: Request; env: Env; params: { slug: string }; next: () => Promise<Response> }) => {
  const { request, env, params } = context;
  const url = new URL(request.url);
  const slug = params.slug;

  if (!env.TURSO_URL || !slug) {
    return context.next();
  }

  try {
    // 1. Fetch product data from the API
    // We use the full URL to ensure it works in all environments
    const apiBase = `${url.origin}/api/v1`;
    const res = await fetch(`${apiBase}/products`);
    
    if (!res.ok) return context.next();
    
    const data: any = await res.json();
    const product = data.items?.find((p: any) => p.slug === slug);

    if (!product) {
      return context.next();
    }

    // 2. Fetch the original index.html
    const response = await context.next();
    if (response.status !== 200) return response;
    
    const html = await response.text();

    // 3. Inject meta tags into the HTML
    let images = [];
    try {
      images = JSON.parse(product.images || '[]');
    } catch (e) {
      images = [];
    }
    const imageUrl = images[0] || '';
    
    const metaTags = `
      <title>${product.title} | PlayPen House</title>
      <meta name="description" content="${product.brand || 'Premium Baby PlayPen'}">
      <meta property="og:title" content="${product.title}">
      <meta property="og:description" content="Get the best ${product.title} for your baby at PlayPen House.">
      <meta property="og:image" content="${imageUrl}">
      <meta property="og:type" content="product">
      <meta property="og:url" content="${request.url}">
      <meta name="twitter:card" content="summary_large_image">
    `;

    // Replace the default title or head content
    const updatedHtml = html.replace('<head>', `<head>${metaTags}`);

    return new Response(updatedHtml, {
      headers: { "Content-Type": "text/html" },
    });
  } catch (error) {
    console.error("SEO Injection Error:", error);
    return context.next();
  }
};
