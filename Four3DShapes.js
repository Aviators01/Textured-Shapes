/*
Timothy Queva
CS3110 Lab7
December 2, 2020
*/

/*
For this lab, we draw four 3D shapes, apply a different texture to each shape,
and enable control of view through keyboard keys(left/right arrow). We are using
orthogonal perspective and also providing control to user of the near/far plane.

Note: in order to "kill two birds with one stone," work for this lab is also being
used for the project.

Open this in Firefox with strict_origin_policy toggled to false
file:///C:/Users/tqttb/Documents/University/GPRC%20(2019-)/2020-2021/CS3110/CS3110%20Labs/Lab7/Four3DShapes.html
*/

var VSHADER_SOURCE =
	'attribute vec4 a_Position;\n' +
	'attribute vec2 a_TexCoord;\n' +
	'attribute float a_whichtex;\n' +
	'varying vec2 v_TexCoord;\n' +
	'varying float v_whichtex;\n' +
	'void main() {\n' +
	'	gl_Position = a_Position;\n' +
	'	v_TexCoord = a_TexCoord;\n' +
	'	v_whichtex = a_whichtex;\n' +
	'}\n';

//Fragment shader program
var FSHADER_SOURCE =
	'#ifdef GL_ES\n' +
	'precision mediump float;\n' +
	'#endif\n' +
	'uniform sampler2D u_Sampler0;\n' +
	'uniform sampler2D u_Sampler1;\n' +
	'uniform sampler2D u_Sampler2;\n' +
	'uniform sampler2D u_Sampler3;\n' +
	'varying vec2 v_TexCoord;\n' +
	'varying float v_whichtex;\n' +
	'void main() {\n' +
	'	vec4 color0 = texture2D(u_Sampler0, v_TexCoord);\n' +
	'	vec4 color1 = texture2D(u_Sampler1, v_TexCoord);\n' +
	'	vec4 color2 = texture2D(u_Sampler2, v_TexCoord);\n' +
	'	vec4 color3 = texture2D(u_Sampler3, v_TexCoord);\n' +
	'	if(v_whichtex==0.0) gl_FragColor = color0;\n' +
	'	else if(v_whichtex==1.0) gl_FragColor = color1;\n' +
	'	else if(v_whichtex==2.0) gl_FragColor = color2;\n' +
	'	else gl_FragColor = color3 ;\n' +
	'}\n';

function main() {
  // Retrieve <canvas> element
  var canvas = document.getElementById('Lab');

  // Get the rendering context for WebGL
  var gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // Set the vertex information
  var n = initVertexBuffers(gl);
  if (n < 0) {
    console.log('Failed to set the vertex information');
    return;
  }

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Set texture
  if (!initTextures(gl, n)) {
    console.log('Failed to intialize the texture.');
    return;
  }
}

function initVertexBuffers(gl) {
	var vertices = new Float32Array([
		// Vertex coordinate, Texture coordinate
		-0.5,0.9,	-0.5,0.0,
		0.5,0.9,	0.5,0.0,
		-0.5,0.0,	-0.5,-0.9,
		0.5,0.0,	0.5,-0.9,
	]);
	var n = 4; // The number of vertices
	
	var TexCoords = new Float32Array([
		0.0, 1.0,	0.0, 0.0,
		1.0, 1.0,	1.0, 0.0,
		0.0,1.0,	0.0,0.0,
		1.0,1.0,	1.0,0.0
	]);
	
  // Create a buffer object
  var vertexBuffer = gl.createBuffer();
  var TexCoordBuffer = gl.createBuffer();

  // Write the positions of vertices to a vertex shader
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER,TexCoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER,TexCoords,gl.STATIC_DRAW);
  
  //Get the storage location of a_Position, assign and enable buffer
  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return -1;
  }
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Position);  // Enable the assignment of the buffer object

  // Get the storage location of a_TexCoord
  var a_TexCoord = gl.getAttribLocation(gl.program, 'a_TexCoord');
  if (a_TexCoord < 0) {
    console.log('Failed to get the storage location of a_TexCoord');
    return -1;
  }
  gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, 0,0);
  gl.enableVertexAttribArray(a_TexCoord);  // Enable the buffer assignment

  return n;
}

function initTextures(gl, n) {
  // Create a texture object
  var texture0 = gl.createTexture(); 
  var texture1 = gl.createTexture();
  if (!texture0 || !texture1) {
    console.log('Failed to create the texture object');
    return false;
  }

  // Get the storage location of u_Sampler0 and u_Sampler1
  var u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
  var u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
  if (!u_Sampler0 || !u_Sampler1) {
    console.log('Failed to get the storage location of u_Sampler');
    return false;
  }

  // Create the image object
  var image0 = new Image();
  var image1 = new Image();
  if (!image0 || !image1) {
    console.log('Failed to create the image object');
    return false;
  }
  // Register the event handler to be called when image loading is completed
  image0.onload = function(){ loadTexture(gl, n, texture0, u_Sampler0, image0, 0); };
  image1.onload = function(){ loadTexture(gl, n, texture1, u_Sampler1, image1, 1); };
  // Tell the browser to load an Image
  image0.src = 'Concrete.jpg';
  image1.src = 'Ocean.jpg';

  return true;
}
// Specify whether the texture unit is ready to use
var g_texUnit0 = false, g_texUnit1 = false; 
function loadTexture(gl, n, texture, u_Sampler, image, texUnit) {
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);// Flip the image's y-axis
  // Make the texture unit active
  if (texUnit == 0) {
    gl.activeTexture(gl.TEXTURE0);
    g_texUnit0 = true;
  } else {
    gl.activeTexture(gl.TEXTURE1);
    g_texUnit1 = true;
  }
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);   

  // Set texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the image to texture
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
  
  gl.uniform1i(u_Sampler, texUnit);   // Pass the texure unit to u_Sampler
  
  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
  var a_whichtex = gl.getAttribLocation(gl.program, 'a_whichtex');
  if (a_whichtex < 0) {
    console.log('Failed to get the storage location of a_whichtex');
    return -1;
  }

	if (g_texUnit0 && g_texUnit1){
		gl.vertexAttrib1f(a_whichtex, 0.0);
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
   
		// Draw the rectangle
		gl.vertexAttrib1f(a_whichtex, 1.0);
		gl.drawArrays(gl.TRIANGLE_STRIP, 4, 4);
	}
}
