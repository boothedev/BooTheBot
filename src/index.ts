/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { ENDPOINTS, ERROR_RESPONSES } from './endpointHandlers';

export default {
	async fetch(...args) {
		const [request] = args;
		const url = new URL(request.url);
		const path = url.pathname;
		const method = request.method as Method;
		const response = (await ENDPOINTS[path]?.[method]?.(...args)) ?? null;
		if (response === null) return ERROR_RESPONSES.NotFound();
		return response;
	},
} satisfies ExportedHandler<Env>;
