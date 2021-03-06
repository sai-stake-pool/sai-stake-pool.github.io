

class XAxisCtrl {
    constructor(svg, option) {
        this.svg = svg;
        this.width = +this.svg.attr("width")
        this.height = +this.svg.attr("height");
        this.option = option;

        this.xScale = d3.scaleTime()
            .domain([this.option.dmin, dateAdd(this.option.dmin, this.option.interval, this.option.drange)])
            .range([0, (this.width - (12 + this.option.offset))])

        // this.xScaleReverse = d3.scaleTime()
        //     .domain([0, this.width + 10])
        //     .range([this.option.dmin, dateAdd(this.option.dmin, this.option.interval, this.option.drange)])

        this.g = this.svg.append("g")
            .attr("class", "axis x-axis")
            .attr("transform", "translate(" + (0) + "," + (this.height - 25) + ")")
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
        this.option = option;
        this.width = this.svg.attr("width")
        this.height = this.svg.attr("height");

        this.yScale = d3.scaleLinear().domain([this.option.ymin, this.option.ymax]).range([this.height - 25, 0]).nice();
        this.yAxis = d3.axisRight()
            .scale(this.yScale)


        this.g = this.svg.append("g")
            .attr("class", "axis y-axis")
            // .attr("transform", "translate(" + (this.width) + "," + (0) + ")")
            .call(this.yAxis);

        // update the location based on length of texts
        this.g.select(".y-axis").selectAll("text").nodes().forEach(t => console.log(t.getComputedTextLength()));

        var arr = this.svg.select(".y-axis").selectAll("text").nodes().map(t => t.getComputedTextLength());
        var max = arr.reduce(function (a, b) {
            return Math.max(a, b);
        });

        // console.log(max);
        this.offset = max;
        this.g
            .attr("transform", "translate(" + (this.width - (max + 10)) + "," + (0) + ")")


    }
}


class CrossFire {

    constructor(svg, option) {
        this.svg = svg;

        this.option = option;
        this.width = this.svg.attr("width")
        this.height = this.svg.attr("height")

        this.x1 = 0;
        this.x2 = 0;
        this.y1 = 0;
        this.y2 = 0;

        this.option.axctrl.g.attr("transform")
        // let trvalue = getTransformation(t)

        this.g = svg.append("g")
            .attr("class", "crossFireBody")
            // .attr("transform", "translate(" + trvalue.translateX + "," + 0 + ")")
            .attr("transform", "translate(0,0)")
            .attr("clip-path", "url(#clip)")
            .on("mousemove", this.handleMouseMove)


        this.xline = this.g.append('line')
            .style("stroke", "darkgrey")
            .style("stroke-width", 1)
            .style("stroke-dasharray", ("3, 3"))
            .attr("class", "xline")
            .attr("x1", this.x1)
            .attr("y1", 0)
            .attr("x2", this.x2)
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

        this.dateMarker = this.g.append("g")

        let dateString = this.option.axctrl.xScale.invert(this.x1)
        var dateTime = moment.utc(dateString).format("DD-MMM-YY HH:mm:ss");

        let dateRect = this.dateMarker.append('rect')

        let dateText = this.dateMarker.append("text")
            .attr("x", 0)
            .attr("y", 15)
            .attr("font-size", "12")
            .attr("font-family", "arial")
            // .attr("font-weight", "bold")
            .attr("fill", "blue")
            .text(dateTime);

        let dateLen = dateText.node().getComputedTextLength()

        dateRect.style("stroke", "none")
            .style("stroke-width", 1)
            .attr("fill", "rgba(211, 211, 211, 0.85)")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", dateLen)
            .attr("height", 20)

        this.dateMarker
            .attr("transform", "translate(" + ((dateLen / 2) * -1) + "," + (this.height - 25) + ")")


        this.priceMarker = this.g.append("g");

        let price = this.addZeroes(this.option.ayctrl.yScale.invert(this.y1))

        let priceRect = this.priceMarker.append('rect')

        let priceText = this.priceMarker.append("text")
            // .attr("x", this.x1)
            // .attr("y", (this.y1))
            .attr("y", (20 / 2) + 5)
            .attr("font-size", "12")
            .attr("font-family", "arial")
            .attr("fill", "blue")
            .text(price);

        let priceLen = priceText.node().getComputedTextLength()

        priceRect.style("stroke", "none")
            .style("stroke-width", 1)
            .attr("fill", "rgba(211, 211, 211, 0.85)")
            // .attr("x", this.x1)
            // .attr("y", this.y1)
            .attr("width", priceLen + 10)
            .attr("height", 20)


        this.priceMarker
            .attr("transform", `translate(${this.width - (priceLen + 2)}, ${this.y1 - (20 / 2)} )`)
    }

