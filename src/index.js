import { fetchShafaData } from '../utils/shafa';

export default {
	async fetch(request, env) {
		const url = new URL(request.url);

		if (url.pathname === '/products/add' && request.method === 'POST') {
			try {
				const data = await request.json();
				const link = data?.link;
				if (!link || typeof link !== 'string') {
					return Response.json({ error: 'Invalid link' }, { status: 400 });
				}

				const { name, price, description, color } = await fetchShafaData(link);
				let numericPrice = typeof price === 'string' ? parseFloat(price.replace(/[^0-9.]/g, '')) : Number(price);
				if (!Number.isFinite(numericPrice)) numericPrice = 0;

				const result = await env.db
					.prepare(
						'INSERT INTO products (name, price, description, color, shafa_link) VALUES (?, ?, ?, ?, ?)'
					)
					.bind(name ?? null, numericPrice, description ?? null, color.join(' ') ?? null, link)
					.run();

				return Response.json({
					message: 'Product added!',
					productID: result?.meta?.last_row_id ?? null
				});
			} catch (error) {
				const message = error instanceof Error ? error.message : String(error);
				if (message.includes('UNIQUE') && message.includes('shafa_link')) {
					return Response.json({ error: 'Product already exists for this link' }, { status: 409 });
				}
				console.error('Error adding product:', error);
				return Response.json({
					error: 'Failed to add product',
					details: message
				}, { status: 500 });
			}
		}

		return new Response('Not found', { status: 404 });
	}
};
