<?php

session_start();


?>

<?php
session_start();

// logout.php?logoutにアクセスしたユーザーをログアウトする
if(isset($_GET['reset'])) {
	
	unset($_SESSION['students']);
	header("Location: ");
} 


// 生徒の名前を取得
$studentName = isset($_GET['name']) ? $_GET['name'] : '';

// セッション情報を取得
$userSession = isset($_SESSION['user']) ? json_encode($_SESSION['user']) : '';

// Next.jsのページへのリンクを生成
$nextJsUrl = "https://my-homework-app-eight.vercel.app/dashboard?name=$studentName&user=$userSession";
?>

         






<?php

include_once 'dbconnect.php';
if(!isset($_SESSION['user'])) {
	header("Location: west.classmate_index.php");
}


?>


<?php

session_start();

if(isset($_SESSION['students'])) {
  
  $students = $_SESSION['students'];
  
}

$_SESSION['students'] = $students;
// var_dump($students);
// var_dump($_SESSION['students']);
?>




<?
require_once'class.php';

?>


<?php
// $_GETでクエリ情報の値を受け取って、変数$menuNameに代入してください
$studentName = $_GET['name'];
$studentBomb = $_GET['bomb'];

?>


<?php



// データベースに接続
$mysqli = new mysqli( 'mysql749.db.sakura.ne.jp', 'mikawayatsuhashi', 'yatsuhashi2019', 'mikawayatsuhashi_db_yatsuhasi');

// 接続エラーの確認
if( $mysqli->connect_errno ) {
	$error_message[] = 'データの読み込みに失敗しました。 エラー番号 '.$mysqli->connect_errno.' : '.$mysqli->connect_error;
} else {

    $sql = "SELECT * FROM checkin_checkout order by id desc limit 800";
    
    $res = $mysqli->query($sql);
    

    if( $res ) {
		$checkin_array = $res->fetch_all(MYSQLI_ASSOC);
    }

    $mysqli->close();
}



?>

<?php
// タイムゾーン設定
date_default_timezone_set('Asia/Tokyo');


// 変数の初期化
$now_date = null;
$data = null;
$file_handle = null;
$split_data = null;
$message = array();
$message_array = array();
$success_message = null;
$error_message = array();
$clean = array();



		// // データベースに接続
		// $mysqli = new mysqli( 'localhost', 'root', 'shin7301', 'board');
		
		// 接続エラーの確認
		if( $mysqli->connect_errno ) {
			$error_message[] = '書き込みに失敗しました。 エラー番号 '.$mysqli->connect_errno.' : '.$mysqli->connect_error;
		} else {

			// 文字コード設定
			// $mysqli->set_charset('utf8');
			
			// 書き込み日時を取得
			$now_date = date("Y-m-d H:i:s");
			
			// データを登録するSQL作成
			
			
			// データを登録
			
		}
    
        


/*
if( $file_handle = fopen( FILENAME,'r') ) {
    while( $data = fgets($file_handle) ){
		$split_data = preg_split( '/\'/', $data);
		$message = array(
			'view_name' => $split_data[1],
			'message' => $split_data[3],
			'post_date' => $split_data[5]
		);
		array_unshift( $message_array, $message);
	}
    
    // ファイルを閉じる
    fclose( $file_handle);
}
*/

// データベースに接続
// $mysqli = new mysqli( 'mysql749.db.sakura.ne.jp', 'mikawayatsuhashi', 'yatsuhashi2019', 'mikawayatsuhashi_db_yatsuhasi');

// // 接続エラーの確認
// if( $mysqli->connect_errno ) {
// 	$error_message[] = 'データの読み込みに失敗しました。 エラー番号 '.$mysqli->connect_errno.' : '.$mysqli->connect_error;
// } else {

//     $sql = "SELECT * FROM work_c  ORDER BY post_date ASC  ";
    
//     $res = $mysqli->query($sql);
    

//     if( $res ) {
// 		$work_array = $res->fetch_all(MYSQLI_ASSOC);
//     }

//     $mysqli->close();
// }


