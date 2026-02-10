import { Head, Link, useForm } from '@inertiajs/react';
import { ChevronLeft, MessageSquare, Users } from 'lucide-react';
import { useState } from 'react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import sms from '@/routes/sms';
import type { BreadcrumbItem } from '@/types';

type SmsProvider = {
    id: number;
    name: string;
    display_name: string;
};

type ContactGroup = {
    id: number;
    name: string;
    contacts_count: number;
};

type Props = {
    providers: SmsProvider[];
    groups: ContactGroup[];
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'SMS',
        href: sms.index().url,
    },
    {
        title: 'Send SMS',
        href: sms.create().url,
    },
];

export default function SmsCreate({ providers, groups }: Props) {
    const [activeTab, setActiveTab] = useState<'single' | 'bulk'>('single');

    const singleForm = useForm({
        to: '',
        message: '',
        sender_id: '',
        is_unicode: false,
        provider_id: providers[0]?.id || '',
    });

    const bulkForm = useForm({
        message: '',
        sender_id: '',
        is_unicode: false,
        provider_id: providers[0]?.id || '',
        group_ids: [] as number[],
        phone_numbers: '',
    });

    const handleSingleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        singleForm.post(sms.sendSingle().url, {
            preserveScroll: true,
        });
    };

    const handleBulkSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        bulkForm.post(sms.sendBulk().url, {
            preserveScroll: true,
        });
    };

    const toggleGroup = (groupId: number) => {
        const current = bulkForm.data.group_ids;
        bulkForm.setData(
            'group_ids',
            current.includes(groupId)
                ? current.filter((id) => id !== groupId)
                : [...current, groupId],
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Send SMS" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center gap-2">
                    <Button asChild variant="ghost" size="sm" className="-ml-2">
                        <Link href={sms.index()}>
                            <ChevronLeft className="mr-1 size-4" />
                            Back
                        </Link>
                    </Button>
                </div>

                <Heading
                    title="Send SMS"
                    description="Send a single SMS or bulk messages to multiple recipients."
                />

                <Card className="max-w-4xl">
                    <CardContent className="pt-6">
                        <Tabs
                            value={activeTab}
                            onValueChange={(v) =>
                                setActiveTab(v as 'single' | 'bulk')
                            }
                        >
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="single">
                                    <MessageSquare className="mr-2 size-4" />
                                    Single SMS
                                </TabsTrigger>
                                <TabsTrigger value="bulk">
                                    <Users className="mr-2 size-4" />
                                    Bulk SMS
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="single" className="space-y-6">
                                <form
                                    onSubmit={handleSingleSubmit}
                                    className="space-y-6"
                                >
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="single_to">
                                                Phone Number
                                            </Label>
                                            <Input
                                                id="single_to"
                                                type="tel"
                                                placeholder="+1234567890"
                                                value={singleForm.data.to}
                                                onChange={(e) =>
                                                    singleForm.setData(
                                                        'to',
                                                        e.target.value,
                                                    )
                                                }
                                                required
                                            />
                                            <InputError
                                                message={singleForm.errors.to}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="single_provider">
                                                Provider
                                            </Label>
                                            <Select
                                                value={singleForm.data.provider_id.toString()}
                                                onValueChange={(value) =>
                                                    singleForm.setData(
                                                        'provider_id',
                                                        parseInt(value),
                                                    )
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {providers.map(
                                                        (provider) => (
                                                            <SelectItem
                                                                key={
                                                                    provider.id
                                                                }
                                                                value={provider.id.toString()}
                                                            >
                                                                {
                                                                    provider.display_name
                                                                }
                                                            </SelectItem>
                                                        ),
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            <InputError
                                                message={
                                                    singleForm.errors.provider_id
                                                }
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="single_sender_id">
                                            Sender ID (optional)
                                        </Label>
                                        <Input
                                            id="single_sender_id"
                                            placeholder="YourBrand"
                                            maxLength={11}
                                            value={singleForm.data.sender_id}
                                            onChange={(e) =>
                                                singleForm.setData(
                                                    'sender_id',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Up to 11 alphanumeric characters
                                        </p>
                                        <InputError
                                            message={
                                                singleForm.errors.sender_id
                                            }
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="single_message">
                                            Message
                                        </Label>
                                        <Textarea
                                            id="single_message"
                                            placeholder="Enter your message here..."
                                            rows={6}
                                            value={singleForm.data.message}
                                            onChange={(e) =>
                                                singleForm.setData(
                                                    'message',
                                                    e.target.value,
                                                )
                                            }
                                            required
                                            maxLength={1600}
                                        />
                                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                                            <span>
                                                {singleForm.data.message.length}{' '}
                                                / 1600 characters
                                            </span>
                                            <label className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        singleForm.data.is_unicode
                                                    }
                                                    onChange={(e) =>
                                                        singleForm.setData(
                                                            'is_unicode',
                                                            e.target.checked,
                                                        )
                                                    }
                                                    className="rounded border-input"
                                                />
                                                Unicode support
                                            </label>
                                        </div>
                                        <InputError
                                            message={singleForm.errors.message}
                                        />
                                    </div>

                                    <div className="flex items-center justify-end gap-2 pt-2">
                                        <Button
                                            type="submit"
                                            disabled={singleForm.processing}
                                        >
                                            Send SMS
                                        </Button>
                                    </div>
                                </form>
                            </TabsContent>

                            <TabsContent value="bulk" className="space-y-6">
                                <form
                                    onSubmit={handleBulkSubmit}
                                    className="space-y-6"
                                >
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="bulk_provider">
                                                Provider
                                            </Label>
                                            <Select
                                                value={bulkForm.data.provider_id.toString()}
                                                onValueChange={(value) =>
                                                    bulkForm.setData(
                                                        'provider_id',
                                                        parseInt(value),
                                                    )
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {providers.map(
                                                        (provider) => (
                                                            <SelectItem
                                                                key={
                                                                    provider.id
                                                                }
                                                                value={provider.id.toString()}
                                                            >
                                                                {
                                                                    provider.display_name
                                                                }
                                                            </SelectItem>
                                                        ),
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            <InputError
                                                message={
                                                    bulkForm.errors.provider_id
                                                }
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="bulk_sender_id">
                                                Sender ID (optional)
                                            </Label>
                                            <Input
                                                id="bulk_sender_id"
                                                placeholder="YourBrand"
                                                maxLength={11}
                                                value={bulkForm.data.sender_id}
                                                onChange={(e) =>
                                                    bulkForm.setData(
                                                        'sender_id',
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Up to 11 alphanumeric characters
                                            </p>
                                            <InputError
                                                message={
                                                    bulkForm.errors.sender_id
                                                }
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Contact Groups</Label>
                                        <div className="flex flex-wrap gap-2">
                                            {groups.map((group) => {
                                                const isSelected =
                                                    bulkForm.data.group_ids.includes(
                                                        group.id,
                                                    );
                                                return (
                                                    <button
                                                        key={group.id}
                                                        type="button"
                                                        onClick={() =>
                                                            toggleGroup(
                                                                group.id,
                                                            )
                                                        }
                                                        className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                                                            isSelected
                                                                ? 'border-primary bg-primary text-primary-foreground'
                                                                : 'border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground'
                                                        }`}
                                                    >
                                                        {group.name} (
                                                        {group.contacts_count})
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        {groups.length === 0 && (
                                            <p className="text-xs text-muted-foreground">
                                                No contact groups available.
                                                Create groups first.
                                            </p>
                                        )}
                                        <InputError
                                            message={
                                                bulkForm.errors.group_ids as string
                                            }
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="bulk_phone_numbers">
                                            Manual Phone Numbers (optional)
                                        </Label>
                                        <Textarea
                                            id="bulk_phone_numbers"
                                            placeholder="Enter phone numbers, one per line:&#10;+1234567890&#10;+0987654321"
                                            rows={4}
                                            value={bulkForm.data.phone_numbers}
                                            onChange={(e) =>
                                                bulkForm.setData(
                                                    'phone_numbers',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            One phone number per line. Include
                                            country code (e.g., +1234567890)
                                        </p>
                                        <InputError
                                            message={
                                                bulkForm.errors.phone_numbers
                                            }
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="bulk_message">
                                            Message
                                        </Label>
                                        <Textarea
                                            id="bulk_message"
                                            placeholder="Enter your message here..."
                                            rows={6}
                                            value={bulkForm.data.message}
                                            onChange={(e) =>
                                                bulkForm.setData(
                                                    'message',
                                                    e.target.value,
                                                )
                                            }
                                            required
                                            maxLength={1600}
                                        />
                                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                                            <span>
                                                {bulkForm.data.message.length} /
                                                1600 characters
                                            </span>
                                            <label className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        bulkForm.data.is_unicode
                                                    }
                                                    onChange={(e) =>
                                                        bulkForm.setData(
                                                            'is_unicode',
                                                            e.target.checked,
                                                        )
                                                    }
                                                    className="rounded border-input"
                                                />
                                                Unicode support
                                            </label>
                                        </div>
                                        <InputError
                                            message={bulkForm.errors.message}
                                        />
                                    </div>

                                    <Alert>
                                        <AlertDescription className="text-xs">
                                            Bulk SMS will be sent to all active
                                            contacts in selected groups and any
                                            manually entered phone numbers.
                                        </AlertDescription>
                                    </Alert>

                                    <div className="flex items-center justify-end gap-2 pt-2">
                                        <Button
                                            type="submit"
                                            disabled={bulkForm.processing}
                                        >
                                            Send Bulk SMS
                                        </Button>
                                    </div>
                                </form>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

