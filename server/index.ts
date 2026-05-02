import { Hono } from 'hono';
import { cors } from 'hono/cors';

// Create the API app
const app = new Hono().basePath('/api');

// Middleware
app.use('*', cors());

// Health check
app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    message: 'Play Pen House API is running',
  });
});

// --- Route groups will be added here ---
// app.route('/auth', authRoutes);
// app.route('/products', productRoutes);
// app.route('/categories', categoryRoutes);
// app.route('/orders', orderRoutes);
// app.route('/users', userRoutes);
// app.route('/admin', adminRoutes);

export default app;
