<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class TicketPaymentgroup extends Migration {

    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('tickets', function(Blueprint $table) {
            $table->integer('valid_paymentgroup_id')->unsigned()->nullable()->after('is_revoked');
            $table->integer('revoked_paymentgroup_id')->unsigned()->nullable()->after('valid_paymentgroup_id');
            $table->foreign('valid_paymentgroup_id')->references('id')->on('eventgroups');
            $table->foreign('revoked_paymentgroup_id')->references('id')->on('eventgroups');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('tickets', function(Blueprint $table)
        {
            $table->dropColumn('valid_paymentgroup_id');
            $table->dropColumn('revoked_paymentgroup_id');
        });
    }

}
