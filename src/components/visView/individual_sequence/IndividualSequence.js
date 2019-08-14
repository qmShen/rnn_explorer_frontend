/**
 * Created by qshen on 13/7/2019.
 */
import * as d3 from "d3";

let IndividualSequence = function(el, targetFeature){
  let _this = this;
  this.$el = el;
  this.canvas_width = this.$el.clientWidth;
  this.canvas_height = this.$el.clientHeight;
  this.svg = d3.select(el).append('svg')
    .attr('width', this.canvas_width)
    .attr('height', this.canvas_height);

  this.firstBatch = 20;
  this.topN = 10;

  this.row0Config = {
    'marginLeft': 30,
    'top': 0,
    'height': 1,
    'width': this.canvas_width
  };
  this.row1Config = {
    'marginLeft': 30,
    'top': this.row0Config['top'] + this.row0Config['height'],
    'height': (this.canvas_height - this.row0Config['height']) * 0.2,
    'width': this.canvas_width
  };
  this.row2Config = {
    'marginLeft': 30,
    'top': this.row1Config['top'] + this.row1Config['height'],
    'height': (this.canvas_height - this.row0Config['height']) * 0.3,
    'width': this.canvas_width
  };
  this.row3Config = {
    'marginLeft': 30,
    'top': this.row2Config['top'] + this.row2Config['height'],
    'height': (this.canvas_height - this.row0Config['height'])  - this.row2Config['height'] - this.row1Config['height'],
    'width': this.canvas_width
  };

  this.marginLeft = 30;

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
  this.targetFeature = targetFeature;
  // console.log('targetFeature', this.targetFeature);
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
//Should be written in config file
IndividualSequence.prototype.distance_level = {0: 0, 10: 1, 30: 1, 100:3, 200: 4, 300: 4};
IndividualSequence.prototype.directions = {'E': 0,  'ES': 1, "S": 2, "SW": 3, "W": 4, "WN": 5, "N": 6, "NE": 7};

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
      features.push({'fullName': featureNames[r] ,'name':r, 'type': parse_attribute_name(featureNames[r])});
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

  this.renderTopFeatures(this.randContainer, this.rankConfig, featureGradient);
};

IndividualSequence.prototype.renderFeatureTrend = function(container, config, data, features){

  this.trendContainer.append('rect')
    .attr("width", this.trendConfig['width']).attr('height', this.trendConfig['height'])
    .attr('fill', 'none')//.attr('fill-opacity', 0.05)
    .attr('stroke','grey');


  // data 24 * 265, timestamp * feature_number
  let nTime = this.nTime;
  let nFeature = data[0].length;

  let featureTrend = [];

  for(let i = 0, ilen = nFeature; i < ilen; i++){
    let featureArray = [];
    for(let j = 0, jlen = nTime; j <jlen; j++){
      featureArray.push(data[j][i]);
    }
    // name, value
    featureTrend.push({
      'feature':features[i].fullName,
      'value': featureArray,
    });
  }

  this.featureTrend = featureTrend;
  let offsetX = (config['width'] - this.marginLeft) / this.nTime / 2;

  let xScale = d3.scaleLinear().domain([0, nTime-1]).range([this.marginLeft, config['width']]);
  let yScale = d3.scaleLinear().domain([1, 0]).range([0, config['height']]);
  let line = d3.line()
    .x(function (d, i) { return xScale(i); })
    .y(function (d, i) { return yScale(d);});

  let LineContainer = container.selectAll('.feature_line')
    .data(featureTrend)
    .enter()
    .append('g')
    .attr('class', 'feature_line');


  this.LineContainer = LineContainer;
  LineContainer.each(function(d, i){
    let _container = d3.select(this);
    _container.datum(d.value).append('path')
      .attr('d', line)
      .attr('stroke', () => {
        return feature_color(features[i]['type'])})
      .attr('fill', 'none')
      .attr('opacity', 0.4)
      .attr('stroke-width', 0.3);
    if(d.render == undefined){
      d['render'] = {};
    }
    d['render']['container'] = this;
  });

  this.featureMap = {};
  featureTrend.forEach(d=>{
    this.featureMap[d.feature] = d;
  });
};

