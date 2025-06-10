import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { CategoryManager } from "@/components/menu/category-manager"
import { MenuItemManager } from "@/components/menu/menu-item-manager"

export default function MenuPage() {
  return (
    <Tabs defaultValue="items">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="items" className="cursor-pointer">Menu Items</TabsTrigger>
        <TabsTrigger value="categories" className="cursor-pointer">Categories</TabsTrigger>
      </TabsList>
      <TabsContent value="items" className="mt-4">
        <MenuItemManager />
      </TabsContent>
      <TabsContent value="categories" className="mt-4">
        <CategoryManager />
      </TabsContent>
    </Tabs>
  );
} 