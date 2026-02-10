import { Head, Link, usePage } from '@inertiajs/react';
import { Plus, UploadCloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import contacts from '@/routes/contacts';
import type { BreadcrumbItem, SharedData } from '@/types';

type ContactGroup = {
    id: number;
    name: string;
};

type Contact = {
    id: number;
    name: string;
    phone_number: string;
    email?: string | null;
    tags?: string[] | null;
    status: 'active' | 'inactive';
    groups: ContactGroup[];
};

type ContactsPageProps = {
    contacts: {
        data: Contact[];
    };
    groups: ContactGroup[];
    filters: {
        search?: string;
    };
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Contacts',
        href: contacts.index().url,
    },
];

export default function ContactsIndex(props: ContactsPageProps) {
    const { auth } = usePage<SharedData>().props;
    const { contacts: contactPaginator, filters } = props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Contacts" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Contacts
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Manage contacts and organize them into groups for your
                            campaigns.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <Button asChild variant="outline" size="sm">
                            <Link href={contacts.import().url}>
                                <UploadCloud className="mr-2 size-4" />
                                Import CSV
                            </Link>
                        </Button>
                        <Button asChild size="sm">
                            <Link href={contacts.create().url}>
                                <Plus className="mr-2 size-4" />
                                New contact
                            </Link>
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <CardTitle className="text-base font-medium">
                            All contacts
                        </CardTitle>
                        <form
                            method="get"
                            action={contacts.index().url}
                            className="flex w-full gap-2 md:w-auto"
                        >
                            <Input
                                name="search"
                                defaultValue={filters.search}
                                placeholder="Search by name, phone, or email"
                                className="w-full md:w-72"
                            />
                        </form>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="hidden grid-cols-[2fr,2fr,2fr,1fr] gap-4 text-xs font-medium text-muted-foreground md:grid">
                            <span>Name &amp; email</span>
                            <span>Phone</span>
                            <span>Groups &amp; tags</span>
                            <span className="text-right">Status</span>
                        </div>

                        <div className="space-y-2">
                            {contactPaginator.data.map((contact) => (
                                <Link
                                    key={contact.id}
                                    href={contacts.edit(contact.id).url}
                                    className="block rounded-md border bg-background px-3 py-3 text-sm transition-colors hover:bg-accent/60"
                                >
                                    <div className="grid gap-2 md:grid-cols-[2fr,2fr,2fr,1fr] md:items-center">
                                        <div>
                                            <div className="font-medium">
                                                {contact.name}
                                            </div>
                                            {contact.email && (
                                                <div className="text-xs text-muted-foreground">
                                                    {contact.email}
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-sm">
                                            {contact.phone_number}
                                        </div>
                                        <div className="flex flex-wrap gap-1 text-xs text-muted-foreground">
                                            {contact.groups.map((group) => (
                                                <Badge
                                                    key={group.id}
                                                    variant="outline"
                                                    className="text-xs"
                                                >
                                                    {group.name}
                                                </Badge>
                                            ))}
                                            {contact.tags?.map((tag) => (
                                                <Badge
                                                    key={tag}
                                                    variant="secondary"
                                                    className="text-xs"
                                                >
                                                    {tag}
                                                </Badge>
                                            ))}
                                        </div>
                                        <div className="flex justify-end">
                                            <Badge
                                                variant={
                                                    contact.status === 'active'
                                                        ? 'default'
                                                        : 'outline'
                                                }
                                                className="text-xs"
                                            >
                                                {contact.status === 'active'
                                                    ? 'Active'
                                                    : 'Inactive'}
                                            </Badge>
                                        </div>
                                    </div>
                                </Link>
                            ))}

                            {contactPaginator.data.length === 0 && (
                                <p className="py-6 text-center text-sm text-muted-foreground">
                                    No contacts found. Start by creating a new contact
                                    or importing from CSV.
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}


