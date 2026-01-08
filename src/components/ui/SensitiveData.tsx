import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "./button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";

interface SensitiveDataProps {
  /** Valor mascarado para exibição padrão */
  maskedValue: string;
  /** Valor completo (revelado ao clicar) */
  fullValue: string;
  /** Label para acessibilidade */
  label?: string;
  /** Tamanho do texto */
  size?: "xs" | "sm" | "base";
  /** Callback opcional quando dados são revelados (para auditoria) */
  onReveal?: () => void;
}

/**
 * Componente para exibição segura de dados sensíveis.
 * Por padrão exibe valor mascarado, com opção de revelar temporariamente.
 */
export function SensitiveData({
  maskedValue,
  fullValue,
  label = "dados sensíveis",
  size = "sm",
  onReveal,
}: SensitiveDataProps) {
  const [isRevealed, setIsRevealed] = useState(false);

  const handleToggle = () => {
    if (!isRevealed && onReveal) {
      onReveal();
    }
    setIsRevealed(!isRevealed);
  };

  const sizeClasses = {
    xs: "text-xs",
    sm: "text-sm",
    base: "text-base",
  };

  // Se não há valor completo diferente do mascarado, apenas exibe
  if (!fullValue || fullValue === "-" || fullValue === maskedValue) {
    return <span className={sizeClasses[size]}>{maskedValue}</span>;
  }

  return (
    <TooltipProvider>
      <span className={`inline-flex items-center gap-1 ${sizeClasses[size]}`}>
        <span className="font-medium">
          {isRevealed ? fullValue : maskedValue}
        </span>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 text-muted-foreground hover:text-foreground"
              onClick={handleToggle}
              aria-label={isRevealed ? `Ocultar ${label}` : `Revelar ${label}`}
            >
              {isRevealed ? (
                <EyeOff className="h-3 w-3" />
              ) : (
                <Eye className="h-3 w-3" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p className="text-xs">
              {isRevealed ? `Ocultar ${label}` : `Clique para revelar ${label}`}
            </p>
          </TooltipContent>
        </Tooltip>
      </span>
    </TooltipProvider>
  );
}
