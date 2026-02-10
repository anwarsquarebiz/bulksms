import { Head, Link } from '@inertiajs/react';
import { Plus, FileText, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import smsTemplates from '@/routes/sms-templates';
import type { BreadcrumbItem } from '@/types';

type SmsTemplate = {
    id: number;
    name: string;
    message: string;
    created_at: string;
};

type Props = {
    templates: {
        data: SmsTemplate[];
        links: any;
        meta: any;
    };
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'SMS Templates',
        href: smsTemplates.index().url,
    },
];

export default function SmsTemplatesIndex({ templates }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="SMS Templates" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            SMS Templates
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Create and manage reusable SMS message templates.
                        </p>
                    </div>
                    <Button asChild size="sm">
                        <Link href={smsTemplates.create()}>
                            <Plus className="mr-2 size-4" />
                            New Template
                        </Link>
                    </Button>
                </div>

                {templates.data.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <FileText className="mb-4 size-12 text-muted-foreground" />
                            <h3 className="mb-2 text-lg font-semibold">
                                No templates yet
                            </h3>
                            <p className="mb-4 text-sm text-muted-foreground text-center">
                                Create your first template to reuse messages
                                across campaigns.
                            </p>
                            <Button asChild>
                                <Link href={smsTemplates.create()}>
                                    <Plus className="mr-2 size-4" />
                                    Create Template
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {templates.data.map((template) => (
                            <Card key={template.id}>
                                <CardHeader>
                                    <CardTitle className="text-base">
                                        {template.name}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="mb-4 line-clamp-3 text-sm text-muted-foreground">
                                        {template.message}
                                    </p>
                                    <div className="flex items-center justify-end gap-2">
                                        <Button
                                            asChild
                                            variant="ghost"
                                            size="sm"
                                        >
                                            <Link
                                                href={smsTemplates.edit({
                                                    sms_template: template.id,
                                                })}
                                            >
                                                <Edit className="mr-1 size-3" />
                                                Edit
                                            </Link>
                                        </Button>
                                        <Button
                                            asChild
                                            variant="ghost"
                                            size="sm"
                                            className="text-destructive hover:text-destructive"
                                        >
                                            <Link
                                                href={smsTemplates.destroy({
                                                    sms_template: template.id,
                                                })}
                                                method="delete"
                                                as="button"
                                            >
                                                <Trash2 className="mr-1 size-3" />
                                                Delete
                                            </Link>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

