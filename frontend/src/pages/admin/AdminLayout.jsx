import { NavLink, Outlet } from "react-router-dom";
import { cn } from "@/lib/utils";

const TABS = [
    { to: "/admin", label: "Overview", end: true },
    { to: "/admin/knowledge/new", label: "New Card" },
    { to: "/admin/categories", label: "Categories" },
    { to: "/admin/companies", label: "Companies" },
    { to: "/admin/dsa-import", label: "DSA CSV Import" },
    { to: "/admin/users", label: "Users" },
];

export default function AdminLayout() {
    return (
        <div>
            <div className="mb-6 flex flex-wrap gap-1 border-b border-border">
                {TABS.map((tab) => (
                    <NavLink
                        key={tab.to}
                        to={tab.to}
                        end={tab.end}
                        className={({ isActive }) =>
                            cn(
                                "border-b-2 px-3 py-2 text-sm transition-colors",
                                isActive
                                    ? "border-foreground font-medium text-foreground"
                                    : "border-transparent text-muted-foreground hover:text-foreground"
                            )
                        }
                    >
                        {tab.label}
                    </NavLink>
                ))}
            </div>
            <Outlet />
        </div>
    );
}
