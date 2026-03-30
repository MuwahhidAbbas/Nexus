import { useEffect } from "react";
import { useLocation } from "wouter";
import { useGetMe, useLogout, setAuthTokenGetter } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

export function useAuth(requireAuth = true) {
  const [_, setLocation] = useLocation();
  const queryClient = useQueryClient();
  
  const { data: user, isLoading, error } = useGetMe({ 
    query: { 
      retry: false,
      staleTime: 5 * 60 * 1000, 
    } 
  });

  const logoutMutation = useLogout({
    mutation: {
      onSuccess: () => {
        localStorage.removeItem('auth_token');
        setAuthTokenGetter(null);
        queryClient.clear();
        setLocation("/login");
      }
    }
  });

  useEffect(() => {
    if (!isLoading) {
      if (requireAuth && !user) {
        setLocation("/login");
      }
      if (!requireAuth && user && window.location.pathname === '/login') {
        setLocation("/dashboard");
      }
    }
  }, [user, isLoading, requireAuth, setLocation]);

  return {
    user,
    isLoading,
    error,
    logout: () => logoutMutation.mutate()
  };
}
