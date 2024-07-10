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
        Schema::table('events', function (Blueprint $table) {
            $table->dropForeign('events_group_id_foreign');
            $table->renameColumn('group_id', 'eventgroup_id');
            $table->foreign('eventgroup_id')->references('id')->on('eventgroups');
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->dropForeign('payments_group_id_foreign');
            $table->renameColumn('group_id', 'paymentgroup_id');
            $table->foreign('paymentgroup_id')->references('id')->on('paymentgroups');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->dropForeign('events_eventgroup_id_foreign');
            $table->renameColumn('eventgroup_id', 'group_id');
            $table->foreign('group_id')->references('id')->on('eventgroups');
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->dropForeign('payments_paymentgroup_id_foreign');
            $table->renameColumn('paymentgroup_id', 'group_id');
            $table->foreign('group_id')->references('id')->on('paymentgroups');
        });
    }
};
