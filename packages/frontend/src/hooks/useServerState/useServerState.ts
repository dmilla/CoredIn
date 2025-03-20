import { useQuery } from "@tanstack/react-query";
import { Query, QueryOptions } from "./types";

export const useServerState = <S>(
  query: Query<S>,
  instanceOptions: QueryOptions = {
    enabled: true,
    refetchInterval: 5 * 60 * 1000
  }
) => {
  const {
    queryKey,
    queryFn,
    options: {
      retry = 1,
      cacheTime = 60 * 60 * 1000,
      refetchInterval = 5 * 60 * 1000,
      refetchIntervalInBackground = false,
      refetchOnWindowFocus = true,
      enabled = true
    } = {}
  } = query;

  return useQuery<S>({
    queryKey,
    queryFn,
    ...{
      retry,
      cacheTime,
      refetchInterval,
      refetchIntervalInBackground,
      refetchOnWindowFocus,
      enabled,
      ...instanceOptions
    }
  });
};
