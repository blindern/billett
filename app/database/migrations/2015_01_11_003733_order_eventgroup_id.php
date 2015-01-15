<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class OrderEventgroupId extends Migration {

    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('orders', function(Blueprint $table) {
            $table->integer('eventgroup_id')->unsigned()->after('id');
        });

        DB::table('orders')->update(array('eventgroup_id' => 1));

        Schema::table('orders', function(Blueprint $table) {
            $table->foreign('eventgroup_id')->references('id')->on('eventgroups');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('orders', function(Blueprint $table)
        {
            $table->dropColumn('eventgroup_id');
        });
    }

}
