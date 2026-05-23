import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="app-page flex items-center justify-center min-h-[calc(100vh-5rem)]">
      <div className="w-full max-w-lg rounded-xl border bg-card p-8 text-center shadow-sm">
        <div className="mx-auto mb-5 flex w-fit items-center gap-2">
          <CheckCircle className="h-6 w-6 text-brand-purple" />
          <span className="text-lg font-semibold bg-gradient-to-r from-brand-indigo to-brand-purple bg-clip-text text-transparent">
            Plan It, Do It
          </span>
        </div>
        <h1 className="text-5xl font-bold tracking-tight">404</h1>
        <p className="mt-2 text-muted-foreground">
          This page doesn’t exist. Check the URL or go back home.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button asChild variant="outline">
            <Link to="/">Home</Link>
          </Button>
          <Button
            asChild
            className="bg-gradient-to-r from-brand-indigo to-brand-purple hover:opacity-90 transition-opacity"
          >
            <Link to="/dashboard">Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
