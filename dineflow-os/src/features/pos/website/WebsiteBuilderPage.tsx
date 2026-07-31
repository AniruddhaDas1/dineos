import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Save, ExternalLink } from "lucide-react";
import { useWebsiteStore } from "@/stores/website.store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TemplateGallery } from "./TemplateGallery";
import { ContentEditor } from "./ContentEditor";
import { ThemeEditor } from "./ThemeEditor";
import { SavedWebsites } from "./SavedWebsites";
import { applyWebsiteTheme, clearWebsiteTheme } from "@/lib/websiteTheme";
import { hslTripletToHex } from "@/lib/color";
import type { WebsiteConfig, WebsiteContent, WebsiteTheme } from "@/services/types";

type Draft = {
  id: string | null; // null = new (unsaved) draft
  label: string;
  templateId: string;
  content: WebsiteContent;
  theme: WebsiteTheme;
};

export function WebsiteBuilderPage() {
  const configs = useWebsiteStore((s) => s.configs);
  const activeId = useWebsiteStore((s) => s.activeId);
  const selectTemplate = useWebsiteStore((s) => s.selectTemplate);
  const createConfig = useWebsiteStore((s) => s.createConfig);
  const updateConfig = useWebsiteStore((s) => s.updateConfig);
  const deleteConfig = useWebsiteStore((s) => s.deleteConfig);
  const setActive = useWebsiteStore((s) => s.setActive);

  const [draft, setDraft] = useState<Draft | null>(null);
  const [tab, setTab] = useState("content");

  // Live preview the draft theme when editing
  useEffect(() => {
    if (draft) {
      applyWebsiteTheme(draft.theme);
    } else {
      clearWebsiteTheme();
    }
    return () => clearWebsiteTheme();
  }, [draft]);

  function handleSelectTemplate(templateId: string) {
    const cfg = selectTemplate(templateId);
    setDraft({
      id: null,
      label: cfg.label,
      templateId: cfg.templateId,
      content: cfg.content,
      theme: cfg.theme,
    });
    setTab("content");
  }

  function handleEdit(id: string) {
    const cfg = configs.find((c) => c.id === id);
    if (!cfg) return;
    setDraft({
      id: cfg.id,
      label: cfg.label,
      templateId: cfg.templateId,
      content: JSON.parse(JSON.stringify(cfg.content)),
      theme: { ...cfg.theme },
    });
    setTab("content");
  }

  function handleSave() {
    if (!draft) return;
    if (draft.id) {
      updateConfig(draft.id, {
        label: draft.label,
        content: draft.content,
        theme: draft.theme,
      });
    } else {
      const cfg: WebsiteConfig = createConfig({
        label: draft.label,
        templateId: draft.templateId,
        content: draft.content,
        theme: draft.theme,
      });
      setActive(cfg.id);
    }
    setDraft(null);
  }

  return (
    <div className="min-h-screen bg-background p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/pos/dashboard" className="text-muted hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="font-serif text-3xl">Website Builder</h1>
            <p className="text-sm text-muted">
              Build a landing page, customize content & colors, then set it live.
            </p>
          </div>
        </div>
        <Link to="/" target="_blank" className="flex items-center gap-1 text-sm text-accent hover:underline">
          View live site <ExternalLink className="h-3 w-3" />
        </Link>
      </div>

      {!draft ? (
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left: Saved configs */}
          <div className="lg:col-span-2">
            <h2 className="mb-4 font-serif text-xl">Choose a Template</h2>
            <TemplateGallery onSelect={handleSelectTemplate} />
          </div>
          {/* Right: Saved websites */}
          <div>
            <h2 className="mb-4 font-serif text-xl">Saved Websites</h2>
            <SavedWebsites
              configs={configs}
              activeId={activeId}
              onSetActive={setActive}
              onEdit={handleEdit}
              onDelete={deleteConfig}
            />
          </div>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          {/* Meta sidebar */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Website Label (internal)</Label>
              <Input value={draft.label} onChange={(e) => setDraft({ ...draft, label: e.target.value })} />
            </div>
            <div className="rounded-lg border border-border bg-surface p-4">
              <p className="text-xs text-muted">
                Template: {draft.templateId}
              </p>
              <div className="mt-2 flex items-center gap-2 text-sm">
                <span
                  className="h-5 w-5 rounded"
                  style={{ backgroundColor: hslTripletToHex(draft.theme.accent) }}
                />
                <span className="text-muted">Accent color preview</span>
              </div>
            </div>
            <Button className="w-full gap-2" onClick={handleSave}>
              <Save className="h-4 w-4" /> {draft.id ? "Save Changes" : "Save & Set Live"}
            </Button>
            <Button variant="outline" className="w-full" onClick={() => { setDraft(null); }}>
              Cancel
            </Button>
            <Button variant="ghost" className="w-full text-danger" onClick={() => { if (draft.id) deleteConfig(draft.id); setDraft(null); }}>
              Delete this website
            </Button>
          </div>

          {/* Editor */}
          <div>
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="theme">Colors</TabsTrigger>
              </TabsList>
              <TabsContent value="content">
                <ContentEditor
                  content={draft.content}
                  onChange={(content) => setDraft({ ...draft, content })}
                />
              </TabsContent>
              <TabsContent value="theme">
                <ThemeEditor theme={draft.theme} onChange={(theme) => setDraft({ ...draft, theme })} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      )}
    </div>
  );
}
