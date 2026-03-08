import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import { Loader2 } from "lucide-react";

type AppRole = "admin" | "client" | "guard";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: AppRole[];
  redirectTo?: string;
}

const ProtectedRoute = ({ children, allowedRoles, redirectTo = "/portal" }: ProtectedRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  const { roles, loading: roleLoading } = useRole();

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }

  if (allowedRoles && !allowedRoles.some((r) => roles.includes(r))) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
