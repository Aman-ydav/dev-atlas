import { useState } from "react";
import { toast } from "sonner";
import { TrashIcon } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useCreateCompanyMutation, useDeleteCompanyMutation, useGetCompaniesQuery } from "@/store/api/companyApi";

export default function AdminCompaniesPage() {
    const { data: companies } = useGetCompaniesQuery(undefined);
    const [createCompany, { isLoading }] = useCreateCompanyMutation();
    const [deleteCompany] = useDeleteCompanyMutation();
    const [name, setName] = useState("");

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await createCompany({ name }).unwrap();
            toast.success("Company added");
            setName("");
        } catch (error) {
            toast.error(error.message || "Failed to add company");
        }
    };

    return (
        <div className="max-w-md">
            <PageHeader title="Companies" description="Used to tag DSA and interview cards (e.g. 'asked at Google')." />

            <form onSubmit={handleCreate} className="mb-6 flex items-end gap-2">
                <div className="flex-1 space-y-1.5">
                    <Label>Company name</Label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <Button type="submit" disabled={isLoading}>Add</Button>
            </form>

            <div className="space-y-1">
                {companies?.map((c) => (
                    <div key={c._id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm">
                        <span>{c.name}</span>
                        <button onClick={() => deleteCompany(c._id)} aria-label="Delete">
                            <TrashIcon className="size-3.5 text-muted-foreground hover:text-destructive" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
