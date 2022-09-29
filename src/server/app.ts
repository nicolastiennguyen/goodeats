import express from "express"
require('dotenv').config()
const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
import router from './routes'
import axios from 'axios'

const { Client } = require('pg');

const client = new Client({
  host: process.env.PGHOST,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
  database: process.env.PGDATABASE
});

connect();
async function connect () {
  try {
    await client.connect()
    console.log('connected')
  } catch(e) {
    console.error(e)
  }
}

// app.use(router)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Credentials", "true")
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  )
  res.header("Access-Control-Allow-Methods", "POST, PUT, DELETE, GET")
  next()
})

app.get("/yelp/:location/:limit", (req, res) => {
  axios
  .get(`https://api.yelp.com/v3/businesses/search`, {
    headers: {
      Authorization: `Bearer Gbp5j1Jg21WTUzhuq-P3U5PjDAeXOgChj7q7cshsZkSW_mqueLARN62xNq2Opf8h7jYz8LQ4sgXv8QDOr6h9n72nV8kKOnB-w8jMBHegau_gU4_goqDS8n7lzDYzY3Yx`,
    },
    params: {
      location: req.params.location,
      limit: req.params.limit
    }
  })
  .then(response => {
    res.send(response.data)
  })
  .catch(error => {
    console.log('error')
  })
})

app.get("/businesses", async (req, res) => {
  try {
    const results = await client.query("select * from businesses")
    res.json(results.rows)
  } catch(e) {
    console.log(e)
  }
})

app.post("/businesses", async (req, res) => {
  try {
    // await client.query("INSERT INTO businesses VALUES ($1, $2, $3, $4, $5, $6, $7)"
    await client.query(
      "INSERT INTO businesses VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (id) DO NOTHING"
    , [req.body.id, req.body.name, req.body.image_url, req.body.url, req.body.rating, req.body.price, req.body.location])
    console.log('inserted into database')
  } catch(e) {
    console.log(e)
  }
})

let PORT = process.env.PORT
app.listen(PORT, () => console.log(`listening on port ${PORT}`))