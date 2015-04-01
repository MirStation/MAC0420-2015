function loadObjFile(data) {

    // TO DO:   (i) Parse OBJ file and extract vertices and normal vectors
    // TO DO:  (ii) If normal vectors are not in the file, you will need to calculate them
    // TO DO: (iii) Return vertices and normals and any associated information you might find useful

    // Array with all the vertices
    var verticesAux = []; 
    // Array with all the normal vectors
    var normalsAux = [];
    // Array with all the triangular faces
    var facesAux = [];
    // Array with all the face normals
    var faceNormalsAux = [];
    // Array with all the vertex normals
    var vertexNormalsAux = [];
    // Number of distinct vertices
    var numDistinctVertices = 0;
    
    // Object with all the position vertices and the normal vectors
    var objPacket = { vertices:[], numVertices:0, numDistinctVertices:0, normals:[], faceNormals:[]/*, vertexNormals:[]*/, faceNormalsAux:[], faces:[], axisDistToCenter:[] }; 

    // Parsing the lines of the obj file
    var lines = data.split('\n'); // Splitting the obj file into an array of lines
    var line, token;
    for(var i=0; i<lines.length; i++){
	line = lines[i].trim(); // Removing possible white spaces at start or at the end of the line
	token = line.split(/\s+/); // Splitting by white space
	switch(token.shift()) {
    	case "v":
    	    // Appending the token array to the flatten array of vertices
	    console.log("v ");
	    numDistinctVertices++;
	    verticesAux.push.apply(verticesAux, token);
            break;
    	case "vn":
            // Appending the token array to the flatten array of normals
	    console.log("vn");
	    normalsAux.push.apply(normalsAux, token);
	    break;
        case "f":
	    // Appending the a triangulated face to the array of faces
	    console.log("f");
	    facesAux.push.apply(facesAux, faceTriangulator(token));
            break;
    	default:
            break;
	}
    }

    // Calculating the normals of each face
    var vPositions, faceNormal;

    //console.log("Face normals:");

    for(var i=0; i<facesAux.length; i++){
	vPositions = getInfoFromFace(facesAux[i], 0, verticesAux);
	faceNormalsAux.push(normalCalculator(vPositions[0], vPositions[1], vPositions[2]));

	//console.log("fN - " + normalCalculator(vPositions[0], vPositions[1], vPositions[2]));
    }

    /*
    // Calculating the normals of each vertex
    var adjacentNormals, vertexNormal, vertexIndex;

    //console.log("Vertex normals:");
    
    for(var v=1; v<=numDistinctVertices; v++){
	// Finding the normals of v's adjacent faces
	adjacentNormals = [];
	for(var i=0; i<facesAux.length; i++){
	    vertexIndex = getVerticesIndexesFromFace(facesAux[i]);
	    if((v == vertexIndex[0]) || (v == vertexIndex[1]) || (v == vertexIndex[2])){
		adjacentNormals.push(faceNormalsAux[i]);

		//console.log(":]");
	    }
	}

	//console.log("Adjacent normals:");
	//console.log(adjacentNormals);

	// Calculating v's normal
	vertexNormal = [0,0,0];
	for(var i=0; i<adjacentNormals.length; i++){
	    vertexNormal[0] += adjacentNormals[i][0];
	    vertexNormal[1] += adjacentNormals[i][1];
	    vertexNormal[2] += adjacentNormals[i][2];
	}

	//console.log("vertex normals 1:");
	//console.log(vertexNormal);

	vertexNormal[0] /= adjacentNormals.length;
	vertexNormal[1] /= adjacentNormals.length;
	vertexNormal[2] /= adjacentNormals.length;

	//console.log("vertex normals 2:");
	//console.log(vertexNormal);

	vertexNormalsAux.push(normalize(vertexNormal));

	//console.log("vN - " + normalize(vertexNormal));
    }
    */
    
    // Preparing objPacket for objViewer
    var vPositions, vNormals = [], maxCoordinateOf = [], minCoordinateOf = [];
    for(var i=0; i<facesAux.length; i++){
	vPositions = getInfoFromFace(facesAux[i], 0, verticesAux);
	if(typeof normalsAux !== 'undefined' && normalsAux.length == 0) {
	    // If the obj doesn't have normals, we use the (calculated) face normals as the default normals for the obj
	    vNormals[0] = faceNormalsAux[i];
	    vNormals[1] = faceNormalsAux[i];
	    vNormals[2] = faceNormalsAux[i];
	} else {
	    vNormals = getInfoFromFace(facesAux[i], 2, normalsAux);
	}
	//vertexIndex = getVerticesIndexesFromFace(facesAux[i]);
	for(var j=0; j<facesAux[i].length; j++){
	    // Vertex
	    objPacket.vertices.push(vPositions[j][0]);
	    objPacket.vertices.push(vPositions[j][1]);
	    objPacket.vertices.push(vPositions[j][2]);
	    objPacket.vertices.push(1.0);
	    // Vertex - Computing max and min vertices in each axis
	    // x
	    maxCoordinateOf[0] = maxCoordinate(vPositions[j][0], maxCoordinateOf[0]);
	    minCoordinateOf[0] = minCoordinate(vPositions[j][0], minCoordinateOf[0]);
	    // y
	    maxCoordinateOf[1] = maxCoordinate(vPositions[j][1], maxCoordinateOf[1]);
	    minCoordinateOf[1] = minCoordinate(vPositions[j][1], minCoordinateOf[1]);
	    // z
	    maxCoordinateOf[2] = maxCoordinate(vPositions[j][2], maxCoordinateOf[2]);
	    minCoordinateOf[2] = minCoordinate(vPositions[j][2], minCoordinateOf[2]);
	    // Normal
	    objPacket.normals.push(vNormals[j][0]);
	    objPacket.normals.push(vNormals[j][1]);
	    objPacket.normals.push(vNormals[j][2]);
	    objPacket.normals.push(0.0);
	    // Face normal
	    objPacket.faceNormals.push(faceNormalsAux[i][0]);
	    objPacket.faceNormals.push(faceNormalsAux[i][1]);
	    objPacket.faceNormals.push(faceNormalsAux[i][2]);
	    objPacket.faceNormals.push(0.0);
	    // Vertex normal
	    /*objPacket.vertexNormals.push(vertexNormalsAux[vertexIndex[j]-1][0]);
	    objPacket.vertexNormals.push(vertexNormalsAux[vertexIndex[j]-1][1]);
	    objPacket.vertexNormals.push(vertexNormalsAux[vertexIndex[j]-1][2]);
	    objPacket.vertexNormals.push(0.0);*/
	}
    }
    // Calculating the distance to the origin for each axis
    // x
    objPacket.axisDistToCenter[0] = distToCenter(maxCoordinateOf[0], minCoordinateOf[0]);

    //console.log("xDistToCenter: " + objPacket.axisDistToCenter[0]);

    // y
    objPacket.axisDistToCenter[1] = distToCenter(maxCoordinateOf[1], minCoordinateOf[1]); 

    //console.log("yDistToCenter: " + objPacket.axisDistToCenter[1]);

    // z
    objPacket.axisDistToCenter[2] = distToCenter(maxCoordinateOf[2], minCoordinateOf[2]); 

    //console.log("zDistToCenter: " + objPacket.axisDistToCenter[2]);

    // Calculating total number of vertices used by the faces
    objPacket.numVertices = facesAux.length * 3;

    objPacket.numDistinctVertices = numDistinctVertices;

    // TEST
    objPacket.faces = facesAux;
    objPacket.faceNormalsAux = faceNormalsAux;

    //console.log("NumVertices: " + objPacket.numVertices);

    return objPacket;
}

