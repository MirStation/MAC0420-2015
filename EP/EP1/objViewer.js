

var program;
var canvas;
var gl;

var numVertices  = 36;

var pointsArray = [];
var normalsArray = [];

// Object used to store all the obj infos
var objInfo;
// Flags used to prevent multiple applications of the same shading (multiples clicks on the same shading button)
var smoothShadingFlag;
var flatShadingFlag;

var vertices = [
    vec4( -0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5,  0.5,  0.5, 1.0 ),
    vec4( 0.5,  0.5,  0.5, 1.0 ),
    vec4( 0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5, -0.5, -0.5, 1.0 ),
    vec4( -0.5,  0.5, -0.5, 1.0 ),
    vec4( 0.5,  0.5, -0.5, 1.0 ),
    vec4( 0.5, -0.5, -0.5, 1.0 )
];

var lightPosition = vec4( 10.0, 10.0, 10.0, 0.0 );
var lightAmbient = vec4( 0.2, 0.2, 0.2, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4( 1.0, 0.0, 1.0, 1.0 );
var materialDiffuse = vec4( 1.0, 0.8, 0.0, 1.0);
var materialSpecular = vec4( 1.0, 0.8, 0.0, 1.0 );
var materialShininess = 100.0;

// transformation and projection matrices
var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;
var scaleMatrix, scaleMatrixLoc;

//var ctm;
var ambientColor, diffuseColor, specularColor;

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;
var axis = 1;
var theta =[0, 0, 0];

var thetaLoc;

// camera definitions
var eye = vec3(1.0, 0.0, 0.0);
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);

var cradius = 1.0;
var ctheta = 0.0;
var cphi = 0.0;

// our universe
var xleft = -1.0;
var xright = 1.0;
var ybottom = -1.0;
var ytop = 1.0;
var znear = -100.0;
var zfar = 100.0;

var flag = true;

// generate a quadrilateral with triangles
function quad(a, b, c, d) {
    
    var t1 = subtract(vertices[b], vertices[a]);
    var t2 = subtract(vertices[c], vertices[b]);
    var normal = vec4(cross(t1, t2), 0);
    
    pointsArray.push(vertices[a]); 
    normalsArray.push(normal); 
    pointsArray.push(vertices[b]); 
    normalsArray.push(normal); 
    pointsArray.push(vertices[c]); 
    normalsArray.push(normal);   
    pointsArray.push(vertices[a]);  
    normalsArray.push(normal); 
    pointsArray.push(vertices[c]); 
    normalsArray.push(normal); 
    pointsArray.push(vertices[d]); 
    normalsArray.push(normal);    
}

// define faces of a cube
function colorCube()
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}

var test;

