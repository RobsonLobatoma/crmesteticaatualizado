import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useClients } from "../hooks/useClients";
import { Client } from "../types";

interface QuickClientFormProps {
  onSuccess: (client: Client) => void;
  onCancel: () => void;
}

export function QuickClientForm({ onSuccess, onCancel }: QuickClientFormProps) {
  const { createClient, isCreating } = useClients();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    cpf: "",
    birth_date: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    createClient(
      {
        name: formData.name,
        phone: formData.phone || null,
        email: formData.email || null,
        cpf: formData.cpf || null,
        birth_date: formData.birth_date || null,
      },
      {
        onSuccess: (data) => {
          onSuccess(data as Client);
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Nome *</Label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
          placeholder="Nome completo"
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Telefone</Label>
        <Input
          value={formData.phone}
          onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
          placeholder="(00) 00000-0000"
        />
      </div>

      <div className="space-y-2">
        <Label>E-mail</Label>
        <Input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
          placeholder="email@exemplo.com"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>CPF</Label>
          <Input
            value={formData.cpf}
            onChange={(e) => setFormData((prev) => ({ ...prev, cpf: e.target.value }))}
            placeholder="000.000.000-00"
          />
        </div>
        <div className="space-y-2">
          <Label>Data de Nascimento</Label>
          <Input
            type="date"
            value={formData.birth_date}
            onChange={(e) => setFormData((prev) => ({ ...prev, birth_date: e.target.value }))}
          />
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" className="flex-1" disabled={!formData.name || isCreating}>
          {isCreating ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    </form>
  );
}
