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
  private margin_side = 10;
  private margin_top = 5;
  //////////////////////////
  private offset_x = 100;

  //scales
  private m_max = 50;
  private m;

  //// in alto quello con magnitudine più bassa
  // A destra viene visualizzata una selezione di 5 asteroidi sul totale della settimana in ordine crescente di magnitudine.
  // La magnitudine è inversamente proporzionale alla luminosità
  // (l'asteroide più luminoso sarà dunque quello con magnitudine più bassa).
  // Il dato (magnitudine) è rappresentato dall'area colorata del rettangolo, rapportata ad una superficie totale fissa.

  private data = new Array();

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

      // TODO qui sarebe meglio usare reduce
      this._data[key].forEach(neo => {
        tmpData = [...tmpData, neo];
      });
    }
    sortedData = tmpData.slice().sort((a, b) => d3.ascending(a.magnitude, b.magnitude))
    // console.log("data ", tmpData);
    // console.log("data sorted", sortedData);
    console.log("data top 5 sorted", sortedData.slice(0, 5));
    this.data = sortedData.slice(0, 5);


  }


  public updateChart(data: number[]) {
    if (!this.svg) {
      this.createChart(data);
      return;
    }
    else {
      // this.setScale();
      // this.addDots();
    }
  }

  private createChart(data) {

    this.setChartDimensions();
    this.setScale();
    this.addGraphicsElement();
    this.addRects();

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
              //let xRot = _that.x_inner(d) + _that.m_max / 2; //set center point for rotation
              let xRot = _that.x_outer() + _that.m_max / 2; //set center point for rotation
            
              let yRot = _that.y_outer(i) + _that.m_max / 2;
              return `rotate(-45, ${xRot},  ${yRot} )`
            })




          enter.append("rect")
            .attr("class", "rect-fixed")
            .attr("x", () => _that.x_outer()) // x rettangoli fuori fixed
            .attr("y", (d, i) => _that.y_outer(i)) // la y dipende dal loop
            .transition(t_enter)
            .attr("height", d => _that.m_max)
            .attr("width", d => _that.m_max)


          enter.append("rect")
            .attr("class", "rect")
            .attr("x", (d) => (_that.x_inner(d))) 
            .attr("y", (d, i) => _that.y_inner(d, i))
            .transition(t_enter)
            .attr("height", d => _that.m(d.magnitude))
            .attr("width", d => _that.m(d.magnitude))




          // enter.append("circle")
          //   .attr("class", "center")
          //   .style("fill", "#2AF598")
          //   .attr("cy", d => _that.y(d.distance_au))
          //   .attr("cx", d => _that.x(d.velocity_ks))
          //   .transition(t_enter)
          //   .attr("r", 0.5)

          // enter
          //   .on("mouseenter", _that.showTooltip.bind(this, _that.chartOffset))
          //   .on("mouseleave", _that.hideTooltip.bind(this));

          return enter;
        },
        function (group) {
          //UPDATE
          // TODO check if same neo can be in different days
        },
        function (group) {
          //EXIT
          // group.select(".dot")
          //   .transition(t_exit)
          //   .attr("r", 0)
          //   .remove();

          // group.selectAll(".center")
          //   .transition(t_exit)
          //   .attr("r", 0).remove();

          group.transition(t_exit).remove();
          return group;

        }
      );
  }


  private x_outer() {
    return this.inner_width / 2 - this.offset_x;

  }
 
  private y_outer(i) {
    return this.inner_height / 5 + (i * 110);
  }

  private x_inner(d) {
    return this.x_outer() + (this.m_max - this.m(d.magnitude)) / 2;
  }

  private y_inner(d, i) {
    return this.y_outer(i) + (this.m_max - this.m(d.magnitude)) / 2;
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


  private setScale() {

    const domain_max = parseFloat(d3.max(this.data, d => d["magnitude"]));
    const domain_min = parseFloat(d3.min(this.data, d => d["magnitude"]));

    // oppure inverScale

    this.m = d3.scaleSqrt()
      .domain([domain_min, domain_max]) // inversamente proporzionale
      .range([this.m_max, 1]);


    console.log("MAX " + domain_max, this.m(domain_max));
    console.log("MIN " + domain_min, this.m(domain_min));


  }

  private addGraphicsElement() {


    // main group
    this.g = this.svg.append("g")
      .attr("transform", "translate(0,0)")
      //.attr("transform", "translate(0," + this.chartOffset + ")") // move down to make space to buttons
      .attr("class", "main");

    // this.addTooltip();
    // this.addBtnGroup();
    // this.defineDotGradient();
    // this.addGridLines();
    // this.addLegend();

  }



}
