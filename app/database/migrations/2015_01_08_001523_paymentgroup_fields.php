<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class PaymentgroupFields extends Migration {

    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('paymentgroups', function(Blueprint $table)
        {
            $table->integer('eventgroup_id')->after('id')->unsigned()->references('id')->on('eventgroups');
            $table->string('user_created')->nullable();
            $table->string('user_closed')->nullable();
            $table->text('description')->nullable();
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
            $table->dropColumn('eventgroup_id');
            $table->dropColumn('user_created');
            $table->dropColumn('user_closed');
            $table->dropColumn('description');
        });
    }

}
