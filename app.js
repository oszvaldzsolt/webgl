var vertexShaderText =
[
	'precision mediump float;',
	'',
	'attribute vec2 vertPosition;',
	'',
	'void main()',
	'{',
	'	gl_Position = vec4(vertPosition, 0.0, 1.0);',
	'}'
].join('\n');

var fragmentShaderText = 
[
	'precision mediump float;',
	'',
	'void main()',
	'{',
	'	gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);',
	'}'
].join('\n');

// Get WebGL context, if standard is not available; fall back on alternatives
function GetWebGLContext( canvas )
{
    return canvas.getContext("webgl") ||            // Standard
    canvas.getContext("experimental-webgl") ||  // Alternative; Safari, others
    canvas.getContext("moz-webgl") ||           // Firefox; mozilla
    canvas.getContext("webkit-3d");             // Last resort; Safari, and maybe others
    // Note that "webgl" is not available as of Safari version <= 7.0.3
    // So we have to fall back to ambiguous alternatives for it,
    // and some other browser implementations.
}

var InitGame = function() {
	console.log('This is working!');
	
	var game_canvas = document.getElementById('game-canvas');
	var webgl = GetWebGLContext(game_canvas);
	
	if (!webgl) {
		alert('Your browser does not support WebGL!');
	}
	
	/*game_canvas.width = window.innerWidth;
	game_canvas.height = window.innerHeight;
	webgl.viewport(0, 0, window.innerWidth, window.innerHeight);*/
	
	webgl.clearColor(0.75, 0.85, 0.8, 1.0);
	webgl.clear(webgl.COLOR_BUFFER_BIT | webgl.DEPTH_BUFFER_BIT);
	
	var vertexShader = webgl.createShader(webgl.VERTEX_SHADER);
	var fragmentShader = webgl.createShader(webgl.FRAGMENT_SHADER);
	
	webgl.shaderSource(vertexShader, vertexShaderText);
	webgl.shaderSource(fragmentShader, fragmentShaderText);
	
	webgl.compileShader(vertexShader);
	if (!webgl.getShaderParameter(vertexShader, webgl.COMPILE_STATUS)) {
		alert('Vertex shader error: ' + webgl.getShaderInfoLog(vertexShader));
		return;
	}
	
	webgl.compileShader(fragmentShader);
	if (!webgl.getShaderParameter(fragmentShader, webgl.COMPILE_STATUS)) {
		alert('Vertex shader error: ' + webgl.getShaderInfoLog(fragmentShader));
		return;
	}
	
	var program = webgl.createProgram();
	webgl.attachShader(program, vertexShader);
	webgl.attachShader(program, fragmentShader);
	
	webgl.linkProgram(program);
	if (!webgl.getProgramParameter(program, webgl.LINK_STATUS))
	{
		alert('Error linking program ', webgl.getProgramInfoLog(program));
		return;
	}
	webgl.validateProgram(program);
	if (!webgl.getProgramParameter(program, webgl.VALIDATE_STATUS))
	{
		alert('Error validation program ', webgl.getProgramInfoLog(program));
		return;
	}
	
	//
	// Create buffer
	//
	
	var triangleVertices = 
	[ // X & Y
		0.0, 0.5,
		-0.5, -0.5,
		0.5, -0.5
	];
	//This will become the Vertex Buffer Object
	//It's porpuse is to move the vertex data in the GPU memory
	var triangleVertexBufferObject = webgl.createBuffer();
	//Bind buffer binds the VBO to the webgl.Array_Buffer which stores the vertices
	webgl.bindBuffer(webgl.ARRAY_BUFFER, triangleVertexBufferObject);
	//This bufferData uses the last binding variable to use a one way
	//data transfer towards the GPU (Statc_Draw)
	webgl.bufferData(webgl.ARRAY_BUFFER, new Float32Array(triangleVertices), webgl.STATIC_DRAW);
	
	//Gets the location of an attribute (vertex shader input value) from the GLSL code
	var positionAttributeLocation = webgl.getAttribLocation('vertPosition');
	
	webgl.vertexAttribPointer(
		positionAttributeLocation, //Attribute location
		2,	//Number of elements per attribute
		webgl.FLOAT, //type of elements
		webgl.FALSE, //No idea
		2 * Float32Array.BYTES_PER_ELEMENT, //Size of the individual vertex
		0 //Offset
	);
	
	webgl.enableVertexAttribArray(positionAttributeLocation);
	
	//
	//	The main render loop
	//
	
};