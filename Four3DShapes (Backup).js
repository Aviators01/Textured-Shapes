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
	'attribute vec4 a_position;\n' +
	'attribute vec2 a_TexCoord;\n' +
	'varying vec2 v_TexCoord;\n' +
	'attribute float a_texopt;\n' +
	'varying float v_texopt;\n' +
	'uniform mat4 u_modelMatrix;\n' +
	'uniform mat4 u_ProjMatrix;\n' +
	'uniform mat4 u_viewMatrix;\n' +
	'void main(){ \n' +
	'	gl_Position = u_ProjMatrix * u_viewMatrix * u_modelMatrix * a_position;\n' +
	'	v_TexCoord = a_TexCoord;\n' +
	'	v_texopt = a_texopt;\n' +
	'}\n';

var FSHADER_SOURCE =
	'precision mediump float;\n' +
	'uniform sampler2D u_sampler0;\n' +
	'uniform sampler2D u_sampler1;\n' +
	'varying float v_texopt;\n' +
	'varying vec2 v_TexCoord;\n' +
	'void main() {\n' +
	'	vec4 color0 = texture2D(u_sampler0, v_TexCoord);\n' +
	'	vec4 color1 = texture2D(u_sampler1, v_TexCoord);\n' +
	'	if(v_texopt==0.0) gl_FragColor = color0;\n' +
	'	if(v_texopt==1.0) gl_FragColor = color1;\n' +
	'	if(v_texopt==2.0) gl_FragColor = color1;\n' +
	'	else gl_FragColor = color1;\n' +
	'}\n';

function main(){
	//Gets the canvas
	var canvas = document.getElementById('Lab');
	
	//Gets the WebGL rendering context in order for us to use the webgl system
	var gl = getWebGLContext(canvas);
	
	//This initializes the shaders. Parameters are (rendering context,vshader,fshader)
	var stat = initShaders(gl,VSHADER_SOURCE,FSHADER_SOURCE);
	if(!stat) console.log("Shaders failed to initialize");
	
	//This code section gets the memory location of the WebGL variables we specified earlier(a_position,u_FragColor)
	//Parameters are (program,name)
	var a_position = gl.getAttribLocation(gl.program,'a_position');
	var a_TexCoord = gl.getAttribLocation(gl.program,'a_TexCoord');
	var u_sampler0 = gl.getUniformLocation(gl.program, 'u_sampler0');
	var u_sampler1 = gl.getUniformLocation(gl.program, 'u_sampler1');
	var u_viewMatrix = gl.getUniformLocation(gl.program,'u_viewMatrix');
	var u_ProjMatrix = gl.getUniformLocation(gl.program,'u_ProjMatrix');
	var u_modelMatrix = gl.getUniformLocation(gl.program,'u_modelMatrix');
	
	//Clears the canvas. ie. cleans the drawing area.
	gl.clearColor(0.0,0.0,0.0,0.5);	//This specifies the color
	gl.clear(gl.COLOR_BUFFER_BIT);	//This actually cleans the canvas with the specified color
	
	//Creates view matrix and sets eyepoint/lookat/up direction
	var viewMat=new Matrix4();
	viewMat.setLookAt(0.1,-0.6,0.5,-0.2,-1,-0.8,0,1,0);
	gl.uniformMatrix4fv(u_viewMatrix,false,viewMat.elements);
	
	//Create projection matrix and pass to u_ProjMatrix
	var projMatrix=new Matrix4();
	projMatrix.setOrtho(-1,1,-1,1,-1,100);
	gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);
	
	//Draws the four shapes with their associated textures
	square(gl,a_position,u_sampler0,a_TexCoord,u_modelMatrix);
	simpletriangle(gl,a_position,u_sampler1,a_TexCoord,u_modelMatrix);
	
	//document.onkeydown = function(ev){ keydown(ev, gl,viewMat,projMatrix); };
}

var eyex=0.1;
var near=-1;
var far=100;
function keydown(ev, gl, viewMat) {
    if(ev.keyCode == 39) { // The right arrow key was pressed
      eyex += 0.01;
    } else 
    if(ev.keyCode == 37) { // The left arrow key was pressed
      eyex -= 0.01;
    }
	
	if(ev.keyCode == 87){  // w key pressed
		near += 0.1;
	}
	if(ev.keyCode == 83){  // s key pressed
		near -= 0.1;
	}
	if(ev.keyCode == 69){  // e key pressed
		far += 0.1;
	}
	if(ev.keyCode == 68){  // d key pressed
		far -= 0.1;
	}
	else return;
	
	viewMat.setLookAt(eyex,-0.6,0.5,-0.2,-1,-0.8,0,1,0);
	gl.uniformMatrix4fv(u_viewMatrix,false,viewMat.elements);
	
	projMatrix.setOrtho(-1,1,-1,1,near,far);
	gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);
	
    square(gl,a_position,u_sampler0,a_TexCoord,u_modelMatrix);
	simpletriangle(gl,a_position,u_sampler1,a_TexCoord,u_modelMatrix);    
}