    update(pos) {
        let x = pos[0];
        let y = pos[1];

        this.x1 = x;
        this.x2 = x;

        this.y1 = y;
        this.y2 = y;

        this.xline
            .attr("x1", this.x1)
            .attr("y1", 0)
            .attr("x2", this.x2)
            .attr("y2", this.height);

        this.yline
            .attr("x1", 0)
            .attr("y1", this.y1)
            .attr("x2", (this.width - this.option.ayctrl.offset))
            .attr("y2", this.y2);

        this.dateMarker.select("rect")
            .attr("x", (this.x1));

        // get the date value
        let dateString = this.option.axctrl.xScale.invert(this.x1)
        var dateTime = moment(dateString).format("DD-MMM-YY HH:mm:ss");


        this.dateMarker.select("text")
            .attr("x", this.x1)
            .text(dateTime)


        // get the price value
        let price = this.addZeroes(this.option.ayctrl.yScale.invert(this.y1))
        // console.log(this.height - this.y1 - 25)

        let priceText = this.priceMarker.select("text")
            .text(price)

        let priceLen = priceText.node().getComputedTextLength()


        this.priceMarker.select("rect")
            .attr("width", priceLen + 10);

        this.priceMarker
            .attr("transform", `translate(${this.width - (priceLen + 2)}, ${this.y1 - (20 / 2)} )`)
    }

    calc(num) {
        return num.toString().match(/^-?\d+(?:\.\d{0,2})?/)[0]
    }

    addZeroes(num) {
        return this.calc(num.toFixed(Math.max(((num + '').split(".")[1] || "").length, 2)));
    }

}


class CandleChart {
    constructor(svg, option) {
        this.svg = svg;
        this.svg.node().addEventListener('xyUpdate', this.xyUpdate);
        this.width = +this.svg.attr("width")
        this.height = +this.svg.attr("height");
        this.option = option;


        this.g = this.svg.append("g")
        .attr("class", "chartBody")

        console.log(this.option.data)
        this.g.selectAll(".stem")
        .data(this.option.data)
        .enter()
        .append("line")
        .attr("class", "stem")
        .attr("x1", (d, i) => this.option.axctrl.xScale(d.Date))
        .attr("x2", (d, i) => this.option.axctrl.xScale(d.Date))
        .attr("y1", d => this.option.ayctrl.yScale(d.High) + 15)
        .attr("y2", d => this.option.ayctrl.yScale(d.Low) + 15)
        .attr("stroke-width", ".5")
        .attr("stroke", d => (d.Open === d.Close) ? "darkgrey" : (d.Open > d.Close) ? "darkred" : "darkgreen");        

        this.g.selectAll(".candle")
        .data(this.option.data)
        .enter()
        .append("rect")
        .attr("stroke", d => (d.Open === d.Close) ? "white" : (d.Open > d.Close) ? "darkred" : "darkgreen")
        .attr("stroke-width", ".25")
        .attr('x', (d, i) => this.option.axctrl.xScale(d.Date) - 2)
        .attr("class", "candle")
        .attr('y', d => this.option.ayctrl.yScale(Math.max(d.Open, d.Close)) + 15)
        .attr('width', "5")
        .attr('height', d => (d.Open === d.Close) ? 1 : this.option.ayctrl.yScale(Math.min(d.Open, d.Close)) - this.option.ayctrl.yScale(Math.max(d.Open, d.Close)))
        .attr("fill", d => (d.Open === d.Close) ? "silver" : (d.Open > d.Close) ? "red" : "green")
        // .on("mouseover", handleMouseOver)
        // .on("mouseout", handleMouseOut);

        // adjust the axctrl axis bottom

        // let xoption = {
        //     dmin: dateAdd(date, "minute", -60),
        //     drange: 60,
        //     interval: "minute",
        //     offset: ayctrl.offset
        // }




    }

    xyUpdate(e) {
        console.log(e);
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