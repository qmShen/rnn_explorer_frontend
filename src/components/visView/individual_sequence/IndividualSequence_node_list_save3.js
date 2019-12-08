/**
 * Created by qshen on 13/7/2019.
 */
import * as d3 from "d3";

let IndividualSequence = function(el){
  let _this = this;
  this.$el = el;
  this.canvas_width = this.$el.clientWidth;
  this.canvas_height = this.$el.clientHeight;
  this.svg = d3.select(el).append('svg')
    .attr('width', this.canvas_width)
    .attr('height', this.canvas_height);


  this.row0Config = {
    'top': 0,
    'height': 1,
    'width': this.canvas_width
  };
  this.row1Config = {
    'top': this.row0Config['top'] + this.row0Config['height'],
    'height': (this.canvas_height - this.row0Config['height']) * 0.2,
    'width': this.canvas_width
  };
  this.row2Config = {
    'top': this.row1Config['top'] + this.row1Config['height'],
    'height': (this.canvas_height - this.row0Config['height']) * 0.3,
    'width': this.canvas_width
  };
  this.row3Config = {
    'top': this.row2Config['top'] + this.row2Config['height'],
    'height': (this.canvas_height - this.row0Config['height'])  - this.row2Config['height'] - this.row1Config['height'],
    'width': this.canvas_width
  };

  this.titleConfig = this.row0Config;
  this.trendConfig = this.row1Config;
  this.gradientConfig = this.row2Config;
  this.rankConfig = this.row3Config;


  this.titleContainer =  this.svg.append('g').attr('class', 'trendContainer')
    .attr('transform', 'translate('+[0, this.titleConfig['top']] +')');

  this.trendContainer = this.svg.append('g').attr('class', 'trendContainer')
    .attr('transform', 'translate('+[0, this.trendConfig['top']] +')');
  this.gradientContainer = this.svg.append('g').attr('class', 'gradientContainer')
    .attr('transform', 'translate('+[0, this.gradientConfig['top']] +')');
  this.randContainer = this.svg.append('g').attr('class', 'rankContainer')
    .attr('transform', 'translate('+[0, this.rankConfig['top']] +')');

//  -----------------------------------------------------------------
  this.targetFeature = 'PM25';
};


let color_list_feature = ["#dc3912", "#3366cc", "#ff9900","#0099c6",  "#109618", "#66aa00", "#dd4477", "#990099",  "#b82e2e", "#316395", "#994499", "#22aa99", "#aaaa11", "#6633cc", "#e67300", "#8b0707", "#651067", "#329262", "#5574a6", "#3b3eac"];
let feature_color = d3.scaleOrdinal().range(color_list_feature);
feature_color.domain(["CO", "NO2", "O3", "SO2", "PM10", "PM25", "AQHI", "AQHIER", "Temp", "Wind", "WindDirection", "RH", "SeaLevelPressure", "DewPt", "CloudCover", "StationPresure"]);
let weekDay = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

let toDateTime = function(secs) {
  var t = new Date(1970, 0, 1);
  t.setSeconds(secs);
  return t;
};

let parse_attribute_name = function(attributes_name){
  let segs = attributes_name.split('_');
  let attr = segs[segs.length - 1];
  return attr;
};

let format_date = function(date){
  let month = date.getMonth() >= 9?date.getMonth() + 1:'0' + (date.getMonth() + 1);
  let day = date.getDate() >= 10?date.getDate():'0' + date.getDate();
  let hour = date.getHours() >= 10?date.getHours():'0' + date.getHours();
  let string = date.getFullYear() + '-' + month + '-' + day + ' ' + hour +':00:00  ' + weekDay[date.getDay()];
  return string;
};

IndividualSequence.prototype.get_color_by_index = function(index){

  let type = this.features[index]['type'];
  return feature_color(type);
};



IndividualSequence.prototype.set_Data = function(data){
  this.date = toDateTime(data['timestamp'])

  let featureNames = data['allFeature'];

  // Process raw feature value
  let featureValue = data['featureValue']['value'];
  let features = [];
  if(featureNames.length >= 0){
    for(let r in featureNames) {
      features.push({'name':r, 'type': parse_attribute_name(featureNames[r])});
    }
  }

  this.features = features;
  this.nTime = featureValue.length;
  let date_string = format_date(this.date);

  // Remove thitle and move to component
  // let title = this.titleContainer.append('text').text(date_string).attr('font-size', 10);
  // let box = title.node().getBBox();
  // title.attr('x', this.canvas_width / 2 - box['width'] / 2).attr('y', 12);

  this.renderFeatureTrend(this.trendContainer, this.trendConfig, featureValue, features);

  // Process cluster gradient
  let clusterGradient = data['featureGradientToEnd'][this.targetFeature]['feature_cluster_gradient'];

  this.renderGradientTrend(this.gradientContainer, this.gradientConfig, clusterGradient);

  // Process feature gradient

  let featureGradient = data['featureGradientToEnd'][this.targetFeature]['feature_gradient'];

  this.renderRankTrend(this.randContainer, this.rankConfig, featureGradient);
};

