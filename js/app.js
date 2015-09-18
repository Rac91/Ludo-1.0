if ( ! Detector.webgl ) 
	Detector.addGetWebGLMessage();

var container, stats;
var camera, controls, scene, renderer;

var tileSize = 20;
var tileIdentifier = 'tile',
	coinIdentifier = 'coin',
	playerIdentifier = 'player';

var objects = [];
var selectedObject;
var currentIndex = 0,endPoint=0,startPoint=0;
var cube, movingCoin,nextTIle;
var user = {};

// init();
// initUser();

var deltaX, deltaY, deltaRotate,
	startTime, startX, startY, startRotate,
	moving = false;
var diceValue;
var transitionTime = 200;
var boardState = 0;

var objectLoader;
var	toLoad = { 'coin': ['texturedDabba.json', 'brick.jpg'],
			   'fence': ['fence.json', 'bark.jpg', 'wood.jpg', 'woodLight.jpg'] },
	toLoadCount = Object.keys(toLoad).length;
var loadedObjects={},
	loadedTextures = {},
	loadedCount=0;

loadObjects();

function loadObjects()
{
	objectLoader = new THREE.JSONLoader();
	objectLoader.showStatus = true;

	keys = Object.keys(toLoad);
	for(var i=0;i<toLoadCount;i++)
	{
		key = keys[i];
		images = toLoad[key];
		for(var j=1; j<images.length;j++)
			loadTextures(key, images[j]);
	}
}

function loadTextures(key, image)
{
	THREE.ImageUtils.loadTexture(image, THREE.UVMapping, function (texture) {
		if(!loadedTextures[key])
			loadedTextures[key] = {};
		loadedTextures[key][image] = texture;
		if(Object.keys(loadedTextures[key]).length+1===toLoad[key].length)
			loadObject(key);
	});
}

function loadObject(key)
{
	source = toLoad[key][0];
	objectLoader.load( source, function(geometry, materials) {
		textures = loadedTextures[key];
		for(var i=0;i<materials.length;i++)
		{
			texName = materials[i].name;
			if (textures[texName])
				materials[i].map = textures[texName];
		}
		var material = new THREE.MeshFaceMaterial( materials );
		// loadedMesh = new THREE.Mesh( geometry,material);
		loadedObjects[key] = [geometry, material];
		loadedCount++;
		if (loadedCount===toLoadCount)				
			init();
	});
}

