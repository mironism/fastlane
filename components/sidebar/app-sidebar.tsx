'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { LogOut, Home, Calendar, Waves, User } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export const navItems = [
  { href: '/admin', label: 'Home', icon: Home },
  { href: '/admin/orders', label: 'Bookings', icon: Calendar },
  { href: '/admin/menu', label: 'Activities', icon: Waves },
  { href: '/admin/profile', label: 'Profile', icon: User },
]

export function AppSidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth')
    router.refresh()
  }

  return (
    <Sidebar>
      <SidebarHeader className="flex flex-row h-16 items-center justify-start border-b p-4">
        <div className="text-lg font-semibold ml-2">FastLane</div>
      </SidebarHeader>
      <SidebarContent className="flex h-full flex-col p-4">
        <SidebarMenu className="flex-1">
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} passHref>
                <SidebarMenuButton className="cursor-pointer" isActive={pathname === item.href}>
                  <item.icon className="size-4" />
                  {item.label}
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="cursor-pointer" onClick={handleSignOut}>
              <LogOut className="size-4" />
              Log Out
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  )
}
