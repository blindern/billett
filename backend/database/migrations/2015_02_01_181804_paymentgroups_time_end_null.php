<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::statement('ALTER TABLE paymentgroups MODIFY time_end int(10) unsigned NULL');
        DB::statement('UPDATE paymentgroups SET time_end = NULL WHERE time_end = 0');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('UPDATE paymentgroups SET time_end = 0 WHERE time_end IS NULL');
        DB::statement('ALTER TABLE paymentgroups MODIFY time_end int(10) unsigned NOT NULL');
    }
};
