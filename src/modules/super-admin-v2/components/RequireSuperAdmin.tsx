import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ShieldX } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RequireSuperAdminProps {
  children: React.ReactNode;
}

export function RequireSuperAdmin({ children }: RequireSuperAdminProps) {
  const [isChecking, setIsChecking] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          navigate("/auth");
          return;
        }

        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .eq("role", "super_admin")
          .maybeSingle();

        if (error) {
          console.error("Error checking super admin:", error);
          setIsSuperAdmin(false);
        } else {
          setIsSuperAdmin(!!data);
        }
      } catch (error) {
        console.error("Error:", error);
        setIsSuperAdmin(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkAccess();
  }, [navigate]);

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isSuperAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <ShieldX className="h-16 w-16 text-destructive" />
        <h1 className="text-2xl font-bold">Acesso Negado</h1>
        <p className="text-muted-foreground text-center max-w-md">
          Você não tem permissão para acessar esta área.
          Apenas super administradores podem visualizar esta página.
        </p>
        <Button onClick={() => navigate("/")} variant="outline">
          Voltar para o início
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
