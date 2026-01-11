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

import { ENDPOINTS, ERROR_RESPONSES } from './endpoints';
import { Method, RequestState } from '@/types';
import { StorageManager } from './storage';

export default {
	async fetch(request, env, ctx) {
		const url = new URL(request.url);
		const path = url.pathname;
		const method = request.method as Method;
		const reqState: RequestState = { ctx, env, request };
		const storageMgr = new StorageManager(reqState);

		const response = (await ENDPOINTS[path]?.[method]?.(storageMgr)) ?? null;
		if (response === null) return ERROR_RESPONSES.NotFound();
		return response;
	},
} satisfies ExportedHandler<Env>;
