var vertexShaderText =
[
	'precision mediump float;',
	'',
	'attribute vec3 vertPosition;',
	'',
	'attribute vec3 vertColor;',
	'',
	'varying vec3 fragColor;',
	'',
	'uniform mat4 mWorld;',
	'uniform mat4 mView;',
	'uniform mat4 mProj;',
	'',
	'void main()',
	'{',
	'	fragColor = vertColor;',
	'	gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);',
	'}'
].join('\n');

var fragmentShaderText = 
[
	'precision mediump float;',
	'',
	'varying vec3 fragColor;',
	'',
	'void main()',
	'{',
	'	gl_FragColor = vec4(fragColor, 1.0);',
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
	webgl.enable(webgl.DEPTH_TEST);
	webgl.enable(webgl.CULL_FACE);
	webgl.frontFace(webgl.CCW);
	webgl.cullFace(webgl.BACK);

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
	
	var boxVertices = 
	[ // X, Y, Z           R, G, B
		// Top
		-1.0, 1.0, -1.0,   0.5, 0.5, 0.5,
		-1.0, 1.0, 1.0,    0.5, 0.5, 0.5,
		1.0, 1.0, 1.0,     0.5, 0.5, 0.5,
		1.0, 1.0, -1.0,    0.5, 0.5, 0.5,

		// Left
		-1.0, 1.0, 1.0,    0.75, 0.25, 0.5,
		-1.0, -1.0, 1.0,   0.75, 0.25, 0.5,
		-1.0, -1.0, -1.0,  0.75, 0.25, 0.5,
		-1.0, 1.0, -1.0,   0.75, 0.25, 0.5,

		// Right
		1.0, 1.0, 1.0,    0.25, 0.25, 0.75,
		1.0, -1.0, 1.0,   0.25, 0.25, 0.75,
		1.0, -1.0, -1.0,  0.25, 0.25, 0.75,
		1.0, 1.0, -1.0,   0.25, 0.25, 0.75,

		// Front
		1.0, 1.0, 1.0,    1.0, 0.0, 0.15,
		1.0, -1.0, 1.0,    1.0, 0.0, 0.15,
		-1.0, -1.0, 1.0,    1.0, 0.0, 0.15,
		-1.0, 1.0, 1.0,    1.0, 0.0, 0.15,

		// Back
		1.0, 1.0, -1.0,    0.0, 1.0, 0.15,
		1.0, -1.0, -1.0,    0.0, 1.0, 0.15,
		-1.0, -1.0, -1.0,    0.0, 1.0, 0.15,
		-1.0, 1.0, -1.0,    0.0, 1.0, 0.15,

		// Bottom
		-1.0, -1.0, -1.0,   0.5, 0.5, 1.0,
		-1.0, -1.0, 1.0,    0.5, 0.5, 1.0,
		1.0, -1.0, 1.0,     0.5, 0.5, 1.0,
		1.0, -1.0, -1.0,    0.5, 0.5, 1.0,
	];

	var boxIndices =
	[
		// Top
		0, 1, 2,
		0, 2, 3,

		// Left
		5, 4, 6,
		6, 4, 7,

		// Right
		8, 9, 10,
		8, 10, 11,

		// Front
		13, 12, 14,
		15, 14, 12,

		// Back
		16, 17, 18,
		16, 18, 19,

		// Bottom
		21, 20, 22,
		22, 20, 23
	];
	
	//This will become the Vertex Buffer Object
	//It's porpuse is to move the vertex data in the GPU memory
	var boxVertexBufferObject = webgl.createBuffer();
	//Bind buffer binds the VBO to the webgl.Array_Buffer which stores the vertices
	webgl.bindBuffer(webgl.ARRAY_BUFFER, boxVertexBufferObject);
	//This bufferData uses the last binding variable to use a one way
	//data transfer towards the GPU (Statc_Draw)
	webgl.bufferData(webgl.ARRAY_BUFFER, new Float32Array(boxVertices), webgl.STATIC_DRAW);
	
	var boxIndexBufferObject = webgl.createBuffer();
	webgl.bindBuffer(webgl.ELEMENT_ARRAY_BUFFER, boxIndexBufferObject);
	webgl.bufferData(webgl.ELEMENT_ARRAY_BUFFER, new Uint16Array(boxIndices), webgl.STATIC_DRAW);

	//Gets the location of an attribute (vertex shader input value) from the GLSL code
	var positionAttributeLocation = webgl.getAttribLocation(program, 'vertPosition');
	var colorAttributeLocation = webgl.getAttribLocation(program, 'vertColor');
	
	webgl.vertexAttribPointer(
		positionAttributeLocation, //Attribute location
		3,	//Number of elements per attribute
		webgl.FLOAT, //type of elements
		webgl.FALSE, //No idea
		6 * Float32Array.BYTES_PER_ELEMENT, //Size of the individual vertex
		0 //Offset
	);
	
	webgl.vertexAttribPointer(
		colorAttributeLocation, //Attribute location
		3,	//Number of elements per attribute
		webgl.FLOAT, //type of elements
		webgl.FALSE, //No idea
		6 * Float32Array.BYTES_PER_ELEMENT, //Size of the individual vertex
		3 * Float32Array.BYTES_PER_ELEMENT //Offset
	);
	//We need to enable the vertex attributes
	webgl.enableVertexAttribArray(positionAttributeLocation);
	webgl.enableVertexAttribArray(colorAttributeLocation);
	
	webgl.useProgram(program);
	
	var matWorldUniformLocation = webgl.getUniformLocation(program, 'mWorld');
	var matViewUniformLocation = webgl.getUniformLocation(program, 'mView');
	var matProjUniformLocation = webgl.getUniformLocation(program, 'mProj');
	
	//Initialize the matrices
	var worldMatrix = new Float32Array(16);
	var viewMatrix = new Float32Array(16);
	var projMatrix = new Float32Array(16);
	//Make them identity matrices
	mat4.identity(worldMatrix);
	mat4.lookAt(viewMatrix, [0, 0, -5], [0, 0, 0], [0, 1, 0]);
	mat4.perspective(projMatrix, glMatrix.toRadian(45), game_canvas.width / game_canvas.height, 0.1, 1000.0);
	//Copy the value back to vertex shader with uniform value
	//(4*4 matrix therefore the uniformMatrix4fv (f - float | v - vector))
	
	webgl.uniformMatrix4fv(matWorldUniformLocation, webgl.FALSE, worldMatrix);
	webgl.uniformMatrix4fv(matViewUniformLocation, webgl.FALSE, viewMatrix);
	webgl.uniformMatrix4fv(matProjUniformLocation, webgl.FALSE, projMatrix);
	
	var yRotationMatrix = new Float32Array(16);
	var xRotationMatrix = new Float32Array(16);

	//
	//	The main render loop
	//
	var identityMatrix = new Float32Array(16);
	mat4.identity(identityMatrix);
	var angle = 0;
	var loop = function() {
		angle = performance.now() / 100 / 6 / Math.PI * 2;
		//The worldMatrix will be the output
		//The identity matrix will be rotated with angle by the 'y' axis
		mat4.rotate(yRotationMatrix, identityMatrix, angle, [0, 1, 0]);
		mat4.rotate(xRotationMatrix, identityMatrix, angle/4, [1, 0, 0]);
		mat4.mul(worldMatrix, yRotationMatrix, xRotationMatrix);
		webgl.uniformMatrix4fv(matWorldUniformLocation, webgl.FALSE, worldMatrix);

		webgl.clearColor(0.75, 0.85, 0.8, 1.0);
		webgl.clear(webgl.COLOR_BUFFER_BIT | webgl.DEPTH_BUFFER_BIT);

		webgl.drawElements(webgl.TRIANGLES, boxIndices.length, webgl.UNSIGNED_SHORT, 0); //Zero stands for skipping, how many vertices we want to draw

		requestAnimationFrame(loop);
	}

	requestAnimationFrame(loop);
};