?>


<style>

.list{
list-style-type:none;
font-size:17px;

}    


/*ヘッダーまわりはサイトに合わせて調整してください*/
header {
  padding:10px;
  background: transparent;
}

#nav-drawer {
  position: relative;
}

/*チェックボックス等は非表示に*/
.nav-unshown {
  display:none;
}

/*アイコンのスペース*/
#nav-open {
  display: inline-block;
  width: 30px;
  height: 22px;
  vertical-align: middle;
}

/*ハンバーガーアイコンをCSSだけで表現*/
#nav-open span, #nav-open span:before, #nav-open span:after {
  position: absolute;
  height: 3px;/*線の太さ*/
  width: 25px;/*長さ*/
  border-radius: 3px;
  background: #555;
  display: block;
  content: '';
  cursor: pointer;
}
#nav-open span:before {
  bottom: -8px;
}
#nav-open span:after {
  bottom: -16px;
}

/*閉じる用の薄黒カバー*/
#nav-close {
  display: none;/*はじめは隠しておく*/
  position: fixed;
  z-index: 99;
  top: 0;/*全体に広がるように*/
  left: 0;
  width: 100%;
  height: 100%;
  background: black;
  opacity: 0;
  transition: .3s ease-in-out;
}

/*中身*/
#nav-content {
  overflow: auto;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9999;/*最前面に*/
  width: 90%;/*右側に隙間を作る（閉じるカバーを表示）*/
  max-width: 330px;/*最大幅（調整してください）*/
  height: 100%;
  background: #fff;/*背景色*/
  transition: .3s ease-in-out;/*滑らかに表示*/
  -webkit-transform: translateX(-105%);
  transform: translateX(-105%);/*左に隠しておく*/
}

/*チェックが入ったらもろもろ表示*/
#nav-input:checked ~ #nav-close {
  display: block;/*カバーを表示*/
  opacity: .5;
}

#nav-input:checked ~ #nav-content {
  -webkit-transform: translateX(0%);
  transform: translateX(0%);/*中身を表示（右へスライド）*/
  box-shadow: 6px 0 25px rgba(0,0,0,.15);
}




    </style>
   




		


<style>
.top {
    color:red;
}
.second {
    color:blue;
}
</style>


<div class="ribbon2 pt-3">
  <h5><?php echo $studentName ?></h5>
</div>



<h1><label for="message"><span style=color:gray><span style=font-weight:normal>万一、生徒に見られてもいいように、不快な言葉使いは避け、丁寧なコメントを心がけましょう♪</span></span></label></h1>











<html lang="ja">
    <head>
        <meta charset="UTF-8">
        <title>Go Fun</title>
				<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.0/css/bootstrap.min.css" integrity="sha384-9aIt2nRpC12Uk9gS9baDl411NQApFmC26EwAOH8WgZl5MYYxFfc+NcPb1dKGj7Sk" crossorigin="anonymous">
        
		</head>
		<body>





<!-- Button trigger modal -->




<!-- 新着情報機能を追加 -->


<?php



// データベースに接続
$mysqli = new mysqli( 'mysql749.db.sakura.ne.jp', 'mikawayatsuhashi', 'yatsuhashi2019', 'mikawayatsuhashi_db_yatsuhasi');

// 接続エラーの確認
if( $mysqli->connect_errno ) {
	$error_message[] = 'データの読み込みに失敗しました。 エラー番号 '.$mysqli->connect_errno.' : '.$mysqli->connect_error;
} else {

    $sql = "SELECT * FROM west_student";
    
    $res = $mysqli->query($sql);
    

    if( $res ) {
		$message_array = $res->fetch_all(MYSQLI_ASSOC);
    }

    $mysqli->close();
}


?>



<!-- gender -->


<style>
.gender{

 
}

.board{
    display:flex;
    margin-bottom:30px;
    justify-content:space-between;
    align-items:flex-start;


}

.infos{
width:700px;
font-size:15px;
color:#4ac0b9;


}
</style>



<section class="board">
    <div class="gender">  
