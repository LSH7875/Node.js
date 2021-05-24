console.log('비구조 할당문');

let arr = [1,2,3,4,5,6,7,8,9];
/*
let a =arr[0];
let b = arr[1];
*/

let [a,b,c, ...last]=arr;

console.log(a);//1
console.log(b);
console.log(c);
console.log(last);
//배열 뿐만 아니라 객체에도 가능

let obj = {a:10, b:20, c:30, d:40};


let = {a:a2, ...last2} = obj;//옮겨가기보다는 복사를 했다고 보면 된다. let {a:a2, ...last2} = obj;
//내가 마음대로 이름을 바꿔서 저장할 수 있다는것이 장점


let {a:name, b:age, c:key, d:weight} = obj;

console.log(name);//10
console.log(age);//20
console.log(key);//30
console.group(weight);//40

console.log(a2);
console.log(last2);

/************객체도 비구조할당문 가능하다***********/


let arr2 = [1,2,3];



let copy = arr2;
let copy2 = [...arr2];//복사가 된거임. 새로운 거임.

arr2[0]='ingoo';
console.log(copy); // 얕은 복사(참조개념)//얕은 부분만 복사해서 바뀌면 바뀜 // [ 'ingoo', 2, 3 ]
console.log(copy2); // 깊은 복사(참조 완전히 끊어짐)//깊은 부분까지 복사했다고 보면 됨.// [ 1, 2, 3 ]

