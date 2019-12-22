//1つあたりの得点の設定
const GAP_POINT = 10;                        //ギャップの得点(10)
const BUMP_POINT = 5;                        //バンプの得点(5)
const CROSSING_POINT = 15;                   //交差点の得点(15)
const DEADEND_POINT = 15;                    //行き止まりの得点(15)
const OBSTACLE_POINT = 10;                   //障害物の得点(10)
const SLOPE_POINT = 5;                       //傾斜路の得点(5)
const MAX_TILE_POINT = 5;                    //タイル1つの最大得点(5)
const DEDUCTION_TILE_POINT = 2;              //1回の競技進行停止によるタイル1つの得点の減点(2)
const LIVING_VICTIM_LEVEL1_POINT = 30;       //レベル１での生きている被災者の得点(30)
const DEAD_VICTIM_LEBEL1_HIGH_POINT = 20;    //レベル１での死んだ被災者の高い得点(20)
const DEAD_VICTIM_LEVEL1_LOW_POINT = 5;      //レベル１での死んだ被災者の低い得点(5)
const LIVING_VICTIM_LEVEL2_POINT = 40;       //レベル２での生きている被災者の得点(40)
const DEAD_VICTIM_LEBEL2_HIGH_POINT = 30;    //レベル２での死んだ被災者の高い得点(30)
const DEAD_VICTIM_LEVEL2_LOW_POINT = 5;      //レベル２での死んだ被災者の低い得点(5)
const ESCAPE_POINT = 20;                     //避難ゾーンからの脱出得点(20)


//変数の宣言と定義
var number_line = 1;       //チェックポイントの表の行数
var number_blackBall = 0;  //死んだ被災者の人数
var number_silverBall = 0; //生きている被災者の人数
var count_stop_last = 0;   //最後のチェックポイント以降の競技進行の停止の回数
var number_collectedBall = 0;  //救助された被災者の人数
var number_collectedSilverBall = 0;   //救助された生きている被災者の人数
var number_collectedBlackBall = 0;    //救助された死んだ被災者の人数

//被災者救助(避難ゾーン)の得点を計算
function calculateRescue(){
   var table = document.getElementById('BallContainer');    //被災者の救助順が入力されている表のエレメントオブジェクトを取得
   var tr = table.childNodes[0].childNodes[0];              //表の最初の行のエレメントオブジェトをtrに代入
   var td;
   var part_rescue = 0;                                     //被災者救助の合計得点
   var balls = [];                                          //救助した被災者を救助した順で格納する配列
   var ball_points = [];                                    //救助した被災者の得点を格納する配列
   var live_point;                                          //生きている被災者の点数
   var dead_point_low;                                      //死んだ被災者の低い点数
   var dead_point_high                                      //死んだ被災者の高い点数
   //救助した被災者を救助した順で配列に追加する
   while(tr){
      td = tr.childNodes[0];
      while(td){
         balls.push(td.childNodes[0].value);
         td = td.nextElementSibling;
      }
      tr = tr.nextElementSibling;
   }
   //レベルによって被災者の点数を設定
   if(document.getElementById('radio_level').childNodes[0].value == "level1"){
      live_point = LIVING_VICTIM_LEVEL1_POINT;
      dead_point_high = DEAD_VICTIM_LEBEL1_HIGH_POINT;
      dead_point_low = DEAD_VICTIM_LEVEL1_LOW_POINT;
   }
   else if(document.getElementById('radio_level').childNodes[0].value == "level2"){
      live_point = LIVING_VICTIM_LEVEL2_POINT;
      dead_point_high = DEAD_VICTIM_LEBEL2_HIGH_POINT;
      dead_point_low = DEAD_VICTIM_LEVEL2_LOW_POINT;
   }
   else{
      console.log('not checked');
   }
   //配列ballsからそれぞれの得点を配列ball_pointsに追加
   for(var i = 0; i < balls.length; i++){
      if(balls[i] == 'silver'){        //生きている被災者のとき
         ball_points.push(live_point);
      }
      else if(balls[i] == 'black'){    //死んだ被災者
         if(number_silverBall == number_collectedSilverBall && balls.indexOf('silver',i) == -1){    //すべての生きている被災者を救助した後に救助した死んだ被災者のとき（死んだ被災者の人数と救助した被災者の人数が等しく かつ 対象の死んだ被災者より後に生きている被災者を救助していないとき）
            ball_points.push(dead_point_high);
         }
         else{
            ball_points.push(dead_point_low);
         }
      }
      else{
         console.log(balls[i]);
      }
   }
   //最後のチェックポイント以降の競技進行の停止の回数に応じて救助した被災者の得点を減点する。
   ball_points.forEach(function(value,index,array){
      var sub;
      sub = value - count_stop_last * 5;
      if(sub > 0){
         array[index] = sub;
      }
      else{
         array[index] = 0;
      }
      part_rescue += array[index];     //合計を求める
   });
   //避難ゾーンからの脱出の得点
   if(document.getElementById('escape').checked == true)
   {
      part_rescue += ESCAPE_POINT;
   }
   return part_rescue;
}

