import { Head, Link } from '@inertiajs/react';
import { ChevronLeft, CheckCircle2, XCircle, Clock, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
    messages?: Array<{
        id: number;
        to: string;
        status: string;
        sent_at: string | null;
    }>;
};

type Props = {
    campaign: Campaign;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Campaigns',
        href: campaigns.index().url,
    },
    {
        title: 'Campaign Details',
        href: '#',
    },
];

const statusConfig = {
    draft: { label: 'Draft', variant: 'secondary' as const, icon: Clock },
    scheduled: { label: 'Scheduled', variant: 'default' as const, icon: Calendar },
    sending: { label: 'Sending', variant: 'default' as const, icon: Clock },
    completed: { label: 'Completed', variant: 'default' as const, icon: CheckCircle2 },
    failed: { label: 'Failed', variant: 'destructive' as const, icon: XCircle },
};

export default function CampaignsShow({ campaign }: Props) {
    const StatusIcon = statusConfig[campaign.status].icon;
    const deliveryRate =
        campaign.sent_count > 0
            ? Math.round(
                  (campaign.delivered_count / campaign.sent_count) * 100,
              )
            : 0;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={campaign.name} />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center gap-2">
                    <Button asChild variant="ghost" size="sm" className="-ml-2">
                        <Link href={campaigns.index()}>
                            <ChevronLeft className="mr-1 size-4" />
                            Back
                        </Link>
                    </Button>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <CardTitle className="flex items-center gap-2">
                                        {campaign.name}
                                        <Badge
                                            variant={
                                                statusConfig[campaign.status]
                                                    .variant
                                            }
                                        >
                                            <StatusIcon className="mr-1 size-3" />
                                            {
                                                statusConfig[campaign.status]
                                                    .label
                                            }
                                        </Badge>
                                    </CardTitle>
                                    <p className="text-sm text-muted-foreground">
                                        {campaign.message}
                                    </p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-4">
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Total Recipients
                                    </p>
                                    <p className="text-2xl font-semibold">
                                        {campaign.total_recipients}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Sent
                                    </p>
                                    <p className="text-2xl font-semibold">
                                        {campaign.sent_count}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Delivered
                                    </p>
                                    <p className="text-2xl font-semibold">
                                        {campaign.delivered_count} ({deliveryRate}%)
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Failed
                                    </p>
                                    <p className="text-2xl font-semibold text-destructive">
                                        {campaign.failed_count}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">
                                    Campaign Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                {campaign.provider && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Provider:
                                        </span>
                                        <span>{campaign.provider.display_name}</span>
                                    </div>
                                )}
                                {campaign.groups.length > 0 && (
                                    <div>
                                        <span className="text-muted-foreground">
                                            Groups:
                                        </span>
                                        <div className="mt-1 flex flex-wrap gap-1">
                                            {campaign.groups.map((group) => (
                                                <Badge
                                                    key={group.id}
                                                    variant="outline"
                                                >
                                                    {group.name}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {campaign.scheduled_at && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Scheduled:
                                        </span>
                                        <span>
                                            {new Date(
                                                campaign.scheduled_at,
                                            ).toLocaleString()}
                                        </span>
                                    </div>
                                )}
                                {campaign.started_at && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Started:
                                        </span>
                                        <span>
                                            {new Date(
                                                campaign.started_at,
                                            ).toLocaleString()}
                                        </span>
                                    </div>
                                )}
                                {campaign.completed_at && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Completed:
                                        </span>
                                        <span>
                                            {new Date(
                                                campaign.completed_at,
                                            ).toLocaleString()}
                                        </span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

