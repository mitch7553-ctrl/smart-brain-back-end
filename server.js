const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');



app.use(bodyParser.json());
app.use(cors())




const database  = { 
users: [ 
	{
	id:'123',
	name: 'John',
	email: 'john@gmail.com',
	password:'cookies',
	entries: 0,
	joined: new Date()
}, 
	{
	id:'124',
	name: 'sally',
	email: 'sally@gmail.com',
	password:'banana',
	entries:0,
	joined: new Date()
  }
 ],
 login: [{
 	id:'987',
 	hash: '$2a$10$0k/NrWlq1IDGVtXl5qDc7eIt8k62SWQoZBwEPgpJzI0LAJKNzlB1W',
 	enail:'john@gmail.com'
 }]
}

app.get('/', (req, res ) => {
	res.send(database.users);
})



app.post('/signin', (req, res) => {
	const {email, password} = req.body;
// 	 bcrypt.compare("cookies", '$2a$10$0k/NrWlq1IDGVtXl5qDc7eIt8k62SWQoZBwEPgpJzI0LAJKNzlB1W', function(err, res) {
  //      console.log('first guess', res);
  // });

  //  bcrypt.compare("veggies", '$2a$10$0k/NrWlq1IDGVtXl5qDc7eIt8k62SWQoZBwEPgpJzI0LAJKNzlB1W', function(err, res) {
  //      console.log('second guess', res);
  //    });

	if ( email === database.users[0].email && 
		 password === database.users[0].password ) {
		res.json(database.users[0]);
	} else  {
		res.status(400).json('error logging in')
	}
})

app.post('/register', (req, res) => {
	const { email, name, password} = req.body;

	database.users.push({
	id:'',
	name: name,
	email: email,
	password: password,
	entries: 0,
	joined: new Date()
	})
	res.json(database.users[database.users.length-1])
})

app.get('/profile/:id', (req, res) =>  {
	const {id}  = req.params;
	let found = false;
	database.users.forEach(user => {
		if (user.id === id ) {
			found = true;
			 return res.json(user);
		} 
		if (!found) { 
			res.status(400).json('not found');
		}
	})
})

app.put('/image', (req, res) => { 
	const {id}  = req.body;
	let found = false;
	database.users.forEach(user => {
		if (user.id === id ) {
			found = true;
			user.entries++
			 return res.json(user.entries);
		} 
		if (!found) { 
			res.status(400).json('not found');
		}
	})
})


app.listen(3000, () => {
	console.log('app  is running on 3000 port');
})