<?php if( !empty($message_array) ){ ?>
<?php foreach( $message_array as $value ){ ?>
    <?php  if($studentName == $value['student']){ ?>
        <?php $gender = $value['gender'];?>
 
</div>
<?php  if('male' == $gender): ?>
        
        <img src="male.png">
        <?php else: ?>
</div>
        
<img src="female.png">

  
   
    

    <?php endif ?>  
    <div class=" infos shadow p-2 m-3 bg-white rounded">
    <ul class="ml-3">
      <li class="mb-2"><?php echo $value['comment1'] ?></li>
      <li class="mb-2"><?php echo $value['comment2'] ?></li>
      <li class="mb-2"><?php echo $value['comment3'] ?></li>


    </ul>
    
    
    
       

    </div>
      



   


<?php } ?>
<?php } ?>
<?php } ?>

</div>
</section>

</div>


<!-- 追加機能終わり -->




<script src="https://code.jquery.com/jquery-3.5.1.slim.min.js" integrity="sha384-DfXdz2htPH0lsSSs5nCTpuj/zy4C+OGpamoFVy38MVBnE+IbbVYUew+OrCXaRkfj" crossorigin="anonymous"></script>
<script src="https://cdn.jsdelivr.net/npm/popper.js@1.16.0/dist/umd/popper.min.js" integrity="sha384-Q6E9RHvbIyZFJoft+2mJbHaEWldlvI9IOYy5n3zV9zzTtmI3UksdQRVvoxMfooAo" crossorigin="anonymous"></script>
<script src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.0/js/bootstrap.min.js" integrity="sha384-OgVRvuATP1z7JjHLkuOU7Xw704+h835Lr+6QL9UvYjZE3Ipu6Tp75j7Bh/kR0JKI" crossorigin="anonymous"></script>





    
</body>
</html>








<style>
article {
	margin-top: 23px;
	
}



    
    
*------------------------------
 Reset Style
 
------------------------------*/
html, body, div, span, object, iframe,
h1, h2, h3, h4, h5, h6, p, blockquote, pre,
abbr, address, cite, code,
del, dfn, em, img, ins, kbd, q, samp,
small, strong, sub, sup, var,
b, i,
dl, dt, dd, ol, ul, li,
fieldset, form, label, legend,
table, caption, tbody, tfoot, thead, tr, th, td,
article, aside, canvas, details, figcaption, figure,
footer, header, hgroup, menu, nav, section, summary,
time, mark, audio, video {
    margin:0;
    padding:0;
    border:0;
    outline:0;
    font-size:100%;
    vertical-align:baseline;
    background:transparent;
}


body {
    line-height:1;
}

article,aside,details,figcaption,figure,
footer,header,hgroup,menu,nav,section {
    display:block;
}



nav ul {
    list-style:none;
}

blockquote, q {
    quotes:none;
}

blockquote:before, blockquote:after,
q:before, q:after {
    content:'';
    content:none;
}

a {
    margin:0;
    padding:0;
    font-size:100%;
    vertical-align:baseline;
    background:transparent;
}

/* change colours to suit your needs */
ins {
    background-color:#ff9;
    color:#000;
    text-decoration:none;
}

/* change colours to suit your needs */
mark {
    background-color:#ff9;
    color:#000;
    font-style:italic;
    font-weight:bold;
}

del {
    text-decoration: line-through;
}

abbr[title], dfn[title] {
    border-bottom:1px dotted;
    cursor:help;
}

table {
    border-collapse:collapse;
    border-spacing:0;
}

hr {
    display:block;
    height:1px;
    border:0;
    border-top:1px solid #cccccc;
    margin:1em 0;
    padding:0;
}

input, select {
    vertical-align:middle;
}

/*------------------------------
Common Style
------------------------------*/
body {
	padding: 50px;
	font-size: 100%;
	font-family:'ヒラギノ角ゴ Pro W3','Hiragino Kaku Gothic Pro','メイリオ',Meiryo,'ＭＳ Ｐゴシック',sans-serif;
	color: #222;
	background: #f7f7f7;
}

