import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { SearchIcon, LogOutIcon, UserIcon, ShieldIcon } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { SearchPalette } from "@/components/layout/SearchPalette";
import { selectCurrentUser, selectIsAdmin } from "@/store/slices/authSlice";
import { useLogoutMutation } from "@/store/api/authApi";

export function Navbar() {
    const [searchOpen, setSearchOpen] = useState(false);
    const user = useSelector(selectCurrentUser);
    const isAdmin = useSelector(selectIsAdmin);
    const [logout] = useLogoutMutation();
    const navigate = useNavigate();

    useEffect(() => {
        const handleKeyDown = (event) => {
            if ((event.metaKey || event.ctrlKey) && event.key === "k") {
                event.preventDefault();
                setSearchOpen((open) => !open);
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, []);

    const initials = (user?.name || "U")
        .split(" ")
        .map((part) => part[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    return (
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-4">
            <SidebarTrigger />
            <Separator orientation="vertical" className="h-5" />

            <Button
                variant="outline"
                size="sm"
                className="ml-1 w-64 justify-start text-muted-foreground"
                onClick={() => setSearchOpen(true)}
            >
                <SearchIcon />
                Search DevAtlas...
                <kbd className="ml-auto rounded border border-border px-1.5 py-0.5 text-[10px]">Ctrl K</kbd>
            </Button>

            <div className="ml-auto flex items-center gap-2">
                <ThemeToggle />

                {user ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="rounded-full" />}>
                            <Avatar size="sm">
                                <AvatarImage src={user.avatarUrl} alt={user.name} />
                                <AvatarFallback>{initials}</AvatarFallback>
                            </Avatar>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel className="font-normal">
                                <p className="text-sm font-medium">{user.name}</p>
                                <p className="text-xs text-muted-foreground">{user.email}</p>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem render={<Link to="/profile" />}>
                                <UserIcon /> Profile
                            </DropdownMenuItem>
                            {isAdmin && (
                                <DropdownMenuItem render={<Link to="/admin" />}>
                                    <ShieldIcon /> Admin
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleLogout}>
                                <LogOutIcon /> Log out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ) : (
                    <Button size="sm" nativeButton={false} render={<Link to="/login" />}>
                        Log in
                    </Button>
                )}
            </div>

            <SearchPalette open={searchOpen} onOpenChange={setSearchOpen} />
        </header>
    );
}
