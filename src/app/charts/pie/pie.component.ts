// import { Component, Input, OnInit } from '@angular/core';
// import { Chart } from '../../models/Chart';
// import * as d3 from "d3";

// @Component({
//   selector: 'app-pie',
//   templateUrl: './pie.component.html',
//   styleUrls: ['./pie.component.scss']
// })
// export class PieComponent implements OnInit {

//   @Input() data:any; 
//   private svg;
//   private chart = new Chart();
//   // The radius of the pie chart is half the smallest side
//   private radius = Math.min(this.chart.width, this.chart.height) / 2 - this.chart.margin;
//   private colors;

//   constructor() { }

//   ngOnInit(): void {
//     this.createSvg();
//     this.createColors();
//     this.drawChart();
// }
//   private createSvg(): void {
//     this.svg = d3.select("figure#pie")
//     .append("svg")
//     .attr("width", this.chart.width)
//     .attr("height", this.chart.height)
//     .append("g")
//     .attr(
//       "transform",
//       "translate(" + this.chart.width / 2 + "," + this.chart.height/ 2 + ")"
//     );
// }

// private createColors(): void {
//   this.colors = d3.scaleOrdinal()
//   .domain(this.data.map(d => d.Stars.toString()))
//   .range(["#c7d3ec", "#a5b8db", "#879cc4", "#677795", "#5a6782"]);
// }


// private drawChart(): void {
//   // Compute the position of each group on the pie:
//   const pie = d3.pie<any>().value((d: any) => Number(d.Stars));

//   // Build the pie chart
//   this.svg
//   .selectAll('pieces')
//   .data(pie(this.data))
//   .enter()
//   .append('path')
//   .attr('d', d3.arc()
//     .innerRadius(0)
//     .outerRadius(this.radius)
//   )
//   .attr('fill', (d, i) => (this.colors(i)))
//   .attr("stroke", "#121926")
//   .style("stroke-width", "1px");

//   // Add labels
//   const labelLocation = d3.arc()
//   .innerRadius(50)
//   .outerRadius(this.radius);

//   this.svg
//   .selectAll('pieces')
//   .data(pie(this.data))
//   .enter()
//   .append('text')
//   .text(d => d.data.Framework)
//   .attr("transform", d => "translate(" + labelLocation.centroid(d) + ")")
//   .style("text-anchor", "middle")
//   .style("font-size", 10);
// }

// }
