console.log('switch문 이해하기');

//성별

let gender = "남자";

//남자일 경우 숫자 1 출력;
//여자일 경우 숫자 2 출력;
/*
if(gender == "남자") console.log(1);
else if(gender == "여자") console.log(2);
*/

switch(gender){
    case "남자":
        console.log(1);
        break;
    case "여자":
        console.log(2);
        break;
}

let 과일 = "foo";

switch (과일){
    case "banana":
        console.log("yellow");
        break;        
    case "apple":
        console.log("red");
        break;
    
    case "kiwiee":
    case "watermelon":
        console.log("green");
        break;
    case "grape":
        console.log("purple");
    default:
        console.log("not a fruit not be inputted");
}