//救助した被災者を１マスをずらす
function ShiftCollectedBall(obj){
   var td = obj.parentNode;
   var tr = td.parentNode;
   var next_tr = tr.nextElementSibling;
   while(next_tr){                              //次の行があるとき
      tr.appendChild(next_tr.childNodes[0]);    //削除したマスがある行の最後に次の行の最初の被災者を追加
      tr = next_tr;
      next_tr = next_tr.nextElementSibling;
   }
   if(tr.childElementCount == 0){               //何もなくなった行を削除
         tr.remove();
   }
}

//救助した被災者の順番の入力(追加)と表示
function CollectingBall(color){
   var table = document.getElementById('BallContainer');    //表のエレメントオブジェクト取得
   var td = table.childNodes[0].childNodes[0].childNodes[0].cloneNode(true);     //最初のマスを複製
   if(color == 'silver'){
      if(number_collectedSilverBall == number_silverBall){
         alert('すでに生きている被災者は全員救助されています');
         return;
      }
      else{
         //複製したオブジェクトの内容変更
         td.childNodes[0].childNodes[0].src = './ball_silver.png';
         td.childNodes[0].childNodes[0].alt = '銀ボール';
         td.childNodes[0].value = 'silver';
         number_collectedSilverBall++;
         number_collectedBall++;
      }
   }
   else if(color == 'black'){
      if(number_collectedBlackBall == number_blackBall){
         alert('すでに死んだ被災者は全員救助されています')
         return;
      }
      else{
         //複製したオブジェクトの内容変更
         td.childNodes[0].childNodes[0].src = './ball_black.png';
         td.childNodes[0].childNodes[0].alt = '黒ボール';
         td.childNodes[0].value = 'black';
         number_collectedBlackBall++;
         number_collectedBall++;
      }
   }

   if(table.childNodes[0].lastElementChild.childElementCount >= 6){                           //表の最後の行の要素が6以上の時
      var tr = document.createElement("tr");                   //エレメントtrを生成して代入
      table.childNodes[0].appendChild(tr);                     //表の最後に行を挿入
   }
   table.childNodes[0].lastElementChild.appendChild(td);    //表の最後の行の最後にオブジェクトtdを追加
   if(table.childNodes[0].childNodes[0].childNodes[0].childNodes[0].value == 'none'){     //表の最初のマスが空白のとき
      table.childNodes[0].childNodes[0].childNodes[0].remove();                              //この空白を削除
   }
}

