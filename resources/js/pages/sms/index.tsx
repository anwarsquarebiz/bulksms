import { Head, Link } from '@inertiajs/react';
import { MessageSquare, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import sms from '@/routes/sms';
import type { BreadcrumbItem } from '@/types';

type SmsMessage = {
    id: number;
    to: string;
    from?: string | null;
    message: string;
    status: 'pending' | 'sent' | 'delivered' | 'failed';
    sent_at?: string | null;
    error_message?: string | null;
    provider?: {
        display_name: string;
    } | null;
};

type Props = {
    messages: {
        data: SmsMessage[];
        links: any[];
        meta: any;
    };
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'SMS',
        href: sms.index().url,
    },
];

export default function SmsIndex({ messages }: Props) {
    const getStatusBadge = (status: string) => {
        const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
            sent: 'default',
            delivered: 'default',
            pending: 'secondary',
            failed: 'destructive',
        };

        return (
            <Badge variant={variants[status] || 'outline'} className="text-xs">
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="SMS Messages" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            SMS Messages
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            View and manage all sent SMS messages.
                        </p>
                    </div>

                    <Button asChild size="sm">
                        <Link href={sms.create().url}>
                            <Plus className="mr-2 size-4" />
                            Send SMS
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base font-medium">
                            Message History
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="hidden grid-cols-[2fr,2fr,3fr,1fr,1fr] gap-4 text-xs font-medium text-muted-foreground md:grid">
                            <span>Recipient</span>
                            <span>From</span>
                            <span>Message</span>
                            <span>Provider</span>
                            <span className="text-right">Status</span>
                        </div>

                        <div className="space-y-2">
                            {messages.data.map((message) => (
                                <div
                                    key={message.id}
                                    className="block rounded-md border bg-background px-3 py-3 text-sm transition-colors hover:bg-accent/60"
                                >
                                    <div className="grid gap-2 md:grid-cols-[2fr,2fr,3fr,1fr,1fr] md:items-center">
                                        <div>
                                            <div className="font-medium">
                                                {message.to}
                                            </div>
                                            {message.sent_at && (
                                                <div className="text-xs text-muted-foreground">
                                                    {new Date(
                                                        message.sent_at,
                                                    ).toLocaleString()}
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-sm">
                                            {message.from || 'N/A'}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            <div className="line-clamp-2">
                                                {message.message}
                                            </div>
                                            {message.error_message && (
                                                <div className="mt-1 text-xs text-destructive">
                                                    {message.error_message}
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {message.provider?.display_name ||
                                                'N/A'}
                                        </div>
                                        <div className="flex justify-end">
                                            {getStatusBadge(message.status)}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {messages.data.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <MessageSquare className="mb-4 size-12 text-muted-foreground" />
                                    <p className="text-sm text-muted-foreground">
                                        No messages yet. Send your first SMS to
                                        get started.
                                    </p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

