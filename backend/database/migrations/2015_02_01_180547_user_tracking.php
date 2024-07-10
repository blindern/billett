<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('user_created')->nullable()->after('time');
        });
        Schema::table('payments', function (Blueprint $table) {
            $table->string('user_created')->nullable()->after('time');
        });
        Schema::table('tickets', function (Blueprint $table) {
            $table->string('user_valid')->nullable()->after('revoked_paymentgroup_id');
            $table->string('user_revoked')->nullable()->after('user_valid');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn('user_created');
        });
        Schema::table('payments', function (Blueprint $table) {
            $table->dropColumn('user_created');
        });
        Schema::table('tickets', function (Blueprint $table) {
            $table->dropColumn('user_valid');
            $table->dropColumn('user_revoked');
        });
    }
};
