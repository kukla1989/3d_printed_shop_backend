import { fetchShafaData } from '../utils/shafa';

export default {
	async fetch(request) {
		const url = new URL(request.url);

		if (url.pathname === '/products/add' && request.method === 'POST') {
			try {
				const data = await request.json();
				if (!data.link) {
					return Response.json({ error: 'Invalid link' }, { status: 400 });
				}

				const productData = await fetchShafaData(data.link);

				return Response.json({
					message: 'Product added!',
					productID: '1'
				});
			} catch (error) {
				console.error('Error adding product:', error);
				return Response.json({
					error: 'Failed to add product',
					details: error instanceof Error ? error.message : String(error)
				}, { status: 500 });
			}
		}

		return new Response('Not found', { status: 404 });
	}
};
