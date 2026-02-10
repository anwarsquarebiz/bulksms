import { Head, Link, useForm } from '@inertiajs/react';
import { ChevronLeft, Trash2 } from 'lucide-react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import contacts from '@/routes/contacts';
import type { BreadcrumbItem } from '@/types';

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

type Props = {
    contact: Contact;
    groups: ContactGroup[];
};

export default function ContactsEdit({ contact, groups }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Contacts',
            href: contacts.index().url,
        },
        {
            title: contact.name,
            href: contacts.edit(contact.id).url,
        },
    ];

    const { data, setData, put, processing, delete: destroy, errors } = useForm({
        name: contact.name,
        phone_number: contact.phone_number,
        email: contact.email ?? '',
        status: contact.status,
        tags: (contact.tags ?? []).join(', '),
        group_ids: contact.groups.map((g) => g.id),
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const tagsArray =
            data.tags.trim().length > 0
                ? data.tags.split(',').map((tag) => tag.trim())
                : [];

        put(contacts.update(contact.id).url, {
            preserveScroll: true,
            data: {
                ...data,
                tags: tagsArray,
            },
        });
    };

    const handleDelete = () => {
        if (!confirm('Are you sure you want to delete this contact?')) {
            return;
        }

        destroy(contacts.destroy(contact.id).url);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={contact.name} />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center justify-between gap-2">
                    <Button asChild variant="ghost" size="sm" className="-ml-2">
                        <Link href={contacts.index()}>
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
                    title={contact.name}
                    description="Update contact details, status, and group membership."
                />

                <Card className="max-w-2xl">
                    <CardContent className="pt-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name</Label>
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
                                    <Label htmlFor="phone_number">
                                        Phone number
                                    </Label>
                                    <Input
                                        id="phone_number"
                                        value={data.phone_number}
                                        onChange={(e) =>
                                            setData('phone_number', e.target.value)
                                        }
                                        required
                                    />
                                    <InputError message={errors.phone_number} />
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="email">
                                        Email (optional)
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) =>
                                            setData('email', e.target.value)
                                        }
                                    />
                                    <InputError message={errors.email} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="status">Status</Label>
                                    <select
                                        id="status"
                                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={data.status}
                                        onChange={(e) =>
                                            setData('status', e.target.value)
                                        }
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                    <InputError message={errors.status} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="tags">
                                    Tags (comma separated)
                                </Label>
                                <Input
                                    id="tags"
                                    placeholder="vip, newsletter, promo"
                                    value={data.tags}
                                    onChange={(e) =>
                                        setData('tags', e.target.value)
                                    }
                                />
                                <InputError message={errors.tags as string} />
                            </div>

                            <div className="space-y-2">
                                <Label>Groups</Label>
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
                                <InputError message={errors.group_ids as string} />
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


