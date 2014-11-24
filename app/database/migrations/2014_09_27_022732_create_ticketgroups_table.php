<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTicketgroupsTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('ticketgroups', function(Blueprint $table)
		{
			$table->increments('id');
			$table->timestamps();

			$table->integer('event_id')->unsigned();
			$table->foreign('event_id')->references('id')->on('events');

			$table->boolean('is_active')->default(true);
			$table->boolean('is_published');
			$table->boolean('is_normal')->default(true);
			$table->string('title');
			$table->string('ticket_text')->nullable();
			$table->decimal('price', 7, 3);
			$table->decimal('fee', 7, 3)->nullable();
			$table->mediumInteger('limit')->unsigned()->nullable();
		});
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
		Schema::drop('ticketgroups');
	}

}
