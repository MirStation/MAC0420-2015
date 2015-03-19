
var gl1, gl2;

// Variables used by the first triangle
var theta1 = 0.0;
var thetaLoc1;

// Variables used by the second triangle
var theta2 = 0.0;
var thetaLoc2;

window.onload = function init(){
    var vertices = [
        vec2(0, Math.sqrt(3)/4),
        vec2(1/2, -Math.sqrt(3)/4),
        vec2(-1/2, -Math.sqrt(3)/4)
    ];
    var colors = [
        vec4(0.0, 1.0, 0.0, 1.0),
        vec4(0.0, 1.0, 0.0, 1.0),
        vec4(0.0, 1.0, 0.0, 1.0)
    ];
    var res = initTriangle("gl-canvas", vertices, colors);
    gl1 = res[0];
    thetaLoc1 = res[1];
    var vertices = [
        vec2(0, -Math.sqrt(3)/4),
        vec2(1/2, Math.sqrt(3)/4),
        vec2(-1/2, Math.sqrt(3)/4)
    ];
    var colors = [
        vec4(0.0, 0.0, 1.0, 1.0),
        vec4(0.0, 0.0, 1.0, 1.0),
        vec4(0.0, 0.0, 1.0, 1.0)
    ];
    var res = initTriangle("gl-canvas2", vertices, colors);
    gl2 = res[0];
    thetaLoc2 = res[1];
    render();
};

function initTriangle(canvasId, vertices, colors)
{
    // :} Obtendo o contexto de desenho para o webgl do canvas (definido no html com o mesmo nome deste ficheiro)
    var canvas = document.getElementById( canvasId ); 
    
    // :} Inicializando o contexto webgl (associado ao canvas anterior) 
    var gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); } // :} Falha na criação do contexto webgl

    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height ); // :} Definindo o tamanho da zona de desenho
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 ); // :} Definindo a cor de fundo da zona de desenho

    //  Load shaders and initialize attribute buffers
    var program = initShaders( gl, "vertex-shader", "fragment-shader" ); // :} Carregando os scripts dos shaders na variável program
    gl.useProgram( program ); // :} Definindo o shader que deve ser usado para fazer os desenhos 

    var thetaLoc = setTriangle(program, gl, vertices, colors);
    return [gl, thetaLoc];
}

function setTriangle(program, gl, vertices, colors){

    // Load the data into the GPU
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer
    var vPosition = gl.getAttribLocation( program, "vPosition" );  // :} Fazendo a ligação com a variável vPosition do shader
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    var colorBufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

    var vColor = gl.getAttribLocation(program, "vColorAux");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray( vColor );

    return gl.getUniformLocation( program, "theta" );
}


function render() {

    // First Triangle
    gl1.clear(gl1.COLOR_BUFFER_BIT);
    theta1 += 0.01;
    gl1.uniform1f( thetaLoc1, theta1 );
    gl1.drawArrays( gl1.TRIANGLES, 0, 3 );

    // Second Triangle
    gl2.clear(gl2.COLOR_BUFFER_BIT);
    theta2 -= 0.01;
    gl2.uniform1f( thetaLoc2, theta2 );
    gl2.drawArrays( gl2.TRIANGLES, 0, 3 );

    window.requestAnimFrame(render);
}
