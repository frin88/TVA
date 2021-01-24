import { Component, Input, OnInit, ElementRef, ViewEncapsulation, SimpleChanges, OnChanges } from '@angular/core';
import * as d3 from "d3";

@Component({
  selector: 'app-top5',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './top5.component.html',
  styleUrls: ['./top5.component.scss']
})
export class Top5Component implements OnInit {

  @Input() _data: any;

  ///////////////////////

  private hostElement; // Native element hosting the SVG container
  private g; // SVG Group element
  private svg;

  // size of svg element
  private viewport_width;
  private viewport_height;

  // size of viz
  private inner_width;
  private inner_height;

  //margin => inner = viewport - margin*2
  private margin_side = 50;
  private margin_top = 40;
  //////////////////////////
  private chartOffset_y = 40;
  private text_from_rects=70; // distanza tra neo-info e rects

  //leged items
  private dim = 10; // side of squares in legen
  private xy_first = [0, 30]; //coord of first sq
  private dist = 20; // distance between sq
 
  //scales
  private m_max = 35; // controls size of fixed outer rects
  private howmany = 5;// numbers of items to be fitted
  private m;

  private data = new Array();
  //// in alto quello con magnitudine più bassa
  // A destra viene visualizzata una selezione di 5 asteroidi sul totale della settimana in ordine crescente di magnitudine.
  // La magnitudine è inversamente proporzionale alla luminosità
  // (l'asteroide più luminoso sarà dunque quello con magnitudine più bassa).
  // Il dato (magnitudine) è rappresentato dall'area colorata del rettangolo, rapportata ad una superficie totale fissa.

 

  constructor(private elRef: ElementRef) {
    this.hostElement = this.elRef.nativeElement;
  }

  ngOnInit(): void {

    this.filterData();
    this.updateChart(this.data);

  }


  public filterData() {

    let tmpData = [];
    let sortedData;
    for (let key in this._data) {
      // TODO qui sarebe meglio usare reduce...
      this._data[key].forEach(neo => {
        tmpData = [...tmpData, neo];
      });
    }
    //order by
    sortedData = tmpData.slice().sort((a, b) => d3.ascending(a.magnitude, b.magnitude))
    this.data = sortedData.slice(0, this.howmany);

    console.log("data top" + this.howmany + " sorted", sortedData.slice(0, this.howmany));
    // console.log("data ", tmpData);
    // console.log("data sorted", sortedData);


  }

  public updateChart(data: number[]) {
    if (!this.svg) {
      this.createChart(data);
      return;
    }
    else {
      this.setScale();
      this.addRects();
    }
  }

  private createChart(data) {

    this.setChartDimensions();
    this.setScale();
    this.addGraphicsElement();
    this.addRects();

  }

  private setScale() {

    const domain_max = parseFloat(d3.max(this.data, d => d["magnitude"]));
    const domain_min = parseFloat(d3.min(this.data, d => d["magnitude"]));

    // oppure inverScale ?

    this.m = d3.scaleSqrt()
      .domain([domain_min, domain_max]) // inversamente proporzionale
      .range([this.m_max, 1]);


    // console.log("MAX " + domain_max, this.m(domain_max));
    // console.log("MIN " + domain_min, this.m(domain_min));


  }

  private setChartDimensions() {

    this.svg = d3.select(this.hostElement).append('svg')
      .attr('width', '100%')
      .attr('height', '100%');

    this.viewport_width = parseInt(this.svg.style("width"));
    this.viewport_height = parseInt(this.svg.style("height"));

    this.inner_width = parseInt(this.svg.style("width")) - (this.margin_side * 2);
    this.inner_height = parseInt(this.svg.style("height")) - (this.margin_top * 2); //- this.chartOffset - this.btnGroup_offset_y;

    // set viewbox = viewport => zoom = 0, resizable
    this.svg.attr('viewBox', '0 0 ' + this.viewport_width + ' ' + this.viewport_height);
    this.svg.attr("preserveAspectRatio", "xMinYMid");
    console.log("svg width ", this.viewport_width, " svg height", this.viewport_height);
    // console.log("svg width ", this.inner_width, " svg height", this.inner_height);
  }
 
  private addGraphicsElement() {


    // main group
    this.g = this.svg.append("g")
      //.attr("transform", "translate(0,0)")
      .attr("transform", "translate(0," + this.chartOffset_y + ")") // move down to make space to buttons
      .attr("class", "main");

    this.createCustomDef();

    this.addLegend();

  }


