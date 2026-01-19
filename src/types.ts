import { Locale } from 'discord-api-types/v10';
import { StorageManager } from '@/storage';
import { TimeMode } from '@shared/consts';

export type Method = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
type FetchFn = Exclude<ExportedHandler<Env>['fetch'], undefined>;
export type EndpointHandler = (storageMgr: StorageManager, ...args: any[]) => ReturnType<FetchFn>;
export type EndpointPairHandler = Partial<Record<Method, EndpointHandler>>;
export type UserSettings = {
	locale: Locale;
	timezone: string;
};
export type Memo = {
	userPrefs: Record<string, UserSettings>;
};
export type Group = keyof Memo;
export type MemoSubType<T extends keyof Memo> = Memo[T][keyof Memo[T]];

export interface RequestState {
	request: Request<unknown, IncomingRequestCfProperties<unknown>>;
	env: Env;
	ctx: ExecutionContext<unknown>;
}

export type RandomConfig = {
	timestamp?: number;
	timezone?: string;
	timemode?: TimeMode;
	collectionLength: number;
};

type AssetGroup = 'clow' | 'sprite' | 'answer';
type AssetSub = 'locales' | 'images';
type AssetName = string;
export type AssetFilePath = [AssetGroup, AssetSub, AssetName];
