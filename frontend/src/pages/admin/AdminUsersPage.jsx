import { useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/PageHeader";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { selectIsSuperAdmin } from "@/store/slices/authSlice";
import { useListUsersQuery, useUpdateUserRoleMutation, useUpdateUserStatusMutation } from "@/store/api/userApi";

const ROLE_BADGE_VARIANT = { super_admin: "default", admin: "secondary", user: "outline" };
const ROLE_LABEL = { super_admin: "Super Admin", admin: "Admin", user: "User" };

export default function AdminUsersPage() {
    const [q, setQ] = useState("");
    const { data } = useListUsersQuery({ q: q || undefined, limit: 50 });
    const [updateUserRole] = useUpdateUserRoleMutation();
    const [updateUserStatus] = useUpdateUserStatusMutation();
    // Only super_admin can promote/demote — admin has every other admin capability
    // (content, categories, DSA import, user activation) but not this one.
    const isSuperAdmin = useSelector(selectIsSuperAdmin);

    const handleRoleToggle = async (user) => {
        try {
            await updateUserRole({ id: user._id, role: user.role === "admin" ? "user" : "admin" }).unwrap();
        } catch (error) {
            toast.error(error.message || "Failed to update role");
        }
    };

    const handleStatusToggle = async (user) => {
        try {
            await updateUserStatus({ id: user._id, isActive: !user.isActive }).unwrap();
        } catch (error) {
            toast.error(error.message || "Failed to update status");
        }
    };

    return (
        <div>
            <PageHeader
                title="Users"
                description={
                    isSuperAdmin
                        ? "Promote trusted users to admin so they can author content too."
                        : "Admins can activate/deactivate accounts. Only a super admin can change roles."
                }
            />

            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or email..." className="mb-4 max-w-sm" />

            <div className="space-y-1">
                {data?.items?.map((user) => (
                    <div key={user._id} className="flex items-center gap-3 rounded-lg border border-border px-3 py-2">
                        <Avatar size="sm">
                            <AvatarImage src={user.avatarUrl} alt={user.name} />
                            <AvatarFallback>{user.name?.[0]}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">{user.name}</p>
                            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                        </div>
                        {!user.isActive && <Badge variant="destructive">deactivated</Badge>}
                        <Badge variant={ROLE_BADGE_VARIANT[user.role]}>{ROLE_LABEL[user.role]}</Badge>
                        {isSuperAdmin && user.role !== "super_admin" && (
                            <Button size="sm" variant="outline" onClick={() => handleRoleToggle(user)}>
                                {user.role === "admin" ? "Demote" : "Promote"}
                            </Button>
                        )}
                        <Button size="sm" variant="outline" onClick={() => handleStatusToggle(user)}>
                            {user.isActive ? "Deactivate" : "Activate"}
                        </Button>
                    </div>
                ))}
            </div>
        </div>
    );
}