function init() 
{
	camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 2000 );
	camera.position.x =  camera.position.y = -7 * tileSize;
	camera.position.z = 200;
	camera.up.set(0,0,1);

	controls = new THREE.OrbitControls( camera );
	controls.damping = 0.2;

	controls.maxPolarAngle = 2*Math.PI/5;

	controls.minAzimuthAngle = -Math.PI/2;
	controls.maxAzimuthAngle = 0;

	controls.addEventListener( 'change', render );

	scene = new THREE.Scene();
    var axes = new THREE.AxisHelper(200);
    scene.add(axes);
	scene.fog = new THREE.FogExp2( 0xcccccc, 0.002 );

	var tile = new THREE.PlaneBufferGeometry (tileSize*0.9, tileSize*0.9, 10, 10);
	// var img = new THREE.MeshBasicMaterial({ 
	//     map:THREE.ImageUtils.loadTexture('img/woodtile.jpg')
	//  });
	// img.map.needsUpdate = true;
    var material = new THREE.MeshPhongMaterial({
	  color: 0xdddddd, 
	  wireframe: true
	});
    // img.map.needsUpdate = true;

    // var offset = -tileCount * tileSize/2;
    var parallelDirection;
    for(var i=0;i<13;i++)
    {
    	var a,b;
	    if(i<6)
	    {
	    	a = i-7;
	    	b = 1;
	    	parallelDirection = 0;
	    }
	    else if(i<12)
	    {
	    	a = -1;
	    	b = i-4;
	    	parallelDirection = -Math.PI/2;
	    }
	    else
	    {
	    	a=0 ;
	    	b=7;
	    	parallelDirection = 0;
	    }

	    //Player1 surround
		var plane = new THREE.Mesh(tile, material);
	    plane.position.y = (a) * tileSize ;
	    plane.position.x = (b) * tileSize;
	    plane.name =  + i;
	    plane.userData.move =false;
	    plane.userData.id=i;
	    plane.userData.next=i+1;
	    plane.rotation.z = parallelDirection;
	    scene.add(plane);
	    objects.push(plane);

	    //Player2 surround
	    var plane = new THREE.Mesh(tile, material);
	    plane.position.y = (b) * tileSize ;
	    plane.position.x = (-a) * tileSize;
	    plane.name = tileIdentifier + (i + 13);
	    plane.userData.move =false;
	    plane.userData.id=i+13;
	    plane.userData.next=i+14;
	    plane.rotation.z = parallelDirection+Math.PI/2;
	    scene.add(plane);
	    objects.push(plane);

	    //Player3 surround
	    var plane = new THREE.Mesh(tile, material);
	    plane.position.y = (-a) * tileSize ;
	    plane.position.x = (-b) * tileSize;
	    plane.name = tileIdentifier + (i + 26);
	    plane.userData.move =false;
	    plane.userData.id=i+26;
	    plane.userData.next=i+27;
	    plane.rotation.z = parallelDirection+Math.PI;
	    scene.add(plane);
	    objects.push(plane);

	    var plane = new THREE.Mesh(tile, material);
	    plane.position.y = (-b) * tileSize ;
	    plane.position.x = (a) * tileSize;
	    plane.name = tileIdentifier + (i + 39);
	    plane.userData.id=i+39;
	    plane.rotation.z = parallelDirection+3*Math.PI/2;
	    plane.userData.move =false;
	    if(i<12)
	    	plane.userData.next=i+40;
	    else
	    {
		    plane.userData.next=0;
	    }
	    scene.add(plane);
	    objects.push(plane);
	}

	light = new THREE.DirectionalLight( 0xffffff );
	light.position.set( 1, 1, 1 );
	// scene.add( light );

	light = new THREE.DirectionalLight( 0x002288 );
	light.position.set( -1, -1, -1 );
	// scene.add( light );

	light = new THREE.AmbientLight( 0xdddddd );
	scene.add( light );

	// renderer

	renderer = new THREE.WebGLRenderer( { antialias: false } );
	renderer.setClearColor( scene.fog.color );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );

	document.body.appendChild( renderer.domElement );

	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.top = '0px';
	stats.domElement.style.zIndex = 100;
	document.body.appendChild( stats.domElement );


	raycaster = new THREE.Raycaster();
	mouse = new THREE.Vector2();

	window.addEventListener( 'resize', onWindowResize, false );
	document.addEventListener( 'mousedown', onDocumentMouseDown, false );
	document.addEventListener( 'click', clickBoard, false );

	initUser()
	animate();
}

function initUser()
{
	var geometry = loadedObjects['coin'][0];
	var material = loadedObjects['coin'][1];

	var a = 75;
	var b = 100;
	xSign = [-1, -1, 1, 1];
	ySign = [-1, 1, 1,-1];
	
	for(var i=0; i<4;i++)
		{   
			//User profile
			var coins = [];
			var playerDict = {};

			//initilize coins
			x=xSign[i];
			y=ySign[i];
			cube = new THREE.Mesh( geometry, material );
			cube.position.copy( new THREE.Vector3( a*x, b*y, 10 ));
			cube.name = playerIdentifier + (i+1) + coinIdentifier + '0';
			cube.userData.position = -1;
			cube.userData.dice = 0;
			cube.userData.start = i*13;
			scene.add( cube );
			objects.push( cube );
			coins.push(cube);

			cube = new THREE.Mesh( geometry, material );
			cube.position.copy(new THREE.Vector3( b*x, a*y, 10 ));
			cube.name = playerIdentifier+ (i+1) + coinIdentifier + '1';
			cube.userData.position = -1;
			scene.add( cube );
			objects.push( cube );
			coins.push(cube);

			cube = new THREE.Mesh( geometry, material );
			cube.position.copy(new THREE.Vector3( a*x, a*y, 10 ));
			cube.name = playerIdentifier + (i+1) + coinIdentifier + '2';
			cube.userData.position = -1;
			scene.add( cube );
			objects.push( cube );
			coins.push(cube);

			cube = new THREE.Mesh( geometry, material );
			cube.position.copy(new THREE.Vector3( b*x, b*y, 10 ));
			cube.name = playerIdentifier + (i+1) + coinIdentifier + '3';
			cube.userData.position = -1;
			scene.add( cube );
			objects.push( cube );
			coins.push(cube);

			playerDict["coins"]   = coins;
			playerDict["dice"] = 0; 
			user['PLAYER' + (i + 1)] = playerDict;
			user['remaining'] = 0;
			user['active']    = false;
		}

}

