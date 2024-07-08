<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;

class CreateDaythemesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('daythemes', function (Blueprint $table) {
            $table->increments('id');
            $table->timestamps();

            $table->integer('eventgroup_id')->unsigned();
            $table->foreign('eventgroup_id')->references('id')->on('eventgroups');
            $table->string('title');
            $table->integer('date')->unsigned(); // use unix timestamp
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::drop('daythemes');
    }
}
