// JavaScript Document
(function($){
	//ȫ�ֱ���
	var gamerunning = false;
	var id = 0;
	var lives = 5; //������
	var score = 0;
	var livesImg = new Array();
	var backgroundImg = new Image();
	var mushroomImg = new Image();
	var beerImg = new Image();
	var flowerImg = new Image();//��Ʒ�ʻ�
	var leafImg = new Image();//��ƷҶ��
	var acornImg = new Image();//��Ʒ����
	var scoreImg = new Image();
	var screenX = 0;
	var screenY = 0;
	var ctx;
	var speed = 2; 
	var horizonSpeed = speed; //��ˮƽ�ٶ�
	var verticalSpeed = -speed; //�ܴ�ֱ�ٶ�
	var beerAngle = 2; // ����ת�ĽǶ�	
	
	//���� ������Ϸ����
	function gameObject(){
		this.x = 0;
		this.y = 0;
		this.image = null;
	}
	//����Ģ�� �̳���Ϸ����gameObject
	function Mushroom(){};
	Mushroom.prototype = new gameObject();
    var mushroom = new Mushroom();
	//������
	function Beer(){};
	Beer.prototype = new gameObject();
	Beer.prototype.angle = 0;
	var beer = new Beer();
	//���影Ʒ����Prizes�Ͷ���Prize���̳���Ϸ����GameObject
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
		
		//��ʼ����Ʒ
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
			id = setInterval(drawImg, 10);
		}else{
			clearInterval(id);
		}	
	}
		
	function loadImages()   
	{   
		backgroundImg.src = "images/forest.jpg";//ɭ�ֱ���ͼ  
		mushroomImg.src = "images/mushroom.png";//Ģ��  
		beerImg.src = "images/bear_eyesclosed.png"; //��
		flowerImg.src = "images/flower.png";//��Ʒ��
		acornImg.src = "images/acorn.png";//��Ʒ����
		leafImg.src = "images/leaf.png";//��ƷҶ��	
		scoreImg.src = "images/score.png";
		for(var i = 0; i <6; i++){
			livesImg[i] = new Image();
			livesImg[i].src = "images/lives"+i+ ".png";
		}
		mushroom.image = mushroomImg;
		beer.image = beerImg;
		
		backgroundImg.onload = function(){ drawImg();}
	}

	//������Ʒ����
	function initPrize(){
		var count = 0;
		for(var x = 0; x < 3; x++){
			for(var y = 0; y < 23; y++){
				prize = new Prize();
				if(x==0){
					prize.image = flowerImg;//�ʻ����ڵ�һ��
					prize.point = 3;
				}
				if(x==1){
					prize.image = acornImg;//ԥ�Ӹ��ڵ�2��
					prize.point = 2;
				}
				if(x==2){
					prize.image = leafImg;//Ҷ�ӷ��ڵ�3��	
					prize.point = 1;
				}
				prize.hit = false;
				prize.row = x;
				prize.col = y;
				prize.x = 20 * prize.col + 10;//x��λ��
				prize.y = 20 * prize.row + 40;//y��λ��
				//ײ����Ʒ���飬�������
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
		
		ctx.translate(beer.x + (beer.image.width/2), beer.y + (beer.image.height/2)); // ������Բ���Ƶ��ܵ�����λ��
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
	
	//������
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
	//�������ұ߽߱�
		if(beer.x > screenX - beer.image.width)
		{
			if(horizonSpeed > 0){
				horizonSpeed = -horizonSpeed;
			}
		}
	//��������߽߱�
		if(beer.x<-10)
		{
			if(horizonSpeed < 0)//���������ƶ�
				horizonSpeed = -horizonSpeed;//�ı�ˮƽ�ٶȷ���
		}
	//����������߽�
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
	//�������ϱ߽߱�
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
		 
			//����������x-���ص�
			if(A1 > A2 && A1 < B2
			   || B1 > A2 && B1 < B2)
			{
				//�ж�y-���ص�
				if(C1 > C2 && C1 < D1
			   || D1 > C2 && D1 < D2)
				{
					//��ײ
					return true;
				}
		 
			}
			return false;
		
	}
	function HasAnimalHitMushroom()
	{
		//������ײ
		if(checkCrash(beer, mushroom, 0))
		{
			//������ײ��λ������Ģ��������λ��
			if((beer.x + beer.image.width/2) < (mushroom.x + mushroom.image.width*0.25))
			{
				horizonSpeed = -speed;//����
			}
			//������ײ��λ������Ģ��������λ��
			else if((beer.x + beer.image.width/2) < (mushroom.x + mushroom.image.width*0.5))
			{
				//�����ٶȼ���
				horizonSpeed = -speed/2;
			}
			//������ײ��λ������Ģ��������λ��
			else if((beer.x + beer.image.width/2) < (mushroom.x + mushroom.image.width*0.75))
			{
				horizonSpeed = speed/2;
			}
			else
			{
				horizonSpeed = speed;
			}
			verticalSpeed = -speed;//�ı䴹ֱ�ٶȡ�Ҳ�����������ƶ�
	 
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
	//ײ����Ʒ
	function HasAnimalHitPrize()
	{
		//ȡ�����н�Ʒ
		for(var x=0; x<prizes.length; x++)
		{
			var prize = prizes[x];
			//����û����ײ��
			if(!prize.hit)
			{
				//�ж���ײ
				if(checkCrash(prize, beer, 0))
				{
					prize.hit = true;
					//�ܷ����³�
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
	














