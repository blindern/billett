<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->integer('eventgroup_id')->unsigned()->after('id');
        });

        DB::table('orders')->update(['eventgroup_id' => 1]);

        Schema::table('orders', function (Blueprint $table) {
            $table->foreign('eventgroup_id')->references('id')->on('eventgroups');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn('eventgroup_id');
        });
    }
};