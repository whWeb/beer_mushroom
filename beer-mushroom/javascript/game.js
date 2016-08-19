// JavaScript Document
(function($){
	//全局变量
	var gamerunning = false;
	var id = 0;
	var lives = 5; //生命数
	var score = 0;
	var livesImg = new Array();
	var backgroundImg = new Image();
	var mushroomImg = new Image();
	var beerImg = new Image();
	var flowerImg = new Image();//奖品鲜花
	var leafImg = new Image();//奖品叶子
	var acornImg = new Image();//奖品橡子
	var scoreImg = new Image();
	var screenX = 0;
	var screenY = 0;
	var ctx;
	var speed = 2; 
	var horizonSpeed = speed; //熊水平速度
	var verticalSpeed = -speed; //熊垂直速度
	var beerAngle = 2; // 熊旋转的角度	
	
	//公用 定义游戏物体
	function gameObject(){
		this.x = 0;
		this.y = 0;
		this.image = null;
	}
	//定义蘑菇 继承游戏对象gameObject
	function Mushroom(){};
	Mushroom.prototype = new gameObject();
    var mushroom = new Mushroom();
	//定义熊
	function Beer(){};
	Beer.prototype = new gameObject();
	Beer.prototype.angle = 0;
	var beer = new Beer();
	//定义奖品数组Prizes和对象Prize，继承游戏对象GameObject
	var prizes = new Array();
	function Prize(){};
	Prize.prototype = new gameObject();
	Prize.prototype.row = 0;
	Prize.prototype.col = 0;
	Prize.prototype.hit = false;
	Prize.prototype.point = 0;	
	
	$(document).ready(function(){
		addHandles();
		loadImages();
		ctx = document.getElementById('canvas').getContext('2d');
		screenX = parseInt($('#canvas').attr('width'));
		screenY = parseInt($('#canvas').attr('height'));
		mushroom.x = parseInt(screenX/2);
		mushroom.y = screenY - 40;
		
		beer.x =  parseInt(screenX/2);
		beer.y =  parseInt(screenY/2);
		
		//初始化奖品
		initPrize();
	});
	
	function addHandles(){
		$('#container').mousemove(function(e){
			var container = document.getElementById('container');
			mushroom.x = e.pageX - (mushroom.image.width/2) - container.offsetLeft;
		})
		$('#startBtn').click(function(){
			gameStart();
		})
	}
	
	function gameStart(){
		gamerunning = !gamerunning;
		if(gamerunning){
			$('#startBtn').hide();
			id = setInterval(drawImg, 16.7);
		}else{
			clearInterval(id);
		}	
	}
		
	function loadImages()   
	{   
		backgroundImg.src = "images/forest.jpg";//森林背景图  
		mushroomImg.src = "images/mushroom.png";//蘑菇  
		beerImg.src = "images/bear_eyesclosed.png"; //熊
		flowerImg.src = "images/flower.png";//奖品花
		acornImg.src = "images/acorn.png";//奖品橡子
		leafImg.src = "images/leaf.png";//奖品叶子	
		scoreImg.src = "images/score.png";
		for(var i = 0; i <6; i++){
			livesImg[i] = new Image();
			livesImg[i].src = "images/lives"+i+ ".png";
		}
		mushroom.image = mushroomImg;
		beer.image = beerImg;
		
		backgroundImg.onload = function(){ drawImg();}
	}

	//创建奖品数组
	function initPrize(){
		var count = 0;
		for(var x = 0; x < 3; x++){
			for(var y = 0; y < 23; y++){
				prize = new Prize();
				if(x==0){
					prize.image = flowerImg;//鲜花放在第一行
					prize.point = 3;
				}
				if(x==1){
					prize.image = acornImg;//豫子刚在第2行
					prize.point = 2;
				}
				if(x==2){
					prize.image = leafImg;//叶子放在第3行	
					prize.point = 1;
				}
				prize.hit = false;
				prize.row = x;
				prize.col = y;
				prize.x = 20 * prize.col + 10;//x轴位置
				prize.y = 20 * prize.row + 40;//y轴位置
				//撞到奖品数组，用来描绘
				prizes[count] = prize;
				count++;		
			}
		}
	}

	function drawImg(){ 	
		ctx.drawImage(backgroundImg, 0, 0);
		ctx.drawImage(mushroom.image, mushroom.x, mushroom.y);
		drawPrizes();
		DrawLives();
		DrawScore();
		beer.x += horizonSpeed;
		beer.y += verticalSpeed;
		beer.angle += beerAngle;
		ctx.save();
		
		ctx.translate(beer.x + (beer.image.width/2), beer.y + (beer.image.height/2)); // 将坐标圆心移到熊的中心位置
		ctx.rotate(beer.angle * Math.PI/180);
		ctx.drawImage(beer.image, -beer.image.width/2, -beer.image.height/2);
		
		ctx.restore();
		
		beerHitedge();
		HasAnimalHitMushroom();
		HasAnimalHitPrize();   
	}
	
	function DrawLives()
	{
		ctx.drawImage(livesImg[lives], 0, 0);
	}
	
	//描绘分数
	function DrawScore()
	{
		ctx.drawImage(scoreImg, screenX-(scoreImg.width),0);
		ctx.font = "12pt Arial";
		ctx.fillText("" + score, 425, 25); 
	}
	
	function drawPrizes(){
		for(var x=0; x<prizes.length; x++)
		{
			currentPrize = prizes[x];
			if(!currentPrize.hit){
				ctx.drawImage(currentPrize.image, prizes[x].x, prizes[x].y);
			}
		}
		if(AllPrizesHit()){
			gameover();
		}
	}
	
	function beerHitedge(){
	//熊碰到右边边界
		if(beer.x > screenX - beer.image.width)
		{
			if(horizonSpeed > 0){
				horizonSpeed = -horizonSpeed;
			}
		}
	//熊碰到左边边界
		if(beer.x<-10)
		{
			if(horizonSpeed < 0)//假如向左移动
				horizonSpeed = -horizonSpeed;//改变水平速度方向
		}
	//熊碰到下面边界
		if(beer.y>screenY - beer.image.height)
		{
			lives -= 1;
			if(lives >= 0){
				horizonSpeed = speed;
				verticalSpeed = -speed;
				beer.x = parseInt(screenX/2);
				beer.y = parseInt(screenY/2);
				DrawLives();
				gameStart();
				$('#startBtn').show();
			}
		}
	//熊碰到上边边界
		if(beer.y<0)
		{
			verticalSpeed = -verticalSpeed;
		}
		if(lives <= 0){
			gameover();
		}
	}

	function checkCrash(object1, object2, overlap){
			A1 = object1.x + overlap;
			B1 = object1.x + object1.image.width - overlap;
			C1 = object1.y + overlap;
			D1 = object1.y + object1.image.height - overlap;
		 
			A2 = object2.x + overlap;
			B2 = object2.x + object2.image.width - overlap;
			C2 = object2.y + overlap;
			D2 = object2.y + object2.image.width - overlap;
		 
			//假如他们在x-轴重叠
			if(A1 > A2 && A1 < B2
			   || B1 > A2 && B1 < B2)
			{
				//判断y-轴重叠
				if(C1 > C2 && C1 < D1
			   || D1 > C2 && D1 < D2)
				{
					//碰撞
					return true;
				}
		 
			}
			return false;
		
	}
	function HasAnimalHitMushroom()
	{
		//假如碰撞
		if(checkCrash(beer, mushroom, 0))
		{
			//假如碰撞的位置属于蘑菇的左下位置
			if((beer.x + beer.image.width/2) < (mushroom.x + mushroom.image.width*0.25))
			{
				horizonSpeed = -speed;//反弹
			}
			//假如碰撞的位置属于蘑菇的左上位置
			else if((beer.x + beer.image.width/2) < (mushroom.x + mushroom.image.width*0.5))
			{
				//反弹速度减半
				horizonSpeed = -speed/2;
			}
			//假如碰撞的位置属于蘑菇的右上位置
			else if((beer.x + beer.image.width/2) < (mushroom.x + mushroom.image.width*0.75))
			{
				horizonSpeed = speed/2;
			}
			else
			{
				horizonSpeed = speed;
			}
			verticalSpeed = -speed;//改变垂直速度。也即动物向上移动
	 
		}
	}

	function AllPrizesHit()
	{
		for(var c=0; c<prizes.length; c++)
		{
			checkPrize = prizes[c];
			if(checkPrize.hit == false)
				return false;
				
		}
		return true;
	}
	//撞到奖品
	function HasAnimalHitPrize()
	{
		//取出所有奖品
		for(var x=0; x<prizes.length; x++)
		{
			var prize = prizes[x];
			//假如没有碰撞过
			if(!prize.hit)
			{
				//判断碰撞
				if(checkCrash(prize, beer, 0))
				{
					prize.hit = true;
					//熊反弹下沉
					verticalSpeed = speed;
					score += prize.point;
				}
			}
		}
	}
	
	function gameover(){
		gamerunning = false;
		clearInterval(id);
		$('#startBtn').hide();
		$('#container').append("<div id = 'restart'><span>Restart</span></div>");
		$('span').click(function(){
			restart();
		})
		$('#restart').css("height",320);
		$('#restart').css("width",480);
		$('#restart').css("background-color","rgba(0, 0, 0, 0.5)");
		$('span').css("top",135);
		$('span').css("left",150);

	}
	
	function restart(){
		score = 0;
		lives = 5;
		beer.x =  parseInt(screenX/2);
		beer.y =  parseInt(screenY/2);
		beer.angle = 0;
		$('#restart').remove();
		DrawScore();
		initPrize();
		gameStart();
	}
}(jQuery));
	














