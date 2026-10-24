import { useQuery } from "@tanstack/react-query";

import { getCurrentUser } from "../services/auth.service";
import { authKeys } from "./auth.keys";

/* goha is a read-only static site in production — there is no session
   endpoint, so the query is only enabled for the local mock backend. */
const MOCKING_ENABLED = process.env.NEXT_PUBLIC_API_MOCKING === "enabled";

export function useCurrentUserQuery() {
  return useQuery({
    queryKey: authKeys.currentUser(),
    queryFn: ({ signal }) => getCurrentUser({ signal }),
    enabled: MOCKING_ENABLED,
    retry: 0,
  });
}
