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
        Schema::table('ticketgroups', function (Blueprint $table) {
            $table->renameColumn('is_active', 'use_office');
            $table->renameColumn('is_published', 'use_web');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ticketgroups', function (Blueprint $table) {
            $table->renameColumn('use_office', 'is_active');
            $table->renameColumn('use_web', 'is_published');
        });
    }
};
