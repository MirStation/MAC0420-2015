function loadObjFile(data) {

	// TO DO:   (i) Parse OBJ file and extract vertices and normal vectors
	// TO DO:  (ii) If normal vectors are not in the file, you will need to calculate them
	// TO DO: (iii) Return vertices and normals and any associated information you might find useful

	var verticesAux = []; // Array with all the vertices
	var normalVectorsAux = []; // Array with all the normal vectors
	var objPacket = { vertices:[], normalVectors:[] }; // Object with all the position vertices and the normal vectors
	var lines = data.split('\n'); // Splitting the obj file into an array of lines
	var line, token;
	
	// Parsing the lines of the obj file
	for(var i=0; i<lines.length;i++){
		line = lines[i].trim(); // Removing possible white spaces at start or at the end of the line
		token = line.split(/\s+/); // Splitting by white space
		switch(token.shift()) {
    		case "v":
    			// Appending the array token to the array vertices
        		vertices.push.apply(vertices, token);
        		break;
    		case "vn":
        		vertices.push.apply(vertices, token);
        		break;
        	case "f":
        		console.log("f: to be parsed ...");
        		break;
    		default:
    			console.log("Ignored!");
        		break;
		}
	}
}
