export type Fetcher<S> = () => Promise<S>;

export interface QueryOptions {
	retry?: number;
	enabled?: boolean;
	cacheTime?: number;
	refetchInterval?: number;
	refetchIntervalInBackground?: boolean;
	refetchOnWindowFocus?: boolean | "always";
	notifyOnChangeProps?: ["data", "error"];
}

export interface Query<S> {
	queryKey: string[];
	queryFn: Fetcher<S>;
	options?: QueryOptions;
}
