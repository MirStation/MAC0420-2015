
var canvas; // :} Janela de visualização
var gl; // :} contexto webgl

var theta = 0.0;
var thetaLoc;

window.onload = function init()
{
    // :} Obtendo o contexto de desenho para o webgl do canvas (definido no html com o mesmo nome deste ficheiro)
    canvas = document.getElementById( "gl-canvas" ); 
    
    // :} Inicializando o contexto webgl (associado ao canvas anterior) 
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); } // :} Falha na criação do contexto webgl

    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height ); // :} Definindo o tamanho da zona de desenho
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 ); // :} Definindo a cor de fundo da zona de desenho

    //  Load shaders and initialize attribute buffers
    var program = initShaders( gl, "vertex-shader", "fragment-shader" ); // :} Carregando os scripts dos shaders na variável program
    gl.useProgram( program ); // :} Definindo o shader que deve ser usado para fazer os desenhos 

    /*
    
    :}
    
    Programas que são usados para definir como os vétices, transformações, materiais, luz, e câmara interagem uns com os outros para criar
    uma detreminada imagem são chamadas de shaders.
    Também podemos dizer que um shader é um programa que implementa algoritmos que pegam os pixeis de uma malha para coloca-los na tela (ou ecrã).

    Um shader, normalmente, é composto por duas partes: o vertex shader e o fragment shader.
    O vertex shader é responsável pela transformação das coordenadas do objeto no espeço 2D da visualização; 
    o frangment shader é responsável por gerar as cores (finais) de cada pixel (das transformações dos vértices) 
    a serem apresentadas na tela, dependendo da cor, textura luz e tipo de materiais.
    
    :}
    
    */

    // :} Criando os vértices do quadrado a ser desenhado
    
    var vertices = [
        vec2(  0,  1 ),
        vec2(  1,  0 ),
        vec2( -1,  0 ),
        vec2(  0, -1 )
    ];
    
    // Load the data into the GPU
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer
    var vPosition = gl.getAttribLocation( program, "vPosition" );  // :} Fazendo a ligação com a variável vPosition do shader
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
    
    thetaLoc = gl.getUniformLocation( program, "theta" ); // :} Fazendo a ligação com a variável theta do shader

    render();
};


function render() {
    
    gl.clear( gl.COLOR_BUFFER_BIT );

    theta += 0.1;
    gl.uniform1f( thetaLoc, theta );

    gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );

    window.requestAnimFrame(render);
}
