type Method = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
type EndpointHandler = Exclude<ExportedHandler<Env>['fetch'], undefined>;
type EndpointPairHandler = Partial<Record<Method, EndpointHandler>>;
interface Env {
	DISCORD_PUBLIC_KEY: string;
}
