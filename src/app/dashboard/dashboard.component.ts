import { Component, OnInit } from '@angular/core';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  data:any;
  days:any; 

  constructor(private dataService :DataService) { 
    // console.log('dashboard component is alive')
   
    this.dataService.getData().subscribe((res: any) => {
      this.data = res;
      console.log(this.data);

      for (let key in this.data) {
        let value = this.data[key];
        this.days.push(key);
        console.log('ex', value,key);
    }

    });


  }

  ngOnInit(): void {

   
  }

}
