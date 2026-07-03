import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getMyAdminStatus } from "@/lib/admin.functions";
import { useAuth } from "@/hooks/use-auth";

/** Returns whether the signed-in viewer is an admin. Safe for unauthenticated users. */
export function useIsAdmin() {
  const { user } = useAuth();
  const fn = useServerFn(getMyAdminStatus);
  const { data } = useQuery({
    queryKey: ["me-admin", user?.id ?? "guest"],
    queryFn: () => fn(),
    enabled: !!user,
    staleTime: 5 * 60_000,
  });
  return !!data?.is_admin;
}
