

class XAxisCtrl {
    constructor(svg, option) {
        this.svg = svg;
        this.width = svg.node().clientWidth; //+this.svg.attr("width")
        this.height = +this.svg.attr("height");
        this.option = option;

        this.xScale = d3.scaleTime()
            .domain([this.option.dmin, dateAdd(this.option.dmin, this.option.interval, this.option.drange)])
            .range([0, (this.width - (12 + this.option.offset))])

        this.universalXScale = d3.scaleTime()
            .domain([this.option.dmin, dateAdd(this.option.dmin, this.option.interval, this.option.drange)])
            .range([0, (this.width - (12 + this.option.offset))])


        console.log("date marker point " + this.universalXScale(this.option.startDate))

        // this.xScaleReverse = d3.scaleTime()
        //     .domain([0, this.width + 10])
        //     .range([this.option.dmin, dateAdd(this.option.dmin, this.option.interval, this.option.drange)])

        this.g = this.svg.append("g")
            .attr("class", "axis x-axis")
            .attr("transform", "translate(" + (0) + "," + (this.height - 25) + ")")
            .call(d3.axisBottom(this.xScale))


    }

    // update(option) {
    //     this.option = option;
    //     this.xScale.domain([this.option.dmin, dateAdd(this.option.dmin, this.option.interval, this.option.drange)])
    //         .range([0, (this.width - (12 + this.option.offset))])

    //     let svgTransition = this.svg.transition();

    //     svgTransition.select(".x-axis")
    //         .duration(0)
    //         .call(d3.axisBottom(this.xScale))


    // }


}

