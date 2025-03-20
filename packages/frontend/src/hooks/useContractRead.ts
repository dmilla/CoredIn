import { useQuery } from "@tanstack/react-query";
import { Query, QueryOptions } from "./useServerState/types";

export const useContractRead = <S>(
  query: Query<S>,
  instanceOptions: QueryOptions = {
    enabled: true,
    refetchInterval: 60 * 1000
  }
) => {
  const {
    queryKey,
    queryFn,
    options: {
      retry = 1,
      cacheTime = 5 * 60 * 1000,
      refetchInterval = 60 * 1000,
      refetchIntervalInBackground = true,
      refetchOnWindowFocus = false,
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