a {
    color: #007edf;
    text-decoration: none;
}

a:hover {
    text-decoration: underline;
}

.wrapper {
    display: flex;
    margin: 0 auto 50px;
    padding: 0 20px;
    max-width: 1200px;
    align-items: flex-start;
}

h1 {
	margin-bottom: 10px;
    font-size: 100%;
    color: #222;
    text-align: center;
    padding-bottom:5px;
    
}    

label {
    display: block;
    margin-bottom: 7px;
    font-size: 86%;
}

input[type="text"],
textarea {
	margin-bottom: 20px;
	padding: 10px;
	font-size: 86%;
    border: 1px solid #ddd;
    border-radius: 3px;
    background: #fff;
}

input[type="text"] {
	width: 200px;
}
textarea {
	width: 50%;
	max-width: 50%;
	height: 70px;
}
input[type="submit"] {
	appearance: none;
    -webkit-appearance: none;
    padding: 10px 20px;
    color: #fff;
    font-size: 86%;
    line-height: 1.0em;
    cursor: pointer;
    border: none;
    border-radius: 5px;
    background-color: #37a1e5;
}
input[type=submit]:hover,
button:hover {
    background-color: #2392d8;
}

hr {
	margin: 20px 0;
	padding: 0;
}

.success_message {
  margin-top: 20px;
    margin-bottom: 20px;
    padding: 10px;
    color: #48b400;
    border-radius: 10px;
    border: 1px solid #4dc100;
}

.error_message {
    margin-bottom: 20px;
    padding: 10px;
    color: #ef072d;
    list-style-type: none;
    border-radius: 10px;
    border: 1px solid #ff5f79;
}

.success_message,
.error_message li {
    font-size: 86%;
    line-height: 1.6em;
}



    
.ribbon2 {
  display: block;
  position: relative;
  height: 60px;
  line-height: 60px;
  text-align: center;
  padding: 7px 0;
  font-size: 10px;/*フォントサイズ*/
  background: #4ac0b9;/*背景色*/
  color: #FFF;/*文字色*/
  box-sizing: border-box;
  margin:0 auto 5px auto;
  width:380px;

}

.ribbon2 h3 {
  margin: 0;
  padding: 0 15px;
  border-top: dashed 1px #FFF;/*上の破線*/
  border-bottom: dashed 1px #FFF;/*下の破線*/
  line-height: 46px;
}

.ribbon2:before, .ribbon2:after {
  position: absolute;
  content: '';
  width: 0px;
  height: 0px;
  z-index: 1;
}

.ribbon2:before {
  /*左端の山形*/
  top: 0;
  left: 0;
  border-width: 30px 0px 30px 15px;
  border-color: transparent transparent transparent #fff;
  border-style: solid;
}

.ribbon2:after {
  /*右端の山形*/
  top: 0;
  right: 0;
  border-width: 30px 15px 30px 0px;
  border-color: transparent #fff transparent transparent;
  border-style: solid;
}




</style>

<!-- <div>
<a href="index_B.php">← 全生徒一覧ページまで戻る</a><br>
</div> -->
<br>



<?php
// データベースに接続
$mysqli = new mysqli( 'mysql749.db.sakura.ne.jp', 'mikawayatsuhashi', 'yatsuhashi2019', 'mikawayatsuhashi_db_yatsuhasi');

// 接続エラーの確認
if( $mysqli->connect_errno ) {
	$error_message[] = 'データの読み込みに失敗しました。 エラー番号 '.$mysqli->connect_errno.' : '.$mysqli->connect_error;
} else {

    $sql = "SELECT * FROM west_student";
    
    $res = $mysqli->query($sql);
    

    if( $res ) {
		$message_array = $res->fetch_all(MYSQLI_ASSOC);
    }

    $mysqli->close();
}


?>
<?php if( !empty($message_array) ){ ?>
<?php foreach( $message_array as $value ){ ?>

    <?php  if($studentName == $value['student']){ ?>

<?php 

$studentBomb = $value['bomb'];



}}}?>