IndividualSequence.prototype.renderGradientTrend = function(container, config, data){

  this.gradientContainer.append('rect')
    .attr("width", this.gradientConfig['width']).attr('height', this.gradientConfig['height'])
    .attr('fill', 'blue').attr('fill-opacity', 0)
    .attr('stroke','grey');

  let nHorizons = 3;
  let nCluster = data[0].length;
  let seqHeight = config['height'] / nCluster;
  let xScale = d3.scaleLinear().range([this.marginLeft, config['width']]).domain([0, this.nTime]);
  let yScale = d3.scaleLinear().clamp(true).range([0, seqHeight]);
  let barWidth = config['width'] / this.nTime;

  let clusterGradient = [];
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

  let seqContainers = container.selectAll('.barContainer').data(clusterGradient).enter().append('g').attr('class', 'barContainer')
    .attr('transform', (d,i)=>'translate(' + [0, i * seqHeight] + ')');

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
  seqContainers.append('rect').attr('width', config['width']).attr('height', seqHeight).attr('fill-opacity', 0)
    .attr('stroke', 'grey').attr('stroke-width', 0.2);
};
let sortArrayRI = function(arr, topN){
  if(topN == undefined){topN = arr.length;}
  let indices = new Array(arr.length);
  for (var i = 0; i < arr.length; ++i) indices[i] = i;
  indices.sort(function (a, b) { return arr[a] < arr[b] ? 1 : arr[a] > arr[b] ? -1 : 0; });
  let rx = indices.slice(0, topN);
  return rx;
};

function transpose(matrix) {
  return matrix[0].map((col, i) => matrix.map(row => row[i]));
}

