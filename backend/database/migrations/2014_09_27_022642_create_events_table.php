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
        Schema::create('events', function (Blueprint $table) {
            $table->increments('id');
            $table->timestamp('created_at');
            $table->timestamp('updated_at');

            $table->integer('group_id')->unsigned();
            $table->foreign('group_id')->references('id')->on('eventgroups');

            $table->string('alias', 100)->nullable();
            $table->boolean('is_admin_hidden')->default(false);
            $table->boolean('is_published')->default(false);
            $table->boolean('is_selling')->default(false);
            $table->integer('time_start')->unsigned(); // use unix timestamp
            $table->integer('time_end')->unsigned()->nullable(); // use unix timestamp
            $table->string('title');
            $table->string('location', 100)->nullable();
            $table->string('category', 100)->nullable();
            $table->mediumInteger('max_each_person')->unsigned()->default(5);
            $table->mediumInteger('max_sales')->unsigned();
            $table->mediumInteger('max_normal_sales')->unsigned()->nullable();
            $table->text('description')->nullable();
            $table->text('description_short')->nullable();
            $table->string('ticket_text')->nullable();
            $table->string('link')->nullable();
            $table->tinyInteger('age_restriction')->unsigned()->nullable();
            $table->binary('image');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::drop('events');
    }
};
