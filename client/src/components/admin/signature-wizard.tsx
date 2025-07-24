import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ColorPicker } from "@/components/ui/color-picker";
import { useToast } from "@/hooks/use-toast";
import { Check, ChevronsUpDown, CopyCheck, Edit, Image, LayoutTemplate, Loader2, Settings, Signature, Sparkles, User2 as User } from "lucide-react";

// Définition des types directement dans le composant en attendant que les imports fonctionnent
export interface SignatureWizardProps {
  initialHtml?: string;
  onSave: (html: string) => void;
  onClose: () => void;
  isOpen: boolean;
}

export function SignatureWizard({ initialHtml = "", onSave, onClose, isOpen }: SignatureWizardProps) {
  const { toast } = useToast();
  
  // Initialiser les informations à partir du HTML si disponible
  useEffect(() => {
    if (initialHtml && initialHtml.length > 0) {
      // On pourrait analyser le HTML pour récupérer les informations, mais pour simplifier
      // on ne fait rien ici pour l'instant
      console.log("HTML initial reçu", initialHtml.substring(0, 50));
    }
  }, [initialHtml]);

  // État pour les informations personnelles
  const [personalInfo, setPersonalInfo] = useState({
    name: "Votre Nom",
    title: "Votre titre",
    company: "Raccordement Électrique",
    email: "votre.email@raccordement.fr",
    phone: "+33 6 12 34 56 78",
    website: "www.raccordement.fr",
    address: "123 Rue du Raccordement, 75000 Paris",
  });

  // État pour les options de style
  const [style, setStyle] = useState({
    template: "modern",
    nameColor: "#1e40af",
    accentColor: "#3b82f6",
    fontSize: "medium",
    includeCompanyLogo: true,
    includeSocialLinks: true,
    includeAddress: true,
    dividerStyle: "solid",
  });

  // État pour les liens sociaux
  const [socialLinks, setSocialLinks] = useState({
    linkedin: "",
    twitter: "",
    facebook: "",
  });

  // Gestion du changement des informations personnelles
  const handlePersonalInfoChange = (key: string, value: string) => {
    setPersonalInfo({
      ...personalInfo,
      [key]: value,
    });
  };

  // Gestion du changement de style
  const handleStyleChange = (key: string, value: any) => {
    setStyle({
      ...style,
      [key]: value,
    });
  };

  // Gestion du changement des liens sociaux
  const handleSocialLinkChange = (key: string, value: string) => {
    setSocialLinks({
      ...socialLinks,
      [key]: value,
    });
  };

  // Fonction pour générer le HTML de la signature
  const generateSignatureHtml = () => {
    // Sélection du template et génération du HTML en fonction du style choisi
    const templates: Record<string, string> = {
      modern: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; color: #333;">
          <table cellpadding="0" cellspacing="0" style="width: 100%;">
            <tr>
              <td style="padding-bottom: 10px;">
                <div style="font-size: ${style.fontSize === "small" ? "18px" : style.fontSize === "medium" ? "20px" : "22px"}; font-weight: bold; color: ${style.nameColor};">${personalInfo.name}</div>
                <div style="font-size: ${style.fontSize === "small" ? "13px" : style.fontSize === "medium" ? "14px" : "15px"}; color: #666;">${personalInfo.title}${personalInfo.company ? ` | ${personalInfo.company}` : ""}</div>
              </td>
              ${style.includeCompanyLogo ? `
              <td style="text-align: right;">
                <img src="https://placehold.co/100x50?text=Logo" alt="${personalInfo.company} Logo" style="max-width: 100px; height: auto;" />
              </td>
              ` : ""}
            </tr>
            <tr>
              <td colspan="2">
                <div style="border-top: 1px ${style.dividerStyle} ${style.accentColor}; margin: 10px 0;"></div>
              </td>
            </tr>
            <tr>
              <td colspan="2">
                <table cellpadding="0" cellspacing="0" style="width: 100%; font-size: ${style.fontSize === "small" ? "12px" : style.fontSize === "medium" ? "13px" : "14px"};">
                  <tr>
                    <td style="padding-right: 15px;">
                      <a href="mailto:${personalInfo.email}" style="color: ${style.accentColor}; text-decoration: none;">${personalInfo.email}</a>
                    </td>
                    <td>
                      <a href="tel:${personalInfo.phone}" style="color: ${style.accentColor}; text-decoration: none;">${personalInfo.phone}</a>
                    </td>
                  </tr>
                  ${personalInfo.website ? `
                  <tr>
                    <td colspan="2" style="padding-top: 5px;">
                      <a href="https://${personalInfo.website}" style="color: ${style.accentColor}; text-decoration: none;">${personalInfo.website}</a>
                    </td>
                  </tr>
                  ` : ""}
                  ${style.includeAddress && personalInfo.address ? `
                  <tr>
                    <td colspan="2" style="padding-top: 5px; color: #666;">
                      ${personalInfo.address}
                    </td>
                  </tr>
                  ` : ""}
                </table>
              </td>
            </tr>
            ${style.includeSocialLinks && (socialLinks.linkedin || socialLinks.twitter || socialLinks.facebook) ? `
            <tr>
              <td colspan="2" style="padding-top: 10px;">
                <table cellpadding="0" cellspacing="0">
                  <tr>
                    ${socialLinks.linkedin ? `
                    <td style="padding-right: 10px;">
                      <a href="${socialLinks.linkedin}" style="color: ${style.accentColor}; text-decoration: none;">LinkedIn</a>
                    </td>
                    ` : ""}
                    ${socialLinks.twitter ? `
                    <td style="padding-right: 10px;">
                      <a href="${socialLinks.twitter}" style="color: ${style.accentColor}; text-decoration: none;">Twitter</a>
                    </td>
                    ` : ""}
                    ${socialLinks.facebook ? `
                    <td>
                      <a href="${socialLinks.facebook}" style="color: ${style.accentColor}; text-decoration: none;">Facebook</a>
                    </td>
                    ` : ""}
                  </tr>
                </table>
              </td>
            </tr>
            ` : ""}
          </table>
        </div>
      `,
      classic: `
        <div style="font-family: 'Times New Roman', Times, serif; max-width: 500px; color: #333;">
          <table cellpadding="0" cellspacing="0" style="width: 100%;">
            <tr>
              <td style="padding-bottom: 10px;">
                <div style="font-size: ${style.fontSize === "small" ? "18px" : style.fontSize === "medium" ? "20px" : "22px"}; font-weight: bold; color: ${style.nameColor};">${personalInfo.name}</div>
                <div style="font-size: ${style.fontSize === "small" ? "13px" : style.fontSize === "medium" ? "14px" : "15px"}; font-style: italic; color: #666;">${personalInfo.title}${personalInfo.company ? ` | ${personalInfo.company}` : ""}</div>
              </td>
            </tr>
            <tr>
              <td>
                <div style="border-top: 1px ${style.dividerStyle} ${style.accentColor}; margin: 10px 0;"></div>
              </td>
            </tr>
            <tr>
              <td>
                <table cellpadding="0" cellspacing="0" style="width: 100%; font-size: ${style.fontSize === "small" ? "12px" : style.fontSize === "medium" ? "13px" : "14px"};">
                  <tr>
                    <td width="70" style="color: #666;">Email:</td>
                    <td>
                      <a href="mailto:${personalInfo.email}" style="color: ${style.accentColor}; text-decoration: none;">${personalInfo.email}</a>
                    </td>
                  </tr>
                  <tr>
                    <td style="color: #666;">Téléphone:</td>
                    <td>
                      <a href="tel:${personalInfo.phone}" style="color: ${style.accentColor}; text-decoration: none;">${personalInfo.phone}</a>
                    </td>
                  </tr>
                  ${personalInfo.website ? `
                  <tr>
                    <td style="color: #666;">Site web:</td>
                    <td>
                      <a href="https://${personalInfo.website}" style="color: ${style.accentColor}; text-decoration: none;">${personalInfo.website}</a>
                    </td>
                  </tr>
                  ` : ""}
                  ${style.includeAddress && personalInfo.address ? `
                  <tr>
                    <td style="color: #666;">Adresse:</td>
                    <td style="color: #333;">
                      ${personalInfo.address}
                    </td>
                  </tr>
                  ` : ""}
                </table>
              </td>
            </tr>
            ${style.includeSocialLinks && (socialLinks.linkedin || socialLinks.twitter || socialLinks.facebook) ? `
            <tr>
              <td style="padding-top: 10px;">
                <div style="font-size: ${style.fontSize === "small" ? "11px" : style.fontSize === "medium" ? "12px" : "13px"}; color: #666;">
                  Retrouvez-moi sur: 
                  ${socialLinks.linkedin ? `<a href="${socialLinks.linkedin}" style="color: ${style.accentColor}; text-decoration: none;">LinkedIn</a>` : ""}
                  ${socialLinks.linkedin && (socialLinks.twitter || socialLinks.facebook) ? " | " : ""}
                  ${socialLinks.twitter ? `<a href="${socialLinks.twitter}" style="color: ${style.accentColor}; text-decoration: none;">Twitter</a>` : ""}
                  ${socialLinks.twitter && socialLinks.facebook ? " | " : ""}
                  ${socialLinks.facebook ? `<a href="${socialLinks.facebook}" style="color: ${style.accentColor}; text-decoration: none;">Facebook</a>` : ""}
                </div>
              </td>
            </tr>
            ` : ""}
          </table>
        </div>
      `,
      compact: `
        <div style="font-family: Helvetica, Arial, sans-serif; max-width: 400px; color: #333;">
          <table cellpadding="0" cellspacing="0" style="width: 100%;">
            <tr>
              <td>
                <span style="font-weight: bold; color: ${style.nameColor};">${personalInfo.name}</span>
                <span style="color: #666; margin-left: 10px; font-size: ${style.fontSize === "small" ? "12px" : style.fontSize === "medium" ? "13px" : "14px"};">${personalInfo.title}</span>
              </td>
            </tr>
            <tr>
              <td>
                <div style="margin: 5px 0; font-size: ${style.fontSize === "small" ? "12px" : style.fontSize === "medium" ? "13px" : "14px"}; color: #666;">
                  <a href="mailto:${personalInfo.email}" style="color: ${style.accentColor}; text-decoration: none;">${personalInfo.email}</a>
                  <span style="margin: 0 5px;">|</span>
                  <a href="tel:${personalInfo.phone}" style="color: ${style.accentColor}; text-decoration: none;">${personalInfo.phone}</a>
                  ${personalInfo.website ? `
                  <span style="margin: 0 5px;">|</span>
                  <a href="https://${personalInfo.website}" style="color: ${style.accentColor}; text-decoration: none;">${personalInfo.website}</a>
                  ` : ""}
                </div>
              </td>
            </tr>
            ${style.includeAddress && personalInfo.address ? `
            <tr>
              <td>
                <div style="font-size: ${style.fontSize === "small" ? "11px" : style.fontSize === "medium" ? "12px" : "13px"}; color: #777;">
                  ${personalInfo.address}
                </div>
              </td>
            </tr>
            ` : ""}
            ${style.includeSocialLinks && (socialLinks.linkedin || socialLinks.twitter || socialLinks.facebook) ? `
            <tr>
              <td style="padding-top: 5px;">
                <div style="font-size: ${style.fontSize === "small" ? "11px" : style.fontSize === "medium" ? "12px" : "13px"}; color: #777;">
                  ${socialLinks.linkedin ? `<a href="${socialLinks.linkedin}" style="color: ${style.accentColor}; text-decoration: none;">LinkedIn</a>` : ""}
                  ${socialLinks.linkedin && (socialLinks.twitter || socialLinks.facebook) ? " · " : ""}
                  ${socialLinks.twitter ? `<a href="${socialLinks.twitter}" style="color: ${style.accentColor}; text-decoration: none;">Twitter</a>` : ""}
                  ${socialLinks.twitter && socialLinks.facebook ? " · " : ""}
                  ${socialLinks.facebook ? `<a href="${socialLinks.facebook}" style="color: ${style.accentColor}; text-decoration: none;">Facebook</a>` : ""}
                </div>
              </td>
            </tr>
            ` : ""}
          </table>
        </div>
      `,
    };

    return templates[style.template] || templates.modern;
  };

  // Gérer la sauvegarde et la copie de la signature
  const handleSave = () => {
    const html = generateSignatureHtml();
    onSave(html);
    toast({
      title: "Signature enregistrée",
      description: "Votre signature a été enregistrée avec succès",
    });
  };

  const handleCopy = () => {
    const html = generateSignatureHtml();
    navigator.clipboard.writeText(html).then(
      () => {
        toast({
          title: "Copié dans le presse-papiers",
          description: "Le code HTML de la signature a été copié",
        });
      },
      (err) => {
        toast({
          title: "Erreur de copie",
          description: "Impossible de copier la signature dans le presse-papiers",
          variant: "destructive",
        });
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Signature className="h-5 w-5" />
            Assistant de signature
          </DialogTitle>
          <DialogDescription>
            Créez et personnalisez votre signature d'email professionnelle
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto py-4" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          <div className="space-y-6 overflow-y-auto pr-2">
            <Tabs defaultValue="personal">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="personal" className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>Informations</span>
                </TabsTrigger>
                <TabsTrigger value="style" className="flex items-center gap-1">
                  <LayoutTemplate className="h-4 w-4" />
                  <span>Style</span>
                </TabsTrigger>
                <TabsTrigger value="social" className="flex items-center gap-1">
                  <Image className="h-4 w-4" />
                  <span>Social</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="personal" className="space-y-4">
                <div className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nom complet</Label>
                      <Input
                        id="name"
                        value={personalInfo.name}
                        onChange={(e) => handlePersonalInfoChange("name", e.target.value)}
                        placeholder="Votre nom complet"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="title">Titre / Poste</Label>
                      <Input
                        id="title"
                        value={personalInfo.title}
                        onChange={(e) => handlePersonalInfoChange("title", e.target.value)}
                        placeholder="Votre titre ou poste"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company">Entreprise</Label>
                    <Input
                      id="company"
                      value={personalInfo.company}
                      onChange={(e) => handlePersonalInfoChange("company", e.target.value)}
                      placeholder="Nom de votre entreprise"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={personalInfo.email}
                        onChange={(e) => handlePersonalInfoChange("email", e.target.value)}
                        placeholder="votre.email@exemple.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Téléphone</Label>
                      <Input
                        id="phone"
                        value={personalInfo.phone}
                        onChange={(e) => handlePersonalInfoChange("phone", e.target.value)}
                        placeholder="+33 6 12 34 56 78"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website">Site web</Label>
                    <Input
                      id="website"
                      value={personalInfo.website}
                      onChange={(e) => handlePersonalInfoChange("website", e.target.value)}
                      placeholder="www.votresite.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Adresse</Label>
                    <Textarea
                      id="address"
                      value={personalInfo.address}
                      onChange={(e) => handlePersonalInfoChange("address", e.target.value)}
                      placeholder="Adresse de l'entreprise"
                      rows={2}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="style" className="space-y-4">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label>Modèle de signature</Label>
                    <Select
                      value={style.template}
                      onValueChange={(value) => handleStyleChange("template", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir un modèle" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="modern">Moderne</SelectItem>
                        <SelectItem value="classic">Classique</SelectItem>
                        <SelectItem value="compact">Compact</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Couleur du nom</Label>
                      <ColorPicker
                        value={style.nameColor}
                        onChange={(value) => handleStyleChange("nameColor", value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Couleur d'accent</Label>
                      <ColorPicker
                        value={style.accentColor}
                        onChange={(value) => handleStyleChange("accentColor", value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Taille de police</Label>
                    <Select
                      value={style.fontSize}
                      onValueChange={(value) => handleStyleChange("fontSize", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir une taille" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Petite</SelectItem>
                        <SelectItem value="medium">Moyenne</SelectItem>
                        <SelectItem value="large">Grande</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Style de séparateur</Label>
                    <Select
                      value={style.dividerStyle}
                      onValueChange={(value) => handleStyleChange("dividerStyle", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir un style" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="solid">Ligne pleine</SelectItem>
                        <SelectItem value="dashed">Ligne pointillée</SelectItem>
                        <SelectItem value="dotted">Ligne en pointillés</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between space-y-0 pt-2">
                    <Label htmlFor="company-logo">Inclure le logo</Label>
                    <Switch
                      id="company-logo"
                      checked={style.includeCompanyLogo}
                      onCheckedChange={(checked) => handleStyleChange("includeCompanyLogo", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between space-y-0">
                    <Label htmlFor="include-address">Inclure l'adresse</Label>
                    <Switch
                      id="include-address"
                      checked={style.includeAddress}
                      onCheckedChange={(checked) => handleStyleChange("includeAddress", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between space-y-0">
                    <Label htmlFor="social-links">Inclure les liens sociaux</Label>
                    <Switch
                      id="social-links"
                      checked={style.includeSocialLinks}
                      onCheckedChange={(checked) => handleStyleChange("includeSocialLinks", checked)}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="social" className="space-y-4">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="linkedin">LinkedIn</Label>
                    <Input
                      id="linkedin"
                      value={socialLinks.linkedin}
                      onChange={(e) => handleSocialLinkChange("linkedin", e.target.value)}
                      placeholder="https://www.linkedin.com/in/votre-profil"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="twitter">Twitter</Label>
                    <Input
                      id="twitter"
                      value={socialLinks.twitter}
                      onChange={(e) => handleSocialLinkChange("twitter", e.target.value)}
                      placeholder="https://twitter.com/votre-compte"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="facebook">Facebook</Label>
                    <Input
                      id="facebook"
                      value={socialLinks.facebook}
                      onChange={(e) => handleSocialLinkChange("facebook", e.target.value)}
                      placeholder="https://www.facebook.com/votre-page"
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="border rounded-lg p-4 overflow-y-auto bg-white">
            <div className="text-sm font-medium mb-4 text-muted-foreground flex items-center">
              <Sparkles className="h-4 w-4 mr-1" />
              Aperçu de la signature
            </div>
            <div
              className="signature-preview"
              dangerouslySetInnerHTML={{ __html: generateSignatureHtml() }}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button variant="outline" onClick={handleCopy}>
            <CopyCheck className="h-4 w-4 mr-2" />
            Copier le HTML
          </Button>
          <Button onClick={handleSave}>
            <Check className="h-4 w-4 mr-2" />
            Utiliser cette signature
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}