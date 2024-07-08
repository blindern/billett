<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;

class CreatePaymentgroupsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('paymentgroups', function (Blueprint $table) {
            $table->increments('id');
            $table->timestamps();

            $table->integer('time_start')->unsigned(); // unix timestamp
            $table->integer('time_end')->unsigned(); // unix timestamp
            $table->string('title');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::drop('paymentgroups');
    }
}
