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
        Schema::table('tickets', function (Blueprint $table) {
            $table->integer('valid_paymentgroup_id')->unsigned()->nullable()->after('is_revoked');
            $table->integer('revoked_paymentgroup_id')->unsigned()->nullable()->after('valid_paymentgroup_id');
            $table->foreign('valid_paymentgroup_id')->references('id')->on('eventgroups');
            $table->foreign('revoked_paymentgroup_id')->references('id')->on('eventgroups');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tickets', function (Blueprint $table) {
            $table->dropColumn('valid_paymentgroup_id');
            $table->dropColumn('revoked_paymentgroup_id');
        });
    }
};
