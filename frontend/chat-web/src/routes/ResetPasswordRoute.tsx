import { Navigate, Outlet, useSearchParams } from "react-router-dom";

const ResetPasswordRoute = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  if (!token) {
    return <Navigate to="/auth/forgot-password" replace />;
  }

  return <Outlet />;
};

export default ResetPasswordRoute;
