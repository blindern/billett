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
        DB::statement('ALTER TABLE tickets MODIFY pdf blob NULL');
        DB::statement('UPDATE tickets SET pdf = NULL WHERE pdf = ""');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('ALTER TABLE tickets MODIFY pdf blob');
    }
};
