<?php namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Frame;

class Movement extends Model {
    
	protected $fillable = ['athlete_id', 'name'];
	
	public function frames()
    {
        return $this->hasMany('App\Models\Frame');
    }

    public function fmsforms()
    {
        return $this->hasMany('App\Models\FMSForm');
    }
}
