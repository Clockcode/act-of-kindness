import { DEFAULT_CACHE_TIME } from "@/utils/config";
import { useQuery } from "@tanstack/react-query";
import sdk from "@farcaster/frame-sdk";

export function useFarcasterContext(enabled: boolean = true) {
  return useQuery({
    queryKey: ["frames", "context"],
    queryFn: async () => {
      const context = await sdk.context;
      if (!context) {
        // Only log in development, and make it less prominent
        if (process.env.NODE_ENV === 'development') {
          console.debug("No Farcaster context available (likely not in Farcaster frame)");
        }
        return null;
      }

      return context;
    },
    staleTime: DEFAULT_CACHE_TIME,
    enabled,
  });
}
