import { AssetFilePath, Group, Memo, MemoSubType, RequestState, UserSettings } from '@/types';
import { GenericInteraction } from './discord/types';
import { verifyKey } from 'discord-interactions';

const MEMO: Memo = {
	userPrefs: {},
}; // L1

class StorageManager {
	private state;
	constructor(reqState: RequestState) {
		this.state = reqState;
	}

	getStatic(filePath: AssetFilePath | URL) {
		const url = filePath instanceof URL ? filePath : this.getStaticUrl(filePath);
		return this.state.env.ASSETS.fetch(url);
	}

	getStaticUrl(filePath: AssetFilePath) {
		const path = '/' + filePath.join('/');
		return new URL(path, this.state.request.url);
	}

	async fetch(group: Group, key: string): Promise<UserSettings | null> {
		// TOTO: remove this in production
		return null;

		// const targetMemo = MEMO[group];

		// // Try fetching from L1
		// if (targetMemo[key]) return targetMemo[key];

		// // Try fetching from L2
		// const cacheUrl = this.getCacheUrl(group, key);
		// const cacheResponse = await caches.default.match(cacheUrl);
		// if (cacheResponse) {
		// 	const cacheValue: MemoSubType<Group> = await cacheResponse.json();
		// 	targetMemo[key] = cacheValue; // Populate L1
		// 	return cacheValue;
		// }

		// // Fetch from KV storage
		// const kvString = (await this.state.env.KV.get(key)) ?? '{}';
		// const kvValue: MemoSubType<Group> = JSON.parse(kvString);
		// targetMemo[key] = kvValue; // Populate L1
		// this.state.ctx.waitUntil(this.updateCache(cacheUrl, kvString)); // Populate L2
		// return kvValue;
	}

	async update(group: keyof Memo, key: string, value: MemoSubType<Group>) {
		// Merge
		const prevValue = (await this.fetch(group, key)) ?? {};
		const newValue = {
			...prevValue,
			...value,
		};

		// Prep
		const targetMemo = MEMO[group];
		const newValueString = JSON.stringify(newValue);
		const cacheUrl = this.getCacheUrl(group, key);

		// Update
		targetMemo[key] = newValue; // Update L1
		this.state.ctx.waitUntil(
			Promise.all([
				this.updateCache(cacheUrl, newValueString), // Update L2
				this.state.env.KV.put(key, newValueString), // Update KV
			]),
		);
	}

	private updateCache(cacheUrl: URL, value: string) {
		const response = new Response(value, {
			headers: {
				'Cache-Control': 's-maxage=604800', // Good for a week
			},
		});
		return caches.default.put(cacheUrl, response);
	}

	private getCacheUrl(group: Group, key: string) {
		const keyPath = `/${group}/${key}`;
		return new URL(keyPath, this.state.request.url);
	}

	extractInteractionObject = async () => {
		const rawBody = await this.state.request.text();
		const signature = this.state.request.headers.get('x-signature-ed25519');
		const timestamp = this.state.request.headers.get('x-signature-timestamp');
		const clientPublicKey = this.state.env.DISCORD_PUBLIC_KEY;
		if (!signature || !timestamp) return null;
		const isValidSignatureRequest = await verifyKey(rawBody, signature, timestamp, clientPublicKey);
		if (!isValidSignatureRequest) return null;
		return JSON.parse(rawBody) as GenericInteraction;
	};
}

export { StorageManager };