IndividualSequence.prototype.renderFeatureTrend = function(container, config, data, features){

  this.trendContainer.append('rect')
    .attr("width", this.trendConfig['width']).attr('height', this.trendConfig['height'])
    .attr('fill', 'none')//.attr('fill-opacity', 0.05)
    .attr('stroke','grey');


  // data 24 * 265, timestamp * feature_number
  let nTime = this.nTime;
  let nFeature = data[0].length;

  let featureTimeData = [];

  for(let i = 0, ilen = nFeature; i < ilen; i++){
    let featureArray = [];
    for(let j = 0, jlen = nTime; j <jlen; j++){
      featureArray.push(data[j][i]);
    }
    featureTimeData.push(featureArray);
  }
  let offsetX = config['width'] / this.nTime / 2;

  let xScale = d3.scaleLinear().domain([0, nTime-1]).range([0, config['width']]);
  let yScale = d3.scaleLinear().domain([1, 0]).range([0, config['height']]);
  let line = d3.line()
    .x(function (d, i) { return xScale(i); })
    .y(function (d, i) { return yScale(d);});

  let eLine = container.selectAll('.feature_line')
    .data(featureTimeData)
    .enter()
    .append('path')
    .attr('class', 'feature_line')
    .attr('d', line)
    .attr('stroke', (d, i) => {
      return feature_color(features[i]['name'])})
    .attr('fill', 'none')
    .attr('opacity', 0.4)
    .attr('stroke-width', 0.3);

};

IndividualSequence.prototype.renderGradientTrend = function(container, config, data){

  this.gradientContainer.append('rect')
    .attr("width", this.gradientConfig['width']).attr('height', this.gradientConfig['height'])
    .attr('fill', 'blue').attr('fill-opacity', 0)
    .attr('stroke','grey');

  let nHorizons = 3;
  let nCluster = data[0].length;
  let seqHeight = config['height'] / nCluster;
  let xScale = d3.scaleLinear().range([0, config['width']]).domain([0, this.nTime]);
  let yScale = d3.scaleLinear().clamp(true).range([0, seqHeight])
  let barWidth = config['width'] / this.nTime;

  let clusterGradient = []
  for(let i = 0, ilen = nCluster; i < ilen; i++){
    let clusterArray = [];
    for(let j = 0, jlen = this.nTime; j <jlen; j++){
      clusterArray.push(data[j][i]);
    }
    clusterGradient.push(clusterArray);
  }

  let max_val = d3.max(data.map(function(d){return d3.max(d)}));
  let horizonScale = d3.scaleQuantize()
    .range(d3.range(nHorizons)).domain([0, max_val]);

  function horizonData(d) {
    return horizonScale.range()
      .map(function(i) {
        return {
          yExtent: horizonScale.invertExtent(i),
          values: d
        };
      });
  }


  // console.log('domain', gradient_T.map(function(d) { return d.cluster_id; }))
  let seqContainers = container.selectAll('.barContainer').data(clusterGradient).enter().append('g').attr('class', 'barContainer')
    .attr('transform', (d,i)=>'translate(' + [0, i * seqHeight] + ')');


  console.log('clusterGradient__', clusterGradient);
  seqContainers.append('rect').attr('width', config['width']).attr('height', seqHeight).attr('fill-opacity', 0)
    .attr('stroke', 'red').attr('stroke-width', 0.2);

  seqContainers.append('title').text(function(_d, i){
    return "Cluster " + i;
  });

  let gHorizon = seqContainers.selectAll('.horizon').data(horizonData)
    .enter().append('g')
    .attr('class', 'horizon')

  let fill = function(d) {
      return d.yExtent[0] * 20;
    },
    fillScale = d3.scaleLinear().range(['lavender', 'purple']).interpolate(d3.interpolateHcl),
    fillValue = function(d) { return fillScale(fill(d)); };

  gHorizon.each(function(d, i) {

    yScale.domain(d.yExtent);

    let _container = d3.select(this).append('g').attr('class', 'barsContainer');

    _container.selectAll('rect').data(d['values']).enter().append('rect')
      .attr('x', (d, t)=> xScale(t)).attr('y', (d,i)=> seqHeight - yScale(d))
      .attr('width', barWidth).attr('height', (d,i)=>yScale(d))
      .style('fill', fillValue(d))

  })

};
let sortArrayRI = function(arr, topN){
  if(topN == undefined){topN = arr.length;}
  let indices = new Array(arr.length);
  for (var i = 0; i < arr.length; ++i) indices[i] = i;
  indices.sort(function (a, b) { return arr[a] < arr[b] ? 1 : arr[a] > arr[b] ? -1 : 0; });
  let rx = indices.slice(0, topN)
  return rx;
};

