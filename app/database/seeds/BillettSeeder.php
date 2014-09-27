<?php

use \Blindern\UKA\Billett\EventGroup;

class BillettSeeder extends Seeder {
	public function run()
	{
		$eg = new EventGroup;
		$eg->title = 'UKA på Blindern 2015';
		$eg->sort_value = '2015-1-uka';
		$eg->save();
	}
}