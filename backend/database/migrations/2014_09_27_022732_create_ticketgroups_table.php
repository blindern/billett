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
        Schema::create('ticketgroups', function (Blueprint $table) {
            $table->increments('id');
            $table->timestamp('created_at');
            $table->timestamp('updated_at');

            $table->integer('event_id')->unsigned();
            $table->foreign('event_id')->references('id')->on('events');

            $table->boolean('is_active')->default(true);
            $table->boolean('is_published');
            $table->boolean('is_normal')->default(true);
            $table->string('title');
            $table->string('ticket_text')->nullable();
            $table->decimal('price', 7, 3);
            $table->decimal('fee', 7, 3)->nullable();
            $table->mediumInteger('limit')->unsigned()->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::drop('ticketgroups');
    }
};
