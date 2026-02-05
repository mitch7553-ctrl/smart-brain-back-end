const express = require('express');
const bodyParser = require('body-parser');


const app = express();


app.use(bodyParser.json());
const database = {
	users: [
		{
			id: 123,
			name: 'john',
			email: 'john@email.com',
			password:'cookies',
			entries: 0, 
			joined: new Date()
		}, 
		{
			id: 124,
			name: 'sally',
			email: 'sally@email.com',
			password:'bananas',
			entries: 1 , 
			joined: new Date()
		}
	]
} 

app.listen( 3000, () => {
	console.log('app is running on port 300');
})

app.get('/', (req, res) => {
	res.send('this is working');
})

app.post('/signin', (req,res) => {
 if (req.body.email === database.users[0].email && req.body.users[0].password) {
 	res.json('success');
 } else {
 	res.status(400).json('error logging in');
 }
 res.json('signin'); 
})






/*

/ --> res = this is working 
/signin --> POST = success/faiol 
/register --> = user 
/ profile/:userID --> Get 
/image --> PUT --> user 




*/