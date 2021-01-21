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
  private margin_side = 100;
  private margin_top = 100;
  //////////////////////////

  private hostElement; // Native element hosting the SVG container
  private g; // SVG Group element

  private x;
  private y;



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
  }

  private setScale() {

    const max_x = parseFloat(d3.max(this.data, d => d["velocity_ks"]));
    const max_y = parseFloat(d3.max(this.data, d => d["distance_au"]));

    this.x = d3.scaleLinear()
      .domain([0, max_x])
      .range([0, this.inner_width]);

    this.y = d3.scaleLinear()
      .domain([0, max_y])
      .range([this.inner_height, this.margin_top])
  }


  private addDots() {
    const circles = this.g.selectAll("circle")
      .data(this.data, d => d.name); //trak by name

    //EXIT old elements
    circles.exit()
      .attr("fill", "green")
      //.transition(t)
      .attr("r", 80)
      .attr("cy", d => this.y(d.distance_au))
      .remove();


    //ENTER create new
    circles
      .enter()
      .append("circle")
      .attr("fill", "#d04a35")
      //.attr("fll-opacity", 1)
      // .attr("r", d => this.d(d.diameter))
      .attr("r", 5)
      .attr("cy", d => this.y(d.distance_au))
      .attr("cx", d => this.x(d.velocity_ks));

  }

}