class YAxisCtrl {
    constructor(svg, option) {
        this.svg = svg;
        this.option = option;
        this.width = svg.node().clientWidth //this.svg.attr("width")
        this.height = this.svg.attr("height");

        console.log(this.option.ymin);
        console.log(this.option.ymax);

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
        this.width = svg.node().clientWidth // +this.svg.attr("width")
        this.height = this.svg.attr("height")

        this.x1 = 0;
        this.x2 = 0;
        this.y1 = 0;
        this.y2 = 0;

        // this.option.axctrl.g.attr("transform")
        // let trvalue = getTransformation(t)

        this.g = svg.append("g")
            .attr("class", "crossFireBody")
            // .attr("transform", "translate(" + trvalue.translateX + "," + 0 + ")")
            .attr("transform", "translate(0,0)")
            .style("pointer-events", "none")
        // .attr("clip-path", "url(#clip)")
        // .on("mousemove", this.handleMouseMove)


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
            .style("pointer-events", "none")

        console.log(this.option.xScale.domain())

        let dateString = this.option.xScale.invert(this.x1)
        var dateTime = moment.utc(dateString).format("DD-MMM-YY HH:mm:ss");

        let dateRect = this.dateMarker.append('rect')
            .style("pointer-events", "none")

        let dateText = this.dateMarker.append("text")
            .attr("x", 0)
            .attr("y", 15)
            .attr("font-size", "12")
            .attr("font-family", "arial")
            // .attr("font-weight", "bold")
            .attr("fill", "blue")
            .style("pointer-events", "none")
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

        let price = this.addZeroes(this.option.yScale.invert(this.y1))

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

    rescaleDraw(xScale, yScale, pos) {

        this.xline
            .attr("x1", pos[0])
            .attr("y1", 0)
            .attr("x2", pos[0])
            .attr("y2", this.height);

        this.yline
            .attr("x1", 0)
            .attr("y1", pos[1])
            .attr("x2", (this.width - this.option.offset))
            .attr("y2", pos[1]);





        this.dateMarker.select("rect")
            .attr("x", (pos[0]));

        // get the date value
        let dateString = xScale.invert(pos[0])
        var dateTime = moment(dateString).format("DD-MMM-YY HH:mm:ss");


        this.dateMarker.select("text")
            .attr("x", pos[0])
            .text(dateTime)


        // get the price value
        let price = this.addZeroes(yScale.invert(pos[1]))
        // console.log(this.height - this.y1 - 25)

        let priceText = this.priceMarker.select("text")
            .text(price)

        let priceLen = priceText.node().getComputedTextLength()


        this.priceMarker.select("rect")
            .attr("width", priceLen + 10);

        this.priceMarker
            .attr("transform", `translate(${this.width - (priceLen + 2)}, ${pos[1] - (20 / 2)} )`)


        this.option.xScale = xScale;
        this.option.yScale = yScale;









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
            .attr("x2", (this.width - this.option.offset))
            .attr("y2", this.y2);

        this.dateMarker.select("rect")
            .attr("x", (this.x1));

        // get the date value
        let dateString = this.option.xScale.invert(this.x1)
        var dateTime = moment(dateString).format("DD-MMM-YY HH:mm:ss");


        this.dateMarker.select("text")
            .attr("x", this.x1)
            .text(dateTime)


        // get the price value
        let price = this.addZeroes(this.option.yScale.invert(this.y1))
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


class UpdateManager {
    constructor(svg) {
        this.svg = svg;
        this.width = svg.node().clientWidth //+svg.attr("width")
        this.height = +svg.attr("height")
        this.updateList = [];
        this.cancelList = [];
        this.onUpdate = ()=>{
            this.updateList.forEach(f => {
                f();
            })
        };
        this.onCancel = ()=>{
            this.cancelList.forEach(f => {
                f();
            })
        }

        // Add a clipPath: everything out of this area won't be drawn.
        this.svg.append("defs").append("SVG:clipPath")
            .attr("id", "clip")
            .append("SVG:rect")
            .attr("width", this.width)
            .attr("height", this.height - 25)
            .attr("x", 0)
            .attr("y", 0);



        this.zoom = d3.zoom()
            .scaleExtent([.5, 20])  // This control how much you can unzoom (x0.5) and zoom (x20)
            .extent([[0, 0], [this.width, this.height]])
 

        this.svg.append("rect")
            .attr("width", this.width)
            .attr("height", this.height)
            .style("fill", "none")
            .style("pointer-events", "all")
            // .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
            // .on("mousemove", handleMouseMove)            
            .call(this.zoom);

    }


    initialize(data, gObj) {

        console.log("data")
        console.log(data)


        var ydata = data; //.slice(250, 300);

        var ymin = d3.min(ydata.map(r => r.Low * .995));
        var ymax = d3.max(ydata.map(r => (r.High * .945)));

        let yoption = {
            ymin: ymin,
            ymax: ymax,
        }

        this.ayctrl = new YAxisCtrl(this.svg, yoption);


        this.svg.select("#clip").select("rect")
            .attr("width", this.width - (this.ayctrl.offset + 10))


        let date = d3.max(data.map(r => r.Date));


        let range = 30 * 1.5;

        let xoption = {
            startDate: date,
            dmin: dateAdd(date, gObj.interval, range * -1),
            drange: range * 1.25,
            interval: gObj.interval,
            offset: this.ayctrl.offset
        }

        this.axctrl = new XAxisCtrl(this.svg, xoption);

        let cfoption = {
            xScale: this.axctrl.xScale,
            yScale: this.ayctrl.yScale,
            offset: this.ayctrl.offset
        }

        this.cf = new CrossFire(this.svg, cfoption)

        return {
            xScale: this.axctrl.xScale,
            yScale: this.ayctrl.yScale,
            offset: this.ayctrl.offset,
            data: data
        };

    }

    // reinitialize(data, gObj) {
    //     var ydata = data; //.slice(250, 300);

    //     var ymin = d3.min(ydata.map(r => r.Low * .98));
    //     var ymax = d3.max(ydata.map(r => (r.High * 1.005)));

    //     let yoption = {
    //         ymin: ymin,
    //         ymax: ymax,
    //     }

    //     this.ayctrl = new YAxisCtrl(this.svg, yoption);


    //     // this.svg.select("#clip").select("rect")
    //     //     .attr("width", this.width - (this.ayctrl.offset + 10))


    //     let date = d3.max(data.map(r => r.Date));


    //     let range = 30 * 1.5;

    //     let xoption = {
    //         startDate: date,
    //         dmin: dateAdd(date, gObj.interval, range * -1),
    //         drange: range * 1.25,
    //         interval: gObj.interval,
    //         offset: this.ayctrl.offset
    //     }

    //     this.axctrl = new XAxisCtrl(this.svg, xoption);

    //     let cfoption = {
    //         xScale: this.axctrl.xScale,
    //         yScale: this.ayctrl.yScale,
    //         offset: this.ayctrl.offset
    //     }

    //     this.cf = new CrossFire(this.svg, cfoption)

    //     return {
    //         xScale: this.axctrl.xScale,
    //         yScale: this.ayctrl.yScale,
    //         offset: this.ayctrl.offset,
    //         data: data
    //     };

    // }    

    update(pos) {
        if (this.cf)
            this.cf.update(pos);
    }

    drag(v) {
        let x = +svg.attr("x");
        console.log(`move to -> ${x}`)
        if (this.axctrl) {
            let xdate = this.axctrl.universalXScale.invert(x);
            console.log(`new date : ${xdate}`)

            let xoption = {
                dmin: xdate,
                drange: 60 * 1.5,
                interval: "minute",
                offset: this.ayctrl.offset
            }



            // if(this.callback)
            //     this.callback(this.axctrl.xScale, this.ayctrl.yScale);

        }
    }

    subscribe(callback) {
        this.callback = callback;
    }



}

class CandleChart {
    constructor(svg) {
        this.svg = svg;
        // this.svg.node().addEventListener('xyUpdate', this.xyUpdate);
        svg.node().clientWidth //+this.svg.attr("width")
        this.height = +this.svg.attr("height");


        this.g = this.svg.append("g")
            .attr("class", "chartBody")
            .attr("clip-path", "url(#clip)")

        this.timer = undefined;

        this.k = 1;

    }

    setK(k) {
        this.k = k;
    }

    update(option) {
        console.log(option.data)
        this.stem = this.g.selectAll(".stem")
            .data(option.data)
            .enter()
            .append("line")
            .attr("class", "stem")
            .attr("x1", (d, i) => option.xScale(d.Date))
            .attr("x2", (d, i) => option.xScale(d.Date))
            .attr("y1", d => option.yScale(d.High) + 15)
            .attr("y2", d => option.yScale(d.Low) + 15)
            .attr("stroke-width", ".5")
            .attr("stroke", d => (d.Open === d.Close) ? "darkgrey" : (d.Open > d.Close) ? "darkred" : "darkgreen");

        this.candle = this.g.selectAll(".candle")
            .data(option.data)
            .enter()
            .append("rect")
            .attr("stroke", d => (d.Open === d.Close) ? "white" : (d.Open > d.Close) ? "darkred" : "darkgreen")
            .attr("stroke-width", ".25")
            .attr('x', (d, i) => option.xScale(d.Date) - ((5 * this.k) / 2))
            .attr("class", "candle")
            .attr('y', d => option.yScale(Math.max(d.Open, d.Close)) + 15)
            .attr('width', () => {
                return 5 * this.k
            })
            .attr('height', d => (d.Open === d.Close) ? 1 : option.yScale(Math.min(d.Open, d.Close)) - option.yScale(Math.max(d.Open, d.Close)))
            .attr("fill", d => (d.Open === d.Close) ? "silver" : (d.Open > d.Close) ? "red" : "green")


    }

    cancel() {
        // console.log("canceling chart drawing")
        clearTimeout(this.timer);
    }

    refresh(xScale, yScale) {

        this.timer = setTimeout(() => {
            this.stem
                .attr("x1", (d, i) => xScale(d.Date))
                .attr("x2", (d, i) => xScale(d.Date))
                .attr("y1", d => yScale(d.High) + 15)
                .attr("y2", d => yScale(d.Low) + 15)
                .attr("stroke-width", ".5")
                .attr("stroke", d => (d.Open === d.Close) ? "darkgrey" : (d.Open > d.Close) ? "darkred" : "darkgreen");

            this.candle
                .attr("stroke", d => (d.Open === d.Close) ? "white" : (d.Open > d.Close) ? "darkred" : "darkgreen")
                .attr("stroke-width", ".25")
                .attr('x', (d, i) => {
                    var x = xScale(d.Date) - ((5 * this.k) / 2);
                    if (xScale(d) > xScale.range[1]) {
                        x = x * -1;
                    }
                    return x
                })
                .attr("class", "candle")
                .attr('y', d => yScale(Math.max(d.Open, d.Close)) + 15)
                .attr('width', () => {
                    return 5 * this.k
                })
                .attr('height', d => (d.Open === d.Close) ? 1 : yScale(Math.min(d.Open, d.Close)) - yScale(Math.max(d.Open, d.Close)))
                .attr("fill", d => (d.Open === d.Close) ? "silver" : (d.Open > d.Close) ? "red" : "green")
        }, 50);


    }

    // xyUpdate(e) {
    //     console.log(e);
    //     var self = this;
    //     console.log("in xyupdate")
    //     console.log(self)
    //     // self.update(e.detail)
    // }


}



class GridChart {
    constructor(svg, xScale, yScale) {
        this.svg = svg;
        this.width = svg.node().clientWidth //+this.svg.attr("width")
        this.height = +this.svg.attr("height");

        this.g = this.svg.append("g")
            .attr("class", "gridBody")
            .attr("clip-path", "url(#clip)")
    }

    draw(xScale, yScale) {
        var xlines = this.g.selectAll(".xlines")
            .data(xScale.ticks())
        xlines.exit().remove();
        xlines
            .attr("x1", d => xScale(d))
            .attr("y1", 0)
            .attr("x2", d => xScale(d))
            .attr("y2", this.height);

        xlines
            .enter()
            .append("line")
            .style("stroke", "lightgrey")
            .style("stroke-width", .5)
            .attr("class", "xlines")
            // .style("stroke-dasharray", ("3, 3"))
            // .attr("class", "xline")
            .attr("x1", d => xScale(d))
            .attr("y1", 0)
            .attr("x2", d => xScale(d))
            .attr("y2", this.height);


        var ylines = this.g.selectAll(".ylines")
            .data(yScale.ticks())
        ylines.exit().remove();
        ylines
            .attr("x1", 0)
            .attr("y1", d => yScale(d))
            .attr("x2", this.width)
            .attr("y2", d => yScale(d));

        ylines
            .enter()
            .append("line")
            .style("stroke", "lightgrey")
            .style("stroke-width", .5)
            .attr("class", "ylines")            
            .attr("x1", 0)
            .attr("y1", d => yScale(d))
            .attr("x2", this.width)
            .attr("y2", d => yScale(d));





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