import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { ActiveOrders } from "@/components/orders/active-orders"
import { FulfilledOrders } from "@/components/orders/fulfilled-orders"

export default function OrdersPage() {
  return (
    <Tabs defaultValue="active-orders">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="active-orders">Active Orders</TabsTrigger>
        <TabsTrigger value="fulfilled-orders">Fulfilled Orders</TabsTrigger>
      </TabsList>
      <TabsContent value="active-orders" className="mt-4">
        <ActiveOrders />
      </TabsContent>
      <TabsContent value="fulfilled-orders" className="mt-4">
        <FulfilledOrders />
      </TabsContent>
    </Tabs>
  );
} 