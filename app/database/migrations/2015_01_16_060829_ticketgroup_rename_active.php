<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class TicketgroupRenameActive extends Migration {

    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('ticketgroups', function(Blueprint $table)
        {
            $table->renameColumn('is_active', 'use_office');
            $table->renameColumn('is_published', 'use_web');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('ticketgroups', function(Blueprint $table)
        {
            $table->renameColumn('use_office', 'is_active');
            $table->renameColumn('use_web', 'is_published');
        });
    }

}
