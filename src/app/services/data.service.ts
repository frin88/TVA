import { Injectable } from '@angular/core';
import {environment} from '../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';



@Injectable({
  providedIn: 'root'
})
export class DataService {

 
  env = environment;

  constructor(private httpClient: HttpClient) {
  }


  public getData(): Observable<any> {

    //let today = new Date();
    const today= new Date(new Date().setDate(new Date().getDate() - 7));

    let day = ("0" + today.getDate()).slice(-2);
    let month = ("0" + (today.getMonth() + 1)).slice(-2);
    let year = today.getFullYear();
    const string_date = year + '-' + month + '-' + day;

    console.log('requesting data for sart_date : ' , string_date);
    // near_earth_objects
    return this.httpClient.get<any>(this.env.apiUrl + '?api_key=' + this.env.apiKey + '&start_date='+ string_date);

    

  }


  // public getData(): any {
  // //   //mockup data
  // //   return [
  // //     {"Framework": "Vue", "Stars": 166443, "Released": "2014"},
  // //     {"Framework": "React", "Stars": 150793, "Released": "2013"},
  // //     {"Framework": "Angular", "Stars": 62342, "Released": "2016"},
  // //     {"Framework": "Backbone", "Stars": 27647, "Released": "2010"},
  // //     {"Framework": "Ember", "Stars":21471, "Released": "2011"}
  // // ]; 
  // }

}
