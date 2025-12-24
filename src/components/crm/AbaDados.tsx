import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ClientePotencial } from '@/types/crm';
import { Plus, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AbaDadosProps {
  cliente: ClientePotencial;
  onAdicionarTag: (tag: string) => void;
  onAtualizarObservacoes: (texto: string) => void;
}

export const AbaDados = ({ cliente, onAdicionarTag, onAtualizarObservacoes }: AbaDadosProps) => {
  const [novaTag, setNovaTag] = useState('');
  const [observacoes, setObservacoes] = useState(cliente.observacoes);
  const [editando, setEditando] = useState(false);
  const { toast } = useToast();
  
  const handleSalvarObservacoes = () => {
    onAtualizarObservacoes(observacoes);
    setEditando(false);
    toast({
      title: "Observações atualizadas",
      description: "As observações foram salvas com sucesso."
    });
  };
  
  const handleAdicionarTag = () => {
    if (novaTag.trim()) {
      onAdicionarTag(novaTag.trim());
      setNovaTag('');
      toast({
        title: "Tag adicionada",
        description: `A tag "${novaTag}" foi adicionada ao cliente.`
      });
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Seção Tags */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tags</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {cliente.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-sm">
                {tag}
              </Badge>
            ))}
          </div>
          
          <div className="flex gap-2">
            <Input
              placeholder="Nova tag..."
              value={novaTag}
              onChange={(e) => setNovaTag(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdicionarTag()}
            />
            <Button onClick={handleAdicionarTag}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Seção Observações */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Observações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={observacoes}
            onChange={(e) => {
              setObservacoes(e.target.value);
              setEditando(true);
            }}
            className="min-h-[150px]"
            placeholder="Adicione observações sobre o cliente..."
          />
          
          {editando && (
            <div className="flex gap-2">
              <Button onClick={handleSalvarObservacoes}>
                <Save className="mr-2 h-4 w-4" />
                Salvar observações
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setObservacoes(cliente.observacoes);
                  setEditando(false);
                }}
              >
                Cancelar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Seção Informações Adicionais */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Informações Adicionais</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground text-sm">Origem</Label>
              <p className="font-medium">{cliente.origem}</p>
            </div>
            <div>
              <Label className="text-muted-foreground text-sm">Data de criação</Label>
              <p className="font-medium">
                {format(new Date(cliente.dataCriacao), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </p>
            </div>
            <div>
              <Label className="text-muted-foreground text-sm">Última interação</Label>
              <p className="font-medium">
                {format(new Date(cliente.ultimaInteracao), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </p>
            </div>
            <div>
              <Label className="text-muted-foreground text-sm">Total de mensagens</Label>
              <p className="font-medium">{cliente.totalMensagens} mensagens</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