function transpose(matrix) {
  return matrix[0].map((col, i) => matrix.map(row => row[i]));
}

IndividualSequence.prototype.renderRankTrend = function(container, config, data){
  let __start_time = new Date();
  container.append('rect')
    .attr("width", config['width']).attr('height', config['height'])
    .attr('fill', 'none')//.attr('fill-opacity', 0.05)
    .attr('stroke','grey');

  let nTopFeature = 10;

  data = transpose(data);
  let topNFeatureList = [];
  for(let i = 0, ilen = data.length; i < ilen; i++){
    topNFeatureList.push(sortArrayRI(data[i], nTopFeature));
  }

  let xScale = d3.scaleLinear().domain([0, 24]).range([0, config['width']])
  let yScale = d3.scaleLinear().domain([0, nTopFeature ]).range([0, config['height']])

  let FID2Seq = {};
  console.log('tsopNFeatureList', topNFeatureList);
  for(let timeI = 0, ilen = topNFeatureList.length; timeI < ilen; timeI++){
    let seqI =topNFeatureList[timeI];
    for(let rank = 0, jlen = seqI.length; rank < jlen; rank++){
      if(FID2Seq[seqI[rank]] == undefined){
        FID2Seq[seqI[rank]] = [];
      }
      FID2Seq[seqI[rank]].push({'t': timeI, 'rank': rank});
    }
  }


  let columnsContainers = container.selectAll('.columnContainer').data(topNFeatureList).enter().append('g').attr('class', 'columnContainer')
    .attr('transform',(d, i) => 'translate('+ [xScale(i), 0]+')');
  let _this = this;  let idWithSeq = [];

  for(let fid in FID2Seq){
    idWithSeq.push({'fid': fid, 'seqs': FID2Seq[fid]});
  };
  console.log('FID2Seq', FID2Seq);
  let featureContainers = container.append('g').attr('class', 'featureContainer').selectAll('.featureContainer')
    .data(idWithSeq)
    .enter()
    .append('g').attr('class', 'featureContainer');

  let offsetY = config['height'] / nTopFeature / 2;
  let offsetX = config['width'] / this.nTime / 2;

  let _xScale = function(d){
    return xScale(d) + offsetX;
  };

  let _yScale = function(d){
    return yScale(d) + offsetY;
  };

  let noExtendHeight = 40;
  let featureHeight = (config['height'] - noExtendHeight) / this.topN;
  let size = featureHeight - 4;


  featureContainers.each(function(featureObj){
    let _container = d3.select(this);
    let segs = featureObj['seqs'];
    let _circle_container = _container.selectAll('.circleFeature').data(segs).enter().append('g').attr('class', "circleFeature")
      .attr('transform', d=>'translate('+[_xScale(d['t']), _yScale(d['rank'])] +')');

    // _circle_container.each(function(d){
    //   let _c = d3.select(this);
    //
    //   _this.renderGlyph(_c, size, size, 5, (featureHeight - size) / 2, '200_E_SO2');
    // })




    _circle_container.append('circle')
    // .attr('cx', d=>_xScale(d['t'])).attr('cy', d=>_yScale(d['rank']))
      .attr('r', 3).attr('stroke', d=>_this.get_color_by_index(featureObj['fid']))
      .attr('fill', 'none')
      .attr('fill', 'white')
      .append('title').text(function(d){
      _this.features[featureObj['fid']]['name'];
    })
     .attr('fill', d=>_this.get_color_by_index(featureObj['fid']));

    let links = [];
    if(segs.length<=1) return
    for(let i = 1, ilen = segs.length; i <ilen; i++){
      if(segs[i]['t'] - segs[i-1]['t'] > 1) continue;
      links.push({
        'source': segs[i-1],
        'target': segs[i]
      })
    }

    _container.selectAll('.links').data(links).enter().append('line').attr('class', 'link')
      .attr('x1',  d=>_xScale(d['source']['t'])).attr('y1', d=>_yScale(d['source']['rank']))
      .attr('x2',  d=>_xScale(d['target']['t'])).attr('y2', d=>_yScale(d['target']['rank']))
      .style('stroke',  d=>_this.get_color_by_index(featureObj['fid'])).style('stroke-width', 0.5)
  });




  // columnsContainers.each(function(d,columni){
  //   d3.select(this).selectAll('.rowCell').data(d).enter().append('circle').attr('class', 'rowCell')
  //     .attr('r', 2)
  //     .attr('cx', config['width'] / _this.nTime / 2)
  //     .attr('cy', (_, j)=> yScale(j) + config['height'] / d.length / 2)
  //     .attr('fill', 'red')
  // })
  console.log('use time', new Date() - __start_time);
};

