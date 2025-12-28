import { useState, useEffect } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { LeadTag } from "../types/Lead";
import { cn } from "@/lib/utils";

interface TagsSelectorProps {
  availableTags: LeadTag[];
  selectedTagIds: string[];
  onChange: (tagIds: string[]) => void;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
}

export const TagsSelector = ({
  availableTags,
  selectedTagIds,
  onChange,
  disabled = false,
  className,
  placeholder = "Selecionar tags...",
}: TagsSelectorProps) => {
  const [open, setOpen] = useState(false);

  const selectedTags = availableTags.filter((tag) =>
    selectedTagIds.includes(tag.id)
  );

  const toggleTag = (tagId: string) => {
    if (selectedTagIds.includes(tagId)) {
      onChange(selectedTagIds.filter((id) => id !== tagId));
    } else {
      onChange([...selectedTagIds, tagId]);
    }
  };

  const removeTag = (tagId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selectedTagIds.filter((id) => id !== tagId));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "h-10 w-full justify-between font-normal",
            !selectedTags.length && "text-muted-foreground",
            className
          )}
        >
          <div className="flex flex-wrap gap-1 overflow-hidden">
            {selectedTags.length === 0 ? (
              <span className="text-xs">{placeholder}</span>
            ) : (
              selectedTags.slice(0, 3).map((tag) => (
                <Badge
                  key={tag.id}
                  variant="secondary"
                  className={cn(
                    "text-[10px] px-1.5 py-0 h-5 text-white gap-0.5",
                    tag.color
                  )}
                >
                  {tag.name}
                  <X
                    className="h-3 w-3 cursor-pointer hover:opacity-70"
                    onClick={(e) => removeTag(tag.id, e)}
                  />
                </Badge>
              ))
            )}
            {selectedTags.length > 3 && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5">
                +{selectedTags.length - 3}
              </Badge>
            )}
          </div>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-2" align="start">
        {availableTags.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-4">
            Nenhuma tag disponível. Clique em "Gerenciar Tags" para criar.
          </p>
        ) : (
          <div className="space-y-1 max-h-[200px] overflow-y-auto">
            {availableTags.map((tag) => {
              const isSelected = selectedTagIds.includes(tag.id);
              return (
                <button
                  key={tag.id}
                  onClick={() => toggleTag(tag.id)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted",
                    isSelected && "bg-muted"
                  )}
                >
                  <span
                    className={cn("h-3 w-3 rounded-full", tag.color)}
                    aria-hidden="true"
                  />
                  <span className="flex-1 text-left">{tag.name}</span>
                  {isSelected && <Check className="h-4 w-4 text-primary" />}
                </button>
              );
            })}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

interface TagsBadgesProps {
  tags: LeadTag[];
  tagIds: string[];
  maxVisible?: number;
  size?: "sm" | "xs";
}

export const TagsBadges = ({
  tags,
  tagIds,
  maxVisible = 2,
  size = "xs",
}: TagsBadgesProps) => {
  const matchedTags = tags.filter((tag) => tagIds.includes(tag.id));

  if (matchedTags.length === 0) {
    return <span className="text-muted-foreground">-</span>;
  }

  return (
    <div className="flex flex-wrap gap-1">
      {matchedTags.slice(0, maxVisible).map((tag) => (
        <Badge
          key={tag.id}
          variant="secondary"
          className={cn(
            "text-white",
            tag.color,
            size === "xs" ? "text-[10px] px-1.5 py-0 h-5" : "text-xs px-2 py-0.5"
          )}
        >
          {tag.name}
        </Badge>
      ))}
      {matchedTags.length > maxVisible && (
        <Badge
          variant="secondary"
          className={cn(
            size === "xs" ? "text-[10px] px-1.5 py-0 h-5" : "text-xs px-2 py-0.5"
          )}
        >
          +{matchedTags.length - maxVisible}
        </Badge>
      )}
    </div>
  );
};
