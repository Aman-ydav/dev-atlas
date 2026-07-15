import { NavLink, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import {
    HomeIcon,
    CompassIcon,
    DumbbellIcon,
    FolderKanbanIcon,
    MessageSquareTextIcon,
    LibraryIcon,
    RotateCcwIcon,
    BookmarkIcon,
    ShieldIcon,
} from "lucide-react";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuBadge,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { selectCurrentUser, selectIsAdmin } from "@/store/slices/authSlice";
import { useGetDueForRevisionQuery } from "@/store/api/progressApi";

const PRIMARY_NAV = [
    { to: "/dashboard", label: "Home", icon: HomeIcon, end: true },
    { to: "/explore", label: "Explore", icon: CompassIcon },
    { to: "/practice", label: "Practice", icon: DumbbellIcon },
    { to: "/projects", label: "Projects", icon: FolderKanbanIcon },
    { to: "/interview", label: "Interview", icon: MessageSquareTextIcon },
    { to: "/resources", label: "Resources", icon: LibraryIcon },
];

const PERSONAL_NAV = [
    { to: "/revision", label: "Revision", icon: RotateCcwIcon },
    { to: "/bookmarks", label: "Bookmarks", icon: BookmarkIcon },
];

export function AppSidebar() {
    const location = useLocation();
    const user = useSelector(selectCurrentUser);
    const isAdmin = useSelector(selectIsAdmin);
    const { data: dueRevisions } = useGetDueForRevisionQuery({ page: 1, limit: 1 }, { skip: !user });

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" render={<NavLink to="/dashboard" />}>
                            <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary text-xs font-semibold text-primary-foreground transition-all group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:rounded-lg group-data-[collapsible=icon]:text-sm">
                                DA
                            </span>
                            <span className="text-sm font-semibold">DevAtlas</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Learn</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {PRIMARY_NAV.map((item) => (
                                <SidebarMenuItem key={item.to}>
                                    <SidebarMenuButton
                                        tooltip={item.label}
                                        isActive={
                                            item.end
                                                ? location.pathname === item.to
                                                : location.pathname.startsWith(item.to)
                                        }
                                        render={<NavLink to={item.to} end={item.end} />}
                                    >
                                        <item.icon />
                                        <span>{item.label}</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {user && (
                    <SidebarGroup>
                        <SidebarGroupLabel>You</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {PERSONAL_NAV.map((item) => (
                                    <SidebarMenuItem key={item.to}>
                                        <SidebarMenuButton
                                            tooltip={item.label}
                                            isActive={location.pathname.startsWith(item.to)}
                                            render={<NavLink to={item.to} />}
                                        >
                                            <item.icon />
                                            <span>{item.label}</span>
                                        </SidebarMenuButton>
                                        {item.to === "/revision" && dueRevisions?.total > 0 && (
                                            <SidebarMenuBadge>{dueRevisions.total}</SidebarMenuBadge>
                                        )}
                                    </SidebarMenuItem>
                                ))}
                                {isAdmin && (
                                    <SidebarMenuItem>
                                        <SidebarMenuButton
                                            tooltip="Admin"
                                            isActive={location.pathname.startsWith("/admin")}
                                            render={<NavLink to="/admin" />}
                                        >
                                            <ShieldIcon />
                                            <span>Admin</span>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                )}
            </SidebarContent>

            <SidebarFooter />
        </Sidebar>
    );
}
