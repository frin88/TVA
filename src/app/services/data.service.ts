import { Injectable } from '@angular/core';
import * as d3 from "d3";

import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor() {
    
  }

  public getData(): any {
    //mockup data
    return [
      {"Framework": "Vue", "Stars": 166443, "Released": "2014"},
      {"Framework": "React", "Stars": 150793, "Released": "2013"},
      {"Framework": "Angular", "Stars": 62342, "Released": "2016"},
      {"Framework": "Backbone", "Stars": 27647, "Released": "2010"},
      {"Framework": "Ember", "Stars":21471, "Released": "2011"}
  ];
  
  }

}
