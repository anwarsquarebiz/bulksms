import { Head, Link, useForm } from '@inertiajs/react';
import { ChevronLeft, Info, UploadCloud } from 'lucide-react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import contacts from '@/routes/contacts';
import type { BreadcrumbItem } from '@/types';

type ContactGroup = {
    id: number;
    name: string;
};

type Props = {
    groups: ContactGroup[];
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Contacts',
        href: contacts.index().url,
    },
    {
        title: 'Import',
        href: contacts.import().url,
    },
];

export default function ContactsImport({ groups }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        file: null as File | null,
        status: '' as '' | 'active' | 'inactive',
        group_ids: [] as number[],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        post(contacts.import().url, {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Import contacts" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center gap-2">
                    <Button asChild variant="ghost" size="sm" className="-ml-2">
                        <Link href={contacts.index()}>
                            <ChevronLeft className="mr-1 size-4" />
                            Back
                        </Link>
                    </Button>
                </div>

                <Heading
                    title="Import contacts"
                    description="Upload a CSV file to bulk-create or update contacts."
                />

                <Card className="max-w-3xl">
                    <CardHeader>
                        <CardTitle className="text-base font-medium">
                            CSV file & options
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <Alert>
                            <Info className="size-4" />
                            <AlertTitle>Expected CSV format</AlertTitle>
                            <AlertDescription className="mt-1 text-xs">
                                The first row must be a header with:
                                <code className="mx-1 rounded bg-muted px-1 py-0.5">
                                    name
                                </code>
                                <code className="mx-1 rounded bg-muted px-1 py-0.5">
                                    phone_number
                                </code>
                                <code className="mx-1 rounded bg-muted px-1 py-0.5">
                                    email
                                </code>
                                <code className="mx-1 rounded bg-muted px-1 py-0.5">
                                    tags
                                </code>
                                <code className="mx-1 rounded bg-muted px-1 py-0.5">
                                    status
                                </code>
                                . Tags should be a comma-separated list. Contacts
                                are matched and updated by
                                <span className="font-medium"> phone_number</span>.
                            </AlertDescription>
                        </Alert>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="file">CSV file</Label>
                                <Input
                                    id="file"
                                    type="file"
                                    accept=".csv,text/csv"
                                    onChange={(e) =>
                                        setData(
                                            'file',
                                            e.target.files?.[0] ?? null,
                                        )
                                    }
                                />
                                <InputError message={errors.file} />
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="status">
                                        Default status (optional)
                                    </Label>
                                    <select
                                        id="status"
                                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={data.status}
                                        onChange={(e) =>
                                            setData(
                                                'status',
                                                e.target.value as
                                                    | ''
                                                    | 'active'
                                                    | 'inactive',
                                            )
                                        }
                                    >
                                        <option value="">Use CSV status</option>
                                        <option value="active">Force Active</option>
                                        <option value="inactive">
                                            Force Inactive
                                        </option>
                                    </select>
                                    <InputError message={errors.status} />
                                </div>

                                <div className="space-y-2">
                                    <Label>Add to groups</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {groups.map((group) => {
                                            const checked =
                                                data.group_ids.includes(group.id);

                                            return (
                                                <button
                                                    key={group.id}
                                                    type="button"
                                                    onClick={() => {
                                                        setData(
                                                            'group_ids',
                                                            checked
                                                                ? data.group_ids.filter(
                                                                      (id) =>
                                                                          id !==
                                                                          group.id,
                                                                  )
                                                                : [
                                                                      ...data.group_ids,
                                                                      group.id,
                                                                  ],
                                                        );
                                                    }}
                                                    className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                                                        checked
                                                            ? 'border-primary bg-primary text-primary-foreground'
                                                            : 'border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground'
                                                    }`}
                                                >
                                                    {group.name}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <InputError
                                        message={errors.group_ids as string}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2">
                                <Button
                                    type="submit"
                                    disabled={processing}
                                >
                                    <UploadCloud className="mr-2 size-4" />
                                    Import contacts
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}