  private addRects() {

    const _that = this;
    const t_enter = d3.transition().duration(750);
    const t_exit = d3.transition().duration(500);

    //join
    const rect_wrap = this.g
      .selectAll('.rect-wrap')
      .data(_that.data, d => d.name)
      .join(
        function (group) {

          //ENTER
          let enter = group.append("g")
            .attr("class", "rect-wrap")
            .attr("transform", function (d, i) {
              let xRot = _that.x_center(); //set center point for rotation
              let yRot = _that.y_center(i);
              return `rotate(-45, ${xRot},  ${yRot} )`
            });

          enter.append("rect")
            .attr("class", "rect-fixed")
            .style("filter", "url(#glow)")
            .attr("x", () => _that.x_outer()) // x rettangoli fuori fixed
            .attr("y", (d, i) => _that.y_outer(i)) // la y dipende dal loop
            .transition(t_enter)
            .attr("height", d => _that.m_max)
            .attr("width", d => _that.m_max)


          enter.append("rect")
            .attr("class", "rect-inner")
            .attr("x", (d) => (_that.x_inner(d)))  //x rettangoli dentro dipende da outer e data
            .attr("y", (d, i) => _that.y_inner(d, i))// la y dipende dal loop e da data
            .transition(t_enter)
            .attr("height", d => _that.m(d.magnitude))
            .attr("width", d => _that.m(d.magnitude))

          enter.append("circle")
            .attr("class", "center")
            .attr("cx", d => _that.x_center())
            .attr("cy", (d, i) => _that.y_center(i))
            .transition(t_enter)
            .attr("r", 1);

            const f = d3.format(".2f")

          //// legend ////
          enter = group.append("g")
            .attr("class", "neo-info");

          let text = enter.append("text")
            .attr("class", "text row")
            .attr("x", (d) => _that.x_outer() + _that.text_from_rects)
            .attr("y", (d, i) => _that.y_outer(i))
            .attr("text-anchor", "start");

          text
            .append("tspan")
            .text((d) => "Name: " + d.name)
            .attr("x", (d) => _that.x_outer() + _that.text_from_rects)
            .attr("y", (d, i) => _that.y_outer(i));

          text
            .append("tspan")
            .text((d) => "Diameter: " + f(d.diameter))
            .attr("x", (d) => _that.x_outer() + _that.text_from_rects)
            .attr("dy", 20)

          text
            .append("tspan")
            .text((d) => "Magnitude: " + d.magnitude)
            .attr("x", (d) => _that.x_outer() + _that.text_from_rects)
            .attr("dy", 20)

          return enter;
        },
        function (group) {
          //UPDATE
          //nothing to update here
        },
        function (group) {
          //EXIT
          group.transition(t_exit)
            .remove();
          return group;

        }
      );
  }

//heleper functions for coord
  private x_outer() {
    return this.inner_width / 2 - this.margin_side;

  }

  private y_outer(i) {
    return this.inner_height / this.howmany + (i * 110);
  }

  private x_inner(d) {
    return this.x_outer() + (this.m_max - this.m(d.magnitude)) / 2;
  }

  private y_inner(d, i) {
    return this.y_outer(i) + (this.m_max - this.m(d.magnitude)) / 2;
  }

  private x_center() {
    return this.x_outer() + this.m_max / 2;
  }

  private y_center(i) {
    return this.y_outer(i) + this.m_max / 2
  }

// 
 
  private addLegend() {

    // add legend group
    const legendGroup = this.svg.append("g")
      .attr("class", "legend")
      .attr("transform", "translate(" + this.x_outer() + ", " + this.margin_top + ")"); // inline with viz



    let txt = legendGroup
      .append("text");

    txt.append("tspan")
      .attr("class", "bold")
      .attr("x", 0)
      .attr("y", 0)
      .attr("text-anchor", "start")
      .text("MAGNITUDE");

    txt
      .append("tspan")
      .text("(H)")
      .attr("class", "text")
      .attr("dx", 3);

    ///////////////////////////////////


    const _that = this;
    //ENTER
    legendGroup.append("g")
      .attr("class", "rect-wrap-legend");

    legendGroup.append("rect")
      .attr("class", "rect-inner")
      //.attr("fill","white")
      .attr("x", this.xy_first[0])
      .attr("y", this.xy_first[1])
      // .transition(t_enter)
      .attr("height", this.dim)
      .attr("width", this.dim)
      .attr("transform", function (d, i ) {
        let xRot =  _that.dim / 2 +  _that.xy_first[0] //set center point for rotation
        let yRot =  _that.dim / 2 +  _that.xy_first[1]
        return `rotate(-45, ${xRot},  ${yRot} )`
      });


    legendGroup
      .append("text")
      .attr("class","text")
      .attr("x",  this.xy_first[0] + 20)
      .attr("y",  this.xy_first[1] +  this.dim*Math.sqrt(2)/2 ) // center with diagonal
      .attr("text-anchor", "start")
      .attr('alignment-baseline', 'middle')
      .text("Filled area: magnitude");



    legendGroup.append("rect")
      .attr("class", "rect-fixed")
      .attr("x", this. xy_first[0])
      .attr("y", this. xy_first[1] + this. dist)
      // .transition(t_enter)
      .attr("height",  this.dim)
      .attr("width",  this.dim)
      .attr("transform", function (d, i) {
        let xRot =  _that.dim / 2 +  _that.xy_first[0];  //set center point for rotation
        let yRot =  _that.dim / 2 +  _that.xy_first[1] +  _that.dist;
        return `rotate(-45, ${xRot},  ${yRot} )`
      });


      
    legendGroup
    .append("text")
    .attr("class","text")
    .attr("x",  this.xy_first[0] + 20)
    .attr("y",  this.xy_first[1] + +  this.dist +  this.dim*Math.sqrt(2)/2  )
    .attr("text-anchor", "start")
    .attr('alignment-baseline', 'middle')
    .text("Empty area: brightness");


  }

  private createCustomDef() {

    const defs = this.svg.append("defs");

    // //Filter for the outside glow
    var filter = defs.append("filter")
      .attr("id", "glow");
    filter.append("feGaussianBlur")
      .attr("stdDeviation", "1.8")
      .attr("result", "coloredBlur");
    var feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode")
      .attr("in", "coloredBlur");
    feMerge.append("feMergeNode")
      .attr("in", "SourceGraphic");

  }

}
