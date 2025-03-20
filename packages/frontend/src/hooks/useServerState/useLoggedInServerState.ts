import { useServerState } from ".";
import { Query, QueryOptions } from "./types";

export const useLoggedInServerState = <S>(
  query: Query<S>,
  instanceOptions: QueryOptions = {}
) => {
  // const { isConnected } = useAccount();
  // TODO - adapt to cosmos wallet
  const isConnected = true;

  return useServerState(query, { enabled: isConnected, ...instanceOptions });
};