IndividualSequence.prototype.on = function(eventName, method){
  if(eventName == 'mouseover') {
    this.mouseover = method;
    this.svg.on('mouseover', this.mouseover);
  }else if(eventName == 'mouseout'){
    this.mouseout = method;
    this.svg.on('mouseout', this.mouseout);
  }
};

IndividualSequence.prototype.distance_level = {0: 0, 10: 1, 30: 1, 100:3, 200: 4, 300: 4};
IndividualSequence.prototype.directions = {'E': 0,  'ES': 1, "S": 2, "SW": 3, "W": 4, "WN": 5, "N": 6, "NE": 7};


IndividualSequence.prototype.renderGlyph = function(container, width, height, ofx, ofy, name){
  let name_obj = this.parse_feature_name(name);
  console.log('name obj',name_obj);
  let direction = name_obj['direction'];
  let distance = name_obj['distance'];
  let feature = name_obj['feature'];
  let distance_level = this.distance_level[distance];

  let unit_width = width / 10;
  let unit_height = height / 10;
  let _x = ofx + (5- (distance_level + 1)) * unit_width ;
  let _y = ofy + (5- (distance_level + 1)) * unit_height ;
  let _w =  ((distance_level + 1)) * unit_width * 2;
  let _h = ((distance_level + 1)) * unit_height * 2;


  let _rect = container.append('rect').attr('x', ofx).attr('y', ofy)
    .attr('width', width)
    .attr('height', height)
    .attr('rx', 2).attr('ry', 2)
    .attr('fill', feature_color(feature))

    .attr('stroke', feature_color(feature))
    .attr('opacity', 0.4)

  let boundary_color = 'white';
  let _rect_out = container.append('rect')
    .attr('x', _x).attr('y', _y).attr('rx', 1).attr('ry', 1)
    .attr('width', _w).attr('height', _h)
    .attr('stroke', feature_color(feature))
    .attr('fill', "none");

  let _x2 = ofx + (5- (distance_level)) * unit_width ;
  let _y2 = ofy + (5- (distance_level)) * unit_height ;
  let _w2 = ((distance_level)) * unit_width * 2;
  let _h2 = ((distance_level)) * unit_height * 2;
  let _rect_in = container.append('rect')
    .attr('x', _x2).attr('y', _y2)
    .attr('fill', 'none')
    .attr('rx', 2).attr('ry', 2)
    .attr('width', _w2).attr('height', _h2);

  if(direction == -1){
    return
  }
  let direction_pi = Math.PI / 4 * this.directions[direction];

  let center_x =ofx + width / 2;
  let center_y = ofy + height / 2;
  let radius = Math.sqrt(height * height  + width * width) / 3;

  container.append("line")
    .style("stroke", feature_color(feature))
    .attr('stroke-width', 1.5)
    .attr("x1", center_x)
    .attr("y1",center_y)
    .attr("x2", _=>{
      return center_x + radius * Math.cos(direction_pi)
    })
    .attr("y2", center_y + radius * Math.sin(direction_pi))

};

IndividualSequence.prototype.parse_feature_name = function(feature_name){

  let name_arr = feature_name.split('_');
  if(name_arr.length == 1){
    return {
      distance: 0,
      direction: -1,
      feature: feature_name
    }
  }else{
    return {
      distance: parseInt(name_arr[0]),
      direction: name_arr[1],
      feature: name_arr[2]
    }
  }
};




export default IndividualSequence
