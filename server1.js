/******************설정******************************/
const express = require('express');
const app = express();
const nunjucjks = require('nunjucks');
const axios = require('axios');
const qs = require('qs');
const session = require('express-session');
const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false,}));

//console.log('test');

app.use(session({
    secret:'adasda',
    resave:false,
    secure:false,
    saveUninitialized:false,
}))

const REST_API = "c60cf11573ac60fd10341b9770620769";
const secret_key = "p9HOwz9WPxIy0QGtNw13ovGZ5VsRo4VZ";
const redirect_uri = "http://localhost:3000/auth/kakao/callback"; // 여기서 지정한 포트 번호가 아니면 모두 에러

app.set('view engine', 'html');
nunjucjks.configure('views', {
    express:app,
})

const kakao = {
    clientID : REST_API,
    clientSecret : secret_key,
    redirectUri : redirect_uri,
}


/*******************메인 페이지*************/

app.get('/', (req, res) => {
    const {msg} = req.query;
    //console.log(req.session.authData);
    res.render('index.html',{
        msg,
        logininfo:req.session.authData,
    });

})

/***********카카오 로그인 페이지***************/
app.get('/auth/kako', (req, res)=>{
    const kakaoAuthURL =  `https://kauth.kakao.com/oauth/authorize?client_id=${kakao.clientID}&redirect_uri=${kakao.redirectUri}&response_type=code&scope=profile,account_email`;
    res.redirect(kakaoAuthURL);
})

app.get('/auth/kakao/callback', async (req, res)=>{
    //axios => Promise Object
    const {session,query} =req;//객체 구조분해>기본변수 할당
    const {code} = query;//req.query.code =>code
    
    try{
        token = await axios({
            method: 'POST',
                url: 'https://kauth.kakao.com/oauth/token',
                headers:{
                    'content-type':'application/x-www-form-urlencoded'
                }, 
                data:qs.stringify({// 객체를 String으로 변환.
                    grant_type:'authorization_code', // 특정 스트링 
                    client_id:kakao.clientID,
                    client_secret:kakao.clientSecret,
                    redirectUri:kakao.redirectUri,
                    code,
                }) 
        })
    }catch(err){
        res.json(err.data);
    }
    let user;
    try{
        user = await axios({
            method:'GET',
            url: 'https://kapi.kakao.com/v2/user/me',
            headers:{
                Authorization: `Bearer ${token.data.access_token}`//get값에 token을 보내려면 위험하니 headers에 넣어서 보내는 것임.
            }
        })
    }catch(err){
        res.json(err.data);
    }
    //console.log(user);

    //req.session.kakao = user.data;//향후 다른 api 하면 문제가 된다.
    //그래서 다음과 같이 한다.

    const authData = {
        ...token.data, //원본 내용이 바뀌더라도 내가 가져왔던 그 내용만 쓰겠다.//깊은 복사
        ...user.data,//
    }
    
    //req.session.authData = {
    session.authData={    //해당 로그인한 내용으로다가  객체를 넣을거임
        //여기에 로컬, 각각 넣어줄 예정임.
        ["kakao"]:authData,//[]배열 {}객체
    }

    console.log(session);//session에는 cookie만 존재한다. 그런데 우리가 authData를 넣은거임

    res.redirect('/');
    
})

/**************로컬 로그인***************/

app.get('/login',(req,res)=>{
    res.render('login.html');
})

app.post('/login',(req,res)=>{
    //console.log(req.body);
    const {session,body} =req;
    const {userid,userpw}=req.body;
    if(userid == "root" && userpw == "root"){
        const data={userid,};
        session.authData={
            ["local"]: data,
        }

        res.redirect('/?msg=login success');
    }else{
        //로그인실패
        res.redirect('/?msg=please check id and password');
    }

})

// 로그인 요청, 회원 정보 요청 2번의 요청

const authMiddleware = (req,res,next)=>{
    const {session} = req;
    if(session.authData == undefined){
        //로그인이 되어있지 않음
        res.redirect('/?msg=not loggined');

    }else{
        //로그인됨
        next();
    }
}

