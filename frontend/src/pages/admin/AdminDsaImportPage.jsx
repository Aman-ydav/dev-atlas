import { useState } from "react";
import { toast } from "sonner";
import { UploadIcon } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useImportDsaCsvMutation } from "@/store/api/knowledgeApi";

export default function AdminDsaImportPage() {
    const [file, setFile] = useState(null);
    const [importDsaCsv, { isLoading, data: report }] = useImportDsaCsvMutation();

    const handleImport = async () => {
        if (!file) return;
        try {
            await importDsaCsv(file).unwrap();
            toast.success("Import finished");
        } catch (error) {
            toast.error(error.message || "Import failed");
        }
    };

    return (
        <div className="max-w-xl">
            <PageHeader
                title="DSA CSV Import"
                description="Bulk-create DSA cards as drafts. Columns: title, category, difficulty, pattern, tags, companies, externalUrl, constraints, approach."
            />

            <div className="mb-4 rounded-lg border border-dashed border-border p-6 text-center">
                <input
                    type="file"
                    accept=".csv"
                    id="dsa-csv"
                    className="hidden"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
                <label htmlFor="dsa-csv" className="flex cursor-pointer flex-col items-center gap-2 text-muted-foreground">
                    <UploadIcon className="size-6" />
                    <span className="text-sm">{file ? file.name : "Choose a CSV file"}</span>
                </label>
            </div>

            <Button onClick={handleImport} disabled={!file || isLoading}>
                {isLoading ? "Importing..." : "Import"}
            </Button>

            {report && (
                <div className="mt-6 space-y-3">
                    <div className="flex gap-2 text-sm">
                        <Badge variant="secondary">{report.created} created</Badge>
                        <Badge variant="outline">{report.skipped} skipped</Badge>
                    </div>
                    {report.errors?.length > 0 && (
                        <div className="space-y-1 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-xs">
                            {report.errors.map((err, i) => (
                                <p key={i} className="text-destructive">
                                    Row {err.row}: {err.reason}
                                </p>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <p className="mt-6 text-xs text-muted-foreground">
                Imported cards land as drafts under the DSA type — review and publish them from{" "}
                <span className="font-medium">Admin → Overview</span>.
            </p>
        </div>
    );
}
