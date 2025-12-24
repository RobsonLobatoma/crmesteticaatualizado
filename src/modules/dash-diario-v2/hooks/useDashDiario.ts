import { useEffect, useState } from "react";
import { DashDiarioEntry } from "../types/DashDiario";
import {
  criarEntradasDoMesComLeads,
} from "../services/dash-diario.service";
import { Lead } from "@/modules/leads-v2/types/Lead";

export const useDashDiario = (leads: Lead[]) => {
  const [ano, setAno] = useState(2026);
  const [mes, setMes] = useState(0); // 0 = janeiro
  const [entradas, setEntradas] = useState<DashDiarioEntry[]>(() =>
    criarEntradasDoMesComLeads(2026, 0, leads),
  );

  useEffect(() => {
    setEntradas(criarEntradasDoMesComLeads(ano, mes, leads));
  }, [ano, mes, leads]);

  const handleChangeMes = (valor: string) => {
    const mesIndex = Number(valor);
    setMes(mesIndex);
  };

  const handleChangeAno = (valor: string) => {
    const novoAno = Number(valor) || ano;
    setAno(novoAno);
  };

  const handleCellChange = <K extends keyof DashDiarioEntry>(
    index: number,
    field: K,
    value: string,
  ) => {
    setEntradas((prev) => {
      const copia = [...prev];
      copia[index] = { ...copia[index], [field]: value };
      return copia;
    });
  };

  const handleRemoverLinha = (index: number) => {
    setEntradas((prev) => prev.filter((_, i) => i !== index));
  };

  return {
    ano,
    mes,
    entradas,
    handleChangeMes,
    handleChangeAno,
    handleCellChange,
    handleRemoverLinha,
  };
};
