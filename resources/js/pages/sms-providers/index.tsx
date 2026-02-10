import { Head, Link } from '@inertiajs/react';
import { Settings, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import smsProviders from '@/routes/sms-providers';
import type { BreadcrumbItem } from '@/types';

type SmsProvider = {
    id: number;
    name: string;
    display_name: string;
    is_active: boolean;
    is_default: boolean;
    priority: number;
    credentials: Record<string, string>;
};

type Props = {
    providers: SmsProvider[];
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'SMS Providers',
        href: smsProviders.index().url,
    },
];

export default function SmsProvidersIndex({ providers }: Props) {
    const getCredentialStatus = (provider: SmsProvider) => {
        const creds = provider.credentials || {};
        
        switch (provider.name) {
            case 'telnyx':
                return creds.api_key ? 'configured' : 'not_configured';
            case 'twilio':
                return creds.account_sid && creds.auth_token ? 'configured' : 'not_configured';
            case 'signalwire':
                return creds.project_id && creds.api_token && creds.space_url ? 'configured' : 'not_configured';
            default:
                return 'not_configured';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="SMS Providers" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            SMS Providers
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Configure API credentials for your SMS service providers.
                        </p>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {providers.map((provider) => {
                        const credentialStatus = getCredentialStatus(provider);
                        const isConfigured = credentialStatus === 'configured';

                        return (
                            <Card key={provider.id}>
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <CardTitle className="flex items-center gap-2">
                                                {provider.display_name}
                                                {provider.is_default && (
                                                    <Badge variant="default" className="text-xs">
                                                        Default
                                                    </Badge>
                                                )}
                                            </CardTitle>
                                            <p className="text-xs text-muted-foreground capitalize">
                                                {provider.name}
                                            </p>
                                        </div>
                                        <Badge
                                            variant={
                                                provider.is_active
                                                    ? 'default'
                                                    : 'secondary'
                                            }
                                            className="text-xs"
                                        >
                                            {provider.is_active ? (
                                                <CheckCircle2 className="mr-1 size-3" />
                                            ) : (
                                                <XCircle className="mr-1 size-3" />
                                            )}
                                            {provider.is_active
                                                ? 'Active'
                                                : 'Inactive'}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">
                                                Status:
                                            </span>
                                            <Badge
                                                variant={
                                                    isConfigured
                                                        ? 'default'
                                                        : 'destructive'
                                                }
                                                className="text-xs"
                                            >
                                                {isConfigured
                                                    ? 'Configured'
                                                    : 'Not Configured'}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">
                                                Priority:
                                            </span>
                                            <span className="font-medium">
                                                {provider.priority}
                                            </span>
                                        </div>
                                        <Button
                                            asChild
                                            variant="outline"
                                            size="sm"
                                            className="w-full"
                                        >
                                            <Link
                                                href={smsProviders.edit({
                                                    sms_provider: provider.id,
                                                })}
                                            >
                                                <Settings className="mr-2 size-4" />
                                                Configure
                                            </Link>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </AppLayout>
    );
}