IndividualSequence.prototype.renderTopFeatures = function(container, config, data){

  // Data processing -------------------------------------------------------------------------------
  let __start_time = new Date();
  container.append('rect')
    .attr("width", config['width']).attr('height', config['height'])
    .attr('fill', 'none')//.attr('fill-opacity', 0.05)
    .attr('stroke','grey');

  let nTopFeature = this.firstBatch;

  data = transpose(data);
  let topNFeatureList = [];
  for(let i = 0, ilen = data.length; i < ilen; i++){
    topNFeatureList.push(sortArrayRI(data[i], nTopFeature));
  }

  let FID2Seq = {};

  for(let timeI = 0, ilen = topNFeatureList.length; timeI < ilen; timeI++){
    let seqI =topNFeatureList[timeI];
    for(let rank = 0, jlen = seqI.length; rank < jlen; rank++){
      if(FID2Seq[seqI[rank]] == undefined){
        FID2Seq[seqI[rank]] = [];
      }
      let preObj = FID2Seq[seqI[rank]].length == 0? null: FID2Seq[seqI[rank]][FID2Seq[seqI[rank]].length -1];
      let obj = {'t': timeI, 'rank': rank, 'pre': preObj, 'next': null};
      if(preObj){
        preObj['next'] = obj
      }
      FID2Seq[seqI[rank]].push(obj);
    }
  }
  let rankingList = [];
  for(let key in FID2Seq){
    rankingList.push({
      'feature_index': key,
      'topList': FID2Seq[key]
    })
  }
  rankingList.sort((a, b)=>{
    let x = a['topList'].length;
    let y = b['topList'].length;
    return ((x < y) ? 1 : ((x > y) ? -1 : 0));
  });

  let idWithSeq = [];
  for(let fid in FID2Seq){
    idWithSeq.push({'fid': fid, 'seqs': FID2Seq[fid]});
  };

  //-------------------------------------------------------------------------------------------
  let _this = this;
  let noExtendHeight = 40;


  let segHeight = 8;

  let topNList = rankingList.slice(0, this.topN);
  let otherList = rankingList.slice(this.topN, rankingList.length);

  let featureHeight = (config['height'] - noExtendHeight) / this.topN;

  let size = featureHeight - 4;

  // Render part -------------------------------------------------------------------------------
  let xScale = d3.scaleLinear().domain([0, 24]).range([this.marginLeft, config['width']]);
  let yScale = d3.scaleLinear().domain([0, nTopFeature]).range([0, config['height']] - noExtendHeight);

  let segWidth = xScale(2) - xScale(1);
  let containerWidth = 2 * segWidth;
  let lN = parseInt(config['width'] / containerWidth);

  container.append('rect').attr('fill', 'grey')
    .attr('fill-opacity', 0.0)
    .attr('y', config['height'] - noExtendHeight)
    .attr('width', config['width']).attr('height', noExtendHeight);

  // Draw other features


  let otherContainer = container.append('g').attr('transform', (d, i)=> 'translate(' + [0, config['height'] - noExtendHeight] + ')');
  otherContainer.append('rect').attr('fill', 'grey')
    .attr('fill-opacity', 0.0)
    .attr('width', config['width']).attr('height', noExtendHeight);

  let level1Container = otherContainer.append('g');

  let level1GlyphContainers = level1Container.selectAll('.glyphContainer').data(otherList.slice(0, lN * 2)).enter()
    .append('g').attr('class', 'glyphContainer')
    .attr('transform', (d, i)=> {
      let ofx = 0;
      let ofy = 5;
      if(i < lN){
        ofx = i * containerWidth;
      }else{
        ofx = (i - lN) * containerWidth;
        ofy = noExtendHeight / 2;
      }
      return 'translate(' + [ofx + containerWidth / 4, ofy] + ')'
    });


  level1GlyphContainers.each(function(d){
    let _container = d3.select(this);
    _this.renderGlyph(_container, size, size, 5, (featureHeight - size) / 2, _this.features[parseInt(d.feature_index)]['fullName']);
  });

  let level2Container = otherContainer.append('g').attr('transform', (d, i)=> 'translate(' + [0, noExtendHeight / 2] + ')');

  let topNFeatureContainers = container.append('g').attr('class', 'featureContainers').selectAll('.features')
    .data(topNList)
    .enter()
    .append('g').attr('class', 'features')
    .attr('transform', (d, i)=>'translate(' + [0, i * featureHeight] + ')');


  topNFeatureContainers.append('rect').attr('stroke', 'grey').attr('stroke-width', 0.2).attr('fill', 'white')
    .attr('width', config['width'])
    .attr('height', featureHeight);

  topNFeatureContainers.append('title').text(featureObj=>{
    return this.features[parseInt(featureObj['feature_index'])]['fullName'];
  });


  topNFeatureContainers.each(function(featureObj){

    let _container = d3.select(this);

    let segContainers = _container.selectAll('.exist').data(featureObj['topList']).enter().append('g').attr('class', 'exist')
      .attr('transform',(d, i)=>'translate(' + [xScale(d['t']), featureHeight / 2] + ')');

    segContainers.each(function(seg){
      let cellContainer = d3.select(this);
      if(seg['pre'] == null || seg['next'] == null || (seg['pre']['t'] != seg['t']-1) || seg['next']['t'] != seg['t']+1){
        // Do nothing
      }else if(seg['pre']['t'] == seg['t']-1){
        cellContainer.append('rect')
          .attr('height', segHeight).attr('width', segWidth + 2)
          .attr('x', -1 * segWidth / 2 - 1).attr('y', -1 * segHeight / 2 )
          .attr('fill', 'grey').attr('fill-opacity', 0.2)
      }
    });

    segContainers.each(function(seg){
      let cellContainer = d3.select(this);
      if(seg['pre'] == null || seg['next'] == null || (seg['pre']['t'] != seg['t']-1) ||seg['next']['t'] != seg['t']+1){
        cellContainer.append('circle')
          .attr('r', 4)
          .attr('fill', d=> _this.get_color_by_index(parseInt(featureObj.feature_index)))
          .attr('opacity', 0.7)
          .attr('stroke', d=> _this.get_color_by_index(parseInt(featureObj.feature_index)))
      }else if(seg['pre']['t'] == seg['t']-1){}
    });




    _container.selectAll('.exist').data(featureObj['topList']).enter().append('circle').attr('class', 'exist')
      .attr('cx', d=>xScale(d['t'])).attr('cy', featureHeight / 2)
      .attr('r', 4)
      .attr('fill', 'white')
      .attr('stroke', d=> _this.get_color_by_index(parseInt(featureObj.feature_index)))
      .attr('stroke-width', 2);

    // console.log('dd', featureObj);
  });

  let glyphContainers = topNFeatureContainers.append('g');

  glyphContainers.append('rect')
    .attr('x', 5).attr('y', (featureHeight - size) / 2)
    .attr('width', size).attr('height', size)
    .attr('fill', featureObj=> _this.get_color_by_index(parseInt(featureObj.feature_index)))
    .attr('fill-opacity', 0.1);

  glyphContainers.each(function(d){
    let _glyphContainer = d3.select(this);
    _this.renderGlyph(_glyphContainer, size, size, 5, (featureHeight - size) / 2, _this.features[parseInt(d.feature_index)]['fullName']);
  });
  // console.log('use time', new Date() - __start_time);
};

IndividualSequence.prototype.renderGlyph = function(container, width, height, ofx, ofy, name){
  let name_obj = this.parse_feature_name(name);
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



IndividualSequence.prototype.on = function(eventName, method){
  if(eventName == 'mouseover') {
    this.mouseover = method;
    this.svg.on('mouseover', this.mouseover);
  }else if(eventName == 'mouseout'){
    this.mouseout = method;
    this.svg.on('mouseout', this.mouseout);
  }
};


IndividualSequence.prototype.onHoverOn = function(featureName){

  if(this.featureMap == undefined || this.featureMap[featureName] == undefined){
    console.log('No featureName hover', featureName);
    return
  }
  d3.select(this.featureMap[featureName]['render']['container']).selectAll('path').attr('stroke-width', 2.5).attr('opacity', 1);

};

IndividualSequence.prototype.onHoverOut = function(){
  this.LineContainer.selectAll('path').attr('stroke-width', 0.3).attr('stroke-opacity', 0.4);
};

export default IndividualSequence