function faceTriangulator(face) {
    var triangles = [], triangle = [], index=0;
    var firstVertex, lastVertex;
    if(face.length < 3) {
	throw new Error("Face definition with less than three elements!");
    } else {
	for(var i = 0; i < 3; i++) {
	    triangle[i] = face.shift(); 
	}
	triangles[index++] = triangle;
	if(typeof face !== 'undefined' && face.length > 0) {
	    lastVertex = triangle[0];
	    firstVertex = triangle[2];
	    while(typeof face !== 'undefined' && face.length > 0) {
		triangle=[];
		triangle[0] = firstVertex;
		triangle[1] = face.shift();
		triangle[2] = lastVertex;
		firstVertex = triangle[1];
		triangles[index++] = triangle;
	    }
	}
    }
    return triangles;
}

function getVerticesIndexesFromFace(face) {
    var verticesIndexesRetrieved = [];
    if(face.length != 3) {
	throw new Error("A triangulated face must have three vertices!");
    } else {
	for(var i = 0; i < face.length; i++) {
	    var index = face[i].split('/');
	    verticesIndexesRetrieved[i] = +index[0];
	}
    }
    return verticesIndexesRetrieved;
}

function getInfoFromFace(face, typeInfo, infos) {
    var infoRetrieved = [];
    if(face.length != 3) {
	throw new Error("A triangulated face must have three vertices!");
    } else {
	for(var i = 0; i < face.length; i++) {
	    var index = face[i].split('/');
	    infoRetrieved[i] = vec3(+infos[(index[typeInfo] - 1) * 3 + 0], +infos[(index[typeInfo] - 1) * 3 + 1], +infos[(index[typeInfo] - 1) * 3 + 2]);
	}
    }
    return infoRetrieved;
}

function normalCalculator(v1, v2, v3) {
    var perp, side1, side2;
    side1 = subtract(v2, v1);
    side2 = subtract(v3, v1);
    perp = cross(side1, side2);
    return normalize(perp);
}

function maxCoordinate(c, maxc) {
    return (c > maxc) || (typeof maxc === 'undefined') ? c : maxc;
}

function minCoordinate(c, minc){
    return (c < minc) || (typeof minc === 'undefined') ? c : minc;	
}

function distToCenter(max, min) {
    var med = min + ((max - min) / 2);
    var absMed = Math.abs(med);
    return med >= 0 ? (-1 * absMed) : absMed;
}
