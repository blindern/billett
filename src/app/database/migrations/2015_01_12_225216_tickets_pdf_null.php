<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class TicketsPdfNull extends Migration {

    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        DB::statement('ALTER TABLE tickets MODIFY pdf blob NULL');
        DB::statement('UPDATE tickets SET pdf = NULL WHERE pdf = ""');
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        DB::statement('ALTER TABLE tickets MODIFY pdf blob');
    }

}
