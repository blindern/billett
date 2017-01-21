<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class PaymentgroupsFixEventgroupId extends Migration {

    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('paymentgroups', function(Blueprint $table) {
            $table->foreign('eventgroup_id')->references('id')->on('eventgroups');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('paymentgroups', function(Blueprint $table)
        {
            $table->dropForeign('eventgroup_id');
        });
    }

}
