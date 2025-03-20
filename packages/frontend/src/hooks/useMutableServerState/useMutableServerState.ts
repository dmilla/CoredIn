import { useMutation, useQueryClient } from "@tanstack/react-query";

type Mutator<T, S> = (data: T) => Promise<S>;

interface QueryOptions {
  retry?: number;
}

interface UseMutableServerStateHookOptions<T, S> {
  /**
   * This function will fire when the mutation is successful and will be passed the mutation's result.
   */
  onSuccess?: (data: S, variables: T) => void;
  /**
   * This flag determines if cached results should be revalidated (as in re-fetched).
   * By default, all caches matching the mutation keys are revalidated unless disableCacheRevalidation is true
   */
  disableCacheRevalidation?: boolean;
}

interface QueryMutator<T, S> {
  mutationKey: string[];
  mutationFn: Mutator<T, S>;
  options?: QueryOptions;
}

export const useMutableServerState = <T, S>(
  query: QueryMutator<T, S>,
  hookOptions: UseMutableServerStateHookOptions<T, S> = {}
) => {
  const queryClient = useQueryClient();
  const { mutationKey, mutationFn, options: { retry = 0 } = {} } = query;
  const { onSuccess, disableCacheRevalidation } = hookOptions;

  return useMutation({
    mutationKey,
    retry,
    mutationFn: async (variables: T) => {
      const response = await mutationFn(variables);
      await new Promise((r) => setTimeout(r, 500));
      return response;
    },
    onSuccess: async (data: S, variables: T) => {
      if (!disableCacheRevalidation) {
        // Queries cache auto-invalidation with the same key
        queryClient.invalidateQueries({ queryKey: [mutationKey] });
      }

      if (onSuccess) {
        onSuccess(data, variables);
      }
      return;
    }
  });
};
