import { AppSidebar } from "@/ui/components/shadcn/app-sidebar";
import { SiteHeader } from "@/ui/components/shadcn/site-header";
import { SidebarInset, SidebarProvider } from "@/ui/shadcn/sidebar";

export const iframeHeight = "800px";
export const description = "A sidebar with a header and a search form.";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="[--header-height:calc(--spacing(14))]">
      <SidebarProvider className="flex flex-col border-l">
        <SiteHeader />
        <div className="flex flex-1">
          <AppSidebar />
          <SidebarInset className="py-4 px-6 w-full overflow-hidden">
            {children}
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
}
