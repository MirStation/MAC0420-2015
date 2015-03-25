function loadObjFile(data) {

    // TO DO:   (i) Parse OBJ file and extract vertices and normal vectors
    // TO DO:  (ii) If normal vectors are not in the file, you will need to calculate them
    // TO DO: (iii) Return vertices and normals and any associated information you might find useful
    
    var verticesAux = []; // Array with all the vertices
    var normalsAux = []; // Array with all the normal vectors
    var objPacket = { vertices:[], numVertices:0, normals:[], maxCoordinateOf:[], minCoordinateOf:[] }; // Object with all the position vertices and the normal vectors
    var lines = data.split('\n'); // Splitting the obj file into an array of lines
    var line, token;
    var numVertices = 0;
    
    // Parsing the lines of the obj file
    for(var i=0; i<lines.length; i++){
	line = lines[i].trim(); // Removing possible white spaces at start or at the end of the line
	token = line.split(/\s+/); // Splitting by white space
	switch(token.shift()) {
    	case "v":
    	    // Appending the token array to the flatten array of vertices
	    console.log("v ");
	    verticesAux.push.apply(verticesAux, token);
            break;
    	case "vn":
            // Appending the token array to the flatten array of normals
	    console.log("vn");
	    normalsAux.push.apply(normalsAux, token);
	    break;
        case "f":
	    console.log("f");
	    var vPositions, vNormals;
        var faces = faceTriangulator(token);
	    var existNormal = checkNormal(faces[0]);
	    var needToCalculateNormal = true;
	    objPacket.numVertices += (faces.length * 3);
	    for(var j = 0; j < faces.length; j++) {
		vPositions = retrieveVertices(faces[j], 0, verticesAux);
		if(existNormal) {
		    vNormals = retrieveVertices(faces[j], 2, normalsAux);
		} else if(needToCalculateNormal) {
		    var normal = normalCalculator(vPositions[0], vPositions[1], vPositions[2]);
		    /* DEBUG
		    console.log("Calculated normal:");
		    console.log(normal[0] + " " + normal[1] + " " + normal[2]); 
		    --- */
		    vNormals = [];
		    vNormals[0] = normal;
		    vNormals[1] = normal;
		    vNormals[2] = normal;
		    needToCalculateNormal = false;
		}
		for(var k = 0; k < faces[j].length; k++) {
		    // Vertex Position
		    objPacket.vertices.push(vPositions[k][0]);
		    objPacket.maxCoordinateOf[0] = maxCoordinate(vPositions[k][0], objPacket.maxCoordinateOf[0]);
		    objPacket.minCoordinateOf[0] = minCoordinate(vPositions[k][0], objPacket.minCoordinateOf[0]);
		    objPacket.vertices.push(vPositions[k][1]);
		    objPacket.maxCoordinateOf[1] = maxCoordinate(vPositions[k][1], objPacket.maxCoordinateOf[1]);
		    objPacket.minCoordinateOf[1] = minCoordinate(vPositions[k][1], objPacket.minCoordinateOf[1]);
		    objPacket.vertices.push(vPositions[k][2]);
		    objPacket.maxCoordinateOf[2] = maxCoordinate(vPositions[k][2], objPacket.maxCoordinateOf[2]);
		    objPacket.minCoordinateOf[2] = minCoordinate(vPositions[k][2], objPacket.minCoordinateOf[2]);
		    objPacket.vertices.push(1.0);
		    // Vertex Normals
		    if(typeof vNormals === undefined && vNormals.length == 0) throw new Error("vNormals is undefined!");
		    objPacket.normals.push(vNormals[k][0]);
		    objPacket.normals.push(vNormals[k][1]);
		    objPacket.normals.push(vNormals[k][2]);
		    objPacket.normals.push(0.0);
		}
	    }
            break;
    	default:
    	    console.log("Ignored!");
            break;
	}
    }
    
    /* DEBUG
    console.log("numVertices: " + objPacket.numVertices);
    console.log("maxX: " + objPacket.maxCoordinateOf[0]);
    console.log("minX: " + objPacket.minCoordinateOf[0]);
    console.log("maxY: " + objPacket.maxCoordinateOf[1]);
    console.log("minY: " + objPacket.minCoordinateOf[1]);
    console.log("maxZ: " + objPacket.maxCoordinateOf[2]);
    console.log("minZ: " + objPacket.minCoordinateOf[2]);
	--- */
    return objPacket;
}

function faceTriangulator(face) {
    var triangles = [], triangle = [], index=0;
    var firstVertex, lastVertex;
    /* DEBUG
    console.log("faceTriangulation:");
    var f = "f ";
    for(var i = 0; i < face.length; i++) {
	f = f + face[i] + " ";
    }
    console.log(f);
    --- */
    if(face.length < 3) {
	throw new Error("Face definition with less than three elements!");
    } else {
	for(var i = 0; i < 3; i++) {
	    triangle[i] = face.shift(); 
	}
	triangles[index++] = triangle;
	if(typeof face !== undefined && face.length > 0) {
	    lastVertex = triangle[0];
	    firstVertex = triangle[2];
	    while(typeof face !== undefined && face.length > 0) {
		triangle=[];
		triangle[0] = firstVertex;
		triangle[1] = face.shift();
		triangle[2] = lastVertex;
		firstVertex = triangle[1];
		triangles[index++] = triangle;
	    }
	}
    }
    /* DEBUG
    console.log("triangulation:");
    for(var i = 0; i < triangles.length; i++) {
	console.log(triangles[i][0] + " " + triangles[i][1] + " " + triangles[i][2]);
    }
    --- */
    return triangles;
}

function checkNormal(face) {
    var vertex, res = true;
    if(face.length != 3) {
	throw new Error("The face must be triangular!");
    } else {
	vertex = face[0].split('/');
	if(vertex[2] == undefined) {
	    res = false;
	}
	return res;
    }
}

function retrieveVertices(face, typeVertex, vertices) {
    var verticesRetrieved = [];
    if(face.length != 3) {
	throw new Error("A triangulated face must have three vertices!");
    } else {
	for(var i = 0; i < face.length; i++) {
	    var vertex = face[i].split('/');
	    /* DEBUG
	    console.log("vertex: " + vertex[typeVertex]);
	    --- */
	    verticesRetrieved[i] = vec3(+vertices[(vertex[typeVertex] - 1) * 3 + 0], +vertices[(vertex[typeVertex] - 1) * 3 + 1], +vertices[(vertex[typeVertex] - 1) * 3 + 2]);
	}
    }
    /* DEBUG
    console.log("Triangular faces vertices:");
    for(var i = 0; i < verticesRetrieved.length; i++) {
	console.log("vp" + (i + 1) + ": " + verticesRetrieved[i][0] + " " + verticesRetrieved[i][1] + " " + verticesRetrieved[i][2]);
    }
    --- */
    return verticesRetrieved;
}

function normalCalculator(v1, v2, v3) {
    var perp, side1, side2;
    side1 = subtract(v2, v1);
    side2 = subtract(v3, v1);
    perp = cross(side1, side2);
    return normalize(perp);
}

function maxCoordinate(c, maxc) {
	return (c > maxc) || (maxc == undefined) ? c : maxc;
}

function minCoordinate(c, minc){
	return (c < minc) || (minc == undefined) ? c : minc;	
}
