class DataFeed {
    constructor(option) {
        this.option = option
    }


    download(url) {
        return new Promise((resolve, reject) => {
            d3.csv(url, function (error, data) {
                if (error) {
                    reject(error);  
                }
                else {
                    var dateFormat = d3.timeParse("%Y-%m-%d %H:%M:%S");
        
                    for (var i = 0; i < data.length; i++) {       
                        data[i]['Date'] = dateFormat(data[i]['Date'])
                    }

                    resolve(data);
                }
            });
            
        });  
    }


    


}