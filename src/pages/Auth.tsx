import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Navigate } from "react-router-dom";

import { cn } from "@/lib/utils";
import { useAuth } from "@/integrations/supabase/AuthProvider";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const loginSchema = z.object({
  email: z.string().trim().email("Informe um e-mail válido."),
  password: z.string().min(1, "Informe a senha."),
});

const signupSchema = z
  .object({
    email: z.string().trim().email("Informe um e-mail válido."),
    password: z
      .string()
      .min(8, "A senha deve ter pelo menos 8 caracteres.")
      .max(128, "A senha deve ter no máximo 128 caracteres."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "As senhas não coincidem.",
  });

const forgotSchema = z.object({
  email: z.string().trim().email("Informe um e-mail válido."),
});

type LoginValues = z.infer<typeof loginSchema>;
type SignupValues = z.infer<typeof signupSchema>;
type ForgotValues = z.infer<typeof forgotSchema>;

type Mode = "login" | "signup" | "forgot";

const AuthPage = () => {
  const [mode, setMode] = useState<Mode>("login");
  const [loadingAction, setLoadingAction] = useState(false);

  const { user, loading, signInWithEmail, signUpWithEmail, sendPasswordReset, signInWithGoogle } =
    useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const signupForm = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { email: "", password: "", confirmPassword: "" },
  });

  const forgotForm = useForm<ForgotValues>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: "" },
  });

  if (!loading && user) {
    return <Navigate to="/leads" replace />;
  }

  const handleLoginSubmit = async (values: LoginValues) => {
    setLoadingAction(true);
    const { error } = await signInWithEmail(values.email, values.password);
    setLoadingAction(false);

    if (error) {
      toast({
        variant: "destructive",
        title: "Não foi possível entrar",
        description: error.message || "Verifique suas credenciais e tente novamente.",
      });
      return;
    }

    navigate("/leads", { replace: true });
  };

  const handleSignupSubmit = async (values: SignupValues) => {
    setLoadingAction(true);
    const { error } = await signUpWithEmail(values.email, values.password);
    setLoadingAction(false);

    if (error) {
      toast({
        variant: "destructive",
        title: "Não foi possível criar a conta",
        description:
          error.message ||
          "Verifique os dados informados ou se o e-mail já está cadastrado e tente novamente.",
      });
      return;
    }

    toast({
      title: "Confira seu e-mail",
      description:
        "Enviamos um link de confirmação para o seu e-mail. Confirme o cadastro para acessar o CRM.",
    });
    setMode("login");
  };

  const handleForgotSubmit = async (values: ForgotValues) => {
    setLoadingAction(true);
    const { error } = await sendPasswordReset(values.email);
    setLoadingAction(false);

    if (error) {
      toast({
        variant: "destructive",
        title: "Não foi possível enviar o link",
        description:
          error.message ||
          "Tente novamente em alguns instantes. Se o problema persistir, contate o suporte.",
      });
      return;
    }

    toast({
      title: "Se o e-mail existir, enviaremos o link",
      description:
        "Caso o e-mail esteja cadastrado, você receberá um link para redefinição de senha.",
    });
    setMode("login");
  };

  const handleGoogle = async () => {
    setLoadingAction(true);
    const { error } = await signInWithGoogle();
    setLoadingAction(false);

    if (error) {
      toast({
        variant: "destructive",
        title: "Não foi possível conectar com o Google",
        description:
          error.message ||
          "Verifique a configuração de login com Google no Supabase e tente novamente.",
      });
    }
  };

  const isSubmitting =
    loadingAction ||
    loginForm.formState.isSubmitting ||
    signupForm.formState.isSubmitting ||
    forgotForm.formState.isSubmitting;

  const renderTabs = () => {
    if (mode === "forgot") return null;

    return (
      <div className="mb-6 grid grid-cols-2 rounded-full bg-muted p-1 text-sm font-medium">
        <button
          type="button"
          className={cn(
            "rounded-full py-2 text-center transition",
            mode === "login"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
          onClick={() => setMode("login")}
        >
          Entrar
        </button>
        <button
          type="button"
          className={cn(
            "rounded-full py-2 text-center transition",
            mode === "signup"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
          onClick={() => setMode("signup")}
        >
          Criar conta
        </button>
      </div>
    );
  };

  const renderLoginForm = () => (
    <Form {...loginForm}>
      <form className="space-y-4" onSubmit={loginForm.handleSubmit(handleLoginSubmit)}>
        <FormField
          control={loginForm.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-mail</FormLabel>
              <FormControl>
                <Input type="email" autoComplete="email" placeholder="voce@clinica.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={loginForm.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Senha</FormLabel>
              <FormControl>
                <Input type="password" autoComplete="current-password" {...field} />
              </FormControl>
              <div className="mt-1 flex justify-between">
                <button
                  type="button"
                  className="text-xs font-medium text-primary hover:underline"
                  onClick={() => setMode("forgot")}
                >
                  Esqueceu sua senha?
                </button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full h-11 text-[15px] font-medium" disabled={isSubmitting}>
          Entrar
        </Button>
      </form>
    </Form>
  );

  const renderSignupForm = () => (
    <Form {...signupForm}>
      <form className="space-y-4" onSubmit={signupForm.handleSubmit(handleSignupSubmit)}>
        <FormField
          control={signupForm.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-mail</FormLabel>
              <FormControl>
                <Input type="email" autoComplete="email" placeholder="voce@clinica.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={signupForm.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Senha</FormLabel>
              <FormControl>
                <Input type="password" autoComplete="new-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={signupForm.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirmar senha</FormLabel>
              <FormControl>
                <Input type="password" autoComplete="new-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full h-11 text-[15px] font-medium" disabled={isSubmitting}>
          Criar conta
        </Button>
      </form>
    </Form>
  );

  const renderForgotForm = () => (
    <Form {...forgotForm}>
      <form className="space-y-4" onSubmit={forgotForm.handleSubmit(handleForgotSubmit)}>
        <FormField
          control={forgotForm.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-mail</FormLabel>
              <FormControl>
                <Input type="email" autoComplete="email" placeholder="voce@clinica.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full h-11 text-[15px] font-medium" disabled={isSubmitting}>
          Enviar link de redefinição
        </Button>

        <button
          type="button"
          className="w-full text-xs font-medium text-muted-foreground hover:text-foreground hover:underline"
          onClick={() => setMode("login")}
        >
          Voltar para o login
        </button>
      </form>
    </Form>
  );

  const renderGoogleButton = () => (
    <Button
      type="button"
      variant="outline"
      className="w-full h-11 gap-2 text-sm font-medium"
      onClick={handleGoogle}
      disabled={isSubmitting}
    >
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-background text-xs font-semibold">
        G
      </span>
      <span>Continuar com Google</span>
    </Button>
  );

  return (
    <div className="min-h-screen min-h-[100dvh] w-full bg-background px-4 py-6 sm:py-8 overflow-x-hidden overflow-y-auto">
      <div className="w-full max-w-md mx-auto pb-8">
        <div className="mb-6 sm:mb-8 text-center space-y-2">
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Studio CRM</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Acesse o painel da sua clínica com segurança via e-mail ou Google.
          </p>
        </div>

        <Card className="shadow-lg border-border/60 bg-card/95 backdrop-blur">
          <CardHeader className="pb-4 px-4 sm:px-6">
            <CardTitle className="text-base sm:text-lg font-semibold">
              {mode === "login" && "Acesse sua conta"}
              {mode === "signup" && "Crie sua conta"}
              {mode === "forgot" && "Recupere sua senha"}
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              {mode === "login" && "Entre com seu e-mail e senha para visualizar seus módulos do CRM."}
              {mode === "signup" &&
                "Crie uma conta para gerenciar leads, agenda, financeiro e toda a operação da clínica."}
              {mode === "forgot" &&
                "Informe o e-mail cadastrado para enviarmos um link seguro de redefinição de senha."}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5 px-4 sm:px-6">
            {renderTabs()}

            {mode === "login" && renderLoginForm()}
            {mode === "signup" && renderSignupForm()}
            {mode === "forgot" && renderForgotForm()}

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="h-px flex-1 bg-border" />
              <span>ou</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            {renderGoogleButton()}

            {mode !== "forgot" && (
              <p className="pt-1 text-center text-xs text-muted-foreground">
                {mode === "login" ? "Não tem uma conta?" : "Já possui cadastro?"}{" "}
                <button
                  type="button"
                  className="font-medium text-primary hover:underline"
                  onClick={() => setMode(mode === "login" ? "signup" : "login")}
                >
                  {mode === "login" ? "Criar conta" : "Entrar"}
                </button>
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthPage;
