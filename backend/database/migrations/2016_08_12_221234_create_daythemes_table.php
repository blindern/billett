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
        Schema::create('daythemes', function (Blueprint $table) {
            $table->increments('id');
            $table->timestamp('created_at');
            $table->timestamp('updated_at');

            $table->integer('eventgroup_id')->unsigned();
            $table->foreign('eventgroup_id')->references('id')->on('eventgroups');
            $table->string('title');
            $table->integer('date')->unsigned(); // use unix timestamp
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::drop('daythemes');
    }
};
