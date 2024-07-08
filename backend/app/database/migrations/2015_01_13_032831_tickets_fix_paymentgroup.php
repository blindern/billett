<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;

class TicketsFixPaymentgroup extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
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
     *
     * @return void
     */
    public function down()
    {
        Schema::table('tickets', function (Blueprint $table) {
            $table->dropForeign('tickets_valid_paymentgroup_id_foreign');
            $table->dropForeign('tickets_revoked_paymentgroup_id_foreign');
            $table->foreign('valid_paymentgroup_id')->references('id')->on('eventgroups');
            $table->foreign('revoked_paymentgroup_id')->references('id')->on('eventgroups');
        });
    }
}