function clickBoard()
{	
	var playerObject = user[whoIsplaying];
	if(boardState == 0)
	{
		remaining = diceValue = playerObject['dice'] = Math.floor(Math.random() * 6) + 1  ;
		boardState = 1;
	}
	else if(boardState == 1)
	{
		if (selectedObject.name.indexOf(whoIsplaying)!= -1)
		{
			if(selectedObject.userData.position == -1)
			{
				//if(diceValue == 1 || diceValue ==6)
				if(diceValue>0)
				{
					moveCoin(selectedObject, 0);
					selectedObject.userData.position = 0;
					if(diceValue == 6)
						boardState = 0;
				}
			}
			else
			{
				//highlightTiles();
				movingCoin = selectedObject;
			}
			boardState = 2;
		}
	}
	else if(boardState == 2)
		{
			if((selectedObject.name).indexOf(tileIdentifier) != -1)
			{
				moveCoinBy = movingCoin.userData.position - selectedObject.userData.position;
				movingCoin.userData.position += moveCoinBy;
				user['remaining'] = diceValue ;
				if(user['remaining'] > 0)
				{
					moveCoin(movingCoin, moveCoinBy);
					boardState = 1;
				}
				else if(diceValue == 6)
					boardState = 0;
			}
			boardState = 0;
		}
}

function moveCoin(movingCoin,nextTile, moveBy){

    if(movingCoin.userData.position==-1)
    	movingCoin.position.copy(scene.getObjectByName(objects[movingCoin.userData.start].name).position)
    else {
    	//startPoint=endPoint;
		currentTile = movingCoin;
		nextTile = scene.getObjectByName(movingCoin.userData.id + moveBy);
	}
		startX = currentTile.position.x;
		startY = currentTile.position.y;
		startRotate = currentTile.rotation.z;

	deltaX = nextTile.position.x - startX;
	deltaY = nextTile.position.y - startY;
	deltaRotate = nextTile.rotation.z - startRotate;

	moving = true;
	startTime = new Date();
}

function onDocumentMouseDown( event ) 
{
	event.preventDefault();
	mouse.x = ( event.clientX / renderer.domElement.width ) * 2 - 1;
	mouse.y = - ( event.clientY / renderer.domElement.height ) * 2 + 1;

	raycaster.setFromCamera( mouse, camera );
    var intersects = raycaster.intersectObjects( objects );
    // Change color if hit block
    if ( intersects.length > 0 ) {
        // intersects[ 0 ].object.material.color.setHex( Math.random() * 0xffffff );
        // if(selectedObject)
        // {
        	// console.log(selectedObject.id, ' clicked');
        // }
        selectedObject = intersects[0].object;
        console.log(selectedObject.id, '>',selectedObject.name);
        // selectedObject.position.z = 20;
        render();
    }
}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

	render();
}

function animate() {

	requestAnimationFrame(animate);
	controls.update();
	if(moving)
	{
		timeGap = new Date() - startTime;
		fraction = timeGap/transitionTime;
		if (fraction > 1)
		{
			fraction = 1;
			moving = false;
		}
		cube.position.x = startX + deltaX * fraction;
		cube.position.y = startY + deltaY * fraction;
		cube.rotation.z = startRotate + deltaRotate * fraction;
	}
	render();
}

function render()
{
	renderer.render( scene, camera );
	stats.update();

}

function rollDice()
{
	//moveCoin(diceValue);
	whoIsplaying ='PLAYER1';
	//clickBoard();
}
