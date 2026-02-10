import { Head, Link, useForm } from '@inertiajs/react';
import { ChevronLeft, Calendar } from 'lucide-react';
import { useState } from 'react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import campaigns from '@/routes/campaigns';
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

type SmsTemplate = {
    id: number;
    name: string;
    message: string;
};

type Props = {
    providers: SmsProvider[];
    groups: ContactGroup[];
    templates: SmsTemplate[];
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Campaigns',
        href: campaigns.index().url,
    },
    {
        title: 'New Campaign',
        href: campaigns.create().url,
    },
];

export default function CampaignsCreate({
    providers,
    groups,
    templates,
}: Props) {
    const [routingStrategy, setRoutingStrategy] = useState<
        'single' | 'distribute' | 'failover'
    >('single');
    const [selectedTemplate, setSelectedTemplate] = useState<number | null>(
        null,
    );

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        message: '',
        sender_id: '',
        is_unicode: false,
        template_id: null as number | null,
        routing_strategy: 'single' as 'single' | 'distribute' | 'failover',
        provider_id: providers[0]?.id || null,
        provider_distribution: {} as Record<string, number>,
        provider_failover_order: [] as number[],
        group_ids: [] as number[],
        scheduled_at: '',
    });

    const handleTemplateSelect = (templateId: string) => {
        const template = templates.find((t) => t.id === parseInt(templateId));
        if (template) {
            setSelectedTemplate(template.id);
            setData('template_id', template.id);
            setData('message', template.message);
        }
    };

    const handleRoutingStrategyChange = (
        strategy: 'single' | 'distribute' | 'failover',
    ) => {
        setRoutingStrategy(strategy);
        setData('routing_strategy', strategy);
    };

    const handleDistributionChange = (
        providerId: number,
        percentage: number,
    ) => {
        const distribution = { ...data.provider_distribution };
        distribution[providerId.toString()] = percentage;
        setData('provider_distribution', distribution);
    };

    const handleFailoverOrderChange = (order: number[]) => {
        setData('provider_failover_order', order);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(campaigns.store().url, {
            preserveScroll: true,
        });
    };

    const toggleGroup = (groupId: number) => {
        const current = data.group_ids;
        setData(
            'group_ids',
            current.includes(groupId)
                ? current.filter((id) => id !== groupId)
                : [...current, groupId],
        );
    };

    const totalDistribution = Object.values(
        data.provider_distribution,
    ).reduce((sum, p) => sum + p, 0);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="New Campaign" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center gap-2">
                    <Button asChild variant="ghost" size="sm" className="-ml-2">
                        <Link href={campaigns.index()}>
                            <ChevronLeft className="mr-1 size-4" />
                            Back
                        </Link>
                    </Button>
                </div>

                <Heading
                    title="New Campaign"
                    description="Create a new SMS campaign to send messages to contact groups."
                />

                <Card className="max-w-4xl">
                    <CardContent className="pt-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Campaign Name</Label>
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
                                    <Label htmlFor="template_id">
                                        Template (optional)
                                    </Label>
                                    <Select
                                        value={
                                            selectedTemplate?.toString() || ''
                                        }
                                        onValueChange={handleTemplateSelect}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a template" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {templates.map((template) => (
                                                <SelectItem
                                                    key={template.id}
                                                    value={template.id.toString()}
                                                >
                                                    {template.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError
                                        message={errors.template_id as string}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="message">Message</Label>
                                <Textarea
                                    id="message"
                                    placeholder="Enter your message here..."
                                    rows={6}
                                    value={data.message}
                                    onChange={(e) =>
                                        setData('message', e.target.value)
                                    }
                                    required
                                    maxLength={1600}
                                />
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span>
                                        {data.message.length} / 1600 characters
                                    </span>
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={data.is_unicode}
                                            onChange={(e) =>
                                                setData(
                                                    'is_unicode',
                                                    e.target.checked,
                                                )
                                            }
                                            className="rounded border-input"
                                        />
                                        Unicode support
                                    </label>
                                </div>
                                <InputError message={errors.message} />
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="sender_id">
                                        Sender ID (optional)
                                    </Label>
                                    <Input
                                        id="sender_id"
                                        placeholder="YourBrand"
                                        maxLength={11}
                                        value={data.sender_id}
                                        onChange={(e) =>
                                            setData(
                                                'sender_id',
                                                e.target.value,
                                            )
                                        }
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Up to 11 alphanumeric characters
                                    </p>
                                    <InputError
                                        message={errors.sender_id as string}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="scheduled_at">
                                        Schedule (optional)
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="scheduled_at"
                                            type="datetime-local"
                                            value={data.scheduled_at}
                                            onChange={(e) =>
                                                setData(
                                                    'scheduled_at',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                        <Calendar className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Leave empty to start immediately
                                    </p>
                                    <InputError
                                        message={
                                            errors.scheduled_at as string
                                        }
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Routing Strategy</Label>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleRoutingStrategyChange('single')
                                        }
                                        className={`rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
                                            routingStrategy === 'single'
                                                ? 'border-primary bg-primary text-primary-foreground'
                                                : 'border-input bg-background hover:bg-accent'
                                        }`}
                                    >
                                        Single Provider
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleRoutingStrategyChange(
                                                'distribute',
                                            )
                                        }
                                        className={`rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
                                            routingStrategy === 'distribute'
                                                ? 'border-primary bg-primary text-primary-foreground'
                                                : 'border-input bg-background hover:bg-accent'
                                        }`}
                                    >
                                        Distribute
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleRoutingStrategyChange(
                                                'failover',
                                            )
                                        }
                                        className={`rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
                                            routingStrategy === 'failover'
                                                ? 'border-primary bg-primary text-primary-foreground'
                                                : 'border-input bg-background hover:bg-accent'
                                        }`}
                                    >
                                        Failover
                                    </button>
                                </div>
                                <InputError
                                    message={
                                        errors.routing_strategy as string
                                    }
                                />
                            </div>

                            {routingStrategy === 'single' && (
                                <div className="space-y-2">
                                    <Label htmlFor="provider_id">Provider</Label>
                                    <Select
                                        value={data.provider_id?.toString() || ''}
                                        onValueChange={(value) =>
                                            setData(
                                                'provider_id',
                                                parseInt(value),
                                            )
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {providers.map((provider) => (
                                                <SelectItem
                                                    key={provider.id}
                                                    value={provider.id.toString()}
                                                >
                                                    {provider.display_name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError
                                        message={errors.provider_id as string}
                                    />
                                </div>
                            )}

                            {routingStrategy === 'distribute' && (
                                <div className="space-y-2">
                                    <Label>Provider Distribution (%)</Label>
                                    <div className="space-y-2 rounded-md border p-4">
                                        {providers.map((provider) => {
                                            const percentage =
                                                data.provider_distribution[
                                                    provider.id.toString()
                                                ] || 0;
                                            return (
                                                <div
                                                    key={provider.id}
                                                    className="flex items-center gap-2"
                                                >
                                                    <Label className="w-32 text-sm">
                                                        {provider.display_name}
                                                    </Label>
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        max="100"
                                                        value={percentage}
                                                        onChange={(e) =>
                                                            handleDistributionChange(
                                                                provider.id,
                                                                parseInt(
                                                                    e.target
                                                                        .value,
                                                                ) || 0,
                                                            )
                                                        }
                                                        className="w-24"
                                                    />
                                                    <span className="text-xs text-muted-foreground">
                                                        %
                                                    </span>
                                                </div>
                                            );
                                        })}
                                        <p className="text-xs text-muted-foreground">
                                            Total: {totalDistribution}%
                                            {totalDistribution !== 100 &&
                                                ' (should equal 100%)'}
                                        </p>
                                    </div>
                                    <InputError
                                        message={
                                            errors.provider_distribution as string
                                        }
                                    />
                                </div>
                            )}

                            {routingStrategy === 'failover' && (
                                <div className="space-y-2">
                                    <Label>Failover Order</Label>
                                    <p className="text-xs text-muted-foreground">
                                        Drag to reorder providers (first is
                                        primary, others are fallbacks)
                                    </p>
                                    <div className="space-y-2 rounded-md border p-4">
                                        {providers.map((provider, index) => {
                                            const currentOrder =
                                                data.provider_failover_order;
                                            const currentIndex =
                                                currentOrder.indexOf(
                                                    provider.id,
                                                );
                                            return (
                                                <div
                                                    key={provider.id}
                                                    className="flex items-center gap-2"
                                                >
                                                    <span className="text-xs text-muted-foreground w-8">
                                                        {currentIndex >= 0
                                                            ? currentIndex + 1
                                                            : '-'}
                                                    </span>
                                                    <Label className="flex-1 text-sm">
                                                        {provider.display_name}
                                                    </Label>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            const newOrder =
                                                                currentOrder.includes(
                                                                    provider.id,
                                                                )
                                                                    ? currentOrder.filter(
                                                                          (
                                                                              id,
                                                                          ) =>
                                                                              id !==
                                                                              provider.id,
                                                                      )
                                                                    : [
                                                                          ...currentOrder,
                                                                          provider.id,
                                                                      ];
                                                            handleFailoverOrderChange(
                                                                newOrder,
                                                            );
                                                        }}
                                                    >
                                                        {currentOrder.includes(
                                                            provider.id,
                                                        )
                                                            ? 'Remove'
                                                            : 'Add'}
                                                    </Button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <InputError
                                        message={
                                            errors.provider_failover_order as string
                                        }
                                    />
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label>Target Contact Groups</Label>
                                <div className="flex flex-wrap gap-2">
                                    {groups.map((group) => {
                                        const checked = data.group_ids.includes(
                                            group.id,
                                        );
                                        return (
                                            <button
                                                key={group.id}
                                                type="button"
                                                onClick={() =>
                                                    toggleGroup(group.id)
                                                }
                                                className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                                                    checked
                                                        ? 'border-primary bg-primary text-primary-foreground'
                                                        : 'border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground'
                                                }`}
                                            >
                                                {group.name} ({group.contacts_count})
                                            </button>
                                        );
                                    })}
                                </div>
                                {groups.length === 0 && (
                                    <p className="text-xs text-muted-foreground">
                                        No contact groups available. Create
                                        groups first.
                                    </p>
                                )}
                                <InputError
                                    message={errors.group_ids as string}
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2">
                                <Button type="submit" disabled={processing}>
                                    {data.scheduled_at
                                        ? 'Schedule Campaign'
                                        : 'Start Campaign'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