window.onload = function init() {
    
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    
    // create viewport and clear color
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.5, 0.5, 0.5, 1.0 );
    
    // enable depth testing for hidden surface removal
    gl.enable(gl.DEPTH_TEST);
    
    //  load shaders and initialize attribute buffers
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    // draw simple cube for starters
    colorCube();
    
    // create vertex and normal buffers
    createBuffers(pointsArray, normalsArray);
    
    thetaLoc = gl.getUniformLocation(program, "theta"); 

    // create light components
    ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);
    
    // create model view and projection matrices
    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
    projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
    scaleMatrixLoc = gl.getUniformLocation(program, "scaleMatrix");

    
    document.getElementById("ButtonX").onclick = function(){axis = xAxis;};
    document.getElementById("ButtonY").onclick = function(){axis = yAxis;};
    document.getElementById("ButtonZ").onclick = function(){axis = zAxis;};
    document.getElementById("ButtonT").onclick = function(){flag = !flag;};

    // Apply flat shading
    document.getElementById("ButtonFS").onclick = function(){
	if(typeof objInfo !== 'undefined') {
	    if(flatShadingFlag) {
		createBuffers(objInfo.vertices, objInfo.faceNormals);
		flatShadingFlag = false;
		smoothShadingFlag = true;
	    }
	} else {
	    alert("Please, load an obj file first!");
	}
    };
    // Apply smooth shading
    document.getElementById("ButtonSS").onclick = function(){
	if(typeof objInfo !== 'undefined') {
	    if(smoothShadingFlag){
		createBuffers(objInfo.vertices, objInfo.vertexNormals);
		smoothShadingFlag = false;
		flatShadingFlag = true;
	    }
	} else {
	    alert("Please, load an obj file first!");
	}
    };
    
    document.getElementById('files').onchange = function (evt) {
        // TO DO: load OBJ file and display
        var file, reader;
        
        if (window.File && window.FileReader && window.FileList && window.Blob) {
            // All the File APIs are supported.
        } else {
            alert('The File APIs are not fully supported in this browser.');
        }
        file = evt.target.files[0]; // Getting just one file from the FileList object
        if(file) {
            reader = new FileReader();
            reader.onload = function(e) { 
                // After loading the FileList object as a text, we call loadObject
                loadObject(e.target.result);
            }  
            reader.readAsText(file);  // reading the FileList object as a text 
        }
    };
    
    gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"),
		  flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"),
		  flatten(diffuseProduct) );
    gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"),
		  flatten(specularProduct) );	
    gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"),
		  flatten(lightPosition) );
    
    gl.uniform1f(gl.getUniformLocation(program, "shininess"),materialShininess);
    
    render();
}

var render = function() {

    var displayWidth  = window.innerWidth;
    // Computing the right display height so that the hole page fits the web browser window without (vertical) scrolls
    var displayHeight = window.innerHeight - (document.body.clientHeight - canvas.clientHeight);

    // Computing the right scale matrix to resize canvas
    var min = Math.min(displayWidth,displayHeight);
    scaleMatrix = scale( min/displayWidth, min/displayHeight, min/displayWidth);

    if (canvas.width  != displayWidth || canvas.height != displayHeight) {
	canvas.width  = displayWidth;
        canvas.height = displayHeight;
    }
    // Resizing viewport
    gl.viewport(0, 0, canvas.width, canvas.height);

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if (flag) theta[axis] += 2.0;
            
    eye = vec3(cradius * Math.sin(ctheta) * Math.cos(cphi),
               cradius * Math.sin(ctheta) * Math.sin(cphi), 
               cradius * Math.cos(ctheta));

    modelViewMatrix = lookAt(eye, at, up);

    // Apply scale matrix to the model view matrix
    modelViewMatrix = mult(modelViewMatrix, scaleMatrix);
              
    modelViewMatrix = mult(modelViewMatrix, rotate(theta[xAxis], [1, 0, 0] ));
    modelViewMatrix = mult(modelViewMatrix, rotate(theta[yAxis], [0, 1, 0] ));
    modelViewMatrix = mult(modelViewMatrix, rotate(theta[zAxis], [0, 0, 1] ));
    
    projectionMatrix = ortho(xleft, xright, ybottom, ytop, znear, zfar);

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
    gl.uniformMatrix4fv(scaleMatrixLoc, false, flatten(scaleMatrix));
    
    gl.drawArrays( gl.TRIANGLES, 0, numVertices );
            
    requestAnimFrame(render);
}

function createBuffers(points, normals) {

    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW );
    
    var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );
    
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

}

function loadObject(data) {
    // Initialize objInfo with all the infos retrieved from the obj file
    objInfo = loadObjFile(data);
    // Apply transformation to the object so that he is centered at the origin
    for(var i=0, j=0; i<objInfo.numVertices; i++, j+=4) {
	objInfo.vertices[j] += objInfo.axisDistToCenter[0];
	objInfo.vertices[j+1] += objInfo.axisDistToCenter[1];
	objInfo.vertices[j+2] += objInfo.axisDistToCenter[2];
    }
    // Initialize the number of vertices and the buffers
    numVertices = objInfo.numVertices;
    createBuffers(objInfo.vertices, objInfo.normals);
    // Initialize smooth and flat shadings flags
    smoothShadingFlag = true;
    flatShadingFlag = true;
}
