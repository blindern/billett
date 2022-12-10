<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class PaymentsDeleteFee extends Migration {

    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('payments', function(Blueprint $table)
        {
            $table->dropColumn('fee');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('payments', function(Blueprint $table)
        {
            $table->decimal('fee', 7, 2)->nullable()->after('amount');
        });
    }

}