/************회원정보 ***************/
app.get('/auth/info',authMiddleware,(req, res)=>{
    /*
    Session {
  cookie: { path: '/', _expires: null, originalMaxAge: null, httpOnly: true },
  authData: {
    kakao: {//1.이걸 갖고 오도록 한다.
      access_token: 'KYDl6Dq7jfRim0vUvJ6upG45lXUoSobNs6qM5go9c04AAAF5m8xRhA',
      token_type: 'bearer',
      refresh_token: 'vmxubfzwiXflHldceOVFllZm0y0vTxorJ9-5Ngo9c04AAAF5m8xRhA',
      expires_in: 21599,
      scope: 'account_email profile',
      refresh_token_expires_in: 5183999,
      id: 1739929309,
      connected_at: '2021-05-24T00:35:29Z',
      properties: [Object],
      kakao_account: [Object]
    }
  } */
    const {authData} = req.session;
    const provider = Object.keys(authData)[0];//'kakao'
    //console.log(provider);
    let userinfo={};
    switch(provider){
        case "kakao":
            userinfo = {
                userid : authData[provider].properties.nickname,
            }
            //[code block]
            break;
        case "local":
            userinfo ={
                userid:authData[provider].userid,
            } 
    }
    res.render('info',{
        userinfo,
    });
    
})


/******************login page fetch연습*************************/
app.post('/login2',(req,res)=>{
    console.log(req.headers);
    //res.send('ok');
    console.log(req.get('user-agent'));//ip 및 내 윈도우 운영체제. 브라우저 보내줌.
    //req.set('content-type':'application/x-www-form-urlencoded');
    // res.json({
    //     test:'ok',//응답이 application/json으로 바뀐다.
    // })
    res.set('token','ingoo');//header에 내용을 임의로 삽입해서 보낼 수 있다.>>여기선 Bearer로
    res.set('Authorization',`Bearer enopienbiensidfl`);
    res.status(200).json({text:'error'});
})




/*****************회원탈퇴**********************/
app.get('/auth/kakao/unlink',authMiddleware,async(req,res)=>{
    const {session} =req;//req.session을 session에 담는다.
    const{access_token}=session.authData.kakao;

    console.log(access_token);
    let unlink;
    try{
        unlink = await axios({
            method: "post",
            url:"https://kapi.kakao.com/v1/user/unlink",
            headers:{//오늘 오후에 수업 더 할거임
                Authorization:`Bearer ${access_token}`
            }
        })
    }catch(e) {res.json(e.data);}
    console.log(unlink);//이 값이 떨어진 이유는 이미 카카오측에서는 우리 아이디를 로그아웃& 회원탈퇴 완료 시킨거임.
    //카카오측은 처리가 완료된 상태이고 우리도 세션을 지워줘야함
   
    
    const {id} = unlink.data;//unlink.data.id의 값을 담아서 사용할거임
    //요청이 필요...우리만으로 카카오 데이터를 삭제할 수 없기에
    //카카오에 요청해야함.그리고 응답을 받아야 함.
    //axios 사용해야
    if(session.authData["kakao"].id == id){
        delete session.authData;
    }

    res.redirect('/?msg=success logout');

})


/***********************로그아웃*****************************/
app.get('/auth/logout',(req,res)=>{
    const {authData} = req.session;
    const provider = Object.keys(authData)[0];
    delete req.session.authData;
    res.redirect('/?msg=logoutsuccess');
    // req.session.destroy(()=>{
    //        res.redirect('/?msg=logoutsuccess');
      //  })    
    /*switch(provider){
        case "local":
            delete session.authData;
                res.redirect('/?msg=logoutsuccess');

            //req.session.destroy(()=>{
            //    res.redirect('/?msg=logoutsuccess');
            //})    
            break;
        case "kakao":
            res.redirect('/auth/kakao/unlink');
            break;
    }*/
})
app.listen(3000, ()=>{
    console.log('start with 3000');
})