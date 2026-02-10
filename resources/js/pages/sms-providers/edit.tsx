import { Head, Link, useForm } from '@inertiajs/react';
import { ChevronLeft } from 'lucide-react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
    provider: SmsProvider;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'SMS Providers',
        href: smsProviders.index().url,
    },
    {
        title: 'Configure Provider',
        href: '#',
    },
];

export default function SmsProvidersEdit({ provider }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        display_name: provider.display_name,
        is_active: provider.is_active,
        is_default: provider.is_default,
        priority: provider.priority,
        credentials: {
            api_key: provider.credentials?.api_key || '',
            messaging_profile_id:
                provider.credentials?.messaging_profile_id || '',
            from_number: provider.credentials?.from_number || '',
            account_sid: provider.credentials?.account_sid || '',
            auth_token: provider.credentials?.auth_token || '',
            project_id: provider.credentials?.project_id || '',
            api_token: provider.credentials?.api_token || '',
            space_url: provider.credentials?.space_url || '',
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(smsProviders.update({ sms_provider: provider.id }).url, {
            preserveScroll: true,
        });
    };

    const renderCredentialsFields = () => {
        switch (provider.name) {
            case 'telnyx':
                return (
                    <>
                        <div className="space-y-2">
                            <Label htmlFor="api_key">
                                API Key <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="api_key"
                                type="password"
                                value={data.credentials.api_key}
                                onChange={(e) =>
                                    setData('credentials', {
                                        ...data.credentials,
                                        api_key: e.target.value,
                                    })
                                }
                                required
                                placeholder="TELNYX_API_KEY"
                            />
                            <InputError
                                message={
                                    errors['credentials.api_key'] as string
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="messaging_profile_id">
                                Messaging Profile ID
                            </Label>
                            <Input
                                id="messaging_profile_id"
                                value={data.credentials.messaging_profile_id}
                                onChange={(e) =>
                                    setData('credentials', {
                                        ...data.credentials,
                                        messaging_profile_id: e.target.value,
                                    })
                                }
                                placeholder="Optional"
                            />
                            <InputError
                                message={
                                    errors[
                                        'credentials.messaging_profile_id'
                                    ] as string
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="from_number">From Number</Label>
                            <Input
                                id="from_number"
                                value={data.credentials.from_number}
                                onChange={(e) =>
                                    setData('credentials', {
                                        ...data.credentials,
                                        from_number: e.target.value,
                                    })
                                }
                                placeholder="Optional - Default sender number"
                            />
                            <InputError
                                message={
                                    errors['credentials.from_number'] as string
                                }
                            />
                        </div>
                    </>
                );

            case 'twilio':
                return (
                    <>
                        <div className="space-y-2">
                            <Label htmlFor="account_sid">
                                Account SID <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="account_sid"
                                value={data.credentials.account_sid}
                                onChange={(e) =>
                                    setData('credentials', {
                                        ...data.credentials,
                                        account_sid: e.target.value,
                                    })
                                }
                                required
                                placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                            />
                            <InputError
                                message={
                                    errors['credentials.account_sid'] as string
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="auth_token">
                                Auth Token <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="auth_token"
                                type="password"
                                value={data.credentials.auth_token}
                                onChange={(e) =>
                                    setData('credentials', {
                                        ...data.credentials,
                                        auth_token: e.target.value,
                                    })
                                }
                                required
                                placeholder="Your Auth Token"
                            />
                            <InputError
                                message={
                                    errors['credentials.auth_token'] as string
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="from_number">From Number</Label>
                            <Input
                                id="from_number"
                                value={data.credentials.from_number}
                                onChange={(e) =>
                                    setData('credentials', {
                                        ...data.credentials,
                                        from_number: e.target.value,
                                    })
                                }
                                placeholder="Optional - Default sender number"
                            />
                            <InputError
                                message={
                                    errors['credentials.from_number'] as string
                                }
                            />
                        </div>
                    </>
                );

            case 'signalwire':
                return (
                    <>
                        <div className="space-y-2">
                            <Label htmlFor="project_id">
                                Project ID <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="project_id"
                                value={data.credentials.project_id}
                                onChange={(e) =>
                                    setData('credentials', {
                                        ...data.credentials,
                                        project_id: e.target.value,
                                    })
                                }
                                required
                                placeholder="Your Project ID"
                            />
                            <InputError
                                message={
                                    errors['credentials.project_id'] as string
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="api_token">
                                API Token <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="api_token"
                                type="password"
                                value={data.credentials.api_token}
                                onChange={(e) =>
                                    setData('credentials', {
                                        ...data.credentials,
                                        api_token: e.target.value,
                                    })
                                }
                                required
                                placeholder="Your API Token"
                            />
                            <InputError
                                message={
                                    errors['credentials.api_token'] as string
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="space_url">
                                Space URL <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="space_url"
                                value={data.credentials.space_url}
                                onChange={(e) =>
                                    setData('credentials', {
                                        ...data.credentials,
                                        space_url: e.target.value,
                                    })
                                }
                                required
                                placeholder="your-space.signalwire.com"
                            />
                            <InputError
                                message={
                                    errors['credentials.space_url'] as string
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="from_number">From Number</Label>
                            <Input
                                id="from_number"
                                value={data.credentials.from_number}
                                onChange={(e) =>
                                    setData('credentials', {
                                        ...data.credentials,
                                        from_number: e.target.value,
                                    })
                                }
                                placeholder="Optional - Default sender number"
                            />
                            <InputError
                                message={
                                    errors['credentials.from_number'] as string
                                }
                            />
                        </div>
                    </>
                );

            default:
                return null;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Configure ${provider.display_name}`} />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center gap-2">
                    <Button asChild variant="ghost" size="sm" className="-ml-2">
                        <Link href={smsProviders.index()}>
                            <ChevronLeft className="mr-1 size-4" />
                            Back
                        </Link>
                    </Button>
                </div>

                <Heading
                    title={`Configure ${provider.display_name}`}
                    description="Set up API credentials and provider settings."
                />

                <Card className="max-w-2xl">
                    <CardContent className="pt-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="display_name">
                                        Display Name
                                    </Label>
                                    <Input
                                        id="display_name"
                                        value={data.display_name}
                                        onChange={(e) =>
                                            setData('display_name', e.target.value)
                                        }
                                        required
                                    />
                                    <InputError message={errors.display_name} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="priority">Priority</Label>
                                    <Input
                                        id="priority"
                                        type="number"
                                        min="0"
                                        value={data.priority}
                                        onChange={(e) =>
                                            setData(
                                                'priority',
                                                parseInt(e.target.value) || 0,
                                            )
                                        }
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Higher priority = used first in failover
                                    </p>
                                    <InputError message={errors.priority as string} />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={data.is_active}
                                            onChange={(e) =>
                                                setData('is_active', e.target.checked)
                                            }
                                            className="rounded border-input"
                                        />
                                        <span>Active</span>
                                    </label>
                                    <InputError message={errors.is_active as string} />
                                </div>

                                <div className="flex items-center gap-4">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={data.is_default}
                                            onChange={(e) =>
                                                setData('is_default', e.target.checked)
                                            }
                                            className="rounded border-input"
                                        />
                                        <span>Set as Default Provider</span>
                                    </label>
                                    <InputError message={errors.is_default as string} />
                                </div>
                            </div>

                            <div className="space-y-4 border-t pt-6">
                                <h3 className="text-lg font-semibold">
                                    API Credentials
                                </h3>
                                {renderCredentialsFields()}
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2">
                                <Button type="submit" disabled={processing}>
                                    Save Configuration
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

