import { Component, Input, OnInit } from '@angular/core';
import { Chart } from '../../models/Chart';
import * as d3 from "d3";

@Component({
  selector: 'app-scatter',
  templateUrl: './scatter.component.html',
  styleUrls: ['./scatter.component.scss']
})
export class ScatterComponent implements OnInit {

  @Input() data: any;
  private svg;
  // private chart = new Chart();
  // private margin = this.chart.margin;

  //inner
  private main;
  // private width = this.chart.width - (this.margin * 2);
  // private height = this.chart.height - (this.margin * 2);



  // scales and axes 
  private x;
  private xAxisGroup;
  private y;
  private yAxisGroup;
  private yLabel;

  constructor() { }

  ngOnInit(): void {

    console.log('scatter alive');
    //this.createSvg();
    // this.configureAxis();
    // this.drawScatter(this.data);

  }

  private createSvg(): void {


    this.svg = d3.select("#figure#scatter").append("svg")
      .attr("width", '100%')
      .attr("height", '100%')
     // .call(this.responsivefy);



    // this.svg = d3.select("figure#scatter")
    //   .append("svg")
    //   .attr("width", this.chart.width)
    //   .attr("height", this.chart.height)

    // this.main = this.svg.append("g")
    //   .attr("transform", "translate(" + this.margin + "," + this.margin + ")")
    //   .attr("class", "main"); //appendo group to svg taking in account margin
  }

 
  private responsivefy() {
    // get container + svg aspect ratio

    const svg = this.svg;
    var container = d3.select(svg.node().parentNode),
      width = parseInt(svg.style("width")),
      height = parseInt(svg.style("height")),
      aspect = width / height;

    // add viewBox and preserveAspectRatio properties,
    // and call resize so that svg resizes on inital page load
    svg.attr("viewBox", "0 0 " + width + " " + height)
      .attr("perserveAspectRatio", "xMinYMid")
      .call(resize);

    // to register multiple listeners for same event type, 
    // you need to add namespace, i.e., 'click.foo'
    // necessary if you call invoke this function for multiple svgs
    // api docs: https://github.com/mbostock/d3/wiki/Selections#on
    d3.select(window).on("resize." + container.attr("id"), resize);

    // get width of container and resize svg to fit it
    function resize() {
      var targetWidth = parseInt(container.style("width"));
      svg.attr("width", targetWidth);
      svg.attr("height", Math.round(targetWidth / aspect));
    }
  }




}
