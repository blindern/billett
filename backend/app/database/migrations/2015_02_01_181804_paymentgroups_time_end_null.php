<?php

use Illuminate\Database\Migrations\Migration;

class PaymentgroupsTimeEndNull extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        DB::statement('ALTER TABLE paymentgroups MODIFY time_end int(10) unsigned NULL');
        DB::statement('UPDATE paymentgroups SET time_end = NULL WHERE time_end = 0');
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        DB::statement('UPDATE paymentgroups SET time_end = 0 WHERE time_end IS NULL');
        DB::statement('ALTER TABLE paymentgroups MODIFY time_end int(10) unsigned NOT NULL');
    }
}
