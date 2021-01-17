import { Component, Input, OnInit } from '@angular/core';
import { Chart } from '../../models/Chart';
import * as d3 from "d3";



@Component({
  selector: 'app-bar',
  templateUrl: './bar.component.html',
  styleUrls: ['./bar.component.scss']
})
export class BarComponent implements OnInit {

  //@Input() data: any;
  private svg;
  private chart = new Chart();
  private margin = this.chart.margin;

  //inner
  private main;
  private width = this.chart.width - (this.margin * 2);
  private height = this.chart.height - (this.margin * 2);


  // scales and axes 
  private x;
  private xAxisGroup;
  private y;
  private yAxisGroup;
  private yLabel;

  private flag = true;
  private field = "Stars";
  private data =
    [
      { "Framework": "Vue", "Likes": 10, "Stars": 166443, "Released": "2014" },
      { "Framework": "React", "Likes": 100, "Stars": 150793, "Released": "2013" },
      { "Framework": "Angular", "Likes": 100, "Stars": 62342, "Released": "2014" },
      { "Framework": "Backbone", "Likes": 200, "Stars": 27647, "Released": "2013" },
      { "Framework": "Ember", "Likes": 50, "Stars": 21471, "Released": "2011" }
    ];

    public selectedYear =-1;


  constructor() {

  }

  ngOnInit(): void {

    this.createSvg();
    this.configureAxis();
    this.drawBars(this.data);

    this.field = this.flag ? "Likes" : "Stars";

    // this.updateInterval = d3.interval(() => {
    //   this.field = this.flag ? "Likes" : "Stars";
    //   this.flag = !this.flag;
    //   this.drawBars(this.data);
    // }, 2000);

  }

  private createSvg(): void {
    this.svg = d3.select("figure#bar")
      .append("svg")
      .attr("width", this.chart.width)
      .attr("height", this.chart.height)

    this.main = this.svg.append("g")
      .attr("transform", "translate(" + this.margin + "," + this.margin + ")")
      .attr("class", "main"); //appendo group to svg taking in account margin
  }


  private drawBars(data: any[]): void {

    const t = d3.transition().duration(750);

    //domain X for new data
    this.x.domain(data.map(d => d.Framework));

    // Draw the X-axis on the DOM
    const xAxisCall = d3.axisBottom(this.x);
    this.xAxisGroup
      .transition(t).call(xAxisCall)
      .selectAll("text")
      .attr("transform", "translate(-10,0)rotate(-45)")
      .style("text-anchor", "end");

    //domain Y for new data
    this.y.domain([0, d3.max(data, d => d[this.field] + 100)]);
    const YAxisCall = d3.axisLeft(this.y).ticks(3);
    // Draw the Y-axis on the DOM
    this.yAxisGroup
      .transition(t)
      .call(YAxisCall);

    const txt = this.field;
    this.yLabel.transition(t).text(txt);

    /////////////////////////////////////////////////////////// 
    // VIRTUAL SELECTOR
    // enter all datapoints in array that not exists on the page
    // exit all datapoints on the page but not in the datarray
    // groups all the elements on the screen
    ////////////////////////////////////////

    //DATA JOIN
    const rects = this.main.selectAll("rect").data(data, d => d.Framework); //trak by framework

    //EXIT old elements
    rects.exit()
    .attr("fill","red")
    .transition(t)
      .attr("height",0)
      .attr("y",this.y(0))
      .remove();


    //ENTER create new
    rects
      .enter()
      .append("rect")
      .attr("x", d => this.x(d.Framework))  
      .attr("width", this.x.bandwidth())  
      .attr("fill", "#d04a35")
      .attr("fll-opacity", 1)
      .attr("height",0)
      .attr("y",this.y(0))
      .merge(rects) // MERGE UPDATE remaining elements --> merge eseue sui nuovi e su quelli che rimangono
      .transition(t)
       .attr("y", d => this.y(d[this.field]))
       .attr("x", d => this.x(d.Framework)) 
       .attr("width", this.x.bandwidth())   
       .attr("height", (d) => this.height - this.y(d[this.field]))
       .attr("fll-opacity", 0)


  }
  private configureAxis() {

    this.x = d3.scaleBand()
      .range([0, this.width])
      .padding(0.2);

    this.xAxisGroup = this.main.append("g")
      .attr("transform", "translate(0," + this.height + ")") //remember svg (0,0) 

    this.y = d3.scaleLinear()
      .range([this.height, 0]);

    this.yAxisGroup = this.main.append("g");

    this.drawAxisLabels();


  }
  private drawAxisLabels(): void {

    // xlabel
    this.main
      .append("text")
      .attr("x", this.width / 2)
      .attr("y", this.height + 70)
      .attr("font-size", "12px")
      .attr("text-anchor", "middle")
      .text("BAR CHART")

    // Ylabel
    this.yLabel = this.main
      .append("text")
      .attr("x", -this.height / 2)
      .attr("y", -60)
      .attr("font-size", "12px")
      .attr("transform", "rotate(-90)")
      .attr("text-anchor", "middle")
      .text("STARS");

  }


  public onReleaseChange(event) :void
  {
    // console.log(this.selectedYear);
    const filterd_data = this.selectedYear > -1 ? this.data.filter(d=> parseInt(d.Released) === this.selectedYear) :this.data;
    this.drawBars(filterd_data);

  }

  
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
}