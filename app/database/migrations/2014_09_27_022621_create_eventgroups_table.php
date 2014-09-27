<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateEventgroupsTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('eventgroups', function(Blueprint $table)
		{
			$table->increments('id');
			$table->timestamps();

			$table->boolean('is_active')->default(true);
			$table->string('title', 150);
			$table->string('sort_value', 30);
		});
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
		Schema::drop('eventgroups');
	}

}
