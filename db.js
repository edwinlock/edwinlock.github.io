/*
 Dot Bid Workshop (http://madebyevan.com/fsm/)
 License: MIT License (see below)

 Copyright (c) 2010 Edwin Lock

 Permission is hereby granted, free of charge, to any person
 obtaining a copy of this software and associated documentation
 files (the "Software"), to deal in the Software without
 restriction, including without limitation the rights to use,
 copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the
 Software is furnished to do so, subject to the following
 conditions:

 The above copyright notice and this permission notice shall be
 included in all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 OTHER DEALINGS IN THE SOFTWARE.
*/

/*
Internal notes:
x,y are supposed to refer to bid coordinates
a,b are supposed to refer to canvas coordinates
*/

function DotBid(x,y,weight) {
	// creates object with coordinates and weight
	this.x = x
	this.y = y
	this.weight = weight
}

function BidList() {
	// maintains a set of DotBid objects
	this.list = new Set()
}

BidList.prototype.add = function(x,y,w) {
	// takes a DotBid at x,y with weight w and adds it to the list
	// check if bid exists with same coordinates. If not, add bid to list. Otherwise just add b.weight to existing bid's weight.
	for (let other of this.list) {
		if (other.x == x && other.y == y) {
			other.weight += w
			if (other.weight == 0) { this.list.delete(other)}
			return true
		}
	}
	this.list.add(new DotBid(x,y,w))
	return true
}

BidList.prototype.delete = function(x,y) {
	for (let other of this.list) {
		if (other.x = x && other.y == y) {
			this.list.delete(other)
			return true
		}
	}
	return false
}
BidList.prototype.draw = function() {
	// updates the table in the html document
}

CanvasData.prototype.toCanvasCoords = function(x,y) {
	return {
		a : x / this.xAxis * canvasWidth,
		b : canvasHeight - (y / this.yAxis * canvasHeight),
	}
}

CanvasData.prototype.toGridCoords = function(a,b) {
	return {
		x : a / canvasWidth * this.xAxis,
		y : this.yAxis - (b / canvasHeight * this.yAxis)
	}
}

CanvasData.prototype.snaptoInts = function(x,y) {
	return {
		x : math.round(x),
		y : math.round(y)
	}
}

CanvasData.prototype.draw = function() {
	// clear the canvas
	c.resetTransform()
	c.clearRect(0, 0, canvas.width, canvas.height);
	// draw axes
	this.drawAxes()
	// draw facet lines
	this.drawFacets()
	// draw bids
	for (let bid of bidList.list){
		this.drawBid(bid)
	}
}
CanvasData.prototype.drawAxes = function() {
	c.strokeStyle = "black"
	c.fillStyle = "black"
	c.font = "15px Arial"
	c.textAlign = "center"
	c.lineWidth = 2;
	c.translate(50,50)
	c.beginPath();
	c.moveTo(0,0)
	c.lineTo(this.toCanvasCoords(0,0).a, this.toCanvasCoords(0,0).b)
	c.lineTo(canvasWidth, canvasHeight)
	for (i=1; i <= this.xAxis; i++) {
		a = this.toCanvasCoords(i,0).a
		b = this.toCanvasCoords(i,0).b
		c.moveTo(a,b+10)
		c.lineTo(a,b-10)
		c.fillText(i, a, b+30);
	}
	for (i=1; i <= this.yAxis; i++) {
		a = this.toCanvasCoords(0,i).a
		b = this.toCanvasCoords(0,i).b
		c.moveTo(a+10,b)
		c.lineTo(a-10,b)
		c.fillText(i, a-30, b+5);
	}
	
	c.fillText("y",0,-20)
	c.fillText("x",canvasWidth+20,canvasHeight+5)
	c.stroke()
}

function CanvasData() {
	this.horizontals = {}
	this.verticals = {}
	this.diagonals = {}
	
	this.xAxis = 8
	this.yAxis = 6
	document.getElementById("xAxis").value = this.xAxis
	document.getElementById("yAxis").value = this.yAxis
	
	this.drawAxes()
}

CanvasData.prototype.generate = function() {
	this.horizontals = {}
	this.verticals = {}
	this.diagonals = {}
	
	for (let bid of bidList.list) {
		// add bid to horizontals and sort according to x coordinate
		if (this.horizontals[bid.y]) {
			this.horizontals[bid.y].push(bid)
			this.horizontals[bid.y].sort(function(a,b){return a.x-b.x})
		}
		else { this.horizontals[bid.y] = [bid] }
	
		// add bid to verticals and sort according to y coordinate
		if (this.verticals[bid.x]) {
			this.verticals[bid.x].push(bid)
			this.verticals[bid.x].sort(function(a,b){return a.y-b.y})
		}
		else { this.verticals[bid.x] = [bid] }
	
		// add bid to diagonals and sort according to x (or y) coordinate
		if (this.diagonals[bid.x-bid.y]) {
			this.diagonals[bid.x-bid.y].push(bid)
			this.diagonals[bid.x-bid.y].sort(function(a,b){return b.x-a.x})
		}
		else { this.diagonals[bid.x-bid.y] = [bid] }
	}
}

