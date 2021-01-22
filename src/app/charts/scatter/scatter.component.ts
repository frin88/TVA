import { Component, Input, OnInit, ElementRef, ViewEncapsulation, SimpleChanges, OnChanges } from '@angular/core';
import { Chart } from '../../models/Chart';
import * as d3 from "d3";
import { exit } from 'process';

@Component({
  selector: 'app-scatter',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './scatter.component.html',
  styleUrls: ['./scatter.component.scss']
})
export class ScatterComponent implements OnInit {


  //X VELOCITA
  //Y DISTANZA
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
  private margin_side = 30;
  private margin_top = 5;
  //////////////////////////

  private chartOffset = 150; // to do da rinominare è la y del chart 
  private btnGroup_offset_y = 30;
  private btn_r = 20;
  private btnGroup_offset_x = -this.margin_side + this.btn_r;


  // scales
  private x;
  private y;
  private d;

  ///diameter
  private max_d;
  private min_d;
  private max_d_fixed = 50; // this controls max circles sizes


  //transitions
  private t;
  private btn_transition_timing = 200;

  ////

  private selectedDay;
  private data_week; // data for all week
  private data; // data for single day


  private day_array = [];

  constructor(private elRef: ElementRef) {
    this.hostElement = this.elRef.nativeElement;
  }

  ngOnInit(): void {

    this.data_week = this._data;

    this.selectedDay = this.getToday();
    this.data = this.data_week[this.selectedDay];
    //console.log('scatter alive', this.data);

    this.fillDaysStruct();
    // console.log("day_array", this.day_array);


    this.updateChart(this.data);

  }

  private fillDaysStruct() {

    const formatDay = d3.timeFormat("%a");
    const order = d3.timeFormat("%u");
    for (let key in this.data_week) {

      let d = new Date(key);
      let i = parseInt(order(d)) - 1; // keep the right order mo -> su
      this.day_array[i] = { "label": formatDay(d), "value": key };

    }

  }

