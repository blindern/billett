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
        Schema::table('paymentgroups', function (Blueprint $table) {
            $table->integer('eventgroup_id')->after('id')->unsigned()->references('id')->on('eventgroups');
            $table->string('user_created')->nullable();
            $table->string('user_closed')->nullable();
            $table->text('description')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('paymentgroups', function (Blueprint $table) {
            $table->dropColumn('eventgroup_id');
            $table->dropColumn('user_created');
            $table->dropColumn('user_closed');
            $table->dropColumn('description');
        });
    }
};
