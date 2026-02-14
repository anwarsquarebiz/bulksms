import { Head, Link } from '@inertiajs/react';
import { Inbox, Copy, Check, MessageSquare, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import AppLayout from '@/layouts/app-layout';
import inbox from '@/routes/inbox';
import sms from '@/routes/sms';
import type { BreadcrumbItem } from '@/types';

type InboxMessage = {
    id: number;
    from: string | null;
    to: string;
    message: string;
    status: string;
    provider_message_id: string | null;
    received_at: string | null;
    metadata?: { media?: Array<{ url: string; content_type?: string }> };
    provider?: {
        id: number;
        display_name: string;
        name: string;
    } | null;
};

type Props = {
    messages: {
        data: InboxMessage[];
        links: any[];
        meta: any;
    };
    webhookUrls: {
        telnyx: string;
        twilio: string;
        signalwire: string;
    };
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Inbox',
        href: inbox.index().url,
    },
];

const providerWebhookDocs: Record<string, string> = {
    telnyx: 'https://developers.telnyx.com/docs/messaging/messages/receiving-webhooks',
    twilio: 'https://www.twilio.com/docs/messaging/guides/webhook-request',
    signalwire: 'https://developer.signalwire.com/compatibility-api/guides/messaging/general/handling-incoming-messages-from-code',
};

export default function InboxIndex({ messages, webhookUrls }: Props) {
    const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
    const [webhookExpanded, setWebhookExpanded] = useState(false);

    const copyWebhookUrl = (url: string, provider: string) => {
        navigator.clipboard.writeText(url);
        setCopiedUrl(provider);
        setTimeout(() => setCopiedUrl(null), 2000);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Inbox - Incoming SMS" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Inbox
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Incoming SMS messages received via webhooks from
                            Telnyx, Twilio, and SignalWire.
                        </p>
                    </div>

                    <Button asChild variant="outline" size="sm">
                        <Link href={sms.create().url}>
                            <MessageSquare className="mr-2 size-4" />
                            Reply (Send SMS)
                        </Link>
                    </Button>
                </div>

                <Collapsible
                    open={webhookExpanded}
                    onOpenChange={setWebhookExpanded}
                >
                    <Card>
                        <CollapsibleTrigger asChild>
                            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors rounded-t-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-base font-medium flex items-center gap-2">
                                            Webhook URLs
                                            <span className="text-xs font-normal text-muted-foreground">
                                                Configure these in your provider
                                                dashboards
                                            </span>
                                        </CardTitle>
                                        <CardDescription>
                                            Set these URLs as your inbound
                                            message webhook for each provider
                                        </CardDescription>
                                    </div>
                                    <Button variant="ghost" size="sm">
                                        {webhookExpanded ? 'Hide' : 'Show'}
                                    </Button>
                                </div>
                            </CardHeader>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            <CardContent className="space-y-3 pt-0">
                                {(
                                    [
                                        ['telnyx', 'Telnyx', webhookUrls.telnyx],
                                        ['twilio', 'Twilio', webhookUrls.twilio],
                                        [
                                            'signalwire',
                                            'SignalWire',
                                            webhookUrls.signalwire,
                                        ],
                                    ] as const
                                ).map(([key, label, url]) => (
                                    <div
                                        key={key}
                                        className="flex items-center gap-2 rounded-md border bg-muted/30 px-3 py-2"
                                    >
                                        <code className="flex-1 truncate text-sm font-mono">
                                            {url}
                                        </code>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                                copyWebhookUrl(url, key)
                                            }
                                            className="shrink-0"
                                        >
                                            {copiedUrl === key ? (
                                                <Check className="size-4 text-green-600" />
                                            ) : (
                                                <Copy className="size-4" />
                                            )}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            asChild
                                            className="shrink-0"
                                        >
                                            <a
                                                href={
                                                    providerWebhookDocs[key]
                                                }
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <ExternalLink className="size-4" />
                                            </a>
                                        </Button>
                                    </div>
                                ))}
                            </CardContent>
                        </CollapsibleContent>
                    </Card>
                </Collapsible>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base font-medium">
                            Incoming Messages
                        </CardTitle>
                        <CardDescription>
                            Messages received at your provider phone numbers
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="hidden grid-cols-[2fr,2fr,3fr,1fr] gap-4 text-xs font-medium text-muted-foreground md:grid">
                            <span>From</span>
                            <span>To (Our Number)</span>
                            <span>Message</span>
                            <span className="text-right">Provider / Date</span>
                        </div>

                        <div className="space-y-2">
                            {messages.data.map((msg) => (
                                <div
                                    key={msg.id}
                                    className="block rounded-md border bg-background px-3 py-3 text-sm transition-colors hover:bg-accent/60"
                                >
                                    <div className="grid gap-2 md:grid-cols-[2fr,2fr,3fr,1fr] md:items-center">
                                        <div>
                                            <div className="font-medium">
                                                {msg.from || 'Unknown'}
                                            </div>
                                            {msg.provider_message_id && (
                                                <div className="text-xs text-muted-foreground font-mono truncate max-w-[200px]">
                                                    {msg.provider_message_id}
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-sm">
                                            {msg.to}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            <div className="line-clamp-2">
                                                {msg.message || (
                                                    <span className="italic text-muted-foreground/70">
                                                        No text (media only)
                                                    </span>
                                                )}
                                            </div>
                                            {msg.metadata?.media &&
                                                msg.metadata.media.length > 0 && (
                                                    <div className="mt-1 flex flex-wrap gap-1">
                                                        {msg.metadata.media.map(
                                                            (m, i) => (
                                                                <a
                                                                    key={i}
                                                                    href={
                                                                        m.url
                                                                    }
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-xs text-primary hover:underline"
                                                                >
                                                                    [
                                                                    {m.content_type?.startsWith(
                                                                        'image/'
                                                                    )
                                                                        ? 'Image'
                                                                        : m.content_type?.startsWith(
                                                                              'video/'
                                                                          )
                                                                          ? 'Video'
                                                                          : 'Media'}{' '}
                                                                    {i + 1}]
                                                                </a>
                                                            )
                                                        )}
                                                    </div>
                                                )}
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs text-muted-foreground">
                                                {msg.provider?.display_name ||
                                                    'N/A'}
                                            </div>
                                            {msg.received_at && (
                                                <div className="text-xs text-muted-foreground">
                                                    {new Date(
                                                        msg.received_at
                                                    ).toLocaleString()}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {messages.data.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <Inbox className="mb-4 size-12 text-muted-foreground" />
                                    <p className="text-sm text-muted-foreground">
                                        No incoming messages yet. Configure your
                                        webhook URLs in your provider dashboards
                                        to start receiving SMS.
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