<!-- ここからボタンの条件分岐 -->


<?php if( !empty($message_array) ){ ?>
   <?php foreach( $message_array as $value ){ ?>
    <?php  if($studentName == $value['student']){ ?>
        <?php $grade = $value['grade'];?>
 

<?php  if(8 <= $grade): ?>

  <div class="MyPage">
  <a href="west.index_MyPage.php"><button type="button" class="btn btn-outline-primary">MyPageへ</button></a>
  <a  href="west_position_sa.php?name=<?php echo $studentName?>&bomb=<?php echo $studentBomb?>&teacher=<?php echo $username?>"><button type="button" class="btn btn-primary ml-3">算数</button></a> 
  <a  href="west_position_ko.php?name=<?php echo $studentName?>&bomb=<?php echo $studentBomb?>&teacher=<?php echo $username?>"><button type="button" class="btn btn-success ml-3">国語</button></a>       
  <a  href="west_position_ei.php?name=<?php echo $studentName?>&bomb=<?php echo $studentBomb?>&teacher=<?php echo $username?>"><button type="button" class="btn btn-danger ml-3">英語</button></a> 
  <a  href="west_position_ri.php?name=<?php echo $studentName?>&bomb=<?php echo $studentBomb?>&teacher=<?php echo $username?>"><button type="button" class="btn ml-3" style="background-color: purple; color: white;">理科</button></a>       
  <a  href="west_position_sh.php?name=<?php echo $studentName?>&bomb=<?php echo $studentBomb?>&teacher=<?php echo $username?>"><button type="button" class="btn ml-3" style="background-color: orange; color: white;">社会</button></a>             
  <a href="pos.html" class="btn btn-outline-warning ml-3" target="_blank">手順書を見る</a>   
</div>     
          
<?php else: ?>

    <script>
    function goToNextJs() {
        const nextJsUrl = 'https://my-homework-app-eight.vercel.app/dashboard?name=<?php echo $studentName; ?>&user=<?php echo $userSession; ?>';
        window.location.href = nextJsUrl;
    }
</script>

  <div class="MyPage">
<a href="west.index_MyPage.php"><button type="button" class="btn btn-outline-primary">MyPageへ</button></a>
<a>

<button onclick="goToNextJs()" type="button" class="btn btn-outline-danger ml-3">テスト課題管理へ</button>
</a>
<a  href="west_result.php?name=<?php echo $studentName?>"><button type="button" class="btn btn-outline-success ml-3">成績管理へ</button></a>    
<a  href="west_result_na.php?name=<?php echo $studentName?>"><button type="button" class="btn btn-outline-info ml-3">評定管理へ</button></a>      
<a  href="west_position_e.php?name=<?php echo $studentName?>&bomb=<?php echo $studentBomb?>&teacher=<?php echo $username?>"><button type="button" class="btn btn-danger ml-3">英語</button></a>       
<a  href="west_position_m.php?name=<?php echo $studentName?>&bomb=<?php echo $studentBomb?>&teacher=<?php echo $username?>"><button type="button" class="btn btn-warning ml-3">数学</button></a>       
<a  href="test_index.php?name=<?php echo $studentName?>&bomb=<?php echo $studentBomb?>&teacher=<?php echo $username?>"><button type="button" class="btn btn-success ml-3">理科</button></a>       
<a  href="west_position_s.php?name=<?php echo $studentName?>&bomb=<?php echo $studentBomb?>&teacher=<?php echo $username?>"><button type="button" class="btn btn-primary ml-3">社会</button></a> 
<a  href="west_position_k.php?name=<?php echo $studentName?>&bomb=<?php echo $studentBomb?>&teacher=<?php echo $username?>"><button type="button" class="btn btn-info ml-3">国語</button></a> 
<a href="pos.html" class="btn btn-outline-warning ml-3" target="_blank">手順書を見る</a>      
</div>     




  
   
<?php endif ?>  



<?php } ?>
<?php } ?>
<?php } ?>



<?php





