import { Head, Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import contactGroups from '@/routes/contact-groups';
import type { BreadcrumbItem } from '@/types';

type Group = {
    id: number;
    name: string;
    description?: string | null;
    contacts_count: number;
};

type Props = {
    groups: {
        data: Group[];
    };
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Contact groups',
        href: contactGroups.index().url,
    },
];

export default function ContactGroupsIndex({ groups }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Contact groups" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Contact groups
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Create and manage groups to organize your contacts.
                        </p>
                    </div>

                    <Button asChild size="sm">
                        <Link href={contactGroups.create().url}>
                            <Plus className="mr-2 size-4" />
                            New group
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base font-medium">
                            All groups
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {groups.data.map((group) => (
                            <Link
                                key={group.id}
                                href={contactGroups.edit(group.id).url}
                                className="block rounded-md border bg-background px-3 py-3 text-sm transition-colors hover:bg-accent/60"
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <div className="font-medium">
                                            {group.name}
                                        </div>
                                        {group.description && (
                                            <p className="text-xs text-muted-foreground">
                                                {group.description}
                                            </p>
                                        )}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {group.contacts_count} contacts
                                    </div>
                                </div>
                            </Link>
                        ))}

                        {groups.data.length === 0 && (
                            <p className="py-6 text-center text-sm text-muted-foreground">
                                No groups yet. Create your first group to better
                                segment your audience.
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}


