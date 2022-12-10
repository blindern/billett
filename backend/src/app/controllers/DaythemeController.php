<?php

use Blindern\UKA\Billett\Daytheme;
use Blindern\UKA\Billett\Eventgroup;
use Blindern\UKA\Billett\Helpers\ModelHelper;

class DaythemeController extends Controller {
    public function index() {
        $class = ModelHelper::getModelPath('Daytheme');
        return $class::orderBy('sort_value')->get();
    }

    /**
     * Create new daytheme
     */
    public function store()
    {
        $daytheme = $this->validateInputAndUpdate(new Daytheme, true);
        if (!($daytheme instanceof Daytheme)) return $daytheme;
        $daytheme->save();
        return $daytheme;
    }

    /**
     * Update daytheme
     */
    public function update($id)
    {
        $daytheme = $this->validateInputAndUpdate(Daytheme::findOrFail($id), true);
        if (!($daytheme instanceof Daytheme)) return $daytheme;
        $daytheme->save();
        return $daytheme;
    }

    /**
     * Validate input data for new and update methods and update eventgroup (but not save)
     */
    private function validateInputAndUpdate(Daytheme $daytheme, $is_new)
    {
        $fields = array(
            'title' => '',
	    'eventgroup_id' => 'integer',
	    'date' => 'integer'
        );

        if ($is_new) {
            $fields['title'] = 'required';
            $fields['eventgroup_id'] = 'required|integer';
            $fields['date'] = 'required|integer';
        }

	$daytheme->date = strtotime($daytheme->date);
	$daytheme->title = $daytheme->date;

        $validator = \Validator::make(Input::all(), $fields);
        if ($validator->fails()) {
//            return \Response::json('data validation failed', 400);
        }

        $list = array(
            'title',
	    'eventgroup_id',
	    'date'
        );

        foreach ($list as $field) {
            if (Input::exists($field) && Input::get($field) != $daytheme->{$field}) {
                $val = Input::get($field);
                if ($val === '') $val = null;
                $daytheme->{$field} = $val;
            }
        }

        return $daytheme;

    }

}
