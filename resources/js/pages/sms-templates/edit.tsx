import { Head, Link, useForm } from '@inertiajs/react';
import { ChevronLeft } from 'lucide-react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import smsTemplates from '@/routes/sms-templates';
import type { BreadcrumbItem } from '@/types';

type SmsTemplate = {
    id: number;
    name: string;
    message: string;
};

type Props = {
    template: SmsTemplate;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'SMS Templates',
        href: smsTemplates.index().url,
    },
    {
        title: 'Edit Template',
        href: '#',
    },
];

export default function SmsTemplatesEdit({ template }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: template.name,
        message: template.message,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(smsTemplates.update({ sms_template: template.id }).url, {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Template" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center gap-2">
                    <Button asChild variant="ghost" size="sm" className="-ml-2">
                        <Link href={smsTemplates.index()}>
                            <ChevronLeft className="mr-1 size-4" />
                            Back
                        </Link>
                    </Button>
                </div>

                <Heading
                    title="Edit Template"
                    description="Update your SMS message template."
                />

                <Card className="max-w-2xl">
                    <CardContent className="pt-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Template Name</Label>
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
                                <Label htmlFor="message">Message</Label>
                                <Textarea
                                    id="message"
                                    rows={8}
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
                                </div>
                                <InputError message={errors.message} />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2">
                                <Button type="submit" disabled={processing}>
                                    Update Template
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

