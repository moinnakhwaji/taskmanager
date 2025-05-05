import React from 'react'
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from './__compoents/Asidebar'


const provider = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className='bg-black text-white '>
<SidebarProvider>
    <AppSidebar />
    <main className='w-full'>
      <SidebarTrigger />
      {children}
    </main>
  </SidebarProvider>
  </div>
  )
}

export default provider