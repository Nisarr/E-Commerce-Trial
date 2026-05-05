# SEO Dynamic Routes

Cloudflare Pages Functions used for dynamic metadata injection and SEO optimization.

## Product Detail SEO
`GET /product/[[slug]]`

This is a **Middle-of-the-request** Function that intercepts requests for product pages to inject Open Graph (OG) and Twitter meta tags for social sharing.

### Process:
1.  **Intercept**: Catches requests to `/product/[slug]`.
2.  **Fetch**: Internally calls `/api/v1/products` to get product data.
3.  **Inject**: Replaces the `<head>` section of the standard `index.html` with product-specific meta tags:
    -   `<title>`: Product Title
    -   `og:title` / `og:description` / `og:image`: For social media previews.
    -   `twitter:card`: For Twitter rich snippets.
4.  **Respond**: Returns the modified HTML.

### Technical Detail:
-   File: `functions/product/[[slug]].ts`
-   Uses the same database environment variables as the main API.
