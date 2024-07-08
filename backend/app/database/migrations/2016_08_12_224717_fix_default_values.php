<?php

use Illuminate\Database\Migrations\Migration;

class FixDefaultValues extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        DB::statement('ALTER TABLE events MODIFY image blob DEFAULT NULL');

        DB::statement('ALTER TABLE orders MODIFY order_text_id varchar(30) DEFAULT NULL,
			                              MODIFY is_locked tinyint(1) NOT NULL DEFAULT 0,
			                              MODIFY is_valid tinyint(1) NOT NULL DEFAULT 0,
			                              MODIFY balance decimal(7,2) NOT NULL DEFAULT 0');

        DB::statement('ALTER TABLE payments MODIFY paymentgroup_id int(10) unsigned DEFAULT NULL');

        DB::statement('ALTER TABLE ticketgroups MODIFY use_web tinyint(1) NOT NULL DEFAULT 0');

        DB::statement('ALTER TABLE tickets MODIFY is_valid tinyint(1) NOT NULL DEFAULT 0,
			                               MODIFY is_revoked tinyint(1) NOT NULL DEFAULT 0,
			                               MODIFY `key` varchar(30) DEFAULT NULL');

        /* cannot use with Larvel 4.2
        Schema::table('orders', function ($table)
        {
            $table->string('order_text_id', 30)->nullable()->change();
            $table->boolean('is_locked')->default(false)->change();
            $table->boolean('is_valid')->default(false)->change();
            $table->decimal('balance', 7, 2)->default(0)->change();
        });

        Schema::table('ticketgroups', function ($table)
        {
            $table->boolean('use_web')->default(false)->change();
        });

        Schema::table('tickets', function ($table)
        {
            $table->boolean('is_valid')->default(false)->change();
            $table->boolean('is_revoked')->default(false)->change();
        });
        */
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        DB::statement('ALTER TABLE events MODIFY image blob');

        DB::statement('ALTER TABLE orders MODIFY order_text_id varchar(30),
			                              MODIFY is_locked tinyint(1) NOT NULL,
			                              MODIFY is_valid tinyint(1) NOT NULL,
			                              MODIFY balance decimal(7,2) NOT NULL');

        DB::statement('ALTER TABLE payments MODIFY paymentgroup_id int(10) unsigned NOT NULL');

        DB::statement('ALTER TABLE ticketgroups MODIFY use_web tinyint(1) NOT NULL');

        DB::statement('ALTER TABLE tickets MODIFY is_valid tinyint(1) NOT NULL,
			                               MODIFY is_revoked tinyint(1) NOT NULL,
			                               MODIFY `key` varchar(30) NOT NULL');

        /* cannot use with Laravel 4.2
        Schema::table('events', function ($table)
        {
            $table->binary('image')->nullable()->change();
        });

        Schema::table('orders', function ($table)
        {
            $table->string('order_text_id', 30)->nullable()->change();
            $table->boolean('is_locked')->default(false)->change();
            $table->boolean('is_valid')->default(false)->change();
            $table->decimal('balance', 7, 2)->default(0)->change();
        });

        Schema::table('ticketgroups', function ($table)
        {
            $table->boolean('use_web')->default(false)->change();
        });

        Schema::table('tickets', function ($table)
        {
            $table->boolean('is_valid')->default(false)->change();
            $table->boolean('is_revoked')->default(false)->change();
        });
        */
    }
}
