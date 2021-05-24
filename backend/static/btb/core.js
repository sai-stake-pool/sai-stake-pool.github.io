    class CoreChart {
        constructor(svg, key, granularities) {
            this.svg = svg;
            this.um = new UpdateManager(svg);
            this.gc = new GridChart(svg);
            this.cc = new CandleChart(svg);
            let objThis = this;

            this.timeout = undefined;

            console.log(`THIS IS SVG WIDTH : ${+parseInt(this.svg.node().getClientRects()[0].width)}`)

            function resizing() {
                if(objThis.svg.node) {
                    let nwidth = parseInt(objThis.svg.node().getClientRects()[0].width);
                    let xyScale = objThis.um.resize(nwidth, undefined);
                    objThis.gc.resize(nwidth, xyScale);

                    console.log(`THIS IS SVG WIDTH : ${nwidth}`)


                    // objThis.um.axctrl.xScale = xyScale.xScale;
                    // objThis.cc.refresh(xyScale.xScale, xyScale.yScale);
                    // clearTimeout(this.timeout)
                    // this.timeout = setTimeout(() => {
                    //     var t = d3.event.transform;
                    //     var newXScale = t.rescaleX(objThis.um.axctrl.xScale);
                    //     var newYScale = t.rescaleY(objThis.um.ayctrl.yScale);
                    //     objThis.cc.refresh(newXScale, newYScale);    
                    // }, 50)
                }
                 
            }

            function handleMouseMove() {
                let pos = d3.mouse(this)
                objThis.um.update(pos);
            }

            function updateChart() {

                var t = d3.event.transform;
        
                var d3mouse = d3.mouse(this);
                // recover the new scale
                var newXScale = t.rescaleX(objThis.um.axctrl.xScale);
                var newYScale = t.rescaleY(objThis.um.ayctrl.yScale);
                let pos = d3mouse
        
                objThis.gc.draw(newXScale, newYScale);
        
                objThis.um.cf.rescaleDraw(newXScale, newYScale, pos);
        
        
                // update axes with these new boundaries
        
                objThis.um.axctrl.g.call(d3.axisBottom(newXScale));
                objThis.um.ayctrl.g.call(d3.axisRight(newYScale));
        
                objThis.cc.setK(d3.event.transform.k);
                objThis.cc.refresh(newXScale, newYScale);
            }

            function cancelChart() {
                objThis.cc.cancel();
            }      
            
            
            var da = new DataFeed()
            da.download("/api/v1/resources/ticker?granularity=" + (granularities[key].granularity * granularities[key].factor))
                .then(data => {
                    let option = objThis.um.initialize(data, granularities[key]);
                    objThis.um.zoom.on("zoom", updateChart)
                        .on("end", cancelChart);
                    return Promise.resolve(option);
                })
                .then(option => {
                    objThis.cc.update(option)
                    objThis.gc.draw(option.xScale, option.yScale);
                    objThis.svg.on("mousemove", handleMouseMove)

                    new ResizeObserver(resizing).observe(document.getElementById("svgContainer"))

                })


        }

}
