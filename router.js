var routes = require('i40')(),
    fs = require('fs'),
    db = require('monk')('localhost/projects'),
    qs = require('qs'),
    mime = require('mime'),
    view = require('./view'),
    books = db.get('books')

    routes.addRoute('/', function (req, res, url) {
      res.setHeader('Content-Type', 'text/html');
      fs.readFile('templates/home.html', function (err, file) {
          if (err) {
            res.setHeader('Content-Type', 'text/html');
            res.write('404')
          }
          res.end(file);
      })
    })

    routes.addRoute('/books', function(req, res, url){
      if (req.method === 'GET') {
        res.setHeader('Content-Type', 'text/html')
        books.find({}, function (err, docs) {
          if (err) throw err
          var template = view.render('index', {books:docs})
          res.end(template)
        })
      }
      if(req.method === 'POST'){
        var data = ''
        req.on('data', function(chunk){
          data += chunk
        })
        req.on('end',function(){
            var book = qs.parse(data)
            books.insert(book, function(err, doc){
              if(err) throw err
              res.writeHead(302,{'Location': '/books'})
              res.end()
            })
        })
      }
    })

    routes.addRoute('/books/new', function(req, res, url){
      res.setHeader('Content-Type', 'text/html')
      if(req.method === 'GET'){
        books.find({}, function (err, docs) {
          if (err) throw err
          var template = view.render('new', {books:docs})
          res.end(template)
        })
      }
    })

    routes.addRoute('/books/filter', function(req, res, url ) {
      res.setHeader('Content-Type', 'text/html')
      if(req.method === 'GET') {
        books.find({}, function(err, docs){
          if(err) res.end('404')
          var template = view.render('filter', {books: docs})
          res.end(template)
        })
      }
      if(req.method === "POST") {
        var acum = ''
        req.on('data', function( chunk) {
          acum += chunk
        })
        req.on('end', function() {
          var data = qs.parse(acum)
          books.find(data, function (err, data) {
            if (err) res.end('Sorry, nothing on this entry!!!')
            res.writeHead(302, {'Location' : '/books'})
            res.end(data)
          })
        })
      }
    })

    routes.addRoute('/books/:id', function(req, res, url){
      if(req.method === 'GET'){
        res.setHeader('Content-Type', 'text/html')
        books.findOne({_id: url.params.id}, function(err, docs){
          if (err) throw err
          var template = view.render('show', {books:docs})
          res.end(template)
        })
      }
    })
    routes.addRoute('/books/:id/delete', function(req, res, url){
      if(req.method === 'POST'){
        res.setHeader('Content-Type', 'text/html')
        books.remove({_id: url.params.id}, function(err, docs){
          if (err) throw err
          res.writeHead(302,{'Location': '/books'})
          res.end()
        })
      }
    })
    routes.addRoute('/books/:id/edit', function(req, res, url){
      if(req.method === 'GET'){
          books.findOne({_id: url.params.id}, function(err, docs){
            if(err) throw err
            var template = view.render('edit', docs)
            res.end(template)
        })
      }
    })
    routes.addRoute('/books/:id/update', function(req, res, url){
      if(req.method === 'POST'){
        var data = ''
        req.on('data', function(chunk){
          data += chunk
        })
        req.on('end',function(){
            var book = qs.parse(data)
            books.update({_id: url.params.id}, book, function(err, book){
              if (err) throw err
              res.writeHead(302,{'Location': '/books'})
              res.end()
            })
          })
        }
      })
    routes.addRoute('/public/*', function(req, res, url){
      res.setHeader('Content-Type', mime.lookup(req.url))
      fs.readFile('.' + req.url, function(err, file){
        if(err){
          res.setHeader('Content-Type', 'text/html')
          res.end('404')
        }
        res.end(file)
      })
    })

    module.exports = routes