function square(gl,position,u_sampler0,a_TexCoord,u_modelMatrix){
	//1. Create the buffer object
	var vertexBuffer = gl.createBuffer();
	
	//2. Bind the buffer object to a target
	gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer);
	
	//3. Write data to the buffer object
	var vertices = new Float32Array([
		-1,-1,-0.6,		0.0, 1.0,
		1,-1,-0.6,		0.0, 0.0,
		-1,-1,1,		1.0, 1.0,
		1,-1,1,			1.0, 0.0
	]);
	gl.bufferData(gl.ARRAY_BUFFER,vertices,gl.STATIC_DRAW);
	
	//4. Assign the buffer object to an attribute variable
	var FSIZE = vertices.BYTES_PER_ELEMENT;
	gl.vertexAttribPointer(position,3,gl.FLOAT,false,FSIZE*5,0);
	gl.vertexAttribPointer(a_TexCoord,2,gl.FLOAT,false,FSIZE*5,FSIZE*3);
	
	//5. Enable the assignment
	gl.enableVertexAttribArray(position);
	gl.enableVertexAttribArray(a_TexCoord);
	
	//Sets model matrix for rotating and transfers to WebGL system
	var modelMat=new Matrix4();
	modelMat.setIdentity();
	gl.uniformMatrix4fv(u_modelMatrix,false,modelMat.elements);
	
	
	//*********Texture part*********
	//Create texure and image object
	var image=new Image();
	image.src = 'Concrete.jpg';		//image source location
	
	//event handler called when image loaded
	image.onload = function(){
		//Flips image's y-axis because .jpg file has y-axis going down instead of up
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,1);
		
		//Activates texture unit 0 (8 textures units available)
		gl.activeTexture(gl.TEXTURE0);
		
		//Creates and binds texture object to target
		var texture=gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D,texture);
		
		//Sets texture parameters (ie. how texture image processed when texture image mapped to shape)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		
		/******
		After processing texture image, we now need to assign it to the texture object
		******/
		//Assigns image to texture object
		gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,image);
		
		//Sends texture image (gl.TEXTURE0) to fragment shader (u_sampler0)
		gl.uniform1i(u_sampler0,0);
		
		//Set textoption (ie. which texture we are going to use)
		var a_texopt = gl.getAttribLocation(gl.program, 'a_texopt');
		gl.vertexAttrib1f(a_texopt, 0.0);
		
		//Draws the shape
		gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
	};
}

function simpletriangle(gl,position,u_sampler1,a_TexCoord,u_modelMatrix){
	//1. Create the buffer object
	var vertexBuffer = gl.createBuffer();
	
	//2. Bind the buffer object to a target
	gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer);
	
	//3. Write data to the buffer object
	var vertices = new Float32Array([
		-1,1,-1,		0.0, 1.0,
		1,1,-1,			1.0, 1.0,
		-1,-1,-1,		0.0, 0.43,
		1,-1,-1,		1.0, 0.43
	]);
	gl.bufferData(gl.ARRAY_BUFFER,vertices,gl.STATIC_DRAW);
	
	//4. Assign the buffer object to an attribute variable
	var FSIZE = vertices.BYTES_PER_ELEMENT;
	gl.vertexAttribPointer(position,3,gl.FLOAT,false,FSIZE*5,0);
	gl.vertexAttribPointer(a_TexCoord,2,gl.FLOAT,false,FSIZE*5,FSIZE*3);
	
	//5. Enable the assignment
	gl.enableVertexAttribArray(position);
	gl.enableVertexAttribArray(a_TexCoord);
	
	//Sets model matrix for rotating and transfers to WebGL system
	var modelMat=new Matrix4();
	modelMat.setIdentity();
	gl.uniformMatrix4fv(u_modelMatrix,false,modelMat.elements);
	
	
	//*********Texture part*********
	//Create texure and image object
	var image=new Image();
	image.src = 'Ocean.jpg';		//image source location
	
	//event handler called when image loaded
	image.onload = function(){
		//Flips image's y-axis because .jpg file has y-axis going down instead of up
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,1);
		
		//Activates texture unit 0 (8 textures units available)
		gl.activeTexture(gl.TEXTURE0);
		
		//Creates and binds texture object to target
		var texture=gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D,texture);
		
		//Sets texture parameters (ie. how texture image processed when texture image mapped to shape)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		
		/******
		After processing texture image, we now need to assign it to the texture object
		******/
		//Assigns image to texture object
		gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,image);
		
		//Sends texture image (gl.TEXTURE0) to fragment shader (u_sampler1)
		gl.uniform1i(u_sampler1,0);
		
		//Set textoption (ie. which texture we are going to use)
		var a_texopt = gl.getAttribLocation(gl.program, 'a_texopt');
		gl.vertexAttrib1f(a_texopt, 1.0);
		
		//Draws the shape
		gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
	};
}
