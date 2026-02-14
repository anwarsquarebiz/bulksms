<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('sms_messages', 'direction')) {
            Schema::table('sms_messages', function (Blueprint $table) {
                $table->string('direction', 10)->default('outbound')->after('provider_id');
            });
        }
        if (!Schema::hasColumn('sms_messages', 'received_at')) {
            Schema::table('sms_messages', function (Blueprint $table) {
                $table->timestamp('received_at')->nullable();
            });
        }

        // Make user_id nullable for inbound messages (no user context when webhook fires)
        Schema::table('sms_messages', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
        });
        Schema::table('sms_messages', function (Blueprint $table) {
            $table->unsignedBigInteger('user_id')->nullable()->change();
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('sms_messages', function (Blueprint $table) {
            $table->dropColumn(['direction', 'received_at']);
            $table->dropForeign(['user_id']);
            $table->unsignedBigInteger('user_id')->nullable(false)->change();
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
        });
    }
};
