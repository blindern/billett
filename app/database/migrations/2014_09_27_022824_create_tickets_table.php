<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTicketsTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('tickets', function(Blueprint $table)
		{
			$table->increments('id');
			$table->timestamps();

			$table->integer('order_id')->unsigned();
			$table->foreign('order_id')->references('id')->on('orders');

			$table->integer('event_id')->unsigned();
			$table->foreign('event_id')->references('id')->on('events');

			$table->integer('ticketgroup_id')->unsigned();
			$table->foreign('ticketgroup_id')->references('id')->on('ticketgroups');

			$table->integer('time')->unsigned(); // unix timestamp
			$table->integer('expire')->unsigned()->nullable(); // unix timestamp
			$table->boolean('is_valid');
			$table->boolean('is_revoked');
			$table->integer('used')->unsigned()->nullable(); // unix timestamp
			$table->string('key', 30);
			$table->binary('pdf');
		});
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
		Schema::drop('tickets');
	}

}
