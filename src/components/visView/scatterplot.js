import * as d3 from 'd3'

let Scatter = function(el){

    let _this = this;
    this.$el = el;

    this.svg = d3.select(this.$el).select("svg");
    this.Width = this.$el.clientWidth;
    this.Height = this.$el.clientHeight;
    this.padding = 20

    this.svg.attr("width", this.Width)
    .attr("height", this.Height);

    this.xScale = d3.scaleLinear().range([this.padding, this.Width-this.padding]);
    this.yScale = d3.scaleLinear().range([this.Height - this.padding, this.padding]);

};

Scatter.prototype.update_render = function(data){
    let _this = this
    console.log(data.length)
    this.data_number = data.length
    this.dataset = new Array(this.data_number);
    for(let i=0;i<this.data_number;i++){
        this.dataset[i] = [data[i].x, data[i].y, data[i].timelabel];
    }

    this.xScale.domain([d3.min(this.dataset, function(d){ return d[0];}), 
    d3.max(this.dataset, function(d) { return d[0]; })]);
    this.yScale.domain([d3.min(this.dataset, function(d){ return d[1];}),
    d3.max(this.dataset, function(d){ return d[1];})]);

    this.svg.selectAll().remove();

    this.showlabel = this.svg.append("text")
                        .text("")
                        .attr("font-size", '10px');
    
    

    this.svg.selectAll("circle")
    .data(this.dataset)
    .enter()
    .append("circle")
    .attr("cx", (d,i) => this.xScale(d[0]))
    .attr("cy", (d,i) => this.yScale(d[1]))
    .attr("r", 3)

    this.svg.selectAll("circle")
    .on("mouseover", function(d,i){
        d3.select(this)
        .attr("fill", "red");

        _this.showlabel.text(d[2])
        .attr("x", _this.xScale(d[0]))
        .attr("y", _this.yScale(d[1]))
        .attr("fill", "black");
    })
    .on("mouseout", function(d,i){
        d3.select(this)
        .attr("fill", "black");

        _this.showlabel.text("");

    });


};

Scatter.prototype.move_render = function(data){
    let _this = this
    let move_data = new Array(this.data_number)
    for(let i=0;i<this.data_number;i++){
        move_data[i] = [    ((this.Width-2*this.padding)/99 * i + this.padding - this.xScale(this.dataset[i][0]))/100 * data + this.xScale(this.dataset[i][0]),
        (this.Height/2 - this.yScale(this.dataset[i][1]))/100 * data + this.yScale(this.dataset[i][1]),
        this.dataset[i][2]];
    }

    

    this.svg.selectAll("circle")
    .data(move_data)
    .transition()
    .duration(10)
    .attr("cx", (d,i) => d[0])
    .attr("cy", (d,i) => d[1])
    .attr("r", 3);

    this.svg.selectAll("circle")
    .on("mouseover", function(d,i){
        d3.select(this)
        .attr("fill", "red");

        _this.showlabel.text(d[2])
        .attr("x", d[0])
        .attr("y", d[1])
        .attr("fill", "black");
    })
    .on("mouseout", function(d,i){
        d3.select(this)
        .attr("fill", "black");

        _this.showlabel.text("");

    });



};


export default Scatter