//被災者の人数と最後のチェックポイント以降の競技進行の停止の数の変更
function ChangeBallNumber(obj,mode,target){
   var td = obj.parentNode.childNodes[0];
   if(mode == 'add'){         //増加
      if(target == 'black'){      //死んだ被災者
         if(number_blackBall < 99){   //number_blackBallが99未満の時、1加算する。
            number_blackBall++;
            td.textContent = ('00' + number_blackBall.toString(10)).slice(-2);   //変更された死んだ被災者の人数を表示
         }
         else{
            alert("これ以上、死んだ被災者の人数は増やせません");
         }
      }
      else if(target == 'silver'){            //生きている被災者
         if(number_silverBall < 99){   //number_silverBallが99未満の時、1加算する。
            number_silverBall++;
            td.textContent = ('00' + number_silverBall.toString(10)).slice(-2);   //変更された生きている被災者の人数を表示
         }
         else{
            alert("これ以上、生きている被災者の人数は増やせません");
         }
      }
      else if(target == 'stop'){
         if(count_stop_last < 99){   //count_stop_lastが99未満の時、1加算する。
            count_stop_last++;
            td.textContent = ('00' + count_stop_last.toString(10)).slice(-2);   //変更された競技進行の停止の回数を表示
         }
         else{
            alert("これ以上、競技進行の停止の回数を増やせません");
         }
      }
      else{
         console.log("undefinedColor_add");
      }
   }
   else if(mode == 'subtract'){     //減少
      if(target == 'black'){         //死んだ被災者
         if(number_blackBall <= 0){
            alert("これ以上、死んだ被災者の人数は減らせません。");
         }
         else if(number_blackBall == number_collectedBlackBall){     //死んだ被災者の設定人数より、救助した死んだ被災者の人数が多くならないようにする
            alert('これ以上,死んだ被災者の人数を減らすと救助した死んだ被災者の人数の方が多くなります。\n先に救助した死んだ被災者の人数を減らして下さい。');
         }
         else{      //number_blackBallが0より大きいとき1引く
            number_blackBall--;
            td.textContent = ('00' + number_blackBall.toString(10)).slice(-2);      //変更された死んだ被災者の人数を表示
         }
      }
      else if(target == 'silver'){   //生きている被災者
         if(number_silverBall <= 0){
            alert("これ以上、生きている被災者の人数は減らせません");
         }
         else if(number_silverBall == number_collectedSilverBall){
            alert('これ以上、生きている被災者の人数を減らすと救助した生きている被災者の人数の方が多くなります。\n先に救助した生きている被災者の人数を減らしてください。');
         }
         else{    //number_silverBallが0より大きいとき1引く
            number_silverBall--;
            td.textContent = ('00' + number_silverBall.toString(10)).slice(-2);     //変更された生きている被災者の人数を表示
         }
      }
      else if(target == 'stop'){
         if(count_stop_last > 0){   //count_stop_lastが0より大きい時、1引く
            count_stop_last--;
            td.textContent = ('00' + count_stop_last.toString(10)).slice(-2);   //変更された生きている被災者の人数を表示
         }
         else{
            alert("これ以上、競技進行の停止の回数は減らせません");
         }
      }
      else{
         console.log("undefinedColor_subtract");
      }
   }
   else{
      console.log("undefined mode");
   }
}

//救助した被災者の修正(削除)
function remBall(obj){
   //救助された被災者の人数を減らす
   if(obj.value == 'silver'){
      number_collectedSilverBall--;
      number_collectedBall--;
   }
   else if(obj.value == 'black'){
      number_collectedBlackBall--;
      number_collectedBall--;
   }
   else if(obj.value == 'none'){
      console.log('空白は消せません');
      return 0;
   }
   else{
      console.log('undefined obj.value')
   }
   //選ばれた救助した被災者の削除
   if(number_collectedBall > 0){                               //救助人数が０より多きとき
      ShiftCollectedBall(obj);                                 //救助した被災者を1マスずらす
      if(obj.parentNode.parentNode.childElementCount == 1){    //選ばれたマスがある行の要素が1つのとき
         obj.parentNode.parentNode.remove();                   //選ばれたマスがある行を削除する
      }
      else{
         obj.parentNode.remove();                              //選ばれたマスを削除
      }
   }
   else{
      obj.value = 'none';
      obj.childNodes[0].src = './invisible.png';
      obj.childNodes[0].alt = '空白';
   }
}

//チェックポイントの合計得点計算と表示
function calculateCheckpoint(){
   var part_checkpoint = 0;                                 //チェックポイントの合計得点
   var tbody = document.getElementById('p2146-tbody');      //表のエレメントオブジェクトを取得
   var tr;
   var point;                                               //1つのチェックポイントの得点
   for(var i = 0; i <= number_line - 1; i++){               //表の行数だけ繰り返す
      tr = tbody.childNodes[i];                             //行のエレメントオブジェクトを取得
      if(tr.childNodes[2].childNodes[0].value <= 2){        //行の3列目（競技進行の停止の回数）が２以下のとき
         //1行のチェックポイントの得点を計算して加算する
         point = tr.childNodes[1].childNodes[0].value * (MAX_TILE_POINT - tr.childNodes[2].childNodes[0].value * DEDUCTION_TILE_POINT);
         part_checkpoint += point; 
         //行のチェックポイントの点数を表示
         tr.childNodes[3].textContent = point;
      }
      else{                                                 //行の3列目（競技進行の停止の回数）が２より大きいとき
         //行のチェックポイントの点数を表示
         tr.childNodes[3].textContent = 0;                  //0点を表示する        
      }
   }
   return part_checkpoint;
}

