import { Component, Input, OnInit, ElementRef, ViewEncapsulation, SimpleChanges, OnChanges } from '@angular/core';
import { Chart } from '../../models/Chart';
import * as d3 from "d3";

@Component({
  selector: 'app-scatter',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './scatter.component.html',
  styleUrls: ['./scatter.component.scss']
})
export class ScatterComponent implements OnInit {


  //X VELOCITA
  //Y DISTANZA
  @Input() data: any;
  private svg;

  ///////////////////////

  // size of svg element
  private viewport_width;
  private viewport_height;
  // size of viz
  private inner_width;
  private inner_height;
  //margin (inner = viewport - margin*2)
  private margin_side = 50;
  private margin_top = 60;
  //////////////////////////

  private hostElement; // Native element hosting the SVG container
  private g; // SVG Group element

  // scales
  private x;
  private y;
  private d;

  //transition
  private t;



  private selectedDay = '2021-01-16';

  constructor(private elRef: ElementRef) {
    this.hostElement = this.elRef.nativeElement;
  }

  ngOnInit(): void {


    this.data = this.data[this.selectedDay];
    console.log('scatter alive', this.data);
    this.updateChart(this.data);

  }

  public updateChart(data: number[]) {
    if (!this.svg) {
      this.createChart(data);
      return;
    }
  }

  private createChart(data) {

    this.setChartDimensions();

    this.setScale();

    this.addGraphicsElement();


    this.addDots();

  }


  private setChartDimensions() {

    this.svg = d3.select(this.hostElement).append('svg')
      .attr('width', '100%')
      .attr('height', '100%');

    this.viewport_width = parseInt(this.svg.style("width"));
    this.viewport_height = parseInt(this.svg.style("height"));

    this.inner_width = parseInt(this.svg.style("width")) - (this.margin_side * 2);
    this.inner_height = parseInt(this.svg.style("height")) - (this.margin_top * 2);

    // set viewbox = viewport => zoom = 0, resizable
    this.svg.attr('viewBox', '0 0 ' + this.viewport_width + ' ' + this.viewport_height);
    //console.log("svg width ", inner_width, " svg height", inner_height);
  }


  private addGraphicsElement() {

    this.g = this.svg.append("g")
      .attr("transform", "translate(0,0)");


    ///////////////////////////////

    const yAxisGenerator = d3.axisLeft(this.y)
      .ticks(3) // How many gridlines
      .tickSizeInner(-this.inner_width) // Ticks in between the outer ticks
      .tickSizeOuter(0);// Ticks on both outer sides


    const yAxis = this.g
      .append("g")
      .attr("transform", "translate(0,0)")
      .call(yAxisGenerator);

    //hide domain and labels
    yAxis.selectAll("text").remove()
    yAxis.select(".domain").remove();

    /////////////////////
    this.defineDotGradient();


  }

  private setScale() {

    const max_x = parseFloat(d3.max(this.data, d => d["velocity_ks"]));
    const max_y = parseFloat(d3.max(this.data, d => d["distance_au"]));

    const max_d = parseFloat(d3.max(this.data, d => d["diameter"]));
    const min_d = parseFloat(d3.min(this.data, d => d["diameter"]));

    console.log(min_d, max_d);

    this.x = d3.scaleLinear()
      .domain([0, max_x])
      .range([0, this.inner_width]);

    this.y = d3.scaleLinear()
      .domain([0, max_y])
      .range([this.inner_height, this.margin_top]);

    this.d = d3.scaleSqrt()
      .domain([0, max_d])
      .range([1, 50]);


  }


  private defineDotGradient() {

    const defs = this.svg.append("defs");

    //Create  gradient
    defs.append("radialGradient")
      .attr("id", "dot-gradient")
      .attr("cx", "50%")	//not really needed, since 50% is the default
      .attr("cy", "50%")
      .attr("r", "50%")
      .selectAll("stop")
      .data([
        { offset: "0%", color: "rgba(42,245,152,0)" },
        { offset: "50%", color: "rgba(42,245,152,0.03)" },
        { offset: "100%", color: "rgba(42,245,152,0.06)" },
      ])
      .enter().append("stop")
      .attr("offset", function (d) { return d.offset; })
      .attr("stop-color", function (d) { return d.color; });
  }

  private addDots() {

    this.t = d3.transition().duration(750);


    const circles = this.g.selectAll("circle")
      .data(this.data, d => d.name); //trak by name

    //EXIT old elements
    circles.exit()
      .attr("fill", "green")
      .transition(this.t)
      .attr("r", 0)
      .remove();


    //ENTER create new
    circles
      .enter()
      .append("circle")
      .attr("class", "dot")
      .style("fill", "url(#dot-gradient)")
      .attr("r", d => this.d(d.diameter))
      .attr("cy", d => this.y(d.distance_au))
      .attr("cx", d => this.x(d.velocity_ks))


    const centers = this.g.selectAll(".center")
      .data(this.data, d => d.name)
      .enter()
      .append("circle")
      .attr("class", "center")
      .style("fill", "#2AF598")
      .attr("r", 1)
      .attr("cy", d => this.y(d.distance_au))
      .attr("cx", d => this.x(d.velocity_ks));
  }




}
