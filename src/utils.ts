import { Snowflake } from 'discord-api-types/globals';
import { RandomConfig } from '@/types';
import { TimeMode } from '@shared/consts';

class Hasher {
	private static prime = 16777619;
	private hash;

	constructor() {
		this.hash = 2166136261; // FNV offset basis
	}

	update(value: any) {
		switch (typeof value) {
			case 'number':
				this.update_number(value);
				break;
			case 'string':
				this.update_string(value);
				break;
			case 'bigint':
				this.update_string(value.toString());
				break;
			case 'object':
				this.update_string(JSON.stringify(value));
				break;
			case 'boolean':
			case 'function':
			case 'undefined':
			case 'symbol':
		}
		return this;
	}

	update_number(val: number) {
		// Treat the number as a 32-bit integer block
		// process the number in 4 chunks of 8 bits
		for (let i = 0; i < 4; i++) {
			this.update_byte(val);
			val >>>= 8;
		}
		return this;
	}

	update_byte(val: number) {
		this.hash ^= val & 0xff;
		this.hash = Math.imul(this.hash, Hasher.prime);
	}

	update_string(str: string) {
		for (let i = 0; i < str.length; i++) {
			this.hash ^= str.charCodeAt(i);
			this.hash = Math.imul(this.hash, Hasher.prime);
		}
		return this;
	}

	finish() {
		return this.hash >>> 0; // Convert to unsigned 32-bit integer
	}
}

function getRandomIndex(config: RandomConfig, hashMaterial: any[] = []): number {
	// Extract config
	const { timestamp = Date.now(), timezone = 'UTC', timemode = TimeMode.Randomly, collectionLength } = config;

	// Compute hash
	const hasher = new Hasher();
	let adjustedTime = getTimestampAtTimezone(timestamp, timezone, timemode);
	hasher.update_number(adjustedTime).update_string(timemode);
	hashMaterial?.forEach((item) => hasher.update(item));
	const hashResult = hasher.finish();

	// Deterministic index selection
	const index = Math.abs(hashResult) % collectionLength;
	return index;
}

function snowflakeToTimestamp(snowflake: Snowflake, epochOffset: number = 0) {
	const bigIntSnowflake = BigInt(snowflake);
	const timestamp = Number(bigIntSnowflake >> BigInt(22));
	const unixTimestampMs = Number(timestamp + epochOffset);
	return unixTimestampMs;
}

function getTimestampAtTimezone(timestamp: number, timeZone: string = 'UTC', timeMode: TimeMode = TimeMode.Daily): number {
	if (timeMode === TimeMode.Randomly) return timestamp;

	const datetimeNow = new Date(timestamp);
	const dateTimezoneStr = datetimeNow.toLocaleString('en-US', {
		timeZone: timeZone,
		year: 'numeric',
		month: 'numeric',
		day: 'numeric',
	});
	const date = new Date(dateTimezoneStr);
	switch (timeMode) {
		case 'daily':
			break;
		case 'weekly':
			const dayOfWeek = date.getUTCDay();
			const dayOfMonth = date.getUTCDate();
			date.setUTCDate(dayOfMonth - dayOfWeek);
			break;
		case 'monthly':
			date.setUTCDate(1);
			break;
		case 'yearly':
			date.setUTCMonth(1);
			date.setUTCDate(1);
			break;
	}
	return date.getTime();
}

function snowflakeToNumber(snowflake: Snowflake): number {
	const buffer = new ArrayBuffer(8);
	const view = new DataView(buffer);
	const u64Value = BigInt(snowflake);
	view.setBigUint64(0, u64Value, true);
	return view.getFloat64(0, true);
}

function escapeMarkdown(markdownText: string) {
	const markdownChars = /([\\`*_{}[\]()#+-.!>])/g;
	return markdownText.replace(markdownChars, '\\$1');
}

export { Hasher, snowflakeToTimestamp, getTimestampAtTimezone, getRandomIndex, snowflakeToNumber, escapeMarkdown };
