import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/PageHeader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { selectCurrentUser } from "@/store/slices/authSlice";
import { useUpdateMeMutation } from "@/store/api/userApi";

const EMPTY_FORM = { name: "", headline: "", bio: "", socialLinks: { github: "", linkedin: "", twitter: "", website: "" } };

export default function ProfilePage() {
    const user = useSelector(selectCurrentUser);
    const [updateMe, { isLoading }] = useUpdateMeMutation();
    const [form, setForm] = useState(EMPTY_FORM);

    useEffect(() => {
        if (user) {
            setForm({
                name: user.name || "",
                headline: user.headline || "",
                bio: user.bio || "",
                socialLinks: {
                    github: user.socialLinks?.github || "",
                    linkedin: user.socialLinks?.linkedin || "",
                    twitter: user.socialLinks?.twitter || "",
                    website: user.socialLinks?.website || "",
                },
            });
        }
    }, [user]);

    if (!user) return null;

    const initials = (user.name || "U").split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await updateMe(form).unwrap();
            toast.success("Profile updated");
        } catch (error) {
            toast.error(error.message || "Failed to update profile");
        }
    };

    return (
        <div className="max-w-lg">
            <PageHeader title="Profile" description="This is only visible to you for now." />

            <div className="mb-6 flex items-center gap-4">
                <Avatar size="lg">
                    <AvatarImage src={user.avatarUrl} alt={user.name} />
                    <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="text-sm font-medium">{user.email}</p>
                    <p className="text-xs capitalize text-muted-foreground">{user.role}</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="headline">Headline</Label>
                    <Input
                        id="headline"
                        placeholder="e.g. Backend Engineer · Node · Distributed Systems"
                        value={form.headline}
                        onChange={(e) => setForm({ ...form, headline: e.target.value })}
                    />
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea id="bio" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    {["github", "linkedin", "twitter", "website"].map((key) => (
                        <div key={key} className="space-y-1.5">
                            <Label htmlFor={key} className="capitalize">{key}</Label>
                            <Input
                                id={key}
                                value={form.socialLinks[key]}
                                onChange={(e) =>
                                    setForm({ ...form, socialLinks: { ...form.socialLinks, [key]: e.target.value } })
                                }
                            />
                        </div>
                    ))}
                </div>

                <Button type="submit" disabled={isLoading}>
                    Save changes
                </Button>
            </form>
        </div>
    );
}