// データベースに接続
$mysqli = new mysqli( 'mysql749.db.sakura.ne.jp', 'mikawayatsuhashi', 'yatsuhashi2019', 'mikawayatsuhashi_db_yatsuhasi');

// 接続エラーの確認
if( $mysqli->connect_errno ) {
	$error_message[] = 'データの読み込みに失敗しました。 エラー番号 '.$mysqli->connect_errno.' : '.$mysqli->connect_error;
} else {

    $sql = "SELECT student FROM west_message";
    
    $res = $mysqli->query($sql);
    

    if( $res ) {
		$message_array = $res->fetch_all(MYSQLI_ASSOC);
    }

    $mysqli->close();
}


?>


<body>


<?php

// // メッセージを保存するファイルのパス設定
// define( 'FILENAME', './message.txt');

// タイムゾーン設定
date_default_timezone_set('Asia/Tokyo');

// 変数の初期化
$now_date = null;
$data = null;
$file_handle = null;
$split_data = null;
$message = array();
$message_array = array();
$success_message = null;
$error_message = array();
$clean = array();


if( !empty($_POST['btn_submit']) ) {
	
	
	
	// メッセージの入力チェック
	if( empty($_POST['message']) ) {
		$error_message[] = 'コメントを入力してください。';
	} else {
		$clean['message'] = htmlspecialchars( $_POST['message'], ENT_QUOTES);
		
	}

	if( empty($error_message) ) {

		/*
		if( $file_handle = fopen( FILENAME, "a") ) {
	
		    // 書き込み日時を取得
			$now_date = date("Y-m-d H:i:s");
		
			// 書き込むデータを作成
			$data = "'".$clean['view_name']."','".$clean['message']."','".$now_date."'\n";
		
			// 書き込み
			fwrite( $file_handle, $data);
		
			// ファイルを閉じる
			fclose( $file_handle);
	
			$success_message = 'メッセージを書き込みました。';
		}
		*/
		
		// データベースに接続
        $mysqli = new mysqli( 'mysql749.db.sakura.ne.jp', 'mikawayatsuhashi', 'yatsuhashi2019', 'mikawayatsuhashi_db_yatsuhasi');
        // データベースの接続情報



		
		// 接続エラーの確認
		if( $mysqli->connect_errno ) {
			$error_message[] = '書き込みに失敗しました。 エラー番号 '.$mysqli->connect_errno.' : '.$mysqli->connect_error;
		} else {

			// 文字コード設定
			$mysqli->set_charset('utf8');
			
			// 書き込み日時を取得
			$now_date = date("Y-m-d H:i:s");
			
			// データを登録するSQL作成
			$sql = "INSERT INTO west_message (message, post_date,student,username) VALUES ( '$clean[message]', '$now_date','$studentName','$username')";
			
			// データを登録
			$res = $mysqli->query($sql);
		
			if( $res ) {
				$success_message = 'コメントを書き込みました。';
			} else {
				$error_message[] = '書き込みに失敗しました。';
			}
		
			// データベースの接続を閉じる
			$mysqli->close();
		}
	}
}



?>
<?php if( !empty($success_message) ): ?>
    <p class="success_message"><?php echo $success_message; ?></p> 
<?php endif; ?>
<?php if( !empty($error_message) ): ?>
    <ul class="error_message">
		<?php foreach( $error_message as $value ): ?>
            <li>・<?php echo $value; ?></li>
		<?php endforeach; ?>
    </ul>
<?php endif; ?>


    





