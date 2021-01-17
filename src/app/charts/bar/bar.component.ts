import { Component, Input, OnInit } from '@angular/core';
import { Chart } from '../../models/Chart';
import * as d3 from "d3";



@Component({
  selector: 'app-bar',
  templateUrl: './bar.component.html',
  styleUrls: ['./bar.component.scss']
})
export class BarComponent implements OnInit {

@Input() data:any;
private svg;
private chart = new Chart();
private margin = this.chart.margin;

//inner
private width = this.chart.width - (this.margin * 2);
private height = this.chart.height  - (this.margin * 2);

  
constructor() { }

  ngOnInit(): void {
    this.createSvg();
    this.drawBars(this.data);
  }

  private createSvg(): void {
    this.svg = d3.select("figure#bar")
    .append("svg")
    .attr("width", this.chart.width)
    .attr("height",this.chart.height)
    .append("g")
    .attr("transform", "translate(" + this.margin + "," + this.margin + ")")
    .attr("class","main"); //appendo group to svg taking in account margin
}

private drawBars(data: any[]): void {

  // Create the X-axis band scale
  const x = d3.scaleBand()
  .domain(data.map(d => d.Framework))
  .range([0, this.width])
  .padding(0.2);

  // Draw the X-axis on the DOM
  this.svg.append("g")
  .attr("transform", "translate(0," + this.height + ")") //remember svg (0,0) 
  .call(d3.axisBottom(x))
  .selectAll("text")
  .attr("transform", "translate(-10,0)rotate(-45)") 
  .style("text-anchor", "end");


  // xlabel
  d3.select(".main")
  .append("text")
  .attr("x",  this.width/2)
  .attr("y", this.height + 70)
  .attr("font-size", "12px")
  .attr("text-anchor","middle")
  .text("BAR CHART")
  

////////////////////////////////////////////////////////////
 
//LINEAR SCALE
// Create the Y-axis band scale  MAP domain into range Linear
  const y = d3.scaleLinear()
  .domain([0, 200000])
  .range([this.height, 0]);

  //console.log(y.invert(48));

  //LOG SCALE
  //scaleLog quando c'è troppa varianza --> default:10 ; domain >0 
  // const y_log = d3.scaleLog()
  // .domain([0, 200000])
  // .range([this.height, 0])
  // .base(10);

//TIMESCALE
// const y_time = d3.scaleTime()
// .domain([new Date(2010,1,1),new Date(2010,1,1)])
// .range([this.height, 0]);

//ORDINALSCALE
//domain and range are array of discrete elements

  // Draw the Y-axis on the DOM
  this.svg.append("g")
  .call(d3.axisLeft(y).ticks(3));

  
  // Ylabel
  d3.select(".main")
  .append("text")
   .attr("x", -this.height/2)
   .attr("y",  -60)
  .attr("font-size", "12px")
  .attr("transform","rotate(-90)")
  .attr("text-anchor","middle")
  .text("STARS")
   

 /////////////////////////////////////////////////////////// 
  
 // Create and fill the bars
  this.svg.selectAll("bar") // per ora sembra che questo non selezioni niente
  .data(data)
  .enter()
  .append("rect")
  .attr("x", d => x(d.Framework))
  .attr("y", d => y(d.Stars))
  .attr("width", x.bandwidth())
  .attr("height", (d) => this.height - y(d.Stars))
  .attr("fill", "#d04a35")
  .exit()
  .remove("rect");
}

// private loadNewData(){
//   this.data=[
//     {"Framework": "Vue", "Stars": "166443", "Released": "2014"},
//     {"Framework": "React", "Stars": "150793", "Released": "2013"}];
//    // this.drawBars(this.data);
// }

}
