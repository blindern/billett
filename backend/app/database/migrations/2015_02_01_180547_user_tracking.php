<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;

class UserTracking extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('user_created')->nullable()->after('time');
        });
        Schema::table('payments', function (Blueprint $table) {
            $table->string('user_created')->nullable()->after('time');
        });
        Schema::table('tickets', function (Blueprint $table) {
            $table->string('user_valid')->nullable()->after('revoked_paymentgroup_id');
            $table->string('user_revoked')->nullable()->after('user_valid');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn('user_created');
        });
        Schema::table('payments', function (Blueprint $table) {
            $table->dropColumn('user_created');
        });
        Schema::table('tickets', function (Blueprint $table) {
            $table->dropColumn('user_valid');
            $table->dropColumn('user_revoked');
        });
    }
}