<hr>
<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js"></script>
<!-- ↓クリップボード操作のために使用するjsを読み込む　( https://clipboardjs.com/ ) -->
<script src="https://cdn.jsdelivr.net/clipboard.js/1.5.13/clipboard.min.js"></script>
 
<script>
var clipboard = new Clipboard('.copy_btn');    //clipboard.min.jsが動作する要素をクラス名で指定
 
//クリックしたときの挙動
$(function(){
    $('.copy_btn').click(function(){
        $(this).addClass('copied');    //ボタンの色などを変更するためにクラスを追加
        $(this).text('コピーしました');    //テキストの書き換え
    });
});
</script>

</body>


<?php


// タイムゾーン設定
date_default_timezone_set('Asia/Tokyo');


// 変数の初期化
$now_date = null;
$data = null;
$file_handle = null;
$split_data = null;
$message = array();
$message_array = array();
$success_message = null;
$error_message = array();
$clean = array();



		// // データベースに接続
		// $mysqli = new mysqli( 'localhost', 'root', 'shin7301', 'board');
		
		// 接続エラーの確認
		if( $mysqli->connect_errno ) {
			$error_message[] = '書き込みに失敗しました。 エラー番号 '.$mysqli->connect_errno.' : '.$mysqli->connect_error;
		} else {

			// 文字コード設定
			// $mysqli->set_charset('utf8');
			
			// 書き込み日時を取得
			$now_date = date("Y-m-d H:i:s");
			
			// データを登録するSQL作成
			
			
			// データを登録
			
		}
    
        


/*
if( $file_handle = fopen( FILENAME,'r') ) {
    while( $data = fgets($file_handle) ){
		$split_data = preg_split( '/\'/', $data);
		$message = array(
			'view_name' => $split_data[1],
			'message' => $split_data[3],
			'post_date' => $split_data[5]
		);
		array_unshift( $message_array, $message);
	}
    
    // ファイルを閉じる
    fclose( $file_handle);
}
*/

// データベースに接続
$mysqli = new mysqli( 'mysql749.db.sakura.ne.jp', 'mikawayatsuhashi', 'yatsuhashi2019', 'mikawayatsuhashi_db_yatsuhasi');

// 接続エラーの確認
if( $mysqli->connect_errno ) {
	$error_message[] = 'データの読み込みに失敗しました。 エラー番号 '.$mysqli->connect_errno.' : '.$mysqli->connect_error;
} else {

    $sql = "SELECT id,message,post_date,username,student,fixed FROM west_message  ORDER BY post_date DESC  ";
    
    $res = $mysqli->query($sql);
    

    if( $res ) {
		$message_array = $res->fetch_all(MYSQLI_ASSOC);
    }

    $mysqli->close();
}


?>
<?php if( !empty($success_message) ): ?>
<p class="success_message"><?php echo $success_message; ?></p>
<?php endif; ?>
<?php if( !empty($error_message) ): ?>
    <ul class="error_message">
		<?php foreach( $error_message as $value ): ?>
            <li>・<?php echo $value; ?></li>
		<?php endforeach; ?>
    </ul>
<?php endif; ?>



<!DOCTYPE html>
<html lang="ja">
<head>
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta charset="utf-8">
<title>Go Fun</title>

<link href="https://use.fontawesome.com/releases/v5.6.1/css/all.css" rel="stylesheet">



</head>
<body>

<form method="post">
	
	<div>
    <label for="message"><i class="fas fa-comment"></i> コメントはこちらに　　　


    <!-- 
    <textarea id="message" name="message" placeholder="今日話した話題、授業態度、理解できなかった単元、申し送り事項、etc"></textarea>
 -->
 <button type="button" class="btn btn-sm btn-secondary start" style="font-size: 10px;">
  <i class="fa fa-microphone" aria-hidden="true"></i> 音声認識開始
</button>





</label>    
         <div class="output"></div> 
        <textarea id="message" name="message" placeholder="１回で理解できなかったり、つまずいていた所はどこですか？(それと、たまに、褒めポイントも見つけてコメントしてもらえるとありがたいです。)"></textarea>
       <br>
	</div>
	<input type="submit" name="btn_submit" value="書き込む">
</form>


<script>
      const recognition = new webkitSpeechRecognition();
      recognition.lang = "ja";
      recognition.continuous = true;
      recognition.onresult = ({ results }) => {
       
        const messageInput = document.querySelector("#message");
        const transcript = results[0][0].transcript;
       
        messageInput.value = transcript; // 音声認識の結果をinput要素に設定する
      };
      
      const startButton = document.querySelector(".start");
      startButton.addEventListener("click", () => {
        recognition.start();
      });
      const stopButton = document.querySelector(".stop");
      stopButton.addEventListener("click", () => {
        recognition.stop();
      });
      
    </script>



<br>

<!-- <ty style="font-weight:bold"><a href="">更新する</a></ty><br> -->




<?php $showHr = false; ?>

<?php if(!empty($message_array)): ?>
    <?php foreach($message_array as $value): ?>
        <?php if($studentName == $value['student'] && $value['fixed'] == 1): ?>
            <?php $showHr = true; ?>
            <?php if ($showHr): ?>
    <hr style="border-color: #4AC0B9;">
<?php endif; ?>
            <p style="color:#4AC0B9">　<i class="fas fa-thumbtack"></i>　固定されたコメント</p>
            <i class="fas fa-user-edit"></i> <a class="namecolor"><?php echo $value['username']; ?></a>
            <time><?php echo date('Y年m月d日 H:i', strtotime($value['post_date'])); ?></time>
            <a href="west.edit.php?message_id=<?php echo $value['id']; ?>">編集</a> 
            <br>
            <br>
            <p class="fukidashi"><?php echo nl2br($value['message']); ?></p>
        <?php endif; ?>
    <?php endforeach; ?>
<?php endif; ?>

<?php if ($showHr): ?>
    <hr style="border-color: #4AC0B9;">
<?php endif; ?>





<section>


<br>

<article>
<div class="info">
<?php if( !empty($message_array) ){ ?>
<?php foreach( $message_array as $value ){ ?>

    
    <?php if($studentName == $value['student']){ ?>
        <i class="fas fa-user-edit"></i> <a class="namecolor"><?php echo $value['username']; ?></a>
   <time>　<?php echo date('Y年m月d日 H:i', strtotime($value['post_date'])); ?></time>
   　<a href="west.edit.php?message_id=<?php echo $value['id']; ?>">編集</a> 
   <br>
   <br>
    <p class="fukidashi"><?php echo nl2br($value['message']); ?></p>
    <br><br>
    </div>
</article>

<style>

.fukidashi{
    background-color:white;
    border-radius:7px;
    padding:5px;
    font-size:15px;
}

.namecolor{
    border-radius:7px;
    padding:5px;
    font-size:15px;
    background-color:rgba(74, 191, 184, 0.2);
    

    
}



</style>



<?php } ?>
<?php } ?>
<?php } ?>
</section>
</body>
</html>




  
      
    </div>
    
      
  </div>

    <!-- コメントを挿入しよう -->

    <div class="main">
    <div class="contact-form">
    
      

    </div>

 



    

<br>

   
  </div>







<?php



// signupがPOSTされたときに下記を実行
if(isset($_POST['btn_call_for'])) {

	
// 変数の設定


$to = "chiryu.west@gmail.com";
$subject = "$studentName".'の席から呼ばれました' ;
$text = '';




// メール送信
mb_send_mail( $to, $subject, $text);



} ?>








</body>
</html>

<?php
session_start();

// クエリパラメータから値を取得
$studentName = isset($_GET['name']) ? urldecode($_GET['name']) : '';
$userSession = isset($_GET['session']) ? urldecode($_GET['session']) : '';

// セッション情報をデコードして使用する
$userData = json_decode($userSession, true);

if (!$userData) {
    http_response_code(401);
    echo "ワーク管理アプリからのアクセスではありません。";
    exit;
}

// セッションに情報を保存
$_SESSION['user'] = $userData;

// 必要な処理をここに追加
echo "Student Name: " . htmlspecialchars($studentName) . "<br>";
echo "User Data: <pre>" . print_r($userData, true) . "</pre>";
?>
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>Next.jsからPHPへ戻る</title>
</head>
<body>
    <h1>Next.jsから戻ってきました</h1>
    <p>Student Name: <?php echo htmlspecialchars($studentName); ?></p>
    <pre>User Data: <?php print_r($userData); ?></pre>
</body>
</html>
