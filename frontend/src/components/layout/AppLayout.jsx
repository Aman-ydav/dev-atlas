import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Navbar } from "@/components/layout/Navbar";

export function AppLayout() {
    return (
        // h-svh (not just SidebarProvider's default min-h-svh) caps the layout
        // to the viewport so the inner <main> is the only thing that scrolls —
        // otherwise the whole page (navbar included) scrolls as one block.
        <SidebarProvider className="h-svh">
            <AppSidebar />
            <SidebarInset className="h-svh overflow-hidden">
                <Navbar />
                {/* min-h-0 lets a flex child actually shrink to fit and scroll,
                    instead of growing to its content size and pushing everything else. */}
                <main className="min-h-0 flex-1 overflow-y-auto">
                    <div className="mx-auto w-full max-w-5xl px-6 py-8">
                        <Outlet />
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
