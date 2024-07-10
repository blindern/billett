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
        Schema::create('payments', function (Blueprint $table) {
            $table->increments('id');
            $table->timestamp('created_at');
            $table->timestamp('updated_at');

            $table->integer('order_id')->unsigned();
            $table->foreign('order_id')->references('id')->on('orders');

            $table->integer('group_id')->unsigned();
            $table->foreign('group_id')->nullable()->references('id')->on('paymentgroups');

            $table->integer('time')->unsigned(); // unix timestamp
            $table->string('type', 20);
            $table->decimal('amount', 7, 2);
            $table->decimal('fee', 7, 2)->nullable();
            $table->string('transaction_id', 100)->nullable();
            $table->string('status', 100)->nullable();
            $table->text('data')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::drop('payments');
    }
};
