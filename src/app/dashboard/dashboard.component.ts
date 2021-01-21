import { Component, OnInit } from '@angular/core';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  data: any;
  data_array = new Array();
  days = new Array();

  constructor(private dataService: DataService) {

    this.dataService.getData().subscribe((res: any) => {
      console.log("untouched data", res);

      for (let key in res) {
        res[key] = res[key].map(function (neo, i) {
          return {
            "distance_au": parseFloat(neo.close_approach_data[0].miss_distance.astronomical),
            "velocity_ks": parseFloat(neo.close_approach_data[0].relative_velocity.kilometers_per_second),
            "name": neo.name,
            "magnitude": neo.absolute_magnitude_h,
            "diameter": (parseFloat(neo.estimated_diameter.kilometers.estimated_diameter_min) + parseFloat(neo.estimated_diameter.kilometers.estimated_diameter_max)) / 2 //average
          }

        });
        this.days.push(key);
      }
      this.data = res;
    });


  }

  ngOnInit(): void {


  }

}
