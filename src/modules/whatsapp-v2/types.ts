export type WhatsappInstanceStatus = "connected" | "disconnected" | "error" | "pending_qr";

export type WhatsappInstance = {
  id: string;
  name: string;
  provider: "zapi" | "evolution" | "meta" | "mock";
  phoneNumber?: string;
  status: WhatsappInstanceStatus;
  lastConnectionAt?: string;
  // Evolution API specific fields
  evolutionApiUrl?: string;
  evolutionApiKey?: string;
  evolutionInstanceName?: string;
};

export type WhatsappChatStatus =
  | "novo"
  | "em_atendimento"
  | "aguardando"
  | "convertido"
  | "perdido";

export type WhatsappChat = {
  id: string;
  instanceId: string;
  phoneNumber: string;
  leadName?: string;
  origin?: "Organico" | "Ads" | "Instagram" | "Indicacao";
  status: WhatsappChatStatus;
  assignedTo?: string;
  lastMessagePreview: string;
  lastMessageAt: string;
  unreadCount: number;
};

export type WhatsappMessageDirection = "inbound" | "outbound";

export type WhatsappMessageType = "text" | "image" | "audio" | "document" | "video";

export type WhatsappMessage = {
  id: string;
  chatId: string;
  direction: WhatsappMessageDirection;
  type: WhatsappMessageType;
  content: string;
  mediaUrl?: string;
  sentAt: string;
};

export type WhatsappTemplateType = "manual" | "automatic";

export type WhatsappTemplateTriggerType = "keyword" | "event";

export type WhatsappTemplate = {
  id: string;
  name: string;
  type: WhatsappTemplateType;
  trigger: WhatsappTemplateTriggerType;
  triggerValue: string;
  content: string;
  active: boolean;
};

// Evolution API configuration stored in database
export interface EvolutionInstanceConfig {
  id: string;
  name: string;
  evolutionApiUrl: string;
  evolutionApiKey: string;
  evolutionInstanceName: string;
  status: WhatsappInstanceStatus;
  phoneNumber?: string;
  createdAt: string;
  updatedAt: string;
}
