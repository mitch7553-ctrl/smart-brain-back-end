const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex')

const db= knex({
  client: 'pg',
  connection: {
    host: '127.0.0.1',
    user: 'postgres',
    password: 'test',
    database: 'smartbrain',
  },
});

app.use(bodyParser.json());
app.use(cors())

db.select('*').from('users').then(data =>{
	console.log(data);
})
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
  db.select('email', 'hash').from('login')
    .where('email', '=', req.body.email)
    .then(data => {
      const isValid = bcrypt.compareSync(req.body.password, data[0].hash);
      if (isValid) {
        return db.select('*').from('users')
          .where('email', '=', req.body.email)
          .then(user => {
            res.json(user[0])
          })
          .catch(err => res.status(400).json('unable to get user'))
      } else {
        res.status(400).json('wrong credentials')
      }
    })
    .catch(err => res.status(400).json('wrong credentials'))
})


app.post('/register', (req, res) => {
  const { email, name, password } = req.body;
  const hash = bcrypt.hashSync(password);
    db.transaction(trx => {
      trx.insert({
        hash: hash,
        email: email
      })
      .into('login')
      .returning('email')
      .then(loginEmail => {
        return trx('users')
          .returning('*')
          .insert({
            email: loginEmail[0].email,
            name: name,
            joined: new Date()
          })
          .then(user => {
            res.json(user[0]);
          })
      })
      .then(trx.commit)
      .catch(trx.rollback)
    })
    .catch(err => res.status(400).json('unable to register'))
})


app.get('/profile/:id', (req, res) =>  {
	const {id}  = req.params;
	db.select('*').from('users').where({id}).then(user => {
		consol.log(user)
		if (user.length) {
			res.json(user[0])
		} else {
			res.status(400).json('Not found')
		}
	})
	.catch(err => res.status(400).json('error getting user'))
})

app.put('/image', (req, res) => {
  console.log('/image endpoint hit')
  const { id } = req.body;
  db('users').where('id', '=', id)
  .increment('entries', 1)
  .returning('entries')
  .then(entries => {
    res.json(entries[0].entries);
  })
  .catch(err => res.status(400).json('unable to get entries'))
})

app.listen(3000, () => {
	console.log('app  is running on 3000 port');
})
