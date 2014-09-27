<?php

use Blindern\UKA\Billett\Event;

class EventsController extends Controller {
	public function getUpcoming()
	{
		return Event::with('eventgroup')->get();
	}

	public function getEvent($id_or_alias)
	{
		$ev = Event::find($id_or_alias);
		if (!$ev)
		{
			$ev = Event::where('alias', $id_or_alias)->firstOrFail();
		}

		$ev->load('eventgroup');
		$ev->load('ticketgroups');

		return $ev;
	}
}