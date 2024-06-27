const express = require("express")
const { Client } = require("pg")
const cors = require("cors")
const bodyparser = require("body-parser")
const config = require("./config")

const app = express()

app.use(express.json())//na saida 
app.use(cors())
app.use(bodyparser.json())//na entrada 

var conString = config.urlConnection

var client = new Client(conString)

client.connect((err) => {
  if (err) {
    return console.error('Não foi possível conectar ao banco.', err)
  }
  client.query('SELECT NOW()', (err, result) => {
    if (err) {
      return console.error('Erro ao executar a query.', err)
    }
    console.log(result.rows[0])
  })
})

app.get("/", (req, res) => {
  console.log("Response ok.")//vai para powershell
  res.send("Ok – Servidor disponível.")//vai p browser
})

app.get("/usuarios", (req, res) => {
  try {
    client.query("SELECT * FROM Usuarios", function (err, result) {
      if (err) {
        return console.error("Erro ao executar a qry de SELECT", err)
      }
      res.send(result.rows)
      console.log("Rota: get usuarios")
    })
  } catch (error) {
    console.log(error)
  }
})

app.get("/usuarios/:id", (req, res) => {
  try {
    console.log("Rota: usuarios/" + req.params.id)
    client.query(
      "SELECT * FROM Usuarios WHERE id = $1", [req.params.id],
      (err, result) => {
        if (err) {
          return console.error("Erro ao executar a qry de SELECT id", err)
        }
        res.send(result.rows)
        //console.log(result)
      }
    )
  } catch (error) {
    console.log(error)
  }
})

app.delete("/usuarios/:id", (req, res) => {
  try {
    console.log("Rota: delete/" + req.params.id)
    client.query(
      "DELETE FROM Usuarios WHERE id = $1", [req.params.id], (err, result) => {
        if (err) {
          return console.error("Erro ao executar a qry de DELETE", err)
        } else {
          if (result.rowCount == 0) {
            res.status(404).json({ info: "Registro não encontrado." })
          } else {
            res.status(200).json({ info: `Registro excluído. Código: ${req.params.id}` })
          }
        }
        console.log(result)
      }
    )
  } catch (error) {
    console.log(error)
  }
})

app.post("/usuarios", (req, res) => {
  try {
    console.log("Alguém enviou um post com os dados:", req.body)
    const { nome, email, altura, peso } = req.body
    client.query(
      "INSERT INTO Usuarios (nome, email, altura, peso) VALUES ($1, $2, $3, $4) RETURNING * ", [nome, email, altura, peso],
      (err, result) => {
        if (err) {
          return console.error("Erro ao executar a qry de INSERT", err)
        }
        const { id } = result.rows[0]
        res.setHeader("id", `${id}`)
        res.status(201).json(result.rows[0])
        console.log(result)
      }
    )
  } catch (erro) {
    console.error(erro)
  }
})

app.put("/usuarios/:id", (req, res) => {
  try {
    console.log("Alguém enviou um update com os dados:", req.body)
    const id = req.params.id
    const { nome, email, altura, peso } = req.body
    client.query(
      "UPDATE Usuarios SET nome=$1, email=$2, altura=$3, peso=$4 WHERE id =$5 ",
      [nome, email, altura, peso, id],
      (err, result) => {
        if (err) {
          return console.error("Erro ao executar a qry de UPDATE", err)
        } else {
          res.setHeader("id", id)
          res.status(202).json({ "identificador": id })
          console.log(result)
        }
      }
    )
  } catch (erro) {
    console.error(erro)
  }
})

app.post('/questionario', (req, res) => {
  try {
    console.log("Alguém enviou um post com os dados:", req.body)
    const { q1, q2, q3, q4, q5 } = req.body
    client.query(
      "INSERT INTO questionario (q1, q2, q3, q4, q5) VALUES ($1, $2, $3, $4, $5) RETURNING * ", [q1, q2, q3, q4, q5],
      (err, result) => {
        if (err) {
          return console.error("Erro ao executar a qry de INSERT no questionario", err)
        }
        res.status(201).json(result.rows[0])
        console.log(result)
      }
    )
  } catch (erro) {
    console.error(erro)
  }
})

app.get("/questionario", (req, res) => {
  try {
    client.query("SELECT * FROM questionario", function (err, result) {
      if (err) {
        return console.error("Erro ao executar a qry de SELECT", err)
      }
      res.send(result.rows)
      console.log("Rota: get questionario")
    })
  } catch (error) {
    console.log(error)
  }
})

app.get('/users', (req, res) => {
  try{
    client.query("SELECT * FROM users", (err, result) => {
      if (err) {
        return console.log("Erro ao executar a qry de SELECT", err)
      }
      res.send(result.rows)
      console.log("Rota: get usuarios")
    })
  }catch(error){
    console.log(error)
  }
})

app.get("/users/:email", (req, res) => {
  try {
    console.log("Rota: users/" + req.params.email)
    client.query(
      "SELECT * FROM users WHERE email = $1", [req.params.email],
      (err, result) => {
        if (err) {
          return console.error("Erro ao executar a query de SELECT email", err)
        }
        res.send(result.rows)
      }
    )
  } catch (error) {
    console.log(error)
    res.status(500).send("Erro interno ao processar a solicitação")
  }
})


app.delete("/users/:email", (req, res) => {
  try {
    console.log("Rota: users/" + req.params.email)
    client.query(
      "DELETE FROM users WHERE email = $1", [req.params.email], (err, result) => {
        if (err) {
          return console.error("Erro ao executar a qry de DELETE", err)
        } else {
          if (result.rowCount == 0) {
            res.status(404).json({ info: "Registro não encontrado." })
          } else {
            res.status(200).json({ info: `Registro excluído. Email: ${req.params.email}` })
          }
        }
        console.log(result)
      }
    )
  } catch (error) {
    console.log(error)
  }
})


app.post("/users", (req, res) => {
  try {
    console.log("Alguém enviou um post com os dados:", req.body)
    const { email, firstname, lastname, isadmin = false } = req.body
    client.query(
      "INSERT INTO users (email, firstname, lastname, isadmin) VALUES ($1, $2, $3, $4) RETURNING *", [email, firstname, lastname, isadmin],
      (err, result) => {
        if (err) {
          return console.error("Erro ao executar a qry de INSERT", err)
        }
        const { id } = result.rows[0]
        res.setHeader("id", `${id}`)
        res.status(201).json(result.rows[0])
        console.log(result)
      }
    )
  } catch (erro) {
    console.error(erro)
  }
})

app.put("/users/:email", (req, res) => {
  try {
    console.log("Alguém enviou um update com os dados:", req.body)
    const email = req.params.email
    const { firstname, lastname, isadmin = false } = req.body
    client.query(
      "UPDATE users SET firstname=$1, lastname=$2, isadmin=$3 WHERE email=$4",
      [firstname, lastname, isadmin, email],
      (err, result) => {
        if (err) {
          return console.error("Erro ao executar a query de UPDATE", err)
        } else {
          res.status(202).json({ "email": email })
          console.log(result)
        }
      }
    )
  } catch (erro) {
    console.error(erro)
    res.status(500).send("Erro interno ao processar a solicitação")
  }
})


app.listen(config.port, () =>
  console.log("Servidor funcionando na porta " + config.port)
)

module.exports = app 