  public updateChart(data: number[]) {
    if (!this.svg) {
      this.createChart(data);
      return;
    }
    else {
      this.setScale();
      this.addDots();
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
    this.inner_height = parseInt(this.svg.style("height")) - (this.margin_top * 2) - this.chartOffset - this.btnGroup_offset_y;

    // set viewbox = viewport => zoom = 0, resizable
    this.svg.attr('viewBox', '0 0 ' + this.viewport_width + ' ' + this.viewport_height);
    this.svg.attr("preserveAspectRatio", "xMinYMid");
    //console.log("svg width ", inner_width, " svg height", inner_height);
  }


  private addGraphicsElement() {


    // main group
    this.g = this.svg.append("g")
      .attr("transform", "translate(0," + this.chartOffset + ")") // move down to make space to buttons
      .attr("class", "main")
    this.addBtnGroup();
    this.defineDotGradient();
    this.addGridLines();
    this.addLegend();
  }

  private addGridLines() {

    const yAxisGenerator = d3.axisLeft(this.y)
      .ticks(3) // How many gridlines
      .tickSizeInner(-this.inner_width) // Ticks in between the outer ticks
      .tickSizeOuter(0);// Ticks on both outer sides


    const yAxis = this.g
      .append("g")
      // .attr("transform", "translate(0,0)")
      .call(yAxisGenerator);

    //hide domain and labels
    yAxis.selectAll("text").remove()
    yAxis.select(".domain").remove();
  }


  private addLegend() {


    const x_legend = this.inner_width - 200;
    const dataLegend = [{ "value": this.min_d, "label": "Min Km" }, { "value": this.max_d, "label": "Max Km" }];

    // add legend group
    const legendGroup = this.svg.append("g")
      .attr("class", "legend")
      .attr("transform", "translate(" + x_legend + "  , 0)");

    legendGroup
      .append("text")
      .attr("class", "bold")
      .attr("x", 50)
      .attr("y", 12)
      .attr("text-anchor", "start")
      .text("DIAMETER")


    // cerchi MAX e MIN
    const legend_items = legendGroup.selectAll("circle")
      .data(dataLegend);

    //EXIT old elements
    legend_items.exit()
      .attr("fill", "green")
      .transition(this.t)
      .attr("r", 0)
      .remove();


    //ENTER create new
    legend_items
      .enter()
      .append("circle")
      .attr("class", "legend-dot")
      .attr("class", "dot")      // TODO questo serve o è un typo?
      .style("fill", "url(#dot-gradient)")
      .attr("r", d => this.d(d.value))
      .attr("cy", this.max_d_fixed + 2) // max_d_fixed cosi il più grande è sempre dentro svg
      .attr("cx", (d, i) => i * 130 + 50);//3


    const legendCenters = legendGroup.selectAll(".legend-dot")
      .data(dataLegend)
      .enter();

    // CENTRO cerchi max e min
    legendCenters.append("circle")
      .attr("class", "center-legend")
      .style("fill", "#2AF598")
      .attr("r", 1)
      .attr("cy", this.max_d_fixed + 2)
      .attr("cx", (d, i) => i * 130 + 50);//2

    legendCenters.append("text")
      .attr("x", (d, i) => i * 130 + 55) //1
      .attr("y", this.max_d_fixed + 2)
      .attr("text-anchor", "start")
      .attr("class", "text")
      .text(d => d.label)

  }


  private addBtnGroup() {



    const buttonGroup = this.svg.append("g")
      .attr("class", "button-group")
      //.attr("transform", "translate(" + this.btnGroup_offset_x + "," + this.btnGroup_offset_y + ")")
      .attr("transform", "translate(0," + this.btnGroup_offset_y + ")"); // move down to make space to title
    //.attr("transform", "translate(0,0)");

    buttonGroup.append("text")
      .text("Select one day to update the chart")
      .attr("class", "text");


    ///////////////////////////////////////////////////////////////////////////

    const buttons = buttonGroup.selectAll(".btn-wrap").data(this.day_array);

    const btn_wrap = buttons.enter()
      .append("g")
      .attr("class", "btn-wrap");

    btn_wrap
      .append("circle")
      .attr("class", "day-btn")
      .attr("r", this.btn_r)
      .attr("cy", 30)
      .attr("cx", (d, i) => this.calc_btn_x(d, i))
    // .attr("cx", (d, i) => i * 52 + this.btn_r * 1.1);// make space for museover effect



    btn_wrap
      .append("text")
      .attr("x", (d, i) => this.calc_btn_x(d, i))
      .attr("y", 30)
      .attr('alignment-baseline', 'middle')
      .style('font-size', this.btn_r * 0.6 + 'px')
      .attr("text-anchor", "middle")
      .attr("class", "text day-lbl")
      .text(d => d.label);



    // buttons action --> called on group (text + circle)
    buttonGroup.selectAll(".btn-wrap")
      .on("mouseover", this.onDayMouseover.bind(this))
      .on("mouseout", this.onDayMouseout.bind(this))
      .on("click", this.onDayClik.bind(this));

  }

  private calc_btn_x(d, i) {
    return i * 52 + this.btn_r * 1.1
  }



  private onDayMouseover(ev) {

    // console.log(ev.currentTarget);
    const t = d3.transition().duration(this.btn_transition_timing);
    d3.select(ev.currentTarget).select(".day-btn")
      .transition(t)
      .attr("r", this.btn_r * 1.1)

  }

  private onDayMouseout(ev) {

    // console.log(ev.currentTarget);
    const t = d3.transition().duration(this.btn_transition_timing);
    d3.select(ev.currentTarget).select(".day-btn")
      .transition(t)
      .attr("r", this.btn_r)
  }

  private onDayClik(ev) {
    console.log(ev.currentTarget);

    //reset prev selection
    d3.selectAll(".day-lbl__selected")
      .attr("class", "day-lbl text")

    d3.selectAll(".day-btn__selected")
      .attr("class", "day-btn")

    // add current selection
    const target_el = d3.select(ev.currentTarget)
    target_el
      .select(".day-btn")
      .attr("class", "day-btn__selected")

    target_el
      .select(".day-lbl")
      .attr("class", " day-lbl__selected")

    // updat selected day
    var new_sel = target_el.data();


    if (new_sel[0]["value"] !== this.selectedDay) {
      // ho cambiato giorno
      this.selectedDay = new_sel[0]["value"];
      this.data = this.data_week[this.selectedDay];
      this.updateChart(this.data);
    }



  }


  private setScale() {

    const max_x = parseFloat(d3.max(this.data, d => d["velocity_ks"]));
    const max_y = parseFloat(d3.max(this.data, d => d["distance_au"]));

    this.max_d = parseFloat(d3.max(this.data, d => d["diameter"]));
    this.min_d = parseFloat(d3.min(this.data, d => d["diameter"]));

    //console.log(min_d, max_d);

    this.x = d3.scaleLinear()
      .domain([0, max_x])
      .range([0, this.inner_width]);

    this.y = d3.scaleLinear()
      .domain([0, max_y])
      .range([this.inner_height, this.margin_top]);

    this.d = d3.scaleSqrt()
      .domain([0, this.max_d])
      .range([1, this.max_d_fixed]); // max_d_fixed is reference point for legend


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

    const t = d3.transition().duration(750);
    const _that = this;

    //join
    const dot_wrap = this.g
      .selectAll('.dot-wrap')
      .data(_that.data, d => d.name)
      .join(
        function (group) {
          let enter = group.append("g").attr("class", "dot-wrap");
          enter.append("circle")
            .attr("class", "dot")
            .style("fill", "url(#dot-gradient)")
            .attr("cy", d => _that.y(d.distance_au))
            .attr("cx", d => _that.x(d.velocity_ks))
            .transition(t)
            .attr("r", d => _that.d(d.diameter))

          enter.append("circle")
            .attr("class", "center")
            .style("fill", "#2AF598")
            .attr("cy", d => _that.y(d.distance_au))
            .attr("cx", d => _that.x(d.velocity_ks))
            .transition(t)
            .attr("r", 1);

          return enter;
        },
        function (group) {
          //UPDATE
        },
        function (group) {
          //EXIT
          group.select(".dot")
            .transition(t)
            .attr("r", 0).remove();

            group.select(".center")
            .transition(t)
            .attr("r", 0).remove();


          group.remove();
          return group;

        }
      );


    // bind data to group wrap
    // const circles = this.g.selectAll("g.dot-wrap").data( d => [this.data])
    //EXIT old elements

    // circles.exit()
    //   .transition(t)
    //   .attr("r", 0)
    //   .attr("fill", "green")
    //   .remove();


    // const circles_wrap = circles.enter()
    //   .append("g")
    //   .attr("class", "dot-wrap");

    //.data(this.data, d => d.name); //trak by name TODO-- not sure if i have the same neo in diff days 
    //const circels_wrap =  circles.enter().append("g").attr("class","dot-wrap"); // appendo un gruppo per circle + center



    // //ENTER create new
    // circles_wrap
    //   .append("circle")
    //   .attr("class", "dot")
    //   .style("fill", "url(#dot-gradient)")
    //   .attr("r", d => this.d(d.diameter))
    //   .attr("cy", d => this.y(d.distance_au))
    //   .attr("cx", d => this.x(d.velocity_ks))

    //   .merge(circles_wrap)
    //   .transition(t)
    //   .attr("r", d => this.d(d.diameter))
    //   .attr("cy", d => this.y(d.distance_au))
    //   .attr("cx", d => this.x(d.velocity_ks))

    //////////////////////////////////////////////////////////////


    // const centers = this.g.selectAll(".center")
    //   .data(this.data, d => d.name)
    //   .enter()
    // circles_wrap
    //   .append("circle")
    //   .attr("class", "center")
    //   .style("fill", "#2AF598")
    //   .attr("r", 1)
    //   .attr("cy", d => this.y(d.distance_au))
    //   .attr("cx", d => this.x(d.velocity_ks));
  }

  private getToday() {

    const data = new Date();
    const day = ("0" + data.getDate()).slice(-2);
    const month = ("0" + (data.getMonth() + 1)).slice(-2);
    const year = data.getFullYear();
    return year + '-' + month + '-' + day;
  }



}
