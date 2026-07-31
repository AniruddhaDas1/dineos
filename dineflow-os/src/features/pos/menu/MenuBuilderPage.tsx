import { useEffect, useState } from "react";
import { Plus, Edit3, Trash2, BookOpen } from "lucide-react";
import { services } from "@/services";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency } from "@/lib/format";
import type { MenuItem, Category } from "@/services/types";

export function MenuBuilderPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<MenuItem | null>(null);
  const [catFormOpen, setCatFormOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);

  async function refresh() {
    const [its, cats] = await Promise.all([services.menu.getMenuItems(), services.menu.getCategories()]);
    setItems(its);
    setCategories(cats);
    if (!selectedCat && cats.length > 0) setSelectedCat(cats[0].id);
  }

  useEffect(() => { refresh(); }, []);

  function openItemForm(item?: MenuItem) { setEditItem(item ?? null); setFormOpen(true); }
  function openCatForm(cat?: Category) { setEditCategory(cat ?? null); setCatFormOpen(true); }

  async function handleDeleteItem(id: string) { await services.menu.deleteItem(id); refresh(); }

  async function handleToggleAvailability(id: string, available: boolean) {
    await services.menu.updateItem(id, { available: !available });
    refresh();
  }

  const filtered = items.filter((it) => !selectedCat || it.categoryId === selectedCat);

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl">Menu Builder</h1>
          <p className="mt-1 text-sm text-muted">Manage categories, items, and availability.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => openCatForm()}>
            <BookOpen className="h-4 w-4" /> Add Category
          </Button>
          <Button className="gap-2" onClick={() => openItemForm()}>
            <Plus className="h-4 w-4" /> Add Item
          </Button>
        </div>
      </div>

      {/* Category tabs */}
      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCat(cat.id)}
            className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              selectedCat === cat.id ? "bg-accent text-accent-foreground" : "bg-surface text-muted hover:text-foreground"
            }`}
          >
            {cat.name}
            <button onClick={(e) => { e.stopPropagation(); openCatForm(cat); }} className="text-xs opacity-60 hover:opacity-100">
              <Edit3 className="h-3 w-3" />
            </button>
          </button>
        ))}
      </div>

      {/* Item list */}
      <div className="mt-4 space-y-2">
        {filtered.map((item) => (
          <div key={item.id} className={`flex items-center justify-between rounded-xl border p-4 transition-colors ${
            item.available ? "border-border bg-surface" : "border-border bg-surface opacity-50"
          }`}>
            <div className="flex items-center gap-3">
              {item.image && <img src={item.image} alt={item.name} className="h-12 w-12 rounded-lg object-cover" />}
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-xs text-muted">{item.description?.slice(0, 50)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-serif text-accent">{formatCurrency(item.price)}</span>
              <button
                onClick={() => handleToggleAvailability(item.id, item.available)}
                className={`relative h-6 w-11 rounded-full transition-colors ${item.available ? "bg-accent" : "bg-surface-2 border border-border"}`}
              >
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform shadow-sm ${
                  item.available ? "left-[22px]" : "left-[2px]"
                }`} />
              </button>
              <Button variant="ghost" size="sm" className="h-8 w-8" onClick={() => openItemForm(item)}>
                <Edit3 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 text-danger hover:text-danger" onClick={() => handleDeleteItem(item.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Category Form Dialog */}
      <Dialog open={catFormOpen} onOpenChange={setCatFormOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editCategory ? "Edit Category" : "Add Category"}</DialogTitle></DialogHeader>
          <CatFormContent
            category={editCategory ?? undefined}
            onSave={async (data) => {
              if (editCategory) await services.menu.updateCategory(editCategory.id, data);
              else await services.menu.createCategory(data);
              setCatFormOpen(false);
              refresh();
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Item Form Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editItem ? "Edit Item" : "Add Item"}</DialogTitle></DialogHeader>
          <ItemFormContent
            item={editItem ?? undefined}
            categories={categories}
            onSave={async (data) => {
              if (editItem) await services.menu.updateItem(editItem.id, data);
              else await services.menu.createItem(data);
              setFormOpen(false);
              refresh();
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CatFormContent({ category, onSave }: { category?: Category; onSave: (d: { name: string; displayOrder: number }) => void }) {
  const [name, setName] = useState(category?.name ?? "");
  const [order, setOrder] = useState(category?.displayOrder ?? 0);
  return (
    <>
      <div className="space-y-4">
        <div className="space-y-2"><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
        <div className="space-y-2"><Label>Display Order</Label><Input type="number" value={order} onChange={(e) => setOrder(parseInt(e.target.value) || 0)} /></div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => {}}>Cancel</Button>
        <Button onClick={() => onSave({ name, displayOrder: order })} disabled={!name.trim()}>Save</Button>
      </DialogFooter>
    </>
  );
}

function ItemFormContent({ item, categories, onSave }: { item?: MenuItem; categories: Category[]; onSave: (d: any) => void }) {
  const [name, setName] = useState(item?.name ?? "");
  const [description, setDescription] = useState(item?.description ?? "");
  const [price, setPrice] = useState(item?.price ?? 0);
  const [image, setImage] = useState(item?.image ?? "");
  const [categoryId, setCategoryId] = useState(item?.categoryId ?? "");
  const [vegType, setVegType] = useState<string>(item?.vegType ?? "non-veg");
  const [available, setAvailable] = useState(item?.available ?? true);
  return (
    <>
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2"><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div className="space-y-2"><Label>Price</Label><Input type="number" value={price} onChange={(e) => setPrice(parseInt(e.target.value) || 0)} /></div>
        </div>
        <div className="space-y-2"><Label>Description</Label><Input value={description} onChange={(e) => setDescription(e.target.value)} /></div>
        <div className="space-y-2"><Label>Image URL</Label><Input value={image} onChange={(e) => setImage(e.target.value)} /></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>{categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Veg Type</Label>
            <Select value={vegType} onValueChange={setVegType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="veg">Veg</SelectItem>
                <SelectItem value="non-veg">Non-Veg</SelectItem>
                <SelectItem value="egg">Egg</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Label>Available</Label>
          <button
            onClick={() => setAvailable(!available)}
            className={`relative h-6 w-11 rounded-full transition-colors ${available ? "bg-accent" : "bg-surface-2 border border-border"}`}
          >
            <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform shadow-sm ${available ? "left-[22px]" : "left-[2px]"}`} />
          </button>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => {}}>Cancel</Button>
        <Button onClick={() => onSave({ name, description, price, image, categoryId, vegType: vegType as "veg" | "non-veg" | "egg", available })} disabled={!name.trim()}>Save</Button>
      </DialogFooter>
    </>
  );
}
