import { Injectable } from '@angular/core';
import {environment} from '../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import { map, tap, filter, scan, retry, catchError } from 'rxjs/operators';



@Injectable({
  providedIn: 'root'
})
export class DataService {
 env = environment;
  constructor(private httpClient: HttpClient) {
  }


  public getData(): Observable<any> {

    const today= new Date(new Date().setDate(new Date().getDate() - 7));
    let day = ("0" + today.getDate()).slice(-2);
    let month = ("0" + (today.getMonth() + 1)).slice(-2);
    let year = today.getFullYear();
    const string_date = year + '-' + month + '-' + day;

    console.log('requesting data for sart_date : ' , string_date);
    //filtering result for near_earth_objects
    return this.httpClient.get<any>(this.env.apiUrl + '?api_key=' + this.env.apiKey + '&start_date='+ string_date).pipe(
      filter(data => data.near_earth_objects !=null ),
      map(res => res.near_earth_objects)
    );
   }	
  




}
