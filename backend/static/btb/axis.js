

class XAxisCtrl {
    constructor(svg, option) {
        this.svg = svg;
        this.margin = 25;
        this.width = this.svg.attr("width") - this.margin
        this.height = this.svg.attr("height") - this.margin;
        this.option = option;

        this.xScale = d3.scaleTime()
            .domain([this.option.dmin, dateAdd(this.option.dmin, this.option.interval, this.option.drange)])
            .range([0, (this.width - (10 + this.option.offset))])

        // this.xScaleReverse = d3.scaleTime()
        //     .domain([0, this.width + 10])
        //     .range([this.option.dmin, dateAdd(this.option.dmin, this.option.interval, this.option.drange)])

        this.g = this.svg.append("g")
            .attr("class", "axis x-axis")
            .attr("transform", "translate(" + (0 + (this.margin - 20)) + "," + this.height + ")")
            .call(d3.axisBottom(this.xScale))


    }

    update(option) {
        this.option = option;
        this.xScale = d3.scaleTime()
            .domain([this.option.dmin, dateAdd(this.option.dmin, this.option.interval, this.option.drange)])
            .range([0, this.width + 10])

        let svgTransition = this.svg.transition();

        svgTransition.select(".x-axis")
            .duration(500)
            .call(d3.axisBottom(this.xScale))
    }


}

class YAxisCtrl {
    constructor(svg, option) {
        this.svg = svg;
        this.margin = 25;
        this.option = option;
        this.width = this.svg.attr("width") - this.margin
        this.height = this.svg.attr("height") - this.margin;

        this.yScale = d3.scaleLinear().domain([this.option.ymin, this.option.ymax]).range([this.height - 15, 0]).nice();
        this.yAxis = d3.axisRight()
            .scale(this.yScale)


        this.g = this.svg.append("g")
            .attr("class", "axis y-axis")
            .attr("transform", "translate(" + (this.width) + "," + (15) + ")")
            .call(this.yAxis);

        // update the location based on length of texts
        this.g.select(".y-axis").selectAll("text").nodes().forEach(t => console.log(t.getComputedTextLength()));

        var arr = this.svg.select(".y-axis").selectAll("text").nodes().map(t => t.getComputedTextLength());
        var max = arr.reduce(function (a, b) {
            return Math.max(a, b);
        });

        console.log(max);
        this.offset = max;
        this.g
            .attr("transform", "translate(" + (this.width - max) + "," + (15) + ")")


    }
}


class CrossFire {

    constructor(svg, option) {
        this.svg = svg;
        this.margin = 25;

        this.option = option;
        this.width = this.svg.attr("width") - this.margin
        this.height = this.svg.attr("height") - this.margin;

        this.x1 = 0;
        this.x2 = 0;
        this.y1 = 0;
        this.y2 = 0;

        let t = this.option.axctrl.g.attr("transform")
        let trvalue = getTransformation(t)

        this.g = svg.append("g")
            .attr("class", "crossFireBody")
            .attr("transform", "translate(" + trvalue.translateX + "," + 0 + ")")
            .attr("clip-path", "url(#clip)")
            .on("mousemove", this.handleMouseMove)


        this.xline = this.g.append('line')
            .style("stroke", "darkgrey")
            .style("stroke-width", 1)
            .style("stroke-dasharray", ("3, 3"))
            .attr("class", "xline")
            .attr("x1", this.x1 - 5)
            .attr("y1", 0)
            .attr("x2", this.x2 - 5)
            .attr("y2", this.height);

        this.yline = this.g.append('line')
            .style("stroke", "darkgrey")
            .style("stroke-width", 1)
            .style("stroke-dasharray", ("3, 3"))
            .attr("class", "xline")
            .attr("x1", 0)
            .attr("y1", this.y1)
            .attr("x2", this.width)
            .attr("y2", this.y2);            

            // this.g.append('rect')
            // .style("stroke", "lightgreen")
            // .style("stroke-width", 1)
            // .attr("fill", "none")
            // .attr("x", 0)
            // .attr("y", 0)
            // .attr("width", 200)
            // .attr("height", 200)

    }

    update(pos) {
        let x = pos[0];
        let y = pos[1];

        this.x1 = x;
        this.x2 = x;

        this.y1 = y;
        this.y2 = y;

        this.xline
            .attr("x1", this.x1 - 5)
            .attr("y1", 0)
            .attr("x2", this.x2 - 5)
            .attr("y2", this.height);       

        this.yline
            .attr("x1", 0)
            .attr("y1", this.y1)
            .attr("x2", (this.width - this.option.ayctrl.offset))
            .attr("y2", this.y2);              
    }

    handleMouseMove() {
        // console.log(d3.mouse(this));
        // console.log(d3.event.target);
    }    

}



function getTransformation(transform) {
    // Create a dummy g for calculation purposes only. This will never
    // be appended to the DOM and will be discarded once this function 
    // returns.
    var g = document.createElementNS("http://www.w3.org/2000/svg", "g");

    // Set the transform attribute to the provided string value.
    g.setAttributeNS(null, "transform", transform);

    // consolidate the SVGTransformList containing all transformations
    // to a single SVGTransform of type SVG_TRANSFORM_MATRIX and get
    // its SVGMatrix. 
    var matrix = g.transform.baseVal.consolidate().matrix;

    // Below calculations are taken and adapted from the private function
    // transform/decompose.js of D3's module d3-interpolate.
    var { a, b, c, d, e, f } = matrix;   // ES6, if this doesn't work, use below assignment
    // var a=matrix.a, b=matrix.b, c=matrix.c, d=matrix.d, e=matrix.e, f=matrix.f; // ES5
    var scaleX, scaleY, skewX;
    if (scaleX = Math.sqrt(a * a + b * b)) a /= scaleX, b /= scaleX;
    if (skewX = a * c + b * d) c -= a * skewX, d -= b * skewX;
    if (scaleY = Math.sqrt(c * c + d * d)) c /= scaleY, d /= scaleY, skewX /= scaleY;
    if (a * d < b * c) a = -a, b = -b, skewX = -skewX, scaleX = -scaleX;
    return {
        translateX: e,
        translateY: f,
        rotate: Math.atan2(b, a) * 180 / Math.PI,
        skewX: Math.atan(skewX) * 180 / Math.PI,
        scaleX: scaleX,
        scaleY: scaleY
    };
}

//   console.log(getTransformation("translate(20,30)"));  
//   console.log(getTransformation("rotate(45) skewX(20) translate(20,30) translate(-5,40)"));