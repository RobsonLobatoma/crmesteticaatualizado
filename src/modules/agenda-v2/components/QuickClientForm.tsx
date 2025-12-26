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
    address: "",
    birth_date: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    createClient(
      {
        name: formData.name,
        phone: formData.phone || null,
        address: formData.address || null,
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
        <Label>Endereço</Label>
        <Input
          value={formData.address}
          onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
          placeholder="Rua, número, bairro"
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
