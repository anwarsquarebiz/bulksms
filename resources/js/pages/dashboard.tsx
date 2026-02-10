import { Head, Link } from '@inertiajs/react';
import { ArrowUpRight, MessageCircle, Users, Activity, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import campaigns from '@/routes/campaigns';
import reports from '@/routes/reports';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

type Props = {
    stats: {
        sms: {
            total: number;
            sent: number;
            delivered: number;
            failed: number;
            delivery_rate: number;
        };
        campaigns: {
            total: number;
            active: number;
        };
        contacts: {
            total: number;
            active: number;
            groups: number;
        };
    };
    providerStats: Array<{
        provider: string;
        total: number;
        sent: number;
        delivered: number;
        failed: number;
    }>;
    recentMessages: Array<{
        id: number;
        to: string;
        status: string;
        created_at: string;
        provider?: { display_name: string };
        campaign?: { name: string };
    }>;
    recentCampaigns: Array<{
        id: number;
        name: string;
        status: string;
        sent_count: number;
        delivered_count: number;
        total_recipients: number;
        provider?: { display_name: string };
    }>;
};

export default function Dashboard({
    stats,
    providerStats,
    recentMessages,
    recentCampaigns,
}: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="flex flex-1 flex-col gap-6 overflow-x-auto p-4 md:p-6">
                <section className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Overview
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            High-level summary of your BulkSMS account activity.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <Button asChild variant="outline" size="sm">
                            <Link href={reports.index()}>
                                View reports
                            </Link>
                        </Button>
                        <Button asChild size="sm">
                            <Link href={campaigns.create()}>
                                New campaign
                                <ArrowUpRight className="size-4" />
                            </Link>
                        </Button>
                    </div>
                </section>

                <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Messages sent
                            </CardTitle>
                            <MessageCircle className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-semibold">
                                {stats.sms.total.toLocaleString()}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {stats.sms.sent} sent, {stats.sms.delivered} delivered
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Delivery rate
                            </CardTitle>
                            <Activity className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-semibold">
                                {stats.sms.delivery_rate}%
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {stats.sms.delivered} of {stats.sms.sent} sent messages
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Contacts
                            </CardTitle>
                            <Users className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-semibold">
                                {stats.contacts.total.toLocaleString()}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {stats.contacts.active} active, {stats.contacts.groups} groups
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Active Campaigns
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-semibold">
                                {stats.campaigns.active}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {stats.campaigns.total} total campaigns
                            </p>
                        </CardContent>
                    </Card>
                </section>

                <section className="grid gap-4 lg:grid-cols-3">
                    <Card className="col-span-1 lg:col-span-2">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div className="space-y-1">
                                <CardTitle>Recent campaigns</CardTitle>
                                <CardDescription>
                                    Performance for your latest SMS campaigns.
                                </CardDescription>
                            </div>
                            <Badge variant="outline" className="text-xs">
                                Last 7 days
                            </Badge>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>Campaign</span>
                                <div className="flex w-1/2 justify-between">
                                    <span>Sent</span>
                                    <span>Delivered</span>
                                    <span>Rate</span>
                                </div>
                            </div>
                            {recentCampaigns.length === 0 ? (
                                <p className="py-4 text-center text-sm text-muted-foreground">
                                    No campaigns yet
                                </p>
                            ) : (
                                <ul className="space-y-3 text-sm">
                                    {recentCampaigns.map((campaign) => {
                                        const deliveryRate =
                                            campaign.sent_count > 0
                                                ? Math.round(
                                                      (campaign.delivered_count /
                                                          campaign.sent_count) *
                                                          100,
                                                  )
                                                : 0;
                                        return (
                                            <li
                                                key={campaign.id}
                                                className="flex items-center justify-between rounded-md border bg-background px-3 py-2"
                                            >
                                                <div className="space-y-0.5">
                                                    <p className="font-medium">
                                                        {campaign.name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {campaign.provider?.display_name || 'No provider'}
                                                    </p>
                                                </div>
                                                <div className="flex w-1/2 justify-between text-xs text-muted-foreground">
                                                    <span>{campaign.sent_count}</span>
                                                    <span>{campaign.delivered_count}</span>
                                                    <span>{deliveryRate}%</span>
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Account status</CardTitle>
                            <CardDescription>
                                Quick view of limits and health.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span>Failed Messages</span>
                                    <span className="text-destructive font-semibold">
                                        {stats.sms.failed}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span>Total Sent</span>
                                    <span className="text-muted-foreground">
                                        {stats.sms.sent}
                                    </span>
                                </div>
                            </div>
                            {providerStats.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-xs font-medium text-muted-foreground">
                                        Provider Usage
                                    </p>
                                    {providerStats.map((stat, index) => (
                                        <div key={index} className="space-y-1">
                                            <div className="flex items-center justify-between text-xs">
                                                <span>{stat.provider}</span>
                                                <span className="text-muted-foreground">
                                                    {stat.total} messages
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                        <CardFooter className="flex flex-col items-stretch gap-2">
                            <Button asChild variant="outline" size="sm">
                                <Link href={reports.index()}>
                                    View delivery logs
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>
                </section>
            </div>
        </AppLayout>
    );
}
