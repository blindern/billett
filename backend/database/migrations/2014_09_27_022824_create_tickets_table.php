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
        Schema::create('tickets', function (Blueprint $table) {
            $table->increments('id');
            $table->timestamp('created_at');
            $table->timestamp('updated_at');

            $table->integer('order_id')->unsigned();
            $table->foreign('order_id')->references('id')->on('orders');

            $table->integer('event_id')->unsigned();
            $table->foreign('event_id')->references('id')->on('events');

            $table->integer('ticketgroup_id')->unsigned();
            $table->foreign('ticketgroup_id')->references('id')->on('ticketgroups');

            $table->integer('time')->unsigned(); // unix timestamp
            $table->integer('expire')->unsigned()->nullable(); // unix timestamp
            $table->boolean('is_valid');
            $table->boolean('is_revoked');
            $table->integer('used')->unsigned()->nullable(); // unix timestamp
            $table->string('key', 30);
            $table->binary('pdf');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::drop('tickets');
    }
};
