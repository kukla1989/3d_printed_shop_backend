import { fetchShafaData } from '../utils/shafa';

const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};

export default {
	async fetch(request, env) {
		const url = new URL(request.url);

 	if (request.method === 'OPTIONS') {
			const requestedHeaders = request.headers.get('Access-Control-Request-Headers');
			const headers = {
				...corsHeaders,
				'Access-Control-Allow-Headers': requestedHeaders || `${corsHeaders['Access-Control-Allow-Headers']}, abypass-tunnel-reminder`,
				'Access-Control-Max-Age': '86400'
			};
			return new Response(null, { status: 204, headers });
		}

		if (url.pathname === '/products/add' && request.method === 'POST') {
			try {
				const data = await request.json();
				const link = data?.link;
				if (!link || typeof link !== 'string') {
					return Response.json({ error: 'Invalid link' }, { status: 400, headers: corsHeaders });
				}

				const { name, price, description, color } = await fetchShafaData(link);
				let numericPrice = typeof price === 'string' ? parseFloat(price.replace(/[^0-9.]/g, '')) : Number(price);
				if (!Number.isFinite(numericPrice)) numericPrice = 0;

				const result = await env.db
					.prepare(
						'INSERT INTO products (name, price, description, color, shafa_link) VALUES (?, ?, ?, ?, ?)'
					)
					.bind(name ?? null, numericPrice, description ?? null, (Array.isArray(color) ? color.join(' ') : color ?? null), link)
					.run();

				return Response.json({
					message: 'Product added!',
					productId: result?.meta?.last_row_id ?? null
				}, { headers: corsHeaders });
			} catch (error) {
				const message = error instanceof Error ? error.message : String(error);
				if (message.includes('UNIQUE') && message.includes('shafa_link')) {
					return Response.json({ error: 'Product already exists for this link' }, { status: 409, headers: corsHeaders });
				}
				console.error('Error adding product:', error);
				return Response.json({
					error: 'Failed to add product',
					details: message
				}, { status: 500, headers: corsHeaders });
			}
		}

		return new Response('Not found', { status: 404, headers: corsHeaders });
	}
};
