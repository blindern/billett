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
        Schema::create('paymentsources', function (Blueprint $table) {
            $table->increments('id');
            $table->timestamp('created_at');
            $table->timestamp('updated_at');

            $table->integer('paymentgroup_id')->unsigned();
            $table->foreign('paymentgroup_id')->references('id')->on('paymentgroups');

            $table->boolean('is_deleted')->default(false);

            $table->integer('time_created')->unsigned(); // unix timestamp
            $table->integer('time_deleted')->unsigned()->nullable(); // unix timestamp

            $table->string('user_created')->nullable()->nullable();
            $table->string('user_deleted')->nullable()->nullable();

            $table->enum('type', ['cash', 'other'])->default('other');

            $table->string('title');
            $table->text('comment')->nullable();
            $table->decimal('amount', 7, 2);
            $table->text('data')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::drop('paymentsources');
    }
};
