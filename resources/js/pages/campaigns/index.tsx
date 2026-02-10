import { Head, Link } from '@inertiajs/react';
import { Plus, Calendar, Users, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import campaigns from '@/routes/campaigns';
import type { BreadcrumbItem } from '@/types';

type Campaign = {
    id: number;
    name: string;
    message: string;
    status: 'draft' | 'scheduled' | 'sending' | 'completed' | 'failed';
    total_recipients: number;
    sent_count: number;
    delivered_count: number;
    failed_count: number;
    scheduled_at: string | null;
    started_at: string | null;
    completed_at: string | null;
    provider?: {
        id: number;
        display_name: string;
    };
    groups: Array<{
        id: number;
        name: string;
    }>;
};

type Props = {
    campaigns: {
        data: Campaign[];
        links: any;
        meta: any;
    };
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Campaigns',
        href: campaigns.index().url,
    },
];

const statusConfig = {
    draft: { label: 'Draft', variant: 'secondary' as const, icon: Clock },
    scheduled: { label: 'Scheduled', variant: 'default' as const, icon: Calendar },
    sending: { label: 'Sending', variant: 'default' as const, icon: Clock },
    completed: { label: 'Completed', variant: 'default' as const, icon: CheckCircle2 },
    failed: { label: 'Failed', variant: 'destructive' as const, icon: XCircle },
};

export default function CampaignsIndex({ campaigns: campaignsData }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Campaigns" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Campaigns
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Manage your SMS campaigns and track their performance.
                        </p>
                    </div>
                    <Button asChild size="sm">
                        <Link href={campaigns.create()}>
                            <Plus className="mr-2 size-4" />
                            New Campaign
                        </Link>
                    </Button>
                </div>

                {campaignsData.data.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <Users className="mb-4 size-12 text-muted-foreground" />
                            <h3 className="mb-2 text-lg font-semibold">
                                No campaigns yet
                            </h3>
                            <p className="mb-4 text-sm text-muted-foreground text-center">
                                Create your first campaign to start sending bulk SMS messages.
                            </p>
                            <Button asChild>
                                <Link href={campaigns.create()}>
                                    <Plus className="mr-2 size-4" />
                                    Create Campaign
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {campaignsData.data.map((campaign) => {
                            const StatusIcon = statusConfig[campaign.status].icon;
                            const deliveryRate =
                                campaign.sent_count > 0
                                    ? Math.round(
                                          (campaign.delivered_count /
                                              campaign.sent_count) *
                                              100,
                                      )
                                    : 0;

                            return (
                                <Card key={campaign.id}>
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-1">
                                                <CardTitle className="flex items-center gap-2">
                                                    {campaign.name}
                                                    <Badge
                                                        variant={
                                                            statusConfig[
                                                                campaign.status
                                                            ].variant
                                                        }
                                                        className="text-xs"
                                                    >
                                                        <StatusIcon className="mr-1 size-3" />
                                                        {
                                                            statusConfig[
                                                                campaign.status
                                                            ].label
                                                        }
                                                    </Badge>
                                                </CardTitle>
                                                <p className="text-sm text-muted-foreground line-clamp-2">
                                                    {campaign.message}
                                                </p>
                                            </div>
                                            <Button
                                                asChild
                                                variant="ghost"
                                                size="sm"
                                            >
                                                <Link
                                                    href={campaigns.show({
                                                        campaign: campaign.id,
                                                    })}
                                                >
                                                    View
                                                </Link>
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid gap-4 md:grid-cols-4">
                                            <div>
                                                <p className="text-xs text-muted-foreground">
                                                    Recipients
                                                </p>
                                                <p className="text-lg font-semibold">
                                                    {campaign.total_recipients}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground">
                                                    Sent
                                                </p>
                                                <p className="text-lg font-semibold">
                                                    {campaign.sent_count}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground">
                                                    Delivered
                                                </p>
                                                <p className="text-lg font-semibold">
                                                    {campaign.delivered_count} (
                                                    {deliveryRate}%)
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground">
                                                    Failed
                                                </p>
                                                <p className="text-lg font-semibold text-destructive">
                                                    {campaign.failed_count}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                            {campaign.provider && (
                                                <span>
                                                    Provider:{' '}
                                                    {campaign.provider
                                                        .display_name}
                                                </span>
                                            )}
                                            {campaign.groups.length > 0 && (
                                                <span>
                                                    Groups:{' '}
                                                    {campaign.groups
                                                        .map((g) => g.name)
                                                        .join(', ')}
                                                </span>
                                            )}
                                            {campaign.scheduled_at && (
                                                <span>
                                                    Scheduled:{' '}
                                                    {new Date(
                                                        campaign.scheduled_at,
                                                    ).toLocaleString()}
                                                </span>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

