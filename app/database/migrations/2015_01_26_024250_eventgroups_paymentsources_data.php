<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class EventgroupsPaymentsourcesData extends Migration {

    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('eventgroups', function(Blueprint $table) {
            $table->text('paymentsources_data')->nullable();
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
