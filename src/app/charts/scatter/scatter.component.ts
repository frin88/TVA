import { Component, Input, OnInit, ElementRef, ViewEncapsulation, SimpleChanges, OnChanges } from '@angular/core';

import * as d3 from "d3";
import { take } from 'rxjs/operators';


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
  private g; // SVG main Group element
  private svg;

  // size of svg element
  private viewport_width;
  private viewport_height;

  // size of viz
  private inner_width;
  private inner_height;

  //margin => inner = viewport - margin*2
  private margin_side = 30;
  private margin_top = 80;
  //////////////////////////

  //private chartOffset = 150; // TODO da rinominare è la y iniziale del chart 
  private btnGroup_offset_y = 30;
  private btn_r = 20; // radius of button

  private main_offsetY = this.btnGroup_offset_y + this.btn_r * 2 + this.btn_r;
  // scales
  private x;
  private y;
  private d;

  ///diameter
  private max_d;
  private min_d;
  private max_d_fixed = 50; // this controls max circles sizes
  private min_d_fixed = 1;// this controls min circles sizes

  //transitions
  private t;
  private btn_transition_timing = 200;

  ////
  private selectedDay;
  private data_week; // data for all week
  private data; // data for single day
  private day_array = [];

  private tip;
  private yAxis;

  constructor(private elRef: ElementRef) {
    this.hostElement = this.elRef.nativeElement;
  }

  ngOnInit(): void {

    this.data_week = this._data;

    this.selectedDay = this.getToday();
    this.data = this.data_week[this.selectedDay];

    this.fillDaysStruct();
    this.updateChart(this.data);

  }


  private fillDaysStruct() {

    const formatDay = d3.timeFormat("%a");
    const order = d3.timeFormat("%u");
    for (let key in this.data_week) {

      let d = new Date(key);
      let i = parseInt(order(d)) - 1; // keep the right order mon -> sun
      this.day_array[i] = { "label": formatDay(d), "value": key };

    }

  }

  public updateChart(data: number[]) {
    if (!this.svg) {
      this.addTooltip();
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
      .attr('height', '100%').attr("id", "mysvg")

    this.viewport_width = parseInt(this.svg.style("width"));
    this.viewport_height = parseInt(this.svg.style("height"));

    this.inner_width = parseInt(this.svg.style("width")) - (this.margin_side * 2);
    this.inner_height = parseInt(this.svg.style("height")) - (this.margin_top * 2);

    // set viewbox = viewport => zoom = 0, resizable
    this.svg.attr('viewBox', '0 0 ' + this.viewport_width + ' ' + this.viewport_height);
    this.svg.attr("preserveAspectRatio", "xMinYMid");
    console.log("svg width ", this.viewport_width, " svg height", this.viewport_height);
    // console.log("svg width ", this.inner_width, " svg height", this.inner_height);
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
      .range([this.min_d_fixed, this.max_d_fixed]); // max_d_fixed is reference point for legend


  }


  private addGraphicsElement() {


    // main group
    this.g = this.svg.append("g")
      .attr("transform", "translate(0," + this.main_offsetY + ")") // move down to make space to buttons -> buttons are on separate g because they dont'have to overlap chart   
      .attr("class", "main");

    this.addLegend_XY();
    this.addBtnGroup();
    this.createCustomDef();
    this.addGridLines();
    this.addLegend_Diameter();


  }


  private addDots() {

    const t_enter = d3.transition().duration(750);
    const t_exit = d3.transition().duration(500);
    const _that = this;

    //join
    const dot_wrap = this.g
      .selectAll('.dot-wrap')
      .data(_that.data, d => d.name)
      .join(
        function (group) {

          //ENTER
          let enter = group.append("g").attr("class", "dot-wrap");
          //tootip before transition https://stackoverflow.com/questions/63723411/adding-transition-animation-breaking-tooltip-mouseover
          //https://stackoverflow.com/questions/24636602/mouseout-mouseleave-gets-fired-when-mouse-moves-inside-the-svg-path-element
          enter
            .on('mouseenter', (ev, d) => {

              //console.log("mouseover")
              var f = d3.format(".2f")

              const html = '<p>Name: ' + d.name + '</p>' +
                '<p>Diameter: ' + f(d.diameter) + ' km</p>' +
                '<p>Magnitude: ' + f(d.magnitude) + ' h</p>' +
                '<p>Distance: ' + f(d.distance_au) + ' au</p>' +
                '<p>Velocity: ' + f(d.velocity_ks) + ' km/s</p>'

              _that.tip.transition()
                .duration(400)
                .style("opacity", .9)

             
              //get inverse position for translated group so it works also when resized
              var pt = _that.svg.node().createSVGPoint();
              pt.x = d3.pointer(ev)[0];
              pt.y = d3.pointer(ev)[1];
              pt = pt.matrixTransform(enter.node().getCTM());

              _that.tip.html(html)
                .style("left", pt.x + "px")
                .style("top",  pt.y + "px")
             

            })
            .on('mouseout', d => {
              //console.log("mouseout")
              _that.tip.style("opacity", 0);

            })

          enter.append("circle")
            .attr("class", "dot")
            .style("filter", "url(#glow)")
            .attr("cy", d => _that.y(d.distance_au))
            .attr("cx", d => _that.x(d.velocity_ks))
            .transition(t_enter)
            .attr("r", d => _that.d(d.diameter))


          enter.append("circle")
            .attr("class", "center")
            .style("fill", "#2AF598")
            .attr("cy", d => _that.y(d.distance_au))
            .attr("cx", d => _that.x(d.velocity_ks))
            .transition(t_enter)
            .attr("r", 0.9)

          return enter;
        },
        function (group) {
          //UPDATE
          // TODO check if same neo can be in different days
        },
        function (group) {
          //EXIT
          group.select(".dot")
            .transition(t_exit)
            .attr("r", 0)
            .remove();

          group.selectAll(".center")
            .transition(t_exit)
            .attr("r", 0).remove();

          group.transition(t_exit).remove();
          return group;

        }
      );



  }



  private addTooltip() {


    // html tooltip vs g tooltip
    // https://stackoverflow.com/questions/43613196/using-div-tooltips-versus-using-g-tooltips-in-d3/43619702

    // i choose html for simplicity now
    this.tip = d3.select(this.hostElement).append("div")
      .attr("class", "tooltip  text")
      .style("z-index", "999")
      .style("opacity", 0)
  }

  private addGridLines() {

    const yAxisGenerator = d3.axisLeft(this.y)
      .ticks(3) // How many gridlines
      .tickSizeInner(-this.inner_width) // Ticks in between the outer ticks
      .tickSizeOuter(0);// Ticks on both outer sides


    this.yAxis = this.g
      .append("g")
      .attr("class", "y-axis")
      .call(yAxisGenerator);

    //hide domain and labels
    this.yAxis.selectAll("text").remove()
    this.yAxis.select(".domain").remove();



  }


  private addLegend_Diameter() {


    const x_legend = this.inner_width - 200;
    const dataLegend = [{ "value": this.min_d, "label": "Min Km" }, { "value": this.max_d, "label": "Max Km" }];

    // add legend group outside main so that it does not overlap with chart
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
      .attr("class", "dot")
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
      .attr("r", this.min_d_fixed)
      .attr("cy", this.max_d_fixed + 2)
      .attr("cx", (d, i) => i * 130 + 50);//2

    legendCenters.append("text")
      .attr("x", (d, i) => i * 130 + 60) //1
      .attr("y", this.max_d_fixed + 2)
      .attr("text-anchor", "start")
      .attr("class", "text")
      .text(d => d.label)

  }

  private addLegend_XY() {

    const _that = this;
    const offset = this.inner_height - (this.btnGroup_offset_y);

    const legendUomGroup =
      this.g.append("g")
        .classed("legend-uom", true)
        .attr("transform", "translate(0 " + offset + ")")

    //load sv images --> TODO: qui l'import è un po' grezzo, si riesce a non schiantare il path ad asset?
    Promise.all([
      d3.xml("../../assets/arrow-right.svg"),
      d3.xml("../../assets/arrow-up.svg")
    ])
      .then(([right, up]) => {


        //// legend UP
        let g_up = legendUomGroup.append("g")
          .attr("transform", "translate(0,0)")
        g_up.node().appendChild(up.documentElement) //d3's selection.node() returns the DOM node, so we can use plain Javascript to append content

        let txt = g_up.append("text");

        txt.append("tspan")
          .attr("class", "bold")
          .attr("x", 30)
          .attr("y", 20)
          .attr("text-anchor", "start")
          .attr('alignment-baseline', 'middle')
          .text("DISTANCE");
        txt
          .append("tspan")
          .text("(au)")
          .attr("class", "text")
          .attr("dx", 4);


        //// legend RIGHT
        let bbox = g_up.node().getBBox();
        let y = parseFloat(bbox.height + bbox.y) + 20;
        let g_rigth = legendUomGroup.append("g").attr("transform", "translate(0," + y + ")")

        g_rigth.node().appendChild(right.documentElement)

        let txt2 = g_rigth.append("text");

        txt2.append("tspan")
          .attr("class", "bold")
          .attr("x", 30)
          .attr("y", 10)
          .attr("text-anchor", "start")
          .attr('alignment-baseline', 'middle')
          .text("VELOCITY");
        txt2
          .append("tspan")
          .text("(km/s)")
          .attr("class", "text")
          .attr("dx", 4);


      });



  }

  private addBtnGroup() {

    const buttonGroup = this.svg.append("g")
      .attr("class", "button-group")
      .attr("transform", "translate(0," + this.btnGroup_offset_y + ")"); // move down to make space to title and buttons
    //.attr("transform", "translate(0,0)");

    buttonGroup.append("text")
      .text("Select one day to update the chart")
      .attr("class", "text")

    
    ///////////////////////////////////////////////////////////////////////////
     let bbox = buttonGroup.node().getBBox();
     let y = bbox.height + 15; // text y =>height og btn_g + smth;

    const buttons = buttonGroup.selectAll(".btn-wrap").data(this.day_array);

    const btn_wrap = buttons.enter()
      .append("g")
      .attr("class", "btn-wrap")
      .style('cursor', 'pointer');

    btn_wrap
      .append("circle")
      .attr("class", (d) => d.value !== this.selectedDay ? "day-btn" : "day-btn__selected")
      .attr("r", this.btn_r)
      .attr("cy", y)
      .attr("cx", (d, i) => this.calc_btn_x(d, i));

    //day-lbl

    btn_wrap
      .append("text")
      .attr("x", (d, i) => this.calc_btn_x(d, i))
      .attr("y", y)
      .attr("class", (d) => d.value !== this.selectedDay ? "text day-lbl" : " day-lbl__selected")
      .style('font-size', this.btn_r * 0.6 + 'px')
      .attr('alignment-baseline', 'middle')
      .attr("text-anchor", "middle")
      .text(d => d.label);



    // buttons action --> called on group (text + circle)
    buttonGroup.selectAll(".btn-wrap")
      .on("mouseover", this.onDayMouseover.bind(this))
      .on("mouseout", this.onDayMouseout.bind(this))
      .on("click", this.onDayClik.bind(this));

  }

  private calc_btn_x(d, i) {
    return i * 52 + this.btn_r * 1.1 + 3
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
    //console.log(ev.currentTarget);

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
    let new_sel = target_el.data();


    if (new_sel[0]["value"] !== this.selectedDay) {
      // ho cambiato giorno
      this.selectedDay = new_sel[0]["value"];
      this.data = this.data_week[this.selectedDay];
      this.updateChart(this.data);
    }



  }


  private createCustomDef() {

    const defs = this.svg.append("defs");

    // //Create  gradient
    // defs.append("radialGradient")
    //   .attr("id", "dot-gradient")
    //   .attr("cx", "50%")	//not really needed, since 50% is the default
    //   .attr("cy", "50%")
    //   .attr("r", "50%")
    //   .selectAll("stop")
    //   .data([
    //     { offset: "0%", color: "rgba(42,245,152,0)" },
    //     { offset: "50%", color: "rgba(42,245,152,0.03)" },
    //     { offset: "100%", color: "rgba(42,245,152,0.06)" },
    //   ])
    //   .enter().append("stop")
    //   .attr("offset", (d) => d.offset)
    //   .attr("stop-color", (d) => d.color);


    // //Filter for the outside glow
    var filter = defs.append("filter")
      .attr("id", "glow");
    filter.append("feGaussianBlur")
      .attr("stdDeviation", "1.9")
      .attr("result", "coloredBlur");
    var feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode")
      .attr("in", "coloredBlur");
    feMerge.append("feMergeNode")
      .attr("in", "SourceGraphic");




  }


  private getToday() {

    const data = new Date();
    const day = ("0" + data.getDate()).slice(-2);
    const month = ("0" + (data.getMonth() + 1)).slice(-2);
    const year = data.getFullYear();
    return year + '-' + month + '-' + day;
  }



}
