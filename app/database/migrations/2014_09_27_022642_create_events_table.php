<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateEventsTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('events', function(Blueprint $table)
		{
			$table->increments('id');
			$table->timestamps();

			$table->integer('group_id')->unsigned();
			$table->foreign('group_id')->references('id')->on('eventgroups');

			$table->string('alias', 100)->nullable();
			$table->boolean('is_published')->default(false);
			$table->boolean('is_selling')->default(false);
			$table->integer('time_start')->unsigned(); // use unix timestamp
			$table->integer('time_end')->unsigned()->nullable(); // use unix timestamp
			$table->string('title');
			$table->string('location', 100)->nullable();
			$table->mediumInteger('max_each_person')->unsigned()->default(5);
			$table->mediumInteger('max_sales')->unsigned();
			$table->mediumInteger('max_normal_sales')->unsigned()->nullable();
			$table->text('description')->nullable();
			$table->text('description_short')->nullable();
			$table->string('ticket_text')->nullable();
			$table->string('link')->nullable();
			$table->tinyInteger('age_restriction')->unsigned()->nullable();
			$table->binary('image');
		});
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
		Schema::drop('events');
	}

}
