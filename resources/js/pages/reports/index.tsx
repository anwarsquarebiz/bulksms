import { Head, Link, router } from '@inertiajs/react';
import { Filter, Download } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import reports from '@/routes/reports';
import type { BreadcrumbItem } from '@/types';

type SmsMessage = {
    id: number;
    to: string;
    message: string;
    status: 'pending' | 'sent' | 'delivered' | 'failed';
    sent_at: string | null;
    delivered_at: string | null;
    provider?: {
        id: number;
        display_name: string;
    };
    campaign?: {
        id: number;
        name: string;
    };
    contact?: {
        id: number;
        name: string;
    };
};

type Props = {
    messages: {
        data: SmsMessage[];
        links: any;
        meta: any;
    };
    campaigns: Array<{ id: number; name: string }>;
    providers: Array<{ id: number; display_name: string }>;
    stats: {
        total: number;
        sent: number;
        delivered: number;
        failed: number;
        delivery_rate: number;
    };
    filters: {
        date_from?: string;
        date_to?: string;
        campaign_id?: string;
        status?: string;
        provider_id?: string;
    };
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Reports',
        href: reports.index().url,
    },
];

const statusConfig = {
    pending: { label: 'Pending', variant: 'secondary' as const },
    sent: { label: 'Sent', variant: 'default' as const },
    delivered: { label: 'Delivered', variant: 'default' as const },
    failed: { label: 'Failed', variant: 'destructive' as const },
};

export default function ReportsIndex({
    messages,
    campaigns,
    providers,
    stats,
    filters,
}: Props) {
    const [localFilters, setLocalFilters] = useState({
        ...filters,
        campaign_id: filters.campaign_id || 'all',
        status: filters.status || 'all',
        provider_id: filters.provider_id || 'all',
    });

    const applyFilters = () => {
        // Remove undefined values and 'all' values from filters
        const cleanFilters = Object.fromEntries(
            Object.entries(localFilters).filter(
                ([_, value]) => value !== undefined && value !== 'all' && value !== ''
            )
        );
        router.get(reports.index().url, cleanFilters, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const clearFilters = () => {
        const cleared = {
            campaign_id: 'all',
            status: 'all',
            provider_id: 'all',
        };
        setLocalFilters(cleared);
        router.get(reports.index().url, {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Reports" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Delivery Reports
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            View detailed SMS delivery logs and statistics.
                        </p>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Messages
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-semibold">
                                {stats.total}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">
                                Sent
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-semibold">
                                {stats.sent}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">
                                Delivered
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-semibold">
                                {stats.delivered}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">
                                Delivery Rate
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-semibold">
                                {stats.delivery_rate}%
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="size-4" />
                            Filters
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
                            <div className="space-y-2">
                                <Label htmlFor="date_from">Date From</Label>
                                <Input
                                    id="date_from"
                                    type="date"
                                    value={localFilters.date_from || ''}
                                    onChange={(e) =>
                                        setLocalFilters({
                                            ...localFilters,
                                            date_from: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="date_to">Date To</Label>
                                <Input
                                    id="date_to"
                                    type="date"
                                    value={localFilters.date_to || ''}
                                    onChange={(e) =>
                                        setLocalFilters({
                                            ...localFilters,
                                            date_to: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="campaign_id">Campaign</Label>
                                <Select
                                    value={localFilters.campaign_id || 'all'}
                                    onValueChange={(value) =>
                                        setLocalFilters({
                                            ...localFilters,
                                            campaign_id: value === 'all' ? undefined : value,
                                        })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="All campaigns" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All campaigns</SelectItem>
                                        {campaigns.map((campaign) => (
                                            <SelectItem
                                                key={campaign.id}
                                                value={campaign.id.toString()}
                                            >
                                                {campaign.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <Select
                                    value={localFilters.status || 'all'}
                                    onValueChange={(value) =>
                                        setLocalFilters({
                                            ...localFilters,
                                            status: value === 'all' ? undefined : value,
                                        })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="All statuses" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All statuses</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="sent">Sent</SelectItem>
                                        <SelectItem value="delivered">Delivered</SelectItem>
                                        <SelectItem value="failed">Failed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="provider_id">Provider</Label>
                                <Select
                                    value={localFilters.provider_id || 'all'}
                                    onValueChange={(value) =>
                                        setLocalFilters({
                                            ...localFilters,
                                            provider_id: value === 'all' ? undefined : value,
                                        })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="All providers" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All providers</SelectItem>
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
                            </div>
                        </div>
                        <div className="mt-4 flex items-center gap-2">
                            <Button onClick={applyFilters} size="sm">
                                Apply Filters
                            </Button>
                            <Button
                                onClick={clearFilters}
                                variant="outline"
                                size="sm"
                            >
                                Clear
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Message Log</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {messages.data.length === 0 ? (
                            <p className="py-8 text-center text-sm text-muted-foreground">
                                No messages found
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {messages.data.map((message) => (
                                    <div
                                        key={message.id}
                                        className="flex items-center justify-between rounded-md border p-3"
                                    >
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">
                                                    {message.to}
                                                </span>
                                                <Badge
                                                    variant={
                                                        statusConfig[
                                                            message.status
                                                        ].variant
                                                    }
                                                    className="text-xs"
                                                >
                                                    {
                                                        statusConfig[
                                                            message.status
                                                        ].label
                                                    }
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground line-clamp-1">
                                                {message.message}
                                            </p>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                {message.provider && (
                                                    <span>
                                                        Provider:{' '}
                                                        {message.provider
                                                            .display_name}
                                                    </span>
                                                )}
                                                {message.campaign && (
                                                    <span>
                                                        Campaign:{' '}
                                                        {message.campaign.name}
                                                    </span>
                                                )}
                                                {message.sent_at && (
                                                    <span>
                                                        Sent:{' '}
                                                        {new Date(
                                                            message.sent_at,
                                                        ).toLocaleString()}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

