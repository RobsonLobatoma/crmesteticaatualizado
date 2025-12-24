import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FiltrosKanban as FiltrosKanbanType } from '@/types/crm';
import { Settings, X } from 'lucide-react';
import { Link } from 'react-router-dom';

interface FiltrosKanbanProps {
  filtros: FiltrosKanbanType;
  onChange: (filtros: FiltrosKanbanType) => void;
}

export const FiltrosKanban = ({ filtros, onChange }: FiltrosKanbanProps) => {
  const handleLimparFiltros = () => {
    onChange({
      busca: '',
      responsavel: 'todos',
      origem: 'todos',
      apenasUrgentes: false,
      apenasNaoLidos: false
    });
  };

  const temFiltrosAtivos = 
    filtros.busca || 
    filtros.responsavel !== 'todos' || 
    filtros.origem !== 'todos' || 
    filtros.apenasUrgentes || 
    filtros.apenasNaoLidos;

  return (
    <div className="flex flex-wrap items-center gap-4 p-4 bg-muted/30 rounded-xl mb-6">
      {/* Campo de busca */}
      <div className="flex-1 min-w-[200px]">
        <Input
          placeholder="Buscar por nome ou telefone..."
          value={filtros.busca}
          onChange={(e) => onChange({ ...filtros, busca: e.target.value })}
          className="h-9"
        />
      </div>

      {/* Filtro por responsável */}
      <Select
        value={filtros.responsavel}
        onValueChange={(value) => onChange({ ...filtros, responsavel: value })}
      >
        <SelectTrigger className="w-[180px] h-9">
          <SelectValue placeholder="Responsável" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos responsáveis</SelectItem>
          <SelectItem value="Ana Paula">Ana Paula</SelectItem>
          <SelectItem value="Carlos Eduardo">Carlos Eduardo</SelectItem>
          <SelectItem value="Beatriz Lima">Beatriz Lima</SelectItem>
        </SelectContent>
      </Select>

      {/* Filtro por origem */}
      <Select
        value={filtros.origem}
        onValueChange={(value: any) => onChange({ ...filtros, origem: value })}
      >
        <SelectTrigger className="w-[160px] h-9">
          <SelectValue placeholder="Origem" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todas origens</SelectItem>
          <SelectItem value="WhatsApp">WhatsApp</SelectItem>
          <SelectItem value="Instagram">Instagram</SelectItem>
          <SelectItem value="TikTok">TikTok</SelectItem>
          <SelectItem value="Anúncio">Anúncio</SelectItem>
          <SelectItem value="Indicação">Indicação</SelectItem>
          <SelectItem value="Promoção">Promoção</SelectItem>
        </SelectContent>
      </Select>

      {/* Toggle urgentes */}
      <div className="flex items-center gap-2">
        <Switch
          id="urgentes"
          checked={filtros.apenasUrgentes}
          onCheckedChange={(checked) => onChange({ ...filtros, apenasUrgentes: checked })}
        />
        <Label htmlFor="urgentes" className="text-sm cursor-pointer">
          Apenas urgentes
        </Label>
      </div>

      {/* Toggle não lidos */}
      <div className="flex items-center gap-2">
        <Switch
          id="nao-lidos"
          checked={filtros.apenasNaoLidos}
          onCheckedChange={(checked) => onChange({ ...filtros, apenasNaoLidos: checked })}
        />
        <Label htmlFor="nao-lidos" className="text-sm cursor-pointer">
          Apenas não lidos
        </Label>
      </div>

      {/* Botão limpar filtros */}
      {temFiltrosAtivos && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleLimparFiltros}
          className="h-9"
        >
          <X className="mr-2 h-4 w-4" />
          Limpar filtros
        </Button>
      )}

      {/* Botão Configurações */}
      <Button
        variant="secondary"
        size="sm"
        className="ml-auto h-9"
        asChild
      >
        <Link to="/kanbam/configuracoes">
          <Settings className="mr-2 h-4 w-4" />
          Configurações
        </Link>
      </Button>
    </div>
  );
};
