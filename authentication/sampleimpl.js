import express, { response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

import envVal from "./src/config/envload.js";

const result = envVal;

const app = express();
const port = 9000;

app.use(express.json())
app.use(express.urlencoded({ extended: true }));


const orders = [
    {
        id: 1,
        uid: 'test',
        items: [{
                name: 'Road Runner',
                single_price: '102.50',
                currency: 'USD',
                count: '2'
        }],
        order_total:'214.40'
    },
    {
        id: 2,
        uid: 'test1',
        items: [{
                name: 'Road Runner1',
                single_price: '102.50',
                currency: 'INR',
                count: '2'
        }],
        order_total:'215.40'
    },
    {
        id: 3,
        uid: 'test3',
        items: [{
                name: 'Road Runner',
                single_price: '102.50',
                currency: 'GBP',
                count: '2'
        }],
        order_total:'216.40'
    }
]

let refreshtokens =[];
const users = [
]
console.log('server started - ok');

app.get('/orders', verifyToken, (req,res)=>
{
    console.log("orders");
    res.json(orders);
})

app.get('/users', (req,res)=>
    {
        res.json(users);
    })


    app.post('/users',async (req, res)=>{
       try{
        const salt = await bcrypt.genSalt();
        const saltround = 10;
       // const hashedpwd = await bcrypt.hash(req.body.pwd, salt);
       const hashedpwd = await bcrypt.hash(req.body.pwd, saltround);

        const user = {uid: req.body.uid, pwd: hashedpwd}
        users.push(user);

        res.status(201).send();

       }catch (error)
       {
            res.status(500).send();
       }
    })

function verifyToken(req,res,next){
    const authzHeader = req.headers['authorization'];
    const accesstoken = authzHeader && authzHeader.split(' ')[1];
    if(accesstoken == null)
    {
        return res.status(401);
    }
    else
    {
        jwt.verify(accesstoken,process.env.ACCESS_TOKEN_SECRET, (err, user)=>{
            if(err)
            {
                return res.status(403);
            }
            else
            {
                req.user = user
                next();
            }
        })
    }
}

    app.use(express.json());
    app.post('/login',async (req, res)=>{
        
            const user = users.find(user => user.uid == req.body.uid);
            if(user == null)
            {
                return res.status(400).send('User Not Found');
            }
            try{    if(await bcrypt.compare(req.body.pwd, user.pwd))
            {
                const uid = req.body.uid;
                const jwtuser = {user: uid};
                const accesstoken= mintAccessToken(user)
                const refreshtoken= jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);
                refreshtokens.push(refreshtoken);
                res.json({accesstoken: accesstoken, refreshtoken: refreshtoken});
            }
            else{
                res.send("Access denied");
            }
 
         res.status(201).send();
 
        }catch (error)
        {
            console.log(error);
             res.status(500).send();
        }
     })

     app.delete('/logout', (req,res)=>{
        const refreshtoken= req.body.refresh_token;
        console.log("token: ", refreshtoken);
        refreshtokens = refreshtokens.filter(token=> token !== req.body.refresh_token)
        res.sendStatus(204);
     });

 app.post('/token', (req,res)=>{
        const refreshtoken= req.body.refresh_token;
        console.log("token: ", refreshtoken);
        if(refreshtoken == null)
        {
            return res.sendStatus(401);
        }
        if(!refreshtokens.includes(refreshtoken))
        {
            res.sendStatus(403);
        }
        jwt.verify(refreshtoken, process.env.REFRESH_TOKEN_SECRET,(err,user)=>{
            if(err){
                return res.sendStatus(403);
            }
            const accesstoken = mintAccessToken({uid: user.uid})
            res.json({accesstoken: accesstoken});
        })
     })

     function mintAccessToken(user)
     {
        return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET,{expiresIn: '30s'})
     }
     
app.listen(port, ()=>{
    console.log(`app is listening on port http://localhost:${port}`);
    });