CanvasData.prototype.drawFacets = function() {
	// draw horizontals
	for (var y in this.horizontals) {
		h = this.horizontals[y]
		totalWeight = h[0].weight
		l = h.length
		i = 0
		
		while (i <= l-2 && h[i+1].x <= this.xAxis) {
			if (totalWeight != 0) { this.drawLine(h[i], h[i+1], totalWeight) }
			i += 1
			totalWeight += h[i].weight
		}
		// draw a facet line from last bid to edge of coordinate system
		if (totalWeight != 0 && h[i].x < this.xAxis && h[i].y < this.yAxis ) { this.drawLine(h[i], new DotBid(this.xAxis,y,0), totalWeight) }
	}
	
	// draw verticals
	for (var x in this.verticals) {
		v = this.verticals[x]
		totalWeight = v[0].weight
		l = v.length
		i = 0
		while (i <= l-2 && v[i+1].y <= this.yAxis) {
			if (totalWeight != 0) { this.drawLine(v[i], v[i+1], totalWeight) }
			i += 1
			totalWeight += v[i].weight
		}
		// draw a facet line from last bid to edge of coordinate system
		if (totalWeight != 0 && h[i].x < this.xAxis && h[i].y < this.yAxis ) { this.drawLine(v[i], new DotBid(x,this.yAxis,0), totalWeight) }
	}
	
	// draw diagonals
	for (var z in this.diagonals) {
		d = this.diagonals[z]
		totalWeight = d[0].weight
		l = d.length
		i = 0
		while (i <= l-2 && d[i+1].x <= this.xAxis) {
			if (totalWeight != 0) { this.drawLine(d[i], d[i+1], totalWeight) }
			i += 1
			totalWeight += d[i].weight
		}
		// draw a facet line from first bid to nearest axis
		var endpoint
		if (z > 0) {// x coordinate is larger than y coordinate
			endpoint = new DotBid(d[i].x - d[i].y, 0, 0)
		}
		else { endpoint = new DotBid(0, d[i].y - d[i].x, 0) }
		if (totalWeight != 0 && h[i].x < this.xAxis && h[i].y < this.yAxis ) { this.drawLine(d[i], endpoint, totalWeight) }
	}
}

CanvasData.prototype.drawLine = function(a, b, weight) {
	c.beginPath()
	if (weight < 0){
		colour = "red"
	}
	else if (weight > 0){
		colour = "black"
	}
	else {
		colour = "white"
	}
	
	c.strokeStyle = colour
	x = this.toCanvasCoords(a.x,a.y).a
	y = this.toCanvasCoords(a.x,a.y).b
	c.moveTo(x,y)
	x = this.toCanvasCoords(b.x,b.y).a
	y = this.toCanvasCoords(b.x,b.y).b
	c.lineTo(x,y)
	c.stroke()
	c.strokeStyle = "black"
}

CanvasData.prototype.drawBid = function(bid) {
	x = this.toCanvasCoords(bid.x,bid.y).a
	y = this.toCanvasCoords(bid.x,bid.y).b
	c.beginPath()
	c.arc(x, y, 10, 0, Math.PI * 2, true)
	if (bid.weight > 0) {
		c.fillStyle = "black"
		c.fill()
	}
	else {
		c.fillStyle = "white"
		c.strokeStyle = "black"
		c.fill()
		c.stroke()
	}
	c.fillStyle = "black"
	c.strokeStyle = "black"
	c.fillText(bid.weight, x-15,y-15)
}

function addABid() {
	// get info about bid we're adding
	var x = parseInt(document.getElementById("xcoord").value)
	var y = parseInt(document.getElementById("ycoord").value)
	var w = parseInt(document.getElementById("weight").value)
		
	bidList.add(x,y,w)
	canvasData.generate()
	canvasData.draw()
}

function changeCoordinates() {
	canvasData.xAxis = parseInt(document.getElementById("xAxis").value)
	canvasData.yAxis = parseInt(document.getElementById("yAxis").value)
	
	canvasData.generate()
	canvasData.draw()
}

var button = document.getElementById('btn-download');
button.addEventListener('click', function (e) {
    var dataURL = canvas.toDataURL('image/png');
    button.href = dataURL;
});

let canvasWidth = 800
let canvasHeight = 600
var canvas = document.getElementById("canvas")
var c = canvas.getContext("2d")

var bidList = new BidList()

var canvasData = new CanvasData();


