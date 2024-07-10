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
            $table->dropForeign('tickets_valid_paymentgroup_id_foreign');
            $table->dropForeign('tickets_revoked_paymentgroup_id_foreign');
            $table->foreign('valid_paymentgroup_id')->references('id')->on('paymentgroups');
            $table->foreign('revoked_paymentgroup_id')->references('id')->on('paymentgroups');

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tickets', function (Blueprint $table) {
            $table->dropForeign('tickets_valid_paymentgroup_id_foreign');
            $table->dropForeign('tickets_revoked_paymentgroup_id_foreign');
            $table->foreign('valid_paymentgroup_id')->references('id')->on('eventgroups');
            $table->foreign('revoked_paymentgroup_id')->references('id')->on('eventgroups');
        });
    }
};
