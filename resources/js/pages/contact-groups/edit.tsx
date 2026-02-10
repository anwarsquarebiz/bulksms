import { Head, Link, useForm } from '@inertiajs/react';
import { ChevronLeft, Trash2 } from 'lucide-react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import contactGroups from '@/routes/contact-groups';
import type { BreadcrumbItem } from '@/types';

type Group = {
    id: number;
    name: string;
    description?: string | null;
};

type Props = {
    group: Group;
};

export default function ContactGroupsEdit({ group }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Contact groups',
            href: contactGroups.index().url,
        },
        {
            title: group.name,
            href: contactGroups.edit(group.id).url,
        },
    ];

    const { data, setData, put, delete: destroy, processing, errors } = useForm({
        name: group.name,
        description: group.description ?? '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        put(contactGroups.update(group.id).url, {
            preserveScroll: true,
        });
    };

    const handleDelete = () => {
        if (!confirm('Are you sure you want to delete this group?')) {
            return;
        }

        destroy(contactGroups.destroy(group.id).url);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={group.name} />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center justify-between gap-2">
                    <Button asChild variant="ghost" size="sm" className="-ml-2">
                        <Link href={contactGroups.index()}>
                            <ChevronLeft className="mr-1 size-4" />
                            Back
                        </Link>
                    </Button>

                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleDelete}
                    >
                        <Trash2 className="mr-1.5 size-4 text-destructive" />
                        Delete
                    </Button>
                </div>

                <Heading
                    title={group.name}
                    description="Update this contact group's name and description."
                />

                <Card className="max-w-xl">
                    <CardContent className="pt-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Group name</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                    required
                                    autoFocus
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">
                                    Description (optional)
                                </Label>
                                <textarea
                                    id="description"
                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={data.description}
                                    onChange={(e) =>
                                        setData('description', e.target.value)
                                    }
                                />
                                <InputError message={errors.description} />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2">
                                <Button
                                    type="submit"
                                    disabled={processing}
                                >
                                    Save changes
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}


