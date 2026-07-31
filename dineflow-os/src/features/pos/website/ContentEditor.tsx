import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { WebsiteContent } from "@/services/types";

interface ContentEditorProps {
  content: WebsiteContent;
  onChange: (content: WebsiteContent) => void;
}

export function ContentEditor({ content, onChange }: ContentEditorProps) {
  function patch(p: Partial<WebsiteContent>) {
    onChange({ ...content, ...p });
  }
  function patchContact(p: Partial<WebsiteContent["contact"]>) {
    onChange({ ...content, contact: { ...content.contact, ...p } });
  }
  function patchMenuItem(i: number, p: Partial<WebsiteContent["menuItems"][number]>) {
    const menuItems = content.menuItems.map((m, idx) => (idx === i ? { ...m, ...p } : m));
    onChange({ ...content, menuItems });
  }
  function addMenuItem() {
    onChange({
      ...content,
      menuItems: [...content.menuItems, { name: "", description: "", price: 0 }],
    });
  }
  function removeMenuItem(i: number) {
    onChange({ ...content, menuItems: content.menuItems.filter((_, idx) => idx !== i) });
  }
  function patchGallery(i: number, p: Partial<WebsiteContent["gallery"][number]>) {
    const gallery = content.gallery.map((g, idx) => (idx === i ? { ...g, ...p } : g));
    onChange({ ...content, gallery });
  }
  function addGallery() {
    onChange({
      ...content,
      gallery: [...content.gallery, { url: "", alt: "" }],
    });
  }
  function removeGallery(i: number) {
    onChange({ ...content, gallery: content.gallery.filter((_, idx) => idx !== i) });
  }
  function patchReview(i: number, p: Partial<WebsiteContent["reviews"][number]>) {
    const reviews = content.reviews.map((r, idx) => (idx === i ? { ...r, ...p } : r));
    onChange({ ...content, reviews });
  }
  function addReview() {
    onChange({
      ...content,
      reviews: [...content.reviews, { name: "", date: new Date().toISOString().slice(0, 10), rating: 5, text: "" }],
    });
  }
  function removeReview(i: number) {
    onChange({ ...content, reviews: content.reviews.filter((_, idx) => idx !== i) });
  }
  function patchHours(i: number, p: Partial<WebsiteContent["hours"][number]>) {
    const hours = content.hours.map((h, idx) => (idx === i ? { ...h, ...p } : h));
    onChange({ ...content, hours });
  }
  function addHours() {
    onChange({ ...content, hours: [...content.hours, { day: "", time: "" }] });
  }
  function removeHours(i: number) {
    onChange({ ...content, hours: content.hours.filter((_, idx) => idx !== i) });
  }
  function patchSocial(i: number, p: Partial<WebsiteContent["social"][number]>) {
    const social = content.social.map((s, idx) => (idx === i ? { ...s, ...p } : s));
    onChange({ ...content, social });
  }
  function addSocial() {
    onChange({ ...content, social: [...content.social, { platform: "", url: "#" }] });
  }
  function removeSocial(i: number) {
    onChange({ ...content, social: content.social.filter((_, idx) => idx !== i) });
  }

  return (
    <div className="space-y-8">
      {/* Basic */}
      <div className="space-y-4">
        <h3 className="font-serif text-xl">Basic Info</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Restaurant Name</Label>
            <Input value={content.name} onChange={(e) => patch({ name: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Tagline</Label>
            <Input value={content.tagline} onChange={(e) => patch({ tagline: e.target.value })} />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea value={content.description} onChange={(e) => patch({ description: e.target.value })} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Hero Image URL</Label>
            <Input value={content.heroImage} onChange={(e) => patch({ heroImage: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Story Image URL</Label>
            <Input value={content.storyImage ?? ""} onChange={(e) => patch({ storyImage: e.target.value })} />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Story (separate paragraphs with a blank line)</Label>
          <Textarea rows={4} value={content.story} onChange={(e) => patch({ story: e.target.value })} />
        </div>
      </div>

      <Separator />

      {/* Menu Items */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-xl">Menu Items</h3>
          <Button size="sm" variant="outline" className="gap-1" onClick={addMenuItem}>
            <Plus className="h-3 w-3" /> Add
          </Button>
        </div>
        {content.menuItems.map((m, i) => (
          <div key={i} className="rounded-lg border border-border bg-surface-2 p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest text-muted">Item {i + 1}</span>
              <Button size="sm" variant="ghost" className="h-7 w-7 text-danger hover:text-danger" onClick={() => removeMenuItem(i)}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <Input placeholder="Name" value={m.name} onChange={(e) => patchMenuItem(i, { name: e.target.value })} />
              <Input placeholder="Badge (optional)" value={m.badge ?? ""} onChange={(e) => patchMenuItem(i, { badge: e.target.value })} />
              <Input placeholder="Description" value={m.description} onChange={(e) => patchMenuItem(i, { description: e.target.value })} />
              <Input type="number" placeholder="Price" value={m.price} onChange={(e) => patchMenuItem(i, { price: parseInt(e.target.value) || 0 })} />
              <Input className="sm:col-span-2" placeholder="Image URL" value={m.image ?? ""} onChange={(e) => patchMenuItem(i, { image: e.target.value })} />
            </div>
          </div>
        ))}
      </div>

      <Separator />

      {/* Gallery */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-xl">Gallery</h3>
          <Button size="sm" variant="outline" className="gap-1" onClick={addGallery}>
            <Plus className="h-3 w-3" /> Add
          </Button>
        </div>
        {content.gallery.map((g, i) => (
          <div key={i} className="flex items-center gap-2 rounded-lg border border-border bg-surface-2 p-2">
            <div className="flex-1 space-y-1">
              <Input placeholder="Image URL" value={g.url} onChange={(e) => patchGallery(i, { url: e.target.value })} />
              <Input placeholder="Alt text" value={g.alt} onChange={(e) => patchGallery(i, { alt: e.target.value })} />
            </div>
            <Button size="sm" variant="ghost" className="h-9 w-9 text-danger hover:text-danger" onClick={() => removeGallery(i)}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>

      <Separator />

      {/* Reviews */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-xl">Reviews</h3>
          <Button size="sm" variant="outline" className="gap-1" onClick={addReview}>
            <Plus className="h-3 w-3" /> Add
          </Button>
        </div>
        {content.reviews.map((r, i) => (
          <div key={i} className="rounded-lg border border-border bg-surface-2 p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest text-muted">Review {i + 1}</span>
              <Button size="sm" variant="ghost" className="h-7 w-7 text-danger hover:text-danger" onClick={() => removeReview(i)}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              <Input placeholder="Name" value={r.name} onChange={(e) => patchReview(i, { name: e.target.value })} />
              <Input type="date" value={r.date} onChange={(e) => patchReview(i, { date: e.target.value })} />
              <Input type="number" min={1} max={5} placeholder="Rating" value={r.rating} onChange={(e) => patchReview(i, { rating: parseInt(e.target.value) || 0 })} />
              <Textarea className="sm:col-span-3" placeholder="Review text" value={r.text} onChange={(e) => patchReview(i, { text: e.target.value })} />
            </div>
          </div>
        ))}
      </div>

      <Separator />

      {/* Contact + Hours + Social */}
      <div className="space-y-4">
        <h3 className="font-serif text-xl">Contact, Hours & Social</h3>
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label>Address</Label>
            <Input value={content.contact.address} onChange={(e) => patchContact({ address: e.target.value })} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={content.contact.phone} onChange={(e) => patchContact({ phone: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={content.contact.email} onChange={(e) => patchContact({ email: e.target.value })} />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Hours</Label>
            <Button size="sm" variant="outline" className="gap-1" onClick={addHours}>
              <Plus className="h-3 w-3" /> Add
            </Button>
          </div>
          {content.hours.map((h, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input placeholder="Days" value={h.day} onChange={(e) => patchHours(i, { day: e.target.value })} />
              <Input placeholder="Time" value={h.time} onChange={(e) => patchHours(i, { time: e.target.value })} />
              <Button size="sm" variant="ghost" className="h-9 w-9 text-danger hover:text-danger" onClick={() => removeHours(i)}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Social Links</Label>
            <Button size="sm" variant="outline" className="gap-1" onClick={addSocial}>
              <Plus className="h-3 w-3" /> Add
            </Button>
          </div>
          {content.social.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input placeholder="Platform" value={s.platform} onChange={(e) => patchSocial(i, { platform: e.target.value })} />
              <Input placeholder="URL" value={s.url} onChange={(e) => patchSocial(i, { url: e.target.value })} />
              <Button size="sm" variant="ghost" className="h-9 w-9 text-danger hover:text-danger" onClick={() => removeSocial(i)}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
