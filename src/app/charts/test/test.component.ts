import { Component, Input, OnInit, ElementRef, ViewEncapsulation, SimpleChanges, OnChanges } from '@angular/core';

import * as d3 from "d3";
@Component({
  selector: 'app-test',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css']
})
export class TestComponent implements OnInit {

  constructor(private elRef: ElementRef) {
    this.hostElement = this.elRef.nativeElement;
  }
  private hostElement; // Native element hosting the SVG container
  private g; // SVG main Group element
  private svg;
  // size of svg element
  private viewport_width;
  private viewport_height;

  // size of viz
  private inner_width;
  private inner_height;

  //margin => inner = viewport - margin*2
  private margin_side = 10;
  private margin_top = 10;

  ngOnInit(): void {
    this.setChartDimensions();
  }



  private setChartDimensions() {

    this.svg = d3.select(this.hostElement).append('svg')
      .attr('width', '100%')
      .attr('height', '100%').attr("id", "mysvg")

      console.log("", this.hostElement);

    this.viewport_width = parseInt(this.svg.style("width"));
    this.viewport_height = parseInt(this.svg.style("height"));

    this.inner_width = parseInt(this.svg.style("width")) - (this.margin_side * 2);
    this.inner_height = parseInt(this.svg.style("height")) - (this.margin_top * 2);

    // set viewbox = viewport => zoom = 0, resizable
   this.svg.attr('viewBox', '0 0 ' + this.viewport_width*0.9 + ' ' + this.viewport_height*0.9);
    //this.svg.attr('viewBox', '0 0 100 100');// + this.viewport_width + ' ' + this.viewport_height);
    this.svg.attr("preserveAspectRatio", "xMinYMid");
    console.log("svg width ", this.viewport_width, " svg height", this.viewport_height);
    // console.log("svg width ", this.inner_width, " svg height", this.inner_height);
 
 
    this.g = this.svg.append("g")
    .attr("transform", "translate(0,0)") // move down to make space to buttons -> buttons are on separate g because they dont'have to overlap chart   
    .attr("class", "main");


    this.g.append("rect")
    .attr("x",0)
    .attr("y",0)
    .attr("height",10)
    .attr("width", this.inner_width/4 )
    .attr("fill","red");

    
    this.g.append("rect")
    .attr("x", this.inner_width/4  + 500)
    .attr("y",0)
    .attr("height",10)
    .attr("width", this.inner_width /4)
    .attr("fill","yellow");
 
 
  
  }


}
