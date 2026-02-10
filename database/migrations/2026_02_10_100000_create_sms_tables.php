<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sms_providers', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // telnyx, twilio, signalwire
            $table->string('display_name');
            $table->boolean('is_active')->default(true);
            $table->boolean('is_default')->default(false);
            $table->json('credentials'); // API keys, tokens, etc.
            $table->integer('priority')->default(0); // For failover ordering
            $table->timestamps();
        });

        Schema::create('sms_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('campaign_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('contact_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('provider_id')->nullable()->constrained('sms_providers')->nullOnDelete();
            $table->string('to');
            $table->string('from')->nullable(); // Sender ID
            $table->text('message');
            $table->boolean('is_unicode')->default(false);
            $table->enum('status', ['pending', 'sent', 'delivered', 'failed'])->default('pending');
            $table->string('provider_message_id')->nullable();
            $table->text('error_message')->nullable();
            $table->decimal('cost', 10, 4)->nullable();
            $table->json('metadata')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamps();

            $table->index(['campaign_id', 'status']);
            $table->index(['user_id', 'status']);
            $table->index('sent_at');
        });

        Schema::create('campaigns', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('template_id')->nullable()->constrained('sms_templates')->nullOnDelete();
            $table->string('name');
            $table->text('message');
            $table->string('sender_id')->nullable();
            $table->boolean('is_unicode')->default(false);
            $table->enum('routing_strategy', ['single', 'distribute', 'failover'])->default('single');
            $table->json('provider_distribution')->nullable(); // For percentage-based: {provider_id: percentage}
            $table->json('provider_failover_order')->nullable(); // For failover: [provider_id1, provider_id2, ...]
            $table->foreignId('provider_id')->nullable()->constrained('sms_providers')->nullOnDelete();
            $table->enum('status', ['draft', 'scheduled', 'sending', 'completed', 'failed'])->default('draft');
            $table->integer('total_recipients')->default(0);
            $table->integer('sent_count')->default(0);
            $table->integer('delivered_count')->default(0);
            $table->integer('failed_count')->default(0);
            $table->timestamp('scheduled_at')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
        });

        Schema::create('campaign_recipients', function (Blueprint $table) {
            $table->id();
            $table->foreignId('campaign_id')->constrained()->cascadeOnDelete();
            $table->string('phone_number');
            $table->string('name')->nullable();
            $table->enum('status', ['pending', 'sent', 'delivered', 'failed'])->default('pending');
            $table->string('provider_message_id')->nullable();
            $table->text('error_message')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->timestamps();

            $table->index(['campaign_id', 'status']);
        });

        Schema::create('campaign_contact_groups', function (Blueprint $table) {
            $table->id();
            $table->foreignId('campaign_id')->constrained()->cascadeOnDelete();
            $table->foreignId('contact_group_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('campaign_contact_groups');
        Schema::dropIfExists('campaign_recipients');
        Schema::dropIfExists('campaigns');
        Schema::dropIfExists('sms_messages');
        Schema::dropIfExists('sms_providers');
        Schema::dropIfExists('sms_templates');
    }
};

