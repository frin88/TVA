import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, tap, filter, scan, retry, catchError } from 'rxjs/operators';



@Injectable({
  providedIn: 'root'
})
export class DataService {
  env = environment;
  constructor(private httpClient: HttpClient) {
  }


  public getData(): Observable<any> {

    const string_dates = this.getParamDates();

    console.log('requesting data from : ', string_dates.start, " to: " + string_dates.end);
    //filtering result for near_earth_objects
    return this.httpClient.get<any>(this.env.apiUrl + '?api_key=' + this.env.apiKey + '&start_date=' + string_dates.start + '&end_date=' + string_dates.end)
    .pipe(
      filter(data => data.near_earth_objects != null),
      map(res => res.near_earth_objects)
    );
  }


  private getParamDates(): any {
    //TODO sempre meglio installare moment ma la mia rete è lentissimaaaaa
    const res = { "start": "", "end": "" };

    // monday
    const d = new Date();
    const _day = d.getDay();
    const diff = d.getDate() - _day + (_day == 0 ? -6 : 1); // adjust when day is sunday
    const monday = new Date(d.setDate(diff));

    res.start = this.formatDataString(monday);

    //sunday
    const sunday = new Date(monday.setDate(monday.getDate() + 6));
    res.end = this.formatDataString(sunday);

    return res;

  }

  private formatDataString(data) {
    let day = ("0" + data.getDate()).slice(-2);
    let month = ("0" + (data.getMonth() + 1)).slice(-2);
    let year = data.getFullYear();
    return year + '-' + month + '-' + day;
  }





}