function calculateTotal(){
   var total;                                   //合計得点
   var part_start = MAX_TILE_POINT;             //スタートタイルの得点
   var part_gap;                                //ギャップの合計得点
   var part_bump;                               //減速バンプの合計得点
   var part_crossing;                           //交差点の合計得点
   var part_deadEnd;                            //行き止まりの合計得点
   var part_obstacle;                           //障害物の合計得点
   var part_slope;                              //傾斜路の合計得点
   var part_checkpoint;                         //チェックポイントの合計得点
   var part_rescue;                             //被災者救助の合計得点
   part_gap = document.getElementById('gap').value * GAP_POINT;                  //ギャップの合計得点計算
   part_bump = document.getElementById('bump').value * BUMP_POINT;               //バンプの合計得点計算
   part_crossing = document.getElementById('crossing').value * CROSSING_POINT;   //交差点の合計得点計算
   part_deadEnd = document.getElementById('deadEnd').value * DEADEND_POINT;      //行き止まりの合計得点計算
   part_obstacle = document.getElementById('obstacle').value * OBSTACLE_POINT;   //障害物の合計得点計算
   part_slope = document.getElementById('slope').value * SLOPE_POINT;            //傾斜路の合計得点計算
   part_checkpoint = calculateCheckpoint();                                      //チェックポイントの合計得点計算
   part_rescue = calculateRescue();                                              //被災者救助の合計得点
   //計算した得点の表示
   total = part_start + part_gap + part_bump + part_crossing + part_deadEnd + part_obstacle + part_slope + part_checkpoint + part_rescue;
   document.getElementById('score_gap').value = part_gap;               //ギャップの合計得点表示
   document.getElementById('score_bump').value = part_bump;             //減速バンプの合計得点表示
   document.getElementById('score_crossing').value = part_crossing;     //交差点の合計得点表示
   document.getElementById('score_deadEnd').value = part_deadEnd;       //行き止まりの合計得点表示
   document.getElementById('score_obstacle').value = part_obstacle;     //障害物の合計得点表示
   document.getElementById('score_slope').value = part_slope;           //傾斜路の合計得点表示
   document.getElementById('score_rescue').value = part_rescue;         //被災者救助の合計得点表示
   document.getElementById('score_start').value = part_start;           //スタート得点の表示
   document.getElementById('score_all').value = total;                  //合計得点表示
}

//チェックポイント番号をふり直す
function setListNumber(lineNumber){
   var tbody = document.getElementById('p2146-tbody');                           //表のエレメントオブジェクトを取得
   for(var i = lineNumber; i < number_line; i++){                                //行番号(lineNumber)が表の行数より小さいとき　＊lineNumberは0スタート
      tbody.childNodes[i].childNodes[0].textContent = (i + 1).toString(10);      //チェックポイント番号をふり直す
   }
}

function addList(obj) {
   //tbody要素に指定したIDを取得し、変数「tbody」に代入
   var tbody = document.getElementById('p2146-tbody');
   //objの親の親のノードを取得し（つまりtr要素）、変数「tr」に代入
   var tr = obj.parentNode.parentNode;
   //tbodyタグ直下のノード（行）を複製し、変数「list」に代入
   var list = tbody.childNodes[0].cloneNode(true);
   parseInt(tr.childNodes[0].textContent,10);
   //複製した行の2番目のセルの<input>のvalueを０に置き換え
   list.childNodes[1].childNodes[0].value = 0;
   //複製した行の3番目のセルの<input>のvalueを０に置き換え
   list.childNodes[2].childNodes[0].value = 0;
   //複製した行の4番目のセルのテキストを０に置き換え
   list.childNodes[3].textContent = '0';
   //複製したノード「list」を直後の兄弟ノードの上に挿入
   //（「tr」の下に挿入）
   tbody.insertBefore(list, tr.nextSibling);
   number_line++;       //表の行の「数」の加算
   setListNumber(parseInt(tr.childNodes[0].textContent,10));      //追加した行以降のチェックポイント番号の置き換え
}

function removeList(obj) {
   // tbody要素に指定したIDを取得し、変数「tbody」に代入
   var tbody = document.getElementById('p2146-tbody');
   // objの親の親のノードを取得し（つまりtr要素）、変数「tr」に代入
   var tr = obj.parentNode.parentNode;
   //表行数が１より多いとき１行削除する
   if(number_line > 1){
      // 「tbody」の子ノード「tr」を削除
      tbody.removeChild(tr);
      number_line--;    //表の行の「数」の引算
   setListNumber(parseInt(tr.childNodes[0].textContent,10) - 1);  //削除した行以降のチェックポイント番号の置き換え
   }
}