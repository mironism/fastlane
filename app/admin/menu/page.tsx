import { CategoryManager } from '@/components/menu/category-manager';
import { MenuItemManager } from '@/components/menu/menu-item-manager';

export default function ActivitiesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Activities Management</h1>
        <p className="text-muted-foreground">
          Manage your beach activities, categories, and pricing
        </p>
      </div>
      
      <div className="grid gap-6">
        <CategoryManager />
        <MenuItemManager />
      </div>
    </div>
  );
} 