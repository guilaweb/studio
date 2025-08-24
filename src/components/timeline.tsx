
"use client";

import React from "react";
import Image from "next/image";
import { PointOfInterest, PointOfInterestUpdate, statusLabelMap } from "@/lib/data";
import { MessageSquarePlus, Wand2, Camera, CheckCircle, FileText, Check, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { formatDistanceToNow } from 'date-fns';
import { pt } from 'date-fns/locale';
import { generateOfficialResponse } from "@/ai/flows/generate-official-response-flow";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const TimelineItem = ({ update, isFirst }: { update: PointOfInterestUpdate, isFirst: boolean }) => {
    let icon = <MessageSquare className="h-4 w-4 text-muted-foreground" />;
    let title = `Comentário de ${update.authorDisplayName || 'um utilizador'}`;

    if (isFirst) {
        icon = <FileText className="h-4 w-4 text-muted-foreground" />;
        title = `Reportado por ${update.authorDisplayName || 'um cidadão'}`;
    } else if (update.text?.startsWith('**AUTO DE VISTORIA**')) {
        icon = <Check className="h-4 w-4 text-blue-500" />;
        title = `Vistoria por ${update.authorDisplayName || 'um fiscal'}`;
    } else if (update.text?.startsWith('**PARECER')) {
        icon = <CheckCircle className="h-4 w-4 text-green-500" />;
        title = `Parecer de ${update.authorDisplayName || 'um técnico'}`;
    }


     return (
        <div className="relative flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border bg-background z-10">
                {icon}
            </div>
            <div className="flex-1 pt-1">
                 <p className="font-semibold text-xs text-muted-foreground uppercase tracking-wider mb-2">
                    {title}
                </p>
                <p className="text-sm whitespace-pre-wrap">{update.text}</p>
                {update.photoDataUri && (
                    <div className="mt-2">
                        <a href={update.photoDataUri} target="_blank" rel="noopener noreferrer">
                            <Image src={update.photoDataUri} alt="Prova de execução ou foto do incidente" width={200} height={150} className="rounded-md object-cover" />
                        </a>
                    </div>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                    {formatDistanceToNow(new Date(update.timestamp), { addSuffix: true, locale: pt })}
                </p>
            </div>
        </div>
    )
}


const Timeline = ({
  poi,
  onAddUpdate,
}: {
  poi: PointOfInterest;
  onAddUpdate: (pointId: string, updateText: string, photoDataUri?: string) => void;
}) => {
  const [updateText, setUpdateText] = React.useState("");
  const [updatePhoto, setUpdatePhoto] = React.useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = React.useState<string | null>(null);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const { toast } = useToast();
  const { user, profile } = useAuth();

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUpdatePhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearForm = () => {
    setUpdateText("");
    setUpdatePhoto(null);
    setPhotoPreview(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateText.trim()) return;

    const processSubmit = (photoDataUri?: string) => {
      onAddUpdate(poi.id, updateText, photoDataUri);
      clearForm();
    };

    if (updatePhoto) {
      const reader = new FileReader();
      reader.onloadend = () => {
        processSubmit(reader.result as string);
      };
      reader.readAsDataURL(updatePhoto);
    } else {
      processSubmit();
    }
  };

  const handleGenerateResponse = async () => {
    const lastCitizenUpdate = poi.updates?.find(
      (u) => u.authorId !== user?.uid
    );
    if (!lastCitizenUpdate) {
      toast({
        variant: "destructive",
        title: "Não há contribuições para responder",
        description: "A IA só pode gerar respostas para contribuições de cidadãos.",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateOfficialResponse({
        citizenContribution: lastCitizenUpdate.text || "",
        projectName: poi.title || "",
      });
      setUpdateText(result.response);
    } catch (error) {
      console.error("Error generating AI response:", error);
      toast({
        variant: "destructive",
        title: "Erro ao gerar resposta",
        description:
          "Não foi possível gerar uma resposta com IA. Tente novamente.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const isManager =
    profile?.role === "Agente Municipal" || profile?.role === "Administrador";
  const canAddUpdate = user;

  const canGenerateAiResponse =
    isManager &&
    poi.type === "construction" &&
    poi.updates &&
    poi.updates.length > 0 &&
    poi.updates[0].authorId !== user?.uid;

  const sortedUpdates = React.useMemo(() => {
    if (!poi.updates) return [];
    return [...poi.updates].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }, [poi.updates]);

  return (
    <div className="mt-4">
      <Separator />
      <div className="py-4">
        <h3 className="font-semibold mb-4">Linha do Tempo e Comentários</h3>

        {canAddUpdate && (
          <form onSubmit={handleSubmit} className="mb-6 space-y-4">
            <Textarea
              placeholder={
                isManager
                  ? "Escreva uma resposta oficial ou adicione uma atualização sobre o progresso..."
                  : "Tem alguma dúvida? Deixe aqui o seu comentário..."
              }
              value={updateText}
              onChange={(e) => setUpdateText(e.target.value)}
            />
            <div>
              <Label htmlFor="update-photo" className="text-sm font-medium">
                <div className="flex items-center gap-2 cursor-pointer">
                  <Camera className="h-4 w-4" />
                  Anexar Fotografia (Opcional)
                </div>
              </Label>
              <Input
                id="update-photo"
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="mt-2 h-auto p-1"
              />
            </div>
            {photoPreview && (
              <Image
                src={photoPreview}
                alt="Pré-visualização da fotografia"
                width={200}
                height={150}
                className="rounded-md object-cover"
              />
            )}

            <div className="flex flex-wrap gap-2">
              <Button type="submit" size="sm" disabled={!updateText.trim()}>
                <MessageSquarePlus className="mr-2 h-4 w-4" />
                Adicionar Comentário
              </Button>
              {canGenerateAiResponse && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleGenerateResponse}
                  disabled={isGenerating}
                >
                  <Wand2 className="mr-2 h-4 w-4" />
                  {isGenerating ? "A gerar..." : "Gerar Resposta com IA"}
                </Button>
              )}
            </div>
          </form>
        )}

        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:bg-border before:-translate-x-px">
          {sortedUpdates.length > 0 ? (
            sortedUpdates.map((update, index) => (
                <TimelineItem key={update.id} update={update} isFirst={index === 0} />
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              Ainda não há comentários ou atualizações.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
